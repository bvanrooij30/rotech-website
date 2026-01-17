# 🔧 MASTER PROMPT: WEBSITE ONDERHOUD (ABONNEMENT)

## Dienst Informatie
- **Dienst:** Website Onderhoud & Beheer
- **Type:** Maandelijks/Jaarlijks abonnement
- **Prijsrange:** 
  - Basis: €99/maand
  - Standaard: €199/maand
  - Premium: €349/maand
- **Facturatie:** Maandelijks of jaarlijks (10% korting)

---

## 📋 KLANTGEGEVENS

```
BEDRIJFSNAAM: [Invullen]
WEBSITE URL: [https://...]
CONTACTPERSOON: [Invullen]
EMAIL: [Invullen]
TELEFOON: [Invullen]

=== WEBSITE DETAILS ===
TYPE WEBSITE: [Website / Webshop / Web App]
PLATFORM: [Next.js / WordPress / Shopify / etc.]
HOSTING: [Vercel / AWS / Eigen server]
GEBOUWD DOOR: [RoTech / Anders: ___]
LIVEGANG DATUM: [Datum]

=== ABONNEMENT ===
GEKOZEN PAKKET: [Basis / Standaard / Premium]
STARTDATUM: [Datum]
FACTURATIE: [Maandelijks / Jaarlijks]
```

---

## 📦 PAKKETTEN OVERZICHT

### Basis (€99/maand)
```
✅ Hosting monitoring
✅ Uptime monitoring (5 min checks)
✅ SSL certificaat beheer
✅ Maandelijkse security updates
✅ Maandelijkse backup
✅ 1 uur kleine aanpassingen/maand
✅ Email support (reactie binnen 48 uur)
❌ Geen priority support
❌ Geen SEO rapportage
❌ Geen performance monitoring
```

### Standaard (€199/maand)
```
✅ Alles van Basis, plus:
✅ Wekelijkse backups
✅ Performance monitoring
✅ Maandelijkse performance check
✅ 2 uur aanpassingen/maand
✅ Kwartaal SEO health check
✅ Priority email support (24 uur)
✅ Telefoon support (kantooruren)
```

### Premium (€349/maand)
```
✅ Alles van Standaard, plus:
✅ Dagelijkse backups
✅ Realtime uptime monitoring
✅ Maandelijkse security scan
✅ 4 uur aanpassingen/maand
✅ Maandelijkse SEO rapportage
✅ A/B testing ondersteuning
✅ Priority support (4 uur response)
✅ WhatsApp support
✅ Kwartaal strategie call
```

---

## 🔄 MAANDELIJKSE TAKEN

### Week 1: Updates & Security
```
=== SECURITY CHECK ===
- [ ] Dependencies updates checken
- [ ] Security advisories reviewen
- [ ] Malware scan (indien van toepassing)

=== UPDATES UITVOEREN ===
- [ ] npm audit / security patches
- [ ] Framework updates (major = overleg)
- [ ] Plugin/package updates
- [ ] Test na updates

=== BACKUP VERIFICATIE ===
- [ ] Controleer backup status
- [ ] Test restore (kwartaal)
```

### Week 2: Performance & Monitoring
```
=== UPTIME CHECK ===
- [ ] Review uptime logs
- [ ] Documenteer downtime (indien van toepassing)
- [ ] Analyseer oorzaken

=== PERFORMANCE CHECK ===
- [ ] Lighthouse score meten
- [ ] Core Web Vitals checken
- [ ] Laadtijden analyseren
- [ ] Bottlenecks identificeren

=== ERROR LOGS ===
- [ ] Review error logs (Vercel/Sentry)
- [ ] Kritieke errors oplossen
- [ ] Rapporteren aan klant indien nodig
```

### Week 3: Content & SEO (Standaard/Premium)
```
=== SEO HEALTH ===
- [ ] Google Search Console checken
- [ ] Crawl errors bekijken
- [ ] Indexatie status
- [ ] Top zoekwoorden reviewen

=== ANALYTICS ===
- [ ] Traffic overview
- [ ] Top pagina's
- [ ] Conversie metrics
```

### Week 4: Rapportage & Planning
```
=== RAPPORTAGE ===
- [ ] Maandrapport opstellen
- [ ] Aanbevelingen formuleren
- [ ] Versturen naar klant

=== PLANNING ===
- [ ] Aanpassingen plannen
- [ ] Grotere updates voorbereiden
- [ ] Communicatie met klant
```

---

## 📊 MONITORING SETUP

