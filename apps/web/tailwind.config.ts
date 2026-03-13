import type { Config } from "tailwindcss";
import baseConfig from "@cru/config/tailwind/base";
import tailwindAnimate from "tailwindcss-animate";

const config: Config = {
  ...baseConfig,
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      ...baseConfig.theme?.extend,
    },
  },
  plugins: [tailwindAnimate],
};

export default config;
