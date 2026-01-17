# 🏢 MASTER PROMPT: BUSINESS WEBSITE

## Pakket Informatie
- **Pakket:** Business Website (Professionele Bedrijfswebsite)
- **Prijsrange:** Vanaf €2.497
- **Doorlooptijd:** 2-4 weken
- **Pagina's:** 5-10 pagina's
- **Inclusief:** CMS, Blog, Geavanceerde SEO

---

## 📋 KLANTGEGEVENS (INVULLEN VOOR ELKE OPDRACHT)

```
=== BEDRIJFSINFORMATIE ===
BEDRIJFSNAAM: [Invullen]
TAGLINE/SLOGAN: [Invullen - optioneel]
CONTACTPERSOON: [Invullen]
EMAIL: [Invullen]
TELEFOON: [Invullen]
ADRES: [Invullen]
POSTCODE + PLAATS: [Invullen]
KVK: [Invullen]
BTW: [Invullen - optioneel]

=== BEDRIJFSDETAILS ===
TYPE BEDRIJF: [Bijv: Dienstverlener, Installatiebedrijf, Adviesbureau]
BRANCHE: [Invullen]
OPGERICHT: [Jaar]
AANTAL MEDEWERKERS: [Aantal of "ZZP"]
WERKGEBIED: [Bijv: "Heel Nederland" of "Regio Eindhoven"]

=== DOELGROEP ===
PRIMAIRE DOELGROEP: [Wie zijn de ideale klanten?]
SECUNDAIRE DOELGROEP: [Optioneel]
B2B OF B2C: [Business of Consumer]

=== DOMEIN & HOSTING ===
GEWENSTE DOMEIN: [Bijv: www.bedrijfsnaam.nl]
HEEFT AL DOMEIN?: [Ja/Nee - zo ja, waar geregistreerd?]
HEEFT AL HOSTING?: [Ja/Nee]
HEEFT AL EMAIL?: [Ja/Nee - zo ja, provider?]
```

---

## 🎯 PROJECT SPECIFICATIES (INVULLEN MET KLANT)

```
=== WEBSITE DOELEN ===
PRIMAIR DOEL:
- [ ] Leads/offertes genereren
- [ ] Naamsbekendheid vergroten
- [ ] Expertise tonen
- [ ] Klanten informeren
- [ ] Online verkoop voorbereiden
- [ ] Anders: [Invullen]

GEWENSTE ACTIES BEZOEKERS:
- [ ] Contact opnemen
- [ ] Offerte aanvragen
- [ ] Bellen
- [ ] WhatsApp sturen
- [ ] Nieuwsbrief inschrijven
- [ ] Anders: [Invullen]

=== PAGINA STRUCTUUR ===
VERPLICHTE PAGINA'S:
- [x] Homepage
- [x] Over Ons
- [x] Diensten (overzicht)
- [x] Contact
- [x] Privacy Policy

OPTIONELE PAGINA'S (aankruisen wat van toepassing):
- [ ] Dienst subpagina's (aantal: ___)
- [ ] Projecten/Portfolio
- [ ] Blog/Nieuws
- [ ] Veelgestelde Vragen (FAQ)
- [ ] Team pagina
- [ ] Vacatures
- [ ] Algemene Voorwaarden
- [ ] Anders: [Invullen]

=== DIENSTEN/PRODUCTEN ===
Lijst van diensten die op de website moeten:
1. [Dienst 1 - korte beschrijving]
2. [Dienst 2 - korte beschrijving]
3. [Dienst 3 - korte beschrijving]
4. [Eventueel meer...]

=== CONTENT ===
AANGELEVERD DOOR KLANT:
- [ ] Logo (SVG + PNG, minimaal 500x500px)
- [ ] Huisstijl document (kleuren, fonts)
- [ ] Teksten voor alle pagina's
- [ ] Team foto's
- [ ] Project foto's
- [ ] Bedrijfsfoto's
- [ ] Testimonials/reviews

NOG TE MAKEN:
- [ ] Teksten (door RoTech)
- [ ] Foto's sourcen (stock)
- [ ] Logo ontwerp (apart traject)

=== INSPIRATIE ===
VOORBEELD WEBSITES:
1. [URL] - Wat spreekt aan: [...]
2. [URL] - Wat spreekt aan: [...]
3. [URL] - Wat spreekt aan: [...]

STIJL VOORKEUR:
- [ ] Modern & minimalistisch
- [ ] Zakelijk & professioneel
- [ ] Warm & persoonlijk
- [ ] Creatief & opvallend
- [ ] Traditioneel & betrouwbaar

=== SPECIALE WENSEN ===
[Vrije tekst - speciale functionaliteit, integraties, etc.]
```

