# 🛒 MASTER PROMPT: WEBSHOP / E-COMMERCE

## Pakket Informatie
- **Pakket:** Webshop (E-commerce Platform)
- **Prijsrange:** Vanaf €3.997
- **Doorlooptijd:** 3-5 weken
- **Producten:** Tot 100 producten (meer op aanvraag)
- **Inclusief:** Betalingen, voorraadbeheer, orderbeheer

---

## 📋 KLANTGEGEVENS (INVULLEN VOOR ELKE OPDRACHT)

```
=== BEDRIJFSINFORMATIE ===
BEDRIJFSNAAM: [Invullen]
HANDELSNAAM WEBSHOP: [Indien anders dan bedrijfsnaam]
CONTACTPERSOON: [Invullen]
EMAIL: [Invullen]
TELEFOON: [Invullen]
ADRES: [Invullen - voor retourzendingen]
POSTCODE + PLAATS: [Invullen]
KVK: [Invullen]
BTW-NUMMER: [Invullen - VERPLICHT voor webshop]

=== WEBSHOP DETAILS ===
TYPE PRODUCTEN: [Fysiek/Digitaal/Beide]
PRODUCTCATEGORIEËN: [Lijst van categorieën]
AANTAL PRODUCTEN (SCHATTING): [Aantal]
GEMIDDELDE PRODUCTPRIJS: [€...]
DOELGROEP: [B2C/B2B/Beide]

=== DOMEIN & HOSTING ===
GEWENSTE DOMEIN: [www.webshopnaam.nl]
HEEFT AL DOMEIN?: [Ja/Nee]

=== BESTAANDE SYSTEMEN ===
HUIDIGE WEBSHOP?: [Nee / Ja - welk platform?]
BOEKHOUDPAKKET: [Bijv: Moneybird, Exact, geen]
VOORRAADSYSTEEM: [Bijv: Excel, ERP, geen]
```

---

## 🎯 PROJECT SPECIFICATIES

```
=== BETAALMETHODEN ===
Welke betaalmethoden gewenst?
- [x] iDEAL (standaard in NL)
- [ ] Creditcard (Visa, Mastercard)
- [ ] PayPal
- [ ] Bancontact (België)
- [ ] Klarna (achteraf betalen)
- [ ] Apple Pay / Google Pay
- [ ] Bankoverschrijving

PAYMENT PROVIDER VOORKEUR:
- [ ] Mollie (aanbevolen - Nederlands, laagste fees)
- [ ] Stripe
- [ ] Geen voorkeur

=== VERZENDING ===
VERZENDMETHODEN:
- [ ] PostNL
- [ ] DHL
- [ ] DPD
- [ ] Eigen bezorging
- [ ] Afhalen mogelijk

VERZENDKOSTEN MODEL:
- [ ] Vast bedrag (€...)
- [ ] Gratis vanaf (€...)
- [ ] Berekend op gewicht
- [ ] Berekend op bestelwaarde

VERZENDLABEL INTEGRATIE:
- [ ] Sendcloud
- [ ] MyParcel
- [ ] Handmatig

=== PRODUCTFUNCTIONALITEIT ===
- [ ] Productvarianten (maat, kleur, etc.)
- [ ] Voorraad bijhouden
- [ ] Backorder mogelijk
- [ ] Digitale downloads
- [ ] Productbundels
- [ ] Gerelateerde producten
- [ ] Recent bekeken

=== KLANTFUNCTIONALITEIT ===
- [ ] Klantaccounts
- [ ] Gastbestelling mogelijk
- [ ] Verlanglijstje/wishlist
- [ ] Ordergeschiedenis
- [ ] Adresboek

=== MARKETING ===
- [ ] Kortingscodes
- [ ] Staffelkortingen
- [ ] Nieuwsbrief integratie (welke: ___)
- [ ] Abandoned cart emails

=== KOPPELINGEN ===
- [ ] Boekhoudkoppeling: [Welk pakket]
- [ ] Voorraadkoppeling: [Welk systeem]
- [ ] Email marketing: [Welke tool]
- [ ] Google Shopping feed
- [ ] Facebook/Instagram Shop

=== CONTENT PAGINA'S ===
Naast producten, welke pagina's:
- [x] Homepage
- [x] Over Ons
- [ ] Blog
- [x] Contact
- [x] FAQ / Klantenservice
- [x] Verzending & Retour
- [x] Privacy Policy
- [x] Algemene Voorwaarden
- [ ] Maatgids
- [ ] Anders: [...]

=== INSPIRATIE ===
VOORBEELD WEBSHOPS:
1. [URL] - Wat spreekt aan: [...]
2. [URL] - Wat spreekt aan: [...]

STIJL:
- [ ] Modern & minimalistisch
- [ ] Luxe & premium
- [ ] Speels & kleurrijk
- [ ] Natuurlijk & duurzaam
```

