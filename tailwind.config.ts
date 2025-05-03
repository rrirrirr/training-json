// tailwind.config.ts
import type { Config } from "tailwindcss"
import colors from "tailwindcss/colors"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  safelist: [
    ...[
      "slate",
      "gray",
      "zinc",
      "neutral",
      "stone",
      "red",
      "orange",
      "amber",
      "yellow",
      "lime",
      "green",
      "emerald",
      "teal",
      "cyan",
      "sky",
      "blue",
      "indigo",
      "violet",
      "purple",
      "fuchsia",
      "pink",
      "rose",
    ].flatMap((color) =>
      ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900", "950"].map(
        (intensity) => `bg-${color}-${intensity}`
      )
    ),
    ...[
      "slate",
      "gray",
      "zinc",
      "neutral",
      "stone",
      "red",
      "orange",
      "amber",
      "yellow",
      "lime",
      "green",
      "emerald",
      "teal",
      "cyan",
      "sky",
      "blue",
      "indigo",
      "violet",
      "purple",
      "fuchsia",
      "pink",
      "rose",
    ].flatMap((color) =>
      ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900", "950"].map(
        (intensity) => `border-${color}-${intensity}`
      )
    ),
    ...[
      "slate",
      "gray",
      "zinc",
      "neutral",
      "stone",
      "red",
      "orange",
      "amber",
      "yellow",
      "lime",
      "green",
      "emerald",
      "teal",
      "cyan",
      "sky",
      "blue",
      "indigo",
      "violet",
      "purple",
      "fuchsia",
      "pink",
      "rose",
    ].flatMap((color) =>
      ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900", "950"].map(
        (intensity) => `text-${color}-${intensity}`
      )
    ),
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border) / <alpha-value>)",
        input: "hsl(var(--input) / <alpha-value>)",
        ring: "hsl(var(--ring) / <alpha-value>)",
        background: "hsl(var(--background) / <alpha-value>)",
        foreground: "hsl(var(--foreground) / <alpha-value>)",
        primary: {
          DEFAULT: "hsl(var(--primary) / <alpha-value>)",
          foreground: "hsl(var(--primary-foreground) / <alpha-value>)",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary) / <alpha-value>)",
          foreground: "hsl(var(--secondary-foreground) / <alpha-value>)",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "hsl(var(--muted) / <alpha-value>)",
          foreground: "hsl(var(--muted-foreground) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "hsl(var(--accent) / <alpha-value>)",
          foreground: "hsl(var(--accent-foreground) / <alpha-value>)",
        },
        popover: {
          DEFAULT: "hsl(var(--popover) / <alpha-value>)",
          foreground: "hsl(var(--popover-foreground) / <alpha-value>)",
        },
        card: {
          DEFAULT: "hsl(var(--card) / <alpha-value>)",
          foreground: "hsl(var(--card-foreground) / <alpha-value>)",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar) / <alpha-value>)",
          background: "hsl(var(--sidebar-background) / <alpha-value>)",
          foreground: "hsl(var(--sidebar-foreground) / <alpha-value>)",
          primary: {
            DEFAULT: "hsl(var(--sidebar-primary) / <alpha-value>)",
            foreground: "hsl(var(--sidebar-primary-foreground) / <alpha-value>)",
          },
          accent: {
            DEFAULT: "hsl(var(--sidebar-accent) / <alpha-value>)",
            foreground: "hsl(var(--sidebar-accent-foreground) / <alpha-value>)",
          },
          border: "hsl(var(--sidebar-border) / <alpha-value>)",
          ring: "hsl(var(--sidebar-ring) / <alpha-value>)",
        },
        "edit-mode": {
          bg: "hsl(var(--edit-mode-bg) / <alpha-value>)",
          border: "hsl(var(--edit-mode-border) / <alpha-value>)",
          text: "hsl(var(--edit-mode-text) / <alpha-value>)",
          "hover-bg": "hsl(var(--edit-mode-hover-bg) / <alpha-value>)",
          "hover-text": "hsl(var(--edit-mode-hover-text) / <alpha-value>)",
        },
        "view-mode": {
          bg: "hsl(var(--view-mode-bg) / <alpha-value>)",
          border: "hsl(var(--view-mode-border) / <alpha-value>)",
          text: "hsl(var(--view-mode-text) / <alpha-value>)",
          "hover-bg": "hsl(var(--view-mode-hover-bg) / <alpha-value>)",
          "hover-text": "hsl(var(--view-mode-hover-text) / <alpha-value>)",
        },
        slate: { 950: "#090e1a" },
        gray: { 950: "#0a0a0a" },
        zinc: { 950: "#0a0a0c" },
        neutral: { 950: "#0a0a0a" },
        stone: { 950: "#0c0a09" },
        red: { 950: "#1f0a0a" },
        orange: { 950: "#200f01" },
        amber: { 950: "#1d1101" },
        yellow: { 950: "#1a1503" },
        lime: { 950: "#0e1503" },
        green: { 950: "#06150b" },
        emerald: { 950: "#02160a" },
        teal: { 950: "#011616" },
        cyan: { 950: "#02181d" },
        sky: { 950: "#06172a" },
        blue: { 950: "#0f172a" },
        indigo: { 950: "#0f112c" },
        violet: { 950: "#160b2c" },
        purple: { 950: "#190c2c" },
        fuchsia: { 950: "#1d051e" },
        pink: { 950: "#200514" },
        rose: { 950: "#1f050d" },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      maxWidth: {
        "dialog-sm": "425px",
        "dialog-md": "600px",
        "dialog-lg": "800px",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        "archivo-black": ["var(--font-archivo-black)", "sans-serif"],
        oswald: ["var(--font-oswald)", "sans-serif"],
      },
      keyframes: {
        // Added keyframes here if not already present
        "blink-icon-colors": {
          // Renamed animation to match utility class
          "0%": { color: "#ff4500" },
          "33%": { color: "#ff8c00" },
          "66%": { color: "#ff4500" },
          "100%": { color: "hsl(var(--muted-foreground))" }, // Use variable
        },
      },
      animation: {
        // Added animation here if not already present
        "blink-icon-once": "blink-icon-colors 2s ease-in-out 1",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

export default config
