# RoTech Website - Operationeel Rapport & Go-Live Checklist

## Datum: 22 januari 2026

---

## STATUS: 85% OPERATIONEEL

De website is technisch gebouwd en deployed. Er zijn nog handmatige configuratiestappen nodig voordat klanten het volledige systeem kunnen gebruiken.

---

## SYSTEEM OVERZICHT

| Systeem | Status | Wat werkt | Wat ontbreekt |
|---------|--------|-----------|---------------|
| Website (publiek) | LIVE | Alle pagina's, SEO, content | - |
| Admin Panel | LIVE | Alle beheerfuncties | - |
| Contactformulier | DEELS | Data wordt opgeslagen | Emails worden niet verstuurd |
| Offerte aanvragen | DEELS | Data wordt opgeslagen | Emails worden niet verstuurd |
| AI Chatbot | UIT | Code klaar | OPENAI_API_KEY ontbreekt |
| Klant registratie | DEELS | Account wordt aangemaakt | Verificatie email niet verstuurd |
| Wachtwoord reset | DEELS | Code werkt | Reset email niet verstuurd |
| Stripe betalingen | LIVE | Checkout flows werken | Webhook URL controleren |
| Google Analytics | UIT | Code klaar | Measurement ID ontbreekt |
| Google Search Console | UIT | Code klaar | Verificatie ontbreekt |

---

## TO-DO CHECKLIST

### Fase 1: Email systeem activeren (KRITIEK)
Zonder email werken contactformulieren, registratie en wachtwoord reset niet volledig.

- [ ] **1.1** Maak een Resend account aan op https://resend.com
- [ ] **1.2** Verifieer je domein `ro-techdevelopment.dev` in Resend
- [ ] **1.3** Kopieer je Resend API key
- [ ] **1.4** Voeg toe aan Vercel Environment Variables:
  - `RESEND_API_KEY` = `re_xxxxx` (je Resend API key)
  - `FROM_EMAIL` = `noreply@ro-techdevelopment.dev`
  - `CONTACT_EMAIL` = `contact@ro-techdevelopment.dev`
- [ ] **1.5** Redeploy op Vercel
- [ ] **1.6** Test contactformulier op /contact
- [ ] **1.7** Test registratie op /portal/registreren
- [ ] **1.8** Test wachtwoord vergeten op /portal/wachtwoord-vergeten

### Fase 2: SEO activeren (HOOG)

- [ ] **2.1** Maak Google Analytics 4 property aan op https://analytics.google.com
- [ ] **2.2** Voeg toe aan Vercel: `NEXT_PUBLIC_GA_MEASUREMENT_ID` = `G-XXXXXXXXXX`
- [ ] **2.3** Voeg property toe in Google Search Console: https://search.google.com/search-console
- [ ] **2.4** Kies HTML-tag verificatie, kopieer code
- [ ] **2.5** Voeg toe aan Vercel: `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` = je code
- [ ] **2.6** Redeploy op Vercel
- [ ] **2.7** Verifieer in Search Console
- [ ] **2.8** Dien sitemap in: `https://ro-techdevelopment.dev/sitemap.xml`
- [ ] **2.9** Test structured data: https://search.google.com/test/rich-results?url=https://ro-techdevelopment.dev

### Fase 3: Stripe webhook controleren (HOOG)

