import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Check, Clock, Euro, ArrowLeft } from "lucide-react";
import { services, getServiceBySlug, getAllServiceSlugs } from "@/data/services";
import { ServiceSchema, BreadcrumbSchema } from "@/components/seo/StructuredData";
import CTA from "@/components/sections/CTA";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllServiceSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const service = getServiceBySlug(slug);
  
  if (!service) {
    return {
      title: "Dienst niet gevonden",
    };
  }

  return {
    title: service.metaTitle,
    description: service.metaDescription,
    keywords: [service.title.toLowerCase(), ...service.features.slice(0, 5)],
    alternates: {
      canonical: `/diensten/${slug}`,
    },
    openGraph: {
      title: service.metaTitle,
      description: service.metaDescription,
      type: "website",
    },
  };
}

export default async function DienstDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const service = getServiceBySlug(slug);

  if (!service) {
    notFound();
  }

  const IconComponent = service.icon;
  const otherServices = services.filter((s) => s.slug !== slug).slice(0, 3);

  return (
    <>
      <ServiceSchema service={service} />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "/" },
          { name: "Diensten", url: "/diensten" },
          { name: service.title, url: `/diensten/${slug}` },
        ]}
      />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-16 lg:py-24">
        <div className="container-custom">
          {/* Back link */}
          <Link
            href="/diensten"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Alle diensten
          </Link>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="w-20 h-20 rounded-2xl gradient-bg flex items-center justify-center mb-8">
                <IconComponent className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                {service.title}
              </h1>
              <p className="text-xl text-slate-300 mb-8">
                {service.longDescription}
              </p>
              <div className="flex flex-wrap gap-6 mb-8">
                <div className="flex items-center gap-2">
                  <Euro className="w-5 h-5 text-indigo-400" />
                  <span className="font-bold text-white">Prijs op maat</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-indigo-400" />
                  <span className="font-bold text-white">{service.deliveryTime}</span>
                </div>
              </div>
              <Link href="/offerte" className="btn-primary inline-flex items-center gap-2">
                {service.cta}
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

            {/* Visual placeholder */}
            <div className="hidden lg:block">
              <div className="aspect-square bg-gradient-to-br from-indigo-600/20 to-violet-600/20 rounded-3xl flex items-center justify-center">
                <IconComponent className="w-48 h-48 text-white/20" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features & Benefits */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Features */}
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-8">
                Wat is inbegrepen?
              </h2>
              <div className="space-y-4">
                {service.features.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl"
                  >
                    <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-4 h-4 text-emerald-600" />
                    </div>
                    <span className="text-slate-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Benefits */}
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-8">
                Voordelen voor uw bedrijf
              </h2>
              <div className="space-y-6">
                {service.benefits.map((benefit, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4"
                  >
                    <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center shrink-0 text-white font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-slate-900 mb-2">
                        {benefit}
                      </h3>
                      <p className="text-slate-600">
                        {getBenefitDescription(benefit)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="section-padding bg-slate-50">
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Hoe werkt het?
            </h2>
            <p className="text-lg text-slate-600">
              Een overzicht van ons proces van eerste contact tot oplevering.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { step: 1, title: "Kennismaking", desc: "Vrijblijvend gesprek over uw wensen en mogelijkheden." },
              { step: 2, title: "Offerte", desc: "Duidelijke prijsopgave met specificaties op maat." },
              { step: 3, title: "Ontwikkeling", desc: "Wij bouwen uw project met regelmatige updates." },
              { step: 4, title: "Lancering", desc: "Testen, live zetten en overdracht met training." },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-16 h-16 rounded-full gradient-bg text-white text-2xl font-bold flex items-center justify-center mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-slate-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Other Services */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Bekijk ook onze andere diensten
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {otherServices.map((otherService) => {
              const OtherIcon = otherService.icon;
              return (
                <Link
                  key={otherService.slug}
                  href={`/diensten/${otherService.slug}`}
                  className="card group"
                >
                  <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <OtherIcon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">
                    {otherService.shortTitle}
                  </h3>
                  <p className="text-slate-600 text-sm mb-4">
                    {otherService.description}
                  </p>
                  <div className="text-sm text-indigo-600 font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                    Meer info <ArrowRight className="w-4 h-4" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <CTA />
    </>
  );
}

function getBenefitDescription(benefit: string): string {
  const descriptions: Record<string, string> = {
    "Meer online zichtbaarheid": "Word beter gevonden door potentiële klanten die actief zoeken naar uw diensten of producten.",
    "Professionele uitstraling": "Maak een sterke eerste indruk en bouw vertrouwen op bij bezoekers van uw website.",
    "24/7 bereikbaar voor klanten": "Uw website werkt altijd, ook buiten kantooruren. Klanten kunnen altijd informatie vinden.",
    "Hogere conversie": "Optimalisatie voor gebruikerservaring zorgt voor meer leads en verkopen.",
    "Direct online verkopen": "Start direct met verkopen aan klanten over heel Nederland en daarbuiten.",
    "Automatische orderverwerking": "Minder handmatig werk door geautomatiseerde processen en notificaties.",
    "Lagere operationele kosten": "Bespaar tijd en geld door efficiëntere bedrijfsprocessen.",
    "Schaalbaar platform": "Groei zonder zorgen - uw platform groeit mee met uw bedrijf.",
    "Processen automatiseren": "Elimineer repetitieve taken en focus op wat echt belangrijk is.",
    "Tijd besparen": "Besteed uw tijd aan kernactiviteiten in plaats van administratie.",
    "Data-gedreven beslissingen": "Krijg inzicht in uw data voor betere strategische beslissingen.",
    "Concurrentievoordeel": "Loop voorop met moderne technologie die uw concurrenten niet hebben.",
    "Direct contact met klanten": "Bereik uw klanten rechtstreeks via push notificaties en in-app berichten.",
    "Hogere klantloyaliteit": "Een app zorgt voor meer betrokkenheid en terugkerende klanten.",
    "Nieuwe inkomstenstromen": "Creëer nieuwe verdienmodellen via uw mobiele platform.",
    "Moderne uitstraling": "Laat zien dat uw bedrijf innovatief en toekomstgericht is.",
    "Meer organisch verkeer": "Trek meer bezoekers aan via zoekmachines zonder advertentiekosten.",
    "Hogere Google rankings": "Verschijn hoger in zoekresultaten voor relevante zoektermen.",
    "Betere ROI dan advertenties": "SEO levert langdurig resultaat op tegen lagere kosten dan betaalde ads.",
    "Langdurige resultaten": "Investering in SEO blijft jarenlang renderen.",
    "Altijd up-to-date": "Nooit meer zorgen over verouderde software of beveiligingslekken.",
    "Maximale beveiliging": "Continue monitoring en updates houden uw website veilig.",
    "Snelle laadtijden": "Optimale performance voor de beste gebruikerservaring en SEO.",
    "Gemoedsrust": "Focus op uw bedrijf, wij zorgen voor uw website.",
    "Uren per week besparen": "Automatiseer taken die nu handmatig gedaan worden.",
    "Minder fouten": "Geautomatiseerde processen maken geen menselijke fouten.",
    "Snellere processen": "Taken die uren duurden zijn nu in seconden afgerond.",
    "Meer focus op kernzaken": "Besteed tijd aan wat uw bedrijf echt vooruit helpt.",
    "Systemen verbinden": "Laat al uw software naadloos met elkaar communiceren.",
    "Data centraliseren": "Al uw informatie op één plek, altijd actueel.",
    "Handmatig werk elimineren": "Stop met kopiëren en plakken tussen systemen.",
    "Betere inzichten": "Combineer data uit verschillende bronnen voor complete analyses.",
  };
  return descriptions[benefit] || "Ontdek hoe dit uw bedrijf kan helpen groeien.";
}
