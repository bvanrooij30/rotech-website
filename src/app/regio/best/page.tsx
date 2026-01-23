import { Metadata } from "next";
import Link from "next/link";
import { MapPin, Phone, Mail, CheckCircle, ArrowRight, Star } from "lucide-react";
import { BreadcrumbSchema } from "@/components/seo/StructuredData";

export const metadata: Metadata = {
  title: "Website Laten Maken Best | Lokale Webdesigner | RoTech",
  description:
    "Website laten maken in Best? RoTech Development is uw webdesigner in de regio. ✓ Persoonlijk contact ✓ Moderne websites ✓ Vanaf €997. Vraag gratis offerte aan!",
  keywords: [
    "website laten maken best",
    "webdesign best",
    "webdesigner best",
    "website bouwer best",
    "webshop best",
  ],
  alternates: {
    canonical: "/regio/best",
  },
};

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "RoTech Development - Website Laten Maken Best",
  image: "https://ro-techdevelopment.dev/images/rotech/rotech-logo.svg",
  url: "https://ro-techdevelopment.dev/regio/best",
  telephone: "+31657235574",
  email: "contact@ro-techdevelopment.dev",
  description: "Webdesigner voor Best en omgeving. Professionele websites en webshops voor lokale ondernemers.",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Kruisstraat 64",
    postalCode: "5502 JG",
    addressLocality: "Veldhoven",
    addressRegion: "Noord-Brabant",
    addressCountry: "NL",
  },
  areaServed: { "@type": "City", name: "Best" },
  priceRange: "€€-€€€",
};

export default function BestPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "/" },
          { name: "Regio", url: "/regio" },
          { name: "Best", url: "/regio/best" },
        ]}
      />

      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 text-white py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center gap-2 text-indigo-300 mb-4">
              <MapPin className="w-5 h-5" />
              <span className="text-sm font-medium">10 km van Best</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Website Laten Maken in{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">
                Best
              </span>
            </h1>
            <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
              Op zoek naar een webdesigner in Best? RoTech Development bouwt professionele websites
              voor ondernemers in Best en de Kempen.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/offerte" className="btn-primary inline-flex items-center justify-center gap-2 text-lg px-8 py-4">
                Gratis Offerte
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/contact" className="btn-secondary inline-flex items-center justify-center gap-2 text-lg px-8 py-4">
                <Phone className="w-5 h-5" />
                06-57235574
              </Link>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-6 mt-10 text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <span>Gratis kennismaking</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-400" />
                <span>5.0 beoordeling</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto prose prose-lg">
            <h2>Website Laten Maken in Best</h2>
            <p>
              Best is een dynamische gemeente met veel ondernemers en bedrijvigheid. Of u nu een
              lokale winkel heeft, een dienstverlener bent of een bedrijf op een van de
              bedrijventerreinen - een goede website is essentieel.
            </p>
            <h3>Waarom RoTech?</h3>
            <p>
              RoTech Development is gevestigd in Veldhoven, op slechts 10 minuten rijden van Best.
              U krijgt persoonlijk contact met uw developer, geen tussenlagen of account managers.
            </p>
            <h3>Website Pakketten</h3>
            <ul>
              <li><strong>Starter Website</strong> - Vanaf €997 voor ZZP'ers en starters</li>
              <li><strong>Business Website</strong> - Vanaf €2.497 voor gevestigde bedrijven</li>
              <li><strong>Webshop</strong> - Vanaf €3.997 met betaalintegraties</li>
              <li><strong>Maatwerk</strong> - Vanaf €7.500 voor complexe projecten</li>
            </ul>
            <p>
              <Link href="/offerte">Vraag een vrijblijvende offerte aan</Link> of bel:{" "}
              <a href="tel:+31657235574">06-57 23 55 74</a>
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-indigo-600 to-violet-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Website Nodig in Best?</h2>
          <p className="text-xl text-indigo-100 mb-8">Neem contact op voor een gratis gesprek.</p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <a href="tel:+31657235574" className="flex items-center gap-3">
              <Phone className="w-6 h-6" />
              <span className="text-xl font-bold">06-57 23 55 74</span>
            </a>
            <a href="mailto:contact@ro-techdevelopment.dev" className="flex items-center gap-3">
              <Mail className="w-6 h-6" />
              <span className="text-xl font-bold">contact@ro-techdevelopment.dev</span>
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
