"""
Apify Lead Finder v2.0
Zoek potentiële klanten voor website development via Apify Google Maps Scraper
Met email extractie, lead scoring, retry mechanisme en fallback actors

Author: Ro-Tech Development
Version: 2.0.0
"""

import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
import json
import csv
import time
import re
import logging
from typing import List, Dict, Optional, Tuple, Any
from datetime import datetime
from dataclasses import dataclass, asdict, field
from pathlib import Path
import os
import sys
from dotenv import load_dotenv
import argparse
from contextlib import contextmanager
import hashlib

# Fix Windows console encoding voor emoji's
if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    except AttributeError:
        pass  # Python < 3.7 fallback

load_dotenv()

# =============================================================================
# CONFIGURATIE
# =============================================================================

class Config:
    """Centrale configuratie - makkelijk aan te passen"""
    
    # API Settings
    API_BASE = "https://api.apify.com/v2"
    REQUEST_TIMEOUT = 30  # seconds
    POLL_INTERVAL = 10  # seconds between status checks
    MAX_POLL_ATTEMPTS = 180  # max 30 minuten wachten (180 * 10s)
    
    # Retry settings voor robuuste API calls
    MAX_RETRIES = 3
    RETRY_BACKOFF_FACTOR = 0.5
    RETRY_STATUS_CODES = [429, 500, 502, 503, 504]
    
    # Fallback Actor IDs (als primaire faalt)
    ACTOR_IDS = [
        "nwua9Gu5YrADL7ZDj",  # compass/crawler-google-places (primair)
        "drobnikj~crawler-google-places",  # fallback 1
        "compass~crawler-google-places",  # fallback 2
    ]
    
    # Cost estimation
    COST_PER_RESULT = 0.004  # USD
    
    # Logging
    LOG_FILE = "apify_lead_finder.log"
    LOG_FORMAT = '%(asctime)s - %(levelname)s - %(message)s'


# Logging setup
def setup_logging() -> logging.Logger:
    """Configureer logging met file en console handlers"""
    logger = logging.getLogger(__name__)
    logger.setLevel(logging.INFO)
    
    # Voorkom duplicate handlers
    if logger.handlers:
        return logger
    
    # File handler
    file_handler = logging.FileHandler(Config.LOG_FILE, encoding='utf-8')
    file_handler.setFormatter(logging.Formatter(Config.LOG_FORMAT))
    logger.addHandler(file_handler)
    
    # Console handler
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(logging.Formatter(Config.LOG_FORMAT))
    logger.addHandler(console_handler)
    
    return logger

logger = setup_logging()


# =============================================================================
# DATA CLASSES
# =============================================================================

@dataclass
class BusinessLead:
    """Data class voor een business lead met alle relevante velden"""
    name: str
    address: str
    city: str = ""
    phone: str = ""
    website: str = ""
    email: str = ""
    emails: List[str] = field(default_factory=list)
    social_facebook: str = ""
    social_instagram: str = ""
    social_linkedin: str = ""
    social_twitter: str = ""
    rating: float = 0.0
    total_reviews: int = 0
    price_level: str = ""
    categories: str = ""
    place_id: str = ""
    has_website: bool = False
    has_email: bool = False
    lead_score: int = 0
    lead_priority: str = ""
    latitude: float = 0.0
    longitude: float = 0.0
    found_date: str = ""
    search_query: str = ""
    notes: str = ""
    google_maps_url: str = ""
    
    def get_unique_key(self) -> str:
        """Genereer unieke sleutel voor deduplicatie"""
        key = f"{self.name}|{self.address}".lower().strip()
        return hashlib.md5(key.encode()).hexdigest()


# =============================================================================
# HTTP CLIENT MET RETRY
# =============================================================================

class RobustHTTPClient:
    """HTTP client met automatische retry en connection pooling"""
    
    def __init__(self, api_token: str):
        self.api_token = api_token
        self.session = self._create_session()
    
    def _create_session(self) -> requests.Session:
        """Maak session met retry strategie"""
        session = requests.Session()
        
        # Retry strategie met exponential backoff
        retry_strategy = Retry(
            total=Config.MAX_RETRIES,
            backoff_factor=Config.RETRY_BACKOFF_FACTOR,
            status_forcelist=Config.RETRY_STATUS_CODES,
            allowed_methods=["GET", "POST"],
            raise_on_status=False
        )
        
        adapter = HTTPAdapter(
            max_retries=retry_strategy,
            pool_connections=10,
            pool_maxsize=20
        )
        
        session.mount("https://", adapter)
        session.mount("http://", adapter)
        
        session.headers.update({
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        })
        
        return session
    
    def get(self, url: str, **kwargs) -> requests.Response:
        """GET request met token en timeout"""
        kwargs.setdefault('timeout', Config.REQUEST_TIMEOUT)
        kwargs.setdefault('params', {})
        kwargs['params']['token'] = self.api_token
        return self.session.get(url, **kwargs)
    
    def post(self, url: str, **kwargs) -> requests.Response:
        """POST request met token en timeout"""
        kwargs.setdefault('timeout', Config.REQUEST_TIMEOUT)
        kwargs.setdefault('params', {})
        kwargs['params']['token'] = self.api_token
        return self.session.post(url, **kwargs)
    
    def close(self):
        """Sluit de session netjes af"""
        self.session.close()


# =============================================================================
# RESUME STATE MANAGER
# =============================================================================

