"""
Email Scheduler v2.0 - Spam-Resistente Email Strategie
Gebaseerd op bewezen data van 3.2M+ emails en enterprise-grade systemen

Features:
- 30-dag warmup protocol (Instantly.ai model)
- Portfolio-based inbox rotatie (Primed/Ramping/Resting pools)
- 3-level circuit breakers (Warning/Pause/Emergency)
- Email verificatie pipeline
- Plain text optimalisatie (+21% open rate)
- Gmail/Yahoo 2025-2026 compliance
- Real-time reputatie scoring

Bronnen: Instantly.ai, Smartlead, Mailshake, Gmail/Yahoo requirements 2025-2026

Author: Ro-Tech Development
"""

import json
import time
import random
import logging
import re
import hashlib
import socket
from datetime import datetime, timedelta
from pathlib import Path
from typing import List, Dict, Optional, Tuple, Set
from dataclasses import dataclass, asdict, field
from enum import Enum
import sys
import os

# Fix Windows encoding
if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    except AttributeError:
        pass

from email_outreach import EmailOutreach, TEMPLATES, EmailConfig

# Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('email_scheduler.log', encoding='utf-8'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)


# =============================================================================
# CIRCUIT BREAKER LEVELS
# =============================================================================

class CircuitLevel(Enum):
    """Circuit breaker niveaus"""
    GREEN = "green"       # Alles OK
    WARNING = "warning"   # Verlaag volume 50%
    PAUSE = "pause"       # Stop 24u
    EMERGENCY = "emergency"  # Stop 72u+, handmatige review


class InboxPool(Enum):
    """Inbox pool types voor rotatie"""
    PRIMED = "primed"     # Gezond, actief versturen
    RAMPING = "ramping"   # Nieuw, aan het opwarmen
    RESTING = "resting"   # Herstellend, niet versturen


# =============================================================================
# SCHEDULER CONFIGURATIE
# =============================================================================

class WarmupPhase(Enum):
    """Warm-up fases met bijbehorende limieten"""
    WEEK_1 = "week_1"      # 5-10 emails/dag
    WEEK_2 = "week_2"      # 10-15 emails/dag
    WEEK_3 = "week_3"      # 15-25 emails/dag
    WEEK_4 = "week_4"      # 25-35 emails/dag
    WEEK_5 = "week_5"      # 35-45 emails/dag
    WEEK_6_PLUS = "week_6_plus"  # 50 emails/dag (max)


@dataclass
class SchedulerConfig:
    """
    Scheduler configuratie gebaseerd op bewezen enterprise data
    Bronnen: Instantly.ai, Smartlead Blueprint, Gmail/Yahoo 2025-2026
    """
    
    # === WARM-UP LIMIETEN (Instantly.ai 30-dag model) ===
    WARMUP_LIMITS = {
        WarmupPhase.WEEK_1: {"min": 5, "max": 10, "per_hour": 3, "cold_ratio": 0.0},
        WarmupPhase.WEEK_2: {"min": 10, "max": 15, "per_hour": 5, "cold_ratio": 0.2},
        WarmupPhase.WEEK_3: {"min": 15, "max": 25, "per_hour": 8, "cold_ratio": 0.5},
        WarmupPhase.WEEK_4: {"min": 25, "max": 35, "per_hour": 12, "cold_ratio": 0.8},
        WarmupPhase.WEEK_5: {"min": 35, "max": 45, "per_hour": 15, "cold_ratio": 0.9},
        WarmupPhase.WEEK_6_PLUS: {"min": 45, "max": 50, "per_hour": 20, "cold_ratio": 1.0},
    }
    
    # === OPTIMALE VERZENDTIJDEN (Bewezen data) ===
    OPTIMAL_DAYS = [1, 2, 3]      # Dinsdag, Woensdag, Donderdag (hoogste opens)
    ACCEPTABLE_DAYS = [0, 4]      # Maandag, Vrijdag
    AVOID_DAYS = [5, 6]           # Weekend (NOOIT versturen)
    
    # Tijdvensters met gewichten
    SEND_WINDOWS = {
        "prime_morning": {"hours": (9, 11), "weight": 1.0},   # Beste tijd
        "post_lunch": {"hours": (13, 14), "weight": 0.9},     # Tweede beste
        "afternoon": {"hours": (14, 17), "weight": 0.7},      # Acceptabel
    }
    AVOID_HOURS = list(range(0, 9)) + list(range(17, 24))     # Niet versturen
    LUNCH_HOUR = 12  # Skip 12:00-13:00
    
    # === CIRCUIT BREAKER LIMIETEN (Gmail/Yahoo 2025-2026) ===
    # Level 1: WARNING
    WARNING_BOUNCE_RATE = 0.015      # 1.5% - verlaag volume
    WARNING_OPEN_RATE = 0.20         # <20% - check content
    
    # Level 2: PAUSE
    PAUSE_BOUNCE_RATE = 0.03         # 3% - stop 24u
    PAUSE_BOUNCES_ABSOLUTE = 3       # 3 bounces in 24u
    PAUSE_COMPLAINTS = 1             # 1 complaint = stop
    PAUSE_DURATION_HOURS = 24
    
    # Level 3: EMERGENCY
    EMERGENCY_BOUNCE_RATE = 0.05     # 5% - stop 72u+
    EMERGENCY_COMPLAINTS = 2         # 2+ complaints
    EMERGENCY_DURATION_HOURS = 72
    
    # Gmail hard limit (>0.3% = permanent rejection)
    GMAIL_COMPLAINT_LIMIT = 0.003    # 0.3% absolute max
    
    # === DELAY STRATEGIE (Voorkom patroon detectie) ===
    # Delays variëren per warmup fase
    DELAY_BY_PHASE = {
        WarmupPhase.WEEK_1: {"min": 90, "max": 180},
        WarmupPhase.WEEK_2: {"min": 75, "max": 150},
        WarmupPhase.WEEK_3: {"min": 60, "max": 120},
        WarmupPhase.WEEK_4: {"min": 50, "max": 100},
        WarmupPhase.WEEK_5: {"min": 45, "max": 90},
        WarmupPhase.WEEK_6_PLUS: {"min": 45, "max": 90},
    }
    
    # Extra pauzes voor natuurlijk gedrag
    BATCH_SIZE = 10                  # Elke 10 emails
    BATCH_PAUSE_MIN = 180            # 3-5 min pauze
    BATCH_PAUSE_MAX = 300
    
    # === EMAIL VERIFICATIE ===
    RISKY_PROVIDERS = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "live.nl"]
    ROLE_BASED_PREFIXES = ["info", "admin", "support", "contact", "sales", "help", "service"]
    SPAM_TRAP_INDICATORS = ["test", "spam", "abuse", "postmaster", "mailer-daemon"]
    
    # === INBOX ROTATIE ===
    MAX_EMAILS_PER_INBOX = 50        # Absoluut maximum per dag
    INBOX_UTILIZATION_CAP = 0.5      # Max 50% via 1 inbox
    REST_PERIOD_HOURS = 48           # Minimum rust na probleem


