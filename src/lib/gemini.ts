import { GoogleGenerativeAI } from "@google/generative-ai";
import type { FactCheckResult } from "@/types";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);

const SYSTEM_INSTRUCTION = `Kamu adalah JagaFakta AI, sistem verifikasi fakta profesional untuk Indonesia yang bekerja seperti jurnalis investigatif senior.

PERAN:
- Menganalisis teks, gambar, audio, atau video dari WhatsApp/media sosial Indonesia
- Memberikan verdict yang objektif berdasarkan fakta dan sumber terpercaya
- Membantu masyarakat Indonesia membedakan hoaks dari fakta
- Mendeteksi pola manipulasi ("Hoax DNA") dalam konten

KATEGORI VERDICT:
- HOAKS: Informasi yang terbukti salah, dimanipulasi, atau sengaja menyesatkan
- FAKTA: Informasi yang terbukti benar berdasarkan minimal 2 sumber terpercaya
- KONTEKS_HILANG: Informasi yang mungkin benar tetapi diambil out-of-context, tidak lengkap, atau tanggal/lokasi tidak sesuai
- TIDAK_DAPAT_DIVERIFIKASI: Klaim yang tidak bisa dikonfirmasi karena terlalu spesifik, terlalu lama, atau tidak ada bukti yang cukup

INSTRUKSI ANALISIS:
1. Gunakan Google Search Grounding untuk mencari fakta terkini
2. Prioritaskan sumber: Kompas, Tempo, BBC Indonesia, CNN Indonesia, Detik, ANTARA, situs .go.id, WHO Indonesia, Kemenkes, BNPB
3. Hindari: blog pribadi, forum online, portal berita tidak terverifikasi
4. Perhatikan konteks budaya, politik, dan sosial Indonesia
5. Untuk gambar: baca semua teks yang terlihat, analisis metadata visual, deteksi manipulasi jika ada
6. Untuk hoaks berulang: identifikasi apakah ini varian dari hoaks lama yang beredar kembali
7. Untuk audio/video: analisis transkrip dan konten visual, deteksi deepfake jika relevan

DUKUNGAN BAHASA:
- Kamu bisa menganalisis konten dalam: Bahasa Indonesia, Jawa, Sunda, Melayu, Tagalog, Batak, dan English
- Selalu deteksi bahasa input di field "detected_language"
- Jawab penjelasan selalu dalam Bahasa Indonesia kecuali diminta lain

HOAX DNA ANALYSIS:
Untuk SETIAP konten (terutama yang HOAKS atau KONTEKS_HILANG), identifikasi pola manipulasi dari daftar berikut:
- URGENCY: Menggunakan kata "SEGERA!", "DARURAT!", "SEBARKAN!"
- AUTHORITY_FAKE: Mengaku dari pihak berwenang palsu
- EMOTIONAL_MANIPULATION: Memainkan emosi (takut, marah, kasihan)
- OUTDATED_RECYCLED: Berita lama yang diedarkan ulang
- MISATTRIBUTION: Kutipan/foto yang salah diatribusikan
- CLICKBAIT: Judul sensasional yang tidak sesuai isi
- CONSPIRACY: Narasi konspirasi tanpa bukti
- FABRICATED_DATA: Statistik atau data yang difabrikasi
- DEEPFAKE: Gambar/video yang dimanipulasi dengan AI
- OUT_OF_CONTEXT: Fakta asli yang dipotong/diubah konteksnya

PENTING: Kamu WAJIB merespons HANYA dalam format JSON valid. Pastikan semua string menggunakan double quotes dan karakter khusus di-escape dengan benar. Jangan berikan teks apapun di luar JSON.

{
  "verdict": "HOAKS|FAKTA|KONTEKS_HILANG|TIDAK_DAPAT_DIVERIFIKASI",
  "confidence_score": [integer 0-100],
  "title": "[Ringkasan klaim dalam 10-15 kata, deskriptif]",
  "explanation": "[Penjelasan 3-4 kalimat padat. Jelaskan bukti konkret mengapa benar/salah.]",
  "key_claims": ["[klaim 1]", "[klaim 2]"],
  "misleading_elements": ["[elemen menyesatkan]"],
  "sources": [
    {
      "title": "[Judul sumber]",
      "url": "[URL valid]",
      "snippet": "[Kutipan relevan]",
      "credibility": "tinggi|sedang"
    }
  ],
  "keywords": ["keyword1", "keyword2"],
  "context": "[Konteks tambahan singkat]",
  "detected_language": "[kode bahasa: id|jv|su|ms|en|tl|btk]",
  "hoax_dna": [
    {
      "pattern": "[URGENCY|AUTHORITY_FAKE|EMOTIONAL_MANIPULATION|OUTDATED_RECYCLED|MISATTRIBUTION|CLICKBAIT|CONSPIRACY|FABRICATED_DATA|DEEPFAKE|OUT_OF_CONTEXT]",
      "confidence": [integer 0-100],
      "description": "[Penjelasan singkat kenapa pola ini terdeteksi]"
    }
  ]
}`;

