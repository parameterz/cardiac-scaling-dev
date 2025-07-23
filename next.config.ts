/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable static exports
  output: "export",

  // Disable image optimization for static export
  images: {
    unoptimized: true,
  },

  // Set base path for GitHub Pages (if deploying to a subdirectory)
  basePath: "/cardiac-scaling-dev",
  assetPrefix: "/cardiac-scaling-dev",

  // Ensure trailing slash for static hosting
  trailingSlash: true,

  // Disable server-side features
  experimental: {
    // Disable features that require server-side rendering
  },

  // Configure for static export
  distDir: "out",
};

module.exports = nextConfig;