### Uptime Monitoring
```
=== TOOL: [UptimeRobot / Better Stack / Vercel] ===

CHECKS:
- Interval: [5 min (Basis) / 1 min (Premium)]
- Endpoints:
  - [ ] Homepage
  - [ ] Belangrijke subpagina's
  - [ ] API endpoints (indien van toepassing)

ALERTS:
- Email: [support email]
- SMS: [telefoon - alleen Premium]
- Slack/Discord: [webhook URL]

RESPONSE:
- Basis: Check binnen 4 uur
- Premium: Check binnen 1 uur
```

### Performance Monitoring
```
=== TOOL: [Vercel Analytics / SpeedCurve / Custom] ===

METRICS TRACKEN:
- Core Web Vitals (LCP, FID/INP, CLS)
- TTFB (Time to First Byte)
- Totale laadtijd

DREMPELS:
- LCP > 3s → Alert
- CLS > 0.1 → Alert
- FID > 200ms → Alert
```

### Error Tracking
```
=== TOOL: [Sentry / LogRocket / Vercel] ===

CONFIGURATIE:
- Environment: Production only
- Sample rate: 100% voor errors
- Alerts: Bij kritieke errors

REVIEW:
- Dagelijks: Kritieke errors
- Wekelijks: Alle errors
- Maandelijks: Trends
```

---

## 💾 BACKUP STRATEGIE

### Backup Configuratie
```
=== DATABASE (indien van toepassing) ===
Frequentie: [Dagelijks (Premium) / Wekelijks (Standaard) / Maandelijks (Basis)]
Retentie: 30 dagen
Locatie: [Vercel / AWS S3 / Cloudflare R2]
Encryptie: AES-256

=== BESTANDEN ===
Frequentie: [Dagelijks / Wekelijks / Maandelijks]
Scope: 
- Uploads folder
- Configuratie bestanden
- .env (encrypted)

=== CODE ===
Locatie: GitHub repository
Branches: main + feature branches
Tags: Bij elke release
```

### Restore Procedure
```
1. Identificeer benodigde backup
2. Download van backup locatie
3. Restore naar staging eerst
4. Verificatie
5. Restore naar productie
6. Verificatie live
```

---

## 📝 AANPASSINGEN TRACKING

### Uren Registratie Template
```markdown
# Uren Registratie - [Maand Jaar]
Klant: [Bedrijfsnaam]
Pakket: [Basis/Standaard/Premium]
Budget: [1/2/4] uur

| Datum | Omschrijving | Tijd | Cumulatief |
|-------|--------------|------|------------|
| [dd-mm] | [Wat gedaan] | [0:30] | [0:30] |
| [dd-mm] | [Wat gedaan] | [0:45] | [1:15] |

Totaal gebruikt: [X:XX]
Resterend: [X:XX]

Overloop naar volgende maand: [Nee / Ja - X uur]
```

### Wat valt onder "aanpassingen"
```
INCLUSIEF:
✅ Teksten wijzigen
✅ Afbeeldingen vervangen
✅ Kleine styling aanpassingen
✅ Nieuwe content toevoegen (blogs, pagina's)
✅ Contact/form updates
✅ Menu aanpassingen
✅ Bug fixes (door ons geïntroduceerd)

EXCLUSIEF (separaat geoffreerd):
❌ Nieuwe functionaliteit
❌ Design wijzigingen (layout)
❌ Nieuwe pagina types
❌ Integraties
❌ Performance optimalisaties (grote)
❌ SEO content schrijven
```

---

## 📧 RAPPORTAGE TEMPLATE

### Maandelijks Rapport
```markdown
# Website Onderhoud Rapport
**Klant:** [Bedrijfsnaam]
**Website:** [URL]
**Periode:** [Maand Jaar]
**Pakket:** [Basis/Standaard/Premium]

---

## Samenvatting
[1-2 zinnen over de algemene status]

## Uptime
- **Uptime percentage:** [99.9%]
- **Downtime:** [0 min / X min op datum]
- **Oorzaak:** [indien downtime]

## Performance
| Metric | Vorige maand | Deze maand | Status |
|--------|--------------|------------|--------|
| PageSpeed (Mobile) | [X] | [X] | [✅/⚠️] |
| PageSpeed (Desktop) | [X] | [X] | [✅/⚠️] |
| LCP | [Xs] | [Xs] | [✅/⚠️] |
| CLS | [X] | [X] | [✅/⚠️] |

## Updates Uitgevoerd
- [dd-mm] [Update beschrijving]
- [dd-mm] [Update beschrijving]

## Aanpassingen Uitgevoerd
| Datum | Omschrijving | Tijd |
|-------|--------------|------|
| [dd-mm] | [Aanpassing] | [0:30] |

**Totaal:** [X:XX] van [budget] uur gebruikt

## Security
- Dependencies updated: ✅
- Security scan: ✅ Geen issues / ⚠️ [issue]
- SSL status: ✅ Geldig tot [datum]

## SEO Snapshot (Standaard/Premium)
- Geïndexeerde pagina's: [aantal]
- Impressies (Search Console): [aantal]
- Gemiddelde positie: [X]
- Top zoekwoorden: [lijst]

## Analytics Snapshot
- Bezoekers: [aantal] ([+/-X%] vs vorige maand)
- Pageviews: [aantal]
- Top pagina's:
  1. [pagina] - [views]
  2. [pagina] - [views]
  3. [pagina] - [views]

## Aanbevelingen
1. [Aanbeveling indien van toepassing]
2. [Aanbeveling indien van toepassing]

## Volgende Maand
- [Geplande updates]
- [Geplande werkzaamheden]

---

Met vriendelijke groet,
RoTech Development
support@ro-techdevelopment.dev
```

