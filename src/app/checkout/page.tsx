import { Metadata } from "next";
import { Suspense } from "react";
import CheckoutWizard from "@/components/checkout/CheckoutWizard";
import { Loader2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Checkout | Ro-Tech Development",
  description: "Voltooi uw bestelling en betaal veilig via iDEAL of creditcard.",
  robots: "noindex, nofollow",
};

function CheckoutLoading() {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
      <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
      <p className="text-slate-600">Checkout laden...</p>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <section className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12">
      <div className="container-custom">
        <div className="max-w-4xl mx-auto">
          <Suspense fallback={<CheckoutLoading />}>
            <CheckoutWizard />
          </Suspense>
        </div>
      </div>
    </section>
  );
}