class ResumeStateManager:
    """Beheert resume state voor langlopende scraping jobs"""
    
    STATE_FILE = Path("output/.resume_state.json")
    
    def __init__(self):
        self.processed_keys: set = set()
        self.last_run_id: Optional[str] = None
        self._load()
    
    def _load(self):
        """Laad eerder opgeslagen state"""
        if self.STATE_FILE.exists():
            try:
                with open(self.STATE_FILE, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    self.processed_keys = set(data.get('processed_keys', []))
                    self.last_run_id = data.get('last_run_id')
                    if self.processed_keys:
                        logger.info(f"Resume state geladen: {len(self.processed_keys)} eerder verwerkt")
            except Exception as e:
                logger.warning(f"Kon state niet laden: {e}")
    
    def save(self, run_id: str = None):
        """Sla huidige state op"""
        self.STATE_FILE.parent.mkdir(exist_ok=True)
        try:
            with open(self.STATE_FILE, 'w', encoding='utf-8') as f:
                json.dump({
                    'processed_keys': list(self.processed_keys),
                    'last_run_id': run_id or self.last_run_id,
                    'updated_at': datetime.now().isoformat()
                }, f, indent=2)
        except Exception as e:
            logger.warning(f"Kon state niet opslaan: {e}")
    
    def is_processed(self, key: str) -> bool:
        """Check of item al verwerkt is"""
        return key in self.processed_keys
    
    def mark_processed(self, key: str):
        """Markeer item als verwerkt"""
        self.processed_keys.add(key)
    
    def clear(self):
        """Wis state voor nieuwe run"""
        self.processed_keys.clear()
        self.last_run_id = None
        if self.STATE_FILE.exists():
            self.STATE_FILE.unlink()


# =============================================================================
# MAIN CLASS
# =============================================================================

class ApifyLeadFinder:
    """
    Zoekt bedrijven via Apify Google Maps Scraper
    Met retry mechanisme, fallback actors en resume functionaliteit
    """
    
    # =================================================================
    # NEDERLAND - Alle belangrijke steden per provincie
    # =================================================================
    DUTCH_CITIES = [
        # Noord-Holland
        "Amsterdam", "Haarlem", "Zaanstad", "Haarlemmermeer", "Alkmaar",
        "Hilversum", "Amstelveen", "Purmerend", "Hoorn", "Velsen",
        "Den Helder", "Heerhugowaard", "Beverwijk", "Castricum",
        
        # Zuid-Holland  
        "Rotterdam", "Den Haag", "Leiden", "Dordrecht", "Zoetermeer",
        "Delft", "Westland", "Schiedam", "Vlaardingen", "Gouda",
        "Alphen aan den Rijn", "Capelle aan den IJssel", "Spijkenisse",
        "Leidschendam-Voorburg", "Rijswijk", "Katwijk", "Nissewaard",
        
        # Utrecht
        "Utrecht", "Amersfoort", "Veenendaal", "Zeist", "Nieuwegein",
        "Houten", "IJsselstein", "Woerden", "Soest", "Leusden",
        
        # Noord-Brabant
        "Eindhoven", "Tilburg", "Breda", "Den Bosch", "Helmond",
        "Oss", "Roosendaal", "Bergen op Zoom", "Veldhoven", "Waalwijk",
        "Best", "Valkenswaard", "Geldrop", "Nuenen", "Waalre",
        "Oirschot", "Eersel", "Son en Breugel", "Boxtel", "Veghel",
        
        # Gelderland
        "Arnhem", "Nijmegen", "Apeldoorn", "Ede", "Deventer",
        "Zutphen", "Doetinchem", "Harderwijk", "Zevenaar", "Wageningen",
        "Tiel", "Barneveld", "Winterswijk", "Culemborg",
        
        # Overijssel
        "Zwolle", "Enschede", "Almelo", "Hengelo", "Deventer",
        "Kampen", "Oldenzaal", "Rijssen", "Hardenberg", "Raalte",
        
        # Limburg
        "Maastricht", "Venlo", "Sittard-Geleen", "Heerlen", "Roermond",
        "Weert", "Kerkrade", "Venray", "Landgraaf", "Brunssum",
        
        # Groningen
        "Groningen", "Hoogezand-Sappemeer", "Veendam", "Stadskanaal",
        "Delfzijl", "Winschoten", "Leek",
        
        # Friesland
        "Leeuwarden", "Drachten", "Sneek", "Heerenveen", "Harlingen",
        "Franeker", "Dokkum", "Joure",
        
        # Drenthe
        "Emmen", "Assen", "Hoogeveen", "Meppel", "Coevorden",
        
        # Flevoland
        "Almere", "Lelystad", "Dronten", "Zeewolde",
        
        # Zeeland
        "Middelburg", "Vlissingen", "Goes", "Terneuzen", "Zierikzee",
    ]
    
    # =================================================================
    # BELGIË - Alle belangrijke steden per regio
    # =================================================================
    BELGIAN_CITIES = [
        # Vlaanderen - Antwerpen
        "Antwerpen", "Mechelen", "Turnhout", "Lier", "Herentals",
        "Geel", "Mol", "Hoogstraten", "Brasschaat", "Schoten",
        "Mortsel", "Boom", "Wilrijk", "Berchem", "Deurne",
        
        # Vlaanderen - Oost-Vlaanderen
        "Gent", "Aalst", "Sint-Niklaas", "Dendermonde", "Lokeren",
        "Ronse", "Wetteren", "Zele", "Geraardsbergen", "Ninove",
        
        # Vlaanderen - West-Vlaanderen
        "Brugge", "Oostende", "Kortrijk", "Roeselare", "Ieper",
        "Knokke-Heist", "Waregem", "Blankenberge", "Torhout", "Izegem",
        
        # Vlaanderen - Vlaams-Brabant
        "Leuven", "Vilvoorde", "Halle", "Tienen", "Aarschot",
        "Diest", "Zaventem", "Overijse", "Tervuren", "Grimbergen",
        
        # Vlaanderen - Limburg (BE)
        "Hasselt", "Genk", "Sint-Truiden", "Beringen", "Lommel",
        "Tongeren", "Maasmechelen", "Bilzen", "Leopoldsburg",
        
        # Brussel
        "Brussel", "Schaarbeek", "Anderlecht", "Molenbeek", "Elsene",
        "Ukkel", "Vorst", "Etterbeek", "Jette", "Sint-Gillis",
        
        # Wallonië (Franstalig - ook potentie)
        "Luik", "Charleroi", "Namen", "Bergen", "La Louvière",
        "Doornik", "Verviers", "Moeskroen", "Seraing", "Aarlen",
    ]
    
    # Gecombineerde lijst voor gemak
    ALL_CITIES = DUTCH_CITIES + BELGIAN_CITIES
    
    # Business categorieën met Nederlandse zoektermen
    BUSINESS_CATEGORIES = {
        # Horeca
        "restaurant": "restaurant",
        "cafe": "café",
        "snackbar": "snackbar frituur",
        "bakkerij": "bakkerij",
        "slagerij": "slagerij",
        "pizzeria": "pizzeria",
        "cafetaria": "cafetaria",
        
        # Persoonlijke verzorging
        "kapper": "kapper kapsalon",
        "schoonheidssalon": "schoonheidssalon beautysalon",
        "nagelstudio": "nagelstudio nagelsalon",
        "tattoo": "tattoo shop piercing",
        "barbershop": "barbershop herenkapper",
        
        # Gezondheid
        "fysiotherapeut": "fysiotherapeut fysiotherapie",
        "tandarts": "tandarts tandartspraktijk",
        "huisarts": "huisarts huisartsenpraktijk",
        "apotheek": "apotheek",
        "dierenarts": "dierenarts dierenkliniek",
        "opticien": "opticien brillenwinkel",
        "psycholoog": "psycholoog psychologenpraktijk",
        "osteopaat": "osteopaat osteopathie",
        
        # Bouw & Techniek
        "aannemer": "aannemer bouwbedrijf",
        "installateur": "installateur cv ketel",
        "elektricien": "elektricien elektriciën",
        "loodgieter": "loodgieter loodgietersbedrijf",
        "schilder": "schilder schildersbedrijf",
        "timmerman": "timmerman timmerbedrijf",
        "dakdekker": "dakdekker dakdekkersbedrijf",
        "tuinman": "hovenier hoveniersbedrijf tuinman",
        "glazenwasser": "glazenwasser schoonmaak",
        "schoonmaakbedrijf": "schoonmaakbedrijf",
        "tegelzetter": "tegelzetter",
        "stukadoor": "stukadoor stukadoorsbedrijf",
        "metselaar": "metselaar metselaarbedrijf",
        
        # Automotive
        "autobedrijf": "autobedrijf autogarage",
        "garage": "autogarage APK",
        "autopoetsen": "autopoetsbedrijf carwash",
        "bandencentrale": "bandencentrale banden",
        "autoschadeherstel": "autoschadeherstel autoschade",
        
        # Zakelijke dienstverlening
        "advocaat": "advocaat advocatenkantoor",
        "accountant": "accountant accountantskantoor",
        "notaris": "notaris notariskantoor",
        "makelaar": "makelaar makelaardij",
        "verzekeringen": "verzekeringsadviseur verzekeringen",
        "boekhouder": "boekhouder administratiekantoor",
        "belastingadviseur": "belastingadviseur",
        
        # Sport & Leisure
        "sportschool": "sportschool fitness gym",
        "yogastudio": "yogastudio yoga",
        "dansstudio": "dansschool dansstudio",
        "zwemschool": "zwemschool zwembad",
        "tennisclub": "tennisclub tennisbaan",
        
        # Retail
        "bloemenwinkel": "bloemenwinkel bloemist",
        "fietsenwinkel": "fietsenwinkel fietsenzaak",
        "kledingwinkel": "kledingwinkel boetiek",
        "cadeauwinkel": "cadeauwinkel geschenken",
        "dierenwinkel": "dierenwinkel dierenspeciaalzaak",
        "juwelier": "juwelier sieraden",
        "meubelwinkel": "meubelwinkel meubelen",
        "elektronicawinkel": "elektronicawinkel",
    }
    
    def __init__(self, api_token: str, use_resume: bool = True):
        """
        Initialiseer de Apify Lead Finder
        
        Args:
            api_token: Apify API token
            use_resume: Gebruik resume functionaliteit
        """
        if not api_token or len(api_token) < 10:
            raise ValueError("Geldige Apify API token is vereist")
        
        self.http = RobustHTTPClient(api_token)
        self.resume_manager = ResumeStateManager() if use_resume else None
        self.results: List[BusinessLead] = []
        self.start_time = datetime.now()
        self.total_cost = 0.0
        self.current_actor_id: Optional[str] = None
    
    def _find_working_actor(self) -> Optional[str]:
        """Vind een werkende actor met fallback"""
        for actor_id in Config.ACTOR_IDS:
            try:
                response = self.http.get(f"{Config.API_BASE}/acts/{actor_id}")
                if response.status_code == 200:
                    logger.info(f"Actor gevonden: {actor_id}")
                    return actor_id
            except Exception as e:
                logger.warning(f"Actor {actor_id} niet beschikbaar: {e}")
                continue
        return None
    
    def _build_search_queries(
        self,
        categories: List[str],
        cities: List[str]
    ) -> List[str]:
        """Bouw zoekqueries voor Apify"""
        queries = []
        for category in categories:
            search_term = self.BUSINESS_CATEGORIES.get(category, category)
            for city in cities:
                query = f"{search_term} {city} Nederland"
                queries.append(query)
        return queries
    
    def _calculate_lead_score(self, lead: BusinessLead) -> Tuple[int, str]:
        """
        Bereken lead score (0-100) en prioriteit
        Hogere score = betere lead voor website development
        """
        score = 50  # Basis score
        opportunities = []
        
        # Geen website = beste lead (+35)
        if not lead.has_website:
            score += 35
            opportunities.append("Geen website - perfecte lead!")
        
        # Heeft email = makkelijk te contacteren (+10)
        if lead.has_email:
            score += 10
        
        # Heeft telefoon = serieus bedrijf (+5)
        if lead.phone:
            score += 5
        
        # Rating analyse
        if lead.rating >= 4.0:
            score += 5  # Gevestigd bedrijf
        elif 0 < lead.rating < 3.5:
            score += 10  # Slechte online presence
            opportunities.append("Lage rating - reputatie verbetering")
        
        # Reviews analyse
        if lead.total_reviews >= 20:
            score += 5
        elif lead.total_reviews == 0:
            score += 5  # Geen online focus
        
        # Social media check
        has_social = any([
            lead.social_facebook,
            lead.social_instagram,
            lead.social_linkedin
        ])
        if not has_social and lead.has_website:
            score += 5
            opportunities.append("Geen social media integratie")
        
        # Bepaal prioriteit
        if score >= 85:
            priority = "HOT"
        elif score >= 70:
            priority = "WARM"
        elif score >= 55:
            priority = "MEDIUM"
        else:
            priority = "LOW"
        
        if opportunities:
            lead.notes = "; ".join(opportunities)
        
        return min(100, score), priority
    
    def _extract_city_from_address(self, address: str) -> str:
        """Extraheer stad uit Nederlands adres"""
        if not address:
            return ""
        
        # Postcode + stad patroon
        match = re.search(r'\d{4}\s*[A-Z]{2}\s+([A-Za-z\s\-\']+)', address)
        if match:
            city = match.group(1).strip()
            city = re.sub(r',?\s*(Netherlands|Nederland)$', '', city, flags=re.IGNORECASE)
            return city.strip()
        
        # Fallback: zoek bekende steden
        for city in self.DUTCH_CITIES:
            if city.lower() in address.lower():
                return city
        
        return ""
    
    def _safe_get(self, data: Dict, *keys, default: Any = None) -> Any:
        """Veilig ophalen van nested dictionary values"""
        result = data
        for key in keys:
            if isinstance(result, dict):
                result = result.get(key, default)
            else:
                return default
        return result if result is not None else default
    
    def _parse_apify_result(self, item: Dict, search_query: str) -> Optional[BusinessLead]:
        """Parse Apify resultaat naar BusinessLead met uitgebreide validatie"""
        try:
            # Basis info
            name = item.get('title', '') or item.get('name', '')
            if not name or len(name) < 2:
                return None
            
            address = item.get('address', '') or item.get('street', '')
            website = item.get('website', '') or ''
            
            # Valideer website URL
            if website and not website.startswith(('http://', 'https://')):
                website = f"http://{website}"
            
            # Emails
            emails = item.get('emails', []) or []
            if isinstance(emails, str):
                emails = [emails] if emails else []
            # Filter ongeldige emails
            emails = [e for e in emails if e and '@' in e and '.' in e]
            primary_email = emails[0] if emails else ""
            
            # Social media
            social = item.get('socialMedia', {}) or {}
            if isinstance(social, list):
                social_dict = {}
                for s in social:
                    s_lower = str(s).lower()
                    if 'facebook' in s_lower:
                        social_dict['facebook'] = s
                    elif 'instagram' in s_lower:
                        social_dict['instagram'] = s
                    elif 'linkedin' in s_lower:
                        social_dict['linkedin'] = s
                    elif 'twitter' in s_lower:
                        social_dict['twitter'] = s
                social = social_dict
            
            # Telefoon
            phone = item.get('phone', '') or item.get('phoneNumber', '') or item.get('telephone', '')
            
            # Rating en reviews met type safety
            try:
                rating = float(item.get('totalScore', 0) or item.get('rating', 0) or 0)
            except (ValueError, TypeError):
                rating = 0.0
            
            try:
                reviews = int(item.get('reviewsCount', 0) or item.get('totalReviews', 0) or 0)
            except (ValueError, TypeError):
                reviews = 0
            
            # Categories
            categories = item.get('categories', []) or item.get('category', []) or []
            if isinstance(categories, list):
                categories = ", ".join(str(c) for c in categories if c)
            
            # Coordinates
            location = item.get('location', {}) or {}
            try:
                lat = float(location.get('lat', 0) or item.get('latitude', 0) or 0)
                lng = float(location.get('lng', 0) or item.get('longitude', 0) or 0)
            except (ValueError, TypeError):
                lat, lng = 0.0, 0.0
            
            # URLs
            maps_url = item.get('url', '') or item.get('googleMapsUrl', '') or ""
            place_id = item.get('placeId', '') or item.get('cid', '') or ""
            
            lead = BusinessLead(
                name=name.strip(),
                address=address.strip(),
                city=self._extract_city_from_address(address),
                phone=phone.strip() if phone else "",
                website=website.strip(),
                email=primary_email.strip(),
                emails=emails,
                social_facebook=social.get('facebook', ''),
                social_instagram=social.get('instagram', ''),
                social_linkedin=social.get('linkedin', ''),
                social_twitter=social.get('twitter', ''),
                rating=rating,
                total_reviews=reviews,
                price_level=str(item.get('priceLevel', '')),
                categories=categories,
                place_id=place_id,
                has_website=bool(website),
                has_email=bool(primary_email),
                latitude=lat,
                longitude=lng,
                found_date=datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                search_query=search_query,
                google_maps_url=maps_url
            )
            
            # Bereken lead score
            score, priority = self._calculate_lead_score(lead)
            lead.lead_score = score
            lead.lead_priority = priority
            
            return lead
            
        except Exception as e:
            logger.warning(f"Parse error: {e} - Item: {str(item)[:100]}")
            return None
    
    def _wait_for_run(self, run_id: str) -> bool:
        """Wacht op voltooiing van actor run met timeout"""
        attempts = 0
        while attempts < Config.MAX_POLL_ATTEMPTS:
            try:
                response = self.http.get(f"{Config.API_BASE}/actor-runs/{run_id}")
                
                if response.status_code != 200:
                    logger.warning(f"Status check failed: {response.status_code}")
                    attempts += 1
                    time.sleep(Config.POLL_INTERVAL)
                    continue
                
                data = response.json()
                status = self._safe_get(data, 'data', 'status', default='UNKNOWN')
                
                if status == "SUCCEEDED":
                    logger.info("✅ Scraper voltooid!")
                    return True
                elif status in ("FAILED", "ABORTED", "TIMED-OUT"):
                    logger.error(f"❌ Scraper gefaald: {status}")
                    return False
                else:
                    stats = self._safe_get(data, 'data', 'stats', default={})
                    items = stats.get('itemsReturnedTotal', 0)
                    logger.info(f"   ⏳ Status: {status} - {items} items...")
                    time.sleep(Config.POLL_INTERVAL)
                    attempts += 1
                    
            except Exception as e:
                logger.warning(f"Poll error: {e}")
                attempts += 1
                time.sleep(Config.POLL_INTERVAL)
        
        logger.error("❌ Timeout: max poll attempts bereikt")
        return False
    
    def run_scraper(
        self,
        categories: List[str] = None,
        cities: List[str] = None,
        max_per_query: int = 50,
        include_emails: bool = True,
        wait_for_finish: bool = True
    ) -> List[BusinessLead]:
        """
        Start de Apify scraper met retry en fallback
        
        Args:
            categories: Categorieën om te zoeken
            cities: Steden om te doorzoeken
            max_per_query: Maximum resultaten per query
            include_emails: Email extractie aan/uit
            wait_for_finish: Wacht op voltooiing
        
        Returns:
            Lijst met BusinessLead objecten
        """
        # Defaults
        categories = categories or ["kapper", "restaurant", "fysiotherapeut"]
        cities = cities or ["Veldhoven", "Eindhoven", "Best"]
        
        # Zoek werkende actor
        self.current_actor_id = self._find_working_actor()
        if not self.current_actor_id:
            logger.error("❌ Geen werkende actor gevonden")
            return []
        
        # Bouw queries
        search_queries = self._build_search_queries(categories, cities)
        
        logger.info(f"🚀 Start Apify scraper")
        logger.info(f"📋 {len(categories)} categorieën × {len(cities)} steden = {len(search_queries)} queries")
        logger.info(f"🎯 Max {max_per_query} resultaten per query")
        logger.info(f"📧 Email extractie: {'Aan' if include_emails else 'Uit'}")
        
        # Actor input
        actor_input = {
            "searchStringsArray": search_queries,
            "maxCrawledPlacesPerSearch": max_per_query,
            "language": "nl",
            "maxImages": 0,
            "maxReviews": 0,
            "scrapeContacts": include_emails,
            "scrapeEmails": include_emails,
            "scrapeSocialMedia": include_emails,
        }
        
        try:
            # Start actor
            logger.info("⏳ Actor starten...")
            response = self.http.post(
                f"{Config.API_BASE}/acts/{self.current_actor_id}/runs",
                json=actor_input
            )
            
            if response.status_code not in (200, 201):
                logger.error(f"❌ Start failed: {response.status_code} - {response.text[:200]}")
                return []
            
            run_data = response.json()
            run_id = self._safe_get(run_data, 'data', 'id')
            dataset_id = self._safe_get(run_data, 'data', 'defaultDatasetId')
            
            if not run_id:
                logger.error("❌ Geen run ID ontvangen")
                return []
            
            logger.info(f"✅ Actor gestart - Run ID: {run_id}")
            
            # Save state
            if self.resume_manager:
                self.resume_manager.last_run_id = run_id
                self.resume_manager.save(run_id)
            
            if not wait_for_finish:
                logger.info(f"🔗 Check: https://console.apify.com/actors/runs/{run_id}")
                return []
            
            # Wacht op voltooiing
            logger.info("⏳ Wachten op resultaten...")
            if not self._wait_for_run(run_id):
                return []
            
            # Haal resultaten op
            logger.info("📥 Resultaten ophalen...")
            results_response = self.http.get(
                f"{Config.API_BASE}/datasets/{dataset_id}/items",
                params={"format": "json"}
            )
            
            if results_response.status_code != 200:
                logger.error(f"❌ Resultaten ophalen gefaald: {results_response.status_code}")
                return []
            
            raw_results = results_response.json()
            logger.info(f"📊 {len(raw_results)} ruwe resultaten ontvangen")
            
            # Parse resultaten
            for item in raw_results:
                search_query = item.get('searchString', '')
                lead = self._parse_apify_result(item, search_query)
                
                if lead:
                    unique_key = lead.get_unique_key()
                    
                    # Skip als al verwerkt (resume)
                    if self.resume_manager and self.resume_manager.is_processed(unique_key):
                        continue
                    
                    self.results.append(lead)
                    
                    if self.resume_manager:
                        self.resume_manager.mark_processed(unique_key)
            
            # Deduplicatie
            seen_keys = set()
            unique_results = []
            for lead in self.results:
                key = lead.get_unique_key()
                if key not in seen_keys:
                    seen_keys.add(key)
                    unique_results.append(lead)
            
            self.results = sorted(unique_results, key=lambda x: x.lead_score, reverse=True)
            
            # Kosten berekening
            self.total_cost = len(raw_results) * Config.COST_PER_RESULT
            
            logger.info(f"✅ {len(self.results)} unieke leads verwerkt")
            logger.info(f"💰 Geschatte kosten: ${self.total_cost:.2f}")
            
            # Save state
            if self.resume_manager:
                self.resume_manager.save(run_id)
            
            return self.results
            
        except requests.exceptions.RequestException as e:
            logger.error(f"❌ Request error: {e}")
            return []
        except Exception as e:
            logger.error(f"❌ Onverwachte fout: {e}")
            return []
    
    def export_csv(self, filename: str = None) -> str:
        """Export naar CSV (Excel-compatible met Nederlandse formatting)"""
        if not self.results:
            logger.warning("Geen resultaten om te exporteren")
            return ""
        
        output_dir = Path("output")
        output_dir.mkdir(exist_ok=True)
        
        if filename is None:
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            filename = f"apify_leads_{timestamp}.csv"
        
        filepath = output_dir / filename
        
        sorted_results = sorted(self.results, key=lambda x: x.lead_score, reverse=True)
        
        fieldnames = [
            'lead_priority', 'lead_score', 'name', 'city', 'phone', 'email',
            'website', 'has_website', 'has_email', 'rating', 'total_reviews',
            'social_facebook', 'social_instagram', 'social_linkedin',
            'categories', 'address', 'notes', 'google_maps_url', 'found_date'
        ]
        
        with open(filepath, 'w', newline='', encoding='utf-8-sig') as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames, delimiter=';')
            writer.writeheader()
            
            for lead in sorted_results:
                row = {k: getattr(lead, k, '') for k in fieldnames}
                row['has_website'] = 'Ja' if lead.has_website else 'Nee'
                row['has_email'] = 'Ja' if lead.has_email else 'Nee'
                writer.writerow(row)
        
        logger.info(f"📄 CSV geëxporteerd: {filepath}")
        return str(filepath)
    
    def export_json(self, filename: str = None) -> str:
        """Export naar JSON"""
        if not self.results:
            logger.warning("Geen resultaten om te exporteren")
            return ""
        
        output_dir = Path("output")
        output_dir.mkdir(exist_ok=True)
        
        if filename is None:
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            filename = f"apify_leads_{timestamp}.json"
        
        filepath = output_dir / filename
        
        data = [asdict(lead) for lead in sorted(self.results, key=lambda x: x.lead_score, reverse=True)]
        
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        
        logger.info(f"📄 JSON geëxporteerd: {filepath}")
        return str(filepath)
    
    def get_statistics(self) -> Dict:
        """Genereer statistieken over de resultaten"""
        if not self.results:
            return {}
        
        total = len(self.results)
        
        stats = {
            'total_leads': total,
            'no_website': sum(1 for l in self.results if not l.has_website),
            'has_email': sum(1 for l in self.results if l.has_email),
            'hot_leads': sum(1 for l in self.results if l.lead_priority == "HOT"),
            'warm_leads': sum(1 for l in self.results if l.lead_priority == "WARM"),
            'with_phone': sum(1 for l in self.results if l.phone),
            'avg_lead_score': round(sum(l.lead_score for l in self.results) / total, 1),
            'estimated_cost': round(self.total_cost, 2),
            'runtime_seconds': round((datetime.now() - self.start_time).total_seconds(), 1)
        }
        
        # Top steden
        city_counts = {}
        for lead in self.results:
            city = lead.city or "Onbekend"
            city_counts[city] = city_counts.get(city, 0) + 1
        stats['top_cities'] = sorted(city_counts.items(), key=lambda x: x[1], reverse=True)[:5]
        
        return stats
    
    def print_summary(self):
        """Print samenvatting naar console"""
        stats = self.get_statistics()
        if not stats:
            print("\n❌ Geen resultaten gevonden")
            return
        
        print("\n" + "="*60)
        print("📊 APIFY LEAD FINDER RESULTATEN")
        print("="*60)
        print(f"🎯 Totaal leads gevonden: {stats['total_leads']}")
        print(f"🔥 HOT leads: {stats['hot_leads']}")
        print(f"🌡️  WARM leads: {stats['warm_leads']}")
        print(f"❌ Zonder website: {stats['no_website']}")
        print(f"📧 Met email: {stats['has_email']}")
        print(f"📞 Met telefoon: {stats['with_phone']}")
        print(f"📈 Gemiddelde score: {stats['avg_lead_score']}/100")
        print()
        print("📍 Top steden:")
        for city, count in stats['top_cities']:
            print(f"   - {city}: {count} leads")
        print()
        print(f"💰 Geschatte kosten: ${stats['estimated_cost']}")
        print(f"⏱️  Runtime: {stats['runtime_seconds']}s")
        print("="*60)
    
    def close(self):
        """Cleanup resources"""
        self.http.close()


