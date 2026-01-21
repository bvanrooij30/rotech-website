"""
Snelstart B2B API Client - OAuth 2.0 authenticatie en API communicatie.
"""

import requests
import threading
import time
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, Tuple, List
from dataclasses import dataclass
from enum import Enum

from ..utils.config import Config, logger


class SnelstartStatus(Enum):
    """Snelstart API connection status."""
    UNKNOWN = "unknown"
    CONNECTED = "connected"
    DISCONNECTED = "disconnected"
    ERROR = "error"
    AUTHENTICATING = "authenticating"
    NOT_CONFIGURED = "not_configured"


@dataclass
class SnelstartHealth:
    """Health status of Snelstart API."""
    status: SnelstartStatus
    response_time_ms: Optional[int] = None
    error_message: Optional[str] = None
    last_check: Optional[datetime] = None
    token_expires: Optional[datetime] = None


@dataclass
class SnelstartRelatie:
    """Snelstart relatie (debiteur/crediteur)."""
    id: str
    modifiedOn: Optional[str] = None
    relatiecode: Optional[str] = None
    naam: str = ""
    vestigingsAdres: Optional[Dict] = None
    correspondentieAdres: Optional[Dict] = None
    telefoon: Optional[str] = None
    mobieleTelefoon: Optional[str] = None
    email: Optional[str] = None
    btwnummer: Optional[str] = None
    kvkNummer: Optional[str] = None
    factuurkorting: float = 0.0
    krediettermijn: int = 30
    bankrekeningen: Optional[List] = None
    nonactiefIndicator: bool = False


@dataclass
class SnelstartFactuurRegel:
    """Factuur regel voor Snelstart."""
    omschrijving: str
    bedrag: float
    btwSoort: str = "Hoog"  # Hoog, Laag, Geen, Verlegd
    aantal: float = 1.0


