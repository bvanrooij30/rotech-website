# 🖥️ Website Lokaal Testen - Quick Guide

**Snelle gids om de website lokaal te testen in je browser**

---

## ⚡ SNELSTART (2 minuten)

### Stap 1: Dependencies Installeren (als nog niet gedaan)

```bash
cd c:\Users\bvrvl\Desktop\Online_projects\WebDev_Projects\rotech-website
npm install
```

### Stap 2: Development Server Starten

```bash
npm run dev
```

### Stap 3: Open in Browser

**Website is nu bereikbaar op:**
- **Local:** http://localhost:3000
- **Network:** http://[jouw-ip]:3000 (voor testen op andere apparaten)

---

## 📋 VOLLEDIGE INSTRUCTIES

### 1. Environment Variables Checken

**Zorg dat `.env.local` bestaat met:**

```env
# Site URL (voor lokaal testen)
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Email (optioneel voor lokaal - formulieren werken zonder, maar emails worden niet verstuurd)
# CONTACT_EMAIL=contact@ro-techdevelopment.com
# RESEND_API_KEY=re_xxxxxxxxxxxxx
# FROM_EMAIL=noreply@ro-techdevelopment.com
```

**Voor lokaal testen zijn email variables NIET verplicht!**
- Formulieren werken wel (validatie, success messages)
- Emails worden alleen verstuurd als `RESEND_API_KEY` is ingesteld

### 2. Development Server Starten

```bash
# Navigeer naar project folder
cd c:\Users\bvrvl\Desktop\Online_projects\WebDev_Projects\rotech-website

# Start development server
npm run dev
```

**Je ziet:**
```
▲ Next.js 16.1.1
- Local:        http://localhost:3000
- Network:      http://192.168.x.x:3000

✓ Ready in 2.3s
```

### 3. Browser Openen

**Open je browser en ga naar:**
- http://localhost:3000

**Je ziet nu de volledige website!**

---

## ✅ WAT JE KUNT TESTEN

### 1. Alle Pagina's
- ✅ Homepage: http://localhost:3000
- ✅ Diensten: http://localhost:3000/diensten
- ✅ Portfolio: http://localhost:3000/projecten
- ✅ Blog: http://localhost:3000/blog
- ✅ Contact: http://localhost:3000/contact
- ✅ Offerte: http://localhost:3000/offerte
- ✅ Over Ons: http://localhost:3000/over-ons
- ✅ Prijzen: http://localhost:3000/prijzen
- ✅ FAQ: http://localhost:3000/veelgestelde-vragen

### 2. Formulieren Testen

**Contact Formulier:**
1. Ga naar: http://localhost:3000/contact
2. Vul formulier in
3. Submit
4. **Check:** Success message verschijnt
5. **Check:** Console (F12) voor logs (development mode)

**Offerte Wizard:**
1. Ga naar: http://localhost:3000/offerte
2. Doorloop alle 5 stappen
3. Submit
4. **Check:** Success message

**Note:** Emails worden alleen verstuurd als `RESEND_API_KEY` is ingesteld in `.env.local`

### 3. Responsive Design
- ✅ Test op verschillende schermgroottes
- ✅ Test op mobile (Chrome DevTools → Toggle device toolbar)
- ✅ Test WhatsApp button (rechtsonder)

### 4. SEO Features
- ✅ Check meta tags: View Source (Ctrl+U)
- ✅ Check structured data: View Source → zoek naar `application/ld+json`
- ✅ Sitemap: http://localhost:3000/sitemap.xml
- ✅ Robots.txt: http://localhost:3000/robots.txt
- ✅ llms.txt: http://localhost:3000/llms.txt

### 5. Performance
- ✅ Check page load speed
- ✅ Check images (lazy loading)
- ✅ Check animations (Framer Motion)

---

## 🔧 TROUBLESHOOTING

### Port 3000 is al in gebruik

**Oplossing:**
```bash
# Gebruik andere poort
npm run dev -- -p 3001
```

**Of stop andere processen op poort 3000:**
```powershell
# Windows PowerShell
netstat -ano | findstr :3000
# Noteer PID nummer
taskkill /PID [PID-nummer] /F
```

### Dependencies errors

**Oplossing:**
```bash
# Verwijder node_modules en package-lock.json
rm -r node_modules
rm package-lock.json

# Herinstalleer
npm install
```

### Build errors

**Oplossing:**
```bash
# Check TypeScript errors
npm run build

# Fix errors die verschijnen
```

### Environment variables niet geladen

**Oplossing:**
1. Check of `.env.local` bestaat
2. Check of variabelen correct zijn (geen spaties rond `=`)
3. **Herstart development server** na wijzigingen in `.env.local`

---

## 📝 BELANGRIJKE COMMANDS

```bash
# Development server starten
npm run dev

# Production build testen
npm run build
npm run start

# Linter checken
npm run lint

# Development server op andere poort
npm run dev -- -p 3001
```

---

## 🎯 TEST CHECKLIST

### Functioneel
- [ ] Alle pagina's laden correct
- [ ] Navigatie werkt
- [ ] Contact formulier werkt
- [ ] Offerte wizard werkt
- [ ] WhatsApp button werkt
- [ ] Links werken

### Design
- [ ] Responsive op mobile
- [ ] Responsive op tablet
- [ ] Responsive op desktop
- [ ] Animations werken
- [ ] Images laden correct

### SEO
- [ ] Meta tags aanwezig
- [ ] Structured data aanwezig
- [ ] Sitemap.xml werkt
- [ ] Robots.txt werkt

### Performance
- [ ] Pagina's laden snel
- [ ] Images zijn geoptimaliseerd
- [ ] Geen console errors

---

## ✅ KLAAR!

**Je website draait nu lokaal op:**
- **http://localhost:3000**

**Test alles voordat je live gaat!**

---

**Laatste update:** 14 januari 2026
