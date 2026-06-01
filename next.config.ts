import path from "node:path";
import type { NextConfig } from "next";

const isStaticExport = process.env.STATIC_EXPORT === "1";

const nextConfig: NextConfig = {
  ...(isStaticExport ? { output: "export" } : {}),
  outputFileTracingRoot: path.join(__dirname, ".."),
};

export default nextConfig;
