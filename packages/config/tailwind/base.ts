import type { Config } from "tailwindcss";

const config: Partial<Config> = {
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fdf8f0",
          100: "#f9edd9",
          200: "#f2d9b0",
          300: "#e9bf7e",
          400: "#dea04d",
          500: "#d4862f",
          600: "#c06d24",
          700: "#a05420",
          800: "#824321",
          900: "#6a381e",
          950: "#3a1c0e",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
      },
    },
  },
};

export default config;
