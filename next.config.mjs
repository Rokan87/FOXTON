/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    output: "export",
    eslint: {
      ignoreDuringBuilds: true, // Ignorar ESLint durante el build
    },
  };
  
  export default nextConfig;
  