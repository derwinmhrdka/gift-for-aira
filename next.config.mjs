/** @type {import('next').NextConfig} */

function normalizeAdminMode(value) {
  const normalized = String(value ?? "FALSE")
    .trim()
    .toUpperCase();
  if (normalized === "TRUE" || normalized === "1" || normalized === "YES") {
    return "TRUE";
  }
  return "FALSE";
}

const nextConfig = {
  env: {
    NEXT_PUBLIC_ADMIN_MODE: normalizeAdminMode(process.env.ADMIN_MODE),
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "dl.airtable.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "v5.airtableusercontent.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "attachments.airtableusercontent.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
