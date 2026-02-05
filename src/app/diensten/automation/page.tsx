import { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Zap,
  Clock,
  TrendingUp,
  Shield,
  Users,
  ShoppingCart,
  FileText,
  MessageSquare,
  Bot,
  CheckCircle,
  Play,
  Cog,
  Rocket,
  Headphones,
  ChevronDown,
} from "lucide-react";
import { AutomationPricing } from "@/components/automation/AutomationPricing";
import { AutomationScanForm } from "@/components/automation/AutomationScanForm";
import { BreadcrumbSchema } from "@/components/seo/StructuredData";
import { oneTimeServices, automationCategories } from "@/data/automation-subscriptions";

export const metadata: Metadata = {
  title: "Automation Services | Bedrijfsprocessen Automatiseren | RoTech",
  description:
    "Automatiseer uw bedrijfsprocessen en bespaar uren per week. Van simpele workflows tot complexe AI-integraties. Gratis automation scan. Prijzen vanaf €99/maand.",
  keywords: [
    "automation",
    "automatisering",
    "workflow automation",
    "n8n",
    "bedrijfsprocessen automatiseren",
    "AI automation",
    "lead automation",
    "e-commerce automation",
    "MKB automatisering",
  ],
  alternates: {
    canonical: "/diensten/automation",
  },
  openGraph: {
    title: "Automation Services | RoTech Development",
    description:
      "Automatiseer uw bedrijfsprocessen en bespaar uren per week. Gratis automation scan.",
    url: "/diensten/automation",
  },
};

// FAQ Data
const faqItems = [
  {
    question: "Wat is workflow automation precies?",
    answer:
      "Workflow automation is het automatisch laten uitvoeren van repetitieve taken die normaal handmatig worden gedaan. Denk aan: leads automatisch in uw CRM zetten, facturen versturen na betaling, of social media posts plannen. Wij bouwen deze 'digitale werknemers' die 24/7 voor u werken.",
  },
  {
    question: "Welke systemen kunnen jullie koppelen?",
    answer:
      "Wij kunnen vrijwel alle populaire software koppelen: Google Workspace, Microsoft 365, HubSpot, Pipedrive, Shopify, WooCommerce, Mollie, Exact Online, Moneybird, Slack, Notion, en nog veel meer. Heeft u een specifiek systeem? Vraag het ons - vaak is een koppeling mogelijk via API.",
  },
  {
    question: "Hoe veilig is mijn data?",
    answer:
      "Uw data blijft altijd van u. Wij draaien op beveiligde servers in de EU, gebruiken encryptie voor alle verbindingen, en slaan alleen de minimaal benodigde gegevens op. Onze automation tool (n8n) is open-source en kan zelfs op uw eigen server draaien voor maximale controle.",
  },
  {
    question: "Wat als er iets misgaat met een workflow?",
    answer:
      "Alle workflows worden actief gemonitord. Bij een fout krijgen wij direct een melding en lossen we het probleem op - vaak voordat u het zelf merkt. Bij kritieke workflows bouwen we automatische fallbacks in. Ons Business en Professional plan bevatten proactieve monitoring.",
  },
  {
    question: "Kan ik mijn subscription upgraden of downgraden?",
    answer:
      "Ja, u kunt op elk moment upgraden. Downgraden kan aan het einde van uw huidige facturatieperiode. Bij upgraden wordt het verschil pro-rata berekend. Enterprise klanten hebben flexibele contractvoorwaarden.",
  },
  {
    question: "Hoeveel tijd bespaar ik gemiddeld?",
    answer:
      "Dit varieert per situatie, maar onze klanten besparen gemiddeld 5-15 uur per week aan handmatig werk. Bij een gratis automation scan analyseren we uw specifieke processen en geven we een realistische inschatting van de tijdsbesparing.",
  },
  {
    question: "Wat is het verschil tussen eenmalige en subscription diensten?",
    answer:
      "Eenmalige diensten zijn voor het bouwen van workflows - u betaalt eenmalig en bent eigenaar. Subscriptions voegen daar monitoring, onderhoud, support en maandelijkse aanpassingen aan toe. Voor kritieke bedrijfsprocessen raden we een subscription aan.",
  },
];

