import { Metadata } from "next";
import Link from "next/link";
import { CheckCircle, ArrowRight, Mail, Phone, Calendar, FileText } from "lucide-react";
import { BreadcrumbSchema } from "@/components/seo/StructuredData";

export const metadata: Metadata = {
  title: "Betaling Geslaagd | Automation Services | RoTech Development",
  description: "Uw betaling is succesvol verwerkt. Wij gaan aan de slag met uw automation workflows.",
  robots: {
    index: false,
    follow: false,
  },
};

interface PageProps {
  searchParams: Promise<{ session_id?: string; intake?: string }>;
}

export default async function AutomationSuccessPage({ searchParams }: PageProps) {
  const { session_id } = await searchParams;

  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "/" },
          { name: "Diensten", url: "/diensten" },
          { name: "Automation", url: "/diensten/automation" },
          { name: "Betaling Geslaagd", url: "/checkout/automation/success" },
        ]}
      />

      <section className="min-h-screen bg-gradient-to-b from-emerald-50 to-white py-12 lg:py-20">
        <div className="container-custom">
          <div className="max-w-2xl mx-auto text-center">
            {/* Success Icon */}
            <div className="mb-8">
              <div className="w-24 h-24 mx-auto bg-emerald-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-14 h-14 text-emerald-600" />
              </div>
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Welkom bij RoTech Automation!
            </h1>
            <p className="text-lg text-slate-600 mb-8">
              Uw betaling is succesvol verwerkt. Wij gaan direct aan de slag met het
              opzetten van uw automation workflows.
            </p>

            {/* What's Next */}
            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-8 text-left">
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-600" />
                Wat gebeurt er nu?
              </h2>

              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold text-sm">
                    1
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-900">
                      Bevestigingsmail ontvangen
                    </h3>
                    <p className="text-sm text-slate-600">
                      U ontvangt binnen enkele minuten een bevestigingsmail met alle
                      details van uw abonnement.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold text-sm">
                    2
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-900">
                      Kickoff gesprek plannen (binnen 24 uur)
                    </h3>
                    <p className="text-sm text-slate-600">
                      Wij nemen contact met u op om een kickoff gesprek te plannen
                      waarin we uw intake bespreken en het project starten.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold text-sm">
                    3
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-900">
                      Workflows bouwen (1-2 weken)
                    </h3>
                    <p className="text-sm text-slate-600">
                      Wij bouwen uw eerste workflows op basis van de informatie die
                      u heeft ingevuld in de intake vragenlijst.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center font-bold text-sm">
                    4
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-900">
                      Live gaan!
                    </h3>
                    <p className="text-sm text-slate-600">
                      Na testing en goedkeuring gaan uw workflows live en begint u
                      direct tijd te besparen.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Portal Access */}
            <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl p-6 md:p-8 text-white mb-8">
              <h2 className="text-xl font-bold mb-3">Toegang tot uw Klantenportaal</h2>
              <p className="text-indigo-100 mb-4">
                Binnenkort ontvangt u een email met inloggegevens voor uw
                persoonlijke klantenportaal. Hier kunt u:
              </p>
              <ul className="text-left text-indigo-100 space-y-2 mb-6">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-300" />
                  Uw workflows en status bekijken
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-300" />
                  Support tickets indienen
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-300" />
                  Facturen en betalingsgeschiedenis bekijken
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-300" />
                  Uitbreidingen aanvragen
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div className="bg-slate-100 rounded-2xl p-6 mb-8">
              <h2 className="font-bold text-slate-900 mb-4">Vragen? Neem contact op!</h2>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="mailto:automation@ro-techdevelopment.dev"
                  className="flex items-center justify-center gap-2 text-indigo-600 hover:text-indigo-700"
                >
                  <Mail className="w-4 h-4" />
                  automation@ro-techdevelopment.dev
                </a>
                <a
                  href="tel:+31657235574"
                  className="flex items-center justify-center gap-2 text-indigo-600 hover:text-indigo-700"
                >
                  <Phone className="w-4 h-4" />
                  +31 6 57 23 55 74
                </a>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-300 transition-colors"
              >
                Naar Homepage
              </Link>
              <Link
                href="/portal"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold rounded-xl hover:from-indigo-700 hover:to-violet-700 transition-all shadow-lg shadow-indigo-500/25"
              >
                Naar Klantenportaal
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Session ID for reference */}
            {session_id && (
              <p className="mt-8 text-xs text-slate-400">
                Referentie: {session_id}
              </p>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
