# 🔧 NAMECHEAP EMAIL SETUP GIDS - RO-TECH DEVELOPMENT

**Stap-voor-stap handleiding voor het opzetten van een veilige email infrastructuur**

---

## 📋 OVERZICHT

We gaan het volgende opzetten:

| Stap | Wat | Waarom |
|------|-----|--------|
| 1 | Subdomein mailbox | Beschermt je hoofddomein |
| 2 | SPF record | Voorkomt spoofing |
| 3 | DKIM record | Verifieert authenticiteit |
| 4 | DMARC record | Bepaalt wat te doen bij fails |
| 5 | Testen | Zorgt dat alles werkt |

**Totale tijd: ~30 minuten**

---

## 🚀 STAP 1: SUBDOMEIN MAILBOX AANMAKEN

### 1.1 Login op Namecheap

1. Ga naar https://www.namecheap.com/
2. Login met je account
3. Ga naar **Dashboard** → **Domain List**
4. Klik op **Manage** naast `ro-techdevelopment.dev`

### 1.2 Subdomein Aanmaken

1. Ga naar **Advanced DNS** tab
2. Klik **Add New Record**
3. Voeg toe:

```
Type: A Record
Host: mail
Value: [Namecheap Private Email IP - zie stap 1.3]
TTL: Automatic
```

### 1.3 Private Email voor Subdomein

1. Ga naar https://privateemail.com/ of je Namecheap Private Email dashboard
2. Klik **Manage** → **Email Forwarding/Mailboxes**
3. Klik **Add Mailbox**
4. Maak aan:

```
Email: bart@mail.ro-techdevelopment.dev
Password: [kies een sterk wachtwoord]
```

**Let op:** Dit kan extra kosten met zich meebrengen afhankelijk van je Namecheap plan. Check je subscription.

### 1.4 Alternatief: Gebruik Bestaande Mailbox met Alias

Als je geen extra mailbox wilt:

1. Gebruik je huidige `contact@ro-techdevelopment.dev`
2. Maak een **alias** aan: `outreach@ro-techdevelopment.dev`
3. Dit is minder veilig, maar gratis

---

## 🔐 STAP 2: SPF RECORD INSTELLEN

SPF vertelt email servers welke servers namens jouw domein mogen mailen.

### 2.1 Ga naar Advanced DNS

1. Namecheap Dashboard → Domain List → Manage → **Advanced DNS**

### 2.2 Check Bestaande SPF

Zoek naar een TXT record dat begint met `v=spf1`. 

**Als die BESTAAT:** Pas aan (niet dupliceren!)
**Als die NIET bestaat:** Maak nieuw record

### 2.3 Voeg SPF Record Toe

Klik **Add New Record**:

```
Type: TXT Record
Host: @
Value: v=spf1 include:spf.privateemail.com ~all
TTL: Automatic
```

**Uitleg:**
- `v=spf1` = SPF versie 1
- `include:spf.privateemail.com` = Namecheap Private Email mag mailen
- `~all` = Soft fail voor andere servers (aanbevolen start)

### 2.4 Voor Subdomein (indien apart)

Als je `mail.ro-techdevelopment.dev` gebruikt, voeg ook toe:

```
Type: TXT Record
Host: mail
Value: v=spf1 include:spf.privateemail.com ~all
TTL: Automatic
```

---

## 🔑 STAP 3: DKIM RECORD INSTELLEN

DKIM voegt een digitale handtekening toe aan je emails.

### 3.1 DKIM Key Ophalen bij Namecheap

1. Ga naar https://privateemail.com/appsuite/
2. Login met je email credentials
3. Ga naar **Settings** → **Security** → **DKIM**
4. Of check: Namecheap Dashboard → Apps → Private Email → **DKIM Settings**

**Als je de DKIM key niet kunt vinden:**
Namecheap Private Email configureert DKIM vaak automatisch. Check met mail-tester.com of het al werkt.

### 3.2 DKIM Record Toevoegen (indien nodig)

```
Type: TXT Record
Host: default._domainkey
Value: [plak je DKIM public key hier]
TTL: Automatic
```

**Typische DKIM waarde ziet er zo uit:**
```
v=DKIM1; k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC...
```

---

## 🛡️ STAP 4: DMARC RECORD INSTELLEN

DMARC vertelt ontvangende servers wat te doen als SPF of DKIM faalt.

### 4.1 Voeg DMARC Record Toe

In **Advanced DNS**, klik **Add New Record**:

```
Type: TXT Record
Host: _dmarc
Value: v=DMARC1; p=none; rua=mailto:contact@ro-techdevelopment.dev
TTL: Automatic
```

**Uitleg:**
- `v=DMARC1` = DMARC versie 1
- `p=none` = Monitor only (geen actie, alleen rapporten)
- `rua=mailto:...` = Stuur rapporten naar dit adres

### 4.2 DMARC Policy Upgraden (later)

**Start met p=none voor 2-4 weken**, daarna upgrade naar:

**Week 2-4: Quarantine**
```
v=DMARC1; p=quarantine; rua=mailto:contact@ro-techdevelopment.dev
```

**Week 4+: Reject (maximale bescherming)**
```
v=DMARC1; p=reject; rua=mailto:contact@ro-techdevelopment.dev
```

---

## ✅ STAP 5: TESTEN

### 5.1 DNS Propagatie Wachten

DNS wijzigingen kunnen tot **48 uur** duren om te propageren. Meestal is het binnen 1-4 uur klaar.

### 5.2 MXToolbox Tests

Test elke record apart:

