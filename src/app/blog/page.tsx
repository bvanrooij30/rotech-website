import { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Calendar, Clock } from "lucide-react";
import { blogArticles } from "@/data/blog-articles";
import { BreadcrumbSchema } from "@/components/seo/StructuredData";

export const metadata: Metadata = {
  title: "Blog | Tips & Kennis over Web Development",
  description: "Lees onze artikelen over web development, SEO, design en digitale trends. Praktische tips en inzichten voor uw online succes.",
  alternates: {
    canonical: "/blog",
  },
};

export default function BlogPage() {
  const featuredArticle = blogArticles[0];
  const otherArticles = blogArticles.slice(1);

  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "/" },
          { name: "Blog", url: "/blog" },
        ]}
      />

      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-20 lg:py-32">
        <div className="container-custom">
          <div className="max-w-3xl">
            <span className="inline-block px-4 py-1.5 bg-indigo-600/20 text-indigo-300 rounded-full text-sm font-medium mb-6">
              Blog & Kennisbank
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Inzichten & Tips
            </h1>
            <p className="text-xl text-slate-300">
              Praktische artikelen over web development, SEO, design en 
              digitale trends. Blijf op de hoogte van de laatste ontwikkelingen.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Article */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <Link href={`/blog/${featuredArticle.slug}`} className="group block">
            <div className="grid lg:grid-cols-2 gap-8 card p-0 overflow-hidden">
              <div className="h-64 lg:h-full bg-gradient-to-br from-indigo-600/90 to-violet-600/90 flex items-center justify-center">
                <span className="text-white/90 text-xl font-medium text-center px-8">
                  {featuredArticle.title}
                </span>
              </div>
              <div className="p-8 lg:py-12">
                <div className="flex items-center gap-4 text-sm text-slate-500 mb-4">
                  <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full font-medium">
                    {featuredArticle.category}
                  </span>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(featuredArticle.publishedAt).toLocaleDateString("nl-NL", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {featuredArticle.readTime}
                  </div>
                </div>
                <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-4 group-hover:text-indigo-600 transition-colors">
                  {featuredArticle.title}
                </h2>
                <p className="text-slate-600 mb-6 text-lg">
                  {featuredArticle.excerpt}
                </p>
                <div className="flex items-center gap-2 text-indigo-600 font-medium group-hover:gap-3 transition-all">
                  <span>Lees meer</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Other Articles */}
      <section className="section-padding bg-slate-50">
        <div className="container-custom">
          <h2 className="text-2xl font-bold text-slate-900 mb-8">Alle artikelen</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {otherArticles.map((article) => (
              <Link
                key={article.slug}
                href={`/blog/${article.slug}`}
                className="group"
              >
                <div className="card h-full">
                  <div className="h-48 -mx-6 -mt-6 mb-6 bg-gradient-to-br from-indigo-600/90 to-violet-600/90 flex items-center justify-center rounded-t-xl">
                    <span className="text-white/90 font-medium text-center px-4">
                      {article.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-500 mb-3">
                    <span className="px-2 py-0.5 bg-slate-100 rounded text-xs font-medium">
                      {article.category}
                    </span>
                    <span>{article.readTime}</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-slate-600 text-sm mb-4">
                    {article.excerpt}
                  </p>
                  <div className="flex items-center gap-2 text-indigo-600 font-medium text-sm">
                    <span>Lees artikel</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Blijf op de hoogte
            </h2>
            <p className="text-lg text-slate-600 mb-6">
              Volg ons voor meer tips en inzichten over web development 
              en digitale groei.
            </p>
            <Link href="/contact" className="btn-primary inline-flex items-center gap-2">
              Neem Contact Op
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
