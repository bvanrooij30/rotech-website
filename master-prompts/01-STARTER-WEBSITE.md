# 🚀 MASTER PROMPT: STARTER WEBSITE

## Pakket Informatie
- **Pakket:** Starter Website (One-page / Kleine Website)
- **Prijsrange:** Vanaf €1.295
- **Doorlooptijd:** 1-2 weken
- **Pagina's:** 1-3 pagina's

---

## 📋 KLANTGEGEVENS (INVULLEN VOOR ELKE OPDRACHT)

```
BEDRIJFSNAAM: [Invullen]
CONTACTPERSOON: [Invullen]
EMAIL: [Invullen]
TELEFOON: [Invullen]
ADRES: [Invullen - optioneel]
KVK: [Invullen - optioneel]
BTW: [Invullen - optioneel]

TYPE BEDRIJF: [Bijv: Coach, Fotograaf, ZZP'er, Consultant]
BRANCHE: [Invullen]
DOELGROEP: [Wie zijn de klanten?]

GEWENSTE DOMEIN: [Bijv: www.bedrijfsnaam.nl]
HEEFT AL DOMEIN?: [Ja/Nee]
HEEFT AL HOSTING?: [Ja/Nee]
```

---

## 🎯 PROJECT SPECIFICATIES (INVULLEN MET KLANT)

```
DOEL VAN DE WEBSITE:
- [ ] Naamsbekendheid/visitekaartje
- [ ] Leads genereren
- [ ] Portfolio tonen
- [ ] Diensten presenteren
- [ ] Anders: [Invullen]

GEWENSTE PAGINA'S:
- [ ] One-page (alles op één pagina met secties)
- [ ] Homepage + Contact
- [ ] Homepage + Diensten + Contact
- [ ] Anders: [Specificeer]

CONTENT AANGELEVERD DOOR KLANT:
- [ ] Logo (formaat: SVG of PNG minimaal 500x500px)
- [ ] Teksten per sectie
- [ ] Foto's (minimaal 5-10 afbeeldingen)
- [ ] Kleuren/huisstijl (of: laat RoTech kiezen)

VOORBEELD WEBSITES (TER INSPIRATIE):
1. [URL + wat spreekt aan]
2. [URL + wat spreekt aan]
3. [URL + wat spreekt aan]

SPECIFIEKE WENSEN:
[Vrije tekst van klant]
```

---

## 🛠️ TECHNISCHE SPECIFICATIES

### Tech Stack (STANDAARD - NIET WIJZIGEN)
```
Framework:      Next.js 15+ (App Router)
Language:       TypeScript (strict mode)
Styling:        Tailwind CSS v4
Animations:     Framer Motion
Fonts:          Google Fonts (next/font)
Icons:          Lucide React
Forms:          React Hook Form + Zod validation
Email:          Resend
Hosting:        Vercel
```

### Project Structuur
```
/[project-naam]
├── .env.local              # Environment variables
├── .gitignore
├── package.json
├── tsconfig.json
├── next.config.ts
├── tailwind.config.ts
├── postcss.config.mjs
│
├── public/
│   ├── images/
│   │   ├── logo/           # Klant logo bestanden
│   │   └── content/        # Content afbeeldingen
│   ├── favicon.ico
│   ├── robots.txt
│   └── sitemap.xml
│
├── src/
│   ├── app/
│   │   ├── layout.tsx      # Root layout
│   │   ├── page.tsx        # Homepage
│   │   ├── contact/
│   │   │   └── page.tsx    # Contact pagina (optioneel)
│   │   ├── api/
│   │   │   └── contact/
│   │   │       └── route.ts # Contact form API
│   │   ├── privacy/
│   │   │   └── page.tsx
│   │   ├── robots.ts
│   │   ├── sitemap.ts
│   │   └── globals.css
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   └── Footer.tsx
│   │   ├── sections/
│   │   │   ├── Hero.tsx
│   │   │   ├── About.tsx
│   │   │   ├── Services.tsx
│   │   │   ├── Portfolio.tsx (optioneel)
│   │   │   ├── Testimonials.tsx (optioneel)
│   │   │   ├── Contact.tsx
│   │   │   └── CTA.tsx
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   └── WhatsAppButton.tsx
│   │   └── forms/
│   │       └── ContactForm.tsx
│   │
│   ├── lib/
│   │   ├── utils.ts
│   │   └── constants.ts    # Klantgegevens
│   │
│   └── data/
│       └── content.ts      # Alle teksten
│
└── docs/
    ├── OVERDRACHT.md       # Overdracht document voor klant
    └── HANDLEIDING.md      # Gebruikershandleiding
```

---

## 📝 CURSOR AI INSTRUCTIES

### Stap 1: Project Setup

```
Maak een nieuwe Next.js 15 website voor [BEDRIJFSNAAM].

BEDRIJFSGEGEVENS:
- Naam: [BEDRIJFSNAAM]
- Type: [TYPE BEDRIJF]
- Doelgroep: [DOELGROEP]
- Telefoon: [TELEFOON]
- Email: [EMAIL]
- Adres: [ADRES]

HUISSTIJL:
- Primaire kleur: [KLEUR of "bepaal passend bij branche"]
- Secundaire kleur: [KLEUR of "bepaal passend"]
- Stijl: [Modern/Klassiek/Minimalistisch/etc.]

TECHNISCHE SETUP:
1. Initialiseer Next.js 15 met TypeScript, Tailwind CSS, App Router
2. Installeer: framer-motion, lucide-react, react-hook-form, zod, resend
3. Configureer fonts: [FONT of "Inter voor body, Space Grotesk voor headings"]
4. Maak de complete projectstructuur aan
```

### Stap 2: Content & Componenten