**SPF Test:**
1. Ga naar https://mxtoolbox.com/spf.aspx
2. Voer in: `ro-techdevelopment.dev`
3. Klik **SPF Record Lookup**
4. ✅ Moet groen zijn

**DKIM Test:**
1. Ga naar https://mxtoolbox.com/dkim.aspx
2. Domein: `ro-techdevelopment.dev`
3. Selector: `default`
4. Klik **DKIM Lookup**
5. ✅ Moet groen zijn

**DMARC Test:**
1. Ga naar https://mxtoolbox.com/dmarc.aspx
2. Voer in: `ro-techdevelopment.dev`
3. Klik **DMARC Record Lookup**
4. ✅ Moet groen zijn

### 5.3 Mail-Tester (Belangrijkste Test!)

1. Ga naar https://mail-tester.com/
2. Je krijgt een uniek email adres (bijv. `test-xyz123@srv1.mail-tester.com`)
3. Stuur een email VANUIT je nieuwe mailbox naar dit adres
4. Wacht 30 seconden
5. Klik **Then check your score**

**Doel: 9/10 of hoger**

**Score interpretatie:**
- 10/10 = Perfect! ✅
- 9/10 = Uitstekend ✅
- 7-8/10 = Goed, kleine verbeterpunten
- 5-6/10 = Problemen, moet gefixt
- <5/10 = Serieuze problemen ❌

---

## 📧 STAP 6: .ENV CONFIGUREREN

Update je `.env` bestand in `tools/lead-finder/`:

```env
# === APIFY (heb je al) ===
APIFY_API_TOKEN=apify_api_xxxxx

# === EMAIL OUTREACH - Namecheap Private Email ===
SMTP_SERVER=mail.privateemail.com
SMTP_PORT=587
SMTP_USER=bart@mail.ro-techdevelopment.dev
SMTP_PASSWORD=jouw_email_wachtwoord

# Afzender info
SENDER_NAME=Bart van Rooij | Ro-Tech Development
SENDER_EMAIL=bart@mail.ro-techdevelopment.dev
REPLY_TO=bart@mail.ro-techdevelopment.dev

# Rate limiting
MAX_EMAILS_PER_DAY=50
MAX_EMAILS_PER_HOUR=20
DELAY_BETWEEN_EMAILS=30
```

**Als je geen subdomein gebruikt:**
```env
SMTP_USER=contact@ro-techdevelopment.dev
SENDER_EMAIL=contact@ro-techdevelopment.dev
REPLY_TO=contact@ro-techdevelopment.dev
```

---

## 🔥 STAP 7: WARM-UP STARTEN

**BELANGRIJK: Start NIET direct met cold emails!**

### Week 1-2: Warm-up

```
Dag 1:  Stuur 3-5 emails naar jezelf (andere accounts)
Dag 2:  Stuur 5 emails naar vrienden/familie
Dag 3:  Stuur 5-7 emails naar bekenden
Dag 4:  Stuur 7-10 emails naar LinkedIn connecties
Dag 5+: Stuur 10 emails/dag naar warm contacts

VRAAG IEDEREEN OM TE REAGEREN! (verhoogt reputatie)
```

### Week 3-4: Zachte Start

```
Stuur 10-20 emails/dag naar:
- Mix van warm contacts (50%)
- Eerste cold emails (50%)

Monitor:
- Open rates (doel: >40%)
- Bounce rates (doel: <2%)
- Spam complaints (doel: 0%)
```

### Week 5+: Schalen

```
Verhoog naar 30-50 emails/dag
Start follow-up sequences
Track alles in dashboard
```

---

## 🚨 TROUBLESHOOTING

### Probleem: SPF record niet gevonden
**Oplossing:**
1. Wacht 4 uur (DNS propagatie)
2. Check of je @ hebt gebruikt als Host
3. Verwijder dubbele SPF records (max 1!)

### Probleem: DKIM failed
**Oplossing:**
1. Check of DKIM automatisch is geconfigureerd door Namecheap
2. Neem contact op met Namecheap support
3. Ze kunnen DKIM voor je activeren

### Probleem: Mail-tester score < 7
**Oplossing:**
1. Lees de specifieke feedback in mail-tester
2. Fix elk punt dat rood is
3. Test opnieuw

### Probleem: Emails komen in spam
**Oplossing:**
1. Check SPF/DKIM/DMARC
2. Warm-up langer (min 2 weken)
3. Verzend minder emails
4. Verbeter email content

---

## 📋 CHECKLIST

```
TECHNISCH:
□ Subdomein aangemaakt (optioneel maar aanbevolen)
□ Mailbox geconfigureerd
□ SPF record toegevoegd
□ DKIM record toegevoegd (of automatisch)
□ DMARC record toegevoegd (p=none)
□ Mail-tester score 9+/10

CONFIGURATIE:
□ .env bestand geüpdatet
□ Test email verstuurd en ontvangen
□ Reply test gedaan

WARM-UP:
□ Week 1-2: Emails naar bekenden
□ Week 3-4: Mix warm + cold
□ Week 5+: Volledige cold outreach
```

---

## 📞 HULP NODIG?

**Namecheap Support:**
- Live Chat: https://www.namecheap.com/support/live-chat/
- Knowledgebase: https://www.namecheap.com/support/knowledgebase/

**DNS Tools:**
- https://mxtoolbox.com/
- https://mail-tester.com/
- https://dmarcian.com/dmarc-inspector/

---

**Gemaakt voor Ro-Tech Development**
**Versie 1.0 - Januari 2026**
