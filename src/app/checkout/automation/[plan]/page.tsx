import { Metadata } from "next";
import { notFound } from "next/navigation";
import { AutomationIntakeWizard } from "@/components/automation";
import { automationPlans, enterprisePlan } from "@/data/automation-subscriptions";
import { BreadcrumbSchema } from "@/components/seo/StructuredData";

interface PageProps {
  params: Promise<{ plan: string }>;
  searchParams: Promise<{ billing?: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { plan } = await params;
  const selectedPlan = automationPlans.find((p) => p.slug === plan);

  if (!selectedPlan && plan !== "enterprise") {
    return {
      title: "Plan niet gevonden | RoTech",
    };
  }

  const planName = selectedPlan?.name || enterprisePlan.name;

  return {
    title: `${planName} Automation - Intake | RoTech Development`,
    description: `Start met het ${planName} automation pakket. Vul de intake vragenlijst in en wij bouwen uw workflows.`,
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function AutomationCheckoutPage({ params, searchParams }: PageProps) {
  const { plan } = await params;
  const { billing } = await searchParams;
  
  const selectedPlan = automationPlans.find((p) => p.slug === plan);
  const billingPeriod = billing === "yearly" ? "yearly" : "monthly";

  // Enterprise redirects to contact
  if (plan === "enterprise") {
    return (
      <>
        <BreadcrumbSchema
          items={[
            { name: "Home", url: "/" },
            { name: "Diensten", url: "/diensten" },
            { name: "Automation", url: "/diensten/automation" },
            { name: "Enterprise", url: "/checkout/automation/enterprise" },
          ]}
        />

        <section className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12 lg:py-20">
          <div className="container-custom">
            <div className="max-w-2xl mx-auto text-center">
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                Enterprise Automation
              </h1>
              <p className="text-lg text-slate-600 mb-8">
                Voor Enterprise klanten maken wij een offerte op maat. Neem contact met ons
                op om uw specifieke wensen te bespreken.
              </p>
              <a
                href="/contact?subject=Enterprise%20Automation"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold rounded-xl hover:from-indigo-700 hover:to-violet-700 transition-all shadow-lg shadow-indigo-500/25"
              >
                Neem Contact Op
              </a>
            </div>
          </div>
        </section>
      </>
    );
  }

  // Plan not found
  if (!selectedPlan) {
    notFound();
  }

  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "/" },
          { name: "Diensten", url: "/diensten" },
          { name: "Automation", url: "/diensten/automation" },
          { name: selectedPlan.name, url: `/checkout/automation/${plan}` },
        ]}
      />

      <section className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12 lg:py-20">
        <div className="container-custom">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
              Automation Intake
            </h1>
            <p className="text-lg text-slate-600">
              Vul de vragenlijst in zodat wij precies weten wat u nodig heeft
            </p>
          </div>

          <AutomationIntakeWizard
            planType={selectedPlan.id}
            billingPeriod={billingPeriod}
          />
        </div>
      </section>
    </>
  );
}
