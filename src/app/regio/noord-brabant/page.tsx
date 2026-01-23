import { Metadata } from "next";
import Link from "next/link";
import {
  MapPin,
  Phone,
  Mail,
  CheckCircle,
  ArrowRight,
  Star,
  Building2,
  Users,
  Zap,
  Map,
} from "lucide-react";
import { BreadcrumbSchema } from "@/components/seo/StructuredData";

export const metadata: Metadata = {
  title: "Website Laten Maken Noord-Brabant | Webdesign Brabant | RoTech",
  description:
    "Website laten maken in Noord-Brabant? RoTech Development is uw Brabantse webdesigner. ✓ Websites vanaf €997 ✓ Persoonlijke service ✓ Lokale expertise. Vraag offerte aan!",
  keywords: [
    "website laten maken noord-brabant",
    "webdesign brabant",
    "webdesigner noord-brabant",
    "website bouwer brabant",
    "webshop noord-brabant",
    "web development brabant",
    "website bureau brabant",
  ],
  alternates: {
    canonical: "/regio/noord-brabant",
  },
  openGraph: {
    title: "Website Laten Maken Noord-Brabant | Brabantse Webdesigner",
    description:
      "Zoekt u een webdesigner in Noord-Brabant? RoTech Development bouwt professionele websites voor Brabantse ondernemers.",
    url: "/regio/noord-brabant",
  },
};

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": "https://ro-techdevelopment.dev/#localbusiness-brabant",
  name: "RoTech Development - Website Laten Maken Noord-Brabant",
  image: "https://ro-techdevelopment.dev/images/rotech/rotech-logo.svg",
  url: "https://ro-techdevelopment.dev/regio/noord-brabant",
  telephone: "+31657235574",
  email: "contact@ro-techdevelopment.dev",
  description:
    "Brabantse webdesigner voor heel Noord-Brabant. Wij maken professionele websites, webshops en web applicaties voor MKB en ZZP'ers.",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Kruisstraat 64",
    postalCode: "5502 JG",
    addressLocality: "Veldhoven",
    addressRegion: "Noord-Brabant",
    addressCountry: "NL",
  },
  areaServed: {
    "@type": "State",
    name: "Noord-Brabant",
  },
  priceRange: "€€-€€€",
};

const brabantCities = [
  { name: "Eindhoven", link: "/regio/eindhoven" },
  { name: "Veldhoven", link: "/regio/veldhoven" },
  { name: "Tilburg", link: "#" },
  { name: "'s-Hertogenbosch", link: "#" },
  { name: "Breda", link: "#" },
  { name: "Helmond", link: "#" },
  { name: "Waalre", link: "#" },
  { name: "Best", link: "#" },
  { name: "Valkenswaard", link: "#" },
  { name: "Oirschot", link: "#" },
  { name: "Son en Breugel", link: "#" },
  { name: "Nuenen", link: "#" },
];

const brabantBenefits = [
  {
    icon: Map,
    title: "Heel Noord-Brabant",
    description: "Van Eindhoven tot Breda, van Tilburg tot Den Bosch",
  },
  {
    icon: Users,
    title: "Brabantse Mentaliteit",
    description: "Nuchter, direct en betrouwbaar - zoals het hoort",
  },
  {
    icon: Zap,
    title: "Snelle Service",
    description: "Binnen 2-4 weken een professionele website",
  },
  {
    icon: Building2,
    title: "MKB Specialist",
    description: "Focus op kleine en middelgrote bedrijven in Brabant",
  },
];

