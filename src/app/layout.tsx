import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { ChatWidget } from "@/components/chat";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import DevelopmentBanner from "@/components/ui/DevelopmentBanner";
// Validate environment variables on startup
import "@/lib/env-validation";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://ro-techdevelopment.dev"),
  title: {
    default: "RoTech Development | Professionele Websites & Applicaties op Maat",
    template: "%s | RoTech Development",
  },
  description: "RoTech Development bouwt professionele websites, webshops en web applicaties op maat. ✓ Modern design ✓ SEO geoptimaliseerd ✓ Snelle oplevering. Vraag nu een vrijblijvende offerte aan!",
  keywords: [
    "website laten maken",
    "website laten maken veldhoven",
    "website laten maken eindhoven",
    "webshop laten maken",
    "web developer",
    "website bouwer",
    "professionele website",
    "website op maat",
    "web applicatie",
    "web development",
    "SEO optimalisatie",
    "webdesign eindhoven",
    "webdesign veldhoven",
    "website kosten",
    "bedrijfswebsite laten maken",
  ],
  alternates: {
    canonical: "https://ro-techdevelopment.dev",
    languages: {
      "nl-NL": "https://ro-techdevelopment.dev",
    },
  },
  category: "technology",
  authors: [{ name: "RoTech Development" }],
  creator: "RoTech Development",
  publisher: "RoTech Development",
  formatDetection: {
    email: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "nl_NL",
    url: "https://ro-techdevelopment.dev",
    siteName: "RoTech Development",
    title: "RoTech Development | Professionele Websites & Applicaties op Maat",
    description: "RoTech Development bouwt professionele websites, webshops en web applicaties op maat. Vraag nu een vrijblijvende offerte aan!",
    // OG image wordt automatisch gegenereerd door opengraph-image.tsx
  },
  twitter: {
    card: "summary_large_image",
    title: "RoTech Development | Professionele Websites & Applicaties op Maat",
    description: "RoTech Development bouwt professionele websites, webshops en web applicaties op maat.",
    // Twitter image wordt automatisch gegenereerd door twitter-image.tsx
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // Voeg je Google Search Console verification code toe in .env.local:
    // NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=jouw-code
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
  icons: {
    icon: [
      { url: "/images/rotech/rotech-icon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/images/rotech/rotech-icon.svg", sizes: "180x180", type: "image/svg+xml" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl" className="scroll-smooth">
      <body
        className={`${spaceGrotesk.variable} ${inter.variable} antialiased bg-slate-50 text-slate-900`}
      >
        <ErrorBoundary>
          {/* 🚧 WERKZAAMHEDEN BANNER - Verwijder deze regel als de site klaar is */}
          <DevelopmentBanner />
          <Header />
          <main className="min-h-screen">{children}</main>
          <Footer />
          <ChatWidget />
        </ErrorBoundary>
      </body>
    </html>
  );
}
