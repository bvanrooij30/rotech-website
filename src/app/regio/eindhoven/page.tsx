import { Metadata } from "next";
import Link from "next/link";
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
  Globe,
} from "lucide-react";
import { BreadcrumbSchema } from "@/components/seo/StructuredData";

export const metadata: Metadata = {
  title: "Website Laten Maken Eindhoven | Webdesign Bureau | RoTech",
  description:
    "Professionele website laten maken in Eindhoven? RoTech Development uit Veldhoven bouwt moderne websites voor Eindhovense bedrijven. ✓ Persoonlijk ✓ Betaalbaar ✓ Snel. Vraag offerte aan!",
  keywords: [
    "website laten maken eindhoven",
    "webdesign eindhoven",
    "webdesigner eindhoven",
    "website bouwer eindhoven",
    "webshop laten maken eindhoven",
    "web development eindhoven",
    "website bureau eindhoven",
  ],
  alternates: {
    canonical: "/regio/eindhoven",
  },
  openGraph: {
    title: "Website Laten Maken Eindhoven | Professioneel Webdesign",
    description:
      "Zoekt u een betrouwbare webdesigner in Eindhoven? RoTech Development bouwt moderne websites en webshops voor ondernemers in de Brainport regio.",
    url: "/regio/eindhoven",
  },
};

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": "https://ro-techdevelopment.dev/#localbusiness-eindhoven",
  name: "RoTech Development - Website Laten Maken Eindhoven",
  image: "https://ro-techdevelopment.dev/images/rotech/rotech-logo.svg",
  url: "https://ro-techdevelopment.dev/regio/eindhoven",
  telephone: "+31657235574",
  email: "contact@ro-techdevelopment.dev",
  description:
    "Webdesign bureau voor Eindhoven en omgeving. Wij maken professionele websites, webshops en web applicaties voor MKB en ZZP'ers in de Brainport regio.",
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
  areaServed: {
    "@type": "City",
    name: "Eindhoven",
  },
  priceRange: "€€-€€€",
};

const eindhovenBenefits = [
  {
    icon: MapPin,
    title: "Dichtbij Eindhoven",
    description: "Gevestigd in Veldhoven, op 5 minuten van Eindhoven centrum",
  },
  {
    icon: Globe,
    title: "Brainport Expertise",
    description: "Ervaring met tech-bedrijven en startups in de Brainport regio",
  },
  {
    icon: Users,
    title: "Persoonlijke Aanpak",
    description: "Direct contact met uw developer, geen tussenlagen",
  },
  {
    icon: Zap,
    title: "Moderne Technologie",
    description: "Next.js, React en TypeScript - dezelfde tech als grote tech-bedrijven",
  },
];

const eindhovenServices = [
  {
    name: "Startup Website",
    description: "Voor Eindhovense startups en scale-ups",
    price: "Vanaf €997",
    features: ["Modern design", "Snelle laadtijd", "SEO geoptimaliseerd", "Responsive"],
  },
  {
    name: "Corporate Website",
    description: "Voor gevestigde bedrijven in Eindhoven",
    price: "Vanaf €2.497",
    features: ["Meerdere pagina's", "CMS systeem", "Blog/nieuws", "Geavanceerde SEO"],
  },
  {
    name: "E-commerce",
    description: "Online verkopen vanuit de Brainport regio",
    price: "Vanaf €3.997",
    features: ["Webshop functionaliteit", "Betaalkoppelingen", "Voorraadbeheer", "Klantaccounts"],
  },
  {
    name: "Web Applicatie",
    description: "Maatwerk software voor Eindhovense bedrijven",
    price: "Vanaf €7.500",
    features: ["Op maat gebouwd", "Database integratie", "API koppelingen", "Dashboard"],
  },
];

const eindhovenAreas = [
  "Eindhoven Centrum",
  "Strijp",
  "Woensel",
  "Stratum",
  "Gestel",
  "Tongelre",
  "High Tech Campus",
  "Strijp-S",
];

export default function EindhovenPage() {
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
          { name: "Eindhoven", url: "/regio/eindhoven" },
        ]}
      />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 text-white py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center gap-2 text-indigo-300 mb-4">
              <Building2 className="w-5 h-5" />
              <span className="text-sm font-medium">Brainport Regio Eindhoven</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Website Laten Maken in{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">
                Eindhoven
              </span>
            </h1>

            <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
              Professionele websites voor Eindhovense ondernemers. Van startup tot corporate -
              RoTech Development bouwt websites die resultaat leveren.
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
                <span>Gratis intake gesprek</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <span>Transparante prijzen</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-400" />
                <span>5.0 Google Reviews</span>
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
              Webdesign voor de Brainport Regio
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Eindhoven is de tech-hoofdstad van Nederland. Uw website moet dat uitstralen.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {eindhovenBenefits.map((benefit, index) => (
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
              Website Oplossingen voor Eindhoven
            </h2>
            <p className="text-lg text-slate-600">
              Van startup tot enterprise - wij hebben het juiste pakket
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {eindhovenServices.map((service, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow"
              >
                <h3 className="text-lg font-bold text-slate-900 mb-2">{service.name}</h3>
                <p className="text-sm text-slate-600 mb-4">{service.description}</p>
                <p className="text-xl font-bold text-indigo-600 mb-4">{service.price}</p>
                <ul className="space-y-2 mb-6">
                  {service.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-slate-700">
                      <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/offerte"
                  className="block text-center py-2 px-4 border-2 border-indigo-600 text-indigo-600 rounded-lg font-medium hover:bg-indigo-50 transition-colors"
                >
                  Meer Info
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
            <h2>Website Laten Maken in Eindhoven: Kwaliteit uit de Regio</h2>
            <p>
              Eindhoven staat bekend als de technologische hart van Nederland. Als ondernemer in de
              Brainport regio wilt u een website die past bij de innovatieve uitstraling van de
              stad. RoTech Development, gevestigd in nabijgelegen Veldhoven, bouwt moderne websites
              met de nieuwste technologieën.
            </p>

            <h3>Waarom een Lokale Webdesigner?</h3>
            <p>
              Het voordeel van een lokale webdesigner is persoonlijk contact. We kunnen afspreken in
              Eindhoven of Veldhoven om uw project te bespreken. Geen eindeloze video calls met
              bureaus uit Amsterdam of het buitenland - gewoon een kop koffie en een goed gesprek.
            </p>

            <h3>Ervaring met Eindhovense Bedrijven</h3>
            <p>
              Wij werken met diverse type bedrijven uit de regio Eindhoven:
            </p>
            <ul>
              <li>Tech startups op de High Tech Campus</li>
              <li>Creatieve bureaus in Strijp-S</li>
              <li>Retailers in het centrum</li>
              <li>Dienstverleners in de wijken</li>
              <li>MKB bedrijven op bedrijventerreinen</li>
            </ul>

            <h3>Gebieden in Eindhoven die wij bedienen</h3>
            <p>
              Wij helpen ondernemers in heel Eindhoven en omgeving, waaronder:
            </p>
            <div className="flex flex-wrap gap-2 not-prose">
              {eindhovenAreas.map((area, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm"
                >
                  {area}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 bg-gradient-to-r from-indigo-600 to-violet-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Website Nodig in Eindhoven?</h2>
          <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
            Laten we kennismaken! Plan een gratis en vrijblijvend gesprek in Eindhoven of Veldhoven.
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
