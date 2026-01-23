import { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  MessageSquare,
  FileText,
  Palette,
  Code2,
  TestTube,
  Rocket,
  HeadphonesIcon,
  CheckCircle,
  Clock,
  Users,
  Shield,
  Zap,
  Phone,
} from "lucide-react";
import { BreadcrumbSchema } from "@/components/seo/StructuredData";

export const metadata: Metadata = {
  title: "Werkwijze | Hoe Wij Uw Website Bouwen | RoTech Development",
  description:
    "Ontdek hoe RoTech Development uw website bouwt. Van kennismaking tot lancering in 6 stappen. ✓ Persoonlijk contact ✓ Transparant proces ✓ Snelle oplevering. Bekijk onze werkwijze.",
  keywords: [
    "website laten maken proces",
    "hoe werkt website ontwikkeling",
    "website bouwen stappen",
    "webdesign werkwijze",
    "website ontwikkeling proces",
    "website laten maken veldhoven",
    "webdesign eindhoven werkwijze",
  ],
  alternates: {
    canonical: "/werkwijze",
  },
};

const processSteps = [
  {
    step: 1,
    icon: MessageSquare,
    title: "Kennismakingsgesprek",
    subtitle: "Gratis en vrijblijvend",
    duration: "30-60 minuten",
    description:
      "We beginnen met een persoonlijk gesprek om uw wensen, doelen en uitdagingen te begrijpen. Dit kan telefonisch, via video call of persoonlijk in Veldhoven of bij u op locatie.",
    details: [
      "Wat is het doel van uw website?",
      "Wie is uw doelgroep?",
      "Welke functionaliteiten heeft u nodig?",
      "Heeft u al een huisstijl of logo?",
      "Wat is uw budget en planning?",
    ],
    outcome: "Na dit gesprek hebben we een helder beeld van uw project en kunnen we een passend voorstel maken.",
  },
  {
    step: 2,
    icon: FileText,
    title: "Voorstel & Offerte",
    subtitle: "Transparant en gedetailleerd",
    duration: "2-3 werkdagen",
    description:
      "Op basis van ons gesprek maken we een gedetailleerd voorstel met specificaties, tijdlijn en transparante prijzen. Geen verborgen kosten, geen verrassingen achteraf.",
    details: [
      "Gedetailleerde projectomschrijving",
      "Technische specificaties",
      "Ontwerp- en functionaliteitseisen",
      "Exacte prijsopgave (geen richtprijzen)",
      "Planning met mijlpalen",
    ],
    outcome: "U ontvangt een professionele offerte die u rustig kunt doornemen. Vragen? Die beantwoorden we graag.",
  },
  {
    step: 3,
    icon: Palette,
    title: "Ontwerp & Design",
    subtitle: "Uw visie visueel gemaakt",
    duration: "1-2 weken",
    description:
      "Na goedkeuring starten we met het ontwerp. U ontvangt visuele mockups van uw website voordat we gaan bouwen. Zo weet u precies wat u krijgt.",
    details: [
      "Wireframes (schematische opzet)",
      "Visueel ontwerp in uw huisstijl",
      "Mobiele versie design",
      "Interactieve prototype (optioneel)",
      "Maximaal 2 revisierondes inbegrepen",
    ],
    outcome: "U keurt het ontwerp goed voordat we beginnen met programmeren. Geen verrassingen.",
  },
  {
    step: 4,
    icon: Code2,
    title: "Ontwikkeling & Bouw",
    subtitle: "Uw website komt tot leven",
    duration: "2-4 weken",
    description:
      "Nu wordt het serieus: we bouwen uw website met de nieuwste technologieën. U krijgt regelmatig updates en kunt tussentijds meekijken op een test-omgeving.",
    details: [
      "Ontwikkeling met Next.js & React",
      "Responsive voor alle apparaten",
      "SEO-techniek ingebouwd",
      "Snelle laadtijden (< 2 sec)",
      "Wekelijkse voortgangsupdate",
    ],
    outcome: "Een volledig functionerende website op een test-omgeving die u kunt bekijken en testen.",
  },
  {
    step: 5,
    icon: TestTube,
    title: "Testen & Optimaliseren",
    subtitle: "Kwaliteitscontrole",
    duration: "3-5 dagen",
    description:
      "Voordat we live gaan, testen we alles uitgebreid. Werkt het contactformulier? Laadt de site snel genoeg? Is alles goed leesbaar op mobiel? We laten niets aan het toeval over.",
    details: [
      "Test op alle browsers (Chrome, Safari, Firefox, Edge)",
      "Test op mobiel, tablet en desktop",
      "Formulieren en functionaliteiten testen",
      "Snelheidsoptimalisatie",
      "SEO-check en laatste aanpassingen",
    ],
    outcome: "Een foutloze, snelle en professionele website klaar voor lancering.",
  },
  {
    step: 6,
    icon: Rocket,
    title: "Lancering & Go-Live",
    subtitle: "Het moment van de waarheid",
    duration: "1 dag",
    description:
      "De grote dag! We zetten uw website live, koppelen het domein en zorgen dat alles perfect werkt. U ontvangt een training zodat u zelf content kunt aanpassen.",
    details: [
      "Website live op uw domein",
      "SSL-certificaat (https) geïnstalleerd",
      "E-mail instellingen geconfigureerd",
      "Training voor zelfbeheer",
      "Aanmelding bij Google Search Console",
    ],
    outcome: "Uw nieuwe website is online en klaar om bezoekers te ontvangen!",
  },
];

