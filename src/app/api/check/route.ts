import { NextRequest } from "next/server";
import { analyzeContent } from "@/lib/gemini";
import { supabaseAdmin } from "@/lib/supabase";
import { rateLimiter, getCached, setCache } from "@/lib/redis";
import { hashContent } from "@/lib/utils";
import type { FactCheckResult } from "@/types";

export async function POST(request: NextRequest) {
  try {
    // 1. Rate Limiting (skip if Redis not configured)
    if (rateLimiter) {
      const forwarded = request.headers.get("x-forwarded-for");
      const realIp = request.headers.get("x-real-ip");
      const ip = forwarded?.split(",")[0]?.trim() || realIp || "anonymous";

      const { success, reset } = await rateLimiter.limit(ip);
      if (!success) {
        const retryAfter = Math.ceil((reset - Date.now()) / 1000);
        return Response.json(
          {
            error: "Terlalu banyak permintaan. Tunggu 1 menit sebelum mencoba lagi.",
            retry_after: retryAfter,
          },
          { status: 429 }
        );
      }
    }

    // 2. Request Validation
    const body = await request.json();
    const { inputType, content, imageBase64, imageMimeType, videoUrl, videoBase64, videoMimeType } = body;

    if (!inputType || !["text", "image", "video"].includes(inputType)) {
      return Response.json(
        { error: "Tipe input harus 'text', 'image', atau 'video'." },
        { status: 400 }
      );
    }

    if (inputType === "text") {
      if (!content || typeof content !== "string" || content.trim().length === 0) {
        return Response.json(
          { error: "Teks tidak boleh kosong." },
          { status: 400 }
        );
      }
      if (content.length > 3000) {
        return Response.json(
          { error: "Teks terlalu panjang. Maksimal 3000 karakter." },
          { status: 400 }
        );
      }
    }

    if (inputType === "image") {
      if (!imageBase64 || !imageMimeType) {
        return Response.json(
          { error: "Data gambar dan tipe MIME wajib disertakan." },
          { status: 400 }
        );
      }
    }

    if (inputType === "video") {
      if (!videoUrl && !videoBase64) {
        return Response.json(
          { error: "Sertakan URL video atau upload file video." },
          { status: 400 }
        );
      }
      if (videoUrl) {
        try { new URL(videoUrl); } catch {
          return Response.json({ error: "URL video tidak valid." }, { status: 400 });
        }
      }
    }

    // 3. Caching Logic
    const rawContent =
      inputType === "text" ? content
      : inputType === "image" ? imageBase64
      : videoUrl ?? videoBase64 ?? "video-unknown";
    const contentKey = hashContent(rawContent);

    const cached = await getCached<FactCheckResult>(contentKey);
    if (cached) {
      return Response.json(
        { ...cached, is_cached: true, created_at: new Date().toISOString() },
        { status: 200 }
      );
    }

    // 4. Gemini API Call with 60-second timeout (video needs more time)
    const controller = new AbortController();
    const timeoutMs = inputType === "video" ? 60_000 : 30_000;
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    let result: FactCheckResult;
    try {
      if (inputType === "text") {
        result = await analyzeContent("text", content, controller.signal);
      } else if (inputType === "image") {
        result = await analyzeContent(
          "image",
          { base64: imageBase64, mimeType: imageMimeType },
          controller.signal
        );
      } else {
        // video
        const videoContent = videoUrl
          ? { url: videoUrl }
          : { base64: videoBase64!, mimeType: videoMimeType || "video/mp4" };
        result = await analyzeContent("video", videoContent, controller.signal);
      }
    } catch (aiError: any) {
      if (aiError instanceof Error && aiError.name === "AbortError") {
        return Response.json(
          { error: "Permintaan melebihi batas waktu 30 detik. Coba lagi dengan konten yang lebih singkat." },
          { status: 504 }
        );
      }
      console.error("Gemini API error:", aiError);
      
      // Use the specific error message from analyzeContent (e.g. Quota limit)
      const errorMessage = aiError instanceof Error ? aiError.message : "Layanan AI sedang sibuk. Coba lagi dalam beberapa detik.";
      const status = aiError.status || 503;

      return Response.json(
        { error: errorMessage },
        { status: status }
      );
    } finally {
      clearTimeout(timeoutId);
    }

    // 5. Save to Supabase
    let dbRecord: { id: string } | null = null;
    try {
      const { data } = await supabaseAdmin
        .from("fact_checks")
        .insert({
          input_type: inputType,
          input_content: inputType === "text" ? content : null,
          content_hash: contentKey,
          verdict: result.verdict,
          confidence_score: result.confidence_score,
          title: result.title,
          explanation: result.explanation,
          key_claims: result.key_claims,
          misleading_elements: result.misleading_elements,
          sources: result.sources,
          keywords: result.keywords,
          context: result.context,
          hoax_dna: result.hoax_dna || [],
          detected_language: result.detected_language || "id",
          is_cached: false,
        })
        .select("id")
        .single();

      dbRecord = data;

      // Update global app_stats
      if (dbRecord) {
        try {
          const { data: stats } = await supabaseAdmin.from("app_stats").select("*").eq("id", 1).single();
          if (stats) {
            const updates: any = { total_checks: (stats.total_checks || 0) + 1 };
            if (result.verdict === "HOAKS") updates.total_hoaks = (stats.total_hoaks || 0) + 1;
            else if (result.verdict === "FAKTA") updates.total_fakta = (stats.total_fakta || 0) + 1;
            else updates.total_konteks = (stats.total_konteks || 0) + 1;
            
            await supabaseAdmin.from("app_stats").update(updates).eq("id", 1);
            
            // Invalidate stats cache if redis is available
            if (rateLimiter) { // using rateLimiter as a proxy check for redis existence
              try {
                const { redis } = await import("@/lib/redis");
                if (redis) await redis.del("app:stats");
              } catch (e) {}
            }
          }
        } catch (statsErr) {
          console.error("Failed to update app_stats:", statsErr);
        }
      }
    } catch (dbError) {
      console.error("Supabase insert error:", dbError);
      // Don't block response on DB error
    }

    // 6. Save to Cache
    await setCache(contentKey, result);

    // 7. Return Response
    return Response.json(
      {
        ...result,
        id: dbRecord?.id || `local-check-${Date.now()}`,
        is_cached: false,
        created_at: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    // 8. Global Error Handler
    console.error("Unhandled error in /api/check:", error);
    return Response.json(
      { error: "Terjadi kesalahan pada server. Silakan coba lagi nanti." },
      { status: 500 }
    );
  }
}
