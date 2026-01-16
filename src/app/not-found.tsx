"use client";

import Link from "next/link";
import { Home, ArrowLeft, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-slate-50">
      <div className="container-custom">
        <div className="max-w-2xl mx-auto text-center">
          {/* 404 Visual */}
          <div className="mb-8">
            <span className="text-9xl font-bold gradient-text">404</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Pagina niet gevonden
          </h1>
          <p className="text-lg text-slate-600 mb-8">
            De pagina die u zoekt bestaat niet of is verplaatst. 
            Controleer de URL of gebruik onderstaande links.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link
              href="/"
              className="btn-primary inline-flex items-center justify-center gap-2"
            >
              <Home className="w-5 h-5" />
              Naar Homepage
            </Link>
            <button
              onClick={() => window.history.back()}
              className="btn-secondary inline-flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Ga Terug
            </button>
          </div>

          {/* Helpful links */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center justify-center gap-2">
              <Search className="w-5 h-5 text-indigo-600" />
              Misschien zoekt u:
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { name: "Onze Diensten", href: "/diensten" },
                { name: "Projecten", href: "/projecten" },
                { name: "Prijzen", href: "/prijzen" },
                { name: "Contact", href: "/contact" },
                { name: "Offerte Aanvragen", href: "/offerte" },
                { name: "Blog", href: "/blog" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block p-4 bg-slate-50 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-colors text-slate-700"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
