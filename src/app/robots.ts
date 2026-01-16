import { MetadataRoute } from "next";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ro-techdevelopment.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/admin/"],
      },
      // AI Crawlers - allow with some restrictions
      {
        userAgent: "GPTBot",
        allow: ["/", "/blog/", "/diensten/", "/veelgestelde-vragen"],
        disallow: ["/api/", "/admin/"],
      },
      {
        userAgent: "ChatGPT-User",
        allow: ["/", "/blog/", "/diensten/", "/veelgestelde-vragen"],
        disallow: ["/api/", "/admin/"],
      },
      {
        userAgent: "Claude-Web",
        allow: ["/", "/blog/", "/diensten/", "/veelgestelde-vragen"],
        disallow: ["/api/", "/admin/"],
      },
      {
        userAgent: "Anthropic-AI",
        allow: ["/", "/blog/", "/diensten/", "/veelgestelde-vragen"],
        disallow: ["/api/", "/admin/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