---

## 🛠️ TECHNISCHE SPECIFICATIES

### Tech Stack
```
Framework:      Next.js 15+ (App Router)
Language:       TypeScript (strict mode)
Styling:        Tailwind CSS v4
State:          Zustand (cart state)
Animations:     Framer Motion
Forms:          React Hook Form + Zod
Payment:        Mollie API (of Stripe)
Email:          Resend
Database:       PostgreSQL + Prisma (of JSON voor kleine shops)
Hosting:        Vercel
```

### Project Structuur
```
/[webshop-naam]
├── .env.local
├── .env.example
├── package.json
├── tsconfig.json
├── next.config.ts
├── tailwind.config.ts
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
│
├── public/
│   ├── images/
│   │   ├── logo/
│   │   ├── products/           # Productafbeeldingen
│   │   ├── categories/
│   │   └── content/
│   └── favicon.ico
│
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                    # Homepage
│   │   ├── globals.css
│   │   │
│   │   ├── producten/
│   │   │   ├── page.tsx                # Producten overzicht
│   │   │   └── [slug]/
│   │   │       └── page.tsx            # Product detail
│   │   │
│   │   ├── categorie/
│   │   │   └── [slug]/
│   │   │       └── page.tsx            # Categorie pagina
│   │   │
│   │   ├── winkelwagen/
│   │   │   └── page.tsx
│   │   │
│   │   ├── checkout/
│   │   │   └── page.tsx
│   │   │
│   │   ├── bestelling/
│   │   │   ├── bevestiging/
│   │   │   │   └── page.tsx
│   │   │   └── [orderId]/
│   │   │       └── page.tsx
│   │   │
│   │   ├── account/                    # (indien klantaccounts)
│   │   │   ├── page.tsx
│   │   │   ├── bestellingen/
│   │   │   └── gegevens/
│   │   │
│   │   ├── zoeken/
│   │   │   └── page.tsx
│   │   │
│   │   ├── over-ons/
│   │   ├── contact/
│   │   ├── klantenservice/
│   │   ├── verzending-retour/
│   │   ├── privacy/
│   │   ├── voorwaarden/
│   │   │
│   │   ├── api/
│   │   │   ├── products/
│   │   │   │   └── route.ts
│   │   │   ├── cart/
│   │   │   │   └── route.ts
│   │   │   ├── checkout/
│   │   │   │   └── route.ts
│   │   │   ├── payment/
│   │   │   │   ├── create/
│   │   │   │   │   └── route.ts
│   │   │   │   └── webhook/
│   │   │   │       └── route.ts
│   │   │   ├── orders/
│   │   │   │   └── route.ts
│   │   │   └── contact/
│   │   │       └── route.ts
│   │   │
│   │   ├── robots.ts
│   │   └── sitemap.ts
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── CartDrawer.tsx
│   │   │   ├── SearchBar.tsx
│   │   │   └── MobileMenu.tsx
│   │   │
│   │   ├── product/
│   │   │   ├── ProductCard.tsx
│   │   │   ├── ProductGrid.tsx
│   │   │   ├── ProductGallery.tsx
│   │   │   ├── ProductInfo.tsx
│   │   │   ├── VariantSelector.tsx
│   │   │   ├── AddToCartButton.tsx
│   │   │   └── StockIndicator.tsx
│   │   │
│   │   ├── cart/
│   │   │   ├── CartItem.tsx
│   │   │   ├── CartSummary.tsx
│   │   │   └── CartEmpty.tsx
│   │   │
│   │   ├── checkout/
│   │   │   ├── CheckoutForm.tsx
│   │   │   ├── ShippingForm.tsx
│   │   │   ├── PaymentMethods.tsx
│   │   │   └── OrderSummary.tsx
│   │   │
│   │   ├── filters/
│   │   │   ├── CategoryFilter.tsx
│   │   │   ├── PriceFilter.tsx
│   │   │   └── SortSelect.tsx
│   │   │
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Toast.tsx
│   │   │   └── Skeleton.tsx
│   │   │
│   │   └── sections/
│   │       ├── Hero.tsx
│   │       ├── FeaturedProducts.tsx
│   │       ├── Categories.tsx
│   │       ├── Testimonials.tsx
│   │       └── Newsletter.tsx
│   │
│   ├── lib/
│   │   ├── db.ts                       # Prisma client
│   │   ├── mollie.ts                   # Payment client
│   │   ├── utils.ts
│   │   ├── constants.ts
│   │   ├── validations.ts
│   │   └── email.ts
│   │
│   ├── store/
│   │   └── cartStore.ts                # Zustand cart
│   │
│   ├── types/
│   │   ├── product.ts
│   │   ├── order.ts
│   │   └── customer.ts
│   │
│   └── data/
│       ├── products.ts                 # Product data (of Prisma)
│       └── categories.ts
│
└── docs/
    ├── OVERDRACHT.md
    ├── HANDLEIDING-PRODUCTEN.md
    ├── HANDLEIDING-BESTELLINGEN.md
    └── TECHNISCHE-DOCUMENTATIE.md
```

