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
          {services.map((service) => {
            const IconComponent = service.icon;
            return (
              <motion.div
                key={service.slug}
                variants={itemVariants}
              >
                <Link
                  href={`/diensten/${service.slug}`}
                  className="group block h-full"
                >
                  <div className="card h-full flex flex-col">
                    {/* Icon */}
                    <div className="w-14 h-14 rounded-xl gradient-bg flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                      <IconComponent className="w-7 h-7 text-white" />
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors">
                      {service.shortTitle}
                    </h3>

                    {/* Description */}
                    <p className="text-slate-600 mb-4 flex-grow">
                      {service.description}
                    </p>

                    {/* Delivery info */}
                    <div className="text-sm text-slate-500 mb-4">
                      <span className="font-semibold text-slate-800">{service.deliveryTime}</span>
                    </div>

                    {/* Link */}
                    <div className="flex items-center text-indigo-600 font-medium group-hover:gap-3 gap-2 transition-all">
                      <span>Meer info</span>
                      <ArrowRight className="w-4 h-4" />
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
