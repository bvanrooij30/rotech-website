import { Metadata } from "next";
import { Suspense } from "react";
import { BreadcrumbSchema } from "@/components/seo/StructuredData";
import { MaintenanceCheckout } from "@/components/checkout/MaintenanceCheckout";
import { Check, Shield, Clock, Headphones, Loader2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Website Onderhoud | Maandelijks abonnement vanaf €129",
  description: "Professioneel website onderhoud met updates, backups, monitoring en support. Kies uw plan en start direct. Prijzen vanaf €129 per maand.",
  keywords: ["website onderhoud", "website beheer", "website support", "maandelijks onderhoud", "website updates"],
  alternates: {
    canonical: "/onderhoud",
  },
};

const benefits = [
  {
    icon: Shield,
    title: "Veiligheid Gegarandeerd",
    description: "Dagelijkse backups en beveiligingsupdates",
  },
  {
    icon: Clock,
    title: "Altijd Up-to-Date",
    description: "Maandelijkse updates van alle systemen",
  },
  {
    icon: Headphones,
    title: "Direct Support",
    description: "Hulp wanneer u het nodig heeft",
  },
];

function CheckoutLoading() {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
      <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
      <p className="text-slate-600">Onderhoudspakketten laden...</p>
    </div>
  );
}

export default function OnderhoudPage() {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "/" },
          { name: "Website Onderhoud", url: "/onderhoud" },
        ]}
      />

      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-16 lg:py-24">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <span className="inline-block px-4 py-1.5 bg-amber-600/20 text-amber-300 rounded-full text-sm font-medium mb-6">
              Zorgeloos Online
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Website Onderhoud
            </h1>
            <p className="text-xl text-slate-300 mb-8">
              Focus op uw bedrijf, wij zorgen voor uw website. 
              Veilig, up-to-date en altijd bereikbaar.
            </p>
            
            <div className="grid md:grid-cols-3 gap-6 mt-12">
              {benefits.map((benefit, index) => (
                <div key={index} className="text-center">
                  <div className="w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <benefit.icon className="w-7 h-7 text-amber-400" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">{benefit.title}</h3>
                  <p className="text-slate-400 text-sm">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Maintenance Checkout */}
      <section className="section-padding bg-slate-50">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">
                Kies uw onderhoudsplan
              </h2>
              <p className="text-lg text-slate-600">
                Selecteer een plan en start direct. Geen verborgen kosten.
              </p>
            </div>

            <Suspense fallback={<CheckoutLoading />}>
              <MaintenanceCheckout />
            </Suspense>
          </div>
        </div>
      </section>

      {/* What's included */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">
              Wat is inbegrepen?
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-slate-50 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-slate-900 mb-4">
                  Bij elk onderhoudsplan
                </h3>
                <ul className="space-y-3">
                  {[
                    "Maandelijkse software updates",
                    "Dagelijkse automatische backups",
                    "24/7 uptime monitoring",
                    "SSL certificaat beheer",
                    "Beveiligingsscans",
                    "Performance monitoring",
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="text-slate-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-slate-50 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-slate-900 mb-4">
                  Hoe werkt het?
                </h3>
                <ol className="space-y-4">
                  {[
                    { step: "1", text: "Kies het plan dat bij u past" },
                    { step: "2", text: "Vul uw gegevens in" },
                    { step: "3", text: "Betaal veilig via iDEAL of creditcard" },
                    { step: "4", text: "Wij nemen binnen 24 uur contact op" },
                    { step: "5", text: "Uw website is onder onze hoede" },
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="w-7 h-7 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-sm font-bold shrink-0">
                        {item.step}
                      </span>
                      <span className="text-slate-700">{item.text}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            <div className="mt-8 p-6 bg-amber-50 border border-amber-200 rounded-xl">
              <h4 className="font-bold text-amber-900 mb-2">Belangrijke informatie</h4>
              <ul className="text-sm text-amber-800 space-y-1">
                <li>• Minimale looptijd: 3 maanden</li>
                <li>• Opzegtermijn: 1 maand voor het einde van de facturatieperiode</li>
                <li>• Jaarlijkse betaling: 10% korting</li>
                <li>• Inclusief BTW prijzen beschikbaar bij checkout</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
