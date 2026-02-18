# 📱 MASTER PROMPT: PROGRESSIVE WEB APP (PWA)

## Dienst Informatie
- **Dienst:** Progressive Web App
- **Type:** Toevoeging aan bestaand project OF standalone
- **Prijsrange:** Vanaf €2.995 (add-on) / Vanaf €5.000 (standalone)
- **Doorlooptijd:** 1-3 weken extra

---

## 📋 KLANTGEGEVENS

```
BEDRIJFSNAAM: [Invullen]
CONTACTPERSOON: [Invullen]
EMAIL: [Invullen]

=== BESTAAND PROJECT ===
IS DIT EEN ADD-ON?: [Ja/Nee]
BESTAANDE WEBSITE/APP URL: [URL indien van toepassing]
FRAMEWORK: [Next.js/React/Vue/Anders]
```

---

## 🎯 PWA REQUIREMENTS

```
=== USE CASE ===
Waarom een PWA?
- [ ] Installeerbaar op homescreen
- [ ] Offline functionaliteit
- [ ] Push notificaties
- [ ] Snellere laadtijden
- [ ] Native app-feel
- [ ] Geen App Store nodig
- [ ] Anders: [...]

=== DOELGROEP DEVICES ===
Welke apparaten gebruiken de bezoekers?
- [ ] Smartphone (primair)
- [ ] Tablet
- [ ] Desktop
Besturingssystemen:
- [ ] iOS
- [ ] Android
- [ ] Windows
- [ ] macOS

=== OFFLINE FUNCTIONALITEIT ===
Wat moet offline beschikbaar zijn?
- [ ] Volledige app
- [ ] Alleen statische content
- [ ] Recent bekeken items
- [ ] Cached data
- [ ] Offline formulieren (sync later)
- [ ] Niets (alleen installeerbaar)

Welke specifieke features offline?
1. [Feature 1]
2. [Feature 2]

=== PUSH NOTIFICATIES ===
Wil de klant push notificaties?
- [ ] Ja
- [ ] Nee
- [ ] Later fase

Indien ja, welke triggers?
- [ ] Nieuwe content/updates
- [ ] Order updates
- [ ] Herinneringen
- [ ] Promoties/aanbiedingen
- [ ] Anders: [...]

=== SYNCHRONISATIE ===
Bij offline gebruik, hoe synchroniseren?
- [ ] Automatisch bij online komen
- [ ] Handmatige sync knop
- [ ] Background sync
- [ ] Conflict handling nodig?: [Ja/Nee - beschrijf]

=== INSTALLATIE PROMPT ===
Wanneer tonen?
- [ ] Na X seconden
- [ ] Na X pageviews
- [ ] Bij specifieke actie
- [ ] Nooit automatisch (alleen handmatig)
```

---

## 🛠️ TECHNISCHE SPECIFICATIES

### Tech Stack
```
Service Worker:     Workbox (via next-pwa of serwist)
Push:               Web Push API + Service (OneSignal / Custom)
Storage:            IndexedDB voor offline data
Caching:            Workbox strategies
Icons:              Maskable icons + alle formaten
Manifest:           Web App Manifest
```

