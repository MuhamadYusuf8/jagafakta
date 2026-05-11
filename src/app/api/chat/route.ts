import { NextRequest } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import type { FactCheckResult } from "@/types";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);

const CHAT_SYSTEM_INSTRUCTION = `Kamu adalah JagaFakta AI Assistant — asisten analisis media dan misinformasi yang bekerja khusus untuk membantu pengguna memahami hasil verifikasi fakta secara lebih mendalam.

PERAN:
- Jelaskan kenapa sebuah konten teridentifikasi sebagai hoaks atau fakta
- Berikan konteks sejarah, sosial, dan budaya yang relevan untuk Indonesia
- Bantu pengguna membangun kemampuan berpikir kritis
- Jangan menghakimi pengguna yang percaya pada hoaks

GAYA KOMUNIKASI:
- Bahasa Indonesia yang hangat, edukatif, dan tidak menggurui
- Gunakan analogi sederhana untuk menjelaskan konsep kompleks
- Boleh menggunakan emoji secukupnya untuk lebih engaging
- Jawaban 3-5 paragraf atau dengan bullet points yang jelas

BATASAN:
- Tidak memberikan nasihat medis, hukum, atau finansial yang spesifik
- Selalu rekomendasikan untuk cek sumber terpercaya
- Jika tidak yakin, katakan dengan jujur`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, context }: {
      messages: Array<{ role: "user" | "model"; content: string }>;
      context?: FactCheckResult;
    } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return Response.json({ error: "Pesan tidak boleh kosong." }, { status: 400 });
    }

    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || lastMessage.role !== "user") {
      return Response.json({ error: "Pesan terakhir harus dari pengguna." }, { status: 400 });
    }

    // Build context-aware system prompt
    let contextPreamble = "";
    if (context) {
      contextPreamble = `
KONTEKS VERIFIKASI YANG BARU SAJA DILAKUKAN:
- Judul: ${context.title}
- Verdict: ${context.verdict}
- Confidence: ${context.confidence_score}%
- Penjelasan: ${context.explanation}
- Keywords: ${context.keywords?.join(", ") || "-"}
- Konteks tambahan: ${context.context || "-"}

Gunakan informasi di atas sebagai basis utama untuk menjawab pertanyaan pengguna.
`;
    }

    // Define fallback models in order of preference
    const fallbackModels = [
      "gemini-2.0-flash",
      "gemini-2.5-flash",
      "gemini-2.5-flash-lite"
    ];

    let streamResult: any = null;
    let lastError: any = null;

    // Build chat history (exclude the last user message, it will be sent via sendMessageStream)
    // Gemini requires the first message in history to be from role 'user',
    // so we drop any leading 'model' messages (e.g. the client-side welcome message).
    const rawHistory = messages
      .slice(0, -1)
      .filter((m) => m.role === "user" || m.role === "model")
      .map((m) => ({
        role: m.role as "user" | "model",
        parts: [{ text: m.content }],
      }));

    // Drop messages until we find the first 'user' message
    const firstUserIdx = rawHistory.findIndex((m) => m.role === "user");
    const history = firstUserIdx >= 0 ? rawHistory.slice(firstUserIdx) : [];

    // Attempt generation with fallback models
    for (const modelName of fallbackModels) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          systemInstruction: CHAT_SYSTEM_INSTRUCTION + contextPreamble,
          generationConfig: {
            temperature: 0.7,
            topP: 0.9,
            maxOutputTokens: 1024,
          },
        });

        const chat = model.startChat({ history });

        // Stream the response. If it fails with 429, it throws here.
        streamResult = await chat.sendMessageStream(lastMessage.content);
        break; // Success! Break out of the fallback loop.
      } catch (error: any) {
        lastError = error;
        console.warn(`[Chat API] Model ${modelName} failed. Reason: ${error.message}`);
        // If it's a quota error (429), continue to the next model
        if (error?.status === 429 || error?.message?.includes("429") || error?.message?.includes("Quota")) {
          continue;
        }
        // For other errors, we might want to break early, but let's try fallbacks just in case
        continue;
      }
    }

    if (!streamResult) {
      throw lastError || new Error("All fallback models failed.");
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of streamResult.stream) {
            const text = chunk.text();
            if (text) {
              controller.enqueue(encoder.encode(text));
            }
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("[Chat API] Final Error:", error);
    return Response.json(
      { error: "Terjadi kesalahan saat menghubungi AI. Kuota mungkin habis, silakan coba beberapa saat lagi." },
      { status: 500 }
    );
  }
}
