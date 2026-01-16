import { Metadata } from "next";
import Link from "next/link";
import { Check, ArrowRight, Star, Zap } from "lucide-react";
import { BreadcrumbSchema } from "@/components/seo/StructuredData";

export const metadata: Metadata = {
  title: "Prijzen | Website, Webshop & Web App Kosten",
  description: "Transparante prijzen voor websites, webshops en web applicaties. Ontdek onze pakketten en vraag een offerte op maat aan.",
  keywords: ["website prijzen", "webshop kosten", "wat kost een website", "website laten maken kosten"],
  alternates: {
    canonical: "/prijzen",
  },
};

const packages = [
  {
    name: "Starter Website",
    description: "Perfect voor ZZP'ers en starters",
    price: "Op maat",
    priceNote: "offerte",
    popular: false,
    features: [
      "Professionele one-page of kleine website",
      "Responsive design (mobiel-vriendelijk)",
      "Basis SEO optimalisatie",
      "Contactformulier",
      "Snelle oplevering",
      "Persoonlijke begeleiding",
    ],
    notIncluded: [],
    cta: "Offerte aanvragen",
    ctaLink: "/offerte",
  },
  {
    name: "Business Website",
    description: "Voor groeiende MKB bedrijven",
    price: "Op maat",
    priceNote: "offerte",
    popular: true,
    features: [
      "Uitgebreide bedrijfswebsite",
      "Premium responsive design",
      "Geavanceerde SEO optimalisatie",
      "CMS voor zelf aanpassen",
      "Blog functionaliteit",
      "Google Analytics integratie",
      "Snelle oplevering",
      "Persoonlijke begeleiding",
    ],
    notIncluded: [],
    cta: "Offerte aanvragen",
    ctaLink: "/offerte",
  },
  {
    name: "Webshop",
    description: "Complete e-commerce oplossing",
    price: "Op maat",
    priceNote: "offerte",
    popular: false,
    features: [
      "Professionele webshop",
      "iDEAL & online betalingen",
      "Voorraad & orderbeheer",
      "Automatische facturen",
      "Complete SEO optimalisatie",
      "Performance geoptimaliseerd",
      "Snelle oplevering",
      "Persoonlijke begeleiding",
    ],
    notIncluded: [],
    cta: "Offerte aanvragen",
    ctaLink: "/offerte",
  },
  {
    name: "Maatwerk",
    description: "Web applicaties & complexe projecten",
    price: "Op maat",
    priceNote: "offerte",
    popular: false,
    features: [
      "Custom web applicatie",
      "Complexe integraties & APIs",
      "Gebruikersbeheer & rollen",
      "Database op maat",
      "Schaalbare architectuur",
      "Uitgebreide testing",
      "Persoonlijke projectbegeleiding",
      "Doorlopend onderhoud optie",
    ],
    notIncluded: [],
    cta: "Neem contact op",
    ctaLink: "/contact",
  },
];

const addons = [
  { name: "Meertaligheid (NL/EN)", price: "Incl." },
  { name: "Extra talen", price: "Op aanvraag" },
  { name: "Blog module", price: "Incl." },
  { name: "Nieuwsbrief integratie", price: "Incl." },
  { name: "Boekhouding koppeling", price: "Op aanvraag" },
  { name: "CRM integratie", price: "Op aanvraag" },
];

const maintenancePackages = [
  {
    name: "Basis",
    price: "99",
    features: ["Maandelijkse updates", "Dagelijkse backups", "Uptime monitoring", "Email support"],
  },
  {
    name: "Business",
    price: "199",
    features: ["Alles van Basis", "2 uur content wijzigingen", "Priority support", "Maandelijkse rapportage"],
  },
  {
    name: "Premium",
    price: "399",
    features: ["Alles van Business", "5 uur content wijzigingen", "SEO optimalisatie", "Performance monitoring"],
  },
];

