# 🚀 DEPLOYMENT GIDS - Rotech Website Live Zetten

**Datum:** 14 januari 2026  
**Doel:** Website volledig live krijgen met werkende contactformulieren

---

## 📋 OVERZICHT

Deze gids helpt je stap-voor-stap om:
1. ✅ Email functionaliteit te activeren (Resend)
2. ✅ Website te deployen naar Vercel
3. ✅ Domein te koppelen
4. ✅ SSL certificaat te configureren
5. ✅ Formulieren te testen
6. ✅ Google Search Console te setup
7. ✅ Alles werkend te krijgen

---

## 🔧 STAP 1: RESEND EMAIL SETUP

### 1.1 Resend Account Aanmaken

1. Ga naar https://resend.com
2. Klik op "Sign Up" en maak een gratis account
3. Verifieer je email adres

### 1.2 API Key Genereren

1. Ga naar **API Keys** in het dashboard
2. Klik op **"Create API Key"**
3. Geef een naam: `Rotech Website Production`
4. Kopieer de API key (begint met `re_`)
5. **BELANGRIJK:** Bewaar deze key veilig, je ziet hem maar 1x!

### 1.3 Domein Verifiëren

1. Ga naar **Domains** in Resend dashboard
2. Klik op **"Add Domain"**
3. Voer je domein in: `ro-techdevelopment.com`
4. Volg de DNS instructies:
   - Voeg een **TXT record** toe voor domain verification
   - Voeg een **DKIM record** toe voor email authenticatie
   - Voeg een **SPF record** toe (optioneel maar aanbevolen)

**DNS Records voor Resend:**
```
Type: TXT
Name: @
Value: [Resend geeft je een specifieke waarde]

Type: CNAME
Name: [Resend geeft je een naam]
Value: [Resend geeft je een waarde]
```

### 1.4 Email Adres Verifiëren

1. In Resend dashboard, ga naar **Emails**
2. Klik op **"Verify Email"**
3. Voer in: `noreply@ro-techdevelopment.com` (of je FROM_EMAIL)
4. Check je email en klik op verificatie link

---

## 🌐 STAP 2: DOMEIN REGISTRATIE & DNS

### 2.1 Domein Registreren (als nog niet gedaan)

**Aanbevolen providers:**
- Namecheap (goedkoop, betrouwbaar)
- TransIP (Nederlandse provider)
- Cloudflare Registrar (goedkoop + gratis DNS)

**Domein:** `ro-techdevelopment.com` of `rotechdevelopment.nl`

### 2.2 DNS Records Configureren

**Voor Vercel Deployment:**

```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

**OF gebruik Vercel's automatische DNS:**

1. In Vercel dashboard, ga naar je project
2. Ga naar **Settings** → **Domains**
3. Voeg je domein toe
4. Vercel geeft je de exacte DNS records
5. Kopieer deze naar je DNS provider

---

## 🚀 STAP 3: VERCEL DEPLOYMENT

### 3.1 GitHub Repository (Aanbevolen)

**Optie A: Via GitHub (Aanbevolen)**

1. Maak een GitHub account (als je die nog niet hebt)
2. Maak een nieuwe repository: `rotech-website`
3. **BELANGRIJK:** Zorg dat `.env.local` NIET wordt gecommit!

```bash
# In je project folder
cd c:\Users\bvrvl\Desktop\Online_projects\WebDev_Projects\rotech-website

# Git initialiseren
git init
git add .
git commit -m "Initial commit - Rotech website"

# GitHub repository toevoegen
git remote add origin https://github.com/[jouw-username]/rotech-website.git
git branch -M main
git push -u origin main
```

**Optie B: Direct via Vercel CLI**

```bash
# Installeer Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

### 3.2 Vercel Project Aanmaken

1. Ga naar https://vercel.com
2. Klik op **"Add New"** → **"Project"**
3. Import je GitHub repository (of gebruik Vercel CLI)
4. Configureer:
   - **Framework Preset:** Next.js
   - **Root Directory:** `./` (default)
   - **Build Command:** `npm run build` (default)
   - **Output Directory:** `.next` (default)

### 3.3 Environment Variables in Vercel

**Ga naar:** Project → Settings → Environment Variables

**Voeg toe:**

```env
# Vereist
NEXT_PUBLIC_SITE_URL=https://ro-techdevelopment.com

# Email (vereist voor werkende formulieren)
CONTACT_EMAIL=contact@ro-techdevelopment.com
RESEND_API_KEY=re_xxxxxxxxxxxxx
FROM_EMAIL=noreply@ro-techdevelopment.com
```

