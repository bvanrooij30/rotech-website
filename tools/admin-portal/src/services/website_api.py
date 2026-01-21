"""
Website API Service - Centrale service voor alle website communicatie.
Beheert authenticatie, requests, en sync status.
"""

import requests
import threading
import time
from datetime import datetime
from typing import Optional, Dict, List, Any, Tuple
from dataclasses import dataclass, field
from enum import Enum

from ..utils.config import Config, logger


class APIStatus(Enum):
    """API connection status."""
    UNKNOWN = "unknown"
    CONNECTED = "connected"
    DISCONNECTED = "disconnected"
    ERROR = "error"
    AUTHENTICATING = "authenticating"


@dataclass
class APIEndpoint:
    """Represents an API endpoint."""
    name: str
    path: str
    method: str = "GET"
    description: str = ""
    last_called: Optional[datetime] = None
    last_status: Optional[int] = None
    call_count: int = 0


@dataclass
class SyncStats:
    """Sync statistics."""
    last_sync: Optional[datetime] = None
    total_synced: int = 0
    total_errors: int = 0
    items_pending: int = 0


@dataclass
class APIHealth:
    """API health status."""
    status: APIStatus = APIStatus.UNKNOWN
    last_check: Optional[datetime] = None
    response_time_ms: Optional[int] = None
    error_message: Optional[str] = None
    version: Optional[str] = None


