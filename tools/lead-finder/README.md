# 🎯 Lead Finder Tools

Complete lead generation toolkit: vind én benader potentiële klanten voor website development.

**Nieuw in v2.0:** Email Outreach module voor professionele, niet-opdringende email campagnes.

## 📊 Vergelijking

| Aspect | Google Places API | Apify (Aanbevolen) |
|--------|-------------------|---------------------|
| **Kosten 1.000 leads** | ~$17-34 | **~$4** |
| **Email extractie** | ❌ Niet mogelijk | ✅ Automatisch |
| **Social media** | ❌ Niet mogelijk | ✅ Inbegrepen |
| **Setup** | Medium | Makkelijk |
| **Snelheid** | Langzaam | Snel (cloud) |
| **Gratis tier** | $200/maand | $5/maand |

**Aanbeveling: Gebruik Apify voor de beste resultaten!**

---

## 🚀 OPTIE 1: Apify (Aanbevolen)

### Stap 1: Apify Account

1. Ga naar [https://apify.com/](https://apify.com/)
2. Klik "Sign up free"
3. Maak een account (GitHub/Google/Email)

### Stap 2: API Token

1. Ga naar [Settings > Integrations](https://console.apify.com/settings/integrations)
2. Onder "Personal API tokens" klik "Create new token"
3. Kopieer de token

### Stap 3: Configureer .env

Open `.env` en vul je token in:

```env
APIFY_API_TOKEN=apify_api_xxxxxxxxxxxxx
```

### Stap 4: Run het script

**Quick Start (makkelijkst):**
```bash
python apify_quick_start.py
```

Pas `PRESET` aan in het script:
- `"lokaal"` - Veldhoven, Eindhoven, Best (test)
- `"brabant"` - 10 Brabantse steden
- `"randstad"` - 10 Randstad steden
- `"nederland"` - 25 steden, alle categorieën
- `"custom"` - Eigen selectie

**CLI met opties:**
```bash
# Specifieke steden en categorieën
python apify_lead_finder.py --cities Eindhoven Veldhoven --categories kapper restaurant

# Preset gebruiken
python apify_lead_finder.py --preset brabant --max 100

# Heel Nederland
python apify_lead_finder.py --preset nederland

# Zonder emails (goedkoper)
python apify_lead_finder.py --preset lokaal --no-emails

# Beschikbare opties bekijken
python apify_lead_finder.py --list-cities
python apify_lead_finder.py --list-categories
```

### Kosten Apify

| Preset | Steden | Queries | Max Leads | Kosten |
|--------|--------|---------|-----------|--------|
| lokaal | 3 | 12 | 600 | ~$2.40 |
| brabant | 10 | 150 | 7,500 | ~$30 |
| randstad | 10 | 150 | 7,500 | ~$30 |
| nederland | 25 | 1,100+ | 55,000+ | ~$220 |

**Gratis tier: $5/maand = ~1.250 leads gratis!**

---

## 🔧 OPTIE 2: Google Places API

Alleen gebruiken als je al een Google Cloud account hebt.

### Setup

1. Ga naar [Google Cloud Console](https://console.cloud.google.com/)
2. Activeer **Places API**
3. Maak een API Key
4. Voeg toe aan `.env`:

```env
GOOGLE_PLACES_API_KEY=AIzaSy...
```

### Run

```bash
python quick_start.py
# of
python business_lead_finder.py --cities Eindhoven --categories kapper
```

---

## 📁 Output

Alle resultaten worden opgeslagen in `output/`:

### CSV (Excel)
- Gesorteerd op lead score
- Nederlandse Excel compatible (`;` delimiter)
- Kolommen: prioriteit, score, naam, telefoon, email, website, etc.

### JSON
- Voor automatisering (n8n, Make.com, etc.)
- Volledige data structuur

---

## 📊 Lead Scoring

| Prioriteit | Score | Betekenis |
|------------|-------|-----------|
| 🔥 HOT | 85-100 | Geen website - perfecte lead! |
| 🌡️ WARM | 70-84 | Heeft website maar verbeterpunten |
| 📊 MEDIUM | 55-69 | Redelijke online presence |
| 📉 LOW | 0-54 | Goede online presence |

### Scoring Factoren

- **Geen website**: +35 punten
- **Heeft email**: +10 punten
- **Heeft telefoon**: +5 punten
- **Goede rating (4+)**: +5 punten
- **Veel reviews (20+)**: +5 punten
- **Geen social media**: +5 punten

---

## 💡 Tips

### 1. Start met Lokaal
Test eerst met preset `"lokaal"` om te zien hoe het werkt.

### 2. Focus op HOT Leads
Filter in Excel op `lead_priority = HOT` voor bedrijven zonder website.

### 3. Email = Goud
Leads met email zijn veel makkelijker te benaderen.

### 4. Automatiseer Follow-up
Gebruik de JSON export met n8n of Make.com voor:
- Automatische email sequences
- LinkedIn connectie requests
- CRM import

### 5. Herhaal Maandelijks
Nieuwe bedrijven openen constant.

---

## 🔧 Troubleshooting

### "APIFY_API_TOKEN niet gevonden"
- Check of `.env` bestand bestaat
- Check of token correct is gekopieerd
- Herstart terminal na wijzigen .env

### "Insufficient credits"
- Check je Apify balance: https://console.apify.com/billing
- Upgrade naar betaald plan of wacht op maandelijkse reset

### Weinig resultaten
- Verhoog `--max` parameter
- Voeg meer steden/categorieën toe
- Check of zoektermen correct zijn

---

## 📂 Bestanden

| Bestand | Doel |
|---------|------|
| `apify_lead_finder.py` | Apify hoofdscript met CLI |
| `apify_quick_start.py` | Makkelijke Apify configuratie |
| `business_lead_finder.py` | Google Places API script |
| `quick_start.py` | Google API configuratie |
| `.env` | API tokens (NIET delen!) |
| `output/` | CSV en JSON exports |

---

## 📧 EMAIL OUTREACH MODULE (Nieuw!)

Automatische, professionele email outreach naar je verzamelde leads.

### Features

- ✅ Gepersonaliseerde email templates
- ✅ Rate limiting (voorkomt spam flags)
- ✅ Automatische follow-ups
- ✅ Blacklist management (GDPR)
- ✅ Dry-run mode (test zonder te versturen)
- ✅ Tracking & statistieken

### Setup Email

**1. SMTP Configureren**

Voeg toe aan je `.env`:

```env
# Gmail (aanbevolen)
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=jouw.email@gmail.com
SMTP_PASSWORD=xxxx xxxx xxxx xxxx  # App Password!

SENDER_NAME=Ro-Tech Development
SENDER_EMAIL=jouw.email@gmail.com
REPLY_TO=jouw.email@gmail.com

# Rate limiting
MAX_EMAILS_PER_DAY=50
DELAY_BETWEEN_EMAILS=30
```

**⚠️ Gmail App Password maken:**
1. Ga naar [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
2. Selecteer "Mail" en "Windows Computer"
3. Kopieer het 16-karakter wachtwoord
4. Gebruik dit als `SMTP_PASSWORD`

### Gebruik

**1. Dry Run (test zonder te versturen):**
```bash
python email_outreach.py --csv output/apify_leads_xxx.csv
```

**2. Test naar jezelf:**
```bash
python email_outreach.py --test jouw.email@gmail.com --live
```

**3. Live campagne starten:**
```bash
# Maximum 10 emails
python email_outreach.py --csv output/apify_leads_xxx.csv --live --max 10

# Specifieke template
python email_outreach.py --csv output/apify_leads_xxx.csv --template no_website --live
```

**4. Statistieken bekijken:**
```bash
python email_outreach.py --stats
```

**5. Email blacklisten:**
```bash
python email_outreach.py --blacklist-add iemand@example.com
```

### Email Templates

| Template | Gebruik |
|----------|---------|
| `initial` | Eerste contact - bedrijven met website |
| `no_website` | Eerste contact - bedrijven ZONDER website (HOT leads) |
| `followup1` | Follow-up na 5 dagen |
| `followup2` | Laatste follow-up |
| `auto` | Automatisch juiste template kiezen |

### Rate Limiting

Standaard instellingen (aanpasbaar via `.env`):

| Setting | Waarde | Reden |
|---------|--------|-------|
| Max per dag | 50 | Voorkomt spam flags |
| Max per uur | 20 | Spreidt verzending |
| Delay tussen emails | 30 sec | Lijkt menselijk |
| Follow-up delay | 5 dagen | Niet opdringerig |
| Max follow-ups | 2 | Respecteert "nee" |

### Data Opslag

```
output/email_outreach/
├── sent_emails.json     # Log van alle verzonden emails
├── blacklist.txt        # Uitgeschreven emails
└── stats.json           # Statistieken
```

### Best Practices

1. **Start met dry-run** - Bekijk eerst wat er verstuurd zou worden
2. **Test naar jezelf** - Check of emails goed aankomen
3. **Begin klein** - Start met 10-20 emails per dag
4. **Monitor bounces** - Bounced emails worden automatisch geblacklist
5. **Respecteer uitschrijvingen** - Komt automatisch op blacklist

---

## 📂 Volledige Bestandsstructuur

| Bestand | Doel |
|---------|------|
| `apify_lead_finder.py` | Lead scraping met Apify |
| `apify_quick_start.py` | Makkelijke scraping configuratie |
| `email_outreach.py` | Email campagne module |
| `business_lead_finder.py` | Google Places API (backup) |
| `quick_start.py` | Google API configuratie |
| `.env` | API tokens (NIET delen!) |
| `output/` | CSV, JSON en email logs |

---

## 🔄 Complete Workflow

```
1. LEADS VERZAMELEN
   python apify_quick_start.py
   → output/apify_leads_xxx.csv

2. FILTER HOT LEADS
   → Open CSV in Excel
   → Filter: lead_priority = "HOT" én has_email = "Ja"
   → Sla op als: hot_leads.csv

3. DRY RUN
   python email_outreach.py --csv output/hot_leads.csv
   → Check console output

4. LIVE CAMPAGNE
   python email_outreach.py --csv output/hot_leads.csv --live --max 10
   → Check inbox voor bounces/responses

5. FOLLOW-UPS (na 5+ dagen)
   python email_outreach.py --csv output/hot_leads.csv --live
   → Stuurt automatisch follow-up naar niet-geresponden leads
```

---

**Gemaakt door Ro-Tech Development** 🚀

*Vind én benader jouw volgende klant!*
