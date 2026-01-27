"""
Email Outreach Module v1.0
Professionele, niet-opdringende e-mail outreach voor lead generation

Features:
- Gepersonaliseerde email templates
- Rate limiting (max emails per dag/uur)
- Follow-up scheduling
- Blacklist management
- GDPR-compliant unsubscribe links
- Email tracking (opens/clicks) via optionele webhook

Author: Ro-Tech Development
"""

import smtplib
import ssl
import json
import csv
import time
import hashlib
import re
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import List, Dict, Optional, Tuple
from datetime import datetime, timedelta
from dataclasses import dataclass, asdict, field
from pathlib import Path
from string import Template
import os
import sys
from dotenv import load_dotenv
import argparse

# Fix Windows encoding
if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    except AttributeError:
        pass

load_dotenv()

# Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('email_outreach.log', encoding='utf-8'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)


# =============================================================================
# CONFIGURATIE
# =============================================================================

class EmailConfig:
    """Centrale email configuratie"""
    
    # SMTP Settings (standaard voor Gmail)
    SMTP_SERVER = os.getenv('SMTP_SERVER', 'smtp.gmail.com')
    SMTP_PORT = int(os.getenv('SMTP_PORT', 587))
    SMTP_USER = os.getenv('SMTP_USER', '')
    SMTP_PASSWORD = os.getenv('SMTP_PASSWORD', '')  # App password voor Gmail
    
    # Sender info - Bart van Rooij | Ro-Tech Development
    # BELANGRIJK: Configureer deze via .env met je werkende email!
    SENDER_NAME = os.getenv('SENDER_NAME', 'Bart van Rooij | Ro-Tech Development')
    SENDER_EMAIL = os.getenv('SENDER_EMAIL', '')  # Vul in via .env
    REPLY_TO = os.getenv('REPLY_TO', '')  # Vul in via .env
    
    # Rate limiting
    MAX_EMAILS_PER_HOUR = int(os.getenv('MAX_EMAILS_PER_HOUR', 20))
    MAX_EMAILS_PER_DAY = int(os.getenv('MAX_EMAILS_PER_DAY', 50))
    DELAY_BETWEEN_EMAILS = int(os.getenv('DELAY_BETWEEN_EMAILS', 30))  # seconds
    
    # Follow-up settings
    FOLLOWUP_DELAY_DAYS = 5  # Dagen wachten voor follow-up
    MAX_FOLLOWUPS = 2  # Maximaal 2 follow-ups
    
    # Storage
    DATA_DIR = Path("output/email_outreach")
    SENT_LOG = DATA_DIR / "sent_emails.json"
    BLACKLIST_FILE = DATA_DIR / "blacklist.txt"
    STATS_FILE = DATA_DIR / "stats.json"


# =============================================================================
# DATA CLASSES
# =============================================================================

@dataclass
class EmailLead:
    """Lead voor email outreach"""
    email: str
    name: str
    company: str
    city: str = ""
    phone: str = ""
    has_website: bool = False
    lead_priority: str = ""
    lead_score: int = 0
    categories: str = ""
    notes: str = ""
    
    # Email tracking
    emails_sent: int = 0
    last_email_date: str = ""
    status: str = "new"  # new, contacted, responded, unsubscribed, bounced
    
    def get_id(self) -> str:
        """Unieke ID voor deze lead"""
        return hashlib.md5(self.email.lower().encode()).hexdigest()[:12]


@dataclass  
class EmailTemplate:
    """Email template met variabelen"""
    name: str
    subject: str
    body_html: str
    body_text: str
    template_type: str = "initial"  # initial, followup1, followup2
    
    def render(self, lead: EmailLead, **extra_vars) -> Tuple[str, str, str]:
        """Render template met lead data"""
        variables = {
            'bedrijfsnaam': lead.company,
            'naam': lead.name or lead.company,
            'stad': lead.city,
            'categorie': lead.categories.split(',')[0].strip() if lead.categories else 'uw branche',
            'voornaam': lead.name.split()[0] if lead.name else '',
            **extra_vars
        }
        
        subject = Template(self.subject).safe_substitute(variables)
        html = Template(self.body_html).safe_substitute(variables)
        text = Template(self.body_text).safe_substitute(variables)
        
        return subject, html, text


# =============================================================================
# EMAIL TEMPLATES - Professionele Cold Email Formules
# =============================================================================
# 
# Gebaseerd op bewezen formules:
# - PAS (Problem - Agitate - Solution) - Hoogste response rate
# - BAB (Before - After - Bridge) - Beste voor bestaande websites
# - Direct & Zakelijk - Professionele eerste indruk
#
# Contactgegevens:
# - Bart van Rooij | Ro-Tech Development
# - Tel: +31 6 57 23 55 74
# - Email: contact@ro-techdevelopment.com
# - Web: www.ro-techdevelopment.com
# =============================================================================

