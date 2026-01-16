# 🚀 WEBSITE LIVE ZETTEN - Complete Gids

**Datum:** 14 januari 2026  
**Doel:** Website volledig live krijgen met werkende contactformulieren

---

## ⚡ SNELSTART (30 minuten)

### Stap 1: Resend Email Setup (10 min)
1. Account: https://resend.com → Sign Up
2. API Key: Dashboard → API Keys → Create → Kopieer key (`re_...`)
3. Domein: Dashboard → Domains → Add → Voeg DNS records toe
4. FROM_EMAIL verifiëren in Resend

### Stap 2: Vercel Deployment (10 min)
1. GitHub: Push code naar GitHub repository
2. Vercel: https://vercel.com → Import GitHub project
3. Deploy: Klik "Deploy" → Wacht 2-3 minuten

### Stap 3: Environment Variables (5 min)
**In Vercel:** Settings → Environment Variables → Voeg toe:
```env
NEXT_PUBLIC_SITE_URL=https://ro-techdevelopment.com
CONTACT_EMAIL=contact@ro-techdevelopment.com
RESEND_API_KEY=re_xxxxxxxxxxxxx
FROM_EMAIL=noreply@ro-techdevelopment.com
```

### Stap 4: Domein Koppelen (5-60 min)
1. Vercel: Settings → Domains → Add Domain
2. DNS: Voeg records toe bij DNS provider
3. Wacht: 5-60 minuten voor propagation
4. SSL: Automatisch via Vercel ✅

**KLAAR!** 🎉 Website is live en formulieren werken automatisch!

---

## 📧 EMAIL FUNCTIONALITEIT

### ✅ Email Code is Actief!

**Geen code wijzigingen meer nodig!** 

Zodra je deze environment variables hebt toegevoegd aan Vercel:
- ✅ `RESEND_API_KEY`
- ✅ `CONTACT_EMAIL`
- ✅ `FROM_EMAIL`

**Werken de formulieren automatisch:**
- Contact formulier verstuurt email naar jou
- Bevestigingsemail naar gebruiker
- Offerte wizard verstuurt email met alle details

**Email templates zijn:**
- ✅ HTML ge-escaped (veilig)
- ✅ Professioneel opgemaakt
- ✅ Reply-to ingesteld (direct antwoorden mogelijk)
- ✅ Bedrijfsgegevens in footer

---

## 🔧 DETAILED SETUP

### 1. Resend Account Setup

**1.1 Account Aanmaken**
- Ga naar: https://resend.com
- Klik "Sign Up"
- Verifieer email

**1.2 API Key Genereren**
- Dashboard → **API Keys**
- Klik **"Create API Key"**
- Naam: `Rotech Website Production`
- Kopieer key (begint met `re_`)
- **BELANGRIJK:** Bewaar veilig, je ziet hem maar 1x!

**1.3 Domein Verifiëren**

**Optie A: Je eigen domein (Aanbevolen)**
1. Dashboard → **Domains** → **Add Domain**
2. Voer in: `ro-techdevelopment.com`
3. Resend geeft je DNS records:
   ```
   Type: TXT
   Name: @
   Value: [Resend geeft specifieke waarde]
   
   Type: CNAME
   Name: [Resend geeft naam]
   Value: [Resend geeft waarde]
   ```
4. Voeg records toe bij DNS provider
5. Wacht op verificatie (5-30 min)

**Optie B: Resend test domain (voor testing)**
- Gebruik `onboarding@resend.dev` tijdelijk
- Werkt direct, geen verificatie nodig
- **Niet voor production!**

**1.4 FROM_EMAIL Verifiëren**
- Dashboard → **Emails** → **Verify Email**
- Voer in: `noreply@ro-techdevelopment.com`
- Check email en klik verificatie link

---

### 2. Vercel Deployment

**2.1 GitHub Repository**

```bash
# Navigeer naar project
cd c:\Users\bvrvl\Desktop\Online_projects\WebDev_Projects\rotech-website

# Git setup (als nog niet gedaan)
git init
git add .
git commit -m "Rotech website - ready for deployment"

# GitHub repository aanmaken
# Ga naar: https://github.com/new
# Naam: rotech-website
# Klik: Create repository

# Remote toevoegen (vervang [username])
git remote add origin https://github.com/[username]/rotech-website.git
git branch -M main
git push -u origin main
```

**2.2 Vercel Project**

1. **Login:** https://vercel.com (met GitHub)
2. **New Project:** Klik "Add New" → "Project"
3. **Import:** Selecteer `rotech-website` repository
4. **Configure:**
   - Framework: Next.js (auto-detect)
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `.next`
5. **Deploy:** Klik "Deploy"

**Wacht 2-3 minuten...**

