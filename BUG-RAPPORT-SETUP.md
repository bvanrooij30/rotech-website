# 🐛 Bug Rapport: Setup Pagina Error

**Datum:** 2026-01-27  
**Status:** KRITIEK  
**Pagina:** https://ro-techdevelopment.dev/setup

---

## 📋 Symptoom

De setup pagina toont "Er is iets misgegaan" error via de ErrorBoundary component.

---

## 🔍 Root Cause Analyse

### BUG #1: Dubbele HTML/Body Tags (KRITIEK)

**Locatie:** `src/app/(setup)/layout.tsx`

**Probleem:**  
De route group layout definieert zijn eigen `<html>` en `<body>` tags:

```tsx
export default function SetupLayout({ children }) {
  return (
    <html lang="nl">  // ❌ FOUT: Dubbele html tag
      <body>          // ❌ FOUT: Dubbele body tag
        {children}
      </body>
    </html>
  );
}
```

**Waarom dit faalt:**  
In Next.js 13+ App Router erven route groups (`(naam)`) de root layout. Ze creëren GEEN aparte HTML documenten. Dit resulteert in:
1. Root layout rendert `<html><body>...</body></html>`
2. Route group layout rendert NOGMAALS `<html><body>...</body></html>` 
3. Browser krijgt ongeldige HTML → Hydration error → ErrorBoundary vangt crash

**Bewijs:**  
De websearch resultaten tonen dat de pagina WEL de header/footer van de root layout toont, wat bevestigt dat de root layout nog steeds actief is.

---

### BUG #2: Route Group Misconceptie

**Verwachting:** Route group zou een volledig aparte layout hebben  
**Realiteit:** Route groups delen de root layout, ze vervangen deze niet

**Next.js Route Group Documentatie:**
- Route groups `(naam)` zijn voor organisatie, niet voor aparte layouts
- Alle routes delen dezelfde `app/layout.tsx` (root layout)
- Voor een volledig aparte layout heb je een aparte `app` directory nodig (niet ondersteund)

---

## ✅ Oplossingen

### Oplossing A: Verwijder HTML/Body uit Route Group (Aanbevolen)

```tsx
// src/app/(setup)/layout.tsx
export default function SetupLayout({ children }) {
  return <>{children}</>;  // Alleen children doorgeven
}
```

**Nadeel:** Setup pagina heeft nog steeds header/footer van root layout.

---

### Oplossing B: Conditie in Root Layout

Pas de root layout aan om header/footer conditioneel te renderen:

```tsx
// src/app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html lang="nl">
      <body>
        {/* Geen header/footer - die worden per pagina toegevoegd */}
        {children}
      </body>
    </html>
  );
}
```

En voeg header/footer toe aan de pagina's die het nodig hebben.

**Nadeel:** Grote refactor nodig.

---

### Oplossing C: Aparte Route voor Setup (Simpelste Fix)

Maak een simpele setup pagina die WEL de normale layout gebruikt maar de content fullscreen overlay rendert.

```tsx
// De setup pagina rendert een fullscreen overlay die de header/footer bedekt
return (
  <div className="fixed inset-0 z-[9999] bg-gradient-to-br from-slate-900 ...">
    {/* Setup form */}
  </div>
);
```

---

## 🎯 Aanbevolen Actie

**Oplossing C implementeren:**
1. Verplaats setup terug naar normale app directory (`src/app/setup/`)
2. Maak de setup pagina een fullscreen overlay met `fixed inset-0 z-[9999]`
3. Verwijder de route group `(setup)`

Dit is de snelste fix die werkt binnen de bestaande architectuur.

---

## 📁 Te Wijzigen Bestanden

| Bestand | Actie |
|---------|-------|
| `src/app/(setup)/layout.tsx` | VERWIJDEREN |
| `src/app/(setup)/setup/page.tsx` | VERPLAATSEN naar `src/app/setup/page.tsx` |
| `src/app/setup/page.tsx` | Toevoegen `fixed inset-0 z-[9999]` aan wrapper |

---

## ⏱️ Geschatte Fix Tijd

**15 minuten** voor implementatie en deployment.