---

## 🛠️ TECHNISCHE SPECIFICATIES

### Tech Stack
```
Framework:      Next.js 15+ (App Router)
Language:       TypeScript (strict mode)
Styling:        Tailwind CSS v4
Animations:     Framer Motion
Fonts:          Google Fonts (next/font)
Icons:          Lucide React
Forms:          React Hook Form + Zod
Email:          Resend
CMS:            MDX voor blog (of headless CMS indien nodig)
Analytics:      Google Analytics 4 (optioneel)
Hosting:        Vercel
```

### Project Structuur
```
/[project-naam]
├── .env.local
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
├── next.config.ts
├── tailwind.config.ts
├── postcss.config.mjs
├── README.md
│
├── public/
│   ├── images/
│   │   ├── logo/
│   │   ├── team/
│   │   ├── projects/
│   │   ├── services/
│   │   └── content/
│   ├── favicon.ico
│   ├── og-image.jpg          # Open Graph afbeelding
│   └── llms.txt              # Voor AI crawlers
│
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                    # Homepage
│   │   ├── not-found.tsx
│   │   ├── globals.css
│   │   ├── robots.ts
│   │   ├── sitemap.ts
│   │   │
│   │   ├── over-ons/
│   │   │   └── page.tsx
│   │   │
│   │   ├── diensten/
│   │   │   ├── page.tsx                # Overzicht
│   │   │   └── [slug]/
│   │   │       └── page.tsx            # Detail pagina's
│   │   │
│   │   ├── projecten/                  # (indien van toepassing)
│   │   │   ├── page.tsx
│   │   │   └── [slug]/
│   │   │       └── page.tsx
│   │   │
│   │   ├── blog/                       # (indien van toepassing)
│   │   │   ├── page.tsx
│   │   │   └── [slug]/
│   │   │       └── page.tsx
│   │   │
│   │   ├── veelgestelde-vragen/
│   │   │   └── page.tsx
│   │   │
│   │   ├── contact/
│   │   │   └── page.tsx
│   │   │
│   │   ├── offerte/                    # Offerte aanvraag
│   │   │   └── page.tsx
│   │   │
│   │   ├── privacy/
│   │   │   └── page.tsx
│   │   │
│   │   ├── algemene-voorwaarden/
│   │   │   └── page.tsx
│   │   │
│   │   └── api/
│   │       ├── contact/
│   │       │   └── route.ts
│   │       └── offerte/
│   │           └── route.ts
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── MobileMenu.tsx
│   │   │   └── Breadcrumbs.tsx
│   │   │
│   │   ├── sections/
│   │   │   ├── Hero.tsx
│   │   │   ├── About.tsx
│   │   │   ├── Services.tsx
│   │   │   ├── ServiceCard.tsx
│   │   │   ├── Portfolio.tsx
│   │   │   ├── Testimonials.tsx
│   │   │   ├── Team.tsx
│   │   │   ├── FAQ.tsx
│   │   │   ├── CTA.tsx
│   │   │   ├── Stats.tsx
│   │   │   └── WhyChooseUs.tsx
│   │   │
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Input.tsx
│   │   │   └── WhatsAppButton.tsx
│   │   │
│   │   ├── forms/
│   │   │   ├── ContactForm.tsx
│   │   │   └── OfferteForm.tsx
│   │   │
│   │   └── seo/
│   │       └── StructuredData.tsx
│   │
│   ├── lib/
│   │   ├── utils.ts
│   │   ├── constants.ts
│   │   └── validations.ts
│   │
│   └── data/
│       ├── services.ts
│       ├── projects.ts
│       ├── testimonials.ts
│       ├── faq.ts
│       ├── team.ts
│       └── blog/                       # MDX bestanden
│           ├── artikel-1.mdx
│           └── artikel-2.mdx
│
└── docs/
    ├── OVERDRACHT.md
    ├── HANDLEIDING-CMS.md
    ├── HANDLEIDING-BLOG.md
    └── TECHNISCHE-DOCUMENTATIE.md
```