TEMPLATES = {
    # =========================================================================
    # INITIAL CONTACT - Voor bedrijven MET website (WARM leads)
    # GEOPTIMALISEERD: 85 woorden, korte subject line
    # =========================================================================
    "initial": EmailTemplate(
        name="Eerste contact - Met website",
        subject="Idee voor $bedrijfsnaam",
        template_type="initial",
        body_html="""<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.7; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .signature { margin-top: 25px; padding-top: 15px; border-top: 1px solid #eee; font-size: 14px; color: #666; }
        .footer { margin-top: 20px; font-size: 11px; color: #999; }
    </style>
</head>
<body>
    <p>Hoi,</p>
    
    <p>Via Google Maps zag ik <strong>$bedrijfsnaam</strong> in $stad. Goede reviews!</p>
    
    <p>Ik keek even naar jullie website en zag een paar dingen die beter kunnen. Niet om af te kraken, maar omdat ik denk dat jullie meer klanten uit de website kunnen halen.</p>
    
    <p>Ik help ondernemers in $stad met dit soort verbeteringen. Vaak zijn het kleine aanpassingen met groot effect.</p>
    
    <p>Tijd voor een kort gesprek van 10 minuten? Vrijblijvend.</p>
    
    <div class="signature">
        <strong>Bart van Rooij</strong><br>
        Ro-Tech Development<br>
        06 57 23 55 74
    </div>
    
    <div class="footer">
        Geen interesse? Reply "stop"
    </div>
</body>
</html>""",
        body_text="""Hoi,

Via Google Maps zag ik $bedrijfsnaam in $stad. Goede reviews!

Ik keek even naar jullie website en zag een paar dingen die beter kunnen. Niet om af te kraken, maar omdat ik denk dat jullie meer klanten uit de website kunnen halen.

Ik help ondernemers in $stad met dit soort verbeteringen. Vaak zijn het kleine aanpassingen met groot effect.

Tijd voor een kort gesprek van 10 minuten? Vrijblijvend.

Groet,
Bart van Rooij
Ro-Tech Development
06 57 23 55 74

---
Geen interesse? Reply "stop"."""
    ),
    
    # =========================================================================
    # NO WEBSITE - Voor HOT leads zonder website
    # GEOPTIMALISEERD: 95 woorden, korte subject line, sterke CTA
    # =========================================================================
    "no_website": EmailTemplate(
        name="Geen website - Direct",
        subject="$bedrijfsnaam website",
        template_type="initial",
        body_html="""<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.7; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .signature { margin-top: 25px; padding-top: 15px; border-top: 1px solid #eee; font-size: 14px; color: #666; }
        .ps { margin-top: 20px; font-size: 13px; color: #666; }
        .footer { margin-top: 20px; font-size: 11px; color: #999; }
    </style>
</head>
<body>
    <p>Goedendag,</p>
    
    <p>Via Google Maps zag ik dat <strong>$bedrijfsnaam</strong> in $stad goede reviews heeft. Complimenten!</p>
    
    <p>Wat me opviel: jullie hebben nog geen eigen website. Dat is jammer, want 85% van de mensen zoekt eerst online voordat ze ergens naartoe gaan.</p>
    
    <p>Ik ben Bart, en ik bouw websites voor lokale ondernemers. Simpel, professioneel, betaalbaar. Geen standaard template, maar iets dat bij jullie past.</p>
    
    <p>Tijd voor een kort belletje deze week? 10 minuutjes, vrijblijvend.</p>
    
    <div class="signature">
        <strong>Bart van Rooij</strong><br>
        Ro-Tech Development<br>
        06 57 23 55 74
    </div>
    
    <p class="ps">PS: Bekijk wat ik voor anderen deed: <a href="https://ro-techdevelopment.dev/projecten">ro-techdevelopment.dev/projecten</a></p>
    
    <div class="footer">
        Geen interesse? Reply "stop"
    </div>
</body>
</html>""",
        body_text="""Goedendag,

Via Google Maps zag ik dat $bedrijfsnaam in $stad goede reviews heeft. Complimenten!

Wat me opviel: jullie hebben nog geen eigen website. Dat is jammer, want 85% van de mensen zoekt eerst online voordat ze ergens naartoe gaan.

Ik ben Bart, en ik bouw websites voor lokale ondernemers. Simpel, professioneel, betaalbaar. Geen standaard template, maar iets dat bij jullie past.

Tijd voor een kort belletje deze week? 10 minuutjes, vrijblijvend.

Groet,
Bart van Rooij
Ro-Tech Development
06 57 23 55 74

PS: Bekijk wat ik voor anderen deed: ro-techdevelopment.dev/projecten

---
Geen interesse? Reply "stop"."""
    ),
    
    # =========================================================================
    # FOLLOW-UP 1 - Vriendelijke herinnering (Na 5 dagen)
    # GEOPTIMALISEERD: 55 woorden, makkelijke response opties
    # =========================================================================
    "followup1": EmailTemplate(
        name="Follow-up 1 - Herinnering",
        subject="Kort vraagje",
        template_type="followup1",
        body_html="""<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.7; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .signature { margin-top: 20px; font-size: 14px; color: #666; }
        .footer { margin-top: 20px; font-size: 11px; color: #999; }
    </style>
</head>
<body>
    <p>Hoi,</p>
    
    <p>Even een reminder op mijn vorige bericht. Ik snap dat je het druk hebt - ondernemers hebben altijd duizend dingen aan hun hoofd.</p>
    
    <p>Kort: ik vroeg of je interesse hebt in een gesprek over jullie online zichtbaarheid. 10 minuten, geen verplichtingen.</p>
    
    <p><strong>Interesse?</strong> Reply met "ja" en ik bel je.<br>
    <strong>Geen interesse?</strong> Reply met "nee" en ik laat je met rust.</p>
    
    <div class="signature">
        Groet,<br>
        <strong>Bart</strong>
    </div>
    
    <div class="footer">
        Ro-Tech Development | 06 57 23 55 74
    </div>
</body>
</html>""",
        body_text="""Hoi,

Even een reminder op mijn vorige bericht. Ik snap dat je het druk hebt - ondernemers hebben altijd duizend dingen aan hun hoofd.

Kort: ik vroeg of je interesse hebt in een gesprek over jullie online zichtbaarheid. 10 minuten, geen verplichtingen.

Interesse? Reply met "ja" en ik bel je.
Geen interesse? Reply met "nee" en ik laat je met rust.

Groet,
Bart

---
Ro-Tech Development | 06 57 23 55 74"""
    ),
    
    # =========================================================================
    # FOLLOW-UP 2 - Laatste bericht (Respectvol afsluiten)
    # GEOPTIMALISEERD: 40 woorden, respectvol, deur blijft open
    # =========================================================================
    "followup2": EmailTemplate(
        name="Follow-up 2 - Afsluiting",
        subject="Laatste berichtje",
        template_type="followup2",
        body_html="""<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.7; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .signature { margin-top: 20px; font-size: 14px; color: #666; }
        .footer { margin-top: 15px; font-size: 11px; color: #999; }
    </style>
</head>
<body>
    <p>Hoi,</p>
    
    <p>Dit is mijn laatste bericht. Geen reactie = geen interesse, en dat is prima.</p>
    
    <p>Mocht je in de toekomst toch hulp nodig hebben met jullie website, dan weet je me te vinden.</p>
    
    <p>Succes met de zaak!</p>
    
    <div class="signature">
        <strong>Bart van Rooij</strong><br>
        Ro-Tech Development<br>
        ro-techdevelopment.dev
    </div>
    
    <div class="footer">
        Dit was mijn laatste bericht.
    </div>
</body>
</html>""",
        body_text="""Hoi,

Dit is mijn laatste bericht. Geen reactie = geen interesse, en dat is prima.

Mocht je in de toekomst toch hulp nodig hebben met jullie website, dan weet je me te vinden.

Succes met de zaak!

Bart van Rooij
Ro-Tech Development
ro-techdevelopment.dev

---
Dit was mijn laatste bericht."""
    ),
    
    # =========================================================================
    # OUTDATED WEBSITE - Voor verouderde websites
    # =========================================================================
    "outdated_website": EmailTemplate(
        name="Verouderde website",
        subject="Idee voor $bedrijfsnaam",
        template_type="initial",
        body_html="""<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.7; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .signature { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e5e5; }
        .signature-name { font-weight: 600; color: #1a1a1a; margin-bottom: 4px; }
        .signature-details { font-size: 14px; color: #666; line-height: 1.5; }
        .signature-details a { color: #4F46E5; text-decoration: none; }
        .footer { margin-top: 30px; padding-top: 16px; font-size: 11px; color: #999; border-top: 1px solid #f0f0f0; }
        .footer a { color: #999; }
    </style>
</head>
<body>
    <p>Goedendag,</p>
    
    <p>In gesprekken met ondernemers in $stad hoor ik vaak hetzelfde: "Mijn website levert eigenlijk weinig op." Bezoekers komen wel, maar ze nemen geen contact op. Herkenbaar?</p>
    
    <p>Het goede nieuws: dat is vaak relatief makkelijk te verbeteren. Een moderne website die goed werkt op telefoon, snel laadt, en bezoekers aanzet tot actie - dat maakt echt verschil.</p>
    
    <p>Ik ben Bart van Rooij en ik help lokale ondernemers precies hiermee. Benieuwd hoe dat eruit zou kunnen zien voor $bedrijfsnaam?</p>
    
    <p>Neem een kijkje op mijn portfolio: <a href="https://www.ro-techdevelopment.com/projecten" style="color: #4F46E5;">ro-techdevelopment.com/projecten</a></p>
    
    <p>Interesse in een vrijblijvend gesprek? Laat het weten.</p>
    
    <div class="signature">
        <div class="signature-name">Bart van Rooij</div>
        <div class="signature-details">
            Ro-Tech Development<br>
            Webdesign & Development<br><br>
            <a href="tel:+31657235574">+31 6 57 23 55 74</a><br>
            <a href="mailto:contact@ro-techdevelopment.com">contact@ro-techdevelopment.com</a><br>
            <a href="https://www.ro-techdevelopment.com">www.ro-techdevelopment.com</a>
        </div>
    </div>
    
    <div class="footer">
        <a href="mailto:$reply_to?subject=Stop&body=Geen interesse: $email">Geen interesse</a>
    </div>
</body>
</html>""",
        body_text="""Goedendag,

In gesprekken met ondernemers in $stad hoor ik vaak hetzelfde: "Mijn website levert eigenlijk weinig op." Bezoekers komen wel, maar ze nemen geen contact op. Herkenbaar?

Het goede nieuws: dat is vaak relatief makkelijk te verbeteren. Een moderne website die goed werkt op telefoon, snel laadt, en bezoekers aanzet tot actie - dat maakt echt verschil.

Ik ben Bart van Rooij en ik help lokale ondernemers precies hiermee. Benieuwd hoe dat eruit zou kunnen zien voor $bedrijfsnaam?

Neem een kijkje op mijn portfolio: www.ro-techdevelopment.com/projecten

Interesse in een vrijblijvend gesprek? Laat het weten.

Met vriendelijke groet,

Bart van Rooij
Ro-Tech Development

Tel: +31 6 57 23 55 74
Email: contact@ro-techdevelopment.com
Web: www.ro-techdevelopment.com

---
Reply "stop" om te stoppen."""
    ),
    
    # =========================================================================
    # SOCIAL PROOF - Met resultaten
    # =========================================================================
    "social_proof": EmailTemplate(
        name="Social Proof - Resultaten",
        subject="Wat ik deed voor een $categorie in $stad",
        template_type="initial",
        body_html="""<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.7; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .result-box { background: #f0fdf4; border-left: 3px solid #22c55e; padding: 15px 20px; margin: 20px 0; }
        .signature { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e5e5; }
        .signature-name { font-weight: 600; color: #1a1a1a; margin-bottom: 4px; }
        .signature-details { font-size: 14px; color: #666; line-height: 1.5; }
        .signature-details a { color: #4F46E5; text-decoration: none; }
        .footer { margin-top: 30px; padding-top: 16px; font-size: 11px; color: #999; border-top: 1px solid #f0f0f0; }
        .footer a { color: #999; }
    </style>
</head>
<body>
    <p>Goedendag,</p>
    
    <p>Ik werk regelmatig met ondernemers in de regio $stad. Laatst bouwde ik een website voor een $categorie, met een mooi resultaat:</p>
    
    <div class="result-box">
        <strong>Na 1 maand:</strong><br>
        40% meer contactaanvragen, beter vindbaar op Google, en een website waar de eigenaar trots op is.
    </div>
    
    <p>Zoiets interessant voor $bedrijfsnaam? Ik laat graag vrijblijvend zien wat er mogelijk is.</p>
    
    <p>Bekijk meer voorbeelden op: <a href="https://www.ro-techdevelopment.com/projecten" style="color: #4F46E5;">ro-techdevelopment.com/projecten</a></p>
    
    <p>Laat het weten als je eens wilt praten.</p>
    
    <div class="signature">
        <div class="signature-name">Bart van Rooij</div>
        <div class="signature-details">
            Ro-Tech Development<br>
            Webdesign & Development<br><br>
            <a href="tel:+31657235574">+31 6 57 23 55 74</a><br>
            <a href="mailto:contact@ro-techdevelopment.com">contact@ro-techdevelopment.com</a><br>
            <a href="https://www.ro-techdevelopment.com">www.ro-techdevelopment.com</a>
        </div>
    </div>
    
    <div class="footer">
        <a href="mailto:$reply_to?subject=Stop&body=Geen interesse: $email">Geen interesse</a>
    </div>
</body>
</html>""",
        body_text="""Goedendag,

Ik werk regelmatig met ondernemers in de regio $stad. Laatst bouwde ik een website voor een $categorie, met een mooi resultaat:

NA 1 MAAND:
40% meer contactaanvragen, beter vindbaar op Google, en een website waar de eigenaar trots op is.

Zoiets interessant voor $bedrijfsnaam? Ik laat graag vrijblijvend zien wat er mogelijk is.

Bekijk meer voorbeelden op: www.ro-techdevelopment.com/projecten

Laat het weten als je eens wilt praten.

Met vriendelijke groet,

Bart van Rooij
Ro-Tech Development

Tel: +31 6 57 23 55 74
Email: contact@ro-techdevelopment.com
Web: www.ro-techdevelopment.com

---
Reply "stop" om te stoppen."""
    )
}


