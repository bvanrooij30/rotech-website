import { Metadata } from "next";
import Link from "next/link";
import { MapPin, ArrowRight, Phone } from "lucide-react";
import { BreadcrumbSchema } from "@/components/seo/StructuredData";

export const metadata: Metadata = {
  title: "Werkgebied | Website Laten Maken Regio Eindhoven | RoTech",
  description:
    "RoTech Development is actief in Veldhoven, Eindhoven en heel Noord-Brabant. Zoekt u een lokale webdesigner? Wij komen graag langs voor een kennismaking.",
  keywords: [
    "website laten maken regio eindhoven",
    "webdesign veldhoven",
    "webdesigner eindhoven",
    "website noord-brabant",
    "lokale webdesigner brabant",
  ],
  alternates: {
    canonical: "/regio",
  },
};

const regions = [
  {
    name: "Veldhoven",
    description: "Onze thuisbasis - direct persoonlijk contact mogelijk",
    distance: "0 km",
    link: "/regio/veldhoven",
    highlight: true,
  },
  {
    name: "Eindhoven",
    description: "Brainport regio - tech startups en corporate websites",
    distance: "5 km",
    link: "/regio/eindhoven",
    highlight: true,
  },
  {
    name: "Waalre",
    description: "Websites voor ondernemers in Waalre",
    distance: "3 km",
    link: "/regio/waalre",
    highlight: false,
  },
  {
    name: "Best",
    description: "Websites voor Best en de Kempen",
    distance: "10 km",
    link: "/regio/best",
    highlight: false,
  },
  {
    name: "Helmond",
    description: "Webdesign voor Helmond en omgeving",
    distance: "15 km",
    link: "/regio/helmond",
    highlight: false,
  },
  {
    name: "Noord-Brabant",
    description: "Heel de provincie - van Breda tot Den Bosch",
    distance: "Regionaal",
    link: "/regio/noord-brabant",
    highlight: true,
  },
];

export default function RegioPage() {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "/" },
          { name: "Werkgebied", url: "/regio" },
        ]}
      />

      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 text-white py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Ons Werkgebied
            </h1>
            <p className="text-xl text-slate-300 mb-8">
              RoTech Development is gevestigd in Veldhoven en actief in de hele regio
              Eindhoven en Noord-Brabant. Persoonlijk contact staat bij ons voorop.
            </p>
          </div>
        </div>
      </section>

      {/* Regions Grid */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {regions.map((region, index) => (
              <Link
                key={index}
                href={region.link}
                className={`block p-6 rounded-2xl transition-all hover:-translate-y-1 ${
                  region.highlight
                    ? "bg-gradient-to-br from-indigo-50 to-violet-50 border-2 border-indigo-200 hover:border-indigo-400"
                    : "bg-slate-50 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                      region.highlight ? "bg-indigo-600" : "bg-slate-200"
                    }`}
                  >
                    <MapPin
                      className={`w-6 h-6 ${
                        region.highlight ? "text-white" : "text-slate-600"
                      }`}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h2 className="text-xl font-bold text-slate-900">{region.name}</h2>
                      <span className="text-sm text-slate-500">{region.distance}</span>
                    </div>
                    <p className="text-slate-600 mb-3">{region.description}</p>
                    <span className="inline-flex items-center gap-1 text-indigo-600 font-medium text-sm">
                      Meer informatie
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Info */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-slate-900 mb-6">
              Bezoekadres
            </h2>
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <p className="text-lg text-slate-700 mb-4">
                <strong>RoTech Development</strong>
                <br />
                Kruisstraat 64
                <br />
                5502 JG Veldhoven
              </p>
              <p className="text-slate-600 mb-6">
                Wij ontvangen u graag voor een persoonlijk gesprek op locatie,
                of we komen naar u toe in de regio.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="tel:+31657235574"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                >
                  <Phone className="w-5 h-5" />
                  06-57 23 55 74
                </a>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-indigo-600 text-indigo-600 rounded-lg font-medium hover:bg-indigo-50 transition-colors"
                >
                  Contact Opnemen
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
