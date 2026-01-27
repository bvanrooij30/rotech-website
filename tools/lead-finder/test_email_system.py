"""
Email System Test Suite v1.0
Volledige validatie van spam-resistente strategie ZONDER risico

BELANGRIJKE TESTS:
1. Email Verificatie Pipeline
2. Circuit Breaker Triggers
3. Inbox Rotatie Logica
4. Rate Limiting
5. Timing Logica
6. Deliverability Check (met externe tools)

Author: Ro-Tech Development
"""

import json
import time
import sys
import os
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Tuple

# Fix encoding
if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    except AttributeError:
        pass


# =============================================================================
# TEST RESULTATEN TRACKING
# =============================================================================

class TestResults:
    """Track test resultaten"""
    def __init__(self):
        self.passed = 0
        self.failed = 0
        self.warnings = 0
        self.results = []
    
    def add_pass(self, test_name: str, details: str = ""):
        self.passed += 1
        self.results.append(("PASS", test_name, details))
        print(f"  ✅ {test_name}")
        if details:
            print(f"     {details}")
    
    def add_fail(self, test_name: str, details: str = ""):
        self.failed += 1
        self.results.append(("FAIL", test_name, details))
        print(f"  ❌ {test_name}")
        if details:
            print(f"     {details}")
    
    def add_warning(self, test_name: str, details: str = ""):
        self.warnings += 1
        self.results.append(("WARN", test_name, details))
        print(f"  ⚠️  {test_name}")
        if details:
            print(f"     {details}")
    
    def summary(self):
        print("\n" + "="*60)
        print("📊 TEST RESULTATEN SAMENVATTING")
        print("="*60)
        print(f"  ✅ Geslaagd: {self.passed}")
        print(f"  ❌ Gefaald:  {self.failed}")
        print(f"  ⚠️  Warnings: {self.warnings}")
        print(f"\n  Totaal: {self.passed + self.failed + self.warnings} tests")
        
        if self.failed == 0:
            print("\n🎉 ALLE KRITIEKE TESTS GESLAAGD!")
            return True
        else:
            print(f"\n❌ {self.failed} TESTS GEFAALD - FIX NODIG")
            return False


# =============================================================================
# TEST 1: EMAIL VERIFICATIE PIPELINE
# =============================================================================

def test_email_verification(results: TestResults):
    """Test de email verificatie pipeline"""
    print("\n" + "-"*60)
    print("🔍 TEST 1: EMAIL VERIFICATIE PIPELINE")
    print("-"*60)
    
    from email_scheduler import EmailVerifier
    verifier = EmailVerifier()
    
    # Test cases: (email, should_pass, description)
    test_cases = [
        # Geldige emails
        ("klant@bedrijf.nl", True, "Normale bedrijfs email"),
        ("jan.jansen@company.com", True, "Naam format email"),
        ("info@lokaal-bedrijf.nl", True, "Lokaal bedrijf"),
        ("sales.team@groot-bedrijf.nl", True, "Team email"),
        
        # Ongeldige syntax
        ("invalidemail", False, "Geen @ teken"),
        ("test@", False, "Geen domein"),
        ("@test.com", False, "Geen lokaal deel"),
        ("", False, "Lege string"),
        
        # Typos (moeten gefilterd worden)
        ("jan@gmial.com", False, "Gmail typo"),
        ("piet@gmal.com", False, "Gmail typo 2"),
        ("kees@hotmal.com", False, "Hotmail typo"),
        ("marie@outlok.com", False, "Outlook typo"),
        
        # Spam traps (moeten gefilterd worden)
        ("test@spam.com", False, "Exact 'test' adres"),
        ("abuse@company.nl", False, "Abuse address"),
        ("postmaster@company.nl", False, "Postmaster"),
        ("spam@bedrijf.nl", False, "Spam adres"),
    ]
    
    for email, should_pass, description in test_cases:
        is_valid, reason = verifier.verify(email)
        
        if should_pass and is_valid:
            results.add_pass(f"Verify: {description}", f"{email} -> OK")
        elif not should_pass and not is_valid:
            results.add_pass(f"Reject: {description}", f"{email} -> Geblokkeerd ({reason})")
        elif should_pass and not is_valid:
            results.add_fail(f"False reject: {description}", f"{email} zou OK moeten zijn, maar: {reason}")
        else:
            results.add_fail(f"False accept: {description}", f"{email} zou geblokkeerd moeten zijn")
    
    # Test risk score
    print("\n  Risk Score Tests:")
    risk_tests = [
        ("ceo@groot-bedrijf.nl", "Laag risico verwacht", 0, 30),
        ("info@gmail.com", "Hoog risico (Gmail + role-based)", 30, 100),
        ("a@test.nl", "Hoog risico (kort lokaal deel)", 20, 100),
    ]
    
    for email, description, min_score, max_score in risk_tests:
        score = verifier.get_risk_score(email)
        if min_score <= score <= max_score:
            results.add_pass(f"Risk score: {description}", f"{email} -> {score}")
        else:
            results.add_warning(f"Risk score onverwacht: {description}", 
                              f"{email} -> {score} (verwacht {min_score}-{max_score})")


