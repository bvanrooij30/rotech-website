import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ArrowLeft, ExternalLink, Check, Star, Quote } from "lucide-react";
import { projects, getProjectBySlug, getAllProjectSlugs } from "@/data/portfolio";
import { BreadcrumbSchema } from "@/components/seo/StructuredData";
import CTA from "@/components/sections/CTA";
import NichePreview from "@/components/ui/NichePreview";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllProjectSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    return { title: "Project niet gevonden" };
  }

  return {
    title: `${project.title} | Portfolio`,
    description: project.description,
    alternates: {
      canonical: `/projecten/${slug}`,
    },
    openGraph: {
      title: `${project.title} | RoTech Development Projecten`,
      description: project.description,
      type: "article",
    },
  };
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  const otherProjects = projects.filter((p) => p.slug !== slug).slice(0, 2);

  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "/" },
          { name: "Projecten", url: "/projecten" },
          { name: project.title, url: `/projecten/${slug}` },
        ]}
      />

      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-16 lg:py-24">
        <div className="container-custom">
          <Link
            href="/projecten"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Alle projecten
          </Link>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-indigo-600/20 text-indigo-300 rounded-full text-sm font-medium">
                  {project.categoryLabel}
                </span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-400">{project.completedDate}</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                {project.title}
              </h1>
              <p className="text-lg text-indigo-300 mb-4">{project.client}</p>
              <p className="text-xl text-slate-300 mb-8">
                {project.longDescription}
              </p>

              <div className="flex flex-wrap gap-4">
                {project.url && (
                  <a
                    href={project.url.startsWith("http") ? project.url : `https://${project.url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary inline-flex items-center gap-2"
                  >
                    Bekijk Live
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
                <Link 
                  href="/offerte" 
                  className="btn-secondary border-white/30 text-white hover:bg-white hover:text-slate-900 inline-flex items-center gap-2"
                >
                  Vergelijkbaar project starten
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Project visual preview */}
            <div className="hidden lg:block">
              <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                {/* Browser mockup */}
                <div className="absolute inset-0 bg-slate-800 rounded-2xl">
                  {/* Browser chrome */}
                  <div className="h-10 bg-slate-700 flex items-center gap-2 px-4 border-b border-slate-600">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <div className="flex-1 mx-4">
                      <div className="h-6 bg-slate-600 rounded px-3 flex items-center">
                        <span className="text-xs text-slate-300">
                          {project.url ? new URL(project.url).hostname : project.client.toLowerCase().replace(/\s+/g, "") + ".nl"}
                        </span>
                      </div>
                    </div>
                  </div>
                  {/* Realistic Content Preview */}
                  <div className="h-full overflow-hidden">
                    <NichePreview project={project} size="large" />
                  </div>
                </div>
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 to-transparent pointer-events-none"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Visual Preview Section */}
      {project.images && project.images.length > 0 && (
        <section className="section-padding bg-slate-50">
          <div className="container-custom">
            <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">
              Visuele Preview
            </h2>
            <div className="max-w-6xl mx-auto">
              <div className="grid md:grid-cols-2 gap-6">
                {project.images.map((imagePath, index) => (
                  <div key={index} className="relative group">
                    <div className="relative aspect-video bg-slate-800 rounded-xl overflow-hidden shadow-xl border border-slate-200">
                      {/* Browser mockup */}
                      <div className="absolute inset-0 p-2">
                        <div className="h-full bg-slate-700 rounded-lg overflow-hidden">
                          {/* Browser chrome */}
                          <div className="h-8 bg-slate-600 flex items-center gap-2 px-3 border-b border-slate-500">
                            <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
                            <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                            <div className="flex-1 mx-2">
                              <div className="h-5 bg-slate-500 rounded px-2 flex items-center">
                                <span className="text-[10px] text-slate-200">
                                  {project.url ? new URL(project.url).hostname : project.client.toLowerCase().replace(/\s+/g, "") + ".nl"}
                                </span>
                              </div>
                            </div>
                          </div>
                          {/* Realistic Content Preview */}
                          <div className="h-full overflow-hidden">
                            <NichePreview project={project} size="medium" />
                          </div>
                        </div>
                      </div>
                      {/* Hover effect */}
                      <div className="absolute inset-0 bg-indigo-600/0 group-hover:bg-indigo-600/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <span className="px-4 py-2 bg-white/90 backdrop-blur rounded-full text-sm font-medium text-slate-900">
                          Preview {index + 1}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Challenge & Solution */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-6">
                De Uitdaging
              </h2>
              <p className="text-lg text-slate-600 leading-relaxed">
                {project.challenge}
              </p>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-6">
                Onze Oplossing
              </h2>
              <p className="text-lg text-slate-600 leading-relaxed">
                {project.solution}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Technologies */}
      <section className="section-padding bg-slate-50">
        <div className="container-custom">
          <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">
            Gebruikte Technologieën
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            {project.technologies.map((tech) => (
              <span
                key={tech}
                className="px-6 py-3 bg-white rounded-xl text-slate-700 font-medium shadow-sm border border-slate-100"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">
              Behaalde Resultaten
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {project.results.map((result, index) => (
                <div
                  key={index}
                  className="flex items-start gap-4 p-6 bg-emerald-50 rounded-xl border border-emerald-100"
                >
                  <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
                    <Check className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-lg text-slate-800 font-medium">
                    {result}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial */}
      {project.testimonial && (
        <section className="section-padding bg-gradient-to-br from-indigo-600 to-violet-600 text-white">
          <div className="container-custom">
            <div className="max-w-4xl mx-auto text-center">
              <Quote className="w-16 h-16 mx-auto mb-8 text-white/30" />
              <blockquote className="text-2xl md:text-3xl font-medium mb-8 leading-relaxed">
                &ldquo;{project.testimonial.quote}&rdquo;
              </blockquote>
              <div className="flex items-center justify-center gap-4">
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-xl font-bold">
                  {project.testimonial.author.split(" ").map((n) => n[0]).join("")}
                </div>
                <div className="text-left">
                  <div className="font-semibold text-lg">
                    {project.testimonial.author}
                  </div>
                  <div className="text-indigo-200">
                    {project.testimonial.role}
                  </div>
                </div>
              </div>
              <div className="flex justify-center gap-1 mt-6">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Other Projects */}
      <section className="section-padding bg-slate-50">
        <div className="container-custom">
          <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">
            Bekijk ook deze projecten
          </h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {otherProjects.map((otherProject) => (
              <Link
                key={otherProject.slug}
                href={`/projecten/${otherProject.slug}`}
                className="group"
              >
                <div className="card p-0 overflow-hidden">
                  <div className="h-48 bg-gradient-to-br from-indigo-600/90 to-violet-600/90 flex items-center justify-center">
                    <span className="text-white/90 text-lg font-medium">
                      {otherProject.title}
                    </span>
                  </div>
                  <div className="p-6">
                    <div className="text-sm text-indigo-600 font-medium mb-1">
                      {otherProject.categoryLabel}
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {otherProject.title}
                    </h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <CTA />
    </>
  );
}
