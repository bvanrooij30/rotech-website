import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/ui/WhatsAppButton";
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
    default: "Ro-Tech Development | Professionele Websites & Applicaties op Maat",
    template: "%s | Ro-Tech Development",
  },
  description: "Ro-Tech Development bouwt professionele websites, webshops en web applicaties op maat. ✓ Modern design ✓ SEO geoptimaliseerd ✓ Snelle oplevering. Vraag nu een vrijblijvende offerte aan!",
  keywords: [
    "website laten maken",
    "webshop laten maken",
    "web developer",
    "website bouwer",
    "professionele website",
    "website op maat",
    "web applicatie",
    "web development",
    "SEO optimalisatie",
  ],
  authors: [{ name: "Ro-Tech Development" }],
  creator: "Ro-Tech Development",
  publisher: "Ro-Tech Development",
  formatDetection: {
    email: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "nl_NL",
    url: "https://ro-techdevelopment.dev",
    siteName: "Ro-Tech Development",
    title: "Ro-Tech Development | Professionele Websites & Applicaties op Maat",
    description: "Ro-Tech Development bouwt professionele websites, webshops en web applicaties op maat. Vraag nu een vrijblijvende offerte aan!",
    images: [
      {
        url: "/images/og/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Ro-Tech Development - Professionele Websites & Applicaties",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ro-Tech Development | Professionele Websites & Applicaties op Maat",
    description: "Ro-Tech Development bouwt professionele websites, webshops en web applicaties op maat.",
    images: ["/images/og/og-image.jpg"],
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
    // google: "jouw-google-verification-code",
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
          {/* TODO: Verwijder DevelopmentBanner wanneer website volledig klaar is */}
          <DevelopmentBanner />
          <Header />
          <main className="min-h-screen">{children}</main>
          <Footer />
          <WhatsAppButton />
          <ChatWidget />
        </ErrorBoundary>
      </body>
    </html>
  );
}
