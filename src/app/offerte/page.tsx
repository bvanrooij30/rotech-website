import { Metadata } from "next";
import { Suspense } from "react";
import { CheckCircle, Loader2, Info } from "lucide-react";
import Link from "next/link";
import { QuoteBuilder } from "@/components/quote";
import { BreadcrumbSchema } from "@/components/seo/StructuredData";

export const metadata: Metadata = {
  title: "Offerte Aanvragen | Kies uw functies & ontvang direct een prijs",
  description: "Stel uw ideale website samen en ontvang direct een offerte. Kies zelf welke functies u nodig heeft - u bepaalt de prijs.",
  alternates: {
    canonical: "/offerte",
  },
};

const benefits = [
  "Direct inzicht in de prijs",
  "Kies zelf uw functies",
  "Juridisch bindend akkoord",
  "Start binnen 24 uur",
];

function QuoteLoading() {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
      <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
      <p className="text-slate-600">Offerte wizard laden...</p>
    </div>
  );
}

export default function OffertePage() {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "/" },
          { name: "Offerte Aanvragen", url: "/offerte" },
        ]}
      />

      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-12 lg:py-20">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <span className="inline-block px-4 py-1.5 bg-emerald-600/20 text-emerald-300 rounded-full text-sm font-medium mb-6">
              Transparant & Direct
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Stel uw offerte samen
            </h1>
            <p className="text-xl text-slate-300 mb-8">
              Kies uw pakket en functies - u ziet direct de prijs. 
              Na akkoord gaan we aan de slag.
            </p>
            <div className="flex flex-wrap justify-center gap-6">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                  <span className="text-slate-300">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Quote Builder Section */}
      <section className="section-padding bg-slate-50">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <Suspense fallback={<QuoteLoading />}>
              <QuoteBuilder />
            </Suspense>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">
              Hoe werkt het?
            </h2>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-14 h-14 rounded-full gradient-bg text-white text-xl font-bold flex items-center justify-center mx-auto mb-4">
                  1
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  Kies pakket
                </h3>
                <p className="text-sm text-slate-600">
                  Selecteer het pakket dat past bij uw project.
                </p>
              </div>
              <div className="text-center">
                <div className="w-14 h-14 rounded-full gradient-bg text-white text-xl font-bold flex items-center justify-center mx-auto mb-4">
                  2
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  Selecteer functies
                </h3>
                <p className="text-sm text-slate-600">
                  Kies welke functies u nodig heeft.
                </p>
              </div>
              <div className="text-center">
                <div className="w-14 h-14 rounded-full gradient-bg text-white text-xl font-bold flex items-center justify-center mx-auto mb-4">
                  3
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  Bekijk prijs & akkoord
                </h3>
                <p className="text-sm text-slate-600">
                  Zie direct de prijs en geef digitaal akkoord.
                </p>
              </div>
              <div className="text-center">
                <div className="w-14 h-14 rounded-full gradient-bg text-white text-xl font-bold flex items-center justify-center mx-auto mb-4">
                  4
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  Wij gaan aan de slag
                </h3>
                <p className="text-sm text-slate-600">
                  Na aanbetaling starten wij direct met uw project.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Belangrijke informatie */}
      <section className="py-8 bg-slate-50 border-t border-slate-200">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <Info className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-slate-900 mb-2">Goed om te weten</h3>
                  <ul className="text-sm text-slate-700 space-y-2">
                    <li>
                      <strong>Wij zijn een technisch ontwikkelingsbureau</strong> – Wij bouwen uw 
                      website met moderne frameworks. Voor volledig custom grafisch ontwerp werken 
                      wij samen met design partners.
                    </li>
                    <li>
                      <strong>Content levert u zelf aan</strong> – Teksten en afbeeldingen levert u aan. 
                      Wij kunnen AI-ondersteunde content verzorgen tegen meerprijs; u keurt deze goed vóór publicatie.
                    </li>
                    <li>
                      <strong>API integraties onder voorbehoud</strong> – De haalbaarheid van koppelingen 
                      met externe systemen is afhankelijk van de API mogelijkheden van die systemen.
                    </li>
                    <li>
                      <strong>SEO = technische optimalisatie</strong> – Wij optimaliseren technisch; 
                      linkbuilding en PR zijn niet standaard inbegrepen. Posities in Google kunnen wij niet garanderen.
                    </li>
                  </ul>
                  <p className="text-sm text-slate-600 mt-4">
                    Door een offerte te accepteren gaat u akkoord met onze{" "}
                    <Link href="/algemene-voorwaarden" className="text-indigo-600 hover:underline">
                      algemene voorwaarden
                    </Link>{" "}
                    en{" "}
                    <Link href="/disclaimer" className="text-indigo-600 hover:underline">
                      disclaimer
                    </Link>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