class WebsiteAPI:
    """
    Centrale API service voor website communicatie.
    Singleton pattern voor globale toegang.
    """
    
    _instance = None
    
    # API Endpoints configuratie - v1/sync API structuur
    ENDPOINTS = {
        # Status & Health
        "status": APIEndpoint("API Status", "/v1/status", "GET", "API health & stats"),
        
        # Sync endpoints (v1/sync/...)
        "customers": APIEndpoint("Customers", "/v1/sync/customers", "GET", "Klanten ophalen"),
        "tickets": APIEndpoint("Support Tickets", "/v1/sync/tickets", "GET", "Support tickets ophalen"),
        "tickets_update": APIEndpoint("Update Ticket", "/v1/sync/tickets", "PATCH", "Ticket bijwerken"),
        "subscriptions": APIEndpoint("Subscriptions", "/v1/sync/subscriptions", "GET", "Abonnementen ophalen"),
        "products": APIEndpoint("Products", "/v1/sync/products", "GET", "Producten ophalen"),
        "invoices": APIEndpoint("Invoices", "/v1/sync/invoices", "GET", "Facturen ophalen"),
        
        # Legacy admin endpoints (fallback)
        "payments": APIEndpoint("Payments", "/admin/payments", "GET", "Betalingen ophalen"),
        "work_orders": APIEndpoint("Work Orders", "/admin/work-orders", "GET", "Werk opdrachten ophalen"),
        "forms": APIEndpoint("Forms", "/admin/forms", "GET", "Formulieren ophalen"),
        
        # Webhooks
        "webhook": APIEndpoint("Webhook", "/v1/webhook/receive", "POST", "Webhook ontvangen"),
    }
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = False
        return cls._instance
    
    def __init__(self):
        if self._initialized:
            return
        
        self._initialized = True
        self._base_url = Config.WEBSITE_API_URL
        self._api_key = Config.WEBSITE_ADMIN_API_KEY
        self._timeout = 30
        
        # Status tracking
        self._health = APIHealth()
        self._sync_stats: Dict[str, SyncStats] = {
            "payments": SyncStats(),
            "work_orders": SyncStats(),
            "forms": SyncStats(),
            "tickets": SyncStats(),
        }
        
        # Request history
        self._request_history: List[Dict[str, Any]] = []
        self._max_history = 100
        
        # Callbacks
        self._on_status_change: Optional[callable] = None
        
        # Lock for thread safety
        self._lock = threading.Lock()
    
    # === CONFIGURATION ===
    
    def configure(self, base_url: str = None, api_key: str = None, timeout: int = None):
        """Update API configuration."""
        with self._lock:
            if base_url:
                self._base_url = base_url.rstrip("/")
            if api_key:
                self._api_key = api_key
            if timeout:
                self._timeout = timeout
            
            logger.info(f"API configured: {self._base_url}")
    
    def get_config(self) -> Dict[str, Any]:
        """Get current API configuration."""
        return {
            "base_url": self._base_url,
            "api_key": self._api_key[:8] + "..." if self._api_key else None,
            "timeout": self._timeout,
        }
    
    def set_status_callback(self, callback: callable):
        """Set callback for status changes."""
        self._on_status_change = callback
    
    # === HEALTH CHECK ===
    
    def check_health(self) -> APIHealth:
        """Check API health and connectivity using v1/status endpoint."""
        start_time = time.time()
        
        try:
            # Try to reach the API via v1/status
            response = requests.get(
                f"{self._base_url}/v1/status",
                headers=self._get_headers(),
                timeout=10
            )
            
            response_time = int((time.time() - start_time) * 1000)
            
            if response.status_code == 200:
                self._health = APIHealth(
                    status=APIStatus.CONNECTED,
                    last_check=datetime.now(),
                    response_time_ms=response_time,
                )
            elif response.status_code == 401:
                self._health = APIHealth(
                    status=APIStatus.ERROR,
                    last_check=datetime.now(),
                    response_time_ms=response_time,
                    error_message="Ongeldige API key"
                )
            elif response.status_code == 404:
                self._health = APIHealth(
                    status=APIStatus.ERROR,
                    last_check=datetime.now(),
                    response_time_ms=response_time,
                    error_message="API endpoint niet gevonden - deploy website"
                )
            else:
                self._health = APIHealth(
                    status=APIStatus.ERROR,
                    last_check=datetime.now(),
                    response_time_ms=response_time,
                    error_message=f"HTTP {response.status_code}"
                )
                
        except requests.exceptions.ConnectionError:
            self._health = APIHealth(
                status=APIStatus.DISCONNECTED,
                last_check=datetime.now(),
                error_message="Kan geen verbinding maken met website"
            )
        except requests.exceptions.Timeout:
            self._health = APIHealth(
                status=APIStatus.DISCONNECTED,
                last_check=datetime.now(),
                error_message="Verbinding timeout"
            )
        except Exception as e:
            self._health = APIHealth(
                status=APIStatus.ERROR,
                last_check=datetime.now(),
                error_message=str(e)
            )
        
        # Notify callback
        if self._on_status_change:
            self._on_status_change(self._health)
        
        return self._health
    
    def get_health(self) -> APIHealth:
        """Get current health status."""
        return self._health
    
    # === REQUEST METHODS ===
    
    def _get_headers(self) -> Dict[str, str]:
        """Get request headers with auth."""
        return {
            "Authorization": f"Bearer {self._api_key}",
            "Content-Type": "application/json",
            "Accept": "application/json",
        }
    
    def _log_request(self, endpoint: str, method: str, status: int, duration_ms: int, error: str = None):
        """Log request to history."""
        with self._lock:
            self._request_history.insert(0, {
                "endpoint": endpoint,
                "method": method,
                "status": status,
                "duration_ms": duration_ms,
                "error": error,
                "timestamp": datetime.now().isoformat(),
            })
            
            # Trim history
            if len(self._request_history) > self._max_history:
                self._request_history = self._request_history[:self._max_history]
    
    def request(
        self, 
        endpoint: str, 
        method: str = "GET", 
        params: Dict = None, 
        data: Dict = None
    ) -> Tuple[bool, Any]:
        """
        Make an API request.
        
        Returns:
            Tuple of (success, response_data or error_message)
        """
        url = f"{self._base_url}{endpoint}"
        start_time = time.time()
        
        try:
            response = requests.request(
                method=method,
                url=url,
                headers=self._get_headers(),
                params=params,
                json=data,
                timeout=self._timeout
            )
            
            duration = int((time.time() - start_time) * 1000)
            self._log_request(endpoint, method, response.status_code, duration)
            
            # Update endpoint stats
            for ep in self.ENDPOINTS.values():
                if ep.path == endpoint and ep.method == method:
                    ep.last_called = datetime.now()
                    ep.last_status = response.status_code
                    ep.call_count += 1
                    break
            
            if response.status_code == 200:
                return (True, response.json())
            elif response.status_code == 401:
                return (False, "Unauthorized - check API key")
            elif response.status_code == 404:
                return (False, "Endpoint not found - deploy website first")
            else:
                return (False, f"HTTP {response.status_code}: {response.text[:200]}")
                
        except requests.exceptions.ConnectionError:
            duration = int((time.time() - start_time) * 1000)
            self._log_request(endpoint, method, 0, duration, "Connection failed")
            return (False, "Connection failed - website not reachable")
        except requests.exceptions.Timeout:
            duration = int((time.time() - start_time) * 1000)
            self._log_request(endpoint, method, 0, duration, "Timeout")
            return (False, "Request timeout")
        except Exception as e:
            duration = int((time.time() - start_time) * 1000)
            self._log_request(endpoint, method, 0, duration, str(e))
            return (False, str(e))
    
    # === DATA FETCH METHODS (v1/sync API) ===
    
    def get_status(self) -> Tuple[bool, Any]:
        """Get API status and stats."""
        return self.request("/v1/status")
    
    def get_customers(self, since: str = None, page: int = 1, limit: int = 50) -> Tuple[bool, Any]:
        """Fetch customers from website."""
        params = {"page": page, "limit": limit}
        if since:
            params["since"] = since
        return self.request("/v1/sync/customers", params=params)
    
    def get_tickets(self, since: str = None, status: str = None, page: int = 1, limit: int = 50) -> Tuple[bool, Any]:
        """Fetch support tickets from website."""
        params = {"page": page, "limit": limit}
        if since:
            params["since"] = since
        if status:
            params["status"] = status
        return self.request("/v1/sync/tickets", params=params)
    
    def update_ticket(self, ticket_id: str, status: str = None, resolution: str = None, 
                      message: str = None, admin_portal_id: int = None) -> Tuple[bool, Any]:
        """Update a ticket on the website."""
        data = {"ticketId": ticket_id}
        if status:
            data["status"] = status
        if resolution:
            data["resolution"] = resolution
        if message:
            data["message"] = message
        if admin_portal_id:
            data["adminPortalId"] = admin_portal_id
        return self.request("/v1/sync/tickets", method="PATCH", data=data)
    
    def get_subscriptions(self, since: str = None, page: int = 1, limit: int = 50) -> Tuple[bool, Any]:
        """Fetch subscriptions from website."""
        params = {"page": page, "limit": limit}
        if since:
            params["since"] = since
        return self.request("/v1/sync/subscriptions", params=params)
    
    def get_products(self, since: str = None, page: int = 1, limit: int = 50) -> Tuple[bool, Any]:
        """Fetch products from website."""
        params = {"page": page, "limit": limit}
        if since:
            params["since"] = since
        return self.request("/v1/sync/products", params=params)
    
    def get_invoices(self, since: str = None, page: int = 1, limit: int = 50) -> Tuple[bool, Any]:
        """Fetch invoices from website."""
        params = {"page": page, "limit": limit}
        if since:
            params["since"] = since
        return self.request("/v1/sync/invoices", params=params)
    
    # === LEGACY ENDPOINTS (backward compatibility) ===
    
    def get_payments(self, unsynced: bool = True, limit: int = 100) -> Tuple[bool, Any]:
        """Fetch payments from website (legacy)."""
        params = {"limit": limit}
        if unsynced:
            params["unsynced"] = "true"
        return self.request("/admin/payments", params=params)
    
    def get_work_orders(self, unsynced: bool = True, limit: int = 100) -> Tuple[bool, Any]:
        """Fetch work orders from website (legacy)."""
        params = {"limit": limit}
        if unsynced:
            params["unsynced"] = "true"
        return self.request("/admin/work-orders", params=params)
    
    def get_forms(self, unsynced: bool = True, form_type: str = None, limit: int = 100) -> Tuple[bool, Any]:
        """Fetch form submissions from website (legacy)."""
        params = {"limit": limit}
        if unsynced:
            params["unsynced"] = "true"
        if form_type:
            params["type"] = form_type
        return self.request("/admin/forms", params=params)
    
    def get_support_tickets(self, unsynced: bool = True, limit: int = 100) -> Tuple[bool, Any]:
        """Fetch support tickets from website (legacy - use get_tickets instead)."""
        return self.get_tickets(limit=limit)
    
    # === STATS & HISTORY ===
    
    def get_sync_stats(self) -> Dict[str, SyncStats]:
        """Get sync statistics."""
        return self._sync_stats.copy()
    
    def update_sync_stats(self, category: str, synced: int = 0, errors: int = 0):
        """Update sync statistics."""
        if category in self._sync_stats:
            stats = self._sync_stats[category]
            stats.last_sync = datetime.now()
            stats.total_synced += synced
            stats.total_errors += errors
    
    def get_request_history(self, limit: int = 50) -> List[Dict]:
        """Get recent request history."""
        return self._request_history[:limit]
    
    def get_endpoints_status(self) -> Dict[str, Dict]:
        """Get status of all endpoints."""
        return {
            name: {
                "name": ep.name,
                "path": ep.path,
                "method": ep.method,
                "description": ep.description,
                "last_called": ep.last_called.isoformat() if ep.last_called else None,
                "last_status": ep.last_status,
                "call_count": ep.call_count,
            }
            for name, ep in self.ENDPOINTS.items()
        }
    
    # === SYNC ALL ===
    
    def sync_all(self, callback: callable = None) -> Dict[str, Tuple[int, int]]:
        """
        Sync all data from website using v1/sync API.
        
        Returns:
            Dict with category: (synced_count, error_count)
        """
        results = {}
        
        # v1/sync categories
        categories = [
            ("customers", self.get_customers),
            ("tickets", self.get_tickets),
            ("subscriptions", self.get_subscriptions),
            ("products", self.get_products),
            ("invoices", self.get_invoices),
        ]
        
        for name, fetch_func in categories:
            if callback:
                callback(f"Syncing {name}...")
            
            success, data = fetch_func()
            
            if success:
                # v1 API returns data in 'data' field with 'meta' containing pagination
                items = data.get("data", [])
                count = len(items) if isinstance(items, list) else 0
                results[name] = (count, 0)
                self.update_sync_stats(name, synced=count)
            else:
                results[name] = (0, 1)
                self.update_sync_stats(name, errors=1)
        
        return results


# Global instance
_api: Optional[WebsiteAPI] = None


def get_website_api() -> WebsiteAPI:
    """Get the global WebsiteAPI instance."""
    global _api
    if _api is None:
        _api = WebsiteAPI()
    return _api
