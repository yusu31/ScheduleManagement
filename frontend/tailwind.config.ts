import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "#5f8b8b",
          dark: "#4a7070",
          light: "#e8f2f2",
        },
        "app-bg": "#f2f5f4",
        "app-surface": "#ffffff",
        "app-text": "#2c3333",
        "app-sub": "#7a8a8a",
        "app-border": "#dde6e4",
      },
    },
  },
  plugins: [],
};
export default config;