export default function NoordBrabantPage() {
  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "/" },
          { name: "Regio", url: "/regio" },
          { name: "Noord-Brabant", url: "/regio/noord-brabant" },
        ]}
      />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 text-white py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center gap-2 text-indigo-300 mb-4">
              <Map className="w-5 h-5" />
              <span className="text-sm font-medium">Actief in heel Noord-Brabant</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Website Laten Maken in{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">
                Noord-Brabant
              </span>
            </h1>

            <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
              RoTech Development is uw Brabantse partner voor professionele websites. Lokale
              service met expertise die past bij de no-nonsense mentaliteit van Brabant.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/offerte"
                className="btn-primary inline-flex items-center justify-center gap-2 text-lg px-8 py-4"
              >
                Gratis Offerte Aanvragen
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/contact"
                className="btn-secondary inline-flex items-center justify-center gap-2 text-lg px-8 py-4"
              >
                <Phone className="w-5 h-5" />
                Bel: 06-57235574
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap items-center justify-center gap-6 mt-10 text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <span>Gratis kennismakingsgesprek</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-400" />
                <span>100% tevreden klanten</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cities Grid */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Actief in Heel Noord-Brabant en Omstreken
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Wij helpen ondernemers in alle steden en gemeenten van Noord-Brabant en daarbuiten
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 max-w-4xl mx-auto">
            {brabantCities.map((city, index) => (
              <Link
                key={index}
                href={city.link}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-50 hover:bg-indigo-50 rounded-xl transition-colors text-center"
              >
                <MapPin className="w-4 h-4 text-indigo-600 shrink-0" />
                <span className="font-medium text-slate-700">{city.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Waarom RoTech voor Noord-Brabant?
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {brabantBenefits.map((benefit, index) => (
              <div
                key={index}
                className="text-center p-6 rounded-2xl bg-white shadow-lg"
              >
                <div className="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <benefit.icon className="w-7 h-7 text-indigo-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{benefit.title}</h3>
                <p className="text-slate-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Local SEO Content */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto prose prose-lg">
            <h2>Website Laten Maken in Noord-Brabant: Lokale Expertise</h2>
            <p>
              Noord-Brabant is de provincie van gezelligheid, innovatie en ondernemerschap. Van de
              Brainport regio rond Eindhoven tot de bruisende steden Tilburg, Breda en Den Bosch -
              overal zijn Brabantse ondernemers actief. RoTech Development helpt deze ondernemers
              met professionele websites.
            </p>

            <h3>Websites voor Brabantse Ondernemers</h3>
            <p>
              Wij begrijpen de Brabantse ondernemer. Geen poespas, gewoon een goede website die
              werkt. Direct contact, eerlijke prijzen en resultaat. Dat is waar wij voor staan.
            </p>

            <h3>Regio's die wij bedienen</h3>
            <ul>
              <li>
                <strong>Regio Eindhoven:</strong> Eindhoven, Veldhoven, Waalre, Best, Son en Breugel
              </li>
              <li>
                <strong>Regio Tilburg:</strong> Tilburg, Oisterwijk, Goirle, Hilvarenbeek
              </li>
              <li>
                <strong>Regio Den Bosch:</strong> 's-Hertogenbosch, Vught, Boxtel, Schijndel
              </li>
              <li>
                <strong>Regio Breda:</strong> Breda, Oosterhout, Etten-Leur, Roosendaal
              </li>
              <li>
                <strong>Regio Helmond:</strong> Helmond, Gemert, Deurne, Asten
              </li>
            </ul>

            <h3>Persoonlijk Contact door Heel Brabant</h3>
            <p>
              Hoewel wij gevestigd zijn in Veldhoven, komen we graag naar u toe voor een
              kennismakingsgesprek. Of u nu in Breda zit of in Oss - we nemen de tijd voor een
              persoonlijke ontmoeting.
            </p>

            <p>
              <strong>Contact:</strong> Bel{" "}
              <a href="tel:+31657235574">06-57 23 55 74</a> of mail naar{" "}
              <a href="mailto:contact@ro-techdevelopment.dev">contact@ro-techdevelopment.dev</a>
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Overview */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Eerlijke Brabantse Prijzen
            </h2>
            <p className="text-lg text-slate-600">
              Geen verborgen kosten - wat we afspreken is wat u betaalt
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
              <h3 className="text-xl font-bold text-slate-900 mb-2">Starter</h3>
              <p className="text-3xl font-bold text-indigo-600 mb-2">Vanaf €997</p>
              <p className="text-slate-600">One-page website voor ZZP'ers</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg text-center border-2 border-indigo-600">
              <h3 className="text-xl font-bold text-slate-900 mb-2">Business</h3>
              <p className="text-3xl font-bold text-indigo-600 mb-2">Vanaf €2.497</p>
              <p className="text-slate-600">Complete bedrijfswebsite</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
              <h3 className="text-xl font-bold text-slate-900 mb-2">Webshop</h3>
              <p className="text-3xl font-bold text-indigo-600 mb-2">Vanaf €3.997</p>
              <p className="text-slate-600">Online verkopen met iDEAL</p>
            </div>
          </div>

          <div className="text-center mt-8">
            <Link
              href="/prijzen"
              className="inline-flex items-center gap-2 text-indigo-600 font-medium hover:underline"
            >
              Bekijk alle prijzen
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 bg-gradient-to-r from-indigo-600 to-violet-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Klaar om te Starten?</h2>
          <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
            Plan een gratis kennismakingsgesprek - in Brabant of online.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <div className="flex items-center gap-3">
              <Phone className="w-6 h-6" />
              <a href="tel:+31657235574" className="text-xl font-bold hover:underline">
                06-57 23 55 74
              </a>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="w-6 h-6" />
              <a
                href="mailto:contact@ro-techdevelopment.dev"
                className="text-xl font-bold hover:underline"
              >
                contact@ro-techdevelopment.dev
              </a>
            </div>
          </div>

          <div className="mt-8">
            <Link
              href="/offerte"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-indigo-600 rounded-xl font-bold hover:bg-indigo-50 transition-colors"
            >
              Direct Offerte Aanvragen
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
