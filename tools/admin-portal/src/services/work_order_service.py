"""
Work Order Sync Service - Synchroniseert werk opdrachten en formulieren van website naar Admin Portal.
"""

import requests
import threading
import time
from datetime import datetime
from typing import List, Dict, Tuple, Optional, Callable

from ..database import get_db
from ..database.models import FormSubmission, FormStatus, FormType
from ..utils.config import Config, logger


class FormsSyncService:
    """Service voor synchroniseren van contact/offerte formulieren van website."""
    
    def __init__(self):
        self.api_url = Config.WEBSITE_API_URL
        self.api_key = Config.WEBSITE_ADMIN_API_KEY
    
    def _make_request(self, method: str, endpoint: str, **kwargs) -> Optional[Dict]:
        """Make authenticated API request to website."""
        url = f"{self.api_url}{endpoint}"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }
        
        try:
            response = requests.request(
                method=method,
                url=url,
                headers=headers,
                timeout=30,
                **kwargs
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.debug(f"Forms API request failed: {e}")
            return None
    
    def sync_forms(self) -> Tuple[int, int, List[str]]:
        """Sync contact/offerte forms from website."""
        result = self._make_request("GET", "/admin/forms?unsynced=true")
        
        if not result or not result.get("success"):
            return (0, 0, [])
        
        submissions = result.get("submissions", [])
        
        if not submissions:
            return (0, 0, [])
        
        synced = 0
        errors = 0
        error_messages = []
        synced_ids = []
        form_mapping = {}
        
        db = get_db()
        
        for sub in submissions:
            try:
                with db.session() as session:
                    # Check if already exists
                    existing = session.query(FormSubmission).filter(
                        FormSubmission.source == f"form:{sub.get('id')}"
                    ).first()
                    
                    if existing:
                        synced_ids.append(sub["id"])
                        continue
                    
                    # Determine form type
                    form_type = FormType.CONTACT.value
                    if sub.get("formType") == "offerte":
                        form_type = FormType.OFFERTE.value
                    
                    # Build message with extra data
                    message = sub.get("message", "")
                    extra = sub.get("extraData", {})
                    if extra:
                        extra_text = []
                        if extra.get("projectType"):
                            extra_text.append(f"Type: {extra['projectType']}")
                        if extra.get("budgetRange"):
                            extra_text.append(f"Budget: {extra['budgetRange']}")
                        if extra.get("deadline"):
                            extra_text.append(f"Deadline: {extra['deadline']}")
                        if extra.get("features"):
                            extra_text.append(f"Features: {', '.join(extra['features'])}")
                        if extra.get("currentWebsite"):
                            extra_text.append(f"Huidige website: {extra['currentWebsite']}")
                        if extra.get("additionalInfo"):
                            extra_text.append(f"Extra info: {extra['additionalInfo']}")
                        
                        if extra_text:
                            message = "\n".join(extra_text) + "\n\n" + message
                    
                    # Create FormSubmission
                    form = FormSubmission(
                        form_type=form_type,
                        status=FormStatus.NEW.value,
                        name=sub.get("name", "Onbekend"),
                        email=sub.get("email", ""),
                        phone=sub.get("phone", ""),
                        company=sub.get("company", ""),
                        subject=sub.get("subject", ""),
                        message=message,
                        source=f"form:{sub['id']}",
                        submitted_at=datetime.fromisoformat(
                            sub["submittedAt"].replace("Z", "+00:00")
                        ) if sub.get("submittedAt") else datetime.now()
                    )
                    
                    session.add(form)
                    session.commit()
                    
                    synced_ids.append(sub["id"])
                    form_mapping[sub["id"]] = form.id
                    synced += 1
                    
                    logger.info(f"Synced form: {sub.get('formType')} from {sub.get('email')}")
                    
            except Exception as e:
                errors += 1
                error_messages.append(f"Form {sub.get('id')}: {e}")
                logger.error(f"Failed to sync form: {e}")
        
        # Mark as synced on website
        if synced_ids:
            self._make_request(
                "POST",
                "/admin/forms",
                json={
                    "submissionIds": synced_ids,
                    "formMapping": form_mapping,
                }
            )
        
        return (synced, errors, error_messages)


class WorkOrderSyncService:
    """Service voor synchroniseren van werk opdrachten van website."""
    
    def __init__(self):
        self.api_url = Config.WEBSITE_API_URL
        self.api_key = Config.WEBSITE_ADMIN_API_KEY
    
    def _make_request(self, method: str, endpoint: str, **kwargs) -> Optional[Dict]:
        """Make authenticated API request to website."""
        url = f"{self.api_url}{endpoint}"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }
        
        try:
            response = requests.request(
                method=method,
                url=url,
                headers=headers,
                timeout=30,
                **kwargs
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"Work order API request failed: {e}")
            return None
    
    def fetch_unsynced_orders(self) -> List[Dict]:
        """Haal niet-gesynchroniseerde werk opdrachten op."""
        result = self._make_request("GET", "/admin/work-orders?unsynced=true")
        
        if result and result.get("success"):
            return result.get("orders", [])
        
        return []
    
    def sync_work_orders(self) -> Tuple[int, int, List[str]]:
        """
        Synchroniseer werk opdrachten van website naar Admin Portal.
        
        Returns:
            Tuple van (synced, errors, error_messages)
        """
        logger.info("Starting work order sync from website...")
        
        orders = self.fetch_unsynced_orders()
        
        if not orders:
            logger.info("No new work orders to sync")
            return (0, 0, [])
        
        synced = 0
        errors = 0
        error_messages = []
        synced_ids = []
        form_mapping = {}
        
        db = get_db()
        
        for order in orders:
            try:
                with db.session() as session:
                    # Check if already exists
                    existing = session.query(FormSubmission).filter(
                        FormSubmission.source == f"order:{order.get('id')}"
                    ).first()
                    
                    if existing:
                        synced_ids.append(order["id"])
                        continue
                    
                    # Build features list
                    features = order.get("features", [])
                    features_text = "\n".join([
                        f"• {f['name']}" + (f" ({f['quantity']}x)" if f.get('quantity', 1) > 1 else "")
                        for f in features
                    ])
                    
                    # Build full message
                    message = f"""
WERK OPDRACHT: {order.get('orderNumber', 'N/A')}

📦 Pakket: {order.get('packageName', 'N/A')}
💰 Bedrag: €{order.get('totalAmount', 0):.2f} excl. BTW

📋 Geselecteerde functies:
{features_text}

📍 Adres:
{order.get('address', '')}
{order.get('postalCode', '')} {order.get('city', '')}

🏢 KvK: {order.get('kvkNumber', '-')}

✅ Akkoorden:
- Algemene voorwaarden: {'Ja' if order.get('termsAccepted') else 'Nee'}
- Offerte geaccepteerd: {'Ja' if order.get('quoteAccepted') else 'Nee'}
- Annuleringsbeleid: {'Ja' if order.get('cancellationAccepted') else 'Nee'}
- Privacybeleid: {'Ja' if order.get('privacyAccepted') else 'Nee'}

✍️ Handtekening: {order.get('signature', '')}
📅 Datum: {order.get('signatureDate', '')}

⚠️ Annuleringskosten: €{order.get('cancellationFee', 0):.2f}
""".strip()
                    
                    # Create FormSubmission
                    form = FormSubmission(
                        form_type=FormType.OFFERTE.value,
                        status=FormStatus.NEW.value,
                        name=order.get("customerName", "Onbekend"),
                        email=order.get("customerEmail", ""),
                        phone=order.get("customerPhone", ""),
                        company=order.get("companyName", ""),
                        subject=f"Werk Opdracht: {order.get('packageName', '')} - €{order.get('totalAmount', 0):.2f}",
                        message=message,
                        source=f"order:{order['id']}",
                        submitted_at=datetime.fromisoformat(
                            order["createdAt"].replace("Z", "+00:00")
                        ) if order.get("createdAt") else datetime.now()
                    )
                    
                    session.add(form)
                    session.commit()
                    
                    synced_ids.append(order["id"])
                    form_mapping[order["id"]] = form.id
                    synced += 1
                    
                    logger.info(f"Synced work order: {order.get('orderNumber')}")
                    
            except Exception as e:
                errors += 1
                error_messages.append(f"Order {order.get('orderNumber')}: {e}")
                logger.error(f"Failed to sync work order: {e}")
        
        # Mark orders as synced on website
        if synced_ids:
            result = self._make_request(
                "POST",
                "/admin/work-orders",
                json={
                    "orderIds": synced_ids,
                    "formMapping": form_mapping,
                }
            )
            
            if result and result.get("success"):
                logger.info(f"Marked {len(synced_ids)} orders as synced on website")
            else:
                logger.warning("Failed to mark orders as synced on website")
        
        logger.info(f"Work order sync complete: {synced} synced, {errors} errors")
        return (synced, errors, error_messages)