# =============================================================================
# TEST 2: CIRCUIT BREAKERS
# =============================================================================

def test_circuit_breakers(results: TestResults):
    """Test de circuit breaker logica"""
    print("\n" + "-"*60)
    print("🚨 TEST 2: CIRCUIT BREAKERS")
    print("-"*60)
    
    from email_scheduler import EmailScheduler, CircuitLevel, SchedulerConfig
    
    # Maak test scheduler met schone stats
    scheduler = EmailScheduler()
    
    # Reset stats voor test
    scheduler.stats.today_sent = 0
    scheduler.stats.today_bounces = 0
    scheduler.stats.today_complaints = 0
    scheduler.stats.circuit_level = "green"
    scheduler.stats.is_paused = False
    
    # Test 1: Moet GREEN zijn bij start
    level = scheduler.check_circuit_breaker()
    if level == CircuitLevel.GREEN:
        results.add_pass("Circuit start GREEN", "Schone start = groen licht")
    else:
        results.add_fail("Circuit niet GREEN bij start", f"Was: {level}")
    
    # Test 2: WARNING bij 1.5% bounce rate
    scheduler.stats.today_sent = 100
    scheduler.stats.today_bounces = 2  # 2%
    scheduler.stats.is_paused = False
    level = scheduler.check_circuit_breaker()
    if level == CircuitLevel.WARNING:
        results.add_pass("WARNING bij 2% bounces", "Correct geactiveerd")
    else:
        results.add_warning("WARNING niet getriggered", f"Was: {level}")
    
    # Reset
    scheduler.stats.today_bounces = 0
    scheduler.stats.is_paused = False
    scheduler.stats.circuit_level = "green"
    
    # Test 3: PAUSE bij 3+ bounces absoluut
    scheduler.stats.today_sent = 50
    scheduler.stats.today_bounces = 3
    level = scheduler.check_circuit_breaker()
    if level == CircuitLevel.PAUSE:
        results.add_pass("PAUSE bij 3 bounces", "Correct geactiveerd")
    else:
        results.add_fail("PAUSE niet getriggered bij 3 bounces", f"Was: {level}")
    
    # Reset
    scheduler.stats.today_bounces = 0
    scheduler.stats.today_complaints = 0
    scheduler.stats.is_paused = False
    scheduler.stats.circuit_level = "green"
    
    # Test 4: PAUSE bij 1 complaint
    scheduler.stats.today_complaints = 1
    level = scheduler.check_circuit_breaker()
    if level == CircuitLevel.PAUSE:
        results.add_pass("PAUSE bij 1 complaint", "Correct geactiveerd")
    else:
        results.add_fail("PAUSE niet getriggered bij complaint", f"Was: {level}")
    
    # Reset
    scheduler.stats.today_complaints = 0
    scheduler.stats.is_paused = False
    scheduler.stats.circuit_level = "green"
    
    # Test 5: EMERGENCY bij 2+ complaints
    scheduler.stats.today_complaints = 2
    level = scheduler.check_circuit_breaker()
    if level == CircuitLevel.EMERGENCY:
        results.add_pass("EMERGENCY bij 2 complaints", "Correct geactiveerd")
    else:
        results.add_fail("EMERGENCY niet getriggered", f"Was: {level}")
    
    # Test 6: Check pause duration
    if scheduler.stats.is_paused and scheduler.stats.pause_until:
        pause_end = datetime.fromisoformat(scheduler.stats.pause_until)
        hours = (pause_end - datetime.now()).total_seconds() / 3600
        if 70 <= hours <= 74:  # ~72 uur voor emergency
            results.add_pass("EMERGENCY pause duur", f"{hours:.1f} uur")
        else:
            results.add_warning("Onverwachte pause duur", f"{hours:.1f} uur")
    
    # Cleanup - reset alles
    scheduler.stats.today_sent = 0
    scheduler.stats.today_bounces = 0
    scheduler.stats.today_complaints = 0
    scheduler.stats.is_paused = False
    scheduler.stats.circuit_level = "green"
    scheduler._save_stats()


