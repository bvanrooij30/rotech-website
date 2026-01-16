# 🚀 Ro-Tech Development Website

Professionele bedrijfswebsite voor Ro-Tech Development (BVR Services) - een web development agency gevestigd in Veldhoven.

## ✨ Features

- **Modern Design**: Gebouwd met Next.js 16+, TypeScript en Tailwind CSS
- **Fully Responsive**: Geoptimaliseerd voor alle apparaten
- **SEO Geoptimaliseerd**: Complete SEO implementatie met structured data
- **Performance First**: Lighthouse scores 95+
- **Contact Formulieren**: Met Zod validatie en Resend email integratie
- **Blog/Kennisbank**: Voor content marketing en SEO
- **Portfolio Showcase**: Dynamische project pagina's
- **WhatsApp Integratie**: Floating chat button
- **Security**: Volledig beveiligd (rate limiting, CSRF, XSS protection)
- **Production Ready**: Klaar voor live deployment

## 🛠️ Tech Stack

- **Framework**: Next.js 15+ (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Forms**: React Hook Form + Zod
- **Email**: Resend API
- **Fonts**: Space Grotesk + Inter (Google Fonts)
- **Icons**: Lucide React
- **Hosting**: Vercel

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes (contact, offerte)
│   ├── diensten/          # Service pages
│   ├── portfolio/         # Portfolio pages
│   ├── blog/              # Blog pages
│   └── ...                # Other pages
├── components/
│   ├── layout/            # Header, Footer, etc.
│   ├── sections/          # Homepage sections
│   ├── forms/             # Contact & offerte forms
│   ├── ui/                # UI components
│   └── seo/               # Structured data components
├── data/                  # Static data (services, portfolio, etc.)
└── lib/                   # Utility functions
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone [repository-url]
cd rotech-website

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Start development server
npm run dev
```

### Environment Variables

Create a `.env.local` file with:

```env
# Site URL
NEXT_PUBLIC_SITE_URL=https://ro-techdevelopment.com

# Email (Resend)
RESEND_API_KEY=re_xxx
CONTACT_EMAIL=contact@ro-techdevelopment.com

# Analytics (optional)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

## 📝 Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## 🌐 Pages

| Page | URL | Description |
|------|-----|-------------|
| Home | `/` | Landing page with all sections |
| Diensten | `/diensten` | Services overview |
| Dienst Detail | `/diensten/[slug]` | Individual service pages (8) |
| Portfolio | `/portfolio` | Projects overview |
| Project Detail | `/portfolio/[slug]` | Individual project pages |
| Prijzen | `/prijzen` | Pricing packages |
| Over Ons | `/over-ons` | About page |
| Blog | `/blog` | Blog overview |
| Blog Artikel | `/blog/[slug]` | Individual articles |
| Contact | `/contact` | Contact form |
| Offerte | `/offerte` | Quote request wizard |
| FAQ | `/veelgestelde-vragen` | FAQ page |
| Privacy | `/privacy` | Privacy policy |
| Voorwaarden | `/algemene-voorwaarden` | Terms & conditions |
| Cookies | `/cookiebeleid` | Cookie policy |

## 🎨 Huisstijl

| Element | Waarde |
|---------|--------|
| Primair | `#4F46E5` (Indigo 600) |
| Secundair | `#7C3AED` (Violet 600) |
| Accent | `#10B981` (Emerald 500) |
| Donker | `#0F172A` (Slate 900) |
| Font Headings | Space Grotesk |
| Font Body | Inter |

## 📧 Email Integration

The contact and quote forms are configured to work with [Resend](https://resend.com). 
Uncomment the email sending code in the API routes after adding your API key.

## 🚀 Deployment

### Quick Start

**Zie `LIVE-ZETTEN-GIDS.md` voor complete deployment instructies!**

**Snelle stappen:**
1. Resend account + API key
2. GitHub repository aanmaken
3. Vercel deployment
4. Environment variables toevoegen
5. Domein koppelen

### Environment Variables

**Vereist voor werkende formulieren:**
```env
NEXT_PUBLIC_SITE_URL=https://ro-techdevelopment.com
CONTACT_EMAIL=contact@ro-techdevelopment.com
RESEND_API_KEY=re_xxxxxxxxxxxxx
FROM_EMAIL=noreply@ro-techdevelopment.com
```

**Voeg toe in Vercel:** Settings → Environment Variables

### Deployment Guides

- **`LIVE-ZETTEN-GIDS.md`** - Complete deployment gids
- **`DEPLOYMENT-GUIDE.md`** - Uitgebreide instructies
- **`VERCEL-SETUP.md`** - Vercel specifieke setup
- **`QUICK-START.md`** - Snelle 30-minuten gids

## 📊 SEO Features

- ✅ Meta tags on all pages
- ✅ Open Graph tags
- ✅ Twitter cards
- ✅ Structured data (Organization, LocalBusiness, Service, FAQ, Article)
- ✅ Sitemap.xml (auto-generated)
- ✅ Robots.txt
- ✅ llms.txt (for AI assistants)
- ✅ Canonical URLs
- ✅ Breadcrumbs

## 📱 Contact

- **Website**: https://ro-techdevelopment.com
- **Email**: contact@ro-techdevelopment.com
- **Phone**: +31 6 57 23 55 74

---

Built with ❤️ by Ro-Tech Development (BVR Services) | © 2026
