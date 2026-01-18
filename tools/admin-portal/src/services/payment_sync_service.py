"""
Payment Sync Service - Synchroniseert betalingen van website naar Admin Portal.
Haalt betalingen op via de website API en maakt automatisch facturen aan.
"""

import requests
from datetime import datetime
from typing import List, Dict, Tuple, Optional

from ..database import get_db
from ..database.models import Invoice, InvoiceStatus, InvoiceType, Client
from ..utils.config import Config, logger


class PaymentSyncService:
    """Service voor synchroniseren van website betalingen naar facturen."""
    
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
            logger.error(f"API request failed: {e}")
            return None
    
    def fetch_unsynced_payments(self) -> List[Dict]:
        """
        Haal alle nog niet gesynchroniseerde betalingen op van de website.
        
        Returns:
            List van payment dictionaries
        """
        result = self._make_request("GET", "/admin/payments?unsynced=true")
        
        if result and result.get("success"):
            return result.get("payments", [])
        
        return []
    
    def create_invoice_from_payment(self, payment: Dict) -> Optional[Invoice]:
        """
        Maak een factuur aan vanuit een betaling.
        
        Args:
            payment: Payment dict van de website API
            
        Returns:
            Created Invoice object of None bij fout
        """
        db = get_db()
        
        try:
            with db.session() as session:
                # Bepaal factuurnummer (jaar-volgnummer)
                year = datetime.now().year
                last_invoice = session.query(Invoice).filter(
                    Invoice.invoice_number.like(f"FAC-{year}-%")
                ).order_by(Invoice.id.desc()).first()
                
                if last_invoice:
                    try:
                        last_num = int(last_invoice.invoice_number.split("-")[-1])
                        next_num = last_num + 1
                    except ValueError:
                        next_num = 1
                else:
                    next_num = 1
                
                invoice_number = f"FAC-{year}-{next_num:04d}"
                
                # Bepaal bedrijfsnaam
                company_name = payment.get("companyName") or payment.get("customerName", "Onbekend")
                
                # Bepaal omschrijving
                parts = []
                if payment.get("packageName"):
                    parts.append(payment["packageName"])
                if payment.get("paymentType") == "deposit":
                    parts.append("Aanbetaling")
                elif payment.get("paymentType") == "final":
                    parts.append("Eindbetaling")
                elif payment.get("paymentType") == "subscription":
                    parts.append("Abonnement")
                    if payment.get("maintenancePlanName"):
                        parts.append(payment["maintenancePlanName"])
                
                description = " - ".join(parts) if parts else payment.get("description", "Website betaling")
                
                # Bereken BTW (21%)
                amount_incl = payment.get("amount", 0)
                vat_percentage = 21.0
                amount_excl = round(amount_incl / (1 + vat_percentage / 100), 2)
                vat_amount = round(amount_incl - amount_excl, 2)
                
                # Probeer klant te vinden
                client = None
                customer_email = payment.get("customerEmail")
                if customer_email:
                    client = session.query(Client).filter(
                        Client.email == customer_email
                    ).first()
                
                # Maak factuur aan
                invoice = Invoice(
                    invoice_type=InvoiceType.OUTGOING.value,
                    status=InvoiceStatus.PAID.value,
                    invoice_number=invoice_number,
                    reference=payment.get("molliePaymentId"),
                    client_id=client.id if client else None,
                    company_name=company_name,
                    description=description,
                    amount_excl_vat=amount_excl,
                    vat_percentage=vat_percentage,
                    vat_amount=vat_amount,
                    amount_incl_vat=amount_incl,
                    invoice_date=datetime.fromisoformat(payment.get("paidAt", datetime.now().isoformat()).replace("Z", "+00:00")),
                    paid_date=datetime.fromisoformat(payment.get("paidAt", datetime.now().isoformat()).replace("Z", "+00:00")),
                    notes=f"Automatisch geïmporteerd van website\n"
                          f"Klant: {payment.get('customerName')}\n"
                          f"Email: {customer_email}\n"
                          f"Mollie ID: {payment.get('molliePaymentId')}",
                )
                
                session.add(invoice)
                session.commit()
                
                logger.info(f"Created invoice {invoice_number} from payment {payment.get('molliePaymentId')}")
                return invoice
                
        except Exception as e:
            logger.error(f"Failed to create invoice from payment: {e}")
            return None
    
    def sync_payments(self) -> Tuple[int, int, List[str]]:
        """
        Synchroniseer alle nieuwe betalingen van de website.
        
        Returns:
            Tuple van (aantal gesynchroniseerd, aantal fouten, foutmeldingen)
        """
        logger.info("Starting payment sync from website...")
        
        payments = self.fetch_unsynced_payments()
        
        if not payments:
            logger.info("No new payments to sync")
            return (0, 0, [])
        
        synced = 0
        errors = 0
        error_messages = []
        synced_payment_ids = []
        invoice_mapping = {}
        
        for payment in payments:
            payment_id = payment.get("id")
            mollie_id = payment.get("molliePaymentId")
            
            invoice = self.create_invoice_from_payment(payment)
            
            if invoice:
                synced += 1
                synced_payment_ids.append(payment_id)
                invoice_mapping[payment_id] = invoice.id
            else:
                errors += 1
                error_messages.append(f"Kon factuur niet maken voor betaling {mollie_id}")
        
        # Mark payments as synced on website
        if synced_payment_ids:
            result = self._make_request(
                "POST",
                "/admin/payments",
                json={
                    "paymentIds": synced_payment_ids,
                    "invoiceMapping": invoice_mapping,
                }
            )
            
            if result and result.get("success"):
                logger.info(f"Marked {len(synced_payment_ids)} payments as synced on website")
            else:
                logger.warning("Failed to mark payments as synced on website")
        
        logger.info(f"Payment sync complete: {synced} synced, {errors} errors")
        return (synced, errors, error_messages)


# Singleton instance
_sync_service: Optional[PaymentSyncService] = None


def get_payment_sync_service() -> PaymentSyncService:
    """Get the payment sync service instance."""
    global _sync_service
    if _sync_service is None:
        _sync_service = PaymentSyncService()
    return _sync_service