---

## 📝 CURSOR AI INSTRUCTIES

### Fase 1: Project Initialisatie

```
Initialiseer een professionele Next.js 15 bedrijfswebsite voor [BEDRIJFSNAAM].

=== BEDRIJFSGEGEVENS ===
Bedrijfsnaam: [BEDRIJFSNAAM]
Tagline: [TAGLINE]
Type: [TYPE BEDRIJF]
Branche: [BRANCHE]
Werkgebied: [WERKGEBIED]
Telefoon: [TELEFOON]
Email: [EMAIL]
Adres: [VOLLEDIG ADRES]
KVK: [KVK]

=== HUISSTIJL ===
Primaire kleur: [KLEUR - hex code]
Secundaire kleur: [KLEUR - hex code]
Accent kleur: [KLEUR - voor CTAs]
Font headings: [FONT of "Space Grotesk"]
Font body: [FONT of "Inter"]
Stijl: [Modern/Zakelijk/Warm/etc.]

=== TECHNISCHE SETUP ===
1. Maak Next.js 15 project met TypeScript en Tailwind
2. Installeer dependencies:
   - framer-motion
   - lucide-react
   - react-hook-form
   - @hookform/resolvers
   - zod
   - resend
3. Configureer Tailwind met custom kleuren
4. Setup Google Fonts
5. Maak volledige mappenstructuur
6. Configureer ESLint en TypeScript strict mode
```

### Fase 2: Layout & Navigatie

```
Bouw de layout componenten:

=== HEADER ===
- Logo links (linkt naar homepage)
- Hoofdnavigatie:
  - Home
  - Over Ons
  - Diensten (dropdown indien meerdere)
  - [Projecten - indien van toepassing]
  - [Blog - indien van toepassing]
  - Contact
- CTA button: "Offerte Aanvragen" of "[PRIMAIRE CTA]"
- Sticky header met blur effect bij scrollen
- Mobile: hamburger menu met slide-in panel

=== FOOTER ===
- Logo + korte bedrijfsbeschrijving
- Navigatie links
- Contactgegevens
- Social media links (indien van toepassing)
- Copyright [JAAR] [BEDRIJFSNAAM]
- Links: Privacy | Voorwaarden
- "Website door RoTech Development" (klein, subtiel)

=== BREADCRUMBS ===
- Op alle subpagina's
- Schema.org BreadcrumbList markup
```

### Fase 3: Homepage

```
Bouw de homepage met de volgende secties:

1. HERO SECTIE
   - Grote headline: [HEADLINE of genereer passend]
   - Subheadline met value proposition
   - 2 CTA buttons: Primair + Secundair
   - Trust badges (bijv: "X jaar ervaring", "X+ tevreden klanten")
   - Achtergrond: [specificatie]

2. OVER ONS PREVIEW
   - Korte introductie
   - Key stats (jaren ervaring, projecten, etc.)
   - Link naar volledige Over Ons pagina

3. DIENSTEN OVERZICHT
   - Grid van [AANTAL] diensten
   - Icoon + titel + korte beschrijving per dienst
   - Link naar detail pagina

4. WAAROM KIEZEN VOOR [BEDRIJFSNAAM]
   - 3-4 unique selling points
   - Iconen + uitleg

5. PORTFOLIO/PROJECTEN PREVIEW (indien van toepassing)
   - 3-4 uitgelichte projecten
   - Link naar portfolio pagina

6. TESTIMONIALS
   - Slider of grid met klantenreviews
   - Naam, bedrijf, quote, sterren

7. CTA SECTIE
   - Sterke call-to-action
   - Contact button
```

