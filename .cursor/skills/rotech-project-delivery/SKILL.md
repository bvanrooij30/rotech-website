---
name: rotech-project-delivery
description: Enterprise klantproject oplevering workflow voor RoTech Development. Gebruik bij het opzetten, plannen en opleveren van klantprojecten van intake tot lancering.
---

# RoTech Project Delivery Standaard

## Project Types & Levertijden

| Type | Levertijd | Fasen |
|------|-----------|-------|
| Starter Website | 1-2 weken | Intake → Design → Build → Launch |
| Business Website | 2-4 weken | Intake → Design → Build → Review → Launch |
| Webshop | 3-5 weken | Intake → Design → Build → Payments → Review → Launch |
| Maatwerk App | 6-12 weken | Intake → Spec → Design → Build → Test → Review → Launch |
| Automation | 1-28 dagen | Intake → Design → Build → Test → Deploy → Monitor |

## Delivery Workflow

### Fase 1: Intake & Scoping

- Kennismakingsgesprek (gratis, 30-60 min)
- Wensen, doelen en uitdagingen inventariseren
- Budget en planning bespreken
- Technische haalbaarheid beoordelen

**Deliverable:** Projectvoorstel met scope, planning, prijs

### Fase 2: Design & Planning

- Wireframes/mockups
- Sitemap en navigatiestructuur
- Content planning
- Technische architectuur (voor maatwerk)

**Deliverable:** Design goedkeuring door klant

### Fase 3: Development

- Iteratieve development met tussentijdse demo's
- Staging omgeving voor klant review
- Content invoer door klant of RoTech
- SEO basisoptimalisatie

**Deliverable:** Werkende staging versie

### Fase 4: Testing & Review

- Browser testing (Chrome, Safari, Firefox, Edge)
- Mobile responsive testing
- Performance audit (Lighthouse score > 90)
- Security check
- Klant review en feedbackronde

**Deliverable:** Goedgekeurde staging versie

### Fase 5: Launch

- DNS configuratie
- SSL certificaat
- Analytics setup (Google Analytics 4)
- Search Console aanmelding
- Performance monitoring
- Backup configuratie

**Deliverable:** Live website + overdracht documentatie

### Fase 6: Onderhoud (optioneel)

- Maandelijks onderhoudspakket
- Updates, backups, monitoring
- Content wijzigingen
- SEO rapportage

## Klant Communicatie Standaard

### Responstijden

| Kanaal | Responstijd |
|--------|-------------|
| Email | Binnen 24 uur |
| WhatsApp | Binnen 4 uur (werkdagen) |
| Telefoon | Direct of callback binnen 2 uur |
| Support tickets | Binnen 24 uur |

### Status Updates

- Wekelijkse voortgangsupdate per email
- Demo momenten bij milestones
- Directe communicatie bij vertragingen of vragen

## Quality Checklist voor Oplevering

### Performance
- [ ] Lighthouse Performance score > 90
- [ ] First Contentful Paint < 1.5s
- [ ] Largest Contentful Paint < 2.5s
- [ ] Total Blocking Time < 200ms

### SEO
- [ ] Meta titles en descriptions op alle pagina's
- [ ] Open Graph tags
- [ ] Sitemap.xml
- [ ] Robots.txt
- [ ] Schema.org structured data
- [ ] Alt teksten op alle afbeeldingen

### Security
- [ ] SSL/HTTPS actief
- [ ] Geen hardcoded secrets
- [ ] Input validatie op alle forms
- [ ] CSRF protection
- [ ] Rate limiting op API endpoints

### Accessibility
- [ ] Keyboard navigatie werkt
- [ ] Screen reader compatibel
- [ ] Contrast ratio voldoende
- [ ] Focus states zichtbaar

### Browser Support
- [ ] Chrome (laatste 2 versies)
- [ ] Safari (laatste 2 versies)
- [ ] Firefox (laatste 2 versies)
- [ ] Edge (laatste 2 versies)
- [ ] iOS Safari
- [ ] Android Chrome

## Pricing Model

### Website Pakketten

Features worden individueel geprijsd. Klant selecteert features, systeem berekent totaalprijs.

Kernfeatures per pakket:
- **Starter:** 1 pagina, responsive, basis SEO, contact formulier
- **Business:** Multi-page, CMS, blog, geavanceerde SEO, analytics
- **Webshop:** Productbeheer, iDEAL/Bancontact, voorraad, orderverwerking
- **Maatwerk:** Op specificatie, API integraties, custom functionaliteit

### Onderhoud

| Plan | Prijs/mnd | Inclusief |
|------|-----------|-----------|
| Basis | €99 | Updates, backups, monitoring, email support |
| Business | €199 | + 2 uur content wijzigingen, prioriteit support |
| Premium | €399 | + 5 uur wijzigingen, SEO rapportage, performance tuning |

## Master Prompts

Bij elk project type bestaat een master prompt template in `master-prompts/`:
- Klant intake questionnaire
- Project-specifieke specificaties
- Technische requirements
- Content planning template

Deze prompts worden gebruikt om consistente, complete projectspecificaties te genereren.
