"use client";

import { motion } from "framer-motion";
import { Zap, Clock, Users, Star, Shield, Award } from "lucide-react";

const trustItems = [
  {
    icon: Zap,
    label: "Performance First",
    subLabel: "< 2 sec laadtijd",
    color: "indigo",
  },
  {
    icon: Clock,
    label: "2-4 Weken Live",
    subLabel: "Vaste deadline",
    color: "violet",
  },
  {
    icon: Users,
    label: "1-op-1 Contact",
    subLabel: "Geen tussenlagen",
    color: "indigo",
  },
  {
    icon: Star,
    label: "SEO Inbegrepen",
    subLabel: "Vindbaar in Google",
    color: "amber",
  },
  {
    icon: Shield,
    label: "Vaste Prijs",
    subLabel: "Geen verrassingen",
    color: "emerald",
  },
  {
    icon: Award,
    label: "Enterprise Tech",
    subLabel: "Next.js & React",
    color: "violet",
  },
];

export default function TrustBadges() {
  return (
    <section className="py-12 bg-white border-b border-slate-100">
      <div className="container-custom">
        {/* Trust Items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
        >
          {trustItems.map((item, index) => {
            const IconComponent = item.icon;
            const colorClasses = {
              indigo: "bg-indigo-50 text-indigo-600",
              violet: "bg-violet-50 text-violet-600",
              amber: "bg-amber-50 text-amber-600",
              emerald: "bg-emerald-50 text-emerald-600",
            };
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="flex flex-col items-center text-center p-4 rounded-xl hover:bg-slate-50 transition-colors"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${colorClasses[item.color as keyof typeof colorClasses]}`}>
                  <IconComponent className="w-6 h-6" />
                </div>
                <span className="font-semibold text-slate-900 text-sm">{item.label}</span>
                <span className="text-xs text-slate-500">{item.subLabel}</span>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
