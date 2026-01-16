"""
Apify Quick Start v2.0 - Snel leads vinden met Apify Google Maps Scraper
Pas de instellingen hieronder aan en run dit script

Author: Ro-Tech Development
"""

from apify_lead_finder import ApifyLeadFinder, Config
import os
import sys
from dotenv import load_dotenv

# Fix Windows console encoding voor emoji's
if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    except AttributeError:
        pass

load_dotenv()

# ============================================================
# 🎯 PAS DEZE INSTELLINGEN AAN
# ============================================================

# KIES EEN PRESET OF MAAK JE EIGEN SELECTIE
# Opties: "lokaal", "brabant", "randstad", "nederland", "custom"
PRESET = "lokaal"

# Als PRESET = "custom", gebruik deze instellingen:
CUSTOM_STEDEN = [
    "Veldhoven",
    "Eindhoven",
    "Best",
    "Helmond",
]

CUSTOM_CATEGORIEEN = [
    "kapper",
    "restaurant",
    "fysiotherapeut",
    "tandarts",
    "autobedrijf",
    "installateur",
    "aannemer",
    "schoonheidssalon",
    "advocaat",
    "accountant",
]

# Maximum resultaten per zoekquery (stad + categorie)
# Hoger = meer leads maar hogere kosten
MAX_PER_QUERY = 50

# Email extractie aan/uit
# Aan = emails worden van websites gehaald (aanbevolen voor lead gen)
# Uit = sneller en goedkoper
EXTRACT_EMAILS = True

# ============================================================
# PRESETS (niet wijzigen)
# ============================================================

PRESETS = {
    "lokaal": {
        "steden": ["Veldhoven", "Eindhoven", "Best"],
        "categorieen": ["kapper", "restaurant", "fysiotherapeut", "autobedrijf"],
        "beschrijving": "Jouw directe regio - 3 steden, 4 categorieën"
    },
    "brabant": {
        "steden": [
            "Eindhoven", "Veldhoven", "Best", "Helmond", "Tilburg", 
            "Den Bosch", "Breda", "Valkenswaard", "Geldrop", "Nuenen"
        ],
        "categorieen": [
            "kapper", "restaurant", "fysiotherapeut", "tandarts", "autobedrijf",
            "installateur", "aannemer", "schoonheidssalon", "advocaat", "accountant",
            "sportschool", "bloemenwinkel", "opticien", "bakkerij", "garage"
        ],
        "beschrijving": "Noord-Brabant - 10 steden, 15 categorieën"
    },
    "randstad": {
        "steden": [
            "Amsterdam", "Rotterdam", "Den Haag", "Utrecht", 
            "Haarlem", "Leiden", "Delft", "Dordrecht", "Zoetermeer", "Almere"
        ],
        "categorieen": [
            "kapper", "restaurant", "fysiotherapeut", "tandarts", "autobedrijf",
            "installateur", "aannemer", "schoonheidssalon", "advocaat", "accountant",
            "sportschool", "bloemenwinkel", "opticien", "bakkerij", "garage"
        ],
        "beschrijving": "Randstad - 10 steden, 15 categorieën"
    },
    "nederland": {
        "steden": [
            "Amsterdam", "Rotterdam", "Den Haag", "Utrecht", "Eindhoven",
            "Groningen", "Tilburg", "Almere", "Breda", "Nijmegen",
            "Apeldoorn", "Haarlem", "Arnhem", "Enschede", "Amersfoort",
            "Den Bosch", "Zwolle", "Maastricht", "Leiden", "Dordrecht",
            "Veldhoven", "Best", "Helmond", "Delft", "Alkmaar"
        ],
        "categorieen": list(ApifyLeadFinder.BUSINESS_CATEGORIES.keys()),
        "beschrijving": "Heel Nederland - 25 steden, alle categorieën"
    },
    "custom": {
        "steden": CUSTOM_STEDEN,
        "categorieen": CUSTOM_CATEGORIEEN,
        "beschrijving": "Aangepaste selectie"
    }
}

# ============================================================
# HIERONDER NIETS WIJZIGEN
# ============================================================

def calculate_cost(steden: list, categorieen: list, max_per_query: int) -> tuple:
    """Bereken geschatte kosten en resultaten"""
    total_queries = len(steden) * len(categorieen)
    max_results = total_queries * max_per_query
    # Geschatte kosten: ~$0.004 per resultaat
    estimated_cost = max_results * 0.004
    return total_queries, max_results, estimated_cost


