import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Identité senedoc — extraite du logo
        teal: {
          DEFAULT: "#1D9E75",
          dark: "#0F6E56",
          deep: "#04342C",
          light: "#E1F5EE",
          mid: "#9FE1CB",
        },
        coral: {
          DEFAULT: "#D85A30",
          light: "#FAECE7",
          soft: "#F5C4B3",
        },
      },
      fontFamily: {
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
