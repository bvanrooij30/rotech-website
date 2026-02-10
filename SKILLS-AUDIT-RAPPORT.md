# Skills & Rules Audit Rapport - RoTech Development

## Datum: 22 januari 2026

---

## 1. HUIDIGE INVENTARIS

### Project Rules (.cursor/rules/) - 7 bestanden

| Rule | Scope | Sterkte | Gaps |
|------|-------|---------|------|
| `rotech-master.mdc` | Alles (alwaysApply) | Goed: ecosysteem overview, commands, tech stack | Mist: deployment procedures, error recovery patterns |
| `rotech-website.mdc` | src/, public/, *.config.* | Goed: styling, componenten patronen | Mist: auth patterns, API design patterns |
| `rotech-database.mdc` | prisma/, src/app/api/, auth, stripe | Goed: Prisma patronen, Zod validatie | Mist: PgBouncer handling, connection pooling |
| `rotech-mobile.mdc` | mobile-app/ | Goed: Expo/RN patronen | Mist: API communicatie patronen |
| `rotech-admin-portal.mdc` | tools/admin-portal/ | Goed: Python/CustomTkinter | Niet meer relevant (admin is nu web-based) |
| `seo-optimization.mdc` | SEO-gerelateerde bestanden | Goed: structured data, meta tags | Mist: internationale SEO (NL+BE) |
| `lessons-learned.mdc` | Alles | Goed: concrete bugs en fixes | Mist: Supabase/PgBouncer lessen |

### Project Skills (.cursor/skills/) - 1 skill

| Skill | Doel | Sterkte | Gaps |
|-------|------|---------|------|
| `rotech-copywriting` | Website teksten | Goed: tone of voice, PAS/AIDA frameworks | Mist: automation/API diensten copywriting |

### Global Skills (C:\Users\bvrvl\.cursor\skills-cursor\) - 5 skills

| Skill | Doel | Status |
|-------|------|--------|
| `create-rule` | Cursor rules aanmaken | OK |
| `create-skill` | Cursor skills aanmaken | OK |
| `create-subagent` | Custom subagents | OK |
| `migrate-to-skills` | Rules naar skills migreren | OK |
| `update-cursor-settings` | VS Code settings aanpassen | OK |

---

## 2. DIENSTEN & PRODUCTEN INVENTARIS

### Websites & Webshops
- Starter Website (1-pager, ZZP)
- Business Website (bedrijfswebsite, MKB)
- Webshop (e-commerce)
- Maatwerk Web Applicatie (complexe systemen)

### Applicaties
- Progressive Web App (PWA)
- API Integraties (koppelingen)

### Marketing & SEO
- SEO Optimalisatie (audit, technisch, content, doorlopend)

### Onderhoud
- Basis (€99/mnd)
- Business (€199/mnd)
- Premium (€399/mnd)

### Automatisering
- Quick Win Automations (€150-€500)
- Business Automations (€500-€1.500)
- Geavanceerde Automations (€1.500-€5.000)
- Abonnementen: Starter/Business/Professional/Enterprise

---

## 3. GAP ANALYSE

### Ontbrekende Skills (Enterprise Niveau)

| Ontbrekende Skill | Impact | Prioriteit |
|-------------------|--------|------------|
| **Full-Stack Development** | Geen standaard voor Next.js 16 app router, API routes, server components | KRITIEK |
| **Database & Infrastructure** | Geen Supabase/PgBouncer/Vercel deployment standaard | KRITIEK |
| **Automation Engineering** | Geen n8n workflow design standaard | HOOG |
| **API Design** | Geen REST API design standaard voor klantprojecten | HOOG |
| **Testing & QA** | Geen test strategie of QA checklist | MEDIUM |
| **Project Management** | Geen project delivery workflow | MEDIUM |

### Ontbrekende Rules Updates

| Rule | Update Nodig |
|------|-------------|
| `lessons-learned.mdc` | Supabase PgBouncer lessen, DATABASE_URL encoding, IPv4/IPv6 |
| `rotech-database.mdc` | Supabase pooler configuratie, connection_limit, directUrl |
| `rotech-master.mdc` | België als markt, Supabase als database provider |
| `seo-optimization.mdc` | Internationale SEO (NL+BE) |

---

## 4. AANBEVELINGEN

### Nieuwe Skills Aanmaken

1. **rotech-fullstack** - Next.js 16 development standaard
2. **rotech-deployment** - Vercel + Supabase deployment procedures
3. **rotech-automation** - n8n workflow design en implementatie
4. **rotech-api-design** - REST API standaard voor klantprojecten
5. **rotech-project-delivery** - Klantproject oplevering workflow

### Bestaande Skills Updaten

1. **rotech-copywriting** - Uitbreiden met automation/API diensten
2. **lessons-learned** - Supabase/PgBouncer lessen toevoegen

### Rules Updaten

1. **rotech-database.mdc** - Supabase pooler configuratie
2. **rotech-master.mdc** - België markt, Supabase provider
3. **seo-optimization.mdc** - Internationale SEO