---

## 📝 CURSOR AI INSTRUCTIES

### Fase 1: Project Setup

```
Maak een professionele Next.js 15 webshop voor [BEDRIJFSNAAM].

=== BEDRIJFSGEGEVENS ===
Webshopnaam: [NAAM]
Type producten: [TYPE]
Telefoon: [TELEFOON]
Email: [EMAIL]
Adres: [ADRES]
KVK: [KVK]
BTW: [BTW]

=== HUISSTIJL ===
Primaire kleur: [HEX]
Secundaire kleur: [HEX]
Accent kleur: [HEX]
Stijl: [Modern/Luxe/Speels/etc.]

=== SETUP ===
1. Next.js 15 met TypeScript, Tailwind, App Router
2. Installeer:
   - zustand (cart state management)
   - @mollie/api-client (betalingen)
   - prisma @prisma/client (database)
   - framer-motion
   - lucide-react
   - react-hook-form zod @hookform/resolvers
   - resend
3. Configureer Prisma met PostgreSQL
4. Setup Zustand cart store
5. Maak complete mappenstructuur
```

### Fase 2: Database Schema

```
Maak Prisma schema voor webshop:

=== MODELLEN ===

Product:
- id, slug, name, description, shortDescription
- price, compareAtPrice (voor korting)
- images[] (URLs)
- categoryId
- stock, trackStock, backorder
- variants[] (optioneel)
- status (draft/active)
- createdAt, updatedAt

Category:
- id, slug, name, description
- image
- parentId (voor subcategorieën)
- products[]

ProductVariant:
- id, productId
- name (bijv: "Rood - XL")
- sku
- price (optioneel, anders van product)
- stock
- options (JSON: {color: "Rood", size: "XL"})

Order:
- id, orderNumber
- customer (embedded of relatie)
- items[]
- subtotal, shippingCost, total
- status (pending/paid/shipped/delivered/cancelled)
- paymentId, paymentStatus
- shippingAddress
- billingAddress
- notes
- createdAt

OrderItem:
- id, orderId
- productId, variantId
- name, sku
- quantity, price
- total

Customer (optioneel - voor accounts):
- id, email, password
- firstName, lastName
- addresses[]
- orders[]

=== SEED DATA ===
Maak seed script met [AANTAL] voorbeeldproducten
```

### Fase 3: Cart & Checkout

```
Implementeer winkelwagen en checkout flow:

=== CART (Zustand Store) ===
- items: CartItem[]
- addItem(product, quantity, variant?)
- removeItem(itemId)
- updateQuantity(itemId, quantity)
- clearCart()
- getTotal()
- getItemCount()

Persisteer in localStorage.

=== CART UI ===
- CartDrawer: slide-in panel rechts
- CartIcon in header met badge (aantal items)
- CartItem component met +/- knoppen
- CartSummary met totalen

=== CHECKOUT FLOW ===
1. Winkelwagen pagina (review)
2. Checkout pagina:
   - Contactgegevens (email)
   - Verzendadres
   - Verzendmethode selectie
   - Betaalmethode selectie
   - Order overzicht
   - Algemene voorwaarden checkbox
   - Bestel button

=== BETALING (MOLLIE) ===
1. Checkout submit → API route
2. Maak order in database (status: pending)
3. Maak Mollie payment
4. Redirect naar Mollie checkout
5. Webhook ontvangt betaalstatus
6. Update order status
7. Stuur bevestigingsmail
8. Redirect naar bevestigingspagina
```

### Fase 4: Product Pagina's

```
=== PRODUCTEN OVERZICHT ===
- Header met categorie naam/alle producten
- Filters sidebar:
  - Categorieën
  - Prijsrange
  - [Andere relevante filters]
- Sorteer dropdown (Prijs laag-hoog, nieuwste, etc.)
- Product grid (responsive: 2 kolommen mobile, 4 desktop)
- Paginering of infinite scroll
- "Geen producten" state

=== PRODUCT CARD ===
- Afbeelding (hover: tweede afbeelding indien beschikbaar)
- Product naam
- Prijs (+ doorgestreepte oude prijs bij korting)
- "Nieuw" / "Uitverkocht" / "Sale" badges
- Quick add to cart (optioneel)
- Link naar product detail

=== PRODUCT DETAIL ===
- Afbeelding gallerij (thumbnails + grote afbeelding)
- Product naam
- Prijs
- Korte beschrijving
- Variant selector (indien van toepassing)
- Aantal selector
- Add to cart button
- Stock indicator
- Uitgebreide beschrijving (tabs of accordeon)
- Gerelateerde producten
```