const afterCareFeatures = [
  {
    icon: HeadphonesIcon,
    title: "30 Dagen Gratis Support",
    description: "Na lancering krijgt u 30 dagen gratis ondersteuning voor vragen en kleine aanpassingen.",
  },
  {
    icon: Shield,
    title: "Onderhoudspakketten",
    description: "Optioneel doorlopend onderhoud vanaf €99/maand voor updates, backups en support.",
  },
  {
    icon: Zap,
    title: "Snelle Responstijd",
    description: "Problemen? We reageren binnen 24 uur en lossen urgente issues direct op.",
  },
];

const guarantees = [
  { text: "Geen verborgen kosten", icon: CheckCircle },
  { text: "Vaste prijsafspraak", icon: CheckCircle },
  { text: "Persoonlijk contact met Bart", icon: Users },
  { text: "Snelle oplevering (2-4 weken)", icon: Clock },
  { text: "30 dagen gratis nazorg", icon: Shield },
  { text: "100% tevredenheidsgarantie", icon: CheckCircle },
];

export default function WerkwijzePage() {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "/" },
          { name: "Werkwijze", url: "/werkwijze" },
        ]}
      />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-20 lg:py-32">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center">
            <span className="inline-block px-4 py-1.5 bg-indigo-600/20 text-indigo-300 rounded-full text-sm font-medium mb-6">
              Onze Werkwijze
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Hoe Wij Uw Website Bouwen
            </h1>
            <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
              Van eerste gesprek tot lancering in 6 heldere stappen. 
              Transparant, persoonlijk en zonder verrassingen.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/offerte"
                className="btn-primary inline-flex items-center justify-center gap-2"
              >
                Start Uw Project
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/contact"
                className="btn-secondary inline-flex items-center justify-center gap-2"
              >
                <Phone className="w-5 h-5" />
                Bel: 06-57235574
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Guarantees Bar */}
      <section className="bg-white border-b border-slate-200 py-6">
        <div className="container-custom">
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-4">
            {guarantees.map((item, index) => (
              <div key={index} className="flex items-center gap-2 text-slate-700">
                <item.icon className="w-5 h-5 text-emerald-500" />
                <span className="text-sm font-medium">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Steps */}
      <section className="section-padding bg-gradient-to-b from-slate-50 to-white">
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Van Idee tot Lancering in 6 Stappen
            </h2>
            <p className="text-lg text-slate-600">
              Elk project doorloopt dezelfde bewezen stappen. Zo weet u precies wat u kunt verwachten.
            </p>
          </div>

          <div className="max-w-5xl mx-auto space-y-8">
            {processSteps.map((item, index) => {
              const IconComponent = item.icon;
              const isEven = index % 2 === 0;

              return (
                <div
                  key={item.step}
                  className={`relative flex flex-col lg:flex-row gap-8 items-start ${
                    isEven ? "" : "lg:flex-row-reverse"
                  }`}
                >
                  {/* Step Card */}
                  <div className="flex-1 bg-white rounded-2xl p-8 shadow-lg border border-slate-200 hover:border-indigo-200 hover:shadow-xl transition-all">
                    {/* Header */}
                    <div className="flex items-start gap-4 mb-6">
                      <div className="w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center shrink-0">
                        <IconComponent className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                            Stap {item.step}
                          </span>
                          <span className="text-sm text-slate-500 flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {item.duration}
                          </span>
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900">{item.title}</h3>
                        <p className="text-indigo-600 font-medium">{item.subtitle}</p>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-slate-600 mb-6 leading-relaxed">{item.description}</p>

                    {/* Details */}
                    <div className="bg-slate-50 rounded-xl p-5 mb-6">
                      <h4 className="font-semibold text-slate-900 mb-3">Wat gebeurt er?</h4>
                      <ul className="space-y-2">
                        {item.details.map((detail, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                            <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                            {detail}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Outcome */}
                    <div className="flex items-start gap-3 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                      <Rocket className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-emerald-800">Resultaat: </span>
                        <span className="text-emerald-700">{item.outcome}</span>
                      </div>
                    </div>
                  </div>

                  {/* Step Number (Large) - Hidden on mobile */}
                  <div className="hidden lg:flex items-center justify-center w-24 shrink-0">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-4xl font-bold text-white shadow-lg shadow-indigo-500/30">
                      {item.step}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* After Care Section */}
      <section className="section-padding bg-slate-900 text-white">
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Na de Lancering: Wij Blijven voor U Klaarstaan
            </h2>
            <p className="text-lg text-slate-300">
              Een website bouwen is pas het begin. Ook daarna kunt u op ons rekenen.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {afterCareFeatures.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-4">
                    <IconComponent className="w-8 h-8 text-indigo-400" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-slate-400">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ Teaser */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-8 text-center">
              Veelgestelde Vragen over Onze Werkwijze
            </h2>

            <div className="space-y-4">
              {[
                {
                  q: "Hoe lang duurt het voordat mijn website klaar is?",
                  a: "Dit hangt af van de complexiteit. Een eenvoudige website is binnen 2-3 weken klaar, een uitgebreide website of webshop binnen 4-6 weken. We geven altijd een realistische planning in onze offerte.",
                },
                {
                  q: "Moet ik zelf teksten en foto's aanleveren?",
                  a: "Ja, content die specifiek over uw bedrijf gaat levert u aan. Wij kunnen helpen met het schrijven van SEO-teksten (optioneel) en hebben toegang tot professionele stockfoto's.",
                },
                {
                  q: "Kan ik tussentijds aanpassingen doen?",
                  a: "Absoluut! We werken met feedbackrondes zodat u altijd kunt bijsturen. Kleine aanpassingen zijn inbegrepen, grote wijzigingen bespreken we eerst.",
                },
                {
                  q: "Wat als ik niet tevreden ben?",
                  a: "We werken met tussenstappen en goedkeuringsmomenten, dus verrassingen zijn uitgesloten. Mocht u toch niet tevreden zijn, lossen we dat samen op. Uw tevredenheid is onze prioriteit.",
                },
              ].map((item, index) => (
                <div key={index} className="bg-slate-50 rounded-xl p-6">
                  <h3 className="font-bold text-slate-900 mb-2">{item.q}</h3>
                  <p className="text-slate-600">{item.a}</p>
                </div>
              ))}
            </div>

            <div className="text-center mt-8">
              <Link
                href="/veelgestelde-vragen"
                className="inline-flex items-center gap-2 text-indigo-600 font-medium hover:underline"
              >
                Bekijk alle veelgestelde vragen
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-gradient-to-r from-indigo-600 to-violet-600 text-white">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Klaar om te Beginnen?
            </h2>
            <p className="text-xl text-indigo-100 mb-8">
              Plan een gratis kennismakingsgesprek en ontdek hoe wij uw website tot leven brengen.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/offerte"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-indigo-600 rounded-xl font-bold hover:bg-indigo-50 transition-colors"
              >
                Gratis Offerte Aanvragen
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-white text-white rounded-xl font-bold hover:bg-white/10 transition-colors"
              >
                Contact Opnemen
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
