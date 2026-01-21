import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Clock, Tag, ArrowRight } from "lucide-react";
import { blogArticles, getArticleBySlug, getAllArticleSlugs } from "@/data/blog-articles";
import { BreadcrumbSchema } from "@/components/seo/StructuredData";
import { markdownToHtml } from "@/lib/utils";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllArticleSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    return { title: "Artikel niet gevonden" };
  }

  return {
    title: article.title,
    description: article.excerpt,
    alternates: {
      canonical: `/blog/${slug}`,
    },
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: "article",
      publishedTime: article.publishedAt,
      authors: [article.author.name],
    },
  };
}

export default async function BlogArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const relatedArticles = blogArticles
    .filter((a) => a.slug !== slug)
    .slice(0, 2);

  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "/" },
          { name: "Blog", url: "/blog" },
          { name: article.title, url: `/blog/${slug}` },
        ]}
      />

      {/* Article structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: article.title,
            description: article.excerpt,
            datePublished: article.publishedAt,
            author: {
              "@type": "Organization",
              name: article.author.name,
            },
            publisher: {
              "@type": "Organization",
              name: "RoTech Development",
              logo: {
                "@type": "ImageObject",
                url: "https://ro-techdevelopment.dev/images/rotech/rotech-logo.svg",
              },
            },
          }),
        }}
      />

      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-16 lg:py-24">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8"
            >
              <ArrowLeft className="w-4 h-4" />
              Terug naar Blog
            </Link>

            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400 mb-6">
              <span className="px-3 py-1 bg-indigo-600/20 text-indigo-300 rounded-full font-medium">
                {article.category}
              </span>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {new Date(article.publishedAt).toLocaleDateString("nl-NL", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {article.readTime}
              </div>
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              {article.title}
            </h1>

            <p className="text-xl text-slate-300">{article.excerpt}</p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto">
            <article className="prose prose-lg prose-slate max-w-none prose-headings:font-bold prose-a:text-indigo-600 prose-a:no-underline hover:prose-a:underline">
              <div dangerouslySetInnerHTML={{ __html: markdownToHtml(article.content) }} />
            </article>

            {/* Tags */}
            <div className="mt-12 pt-8 border-t border-slate-200">
              <div className="flex items-center gap-3 flex-wrap">
                <Tag className="w-5 h-5 text-slate-400" />
                {article.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Author */}
            <div className="mt-8 p-6 bg-slate-50 rounded-xl flex items-center gap-4">
              <div className="w-16 h-16 rounded-full gradient-bg flex items-center justify-center text-white font-bold text-xl">
                R
              </div>
              <div>
                <div className="font-semibold text-slate-900">{article.author.name}</div>
                <div className="text-slate-600">{article.author.role}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Articles */}
      <section className="section-padding bg-slate-50">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-slate-900 mb-8">
              Gerelateerde artikelen
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              {relatedArticles.map((related) => (
                <Link
                  key={related.slug}
                  href={`/blog/${related.slug}`}
                  className="card group"
                >
                  <span className="text-sm text-indigo-600 font-medium">
                    {related.category}
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 mt-2 mb-3 group-hover:text-indigo-600 transition-colors">
                    {related.title}
                  </h3>
                  <p className="text-slate-600 text-sm mb-4">
                    {related.excerpt}
                  </p>
                  <div className="flex items-center gap-2 text-indigo-600 font-medium text-sm">
                    <span>Lees meer</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Hulp nodig bij uw project?
            </h2>
            <p className="text-lg text-slate-600 mb-8">
              Wij helpen u graag met het bouwen van uw website, webshop of 
              web applicatie.
            </p>
            <Link href="/offerte" className="btn-primary inline-flex items-center gap-2">
              Offerte Aanvragen
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
