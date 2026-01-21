import { Metadata } from "next";
import Link from "next/link";
import { CheckCircle, ArrowRight, Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Betaling Succesvol | RoTech Development",
  description: "Uw betaling is succesvol ontvangen. Bedankt voor uw vertrouwen!",
  robots: "noindex, nofollow",
};

export default function BetalingSuccesPage() {
  return (
    <section className="min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 py-20">
      <div className="container-custom">
        <div className="max-w-2xl mx-auto text-center">
          {/* Success Icon */}
          <div className="w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-8">
            <CheckCircle className="w-14 h-14 text-emerald-600" />
          </div>
          
          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Betaling Ontvangen!
          </h1>
          
          <p className="text-xl text-slate-600 mb-8">
            Bedankt voor uw betaling. U ontvangt binnen enkele minuten een bevestiging per e-mail.
          </p>
          
          {/* What happens next */}
          <div className="bg-white rounded-2xl p-8 shadow-lg mb-8 text-left">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Wat gebeurt er nu?</h2>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-indigo-600 font-bold text-sm">1</span>
                </div>
                <div>
                  <p className="font-medium text-slate-900">Bevestigingsmail</p>
                  <p className="text-slate-600 text-sm">U ontvangt een bevestiging van uw betaling per e-mail.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-indigo-600 font-bold text-sm">2</span>
                </div>
                <div>
                  <p className="font-medium text-slate-900">Kickoff gesprek</p>
                  <p className="text-slate-600 text-sm">Wij nemen binnen 24 uur contact met u op om het project te bespreken.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-indigo-600 font-bold text-sm">3</span>
                </div>
                <div>
                  <p className="font-medium text-slate-900">Start project</p>
                  <p className="text-slate-600 text-sm">Na het kickoff gesprek gaan we direct aan de slag!</p>
                </div>
              </li>
            </ul>
          </div>
          
          {/* Contact info */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 mb-8">
            <p className="text-slate-300 mb-4">Heeft u vragen? Neem contact met ons op:</p>
            <div className="flex justify-center">
              <a 
                href="mailto:contact@ro-techdevelopment.dev" 
                className="flex items-center justify-center gap-2 hover:text-indigo-400 transition-colors"
              >
                <Mail className="w-5 h-5" />
                contact@ro-techdevelopment.dev
              </a>
            </div>
          </div>
          
          {/* Back to home */}
          <Link 
            href="/" 
            className="btn-primary inline-flex items-center gap-2"
          >
            Terug naar Home
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
