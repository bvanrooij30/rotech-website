"""
Sync Service - Background email synchronization scheduler.
Haalt automatisch emails op van alle actieve accounts.
"""

import threading
import time
from datetime import datetime
from typing import Optional, Callable

from ..database import get_db
from ..database.models import EmailAccount, Email
from ..utils.config import Config, logger
from .email_service import EmailService


class EmailSyncScheduler:
    """Background scheduler voor email synchronisatie."""
    
    _instance: Optional['EmailSyncScheduler'] = None
    
    def __new__(cls):
        """Singleton pattern."""
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
        self._interval = Config.EMAIL_SYNC_INTERVAL * 60  # Convert to seconds
        self._on_new_emails: Optional[Callable] = None
        self._last_sync: Optional[datetime] = None
    
    def set_interval(self, minutes: int):
        """Set sync interval in minutes."""
        self._interval = minutes * 60
        logger.info(f"Sync interval set to {minutes} minutes")
    
    def set_callback(self, callback: Callable):
        """Set callback for when new emails arrive."""
        self._on_new_emails = callback
    
    def start(self):
        """Start de background sync scheduler."""
        if self._running:
            logger.warning("Sync scheduler already running")
            return
        
        self._running = True
        self._thread = threading.Thread(target=self._sync_loop, daemon=True)
        self._thread.start()
        logger.info(f"Email sync scheduler started (interval: {self._interval // 60} min)")
    
    def stop(self):
        """Stop de scheduler."""
        self._running = False
        logger.info("Email sync scheduler stopped")
    
    def sync_now(self) -> dict:
        """
        Voer direct een sync uit.
        
        Returns:
            Dict met resultaten: {total_new: int, errors: list}
        """
        return self._do_sync()
    
    def _sync_loop(self):
        """Background sync loop."""
        # Initial sync after 10 seconds
        time.sleep(10)
        
        while self._running:
            try:
                result = self._do_sync()
                
                if result['total_new'] > 0 and self._on_new_emails:
                    self._on_new_emails(result['total_new'])
                
            except Exception as e:
                logger.error(f"Sync loop error: {e}")
            
            # Wait for next interval
            # Check every 5 seconds if still running
            waited = 0
            while waited < self._interval and self._running:
                time.sleep(5)
                waited += 5
    
    def _do_sync(self) -> dict:
        """Execute sync voor alle accounts."""
        result = {
            'total_new': 0,
            'errors': [],
            'synced_accounts': 0
        }
        
        db = get_db()
        
        try:
            with db.session() as session:
                accounts = session.query(EmailAccount).filter_by(is_active=True).all()
                
                if not accounts:
                    logger.debug("No active email accounts to sync")
                    return result
                
                for account in accounts:
                    try:
                        # Decrypt password
                        password = Config.decrypt(account.password_encrypted)
                        
                        # Create service
                        service = EmailService(
                            host=account.imap_host,
                            imap_port=account.imap_port,
                            smtp_port=account.smtp_port,
                            username=account.username,
                            password=password
                        )
                        
                        # Fetch new emails with account_id
                        new_emails = service.fetch_emails(
                            folder="INBOX",
                            limit=50,
                            since_date=account.last_sync,
                            account_id=account.id
                        )
                        
                        # Update last sync time
                        account.last_sync = datetime.now()
                        
                        result['total_new'] += len(new_emails)
                        result['synced_accounts'] += 1
                        
                        service.disconnect_imap()
                        
                        if new_emails:
                            logger.info(f"Synced {len(new_emails)} emails from {account.email}")
                        
                    except Exception as e:
                        error_msg = f"{account.name}: {str(e)}"
                        result['errors'].append(error_msg)
                        logger.error(f"Sync error for {account.email}: {e}")
                
                session.commit()
            
            self._last_sync = datetime.now()
            
            if result['total_new'] > 0:
                logger.info(f"Sync complete: {result['total_new']} new emails from {result['synced_accounts']} accounts")
            
        except Exception as e:
            logger.error(f"Sync error: {e}")
            result['errors'].append(str(e))
        
        return result
    
    @property
    def last_sync(self) -> Optional[datetime]:
        """Get last sync timestamp."""
        return self._last_sync
    
    @property
    def is_running(self) -> bool:
        """Check if scheduler is running."""
        return self._running


# Global scheduler instance
_scheduler: Optional[EmailSyncScheduler] = None


def get_sync_scheduler() -> EmailSyncScheduler:
    """Get the global sync scheduler instance."""
    global _scheduler
    if _scheduler is None:
        _scheduler = EmailSyncScheduler()
    return _scheduler


def start_background_sync(interval_minutes: int = None, on_new_emails: Callable = None):
    """
    Start background email sync.
    
    Args:
        interval_minutes: Sync interval (default from config)
        on_new_emails: Callback when new emails arrive
    """
    scheduler = get_sync_scheduler()
    
    if interval_minutes:
        scheduler.set_interval(interval_minutes)
    
    if on_new_emails:
        scheduler.set_callback(on_new_emails)
    
    scheduler.start()
    return scheduler


def stop_background_sync():
    """Stop background sync."""
    scheduler = get_sync_scheduler()
    scheduler.stop()
