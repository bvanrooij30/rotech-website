"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle } from "lucide-react";

export default function CTA() {
  return (
    <section className="section-padding bg-slate-900 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl" />
      </div>

      <div className="container-custom relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6"
          >
            Klaar om uw digitale 
            <br />
            <span className="gradient-text">ambities waar te maken?</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-slate-300 mb-10 max-w-2xl mx-auto"
          >
            Neem vandaag nog contact op voor een vrijblijvend gesprek over uw wensen en mogelijkheden. 
            Wij bespreken graag uw project en denken mee over de beste oplossing voor uw bedrijf.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-stretch sm:items-center"
          >
            <Link
              href="/offerte"
              className="btn-primary inline-flex items-center justify-center gap-2 text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 whitespace-nowrap"
            >
              Gratis Offerte Aanvragen
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/contact"
              className="btn-secondary border-white/30 text-white hover:bg-white hover:text-slate-900 inline-flex items-center justify-center gap-2 text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 whitespace-nowrap"
            >
              Neem Contact Op
            </Link>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-slate-400"
          >
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Gratis & vrijblijvend</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Reactie binnen 24 uur</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Geen verplichtingen</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
