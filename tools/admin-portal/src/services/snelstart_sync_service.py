"""
Snelstart Sync Service - Synchronisatie van facturen en klanten met Snelstart.
"""

import threading
import time
from datetime import datetime
from typing import Optional, List, Dict, Tuple, Callable
from dataclasses import dataclass

from ..database import get_db
from ..database.models import Invoice, InvoiceType, InvoiceStatus, Client
from ..utils.config import Config, logger
from .snelstart_api import get_snelstart_api, SnelstartStatus


@dataclass
class SyncResult:
    """Result of a sync operation."""
    synced: int = 0
    errors: int = 0
    skipped: int = 0
    error_messages: List[str] = None
    
    def __post_init__(self):
        if self.error_messages is None:
            self.error_messages = []


class SnelstartSyncService:
    """
    Service voor synchronisatie van facturen en klanten met Snelstart.
    
    Workflow:
    1. Klanten in Portal → Relaties in Snelstart
    2. Facturen in Portal → Verkoopboekingen in Snelstart
    """
    
    def __init__(self):
        self.api = get_snelstart_api()
        
        # Cache for grootboekrekeningen
        self._grootboek_cache: Optional[List[Dict]] = None
        self._grootboek_cache_time: Optional[datetime] = None
        self._grootboek_cache_duration = 3600  # 1 hour
        
        # Default grootboek for revenue (usually 8000-range)
        self._default_grootboek_id: Optional[str] = None
    
    def _get_grootboek_omzet(self) -> Optional[str]:
        """
        Get the grootboekrekening ID for revenue (omzet).
        Typically 8000 or similar.
        """
        if self._default_grootboek_id:
            return self._default_grootboek_id
        
        # Check cache
        if self._grootboek_cache and self._grootboek_cache_time:
            if (datetime.now() - self._grootboek_cache_time).seconds < self._grootboek_cache_duration:
                pass  # Use cache
            else:
                self._grootboek_cache = None
        
        if not self._grootboek_cache:
            success, data = self.api.get_grootboekrekeningen()
            if success and isinstance(data, list):
                self._grootboek_cache = data
                self._grootboek_cache_time = datetime.now()
            else:
                logger.error("Failed to fetch grootboekrekeningen")
                return None
        
        # Find omzet rekening (usually starts with 8)
        for gb in self._grootboek_cache:
            nummer = gb.get("nummer", 0)
            if 8000 <= nummer < 9000:
                self._default_grootboek_id = gb.get("id")
                logger.info(f"Using grootboek {nummer} for revenue: {self._default_grootboek_id}")
                return self._default_grootboek_id
        
        # Fallback: use first available
        if self._grootboek_cache:
            self._default_grootboek_id = self._grootboek_cache[0].get("id")
            return self._default_grootboek_id
        
        return None
    
    # =========================================================================
    # Client → Relatie Sync
    # =========================================================================
    
    def sync_client_to_snelstart(self, client: Client) -> Tuple[bool, str]:
        """
        Synchroniseer een klant naar Snelstart als relatie.
        
        Args:
            client: Client object from database
            
        Returns:
            Tuple of (success, snelstart_relatie_id or error message)
        """
        if not self.api.is_configured():
            return False, "Snelstart API niet geconfigureerd"
        
        # Check if already synced
        if client.snelstart_relatie_id:
            # Update existing
            return self._update_relatie(client)
        else:
            # Create new
            return self._create_relatie(client)
    
    def _create_relatie(self, client: Client) -> Tuple[bool, str]:
        """Create new relatie in Snelstart."""
        # Generate unique relatiecode
        relatiecode = f"RT{client.id:05d}"
        
        # Build relatie object
        relatie = {
            "relatiecode": relatiecode,
            "naam": client.company or client.name,
            "email": client.email,
            "telefoon": client.phone,
        }
        
        # Add address if available
        if client.address:
            relatie["vestigingsAdres"] = {
                "straat": client.address,
            }
        
        success, data = self.api.create_relatie(relatie)
        
        if success:
            relatie_id = data.get("id")
            
            # Update client in database
            db = get_db()
            with db.session() as session:
                db_client = session.query(Client).get(client.id)
                if db_client:
                    db_client.snelstart_relatie_id = relatie_id
                    db_client.snelstart_sync_status = "synced"
                    session.commit()
            
            logger.info(f"Created Snelstart relatie {relatie_id} for client {client.id}")
            return True, relatie_id
        else:
            # Update error status
            db = get_db()
            with db.session() as session:
                db_client = session.query(Client).get(client.id)
                if db_client:
                    db_client.snelstart_sync_status = "error"
                    session.commit()
            
            logger.error(f"Failed to create Snelstart relatie for client {client.id}: {data}")
            return False, str(data)
    
    def _update_relatie(self, client: Client) -> Tuple[bool, str]:
        """Update existing relatie in Snelstart."""
        relatie = {
            "id": client.snelstart_relatie_id,
            "naam": client.company or client.name,
            "email": client.email,
            "telefoon": client.phone,
        }
        
        if client.address:
            relatie["vestigingsAdres"] = {
                "straat": client.address,
            }
        
        success, data = self.api.update_relatie(client.snelstart_relatie_id, relatie)
        
        if success:
            db = get_db()
            with db.session() as session:
                db_client = session.query(Client).get(client.id)
                if db_client:
                    db_client.snelstart_sync_status = "synced"
                    session.commit()
            
            logger.info(f"Updated Snelstart relatie for client {client.id}")
            return True, client.snelstart_relatie_id
        else:
            logger.error(f"Failed to update Snelstart relatie for client {client.id}: {data}")
            return False, str(data)
    
    def sync_all_clients(self) -> SyncResult:
        """Sync all clients that need syncing to Snelstart."""
        result = SyncResult()
        
        if not self.api.is_configured():
            result.errors = 1
            result.error_messages.append("Snelstart API niet geconfigureerd")
            return result
        
        db = get_db()
        with db.session() as session:
            # Get clients that need syncing
            clients = session.query(Client).filter(
                (Client.snelstart_sync_status == None) |
                (Client.snelstart_sync_status == "pending") |
                (Client.snelstart_sync_status == "error")
            ).all()
            
            for client in clients:
                success, msg = self.sync_client_to_snelstart(client)
                if success:
                    result.synced += 1
                else:
                    result.errors += 1
                    result.error_messages.append(f"Client {client.id}: {msg}")
        
        logger.info(f"Client sync complete: {result.synced} synced, {result.errors} errors")
        return result
    
    # =========================================================================
    # Invoice → Verkoopboeking Sync
    # =========================================================================
    
    def sync_invoice_to_snelstart(self, invoice: Invoice) -> Tuple[bool, str]:
        """
        Synchroniseer een factuur naar Snelstart als verkoopboeking.
        
        Args:
            invoice: Invoice object from database
            
        Returns:
            Tuple of (success, snelstart_id or error message)
        """
        if not self.api.is_configured():
            return False, "Snelstart API niet geconfigureerd"
        
        # Only sync outgoing invoices
        if invoice.invoice_type != InvoiceType.OUTGOING.value:
            return False, "Alleen uitgaande facturen worden gesynchroniseerd"
        
        # Check if already synced
        if invoice.snelstart_id:
            return True, invoice.snelstart_id  # Already synced
        
        # Get grootboek for revenue
        grootboek_id = self._get_grootboek_omzet()
        if not grootboek_id:
            return False, "Geen grootboekrekening gevonden voor omzet"
        
        # Ensure client is synced first
        relatie_id = None
        if invoice.client_id:
            db = get_db()
            with db.session() as session:
                client = session.query(Client).get(invoice.client_id)
                if client:
                    if not client.snelstart_relatie_id:
                        # Sync client first
                        success, msg = self.sync_client_to_snelstart(client)
                        if not success:
                            return False, f"Kon klant niet synchroniseren: {msg}"
                        
                        # Refresh client
                        session.refresh(client)
                    
                    relatie_id = client.snelstart_relatie_id
        
        if not relatie_id:
            # Try to find or create relatie by company name
            return False, "Geen gekoppelde klant gevonden"
        
        # Build factuur object
        factuur_datum = invoice.invoice_date.strftime("%Y-%m-%d") if invoice.invoice_date else datetime.now().strftime("%Y-%m-%d")
        
        factuur = {
            "relatie": {"id": relatie_id},
            "factuurdatum": factuur_datum,
            "boekstuk": invoice.invoice_number,
            "omschrijving": invoice.description or f"Factuur {invoice.invoice_number}",
            "regels": [
                {
                    "bedrag": invoice.amount_excl_vat,
                    "omschrijving": invoice.description or "Diensten",
                    "grootboek": {"id": grootboek_id},
                }
            ]
        }
        
        # Add BTW if applicable
        if invoice.vat_percentage > 0:
            # Snelstart handles BTW automatically based on grootboek settings
            factuur["regels"][0]["btw"] = {
                "btwSoort": "Hoog" if invoice.vat_percentage >= 21 else "Laag"
            }
        
        success, data = self.api.create_verkoopfactuur(factuur)
        
        if success:
            snelstart_id = data.get("id")
            
            # Update invoice in database
            db = get_db()
            with db.session() as session:
                db_invoice = session.query(Invoice).get(invoice.id)
                if db_invoice:
                    db_invoice.snelstart_id = snelstart_id
                    db_invoice.snelstart_relatie_id = relatie_id
                    db_invoice.snelstart_sync_status = "synced"
                    db_invoice.snelstart_last_sync = datetime.now()
                    db_invoice.snelstart_error = None
                    session.commit()
            
            logger.info(f"Synced invoice {invoice.invoice_number} to Snelstart: {snelstart_id}")
            return True, snelstart_id
        else:
            # Update error status
            db = get_db()
            with db.session() as session:
                db_invoice = session.query(Invoice).get(invoice.id)
                if db_invoice:
                    db_invoice.snelstart_sync_status = "error"
                    db_invoice.snelstart_error = str(data)[:500]
                    session.commit()
            
            logger.error(f"Failed to sync invoice {invoice.invoice_number}: {data}")
            return False, str(data)
    
    def sync_all_invoices(self) -> SyncResult:
        """Sync all invoices that need syncing to Snelstart."""
        result = SyncResult()
        
        if not self.api.is_configured():
            result.errors = 1
            result.error_messages.append("Snelstart API niet geconfigureerd")
            return result
        
        db = get_db()
        with db.session() as session:
            # Get outgoing invoices that need syncing
            invoices = session.query(Invoice).filter(
                Invoice.invoice_type == InvoiceType.OUTGOING.value,
                Invoice.status.in_([InvoiceStatus.SENT.value, InvoiceStatus.PAID.value]),
                (Invoice.snelstart_sync_status == None) |
                (Invoice.snelstart_sync_status == "pending")
            ).all()
            
            for invoice in invoices:
                success, msg = self.sync_invoice_to_snelstart(invoice)
                if success:
                    result.synced += 1
                else:
                    result.errors += 1
                    result.error_messages.append(f"Invoice {invoice.invoice_number}: {msg}")
        
        logger.info(f"Invoice sync complete: {result.synced} synced, {result.errors} errors")
        return result
    
    def sync_all(self) -> Tuple[SyncResult, SyncResult]:
        """
        Sync all clients and invoices to Snelstart.
        
        Returns:
            Tuple of (client_result, invoice_result)
        """
        logger.info("Starting full Snelstart sync...")
        
        # Sync clients first (invoices depend on relaties)
        client_result = self.sync_all_clients()
        
        # Then sync invoices
        invoice_result = self.sync_all_invoices()
        
        logger.info(
            f"Full sync complete: "
            f"Clients: {client_result.synced} synced, {client_result.errors} errors | "
            f"Invoices: {invoice_result.synced} synced, {invoice_result.errors} errors"
        )
        
        return client_result, invoice_result
    
    # =========================================================================
    # Pull from Snelstart
    # =========================================================================
    
    def get_snelstart_relaties(self) -> Tuple[bool, List[Dict]]:
        """Fetch all relaties from Snelstart."""
        return self.api.get_relaties(top=500)
    
    def get_snelstart_facturen(self) -> Tuple[bool, List[Dict]]:
        """Fetch recent facturen from Snelstart."""
        return self.api.get_verkoopfacturen(top=100)


