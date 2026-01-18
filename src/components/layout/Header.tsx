"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronDown, Phone, Mail } from "lucide-react";

const navigation = [
  { name: "Home", href: "/" },
  {
    name: "Diensten",
    href: "/diensten",
    submenu: [
      { name: "Website Laten Maken", href: "/diensten/website-laten-maken" },
      { name: "Webshop Laten Maken", href: "/diensten/webshop-laten-maken" },
      { name: "Web Applicatie", href: "/diensten/web-applicatie-ontwikkeling" },
      { name: "Progressive Web App", href: "/diensten/progressive-web-app" },
      { name: "SEO Optimalisatie", href: "/diensten/seo-optimalisatie" },
      { name: "Website Onderhoud", href: "/diensten/website-onderhoud" },
      { name: "Digital Process Automation", href: "/diensten/digital-process-automation" },
      { name: "API Integraties", href: "/diensten/api-integraties" },
    ],
  },
  { name: "Projecten", href: "/projecten" },
  { name: "Prijzen", href: "/prijzen" },
  { name: "Over Ons", href: "/over-ons" },
  { name: "Blog", href: "/blog" },
  { name: "Contact", href: "/contact" },
];

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* Top bar */}
      <div className="bg-slate-900 text-white py-2 hidden lg:block">
        <div className="container-custom flex justify-between items-center text-sm">
          <div className="flex items-center gap-6">
            <a href="tel:+31657235574" className="flex items-center gap-2 hover:text-indigo-400 transition-colors">
              <Phone className="w-4 h-4" />
              <span>+31 6 57 23 55 74</span>
            </a>
            <a href="mailto:contact@ro-techdevelopment.dev" className="flex items-center gap-2 hover:text-indigo-400 transition-colors">
              <Mail className="w-4 h-4" />
              <span>contact@ro-techdevelopment.dev</span>
            </a>
          </div>
          <div className="text-slate-400">
            Veldhoven & heel Nederland
          </div>
        </div>
      </div>

      {/* Main header */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-white/95 backdrop-blur-md shadow-lg"
            : "bg-white"
        }`}
      >
        <div className="container-custom">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <Image
                src="/images/rotech/rotech-logo.svg"
                alt="RoTech Development"
                width={180}
                height={45}
                priority
                className="h-10 w-auto"
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navigation.map((item) => (
                <div
                  key={item.name}
                  className="relative"
                  onMouseEnter={() => item.submenu && setActiveSubmenu(item.name)}
                  onMouseLeave={() => setActiveSubmenu(null)}
                >
                  <Link
                    href={item.href}
                    className={`px-4 py-2 rounded-lg font-medium text-slate-700 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-200 flex items-center gap-1 ${
                      item.submenu ? "pr-2" : ""
                    }`}
                  >
                    {item.name}
                    {item.submenu && (
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-200 ${
                          activeSubmenu === item.name ? "rotate-180" : ""
                        }`}
                      />
                    )}
                  </Link>

                  {/* Submenu */}
                  {item.submenu && (
                    <AnimatePresence>
                      {activeSubmenu === item.name && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          transition={{ duration: 0.2 }}
                          className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-100 py-2 overflow-hidden"
                        >
                          {item.submenu.map((subItem) => (
                            <Link
                              key={subItem.name}
                              href={subItem.href}
                              className="block px-4 py-2.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                            >
                              {subItem.name}
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}
                </div>
              ))}
            </nav>

            {/* CTA Button */}
            <div className="hidden lg:flex items-center gap-4">
              <Link
                href="/offerte"
                className="btn-primary inline-flex items-center gap-2"
              >
                Gratis Offerte
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
              aria-label="Menu openen"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden bg-white border-t border-slate-100 overflow-hidden"
            >
              <div className="container-custom py-4">
                <nav className="flex flex-col gap-1">
                  {navigation.map((item) => (
                    <div key={item.name}>
                      <Link
                        href={item.href}
                        onClick={() => !item.submenu && setIsMobileMenuOpen(false)}
                        className="block px-4 py-3 rounded-lg font-medium text-slate-700 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                      >
                        {item.name}
                      </Link>
                      {item.submenu && (
                        <div className="ml-4 border-l-2 border-slate-100 pl-4">
                          {item.submenu.map((subItem) => (
                            <Link
                              key={subItem.name}
                              href={subItem.href}
                              onClick={() => setIsMobileMenuOpen(false)}
                              className="block px-4 py-2 text-sm text-slate-600 hover:text-indigo-600 transition-colors"
                            >
                              {subItem.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </nav>

                <div className="mt-4 pt-4 border-t border-slate-100">
                  <Link
                    href="/offerte"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="btn-primary w-full text-center block"
                  >
                    Gratis Offerte Aanvragen
                  </Link>
                </div>

                <div className="mt-4 flex flex-col gap-2 text-sm text-slate-600">
                  <a href="tel:+31657235574" className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    +31 6 57 23 55 74
                  </a>
                  <a href="mailto:contact@ro-techdevelopment.dev" className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    contact@ro-techdevelopment.dev
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