**Je krijgt een URL:** `https://rotech-website.vercel.app`

---

### 3. Environment Variables

**In Vercel Dashboard:**

1. Ga naar: Project → **Settings** → **Environment Variables**
2. Klik: **"Add New"**
3. Voeg toe (één voor één):

**Variable 1:**
```
Name: NEXT_PUBLIC_SITE_URL
Value: https://ro-techdevelopment.com
Environment: ☑ Production ☑ Preview ☑ Development
```

**Variable 2:**
```
Name: CONTACT_EMAIL
Value: contact@ro-techdevelopment.com
Environment: ☑ Production ☑ Preview ☑ Development
```

**Variable 3:**
```
Name: RESEND_API_KEY
Value: re_xxxxxxxxxxxxx
Environment: ☑ Production ☑ Preview ☑ Development
```

**Variable 4:**
```
Name: FROM_EMAIL
Value: noreply@ro-techdevelopment.com
Environment: ☑ Production ☑ Preview ☑ Development
```

4. **Klik:** "Save" voor elke variable
5. **Redeploy:** 
   - Ga naar Deployments
   - Klik op laatste deployment
   - Menu (⋯) → **Redeploy**

---

### 4. Domein Koppelen

**4.1 Domein Toevoegen in Vercel**

1. Project → **Settings** → **Domains**
2. Klik: **"Add Domain"**
3. Voer in: `ro-techdevelopment.com`
4. Klik: **"Add"**

**4.2 DNS Records**

Vercel geeft je exacte records. Meestal:

```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

**In je DNS Provider (bijv. Namecheap, TransIP, Cloudflare):**

1. Log in bij DNS provider
2. Ga naar **DNS Management** of **DNS Settings**
3. Voeg records toe zoals Vercel aangeeft
4. **Save**

**4.3 Wachten op Propagation**

- DNS propagation: 5 minuten tot 48 uur
- Meestal: 15-60 minuten
- Check: https://dnschecker.org

**4.4 SSL Certificaat**

✅ **Automatisch!** Vercel regelt SSL via Let's Encrypt.

**Check na 5-10 minuten:**
- Ga naar: https://ro-techdevelopment.com
- Je zou een groen slotje moeten zien 🔒

---

## ✅ TESTEN

### Test 1: Website Bereikbaarheid
```bash
# Test of website werkt
curl -I https://ro-techdevelopment.com

# Of open in browser
https://ro-techdevelopment.com
```

### Test 2: Contact Formulier
1. Ga naar: `/contact`
2. Vul formulier in:
   - Naam: Test Gebruiker
   - Email: jouw@email.nl
   - Onderwerp: Test
   - Bericht: Dit is een test bericht
3. Submit
4. **Check:**
   - Success message op website
   - Email in inbox (CONTACT_EMAIL)
   - Bevestigingsemail in jouw@email.nl

### Test 3: Offerte Wizard
1. Ga naar: `/offerte`
2. Doorloop alle 5 stappen
3. Submit
4. **Check:**
   - Success message
   - Email met alle details in inbox

### Test 4: Security Headers
```bash
curl -I https://ro-techdevelopment.com | grep -i "x-"
```

**Verwacht:**
- `strict-transport-security`
- `x-frame-options`
- `x-content-type-options`
- `content-security-policy`

### Test 5: Rate Limiting
1. Submit contact formulier 6x snel achter elkaar
2. **Verwacht:**
   - Eerste 5 requests: Success
   - 6e request: 429 error "Te veel verzoeken"

---

## 📊 GOOGLE SEARCH CONSOLE

### Setup (10 minuten)

1. **Account:** https://search.google.com/search-console
2. **Add Property:** Klik "Add Property"
3. **URL Prefix:** Voer in `https://ro-techdevelopment.com`
4. **Verificatie:**

**Methode 1: HTML File (Aanbevolen)**
- Download HTML file
- Upload naar `/public/` folder
- Commit en push
- Vercel deployt automatisch
- Klik "Verify" in Search Console

**Methode 2: HTML Tag**
- Kopieer meta tag
- Voeg toe aan `src/app/layout.tsx` in `<head>`
- Deploy
- Verify

5. **Sitemap Indienen:**
   - Search Console → Sitemaps
   - Voer in: `https://ro-techdevelopment.com/sitemap.xml`
   - Submit

---

## 📈 GOOGLE ANALYTICS (OPTIONEEL)

### Setup (5 minuten)

1. **Account:** https://analytics.google.com
2. **New Property:** Maak GA4 property
3. **Measurement ID:** Kopieer (begint met `G-`)
4. **Toevoegen aan Vercel:**
   - Environment Variable: `NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX`
   - Redeploy

