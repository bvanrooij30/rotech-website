import { Metadata } from "next";
import CheckoutWizard from "@/components/checkout/CheckoutWizard";

export const metadata: Metadata = {
  title: "Checkout | Ro-Tech Development",
  description: "Voltooi uw bestelling en betaal veilig via iDEAL of creditcard.",
  robots: "noindex, nofollow",
};

export default function CheckoutPage() {
  return (
    <section className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12">
      <div className="container-custom">
        <div className="max-w-4xl mx-auto">
          <CheckoutWizard />
        </div>
      </div>
    </section>
  );
}