export default function PrijzenPage() {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "/" },
          { name: "Prijzen", url: "/prijzen" },
        ]}
      />

      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-20 lg:py-32">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <span className="inline-block px-4 py-1.5 bg-indigo-600/20 text-indigo-300 rounded-full text-sm font-medium mb-6">
              Transparante Prijzen
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Investeer in uw digitale toekomst
            </h1>
            <p className="text-xl text-slate-300">
              Elke website is uniek, daarom werken wij met prijzen op maat. 
              U betaalt voor waarde, niet voor uren. Vraag een vrijblijvende offerte aan.
            </p>
          </div>
        </div>
      </section>

      {/* Packages */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Onze pakketten
            </h2>
            <p className="text-lg text-slate-600">
              Kies het pakket dat past bij uw behoeften en budget.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {packages.map((pkg) => (
              <div
                key={pkg.name}
                className={`relative rounded-2xl border-2 ${
                  pkg.popular
                    ? "border-amber-500 shadow-xl shadow-amber-500/15"
                    : "border-slate-200"
                } bg-white overflow-hidden`}
              >
                {pkg.popular && (
                  <div className="absolute top-0 left-0 right-0 bg-amber-500 text-slate-900 text-center py-1 text-sm font-bold">
                    <Star className="w-4 h-4 inline mr-1" />
                    Populairste keuze
                  </div>
                )}

                <div className={`p-6 ${pkg.popular ? "pt-10" : ""}`}>
                  <h3 className="text-xl font-bold text-slate-900 mb-1">
                    {pkg.name}
                  </h3>
                  <p className="text-sm text-slate-500 mb-4">{pkg.description}</p>

                  <div className="mb-6">
                    <span className="text-2xl font-bold text-slate-900">Op maat</span>
                    <p className="text-sm text-slate-500 mt-1">Prijs op basis van uw wensen</p>
                  </div>

                  <Link
                    href={pkg.ctaLink}
                    className={`block text-center py-3 rounded-xl font-semibold transition-all mb-6 ${
                      pkg.popular
                        ? "btn-primary w-full"
                        : "btn-secondary w-full"
                    }`}
                  >
                    {pkg.cta}
                  </Link>

                  <ul className="space-y-3">
                    {pkg.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <Check className="w-5 h-5 text-emerald-500 shrink-0" />
                        <span className="text-slate-700">{feature}</span>
                      </li>
                    ))}
                    {pkg.notIncluded.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-400">
                        <span className="w-5 h-5 shrink-0 text-center">—</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          <p className="text-center text-slate-500 mt-8">
            * Prijzen worden bepaald op basis van uw specifieke wensen en projectomvang. Vraag een vrijblijvende offerte aan.
          </p>
        </div>
      </section>

      {/* Add-ons */}
      <section className="section-padding bg-slate-50">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">
                Extra opties
              </h2>
              <p className="text-lg text-slate-600">
                Breid uw pakket uit met aanvullende functionaliteit.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {addons.map((addon, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200"
                >
                  <span className="font-medium text-slate-900">{addon.name}</span>
                  <span className="text-indigo-600 font-semibold">{addon.price}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Maintenance */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium mb-4">
              <Zap className="w-4 h-4" />
              Onderhoud & Support
            </span>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Zorgeloos online met onderhoud
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Houd uw website veilig, snel en up-to-date met onze onderhoudspakketten.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {maintenancePackages.map((pkg) => (
              <div key={pkg.name} className="card">
                <h3 className="text-xl font-bold text-slate-900 mb-2">{pkg.name}</h3>
                <div className="mb-4">
                  <span className="text-3xl font-bold text-slate-900">€{pkg.price}</span>
                  <span className="text-slate-500">/maand</span>
                </div>
                <ul className="space-y-2">
                  {pkg.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
                      <Check className="w-4 h-4 text-emerald-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Teaser */}
      <section className="section-padding bg-slate-50">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Vragen over prijzen?
            </h2>
            <p className="text-lg text-slate-600 mb-8">
              Bekijk onze veelgestelde vragen of neem contact op voor persoonlijk advies.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/veelgestelde-vragen" className="btn-secondary inline-flex items-center justify-center gap-2">
                Bekijk FAQ
              </Link>
              <Link href="/offerte" className="btn-primary inline-flex items-center justify-center gap-2">
                Offerte op Maat
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
