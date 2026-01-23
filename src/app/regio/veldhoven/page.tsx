import { Metadata } from "next";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  CheckCircle,
  ArrowRight,
  Star,
  Building2,
  Users,
  Zap,
} from "lucide-react";
import { BreadcrumbSchema, StructuredData } from "@/components/seo/StructuredData";

export const metadata: Metadata = {
  title: "Website Laten Maken Veldhoven | Lokale Webdesigner | RoTech",
  description:
    "Website laten maken in Veldhoven? RoTech Development is uw lokale webdesigner. ✓ Persoonlijk contact ✓ Moderne websites ✓ Vanaf €997. Vraag gratis offerte aan!",
  keywords: [
    "website laten maken veldhoven",
    "webdesign veldhoven",
    "webdesigner veldhoven",
    "website bouwer veldhoven",
    "website ontwikkeling veldhoven",
    "webshop veldhoven",
    "lokale webdesigner veldhoven",
  ],
  alternates: {
    canonical: "/regio/veldhoven",
  },
  openGraph: {
    title: "Website Laten Maken Veldhoven | Lokale Webdesigner",
    description:
      "Zoekt u een webdesigner in Veldhoven? RoTech Development bouwt professionele websites voor lokale ondernemers. Direct contact, geen tussenlagen.",
    url: "/regio/veldhoven",
  },
};

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": "https://ro-techdevelopment.dev/#localbusiness",
  name: "RoTech Development - Website Laten Maken Veldhoven",
  image: "https://ro-techdevelopment.dev/images/rotech/rotech-logo.svg",
  url: "https://ro-techdevelopment.dev/regio/veldhoven",
  telephone: "+31657235574",
  email: "contact@ro-techdevelopment.dev",
  description:
    "Lokale webdesigner in Veldhoven. Wij maken professionele websites, webshops en web applicaties voor MKB en ZZP'ers.",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Kruisstraat 64",
    postalCode: "5502 JG",
    addressLocality: "Veldhoven",
    addressRegion: "Noord-Brabant",
    addressCountry: "NL",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 51.4208,
    longitude: 5.4038,
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "09:00",
      closes: "17:30",
    },
  ],
  priceRange: "€€-€€€",
  areaServed: {
    "@type": "City",
    name: "Veldhoven",
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "5.0",
    reviewCount: "12",
  },
};

const benefits = [
  {
    icon: MapPin,
    title: "Lokaal Gevestigd",
    description: "Gevestigd in Veldhoven - persoonlijk overleg mogelijk",
  },
  {
    icon: Users,
    title: "Persoonlijk Contact",
    description: "Direct contact met de ontwikkelaar, geen tussenlagen",
  },
  {
    icon: Zap,
    title: "Snelle Oplevering",
    description: "Websites binnen 2-4 weken opgeleverd",
  },
  {
    icon: Building2,
    title: "Lokale Expertise",
    description: "Kennis van de Veldhovense markt en ondernemers",
  },
];

const services = [
  {
    name: "Starter Website",
    description: "Perfect voor ZZP'ers en starters in Veldhoven",
    price: "Vanaf €997",
    features: ["One-page website", "Mobiel-vriendelijk", "SEO basis", "Contactformulier"],
  },
  {
    name: "Business Website",
    description: "Voor MKB bedrijven in Veldhoven en omgeving",
    price: "Vanaf €2.497",
    features: ["Meerdere pagina's", "CMS systeem", "Geavanceerde SEO", "Blog module"],
  },
  {
    name: "Webshop",
    description: "Online verkopen vanuit Veldhoven",
    price: "Vanaf €3.997",
    features: ["iDEAL & Bancontact", "Voorraadbeheer", "Automatische emails", "Product filters"],
  },
];

const nearbyAreas = [
  { name: "Eindhoven", distance: "5 km", link: "/regio/eindhoven" },
  { name: "Waalre", distance: "3 km", link: "#" },
  { name: "Valkenswaard", distance: "8 km", link: "#" },
  { name: "Best", distance: "10 km", link: "#" },
];

