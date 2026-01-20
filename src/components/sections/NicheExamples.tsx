"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Eye, TrendingUp, Users, Clock } from "lucide-react";
import { nicheExamples } from "@/data/niche-examples";
import NichePreview from "@/components/ui/NichePreview";

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
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

export default function NicheExamples() {
  const [selectedCategory, setSelectedCategory] = useState<"website" | "webshop" | "webapp" | null>(null);
  
  // Get unique categories from examples
  const availableCategories = Array.from(
    new Set(nicheExamples.map((ex) => ex.category))
  ) as ("website" | "webshop" | "webapp")[];
  
  const categoryLabels: Record<"website" | "webshop" | "webapp", string> = {
    website: "Websites",
    webshop: "Webshops",
    webapp: "Web Apps",
  };
  
  const categories = availableCategories.map((id) => ({
    id,
    label: categoryLabels[id],
  }));
  
  const filteredExamples = selectedCategory
    ? nicheExamples.filter((ex) => ex.category === selectedCategory)
    : nicheExamples;

  // Psychologische elementen
  const stats = {
    projectsCompleted: 50,
    happyClients: 45,
    avgDeliveryTime: "3-4 weken",
  };

  return (
    <section className="section-padding bg-gradient-to-b from-white via-slate-50 to-white relative overflow-hidden">
      <div className="container-custom">
        {/* Header met psychologische elementen */}
        <div className="text-center max-w-4xl mx-auto mb-12">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium mb-4"
          >
            Voorbeelden per Branche
          </motion.span>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-4"
          >
            Zie hoe uw website eruit kan zien
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-slate-600 mb-8"
          >
            Ontdek voorbeelden uit verschillende branches en zie direct hoe een professionele website 
            eruit ziet voor uw sector.
          </motion.p>

          {/* Social Proof Stats - Subtiel maar aanwezig */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap justify-center gap-6 md:gap-8 mb-8"
          >
            <div className="flex items-center gap-2 text-slate-600">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="text-left">
                <div className="font-bold text-slate-900 text-lg">{stats.projectsCompleted}+</div>
                <div className="text-xs text-slate-500">Projecten</div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                <Users className="w-5 h-5 text-indigo-600" />
              </div>
              <div className="text-left">
                <div className="font-bold text-slate-900 text-lg">{stats.happyClients}+</div>
                <div className="text-xs text-slate-500">Tevreden klanten</div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <div className="text-left">
                <div className="font-bold text-slate-900 text-lg">{stats.avgDeliveryTime}</div>
                <div className="text-xs text-slate-500">Gemiddelde levertijd</div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-3 mb-12"
        >
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              selectedCategory === null
                ? "bg-indigo-600 text-white shadow-lg"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            Alles
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategory === category.id
                  ? "bg-indigo-600 text-white shadow-lg"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {category.label}
            </button>
          ))}
        </motion.div>

        {/* Examples Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
        >
          {filteredExamples.map((example) => (
            <motion.div
              key={example.id}
              variants={itemVariants}
              className="group"
            >
              <div className="card h-full flex flex-col overflow-hidden hover:shadow-xl transition-all duration-300">
                {/* Preview Image */}
                <div className="relative h-48 overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200">
                  {/* Mockup Preview */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div 
                      className="w-full h-full opacity-20"
                      style={{
                        background: `linear-gradient(135deg, ${example.colorScheme.primary} 0%, ${example.colorScheme.secondary} 100%)`,
                      }}
                    />
                  </div>
                  
                  {/* Browser Mockup with Realistic Preview */}
                  <div className="absolute inset-4 bg-white rounded-lg shadow-lg overflow-hidden">
                    <div className="h-8 bg-slate-100 flex items-center gap-2 px-3 border-b border-slate-200">
                      <div className="w-3 h-3 rounded-full bg-red-400"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                      <div className="w-3 h-3 rounded-full bg-green-400"></div>
                      <div className="flex-1 mx-2">
                        <div className="h-5 bg-slate-200 rounded px-2 flex items-center">
                          <span className="text-[8px] text-slate-500 truncate">
                            {example.industry.toLowerCase().replace(/\s+/g, "")}.nl
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="h-full overflow-hidden">
                      <NichePreview example={example} size="small" />
                    </div>
                  </div>

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-indigo-600/0 group-hover:bg-indigo-600/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="px-4 py-2 bg-white/90 backdrop-blur rounded-full flex items-center gap-2 text-sm font-medium text-slate-900">
                      <Eye className="w-4 h-4" />
                      Preview
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex-grow flex flex-col">
                  <div className="mb-3">
                    <span className="inline-block px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs font-medium mb-2">
                      {example.niche}
                    </span>
                    <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">
                      {example.industry}
                    </h3>
                    <p className="text-sm text-slate-600 mb-4">
                      {example.description}
                    </p>
                  </div>

                  {/* Key Features */}
                  <div className="mb-4 flex-grow">
                    <div className="space-y-2">
                      {example.features.slice(0, 3).map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm text-slate-600">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Price & Delivery - Subtiele urgency */}
                  <div className="pt-4 border-t border-slate-100">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="text-xs text-slate-500">Vanaf</div>
                        <div className="font-bold text-slate-900">{example.priceRange}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-slate-500">Levertijd</div>
                        <div className="font-semibold text-slate-700">{example.deliveryTime}</div>
                      </div>
                    </div>
                    
                    {/* Subtiele CTA */}
                    <Link
                      href="/offerte"
                      className="block w-full text-center py-2.5 bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-700 rounded-lg font-medium text-sm transition-all duration-200 group-hover:shadow-md"
                    >
                      Vraag offerte aan
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom CTA met psychologische elementen */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="inline-block p-8 bg-gradient-to-br from-indigo-50 to-violet-50 rounded-2xl border border-indigo-100 max-w-2xl">
            <div className="flex items-center justify-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
              <span className="text-sm font-medium text-indigo-700">
                {stats.projectsCompleted}+ succesvolle projecten
              </span>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">
              Klaar om uw website te laten bouwen?
            </h3>
            <p className="text-slate-600 mb-6">
              Vraag vandaag nog een vrijblijvende offerte aan en ontdek wat wij voor uw bedrijf kunnen betekenen.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/offerte"
                className="btn-primary inline-flex items-center justify-center gap-2"
              >
                Gratis Offerte Aanvragen
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/projecten"
                className="btn-secondary inline-flex items-center justify-center gap-2"
              >
                Bekijk alle projecten
              </Link>
            </div>
            {/* Trust Badge - Subtiel */}
            <div className="mt-6 flex items-center justify-center gap-6 text-xs text-slate-500">
              <div className="flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Vrijblijvend</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Binnen 24u reactie</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Geen verborgen kosten</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