# =============================================================================
# CLI INTERFACE
# =============================================================================

def main():
    """Command-line interface"""
    parser = argparse.ArgumentParser(
        description='Apify Lead Finder v2.0 - Vind potentiële klanten via Google Maps',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Voorbeelden:
  python apify_lead_finder.py --cities Eindhoven Veldhoven --categories kapper restaurant
  python apify_lead_finder.py --preset brabant --max 100
  python apify_lead_finder.py --preset nederland --no-wait
  python apify_lead_finder.py --list-cities
  python apify_lead_finder.py --list-categories
  python apify_lead_finder.py --clear-cache
        """
    )
    
    parser.add_argument('--cities', nargs='+', help='Steden om te doorzoeken')
    parser.add_argument('--categories', nargs='+', help='Categorieën om te zoeken')
    parser.add_argument('--max', type=int, default=50, help='Max resultaten per query (default: 50)')
    parser.add_argument('--no-emails', action='store_true', help='Skip email extractie')
    parser.add_argument('--no-wait', action='store_true', help='Start en sluit af (async)')
    parser.add_argument('--no-resume', action='store_true', help='Negeer resume state')
    parser.add_argument('--clear-cache', action='store_true', help='Wis resume cache')
    parser.add_argument('--preset', choices=[
        'lokaal', 'brabant', 'randstad', 'noord', 'oost', 'zuid', 'nederland',  # NL
        'vlaanderen', 'brussel', 'belgie',  # BE
        'alles'  # NL + BE
    ], help='Preset regio')
    parser.add_argument('--list-cities', action='store_true', help='Toon steden')
    parser.add_argument('--list-categories', action='store_true', help='Toon categorieën')
    parser.add_argument('--output', type=str, help='Output bestandsnaam')
    
    args = parser.parse_args()
    
    # Info commands
    if args.list_cities:
        print("\n🇳🇱 Nederlandse steden:")
        for city in sorted(ApifyLeadFinder.DUTCH_CITIES):
            print(f"  - {city}")
        print(f"\n🇧🇪 Belgische steden:")
        for city in sorted(ApifyLeadFinder.BELGIAN_CITIES):
            print(f"  - {city}")
        print(f"\n📊 Totaal: {len(ApifyLeadFinder.DUTCH_CITIES)} NL + {len(ApifyLeadFinder.BELGIAN_CITIES)} BE = {len(ApifyLeadFinder.ALL_CITIES)} steden")
        return
    
    if args.list_categories:
        print("\n📁 Beschikbare categorieën:")
        for key in sorted(ApifyLeadFinder.BUSINESS_CATEGORIES.keys()):
            print(f"  - {key}")
        return
    
    if args.clear_cache:
        ResumeStateManager().clear()
        print("✅ Resume cache gewist")
        return
    
    # Check API token
    api_token = os.getenv('APIFY_API_TOKEN')
    if not api_token:
        print("❌ FOUT: APIFY_API_TOKEN niet gevonden")
        print("\n📝 Stappen:")
        print("1. Ga naar https://apify.com/ en maak een account")
        print("2. Ga naar Settings > Integrations > API tokens")
        print("3. Kopieer je Personal API token")
        print("4. Voeg toe aan .env: APIFY_API_TOKEN=jouw_token")
        sys.exit(1)
    
    # Presets - Nederland & België
    presets = {
        # Lokale tests
        'lokaal': {
            'cities': ["Veldhoven", "Eindhoven", "Best"],
            'categories': ["kapper", "restaurant", "fysiotherapeut", "autobedrijf"]
        },
        
        # Nederlandse regio's
        'brabant': {
            'cities': ["Eindhoven", "Tilburg", "Breda", "Den Bosch", "Helmond", "Oss", 
                       "Roosendaal", "Bergen op Zoom", "Veldhoven", "Waalwijk", "Best"],
            'categories': list(ApifyLeadFinder.BUSINESS_CATEGORIES.keys())[:20]
        },
        'randstad': {
            'cities': ["Amsterdam", "Rotterdam", "Den Haag", "Utrecht", "Haarlem", 
                       "Leiden", "Delft", "Dordrecht", "Zoetermeer", "Amstelveen"],
            'categories': list(ApifyLeadFinder.BUSINESS_CATEGORIES.keys())[:20]
        },
        'noord': {
            'cities': ["Groningen", "Leeuwarden", "Assen", "Emmen", "Zwolle", 
                       "Drachten", "Sneek", "Heerenveen", "Hoogeveen", "Meppel"],
            'categories': list(ApifyLeadFinder.BUSINESS_CATEGORIES.keys())[:20]
        },
        'oost': {
            'cities': ["Arnhem", "Nijmegen", "Apeldoorn", "Enschede", "Deventer",
                       "Zutphen", "Harderwijk", "Almelo", "Hengelo", "Ede"],
            'categories': list(ApifyLeadFinder.BUSINESS_CATEGORIES.keys())[:20]
        },
        'zuid': {
            'cities': ["Maastricht", "Venlo", "Heerlen", "Sittard-Geleen", "Roermond",
                       "Weert", "Kerkrade", "Venray", "Middelburg", "Vlissingen"],
            'categories': list(ApifyLeadFinder.BUSINESS_CATEGORIES.keys())[:20]
        },
        
        # Heel Nederland
        'nederland': {
            'cities': ApifyLeadFinder.DUTCH_CITIES,
            'categories': list(ApifyLeadFinder.BUSINESS_CATEGORIES.keys())
        },
        
        # België
        'vlaanderen': {
            'cities': ["Antwerpen", "Gent", "Brugge", "Leuven", "Mechelen", "Hasselt",
                       "Kortrijk", "Oostende", "Aalst", "Sint-Niklaas", "Roeselare"],
            'categories': list(ApifyLeadFinder.BUSINESS_CATEGORIES.keys())[:20]
        },
        'brussel': {
            'cities': ["Brussel", "Schaarbeek", "Anderlecht", "Molenbeek", "Elsene",
                       "Ukkel", "Vorst", "Etterbeek", "Jette", "Sint-Gillis"],
            'categories': list(ApifyLeadFinder.BUSINESS_CATEGORIES.keys())[:20]
        },
        'belgie': {
            'cities': ApifyLeadFinder.BELGIAN_CITIES,
            'categories': list(ApifyLeadFinder.BUSINESS_CATEGORIES.keys())
        },
        
        # ALLES - Nederland + België
        'alles': {
            'cities': ApifyLeadFinder.ALL_CITIES,
            'categories': list(ApifyLeadFinder.BUSINESS_CATEGORIES.keys())
        }
    }
    
    if args.preset:
        preset = presets[args.preset]
        cities = preset['cities']
        categories = preset['categories']
        print(f"📦 Preset '{args.preset}' geladen")
    else:
        cities = args.cities or ["Veldhoven", "Eindhoven", "Best"]
        categories = args.categories or ["kapper", "restaurant", "fysiotherapeut", "autobedrijf"]
    
    # Info
    print("\n🚀 Apify Lead Finder v2.0")
    print("="*60)
    print(f"📍 Steden: {len(cities)} ({', '.join(cities[:5])}{'...' if len(cities) > 5 else ''})")
    print(f"📁 Categorieën: {len(categories)}")
    print(f"🎯 Max per query: {args.max}")
    print(f"📧 Email extractie: {'Uit' if args.no_emails else 'Aan'}")
    
    total_queries = len(cities) * len(categories)
    estimated_cost = total_queries * args.max * Config.COST_PER_RESULT
    print(f"💰 Geschatte kosten: ${estimated_cost:.2f} (max {total_queries * args.max} resultaten)")
    print("="*60)
    print()
    
    # Run
    finder = ApifyLeadFinder(
        api_token=api_token,
        use_resume=not args.no_resume
    )
    
    try:
        leads = finder.run_scraper(
            categories=categories,
            cities=cities,
            max_per_query=args.max,
            include_emails=not args.no_emails,
            wait_for_finish=not args.no_wait
        )
        
        if args.no_wait:
            print("\n⏳ Scraper gestart op achtergrond")
            return
        
        finder.print_summary()
        
        if leads:
            base_name = args.output or f"apify_leads_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
            csv_file = finder.export_csv(f"{base_name}.csv")
            json_file = finder.export_json(f"{base_name}.json")
            
            print(f"\n💾 Bestanden opgeslagen:")
            print(f"   📄 CSV:  {csv_file}")
            print(f"   📄 JSON: {json_file}")
            
            print("\n🔥 TOP 5 LEADS:")
            print("-"*60)
            for i, lead in enumerate(leads[:5], 1):
                website_info = "❌ Geen website" if not lead.has_website else "🌐 Website"
                email_info = f"📧 {lead.email}" if lead.email else "📧 -"
                print(f"{i}. [{lead.lead_priority}] {lead.name}")
                print(f"   📍 {lead.city} | 📞 {lead.phone or '-'}")
                print(f"   {website_info} | {email_info}")
                if lead.notes:
                    print(f"   💡 {lead.notes}")
                print()
        
    except KeyboardInterrupt:
        print("\n\n⚠️ Gestopt door gebruiker")
        if finder.resume_manager:
            finder.resume_manager.save()
            print("💾 Voortgang opgeslagen")
    finally:
        finder.close()


if __name__ == "__main__":
    main()