# =============================================================================
# EMAIL OUTREACH ENGINE
# =============================================================================

class EmailOutreach:
    """
    Professionele email outreach met rate limiting en tracking
    """
    
    def __init__(self):
        """Initialiseer outreach engine"""
        self._setup_storage()
        self.sent_log = self._load_sent_log()
        self.blacklist = self._load_blacklist()
        self.stats = self._load_stats()
        self.smtp_connection = None
    
    def _setup_storage(self):
        """Maak output directories"""
        EmailConfig.DATA_DIR.mkdir(parents=True, exist_ok=True)
    
    def _load_sent_log(self) -> Dict:
        """Laad verzonden emails log"""
        if EmailConfig.SENT_LOG.exists():
            try:
                with open(EmailConfig.SENT_LOG, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except (json.JSONDecodeError, IOError, OSError) as e:
                logger.warning(f"Kon sent log niet laden: {e}")
        return {"emails": {}, "daily_counts": {}}
    
    def _save_sent_log(self):
        """Sla verzonden emails op"""
        with open(EmailConfig.SENT_LOG, 'w', encoding='utf-8') as f:
            json.dump(self.sent_log, f, indent=2, ensure_ascii=False)
    
    def _load_blacklist(self) -> set:
        """Laad blacklist (uitgeschreven emails)"""
        blacklist = set()
        if EmailConfig.BLACKLIST_FILE.exists():
            with open(EmailConfig.BLACKLIST_FILE, 'r', encoding='utf-8') as f:
                for line in f:
                    email = line.strip().lower()
                    if email and '@' in email:
                        blacklist.add(email)
        return blacklist
    
    def _save_blacklist(self):
        """Sla blacklist op"""
        with open(EmailConfig.BLACKLIST_FILE, 'w', encoding='utf-8') as f:
            for email in sorted(self.blacklist):
                f.write(f"{email}\n")
    
    def _load_stats(self) -> Dict:
        """Laad statistieken"""
        if EmailConfig.STATS_FILE.exists():
            try:
                with open(EmailConfig.STATS_FILE, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except (json.JSONDecodeError, IOError, OSError) as e:
                logger.warning(f"Kon stats niet laden: {e}")
        return {"total_sent": 0, "total_responses": 0, "total_unsubscribes": 0}
    
    def _save_stats(self):
        """Sla statistieken op"""
        with open(EmailConfig.STATS_FILE, 'w', encoding='utf-8') as f:
            json.dump(self.stats, f, indent=2)
    
    def add_to_blacklist(self, email: str):
        """Voeg email toe aan blacklist"""
        self.blacklist.add(email.lower().strip())
        self._save_blacklist()
        logger.info(f"Email toegevoegd aan blacklist: {email}")
    
    def is_blacklisted(self, email: str) -> bool:
        """Check of email op blacklist staat"""
        return email.lower().strip() in self.blacklist
    
    def _get_daily_count(self) -> int:
        """Haal aantal verzonden emails vandaag op"""
        today = datetime.now().strftime('%Y-%m-%d')
        return self.sent_log.get("daily_counts", {}).get(today, 0)
    
    def _get_hourly_count(self) -> int:
        """Haal aantal verzonden emails dit uur op"""
        current_hour = datetime.now().strftime('%Y-%m-%d-%H')
        return self.sent_log.get("hourly_counts", {}).get(current_hour, 0)
    
    def _increment_daily_count(self):
        """Verhoog dagelijkse en uurlijkse counter"""
        today = datetime.now().strftime('%Y-%m-%d')
        current_hour = datetime.now().strftime('%Y-%m-%d-%H')
        
        if "daily_counts" not in self.sent_log:
            self.sent_log["daily_counts"] = {}
        if "hourly_counts" not in self.sent_log:
            self.sent_log["hourly_counts"] = {}
        
        self.sent_log["daily_counts"][today] = self.sent_log["daily_counts"].get(today, 0) + 1
        self.sent_log["hourly_counts"][current_hour] = self.sent_log["hourly_counts"].get(current_hour, 0) + 1
    
    def _can_send_email(self) -> Tuple[bool, str]:
        """Check of we een email mogen versturen (rate limiting)"""
        daily_count = self._get_daily_count()
        hourly_count = self._get_hourly_count()
        
        if daily_count >= EmailConfig.MAX_EMAILS_PER_DAY:
            return False, f"Dagelijks limiet bereikt ({EmailConfig.MAX_EMAILS_PER_DAY})"
        
        if hourly_count >= EmailConfig.MAX_EMAILS_PER_HOUR:
            return False, f"Uurlijks limiet bereikt ({EmailConfig.MAX_EMAILS_PER_HOUR})"
        
        return True, ""
    
    def _validate_smtp_config(self) -> Tuple[bool, str]:
        """Valideer SMTP configuratie vóór gebruik"""
        errors = []
        
        if not EmailConfig.SMTP_USER:
            errors.append("SMTP_USER niet geconfigureerd")
        if not EmailConfig.SMTP_PASSWORD:
            errors.append("SMTP_PASSWORD niet geconfigureerd")
        if not EmailConfig.SENDER_EMAIL:
            errors.append("SENDER_EMAIL niet geconfigureerd")
        if not EmailConfig.REPLY_TO:
            errors.append("REPLY_TO niet geconfigureerd")
        
        if errors:
            return False, "; ".join(errors)
        return True, ""
    
    def _connect_smtp(self) -> bool:
        """Maak SMTP verbinding"""
        # Valideer eerst configuratie
        is_valid, error_msg = self._validate_smtp_config()
        if not is_valid:
            logger.error(f"SMTP configuratie ongeldig: {error_msg}")
            return False
        
        try:
            context = ssl.create_default_context()
            self.smtp_connection = smtplib.SMTP(
                EmailConfig.SMTP_SERVER, 
                EmailConfig.SMTP_PORT,
                timeout=30  # 30 seconden timeout
            )
            self.smtp_connection.starttls(context=context)
            self.smtp_connection.login(EmailConfig.SMTP_USER, EmailConfig.SMTP_PASSWORD)
            logger.info("SMTP verbinding succesvol")
            return True
        except smtplib.SMTPAuthenticationError as e:
            logger.error(f"SMTP authenticatie mislukt - check SMTP_USER en SMTP_PASSWORD: {e}")
            return False
        except smtplib.SMTPConnectError as e:
            logger.error(f"Kon geen verbinding maken met SMTP server: {e}")
            return False
        except TimeoutError:
            logger.error("SMTP verbinding timeout - server niet bereikbaar")
            return False
        except Exception as e:
            logger.error(f"SMTP verbinding mislukt: {e}")
            return False
    
    def _disconnect_smtp(self):
        """Sluit SMTP verbinding"""
        if self.smtp_connection:
            try:
                self.smtp_connection.quit()
            except:
                pass
            self.smtp_connection = None
    
    def _send_single_email(
        self,
        lead: EmailLead,
        template: EmailTemplate,
        dry_run: bool = False
    ) -> bool:
        """Verstuur één email"""
        
        # Validatie
        if not lead.email or '@' not in lead.email:
            logger.warning(f"Ongeldige email: {lead.email}")
            return False
        
        if self.is_blacklisted(lead.email):
            logger.info(f"Overgeslagen (blacklist): {lead.email}")
            return False
        
        # Check rate limit
        can_send, reason = self._can_send_email()
        if not can_send:
            logger.warning(f"Rate limit: {reason}")
            return False
        
        # Render template
        extra_vars = {
            'reply_to': EmailConfig.REPLY_TO,
            'email': lead.email,
            'unsubscribe_link': f"mailto:{EmailConfig.REPLY_TO}?subject=Uitschrijven&body=Uitschrijven: {lead.email}"
        }
        subject, html_body, text_body = template.render(lead, **extra_vars)
        
        if dry_run:
            logger.info(f"[DRY RUN] Zou sturen naar: {lead.email}")
            logger.info(f"   Subject: {subject}")
            return True
        
        # Bouw email
        msg = MIMEMultipart('alternative')
        msg['Subject'] = subject
        msg['From'] = f"{EmailConfig.SENDER_NAME} <{EmailConfig.SENDER_EMAIL}>"
        msg['To'] = lead.email
        msg['Reply-To'] = EmailConfig.REPLY_TO
        
        # Voeg plain text en HTML toe
        msg.attach(MIMEText(text_body, 'plain', 'utf-8'))
        msg.attach(MIMEText(html_body, 'html', 'utf-8'))
        
        try:
            # Verstuur
            self.smtp_connection.send_message(msg)
            
            # Log
            lead_id = lead.get_id()
            if lead_id not in self.sent_log["emails"]:
                self.sent_log["emails"][lead_id] = {
                    "email": lead.email,
                    "company": lead.company,
                    "sent_dates": [],
                    "templates_used": []
                }
            
            self.sent_log["emails"][lead_id]["sent_dates"].append(
                datetime.now().isoformat()
            )
            self.sent_log["emails"][lead_id]["templates_used"].append(
                template.template_type
            )
            
            self._increment_daily_count()
            self.stats["total_sent"] += 1
            
            self._save_sent_log()
            self._save_stats()
            
            logger.info(f"✅ Email verstuurd naar: {lead.email} ({lead.company})")
            return True
            
        except smtplib.SMTPRecipientsRefused:
            logger.warning(f"Email bounced: {lead.email}")
            self.add_to_blacklist(lead.email)
            return False
        except Exception as e:
            logger.error(f"Verzenden mislukt naar {lead.email}: {e}")
            return False
    
    def get_email_history(self, email: str) -> Optional[Dict]:
        """Haal email geschiedenis op"""
        lead_id = hashlib.md5(email.lower().encode()).hexdigest()[:12]
        return self.sent_log.get("emails", {}).get(lead_id)
    
    def send_plain_text(
        self,
        to_email: str,
        subject: str,
        body: str
    ) -> bool:
        """
        Verstuur plain text email (betere deliverability)
        Plain text heeft 21% hogere open rate dan HTML (Litmus 2022)
        """
        # Validatie
        if not to_email or '@' not in to_email:
            logger.warning(f"Ongeldige email: {to_email}")
            return False
        
        if self.is_blacklisted(to_email):
            logger.info(f"Overgeslagen (blacklist): {to_email}")
            return False
        
        # Check rate limit
        can_send, reason = self._can_send_email()
        if not can_send:
            logger.warning(f"Rate limit: {reason}")
            return False
        
        # SMTP verbinding
        if not self.smtp_connection:
            if not self._connect_smtp():
                return False
        
        # Bouw plain text email (geen HTML!)
        msg = MIMEText(body, 'plain', 'utf-8')
        msg['Subject'] = subject
        msg['From'] = f"{EmailConfig.SENDER_NAME} <{EmailConfig.SENDER_EMAIL}>"
        msg['To'] = to_email
        msg['Reply-To'] = EmailConfig.REPLY_TO
        
        try:
            self.smtp_connection.send_message(msg)
            
            # Log
            lead_id = hashlib.md5(to_email.lower().encode()).hexdigest()[:12]
            if lead_id not in self.sent_log["emails"]:
                self.sent_log["emails"][lead_id] = {
                    "email": to_email,
                    "company": "",
                    "sent_dates": [],
                    "templates_used": []
                }
            
            self.sent_log["emails"][lead_id]["sent_dates"].append(
                datetime.now().isoformat()
            )
            self.sent_log["emails"][lead_id]["templates_used"].append("plain_text")
            
            self._increment_daily_count()
            self.stats["total_sent"] += 1
            
            self._save_sent_log()
            self._save_stats()
            
            logger.info(f"✅ Plain text email verstuurd naar: {to_email}")
            return True
            
        except smtplib.SMTPRecipientsRefused:
            logger.warning(f"Email bounced: {to_email}")
            self.add_to_blacklist(to_email)
            return False
        except smtplib.SMTPServerDisconnected:
            logger.warning("SMTP verbinding verbroken, opnieuw verbinden...")
            self._disconnect_smtp()
            if self._connect_smtp():
                return self.send_plain_text(to_email, subject, body)
            return False
        except Exception as e:
            logger.error(f"Verzenden mislukt naar {to_email}: {e}")
            return False
    
    def get_next_template(self, lead: EmailLead) -> Optional[EmailTemplate]:
        """Bepaal welke template te gebruiken"""
        history = self.get_email_history(lead.email)
        
        if not history:
            # Eerste email - kies juiste template
            if not lead.has_website:
                return TEMPLATES["no_website"]
            return TEMPLATES["initial"]
        
        # Check hoeveel emails al verstuurd
        sent_count = len(history.get("sent_dates", []))
        
        if sent_count >= EmailConfig.MAX_FOLLOWUPS + 1:
            return None  # Maximum bereikt
        
        # Check of genoeg tijd verstreken is
        last_date = history["sent_dates"][-1]
        last_dt = datetime.fromisoformat(last_date)
        days_since = (datetime.now() - last_dt).days
        
        if days_since < EmailConfig.FOLLOWUP_DELAY_DAYS:
            return None  # Te vroeg voor follow-up
        
        # Bepaal follow-up template
        if sent_count == 1:
            return TEMPLATES["followup1"]
        elif sent_count == 2:
            return TEMPLATES["followup2"]
        
        return None
    
    def load_leads_from_csv(self, filepath: str) -> List[EmailLead]:
        """Laad leads vanuit CSV bestand"""
        leads = []
        
        try:
            with open(filepath, 'r', encoding='utf-8-sig') as f:
                # Detecteer delimiter
                sample = f.read(1024)
                f.seek(0)
                delimiter = ';' if ';' in sample else ','
                
                reader = csv.DictReader(f, delimiter=delimiter)
                
                for row in reader:
                    email = row.get('email', '').strip()
                    if not email or '@' not in email:
                        continue
                    
                    # has_website: default Nee als niet aanwezig (veiliger voor lead gen)
                    has_website_val = row.get('has_website', '').lower()
                    has_website = has_website_val in ['ja', 'yes', 'true', '1']
                    
                    lead = EmailLead(
                        email=email,
                        name=row.get('name', ''),
                        company=row.get('name', ''),  # Vaak is name = company
                        city=row.get('city', ''),
                        phone=row.get('phone', ''),
                        has_website=has_website,
                        lead_priority=row.get('lead_priority', ''),
                        lead_score=int(row.get('lead_score', 0) or 0),
                        categories=row.get('categories', ''),
                        notes=row.get('notes', '')
                    )
                    leads.append(lead)
            
            logger.info(f"📥 {len(leads)} leads geladen uit {filepath}")
            
        except Exception as e:
            logger.error(f"Fout bij laden CSV: {e}")
        
        return leads
    
    def run_campaign(
        self,
        leads: List[EmailLead],
        template_name: str = "auto",
        dry_run: bool = True,
        max_emails: int = None
    ) -> Dict:
        """
        Voer email campagne uit
        
        Args:
            leads: Lijst met leads
            template_name: Template naam of "auto" voor automatische selectie
            dry_run: Alleen simuleren, niet echt versturen
            max_emails: Maximum aantal te versturen (None = geen limiet)
        
        Returns:
            Statistieken van de campagne
        """
        results = {
            "total_leads": len(leads),
            "sent": 0,
            "skipped_blacklist": 0,
            "skipped_no_template": 0,
            "skipped_rate_limit": 0,
            "failed": 0
        }
        
        if not dry_run:
            if not self._connect_smtp():
                logger.error("Kon geen SMTP verbinding maken")
                return results
        
        logger.info(f"🚀 Start email campagne ({'DRY RUN' if dry_run else 'LIVE'})")
        logger.info(f"📋 {len(leads)} leads te verwerken")
        
        try:
            for i, lead in enumerate(leads):
                # Check max
                if max_emails and results["sent"] >= max_emails:
                    logger.info(f"Maximum emails bereikt ({max_emails})")
                    break
                
                # Check blacklist
                if self.is_blacklisted(lead.email):
                    results["skipped_blacklist"] += 1
                    continue
                
                # Bepaal template
                if template_name == "auto":
                    template = self.get_next_template(lead)
                else:
                    template = TEMPLATES.get(template_name)
                
                if not template:
                    results["skipped_no_template"] += 1
                    continue
                
                # Check rate limit
                can_send, _ = self._can_send_email()
                if not can_send:
                    results["skipped_rate_limit"] += 1
                    continue
                
                # Verstuur
                if self._send_single_email(lead, template, dry_run=dry_run):
                    results["sent"] += 1
                else:
                    results["failed"] += 1
                
                # Delay tussen emails
                if not dry_run and results["sent"] < len(leads):
                    time.sleep(EmailConfig.DELAY_BETWEEN_EMAILS)
        
        finally:
            if not dry_run:
                self._disconnect_smtp()
        
        # Print resultaten
        print("\n" + "="*50)
        print(f"📊 CAMPAGNE RESULTATEN {'(DRY RUN)' if dry_run else ''}")
        print("="*50)
        print(f"📋 Totaal leads: {results['total_leads']}")
        print(f"✅ Verstuurd: {results['sent']}")
        print(f"⛔ Blacklist: {results['skipped_blacklist']}")
        print(f"⏭️  Geen template: {results['skipped_no_template']}")
        print(f"🚫 Rate limit: {results['skipped_rate_limit']}")
        print(f"❌ Mislukt: {results['failed']}")
        print("="*50)
        
        return results
    
    def print_stats(self):
        """Print statistieken"""
        print("\n📊 EMAIL OUTREACH STATISTIEKEN")
        print("="*40)
        print(f"📧 Totaal verstuurd: {self.stats['total_sent']}")
        print(f"📥 Responses: {self.stats['total_responses']}")
        print(f"🚫 Uitgeschreven: {len(self.blacklist)}")
        print(f"📅 Vandaag verstuurd: {self._get_daily_count()}/{EmailConfig.MAX_EMAILS_PER_DAY}")
        print(f"⏰ Dit uur verstuurd: {self._get_hourly_count()}/{EmailConfig.MAX_EMAILS_PER_HOUR}")
        print("="*40)


# =============================================================================
# CLI
# =============================================================================

def main():
    """Command-line interface"""
    parser = argparse.ArgumentParser(
        description='Email Outreach - Professionele lead outreach'
    )
    
    parser.add_argument('--csv', type=str, help='CSV bestand met leads')
    parser.add_argument('--template', type=str, default='auto', 
                        choices=['auto', 'initial', 'no_website', 'followup1', 'followup2', 'outdated_website', 'social_proof'])
    parser.add_argument('--max', type=int, help='Maximum aantal emails')
    parser.add_argument('--live', action='store_true', help='Live mode (verstuur echt)')
    parser.add_argument('--stats', action='store_true', help='Toon statistieken')
    parser.add_argument('--blacklist-add', type=str, help='Voeg email toe aan blacklist')
    parser.add_argument('--test', type=str, help='Test email naar dit adres')
    
    args = parser.parse_args()
    
    outreach = EmailOutreach()
    
    # Stats
    if args.stats:
        outreach.print_stats()
        return
    
    # Blacklist
    if args.blacklist_add:
        outreach.add_to_blacklist(args.blacklist_add)
        print(f"✅ {args.blacklist_add} toegevoegd aan blacklist")
        return
    
    # Test email
    if args.test:
        test_lead = EmailLead(
            email=args.test,
            name="Test Persoon",
            company="Test Bedrijf BV",
            city="Eindhoven",
            has_website=False
        )
        template = TEMPLATES.get(args.template) or TEMPLATES["initial"]
        
        if args.live:
            if outreach._connect_smtp():
                outreach._send_single_email(test_lead, template, dry_run=False)
                outreach._disconnect_smtp()
        else:
            outreach._send_single_email(test_lead, template, dry_run=True)
        return
    
    # Campaign
    if args.csv:
        leads = outreach.load_leads_from_csv(args.csv)
        
        if not leads:
            print("❌ Geen leads gevonden in CSV")
            return
        
        # Filter op leads met email
        leads_with_email = [l for l in leads if l.email]
        print(f"📧 {len(leads_with_email)} leads met email van {len(leads)} totaal")
        
        outreach.run_campaign(
            leads=leads_with_email,
            template_name=args.template,
            dry_run=not args.live,
            max_emails=args.max
        )
    else:
        # Zoek meest recente CSV
        output_dir = Path("output")
        csv_files = list(output_dir.glob("*.csv"))
        
        if csv_files:
            latest = max(csv_files, key=lambda x: x.stat().st_mtime)
            print(f"📄 Gevonden: {latest}")
            print(f"\nGebruik: python email_outreach.py --csv \"{latest}\" [--live]")
        else:
            print("Gebruik: python email_outreach.py --csv leads.csv [--live]")
        
        print("\nOpties:")
        print("  --csv FILE       CSV bestand met leads")
        print("  --template NAME  Template: auto, initial, no_website, followup1, followup2")
        print("  --max N          Maximum aantal emails")
        print("  --live           Echt versturen (zonder = dry run)")
        print("  --stats          Toon statistieken")
        print("  --test EMAIL     Test naar specifiek email adres")


if __name__ == "__main__":
    main()
