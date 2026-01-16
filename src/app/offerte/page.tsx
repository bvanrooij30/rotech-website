import { Metadata } from "next";
import { CheckCircle } from "lucide-react";
import OfferteWizard from "@/components/forms/OfferteWizard";
import { BreadcrumbSchema } from "@/components/seo/StructuredData";

export const metadata: Metadata = {
  title: "Offerte Aanvragen | Gratis & Vrijblijvend",
  description: "Vraag een gratis offerte aan voor uw website, webshop of web applicatie. Binnen 24 uur ontvangt u een voorstel op maat.",
  alternates: {
    canonical: "/offerte",
  },
};

const benefits = [
  "Gratis en vrijblijvend",
  "Reactie binnen 24 uur",
  "Persoonlijk advies",
  "Transparante prijzen",
];

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
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-16 lg:py-24">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <span className="inline-block px-4 py-1.5 bg-emerald-600/20 text-emerald-300 rounded-full text-sm font-medium mb-6">
              100% Gratis & Vrijblijvend
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Offerte Aanvragen
            </h1>
            <p className="text-xl text-slate-300 mb-8">
              Vul het formulier in en ontvang binnen 24 uur een voorstel op maat.
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

      {/* Form Section */}
      <section className="section-padding bg-slate-50">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto">
            <div className="card">
              <OfferteWizard />
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">
              Wat kunt u verwachten?
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full gradient-bg text-white text-2xl font-bold flex items-center justify-center mx-auto mb-4">
                  1
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  Ontvangst & Review
                </h3>
                <p className="text-slate-600">
                  Wij bekijken uw aanvraag zorgvuldig en bereiden een gepersonaliseerd voorstel voor.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-full gradient-bg text-white text-2xl font-bold flex items-center justify-center mx-auto mb-4">
                  2
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  Offerte binnen 24 uur
                </h3>
                <p className="text-slate-600">
                  U ontvangt een duidelijke offerte met prijsindicatie en specificaties.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-full gradient-bg text-white text-2xl font-bold flex items-center justify-center mx-auto mb-4">
                  3
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  Vrijblijvend Gesprek
                </h3>
                <p className="text-slate-600">
                  We plannen een gesprek om uw project te bespreken en vragen te beantwoorden.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
