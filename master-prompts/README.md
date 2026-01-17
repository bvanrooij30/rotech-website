# 📚 ROTECH MASTER PROMPTS

## Overzicht

Deze map bevat uitgebreide masterprompts voor elk pakket en elke dienst die RoTech Development aanbiedt. Gebruik deze prompts met Cursor AI om projecten efficiënt en consistent te bouwen.

---

## 📁 Beschikbare Prompts

| # | Bestand | Pakket/Dienst | Prijsrange |
|---|---------|---------------|------------|
| 00 | `00-KLANT-INTAKE.md` | Klant Intake Template | - |
| 01 | `01-STARTER-WEBSITE.md` | Starter Website (One-page) | Vanaf €997 |
| 02 | `02-BUSINESS-WEBSITE.md` | Business Website | Vanaf €2.497 |
| 03 | `03-WEBSHOP.md` | Webshop / E-commerce | Vanaf €3.997 |
| 04 | `04-MAATWERK-WEB-APPLICATIE.md` | Maatwerk Web Applicatie | Vanaf €7.500 |
| 05 | `05-AUTOMATISERING-N8N.md` | Digital Process Automation | Op maat |
| 06 | `06-PWA-PROGRESSIVE-WEB-APP.md` | Progressive Web App | Vanaf €1.500 |
| 07 | `07-API-INTEGRATIES.md` | API Integraties | Vanaf €750 |
| 08 | `08-SEO-OPTIMALISATIE.md` | SEO Optimalisatie | Vanaf €750 |
| 09 | `09-WEBSITE-ONDERHOUD.md` | Website Onderhoud (Abonnement) | Vanaf €99/maand |
| 10 | `10-AI-CHATBOT.md` | AI Chatbot Klantenservice | Vanaf €1.500 |

---

## 🚀 Hoe te gebruiken

### Stap 1: Intake met klant
1. Bespreek het project met de klant
2. Bepaal welk pakket past
3. Open de bijbehorende masterprompt
4. Vul de **KLANTGEGEVENS** sectie in
5. Vul de **PROJECT SPECIFICATIES** sectie in

### Stap 2: Project starten
1. Open Cursor AI
2. Start een nieuw project
3. Plak de relevante secties uit de masterprompt
4. Begin met **Fase 1: Project Setup**
5. Werk door alle fases

### Stap 3: Oplevering
1. Doorloop de **OPLEVERING CHECKLIST**
2. Maak de documentatie aan
3. Deploy naar productie
4. Overdracht aan klant

---

## 📋 Quick Reference

### Starter Website
- **Ideaal voor:** ZZP'ers, freelancers, starters
- **Pagina's:** 1-3
- **Doorlooptijd:** 1-2 weken
- **Features:** Responsive, contactformulier, basis SEO

### Business Website
- **Ideaal voor:** MKB, dienstverleners
- **Pagina's:** 5-10
- **Doorlooptijd:** 2-4 weken
- **Features:** CMS, blog, geavanceerde SEO, offerte formulier

### Webshop
- **Ideaal voor:** Retailers, productverkoop
- **Producten:** Tot 100+
- **Doorlooptijd:** 3-5 weken
- **Features:** iDEAL, voorraadbeheer, orderbeheer

### Maatwerk Web App
- **Ideaal voor:** Complexe bedrijfsprocessen
- **Scope:** Volledig op specificatie
- **Doorlooptijd:** 6-12+ weken
- **Features:** Custom functionaliteit, integraties, gebruikersrollen

### Automatisering
- **Ideaal voor:** Repetitieve processen
- **Tools:** n8n, Make.com, Zapier
- **Doorlooptijd:** 1-4 weken
- **Features:** Workflows, integraties, notificaties

### PWA (Progressive Web App)
- **Ideaal voor:** Apps die installeerbaar moeten zijn
- **Type:** Add-on of standalone
- **Doorlooptijd:** 1-3 weken extra
- **Features:** Offline, push notificaties, homescreen

### API Integraties
- **Ideaal voor:** Systeem koppelingen
- **Type:** Eenmalig of onderdeel van project
- **Doorlooptijd:** 1-4 weken per integratie
- **Features:** Data sync, webhooks, automatisering

### SEO Optimalisatie
- **Ideaal voor:** Betere vindbaarheid
- **Type:** Eenmalig of doorlopend
- **Doorlooptijd:** 2-4 weken (eenmalig)
- **Features:** Technische SEO, on-page, structured data

### Website Onderhoud
- **Ideaal voor:** Zorgeloos beheer
- **Type:** Maandelijks abonnement
- **Pakketten:** Basis €99 / Standaard €199 / Premium €349
- **Features:** Updates, monitoring, backups, support

### AI Chatbot
- **Ideaal voor:** 24/7 klantenservice, lead generatie
- **Type:** Add-on of onderdeel van project
- **Doorlooptijd:** 1-3 weken
- **Features:** FAQ beantwoorden, lead capture, persoonlijke tone of voice

---

## 🔧 Standaard Tech Stack

Alle projecten gebruiken (tenzij anders gespecificeerd):

```
Framework:      Next.js 15 (App Router)
Language:       TypeScript (strict mode)
Styling:        Tailwind CSS v4
Components:     shadcn/ui (voor apps)
Animations:     Framer Motion
Forms:          React Hook Form + Zod
Email:          Resend
Hosting:        Vercel
Database:       PostgreSQL + Prisma (indien nodig)
Auth:           NextAuth.js / Clerk (indien nodig)
```

---

## 📝 Documentatie per Project

Elk project moet de volgende documentatie bevatten:

### Voor ALLE projecten:
- `OVERDRACHT.md` - Samenvatting en toegangsgegevens
- `HANDLEIDING.md` - Gebruikersinstructies

### Aanvullend voor Business/Webshop/Maatwerk:
- `HANDLEIDING-CMS.md` - Content beheer
- `TECHNISCHE-DOCUMENTATIE.md` - Voor developers

### Aanvullend voor Webshop:
- `HANDLEIDING-PRODUCTEN.md` - Productbeheer
- `HANDLEIDING-BESTELLINGEN.md` - Orderbeheer

### Aanvullend voor Maatwerk:
- `API-DOCUMENTATIE.md` - API endpoints
- `BEHEERHANDLEIDING.md` - Admin functies

---

## ✅ Universele Oplevering Checklist

### Technisch
- [ ] `npm run build` succesvol
- [ ] Geen TypeScript errors
- [ ] Geen console errors
- [ ] Responsive (mobile, tablet, desktop)
- [ ] Formulieren werken
- [ ] Emails worden verstuurd

### SEO
- [ ] Title tags uniek (<60 chars)
- [ ] Meta descriptions (<160 chars)
- [ ] Open Graph tags
- [ ] Sitemap.xml
- [ ] Robots.txt

### Deployment
- [ ] GitHub repository
- [ ] Vercel project
- [ ] Environment variables
- [ ] Domein gekoppeld
- [ ] SSL actief

### Overdracht
- [ ] Documentatie compleet
- [ ] Klant geïnformeerd
- [ ] Support periode bevestigd

---

## 🔄 Versie Historie

| Versie | Datum | Wijzigingen |
|--------|-------|-------------|
| 1.0 | 17 jan 2026 | Initiële versie alle prompts |

---

## 📞 Support

Bij vragen over de masterprompts:
- **Email:** support@ro-techdevelopment.dev
- **Intern:** Check de Cursor chat historie voor eerdere projecten

---

*RoTech Development - Master Prompts v1.0*
