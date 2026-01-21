"""
API View - Website API status, configuratie en sync beheer.
"""

import customtkinter as ctk
import threading
from datetime import datetime
from typing import Optional

from ..services.website_api import get_website_api, APIStatus, APIHealth
from ..utils.config import Config, logger


class StatusIndicator(ctk.CTkFrame):
    """Visual status indicator."""
    
    COLORS = {
        APIStatus.UNKNOWN: "gray50",
        APIStatus.CONNECTED: "#34a853",
        APIStatus.DISCONNECTED: "#ea4335",
        APIStatus.ERROR: "#fbbc04",
        APIStatus.AUTHENTICATING: "#4285f4",
    }
    
    LABELS = {
        APIStatus.UNKNOWN: "Onbekend",
        APIStatus.CONNECTED: "Verbonden",
        APIStatus.DISCONNECTED: "Niet verbonden",
        APIStatus.ERROR: "Fout",
        APIStatus.AUTHENTICATING: "Authenticeren...",
    }
    
    def __init__(self, parent, **kwargs):
        super().__init__(parent, fg_color="transparent", **kwargs)
        
        self._status = APIStatus.UNKNOWN
        
        # Indicator dot
        self.dot = ctk.CTkFrame(
            self,
            width=12,
            height=12,
            corner_radius=6,
            fg_color=self.COLORS[self._status]
        )
        self.dot.pack(side="left", padx=(0, 8))
        
        # Status label
        self.label = ctk.CTkLabel(
            self,
            text=self.LABELS[self._status],
            font=ctk.CTkFont(size=13, weight="bold")
        )
        self.label.pack(side="left")
    
    def set_status(self, status: APIStatus):
        """Update status display."""
        self._status = status
        self.dot.configure(fg_color=self.COLORS.get(status, "gray50"))
        self.label.configure(text=self.LABELS.get(status, "Onbekend"))


class EndpointCard(ctk.CTkFrame):
    """Card showing endpoint status."""
    
    def __init__(self, parent, name: str, path: str, description: str, **kwargs):
        super().__init__(parent, corner_radius=8, **kwargs)
        
        self.grid_columnconfigure(1, weight=1)
        
        # Icon
        icon_label = ctk.CTkLabel(
            self,
            text="🔗",
            font=ctk.CTkFont(size=18)
        )
        icon_label.grid(row=0, column=0, rowspan=2, padx=(15, 10), pady=10)
        
        # Name
        name_label = ctk.CTkLabel(
            self,
            text=name,
            font=ctk.CTkFont(size=13, weight="bold"),
            anchor="w"
        )
        name_label.grid(row=0, column=1, sticky="w", pady=(10, 0))
        
        # Path
        path_label = ctk.CTkLabel(
            self,
            text=path,
            font=ctk.CTkFont(size=11, family="Consolas"),
            text_color="gray50",
            anchor="w"
        )
        path_label.grid(row=1, column=1, sticky="w", pady=(0, 10))
        
        # Status
        self.status_label = ctk.CTkLabel(
            self,
            text="—",
            font=ctk.CTkFont(size=11),
            text_color="gray50"
        )
        self.status_label.grid(row=0, column=2, rowspan=2, padx=15)
    
    def set_status(self, status_code: int = None, call_count: int = 0):
        """Update endpoint status."""
        if status_code is None:
            self.status_label.configure(text="—", text_color="gray50")
        elif status_code == 200:
            self.status_label.configure(text=f"✓ {call_count}x", text_color="#34a853")
        elif status_code == 404:
            self.status_label.configure(text="404", text_color="#ea4335")
        else:
            self.status_label.configure(text=f"{status_code}", text_color="#fbbc04")