**Belangrijk:**
- Selecteer **Production**, **Preview**, en **Development**
- Klik op **"Save"** voor elke variable

### 3.4 Deploy

1. Klik op **"Deploy"**
2. Wacht tot build klaar is (2-3 minuten)
3. Je krijgt een Vercel URL: `https://rotech-website.vercel.app`

---

## 🔗 STAP 4: DOMEIN KOPPELEN

### 4.1 Domein Toevoegen in Vercel

1. In Vercel dashboard, ga naar je project
2. Ga naar **Settings** → **Domains**
3. Klik op **"Add Domain"**
4. Voer in: `ro-techdevelopment.com`
5. Voeg ook toe: `www.ro-techdevelopment.com`

### 4.2 DNS Records Toevoegen

Vercel geeft je de exacte DNS records. Meestal:

```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

**In je DNS provider (bijv. Namecheap):**
1. Log in bij je DNS provider
2. Ga naar DNS Management
3. Voeg de records toe zoals Vercel aangeeft
4. Wacht 5-60 minuten voor DNS propagation

### 4.3 SSL Certificaat

✅ **Automatisch!** Vercel regelt SSL certificaat automatisch via Let's Encrypt.

**Check na 5-10 minuten:**
- Ga naar https://ro-techdevelopment.com
- Je zou een groen slotje moeten zien

---

## 📧 STAP 5: EMAIL FUNCTIONALITEIT ACTIVEREN

### 5.1 Code Uncommentariëren

Nu de Resend API key is ingesteld, moeten we de email code activeren:

**Bestanden om te updaten:**
- `src/app/api/contact/route.ts`
- `src/app/api/offerte/route.ts`

**Actie:** Uncomment de email code (verwijder `/*` en `*/`)

### 5.2 Test Email Verzenden

1. Ga naar `/contact` op je live website
2. Vul het formulier in
3. Submit
4. Check je email inbox (CONTACT_EMAIL)
5. Check of gebruiker bevestigingsemail krijgt

---

## ✅ STAP 6: TESTEN & VALIDATIE

### 6.1 Functionele Tests

**Contact Formulier:**
- [ ] Formulier kan worden ingevuld
- [ ] Validatie werkt (lege velden, invalid email)
- [ ] Submit geeft success message
- [ ] Email wordt ontvangen
- [ ] Bevestigingsemail wordt verstuurd

**Offerte Wizard:**
- [ ] Alle 5 stappen werken
- [ ] Validatie per stap werkt
- [ ] Submit werkt
- [ ] Email wordt ontvangen

**Rate Limiting:**
- [ ] 6x snel submit geeft 429 error
- [ ] Rate limit headers zijn aanwezig

**Security:**
- [ ] HTTPS werkt (groen slotje)
- [ ] Security headers zijn aanwezig
- [ ] CSRF protection werkt

### 6.2 Security Headers Testen

```bash
# Test security headers
curl -I https://ro-techdevelopment.com

# Of gebruik online tool:
# https://securityheaders.com
```

**Verwacht:**
- `Strict-Transport-Security`
- `X-Frame-Options`
- `X-Content-Type-Options`
- `Content-Security-Policy`

### 6.3 SSL Test

Ga naar: https://www.ssllabs.com/ssltest/
- Voer je domein in
- Verwacht: **A of A+ rating**

---

## 🔍 STAP 7: GOOGLE SEARCH CONSOLE

### 7.1 Account Setup

1. Ga naar https://search.google.com/search-console
2. Klik op **"Add Property"**
3. Kies **"URL prefix"**
4. Voer in: `https://ro-techdevelopment.com`

### 7.2 Verificatie

**Methode 1: HTML File (Aanbevolen)**
1. Download het HTML bestand
2. Upload naar `/public/` folder
3. Commit en push naar GitHub
4. Vercel deployt automatisch
5. Klik op **"Verify"** in Search Console

**Methode 2: HTML Tag**
1. Kopieer de meta tag
2. Voeg toe aan `src/app/layout.tsx` in `<head>`
3. Deploy
4. Verify

**Methode 3: DNS Record**
1. Voeg TXT record toe aan DNS
2. Verify

### 7.3 Sitemap Indienen

