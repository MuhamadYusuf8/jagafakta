"use client";

import { ExternalLink } from "lucide-react";
import type { Source } from "@/types";

interface SourceCardProps {
  source: Source;
}

export default function SourceCard({ source }: SourceCardProps) {
  const getDomain = (url: string) => {
    try {
      return new URL(url).hostname.replace("www.", "");
    } catch {
      return url;
    }
  };

  const domain = getDomain(source.url);
  const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;

  return (
    <div
      className="min-w-[270px] max-w-[300px] flex-shrink-0 rounded-xl glass p-4 space-y-3
                 hover:-translate-y-0.5 hover:shadow-glow-sm transition-all duration-200 group"
    >
      {/* Domain row */}
      <div className="flex items-center gap-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={faviconUrl}
          alt={domain}
          width={16}
          height={16}
          className="w-4 h-4 rounded-sm"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
        <span className="text-xs font-mono font-medium text-text-muted truncate">
          {domain}
        </span>
      </div>

      {/* Title link */}
      <a
        href={source.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block text-sm font-medium text-accent hover:underline 
                   underline-offset-2 line-clamp-2 group-hover:text-blue-400 transition-colors"
      >
        {source.title}
        <ExternalLink className="inline w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
      </a>

      {/* Snippet */}
      <p className="text-xs text-text-muted leading-relaxed line-clamp-2">
        {source.snippet}
      </p>

      {/* Credibility badge */}
      <div>
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium
                      ${
                        source.credibility === "tinggi"
                          ? "bg-fakta/10 text-fakta border border-fakta/20"
                          : "bg-konteks/10 text-konteks border border-konteks/20"
                      }`}
        >
          Kredibilitas: {source.credibility === "tinggi" ? "Tinggi" : "Sedang"}
        </span>
      </div>
    </div>
  );
}
