"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ExternalLink } from "lucide-react";
import { getFeaturedProjects } from "@/data/portfolio";
import LogoWatermark from "@/components/ui/LogoWatermark";
import NichePreview from "@/components/ui/NichePreview";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
};

export default function Portfolio() {
  const featuredProjects = getFeaturedProjects();

  return (
    <section className="section-padding bg-slate-50 relative overflow-hidden">
      <LogoWatermark opacity={0.02} size={280} />
      <div className="container-custom relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium mb-4"
          >
            Projecten
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-6"
          >
            Voorbeelden van onze oplossingen
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-slate-600"
          >
            Ontdek de mogelijkheden voor uw bedrijf.
            Van eenvoudige websites tot complete B2B platforms.
          </motion.p>
        </div>

        {/* Projects Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        >
          {featuredProjects.map((project, index) => (
            <motion.div
              key={project.slug}
              variants={itemVariants}
              className={index === 0 ? "lg:col-span-2" : ""}
            >
              <Link
                href={`/projecten/${project.slug}`}
                className="group block"
              >
                <div className={`card p-0 overflow-hidden ${index === 0 ? "grid lg:grid-cols-2" : ""}`}>
                  {/* Visual Preview */}
                  <div className={`relative overflow-hidden bg-slate-900 ${index === 0 ? "h-64 lg:h-full" : "h-64"}`}>
                    {/* Browser Mockup */}
                    <div className="absolute inset-0 p-2">
                      <div className="h-full bg-slate-800 rounded-lg overflow-hidden shadow-xl">
                        {/* Browser Chrome */}
                        <div className="h-8 bg-slate-700 flex items-center gap-2 px-3 border-b border-slate-600">
                          <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
                          <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                          <div className="flex-1 mx-2">
                            <div className="h-5 bg-slate-600 rounded px-2 flex items-center">
                              <span className="text-[10px] text-slate-300 truncate">
                                {project.url ? new URL(project.url).hostname : project.client.toLowerCase().replace(/\s+/g, "") + ".nl"}
                              </span>
                            </div>
                          </div>
                        </div>
                        {/* Realistic Content Preview */}
                        <div className="h-full overflow-hidden">
                          <NichePreview project={project} size={index === 0 ? "large" : "medium"} />
                        </div>
                      </div>
                    </div>
                    
                    {/* Category badge */}
                    <div className="absolute top-4 left-4 z-10">
                      <span className="px-3 py-1 bg-white/90 backdrop-blur rounded-full text-sm font-medium text-slate-700 shadow-sm">
                        {project.categoryLabel}
                      </span>
                    </div>

                    {/* External link icon */}
                    {project.url && (
                      <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          className="p-2 bg-white/90 backdrop-blur rounded-full inline-flex shadow-sm hover:bg-white transition-colors"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            window.open(project.url, '_blank', 'noopener,noreferrer');
                          }}
                          aria-label={`Open ${project.client} website in nieuw tabblad`}
                        >
                          <ExternalLink className="w-4 h-4 text-slate-700" />
                        </button>
                      </div>
                    )}

                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-indigo-600/0 group-hover:bg-indigo-600/10 transition-colors"></div>
                  </div>

                  {/* Content */}
                  <div className="p-6 lg:p-8">
                    <div className="text-sm text-indigo-600 font-medium mb-2">
                      {project.client}
                    </div>
                    <h3 className="text-xl lg:text-2xl font-bold text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors">
                      {project.title}
                    </h3>
                    <p className="text-slate-600 mb-4">
                      {project.description}
                    </p>

                    {/* Technologies */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.technologies.slice(0, 4).map((tech) => (
                        <span
                          key={tech}
                          className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-medium"
                        >
                          {tech}
                        </span>
                      ))}
                      {project.technologies.length > 4 && (
                        <span className="px-2 py-1 text-slate-400 text-xs">
                          +{project.technologies.length - 4} meer
                        </span>
                      )}
                    </div>

                    {/* Results preview */}
                    {project.results && project.results.length > 0 && (
                      <div className="text-sm text-emerald-600 font-medium">
                        ✓ {project.results[0]}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Link
            href="/projecten"
            className="btn-primary inline-flex items-center gap-2"
          >
            Bekijk alle projecten
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