1. In Search Console, ga naar **Sitemaps**
2. Voer in: `https://ro-techdevelopment.com/sitemap.xml`
3. Klik op **"Submit"**

---

## 📊 STAP 8: GOOGLE ANALYTICS (OPTIONEEL)

### 8.1 GA4 Account Aanmaken

1. Ga naar https://analytics.google.com
2. Maak een nieuw GA4 property
3. Kopieer de **Measurement ID** (begint met `G-`)

### 8.2 Toevoegen aan Website

**Optie A: Via Environment Variable**

1. Voeg toe aan Vercel Environment Variables:
   ```env
   NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
   ```

2. Voeg Google Analytics component toe (zie hieronder)

**Optie B: Direct in Code**

Voeg toe aan `src/app/layout.tsx`:

```tsx
{process.env.NEXT_PUBLIC_GA_ID && (
  <>
    <script
      async
      src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
    />
    <script
      dangerouslySetInnerHTML={{
        __html: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
        `,
      }}
    />
  </>
)}
```

---

## 📝 STAP 9: FINALE CHECKLIST

### Pre-Launch
- [x] Code is compleet en getest lokaal
- [x] Build werkt zonder errors
- [x] Environment variables geconfigureerd
- [x] Resend API key toegevoegd
- [x] Domein geregistreerd
- [x] DNS records geconfigureerd

### Deployment
- [ ] Code gepusht naar GitHub
- [ ] Vercel project aangemaakt
- [ ] Environment variables toegevoegd in Vercel
- [ ] Deploy succesvol
- [ ] Domein gekoppeld
- [ ] SSL certificaat actief

### Email Functionaliteit
- [ ] Resend account aangemaakt
- [ ] API key toegevoegd
- [ ] Domein geverifieerd in Resend
- [ ] Email code uncommentariëerd
- [ ] Test email verzonden
- [ ] Bevestigingsemail werkt

### Testing
- [ ] Contact formulier werkt
- [ ] Offerte wizard werkt
- [ ] Emails worden ontvangen
- [ ] Rate limiting werkt
- [ ] Security headers aanwezig
- [ ] HTTPS werkt
- [ ] Alle pagina's laden correct

### SEO & Analytics
- [ ] Google Search Console setup
- [ ] Sitemap ingediend
- [ ] Google Analytics (optioneel)
- [ ] robots.txt werkt
- [ ] Sitemap.xml werkt

---

## 🆘 TROUBLESHOOTING

### Email werkt niet

**Probleem:** Geen emails ontvangen

**Oplossingen:**
1. Check Resend dashboard → **Emails** tab
2. Check of API key correct is
3. Check of FROM_EMAIL geverifieerd is
4. Check spam folder
5. Check Resend logs voor errors

### DNS werkt niet

**Probleem:** Website niet bereikbaar

**Oplossingen:**
1. Wacht 24-48 uur voor DNS propagation
2. Check DNS records met: https://dnschecker.org
3. Verifieer records in Vercel dashboard
4. Clear DNS cache: `ipconfig /flushdns` (Windows)

### Build Fails

**Probleem:** Vercel build faalt

**Oplossingen:**
1. Check build logs in Vercel
2. Test lokaal: `npm run build`
3. Check TypeScript errors
4. Check environment variables

### Formulieren werken niet

**Probleem:** 403 of 429 errors

**Oplossingen:**
1. Check CSRF protection (Origin header)
2. Check rate limiting (te veel requests)
3. Check browser console voor errors
4. Test met curl om headers te zien

---

## 📞 CONTACTGEGEVENS VOOR WEBSITE

**Zorg dat deze correct zijn in:**
- `src/components/layout/Header.tsx`
- `src/components/layout/Footer.tsx`
- `src/components/ui/WhatsAppButton.tsx`
- `src/components/seo/StructuredData.tsx`

**Huidige gegevens:**
- Email: `contact@ro-techdevelopment.com`
- Telefoon: `+31 6 57 23 55 74`
- WhatsApp: `+31 6 57 23 55 74`
- Adres: `Kruisstraat 64, 5502 JG Veldhoven`

---

## ✅ VOLGENDE STAPPEN

Na deployment:
1. Monitor formulieren (check Resend dashboard)
2. Monitor website performance (Vercel Analytics)
3. Track leads (Google Analytics)
4. Regular backups (Vercel heeft automatische backups)
5. Security monitoring (check logs regelmatig)

---

**Laatste update:** 14 januari 2026  
**Status:** Klaar voor deployment
