"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Send, X, Sparkles, ChevronDown, Loader2, Bot, User } from "lucide-react";
import type { FactCheckResult, VerdictType } from "@/types";

interface Message {
  id: string;
  role: "user" | "model";
  content: string;
  streaming?: boolean;
}

const SUGGESTED_QUESTIONS: Record<VerdictType, string[]> = {
  HOAKS: [
    "Kenapa hoaks ini bisa menyebar begitu luas di Indonesia?",
    "Apa bahaya nyata jika masyarakat percaya pada hoaks ini?",
    "Bagaimana cara membuktikan kebenarannya kepada keluarga?",
  ],
  FAKTA: [
    "Apa sumber terpercaya tambahan yang bisa saya cek?",
    "Apakah ada nuansa atau konteks yang perlu diperhatikan?",
    "Bagaimana cara membagikan fakta ini secara efektif?",
  ],
  KONTEKS_HILANG: [
    "Apa konteks lengkap yang sebenarnya dari informasi ini?",
    "Mengapa konteks penting dalam kasus seperti ini?",
    "Bagaimana cara membaca informasi ini dengan benar?",
  ],
  TIDAK_DAPAT_DIVERIFIKASI: [
    "Apa yang membuat klaim ini sulit untuk diverifikasi?",
    "Langkah apa yang bisa saya lakukan untuk menyelidiki lebih lanjut?",
    "Bagaimana cara mengenali ciri-ciri informasi yang tidak bisa diverifikasi?",
  ],
};

function MarkdownText({ text }: { text: string }) {
  // Simple markdown: bold, italic, bullet list
  const lines = text.split("\n");
  return (
    <div className="space-y-1.5">
      {lines.map((line, i) => {
        if (!line.trim()) return <br key={i} />;
        // Bullet list
        if (/^[-*•]\s/.test(line)) {
          const content = line.replace(/^[-*•]\s/, "");
          return (
            <div key={i} className="flex items-start gap-2">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent/60 flex-shrink-0" />
              <span>{renderInline(content)}</span>
            </div>
          );
        }
        return <p key={i}>{renderInline(line)}</p>;
      })}
    </div>
  );
}

function renderInline(text: string): React.ReactNode {
  // Bold: **text** or __text__
  const parts = text.split(/(\*\*[^*]+\*\*|__[^_]+__)/g);
  return parts.map((p, i) => {
    if (/^\*\*(.+)\*\*$/.test(p) || /^__(.+)__$/.test(p)) {
      const inner = p.replace(/^\*\*|\*\*$|^__|__$/g, "");
      return <strong key={i} className="font-semibold text-text-primary">{inner}</strong>;
    }
    return <span key={i}>{p}</span>;
  });
}

interface ChatModeProps {
  result: FactCheckResult;
}

