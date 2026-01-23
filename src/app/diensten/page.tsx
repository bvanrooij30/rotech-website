import { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { services } from "@/data/services";
import { BreadcrumbSchema } from "@/components/seo/StructuredData";

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
      <section className="section-padding bg-gradient-to-b from-slate-50 to-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {services.map((service, index) => {
              const IconComponent = service.icon;
              const isTopService = index < 4;
              
              return (
                <Link
                  key={service.slug}
                  href={`/diensten/${service.slug}`}
                  className="group"
                >
                  <div className="relative h-full rounded-2xl p-6 transition-all duration-300 overflow-hidden bg-white border border-slate-200 shadow-sm hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1.5">
                    {/* Corner accent */}
                    <div className={`
                      absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-40 pointer-events-none
                      ${isTopService 
                        ? 'bg-gradient-to-bl from-indigo-200 via-indigo-100/50 to-transparent' 
                        : 'bg-gradient-to-bl from-violet-200 via-violet-100/50 to-transparent'
                      }
                    `} />
                    
                    {/* Bottom accent line */}
                    <div className={`
                      absolute bottom-0 left-0 right-0 h-1
                      ${isTopService 
                        ? 'bg-gradient-to-r from-indigo-400 via-violet-400 to-indigo-400' 
                        : 'bg-gradient-to-r from-violet-400 via-purple-400 to-violet-400'
                      }
                    `} />
                    
                    <div className="relative z-10 flex gap-6">
                      {/* Icon */}
                      <div className="shrink-0">
                        <div className={`
                          w-16 h-16 rounded-2xl flex items-center justify-center 
                          transition-all duration-300 group-hover:scale-110 group-hover:rotate-3
                          ${isTopService 
                            ? 'bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/30' 
                            : 'bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/30'
                          }
                        `}>
                          <IconComponent className="w-8 h-8 text-white" />
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-grow">
                        <h2 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors">
                          {service.title}
                        </h2>
                        <p className="text-slate-600 mb-4 leading-relaxed">
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
                          <span className="inline-flex items-center px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-sm font-medium">
                            {service.deliveryTime}
                          </span>
                          <div className="flex items-center gap-2 text-indigo-600 font-semibold group-hover:gap-3 transition-all">
                            <span>Meer informatie</span>
                            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
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

      {/* Werkwijze Teaser */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                Hoe Wij Werken
              </h2>
              <p className="text-lg text-slate-600">
                Van eerste gesprek tot lancering - een transparant en persoonlijk proces.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {[
                { step: "1", title: "Kennismaking", desc: "Gratis gesprek om uw wensen te begrijpen" },
                { step: "2", title: "Ontwerp & Bouw", desc: "Wij maken uw visie werkelijkheid" },
                { step: "3", title: "Lancering", desc: "Uw website gaat live met volledige training" },
              ].map((item) => (
                <div key={item.step} className="text-center p-6 bg-slate-50 rounded-2xl">
                  <div className="w-12 h-12 rounded-full gradient-bg flex items-center justify-center text-xl font-bold text-white mx-auto mb-4">
                    {item.step}
                  </div>
                  <h3 className="font-bold text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-slate-600">{item.desc}</p>
                </div>
              ))}
            </div>

            <div className="text-center">
              <Link href="/werkwijze" className="inline-flex items-center gap-2 text-indigo-600 font-medium hover:underline">
                Bekijk onze volledige werkwijze
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Lokale SEO sectie */}
      <section className="py-12 bg-slate-50 border-t border-slate-100">
        <div className="container-custom">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Ons Werkgebied</h2>
            <p className="text-slate-600">Wij helpen ondernemers in heel Noord-Brabant</p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { name: "Veldhoven", href: "/regio/veldhoven" },
              { name: "Eindhoven", href: "/regio/eindhoven" },
              { name: "Waalre", href: "/regio/waalre" },
              { name: "Best", href: "/regio/best" },
              { name: "Helmond", href: "/regio/helmond" },
              { name: "Noord-Brabant", href: "/regio/noord-brabant" },
            ].map((area) => (
              <Link
                key={area.name}
                href={area.href}
                className="px-4 py-2 bg-white border border-slate-200 rounded-full text-sm font-medium text-slate-700 hover:border-indigo-300 hover:text-indigo-600 transition-colors"
              >
                {area.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-gradient-to-r from-indigo-600 to-violet-600 text-white">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Niet zeker welke dienst u nodig heeft?
            </h2>
            <p className="text-xl text-indigo-100 mb-8">
              Neem contact met ons op voor een vrijblijvend adviesgesprek. 
              Wij denken graag mee over de beste oplossing voor uw situatie.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-indigo-600 rounded-xl font-bold hover:bg-indigo-50 transition-colors">
                Gratis Adviesgesprek
              </Link>
              <Link href="/veelgestelde-vragen" className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-white text-white rounded-xl font-bold hover:bg-white/10 transition-colors">
                Bekijk FAQ
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
