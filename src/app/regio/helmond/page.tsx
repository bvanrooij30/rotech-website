import { Metadata } from "next";
import Link from "next/link";
import { MapPin, Phone, Mail, CheckCircle, ArrowRight, Star, Building2 } from "lucide-react";
import { BreadcrumbSchema } from "@/components/seo/StructuredData";

export const metadata: Metadata = {
  title: "Website Laten Maken Helmond | Webdesign Bureau | RoTech",
  description:
    "Website laten maken in Helmond? RoTech Development bouwt professionele websites voor Helmondse bedrijven. ✓ Persoonlijk ✓ Betaalbaar ✓ Modern. Vraag offerte aan!",
  keywords: [
    "website laten maken helmond",
    "webdesign helmond",
    "webdesigner helmond",
    "website bouwer helmond",
    "webshop helmond",
    "web development helmond",
  ],
  alternates: {
    canonical: "/regio/helmond",
  },
};

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "RoTech Development - Website Laten Maken Helmond",
  image: "https://ro-techdevelopment.dev/images/rotech/rotech-logo.svg",
  url: "https://ro-techdevelopment.dev/regio/helmond",
  telephone: "+31657235574",
  email: "contact@ro-techdevelopment.dev",
  description: "Webdesign bureau voor Helmond en omgeving. Wij maken professionele websites en webshops voor MKB en ZZP'ers.",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Kruisstraat 64",
    postalCode: "5502 JG",
    addressLocality: "Veldhoven",
    addressRegion: "Noord-Brabant",
    addressCountry: "NL",
  },
  areaServed: { "@type": "City", name: "Helmond" },
  priceRange: "€€-€€€",
};

export default function HelmondPage() {
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
          { name: "Helmond", url: "/regio/helmond" },
        ]}
      />

      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 text-white py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center gap-2 text-indigo-300 mb-4">
              <Building2 className="w-5 h-5" />
              <span className="text-sm font-medium">Actief in Helmond en regio</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Website Laten Maken in{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">
                Helmond
              </span>
            </h1>
            <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
              Professionele websites voor Helmondse ondernemers. RoTech Development bouwt moderne
              websites die resultaat opleveren.
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
            <h2>Website Laten Maken in Helmond</h2>
            <p>
              Helmond is een stad vol ondernemerschap, van de textielindustrie van vroeger tot de
              moderne bedrijven van nu. Als ondernemer in Helmond wilt u een website die past bij
              de dynamiek van de stad.
            </p>
            <h3>Webdesign voor Helmond</h3>
            <p>
              RoTech Development bouwt websites die niet alleen mooi zijn, maar ook resultaat
              opleveren. Of u nu een starter bent of een gevestigd bedrijf - wij hebben de juiste
              oplossing.
            </p>
            <h3>Wat Wij Bieden</h3>
            <ul>
              <li><strong>Starter Website</strong> - Vanaf €1.295 voor ZZP'ers</li>
              <li><strong>Business Website</strong> - Vanaf €2.995 voor MKB</li>
              <li><strong>Webshop</strong> - Vanaf €4.995 met iDEAL en Bancontact</li>
              <li><strong>Web Applicatie</strong> - Vanaf €9.995 op maat</li>
            </ul>
            <h3>Regio Helmond</h3>
            <p>
              Wij bedienen ook ondernemers in de omliggende gemeenten: Deurne, Asten, Someren,
              Gemert-Bakel en Laarbeek.
            </p>
            <p>
              <Link href="/offerte">Vraag een gratis offerte aan</Link> of bel:{" "}
              <a href="tel:+31657235574">06-57 23 55 74</a>
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-indigo-600 to-violet-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Website Nodig in Helmond?</h2>
          <p className="text-xl text-indigo-100 mb-8">Neem vandaag nog contact op voor een vrijblijvend gesprek.</p>
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
