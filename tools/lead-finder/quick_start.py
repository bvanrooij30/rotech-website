"""
Quick Start Script - Snel leads vinden in jouw regio
Pas de instellingen hieronder aan en run dit script
"""

from business_lead_finder import BusinessLeadFinder
import os
import sys
from dotenv import load_dotenv

# Fix Windows console encoding voor emoji's
if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    except AttributeError:
        pass  # Python < 3.7 fallback

load_dotenv()

# ============================================================
# 🎯 PAS DEZE INSTELLINGEN AAN
# ============================================================

# Steden om te doorzoeken (kies uit: Eindhoven, Veldhoven, Amsterdam, etc.)
# Tip: Start klein met 2-3 steden
STEDEN = [
    "Veldhoven",
    "Eindhoven",
    "Best",
]

# Categorieën om te zoeken
# Tip: Kies categorieën waar jij je op wilt richten
CATEGORIEEN = [
    "kapper",
    "restaurant",
    "fysiotherapeut",
    "tandarts",
    "autobedrijf",
    "installateur",
    "aannemer",
    "schoonheidssalon",
]

# Maximum resultaten per categorie per stad
MAX_PER_CATEGORIE = 10

# Minimum lead score (0-100, hoger = betere lead)
# 70+ = focus op HOT en WARM leads
MIN_SCORE = 50

# Analyseer websites voor kwaliteitsscore? (True/False)
# False = sneller, True = betere lead scoring
ANALYSEER_WEBSITES = True

# ============================================================
# HIERONDER NIETS WIJZIGEN
# ============================================================

def main():
    api_key = os.getenv('GOOGLE_PLACES_API_KEY')
    
    if not api_key:
        print("❌ FOUT: GOOGLE_PLACES_API_KEY niet gevonden in .env bestand")
        print("\n📝 Stappen:")
        print("1. Ga naar https://console.cloud.google.com/")
        print("2. Maak een project en activeer 'Places API'")
        print("3. Maak een API key aan")
        print("4. Maak een .env bestand met: GOOGLE_PLACES_API_KEY=jouw_key")
        return
    
    print("🚀 Quick Start - Lead Finder")
    print("="*50)
    print(f"📍 Steden: {', '.join(STEDEN)}")
    print(f"📁 Categorieën: {len(CATEGORIEEN)}")
    print(f"🎯 Max per categorie: {MAX_PER_CATEGORIE}")
    print(f"📊 Minimum score: {MIN_SCORE}")
    print(f"🌐 Website analyse: {'Aan' if ANALYSEER_WEBSITES else 'Uit'}")
    print("="*50)
    print()
    
    finder = BusinessLeadFinder(
        api_key=api_key,
        analyze_websites=ANALYSEER_WEBSITES
    )
    
    try:
        leads = finder.find_leads(
            categories=CATEGORIEEN,
            cities=STEDEN,
            max_per_category=MAX_PER_CATEGORIE,
            min_lead_score=MIN_SCORE
        )
        
        finder.print_summary()
        
        if leads:
            csv_file = finder.export_csv("mijn_leads.csv")
            json_file = finder.export_json("mijn_leads.json")
            
            print(f"\n💾 Bestanden opgeslagen in 'output' map:")
            print(f"   📄 {csv_file}")
            print(f"   📄 {json_file}")
            
            # Toon top 5 leads
            print("\n🔥 TOP 5 LEADS:")
            print("-"*50)
            for i, lead in enumerate(leads[:5], 1):
                website_info = "❌ Geen website" if not lead.has_website else f"🌐 Score: {lead.website_quality_score}"
                print(f"{i}. [{lead.lead_priority}] {lead.name}")
                print(f"   📍 {lead.city} | 📞 {lead.phone or 'Geen'} | {website_info}")
                if lead.notes:
                    print(f"   💡 {lead.notes}")
                print()
        else:
            print("\n⚠️ Geen leads gevonden met deze criteria")
            print("💡 Tip: Verlaag MIN_SCORE of voeg meer steden/categorieën toe")
            
    except KeyboardInterrupt:
        print("\n\n⚠️ Gestopt door gebruiker")
        finder._save_resume_state()
        print("💾 Voortgang opgeslagen")


if __name__ == "__main__":
    main()