const GENERATION_CONFIG = {
  temperature: 0.1,
  topP: 0.9,
  maxOutputTokens: 4096,
  responseMimeType: "application/json" as const,
};

// Model list in priority order — try the best model first, fallback to alternatives
const MODEL_PRIORITY = [
  "gemini-2.0-flash",
  "gemini-1.5-flash",
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
] as const;

function createModel(modelName: string) {
  return genAI.getGenerativeModel({
    model: modelName,
    systemInstruction: SYSTEM_INSTRUCTION,
    generationConfig: GENERATION_CONFIG,
  });
}

/**
 * Send the actual request to a specific Gemini model
 */
async function callModel(
  modelName: string,
  inputType: "text" | "image" | "video",
  content: string | { base64: string; mimeType: string } | { url: string } | { base64: string; mimeType: string; isVideo: true },
  signal?: AbortSignal
) {
  const model = createModel(modelName);
  const requestOptions = signal ? { signal } : {};

  if (inputType === "text" && typeof content === "string") {
    const prompt = `Analisis teks berikut dan verifikasi kebenarannya:\n\n${content}`;
    return await model.generateContent(prompt, requestOptions);
  } else if (inputType === "image" && typeof content === "object" && "base64" in content && !((content as any).isVideo)) {
    const prompt = "Analisis gambar berikut dan verifikasi kebenaran informasi yang terkandung di dalamnya:";
    return await model.generateContent(
      [
        prompt,
        {
          inlineData: {
            data: (content as { base64: string; mimeType: string }).base64,
            mimeType: (content as { base64: string; mimeType: string }).mimeType,
          },
        },
      ],
      requestOptions
    );
  } else if (inputType === "video") {
    if (typeof content === "object" && "url" in content) {
      const url = (content as { url: string }).url;
      const isYouTube = /youtube\.com|youtu\.be/.test(url);

      if (isYouTube) {
        // YouTube is officially supported by Gemini via fileData — this actually watches the video
        const prompt = `Analisis video YouTube ini secara menyeluruh. Tonton seluruh isi video, dengarkan narasi/dialog, baca teks yang muncul, dan verifikasi semua klaim serta informasi yang disampaikan. Deteksi apakah ada konten yang menyesatkan, manipulasi, atau hoaks. Berikan verdict sesuai format JSON.`;
        return await model.generateContent(
          [
            prompt,
            {
              fileData: {
                fileUri: url,
                mimeType: "video/mp4",
              },
            },
          ],
          requestOptions
        );
      } else {
        // Non-YouTube: Gemini can't directly access these URLs, analyze via text context
        const platform = url.includes("tiktok") ? "TikTok"
          : url.includes("instagram") ? "Instagram"
          : url.includes("facebook") ? "Facebook"
          : url.includes("twitter") || url.includes("x.com") ? "Twitter/X"
          : "platform video";

        const prompt = `Pengguna ingin memverifikasi konten video dari URL ${platform} berikut: ${url}

Lakukan hal berikut:
1. Analisis domain, struktur URL, dan semua informasi yang bisa diambil dari URL tersebut
2. Jika URL mengandung judul/deskripsi yang bisa diidentifikasi, gunakan itu sebagai konteks
3. Berikan verdict jujur — jika konten video tidak bisa diakses langsung, gunakan "TIDAK_DAPAT_DIVERIFIKASI"
4. Di bagian "context", jelaskan bahwa untuk akurasi maksimal, user sebaiknya upload file videonya langsung atau gunakan link YouTube
5. Di bagian "explanation", tetap berikan analisis berdasarkan konteks URL yang tersedia`;
        return await model.generateContent(prompt, requestOptions);
      }
    } else if (typeof content === "object" && "base64" in content) {
      // Uploaded video file via inlineData
      const prompt = `Analisis video yang diupload berikut secara menyeluruh. Verifikasi semua klaim, pernyataan, narasi, dan informasi yang ada di dalamnya. Deteksi apakah ada manipulasi visual (deepfake), transkrip yang disalahartikan, atau konten yang menyesatkan.`;
      return await model.generateContent(
        [
          prompt,
          {
            inlineData: {
              data: (content as { base64: string; mimeType: string }).base64,
              mimeType: (content as { base64: string; mimeType: string }).mimeType,
            },
          },
        ],
        requestOptions
      );
    } else {
      throw new Error("Data video tidak valid");
    }
  } else {
    throw new Error("Tipe input tidak valid");
  }
}

