import path from "node:path";
import type { NextConfig } from "next";

const isStaticExport = process.env.STATIC_EXPORT === "1";
const githubPagesBasePath = "/english-reading-comprehesion";

const nextConfig: NextConfig = {
  ...(isStaticExport
    ? {
        output: "export",
        basePath: githubPagesBasePath,
        assetPrefix: githubPagesBasePath,
      }
    : {}),
  outputFileTracingRoot: path.join(__dirname, ".."),
};

export default nextConfig;