# =============================================================================
# TEST 3: TIMING LOGICA
# =============================================================================

def test_timing_logic(results: TestResults):
    """Test de timing en scheduling logica"""
    print("\n" + "-"*60)
    print("⏰ TEST 3: TIMING LOGICA")
    print("-"*60)
    
    from email_scheduler import SchedulerConfig
    
    config = SchedulerConfig()
    
    # Test optimale dagen
    optimal = config.OPTIMAL_DAYS
    if 1 in optimal and 2 in optimal and 3 in optimal:
        results.add_pass("Optimale dagen correct", "Di, Wo, Do")
    else:
        results.add_fail("Optimale dagen fout", str(optimal))
    
    # Test weekend vermijden
    avoid = config.AVOID_DAYS
    if 5 in avoid and 6 in avoid:
        results.add_pass("Weekend correct vermeden", "Za, Zo in avoid list")
    else:
        results.add_fail("Weekend niet correct vermeden", str(avoid))
    
    # Test lunch uur
    if config.LUNCH_HOUR == 12:
        results.add_pass("Lunch uur correct", "12:00 overgeslagen")
    else:
        results.add_warning("Lunch uur onverwacht", str(config.LUNCH_HOUR))
    
    # Test huidige tijd
    now = datetime.now()
    day = now.weekday()
    hour = now.hour
    
    if day in config.AVOID_DAYS:
        results.add_warning("Test draait in weekend", "Normale scheduling zou niet werken")
    else:
        results.add_pass("Test draait op werkdag", f"Dag {day}")
    
    if hour in config.AVOID_HOURS:
        results.add_warning("Test draait buiten werkuren", f"Uur {hour}")
    else:
        results.add_pass("Test draait binnen werkuren", f"Uur {hour}")


# =============================================================================
# TEST 4: RATE LIMITING
# =============================================================================

def test_rate_limiting(results: TestResults):
    """Test rate limiting logica"""
    print("\n" + "-"*60)
    print("🚦 TEST 4: RATE LIMITING")
    print("-"*60)
    
    from email_scheduler import EmailScheduler, WarmupPhase, SchedulerConfig
    
    scheduler = EmailScheduler()
    
    # Test warmup fase detectie
    phase = scheduler.get_current_phase()
    results.add_pass("Warmup fase detectie", f"Huidige fase: {phase.value}")
    
    # Test daily limits per fase
    for fase in WarmupPhase:
        limits = SchedulerConfig.WARMUP_LIMITS[fase]
        if limits["min"] <= limits["max"]:
            results.add_pass(f"Limits {fase.value}", 
                           f"{limits['min']}-{limits['max']}/dag, {limits['per_hour']}/uur")
        else:
            results.add_fail(f"Limits {fase.value} incorrect", str(limits))
    
    # Test delay configuratie
    for fase in WarmupPhase:
        delays = SchedulerConfig.DELAY_BY_PHASE[fase]
        if delays["min"] >= 30 and delays["max"] >= delays["min"]:
            results.add_pass(f"Delays {fase.value}", 
                           f"{delays['min']}-{delays['max']} sec")
        else:
            results.add_fail(f"Delays {fase.value} incorrect", str(delays))