# =============================================================================
# EMAIL VERIFICATIE
# =============================================================================

class EmailVerifier:
    """
    Email verificatie pipeline - voorkomt bounces en beschermt reputatie
    """
    
    def __init__(self):
        self.verified_cache: Dict[str, Tuple[bool, str]] = {}
        self.domain_cache: Dict[str, bool] = {}
    
    def verify(self, email: str) -> Tuple[bool, str]:
        """
        Volledige email verificatie
        Returns: (is_valid, reason)
        """
        email = email.lower().strip()
        
        # Cache check
        if email in self.verified_cache:
            return self.verified_cache[email]
        
        # Pipeline
        checks = [
            self._check_syntax,
            self._check_typos,
            self._check_role_based,
            self._check_spam_trap,
            self._check_risky_provider,
            self._check_domain_mx,
        ]
        
        for check in checks:
            is_valid, reason = check(email)
            if not is_valid:
                self.verified_cache[email] = (False, reason)
                return False, reason
        
        self.verified_cache[email] = (True, "OK")
        return True, "OK"
    
    def _check_syntax(self, email: str) -> Tuple[bool, str]:
        """Check email syntax"""
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(pattern, email):
            return False, "Invalid syntax"
        return True, ""
    
    def _check_typos(self, email: str) -> Tuple[bool, str]:
        """Check voor bekende typos"""
        typos = {
            "@gmial.com": "@gmail.com",
            "@gmal.com": "@gmail.com",
            "@gamil.com": "@gmail.com",
            "@yaho.com": "@yahoo.com",
            "@yahooo.com": "@yahoo.com",
            "@hotmal.com": "@hotmail.com",
            "@outlok.com": "@outlook.com",
        }
        for typo in typos:
            if typo in email:
                return False, f"Likely typo: {typo}"
        return True, ""
    
    def _check_role_based(self, email: str) -> Tuple[bool, str]:
        """Check voor role-based adressen (hoger bounce risico)"""
        local_part = email.split('@')[0]
        for prefix in SchedulerConfig.ROLE_BASED_PREFIXES:
            if local_part == prefix or local_part.startswith(f"{prefix}."):
                return True, f"Role-based (OK but monitor): {prefix}"  # Waarschuwing maar doorgaan
        return True, ""
    
    def _check_spam_trap(self, email: str) -> Tuple[bool, str]:
        """Check voor mogelijke spam traps"""
        local_part = email.split('@')[0].lower()
        
        # Alleen blokkeren als het EXACT overeenkomt of begint met indicator
        # Dus "test@..." is spam, maar "testbedrijf@..." niet
        for indicator in SchedulerConfig.SPAM_TRAP_INDICATORS:
            # Exact match
            if local_part == indicator:
                return False, f"Possible spam trap: {indicator}"
            # Begint met indicator gevolgd door niet-alfanumeriek (test123@ is ok, test.trap@ niet)
            if local_part.startswith(f"{indicator}@") or local_part.startswith(f"{indicator}."):
                return False, f"Possible spam trap: {indicator}"
        
        return True, ""
    
    def _check_risky_provider(self, email: str) -> Tuple[bool, str]:
        """Markeer risicovolle providers (striktere filters)"""
        domain = email.split('@')[1]
        if domain in SchedulerConfig.RISKY_PROVIDERS:
            return True, f"Risky provider (extra care): {domain}"  # Waarschuwing maar doorgaan
        return True, ""
    
    def _check_domain_mx(self, email: str) -> Tuple[bool, str]:
        """Check of domein MX records heeft"""
        domain = email.split('@')[1]
        
        # Cache check
        if domain in self.domain_cache:
            if not self.domain_cache[domain]:
                return False, "No MX records"
            return True, ""
        
        try:
            import dns.resolver
            mx_records = dns.resolver.resolve(domain, 'MX')
            self.domain_cache[domain] = len(mx_records) > 0
            if not self.domain_cache[domain]:
                return False, "No MX records"
        except ImportError:
            # dns library niet beschikbaar, skip check
            self.domain_cache[domain] = True
        except Exception:
            # DNS lookup failed, markeer als onbekend
            self.domain_cache[domain] = True  # Geef benefit of the doubt
        
        return True, ""
    
    def get_risk_score(self, email: str) -> int:
        """
        Bereken risico score (0-100, lager is beter)
        """
        score = 0
        domain = email.split('@')[1]
        local_part = email.split('@')[0]
        
        # Risky providers
        if domain in SchedulerConfig.RISKY_PROVIDERS:
            score += 20
        
        # Role-based
        for prefix in SchedulerConfig.ROLE_BASED_PREFIXES:
            if local_part == prefix:
                score += 15
                break
        
        # Korte local part (vaak catch-all of fake)
        if len(local_part) < 3:
            score += 25
        
        # Numeriek lokaal deel
        if local_part.isdigit():
            score += 30
        
        return min(100, score)


# =============================================================================
# PLAIN TEXT TEMPLATES (21% hogere open rate - Litmus 2022)
# =============================================================================

PLAIN_TEXT_TEMPLATES = {
    "no_website": {
        "name": "Geen Website - HOT Lead",
        "subject": "$bedrijfsnaam website",
        "body": """Goedendag,

Via Google Maps zag ik dat $bedrijfsnaam in $stad goede reviews heeft. Complimenten!

Wat me opviel: jullie hebben nog geen eigen website. Dat is jammer, want 85% van de mensen zoekt eerst online voordat ze ergens naartoe gaan.

Ik ben Bart, en ik bouw websites voor lokale ondernemers. Simpel, professioneel, betaalbaar.

Tijd voor een kort belletje van 10 min? Vrijblijvend.

Groet,
Bart van Rooij
Ro-Tech Development
06 57 23 55 74

PS: ro-techdevelopment.dev/projecten

---
Geen interesse? Reply "stop"."""
    },
    
    "has_website": {
        "name": "Heeft Website - WARM Lead",
        "subject": "Idee voor $bedrijfsnaam",
        "body": """Hoi,

Via Google Maps zag ik $bedrijfsnaam in $stad. Goede reviews!

Ik keek naar jullie website en zag een paar dingen die beter kunnen. Niet om af te kraken, maar omdat ik denk dat jullie meer klanten eruit kunnen halen.

Ik help ondernemers in $stad met dit soort verbeteringen. Vaak zijn het kleine aanpassingen met groot effect.

Tijd voor een kort gesprek van 10 minuten? Vrijblijvend.

Groet,
Bart van Rooij
Ro-Tech Development
06 57 23 55 74

---
Geen interesse? Reply "stop"."""
    },
    
    "followup_1": {
        "name": "Follow-up 1 - Na 5 dagen",
        "subject": "Kort vraagje",
        "body": """Hoi,

Even een reminder op mijn vorige bericht. Ik snap dat je het druk hebt.

Kort: ik vroeg of je interesse hebt in een gesprek over jullie online zichtbaarheid. 10 minuten, geen verplichtingen.

Interesse? Reply met "ja" en ik bel je.
Geen interesse? Reply met "nee" en ik laat je met rust.

Groet,
Bart

---
Ro-Tech Development | 06 57 23 55 74"""
    },
    
    "followup_2": {
        "name": "Follow-up 2 - Laatste (na 10 dagen)",
        "subject": "Laatste berichtje",
        "body": """Hoi,

Dit is mijn laatste bericht. Geen reactie = geen interesse, en dat is prima.

Mocht je in de toekomst toch hulp nodig hebben met jullie website, dan weet je me te vinden.

Succes met de zaak!

Bart van Rooij
Ro-Tech Development
ro-techdevelopment.dev

---
Dit was mijn laatste bericht."""
    }
}