export default function VeldhovenPage() {
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
          { name: "Veldhoven", url: "/regio/veldhoven" },
        ]}
      />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 text-white py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center gap-2 text-indigo-300 mb-4">
              <MapPin className="w-5 h-5" />
              <span className="text-sm font-medium">Gevestigd in Veldhoven</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Website Laten Maken in{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">
                Veldhoven
              </span>
            </h1>

            <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
              Zoekt u een betrouwbare webdesigner in Veldhoven? RoTech Development is uw lokale
              partner voor professionele websites, webshops en web applicaties.
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
                Bel Direct: 06-57235574
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap items-center justify-center gap-6 mt-10 text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <span>Gratis kennismaking</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <span>Geen verborgen kosten</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-400" />
                <span>5.0 beoordeling</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Waarom Kiezen voor een Lokale Webdesigner in Veldhoven?
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Als Veldhovense ondernemer begrijpen wij de lokale markt en wat uw klanten nodig
              hebben.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="text-center p-6 rounded-2xl bg-slate-50 hover:bg-indigo-50 transition-colors"
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

      {/* Services */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Website Pakketten voor Veldhoven
            </h2>
            <p className="text-lg text-slate-600">
              Kies het pakket dat past bij uw bedrijf in Veldhoven
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {services.map((service, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow"
              >
                <h3 className="text-xl font-bold text-slate-900 mb-2">{service.name}</h3>
                <p className="text-slate-600 mb-4">{service.description}</p>
                <p className="text-2xl font-bold text-indigo-600 mb-6">{service.price}</p>
                <ul className="space-y-2 mb-6">
                  {service.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-slate-700">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/offerte"
                  className="block text-center py-3 px-6 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                >
                  Offerte Aanvragen
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Local SEO Content */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto prose prose-lg">
            <h2>Website Laten Maken in Veldhoven: Uw Lokale Partner</h2>
            <p>
              Als u op zoek bent naar een professionele website in Veldhoven, bent u bij RoTech
              Development aan het juiste adres. Wij zijn gevestigd in het hart van Veldhoven en
              kennen de lokale ondernemersmarkt door en door.
            </p>

            <h3>Wat maakt ons anders?</h3>
            <p>
              Anders dan grote bureaus uit Eindhoven of Amsterdam, werkt u bij ons direct met de
              ontwikkelaar. Geen projectmanagers, geen account managers - gewoon een persoonlijk
              gesprek met de specialist die uw website daadwerkelijk bouwt.
            </p>

            <h3>Voor wie zijn onze diensten?</h3>
            <p>Wij helpen Veldhovense ondernemers in diverse branches:</p>
            <ul>
              <li>ZZP'ers en freelancers die professioneel online willen</li>
              <li>Lokale winkels die ook online willen verkopen</li>
              <li>Dienstverleners zoals advocaten, accountants en consultants</li>
              <li>Horecabedrijven met reserveringssystemen</li>
              <li>Bouwbedrijven en aannemers</li>
            </ul>

            <h3>Persoonlijk Overleg in Veldhoven</h3>
            <p>
              Wilt u uw website ideeën bespreken? We kunnen afspreken in Veldhoven voor een
              vrijblijvend kennismakingsgesprek. Bel{" "}
              <a href="tel:+31657235574">06-57 23 55 74</a> of mail naar{" "}
              <a href="mailto:contact@ro-techdevelopment.dev">contact@ro-techdevelopment.dev</a>.
            </p>
          </div>
        </div>
      </section>

      {/* Nearby Areas */}
      <section className="py-12 bg-slate-100">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">
            Ook Actief in de Regio
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            {nearbyAreas.map((area, index) => (
              <Link
                key={index}
                href={area.link}
                className="px-6 py-3 bg-white rounded-full shadow-sm hover:shadow-md transition-shadow flex items-center gap-2"
              >
                <MapPin className="w-4 h-4 text-indigo-600" />
                <span className="font-medium">{area.name}</span>
                <span className="text-sm text-slate-500">({area.distance})</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 bg-gradient-to-r from-indigo-600 to-violet-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Klaar om te Starten met Uw Website in Veldhoven?
          </h2>
          <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
            Neem vandaag nog contact op voor een gratis en vrijblijvend gesprek over uw website
            wensen.
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

          <div className="mt-8 flex items-center justify-center gap-2 text-indigo-200">
            <Clock className="w-5 h-5" />
            <span>Ma-Vr 09:00 - 17:30</span>
          </div>
        </div>
      </section>
    </>
  );
}