class SnelstartAPI:
    """
    Snelstart B2B API client met OAuth 2.0 authenticatie.
    
    Singleton pattern - gebruik get_snelstart_api() om instance te krijgen.
    """
    
    _instance = None
    _lock = threading.Lock()
    
    # API Endpoints
    ENDPOINTS = {
        "relaties": "/relaties",
        "landen": "/landen",
        "grootboekrekeningen": "/grootboekrekeningen",
        "kostenplaatsen": "/kostenplaatsen",
        "btwtarieven": "/btwtarieven",
        "verkoopfacturen": "/verkoopboekingen",
        "inkoopfacturen": "/inkoopboekingen",
    }
    
    def __new__(cls):
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = super().__new__(cls)
                    cls._instance._initialized = False
        return cls._instance
    
    def __init__(self):
        if self._initialized:
            return
        
        self._initialized = True
        
        # Configuration
        self._api_url = Config.SNELSTART_API_URL
        self._auth_url = Config.SNELSTART_AUTH_URL
        self._client_id = Config.SNELSTART_CLIENT_ID
        self._client_secret = Config.SNELSTART_CLIENT_SECRET
        self._subscription_key = Config.SNELSTART_SUBSCRIPTION_KEY
        
        # OAuth tokens
        self._access_token: Optional[str] = None
        self._token_expires: Optional[datetime] = None
        
        # Status tracking
        self._health = SnelstartHealth(status=SnelstartStatus.UNKNOWN)
        self._request_history: List[Dict] = []
        self._max_history = 100
    
    def configure(self, 
                  client_id: str = None,
                  client_secret: str = None,
                  subscription_key: str = None):
        """Update API configuration."""
        if client_id:
            self._client_id = client_id
        if client_secret:
            self._client_secret = client_secret
        if subscription_key:
            self._subscription_key = subscription_key
        
        # Reset token when credentials change
        self._access_token = None
        self._token_expires = None
        
        logger.info("Snelstart API configuration updated")
    
    def is_configured(self) -> bool:
        """Check if API credentials are configured."""
        return bool(
            self._client_id and 
            self._client_secret and 
            self._subscription_key
        )
    
    def _authenticate(self) -> bool:
        """
        Authenticate with Snelstart OAuth 2.0.
        
        Returns True if successful, False otherwise.
        """
        if not self.is_configured():
            self._health = SnelstartHealth(
                status=SnelstartStatus.NOT_CONFIGURED,
                error_message="API credentials niet geconfigureerd"
            )
            return False
        
        self._health.status = SnelstartStatus.AUTHENTICATING
        
        try:
            # OAuth 2.0 client credentials flow
            response = requests.post(
                self._auth_url,
                data={
                    "grant_type": "clientkey",
                    "clientkey": self._subscription_key,
                },
                auth=(self._client_id, self._client_secret),
                headers={
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                self._access_token = data.get("access_token")
                expires_in = data.get("expires_in", 3600)
                self._token_expires = datetime.now() + timedelta(seconds=expires_in - 60)
                
                self._health = SnelstartHealth(
                    status=SnelstartStatus.CONNECTED,
                    token_expires=self._token_expires,
                    last_check=datetime.now()
                )
                
                logger.info("Snelstart OAuth authentication successful")
                return True
            else:
                error_msg = f"Auth failed: {response.status_code} - {response.text}"
                self._health = SnelstartHealth(
                    status=SnelstartStatus.ERROR,
                    error_message=error_msg,
                    last_check=datetime.now()
                )
                logger.error(f"Snelstart authentication failed: {error_msg}")
                return False
                
        except requests.exceptions.RequestException as e:
            error_msg = f"Connection error: {str(e)}"
            self._health = SnelstartHealth(
                status=SnelstartStatus.DISCONNECTED,
                error_message=error_msg,
                last_check=datetime.now()
            )
            logger.error(f"Snelstart authentication error: {e}")
            return False
    
    def _ensure_authenticated(self) -> bool:
        """Ensure we have a valid access token."""
        if self._access_token and self._token_expires:
            if datetime.now() < self._token_expires:
                return True
        
        return self._authenticate()
    
    def _get_headers(self) -> Dict[str, str]:
        """Get headers for API requests."""
        return {
            "Authorization": f"Bearer {self._access_token}",
            "Ocp-Apim-Subscription-Key": self._subscription_key,
            "Content-Type": "application/json",
            "Accept": "application/json",
        }
    
    def _log_request(self, method: str, endpoint: str, status: int = 0, 
                     duration_ms: int = 0, error: str = None):
        """Log API request to history."""
        entry = {
            "timestamp": datetime.now().isoformat(),
            "method": method,
            "endpoint": endpoint,
            "status": status,
            "duration_ms": duration_ms,
            "error": error,
        }
        
        self._request_history.insert(0, entry)
        
        # Trim history
        if len(self._request_history) > self._max_history:
            self._request_history = self._request_history[:self._max_history]
    
    def request(self, 
                endpoint: str, 
                method: str = "GET", 
                data: Dict = None,
                params: Dict = None) -> Tuple[bool, Any]:
        """
        Make authenticated API request to Snelstart.
        
        Args:
            endpoint: API endpoint path
            method: HTTP method
            data: Request body (for POST/PUT)
            params: Query parameters
            
        Returns:
            Tuple of (success, data/error_message)
        """
        if not self._ensure_authenticated():
            return False, self._health.error_message or "Authentication failed"
        
        url = f"{self._api_url}{endpoint}"
        start_time = time.time()
        
        try:
            response = requests.request(
                method=method,
                url=url,
                headers=self._get_headers(),
                json=data if data else None,
                params=params,
                timeout=30
            )
            
            duration_ms = int((time.time() - start_time) * 1000)
            self._log_request(method, endpoint, response.status_code, duration_ms)
            
            if response.status_code in (200, 201):
                return True, response.json() if response.text else {}
            elif response.status_code == 204:
                return True, {}
            elif response.status_code == 401:
                # Token expired, try to re-authenticate
                self._access_token = None
                if self._authenticate():
                    # Retry request
                    return self.request(endpoint, method, data, params)
                return False, "Authentication expired"
            else:
                error_msg = f"API error {response.status_code}: {response.text}"
                logger.error(f"Snelstart API error: {error_msg}")
                return False, error_msg
                
        except requests.exceptions.Timeout:
            duration_ms = int((time.time() - start_time) * 1000)
            self._log_request(method, endpoint, 0, duration_ms, "Timeout")
            return False, "Request timeout"
            
        except requests.exceptions.RequestException as e:
            duration_ms = int((time.time() - start_time) * 1000)
            error_msg = str(e)
            self._log_request(method, endpoint, 0, duration_ms, error_msg)
            logger.error(f"Snelstart request error: {e}")
            return False, error_msg
    
    # =========================================================================
    # Health & Status
    # =========================================================================
    
    def check_health(self) -> SnelstartHealth:
        """
        Check API connection health.
        
        Returns:
            SnelstartHealth with current status
        """
        if not self.is_configured():
            self._health = SnelstartHealth(
                status=SnelstartStatus.NOT_CONFIGURED,
                error_message="Credentials niet geconfigureerd",
                last_check=datetime.now()
            )
            return self._health
        
        start_time = time.time()
        
        # Try to get landen (lightweight endpoint)
        success, data = self.request("/landen", params={"$top": 1})
        
        response_time = int((time.time() - start_time) * 1000)
        
        if success:
            self._health = SnelstartHealth(
                status=SnelstartStatus.CONNECTED,
                response_time_ms=response_time,
                last_check=datetime.now(),
                token_expires=self._token_expires
            )
        else:
            self._health = SnelstartHealth(
                status=SnelstartStatus.ERROR,
                response_time_ms=response_time,
                error_message=str(data),
                last_check=datetime.now()
            )
        
        return self._health
    
    def get_health(self) -> SnelstartHealth:
        """Get last known health status."""
        return self._health
    
    def get_request_history(self, limit: int = 20) -> List[Dict]:
        """Get recent API request history."""
        return self._request_history[:limit]
    
    # =========================================================================
    # Relaties (Debiteuren/Crediteuren)
    # =========================================================================
    
    def get_relaties(self, skip: int = 0, top: int = 100) -> Tuple[bool, Any]:
        """
        Haal alle relaties op.
        
        Args:
            skip: Number of records to skip (pagination)
            top: Maximum records to return
            
        Returns:
            Tuple of (success, list of relaties or error)
        """
        params = {"$skip": skip, "$top": top}
        return self.request("/relaties", params=params)
    
    def get_relatie(self, relatie_id: str) -> Tuple[bool, Any]:
        """Haal specifieke relatie op."""
        return self.request(f"/relaties/{relatie_id}")
    
    def create_relatie(self, relatie: Dict) -> Tuple[bool, Any]:
        """
        Maak nieuwe relatie aan.
        
        Required fields:
        - relatiecode: str (unique)
        - naam: str
        """
        return self.request("/relaties", method="POST", data=relatie)
    
    def update_relatie(self, relatie_id: str, relatie: Dict) -> Tuple[bool, Any]:
        """Update bestaande relatie."""
        return self.request(f"/relaties/{relatie_id}", method="PUT", data=relatie)
    
    def search_relatie_by_email(self, email: str) -> Tuple[bool, Any]:
        """Zoek relatie op email."""
        params = {"$filter": f"email eq '{email}'"}
        return self.request("/relaties", params=params)
    
    def search_relatie_by_naam(self, naam: str) -> Tuple[bool, Any]:
        """Zoek relatie op naam."""
        params = {"$filter": f"contains(naam, '{naam}')"}
        return self.request("/relaties", params=params)
    
    # =========================================================================
    # Verkoopfacturen
    # =========================================================================
    
    def get_verkoopfacturen(self, skip: int = 0, top: int = 100) -> Tuple[bool, Any]:
        """Haal verkoopfacturen op."""
        params = {"$skip": skip, "$top": top}
        return self.request("/verkoopboekingen", params=params)
    
    def get_verkoopfactuur(self, factuur_id: str) -> Tuple[bool, Any]:
        """Haal specifieke verkoopfactuur op."""
        return self.request(f"/verkoopboekingen/{factuur_id}")
    
    def create_verkoopfactuur(self, factuur: Dict) -> Tuple[bool, Any]:
        """
        Maak nieuwe verkoopfactuur aan.
        
        Required fields:
        - relatie: {id: str}
        - factuurdatum: str (YYYY-MM-DD)
        - boekstuk: str (factuur nummer)
        - regels: List[{bedrag, omschrijving, grootboek: {id}}]
        """
        return self.request("/verkoopboekingen", method="POST", data=factuur)
    
    # =========================================================================
    # Inkoopfacturen
    # =========================================================================
    
    def get_inkoopfacturen(self, skip: int = 0, top: int = 100) -> Tuple[bool, Any]:
        """Haal inkoopfacturen op."""
        params = {"$skip": skip, "$top": top}
        return self.request("/inkoopboekingen", params=params)
    
    def create_inkoopfactuur(self, factuur: Dict) -> Tuple[bool, Any]:
        """Maak nieuwe inkoopfactuur aan."""
        return self.request("/inkoopboekingen", method="POST", data=factuur)
    
    # =========================================================================
    # Referentie data
    # =========================================================================
    
    def get_grootboekrekeningen(self) -> Tuple[bool, Any]:
        """Haal alle grootboekrekeningen op."""
        return self.request("/grootboekrekeningen")
    
    def get_btwtarieven(self) -> Tuple[bool, Any]:
        """Haal BTW tarieven op."""
        return self.request("/btwtarieven")
    
    def get_landen(self) -> Tuple[bool, Any]:
        """Haal landen lijst op."""
        return self.request("/landen")
    
    def get_kostenplaatsen(self) -> Tuple[bool, Any]:
        """Haal kostenplaatsen op."""
        return self.request("/kostenplaatsen")


# Singleton accessor
_api_instance: Optional[SnelstartAPI] = None


def get_snelstart_api() -> SnelstartAPI:
    """Get the Snelstart API singleton instance."""
    global _api_instance
    if _api_instance is None:
        _api_instance = SnelstartAPI()
    return _api_instance
