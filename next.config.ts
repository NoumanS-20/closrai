import type { NextConfig } from "next";

const isLocalWindows =
  process.platform === "win32" && process.env.VERCEL !== "1";

const nextConfig: NextConfig = {
  ...(isLocalWindows
    ? { distDir: "node_modules/.cache/next-build" }
    : {}),
};

export default nextConfig;
