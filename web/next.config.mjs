/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.carsensor.net" },
      { protocol: "https", hostname: "ccsrpcml.carsensor.net" },
      { protocol: "https", hostname: "img.carsensor.net" },
    ],
  },
};
export default nextConfig;
