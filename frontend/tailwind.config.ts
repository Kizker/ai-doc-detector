import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      // ── Awwwards Mono Editorial Design System ──────────────────
      colors: {
        // Primary palette — high-contrast editorial
        primary: {
          50: "#f0f4ff",
          100: "#dce4ff",
          200: "#b9c9ff",
          300: "#8aa3ff",
          400: "#5a7dff",
          500: "#3358ff",  // Main brand
          600: "#1a3ae6",
          700: "#132db8",
          800: "#0e2291",
          900: "#0a1a6e",
          950: "#060f42",
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        // Semantic colors mapped to CSS variables
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        // Primary palette — high-contrast editorial
        // Semantic — detection results
        detect: {
          ai: "hsl(var(--ai-color))",
          human: "hsl(var(--human-color))",
          mixed: "hsl(var(--mixed-color))",
        },
        // Neutral — editorial grays
        surface: {
          50: "#fafafa",
          100: "#f5f5f5",
          200: "#e5e5e5",
          300: "#d4d4d4",
          400: "#a3a3a3",
          500: "#737373",
          600: "#525252",
          700: "#404040",
          800: "#262626",
          900: "#171717",
          950: "#0a0a0a",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-space-mono)", "monospace"],
        editorial: ["var(--font-inter)", "Georgia", "serif"],
      },
      fontSize: {
        "display": ["4.5rem", { lineHeight: "1.05", letterSpacing: "-0.03em" }],
        "heading-1": ["3rem", { lineHeight: "1.1", letterSpacing: "-0.025em" }],
        "heading-2": ["2.25rem", { lineHeight: "1.15", letterSpacing: "-0.02em" }],
        "heading-3": ["1.5rem", { lineHeight: "1.25", letterSpacing: "-0.015em" }],
        "body-lg": ["1.125rem", { lineHeight: "1.6" }],
        "body": ["1rem", { lineHeight: "1.6" }],
        "body-sm": ["0.875rem", { lineHeight: "1.5" }],
        "caption": ["0.75rem", { lineHeight: "1.4", letterSpacing: "0.02em" }],
      },
      spacing: {
        "18": "4.5rem",
        "22": "5.5rem",
        "26": "6.5rem",
        "30": "7.5rem",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
      boxShadow: {
        "editorial": "0 1px 3px rgba(0,0,0,0.04), 0 6px 16px rgba(0,0,0,0.06)",
        "editorial-lg": "0 4px 12px rgba(0,0,0,0.06), 0 16px 40px rgba(0,0,0,0.08)",
        "editorial-xl": "0 8px 24px rgba(0,0,0,0.08), 0 24px 60px rgba(0,0,0,0.12)",
        "glow-primary": "0 0 20px rgba(51, 88, 255, 0.15)",
        "glow-ai": "0 0 20px rgba(239, 68, 68, 0.15)",
        "glow-human": "0 0 20px rgba(34, 197, 94, 0.15)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "fade-up": "fadeUp 0.6s ease-out",
        "slide-in": "slideIn 0.4s ease-out",
        "pulse-soft": "pulseSoft 2s infinite",
        "scan-line": "scanLine 2s linear infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideIn: {
          "0%": { opacity: "0", transform: "translateX(-20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        scanLine: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