**Of voeg direct toe aan code:**
- Zie `DEPLOYMENT-GUIDE.md` voor code snippet

---

## 🔍 POST-DEPLOYMENT CHECKLIST

### Direct Na Deployment
- [ ] Website bereikbaar op domein
- [ ] HTTPS werkt (groen slotje)
- [ ] Alle pagina's laden
- [ ] Contact formulier werkt
- [ ] Offerte wizard werkt
- [ ] Emails worden ontvangen

### Binnen 24 Uur
- [ ] Google Search Console setup
- [ ] Sitemap ingediend
- [ ] Google Analytics (optioneel)
- [ ] Security headers getest
- [ ] Rate limiting getest
- [ ] Mobile responsive getest

### Binnen Week 1
- [ ] Monitor email submissions
- [ ] Check Resend dashboard regelmatig
- [ ] Monitor website performance
- [ ] Check voor errors in Vercel logs

---

## 📞 CONTACTGEGEVENS VERIFICATIE

**Zorg dat deze correct zijn:**

**Email:** `contact@ro-techdevelopment.com`  
**Telefoon:** `+31 6 57 23 55 74`  
**WhatsApp:** `+31 6 57 23 55 74`  
**Adres:** `Kruisstraat 64, 5502 JG Veldhoven`  
**KvK:** `86858173`  
**BTW:** `NL004321198B83`

**Check in:**
- ✅ Header component
- ✅ Footer component  
- ✅ WhatsApp button
- ✅ Structured data
- ✅ Contact pagina

---

## 🎯 BELANGRIJKE URLS

**Na deployment:**

- **Website:** https://ro-techdevelopment.com
- **Vercel Dashboard:** https://vercel.com/dashboard
- **Resend Dashboard:** https://resend.com/emails
- **Google Search Console:** https://search.google.com/search-console
- **Sitemap:** https://ro-techdevelopment.com/sitemap.xml
- **Robots.txt:** https://ro-techdevelopment.com/robots.txt

---

## 🆘 TROUBLESHOOTING

### Email werkt niet

**Probleem:** Geen emails ontvangen

**Oplossingen:**
1. ✅ Check Resend dashboard → **Emails** tab
2. ✅ Check of API key correct is in Vercel
3. ✅ Check of FROM_EMAIL geverifieerd is
4. ✅ Check spam folder
5. ✅ Check Resend logs voor errors
6. ✅ Test met Resend test email functie

**Debug:**
- Resend dashboard toont alle email attempts
- Check "Failed" tab voor errors
- Check API key permissions

### Website niet bereikbaar

**Probleem:** Domain not found of niet bereikbaar

**Oplossingen:**
1. ✅ Wacht 24-48 uur voor DNS propagation
2. ✅ Check DNS records: https://dnschecker.org
3. ✅ Verifieer records in Vercel dashboard
4. ✅ Clear DNS cache: `ipconfig /flushdns` (Windows)
5. ✅ Check of domein correct is gekoppeld in Vercel

### Formulieren geven errors

**Probleem:** 403, 429, of andere errors

**Oplossingen:**
1. ✅ **403 Error:** CSRF protection - check Origin header
2. ✅ **429 Error:** Rate limiting - wacht 15 minuten
3. ✅ **500 Error:** Check Vercel function logs
4. ✅ Check browser console voor errors
5. ✅ Test met curl om headers te zien

### Build fails in Vercel

**Probleem:** Deployment faalt

**Oplossingen:**
1. ✅ Check build logs in Vercel
2. ✅ Test lokaal: `npm run build`
3. ✅ Check TypeScript errors
4. ✅ Check environment variables
5. ✅ Check Node.js version (Vercel gebruikt 18.x)

---

## ✅ VOLTOOID!

**Je website is nu volledig live en werkend!** 🎉

**Klanten kunnen nu:**
- ✅ Website bezoeken
- ✅ Contactformulier invullen
- ✅ Offerte aanvragen
- ✅ WhatsApp bericht sturen
- ✅ Direct emailen

**Jij ontvangt:**
- ✅ Alle contactformulier submissions via email
- ✅ Alle offerte aanvragen via email
- ✅ Direct reply-to mogelijk (antwoord direct op email)

---

## 📝 VOLGENDE STAPPEN

**Week 1:**
- Monitor email submissions
- Check Resend dashboard dagelijks
- Test alle functionaliteit
- Google Search Console setup

**Week 2-4:**
- Monitor website traffic
- Track leads (Google Analytics)
- Optimaliseer op basis van data
- Voeg meer content toe (blog)

**Maand 2+:**
- Regular security audits
- Performance monitoring
- SEO optimalisatie
- Content updates

---

**Laatste update:** 14 januari 2026  
**Status:** ✅ Klaar voor live zetten!
