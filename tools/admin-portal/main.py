#!/usr/bin/env python3
"""
Ro-Tech Admin Portal
====================

Lokale desktop applicatie voor beheer van emails, leads en klanten.

Usage:
    python main.py              # Start de GUI
    python main.py --init-db    # Initialiseer database
    python main.py --version    # Toon versie

Author: Ro-Tech Development
"""

import sys
import argparse
from pathlib import Path

# Voeg src toe aan path
sys.path.insert(0, str(Path(__file__).parent))


def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(
        description="Ro-Tech Admin Portal - Lokaal beheerportaal"
    )
    parser.add_argument(
        "--init-db",
        action="store_true",
        help="Initialiseer de database"
    )
    parser.add_argument(
        "--version",
        action="store_true",
        help="Toon versie informatie"
    )
    
    args = parser.parse_args()
    
    if args.version:
        from src import __version__
        print(f"Ro-Tech Admin Portal v{__version__}")
        return
    
    if args.init_db:
        print("Database initialiseren...")
        from src.database import init_db
        init_db()
        print("✅ Database geïnitialiseerd!")
        return
    
    # Start GUI
    print("🏢 Ro-Tech Admin Portal wordt gestart...")
    
    try:
        from src.gui import AdminPortalApp
        
        app = AdminPortalApp()
        app.run()
        
    except ImportError as e:
        print(f"\n❌ Import error: {e}")
        print("\nZorg dat je de dependencies hebt geïnstalleerd:")
        print("  pip install -r requirements.txt")
        sys.exit(1)
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