```
Bouw de volgende secties voor de one-page website:

1. HEADER
   - Logo links
   - Navigatie rechts (scroll-to-section links)
   - Sticky on scroll
   - Mobile hamburger menu

2. HERO SECTIE
   - Headline: [KLANT TEKST of "genereer passend"]
   - Subheadline met value proposition
   - CTA button naar contact
   - Achtergrond: [gradient/afbeelding/patroon]

3. OVER/ABOUT SECTIE
   - Korte introductie bedrijf
   - [KLANT TEKST]

4. DIENSTEN SECTIE
   - [AANTAL] diensten/services
   - Cards met iconen
   - [DIENSTEN LIJST VAN KLANT]

5. PORTFOLIO/WERKWIJZE SECTIE (optioneel)
   - [SPECIFICATIE VAN KLANT]

6. CONTACT SECTIE
   - Contactformulier (naam, email, telefoon optioneel, bericht)
   - Contactgegevens
   - WhatsApp button

7. FOOTER
   - Logo
   - Contactgegevens
   - Social links (indien van toepassing)
   - Copyright
   - Link naar privacy policy
   - "Website door RoTech Development" credit
```

### Stap 3: Functionaliteit

```
Implementeer de volgende functionaliteit:

1. CONTACTFORMULIER
   - Validatie met Zod
   - Submit naar API route
   - Email verzending via Resend
   - Success/error states
   - Rate limiting (5 submissions per 15 min)

2. WHATSAPP BUTTON
   - Floating button rechtsonder
   - Link naar WhatsApp met voorgedefinieerde tekst
   - Telefoonnummer: [TELEFOON]

3. SCROLL ANIMATIES
   - Fade-in on scroll voor secties
   - Smooth scroll naar secties

4. SEO
   - Meta tags per pagina
   - Open Graph tags
   - Structured Data (LocalBusiness)
   - Sitemap generatie
   - Robots.txt
```

### Stap 4: Environment Variables

```
Maak .env.local met:

NEXT_PUBLIC_SITE_URL=https://[DOMEIN]
CONTACT_EMAIL=[KLANT EMAIL]
RESEND_API_KEY=[API KEY - later invullen]
FROM_EMAIL=noreply@[DOMEIN]

# WhatsApp
NEXT_PUBLIC_WHATSAPP_NUMBER=[TELEFOON zonder spaties, met landcode]
```

### Stap 5: Documentatie

```
Maak de volgende documenten:

1. OVERDRACHT.md
   - Inloggegevens overzicht
   - Hoe content aanpassen
   - Contactgegevens RoTech voor support

2. HANDLEIDING.md
   - Stap-voor-stap: teksten wijzigen
   - Afbeeldingen vervangen
   - Nieuwe pagina toevoegen (basis)
```

---

## ✅ OPLEVERING CHECKLIST

### Technisch
- [ ] Website werkt lokaal zonder errors
- [ ] `npm run build` succesvol
- [ ] Responsive op mobile, tablet, desktop
- [ ] Contactformulier werkt
- [ ] WhatsApp button werkt
- [ ] Alle links werken

### SEO
- [ ] Unieke title per pagina
- [ ] Meta descriptions aanwezig
- [ ] Open Graph tags werken
- [ ] Structured Data correct
- [ ] Sitemap gegenereerd
- [ ] Robots.txt aanwezig

### Content
- [ ] Alle klant teksten verwerkt
- [ ] Logo correct geplaatst
- [ ] Afbeeldingen geoptimaliseerd
- [ ] Contactgegevens correct
- [ ] Privacy policy pagina aanwezig

### Deployment
- [ ] GitHub repository aangemaakt
- [ ] Vercel project opgezet
- [ ] Environment variables ingesteld
- [ ] Domein gekoppeld (of klant instructies gegeven)
- [ ] SSL actief
- [ ] Resend email geconfigureerd

### Overdracht
- [ ] Overdracht document compleet
- [ ] Handleiding geschreven
- [ ] Klant geïnformeerd over 30 dagen support

---

## 📧 EMAIL TEMPLATES

### Bevestigingsmail naar bezoeker
```
Onderwerp: Bedankt voor uw bericht - [BEDRIJFSNAAM]

Beste {naam},

Bedankt voor uw bericht via onze website.

Wij hebben uw bericht ontvangen en nemen zo spoedig mogelijk contact met u op.

Met vriendelijke groet,
[BEDRIJFSNAAM]
[TELEFOON]
[EMAIL]
```

### Notificatie naar klant
```
Onderwerp: Nieuw bericht via website - [BEDRIJFSNAAM]

Er is een nieuw bericht binnengekomen via uw website:

Naam: {naam}
Email: {email}
Telefoon: {telefoon}
Bericht: {bericht}

---
Dit is een automatisch bericht van uw website.
```

---

## 🔧 EXTERNE SERVICES SETUP

### 1. Resend (Email)
- Account: https://resend.com
- Domein verifiëren
- API key genereren
- FROM_EMAIL instellen

### 2. Vercel (Hosting)
- Project importeren van GitHub
- Environment variables toevoegen
- Domein koppelen

### 3. Domein (indien nieuw)
- Registreren bij Namecheap/TransIP
- DNS naar Vercel wijzen
- SSL automatisch via Vercel

---

## 💡 TIPS VOOR CURSOR

1. **Begin met de layout** - Header en Footer eerst, dan secties
2. **Mobile-first** - Ontwerp eerst voor mobile, dan desktop
3. **Herbruikbare componenten** - Button, Card, etc. als aparte componenten
4. **Constants file** - Alle klantgegevens centraal
5. **Test onderweg** - Bouw en test per sectie

---

*Master Prompt Versie 1.0 | RoTech Development | Januari 2026*