# =============================================================================
# TEST 5: INBOX ROTATIE
# =============================================================================

def test_inbox_rotation(results: TestResults):
    """Test inbox rotatie logica"""
    print("\n" + "-"*60)
    print("📬 TEST 5: INBOX ROTATIE")
    print("-"*60)
    
    from email_scheduler import InboxRotator, InboxAccount
    
    rotator = InboxRotator()
    
    # Voeg test accounts toe (als die er nog niet zijn)
    test_email = "test@example-rotatie.test"
    
    # Check of rotator werkt zonder accounts
    next_inbox = rotator.get_next_inbox()
    if next_inbox is None and len(rotator.accounts) == 0:
        results.add_pass("Lege rotator geeft None", "Correct gedrag")
    elif next_inbox:
        results.add_pass("Rotator geeft inbox", f"{next_inbox.email}")
    
    # Test pool status
    status = rotator.get_status()
    results.add_pass("Pool status opgehaald", 
                    f"Primed: {len(status['primed'])}, Ramping: {len(status['ramping'])}, Resting: {len(status['resting'])}")
    
    # Test InboxAccount logica
    test_account = InboxAccount(
        email="test@test.nl",
        pool="ramping",
        total_sent=100,
        total_bounces=1  # 1% bounce rate
    )
    
    bounce_rate = test_account.get_bounce_rate()
    if 0.009 <= bounce_rate <= 0.011:  # ~1%
        results.add_pass("Bounce rate berekening", f"{bounce_rate:.1%}")
    else:
        results.add_fail("Bounce rate berekening fout", f"{bounce_rate}")
    
    # Test should_rest logica
    test_account.total_bounces = 3  # 3% bounce rate
    if test_account.should_rest():
        results.add_pass("should_rest() bij hoge bounces", "Correct")
    else:
        results.add_fail("should_rest() niet getriggered", "Zou True moeten zijn")
    
    test_account.total_bounces = 0
    test_account.total_complaints = 1
    if test_account.should_rest():
        results.add_pass("should_rest() bij complaint", "Correct")
    else:
        results.add_fail("should_rest() niet getriggered bij complaint", "Zou True moeten zijn")


# =============================================================================
# TEST 6: PLAIN TEXT TEMPLATES
# =============================================================================

def test_plain_text_templates(results: TestResults):
    """Test plain text template structuur"""
    print("\n" + "-"*60)
    print("📝 TEST 6: PLAIN TEXT TEMPLATES")
    print("-"*60)
    
    from email_scheduler import PLAIN_TEXT_TEMPLATES
    
    required_templates = ["no_website", "has_website", "followup_1", "followup_2"]
    
    for template_key in required_templates:
        if template_key in PLAIN_TEXT_TEMPLATES:
            template = PLAIN_TEXT_TEMPLATES[template_key]
            
            # Check required fields
            has_subject = "subject" in template and len(template["subject"]) > 0
            has_body = "body" in template and len(template["body"]) > 0
            has_variables = "$bedrijfsnaam" in template["body"] or "$stad" in template["body"]
            has_optout = "stop" in template["body"].lower() or "geen interesse" in template["body"].lower()
            
            if has_subject and has_body:
                results.add_pass(f"Template: {template_key}", template["name"])
                
                if has_variables:
                    results.add_pass(f"  Personalisatie variabelen", "OK")
                else:
                    results.add_warning(f"  Geen personalisatie", "Overweeg toevoegen")
                
                if has_optout:
                    results.add_pass(f"  Opt-out aanwezig", "GDPR compliant")
                else:
                    results.add_fail(f"  Geen opt-out!", "GDPR vereist dit")
                
                # Word count
                word_count = len(template["body"].split())
                if word_count <= 125:
                    results.add_pass(f"  Lengte OK", f"{word_count} woorden")
                else:
                    results.add_warning(f"  Te lang", f"{word_count} woorden (max 125)")
            else:
                results.add_fail(f"Template incomplete: {template_key}", "Mist subject of body")
        else:
            results.add_fail(f"Template mist: {template_key}", "Moet toegevoegd worden")


