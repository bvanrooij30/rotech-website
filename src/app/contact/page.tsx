import { Metadata } from "next";
import { Mail, Phone, MapPin, Clock, MessageCircle } from "lucide-react";
import ContactForm from "@/components/forms/ContactForm";
import { BreadcrumbSchema } from "@/components/seo/StructuredData";

export const metadata: Metadata = {
  title: "Contact | Neem Contact Op",
  description: "Neem contact op met RoTech Development voor uw website, webshop of web applicatie. Wij reageren binnen 24 uur op uw bericht.",
  alternates: {
    canonical: "/contact",
  },
};

const contactInfo = [
  {
    icon: Phone,
    title: "Telefoon",
    value: "+31 6 57 23 55 74",
    href: "tel:+31657235574",
    description: "Ma-Vr: 09:00 - 17:30",
  },
  {
    icon: Mail,
    title: "E-mail",
    value: "contact@ro-techdevelopment.com",
    href: "mailto:contact@ro-techdevelopment.com",
    description: "Reactie binnen 24 uur",
  },
  {
    icon: MapPin,
    title: "Locatie",
    value: "Veldhoven",
    href: null,
    description: "Noord-Brabant, Nederland",
  },
  {
    icon: Clock,
    title: "Openingstijden",
    value: "Ma - Vr: 09:00 - 17:30",
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
              
              <div className="space-y-6 mb-8">
                {contactInfo.map((item, index) => {
                  const IconComponent = item.icon;
                  const content = (
                    <div className="flex gap-4">
                      <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0">
                        <IconComponent className="w-6 h-6 text-indigo-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900">{item.title}</h3>
                        <p className="text-slate-700">{item.value}</p>
                        <p className="text-sm text-slate-500">{item.description}</p>
                      </div>
                    </div>
                  );

                  return item.href ? (
                    <a
                      key={index}
                      href={item.href}
                      className="block hover:bg-slate-50 -mx-4 px-4 py-2 rounded-xl transition-colors"
                    >
                      {content}
                    </a>
                  ) : (
                    <div key={index}>{content}</div>
                  );
                })}
              </div>

              {/* WhatsApp */}
              <a
                href="https://wa.me/31657235574"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
                Chat via WhatsApp
              </a>

              {/* Extra info */}
              <div className="mt-8 p-6 bg-slate-50 rounded-xl">
                <h3 className="font-semibold text-slate-900 mb-2">
                  Liever een offerte?
                </h3>
                <p className="text-slate-600 text-sm mb-4">
                  Voor projectaanvragen kunt u beter ons uitgebreide offerteformulier gebruiken.
                </p>
                <a href="/offerte" className="text-indigo-600 font-medium hover:underline">
                  Naar offerteformulier →
                </a>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="card">
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
