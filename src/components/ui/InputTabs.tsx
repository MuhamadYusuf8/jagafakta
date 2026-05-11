"use client";

import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { FileText, ImageIcon, Search, Loader2, X } from "lucide-react";
import UploadZone from "./UploadZone";

interface InputTabsProps {
  activeTab: "text" | "image";
  onTabChange: (tab: "text" | "image") => void;
  inputText: string;
  onTextChange: (text: string) => void;
  uploadedImage: { file: File; base64: string; preview: string } | null;
  onImageChange: (data: { file: File; base64: string; preview: string } | null) => void;
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
  isLoading,
  onSubmit,
}: InputTabsProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const maxChars = 2000;

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
    (activeTab === "image" && !uploadedImage);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey) && !isSubmitDisabled) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className="space-y-4">
      {/* Tab headers */}
      <div className="flex bg-surface-2/50 rounded-xl p-1 gap-1">
        {[
          { key: "text" as const, label: "Teks", icon: FileText, emoji: "📝" },
          { key: "image" as const, label: "Gambar", icon: ImageIcon, emoji: "🖼️" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg
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
            <span className="relative flex items-center gap-2">
              <span className="text-base">{tab.emoji}</span>
              {tab.label}
            </span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="min-h-[160px]">
        {activeTab === "text" ? (
          <div className="relative">
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
            {/* Clear button */}
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
            {/* Character counter */}
            <div className="absolute bottom-3 right-3 text-[10px] text-text-muted/50">
              {inputText.length}/{maxChars}
            </div>
          </div>
        ) : (
          <UploadZone onImageSelect={onImageChange} uploadedImage={uploadedImage} />
        )}
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
            <span>Sedang menganalisis</span>
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
