import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 1. Trigger a static HTML export for GitHub Pages
  output: 'export',

  // 2. Set the base path to match your repository name
  basePath: '/statusapi',

  // 3. Disable image optimization since GitHub Pages doesn't run a Node server to optimize images on the fly
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
