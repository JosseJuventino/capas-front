import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["refuerzo-mendoza.me"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "refuerzo-mendoza.me",
        port: "",
        pathname: "/apiv2/uploads/images/profile_images/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "8080",
        pathname: "/uploads/**",
      },
    ],
  },
};

export default nextConfig;
