"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ArrowRight } from "lucide-react";
import { faqItems, faqCategories, getFAQByCategory } from "@/data/faq";
import { FAQSchema, BreadcrumbSchema } from "@/components/seo/StructuredData";

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState<string>("algemeen");
  const [openId, setOpenId] = useState<string | null>(null);

  const currentItems = getFAQByCategory(activeCategory as "algemeen" | "prijzen" | "technisch" | "proces");

  return (
    <>
      <FAQSchema items={faqItems.map((item) => ({ question: item.question, answer: item.answer }))} />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "/" },
          { name: "Veelgestelde Vragen", url: "/veelgestelde-vragen" },
        ]}
      />

      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-20 lg:py-32">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <span className="inline-block px-4 py-1.5 bg-indigo-600/20 text-indigo-300 rounded-full text-sm font-medium mb-6">
              FAQ
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Veelgestelde Vragen
            </h1>
            <p className="text-xl text-slate-300">
              Antwoorden op de meest gestelde vragen over onze diensten, 
              prijzen en werkwijze.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            {/* Category tabs */}
            <div className="flex flex-wrap gap-3 mb-12 justify-center">
              {faqCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setActiveCategory(cat.id);
                    setOpenId(null);
                  }}
                  className={`px-5 py-2.5 rounded-full font-medium transition-all ${
                    activeCategory === cat.id
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* FAQ items */}
            <div className="space-y-4">
              {currentItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:border-indigo-300 transition-all"
                >
                  <button
                    onClick={() => setOpenId(openId === item.id ? null : item.id)}
                    className="w-full flex items-center justify-between p-6 text-left hover:bg-slate-50 transition-colors"
                    aria-expanded={openId === item.id}
                  >
                    <span className="font-semibold text-slate-900 pr-4 text-lg">
                      {item.question}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-200 ${
                        openId === item.id ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  <AnimatePresence>
                    {openId === item.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-6 text-slate-600 leading-relaxed">
                          {item.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Still have questions */}
      <section className="section-padding bg-slate-50">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Staat uw vraag er niet tussen?
            </h2>
            <p className="text-lg text-slate-600 mb-8">
              Neem gerust contact met ons op. Wij beantwoorden uw vragen 
              graag persoonlijk.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact" className="btn-primary inline-flex items-center justify-center gap-2">
                Contact Opnemen
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/offerte" className="btn-secondary inline-flex items-center justify-center gap-2">
                Offerte Aanvragen
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
