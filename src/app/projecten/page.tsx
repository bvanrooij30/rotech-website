import { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";
import { projects } from "@/data/portfolio";
import { BreadcrumbSchema } from "@/components/seo/StructuredData";

export const metadata: Metadata = {
  title: "Projecten | Voorbeelden van Websites, Webshops & Apps",
  description: "Bekijk voorbeelden van websites, webshops en web applicaties die we kunnen bouwen. Ontdek de mogelijkheden voor uw bedrijf.",
  keywords: ["projecten", "voorbeelden", "websites", "webshops", "web applicaties", "demo"],
  alternates: {
    canonical: "/projecten",
  },
};

const categories = [
  { id: "all", label: "Alles" },
  { id: "website", label: "Websites" },
  { id: "webshop", label: "Webshops" },
  { id: "webapp", label: "Web Apps" },
  { id: "mobile", label: "Mobile" },
];

export default function PortfolioPage() {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "/" },
          { name: "Projecten", url: "/projecten" },
        ]}
      />

      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-20 lg:py-32">
        <div className="container-custom">
          <div className="max-w-3xl">
            <span className="inline-block px-4 py-1.5 bg-indigo-600/20 text-indigo-300 rounded-full text-sm font-medium mb-6">
              Projecten
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Voorbeelden van wat wij kunnen bouwen
            </h1>
            <p className="text-xl text-slate-300">
              Ontdek de mogelijkheden. Van eenvoudige websites tot complete 
              B2B platforms - bekijk voorbeelden van onze oplossingen per pakket.
            </p>
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          {/* Category filters - for future interactivity */}
          <div className="flex flex-wrap gap-3 mb-12 justify-center">
            {categories.map((cat) => (
              <button
                key={cat.id}
                className={`px-5 py-2 rounded-full font-medium transition-all ${
                  cat.id === "all"
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Projects */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {projects.map((project, index) => (
              <Link
                key={project.slug}
                href={`/projecten/${project.slug}`}
                className={`group ${index === 0 ? "md:col-span-2" : ""}`}
              >
                <div className={`card p-0 overflow-hidden ${index === 0 ? "grid md:grid-cols-2" : ""}`}>
                  {/* Image placeholder */}
                  <div className={`relative overflow-hidden ${index === 0 ? "h-72 md:h-full" : "h-64"}`}>
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/90 to-violet-600/90 flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                      <span className="text-white/90 text-xl font-medium text-center px-4">
                        {project.title}
                      </span>
                    </div>

                    {/* Category badge */}
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 bg-white/90 backdrop-blur rounded-full text-sm font-medium text-slate-700">
                        {project.categoryLabel}
                      </span>
                    </div>

                    {/* External link */}
                    {project.url && (
                      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="p-2 bg-white/90 backdrop-blur rounded-full inline-flex">
                          <ExternalLink className="w-4 h-4 text-slate-700" />
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6 lg:p-8">
                    <div className="text-sm text-indigo-600 font-medium mb-2">
                      {project.client}
                    </div>
                    <h2 className="text-xl lg:text-2xl font-bold text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors">
                      {project.title}
                    </h2>
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

                    {/* Results */}
                    {project.results.length > 0 && (
                      <div className="text-sm text-emerald-600 font-medium">
                        ✓ {project.results[0]}
                      </div>
                    )}

                    {/* View link */}
                    <div className="mt-4 flex items-center gap-2 text-indigo-600 font-medium group-hover:gap-3 transition-all">
                      <span>Bekijk project</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-slate-50">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
              Klaar om uw project te starten?
            </h2>
            <p className="text-lg text-slate-600 mb-8">
              Laat ons weten wat u in gedachten heeft. Wij maken graag een 
              vrijblijvende offerte op maat.
            </p>
            <Link href="/offerte" className="btn-primary inline-flex items-center gap-2">
              Offerte Aanvragen
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
