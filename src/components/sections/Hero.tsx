"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";

const trustBadges = [
  "KvK Geregistreerd",
  "Gratis Adviesgesprek",
  "Vaste Projectprijs",
];

export default function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-indigo-50/50 to-violet-50/50" />
      
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ duration: 1 }}
          className="absolute top-20 right-[10%] w-72 h-72 bg-indigo-400/20 rounded-full blur-3xl"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="absolute bottom-20 left-[5%] w-96 h-96 bg-violet-400/20 rounded-full blur-3xl"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-400/10 rounded-full blur-3xl"
        />
      </div>

      {/* Grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%234F46E5' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="container-custom relative z-10 py-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Logo & Brand Name - Prominent Display */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            {/* Logo - Large & Prominent */}
            <div className="relative inline-block mb-6">
              <Image
                src="/images/rotech/rotech-logo.svg"
                alt="RoTech Development Logo"
                width={200}
                height={200}
                className="w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 mx-auto"
                priority
              />
              {/* Glow effect behind logo */}
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-violet-500/20 rounded-full blur-3xl -z-10 scale-125" />
            </div>
            
            {/* Brand Name */}
            <h2 className="text-2xl sm:text-3xl font-bold mb-2">
              <span className="text-slate-900">Ro</span>
              <span className="gradient-text">Tech</span>
              <span className="text-slate-800"> Development</span>
            </h2>
            
            {/* Tagline Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur rounded-full border border-indigo-100 shadow-sm">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-medium text-slate-700">
                Web Development & Digital Solutions
              </span>
            </div>
          </motion.div>

          {/* Main heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-slate-900 mb-6 leading-tight"
          >
            Uw Digitale{" "}
            <span className="gradient-text">Groeipartner</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-lg sm:text-xl text-slate-600 mb-10 max-w-2xl mx-auto"
          >
            Websites en webshops die niet alleen mooi zijn, maar ook{" "}
            <strong className="text-slate-800">klanten opleveren</strong>. 
            Gebouwd met moderne technologie, geoptimaliseerd voor zoekmachines 
            en ontworpen om te converteren.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
          >
            <Link
              href="/offerte"
              className="btn-primary inline-flex items-center justify-center gap-2 text-lg px-8 py-4"
            >
              Gratis Offerte Aanvragen
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/projecten"
              className="btn-gradient inline-flex items-center justify-center gap-2 text-lg px-8 py-4"
            >
              Bekijk Voorbeelden
            </Link>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="flex flex-wrap justify-center gap-6"
          >
            {trustBadges.map((badge, index) => (
              <div
                key={index}
                className="flex items-center gap-2 text-slate-600"
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <span className="text-sm font-medium">{badge}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-6 h-10 border-2 border-slate-300 rounded-full flex justify-center pt-2"
          >
            <div className="w-1.5 h-1.5 bg-slate-400 rounded-full" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
