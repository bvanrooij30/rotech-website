# 🚀 VERCEL DEPLOYMENT - Stap-voor-Stap

**Complete gids om je website op Vercel te deployen**

---

## 📦 OPTIE 1: VIA GITHUB (Aanbevolen)

### Stap 1: GitHub Repository

```bash
# Navigeer naar project folder
cd c:\Users\bvrvl\Desktop\Online_projects\WebDev_Projects\rotech-website

# Git initialiseren (als nog niet gedaan)
git init

# Alle bestanden toevoegen
git add .

# Commit maken
git commit -m "Initial commit - Rotech website ready for deployment"

# GitHub repository aanmaken (via github.com)
# Ga naar: https://github.com/new
# Repository naam: rotech-website
# Public of Private (jouw keuze)
# Klik "Create repository"

# Remote toevoegen (vervang [username] met jouw GitHub username)
git remote add origin https://github.com/[username]/rotech-website.git

# Branch naam instellen
git branch -M main

# Code pushen
git push -u origin main
```

### Stap 2: Vercel Project

1. **Ga naar:** https://vercel.com
2. **Login** met GitHub account
3. **Klik:** "Add New" → "Project"
4. **Import:** Selecteer `rotech-website` repository
5. **Configure:**
   - Framework Preset: **Next.js** (auto-detect)
   - Root Directory: `./` (default)
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)
6. **Klik:** "Deploy"

**Wacht 2-3 minuten voor build...**

---

## 📦 OPTIE 2: VIA VERCEL CLI

```bash
# Installeer Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy (eerste keer)
vercel

# Volg instructies:
# - Link to existing project? No
# - Project name? rotech-website
# - Directory? ./
# - Override settings? No

# Production deploy
vercel --prod
```

---

## ⚙️ ENVIRONMENT VARIABLES IN VERCEL

**Na eerste deploy:**

1. **Ga naar:** Project Dashboard → Settings → Environment Variables
2. **Klik:** "Add New"
3. **Voeg toe (één voor één):**

```env
# Variable 1
Name: NEXT_PUBLIC_SITE_URL
Value: https://ro-techdevelopment.com
Environment: Production, Preview, Development

# Variable 2
Name: CONTACT_EMAIL
Value: contact@ro-techdevelopment.com
Environment: Production, Preview, Development

# Variable 3
Name: RESEND_API_KEY
Value: re_xxxxxxxxxxxxx
Environment: Production, Preview, Development

# Variable 4
Name: FROM_EMAIL
Value: noreply@ro-techdevelopment.com
Environment: Production, Preview, Development
```

4. **Klik:** "Save" voor elke variable
5. **Redeploy:** Ga naar Deployments → Latest → Menu (⋯) → Redeploy

---

## 🔗 DOMEIN KOPPELEN

### Stap 1: Domein Toevoegen

1. **In Vercel:** Project → Settings → Domains
2. **Klik:** "Add Domain"
3. **Voer in:** `ro-techdevelopment.com`
4. **Klik:** "Add"

### Stap 2: DNS Records

Vercel geeft je exacte DNS records. Meestal:

**Voor Root Domain:**
```
Type: A
Name: @
Value: 76.76.21.21
```

**Voor WWW:**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

**In je DNS Provider (bijv. Namecheap):**
1. Log in bij je DNS provider
2. Ga naar DNS Management
3. Voeg de records toe zoals Vercel aangeeft
4. **Wacht:** 5-60 minuten voor DNS propagation

### Stap 3: SSL Certificaat

✅ **Automatisch!** Vercel regelt SSL via Let's Encrypt.

**Check na 5-10 minuten:**
- Ga naar https://ro-techdevelopment.com
- Je zou een groen slotje moeten zien

---

## 🔄 REDEPLOY NA WIJZIGINGEN

**Na code wijzigingen:**

```bash
# Push naar GitHub
git add .
git commit -m "Beschrijving van wijziging"
git push

# Vercel deployt automatisch!
```

**Of handmatig redeploy:**
- Vercel Dashboard → Deployments → Latest → Redeploy

---

## 📊 MONITORING

### Vercel Analytics
1. Project → Analytics
2. Klik "Enable Analytics"
3. Gratis tier: 100k events/maand

### Build Logs
- Project → Deployments → Klik op deployment
- Zie volledige build logs

### Function Logs
- Project → Functions tab
- Zie API route logs

---

## ✅ TESTEN NA DEPLOYMENT

### 1. Website Check
```bash
# Test of website bereikbaar is
curl -I https://ro-techdevelopment.com
```

### 2. Formulieren Testen
1. Ga naar `/contact`
2. Vul formulier in
3. Submit
4. Check email inbox

### 3. Security Headers
```bash
curl -I https://ro-techdevelopment.com | grep -i "x-"
```

**Verwacht:**
- `strict-transport-security`
- `x-frame-options`
- `x-content-type-options`
- `content-security-policy`

---

## 🆘 PROBLEMEN OPLOSSEN

### Build Fails
1. Check build logs in Vercel
2. Test lokaal: `npm run build`
3. Check TypeScript errors
4. Check environment variables

### Domain Not Working
1. Check DNS records: https://dnschecker.org
2. Wacht op propagation (max 48 uur)
3. Check Vercel domain settings

### Email Not Working
1. Check Resend dashboard
2. Check environment variables in Vercel
3. Check Resend API key
4. Check FROM_EMAIL verificatie

---

## 📝 BELANGRIJKE LINKS

- **Vercel Dashboard:** https://vercel.com/dashboard
- **Project Settings:** https://vercel.com/[team]/rotech-website/settings
- **Deployments:** https://vercel.com/[team]/rotech-website/deployments
- **Environment Variables:** https://vercel.com/[team]/rotech-website/settings/environment-variables
- **Domains:** https://vercel.com/[team]/rotech-website/settings/domains

---

**Klaar!** Je website is nu live op Vercel! 🎉
