import { NextRequest } from "next/server";
import { analyzeContent } from "@/lib/gemini";
import { VERDICT_CONFIG } from "@/lib/utils";
import type { VerdictType } from "@/types";

/**
 * WhatsApp Bot Webhook
 * 
 * GET:  Verification endpoint for Twilio/WABA webhook setup
 * POST: Receive incoming messages and respond with fact-check results
 * 
 * To connect with Twilio WhatsApp Business:
 * 1. Set up a Twilio account + WhatsApp Sandbox
 * 2. Set webhook URL to: https://yourdomain.com/api/whatsapp/webhook
 * 3. Add TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_NUMBER to .env
 */

// GET: Webhook verification
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  // Twilio doesn't need verification, but Meta WABA does
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new Response(challenge || "OK", { status: 200 });
  }

  return Response.json({ 
    status: "JagaFakta WhatsApp Bot is active",
    version: "1.0.0",
    instructions: "Forward any suspicious message to this bot for fact-checking.",
  }, { status: 200 });
}

// POST: Handle incoming messages
export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || "";
    let body: any;

    if (contentType.includes("application/x-www-form-urlencoded")) {
      const formData = await request.formData();
      body = Object.fromEntries(formData.entries());
    } else {
      body = await request.json();
    }
    
    // Extract message based on platform (Twilio format)
    const message = extractMessage(body);
    
    if (!message || !message.text) {
      return Response.json({ status: "no_message" }, { status: 200 });
    }

    console.log(`[WhatsApp Bot] Received message from ${message.from}: ${message.text.substring(0, 100)}...`);

    // Analyze the content
    let result;
    try {
      result = await analyzeContent("text", message.text);
    } catch (aiError) {
      console.error("[WhatsApp Bot] AI analysis failed:", aiError);
      
      // Send error reply
      if (process.env.TWILIO_ACCOUNT_SID) {
        await sendWhatsAppReply(
          message.from,
          "⚠️ Maaf, saat ini JagaFakta sedang sibuk. Silakan coba lagi dalam beberapa menit atau kunjungi https://jagafakta.id"
        );
      }
      
      return Response.json({ status: "ai_error" }, { status: 200 });
    }

    // Format the response
    const config = VERDICT_CONFIG[result.verdict as VerdictType];
    const reply = formatWhatsAppReply(result, config);

    // Send reply via Twilio (if configured)
    if (process.env.TWILIO_ACCOUNT_SID) {
      await sendWhatsAppReply(message.from, reply);
    } else {
      console.log("[WhatsApp Bot] Reply (Twilio not configured):", reply);
    }

    return Response.json({ 
      status: "processed",
      verdict: result.verdict,
      reply_preview: reply.substring(0, 200),
    }, { status: 200 });
  } catch (error) {
    console.error("[WhatsApp Bot] Webhook error:", error);
    return Response.json({ status: "error" }, { status: 500 });
  }
}

interface ExtractedMessage {
  from: string;
  text: string;
}

function extractMessage(body: Record<string, unknown>): ExtractedMessage | null {
  // Twilio format
  if (body.Body && body.From) {
    return {
      from: body.From as string,
      text: body.Body as string,
    };
  }

  // Meta WABA format
  if (body.entry) {
    try {
      const entries = body.entry as Array<Record<string, unknown>>;
      const changes = entries?.[0]?.changes as Array<Record<string, unknown>>;
      const value = changes?.[0]?.value as Record<string, unknown>;
      const messages = value?.messages as Array<Record<string, unknown>>;
      
      if (messages?.[0]) {
        return {
          from: messages[0].from as string,
          text: (messages[0].text as Record<string, string>)?.body || "",
        };
      }
    } catch {
      return null;
    }
  }

  return null;
}

function formatWhatsAppReply(
  result: { verdict: string; title: string; explanation: string; confidence_score: number; sources?: Array<{ title: string; url: string }> },
  config: { emoji: string; label: string }
): string {
  const lines: string[] = [];

  // Header
  lines.push(`🛡️ *JagaFakta — Hasil Verifikasi*`);
  lines.push("");

  // Verdict
  lines.push(`${config.emoji} *${config.label}*`);
  lines.push(`📊 Tingkat Keyakinan: ${result.confidence_score}%`);
  lines.push("");

  // Title
  lines.push(`📌 *${result.title}*`);
  lines.push("");

  // Explanation
  lines.push(`📝 ${result.explanation}`);
  lines.push("");

  // Sources (max 2)
  if (result.sources && result.sources.length > 0) {
    lines.push("📰 *Sumber:*");
    for (const source of result.sources.slice(0, 2)) {
      lines.push(`• ${source.title}: ${source.url}`);
    }
    lines.push("");
  }

  // Footer
  lines.push("─────────────");
  lines.push("🌐 Cek lebih lengkap di *jagafakta.id*");
  lines.push("_Saring sebelum sharing!_ ✅");

  return lines.join("\n");
}

async function sendWhatsAppReply(to: string, message: string): Promise<void> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER;

  if (!accountSid || !authToken || !fromNumber) {
    console.log("[WhatsApp Bot] Twilio not configured, skipping send");
    return;
  }

  try {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    const params = new URLSearchParams({
      To: to.startsWith("whatsapp:") ? to : `whatsapp:${to}`,
      From: fromNumber.startsWith("whatsapp:") ? fromNumber : `whatsapp:${fromNumber}`,
      Body: message,
    });

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
      },
      body: params.toString(),
    });

    if (!response.ok) {
      console.error("[WhatsApp Bot] Twilio send error:", await response.text());
    }
  } catch (error) {
    console.error("[WhatsApp Bot] Send error:", error);
  }
}
