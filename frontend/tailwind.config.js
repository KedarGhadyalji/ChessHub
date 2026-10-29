/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Semantic tokens — wired to CSS custom properties (see
        // index.css) so every theme variant (.theme-clubhouse,
        // .theme-slate, .theme-board-contrast, plus light/dark) just
        // swaps the variable values and every component using these
        // names re-colors automatically, with zero component changes.
        //
        // Using the hsl(var(--x) / <alpha-value>) pattern (rather
        // than hand-authoring plain CSS classes, which is what this
        // file used to do) is what makes Tailwind's opacity modifiers
        // actually work — bg-primary/10, bg-card/80, border-primary/20
        // etc. are used throughout this app, and none of them were
        // doing anything before this, since Tailwind can't generate
        // an opacity variant for a color name it doesn't know about.
        border: "hsl(var(--border) / <alpha-value>)",
        input: "hsl(var(--input) / <alpha-value>)",
        ring: "hsl(var(--ring) / <alpha-value>)",
        background: "hsl(var(--background) / <alpha-value>)",
        "background-subtle": "hsl(var(--background-subtle) / <alpha-value>)",
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

        // Chess-inspired palette
        board: {
          light: "var(--board-light)",
          dark: "var(--board-dark)",
        },
        chess: {
          50: "#fafaf7",
          100: "#f2f0e8",
          200: "#e3dfcc",
          300: "#cec8aa",
          400: "#b5ac84",
          500: "#9e9468",
          600: "#857a52",
          700: "#6b6143",
          800: "#59503a",
          900: "#4c4433",
          950: "#282418",
        },
        // Brand accent — deep teal
        brand: {
          50: "#edfcf7",
          100: "#d3f8ec",
          200: "#aaefd9",
          300: "#72e1c1",
          400: "#38cca3",
          500: "#15b18b",
          600: "#0a9073",
          700: "#09725d",
          800: "#0a5b4b",
          900: "#0a4b3f",
          950: "#042b25",
        },
        // Status
        success: "#15b18b",
        warning: "#f59e0b",
        danger: "#ef4444",
      },
      fontFamily: {
        sans: ["var(--font-body)", "Inter", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "Fira Code", "monospace"],
        chess: ["var(--font-display)", "Playfair Display", "Georgia", "serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
        "slide-down": "slideDown 0.2s ease-out",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        fadeIn: { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideDown: {
          "0%": { opacity: "0", transform: "translateY(-8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      boxShadow: {
        board: "0 4px 24px rgba(0,0,0,0.18)",
        card: "0 2px 8px rgba(0,0,0,0.08)",
        "card-hover": "0 8px 24px rgba(0,0,0,0.12)",
      },
    },
  },
  plugins: [],
};
