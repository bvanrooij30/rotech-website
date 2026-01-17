"""
Business Lead Finder v2.0
Zoek potentiële klanten voor website development via Google Places API
Met website kwaliteit check, lead scoring en betere error handling

Author: Ro-Tech Development
"""

import googlemaps
import requests
import json
import csv
import time
import re
import logging
from typing import List, Dict, Optional, Tuple
from datetime import datetime
from dataclasses import dataclass, asdict
from pathlib import Path
import os
from dotenv import load_dotenv
from urllib.parse import urlparse
import argparse
import sys

# Fix Windows console encoding voor emoji's
if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    except AttributeError:
        pass  # Python < 3.7 fallback

load_dotenv()

# Logging setup
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('lead_finder.log', encoding='utf-8'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)


@dataclass
class BusinessLead:
    """Data class voor een business lead"""
    name: str
    address: str
    city: str = ""
    phone: str = ""
    phone_international: str = ""
    website: str = ""
    email: str = ""
    rating: float = 0.0
    total_reviews: int = 0
    business_status: str = ""
    types: str = ""
    place_id: str = ""
    has_website: bool = False
    website_quality_score: int = 0
    lead_score: int = 0
    lead_priority: str = ""
    latitude: float = 0.0
    longitude: float = 0.0
    found_date: str = ""
    category_searched: str = ""
    notes: str = ""


class WebsiteAnalyzer:
    """Analyseer website kwaliteit om lead potentieel te bepalen"""
    
    def __init__(self, timeout: int = 5):
        self.timeout = timeout
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
    
    def analyze(self, url: str) -> Dict:
        """
        Analyseer een website op kwaliteit
        
        Returns:
            Dict met score en bevindingen
        """
        if not url:
            return {'score': 0, 'has_website': False, 'issues': ['Geen website']}
        
        result = {
            'score': 100,
            'has_website': True,
            'is_responsive': False,
            'has_ssl': False,
            'is_fast': False,
            'is_outdated': False,
            'issues': [],
            'opportunities': []
        }
        
        try:
            # Check SSL
            result['has_ssl'] = url.startswith('https://')
            if not result['has_ssl']:
                result['score'] -= 20
                result['issues'].append('Geen HTTPS')
                result['opportunities'].append('SSL certificaat nodig')
            
            # Probeer website te laden
            start_time = time.time()
            response = self.session.get(url, timeout=self.timeout, allow_redirects=True)
            load_time = time.time() - start_time
            
            # Check laadtijd
            result['is_fast'] = load_time < 3
            if load_time > 5:
                result['score'] -= 15
                result['issues'].append(f'Langzame website ({load_time:.1f}s)')
                result['opportunities'].append('Website snelheid optimalisatie')
            
            html = response.text.lower()
            
            # Check responsive design
            result['is_responsive'] = 'viewport' in html or '@media' in html
            if not result['is_responsive']:
                result['score'] -= 25
                result['issues'].append('Niet mobiel-vriendelijk')
                result['opportunities'].append('Responsive redesign nodig')
            
            # Check voor outdated technologie
            outdated_signs = [
                'jquery/1.',
                'bootstrap/2.',
                'bootstrap/3.',
                'wordpress/3.',
                'wordpress/4.',
                '<table',
                '<marquee',
                '<blink',
                '<frame',
            ]
            for sign in outdated_signs:
                if sign in html:
                    result['is_outdated'] = True
                    result['score'] -= 10
                    break
            
            if result['is_outdated']:
                result['issues'].append('Verouderde technologie')
                result['opportunities'].append('Moderne website rebuild')
            
            # Check voor basis SEO
            has_meta_description = 'meta name="description"' in html or "meta name='description'" in html
            has_title = '<title>' in html and '</title>' in html
            
            if not has_meta_description:
                result['score'] -= 10
                result['issues'].append('Geen meta description')
                result['opportunities'].append('SEO optimalisatie')
            
            if not has_title or '<title></title>' in html:
                result['score'] -= 10
                result['issues'].append('Geen of lege titel')
            
            # Check voor social media
            has_social = any(sm in html for sm in ['facebook', 'instagram', 'linkedin', 'twitter'])
            if not has_social:
                result['opportunities'].append('Social media integratie')
            
            result['score'] = max(0, result['score'])
            
        except requests.exceptions.SSLError:
            result['score'] = 30
            result['issues'].append('SSL certificaat problemen')
            result['opportunities'].append('SSL certificaat reparatie')
        except requests.exceptions.Timeout:
            result['score'] = 20
            result['issues'].append('Website timeout')
            result['opportunities'].append('Hosting/performance verbetering')
        except requests.exceptions.ConnectionError:
            result['score'] = 10
            result['issues'].append('Website niet bereikbaar')
            result['opportunities'].append('Website reparatie/hosting')
        except Exception as e:
            result['score'] = 50
            result['issues'].append(f'Analyse fout: {str(e)[:50]}')
        
        return result


