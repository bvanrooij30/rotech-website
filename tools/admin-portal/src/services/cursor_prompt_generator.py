"""
Cursor Prompt Generator - Genereert volledige Cursor AI prompts van werkaanvragen.
"""

import re
from datetime import datetime
from typing import Optional, Dict, List
from dataclasses import dataclass

from ..database.models import FormSubmission, FormType


@dataclass
class WorkOrderData:
    """Parsed work order data."""
    order_number: Optional[str] = None
    package_name: Optional[str] = None
    total_amount: float = 0.0
    features: List[str] = None
    customer_name: str = ""
    customer_email: str = ""
    customer_phone: str = ""
    company_name: str = ""
    address: str = ""
    postal_code: str = ""
    city: str = ""
    kvk_number: str = ""
    project_type: str = ""
    budget_range: str = ""
    deadline: str = ""
    current_website: str = ""
    additional_info: str = ""
    message: str = ""
    
    def __post_init__(self):
        if self.features is None:
            self.features = []


class CursorPromptGenerator:
    """
    Genereert volledige Cursor AI prompts van werkaanvragen.
    
    Output is een copy-paste-ready prompt die direct in Cursor kan worden gebruikt
    om het volledige project te programmeren.
    """
    
    # Package type mapping voor technische specs
    PACKAGE_SPECS = {
        "starter": {
            "pages": "5-7 pagina's",
            "tech_stack": "Next.js 14+, React, Tailwind CSS, TypeScript",
            "features_base": ["Responsive design", "SEO optimalisatie", "Contact formulier"],
        },
        "professional": {
            "pages": "8-15 pagina's",
            "tech_stack": "Next.js 14+, React, Tailwind CSS, TypeScript, Prisma, PostgreSQL",
            "features_base": ["Responsive design", "SEO optimalisatie", "Contact formulier", "CMS integratie", "Analytics"],
        },
        "enterprise": {
            "pages": "15+ pagina's",
            "tech_stack": "Next.js 14+, React, Tailwind CSS, TypeScript, Prisma, PostgreSQL, Redis, Docker",
            "features_base": ["Responsive design", "SEO optimalisatie", "Contact formulier", "CMS integratie", "Analytics", "API integratie", "User dashboard"],
        },
        "custom": {
            "pages": "Op maat",
            "tech_stack": "Next.js 14+, React, Tailwind CSS, TypeScript + custom stack",
            "features_base": ["Responsive design", "SEO optimalisatie"],
        },
    }
    
    # Feature mapping naar technische requirements
    FEATURE_REQUIREMENTS = {
        "contact formulier": "Implementeer een contact formulier met email notificaties via Resend of Nodemailer",
        "blog": "Blog systeem met MDX of CMS (Sanity/Contentful) integratie",
        "portfolio": "Portfolio/projecten sectie met filtering en lightbox gallery",
        "webshop": "E-commerce met Stripe/Mollie betalingen, productbeheer, winkelwagen",
        "reserveringen": "Booking/reserveringssysteem met kalender en beschikbaarheid",
        "reviews": "Review/testimonial sectie, eventueel met Google Reviews integratie",
        "chat": "Live chat widget (Tawk.to/Crisp) of custom chat systeem",
        "dashboard": "Admin/user dashboard met authenticatie (NextAuth)",
        "api": "REST of GraphQL API voor externe integraties",
        "cms": "Content Management Systeem voor klant om content te beheren",
        "analytics": "Google Analytics 4 of Plausible Analytics integratie",
        "seo": "Complete SEO setup met meta tags, sitemap, robots.txt, structured data",
        "meertalig": "Multi-language support met next-intl of next-i18next",
        "nieuwsbrief": "Newsletter signup met Mailchimp/ConvertKit integratie",
        "social media": "Social media feed integratie en share buttons",
    }
    
    def parse_work_order_message(self, message: str) -> WorkOrderData:
        """
        Parse werk opdracht message naar structured data.
        """
        data = WorkOrderData()
        
        if not message:
            return data
        
        lines = message.strip().split('\n')
        
        for line in lines:
            line = line.strip()
            
            # Order number
            if 'WERK OPDRACHT:' in line:
                data.order_number = line.split(':')[-1].strip()
            
            # Package
            elif '📦 Pakket:' in line or 'Pakket:' in line:
                data.package_name = line.split(':')[-1].strip()
            
            # Amount
            elif '💰 Bedrag:' in line or 'Bedrag:' in line:
                match = re.search(r'€([\d.,]+)', line)
                if match:
                    amount_str = match.group(1).replace('.', '').replace(',', '.')
                    try:
                        data.total_amount = float(amount_str)
                    except ValueError:
                        pass
            
            # Features section
            elif line.startswith('•'):
                feature = line.lstrip('• ').strip()
                # Remove quantity suffix
                feature = re.sub(r'\s*\(\d+x\)$', '', feature)
                data.features.append(feature)
            
            # Address
            elif '📍 Adres:' in line or 'Adres:' in line:
                # Next line is address
                pass
            
            # KvK
            elif '🏢 KvK:' in line or 'KvK:' in line:
                data.kvk_number = line.split(':')[-1].strip()
            
            # Project type (from offerte forms)
            elif 'Type:' in line:
                data.project_type = line.split(':')[-1].strip()
            
            # Budget
            elif 'Budget:' in line:
                data.budget_range = line.split(':')[-1].strip()
            
            # Deadline
            elif 'Deadline:' in line:
                data.deadline = line.split(':')[-1].strip()
            
            # Current website
            elif 'Huidige website:' in line:
                data.current_website = line.split(':', 1)[-1].strip()
            
            # Features from offerte form
            elif 'Features:' in line:
                features_str = line.split(':')[-1].strip()
                data.features.extend([f.strip() for f in features_str.split(',')])
            
            # Extra info
            elif 'Extra info:' in line:
                data.additional_info = line.split(':', 1)[-1].strip()
        
        # Get remaining message content
        # Look for content after headers
        message_parts = message.split('\n\n')
        if len(message_parts) > 1:
            # Last part might be actual message
            last_part = message_parts[-1].strip()
            if not any(x in last_part for x in ['WERK OPDRACHT', '📦', '💰', '📋', '📍', '✅', '⚠️']):
                data.message = last_part
        
        return data
    
    def generate_prompt(self, form: FormSubmission) -> str:
        """
        Genereer een complete Cursor AI prompt van een werkaanvraag.
        
        Returns:
            Copy-paste ready Cursor AI prompt
        """
        # Parse message voor extra details
        work_data = self.parse_work_order_message(form.message or "")
        
        # Update work_data met form fields
        work_data.customer_name = form.name
        work_data.customer_email = form.email
        work_data.customer_phone = form.phone or ""
        work_data.company_name = form.company or ""
        
        # Determine project type
        if form.form_type == FormType.OFFERTE.value or work_data.order_number:
            return self._generate_project_prompt(form, work_data)
        else:
            return self._generate_contact_prompt(form, work_data)
    
    def _generate_project_prompt(self, form: FormSubmission, data: WorkOrderData) -> str:
        """Generate prompt voor website/project opdracht."""
        
        # Detect package tier
        package_tier = "custom"
        if data.package_name:
            pkg_lower = data.package_name.lower()
            if "starter" in pkg_lower:
                package_tier = "starter"
            elif "professional" in pkg_lower or "pro" in pkg_lower:
                package_tier = "professional"
            elif "enterprise" in pkg_lower:
                package_tier = "enterprise"
        
        specs = self.PACKAGE_SPECS.get(package_tier, self.PACKAGE_SPECS["custom"])
        
        # Build features list
        all_features = list(specs["features_base"])
        if data.features:
            all_features.extend(data.features)
        
        # Generate technical requirements from features
        tech_requirements = []
        for feature in all_features:
            feature_lower = feature.lower()
            for key, req in self.FEATURE_REQUIREMENTS.items():
                if key in feature_lower:
                    tech_requirements.append(f"- {req}")
                    break
        
        prompt = f"""# 🚀 NIEUWE WEBSITE PROJECT - {data.company_name or data.customer_name}

## 📋 PROJECT OVERZICHT

**Klant:** {data.customer_name}
**Bedrijf:** {data.company_name or "N.v.t."}
**Contact:** {data.customer_email} | {data.customer_phone or "Geen telefoon"}
{f"**Order:** {data.order_number}" if data.order_number else ""}
{f"**Budget:** €{data.total_amount:.2f} excl. BTW" if data.total_amount > 0 else f"**Budget indicatie:** {data.budget_range}" if data.budget_range else ""}
{f"**Deadline:** {data.deadline}" if data.deadline else ""}
{f"**Huidige website:** {data.current_website}" if data.current_website else ""}

---

## 🎯 OPDRACHT

Bouw een complete, professionele website voor {data.company_name or data.customer_name}.
{f"Pakket: {data.package_name}" if data.package_name else ""}

### Gewenste Features:
{chr(10).join([f"- {f}" for f in all_features]) if all_features else "- Te bespreken met klant"}

### Klant Omschrijving:
{data.message or form.message or "Geen specifieke omschrijving opgegeven."}

{f"### Extra informatie:{chr(10)}{data.additional_info}" if data.additional_info else ""}

---

## 🛠️ TECHNISCHE SPECIFICATIES

**Tech Stack:** {specs["tech_stack"]}
**Omvang:** {specs["pages"]}

### Technische Requirements:
{chr(10).join(tech_requirements) if tech_requirements else "- Bepaal op basis van features"}

### Standaard Requirements:
- Mobile-first responsive design
- Core Web Vitals geoptimaliseerd (LCP < 2.5s, FID < 100ms, CLS < 0.1)
- WCAG 2.1 AA accessibility
- SSL/HTTPS
- Cookie consent (GDPR compliant)
- Privacy policy pagina
- Algemene voorwaarden pagina

---

## 📁 PROJECT STRUCTUUR

Maak de volgende folder structuur aan:

```
src/
├── app/                    # Next.js App Router
│   ├── (marketing)/        # Publieke pagina's
│   │   ├── page.tsx        # Homepage
│   │   ├── over-ons/       # Over ons
│   │   ├── diensten/       # Diensten
│   │   ├── portfolio/      # Portfolio/projecten
│   │   ├── contact/        # Contact pagina
│   │   └── blog/           # Blog (indien gewenst)
│   ├── api/                # API routes
│   └── layout.tsx          # Root layout
├── components/
│   ├── ui/                 # UI componenten (shadcn/ui)
│   ├── layout/             # Header, Footer, Navigation
│   └── sections/           # Page sections (Hero, CTA, etc.)
├── lib/                    # Utilities
├── styles/                 # Global styles
└── types/                  # TypeScript types
```

---

## ✅ CHECKLIST

### Fase 1: Setup
- [ ] Next.js project initialiseren met TypeScript
- [ ] Tailwind CSS + shadcn/ui configureren
- [ ] Folder structuur opzetten
- [ ] Environment variables configureren
- [ ] Git repository opzetten

### Fase 2: Design System
- [ ] Kleurenpalet bepalen (vraag klant logo/huisstijl)
- [ ] Typography instellen
- [ ] UI componenten library bouwen
- [ ] Responsive breakpoints definiëren

### Fase 3: Core Pages
- [ ] Layout component (Header, Footer, Navigation)
- [ ] Homepage met hero, features, CTA secties
- [ ] Over ons pagina
- [ ] Diensten/aanbod pagina
- [ ] Contact pagina met formulier

### Fase 4: Features
{chr(10).join([f"- [ ] {f}" for f in all_features]) if all_features else "- [ ] Features implementeren"}

### Fase 5: Optimalisatie & Launch
- [ ] SEO meta tags op alle pagina's
- [ ] Sitemap.xml genereren
- [ ] robots.txt configureren
- [ ] Performance audit (Lighthouse)
- [ ] Cross-browser testing
- [ ] Deployment naar Vercel/hosting

---

## 🎨 DESIGN RICHTLIJNEN

### Stijl:
- Modern, clean en professioneel
- Consistent met eventuele bestaande huisstijl
- Goede witruimte en visuele hiërarchie
- Duidelijke call-to-actions

### UI Patterns:
- Sticky header met transparante achtergrond die solid wordt bij scrollen
- Smooth scroll navigatie
- Hover effecten op interactieve elementen
- Animaties met Framer Motion (subtiel)
- Loading states en skeleton loaders

---

## 📞 KLANT COMMUNICATIE

**Nog te vragen aan klant:**
1. Logo en huisstijl materialen (kleuren, fonts)
2. Foto's en afbeeldingen (of gebruik stock)
3. Teksten/content voor pagina's
4. Social media links
5. Contact gegevens voor website
6. Hosting voorkeuren
7. Domein naam (indien nog niet geregistreerd)

---

## 🔗 REFERENTIES

- Next.js Docs: https://nextjs.org/docs
- Tailwind CSS: https://tailwindcss.com/docs
- shadcn/ui: https://ui.shadcn.com
- Framer Motion: https://www.framer.com/motion/

---

*Gegenereerd op: {datetime.now().strftime("%d-%m-%Y %H:%M")}*
*Bron: Ro-Tech Admin Portal*
"""
        
        return prompt.strip()
    
    def _generate_contact_prompt(self, form: FormSubmission, data: WorkOrderData) -> str:
        """Generate prompt voor contact/algemene vraag."""
        
        prompt = f"""# 📬 KLANTVRAAG - {data.customer_name}

## 📋 CONTACT DETAILS

**Naam:** {data.customer_name}
**Email:** {data.customer_email}
{f"**Telefoon:** {data.customer_phone}" if data.customer_phone else ""}
{f"**Bedrijf:** {data.company_name}" if data.company_name else ""}
**Ontvangen:** {form.submitted_at.strftime("%d-%m-%Y %H:%M") if form.submitted_at else "Onbekend"}

---

## 💬 BERICHT

**Onderwerp:** {form.subject or "Geen onderwerp"}

{form.message or "Geen bericht inhoud."}

---

## 🎯 ACTIE ITEMS

Analyseer het bericht en bepaal:

1. **Type vraag:**
   - [ ] Offerte aanvraag
   - [ ] Technische vraag
   - [ ] Support vraag
   - [ ] Algemene informatie
   - [ ] Anders: ___

2. **Benodigde informatie:**
   - Wat is de specifieke behoefte/vraag?
   - Welke oplossing past het beste?
   - Zijn er vervolgvragen nodig?

3. **Volgende stappen:**
   - [ ] Contact opnemen per email
   - [ ] Telefonisch contact
   - [ ] Offerte maken
   - [ ] Direct beantwoorden

---

## 💡 VOORSTEL ANTWOORD

Schrijf een professioneel antwoord naar de klant:

```
Beste {data.customer_name.split()[0] if data.customer_name else ""},

Bedankt voor uw bericht aan Ro-Tech Development.

[Beantwoord de vraag of geef informatie]

Met vriendelijke groet,

Bart Verhoeven
Ro-Tech Development
```

---

*Gegenereerd op: {datetime.now().strftime("%d-%m-%Y %H:%M")}*
"""
        
        return prompt.strip()


# Singleton instance
_generator: Optional[CursorPromptGenerator] = None


def get_cursor_prompt_generator() -> CursorPromptGenerator:
    """Get the Cursor Prompt Generator instance."""
    global _generator
    if _generator is None:
        _generator = CursorPromptGenerator()
    return _generator