# =============================================================================
# TEST 7: DELIVERABILITY CHECK (INSTRUCTIES)
# =============================================================================

def test_deliverability_instructions(results: TestResults):
    """Geef instructies voor handmatige deliverability test"""
    print("\n" + "-"*60)
    print("📧 TEST 7: DELIVERABILITY CHECK (HANDMATIG)")
    print("-"*60)
    
    print("""
  Om deliverability te testen zonder je domein te riskeren:
  
  STAP 1: Maak GRATIS test accounts aan
  ├── Gmail:    rotechtest2026@gmail.com
  ├── Outlook:  rotechtest2026@outlook.com
  └── Yahoo:    rotechtest2026@yahoo.com
  
  STAP 2: Test met mail-tester.com
  ├── Ga naar: https://mail-tester.com/
  ├── Stuur email naar het gegeven adres
  └── Check score (doel: 9+/10)
  
  STAP 3: Test met Mailtrap (SMTP sandbox)
  ├── Maak account: https://mailtrap.io/
  ├── Gratis plan: 100 emails/maand
  ├── Geen echte emails = 0 risico
  └── Zie alle emails in sandbox
  
  STAP 4: GlockApps Inbox Test (optioneel)
  ├── https://glockapps.com/
  └── Gratis 3 tests/maand
    """)
    
    results.add_warning("Deliverability test", "Handmatige verificatie nodig")
    results.add_pass("Instructies gegeven", "Volg bovenstaande stappen")


# =============================================================================
# TEST 8: CONFIGURATIE VALIDATIE
# =============================================================================

def test_configuration(results: TestResults):
    """Test of configuratie correct is"""
    print("\n" + "-"*60)
    print("⚙️  TEST 8: CONFIGURATIE")
    print("-"*60)
    
    from dotenv import load_dotenv
    import os
    
    load_dotenv()
    
    required_vars = [
        ("SMTP_SERVER", "mail.privateemail.com"),
        ("SMTP_PORT", "587"),
        ("SMTP_USER", None),  # Moet ingevuld zijn
        ("SENDER_EMAIL", None),
        ("REPLY_TO", None),
    ]
    
    for var_name, expected in required_vars:
        value = os.getenv(var_name, "")
        
        if expected and value == expected:
            results.add_pass(f"{var_name}", f"= {value}")
        elif expected is None and value:
            # Mask sensitive data
            masked = value[:3] + "***" + value[-3:] if len(value) > 6 else "***"
            results.add_pass(f"{var_name}", f"= {masked}")
        elif not value:
            results.add_fail(f"{var_name}", "NIET GECONFIGUREERD")
        else:
            results.add_warning(f"{var_name}", f"= {value} (verwacht: {expected})")
    
    # Check SMTP_PASSWORD apart (nooit tonen)
    if os.getenv("SMTP_PASSWORD"):
        results.add_pass("SMTP_PASSWORD", "= ****** (geconfigureerd)")
    else:
        results.add_fail("SMTP_PASSWORD", "NIET GECONFIGUREERD")


# =============================================================================
# MAIN TEST RUNNER
# =============================================================================

