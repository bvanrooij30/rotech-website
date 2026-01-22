import { Metadata } from "next";
import Link from "next/link";
import { CheckCircle, ArrowRight, Mail, Calendar, Headphones } from "lucide-react";

export const metadata: Metadata = {
  title: "Bedankt! | Onderhoud Geactiveerd",
  description: "Uw onderhoudsabonnement is succesvol geactiveerd.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function OnderhoudSuccessPage() {
  return (
    <section className="section-padding bg-gradient-to-br from-slate-50 to-emerald-50 min-h-[70vh] flex items-center">
      <div className="container-custom">
        <div className="max-w-2xl mx-auto text-center">
          {/* Success Icon */}
          <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle className="w-12 h-12 text-emerald-600" />
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Welkom bij RoTech!
          </h1>
          
          <p className="text-xl text-slate-600 mb-8">
            Uw onderhoudsabonnement is succesvol geactiveerd. 
            Wij nemen binnen 24 uur contact met u op om alles in orde te maken.
          </p>

          {/* What happens next */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 text-left">
            <h2 className="text-xl font-bold text-slate-900 mb-6 text-center">
              Wat gebeurt er nu?
            </h2>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Bevestigingsmail</h3>
                  <p className="text-slate-600 text-sm">
                    U ontvangt een bevestiging op uw e-mailadres met alle details van uw abonnement.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center shrink-0">
                  <Headphones className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Persoonlijk contact</h3>
                  <p className="text-slate-600 text-sm">
                    Wij nemen binnen 24 uur contact met u op om uw website gegevens door te nemen 
                    en het onderhoud op te starten.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center shrink-0">
                  <Calendar className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Eerste check-up</h3>
                  <p className="text-slate-600 text-sm">
                    Wij voeren een volledige check-up uit van uw website en informeren u over 
                    eventuele bevindingen of aanbevelingen.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Factuur info */}
          <div className="bg-slate-100 rounded-xl p-6 mb-8">
            <h3 className="font-bold text-slate-900 mb-2">Over uw factuur</h3>
            <p className="text-sm text-slate-600">
              Uw factuur wordt automatisch naar uw e-mailadres gestuurd. 
              U kunt deze ook altijd terugvinden in uw Stripe betalingsoverzicht.
            </p>
          </div>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/" className="btn-primary inline-flex items-center justify-center gap-2">
              Terug naar home
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/contact" className="btn-secondary inline-flex items-center justify-center gap-2">
              Vragen? Neem contact op
            </Link>
          </div>

          {/* Support info */}
          <p className="text-sm text-slate-500 mt-8">
            Vragen over uw abonnement? Mail naar{" "}
            <a href="mailto:support@ro-techdevelopment.dev" className="text-indigo-600 hover:underline">
              support@ro-techdevelopment.dev
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