class SyncCard(ctk.CTkFrame):
    """Card for sync category."""
    
    ICONS = {
        "customers": "👥",
        "tickets": "🎫",
        "subscriptions": "📋",
        "products": "📦",
        "invoices": "💰",
    }
    
    LABELS = {
        "customers": "Klanten",
        "tickets": "Support Tickets",
        "subscriptions": "Abonnementen",
        "products": "Producten",
        "invoices": "Facturen",
    }
    
    def __init__(self, parent, category: str, on_sync: callable, **kwargs):
        super().__init__(parent, corner_radius=8, **kwargs)
        
        self.category = category
        self.on_sync = on_sync
        
        self.grid_columnconfigure(1, weight=1)
        
        # Icon
        icon = self.ICONS.get(category, "📦")
        icon_label = ctk.CTkLabel(
            self,
            text=icon,
            font=ctk.CTkFont(size=24)
        )
        icon_label.grid(row=0, column=0, rowspan=2, padx=(15, 10), pady=15)
        
        # Name
        name = self.LABELS.get(category, category)
        name_label = ctk.CTkLabel(
            self,
            text=name,
            font=ctk.CTkFont(size=14, weight="bold"),
            anchor="w"
        )
        name_label.grid(row=0, column=1, sticky="w", pady=(15, 0))
        
        # Stats
        self.stats_label = ctk.CTkLabel(
            self,
            text="Nog niet gesynchroniseerd",
            font=ctk.CTkFont(size=11),
            text_color="gray50",
            anchor="w"
        )
        self.stats_label.grid(row=1, column=1, sticky="w", pady=(0, 15))
        
        # Sync button
        self.sync_btn = ctk.CTkButton(
            self,
            text="🔄 Sync",
            width=80,
            command=self._do_sync
        )
        self.sync_btn.grid(row=0, column=2, rowspan=2, padx=15)
    
    def _do_sync(self):
        """Trigger sync."""
        self.sync_btn.configure(state="disabled", text="...")
        self.on_sync(self.category, self._sync_complete)
    
    def _sync_complete(self, synced: int, errors: int):
        """Sync completed callback."""
        self.sync_btn.configure(state="normal", text="🔄 Sync")
        self.update_stats(synced, errors, datetime.now())
    
    def update_stats(self, total_synced: int, total_errors: int, last_sync: datetime = None):
        """Update stats display."""
        if last_sync:
            time_str = last_sync.strftime("%H:%M")
            self.stats_label.configure(
                text=f"{total_synced} gesynchroniseerd, {total_errors} fouten • {time_str}"
            )
        else:
            self.stats_label.configure(text="Nog niet gesynchroniseerd")