/**
 * Analyze content (text or image) using Gemini AI for fact-checking.
 * Automatically falls back to alternative models if the primary model is rate-limited.
 */
export async function analyzeContent(
  inputType: "text" | "image" | "video",
  content: string | { base64: string; mimeType: string } | { url: string },
  signal?: AbortSignal
): Promise<FactCheckResult> {
  let lastError: any = null;

  for (const modelName of MODEL_PRIORITY) {
    try {
      console.log(`[JagaFakta] Mencoba model: ${modelName}...`);
      const result = await callModel(modelName, inputType, content, signal);

      const response = result.response;
      let text = response.text();

      // Strip markdown code fences if present
      text = text.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/i, "");
      text = text.trim();

      let parsed: FactCheckResult;
      try {
        parsed = JSON.parse(text) as FactCheckResult;
      } catch (parseError) {
        console.error(`[JagaFakta] Gagal parse JSON dari ${modelName}. Raw text:`, text);
        throw parseError;
      }

      // Validate required fields
      if (!parsed.verdict || !parsed.explanation || !parsed.title) {
        throw new Error("Response AI tidak lengkap");
      }

      // Ensure arrays exist
      parsed.key_claims = parsed.key_claims || [];
      parsed.misleading_elements = parsed.misleading_elements || [];
      parsed.sources = parsed.sources || [];
      parsed.keywords = parsed.keywords || [];
      parsed.context = parsed.context || "";
      parsed.hoax_dna = parsed.hoax_dna || [];
      parsed.detected_language = parsed.detected_language || "id";

      console.log(`[JagaFakta] ✓ Berhasil dengan model: ${modelName}`);
      return parsed;
    } catch (error: any) {
      lastError = error;
      console.warn(`[JagaFakta] ✗ Model ${modelName} gagal:`, error.message || error);

      // If this is a quota/rate limit error (429), try the next model
      if (error.status === 429) {
        console.log(`[JagaFakta] Kuota habis untuk ${modelName}, mencoba model berikutnya...`);
        continue;
      }

      // If this is a non-retryable error (e.g., invalid input), stop immediately
      if (error.status === 400) {
        break;
      }

      // For other errors (503, network, etc.), also try the next model
      if (error.status === 503 || error.status === 500) {
        console.log(`[JagaFakta] Server error untuk ${modelName}, mencoba model berikutnya...`);
        continue;
      }

      // For parsing errors, try the next model (the response might be corrupted)
      if (error instanceof SyntaxError) {
        console.warn(`[JagaFakta] Parsing error dengan ${modelName}, mencoba model berikutnya...`);
        continue;
      }

      // For unknown errors, try the next model
      continue;
    }
  }

  // All models failed — throw the most appropriate error
  console.error("[JagaFakta] Semua model gagal:", lastError);

  if (lastError?.status === 429) {
    throw new Error("Batas permintaan (kuota) AI telah tercapai untuk semua model. Silakan coba lagi dalam beberapa menit.");
  }

  if (lastError?.status === 503) {
    throw new Error("Layanan AI sedang sibuk. Silakan coba sesaat lagi.");
  }

  if (lastError instanceof SyntaxError) {
    throw new Error("Gagal memproses respons AI. Silakan coba lagi.");
  }

  throw new Error(lastError?.message || "Terjadi kesalahan saat menghubungi server AI.");
}
