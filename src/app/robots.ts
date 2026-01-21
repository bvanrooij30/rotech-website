import { MetadataRoute } from "next";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ro-techdevelopment.dev";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/admin/", "/dashboard/"],
      },
      // AI Crawlers - explicitly allow content pages
      {
        userAgent: "GPTBot",
        allow: ["/", "/blog/", "/diensten/", "/veelgestelde-vragen", "/prijzen", "/projecten/", "/over-ons", "/llms.txt", "/llms-full.txt"],
        disallow: ["/api/", "/admin/", "/dashboard/", "/checkout", "/betaling/"],
      },
      {
        userAgent: "ChatGPT-User",
        allow: ["/", "/blog/", "/diensten/", "/veelgestelde-vragen", "/prijzen", "/projecten/", "/over-ons", "/llms.txt", "/llms-full.txt"],
        disallow: ["/api/", "/admin/", "/dashboard/", "/checkout", "/betaling/"],
      },
      {
        userAgent: "Claude-Web",
        allow: ["/", "/blog/", "/diensten/", "/veelgestelde-vragen", "/prijzen", "/projecten/", "/over-ons", "/llms.txt", "/llms-full.txt"],
        disallow: ["/api/", "/admin/", "/dashboard/", "/checkout", "/betaling/"],
      },
      {
        userAgent: "Anthropic-AI",
        allow: ["/", "/blog/", "/diensten/", "/veelgestelde-vragen", "/prijzen", "/projecten/", "/over-ons", "/llms.txt", "/llms-full.txt"],
        disallow: ["/api/", "/admin/", "/dashboard/", "/checkout", "/betaling/"],
      },
      {
        userAgent: "Google-Extended",
        allow: ["/", "/blog/", "/diensten/", "/veelgestelde-vragen", "/prijzen", "/projecten/", "/over-ons"],
        disallow: ["/api/", "/admin/", "/dashboard/", "/checkout", "/betaling/"],
      },
      {
        userAgent: "PerplexityBot",
        allow: ["/", "/blog/", "/diensten/", "/veelgestelde-vragen", "/prijzen", "/projecten/", "/over-ons", "/llms.txt", "/llms-full.txt"],
        disallow: ["/api/", "/admin/", "/dashboard/", "/checkout", "/betaling/"],
      },
      {
        userAgent: "Cohere-AI",
        allow: ["/", "/blog/", "/diensten/", "/veelgestelde-vragen", "/prijzen", "/projecten/", "/over-ons", "/llms.txt", "/llms-full.txt"],
        disallow: ["/api/", "/admin/", "/dashboard/", "/checkout", "/betaling/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