def run_all_tests():
    """Voer alle tests uit"""
    print("\n" + "="*60)
    print("🧪 RO-TECH EMAIL SYSTEM - VOLLEDIGE TEST SUITE")
    print("="*60)
    print(f"Datum: {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    print("="*60)
    
    results = TestResults()
    
    try:
        test_email_verification(results)
        test_circuit_breakers(results)
        test_timing_logic(results)
        test_rate_limiting(results)
        test_inbox_rotation(results)
        test_plain_text_templates(results)
        test_configuration(results)
        test_deliverability_instructions(results)
        
    except Exception as e:
        print(f"\n❌ KRITIEKE FOUT: {e}")
        import traceback
        traceback.print_exc()
        results.add_fail("Test suite crashed", str(e))
    
    return results.summary()


# =============================================================================
# LIVE EMAIL TEST NAAR PERSOONLIJKE OUTLOOK
# =============================================================================

def test_send_to_outlook():
    """
    Stuur een echte test email naar Bart's persoonlijke Outlook
    Dit test de volledige email pipeline met je echte SMTP configuratie
    """
    print("\n" + "="*60)
    print("📧 LIVE EMAIL TEST - VERSTUREN NAAR OUTLOOK")
    print("="*60)
    
    # Jouw persoonlijke test email
    TEST_RECIPIENT = "bartvrooij14@hotmail.com"
    
    import smtplib
    import ssl
    from email.mime.text import MIMEText
    from dotenv import load_dotenv
    import os
    
    load_dotenv()
    
    # Haal SMTP configuratie
    smtp_server = os.getenv('SMTP_SERVER', 'mail.privateemail.com')
    smtp_port = int(os.getenv('SMTP_PORT', 587))
    smtp_user = os.getenv('SMTP_USER', '')
    smtp_pass = os.getenv('SMTP_PASSWORD', '')
    sender_name = os.getenv('SENDER_NAME', 'Ro-Tech Development')
    sender_email = os.getenv('SENDER_EMAIL', '')
    reply_to = os.getenv('REPLY_TO', sender_email)
    
    # Valideer configuratie
    print(f"\n  SMTP Server: {smtp_server}:{smtp_port}")
    print(f"  Verzender:   {sender_email}")
    print(f"  Ontvanger:   {TEST_RECIPIENT}")
    print()
    
    if not smtp_user or not smtp_pass or not sender_email:
        print("  ❌ SMTP niet geconfigureerd!")
        print("     Check je .env bestand:")
        print("     - SMTP_USER")
        print("     - SMTP_PASSWORD")
        print("     - SENDER_EMAIL")
        return False
    
    # Maak test email (plain text - betere deliverability)
    test_body = f"""Hoi Bart,

Dit is een TEST EMAIL van het Ro-Tech Email Systeem.

=== TEST RESULTATEN ===

Als je dit leest:
✅ SMTP configuratie werkt
✅ Email authenticatie werkt
✅ Plain text verzending werkt

Test Details:
- Tijdstip: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
- SMTP Server: {smtp_server}
- Verzonden vanaf: {sender_email}
- Format: Plain Text (geen HTML)

=== VOLGENDE CHECKS ===

1. Check of deze email in je INBOX kwam (niet spam)
2. Check of de afzender correct is
3. Reply op deze email om Reply-To te testen

---
Dit is een automatische test.
Geen interesse? Reply "stop" (test voor blacklist functie)
"""

    test_email = MIMEText(test_body, 'plain', 'utf-8')
    test_email['Subject'] = "TEST - Ro-Tech Email Systeem Validatie"
    test_email['From'] = f"{sender_name} <{sender_email}>"
    test_email['To'] = TEST_RECIPIENT
    test_email['Reply-To'] = reply_to
    
    try:
        print("  📡 Verbinden met SMTP server...")
        context = ssl.create_default_context()
        server = smtplib.SMTP(smtp_server, smtp_port, timeout=30)
        server.starttls(context=context)
        
        print("  🔐 Inloggen...")
        server.login(smtp_user, smtp_pass)
        
        print("  📤 Versturen email...")
        server.send_message(test_email)
        server.quit()
        
        print()
        print("  " + "="*50)
        print("  ✅ TEST EMAIL SUCCESVOL VERSTUURD!")
        print("  " + "="*50)
        print()
        print(f"  → Check je Outlook inbox: {TEST_RECIPIENT}")
        print("  → De email zou binnen 1-2 minuten moeten aankomen")
        print()
        print("  📋 CONTROLEER:")
        print("     □ Kwam email in INBOX (niet spam/junk)?")
        print("     □ Is de afzender correct?")
        print("     □ Ziet de plain text er goed uit?")
        print("     □ Werkt Reply-To correct?")
        print()
        
        return True
        
    except smtplib.SMTPAuthenticationError as e:
        print(f"\n  ❌ AUTHENTICATIE FOUT!")
        print(f"     Check SMTP_USER en SMTP_PASSWORD in .env")
        print(f"     Error: {e}")
        return False
        
    except smtplib.SMTPConnectError as e:
        print(f"\n  ❌ KON NIET VERBINDEN!")
        print(f"     Check SMTP_SERVER en SMTP_PORT in .env")
        print(f"     Error: {e}")
        return False
        
    except Exception as e:
        print(f"\n  ❌ ONVERWACHTE FOUT: {e}")
        import traceback
        traceback.print_exc()
        return False


# =============================================================================
# LIVE EMAIL TEST (MET MAILTRAP) - SANDBOX OPTIE
# =============================================================================

def test_with_mailtrap():
    """
    Test email verzending met Mailtrap sandbox (geen echte emails)
    """
    print("\n" + "="*60)
    print("📧 MAILTRAP SANDBOX TEST")
    print("="*60)
    
    # Mailtrap test credentials (vul je eigen in!)
    MAILTRAP_HOST = "sandbox.smtp.mailtrap.io"
    MAILTRAP_PORT = 2525
    MAILTRAP_USER = ""  # Vul in van mailtrap.io
    MAILTRAP_PASS = ""  # Vul in van mailtrap.io
    
    if not MAILTRAP_USER or not MAILTRAP_PASS:
        print("""
  ⚠️  Mailtrap niet geconfigureerd!
  
  Dit is een OPTIONELE test voor extra veiligheid.
  
  Om te gebruiken:
  1. Ga naar https://mailtrap.io/ en maak gratis account
  2. Ga naar Email Testing → Inboxes
  3. Open test_email_system.py
  4. Vul MAILTRAP_USER en MAILTRAP_PASS in
  5. Run: python test_email_system.py mailtrap
  
  ─────────────────────────────────────────────
  
  OF gebruik de live test naar je Outlook:
  → python test_email_system.py live
        """)
        return False
    
    import smtplib
    from email.mime.text import MIMEText
    
    test_email = MIMEText(f"""
Dit is een test email van het Ro-Tech Email Systeem.

Timestamp: {datetime.now().isoformat()}
Format: Plain text

Als je dit ziet in Mailtrap, werkt alles!
    """, 'plain', 'utf-8')
    
    test_email['Subject'] = "Test - Ro-Tech Email Systeem"
    test_email['From'] = "test@ro-tech.test"
    test_email['To'] = "test@mailtrap.test"
    
    try:
        print("  Verbinden met Mailtrap...")
        server = smtplib.SMTP(MAILTRAP_HOST, MAILTRAP_PORT)
        server.starttls()
        server.login(MAILTRAP_USER, MAILTRAP_PASS)
        
        print("  Versturen test email...")
        server.send_message(test_email)
        server.quit()
        
        print("\n  ✅ TEST EMAIL VERSTUURD!")
        print("  → Check je Mailtrap inbox")
        return True
        
    except Exception as e:
        print(f"\n  ❌ FOUT: {e}")
        return False


# =============================================================================
# CLI
# =============================================================================

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1:
        command = sys.argv[1].lower()
        
        if command == "live":
            # Stuur echte test email naar Outlook
            test_send_to_outlook()
            
        elif command == "mailtrap":
            # Mailtrap sandbox test
            test_with_mailtrap()
            
        elif command == "help":
            print("""
Ro-Tech Email System Test Suite

GEBRUIK:
  python test_email_system.py          - Volledige test suite
  python test_email_system.py live     - Stuur test naar bartvrooij14@hotmail.com
  python test_email_system.py mailtrap - Test met Mailtrap sandbox
  python test_email_system.py help     - Deze help
            """)
        else:
            print(f"Onbekend commando: {command}")
            print("Gebruik 'python test_email_system.py help' voor opties")
    else:
        # Volledige test suite
        success = run_all_tests()
        
        print("\n" + "="*60)
        print("📋 VOLGENDE STAPPEN")
        print("="*60)
        print("""
  1. Fix eventuele gefaalde tests (rood)
  
  2. Stuur een LIVE test email naar je Outlook:
     → python test_email_system.py live
     → Check of email in INBOX komt (niet spam)
  
  3. Test deliverability score:
     → Stuur email naar mail-tester.com
     → Score moet 9+/10 zijn
  
  4. Wanneer alles groen is:
     → Start warmup protocol
     → GEEN cold emails eerste 2 weken!
        """)
        
        sys.exit(0 if success else 1)
