import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Nunito", "system-ui", "sans-serif"],
        serif: ["Crimson Pro", "Georgia", "serif"],
      },
      colors: {
        ink: "#1C1F26",
        navy: "#1A3050",
        // brand palette mirrors the HTML's CSS vars
        brand: {
          blue: "#2563EB",
          "blue-l": "#EFF6FF",
          "blue-m": "#BFDBFE",
          green: "#16A34A",
          "green-l": "#F0FDF4",
          amber: "#D97706",
          "amber-l": "#FFFBEB",
          "amber-m": "#FDE68A",
          red: "#DC2626",
          "red-l": "#FEF2F2",
          teal: "#0F766E",
          "teal-l": "#F0FDFA",
          purple: "#7C3AED",
          "purple-l": "#F5F3FF",
        },
        g: {
          50: "#F8F7F4",
          100: "#F1F0EC",
          200: "#E2E0D8",
          300: "#C8C5BA",
          400: "#9C9888",
          500: "#6B6760",
          600: "#4A4740",
        },
      },
      boxShadow: {
        soft: "0 1px 4px rgba(0,0,0,.07)",
        "soft-md": "0 4px 16px rgba(0,0,0,.09)",
      },
      borderRadius: { r: "12px" },
    },
  },
  plugins: [],
};

export default config;