export default function ChatMode({ result }: ChatModeProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const suggested = SUGGESTED_QUESTIONS[result.verdict];

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Welcome message
      setMessages([{
        id: "welcome",
        role: "model",
        content: `Halo! Saya siap membantu kamu memahami lebih dalam tentang hasil verifikasi ini. 🤖\n\nVerdict **${result.verdict}** untuk klaim "_${result.title}_" sudah dianalisis. Ada yang ingin kamu tanyakan lebih lanjut?`,
      }]);
    }
  }, [isOpen, result, messages.length]);

  useEffect(() => {
    if (isOpen) { setTimeout(scrollToBottom, 100); }
  }, [messages, isOpen, scrollToBottom]);

  useEffect(() => {
    if (isOpen) { setTimeout(() => inputRef.current?.focus(), 200); }
  }, [isOpen]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isStreaming) return;
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: text.trim() };
    const aiMsgId = (Date.now() + 1).toString();

    setMessages(prev => [...prev, userMsg, { id: aiMsgId, role: "model", content: "", streaming: true }]);
    setInputValue("");
    setIsStreaming(true);
    scrollToBottom();

    try {
      abortRef.current = new AbortController();
      const payload = {
        messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })),
        context: result,
      };
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: abortRef.current.signal,
      });

      if (!res.ok) {
        throw new Error("Gagal menghubungi AI");
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let full = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        full += decoder.decode(value, { stream: true });
        setMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, content: full } : m));
      }
      setMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, streaming: false } : m));
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") return;
      setMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, content: "Maaf, terjadi kesalahan. Coba lagi ya!", streaming: false } : m));
    } finally {
      setIsStreaming(false);
    }
  }, [messages, result, isStreaming, scrollToBottom]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(inputValue); }
  };

  const handleClose = () => {
    abortRef.current?.abort();
    setIsOpen(false);
  };

  return (
    <div className="mt-4">
      {/* Toggle button */}
      {!isOpen && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => setIsOpen(true)}
          id="chat-mode-toggle"
          className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl glass-strong
                     text-text-muted hover:text-text-primary border border-white/[0.06]
                     hover:border-accent/30 transition-all group"
        >
          <div className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
            <Sparkles className="w-4 h-4 text-accent" />
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-text-primary">Tanya AI Lebih Lanjut</p>
            <p className="text-xs text-text-muted">Diskusi mendalam seputar hasil verifikasi ini</p>
          </div>
          <ChevronDown className="w-4 h-4 ml-auto group-hover:text-accent transition-colors" />
        </motion.button>
      )}

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="chat-panel"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="glass-strong rounded-2xl border border-white/[0.08] overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-accent to-blue-600 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-jakarta font-semibold text-text-primary">JagaFakta AI</p>
                    <p className="text-[10px] text-text-muted">Mode Percakapan Mendalam</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 text-[10px] text-fakta/80">
                    <span className="w-1.5 h-1.5 rounded-full bg-fakta animate-pulse inline-block" />
                    Online
                  </span>
                  <button
                    onClick={handleClose}
                    className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/[0.05] transition-all"
                    aria-label="Tutup chat"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="h-80 overflow-y-auto p-4 space-y-4 scrollbar-hide">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                    {/* Avatar */}
                    <div className={`w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center ${
                      msg.role === "model"
                        ? "bg-gradient-to-br from-accent to-blue-600"
                        : "bg-white/[0.08]"
                    }`}>
                      {msg.role === "model"
                        ? <Bot className="w-3.5 h-3.5 text-white" />
                        : <User className="w-3.5 h-3.5 text-text-muted" />
                      }
                    </div>

                    {/* Bubble */}
                    <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-accent/15 border border-accent/20 text-text-primary rounded-tr-sm"
                        : "bg-white/[0.04] border border-white/[0.06] text-text-muted rounded-tl-sm"
                    }`}>
                      {msg.role === "model" && msg.content ? (
                        <MarkdownText text={msg.content} />
                      ) : (
                        <span>{msg.content}</span>
                      )}
                      {msg.streaming && msg.content === "" && (
                        <span className="flex items-center gap-1.5 text-text-muted">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span className="text-xs">Sedang berpikir...</span>
                        </span>
                      )}
                      {msg.streaming && msg.content !== "" && (
                        <span className="inline-block w-0.5 h-3.5 bg-accent animate-pulse ml-0.5 align-middle" />
                      )}
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>

              {/* Suggested questions */}
              {messages.length <= 1 && !isStreaming && (
                <div className="px-4 pb-2 flex flex-wrap gap-2">
                  {suggested.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(q)}
                      className="text-xs px-2.5 py-1.5 rounded-lg border border-accent/20 bg-accent/5
                                 text-text-muted hover:text-accent hover:border-accent/40 hover:bg-accent/10
                                 transition-all text-left"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}

              {/* Input */}
              <div className="p-3 border-t border-white/[0.06] flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  id="chat-input"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Tanya apa saja tentang hasil verifikasi ini..."
                  disabled={isStreaming}
                  className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted
                             outline-none disabled:opacity-60"
                />
                <button
                  onClick={() => sendMessage(inputValue)}
                  disabled={!inputValue.trim() || isStreaming}
                  id="chat-send-btn"
                  className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center
                             disabled:opacity-40 hover:bg-blue-500 transition-colors flex-shrink-0"
                  aria-label="Kirim pesan"
                >
                  {isStreaming
                    ? <Loader2 className="w-4 h-4 text-white animate-spin" />
                    : <Send className="w-4 h-4 text-white" />
                  }
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
