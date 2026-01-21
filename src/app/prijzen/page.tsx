import { Metadata } from "next";
import Link from "next/link";
import { Check, ArrowRight, Star, Zap } from "lucide-react";
import { BreadcrumbSchema } from "@/components/seo/StructuredData";

export const metadata: Metadata = {
  title: "Prijzen | Website, Webshop & Web App - Op Basis van Uw Wensen",
  description: "Transparante prijzen voor websites, webshops en web applicaties. U kiest zelf welke functies u nodig heeft - de prijs past zich aan uw wensen aan.",
  keywords: ["website prijzen", "webshop kosten", "wat kost een website", "website laten maken kosten"],
  alternates: {
    canonical: "/prijzen",
  },
};

const packages = [
  {
    name: "Starter",
    subtitle: "One-page Website",
    description: "Ideaal voor ZZP'ers, freelancers en starters die professioneel online willen",
    popular: false,
    idealFor: "ZZP'ers, coaches, fotografen, consultants",
    deliverables: [
      "1-3 pagina's",
    ],
    features: [
      "Volledig responsive design",
      "Basis SEO optimalisatie",
      "Contactformulier met e-mail notificatie",
      "Snelle laadtijd (<2 sec)",
      "SSL certificaat (HTTPS)",
      "1 maand gratis support",
    ],
    notIncluded: [
      "CMS (zelf aanpassen)",
      "Blog functionaliteit",
      "Meertaligheid",
    ],
    cta: "Stel samen",
    ctaLink: "/offerte?pakket=starter",
  },
  {
    name: "Business",
    subtitle: "Professionele Website",
    description: "Complete bedrijfswebsite die klanten overtuigt en goed vindbaar is",
    popular: true,
    idealFor: "MKB, dienstverleners, lokale bedrijven",
    deliverables: [
      "5-10 pagina's",
    ],
    features: [
      "Alles van Starter, plus:",
      "Premium maatwerk design",
      "CMS - zelf content aanpassen",
      "Geavanceerde SEO (lokaal vindbaar)",
      "Blog/nieuws module",
      "Google Analytics & Search Console",
      "Social media integratie",
      "3 maanden gratis support",
    ],
    notIncluded: [
      "E-commerce functionaliteit",
      "Klantportaal met login",
    ],
    cta: "Stel samen",
    ctaLink: "/offerte?pakket=business",
  },
  {
    name: "Webshop",
    subtitle: "E-commerce Platform",
    description: "Verkoop online met een professionele webshop die converteert",
    popular: false,
    idealFor: "Retailers, merken, productverkoop",
    deliverables: [
      "Tot 100 producten",
    ],
    features: [
      "Alles van Business, plus:",
      "iDEAL, creditcard & PayPal",
      "Voorraad- en orderbeheer",
      "Automatische e-mails (bevestiging, verzending)",
      "Productfilters en zoekfunctie",
      "Koppeling met boekhouding mogelijk",
      "Performance geoptimaliseerd",
      "6 maanden gratis support",
    ],
    notIncluded: [
      "Maatwerk koppelingen",
      "Marketplace integraties",
    ],
    cta: "Stel samen",
    ctaLink: "/offerte?pakket=webshop",
  },
  {
    name: "Maatwerk",
    subtitle: "Op Maat Gebouwd",
    description: "Complexe web applicaties, portalen en integraties volledig op maat",
    popular: false,
    idealFor: "Scale-ups, SaaS, complexe bedrijfsprocessen",
    deliverables: [
      "Volledig op specificatie",
    ],
    features: [
      "Custom web applicatie",
      "API integraties (CRM, ERP, etc.)",
      "Gebruikersbeheer met rollen",
      "Database architectuur op maat",
      "Schaalbaar voor groei",
      "Uitgebreide documentatie",
      "Persoonlijke projectmanager",
      "SLA & doorlopend onderhoud mogelijk",
    ],
    notIncluded: [],
    cta: "Stel samen",
    ctaLink: "/offerte?pakket=maatwerk",
  },
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
              U Bepaalt De Prijs
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Prijs op basis van uw wensen
            </h1>
            <p className="text-xl text-slate-300">
              Geen vaste prijzen - u selecteert zelf welke functies u nodig heeft 
              en ziet direct wat uw project kost. Volledig transparant.
            </p>
          </div>
        </div>
      </section>

      {/* Packages */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Kies uw startpunt
            </h2>
            <p className="text-lg text-slate-600">
              Selecteer een pakket en bepaal daarna precies welke functies u nodig heeft.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {packages.map((pkg, index) => {
              const isPrimary = index % 2 === 0;
              
              return (
                <div
                  key={pkg.name}
                  className={`
                    relative rounded-2xl overflow-hidden transition-all duration-300 shadow-sm
                    ${pkg.popular
                      ? "bg-white border-2 border-emerald-400 hover:border-emerald-500 shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/25"
                      : "bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-500/10"
                    }
                    hover:-translate-y-1.5
                  `}
                >
                  {/* Corner accent */}
                  <div className={`
                    absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-40 pointer-events-none
                    ${pkg.popular
                      ? "bg-gradient-to-bl from-emerald-200 via-emerald-100/50 to-transparent"
                      : isPrimary
                        ? "bg-gradient-to-bl from-indigo-200 via-indigo-100/50 to-transparent"
                        : "bg-gradient-to-bl from-violet-200 via-violet-100/50 to-transparent"
                    }
                  `} />

                  {/* Bottom accent line */}
                  <div className={`
                    absolute bottom-0 left-0 right-0 h-1
                    ${pkg.popular
                      ? "bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-400"
                      : isPrimary
                        ? "bg-gradient-to-r from-indigo-400 via-violet-400 to-indigo-400"
                        : "bg-gradient-to-r from-violet-400 via-purple-400 to-violet-400"
                    }
                  `} />

                  {pkg.popular && (
                    <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-center py-1.5 text-sm font-bold">
                      <Star className="w-4 h-4 inline mr-1" />
                      Populairste keuze
                    </div>
                  )}

                  <div className={`relative z-10 p-6 ${pkg.popular ? "" : ""}`}>
                    <div className="mb-4">
                      <h3 className="text-xl font-bold text-slate-900">
                        {pkg.name}
                      </h3>
                      <p className="text-sm text-indigo-600 font-medium">{pkg.subtitle}</p>
                    </div>
                    
                    <p className="text-sm text-slate-600 mb-4 min-h-[40px]">{pkg.description}</p>

                    {/* Prijs indicator */}
                    <div className="mb-4 pb-4 border-b border-slate-100/50">
                      <div className={`rounded-xl p-4 ${pkg.popular ? "bg-emerald-50" : "bg-gradient-to-r from-indigo-50 to-violet-50"}`}>
                        <p className={`text-sm font-medium ${pkg.popular ? "text-emerald-700" : "text-indigo-700"}`}>
                          Prijs op basis van uw selectie
                        </p>
                        <p className={`text-xs mt-1 ${pkg.popular ? "text-emerald-600" : "text-indigo-500"}`}>
                          U kiest zelf welke functies u nodig heeft
                        </p>
                      </div>
                    </div>

                    {/* Ideaal voor */}
                    <div className="mb-4 p-3 bg-slate-50/80 rounded-lg">
                      <p className="text-xs text-slate-500 mb-1">Ideaal voor:</p>
                      <p className="text-sm font-medium text-slate-700">{pkg.idealFor}</p>
                    </div>

                    {/* Deliverables */}
                    <div className="mb-4 flex flex-wrap gap-2">
                      {pkg.deliverables.map((item, i) => (
                        <span key={i} className="text-xs px-2 py-1 bg-indigo-50 text-indigo-700 rounded-full font-medium">
                          {item}
                        </span>
                      ))}
                    </div>

                    <Link
                      href={pkg.ctaLink}
                      className={`block text-center py-3 rounded-xl font-semibold transition-all mb-6 ${
                        pkg.popular
                          ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 shadow-lg shadow-emerald-500/25"
                          : "btn-secondary w-full"
                      }`}
                    >
                      {pkg.cta}
                      <ArrowRight className="w-4 h-4 inline ml-2" />
                    </Link>

                    <ul className="space-y-2">
                      {pkg.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span className="text-slate-700">{feature}</span>
                        </li>
                      ))}
                      {pkg.notIncluded.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-400">
                          <span className="w-4 h-4 shrink-0 text-center mt-0.5">—</span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-12 p-6 bg-gradient-to-br from-indigo-50 to-violet-50 rounded-2xl max-w-3xl mx-auto border border-indigo-100">
            <div className="flex items-center gap-2 mb-3">
              <Check className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-slate-900">Hoe werkt het?</h3>
            </div>
            <ol className="text-sm text-slate-600 space-y-2">
              <li className="flex items-start gap-2">
                <span className="w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center shrink-0 text-xs font-bold">1</span>
                <span>Kies een pakket als startpunt</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center shrink-0 text-xs font-bold">2</span>
                <span>Selecteer de functies die u nodig heeft</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center shrink-0 text-xs font-bold">3</span>
                <span>Bekijk direct uw gepersonaliseerde prijs</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center shrink-0 text-xs font-bold">4</span>
                <span>Geef akkoord en wij starten met uw project</span>
              </li>
            </ol>
          </div>
        </div>
      </section>

      {/* Transparantie - Wat zit er WEL en NIET in */}
      <section className="section-padding bg-slate-50">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium mb-4">
                <Check className="w-4 h-4" />
                Volledige Transparantie
              </span>
              <h2 className="text-3xl font-bold text-slate-900 mb-4">
                Geen verborgen kosten
              </h2>
              <p className="text-lg text-slate-600">
                U ziet exact wat u betaalt voordat u akkoord geeft.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Altijd inbegrepen */}
              <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-200">
                <h3 className="text-xl font-bold text-emerald-800 mb-4 flex items-center gap-2">
                  <Check className="w-5 h-5" />
                  Altijd inbegrepen
                </h3>
                <ul className="space-y-3 text-slate-700">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-1" />
                    <span>Responsive design (mobiel, tablet, desktop)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-1" />
                    <span>SSL certificaat (HTTPS)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-1" />
                    <span>2 revisierondes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-1" />
                    <span>Gratis support na oplevering</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-1" />
                    <span>Volledige eigendom van de code</span>
                  </li>
                </ul>
              </div>

              {/* Niet standaard inbegrepen */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200">
                <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-500" />
                  Optioneel / apart
                </h3>
                <ul className="space-y-3 text-slate-700">
                  <li className="flex items-start gap-2">
                    <ArrowRight className="w-4 h-4 text-slate-400 shrink-0 mt-1" />
                    <span>Hosting (vanaf €10/maand of eigen hosting)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="w-4 h-4 text-slate-400 shrink-0 mt-1" />
                    <span>Domeinregistratie (€15-25/jaar)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="w-4 h-4 text-slate-400 shrink-0 mt-1" />
                    <span>Copywriting / content creatie</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="w-4 h-4 text-slate-400 shrink-0 mt-1" />
                    <span>Professionele fotografie</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="w-4 h-4 text-slate-400 shrink-0 mt-1" />
                    <span>Doorlopend onderhoud (optioneel abonnement)</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-8 p-4 bg-indigo-50 rounded-xl border border-indigo-100 text-center">
              <p className="text-slate-700">
                <strong>Meerwerk tarief:</strong> €75/uur voor extra werk buiten de scope. 
                Dit wordt altijd vooraf besproken en goedgekeurd.
              </p>
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
            {maintenancePackages.map((pkg, index) => {
              const isPrimary = index % 2 === 0;
              const isMiddle = index === 1;
              
              return (
                <div
                  key={pkg.name}
                  className={`
                    relative rounded-2xl p-6 overflow-hidden transition-all duration-300 shadow-sm
                    ${isMiddle
                      ? "bg-white border-2 border-emerald-300 hover:border-emerald-400 hover:shadow-xl hover:shadow-emerald-500/15"
                      : "bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-500/10"
                    }
                    hover:-translate-y-1.5
                  `}
                >
                  {/* Corner accent */}
                  <div className={`
                    absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-40 pointer-events-none
                    ${isMiddle
                      ? "bg-gradient-to-bl from-emerald-200 via-emerald-100/50 to-transparent"
                      : isPrimary
                        ? "bg-gradient-to-bl from-indigo-200 via-indigo-100/50 to-transparent"
                        : "bg-gradient-to-bl from-violet-200 via-violet-100/50 to-transparent"
                    }
                  `} />

                  {/* Bottom accent line */}
                  <div className={`
                    absolute bottom-0 left-0 right-0 h-1
                    ${isMiddle
                      ? "bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-400"
                      : isPrimary
                        ? "bg-gradient-to-r from-indigo-400 via-violet-400 to-indigo-400"
                        : "bg-gradient-to-r from-violet-400 via-purple-400 to-violet-400"
                    }
                  `} />

                  <div className="relative z-10">
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
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-gradient-to-br from-indigo-600 to-violet-600 text-white">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Klaar om uw project samen te stellen?
            </h2>
            <p className="text-xl text-indigo-100 mb-8">
              Selecteer uw functies en ontvang direct een prijs. Geen verrassingen.
            </p>
            <Link href="/offerte" className="inline-flex items-center gap-2 bg-white text-indigo-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-indigo-50 transition-colors">
              Start uw offerte
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