### Fase 4: Content Pagina's

```
=== OVER ONS PAGINA ===
- Hero met heading
- Verhaal van het bedrijf
- Missie & visie
- Team sectie (indien van toepassing)
- Kernwaarden
- CTA naar contact

=== DIENSTEN OVERZICHT ===
- Hero met heading
- Grid van alle diensten
- Elke dienst linkt naar detail pagina

=== DIENST DETAIL PAGINA'S ===
Voor elke dienst ([DIENSTEN LIJST]):
- Hero met dienst naam
- Uitgebreide beschrijving
- Features/voordelen
- Proces/werkwijze
- FAQ specifiek voor deze dienst
- CTA naar offerte

=== CONTACT PAGINA ===
- Contactformulier (naam, email, telefoon, bericht)
- Contactgegevens (adres, telefoon, email)
- Openingstijden (indien van toepassing)
- Google Maps embed (optioneel)
- WhatsApp button

=== OFFERTE PAGINA ===
- Uitgebreider formulier:
  - Contactgegevens
  - Type dienst (dropdown)
  - Projectbeschrijving
  - Budget indicatie
  - Deadline
- Verwachtingen scheppen

=== FAQ PAGINA ===
- Gegroepeerde vragen
- Accordion component
- Schema.org FAQPage markup

=== BLOG (indien van toepassing) ===
- Overzichtspagina met artikel cards
- Detail pagina met MDX content
- Auteur info
- Gerelateerde artikelen
- Social sharing
```

### Fase 5: Functionaliteit

```
=== CONTACTFORMULIER ===
- React Hook Form + Zod validatie
- Velden: naam (verplicht), email (verplicht), telefoon (optioneel), bericht (verplicht)
- API route met rate limiting
- Email via Resend naar [CONTACT_EMAIL]
- Bevestigingsmail naar bezoeker
- Success/error states met feedback

=== OFFERTE FORMULIER ===
- Stap-voor-stap wizard OF lang formulier
- Velden:
  - Naam, email, telefoon (verplicht)
  - Bedrijfsnaam (optioneel)
  - Type dienst (dropdown)
  - Beschrijving project (textarea)
  - Budget indicatie (dropdown ranges)
  - Gewenste start/deadline
  - Hoe gevonden (dropdown)
- Dezelfde backend logica als contact

=== SEO & STRUCTURED DATA ===
Per pagina type:
- Organization schema (homepage)
- LocalBusiness schema (homepage)
- WebPage schema (alle pagina's)
- Service schema (dienst pagina's)
- FAQPage schema (FAQ pagina)
- Article schema (blog posts)
- BreadcrumbList (alle subpagina's)

=== ANALYTICS (optioneel) ===
- Google Analytics 4 setup
- Alleen laden na cookie consent (indien nodig)
```

### Fase 6: Documentatie

```
Maak de volgende documenten:

=== OVERDRACHT.md ===
- Samenvatting wat opgeleverd is
- Alle account gegevens (Vercel, Resend, etc.)
- Hoe inloggen en aanpassingen maken
- Support contact RoTech

=== HANDLEIDING-CMS.md ===
- Hoe teksten aanpassen
- Hoe afbeeldingen vervangen
- Hoe nieuwe dienst toevoegen
- Hoe testimonial toevoegen

=== HANDLEIDING-BLOG.md (indien van toepassing) ===
- Hoe nieuw artikel maken
- MDX syntax basics
- Afbeeldingen in artikelen
- Publiceren

=== TECHNISCHE-DOCUMENTATIE.md ===
- Projectstructuur uitleg
- Dependencies overzicht
- Environment variables
- Deployment proces
```

