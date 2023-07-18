/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: false,
  swcMinify: false,
  output: "export",
  images: {
    unoptimized: true,
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },
};