### Bestanden & Structuur
```
/[project-naam]
├── public/
│   ├── manifest.json           # Web App Manifest
│   ├── sw.js                   # Service Worker (generated)
│   ├── icons/
│   │   ├── icon-72x72.png
│   │   ├── icon-96x96.png
│   │   ├── icon-128x128.png
│   │   ├── icon-144x144.png
│   │   ├── icon-152x152.png
│   │   ├── icon-192x192.png
│   │   ├── icon-384x384.png
│   │   ├── icon-512x512.png
│   │   └── maskable-icon.png   # Maskable voor Android
│   ├── apple-touch-icon.png
│   └── screenshots/            # Voor install prompt
│       ├── screenshot-1.png
│       └── screenshot-2.png
│
├── src/
│   ├── app/
│   │   ├── manifest.ts         # Dynamic manifest (Next.js 15)
│   │   └── ...
│   │
│   ├── components/
│   │   ├── pwa/
│   │   │   ├── InstallPrompt.tsx
│   │   │   ├── UpdatePrompt.tsx
│   │   │   └── PushNotification.tsx
│   │   └── ...
│   │
│   ├── hooks/
│   │   ├── usePWA.ts
│   │   ├── useInstallPrompt.ts
│   │   ├── useOnlineStatus.ts
│   │   └── usePushNotifications.ts
│   │
│   ├── lib/
│   │   ├── sw-registration.ts
│   │   └── push.ts
│   │
│   └── workers/
│       └── sw.ts               # Service worker source
│
└── next.config.ts              # PWA config
```

---

## 📝 CURSOR AI INSTRUCTIES

### Fase 1: Basis PWA Setup

```
Voeg PWA functionaliteit toe aan het Next.js project:

=== INSTALLEER DEPENDENCIES ===
- @serwist/next (of next-pwa)
- idb (IndexedDB wrapper, optioneel)

=== WEB APP MANIFEST ===
Maak manifest.ts (of manifest.json):

{
  "name": "[VOLLEDIGE APP NAAM]",
  "short_name": "[KORTE NAAM - max 12 chars]",
  "description": "[BESCHRIJVING]",
  "start_url": "/",
  "display": "standalone",
  "background_color": "[KLEUR - meestal #FFFFFF]",
  "theme_color": "[PRIMAIRE KLEUR]",
  "orientation": "portrait-primary",
  "scope": "/",
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/maskable-icon.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    }
  ],
  "screenshots": [
    {
      "src": "/screenshots/screenshot-1.png",
      "sizes": "1080x1920",
      "type": "image/png",
      "form_factor": "narrow"
    }
  ]
}

=== NEXT.CONFIG.TS ===
Configureer met serwist/next-pwa:
- Runtime caching strategies
- Precaching van static assets
- Skip waiting voor updates
```

### Fase 2: Service Worker

```
Configureer de Service Worker met Workbox strategies:

=== CACHING STRATEGIES ===

1. STATISCHE ASSETS (Cache First)
   - CSS, JS, fonts
   - Afbeeldingen
   - Cache duur: lang (versioned)

2. PAGINA'S (Network First)
   - HTML pagina's
   - Fallback naar cache
   - Offline pagina als fallback

3. API CALLS (Stale While Revalidate)
   - Data requests
   - Toon cached, update in background

4. AFBEELDINGEN (Cache First met expiry)
   - Product images etc.
   - Max 50-100 items in cache
   - Expiry na X dagen

=== OFFLINE FALLBACK ===
Maak /offline pagina:
- Friendly message
- "Je bent offline"
- Mogelijkheid tot retry
- Cached content tonen indien beschikbaar

=== PRECACHING ===
Precache belangrijke pagina's:
- Homepage
- Belangrijke subpagina's
- Offline pagina
- App shell
```

### Fase 3: Install Prompt

```
Maak een custom install prompt component:

=== INSTALL PROMPT COMPONENT ===
- Detecteer 'beforeinstallprompt' event
- Toon custom UI (banner of modal)
- Timing: [na X seconden / na X views / custom]
- Remember dismissal (localStorage)
- Toon niet na installatie

=== iOS INSTRUCTIES ===
iOS ondersteunt geen install prompt.
Toon instructies:
"Tik op 'Deel' → 'Zet op beginscherm'"

=== STIJL ===
- Past bij huisstijl
- Niet opdringerig
- Duidelijke value proposition
- Dismiss knop
```

### Fase 4: Push Notificaties (indien van toepassing)

