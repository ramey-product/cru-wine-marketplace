import type { Config } from "tailwindcss";
import baseConfig from "@cru/config/tailwind/base";

const config: Config = {
  ...baseConfig,
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      ...baseConfig.theme?.extend,
    },
  },
  plugins: [],
};

export default config;
