import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@cru/ui", "@cru/shared"],
  outputFileTracingRoot: resolve(__dirname, "../../"),
  typescript: {
    // Pre-existing TS errors from tables not yet in database.ts types.
    // Remove once `supabase gen types` is run and types are updated.
    ignoreBuildErrors: true,
  },
  eslint: {
    // ESLint not yet configured for all files.
    // Remove once eslint setup is complete.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
