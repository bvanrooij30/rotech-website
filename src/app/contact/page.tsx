import { Metadata } from "next";
import { Mail, Clock, ArrowRight } from "lucide-react";
import ContactForm from "@/components/forms/ContactForm";
import { BreadcrumbSchema } from "@/components/seo/StructuredData";

export const metadata: Metadata = {
  title: "Contact | Neem Contact Op",
  description: "Neem contact op met Ro-Tech Development voor uw website, webshop of web applicatie. Wij reageren binnen 24 uur op uw bericht.",
  alternates: {
    canonical: "/contact",
  },
};

const contactInfo = [
  {
    icon: Mail,
    title: "E-mail",
    value: "contact@ro-techdevelopment.dev",
    href: "mailto:contact@ro-techdevelopment.dev",
    description: "Reactie binnen 24 uur",
  },
  {
    icon: Clock,
    title: "Openingstijden",
    value: "Ma - Vr: 09:00 - 18:00",
    href: null,
    description: "Weekend op afspraak",
  },
];

export default function ContactPage() {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "/" },
          { name: "Contact", url: "/contact" },
        ]}
      />

      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-20 lg:py-32">
        <div className="container-custom">
          <div className="max-w-3xl">
            <span className="inline-block px-4 py-1.5 bg-indigo-600/20 text-indigo-300 rounded-full text-sm font-medium mb-6">
              Contact
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Laten we kennismaken
            </h1>
            <p className="text-xl text-slate-300">
              Heeft u een vraag of wilt u een project bespreken? 
              Neem gerust contact op. Wij reageren binnen 24 uur.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="grid lg:grid-cols-3 gap-12 lg:gap-16">
            {/* Contact Info */}
            <div className="lg:col-span-1">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">
                Contactgegevens
              </h2>
              
              <div className="space-y-4 mb-8">
                {contactInfo.map((item, index) => {
                  const IconComponent = item.icon;
                  const isPrimary = index % 2 === 0;
                  
                  const content = (
                    <div className="relative flex gap-4 p-4 rounded-2xl overflow-hidden transition-all duration-300 bg-white border border-slate-200 shadow-sm hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-500/10 hover:-translate-y-0.5">
                      {/* Bottom accent line */}
                      <div className={`
                        absolute bottom-0 left-0 right-0 h-0.5
                        ${isPrimary
                          ? "bg-gradient-to-r from-indigo-400 via-violet-400 to-indigo-400"
                          : "bg-gradient-to-r from-violet-400 via-purple-400 to-violet-400"
                        }
                      `} />

                      <div className={`
                        w-12 h-12 rounded-xl flex items-center justify-center shrink-0
                        ${isPrimary
                          ? "bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/30"
                          : "bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/30"
                        }
                      `}>
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                      <div className="relative z-10">
                        <h3 className="font-semibold text-slate-900">{item.title}</h3>
                        <p className="text-slate-700">{item.value}</p>
                        <p className="text-sm text-slate-500">{item.description}</p>
                      </div>
                    </div>
                  );

                  return item.href ? (
                    <a key={index} href={item.href} className="block">
                      {content}
                    </a>
                  ) : (
                    <div key={index}>{content}</div>
                  );
                })}
              </div>

              {/* Extra info */}
              <div className="relative mt-8 p-6 rounded-2xl overflow-hidden transition-all duration-300 bg-white border border-slate-200 shadow-sm hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-500/10 hover:-translate-y-0.5">
                {/* Bottom accent line */}
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-400 via-violet-400 to-indigo-400" />
                
                <div className="relative z-10">
                  <h3 className="font-semibold text-slate-900 mb-2">
                    Liever een offerte?
                  </h3>
                  <p className="text-slate-600 text-sm mb-4">
                    Voor projectaanvragen kunt u beter ons uitgebreide offerteformulier gebruiken.
                  </p>
                  <a href="/offerte" className="inline-flex items-center gap-2 text-indigo-600 font-semibold hover:gap-3 transition-all">
                    Naar offerteformulier
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="relative rounded-2xl p-8 overflow-hidden transition-all duration-300 bg-white border border-slate-200 shadow-sm">
                {/* Corner accent */}
                <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-40 pointer-events-none bg-gradient-to-bl from-indigo-200 via-indigo-100/50 to-transparent" />

                {/* Bottom accent line */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-400 via-violet-400 to-indigo-400" />

                <div className="relative z-10">
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">
                    Stuur een bericht
                  </h2>
                  <p className="text-slate-600 mb-8">
                    Vul het formulier in en wij nemen zo snel mogelijk contact met u op.
                  </p>
                  <ContactForm />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Teaser */}
      <section className="section-padding bg-slate-50">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Staat uw vraag er niet tussen?
            </h2>
            <p className="text-lg text-slate-600 mb-6">
              Bekijk onze veelgestelde vragen voor snelle antwoorden op 
              de meest voorkomende vragen.
            </p>
            <a href="/veelgestelde-vragen" className="btn-secondary">
              Bekijk FAQ
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