def main():
    api_token = os.getenv('APIFY_API_TOKEN')
    
    if not api_token:
        print("❌ FOUT: APIFY_API_TOKEN niet gevonden in .env bestand")
        print("\n📝 Stappen om Apify te configureren:")
        print("1. Ga naar https://apify.com/ en maak een GRATIS account")
        print("2. Ga naar Settings > Integrations > Personal API tokens")
        print("3. Klik 'Create new token' en kopieer de token")
        print("4. Open .env en voeg toe: APIFY_API_TOKEN=jouw_token")
        print("\n💡 Gratis tier: $5 credits/maand = ~1.250 bedrijven gratis!")
        return
    
    # Laad preset
    if PRESET not in PRESETS:
        print(f"❌ Onbekende preset: {PRESET}")
        print(f"   Beschikbaar: {', '.join(PRESETS.keys())}")
        return
    
    preset = PRESETS[PRESET]
    steden = preset["steden"]
    categorieen = preset["categorieen"]
    
    # Bereken geschatte kosten
    queries, max_results, cost = calculate_cost(steden, categorieen, MAX_PER_QUERY)
    
    print("🚀 Apify Quick Start - Lead Finder")
    print("="*60)
    print(f"📦 Preset: {PRESET} - {preset['beschrijving']}")
    print(f"📍 Steden: {len(steden)}")
    print(f"📁 Categorieën: {len(categorieen)}")
    print(f"🔍 Zoekqueries: {queries}")
    print(f"🎯 Max resultaten: {max_results:,}")
    print(f"📧 Email extractie: {'Aan' if EXTRACT_EMAILS else 'Uit'}")
    print(f"💰 Geschatte kosten: ${cost:.2f}")
    print("="*60)
    print()
    
    # Bevestiging vragen bij grote runs
    if cost > 5:
        print(f"⚠️  Let op: Dit kost meer dan de gratis tier ($5)")
        confirm = input("Doorgaan? (j/n): ").strip().lower()
        if confirm != 'j':
            print("❌ Geannuleerd")
            return
        print()
    
    # Start finder
    finder = ApifyLeadFinder(api_token=api_token)
    
    try:
        print("⏳ Apify scraper starten...")
        print("   Dit kan enkele minuten duren afhankelijk van het aantal queries")
        print()
        
        leads = finder.run_scraper(
            categories=categorieen,
            cities=steden,
            max_per_query=MAX_PER_QUERY,
            include_emails=EXTRACT_EMAILS,
            wait_for_finish=True
        )
        
        finder.print_summary()
        
        if leads:
            csv_file = finder.export_csv("mijn_apify_leads.csv")
            json_file = finder.export_json("mijn_apify_leads.json")
            
            print(f"\n💾 Bestanden opgeslagen in 'output' map:")
            print(f"   📄 {csv_file}")
            print(f"   📄 {json_file}")
            
            # Toon top 10 HOT leads
            hot_leads = [l for l in leads if l.lead_priority == "HOT"]
            if hot_leads:
                print(f"\n🔥 TOP {min(10, len(hot_leads))} HOT LEADS (geen website):")
                print("-"*60)
                for i, lead in enumerate(hot_leads[:10], 1):
                    email_info = f"📧 {lead.email}" if lead.email else "📧 -"
                    print(f"{i}. {lead.name}")
                    print(f"   📍 {lead.city} | 📞 {lead.phone or '-'} | {email_info}")
                    if lead.notes:
                        print(f"   💡 {lead.notes}")
                    print()
            
            print("="*60)
            print("✅ KLAAR! Open de CSV in Excel om alle leads te bekijken")
            print("💡 TIP: Filter op 'lead_priority' = HOT voor de beste leads")
            print("💡 TIP: Sorteer op 'has_email' = Ja voor makkelijk te contacten leads")
            print("="*60)
        else:
            print("\n⚠️ Geen leads gevonden")
            print("💡 Tip: Controleer je Apify account balance")
            print("💡 Tip: Probeer andere categorieën of steden")
            
    except KeyboardInterrupt:
        print("\n\n⚠️ Gestopt door gebruiker")
    except Exception as e:
        print(f"\n❌ Fout: {e}")


if __name__ == "__main__":
    main()
