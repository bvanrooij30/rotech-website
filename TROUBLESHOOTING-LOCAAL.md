# 🔧 Troubleshooting - Lokaal Server Problemen

**Als localhost:3000 niet werkt, probeer dit:**

---

## ✅ SERVER IS GESTART

**De development server draait nu op:**
- **http://localhost:3000**

**Probeer nu:**
1. **Refresh je browser** (F5 of Ctrl+R)
2. **Hard refresh** (Ctrl+Shift+R of Ctrl+F5)
3. **Clear browser cache** en probeer opnieuw

---

## 🔧 ALTERNATIEVE OPLOSSINGEN

### Oplossing 1: Andere Poort Gebruiken

Als poort 3000 problemen geeft:

```bash
# Stop huidige server (Ctrl+C in terminal)
# Start op poort 3001
npm run dev -- -p 3001
```

**Open dan:** http://localhost:3001

### Oplossing 2: Server Volledig Herstarten

```powershell
# Stop alle Node processen
taskkill /F /IM node.exe

# Wacht 2 seconden
Start-Sleep -Seconds 2

# Start opnieuw
cd c:\Users\bvrvl\Desktop\Online_projects\WebDev_Projects\rotech-website
npm run dev
```

### Oplossing 3: Check Browser Console

**Open Developer Tools (F12) en check:**
- **Console tab:** Zijn er errors?
- **Network tab:** Wordt de pagina geladen?
- **Status codes:** 200 = OK, 404 = Not Found, 500 = Server Error

### Oplossing 4: Check Terminal Output

**Kijk in de terminal waar `npm run dev` draait:**
- Zijn er errors?
- Staat er "Ready" of "Compiled successfully"?
- Zijn er warnings?

---

## 🆘 VEELVOORKOMENDE PROBLEMEN

### Probleem: Zwart Scherm / Blank Page

**Mogelijke oorzaken:**
1. Server is niet gestart → Start `npm run dev`
2. Build errors → Check terminal output
3. JavaScript errors → Check browser console (F12)
4. Cache probleem → Hard refresh (Ctrl+Shift+R)

**Oplossing:**
```bash
# 1. Stop server (Ctrl+C)
# 2. Clear .next folder
rm -r .next

# 3. Herstart
npm run dev
```

### Probleem: "Cannot GET /"

**Oorzaak:** Server draait niet of verkeerde poort

**Oplossing:**
```bash
# Check of server draait
netstat -ano | findstr :3000

# Start server
npm run dev
```

### Probleem: "Port 3000 is already in use"

**Oorzaak:** Ander proces gebruikt poort 3000

**Oplossing:**
```powershell
# Vind proces op poort 3000
netstat -ano | findstr :3000

# Stop proces (vervang PID)
taskkill /PID [PID-nummer] /F

# Of gebruik andere poort
npm run dev -- -p 3001
```

### Probleem: Build Errors

**Oorzaak:** TypeScript of code errors

**Oplossing:**
```bash
# Check errors
npm run build

# Fix errors die verschijnen
# Herstart server
npm run dev
```

---

## ✅ VERIFICATIE CHECKLIST

**Check dit om te verifiëren dat alles werkt:**

- [ ] Server draait (terminal toont "Ready")
- [ ] Poort 3000 is open (netstat toont LISTENING)
- [ ] Geen build errors in terminal
- [ ] Browser console (F12) toont geen errors
- [ ] Network tab toont 200 status voor pagina
- [ ] `.env.local` bestaat (optioneel voor lokaal)

---

## 🎯 SNELLE FIX

**Als niets werkt, probeer dit:**

```powershell
# 1. Stop alles
taskkill /F /IM node.exe

# 2. Clear cache
cd c:\Users\bvrvl\Desktop\Online_projects\WebDev_Projects\rotech-website
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue

# 3. Herstart
npm run dev
```

**Wacht 10-15 seconden voor server start, dan:**
- Open http://localhost:3000
- Hard refresh (Ctrl+Shift+R)

---

**Laatste update:** 14 januari 2026