class BusinessLeadFinder:
    """
    Zoekt bedrijven die potentiële klanten kunnen zijn voor website development
    """
    
    # Nederlandse steden met coördinaten
    DUTCH_CITIES = {
        "Amsterdam": (52.3676, 4.9041),
        "Rotterdam": (51.9225, 4.4792),
        "Den Haag": (52.0705, 4.3007),
        "Utrecht": (52.0907, 5.1214),
        "Eindhoven": (51.4416, 5.4697),
        "Groningen": (53.2194, 6.5665),
        "Tilburg": (51.5555, 5.0913),
        "Almere": (52.3508, 5.2647),
        "Breda": (51.5719, 4.7683),
        "Nijmegen": (51.8426, 5.8546),
        "Apeldoorn": (52.2112, 5.9699),
        "Haarlem": (52.3874, 4.6462),
        "Arnhem": (51.9851, 5.8987),
        "Enschede": (52.2215, 6.8937),
        "Amersfoort": (52.1561, 5.3878),
        "Zaanstad": (52.4399, 4.8156),
        "Den Bosch": (51.6978, 5.3037),
        "Haarlemmermeer": (52.3030, 4.6972),
        "Zwolle": (52.5168, 6.0830),
        "Maastricht": (50.8514, 5.6909),
        "Leiden": (52.1601, 4.4970),
        "Dordrecht": (51.8133, 4.6901),
        "Zoetermeer": (52.0575, 4.4931),
        "Emmen": (52.7792, 6.9069),
        "Westland": (52.0000, 4.2167),
        "Ede": (52.0402, 5.6648),
        "Venlo": (51.3704, 6.1724),
        "Delft": (52.0116, 4.3571),
        "Deventer": (52.2549, 6.1630),
        "Alkmaar": (52.6324, 4.7534),
        "Veldhoven": (51.4200, 5.4039),
        "Best": (51.5095, 5.3932),
        "Son en Breugel": (51.5125, 5.4975),
        "Helmond": (51.4758, 5.6556),
        "Valkenswaard": (51.3517, 5.4614),
    }
    
    # Categorieën met Nederlandse zoektermen
    BUSINESS_CATEGORIES = {
        # Horeca
        "restaurant": "restaurant",
        "cafe": "café",
        "snackbar": "snackbar",
        "bakkerij": "bakkerij",
        "slagerij": "slagerij",
        
        # Dienstverlening
        "kapper": "kapper",
        "schoonheidssalon": "schoonheidssalon",
        "nagelstudio": "nagelstudio",
        "tattoo": "tattooshop",
        
        # Gezondheid
        "fysiotherapeut": "fysiotherapeut",
        "tandarts": "tandarts",
        "huisarts": "huisarts",
        "apotheek": "apotheek",
        "dierenarts": "dierenarts",
        "opticien": "opticien",
        
        # Bouw & Techniek
        "aannemer": "aannemer",
        "installateur": "installateur",
        "elektricien": "elektricien",
        "loodgieter": "loodgieter",
        "schilder": "schilder",
        "timmerman": "timmerman",
        "dakdekker": "dakdekker",
        "tuinman": "hoveniersbedrijf",
        "glazenwasser": "glazenwasser",
        "schoonmaakbedrijf": "schoonmaakbedrijf",
        
        # Automotive
        "autobedrijf": "autobedrijf",
        "garage": "autogarage",
        "autopoetsen": "autopoetsbedrijf",
        "bandencentrale": "bandencentrale",
        
        # Zakelijk
        "advocaat": "advocaat",
        "accountant": "accountant",
        "notaris": "notaris",
        "makelaar": "makelaar",
        "verzekeringen": "verzekeringsadviseur",
        "boekhouder": "boekhouder",
        
        # Sport & Leisure
        "sportschool": "sportschool",
        "yogastudio": "yogastudio",
        "dansstudio": "dansschool",
        "zwemschool": "zwemschool",
        
        # Retail
        "bloemenwinkel": "bloemenwinkel",
        "fietsenwinkel": "fietsenwinkel",
        "kledingwinkel": "kledingwinkel",
        "cadeauwinkel": "cadeauwinkel",
        "dierenwinkel": "dierenwinkel",
    }
    
    def __init__(self, api_key: str, analyze_websites: bool = True):
        """
        Initialiseer de Business Lead Finder
        
        Args:
            api_key: Google Places API key
            analyze_websites: Of websites geanalyseerd moeten worden
        """
        if not api_key:
            raise ValueError("Google Places API key is vereist")
        
        self.client = googlemaps.Client(key=api_key)
        self.website_analyzer = WebsiteAnalyzer() if analyze_websites else None
        self.results: List[BusinessLead] = []
        self.request_count = 0
        self.start_time = datetime.now()
        
        # Resume state
        self.processed_place_ids: set = set()
        self._load_resume_state()
    
    def _load_resume_state(self):
        """Laad eerder verwerkte place_ids om dubbel werk te voorkomen"""
        resume_file = Path("output/.resume_state.json")
        if resume_file.exists():
            try:
                with open(resume_file, 'r') as f:
                    data = json.load(f)
                    self.processed_place_ids = set(data.get('processed_ids', []))
                    logger.info(f"Resume state geladen: {len(self.processed_place_ids)} eerder verwerkte bedrijven")
            except Exception as e:
                logger.warning(f"Kon resume state niet laden: {e}")
    
    def _save_resume_state(self):
        """Sla verwerkte place_ids op voor resume"""
        output_dir = Path("output")
        output_dir.mkdir(exist_ok=True)
        resume_file = output_dir / ".resume_state.json"
        try:
            with open(resume_file, 'w') as f:
                json.dump({
                    'processed_ids': list(self.processed_place_ids),
                    'last_updated': datetime.now().isoformat()
                }, f)
        except Exception as e:
            logger.warning(f"Kon resume state niet opslaan: {e}")
    
    def _extract_city_from_address(self, address: str) -> str:
        """Extraheer stad uit adres"""
        if not address:
            return ""
        
        # Probeer postcode + stad patroon te vinden
        match = re.search(r'\d{4}\s*[A-Z]{2}\s+([A-Za-z\s\-]+)', address)
        if match:
            return match.group(1).strip()
        
        # Anders: probeer bekende steden te vinden
        for city in self.DUTCH_CITIES.keys():
            if city.lower() in address.lower():
                return city
        
        return ""
    
    def _calculate_lead_score(self, lead: BusinessLead, website_analysis: Dict = None) -> Tuple[int, str]:
        """
        Bereken lead score (0-100) en prioriteit
        
        Hogere score = betere lead voor website development
        """
        score = 50  # Basis score
        
        # Geen website = beste lead (+40)
        if not lead.has_website:
            score += 40
        elif website_analysis:
            # Slechte website = goede lead
            website_score = website_analysis.get('score', 100)
            if website_score < 50:
                score += 30  # Zeer slechte website
            elif website_score < 70:
                score += 20  # Matige website
            elif website_score < 85:
                score += 10  # Redelijke website
        
        # Heeft telefoon = serieus bedrijf (+10)
        if lead.phone:
            score += 10
        
        # Goede rating = gevestigd bedrijf (+5)
        if lead.rating >= 4.0:
            score += 5
        
        # Veel reviews = populair bedrijf (+5)
        if lead.total_reviews >= 10:
            score += 5
        
        # Actief bedrijf (+5)
        if lead.business_status == "OPERATIONAL":
            score += 5
        
        # Bepaal prioriteit
        if score >= 85:
            priority = "HOT"
        elif score >= 70:
            priority = "WARM"
        elif score >= 50:
            priority = "MEDIUM"
        else:
            priority = "LOW"
        
        return min(100, score), priority
    
    def search_businesses(
        self,
        query: str,
        location: Tuple[float, float] = None,
        radius: int = 10000,
        max_results: int = 20
    ) -> List[BusinessLead]:
        """
        Zoek bedrijven in een specifieke locatie
        
        Args:
            query: Zoekterm
            location: (lat, lng) tuple
            radius: Zoekradius in meters
            max_results: Maximum aantal resultaten
        """
        businesses = []
        
        try:
            # Gebruik nearby search voor betere lokale resultaten
            if location:
                places_result = self.client.places_nearby(
                    location=location,
                    radius=radius,
                    keyword=query,
                    language='nl'
                )
            else:
                # Text search als fallback
                places_result = self.client.places(
                    query=f"{query} Nederland",
                    language='nl'
                )
            
            self.request_count += 1
            
            results = places_result.get('results', [])
            next_page_token = places_result.get('next_page_token')
            
            # Verwerk eerste pagina
            for place in results[:max_results]:
                if place.get('place_id') in self.processed_place_ids:
                    continue
                    
                lead = self._get_business_details(place.get('place_id'), query)
                if lead:
                    businesses.append(lead)
                    self.processed_place_ids.add(lead.place_id)
            
            # Haal volgende pagina's op indien nodig
            while next_page_token and len(businesses) < max_results:
                time.sleep(2)  # Google vereist delay
                
                if location:
                    places_result = self.client.places_nearby(
                        location=location,
                        page_token=next_page_token
                    )
                else:
                    places_result = self.client.places(
                        page_token=next_page_token
                    )
                
                self.request_count += 1
                
                for place in places_result.get('results', []):
                    if len(businesses) >= max_results:
                        break
                    if place.get('place_id') in self.processed_place_ids:
                        continue
                        
                    lead = self._get_business_details(place.get('place_id'), query)
                    if lead:
                        businesses.append(lead)
                        self.processed_place_ids.add(lead.place_id)
                
                next_page_token = places_result.get('next_page_token')
            
            # Save resume state periodiek
            if self.request_count % 10 == 0:
                self._save_resume_state()
                
        except googlemaps.exceptions.ApiError as e:
            logger.error(f"Google API Error: {e}")
        except Exception as e:
            logger.error(f"Fout bij zoeken: {e}")
        
        return businesses
    
    def _get_business_details(self, place_id: str, category: str = "") -> Optional[BusinessLead]:
        """Haal volledige bedrijfsdetails op"""
        if not place_id:
            return None
        
        try:
            # Rate limiting
            time.sleep(0.1)
            
            details = self.client.place(
                place_id=place_id,
                fields=[
                    'name',
                    'formatted_address',
                    'formatted_phone_number',
                    'international_phone_number',
                    'website',
                    'rating',
                    'user_ratings_total',
                    'business_status',
                    'types',
                    'geometry'
                ],
                language='nl'
            )
            
            self.request_count += 1
            
            result = details.get('result', {})
            if not result:
                return None
            
            address = result.get('formatted_address', '')
            website = result.get('website', '')
            
            lead = BusinessLead(
                name=result.get('name', ''),
                address=address,
                city=self._extract_city_from_address(address),
                phone=result.get('formatted_phone_number', ''),
                phone_international=result.get('international_phone_number', ''),
                website=website,
                rating=result.get('rating', 0),
                total_reviews=result.get('user_ratings_total', 0),
                business_status=result.get('business_status', ''),
                types=', '.join(result.get('types', [])),
                place_id=place_id,
                has_website=bool(website),
                latitude=result.get('geometry', {}).get('location', {}).get('lat', 0),
                longitude=result.get('geometry', {}).get('location', {}).get('lng', 0),
                found_date=datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                category_searched=category
            )
            
            # Analyseer website indien aanwezig
            website_analysis = None
            if self.website_analyzer and website:
                website_analysis = self.website_analyzer.analyze(website)
                lead.website_quality_score = website_analysis.get('score', 0)
                if website_analysis.get('opportunities'):
                    lead.notes = '; '.join(website_analysis['opportunities'])
            
            # Bereken lead score
            score, priority = self._calculate_lead_score(lead, website_analysis)
            lead.lead_score = score
            lead.lead_priority = priority
            
            return lead
            
        except Exception as e:
            logger.warning(f"Fout bij ophalen details: {e}")
            return None
    
    def find_leads(
        self,
        categories: List[str] = None,
        cities: List[str] = None,
        max_per_category: int = 10,
        min_lead_score: int = 0
    ) -> List[BusinessLead]:
        """
        Zoek leads in meerdere categorieën en steden
        
        Args:
            categories: Lijst van categorieën (gebruik keys van BUSINESS_CATEGORIES)
            cities: Lijst van steden (gebruik keys van DUTCH_CITIES)
            max_per_category: Max resultaten per categorie per stad
            min_lead_score: Minimum lead score om te bewaren
        """
        if categories is None:
            categories = list(self.BUSINESS_CATEGORIES.keys())[:5]  # Default: eerste 5
        
        if cities is None:
            cities = ["Eindhoven", "Veldhoven"]  # Default: lokaal
        
        total_searches = len(categories) * len(cities)
        current_search = 0
        
        logger.info(f"Start zoeken: {len(categories)} categorieën × {len(cities)} steden = {total_searches} zoekopdrachten")
        
        for city in cities:
            if city not in self.DUTCH_CITIES:
                logger.warning(f"Stad '{city}' niet gevonden, skip...")
                continue
            
            location = self.DUTCH_CITIES[city]
            
            for category_key in categories:
                current_search += 1
                query = self.BUSINESS_CATEGORIES.get(category_key, category_key)
                
                logger.info(f"[{current_search}/{total_searches}] Zoeken: '{query}' in {city}")
                
                leads = self.search_businesses(
                    query=query,
                    location=location,
                    max_results=max_per_category
                )
                
                # Filter op minimum score
                for lead in leads:
                    if lead.lead_score >= min_lead_score:
                        self.results.append(lead)
                        priority_emoji = {"HOT": "🔥", "WARM": "🌡️", "MEDIUM": "📊", "LOW": "📉"}.get(lead.lead_priority, "")
                        website_status = "❌ Geen website" if not lead.has_website else f"🌐 {lead.website_quality_score}/100"
                        logger.info(f"  {priority_emoji} [{lead.lead_score}] {lead.name} - {website_status}")
                
                # Kleine pauze tussen zoekopdrachten
                time.sleep(1)
        
        # Verwijder duplicaten
        seen_ids = set()
        unique_results = []
        for lead in self.results:
            if lead.place_id not in seen_ids:
                seen_ids.add(lead.place_id)
                unique_results.append(lead)
        
        self.results = sorted(unique_results, key=lambda x: x.lead_score, reverse=True)
        self._save_resume_state()
        
        return self.results
    
    def export_csv(self, filename: str = None) -> str:
        """Export naar CSV"""
        if not self.results:
            logger.warning("Geen resultaten om te exporteren")
            return ""
        
        output_dir = Path("output")
        output_dir.mkdir(exist_ok=True)
        
        if filename is None:
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            filename = f"leads_{timestamp}.csv"
        
        filepath = output_dir / filename
        
        # Sorteer op lead score
        sorted_results = sorted(self.results, key=lambda x: x.lead_score, reverse=True)
        
        with open(filepath, 'w', newline='', encoding='utf-8-sig') as f:  # utf-8-sig voor Excel
            fieldnames = [
                'lead_priority', 'lead_score', 'name', 'city', 'phone', 'website',
                'has_website', 'website_quality_score', 'rating', 'total_reviews',
                'category_searched', 'address', 'email', 'notes', 'place_id', 'found_date'
            ]
            writer = csv.DictWriter(f, fieldnames=fieldnames, delimiter=';')  # ; voor Nederlandse Excel
            writer.writeheader()
            
            for lead in sorted_results:
                row = {k: getattr(lead, k, '') for k in fieldnames}
                writer.writerow(row)
        
        logger.info(f"Geëxporteerd naar: {filepath}")
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
            filename = f"leads_{timestamp}.json"
        
        filepath = output_dir / filename
        
        data = [asdict(lead) for lead in sorted(self.results, key=lambda x: x.lead_score, reverse=True)]
        
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        
        logger.info(f"Geëxporteerd naar: {filepath}")
        return str(filepath)
    
    def get_statistics(self) -> Dict:
        """Genereer statistieken"""
        if not self.results:
            return {}
        
        total = len(self.results)
        no_website = sum(1 for l in self.results if not l.has_website)
        hot_leads = sum(1 for l in self.results if l.lead_priority == "HOT")
        warm_leads = sum(1 for l in self.results if l.lead_priority == "WARM")
        with_phone = sum(1 for l in self.results if l.phone)
        
        # Top steden
        city_counts = {}
        for lead in self.results:
            city = lead.city or "Onbekend"
            city_counts[city] = city_counts.get(city, 0) + 1
        top_cities = sorted(city_counts.items(), key=lambda x: x[1], reverse=True)[:5]
        
        # Top categorieën
        category_counts = {}
        for lead in self.results:
            cat = lead.category_searched or "Onbekend"
            category_counts[cat] = category_counts.get(cat, 0) + 1
        top_categories = sorted(category_counts.items(), key=lambda x: x[1], reverse=True)[:5]
        
        runtime = (datetime.now() - self.start_time).total_seconds()
        
        return {
            'total_leads': total,
            'no_website': no_website,
            'hot_leads': hot_leads,
            'warm_leads': warm_leads,
            'with_phone': with_phone,
            'avg_lead_score': round(sum(l.lead_score for l in self.results) / total, 1),
            'top_cities': top_cities,
            'top_categories': top_categories,
            'api_requests': self.request_count,
            'runtime_seconds': round(runtime, 1)
        }
    
    def print_summary(self):
        """Print samenvatting naar console"""
        stats = self.get_statistics()
        if not stats:
            print("\n❌ Geen resultaten gevonden")
            return
        
        print("\n" + "="*60)
        print("📊 LEAD FINDER RESULTATEN")
        print("="*60)
        print(f"🎯 Totaal leads gevonden: {stats['total_leads']}")
        print(f"🔥 HOT leads (geen/slechte website): {stats['hot_leads']}")
        print(f"🌡️  WARM leads: {stats['warm_leads']}")
        print(f"❌ Zonder website: {stats['no_website']}")
        print(f"📞 Met telefoonnummer: {stats['with_phone']}")
        print(f"📈 Gemiddelde lead score: {stats['avg_lead_score']}/100")
        print()
        print("📍 Top steden:")
        for city, count in stats['top_cities']:
            print(f"   - {city}: {count} leads")
        print()
        print("📁 Top categorieën:")
        for cat, count in stats['top_categories']:
            print(f"   - {cat}: {count} leads")
        print()
        print(f"⚡ API requests: {stats['api_requests']}")
        print(f"⏱️  Runtime: {stats['runtime_seconds']}s")
        print("="*60)


