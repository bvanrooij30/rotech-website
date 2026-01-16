# ✅ DEPLOYMENT CHECKLIST - Rotech Website

**Gebruik deze checklist om je website stap-voor-stap live te zetten**

---

## 📋 PRE-DEPLOYMENT CHECKLIST

### Code & Build
- [x] Code is compleet en getest
- [x] `npm run build` werkt zonder errors
- [x] Geen TypeScript errors
- [x] Geen linter errors
- [x] Alle pagina's werken lokaal

### Security
- [x] Security headers geconfigureerd
- [x] Rate limiting actief
- [x] CSRF protection actief
- [x] Input validation geïmplementeerd
- [x] XSS protection geïmplementeerd
- [x] Dependencies geaudit (0 vulnerabilities)

### Email Setup
- [ ] Resend account aangemaakt
- [ ] Resend API key gegenereerd
- [ ] Domein geverifieerd in Resend
- [ ] FROM_EMAIL geverifieerd in Resend

### Environment Variables
- [ ] `.env.local` aangemaakt (lokaal)
- [ ] `NEXT_PUBLIC_SITE_URL` ingesteld
- [ ] `CONTACT_EMAIL` ingesteld
- [ ] `RESEND_API_KEY` ingesteld
- [ ] `FROM_EMAIL` ingesteld

---

## 🚀 DEPLOYMENT STAPPEN

### Stap 1: GitHub Repository (10 min)
- [ ] GitHub account aangemaakt
- [ ] Repository aangemaakt: `rotech-website`
- [ ] Code gepusht naar GitHub
- [ ] `.env.local` NIET gecommit (staat in .gitignore)

### Stap 2: Vercel Project (5 min)
- [ ] Vercel account aangemaakt (https://vercel.com)
- [ ] Project aangemaakt via GitHub import
- [ ] Build settings correct (Next.js auto-detect)
- [ ] Deploy succesvol

### Stap 3: Environment Variables in Vercel (5 min)
- [ ] `NEXT_PUBLIC_SITE_URL` toegevoegd
- [ ] `CONTACT_EMAIL` toegevoegd
- [ ] `RESEND_API_KEY` toegevoegd
- [ ] `FROM_EMAIL` toegevoegd
- [ ] Alle variables ingesteld voor Production, Preview, Development

### Stap 4: Domein Koppelen (10-60 min)
- [ ] Domein geregistreerd (als nog niet gedaan)
- [ ] Domein toegevoegd in Vercel
- [ ] DNS records toegevoegd bij DNS provider
- [ ] DNS propagation gewacht (5-60 min)
- [ ] SSL certificaat actief (automatisch via Vercel)

### Stap 5: Email Functionaliteit Testen (5 min)
- [ ] Test contact formulier op live site
- [ ] Email ontvangen in inbox (CONTACT_EMAIL)
- [ ] Bevestigingsemail ontvangen door gebruiker
- [ ] Test offerte wizard
- [ ] Email ontvangen met alle details

---

## ✅ POST-DEPLOYMENT VALIDATIE

### Functionele Tests
- [ ] Homepage laadt correct
- [ ] Alle navigatie links werken
- [ ] Contact formulier werkt
- [ ] Offerte wizard werkt
- [ ] Alle pagina's laden
- [ ] Mobile responsive werkt

### Security Tests
- [ ] HTTPS werkt (groen slotje)
- [ ] Security headers aanwezig (test met curl -I)
- [ ] Rate limiting werkt (6x submit = 429 error)
- [ ] CSRF protection werkt

### Email Tests
- [ ] Contact formulier verstuurt email
- [ ] Bevestigingsemail wordt verstuurd
- [ ] Offerte formulier verstuurt email
- [ ] Emails komen aan (check spam folder)

### SEO Tests
- [ ] Sitemap.xml bereikbaar: `/sitemap.xml`
- [ ] Robots.txt bereikbaar: `/robots.txt`
- [ ] Meta tags aanwezig (check view source)
- [ ] Open Graph tags werken (test met https://www.opengraph.xyz)

---

## 🔍 GOOGLE SETUP (OPTIONEEL)

### Google Search Console
- [ ] Account aangemaakt
- [ ] Property toegevoegd: `https://ro-techdevelopment.com`
- [ ] Verificatie voltooid (HTML file, meta tag, of DNS)
- [ ] Sitemap ingediend: `/sitemap.xml`

### Google Analytics (Optioneel)
- [ ] GA4 account aangemaakt
- [ ] Measurement ID gekregen (G-XXXXXXXXXX)
- [ ] Toegevoegd aan environment variables
- [ ] Tracking werkt (test met GA Real-Time)

---

## 📊 MONITORING SETUP

### Vercel Analytics
- [ ] Vercel Analytics ingeschakeld (optioneel)
- [ ] Performance monitoring actief

### Email Monitoring
- [ ] Resend dashboard bookmarked
- [ ] Email logs regelmatig checken
- [ ] Failed emails monitoren

---

## 🎯 LAUNCH DAY CHECKLIST

**Op de dag van lancering:**

### Ochtend (Pre-Launch)
- [ ] Final build test lokaal
- [ ] Code gepusht naar GitHub
- [ ] Vercel deployment gestart
- [ ] Environment variables gecheckt

### Middag (Launch)
- [ ] Website live op domein
- [ ] SSL certificaat actief
- [ ] Alle pagina's getest
- [ ] Formulieren getest
- [ ] Emails werken

### Avond (Post-Launch)
- [ ] Google Search Console setup
- [ ] Sitemap ingediend
- [ ] Social media posts (als van toepassing)
- [ ] Monitoring ingesteld

---

## 📝 CONTACTGEGEVENS VERIFICATIE

**Zorg dat deze correct zijn op de website:**
- [ ] Email: `contact@ro-techdevelopment.com`
- [ ] Telefoon: `+31 6 57 23 55 74`
- [ ] WhatsApp: `+31 6 57 23 55 74`
- [ ] Adres: `Kruisstraat 64, 5502 JG Veldhoven`
- [ ] KvK: `86858173`
- [ ] BTW: `NL004321198B83`

**Check in:**
- [ ] Header component
- [ ] Footer component
- [ ] WhatsApp button
- [ ] Structured data
- [ ] Contact pagina

---

## 🆘 TROUBLESHOOTING

### Email werkt niet
**Check:**
1. Resend dashboard → Emails tab
2. API key correct in Vercel?
3. FROM_EMAIL geverifieerd?
4. Check spam folder
5. Resend logs voor errors

### Website niet bereikbaar
**Check:**
1. DNS propagation: https://dnschecker.org
2. DNS records correct?
3. Vercel deployment succesvol?
4. Wacht 24-48 uur voor full propagation

### Build fails
**Check:**
1. Vercel build logs
2. Test lokaal: `npm run build`
3. TypeScript errors?
4. Environment variables correct?

---

## ✅ VOLTOOID!

Als alle items zijn afgevinkt, is je website volledig live en werkend! 🎉

**Belangrijkste URLs:**
- Website: https://ro-techdevelopment.com
- Vercel Dashboard: https://vercel.com/dashboard
- Resend Dashboard: https://resend.com/emails
- Google Search Console: https://search.google.com/search-console

---

**Laatste update:** 14 januari 2026
