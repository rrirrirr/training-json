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
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        sidebar: {
          DEFAULT: "var(--sidebar)",
          background: "var(--sidebar-background)",
          foreground: "var(--sidebar-foreground)",
          primary: {
            DEFAULT: "var(--sidebar-primary)",
            foreground: "var(--sidebar-primary-foreground)",
          },
          accent: {
            DEFAULT: "var(--sidebar-accent)",
            foreground: "var(--sidebar-accent-foreground)",
          },
          border: "var(--sidebar-border)",
          ring: "var(--sidebar-ring)",
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
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        "archivo-black": ["var(--font-archivo-black)", "sans-serif"],
        oswald: ["var(--font-oswald)", "sans-serif"],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

export default config