class APIView(ctk.CTkFrame):
    """Main API management view."""
    
    def __init__(self, parent):
        super().__init__(parent, fg_color="transparent")
        
        self.api = get_website_api()
        
        self.grid_columnconfigure(0, weight=1)
        self.grid_rowconfigure(3, weight=1)
        
        self._setup_ui()
    
    def _setup_ui(self):
        """Setup the UI."""
        # Header
        header_frame = ctk.CTkFrame(self, fg_color="transparent")
        header_frame.grid(row=0, column=0, sticky="ew", pady=(0, 20))
        
        title = ctk.CTkLabel(
            header_frame,
            text="🌐 Website API",
            font=ctk.CTkFont(size=24, weight="bold"),
            anchor="w"
        )
        title.pack(side="left")
        
        # Status indicator
        self.status_indicator = StatusIndicator(header_frame)
        self.status_indicator.pack(side="right", padx=10)
        
        # Check button
        check_btn = ctk.CTkButton(
            header_frame,
            text="🔍 Check",
            width=80,
            command=self._check_connection
        )
        check_btn.pack(side="right")
        
        # Config section
        config_frame = ctk.CTkFrame(self, corner_radius=12)
        config_frame.grid(row=1, column=0, sticky="ew", pady=(0, 20))
        config_frame.grid_columnconfigure(1, weight=1)
        
        config_title = ctk.CTkLabel(
            config_frame,
            text="⚙️ Configuratie",
            font=ctk.CTkFont(size=16, weight="bold"),
            anchor="w"
        )
        config_title.grid(row=0, column=0, columnspan=3, sticky="w", padx=20, pady=(15, 10))
        
        # API URL
        url_label = ctk.CTkLabel(
            config_frame,
            text="API URL:",
            font=ctk.CTkFont(size=12),
            anchor="w"
        )
        url_label.grid(row=1, column=0, sticky="w", padx=(20, 10), pady=5)
        
        self.url_entry = ctk.CTkEntry(
            config_frame,
            placeholder_text="https://ro-techdevelopment.dev/api",
            font=ctk.CTkFont(size=12)
        )
        self.url_entry.grid(row=1, column=1, sticky="ew", pady=5)
        self.url_entry.insert(0, Config.WEBSITE_API_URL)
        
        # API Key
        key_label = ctk.CTkLabel(
            config_frame,
            text="API Key:",
            font=ctk.CTkFont(size=12),
            anchor="w"
        )
        key_label.grid(row=2, column=0, sticky="w", padx=(20, 10), pady=5)
        
        self.key_entry = ctk.CTkEntry(
            config_frame,
            placeholder_text="rotech-admin-secret-key",
            font=ctk.CTkFont(size=12),
            show="•"
        )
        self.key_entry.grid(row=2, column=1, sticky="ew", pady=5)
        self.key_entry.insert(0, Config.WEBSITE_ADMIN_API_KEY)
        
        # Save button
        save_btn = ctk.CTkButton(
            config_frame,
            text="💾 Opslaan",
            width=100,
            command=self._save_config
        )
        save_btn.grid(row=1, column=2, rowspan=2, padx=20, pady=5)
        
        # Response time
        self.response_label = ctk.CTkLabel(
            config_frame,
            text="",
            font=ctk.CTkFont(size=11),
            text_color="gray50"
        )
        self.response_label.grid(row=3, column=0, columnspan=3, sticky="w", padx=20, pady=(5, 15))
        
        # Sync section
        sync_frame = ctk.CTkFrame(self, fg_color="transparent")
        sync_frame.grid(row=2, column=0, sticky="ew", pady=(0, 20))
        sync_frame.grid_columnconfigure((0, 1), weight=1)
        
        sync_title = ctk.CTkLabel(
            sync_frame,
            text="🔄 Synchronisatie",
            font=ctk.CTkFont(size=16, weight="bold"),
            anchor="w"
        )
        sync_title.grid(row=0, column=0, columnspan=2, sticky="w", pady=(0, 10))
        
        # Sync all button
        sync_all_btn = ctk.CTkButton(
            sync_frame,
            text="⚡ Alles Synchroniseren",
            fg_color="#34a853",
            hover_color="#2d8f47",
            command=self._sync_all
        )
        sync_all_btn.grid(row=0, column=1, sticky="e", pady=(0, 10))
        
        # Sync cards - v1/sync API categorieën
        self.sync_cards = {}
        categories = ["customers", "tickets", "subscriptions", "products", "invoices"]
        
        for i, cat in enumerate(categories):
            row = (i // 2) + 1
            col = i % 2
            
            card = SyncCard(sync_frame, cat, self._sync_category)
            card.grid(row=row, column=col, sticky="ew", padx=(0 if col == 0 else 5, 5 if col == 0 else 0), pady=5)
            self.sync_cards[cat] = card
        
        # Endpoints section
        endpoints_frame = ctk.CTkScrollableFrame(self, fg_color="transparent")
        endpoints_frame.grid(row=3, column=0, sticky="nsew")
        endpoints_frame.grid_columnconfigure(0, weight=1)
        
        endpoints_title = ctk.CTkLabel(
            endpoints_frame,
            text="📡 API Endpoints (v1/sync)",
            font=ctk.CTkFont(size=16, weight="bold"),
            anchor="w"
        )
        endpoints_title.grid(row=0, column=0, sticky="w", pady=(0, 10))
        
        # Endpoint cards - v1/sync endpoints
        self.endpoint_cards = {}
        endpoints = [
            ("status", "API Status", "/v1/status"),
            ("customers", "Customers", "/v1/sync/customers"),
            ("tickets", "Support Tickets", "/v1/sync/tickets"),
            ("subscriptions", "Subscriptions", "/v1/sync/subscriptions"),
            ("products", "Products", "/v1/sync/products"),
            ("invoices", "Invoices", "/v1/sync/invoices"),
        ]
        
        for i, (key, name, path) in enumerate(endpoints):
            card = EndpointCard(endpoints_frame, name, path, "")
            card.grid(row=i+1, column=0, sticky="ew", pady=2)
            self.endpoint_cards[key] = card
        
        # Request history
        history_title = ctk.CTkLabel(
            endpoints_frame,
            text="📜 Recente Requests",
            font=ctk.CTkFont(size=14, weight="bold"),
            anchor="w"
        )
        history_title.grid(row=len(endpoints)+2, column=0, sticky="w", pady=(20, 10))
        
        self.history_text = ctk.CTkTextbox(
            endpoints_frame,
            height=150,
            font=ctk.CTkFont(size=11, family="Consolas")
        )
        self.history_text.grid(row=len(endpoints)+3, column=0, sticky="ew")
    
    def refresh(self):
        """Refresh API status."""
        # Update health
        health = self.api.get_health()
        self.status_indicator.set_status(health.status)
        
        if health.response_time_ms:
            self.response_label.configure(
                text=f"Response tijd: {health.response_time_ms}ms"
            )
        elif health.error_message:
            self.response_label.configure(
                text=f"⚠️ {health.error_message}"
            )
        
        # Update endpoints
        endpoints_status = self.api.get_endpoints_status()
        for key, card in self.endpoint_cards.items():
            if key in endpoints_status:
                ep = endpoints_status[key]
                card.set_status(ep["last_status"], ep["call_count"])
        
        # Update history
        self._update_history()
    
    def _check_connection(self):
        """Check API connection."""
        self.status_indicator.set_status(APIStatus.AUTHENTICATING)
        
        def check():
            health = self.api.check_health()
            self.after(0, lambda: self._on_health_check(health))
        
        threading.Thread(target=check, daemon=True).start()
    
    def _on_health_check(self, health: APIHealth):
        """Handle health check result."""
        self.status_indicator.set_status(health.status)
        
        if health.response_time_ms:
            self.response_label.configure(
                text=f"Response tijd: {health.response_time_ms}ms"
            )
        elif health.error_message:
            self.response_label.configure(
                text=f"⚠️ {health.error_message}"
            )
        
        self._update_history()
    
    def _save_config(self):
        """Save API configuration."""
        url = self.url_entry.get().strip()
        key = self.key_entry.get().strip()
        
        if url and key:
            self.api.configure(base_url=url, api_key=key)
            self.response_label.configure(text="✓ Configuratie opgeslagen")
            
            # Check connection with new config
            self._check_connection()
    
    def _sync_category(self, category: str, callback: callable):
        """Sync a specific category using v1/sync API."""
        def do_sync():
            if category == "customers":
                success, data = self.api.get_customers()
            elif category == "tickets":
                success, data = self.api.get_tickets()
            elif category == "subscriptions":
                success, data = self.api.get_subscriptions()
            elif category == "products":
                success, data = self.api.get_products()
            elif category == "invoices":
                success, data = self.api.get_invoices()
            else:
                success, data = False, "Unknown category"
            
            # v1 API returns data in 'data' field
            if success and isinstance(data, dict):
                items = data.get("data", [])
                count = len(items) if isinstance(items, list) else 0
            else:
                count = 0
            errors = 0 if success else 1
            
            self.after(0, lambda: callback(count, errors))
            self.after(0, self._update_history)
        
        threading.Thread(target=do_sync, daemon=True).start()
    
    def _sync_all(self):
        """Sync all categories."""
        def do_sync():
            results = self.api.sync_all()
            self.after(0, lambda: self._on_sync_all_complete(results))
        
        threading.Thread(target=do_sync, daemon=True).start()
    
    def _on_sync_all_complete(self, results: dict):
        """Handle sync all completion."""
        for cat, (synced, errors) in results.items():
            if cat in self.sync_cards:
                self.sync_cards[cat].update_stats(synced, errors, datetime.now())
        
        self._update_history()
    
    def _update_history(self):
        """Update request history display."""
        history = self.api.get_request_history(limit=20)
        
        self.history_text.delete("1.0", "end")
        
        for req in history:
            timestamp = req.get("timestamp", "")[:19]
            method = req.get("method", "GET")
            endpoint = req.get("endpoint", "")
            status = req.get("status", 0)
            duration = req.get("duration_ms", 0)
            error = req.get("error", "")
            
            if error:
                line = f"{timestamp} {method} {endpoint} → ERROR: {error}\n"
            else:
                line = f"{timestamp} {method} {endpoint} → {status} ({duration}ms)\n"
            
            self.history_text.insert("end", line)
