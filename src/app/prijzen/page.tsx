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
    name: "Starter",
    subtitle: "One-page Website",
    description: "Ideaal voor ZZP'ers, freelancers en starters die professioneel online willen",
    price: "997",
    priceNote: "vanaf",
    popular: false,
    idealFor: "ZZP'ers, coaches, fotografen, consultants",
    deliverables: [
      "1-3 pagina's",
      "Oplevering: 1-2 weken",
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
    cta: "Start met Starter",
    ctaLink: "/offerte?pakket=starter",
  },
  {
    name: "Business",
    subtitle: "Professionele Website",
    description: "Complete bedrijfswebsite die klanten overtuigt en goed vindbaar is",
    price: "2.497",
    priceNote: "vanaf",
    popular: true,
    idealFor: "MKB, dienstverleners, lokale bedrijven",
    deliverables: [
      "5-10 pagina's",
      "Oplevering: 2-4 weken",
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
    cta: "Kies Business",
    ctaLink: "/offerte?pakket=business",
  },
  {
    name: "Webshop",
    subtitle: "E-commerce Platform",
    description: "Verkoop online met een professionele webshop die converteert",
    price: "3.997",
    priceNote: "vanaf",
    popular: false,
    idealFor: "Retailers, merken, productverkoop",
    deliverables: [
      "Tot 100 producten",
      "Oplevering: 3-5 weken",
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
    cta: "Start Webshop",
    ctaLink: "/offerte?pakket=webshop",
  },
  {
    name: "Maatwerk",
    subtitle: "Op Maat Gebouwd",
    description: "Complexe web applicaties, portalen en integraties volledig op maat",
    price: "7.500 - 30.000",
    priceNote: "indicatie",
    popular: false,
    idealFor: "Scale-ups, SaaS, complexe bedrijfsprocessen",
    deliverables: [
      "Volledig op specificatie",
      "Oplevering: in overleg",
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
    cta: "Gratis adviesgesprek",
    ctaLink: "/contact?type=maatwerk",
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
              Duidelijke startprijzen, geen verrassingen. Elke offerte is maatwerk 
              op basis van uw specifieke wensen - u weet vooraf precies waar u aan toe bent.
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
                    ? "border-emerald-500 shadow-xl shadow-emerald-500/20"
                    : "border-slate-200"
                } bg-white overflow-hidden`}
              >
                {pkg.popular && (
                  <div className="absolute top-0 left-0 right-0 bg-emerald-500 text-white text-center py-1 text-sm font-bold">
                    <Star className="w-4 h-4 inline mr-1" />
                    Populairste keuze
                  </div>
                )}

                <div className={`p-6 ${pkg.popular ? "pt-10" : ""}`}>
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-slate-900">
                      {pkg.name}
                    </h3>
                    <p className="text-sm text-indigo-600 font-medium">{pkg.subtitle}</p>
                  </div>
                  
                  <p className="text-sm text-slate-600 mb-4 min-h-[40px]">{pkg.description}</p>

                  {/* Prijs */}
                  <div className="mb-4 pb-4 border-b border-slate-100">
                    <div className="flex items-baseline gap-1">
                      <span className="text-sm text-slate-500">{pkg.priceNote}</span>
                      <span className="text-3xl font-bold text-slate-900">€{pkg.price}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">Exacte prijs na kennismaking</p>
                  </div>

                  {/* Ideaal voor */}
                  <div className="mb-4 p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-500 mb-1">Ideaal voor:</p>
                    <p className="text-sm font-medium text-slate-700">{pkg.idealFor}</p>
                  </div>

                  {/* Deliverables */}
                  <div className="mb-4 flex flex-wrap gap-2">
                    {pkg.deliverables.map((item, i) => (
                      <span key={i} className="text-xs px-2 py-1 bg-indigo-50 text-indigo-700 rounded-full">
                        {item}
                      </span>
                    ))}
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
            ))}
          </div>

          <div className="mt-12 p-6 bg-gradient-to-br from-emerald-50 to-white rounded-2xl max-w-3xl mx-auto border border-emerald-100">
            <div className="flex items-center gap-2 mb-3">
              <Check className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-slate-900">Hoe werken onze prijzen?</h3>
            </div>
            <ul className="text-sm text-slate-600 space-y-2">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>Vanaf-prijzen</strong> zijn startprijzen voor standaard projecten</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>Exacte prijs</strong> wordt bepaald na een vrijblijvend kennismakingsgesprek</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>Geen verrassingen</strong> - u ontvangt een gedetailleerde offerte vooraf</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>Betaling in termijnen</strong> - 50% vooraf, 50% bij oplevering</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Voorbeeldprojecten - Transparantie sectie */}
      <section className="section-padding bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <span className="inline-block px-4 py-1.5 bg-indigo-600/20 text-indigo-300 rounded-full text-sm font-medium mb-4">
                Prijsindicaties
              </span>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Wat kosten vergelijkbare projecten?
              </h2>
              <p className="text-lg text-slate-300">
                Om u een realistisch beeld te geven: dit zijn prijsranges van projecten die wij hebben gerealiseerd.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Eenvoudige projecten */}
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <h3 className="text-xl font-bold mb-4 text-indigo-300">Websites</h3>
                <ul className="space-y-4">
                  <li className="flex justify-between items-start border-b border-white/10 pb-3">
                    <div>
                      <p className="font-medium">One-page / Visitekaartje</p>
                      <p className="text-sm text-slate-400">1-3 pagina&apos;s, contactformulier, basis SEO</p>
                    </div>
                    <span className="text-emerald-400 font-bold whitespace-nowrap">€997 - €1.500</span>
                  </li>
                  <li className="flex justify-between items-start border-b border-white/10 pb-3">
                    <div>
                      <p className="font-medium">Bedrijfswebsite</p>
                      <p className="text-sm text-slate-400">5-10 pagina&apos;s, CMS, blog, geavanceerde SEO</p>
                    </div>
                    <span className="text-emerald-400 font-bold whitespace-nowrap">€2.497 - €4.000</span>
                  </li>
                  <li className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">Webshop</p>
                      <p className="text-sm text-slate-400">Tot 100 producten, betalingen, voorraadbeheer</p>
                    </div>
                    <span className="text-emerald-400 font-bold whitespace-nowrap">€3.997 - €7.000</span>
                  </li>
                </ul>
              </div>

              {/* Complexe projecten */}
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <h3 className="text-xl font-bold mb-4 text-violet-300">Maatwerk Applicaties</h3>
                <ul className="space-y-4">
                  <li className="flex justify-between items-start border-b border-white/10 pb-3">
                    <div>
                      <p className="font-medium">Eenvoudige web app</p>
                      <p className="text-sm text-slate-400">Login, dashboard, basis functionaliteit</p>
                    </div>
                    <span className="text-emerald-400 font-bold whitespace-nowrap">€7.500 - €12.000</span>
                  </li>
                  <li className="flex justify-between items-start border-b border-white/10 pb-3">
                    <div>
                      <p className="font-medium">Klantportaal + Admin</p>
                      <p className="text-sm text-slate-400">Gebruikersbeheer, bestellingen, API integraties</p>
                    </div>
                    <span className="text-emerald-400 font-bold whitespace-nowrap">€15.000 - €25.000</span>
                  </li>
                  <li className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">B2B Platform / SaaS</p>
                      <p className="text-sm text-slate-400">Volledig ecosysteem, meerdere integraties</p>
                    </div>
                    <span className="text-emerald-400 font-bold whitespace-nowrap">€25.000 - €50.000+</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Wat beïnvloedt de prijs */}
            <div className="mt-12 bg-amber-500/10 border border-amber-500/30 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-amber-300 mb-4">💡 Wat beïnvloedt de uiteindelijke prijs?</h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <ArrowRight className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>Aantal pagina&apos;s of schermen</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>Complexiteit van het design</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>Gebruikersrollen en permissies</span>
                  </li>
                </ul>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <ArrowRight className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>Integraties (CRM, boekhouding, API&apos;s)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>E-commerce functionaliteit</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>Meertaligheid en speciale eisen</span>
                  </li>
                </ul>
              </div>
              <p className="mt-4 text-slate-300 text-sm">
                Tijdens het gratis kennismakingsgesprek bespreken we uw wensen en krijgt u direct een realistische prijsindicatie.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Transparantie - Wat zit er WEL en NIET in */}
      <section className="section-padding bg-white">
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
                Wij communiceren altijd vooraf wat wel en niet in de prijs zit.
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
                    <span>Basis SEO optimalisatie</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-1" />
                    <span>Snelle laadtijd optimalisatie</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-1" />
                    <span>2 revisierondes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-1" />
                    <span>Gratis support na oplevering (duur afhankelijk van pakket)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-1" />
                    <span>Volledige eigendom van de code</span>
                  </li>
                </ul>
              </div>

              {/* Niet standaard inbegrepen */}
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-500" />
                  Extra / op aanvraag
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
                    <span>Extra pagina&apos;s boven pakketlimiet</span>
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
                  <li className="flex items-start gap-2">
                    <ArrowRight className="w-4 h-4 text-slate-400 shrink-0 mt-1" />
                    <span>Extra revisierondes (€75/ronde)</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-8 p-4 bg-indigo-50 rounded-xl border border-indigo-100 text-center">
              <p className="text-slate-700">
                <strong>Ons meerwerk-tarief:</strong> €75/uur voor extra werk buiten de scope. 
                Dit wordt altijd vooraf besproken en goedgekeurd.
              </p>
            </div>
          </div>
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
