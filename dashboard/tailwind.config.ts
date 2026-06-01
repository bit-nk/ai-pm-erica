import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

/**
 * AI PM Assistant dashboard - Tailwind theme. Colors bind to the CSS variables in
 * src/styles/theme.css so shadcn-ui primitives and bespoke components share
 * one source of truth (main_design.png palette).
 */
const config: Config = {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    container: { center: true, padding: "1.5rem", screens: { "2xl": "1440px" } },
    extend: {
      colors: {
        background: "hsl(var(--background))",
        surface: "hsl(var(--surface))",
        foreground: "hsl(var(--foreground))",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        card: { DEFAULT: "hsl(var(--card))", foreground: "hsl(var(--card-foreground))" },
        popover: { DEFAULT: "hsl(var(--popover))", foreground: "hsl(var(--popover-foreground))" },
        primary: { DEFAULT: "hsl(var(--primary))", foreground: "hsl(var(--primary-foreground))" },
        accent: { DEFAULT: "hsl(var(--accent))", foreground: "hsl(var(--accent-foreground))" },
        muted: { DEFAULT: "hsl(var(--muted))", foreground: "hsl(var(--muted-foreground))" },
        // Semantic status tokens - used by badges, verdict banners, exec states
        status: {
          success: { DEFAULT: "hsl(var(--status-success))", bg: "hsl(var(--status-success-bg))" },
          info: { DEFAULT: "hsl(var(--status-info))", bg: "hsl(var(--status-info-bg))" },
          warning: { DEFAULT: "hsl(var(--status-warning))", bg: "hsl(var(--status-warning-bg))" },
          danger: { DEFAULT: "hsl(var(--status-danger))", bg: "hsl(var(--status-danger-bg))" },
          neutral: { DEFAULT: "hsl(var(--status-neutral))", bg: "hsl(var(--status-neutral-bg))" },
          na: { DEFAULT: "hsl(var(--status-na))", bg: "hsl(var(--status-na-bg))" },
        },
        heat: {
          low: "hsl(var(--heat-low))",
          mid: "hsl(var(--heat-mid))",
          high: "hsl(var(--heat-high))",
        },
      },
      borderRadius: { lg: "var(--radius)", md: "calc(var(--radius) - 4px)", sm: "calc(var(--radius) - 8px)" },
      boxShadow: {
        card: "0 1px 2px rgba(27,30,37,0.04), 0 8px 24px -12px rgba(27,30,37,0.12)",
        pop: "0 12px 40px -12px rgba(27,30,37,0.25)",
      },
      fontFamily: { sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"] },
      keyframes: {
        "fade-in": { from: { opacity: "0", transform: "translateY(4px)" }, to: { opacity: "1", transform: "translateY(0)" } },
      },
      animation: { "fade-in": "fade-in 0.2s ease-out" },
    },
  },
  plugins: [animate],
};

export default config;
