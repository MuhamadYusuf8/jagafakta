"use client";

import { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, ImageIcon, Search, Loader2, X, Video, Link, Upload, AlertCircle } from "lucide-react";
import UploadZone from "./UploadZone";

interface VideoData {
  type: "url" | "file";
  url?: string;
  file?: File;
  base64?: string;
  mimeType?: string;
  preview?: string;
}

interface InputTabsProps {
  activeTab: "text" | "image" | "video";
  onTabChange: (tab: "text" | "image" | "video") => void;
  inputText: string;
  onTextChange: (text: string) => void;
  uploadedImage: { file: File; base64: string; preview: string } | null;
  onImageChange: (data: { file: File; base64: string; preview: string } | null) => void;
  videoData: VideoData | null;
  onVideoChange: (data: VideoData | null) => void;
  isLoading: boolean;
  onSubmit: () => void;
}

export default function InputTabs({
  activeTab,
  onTabChange,
  inputText,
  onTextChange,
  uploadedImage,
  onImageChange,
  videoData,
  onVideoChange,
  isLoading,
  onSubmit,
}: InputTabsProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const videoFileRef = useRef<HTMLInputElement>(null);
  const maxChars = 2000;
  const [videoMode, setVideoMode] = useState<"url" | "file">("url");
  const [videoUrl, setVideoUrl] = useState("");
  const [videoUrlError, setVideoUrlError] = useState("");
  const [isDraggingVideo, setIsDraggingVideo] = useState(false);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = Math.max(140, textarea.scrollHeight) + "px";
    }
  }, [inputText]);

  const isSubmitDisabled =
    isLoading ||
    (activeTab === "text" && inputText.trim().length === 0) ||
    (activeTab === "image" && !uploadedImage) ||
    (activeTab === "video" && !videoData);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey) && !isSubmitDisabled) {
      e.preventDefault();
      onSubmit();
    }
  };

  const handleVideoUrlSubmit = () => {
    setVideoUrlError("");
    const trimmed = videoUrl.trim();
    if (!trimmed) { setVideoUrlError("Masukkan URL video terlebih dahulu."); return; }
    try {
      new URL(trimmed);
    } catch {
      setVideoUrlError("URL tidak valid. Contoh: https://youtube.com/watch?v=...");
      return;
    }
    // Accept any video-like URL; show a warning for non-YouTube
    onVideoChange({ type: "url", url: trimmed });
  };

  const handleVideoFileChange = (file: File) => {
    if (!file.type.startsWith("video/")) {
      return;
    }
    // Limit: 20MB for inline upload
    if (file.size > 20 * 1024 * 1024) {
      alert("Ukuran video maksimal 20MB. Gunakan link URL untuk video yang lebih besar.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      const base64 = result.split(",")[1];
      const preview = URL.createObjectURL(file);
      onVideoChange({ type: "file", file, base64, mimeType: file.type, preview });
    };
    reader.readAsDataURL(file);
  };

  const handleVideoDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingVideo(false);
    const file = e.dataTransfer.files[0];
    if (file) handleVideoFileChange(file);
  };

  return (
    <div className="space-y-4">
      {/* Tab headers */}
      <div className="flex bg-surface-2/50 rounded-xl p-1 gap-1">
        {[
          { key: "text" as const, label: "Teks", emoji: "📝" },
          { key: "image" as const, label: "Gambar", emoji: "🖼️" },
          { key: "video" as const, label: "Video", emoji: "🎬" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-2 sm:px-4 rounded-lg
                       text-sm font-medium transition-all relative
                       ${
                         activeTab === tab.key
                           ? "text-text-primary"
                           : "text-text-muted hover:text-text-primary/70"
                       }`}
          >
            {activeTab === tab.key && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-surface rounded-lg border border-white/[0.08] shadow-sm"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative flex items-center gap-1.5">
              <span className="text-base">{tab.emoji}</span>
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden text-xs">{tab.label}</span>
            </span>
            {tab.key === "video" && (
              <span className="relative text-[8px] font-black px-1 py-0.5 rounded bg-accent/20 text-accent leading-none">NEW</span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="min-h-[160px]">
        <AnimatePresence mode="wait">
          {activeTab === "text" && (
            <motion.div
              key="text"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="relative"
            >
              <textarea
                ref={textareaRef}
                value={inputText}
                onChange={(e) => {
                  if (e.target.value.length <= maxChars) {
                    onTextChange(e.target.value);
                  }
                }}
                onKeyDown={handleKeyDown}
                placeholder="Paste teks dari WhatsApp, forward-an, berita, atau status media sosial di sini..."
                className="w-full min-h-[140px] sm:min-h-[180px] p-4 pr-10 rounded-xl
                           bg-surface/80 border border-border-subtle text-text-primary text-sm
                           placeholder:text-text-muted/50 resize-none leading-relaxed
                           focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/30
                           transition-all"
                id="input-text"
              />
              {inputText.length > 0 && (
                <button
                  onClick={() => onTextChange("")}
                  className="absolute top-3 right-3 p-1 rounded-md hover:bg-surface-2 
                             text-text-muted hover:text-text-primary transition-all"
                  aria-label="Hapus teks"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <div className="absolute bottom-3 right-3 text-[10px] text-text-muted/50">
                {inputText.length}/{maxChars}
              </div>
            </motion.div>
          )}

          {activeTab === "image" && (
            <motion.div
              key="image"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <UploadZone onImageSelect={onImageChange} uploadedImage={uploadedImage} />
            </motion.div>
          )}

          {activeTab === "video" && (
            <motion.div
              key="video"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-3"
            >
              {/* Video mode switcher */}
              <div className="flex gap-2 p-1 bg-surface/50 rounded-lg w-fit">
                <button
                  onClick={() => { setVideoMode("url"); onVideoChange(null); setVideoUrl(""); setVideoUrlError(""); }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${videoMode === "url" ? "bg-accent text-white shadow" : "text-text-muted hover:text-text-primary"}`}
                >
                  <Link className="w-3 h-3" /> Pakai Link URL
                </button>
                <button
                  onClick={() => { setVideoMode("file"); onVideoChange(null); setVideoUrl(""); setVideoUrlError(""); }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${videoMode === "file" ? "bg-accent text-white shadow" : "text-text-muted hover:text-text-primary"}`}
                >
                  <Upload className="w-3 h-3" /> Upload File
                </button>
              </div>

              {videoMode === "url" && (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={videoUrl}
                      onChange={(e) => { setVideoUrl(e.target.value); setVideoUrlError(""); if (videoData?.type === "url") onVideoChange(null); }}
                      onKeyDown={(e) => { if (e.key === "Enter") handleVideoUrlSubmit(); }}
                      placeholder="https://youtube.com/watch?v=... atau https://tiktok.com/..."
                      className="flex-1 px-4 py-3 rounded-xl bg-surface/80 border border-border-subtle
                                 text-text-primary text-sm placeholder:text-text-muted/50
                                 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/30
                                 transition-all"
                    />
                    <button
                      onClick={handleVideoUrlSubmit}
                      className="px-4 py-3 rounded-xl bg-accent/10 border border-accent/20 text-accent text-sm font-semibold hover:bg-accent/20 transition-all whitespace-nowrap"
                    >
                      Gunakan
                    </button>
                  </div>
                  {videoUrlError && (
                    <div className="flex items-center gap-2 text-xs text-hoaks">
                      <AlertCircle className="w-3 h-3 flex-shrink-0" /> {videoUrlError}
                    </div>
                  )}
                  {videoData?.type === "url" && !videoUrlError && (
                    <div className={`flex items-center gap-2 p-3 rounded-xl border ${
                      /youtube|youtu\.be/.test(videoData.url || "")
                        ? "bg-green-500/10 border-green-500/20"
                        : "bg-amber-500/10 border-amber-500/20"
                    }`}>
                      <Video className={`w-4 h-4 flex-shrink-0 ${/youtube|youtu\.be/.test(videoData.url || "") ? "text-green-400" : "text-amber-400"}`} />
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-semibold ${/youtube|youtu\.be/.test(videoData.url || "") ? "text-green-400" : "text-amber-400"}`}>
                          {/youtube|youtu\.be/.test(videoData.url || "") ? "Link YouTube siap dianalisis penuh ✓" : "Link diterima — akurasi mungkin terbatas ⚠️"}
                        </p>
                        <p className="text-[10px] text-text-muted truncate">{videoData.url}</p>
                        {!/youtube|youtu\.be/.test(videoData.url || "") && (
                          <p className="text-[10px] text-amber-400/70 mt-0.5">Untuk akurasi terbaik, gunakan link YouTube atau upload file video</p>
                        )}
                      </div>
                      <button onClick={() => { onVideoChange(null); setVideoUrl(""); }} className="text-text-muted hover:text-text-primary flex-shrink-0">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  <p className="text-[10px] text-text-muted/50">
                    Mendukung: YouTube, TikTok, Instagram Reels, Facebook Video, atau URL .mp4 langsung
                  </p>
                </div>
              )}

              {videoMode === "file" && (
                <div>
                  {videoData?.type === "file" ? (
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-surface/80 border border-border-subtle">
                      <div className="w-16 h-12 rounded-lg overflow-hidden bg-black flex-shrink-0">
                        <video src={videoData.preview} className="w-full h-full object-cover" muted />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-text-primary truncate">{videoData.file?.name}</p>
                        <p className="text-xs text-text-muted">{videoData.file ? (videoData.file.size / (1024 * 1024)).toFixed(1) + " MB" : ""}</p>
                      </div>
                      <button
                        onClick={() => onVideoChange(null)}
                        className="p-1.5 rounded-lg hover:bg-surface-2 text-text-muted hover:text-text-primary transition-all"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onDragOver={(e) => { e.preventDefault(); setIsDraggingVideo(true); }}
                      onDragLeave={() => setIsDraggingVideo(false)}
                      onDrop={handleVideoDrop}
                      onClick={() => videoFileRef.current?.click()}
                      className={`flex flex-col items-center justify-center gap-3 p-8 rounded-xl border-2 border-dashed cursor-pointer transition-all min-h-[160px]
                        ${isDraggingVideo
                          ? "border-accent/60 bg-accent/5"
                          : "border-border-subtle hover:border-accent/30 hover:bg-surface/50 bg-surface/30"
                        }`}
                    >
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${isDraggingVideo ? "bg-accent/15" : "bg-surface-2"}`}>
                        <Video className={`w-7 h-7 ${isDraggingVideo ? "text-accent" : "text-text-muted"}`} />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-semibold text-text-primary">Drop video di sini</p>
                        <p className="text-xs text-text-muted mt-1">atau klik untuk pilih file</p>
                        <p className="text-[10px] text-text-muted/60 mt-1.5">MP4, WebM, MOV • Maks. 20MB</p>
                      </div>
                    </div>
                  )}
                  <input
                    ref={videoFileRef}
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) handleVideoFileChange(f); }}
                  />
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Submit button */}
      <motion.button
        onClick={onSubmit}
        disabled={isSubmitDisabled}
        whileHover={isSubmitDisabled ? {} : { scale: 1.01 }}
        whileTap={isSubmitDisabled ? {} : { scale: 0.98 }}
        className={`w-full flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-xl
                   text-sm font-jakarta font-semibold transition-all
                   ${
                     isSubmitDisabled
                       ? "bg-surface-2 text-text-muted/40 cursor-not-allowed border border-border-subtle"
                       : "bg-gradient-to-r from-accent to-blue-600 text-white shadow-glow-md hover:shadow-glow-lg border border-accent/30"
                   }`}
        id="submit-button"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Sedang menganalisis {activeTab === "video" ? "video" : "konten"}</span>
            <span className="animate-pulse">...</span>
          </>
        ) : (
          <>
            <Search className="w-4 h-4" />
            Cek Sekarang
          </>
        )}
      </motion.button>

      {!isLoading && (
        <p className="text-center text-[10px] text-text-muted/40">
          Tekan Ctrl+Enter untuk cek cepat
        </p>
      )}
    </div>
  );
}
