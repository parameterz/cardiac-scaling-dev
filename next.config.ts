/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable static exports
  output: 'export',
  
  // Disable image optimization for static export
  images: {
    unoptimized: true,
  },
  
  // Set base path for GitHub Pages (if deploying to a subdirectory)
  // Uncomment and modify if your repo isn't at the root domain
  // basePath: '/your-repo-name',
  // assetPrefix: '/your-repo-name',
  
  // Ensure trailing slash for static hosting
  trailingSlash: true,
  
  // Disable server-side features
  experimental: {
    // Disable features that require server-side rendering
  },
  
  // Configure for static export
  distDir: 'out',
};

module.exports = nextConfig;