"""
Lead Service - Lead import en management.
Importeert CSV data van de lead-finder.
"""

import csv
from pathlib import Path
from datetime import datetime
from typing import List, Dict, Optional, Tuple
from dataclasses import dataclass

from ..database import get_db
from ..database.models import Lead, LeadStatus, Client, ClientStatus
from ..utils.config import Config, logger
from ..utils.helpers import generate_id


@dataclass
class ImportResult:
    """Result van een import operatie."""
    total: int = 0
    imported: int = 0
    skipped: int = 0
    errors: int = 0
    batch_id: str = ""


class LeadService:
    """Service voor lead operaties."""
    
    # Mapping van mogelijke CSV column namen naar Lead velden
    COLUMN_MAPPING = {
        # Business name
        'business_name': 'business_name',
        'name': 'business_name',
        'title': 'business_name',
        'company': 'business_name',
        'bedrijfsnaam': 'business_name',
        
        # Address
        'address': 'address',
        'full_address': 'address',
        'adres': 'address',
        'street': 'address',
        
        # City
        'city': 'city',
        'location': 'city',
        'plaats': 'city',
        'stad': 'city',
        
        # Phone
        'phone': 'phone',
        'telephone': 'phone',
        'tel': 'phone',
        'telefoon': 'phone',
        
        # Email
        'email': 'email',
        'e-mail': 'email',
        'mail': 'email',
        
        # Website
        'website': 'website',
        'url': 'website',
        'site': 'website',
        
        # Score
        'lead_score': 'lead_score',
        'score': 'lead_score',
        
        # Has website
        'has_website': 'has_website',
        'website_exists': 'has_website',
        
        # Website quality
        'website_quality': 'website_quality',
        'quality': 'website_quality',
        
        # Category
        'category': 'category',
        'categorie': 'category',
        'type': 'category',
        
        # Search query
        'search_query': 'search_query',
        'query': 'search_query',
        'zoekterm': 'search_query',
    }
    
    @classmethod
    def get_lead_finder_files(cls) -> List[Path]:
        """
        Vind alle CSV bestanden in de lead-finder output folder.
        
        Returns:
            Lijst met CSV file paths, gesorteerd op datum (nieuwste eerst)
        """
        output_dir = Config.get_lead_finder_path()
        
        if not output_dir.exists():
            logger.warning(f"Lead finder output directory not found: {output_dir}")
            return []
        
        csv_files = list(output_dir.glob("*.csv"))
        csv_files.sort(key=lambda f: f.stat().st_mtime, reverse=True)
        
        return csv_files
    
    @classmethod
    def import_csv(cls, file_path: Path) -> ImportResult:
        """
        Importeer leads vanuit een CSV bestand.
        
        Args:
            file_path: Path naar CSV bestand
            
        Returns:
            ImportResult met statistieken
        """
        result = ImportResult(batch_id=generate_id())
        
        if not file_path.exists():
            logger.error(f"CSV file not found: {file_path}")
            return result
        
        try:
            # Read CSV
            with open(file_path, 'r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                rows = list(reader)
            
            result.total = len(rows)
            
            if not rows:
                logger.warning(f"Empty CSV file: {file_path}")
                return result
            
            # Map columns
            column_map = cls._map_columns(rows[0].keys())
            
            db = get_db()
            with db.session() as session:
                for row in rows:
                    try:
                        lead = cls._row_to_lead(row, column_map, result.batch_id, file_path.name)
                        
                        if not lead.business_name:
                            result.skipped += 1
                            continue
                        
                        # Check duplicate
                        existing = session.query(Lead).filter_by(
                            business_name=lead.business_name,
                            city=lead.city
                        ).first()
                        
                        if existing:
                            result.skipped += 1
                            continue
                        
                        session.add(lead)
                        result.imported += 1
                        
                    except Exception as e:
                        logger.error(f"Error importing row: {e}")
                        result.errors += 1
                
                session.commit()
            
            logger.info(
                f"Import complete: {result.imported} imported, "
                f"{result.skipped} skipped, {result.errors} errors"
            )
            
        except Exception as e:
            logger.error(f"CSV import failed: {e}")
            result.errors = result.total
        
        return result
    
    @classmethod
    def _map_columns(cls, columns) -> Dict[str, str]:
        """Map CSV columns naar Lead velden."""
        mapping = {}
        
        for col in columns:
            col_lower = col.lower().strip()
            
            if col_lower in cls.COLUMN_MAPPING:
                mapping[col] = cls.COLUMN_MAPPING[col_lower]
        
        return mapping
    
    @classmethod
    def _row_to_lead(
        cls,
        row: Dict[str, str],
        column_map: Dict[str, str],
        batch_id: str,
        source_file: str
    ) -> Lead:
        """Convert CSV row naar Lead object."""
        lead = Lead(
            status=LeadStatus.NEW.value,
            import_batch=batch_id,
            source_file=source_file,
            imported_at=datetime.now()
        )
        
        for csv_col, lead_field in column_map.items():
            value = row.get(csv_col, "").strip()
            
            if not value:
                continue
            
            if lead_field == 'lead_score':
                try:
                    setattr(lead, lead_field, float(value))
                except ValueError:
                    pass
            elif lead_field == 'has_website':
                setattr(lead, lead_field, value.lower() in ('true', '1', 'yes', 'ja'))
            else:
                setattr(lead, lead_field, value)
        
        return lead
    
    @classmethod
    def convert_to_client(cls, lead_id: int) -> Optional[Client]:
        """
        Converteer een lead naar een client.
        
        Args:
            lead_id: Lead ID
            
        Returns:
            Nieuwe Client of None
        """
        db = get_db()
        
        with db.session() as session:
            lead = session.query(Lead).get(lead_id)
            
            if not lead:
                logger.warning(f"Lead not found: {lead_id}")
                return None
            
            # Check if already converted
            if lead.client_id:
                logger.info(f"Lead {lead_id} already converted to client {lead.client_id}")
                return session.query(Client).get(lead.client_id)
            
            # Create client
            client = Client(
                name=lead.business_name,
                email=lead.email,
                phone=lead.phone,
                company=lead.business_name,
                address=lead.address,
                status=ClientStatus.PROSPECT.value
            )
            
            session.add(client)
            session.flush()  # Get client ID
            
            # Update lead
            lead.status = LeadStatus.CONVERTED.value
            lead.client_id = client.id
            
            session.commit()
            
            logger.info(f"Lead {lead_id} converted to client {client.id}")
            return client
    
    @classmethod
    def get_statistics(cls) -> Dict[str, int]:
        """
        Haal lead statistieken op.
        
        Returns:
            Dict met counts per status
        """
        db = get_db()
        
        with db.session() as session:
            stats = {
                'total': session.query(Lead).count(),
                'new': session.query(Lead).filter_by(status=LeadStatus.NEW.value).count(),
                'contacted': session.query(Lead).filter_by(status=LeadStatus.CONTACTED.value).count(),
                'qualified': session.query(Lead).filter_by(status=LeadStatus.QUALIFIED.value).count(),
                'converted': session.query(Lead).filter_by(status=LeadStatus.CONVERTED.value).count(),
                'lost': session.query(Lead).filter_by(status=LeadStatus.LOST.value).count(),
            }
        
        return stats
    
    @classmethod
    def get_high_score_leads(cls, min_score: float = 70.0, limit: int = 20) -> List[Lead]:
        """
        Haal leads op met hoge score.
        
        Args:
            min_score: Minimum score (0-100)
            limit: Maximum aantal results
            
        Returns:
            Lijst met Leads
        """
        db = get_db()
        
        with db.session() as session:
            leads = session.query(Lead).filter(
                Lead.lead_score >= min_score,
                Lead.status.in_([LeadStatus.NEW.value, LeadStatus.CONTACTED.value])
            ).order_by(Lead.lead_score.desc()).limit(limit).all()
        
        return leads