# Singleton
_sync_service: Optional[WorkOrderSyncService] = None


def get_work_order_sync_service() -> WorkOrderSyncService:
    """Get the work order sync service instance."""
    global _sync_service
    if _sync_service is None:
        _sync_service = WorkOrderSyncService()
    return _sync_service


class WorkOrderSyncScheduler:
    """Background scheduler voor werk opdrachten en formulieren synchronisatie."""
    
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
        self._thread = None
        self._interval = Config.PAYMENT_SYNC_INTERVAL * 60  # Use same interval
        self._on_new_orders: Optional[Callable[[int], None]] = None
        self._sync_service = get_work_order_sync_service()
        self._forms_service = FormsSyncService()
    
    def set_callback(self, callback: Callable[[int], None]):
        """Set callback when new orders are synced."""
        self._on_new_orders = callback
    
    def start(self):
        """Start the background sync."""
        if self._running:
            return
        
        self._running = True
        self._thread = threading.Thread(target=self._sync_loop, daemon=True)
        self._thread.start()
        logger.info("Work order sync scheduler started")
    
    def stop(self):
        """Stop the scheduler."""
        self._running = False
    
    def sync_now(self) -> Tuple[int, int, List[str]]:
        """Execute sync immediately (work orders + forms)."""
        # Sync work orders
        orders_synced, orders_errors, orders_msgs = self._sync_service.sync_work_orders()
        
        # Sync forms
        forms_synced, forms_errors, forms_msgs = self._forms_service.sync_forms()
        
        return (
            orders_synced + forms_synced,
            orders_errors + forms_errors,
            orders_msgs + forms_msgs
        )
    
    def _sync_loop(self):
        """Background sync loop."""
        time.sleep(20)  # Initial delay
        
        while self._running:
            total_synced = 0
            
            try:
                # Sync work orders
                orders_synced, _, _ = self._sync_service.sync_work_orders()
                total_synced += orders_synced
            except Exception as e:
                logger.error(f"Work order sync error: {e}")
            
            try:
                # Sync forms
                forms_synced, _, _ = self._forms_service.sync_forms()
                total_synced += forms_synced
            except Exception as e:
                logger.error(f"Forms sync error: {e}")
            
            if total_synced > 0 and self._on_new_orders:
                self._on_new_orders(total_synced)
            
            # Wait
            waited = 0
            while waited < self._interval and self._running:
                time.sleep(5)
                waited += 5


# Global scheduler
_scheduler: Optional[WorkOrderSyncScheduler] = None


def get_work_order_scheduler() -> WorkOrderSyncScheduler:
    """Get the scheduler instance."""
    global _scheduler
    if _scheduler is None:
        _scheduler = WorkOrderSyncScheduler()
    return _scheduler


def start_work_order_sync(on_new_orders: Callable[[int], None] = None):
    """Start background work order sync."""
    scheduler = get_work_order_scheduler()
    if on_new_orders:
        scheduler.set_callback(on_new_orders)
    scheduler.start()
    return scheduler


def stop_work_order_sync():
    """Stop work order sync."""
    scheduler = get_work_order_scheduler()
    scheduler.stop()
