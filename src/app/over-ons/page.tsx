import { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Code2, Rocket, Heart, Users, Zap, Target } from "lucide-react";
import { BreadcrumbSchema } from "@/components/seo/StructuredData";

export const metadata: Metadata = {
  title: "Over Ons | Wie is Ro-Tech Development?",
  description: "Leer Ro-Tech Development kennen. Persoonlijk, snelle en goede communicatie. Ontdek onze werkwijze en waarom wij de juiste partner zijn.",
  alternates: {
    canonical: "/over-ons",
  },
};

const values = [
  {
    icon: Heart,
    title: "Passie voor Kwaliteit",
    description: "Wij leveren alleen werk waar we trots op zijn. Geen haastwerk, geen shortcuts.",
  },
  {
    icon: Users,
    title: "Persoonlijk Contact",
    description: "U werkt direct met Bart, uw developer. Geen tussenlagen, snelle en goede communicatie.",
  },
  {
    icon: Zap,
    title: "Snelle Communicatie",
    description: "Vragen? U krijgt snel antwoord. Via WhatsApp, email of telefoon - altijd bereikbaar.",
  },
  {
    icon: Target,
    title: "Resultaatgericht",
    description: "Een mooie website is niet genoeg. Het moet resultaat opleveren voor uw bedrijf.",
  },
];

const processSteps = [
  {
    step: 1,
    title: "Kennismakingsgesprek",
    description: "We beginnen met een vrijblijvend gesprek om uw wensen, doelen en uitdagingen te begrijpen. Dit kan telefonisch, via video call of persoonlijk.",
  },
  {
    step: 2,
    title: "Voorstel & Planning",
    description: "Op basis van onze gesprekken maken we een gedetailleerd voorstel met tijdlijn, specificaties en transparante prijzen.",
  },
  {
    step: 3,
    title: "Design & Ontwikkeling",
    description: "We starten met het ontwerp en daarna de ontwikkeling. U krijgt regelmatig updates en tussentijdse previews om feedback te geven.",
  },
  {
    step: 4,
    title: "Testing & Optimalisatie",
    description: "Uitgebreid testen op alle apparaten en browsers. Performance optimalisatie en SEO checks voordat we live gaan.",
  },
  {
    step: 5,
    title: "Lancering & Overdracht",
    description: "Go-live! Inclusief training zodat u zelf aan de slag kunt. Plus 30 dagen gratis support na oplevering.",
  },
];

export default function OverOnsPage() {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "/" },
          { name: "Over Ons", url: "/over-ons" },
        ]}
      />

      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-20 lg:py-32">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block px-4 py-1.5 bg-indigo-600/20 text-indigo-300 rounded-full text-sm font-medium mb-6">
                Over Ro-Tech
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                Uw partner in digitale groei
              </h1>
              <p className="text-xl text-slate-300 mb-8">
                Ro-Tech Development helpt bedrijven groeien met professionele websites, 
                webshops en web applicaties. Persoonlijk, snelle communicatie en resultaatgericht.
              </p>
              <Link href="/contact" className="btn-primary inline-flex items-center gap-2">
                Neem Contact Op
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
            <div className="hidden lg:flex justify-center">
              <div className="w-80 h-80 rounded-full gradient-bg opacity-20 blur-3xl absolute" />
              <div className="relative w-64 h-64 rounded-2xl gradient-bg flex items-center justify-center">
                <Code2 className="w-32 h-32 text-white" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
              Het verhaal van Ro-Tech
            </h2>
            <div className="prose prose-lg text-slate-600">
              <p>
                Ro-Tech Development is opgericht door Bart van Rooij vanuit een passie voor technologie 
                en het helpen van bedrijven om online te groeien. Met jarenlange ervaring in web development 
                en software engineering weet ik precies wat er nodig is om een succesvol digitaal product 
                te bouwen. Bij Ro-Tech staat persoonlijk contact centraal - u werkt altijd direct met mij.
              </p>
              <p>
                Wij geloven dat elk bedrijf, groot of klein, toegang verdient tot professionele 
                digitale oplossingen. Daarom bieden wij maatwerk aan tegen eerlijke prijzen, 
                met persoonlijke aandacht en zonder verborgen kosten.
              </p>
              <p>
                Onze aanpak is simpel: we luisteren naar uw wensen, denken mee over de beste 
                oplossing, en bouwen iets waar u trots op kunt zijn. Geen standaard templates, 
                geen one-size-fits-all oplossingen, maar echte maatwerk die past bij uw bedrijf.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section-padding bg-slate-50">
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Waar wij voor staan
            </h2>
            <p className="text-lg text-slate-600">
              Onze kernwaarden die de basis vormen van alles wat we doen.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const IconComponent = value.icon;
              return (
                <div key={index} className="card text-center">
                  <div className="w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center mx-auto mb-6">
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">
                    {value.title}
                  </h3>
                  <p className="text-slate-600">{value.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Expertise */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
                Onze expertise
              </h2>
              <p className="text-lg text-slate-600 mb-8">
                Wij zijn gespecialiseerd in moderne web technologieën die zorgen 
                voor snelle, veilige en schaalbare oplossingen.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  "Next.js & React",
                  "TypeScript",
                  "Node.js",
                  "PostgreSQL",
                  "Tailwind CSS",
                  "Prisma ORM",
                  "n8n Automation",
                  "API Development",
                ].map((tech, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-indigo-600" />
                    <span className="text-slate-700">{tech}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-slate-100 rounded-2xl p-8">
              <div className="flex items-center gap-4 mb-6">
                <Rocket className="w-10 h-10 text-indigo-600" />
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">Modern & Snel</h3>
                  <p className="text-slate-600">Gebouwd voor performance</p>
                </div>
              </div>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-sm shrink-0">✓</span>
                  <span className="text-slate-700">Laadtijden onder 2 seconden</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-sm shrink-0">✓</span>
                  <span className="text-slate-700">SEO geoptimaliseerd uit de doos</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-sm shrink-0">✓</span>
                  <span className="text-slate-700">Schaalbaar voor groei</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-sm shrink-0">✓</span>
                  <span className="text-slate-700">Veilig en up-to-date</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="section-padding bg-slate-900 text-white">
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Onze werkwijze
            </h2>
            <p className="text-lg text-slate-300">
              Van eerste contact tot lancering - zo werken wij samen aan uw project.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            {processSteps.map((item, index) => (
              <div key={item.step} className="relative flex gap-6 pb-12 last:pb-0">
                {/* Line */}
                {index < processSteps.length - 1 && (
                  <div className="absolute left-8 top-16 bottom-0 w-0.5 bg-indigo-600/30" />
                )}
                {/* Step number */}
                <div className="w-16 h-16 rounded-full gradient-bg flex items-center justify-center text-2xl font-bold shrink-0">
                  {item.step}
                </div>
                {/* Content */}
                <div className="pt-3">
                  <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                  <p className="text-slate-400">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
              Klaar om samen te werken?
            </h2>
            <p className="text-lg text-slate-600 mb-8">
              Laten we kennismaken! Neem contact op voor een vrijblijvend gesprek 
              over uw project en mogelijkheden.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/offerte" className="btn-primary inline-flex items-center justify-center gap-2">
                Offerte Aanvragen
              </Link>
              <Link href="/contact" className="btn-secondary inline-flex items-center justify-center gap-2">
                Contact Opnemen
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
