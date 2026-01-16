import Link from "next/link";
import Image from "next/image";
import { Mail, Phone, MapPin, Linkedin, Github, Twitter } from "lucide-react";

const footerLinks = {
  diensten: [
    { name: "Website Laten Maken", href: "/diensten/website-laten-maken" },
    { name: "Webshop Laten Maken", href: "/diensten/webshop-laten-maken" },
    { name: "Web Applicatie", href: "/diensten/web-applicatie-ontwikkeling" },
    { name: "Mobile App", href: "/diensten/mobile-app-ontwikkeling" },
    { name: "SEO Optimalisatie", href: "/diensten/seo-optimalisatie" },
    { name: "Website Onderhoud", href: "/diensten/website-onderhoud" },
  ],
  bedrijf: [
    { name: "Over Ons", href: "/over-ons" },
    { name: "Projecten", href: "/projecten" },
    { name: "Prijzen", href: "/prijzen" },
    { name: "Blog", href: "/blog" },
    { name: "FAQ", href: "/veelgestelde-vragen" },
    { name: "Contact", href: "/contact" },
  ],
  juridisch: [
    { name: "Privacy", href: "/privacy" },
    { name: "Algemene Voorwaarden", href: "/algemene-voorwaarden" },
    { name: "Cookiebeleid", href: "/cookiebeleid" },
    { name: "Disclaimer", href: "/disclaimer" },
  ],
};

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-white">
      {/* Main Footer */}
      <div className="container-custom py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block mb-6 group relative">
              <Image
                src="/images/rotech/rotech-logo.svg"
                alt="RoTech Development"
                width={160}
                height={40}
                className="h-10 w-auto brightness-0 invert transition-transform duration-300 group-hover:scale-105 relative z-10"
              />
              {/* Subtle gold accent on hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300 bg-gradient-to-r from-amber-400 to-amber-500 blur-xl -z-10" />
            </Link>
            <p className="text-slate-400 mb-6 max-w-sm">
              Professionele websites, webshops en web applicaties op maat. 
              Wij helpen bedrijven groeien met moderne digitale oplossingen.
            </p>
            <div className="space-y-3">
              <a 
                href="tel:+31657235574" 
                className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors"
              >
                <Phone className="w-5 h-5 text-amber-400" />
                +31 6 57 23 55 74
              </a>
              <a 
                href="mailto:contact@ro-techdevelopment.com" 
                className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors"
              >
                <Mail className="w-5 h-5 text-amber-400" />
                contact@ro-techdevelopment.com
              </a>
              <div className="flex items-center gap-3 text-slate-400">
                <MapPin className="w-5 h-5 text-amber-400" />
                Veldhoven, Nederland
              </div>
            </div>
          </div>

          {/* Diensten */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Diensten</h3>
            <ul className="space-y-3">
              {footerLinks.diensten.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Bedrijf */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Bedrijf</h3>
            <ul className="space-y-3">
              {footerLinks.bedrijf.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Juridisch */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Juridisch</h3>
            <ul className="space-y-3">
              {footerLinks.juridisch.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Social Links - Only show if actual links are available */}
            {/* Uncomment and update when social media profiles are created
            <div className="mt-8">
              <h3 className="font-semibold text-lg mb-4">Volg Ons</h3>
              <div className="flex gap-3">
                <a
                  href="https://linkedin.com/company/ro-tech-development"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-white/5 rounded-lg hover:bg-indigo-600 transition-colors"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
              </div>
            </div>
            */}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="container-custom py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-slate-400 text-sm">
              © {currentYear} Ro-Tech Development (BVR Services). Alle rechten voorbehouden.
            </div>
            <div className="text-slate-500 text-sm">
              BVR Services | KvK: 86858173 | BTW: NL004321198B83
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