---

## 🚨 INCIDENT RESPONSE

### Severity Levels
```
=== CRITICAL (P1) ===
Site is down / niet bereikbaar
Response: Binnen 1 uur (Premium) / 4 uur (Standaard) / 24 uur (Basis)
Actie: Direct onderzoeken en herstellen

=== HIGH (P2) ===
Belangrijke functionaliteit kapot (checkout, formulieren)
Response: Binnen 4 uur (Premium) / 24 uur (Standaard/Basis)

=== MEDIUM (P3) ===
Kleine bugs, visuele issues
Response: Binnen 24-48 uur

=== LOW (P4) ===
Verbetervoorstellen, wensen
Response: In volgende sprint/maand
```

### Incident Template
```markdown
# Incident Report

**Datum:** [dd-mm-yyyy HH:MM]
**Severity:** [P1/P2/P3/P4]
**Status:** [Open/In Progress/Resolved]

## Samenvatting
[Korte beschrijving van het probleem]

## Impact
[Wie/wat is getroffen]

## Timeline
- [HH:MM] Issue gedetecteerd
- [HH:MM] Onderzoek gestart
- [HH:MM] Oorzaak gevonden
- [HH:MM] Fix geïmplementeerd
- [HH:MM] Geverifieerd en gesloten

## Root Cause
[Wat was de oorzaak]

## Resolution
[Hoe is het opgelost]

## Prevention
[Hoe voorkomen we dit in de toekomst]
```

---

## 📁 KLANT DOCUMENTATIE

### Toegang Overzicht
```
=== ACCOUNTS ===

VERCEL (Hosting):
- URL: https://vercel.com
- Email: [klant of rotech email]
- Toegang: [Owner/Member]

GITHUB (Code):
- Repository: [URL]
- Toegang: [Klant heeft toegang: Ja/Nee]

DOMEIN REGISTRAR:
- Provider: [TransIP/Namecheap/etc.]
- Account: [bij klant / bij rotech]

EMAIL (Resend):
- Account: [bij rotech]
- Domein: [geverifieerd]

ANALYTICS:
- Google Analytics: [property ID]
- Search Console: [geverifieerd]

DATABASE (indien van toepassing):
- Provider: [Vercel Postgres/Supabase/etc.]
- Toegang: [via Vercel dashboard]

=== WACHTWOORDEN ===
Opgeslagen in: [Bitwarden shared vault / 1Password]
```

---

## 🔄 ONBOARDING NIEUWE KLANT

### Checklist
```
1. CONTRACT & ADMINISTRATIE
   - [ ] Contract getekend
   - [ ] Eerste factuur verstuurd
   - [ ] Klant in CRM/systeem

2. TOEGANG VERKRIJGEN
   - [ ] Vercel toegang (uitnodigen als member)
   - [ ] GitHub toegang (indien nodig)
   - [ ] Search Console toegang
   - [ ] Analytics toegang

3. MONITORING OPZETTEN
   - [ ] Uptime monitoring configureren
   - [ ] Error tracking activeren
   - [ ] Backup verificatie

4. DOCUMENTATIE
   - [ ] Toegang overzicht maken
   - [ ] Credentials opslaan in vault
   - [ ] Klant onboarding email sturen

5. EERSTE CHECK
   - [ ] Baseline performance meting
   - [ ] Security scan
   - [ ] Dependencies audit
```

---

## 📞 SUPPORT CONTACT

```
=== ROTECH SUPPORT ===

Email: support@ro-techdevelopment.dev
Response: [Basis: 48u / Standaard: 24u / Premium: 4u]

Telefoon: [Telefoonnummer]
Beschikbaar: [Standaard/Premium alleen, kantooruren]

WhatsApp: [Nummer]
Beschikbaar: [Premium alleen]

Spoedlijn (P1 incidents):
[Telefoonnummer] - Alleen voor kritieke issues buiten kantooruren
```

---

*Master Prompt Versie 1.0 | RoTech Development | Januari 2026*
