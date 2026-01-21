"""
Snelstart View - Snelstart API beheer, synchronisatie en monitoring.
"""

import customtkinter as ctk
from tkinter import messagebox
import threading
from typing import Optional
from datetime import datetime

from ..database import get_db
from ..database.models import Invoice, InvoiceType, InvoiceStatus, Client
from ..utils.config import Config, logger
from ..services.snelstart_api import get_snelstart_api, SnelstartStatus
from ..services.snelstart_sync_service import (
    get_snelstart_sync_service, 
    get_snelstart_scheduler,
    SyncResult
)


class StatusIndicator(ctk.CTkFrame):
    """Visual status indicator for Snelstart connection."""
    
    COLORS = {
        SnelstartStatus.UNKNOWN: "gray50",
        SnelstartStatus.CONNECTED: "#34a853",
        SnelstartStatus.DISCONNECTED: "#ea4335",
        SnelstartStatus.ERROR: "#fbbc04",
        SnelstartStatus.AUTHENTICATING: "#4285f4",
        SnelstartStatus.NOT_CONFIGURED: "gray40",
    }
    
    LABELS = {
        SnelstartStatus.UNKNOWN: "Onbekend",
        SnelstartStatus.CONNECTED: "Verbonden",
        SnelstartStatus.DISCONNECTED: "Niet verbonden",
        SnelstartStatus.ERROR: "Fout",
        SnelstartStatus.AUTHENTICATING: "Authenticeren...",
        SnelstartStatus.NOT_CONFIGURED: "Niet geconfigureerd",
    }
    
    def __init__(self, parent, **kwargs):
        super().__init__(parent, fg_color="transparent", **kwargs)
        
        self._status = SnelstartStatus.UNKNOWN
        
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
    
    def set_status(self, status: SnelstartStatus):
        """Update status display."""
        self._status = status
        self.dot.configure(fg_color=self.COLORS.get(status, "gray50"))
        self.label.configure(text=self.LABELS.get(status, "Onbekend"))


class SyncQueueItem(ctk.CTkFrame):
    """Item in sync queue list."""
    
    def __init__(self, parent, item_type: str, name: str, status: str, **kwargs):
        super().__init__(parent, corner_radius=6, **kwargs)
        
        self.grid_columnconfigure(1, weight=1)
        
        # Icon
        icon = "📄" if item_type == "invoice" else "👤"
        icon_label = ctk.CTkLabel(
            self,
            text=icon,
            font=ctk.CTkFont(size=14)
        )
        icon_label.grid(row=0, column=0, padx=(10, 5), pady=8)
        
        # Name
        name_label = ctk.CTkLabel(
            self,
            text=name,
            font=ctk.CTkFont(size=12),
            anchor="w"
        )
        name_label.grid(row=0, column=1, sticky="w", padx=5)
        
        # Status indicator
        status_colors = {
            "pending": "#fbbc04",
            "synced": "#34a853",
            "error": "#ea4335",
        }
        status_label = ctk.CTkLabel(
            self,
            text=status.upper(),
            font=ctk.CTkFont(size=10, weight="bold"),
            text_color=status_colors.get(status, "gray50")
        )
        status_label.grid(row=0, column=2, padx=10)