- [ ] **3.1** Ga naar Stripe Dashboard > Developers > Webhooks
- [ ] **3.2** Controleer dat er 1 webhook endpoint is: `https://ro-techdevelopment.dev/api/stripe/webhook`
- [ ] **3.3** Controleer dat deze events zijn aangevinkt:
  - `checkout.session.completed`
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.paid`
  - `invoice.payment_failed`
- [ ] **3.4** Verwijder eventuele andere webhook endpoints (voorkom dubbele verwerking)
- [ ] **3.5** Test een checkout flow met Stripe test mode (optioneel)

### Fase 4: AI Chatbot activeren (OPTIONEEL)

- [ ] **4.1** Maak een OpenAI account aan op https://platform.openai.com
- [ ] **4.2** Genereer een API key
- [ ] **4.3** Voeg toe aan Vercel: `OPENAI_API_KEY` = `sk-xxxxx`
- [ ] **4.4** Redeploy
- [ ] **4.5** Test de chatbot rechtsonder op de website

### Fase 5: Eindcontrole

- [ ] **5.1** Test de volledige klantflow:
  1. Bezoek /portal/registreren - maak testaccount
  2. Check of verificatie email binnenkomt
  3. Verifieer email via link
  4. Login op /portal/login
  5. Bekijk dashboard, producten, support
- [ ] **5.2** Test contactformulier op /contact
- [ ] **5.3** Test offerte aanvragen op /offerte
- [ ] **5.4** Bekijk admin panel op /admin - check alle pagina's
- [ ] **5.5** Test PageSpeed: https://pagespeed.web.dev/?url=https://ro-techdevelopment.dev
- [ ] **5.6** Test mobile weergave op telefoon

---

## VERCEL ENVIRONMENT VARIABLES - VOLLEDIGE LIJST

### Verplicht (al ingesteld)
| Variable | Status |
|----------|--------|
| `DATABASE_URL` | Ingesteld |
| `DIRECT_URL` | Ingesteld |
| `AUTH_SECRET` | Ingesteld |
| `NEXTAUTH_SECRET` | Ingesteld |
| `NEXTAUTH_URL` | Ingesteld |
| `JWT_SECRET` | Ingesteld |
| `STRIPE_SECRET_KEY` | Ingesteld |
| `STRIPE_WEBHOOK_SECRET` | Ingesteld |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Ingesteld |
| `ADMIN_SETUP_KEY` | Ingesteld |
| `CRON_SECRET` | Ingesteld |

### Nog in te stellen
| Variable | Waarde | Doel |
|----------|--------|------|
| `RESEND_API_KEY` | `re_xxxxx` | Email verzending |
| `FROM_EMAIL` | `noreply@ro-techdevelopment.dev` | Afzender email |
| `CONTACT_EMAIL` | `contact@ro-techdevelopment.dev` | Ontvanger contact formulier |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | `G-XXXXXXXXXX` | Google Analytics |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | Je code | Search Console |
| `OPENAI_API_KEY` | `sk-xxxxx` (optioneel) | AI Chatbot |

---

## GUIDE PER STAP

### Stap 1: Resend Email Setup

1. Ga naar https://resend.com en maak een account
2. In het Resend dashboard, ga naar **Domains**
3. Klik **Add Domain** > voer in: `ro-techdevelopment.dev`
4. Resend geeft je DNS records (MX, TXT, DKIM)
5. Voeg deze records toe bij je domein provider (Namecheap/Vercel DNS)
6. Wacht tot verificatie compleet is (kan 5 min tot 24 uur duren)
7. Ga naar **API Keys** in Resend > **Create API Key**
8. Kopieer de key (begint met `re_`)
9. Ga naar Vercel > Settings > Environment Variables
10. Voeg toe: `RESEND_API_KEY`, `FROM_EMAIL`, `CONTACT_EMAIL`
11. Klik Save > ga naar Deployments > Redeploy

### Stap 2: Google Analytics Setup

1. Ga naar https://analytics.google.com
2. Klik **Admin** (tandwiel icoon)
3. Klik **Create Property**
4. Vul in: "RoTech Development Website"
5. Kies land: Nederland, valuta: EUR
6. Klik **Create** > kies **Web**
7. Vul in: `https://ro-techdevelopment.dev` en "RoTech Website"
8. Kopieer de **Measurement ID** (begint met `G-`)
9. Voeg toe aan Vercel: `NEXT_PUBLIC_GA_MEASUREMENT_ID`

### Stap 3: Google Search Console Setup

1. Ga naar https://search.google.com/search-console
2. Klik **Property toevoegen**
3. Kies **URL-voorvoegsel** > voer in: `https://ro-techdevelopment.dev`
4. Kies verificatiemethode: **HTML-tag**
5. Kopieer ALLEEN de content waarde (bijv. `abc123xyz`)
6. Voeg toe aan Vercel: `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`
7. Redeploy op Vercel
8. Ga terug naar Search Console > klik **Verifieer**
9. Na verificatie: ga naar **Sitemaps**
10. Voeg toe: `https://ro-techdevelopment.dev/sitemap.xml`
11. Klik **Verzenden**

### Stap 4: Stripe Webhook Controleren

1. Ga naar https://dashboard.stripe.com/webhooks
2. Controleer of er een endpoint is voor: `https://ro-techdevelopment.dev/api/stripe/webhook`
3. Als deze er niet is: klik **Add endpoint**
4. URL: `https://ro-techdevelopment.dev/api/stripe/webhook`
5. Selecteer events: `checkout.session.completed`, `customer.subscription.*`, `invoice.*`
6. Kopieer de signing secret en update `STRIPE_WEBHOOK_SECRET` in Vercel indien nodig

---

## NA VOLTOOIING

Wanneer alle stappen zijn voltooid is je website 100% operationeel:

- Klanten kunnen zich registreren en inloggen
- Contactformulieren sturen emails
- Offertes worden per email bevestigd
- Betalingen worden verwerkt via Stripe
- Je hebt volledig inzicht via Google Analytics
- Google indexeert je website correct
- De AI chatbot helpt bezoekers (als OPENAI_API_KEY is ingesteld)
- Je beheert alles vanuit het admin panel
