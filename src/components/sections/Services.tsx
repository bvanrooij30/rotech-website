"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { services } from "@/data/services";

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

import LogoWatermark from "@/components/ui/LogoWatermark";

export default function Services() {
  return (
    <section className="section-padding bg-white relative overflow-hidden">
      <LogoWatermark opacity={0.02} size={300} />
      <div className="container-custom relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium mb-4"
          >
            Onze Diensten
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-6"
          >
            Alles voor uw digitale groei
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-slate-600"
          >
            Van websites tot web applicaties, van SEO tot automatisering. 
            Wij bieden complete digitale oplossingen voor uw bedrijf.
          </motion.p>
        </div>

        {/* Services Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {services.map((service, index) => {
            const IconComponent = service.icon;
            // First row (top 4) gets special styling
            const isTopService = index < 4;
            
            return (
              <motion.div
                key={service.slug}
                variants={itemVariants}
              >
                <Link
                  href={`/diensten/${service.slug}`}
                  className="group block h-full"
                >
                  <div className={`
                    relative h-full flex flex-col rounded-2xl p-6 transition-all duration-300 overflow-hidden
                    bg-white border border-slate-200 shadow-sm
                    hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1.5
                  `}>
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
                    
                    {/* Icon */}
                    <div className={`
                      relative z-10 w-14 h-14 rounded-xl flex items-center justify-center mb-5 
                      transition-all duration-300 group-hover:scale-110 group-hover:rotate-3
                      ${isTopService 
                        ? 'bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/30' 
                        : 'bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/30'
                      }
                    `}>
                      <IconComponent className="w-7 h-7 text-white" />
                    </div>

                    {/* Title */}
                    <h3 className="relative z-10 text-xl font-bold text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors">
                      {service.shortTitle}
                    </h3>

                    {/* Description */}
                    <p className="relative z-10 text-slate-600 mb-4 flex-grow leading-relaxed">
                      {service.description}
                    </p>

                    {/* Delivery info */}
                    <div className="relative z-10 text-sm mb-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-medium">
                        {service.deliveryTime}
                      </span>
                    </div>

                    {/* Link */}
                    <div className="relative z-10 flex items-center text-indigo-600 font-semibold group-hover:gap-3 gap-2 transition-all">
                      <span>Meer info</span>
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>

        {/* CTA met psychologische elementen */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <div className="mb-6">
            <p className="text-sm text-slate-500 mb-4">
              <strong className="text-slate-900">8 verschillende diensten</strong> beschikbaar
            </p>
          </div>
          <Link
            href="/diensten"
            className="btn-secondary inline-flex items-center gap-2"
          >
            Alle diensten bekijken
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
