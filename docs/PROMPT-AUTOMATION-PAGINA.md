# Prompt: Automation Diensten Pagina Bouwen

Kopieer onderstaande prompt naar een nieuw Cursor window in het rotech-website project.

---

## De Prompt

```
Bouw een complete Automation Services pagina voor de RoTech website met de volgende requirements:

## Context
Er zijn twee nieuwe bestanden toegevoegd:
1. `docs/AUTOMATION-SERVICE-AANBOD.md` - Strategisch document met alle details
2. `src/data/automation-subscriptions.ts` - TypeScript data voor subscription plans

Lees deze bestanden EERST voordat je begint.

## Te Bouwen

### 1. Automation Diensten Pagina
Locatie: `src/app/diensten/automation/page.tsx`

Structuur:
- Hero section met "Automatiseer uw bedrijfsprocessen" headline
- Korte uitleg wat automation is (met visuele workflow diagram)
- One-time services sectie (Quick Wins, Business, Geavanceerd) - uit `oneTimeServices`
- Subscription plans sectie met pricing cards - uit `automationPlans`
- Use cases / voorbeelden sectie
- "Hoe het werkt" stappen (intake → scan → development → go-live → support)
- FAQ sectie (5-7 vragen)
- CTA sectie met "Gratis Automation Scan" formulier

Design vereisten:
- Volg de bestaande design patterns van andere diensten pagina's
- Gebruik dezelfde gradient kleuren (indigo/violet)
- Maak de Business plan "Meest Gekozen" met highlight
- Responsive design (mobile-first)
- Voeg structured data toe (Service schema)

### 2. Pricing Component
Locatie: `src/components/automation/AutomationPricing.tsx`

Features:
- Toggle tussen maandelijks/jaarlijks (met "2 maanden gratis" badge)
- 3 pricing cards (Starter, Business, Professional)
- Enterprise als "Contact" card
- Feature lijst met check/cross icons
- Animated hover effects
- "Meest gekozen" badge op Business plan

### 3. Automation Scan Formulier
Locatie: `src/components/automation/AutomationScanForm.tsx`

Velden:
- Naam
- Email
- Bedrijfsnaam
- Welke processen wilt u automatiseren? (textarea)
- Hoeveel tijd kost dit proces nu per week? (select: <1u, 1-5u, 5-10u, 10-20u, >20u)
- Welke systemen gebruikt u? (multi-select of checkboxes)

Submit naar bestaande contact API of maak nieuwe automation-scan API route.

### 4. Database Schema Uitbreiding
Voeg aan `prisma/schema.prisma` toe:

- AutomationSubscription model (koppeling aan User)
- AutomationWorkflow model (tracking van klant workflows)
- ExecutionLog model (monitoring data)
- AutomationSupportRequest model (support tickets specifiek voor automation)

Zie `docs/AUTOMATION-SERVICE-AANBOD.md` voor het volledige schema.

### 5. Update Services Data
In `src/data/services.ts`:
- Update de bestaande "digital-process-automation" service
- Link naar de nieuwe `/diensten/automation` pagina
- Update de description en features indien nodig

### 6. Navigatie Update
Voeg "Automation" toe aan de diensten dropdown als aparte highlight item.

## Technische Vereisten

- TypeScript strict mode
- Gebruik bestaande UI components waar mogelijk
- Framer Motion voor animaties
- Responsive (mobile-first)
- SEO metadata volledig
- Structured data (ServiceSchema)
- Error handling op formulieren
- Loading states

## Stijl Referenties

Kijk naar deze bestaande pagina's voor design consistency:
- `src/app/diensten/page.tsx`
- `src/app/diensten/[slug]/page.tsx`
- `src/app/prijzen/page.tsx` (als die bestaat)

## Output

Na het bouwen:
1. Geef een overzicht van alle gemaakte/gewijzigde bestanden
2. Leg uit hoe de Stripe integratie werkt voor subscriptions
3. Geef instructies voor het testen van de pagina
```

---

## Alternatief: Kortere Versie

Als je een kortere prompt wilt:

```
Lees eerst:
- docs/AUTOMATION-SERVICE-AANBOD.md
- src/data/automation-subscriptions.ts

Bouw dan:
1. Automation diensten pagina op /diensten/automation met:
   - Hero, pricing cards (maandelijks/jaarlijks toggle), one-time services, 
   - use cases, hoe het werkt stappen, FAQ, automation scan formulier
   
2. AutomationPricing component met 3 tiers + enterprise
3. AutomationScanForm component
4. Update prisma schema met AutomationSubscription models
5. Update navigatie

Volg bestaande design patterns en maak alles responsive + SEO geoptimaliseerd.
```

---

## Na Implementatie Checklist

- [ ] Pagina laadt zonder errors
- [ ] Pricing toggle werkt (maand/jaar)
- [ ] Formulier submit werkt
- [ ] Mobile responsive check
- [ ] SEO metadata correct
- [ ] Structured data valid (test met Google Rich Results)
- [ ] Navigatie links werken
- [ ] Prisma schema migrate (`npx prisma db push`)