export default function AutomationPage() {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "/" },
          { name: "Diensten", url: "/diensten" },
          { name: "Automation", url: "/diensten/automation" },
        ]}
      />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-indigo-900 via-violet-900 to-purple-900 text-white py-20 lg:py-32 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern
                id="automationGrid"
                width="60"
                height="60"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 60 0 L 0 0 0 60"
                  fill="none"
                  stroke="white"
                  strokeWidth="1"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#automationGrid)" />
          </svg>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 right-10 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-40 h-40 bg-violet-500/20 rounded-full blur-3xl" />

        <div className="container-custom relative z-10">
          <div className="max-w-4xl">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-sm text-indigo-200 rounded-full text-sm font-medium mb-6">
              <Zap className="w-4 h-4" />
              Automation Services
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Automatiseer uw bedrijfsprocessen
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-violet-300">
                Bespaar uren per week
              </span>
            </h1>
            <p className="text-xl text-indigo-100 mb-8 max-w-2xl">
              Stop met repetitieve taken. Laat slimme workflows uw handmatige
              processen overnemen - 24/7, foutloos, en zonder vakantiedagen.
            </p>

            {/* Stats */}
            <div className="flex flex-wrap gap-8 mb-10">
              {[
                { value: "5-15u", label: "Besparing per week" },
                { value: "99%+", label: "Uptime garantie" },
                { value: "24u", label: "Support response" },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="text-3xl font-bold text-white">{stat.value}</div>
                  <div className="text-sm text-indigo-200">{stat.label}</div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="#scan-form"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-indigo-700 rounded-xl font-bold hover:bg-indigo-50 transition-colors shadow-xl shadow-indigo-500/25"
              >
                Gratis Automation Scan
                <ArrowRight className="w-5 h-5" />
              </a>
              <a
                href="#prijzen"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-white/30 text-white rounded-xl font-bold hover:bg-white/10 transition-colors"
              >
                Bekijk Prijzen
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* What is Automation */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Wat is Workflow Automation?
            </h2>
            <p className="text-lg text-slate-600">
              Workflow automation verbindt uw software systemen en laat taken
              automatisch uitvoeren. U bespaart tijd, voorkomt fouten, en kunt
              focussen op wat écht belangrijk is.
            </p>
          </div>

          {/* Visual Workflow Example */}
          <div className="bg-gradient-to-br from-slate-50 to-indigo-50 rounded-3xl p-8 md:p-12 mb-16">
            <h3 className="text-xl font-bold text-slate-900 text-center mb-8">
              Voorbeeld: Automatische Lead Processing
            </h3>
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-2">
              {[
                { icon: FileText, label: "Contactformulier", color: "from-blue-500 to-blue-600" },
                { icon: Zap, label: "Automation", color: "from-indigo-500 to-violet-500" },
                { icon: Users, label: "CRM Update", color: "from-emerald-500 to-emerald-600" },
                { icon: MessageSquare, label: "Slack Melding", color: "from-purple-500 to-purple-600" },
                { icon: FileText, label: "Welkomstmail", color: "from-orange-500 to-orange-600" },
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg`}
                    >
                      <step.icon className="w-8 h-8 text-white" />
                    </div>
                    <span className="text-sm font-medium text-slate-700 mt-2 text-center">
                      {step.label}
                    </span>
                  </div>
                  {i < 4 && (
                    <ArrowRight className="w-6 h-6 text-slate-300 hidden md:block" />
                  )}
                </div>
              ))}
            </div>
            <p className="text-center text-slate-600 mt-8 max-w-2xl mx-auto">
              Een lead vult uw contactformulier in → automatisch toegevoegd aan uw CRM →
              team krijgt Slack melding → lead ontvangt gepersonaliseerde welkomstmail.
              <strong className="text-slate-900"> Alles binnen 10 seconden.</strong>
            </p>
          </div>

          {/* Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Clock,
                title: "Bespaar Tijd",
                description:
                  "Automatiseer repetitieve taken en win 5-15 uur per week terug voor strategisch werk.",
              },
              {
                icon: Shield,
                title: "Minder Fouten",
                description:
                  "Computers maken geen typfouten. Consistente, foutloze uitvoering, elke keer.",
              },
              {
                icon: TrendingUp,
                title: "Schaalbaar",
                description:
                  "Of het nu 10 of 10.000 taken per dag zijn - uw workflows groeien mee zonder extra kosten.",
              },
            ].map((benefit) => (
              <div
                key={benefit.title}
                className="text-center p-6 rounded-2xl bg-slate-50"
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center mx-auto mb-4">
                  <benefit.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  {benefit.title}
                </h3>
                <p className="text-slate-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* One-Time Services */}
      <section className="section-padding bg-gradient-to-b from-slate-50 to-white">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Eenmalige Automation Diensten
            </h2>
            <p className="text-lg text-slate-600">
              Geen subscription nodig? Wij bouwen ook losse workflows op
              projectbasis.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {oneTimeServices.map((service) => (
              <div
                key={service.id}
                className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-500/10 transition-all"
              >
                <div
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mb-4 ${
                    service.complexity === "low"
                      ? "bg-emerald-100 text-emerald-700"
                      : service.complexity === "medium"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-rose-100 text-rose-700"
                  }`}
                >
                  {service.complexity === "low"
                    ? "Simpel"
                    : service.complexity === "medium"
                    ? "Medium"
                    : "Complex"}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  {service.name}
                </h3>
                <p className="text-slate-600 mb-4">{service.description}</p>

                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-2xl font-bold text-slate-900">
                    €{service.priceRange.min}
                  </span>
                  <span className="text-slate-500">-</span>
                  <span className="text-2xl font-bold text-slate-900">
                    €{service.priceRange.max}
                  </span>
                </div>

                <div className="text-sm text-slate-500 mb-6">
                  Doorlooptijd: {service.deliveryDays.min}-{service.deliveryDays.max}{" "}
                  dagen
                </div>

                <h4 className="text-sm font-medium text-slate-700 mb-3">
                  Voorbeelden:
                </h4>
                <ul className="space-y-2">
                  {service.examples.slice(0, 4).map((example, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-slate-600"
                    >
                      <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      {example}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/offerte"
              className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors"
            >
              Vraag een Offerte Aan
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Subscription Pricing */}
      <section id="prijzen" className="section-padding bg-white scroll-mt-20">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Automation Subscriptions
            </h2>
            <p className="text-lg text-slate-600">
              Inclusief monitoring, onderhoud, support en maandelijkse aanpassingen.
              Kies het plan dat bij uw bedrijf past.
            </p>
          </div>

          <AutomationPricing />
        </div>
      </section>

      {/* Use Cases */}
      <section className="section-padding bg-gradient-to-b from-slate-50 to-white">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Automation Use Cases
            </h2>
            <p className="text-lg text-slate-600">
              Ontdek hoe bedrijven zoals het uwe automation inzetten.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                icon: Users,
                title: "Lead Processing",
                description:
                  "Automatisch leads verzamelen, scoren, en opvolgen. Van formulier tot CRM tot gepersonaliseerde email sequences.",
                examples: [
                  "Website leads → HubSpot/Pipedrive",
                  "LinkedIn leads → automatische outreach",
                  "Lead scoring met AI",
                ],
              },
              {
                icon: ShoppingCart,
                title: "E-commerce Orders",
                description:
                  "Complete orderverwerking automatiseren: van betaling tot verzending tot boekhouding.",
                examples: [
                  "Shopify/WooCommerce → Mollie → Factuur",
                  "Voorraad synchronisatie",
                  "Automatische track & trace emails",
                ],
              },
              {
                icon: FileText,
                title: "Content Automation",
                description:
                  "Content creatie en distributie stroomlijnen. Blog posts automatisch delen op alle kanalen.",
                examples: [
                  "Blog → LinkedIn, X, Facebook posts",
                  "Video upload → transcriptie → samenvatting",
                  "Newsletter automation",
                ],
              },
              {
                icon: Bot,
                title: "AI Chatbots",
                description:
                  "Slimme chatbots die klantvragen beantwoorden en doorverwijzen wanneer nodig.",
                examples: [
                  "WhatsApp/Telegram bots",
                  "Website chat met AI",
                  "Support ticket automatisering",
                ],
              },
            ].map((useCase) => (
              <div
                key={useCase.title}
                className="bg-white rounded-2xl p-8 border border-slate-200"
              >
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shrink-0">
                    <useCase.icon className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">
                      {useCase.title}
                    </h3>
                    <p className="text-slate-600">{useCase.description}</p>
                  </div>
                </div>
                <ul className="space-y-2">
                  {useCase.examples.map((example, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-2 text-sm text-slate-600"
                    >
                      <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                      {example}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12 bg-white border-t border-slate-100">
        <div className="container-custom">
          <h3 className="text-lg font-medium text-slate-700 text-center mb-6">
            Automation Categorieën
          </h3>
          <div className="flex flex-wrap justify-center gap-3">
            {automationCategories.map((category) => (
              <span
                key={category.id}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-full text-sm font-medium"
              >
                {category.name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section-padding bg-gradient-to-br from-indigo-900 via-violet-900 to-purple-900 text-white">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Hoe Het Werkt</h2>
            <p className="text-lg text-indigo-200">
              Van eerste gesprek tot werkende automation in 5 stappen.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid gap-8">
              {[
                {
                  step: 1,
                  icon: Play,
                  title: "Intake Gesprek",
                  description:
                    "Gratis kennismaking waar we uw processen en wensen bespreken. Geen verplichtingen.",
                },
                {
                  step: 2,
                  icon: FileText,
                  title: "Automation Scan",
                  description:
                    "Wij analyseren uw huidige processen en identificeren automation mogelijkheden met geschatte ROI.",
                },
                {
                  step: 3,
                  icon: Cog,
                  title: "Development",
                  description:
                    "Wij bouwen uw workflows, inclusief uitgebreid testen met uw echte data en systemen.",
                },
                {
                  step: 4,
                  icon: Rocket,
                  title: "Go-Live",
                  description:
                    "Uw automations gaan live. Wij monitoren nauwlettend de eerste dagen voor optimale werking.",
                },
                {
                  step: 5,
                  icon: Headphones,
                  title: "Ongoing Support",
                  description:
                    "Continue monitoring, onderhoud bij API wijzigingen, en support wanneer u het nodig heeft.",
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className="flex items-start gap-6 bg-white/5 backdrop-blur-sm rounded-2xl p-6"
                >
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 text-xl font-bold shrink-0">
                    {item.step}
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <item.icon className="w-5 h-5 text-indigo-300" />
                      <h3 className="text-xl font-bold">{item.title}</h3>
                    </div>
                    <p className="text-indigo-100">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                Veelgestelde Vragen
              </h2>
              <p className="text-lg text-slate-600">
                Alles wat u wilt weten over onze automation services.
              </p>
            </div>

            <div className="space-y-4">
              {faqItems.map((item, index) => (
                <details
                  key={index}
                  className="group bg-slate-50 rounded-xl overflow-hidden"
                >
                  <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                    <span className="font-medium text-slate-900 pr-6">
                      {item.question}
                    </span>
                    <ChevronDown className="w-5 h-5 text-slate-400 transition-transform group-open:rotate-180" />
                  </summary>
                  <div className="px-6 pb-6 text-slate-600 leading-relaxed">
                    {item.answer}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA with Form */}
      <section
        id="scan-form"
        className="section-padding bg-gradient-to-b from-slate-50 to-white scroll-mt-20"
      >
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Left: Info */}
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
                Gratis Automation Scan
              </h2>
              <p className="text-lg text-slate-600 mb-8">
                Ontdek hoeveel tijd en geld u kunt besparen met automation. Wij
                analyseren uw processen en geven concrete aanbevelingen - geheel
                vrijblijvend.
              </p>

              <div className="space-y-4 mb-8">
                {[
                  "Analyse van uw huidige processen",
                  "Identificatie van automation mogelijkheden",
                  "Geschatte tijdsbesparing per proces",
                  "Concrete implementatie aanbevelingen",
                  "Indicatie van kosten en ROI",
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                    <span className="text-slate-700">{item}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-4 p-4 bg-indigo-50 rounded-xl">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">
                    Reactie binnen 24 uur
                  </p>
                  <p className="text-sm text-slate-600">
                    Wij nemen snel contact met u op
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Form */}
            <AutomationScanForm />
          </div>
        </div>
      </section>
    </>
  );
}
