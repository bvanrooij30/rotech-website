"use client";

import { motion } from "framer-motion";
import { MapPin, Clock, Users, Star, Shield, Award } from "lucide-react";
import Link from "next/link";

const trustItems = [
  {
    icon: MapPin,
    label: "Gevestigd in Veldhoven",
    subLabel: "Persoonlijk contact mogelijk",
    color: "indigo",
  },
  {
    icon: Clock,
    label: "Snelle Oplevering",
    subLabel: "2-4 weken doorlooptijd",
    color: "violet",
  },
  {
    icon: Users,
    label: "50+ Projecten",
    subLabel: "Tevreden klanten",
    color: "indigo",
  },
  {
    icon: Star,
    label: "5.0 Beoordeling",
    subLabel: "Google Reviews",
    color: "amber",
  },
  {
    icon: Shield,
    label: "KvK Geregistreerd",
    subLabel: "86858173",
    color: "emerald",
  },
  {
    icon: Award,
    label: "Moderne Tech",
    subLabel: "Next.js & React",
    color: "violet",
  },
];

const localAreas = [
  { name: "Veldhoven", href: "/regio/veldhoven" },
  { name: "Eindhoven", href: "/regio/eindhoven" },
  { name: "Waalre", href: "/regio/waalre" },
  { name: "Best", href: "/regio/best" },
  { name: "Helmond", href: "/regio/helmond" },
  { name: "Noord-Brabant", href: "/regio/noord-brabant" },
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
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8"
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

        {/* Local SEO Links */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center items-center gap-2 pt-6 border-t border-slate-100"
        >
          <span className="text-sm text-slate-500 mr-2">Website laten maken in:</span>
          {localAreas.map((area, index) => (
            <Link
              key={index}
              href={area.href}
              className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
            >
              {area.name}
            </Link>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
