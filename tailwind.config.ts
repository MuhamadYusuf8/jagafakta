import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        jakarta: ['"Plus Jakarta Sans"', "sans-serif"],
        sans: ['"Inter"', "sans-serif"],
        mono: ['"JetBrains Mono"', "monospace"],
      },
      colors: {
        bg: "#0A0F1E",
        surface: "#111827",
        "surface-2": "#1F2937",
        "border-subtle": "#374151",
        "text-primary": "#F9FAFB",
        "text-muted": "#9CA3AF",
        accent: "#3B82F6",
        "accent-glow": "rgba(59, 130, 246, 0.15)",
        hoaks: "#EF4444",
        "hoaks-bg": "rgba(239, 68, 68, 0.08)",
        "hoaks-border": "rgba(239, 68, 68, 0.3)",
        fakta: "#22C55E",
        "fakta-bg": "rgba(34, 197, 94, 0.08)",
        "fakta-border": "rgba(34, 197, 94, 0.3)",
        konteks: "#F59E0B",
        "konteks-bg": "rgba(245, 158, 11, 0.08)",
        "konteks-border": "rgba(245, 158, 11, 0.3)",
        unverified: "#6B7280",
        "unverified-bg": "rgba(107, 114, 128, 0.08)",
        "unverified-border": "rgba(107, 114, 128, 0.3)",
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        shimmer: "shimmer 1.5s infinite",
        fadeIn: "fadeIn 0.4s ease-out",
        slideUp: "slideUp 0.4s ease-out",
        scaleIn: "scaleIn 0.3s ease-out",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
      backdropBlur: {
        xs: "2px",
        "2xl": "40px",
        "3xl": "64px",
      },
      boxShadow: {
        "glow-sm": "0 0 15px rgba(59, 130, 246, 0.1)",
        "glow-md": "0 0 30px rgba(59, 130, 246, 0.15)",
        "glow-lg": "0 0 60px rgba(59, 130, 246, 0.2)",
      },
    },
  },
  plugins: [],
};

export default config;
