import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // MINT (Mind Innovation & Next Technology) brand palette
        mint: {
          50: "#ecfdf6",
          100: "#d1faec",
          200: "#a7f3da",
          300: "#6ee7bf",
          400: "#34d3aa",
          500: "#2ec4b6", // Primary
          600: "#20a99c",
          700: "#1b877e",
          800: "#1a6b65",
          900: "#175853",
        },
        offwhite: "#f8fafc",
        slateink: {
          DEFAULT: "#1e293b",
          soft: "#334155",
        },
      },
      boxShadow: {
        card: "0 1px 3px rgba(30, 41, 59, 0.08), 0 8px 24px rgba(30, 41, 59, 0.06)",
      },
      keyframes: {
        poyon: {
          "0%": { transform: "scale(1)" },
          "25%": { transform: "scale(1.4) rotate(-8deg)" },
          "45%": { transform: "scale(0.82) rotate(4deg)" },
          "65%": { transform: "scale(1.18) rotate(-3deg)" },
          "100%": { transform: "scale(1) rotate(0)" },
        },
        "float-up": {
          "0%": { opacity: "0.9", transform: "translate(-50%, 0) scale(0.5) rotate(0)" },
          "20%": { opacity: "1", transform: "translate(-50%, -12px) scale(1.1) rotate(-8deg)" },
          "100%": { opacity: "0", transform: "translate(-50%, -68px) scale(1.5) rotate(14deg)" },
        },
        "blob-drift": {
          "0%, 100%": { transform: "translate3d(0,0,0) scale(1)" },
          "50%": { transform: "translate3d(2%, -3%, 0) scale(1.06)" },
        },
      },
      animation: {
        poyon: "poyon 0.45s ease-in-out",
        "float-up": "float-up 0.9s ease-out forwards",
        "blob-drift": "blob-drift 14s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
