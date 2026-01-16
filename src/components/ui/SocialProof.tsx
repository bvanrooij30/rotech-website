"use client";

import { motion } from "framer-motion";
import { CheckCircle2, TrendingUp, Users, Clock, Award } from "lucide-react";

interface SocialProofProps {
  variant?: "compact" | "detailed";
  className?: string;
}

/**
 * Subtle social proof component
 * Uses psychological principles: authority, social proof, scarcity
 */
export default function SocialProof({ variant = "compact", className = "" }: SocialProofProps) {
  const stats = {
    projectsCompleted: 50,
    happyClients: 45,
    avgDeliveryTime: "3-4 weken",
    satisfactionRate: "98%",
  };

  if (variant === "compact") {
    return (
      <div className={`flex flex-wrap justify-center gap-4 ${className}`}>
        <div className="flex items-center gap-2 text-slate-600">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span className="text-sm">
            <strong className="text-slate-900">{stats.projectsCompleted}+</strong> projecten
          </span>
        </div>
        <div className="flex items-center gap-2 text-slate-600">
          <Users className="w-4 h-4 text-indigo-500" />
          <span className="text-sm">
            <strong className="text-slate-900">{stats.happyClients}+</strong> tevreden klanten
          </span>
        </div>
        <div className="flex items-center gap-2 text-slate-600">
          <Award className="w-4 h-4 text-amber-500" />
          <span className="text-sm">
            <strong className="text-slate-900">{stats.satisfactionRate}</strong> tevredenheid
          </span>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`grid grid-cols-2 md:grid-cols-4 gap-4 ${className}`}
    >
      <div className="text-center p-4 bg-white rounded-xl border border-slate-100">
        <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3">
          <CheckCircle2 className="w-6 h-6 text-emerald-600" />
        </div>
        <div className="text-2xl font-bold text-slate-900 mb-1">{stats.projectsCompleted}+</div>
        <div className="text-xs text-slate-500">Succesvolle projecten</div>
      </div>
      <div className="text-center p-4 bg-white rounded-xl border border-slate-100">
        <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-3">
          <Users className="w-6 h-6 text-indigo-600" />
        </div>
        <div className="text-2xl font-bold text-slate-900 mb-1">{stats.happyClients}+</div>
        <div className="text-xs text-slate-500">Tevreden klanten</div>
      </div>
      <div className="text-center p-4 bg-white rounded-xl border border-slate-100">
        <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-3">
          <Clock className="w-6 h-6 text-amber-600" />
        </div>
        <div className="text-2xl font-bold text-slate-900 mb-1">{stats.avgDeliveryTime}</div>
        <div className="text-xs text-slate-500">Gemiddelde levertijd</div>
      </div>
      <div className="text-center p-4 bg-white rounded-xl border border-slate-100">
        <div className="w-12 h-12 rounded-full bg-violet-100 flex items-center justify-center mx-auto mb-3">
          <TrendingUp className="w-6 h-6 text-violet-600" />
        </div>
        <div className="text-2xl font-bold text-slate-900 mb-1">{stats.satisfactionRate}</div>
        <div className="text-xs text-slate-500">Tevredenheid</div>
      </div>
    </motion.div>
  );
}