def main():
    """CLI interface"""
    parser = argparse.ArgumentParser(
        description='Business Lead Finder - Vind potentiële klanten voor website development',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Voorbeelden:
  python business_lead_finder.py --cities Eindhoven Veldhoven --categories kapper restaurant
  python business_lead_finder.py --cities Amsterdam --max 20 --min-score 70
  python business_lead_finder.py --list-cities
  python business_lead_finder.py --list-categories
        """
    )
    
    parser.add_argument('--cities', nargs='+', help='Steden om te doorzoeken')
    parser.add_argument('--categories', nargs='+', help='Categorieën om te zoeken')
    parser.add_argument('--max', type=int, default=10, help='Max resultaten per categorie per stad (default: 10)')
    parser.add_argument('--min-score', type=int, default=0, help='Minimum lead score (default: 0)')
    parser.add_argument('--no-website-check', action='store_true', help='Skip website analyse (sneller)')
    parser.add_argument('--list-cities', action='store_true', help='Toon beschikbare steden')
    parser.add_argument('--list-categories', action='store_true', help='Toon beschikbare categorieën')
    parser.add_argument('--output', type=str, help='Output bestandsnaam (zonder extensie)')
    
    args = parser.parse_args()
    
    # Toon beschikbare opties
    if args.list_cities:
        print("\n📍 Beschikbare steden:")
        for city in sorted(BusinessLeadFinder.DUTCH_CITIES.keys()):
            print(f"  - {city}")
        return
    
    if args.list_categories:
        print("\n📁 Beschikbare categorieën:")
        for key, value in sorted(BusinessLeadFinder.BUSINESS_CATEGORIES.items()):
            print(f"  - {key} ({value})")
        return
    
    # Check API key
    api_key = os.getenv('GOOGLE_PLACES_API_KEY')
    if not api_key:
        print("❌ FOUT: GOOGLE_PLACES_API_KEY niet gevonden")
        print("\n📝 Maak een .env bestand met:")
        print("   GOOGLE_PLACES_API_KEY=jouw_api_key_hier")
        print("\n🔗 Haal je API key op via: https://console.cloud.google.com/apis/credentials")
        sys.exit(1)
    
    # Initialiseer finder
    try:
        finder = BusinessLeadFinder(
            api_key=api_key,
            analyze_websites=not args.no_website_check
        )
    except Exception as e:
        print(f"❌ Kon niet initialiseren: {e}")
        sys.exit(1)
    
    # Zoek leads
    print("\n🚀 Business Lead Finder v2.0 gestart")
    print("="*60)
    
    cities = args.cities or ["Eindhoven", "Veldhoven"]
    categories = args.categories or ["kapper", "restaurant", "fysiotherapeut", "installateur", "autobedrijf"]
    
    print(f"📍 Steden: {', '.join(cities)}")
    print(f"📁 Categorieën: {', '.join(categories)}")
    print(f"🎯 Max per categorie: {args.max}")
    if args.min_score > 0:
        print(f"📊 Minimum score: {args.min_score}")
    print()
    
    try:
        leads = finder.find_leads(
            categories=categories,
            cities=cities,
            max_per_category=args.max,
            min_lead_score=args.min_score
        )
        
        # Toon samenvatting
        finder.print_summary()
        
        # Export
        if leads:
            base_name = args.output or f"leads_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
            csv_file = finder.export_csv(f"{base_name}.csv")
            json_file = finder.export_json(f"{base_name}.json")
            
            print(f"\n💾 Bestanden opgeslagen:")
            print(f"   📄 CSV:  {csv_file}")
            print(f"   📄 JSON: {json_file}")
            print(f"\n💡 TIP: Open de CSV in Excel om leads te bekijken en filteren")
            print(f"💡 TIP: Sorteer op 'lead_score' voor de beste leads bovenaan")
        
    except KeyboardInterrupt:
        print("\n\n⚠️  Afgebroken door gebruiker")
        finder._save_resume_state()
        print("💾 Voortgang opgeslagen - run opnieuw om verder te gaan")
    except Exception as e:
        logger.error(f"Fout: {e}")
        finder._save_resume_state()
        sys.exit(1)


if __name__ == "__main__":
    main()
