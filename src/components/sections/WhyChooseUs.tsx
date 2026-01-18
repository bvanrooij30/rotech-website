"use client";

import { motion } from "framer-motion";
import { 
  Rocket, 
  Shield, 
  Headphones, 
  Code2, 
  TrendingUp, 
  Heart 
} from "lucide-react";
import LogoWatermark from "@/components/ui/LogoWatermark";

const reasons = [
  {
    icon: Rocket,
    title: "Snelle Oplevering",
    description: "Geen maandenlange trajecten. Wij leveren snel, zonder concessies aan kwaliteit.",
    trustHighlight: false,
  },
  {
    icon: Code2,
    title: "Moderne Technologie",
    description: "Wij gebruiken de nieuwste technologieën voor snelle, veilige en schaalbare oplossingen.",
    trustHighlight: false,
  },
  {
    icon: TrendingUp,
    title: "SEO Geoptimaliseerd",
    description: "Elke website is gebouwd met SEO in gedachten. Gevonden worden in Google is essentieel.",
    trustHighlight: false,
  },
  {
    icon: Shield,
    title: "Veilig & Betrouwbaar",
    description: "SSL, regelmatige updates en beveiligingsmonitoring zijn standaard inbegrepen.",
    trustHighlight: true, // Security = trust = green
  },
  {
    icon: Headphones,
    title: "Persoonlijke Support",
    description: "Direct contact met uw developer. Geen helpdesk of wachtrijen, maar persoonlijke aandacht.",
    trustHighlight: true, // Support = trust = green
  },
  {
    icon: Heart,
    title: "100% Maatwerk",
    description: "Geen templates of standaardoplossingen. Alles wordt specifiek voor uw bedrijf gebouwd.",
    trustHighlight: false,
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

export default function WhyChooseUs() {
  return (
    <section className="section-padding bg-gradient-to-b from-white to-slate-50 relative overflow-hidden">
      <LogoWatermark opacity={0.025} size={250} />
      <div className="container-custom relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium mb-4"
          >
            Waarom RoTech?
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-6"
          >
            Wat ons onderscheidt
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-slate-600"
          >
            Bij RoTech krijgt u niet zomaar een website. U krijgt een partner 
            die meedenkt over uw digitale groei.
          </motion.p>
        </div>

        {/* Reasons Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {reasons.map((reason, index) => {
            const IconComponent = reason.icon;
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                className="group"
              >
                <div className="flex gap-5">
                  {/* Icon */}
                  <div className="shrink-0">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300 ${
                      reason.trustHighlight 
                        ? "bg-emerald-100 group-hover:bg-emerald-500" 
                        : "bg-indigo-100 group-hover:gradient-bg"
                    }`}>
                      <IconComponent className={`w-7 h-7 group-hover:text-white transition-colors ${
                        reason.trustHighlight ? "text-emerald-600" : "text-indigo-600"
                      }`} />
                    </div>
                  </div>

                  {/* Content */}
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">
                      {reason.title}
                    </h3>
                    <p className="text-slate-600">
                      {reason.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Bottom CTA met psychologische elementen */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 px-6 py-5 bg-gradient-to-br from-indigo-50 to-violet-50 rounded-2xl border border-indigo-100 shadow-sm">
            <div className="text-left flex-grow">
              <p className="text-sm text-slate-500 mb-1">Benieuwd naar de mogelijkheden?</p>
              <p className="font-semibold text-slate-900 text-lg">Plan een vrijblijvend gesprek</p>
              <p className="text-xs text-slate-500 mt-1">✓ Geen verplichtingen ✓ Binnen 24u reactie</p>
            </div>
            <a
              href="/contact"
              className="btn-primary shrink-0"
            >
              Contact Opnemen
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