---

## ✅ OPLEVERING CHECKLIST

### Technisch
- [ ] Alle pagina's werken foutloos
- [ ] `npm run build` succesvol
- [ ] Geen TypeScript errors
- [ ] Geen console errors
- [ ] Responsive op alle apparaten (mobile, tablet, desktop)
- [ ] Alle formulieren werken
- [ ] Email verzending werkt
- [ ] Alle interne links werken
- [ ] 404 pagina aanwezig

### SEO
- [ ] Unieke title tags (<60 karakters)
- [ ] Meta descriptions (<160 karakters)
- [ ] Open Graph tags
- [ ] Structured Data correct (test met Google Rich Results)
- [ ] Sitemap.xml gegenereerd
- [ ] Robots.txt correct
- [ ] Canonical URLs
- [ ] Alt teksten op afbeeldingen

### Performance
- [ ] Lighthouse score > 90 (alle metrics)
- [ ] Afbeeldingen geoptimaliseerd (next/image)
- [ ] Fonts geoptimaliseerd (preload)
- [ ] Geen grote JavaScript bundles

### Content
- [ ] Alle klant teksten verwerkt
- [ ] Logo correct op alle plekken
- [ ] Contactgegevens correct
- [ ] Privacy policy compleet
- [ ] Algemene voorwaarden (indien geleverd)

### Deployment
- [ ] GitHub repository aangemaakt
- [ ] Vercel project live
- [ ] Environment variables ingesteld
- [ ] Domein gekoppeld
- [ ] SSL actief
- [ ] Resend geconfigureerd en getest
- [ ] DNS records correct

### Documentatie
- [ ] Overdracht document compleet
- [ ] Handleiding(en) geschreven
- [ ] Klant training gepland of video gemaakt

---

## 📧 EMAIL CONFIGURATIE

### Resend Setup
1. Account aanmaken op resend.com
2. Domein toevoegen en DNS records instellen
3. API key genereren
4. Email templates configureren

### Email Templates

**Contact Bevestiging (naar bezoeker):**
```
Onderwerp: Bedankt voor uw bericht - [BEDRIJFSNAAM]

Beste {naam},

Bedankt voor uw bericht via onze website. Wij hebben uw vraag ontvangen en nemen binnen 1 werkdag contact met u op.

Met vriendelijke groet,
[BEDRIJFSNAAM]
[TELEFOON]
[EMAIL]
```

**Contact Notificatie (naar klant):**
```
Onderwerp: Nieuw bericht via website

Nieuw bericht ontvangen:

Naam: {naam}
Email: {email}
Telefoon: {telefoon}
Bericht:
{bericht}
```

**Offerte Bevestiging (naar bezoeker):**
```
Onderwerp: Uw offerte aanvraag - [BEDRIJFSNAAM]

Beste {naam},

Bedankt voor uw offerte aanvraag. Wij hebben de volgende informatie ontvangen:

Type dienst: {dienstType}
Projectbeschrijving: {beschrijving}
Budget indicatie: {budget}

Wij nemen binnen 2 werkdagen contact met u op om uw aanvraag te bespreken.

Met vriendelijke groet,
[BEDRIJFSNAAM]
```

---

## 🔧 EXTERNE SERVICES

### Vercel
- Project importeren
- Environment variables:
  - NEXT_PUBLIC_SITE_URL
  - CONTACT_EMAIL
  - RESEND_API_KEY
  - FROM_EMAIL
  - NEXT_PUBLIC_GA_ID (optioneel)

### Resend
- Domein verifiëren
- SPF, DKIM, DMARC records
- API key in env

### Google (optioneel)
- Google Analytics 4 property
- Google Search Console verificatie
- Sitemap indienen

### Domein
- DNS A record naar Vercel
- www redirect naar apex (of andersom)

---

*Master Prompt Versie 1.0 | RoTech Development | Januari 2026*
