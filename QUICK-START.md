# ⚡ QUICK START - Website Live Zetten

**Snelle gids om je website binnen 30 minuten live te krijgen**

---

## 🎯 STAP 1: RESEND SETUP (10 min)

1. **Account aanmaken:** https://resend.com → Sign Up
2. **API Key genereren:** Dashboard → API Keys → Create API Key
3. **Kopieer key:** Begint met `re_` - bewaar veilig!
4. **Domein verifiëren:** 
   - Dashboard → Domains → Add Domain
   - Voeg DNS records toe (Resend geeft instructies)
   - Wacht op verificatie (5-30 min)

---

## 🚀 STAP 2: VERCEL DEPLOYMENT (10 min)

### Optie A: Via GitHub (Aanbevolen)

```bash
# 1. GitHub repository aanmaken
# Ga naar github.com → New Repository → "rotech-website"

# 2. Code pushen
cd c:\Users\bvrvl\Desktop\Online_projects\WebDev_Projects\rotech-website
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/[jouw-username]/rotech-website.git
git push -u origin main
```

**In Vercel:**
1. Ga naar https://vercel.com
2. **Add New** → **Project**
3. Import GitHub repository
4. Klik **Deploy**

### Optie B: Direct Vercel CLI

```bash
npm i -g vercel
vercel login
vercel --prod
```

---

## ⚙️ STAP 3: ENVIRONMENT VARIABLES (5 min)

**In Vercel Dashboard:**
Project → Settings → Environment Variables

**Voeg toe:**
```env
NEXT_PUBLIC_SITE_URL=https://ro-techdevelopment.com
CONTACT_EMAIL=contact@ro-techdevelopment.com
RESEND_API_KEY=re_xxxxxxxxxxxxx
FROM_EMAIL=noreply@ro-techdevelopment.com
```

**Belangrijk:** Selecteer **Production**, **Preview**, en **Development** voor elke variable!

---

## 🔗 STAP 4: DOMEIN KOPPELEN (5 min)

1. **In Vercel:** Settings → Domains → Add Domain
2. **Voer in:** `ro-techdevelopment.com`
3. **DNS Records:** Vercel geeft je exacte records
4. **In DNS Provider:** Voeg records toe
5. **Wacht:** 5-60 minuten voor DNS propagation

**SSL certificaat:** ✅ Automatisch via Vercel!

---

## ✅ STAP 5: TESTEN (5 min)

1. **Website checken:** https://ro-techdevelopment.com
2. **Contact formulier testen:**
   - Ga naar `/contact`
   - Vul formulier in
   - Submit
   - Check email inbox
3. **Offerte wizard testen:**
   - Ga naar `/offerte`
   - Doorloop alle stappen
   - Submit
   - Check email inbox

---

## 📧 EMAIL WERKT AUTOMATISCH!

✅ **Email code is nu actief!** 

Zodra je `RESEND_API_KEY` en `CONTACT_EMAIL` hebt toegevoegd aan Vercel, werken de formulieren automatisch.

**Geen code wijzigingen meer nodig!**

---

## 🆘 PROBLEMEN?

### Email werkt niet
- Check Resend dashboard → Emails tab
- Check of API key correct is
- Check of FROM_EMAIL geverifieerd is

### Website niet bereikbaar
- Wacht op DNS propagation (max 48 uur)
- Check DNS records: https://dnschecker.org

### Build fails
- Check build logs in Vercel
- Test lokaal: `npm run build`

---

## ✅ KLAAR!

Je website is nu live en klanten kunnen contact opnemen! 🎉

**Volgende stappen:**
- Google Search Console setup
- Google Analytics (optioneel)
- Monitor formulieren in Resend dashboard