```
Implementeer Web Push notificaties:

=== SETUP ===
1. Genereer VAPID keys
2. Backend endpoint voor subscriptions
3. Service worker push handler

=== PERMISSION FLOW ===
1. Vraag niet direct bij laden
2. Trigger: [na actie / in settings]
3. Leg uit WAAROM
4. Handle denied/granted

=== NOTIFICATION TYPES ===
[Lijst van notificatie types]

=== BACKEND INTEGRATIE ===
API endpoint voor:
- Subscribe opslaan
- Unsubscribe
- Notificatie versturen
```

### Fase 5: Offline Data (indien van toepassing)

```
Implementeer offline data synchronisatie:

=== INDEXEDDB SETUP ===
- Database naam: [app-name]-offline
- Stores: [lijst van data types]

=== SYNC STRATEGY ===
1. Bij data change:
   - Probeer direct sync
   - Bij offline: opslaan in queue
2. Bij online komen:
   - Sync queue verwerken
   - Conflict resolution

=== UI INDICATIES ===
- Online/offline indicator
- "Opgeslagen lokaal" feedback
- Sync status
```

---

## ✅ OPLEVERING CHECKLIST

### PWA Basis
- [ ] Manifest.json correct en volledig
- [ ] Alle icon sizes aanwezig (72-512px)
- [ ] Maskable icon aanwezig
- [ ] Service worker registreert
- [ ] App installeerbaar op Android
- [ ] App werkt op iOS homescreen
- [ ] Start URL correct

### Caching
- [ ] Static assets gecached
- [ ] Pagina's gecached
- [ ] Offline pagina werkt
- [ ] Cache wordt bijgewerkt

### User Experience
- [ ] Install prompt werkt
- [ ] iOS instructies tonen
- [ ] Offline indicator (indien van toepassing)
- [ ] Update prompt bij nieuwe versie

### Performance
- [ ] Lighthouse PWA score > 90
- [ ] First Contentful Paint < 2s
- [ ] Time to Interactive < 5s

### Push (indien van toepassing)
- [ ] Permission flow werkt
- [ ] Subscriptions opgeslagen
- [ ] Notificaties ontvangen
- [ ] Click handling werkt

---

## 🧪 TESTING

### Handmatige Tests
```
1. INSTALLATIE TEST
   - Android Chrome: Installeer via banner
   - iOS Safari: Voeg toe aan beginscherm
   - Desktop Chrome: Installeer via omnibox

2. OFFLINE TEST
   - Open app
   - Zet vliegtuigmodus aan
   - Navigeer door app
   - Check welke content werkt

3. UPDATE TEST
   - Deploy nieuwe versie
   - Open app
   - Check of update prompt komt
   - Ververs en check nieuwe versie

4. PUSH TEST (indien van toepassing)
   - Subscribe voor notifications
   - Stuur test notificatie
   - Check of deze binnenkomt
   - Klik op notificatie
```

### Lighthouse PWA Audit
```
Open Chrome DevTools → Lighthouse → PWA
Vereiste checks:
- ✅ Installable
- ✅ PWA Optimized
- ✅ Maskable icon
- ✅ Offline capability
```

---

## 🔧 ENVIRONMENT VARIABLES

```env
# Push Notifications (indien van toepassing)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
VAPID_SUBJECT=mailto:support@[domein]

# OneSignal (alternatief voor push)
NEXT_PUBLIC_ONESIGNAL_APP_ID=
```

---

## 📊 ICONS GENEREREN

```
Benodigde icon sizes:
- 72x72, 96x96, 128x128, 144x144
- 152x152 (iOS)
- 192x192 (Android)
- 384x384, 512x512

Tools:
- PWA Asset Generator: https://progressier.com/pwa-icons-and-ios-splash-screen-generator
- Maskable.app: https://maskable.app/editor
- RealFaviconGenerator: https://realfavicongenerator.net/

Zorg voor:
- Consistent design across sizes
- Maskable variant (safe zone beachten)
- Apple touch icon (180x180)
```

---

*Master Prompt Versie 1.0 | RoTech Development | Januari 2026*
