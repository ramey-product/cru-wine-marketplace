import type { Config } from "tailwindcss";
import baseConfig from "@cru/config/tailwind/base";

const config: Config = {
  ...baseConfig,
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
  plugins: [],
};

export default config;