# Singleton
_sync_service: Optional[SnelstartSyncService] = None


def get_snelstart_sync_service() -> SnelstartSyncService:
    """Get the Snelstart sync service instance."""
    global _sync_service
    if _sync_service is None:
        _sync_service = SnelstartSyncService()
    return _sync_service


# =============================================================================
# Background Scheduler
# =============================================================================

class SnelstartSyncScheduler:
    """Background scheduler for automatic Snelstart sync."""
    
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = False
        return cls._instance
    
    def __init__(self):
        if self._initialized:
            return
        
        self._initialized = True
        self._running = False
        self._thread: Optional[threading.Thread] = None
        self._interval = Config.SNELSTART_SYNC_INTERVAL * 60  # Convert to seconds
        self._on_sync_complete: Optional[Callable] = None
        self._sync_service = get_snelstart_sync_service()
        self._last_sync: Optional[datetime] = None
    
    @property
    def is_running(self) -> bool:
        return self._running
    
    @property
    def last_sync(self) -> Optional[datetime]:
        return self._last_sync
    
    def set_callback(self, callback: Callable):
        """Set callback for when sync completes."""
        self._on_sync_complete = callback
    
    def start(self):
        """Start the background sync scheduler."""
        if self._running:
            return
        
        if not Config.SNELSTART_AUTO_SYNC:
            logger.info("Snelstart auto-sync is disabled")
            return
        
        if not Config.is_snelstart_configured():
            logger.info("Snelstart not configured, skipping auto-sync")
            return
        
        self._running = True
        self._thread = threading.Thread(target=self._sync_loop, daemon=True)
        self._thread.start()
        logger.info(f"Snelstart sync scheduler started (interval: {Config.SNELSTART_SYNC_INTERVAL} min)")
    
    def stop(self):
        """Stop the scheduler."""
        self._running = False
    
    def sync_now(self) -> Tuple[SyncResult, SyncResult]:
        """Execute sync immediately."""
        return self._sync_service.sync_all()
    
    def _sync_loop(self):
        """Background sync loop."""
        # Initial delay
        time.sleep(60)
        
        while self._running:
            try:
                client_result, invoice_result = self._sync_service.sync_all()
                self._last_sync = datetime.now()
                
                if self._on_sync_complete:
                    self._on_sync_complete(client_result, invoice_result)
                    
            except Exception as e:
                logger.error(f"Snelstart sync error: {e}")
            
            # Wait for interval
            waited = 0
            while waited < self._interval and self._running:
                time.sleep(5)
                waited += 5


# Global scheduler
_scheduler: Optional[SnelstartSyncScheduler] = None


def get_snelstart_scheduler() -> SnelstartSyncScheduler:
    """Get the scheduler instance."""
    global _scheduler
    if _scheduler is None:
        _scheduler = SnelstartSyncScheduler()
    return _scheduler


def start_snelstart_sync(on_complete: Callable = None):
    """Start background Snelstart sync."""
    scheduler = get_snelstart_scheduler()
    if on_complete:
        scheduler.set_callback(on_complete)
    scheduler.start()
    return scheduler


def stop_snelstart_sync():
    """Stop Snelstart sync."""
    scheduler = get_snelstart_scheduler()
    scheduler.stop()
