import { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { services } from "@/data/services";
import { StructuredData, BreadcrumbSchema } from "@/components/seo/StructuredData";

export const metadata: Metadata = {
  title: "Diensten | Website, Webshop & Web App Ontwikkeling",
  description: "Bekijk onze diensten: websites, webshops, web applicaties, mobile apps, SEO, automatisering en meer. Professionele oplossingen voor uw bedrijf.",
  keywords: [
    "website laten maken",
    "webshop laten maken",
    "web applicatie",
    "mobile app",
    "SEO optimalisatie",
    "website onderhoud",
    "automatisering",
    "API integraties",
  ],
  alternates: {
    canonical: "/diensten",
  },
};

export default function DienstenPage() {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "/" },
          { name: "Diensten", url: "/diensten" },
        ]}
      />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-20 lg:py-32">
        <div className="container-custom">
          <div className="max-w-3xl">
            <span className="inline-block px-4 py-1.5 bg-indigo-600/20 text-indigo-300 rounded-full text-sm font-medium mb-6">
              Onze Diensten
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Complete digitale oplossingen voor uw bedrijf
            </h1>
            <p className="text-xl text-slate-300 mb-8">
              Van eenvoudige websites tot complexe web applicaties. 
              Wij bouwen alles wat u nodig heeft om online te groeien.
            </p>
            <Link href="/offerte" className="btn-primary inline-flex items-center gap-2">
              Gratis Offerte Aanvragen
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {services.map((service) => {
              const IconComponent = service.icon;
              const isHighlighted = service.slug === "webshop-laten-maken";
              return (
                <Link
                  key={service.slug}
                  href={`/diensten/${service.slug}`}
                  className="group"
                >
                  <div className={`h-full bg-white rounded-2xl p-6 transition-all duration-300 ${
                    isHighlighted 
                      ? "border-2 border-emerald-500 shadow-xl shadow-emerald-500/20 hover:shadow-2xl hover:shadow-emerald-500/30" 
                      : "border border-slate-100 shadow-sm hover:shadow-lg hover:border-indigo-100"
                  }`}>
                    <div className="flex gap-6">
                      {/* Icon - Always purple gradient */}
                      <div className="shrink-0">
                        <div className="w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <IconComponent className="w-8 h-8 text-white" />
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-grow">
                        <h2 className={`text-2xl font-bold mb-3 transition-colors ${
                          isHighlighted 
                            ? "text-emerald-700 group-hover:text-emerald-600" 
                            : "text-slate-900 group-hover:text-indigo-600"
                        }`}>
                          {service.title}
                        </h2>
                        <p className="text-slate-600 mb-4">
                          {service.description}
                        </p>

                        {/* Features preview */}
                        <ul className="space-y-2 mb-6">
                          {service.features.slice(0, 3).map((feature, i) => (
                            <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
                              <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              {feature}
                            </li>
                          ))}
                        </ul>

                        <div className="flex items-center justify-between">
                          <div>
                            <span className={`text-sm font-medium ${isHighlighted ? "text-emerald-600" : "text-slate-700"}`}>
                              {service.deliveryTime}
                            </span>
                          </div>
                          <div className={`flex items-center gap-2 font-medium group-hover:gap-3 transition-all ${
                            isHighlighted ? "text-emerald-600" : "text-indigo-600"
                          }`}>
                            <span>Meer informatie</span>
                            <ArrowRight className="w-4 h-4" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-slate-50">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
              Niet zeker welke dienst u nodig heeft?
            </h2>
            <p className="text-lg text-slate-600 mb-8">
              Neem contact met ons op voor een vrijblijvend adviesgesprek. 
              Wij denken graag mee over de beste oplossing voor uw situatie.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact" className="btn-primary inline-flex items-center justify-center gap-2">
                Gratis Adviesgesprek
              </Link>
              <Link href="/veelgestelde-vragen" className="btn-secondary inline-flex items-center justify-center gap-2">
                Bekijk FAQ
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
