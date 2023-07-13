/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@xcpcio/types", "@xcpcio/core"],
};

module.exports = nextConfig;