# =============================================================================
# INBOX MANAGEMENT (Portfolio-based rotatie)
# =============================================================================

@dataclass
class InboxAccount:
    """Een email inbox account voor rotatie"""
    email: str
    pool: str = "ramping"  # primed, ramping, resting
    created_date: str = ""
    last_used: str = ""
    today_sent: int = 0
    total_sent: int = 0
    total_bounces: int = 0
    total_complaints: int = 0
    health_score: int = 100
    is_active: bool = True
    rest_until: str = ""
    
    def __post_init__(self):
        if not self.created_date:
            self.created_date = datetime.now().isoformat()
    
    def get_bounce_rate(self) -> float:
        if self.total_sent == 0:
            return 0.0
        return self.total_bounces / self.total_sent
    
    def should_rest(self) -> bool:
        """Check of inbox moet rusten"""
        if self.get_bounce_rate() > 0.02:
            return True
        if self.total_complaints > 0:
            return True
        if self.health_score < 70:
            return True
        return False


class InboxRotator:
    """
    Portfolio-based inbox rotatie systeem
    Verdeelt emails over meerdere inboxen voor betere deliverability
    """
    
    DATA_FILE = Path("data") / "inbox_accounts.json"
    
    def __init__(self):
        self.accounts: List[InboxAccount] = self._load_accounts()
    
    def _load_accounts(self) -> List[InboxAccount]:
        """Laad inbox accounts"""
        if self.DATA_FILE.exists():
            try:
                with open(self.DATA_FILE, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    return [InboxAccount(**acc) for acc in data]
            except Exception as e:
                logger.warning(f"Kon inbox accounts niet laden: {e}")
        return []
    
    def _save_accounts(self):
        """Sla inbox accounts op"""
        self.DATA_FILE.parent.mkdir(parents=True, exist_ok=True)
        with open(self.DATA_FILE, 'w', encoding='utf-8') as f:
            data = [asdict(acc) for acc in self.accounts]
            json.dump(data, f, indent=2, ensure_ascii=False)
    
    def add_account(self, email: str, pool: str = "ramping") -> InboxAccount:
        """Voeg nieuwe inbox toe"""
        account = InboxAccount(email=email, pool=pool)
        self.accounts.append(account)
        self._save_accounts()
        logger.info(f"Inbox toegevoegd: {email} (pool: {pool})")
        return account
    
    def get_next_inbox(self) -> Optional[InboxAccount]:
        """
        Haal volgende beschikbare inbox voor verzending
        Gebruikt gewogen selectie op basis van health en gebruik
        """
        available = [
            acc for acc in self.accounts
            if acc.is_active 
            and acc.pool in ["primed", "ramping"]
            and acc.today_sent < SchedulerConfig.MAX_EMAILS_PER_INBOX
            and not self._is_resting(acc)
        ]
        
        if not available:
            return None
        
        # Gewogen selectie: voorkeur voor gezondere inboxen met minder gebruik vandaag
        def score(acc: InboxAccount) -> float:
            health_weight = acc.health_score / 100
            usage_weight = 1 - (acc.today_sent / SchedulerConfig.MAX_EMAILS_PER_INBOX)
            pool_weight = 1.0 if acc.pool == "primed" else 0.7
            return health_weight * usage_weight * pool_weight
        
        available.sort(key=score, reverse=True)
        return available[0]
    
    def _is_resting(self, account: InboxAccount) -> bool:
        """Check of inbox in rust modus is"""
        if not account.rest_until:
            return False
        rest_end = datetime.fromisoformat(account.rest_until)
        return datetime.now() < rest_end
    
    def record_send(self, email: str):
        """Registreer verzending voor inbox"""
        for acc in self.accounts:
            if acc.email == email:
                acc.today_sent += 1
                acc.total_sent += 1
                acc.last_used = datetime.now().isoformat()
                self._save_accounts()
                break
    
    def record_bounce(self, email: str):
        """Registreer bounce voor inbox"""
        for acc in self.accounts:
            if acc.email == email:
                acc.total_bounces += 1
                acc.health_score = max(0, acc.health_score - 10)
                
                # Check of inbox moet rusten
                if acc.should_rest():
                    self._move_to_resting(acc)
                
                self._save_accounts()
                break
    
    def record_complaint(self, email: str):
        """Registreer complaint voor inbox"""
        for acc in self.accounts:
            if acc.email == email:
                acc.total_complaints += 1
                acc.health_score = max(0, acc.health_score - 30)
                self._move_to_resting(acc)
                self._save_accounts()
                logger.warning(f"Inbox naar resting pool na complaint: {email}")
                break
    
    def _move_to_resting(self, account: InboxAccount):
        """Verplaats inbox naar resting pool"""
        account.pool = "resting"
        account.rest_until = (
            datetime.now() + timedelta(hours=SchedulerConfig.REST_PERIOD_HOURS)
        ).isoformat()
    
    def reset_daily_counts(self):
        """Reset dagelijkse tellers"""
        for acc in self.accounts:
            acc.today_sent = 0
        self._save_accounts()
    
    def update_pools(self):
        """Update inbox pools op basis van status"""
        for acc in self.accounts:
            # Resting → Ramping check
            if acc.pool == "resting" and not self._is_resting(acc):
                if acc.health_score >= 70:
                    acc.pool = "ramping"
                    logger.info(f"Inbox terug naar ramping: {acc.email}")
            
            # Ramping → Primed check
            if acc.pool == "ramping":
                created = datetime.fromisoformat(acc.created_date)
                days_old = (datetime.now() - created).days
                if days_old >= 14 and acc.health_score >= 85 and acc.get_bounce_rate() < 0.01:
                    acc.pool = "primed"
                    logger.info(f"Inbox gepromoveerd naar primed: {acc.email}")
        
        self._save_accounts()
    
    def get_status(self) -> Dict:
        """Haal inbox pool status"""
        return {
            "primed": [acc.email for acc in self.accounts if acc.pool == "primed"],
            "ramping": [acc.email for acc in self.accounts if acc.pool == "ramping"],
            "resting": [acc.email for acc in self.accounts if acc.pool == "resting"],
            "total_capacity": len([
                acc for acc in self.accounts 
                if acc.pool in ["primed", "ramping"] and acc.is_active
            ]) * SchedulerConfig.MAX_EMAILS_PER_INBOX
        }


@dataclass
class ScheduledEmail:
    """Een gepland email item"""
    lead_id: str
    email: str
    bedrijfsnaam: str
    stad: str
    template_key: str
    scheduled_time: str  # ISO format
    status: str = "pending"  # pending, sent, failed, cancelled
    attempts: int = 0
    last_error: str = ""
    created_at: str = ""
    sent_at: str = ""
    
    def __post_init__(self):
        if not self.created_at:
            self.created_at = datetime.now().isoformat()


@dataclass
class SchedulerStats:
    """Scheduler statistieken voor monitoring en circuit breakers"""
    warmup_start_date: str = ""
    current_phase: str = "week_1"
    total_scheduled: int = 0
    total_sent: int = 0
    total_failed: int = 0
    total_bounces: int = 0
    total_complaints: int = 0
    today_sent: int = 0
    today_bounces: int = 0
    today_complaints: int = 0
    today_opens: int = 0
    today_replies: int = 0
    
    # Circuit breaker state
    circuit_level: str = "green"  # green, warning, pause, emergency
    is_paused: bool = False
    pause_reason: str = ""
    pause_until: str = ""
    last_sent_at: str = ""
    
    # Hourly tracking voor rate limiting
    hourly_sent: Dict = None
    
    # Response tracking
    total_opens: int = 0
    total_replies: int = 0
    total_unsubscribes: int = 0
    daily_history: Dict = None
    
    def __post_init__(self):
        if self.daily_history is None:
            self.daily_history = {}


# =============================================================================
# EMAIL SCHEDULER ENGINE
# =============================================================================

class EmailScheduler:
    """
    Spam-Resistente Email Scheduler v2.0
    
    Features:
    - 3-level circuit breakers (WARNING/PAUSE/EMERGENCY)
    - Email verificatie pipeline
    - Portfolio-based inbox rotatie
    - Plain text optimalisatie
    - Gmail/Yahoo 2025-2026 compliance
    """
    
    DATA_DIR = Path("data")
    SCHEDULE_FILE = DATA_DIR / "email_schedule.json"
    SCHEDULER_STATS_FILE = DATA_DIR / "scheduler_stats.json"
    REPUTATION_FILE = DATA_DIR / "domain_reputation.json"
    
    def __init__(self):
        """Initialiseer scheduler met alle beschermingsmechanismen"""
        self._setup_storage()
        self.config = SchedulerConfig()
        self.stats = self._load_stats()
        self.schedule = self._load_schedule()
        self.reputation = self._load_reputation()
        self.outreach = EmailOutreach()
        
        # Nieuwe componenten v2.0
        self.verifier = EmailVerifier()
        self.inbox_rotator = InboxRotator()
        self.emails_sent_this_batch = 0
        
        # Initialize warmup start if not set
        if not self.stats.warmup_start_date:
            self.stats.warmup_start_date = datetime.now().isoformat()
            self._save_stats()
        
        # Update inbox pools
        self.inbox_rotator.update_pools()
        
        # Check nieuwe dag
        self._check_new_day()
        
        logger.info(f"Scheduler v2.0 gestart - Fase: {self.stats.current_phase}, Circuit: {self.stats.circuit_level}")
    
    def _check_new_day(self):
        """Check of het een nieuwe dag is en reset counters"""
        today = datetime.now().strftime('%Y-%m-%d')
        if self.stats.last_sent_at:
            last_date = self.stats.last_sent_at[:10]
            if last_date != today:
                self.stats.today_sent = 0
                self.stats.today_bounces = 0
                self.stats.today_complaints = 0
                self.stats.today_opens = 0
                self.stats.today_replies = 0
                self.stats.hourly_sent = {}
                self.inbox_rotator.reset_daily_counts()
                self._save_stats()
                logger.info("Nieuwe dag - counters gereset")
    
    def _setup_storage(self):
        """Maak directories"""
        self.DATA_DIR.mkdir(parents=True, exist_ok=True)
    
    def _load_stats(self) -> SchedulerStats:
        """Laad scheduler statistieken"""
        if self.SCHEDULER_STATS_FILE.exists():
            try:
                with open(self.SCHEDULER_STATS_FILE, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    return SchedulerStats(**data)
            except Exception as e:
                logger.warning(f"Kon scheduler stats niet laden: {e}")
        return SchedulerStats()
    
    def _save_stats(self):
        """Sla statistieken op"""
        with open(self.SCHEDULER_STATS_FILE, 'w', encoding='utf-8') as f:
            json.dump(asdict(self.stats), f, indent=2, ensure_ascii=False)
    
    def _load_schedule(self) -> List[ScheduledEmail]:
        """Laad geplande emails"""
        if self.SCHEDULE_FILE.exists():
            try:
                with open(self.SCHEDULE_FILE, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    return [ScheduledEmail(**item) for item in data]
            except Exception as e:
                logger.warning(f"Kon schedule niet laden: {e}")
        return []
    
    def _save_schedule(self):
        """Sla schedule op"""
        with open(self.SCHEDULE_FILE, 'w', encoding='utf-8') as f:
            data = [asdict(item) for item in self.schedule]
            json.dump(data, f, indent=2, ensure_ascii=False)
    
    def _load_reputation(self) -> Dict:
        """Laad domein reputatie data"""
        if self.REPUTATION_FILE.exists():
            try:
                with open(self.REPUTATION_FILE, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except Exception as e:
                logger.warning(f"Kon reputation niet laden: {e}")
        return {
            "score": 100,  # Start met perfect score
            "events": [],
            "daily_metrics": {}
        }
    
    def _save_reputation(self):
        """Sla reputatie op"""
        with open(self.REPUTATION_FILE, 'w', encoding='utf-8') as f:
            json.dump(self.reputation, f, indent=2, ensure_ascii=False)
    
    # =========================================================================
    # WARM-UP FASE MANAGEMENT
    # =========================================================================
    
    def get_current_phase(self) -> WarmupPhase:
        """Bepaal huidige warm-up fase op basis van startdatum"""
        if not self.stats.warmup_start_date:
            return WarmupPhase.WEEK_1
        
        start = datetime.fromisoformat(self.stats.warmup_start_date)
        days_since_start = (datetime.now() - start).days
        weeks = days_since_start // 7
        
        if weeks < 1:
            return WarmupPhase.WEEK_1
        elif weeks < 2:
            return WarmupPhase.WEEK_2
        elif weeks < 3:
            return WarmupPhase.WEEK_3
        elif weeks < 4:
            return WarmupPhase.WEEK_4
        elif weeks < 5:
            return WarmupPhase.WEEK_5
        else:
            return WarmupPhase.WEEK_6_PLUS
    
    def get_daily_limit(self) -> Tuple[int, int]:
        """Haal min/max emails per dag voor huidige fase"""
        phase = self.get_current_phase()
        limits = self.config.WARMUP_LIMITS[phase]
        return limits["min"], limits["max"]
    
    def get_hourly_limit(self) -> int:
        """Haal max emails per uur voor huidige fase"""
        phase = self.get_current_phase()
        return self.config.WARMUP_LIMITS[phase]["per_hour"]
    
    def get_smart_daily_target(self) -> int:
        """
        Bepaal slim dagelijks target op basis van:
        - Huidige fase
        - Dag van de week
        - Reputatie score
        """
        min_emails, max_emails = self.get_daily_limit()
        day_of_week = datetime.now().weekday()
        
        # Basis target
        target = (min_emails + max_emails) // 2
        
        # Verhoog op optimale dagen
        if day_of_week in self.config.OPTIMAL_DAYS:
            target = max_emails
        elif day_of_week in self.config.ACCEPTABLE_DAYS:
            target = (min_emails + max_emails) // 2
        else:
            # Weekend - stuur niet
            target = 0
        
        # Verlaag bij slechte reputatie
        rep_score = self.reputation.get("score", 100)
        if rep_score < 80:
            target = int(target * 0.7)
        elif rep_score < 90:
            target = int(target * 0.85)
        
        return target
    
    # =========================================================================
    # 3-LEVEL CIRCUIT BREAKERS
    # =========================================================================
    
    def check_circuit_breaker(self) -> CircuitLevel:
        """
        Evalueer circuit breaker status op basis van metrics
        Returns huidige circuit level
        """
        # Level 3: EMERGENCY (hoogste prioriteit)
        if self.stats.today_complaints >= SchedulerConfig.EMERGENCY_COMPLAINTS:
            return self._trip_circuit(CircuitLevel.EMERGENCY, 
                f"{self.stats.today_complaints} complaints vandaag")
        
        if self.stats.today_sent > 10:
            bounce_rate = self.stats.today_bounces / self.stats.today_sent
            if bounce_rate >= SchedulerConfig.EMERGENCY_BOUNCE_RATE:
                return self._trip_circuit(CircuitLevel.EMERGENCY,
                    f"Bounce rate {bounce_rate:.1%} (>5%)")
        
        # Level 2: PAUSE
        if self.stats.today_complaints >= SchedulerConfig.PAUSE_COMPLAINTS:
            return self._trip_circuit(CircuitLevel.PAUSE,
                "Spam complaint ontvangen")
        
        if self.stats.today_bounces >= SchedulerConfig.PAUSE_BOUNCES_ABSOLUTE:
            return self._trip_circuit(CircuitLevel.PAUSE,
                f"{self.stats.today_bounces} bounces vandaag")
        
        if self.stats.today_sent > 10:
            bounce_rate = self.stats.today_bounces / self.stats.today_sent
            if bounce_rate >= SchedulerConfig.PAUSE_BOUNCE_RATE:
                return self._trip_circuit(CircuitLevel.PAUSE,
                    f"Bounce rate {bounce_rate:.1%} (>3%)")
        
        # Level 1: WARNING
        if self.stats.today_sent > 10:
            bounce_rate = self.stats.today_bounces / self.stats.today_sent
            if bounce_rate >= SchedulerConfig.WARNING_BOUNCE_RATE:
                self.stats.circuit_level = CircuitLevel.WARNING.value
                self._save_stats()
                return CircuitLevel.WARNING
            
            # Open rate check
            if self.stats.today_opens > 0:
                open_rate = self.stats.today_opens / self.stats.today_sent
                if open_rate < SchedulerConfig.WARNING_OPEN_RATE:
                    self.stats.circuit_level = CircuitLevel.WARNING.value
                    return CircuitLevel.WARNING
        
        # Reputatie check
        rep_score = self.reputation.get("score", 100)
        if rep_score < 70:
            return self._trip_circuit(CircuitLevel.PAUSE,
                f"Reputatie score te laag: {rep_score}")
        elif rep_score < 85:
            self.stats.circuit_level = CircuitLevel.WARNING.value
            return CircuitLevel.WARNING
        
        # All clear
        self.stats.circuit_level = CircuitLevel.GREEN.value
        return CircuitLevel.GREEN
    
    def _trip_circuit(self, level: CircuitLevel, reason: str) -> CircuitLevel:
        """Activeer circuit breaker op gegeven level"""
        self.stats.circuit_level = level.value
        self.stats.is_paused = True
        self.stats.pause_reason = reason
        
        # Bepaal pause duur
        if level == CircuitLevel.EMERGENCY:
            duration = SchedulerConfig.EMERGENCY_DURATION_HOURS
        else:
            duration = SchedulerConfig.PAUSE_DURATION_HOURS
        
        self.stats.pause_until = (
            datetime.now() + timedelta(hours=duration)
        ).isoformat()
        
        self._save_stats()
        self._record_reputation_event(f"circuit_{level.value}", reason, -10)
        
        # Notify inbox rotator
        # (mark current inbox for resting if we have one)
        
        logger.warning(f"CIRCUIT BREAKER {level.value.upper()}: {reason}")
        self._print_circuit_alert(level, reason, duration)
        
        return level
    
    def _print_circuit_alert(self, level: CircuitLevel, reason: str, hours: int):
        """Print circuit breaker alert"""
        symbols = {
            CircuitLevel.WARNING: "⚠️",
            CircuitLevel.PAUSE: "🛑", 
            CircuitLevel.EMERGENCY: "🚨"
        }
        print(f"\n{'='*60}")
        print(f"{symbols.get(level, '!')} CIRCUIT BREAKER: {level.value.upper()}")
        print(f"{'='*60}")
        print(f"Reden: {reason}")
        print(f"Actie: {'Volume -50%' if level == CircuitLevel.WARNING else f'STOP {hours}u'}")
        print(f"Hervat: {self.stats.pause_until if level != CircuitLevel.WARNING else 'Direct met lagere volume'}")
        print(f"{'='*60}\n")
    
    def check_health(self) -> Tuple[bool, str, List[str]]:
        """
        Complete health check met circuit breakers
        Returns: (can_send, status, warnings)
        """
        warnings = []
        
        # Check pause status
        if self.stats.is_paused:
            if self.stats.pause_until:
                pause_end = datetime.fromisoformat(self.stats.pause_until)
                if datetime.now() < pause_end:
                    hours_left = (pause_end - datetime.now()).seconds // 3600
                    return False, f"GEPAUZEERD: {self.stats.pause_reason} ({hours_left}u resterend)", []
                else:
                    self.resume()
        
        # Check circuit breaker
        circuit = self.check_circuit_breaker()
        
        if circuit == CircuitLevel.EMERGENCY:
            return False, f"EMERGENCY STOP: {self.stats.pause_reason}", []
        
        if circuit == CircuitLevel.PAUSE:
            return False, f"PAUSED: {self.stats.pause_reason}", []
        
        if circuit == CircuitLevel.WARNING:
            warnings.append(f"WARNING: Volume verlaagd met 50%")
        
        # Timing checks
        hour = datetime.now().hour
        day = datetime.now().weekday()
        
        if day in SchedulerConfig.AVOID_DAYS:
            return False, "Weekend - geen verzending", ["Weekend mode"]
        
        if hour in SchedulerConfig.AVOID_HOURS:
            warnings.append(f"Buiten optimale uren ({hour}:00)")
        
        if hour == SchedulerConfig.LUNCH_HOUR:
            warnings.append("Lunch uur - even wachten")
        
        # Inbox pool check
        inbox_status = self.inbox_rotator.get_status()
        if inbox_status["total_capacity"] == 0:
            return False, "Geen actieve inboxen beschikbaar", ["Alle inboxen in rust of vol"]
        
        status = "GEZOND" if not warnings else "WAARSCHUWINGEN"
        return True, status, warnings
    
    def resume(self):
        """Hervat scheduler na pause"""
        self.stats.is_paused = False
        self.stats.pause_reason = ""
        self.stats.pause_until = ""
        self.stats.circuit_level = CircuitLevel.GREEN.value
        self._save_stats()
        logger.info("Scheduler hervat - Circuit GROEN")
    
    def record_bounce(self, email: str, inbox_used: str = None):
        """Registreer een bounce met circuit breaker check"""
        self.stats.total_bounces += 1
        self.stats.today_bounces += 1
        self._save_stats()
        
        self._record_reputation_event("bounce", email, -5)
        
        # Update inbox rotator als we weten welke inbox gebruikt is
        if inbox_used:
            self.inbox_rotator.record_bounce(inbox_used)
        
        logger.warning(f"BOUNCE: {email}")
        
        # Trigger circuit breaker check
        self.check_circuit_breaker()
    
    def record_complaint(self, email: str, inbox_used: str = None):
        """Registreer spam complaint - CRITICAL"""
        self.stats.total_complaints += 1
        self.stats.today_complaints += 1
        self._save_stats()
        
        self._record_reputation_event("complaint", email, -25)
        
        # Update inbox rotator
        if inbox_used:
            self.inbox_rotator.record_complaint(inbox_used)
        
        # Add to blacklist permanently
        self.outreach.add_to_blacklist(email)
        
        logger.error(f"SPAM COMPLAINT: {email}")
        
        # Trigger circuit breaker
        self.check_circuit_breaker()
    
    def _record_reputation_event(self, event_type: str, details: str, score_change: int = 0):
        """Registreer reputatie event"""
        event = {
            "timestamp": datetime.now().isoformat(),
            "type": event_type,
            "details": details,
            "score_change": score_change
        }
        
        self.reputation["events"].append(event)
        self.reputation["score"] = max(0, min(100, 
            self.reputation.get("score", 100) + score_change
        ))
        
        # Houd alleen laatste 100 events
        if len(self.reputation["events"]) > 100:
            self.reputation["events"] = self.reputation["events"][-100:]
        
        self._save_reputation()
    
    def record_success(self, email: str):
        """Registreer succesvolle verzending"""
        self.stats.total_sent += 1
        self.stats.today_sent += 1
        self.stats.last_sent_at = datetime.now().isoformat()
        
        # Record in daily history
        today = datetime.now().strftime('%Y-%m-%d')
        if today not in self.stats.daily_history:
            self.stats.daily_history[today] = {"sent": 0, "bounces": 0, "complaints": 0}
        self.stats.daily_history[today]["sent"] += 1
        
        self._save_stats()
        
        # Kleine reputatie boost bij succesvolle emails
        if self.stats.total_sent % 10 == 0:
            self._record_reputation_event("success_batch", f"10 emails succesvol", +1)
    
    # =========================================================================
    # SCHEDULING
    # =========================================================================
    
    def schedule_email(
        self,
        lead_id: str,
        email: str,
        bedrijfsnaam: str,
        stad: str,
        template_key: str = "no_website",
        preferred_date: Optional[datetime] = None
    ) -> Optional[ScheduledEmail]:
        """
        Plan een email in met optimale timing
        """
        # Check blacklist
        if self.outreach.is_blacklisted(email):
            logger.info(f"Email overgeslagen (blacklist): {email}")
            return None
        
        # Check of al gepland
        for scheduled in self.schedule:
            if scheduled.email.lower() == email.lower() and scheduled.status == "pending":
                logger.info(f"Email al gepland: {email}")
                return None
        
        # Bepaal optimale tijd
        if preferred_date:
            scheduled_time = self._optimize_time(preferred_date)
        else:
            scheduled_time = self._find_next_slot()
        
        # Maak scheduled email
        scheduled_email = ScheduledEmail(
            lead_id=lead_id,
            email=email,
            bedrijfsnaam=bedrijfsnaam,
            stad=stad,
            template_key=template_key,
            scheduled_time=scheduled_time.isoformat()
        )
        
        self.schedule.append(scheduled_email)
        self.stats.total_scheduled += 1
        self._save_schedule()
        self._save_stats()
        
        logger.info(f"Email gepland: {email} voor {scheduled_time}")
        return scheduled_email
    
    def schedule_leads_batch(
        self,
        leads: List[Dict],
        template_key: str = "no_website"
    ) -> int:
        """Plan een batch leads in met gespreide timing"""
        scheduled_count = 0
        
        for lead in leads:
            email = lead.get("email", "")
            if not email or '@' not in email:
                continue
            
            result = self.schedule_email(
                lead_id=lead.get("id", email),
                email=email,
                bedrijfsnaam=lead.get("title", lead.get("bedrijfsnaam", "")),
                stad=lead.get("city", lead.get("stad", "")),
                template_key=template_key
            )
            
            if result:
                scheduled_count += 1
        
        logger.info(f"Batch gepland: {scheduled_count} van {len(leads)} leads")
        return scheduled_count
    
    def _find_next_slot(self) -> datetime:
        """Vind volgende beschikbare slot"""
        now = datetime.now()
        
        # Start met nu of morgen ochtend
        if now.hour >= 17:
            # Na 17:00 - plan voor morgen
            candidate = now.replace(hour=9, minute=0, second=0, microsecond=0) + timedelta(days=1)
        elif now.hour < 9:
            # Voor 09:00 - plan voor vandaag 09:00
            candidate = now.replace(hour=9, minute=0, second=0, microsecond=0)
        else:
            # Tijdens werkuren - plan over 30-60 min
            candidate = now + timedelta(minutes=random.randint(30, 60))
        
        return self._optimize_time(candidate)
    
    def _optimize_time(self, candidate: datetime) -> datetime:
        """Optimaliseer verzendtijd naar beste moment"""
        # Vermijd weekend
        while candidate.weekday() in self.config.AVOID_DAYS:
            candidate += timedelta(days=1)
            candidate = candidate.replace(hour=9, minute=0)
        
        # Optimaliseer uur
        hour = candidate.hour
        
        # Te vroeg
        if hour < 9:
            candidate = candidate.replace(hour=9, minute=random.randint(0, 30))
        # Te laat
        elif hour >= 17:
            candidate = (candidate + timedelta(days=1)).replace(
                hour=9, minute=random.randint(0, 30)
            )
            # Check weekend opnieuw
            while candidate.weekday() in self.config.AVOID_DAYS:
                candidate += timedelta(days=1)
        
        # Voeg random minuten toe (voorkomt detectie van geautomatiseerde emails)
        candidate += timedelta(minutes=random.randint(0, 15))
        
        return candidate
    
    def get_pending_for_now(self) -> List[ScheduledEmail]:
        """Haal emails die nu verstuurd moeten worden"""
        now = datetime.now()
        pending = []
        
        for item in self.schedule:
            if item.status != "pending":
                continue
            
            scheduled = datetime.fromisoformat(item.scheduled_time)
            if scheduled <= now:
                pending.append(item)
        
        return pending
    
    # =========================================================================
    # EXECUTION
    # =========================================================================
    
    def process_queue(self, dry_run: bool = False) -> Dict:
        """
        Verwerk email queue met alle beschermingen
        
        Args:
            dry_run: Test modus zonder echte emails
        
        Returns:
            Dict met resultaten
        """
        results = {
            "processed": 0,
            "sent": 0,
            "failed": 0,
            "skipped": 0,
            "errors": []
        }
        
        # Health check
        is_healthy, status, warnings = self.check_health()
        
        for warning in warnings:
            print(f"⚠️  {warning}")
        
        if not is_healthy:
            print(f"\n❌ {status}")
            results["errors"].append(status)
            return results
        
        # Check dagelijks limiet
        daily_target = self.get_smart_daily_target()
        if self.stats.today_sent >= daily_target:
            msg = f"Dagelijks target bereikt ({self.stats.today_sent}/{daily_target})"
            print(f"✓ {msg}")
            results["errors"].append(msg)
            return results
        
        # Check uurlijks limiet
        hourly_limit = self.get_hourly_limit()
        # We moeten uurlijkse count bijhouden
        
        # Haal pending emails
        pending = self.get_pending_for_now()
        
        if not pending:
            print("Geen emails om nu te versturen")
            return results
        
        # Beperk tot dagelijks limiet
        remaining = daily_target - self.stats.today_sent
        pending = pending[:remaining]
        
        # Verlaag limiet bij WARNING circuit
        if self.stats.circuit_level == CircuitLevel.WARNING.value:
            daily_target = daily_target // 2
            hourly_limit = hourly_limit // 2
            print(f"⚠️  WARNING mode: limieten gehalveerd")
        
        print(f"\n📧 Verwerken: {len(pending)} emails")
        print(f"   Fase: {self.get_current_phase().value}")
        print(f"   Circuit: {self.stats.circuit_level.upper()}")
        print(f"   Vandaag: {self.stats.today_sent}/{daily_target}")
        print(f"   Reputatie: {self.reputation.get('score', 100)}/100")
        print()
        
        self.emails_sent_this_batch = 0
        
        for item in pending:
            results["processed"] += 1
            
            # Rate limiting check
            if results["sent"] >= hourly_limit:
                print(f"⏸️  Uurlijks limiet bereikt ({hourly_limit})")
                break
            
            # === EMAIL VERIFICATIE PIPELINE ===
            is_valid, verify_reason = self.verifier.verify(item.email)
            if not is_valid:
                results["skipped"] += 1
                item.status = "skipped"
                item.last_error = verify_reason
                print(f"  ⊘ Overgeslagen: {item.email} ({verify_reason})")
                continue
            
            # Risk score check
            risk_score = self.verifier.get_risk_score(item.email)
            if risk_score > 50:
                print(f"  ⚠️  Hoog risico ({risk_score}): {item.email}")
            
            try:
                if dry_run:
                    print(f"  [DRY RUN] Zou versturen naar: {item.email} (risk: {risk_score})")
                    results["sent"] += 1
                    continue
                
                # Verstuur email met inbox rotatie
                success = self._send_scheduled_email(item)
                
                if success:
                    results["sent"] += 1
                    self.emails_sent_this_batch += 1
                    item.status = "sent"
                    item.sent_at = datetime.now().isoformat()
                    print(f"  ✓ Verstuurd: {item.bedrijfsnaam} ({item.email})")
                    
                    # Batch pauze elke X emails
                    if self.emails_sent_this_batch % SchedulerConfig.BATCH_SIZE == 0:
                        batch_pause = random.randint(
                            SchedulerConfig.BATCH_PAUSE_MIN,
                            SchedulerConfig.BATCH_PAUSE_MAX
                        )
                        print(f"  ⏸️  Batch pauze: {batch_pause}s")
                        time.sleep(batch_pause)
                else:
                    results["failed"] += 1
                    item.status = "failed"
                    item.attempts += 1
                    print(f"  ✗ Mislukt: {item.bedrijfsnaam}")
                
                # Smart delay tussen emails
                if results["sent"] < len(pending):
                    delay = self._get_smart_delay()
                    time.sleep(delay)
                
                # Check circuit breaker na elke email
                circuit = self.check_circuit_breaker()
                if circuit in [CircuitLevel.PAUSE, CircuitLevel.EMERGENCY]:
                    print(f"\n🛑 Circuit breaker geactiveerd - stoppen")
                    break
                    
            except Exception as e:
                results["failed"] += 1
                item.status = "failed"
                item.last_error = str(e)
                results["errors"].append(f"{item.email}: {str(e)}")
                logger.error(f"Fout bij versturen naar {item.email}: {e}")
        
        # Save updates
        self._save_schedule()
        
        print(f"\n📊 Resultaat: {results['sent']} verstuurd, {results['failed']} mislukt")
        
        return results
    
    def _send_scheduled_email(self, item: ScheduledEmail) -> bool:
        """
        Verstuur een gepland email met plain text optimalisatie
        Plain text heeft 21% hogere open rate (Litmus 2022)
        """
        # Prefereer plain text templates
        plain_template = PLAIN_TEXT_TEMPLATES.get(item.template_key)
        
        if plain_template:
            # Gebruik geoptimaliseerde plain text
            return self._send_plain_text_email(item, plain_template)
        else:
            # Fallback naar originele templates
            template = TEMPLATES.get(item.template_key)
            if not template:
                logger.error(f"Template niet gevonden: {item.template_key}")
                return False
            
            context = {
                "bedrijfsnaam": item.bedrijfsnaam,
                "stad": item.stad,
                "email": item.email,
                "categorie": "",
                "reply_to": EmailConfig.REPLY_TO
            }
            
            success = self.outreach.send_email(
                to_email=item.email,
                template=template,
                personalization=context
            )
            
            if success:
                self.record_success(item.email)
            
            return success
    
    def _send_plain_text_email(self, item: ScheduledEmail, template: Dict) -> bool:
        """Verstuur plain text email (betere deliverability)"""
        from string import Template as StringTemplate
        
        # Personaliseer subject en body
        subject = StringTemplate(template["subject"]).safe_substitute(
            bedrijfsnaam=item.bedrijfsnaam,
            stad=item.stad
        )
        
        body = StringTemplate(template["body"]).safe_substitute(
            bedrijfsnaam=item.bedrijfsnaam,
            stad=item.stad
        )
        
        # Verstuur via outreach engine (plain text only)
        success = self.outreach.send_plain_text(
            to_email=item.email,
            subject=subject,
            body=body
        )
        
        if success:
            self.record_success(item.email)
        
        return success
    
    def _get_smart_delay(self) -> int:
        """
        Bereken slimme delay tussen emails op basis van warmup fase
        Voorkomt patroon detectie door spam filters
        """
        phase = self.get_current_phase()
        
        # Haal fase-specifieke delays
        delays = SchedulerConfig.DELAY_BY_PHASE.get(phase, {"min": 45, "max": 90})
        base_delay = random.randint(delays["min"], delays["max"])
        
        # Voeg random variatie toe (+/- 15%)
        variation = int(base_delay * 0.15)
        final_delay = base_delay + random.randint(-variation, variation)
        
        # Extra delay bij WARNING circuit
        if self.stats.circuit_level == CircuitLevel.WARNING.value:
            final_delay = int(final_delay * 1.5)
        
        return max(30, final_delay)  # Minimum 30 seconden
    
    # =========================================================================
    # STATUS & REPORTING
    # =========================================================================
    
    def get_status(self) -> Dict:
        """Haal complete status"""
        phase = self.get_current_phase()
        min_daily, max_daily = self.get_daily_limit()
        is_healthy, health_status, warnings = self.check_health()
        
        pending_count = len([e for e in self.schedule if e.status == "pending"])
        
        return {
            "phase": phase.value,
            "warmup_day": self._get_warmup_day(),
            "daily_limit": {"min": min_daily, "max": max_daily},
            "hourly_limit": self.get_hourly_limit(),
            "today_sent": self.stats.today_sent,
            "today_remaining": max_daily - self.stats.today_sent,
            "total_sent": self.stats.total_sent,
            "total_bounces": self.stats.total_bounces,
            "total_complaints": self.stats.total_complaints,
            "pending_emails": pending_count,
            "reputation_score": self.reputation.get("score", 100),
            "is_healthy": is_healthy,
            "health_status": health_status,
            "warnings": warnings,
            "is_paused": self.stats.is_paused,
            "pause_reason": self.stats.pause_reason
        }
    
    def _get_warmup_day(self) -> int:
        """Haal dag nummer in warmup"""
        if not self.stats.warmup_start_date:
            return 1
        start = datetime.fromisoformat(self.stats.warmup_start_date)
        return (datetime.now() - start).days + 1
    
    def print_status(self):
        """Print uitgebreide status overview met circuit breaker info"""
        status = self.get_status()
        inbox_status = self.inbox_rotator.get_status()
        
        print("\n" + "="*65)
        print("📧 RO-TECH EMAIL SCHEDULER v2.0 - SPAM-RESISTENTE STRATEGIE")
        print("="*65)
        
        # Circuit breaker indicator
        circuit_symbols = {
            "green": "🟢",
            "warning": "🟡", 
            "pause": "🔴",
            "emergency": "🚨"
        }
        circuit = self.stats.circuit_level
        print(f"Circuit: {circuit_symbols.get(circuit, '?')} {circuit.upper()}", end="")
        
        if status["is_paused"]:
            print(f" - {status['pause_reason']}")
        else:
            print()
        
        print()
        
        # Fase info
        print(f"📅 WARM-UP STATUS")
        print(f"   Fase: {status['phase'].upper()}")
        print(f"   Dag: {status['warmup_day']}")
        cold_ratio = SchedulerConfig.WARMUP_LIMITS.get(
            self.get_current_phase(), {}
        ).get("cold_ratio", 1.0)
        print(f"   Cold email ratio: {int(cold_ratio * 100)}%")
        print()
        
        # Vandaag stats
        bounce_rate = 0
        if self.stats.today_sent > 0:
            bounce_rate = (self.stats.today_bounces / self.stats.today_sent) * 100
        
        print(f"📊 VANDAAG")
        print(f"   Verstuurd: {status['today_sent']}/{status['daily_limit']['max']}")
        print(f"   Bounces: {self.stats.today_bounces} ({bounce_rate:.1f}%)")
        print(f"   Complaints: {self.stats.today_complaints}")
        print()
        
        # Totaal stats
        total_bounce_rate = 0
        if self.stats.total_sent > 0:
            total_bounce_rate = (self.stats.total_bounces / self.stats.total_sent) * 100
        
        print(f"📈 TOTAAL (sinds start)")
        print(f"   Verstuurd: {self.stats.total_sent}")
        print(f"   Bounces: {self.stats.total_bounces} ({total_bounce_rate:.1f}%)")
        print(f"   Complaints: {self.stats.total_complaints}")
        print(f"   Unsubscribes: {self.stats.total_unsubscribes}")
        print()
        
        # Inbox pool status
        print(f"📬 INBOX POOLS")
        print(f"   🟢 Primed: {len(inbox_status['primed'])} inboxen")
        print(f"   🟡 Ramping: {len(inbox_status['ramping'])} inboxen")
        print(f"   🔴 Resting: {len(inbox_status['resting'])} inboxen")
        print(f"   Capaciteit: {inbox_status['total_capacity']} emails/dag")
        print()
        
        # Reputatie en queue
        print(f"🛡️  BESCHERMING")
        print(f"   Reputatie Score: {status['reputation_score']}/100")
        print(f"   Wachtend: {status['pending_emails']} emails")
        
        if status["warnings"]:
            print()
            print("⚠️  Waarschuwingen:")
            for warning in status["warnings"]:
                print(f"   - {warning}")
        
        print("="*60 + "\n")
    
    def reset_daily_stats(self):
        """Reset dagelijkse statistieken (roep aan bij nieuwe dag)"""
        self.stats.today_sent = 0
        self.stats.today_bounces = 0
        self.stats.today_complaints = 0
        self._save_stats()
        logger.info("Dagelijkse stats gereset")


# =============================================================================
# CLI INTERFACE
# =============================================================================

def main():
    """CLI interface voor scheduler"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Email Scheduler - Intelligente warm-up & bescherming')
    parser.add_argument('command', choices=['status', 'process', 'test', 'resume', 'reset'],
                        help='Commando: status, process, test (dry-run), resume, reset')
    parser.add_argument('--leads', type=str, help='JSON bestand met leads om in te plannen')
    
    args = parser.parse_args()
    
    scheduler = EmailScheduler()
    
    if args.command == 'status':
        scheduler.print_status()
    
    elif args.command == 'process':
        scheduler.print_status()
        print("\n🚀 Start verwerking...\n")
        results = scheduler.process_queue(dry_run=False)
        print(f"\nResultaat: {results}")
    
    elif args.command == 'test':
        scheduler.print_status()
        print("\n🧪 Test modus (geen echte emails)...\n")
        results = scheduler.process_queue(dry_run=True)
        print(f"\nResultaat: {results}")
    
    elif args.command == 'resume':
        scheduler.resume()
        print("✅ Scheduler hervat")
        scheduler.print_status()
    
    elif args.command == 'reset':
        scheduler.reset_daily_stats()
        print("✅ Dagelijkse stats gereset")
        scheduler.print_status()
    
    # Load leads if provided
    if args.leads:
        leads_file = Path(args.leads)
        if leads_file.exists():
            with open(leads_file, 'r', encoding='utf-8') as f:
                leads = json.load(f)
            count = scheduler.schedule_leads_batch(leads)
            print(f"✅ {count} leads ingepland")


if __name__ == "__main__":
    main()