### Fase 5: Email & Notificaties

```
Configureer alle transactionele emails:

=== ORDERBEVESTIGING (naar klant) ===
- Ordernummer
- Overzicht bestelde producten
- Totaalbedrag
- Verzendadres
- Verwachte levertijd
- Contact voor vragen

=== NIEUWE ORDER (naar webshop eigenaar) ===
- Alle orderdetails
- Klantgegevens
- Link naar order in admin (indien van toepassing)

=== VERZENDING (optioneel) ===
- Track & trace link
- Verwachte leverdatum

=== CONTACT FORMULIER ===
- Bevestiging naar bezoeker
- Notificatie naar eigenaar
```

### Fase 6: Juridische Pagina's

```
Maak de verplichte juridische pagina's:

=== PRIVACY POLICY ===
- AVG compliant
- Welke gegevens worden verzameld
- Doel van gegevensverwerking
- Bewaartermijnen
- Rechten betrokkene
- Cookies
- Contact gegevensbeschermingsautoriteit

=== ALGEMENE VOORWAARDEN ===
- Identiteit verkoper
- Bestelprocedure
- Prijzen en betaling
- Levering
- Herroepingsrecht (14 dagen)
- Garantie
- Klachten
- Toepasselijk recht

=== VERZENDING & RETOUR ===
- Verzendkosten
- Levertijden
- Retourprocedure
- Retourkosten
- Terugbetaling
```

---

## ✅ OPLEVERING CHECKLIST

### Technisch
- [ ] Alle pagina's werken
- [ ] Cart werkt correct (add, remove, update, persist)
- [ ] Checkout flow compleet
- [ ] Betalingen werken (test mode getest)
- [ ] Webhook ontvangt updates
- [ ] Orderbevestiging emails worden verstuurd
- [ ] Responsive op alle apparaten
- [ ] Zoekfunctie werkt

### E-commerce Specifiek
- [ ] Producten correct weergegeven
- [ ] Varianten werken (indien van toepassing)
- [ ] Voorraad wordt bijgehouden
- [ ] Prijzen correct (incl. BTW)
- [ ] Kortingscodes werken (indien van toepassing)
- [ ] Verzendkosten correct berekend

### Juridisch
- [ ] Privacy policy aanwezig
- [ ] Algemene voorwaarden aanwezig
- [ ] Herroepingsrecht duidelijk
- [ ] Bedrijfsgegevens zichtbaar (KVK, BTW)
- [ ] Prijzen incl. BTW vermeld
- [ ] Verzendkosten vooraf duidelijk

### SEO
- [ ] Product pagina's hebben unieke titles
- [ ] Meta descriptions per product
- [ ] Product structured data (Schema.org)
- [ ] Canonical URLs
- [ ] Sitemap met alle producten

### Deployment
- [ ] Database gehost (Vercel Postgres / Supabase / PlanetScale)
- [ ] Mollie account live (of test voor nu)
- [ ] Environment variables ingesteld
- [ ] Domein gekoppeld
- [ ] SSL actief

---

## 🔧 EXTERNE SERVICES SETUP

### Mollie (Betalingen)
```
1. Account: https://mollie.com
2. Test API key voor development
3. Live API key voor productie
4. Webhook URL instellen: https://[domein]/api/payment/webhook
5. Test betalingen uitvoeren
```

### Database
```
Opties:
- Vercel Postgres (eenvoudig, geïntegreerd)
- Supabase (gratis tier, meer features)
- PlanetScale (MySQL, goede free tier)

Setup:
1. Database aanmaken
2. Connection string in .env
3. Prisma migraties uitvoeren
4. Seed data laden
```

### Sendcloud (Verzending - optioneel)
```
1. Account aanmaken
2. API keys genereren
3. Carriers activeren (PostNL, DHL, etc.)
4. Integratie bouwen voor labels
```

### Email (Resend)
```
1. Domein verifiëren
2. Transactionele templates
3. Test emails
```

---

## 📊 ENVIRONMENT VARIABLES

```env
# Site
NEXT_PUBLIC_SITE_URL=https://[domein]
NEXT_PUBLIC_SITE_NAME=[Webshop Naam]

# Database
DATABASE_URL=postgresql://...

# Mollie
MOLLIE_API_KEY=test_xxx (dev) / live_xxx (prod)
MOLLIE_WEBHOOK_URL=https://[domein]/api/payment/webhook

# Email
RESEND_API_KEY=re_xxx
FROM_EMAIL=bestellingen@[domein]
ORDER_NOTIFICATION_EMAIL=[email eigenaar]

# Optioneel
SENDCLOUD_PUBLIC_KEY=xxx
SENDCLOUD_SECRET_KEY=xxx
```

---

*Master Prompt Versie 1.0 | RoTech Development | Januari 2026*