class SnelstartView(ctk.CTkFrame):
    """Main Snelstart management view."""
    
    def __init__(self, parent):
        super().__init__(parent, fg_color="transparent")
        
        self.api = get_snelstart_api()
        self.sync_service = get_snelstart_sync_service()
        
        self.grid_columnconfigure(0, weight=1)
        self.grid_rowconfigure(4, weight=1)
        
        self._setup_ui()
    
    def _setup_ui(self):
        """Setup the UI."""
        # Header
        header_frame = ctk.CTkFrame(self, fg_color="transparent")
        header_frame.grid(row=0, column=0, sticky="ew", pady=(0, 20))
        
        title = ctk.CTkLabel(
            header_frame,
            text="📊 Snelstart Integratie",
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
            text="🔍 Test Verbinding",
            width=120,
            command=self._check_connection
        )
        check_btn.pack(side="right")
        
        # =====================================================================
        # Configuration Section
        # =====================================================================
        config_frame = ctk.CTkFrame(self, corner_radius=12)
        config_frame.grid(row=1, column=0, sticky="ew", pady=(0, 20))
        config_frame.grid_columnconfigure(1, weight=1)
        
        config_title = ctk.CTkLabel(
            config_frame,
            text="⚙️ API Configuratie",
            font=ctk.CTkFont(size=16, weight="bold"),
            anchor="w"
        )
        config_title.grid(row=0, column=0, columnspan=3, sticky="w", padx=20, pady=(15, 10))
        
        # Configuration status
        if Config.is_snelstart_configured():
            config_status = ctk.CTkLabel(
                config_frame,
                text="✓ API credentials geconfigureerd in .env",
                font=ctk.CTkFont(size=12),
                text_color="#34a853"
            )
        else:
            config_status = ctk.CTkLabel(
                config_frame,
                text="⚠️ API credentials niet geconfigureerd. Voeg toe aan .env bestand.",
                font=ctk.CTkFont(size=12),
                text_color="#fbbc04"
            )
        config_status.grid(row=1, column=0, columnspan=3, sticky="w", padx=20, pady=5)
        
        # Config fields info
        config_info = ctk.CTkLabel(
            config_frame,
            text=(
                "Vereiste environment variabelen:\n"
                "• SNELSTART_CLIENT_ID\n"
                "• SNELSTART_CLIENT_SECRET\n"
                "• SNELSTART_SUBSCRIPTION_KEY"
            ),
            font=ctk.CTkFont(size=11),
            text_color="gray50",
            justify="left",
            anchor="w"
        )
        config_info.grid(row=2, column=0, columnspan=3, sticky="w", padx=20, pady=(5, 15))
        
        # =====================================================================
        # Sync Section
        # =====================================================================
        sync_frame = ctk.CTkFrame(self, corner_radius=12)
        sync_frame.grid(row=2, column=0, sticky="ew", pady=(0, 20))
        sync_frame.grid_columnconfigure((0, 1), weight=1)
        
        sync_title = ctk.CTkLabel(
            sync_frame,
            text="🔄 Synchronisatie",
            font=ctk.CTkFont(size=16, weight="bold"),
            anchor="w"
        )
        sync_title.grid(row=0, column=0, columnspan=2, sticky="w", padx=20, pady=(15, 10))
        
        # Last sync status
        self.last_sync_label = ctk.CTkLabel(
            sync_frame,
            text="Laatste sync: Nooit",
            font=ctk.CTkFont(size=12),
            text_color="gray50"
        )
        self.last_sync_label.grid(row=1, column=0, sticky="w", padx=20, pady=5)
        
        # Auto-sync status
        auto_sync_status = "Actief" if Config.SNELSTART_AUTO_SYNC else "Uitgeschakeld"
        auto_sync_color = "#34a853" if Config.SNELSTART_AUTO_SYNC else "gray50"
        self.auto_sync_label = ctk.CTkLabel(
            sync_frame,
            text=f"Auto-sync: {auto_sync_status} (interval: {Config.SNELSTART_SYNC_INTERVAL} min)",
            font=ctk.CTkFont(size=12),
            text_color=auto_sync_color
        )
        self.auto_sync_label.grid(row=2, column=0, sticky="w", padx=20, pady=5)
        
        # Sync buttons
        buttons_frame = ctk.CTkFrame(sync_frame, fg_color="transparent")
        buttons_frame.grid(row=3, column=0, columnspan=2, sticky="ew", padx=20, pady=(10, 15))
        
        self.sync_all_btn = ctk.CTkButton(
            buttons_frame,
            text="⚡ Alles Synchroniseren",
            fg_color="#34a853",
            hover_color="#2d8f47",
            command=self._sync_all
        )
        self.sync_all_btn.pack(side="left", padx=(0, 10))
        
        sync_clients_btn = ctk.CTkButton(
            buttons_frame,
            text="👥 Klanten Sync",
            fg_color="gray40",
            command=self._sync_clients
        )
        sync_clients_btn.pack(side="left", padx=(0, 10))
        
        sync_invoices_btn = ctk.CTkButton(
            buttons_frame,
            text="📄 Facturen Sync",
            fg_color="gray40",
            command=self._sync_invoices
        )
        sync_invoices_btn.pack(side="left")
        
        # =====================================================================
        # Sync Queue Section
        # =====================================================================
        queue_frame = ctk.CTkFrame(self, corner_radius=12)
        queue_frame.grid(row=3, column=0, sticky="ew", pady=(0, 20))
        queue_frame.grid_columnconfigure(0, weight=1)
        
        queue_title = ctk.CTkLabel(
            queue_frame,
            text="📋 Sync Status",
            font=ctk.CTkFont(size=16, weight="bold"),
            anchor="w"
        )
        queue_title.grid(row=0, column=0, sticky="w", padx=20, pady=(15, 10))
        
        # Stats
        stats_frame = ctk.CTkFrame(queue_frame, fg_color="transparent")
        stats_frame.grid(row=1, column=0, sticky="ew", padx=20, pady=(0, 10))
        
        self.clients_pending_label = ctk.CTkLabel(
            stats_frame,
            text="👥 Klanten: 0 wachtend",
            font=ctk.CTkFont(size=12)
        )
        self.clients_pending_label.pack(side="left", padx=(0, 20))
        
        self.invoices_pending_label = ctk.CTkLabel(
            stats_frame,
            text="📄 Facturen: 0 wachtend",
            font=ctk.CTkFont(size=12)
        )
        self.invoices_pending_label.pack(side="left", padx=(0, 20))
        
        self.errors_label = ctk.CTkLabel(
            stats_frame,
            text="⚠️ Fouten: 0",
            font=ctk.CTkFont(size=12),
            text_color="gray50"
        )
        self.errors_label.pack(side="left")
        
        # Queue list
        self.queue_list = ctk.CTkScrollableFrame(queue_frame, height=150)
        self.queue_list.grid(row=2, column=0, sticky="ew", padx=20, pady=(0, 15))
        
        # =====================================================================
        # Request History Section
        # =====================================================================
        history_frame = ctk.CTkFrame(self, corner_radius=12)
        history_frame.grid(row=4, column=0, sticky="nsew")
        history_frame.grid_columnconfigure(0, weight=1)
        history_frame.grid_rowconfigure(1, weight=1)
        
        history_title = ctk.CTkLabel(
            history_frame,
            text="📜 API Request Geschiedenis",
            font=ctk.CTkFont(size=16, weight="bold"),
            anchor="w"
        )
        history_title.grid(row=0, column=0, sticky="w", padx=20, pady=(15, 10))
        
        self.history_text = ctk.CTkTextbox(
            history_frame,
            font=ctk.CTkFont(size=11, family="Consolas"),
            height=150
        )
        self.history_text.grid(row=1, column=0, sticky="nsew", padx=20, pady=(0, 15))
    
    def refresh(self):
        """Refresh the view."""
        self._update_status()
        self._update_queue_stats()
        self._update_history()
    
    def _update_status(self):
        """Update connection status."""
        health = self.api.get_health()
        self.status_indicator.set_status(health.status)
        
        # Update last sync
        scheduler = get_snelstart_scheduler()
        if scheduler.last_sync:
            time_str = scheduler.last_sync.strftime("%d-%m-%Y %H:%M")
            self.last_sync_label.configure(text=f"Laatste sync: {time_str}")
    
    def _update_queue_stats(self):
        """Update queue statistics."""
        db = get_db()
        with db.session() as session:
            # Count pending clients
            pending_clients = session.query(Client).filter(
                (Client.snelstart_sync_status == None) |
                (Client.snelstart_sync_status == "pending")
            ).count()
            
            error_clients = session.query(Client).filter(
                Client.snelstart_sync_status == "error"
            ).count()
            
            # Count pending invoices
            pending_invoices = session.query(Invoice).filter(
                Invoice.invoice_type == InvoiceType.OUTGOING.value,
                Invoice.status.in_([InvoiceStatus.SENT.value, InvoiceStatus.PAID.value]),
                (Invoice.snelstart_sync_status == None) |
                (Invoice.snelstart_sync_status == "pending")
            ).count()
            
            error_invoices = session.query(Invoice).filter(
                Invoice.snelstart_sync_status == "error"
            ).count()
        
        self.clients_pending_label.configure(text=f"👥 Klanten: {pending_clients} wachtend")
        self.invoices_pending_label.configure(text=f"📄 Facturen: {pending_invoices} wachtend")
        
        total_errors = error_clients + error_invoices
        if total_errors > 0:
            self.errors_label.configure(text=f"⚠️ Fouten: {total_errors}", text_color="#ea4335")
        else:
            self.errors_label.configure(text="⚠️ Fouten: 0", text_color="gray50")
        
        # Update queue list
        self._update_queue_list()
    
    def _update_queue_list(self):
        """Update the queue list with pending items."""
        # Clear list
        for widget in self.queue_list.winfo_children():
            widget.destroy()
        
        db = get_db()
        with db.session() as session:
            # Get recent items needing sync or with errors
            items = []
            
            # Clients
            clients = session.query(Client).filter(
                (Client.snelstart_sync_status == "pending") |
                (Client.snelstart_sync_status == "error") |
                (Client.snelstart_sync_status == None)
            ).limit(10).all()
            
            for client in clients:
                status = client.snelstart_sync_status or "pending"
                items.append(("client", client.name, status))
            
            # Invoices
            invoices = session.query(Invoice).filter(
                Invoice.invoice_type == InvoiceType.OUTGOING.value,
                (Invoice.snelstart_sync_status == "pending") |
                (Invoice.snelstart_sync_status == "error") |
                (Invoice.snelstart_sync_status == None)
            ).limit(10).all()
            
            for invoice in invoices:
                status = invoice.snelstart_sync_status or "pending"
                items.append(("invoice", invoice.invoice_number, status))
        
        if not items:
            empty_label = ctk.CTkLabel(
                self.queue_list,
                text="Geen items wachtend op synchronisatie",
                text_color="gray50"
            )
            empty_label.pack(pady=20)
        else:
            for item_type, name, status in items:
                item = SyncQueueItem(self.queue_list, item_type, name, status)
                item.pack(fill="x", pady=2)
    
    def _update_history(self):
        """Update request history display."""
        history = self.api.get_request_history(limit=20)
        
        self.history_text.delete("1.0", "end")
        
        if not history:
            self.history_text.insert("end", "Geen API requests uitgevoerd.\n")
            return
        
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
                status_icon = "✓" if status in (200, 201, 204) else "✗"
                line = f"{timestamp} {method} {endpoint} → {status_icon} {status} ({duration}ms)\n"
            
            self.history_text.insert("end", line)
    
    def _check_connection(self):
        """Check API connection."""
        if not Config.is_snelstart_configured():
            messagebox.showwarning(
                "Niet Geconfigureerd",
                "Snelstart API credentials zijn niet geconfigureerd.\n\n"
                "Voeg de volgende variabelen toe aan je .env bestand:\n"
                "• SNELSTART_CLIENT_ID\n"
                "• SNELSTART_CLIENT_SECRET\n"
                "• SNELSTART_SUBSCRIPTION_KEY"
            )
            return
        
        self.status_indicator.set_status(SnelstartStatus.AUTHENTICATING)
        
        def check():
            health = self.api.check_health()
            self.after(0, lambda: self._on_health_check(health))
        
        threading.Thread(target=check, daemon=True).start()
    
    def _on_health_check(self, health):
        """Handle health check result."""
        self.status_indicator.set_status(health.status)
        self._update_history()
        
        if health.status == SnelstartStatus.CONNECTED:
            messagebox.showinfo(
                "Verbinding OK",
                f"Snelstart API verbinding succesvol!\n\n"
                f"Response tijd: {health.response_time_ms}ms"
            )
        elif health.error_message:
            messagebox.showerror(
                "Verbinding Mislukt",
                f"Kon niet verbinden met Snelstart API:\n\n{health.error_message}"
            )
    
    def _sync_all(self):
        """Sync all clients and invoices."""
        if not Config.is_snelstart_configured():
            messagebox.showwarning("Niet Geconfigureerd", "Snelstart API is niet geconfigureerd.")
            return
        
        self.sync_all_btn.configure(state="disabled", text="⏳ Bezig...")
        
        def do_sync():
            client_result, invoice_result = self.sync_service.sync_all()
            self.after(0, lambda: self._on_sync_complete(client_result, invoice_result))
        
        threading.Thread(target=do_sync, daemon=True).start()
    
    def _sync_clients(self):
        """Sync only clients."""
        if not Config.is_snelstart_configured():
            messagebox.showwarning("Niet Geconfigureerd", "Snelstart API is niet geconfigureerd.")
            return
        
        def do_sync():
            result = self.sync_service.sync_all_clients()
            self.after(0, lambda: self._on_client_sync_complete(result))
        
        threading.Thread(target=do_sync, daemon=True).start()
    
    def _sync_invoices(self):
        """Sync only invoices."""
        if not Config.is_snelstart_configured():
            messagebox.showwarning("Niet Geconfigureerd", "Snelstart API is niet geconfigureerd.")
            return
        
        def do_sync():
            result = self.sync_service.sync_all_invoices()
            self.after(0, lambda: self._on_invoice_sync_complete(result))
        
        threading.Thread(target=do_sync, daemon=True).start()
    
    def _on_sync_complete(self, client_result: SyncResult, invoice_result: SyncResult):
        """Handle sync completion."""
        self.sync_all_btn.configure(state="normal", text="⚡ Alles Synchroniseren")
        self.refresh()
        
        message = (
            f"Synchronisatie voltooid!\n\n"
            f"Klanten: {client_result.synced} gesynchroniseerd, {client_result.errors} fouten\n"
            f"Facturen: {invoice_result.synced} gesynchroniseerd, {invoice_result.errors} fouten"
        )
        
        if client_result.errors > 0 or invoice_result.errors > 0:
            all_errors = client_result.error_messages + invoice_result.error_messages
            if all_errors:
                message += "\n\nFouten:\n" + "\n".join(all_errors[:5])
            messagebox.showwarning("Sync Voltooid", message)
        else:
            messagebox.showinfo("Sync Voltooid", message)
    
    def _on_client_sync_complete(self, result: SyncResult):
        """Handle client sync completion."""
        self.refresh()
        
        message = f"Klanten sync voltooid!\n\n{result.synced} gesynchroniseerd, {result.errors} fouten"
        if result.errors > 0 and result.error_messages:
            message += "\n\nFouten:\n" + "\n".join(result.error_messages[:5])
            messagebox.showwarning("Klanten Sync", message)
        else:
            messagebox.showinfo("Klanten Sync", message)
    
    def _on_invoice_sync_complete(self, result: SyncResult):
        """Handle invoice sync completion."""
        self.refresh()
        
        message = f"Facturen sync voltooid!\n\n{result.synced} gesynchroniseerd, {result.errors} fouten"
        if result.errors > 0 and result.error_messages:
            message += "\n\nFouten:\n" + "\n".join(result.error_messages[:5])
            messagebox.showwarning("Facturen Sync", message)
        else:
            messagebox.showinfo("Facturen Sync", message)
