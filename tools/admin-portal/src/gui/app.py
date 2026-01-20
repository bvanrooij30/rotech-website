"""
Main Application Window voor Ro-Tech Admin Portal.
"""

import customtkinter as ctk
from tkinter import messagebox
from typing import Optional, Dict, Type
import threading

from ..utils.config import Config, logger
from ..database import get_db, init_db
from ..database.models import EmailAccount
from .sidebar import Sidebar
from .dashboard import DashboardView
from .email_view import EmailView
from .leads_view import LeadsView
from .inbox_view import InboxView
from .clients_view import ClientsView
from .invoices_view import InvoicesView
from .settings_view import SettingsView


class AdminPortalApp(ctk.CTk):
    """Main application window."""
    
    def __init__(self):
        super().__init__()
        
        # Window setup
        self.title("🏢 Ro-Tech Admin Portal")
        self.geometry("1400x800")
        self.minsize(1000, 600)
        
        # Set theme
        ctk.set_appearance_mode(Config.APP_THEME)
        ctk.set_default_color_theme("blue")
        
        # Initialize database
        self._init_database()
        
        # Views registry
        self._views: Dict[str, ctk.CTkFrame] = {}
        self._current_view: Optional[str] = None
        
        # Sync scheduler references
        self._sync_scheduler = None
        self._payment_scheduler = None
        
        # Build UI
        self._setup_ui()
        
        # Show dashboard by default
        self.show_view("dashboard")
        
        # Start background services
        self._start_background_services()
        
        logger.info("Admin Portal started")
    
    def _init_database(self):
        """Initialize database on startup."""
        try:
            init_db()
        except Exception as e:
            logger.error(f"Database initialization failed: {e}")
            self._show_error("Database Error", f"Kon database niet initialiseren:\n{e}")
    
    def _setup_ui(self):
        """Setup the main UI layout."""
        # Configure grid
        self.grid_columnconfigure(1, weight=1)
        self.grid_rowconfigure(0, weight=1)
        
        # Sidebar (links)
        self.sidebar = Sidebar(self, self._on_nav_click)
        self.sidebar.grid(row=0, column=0, sticky="nsw", padx=0, pady=0)
        
        # Content area (rechts)
        self.content_frame = ctk.CTkFrame(self, fg_color="transparent")
        self.content_frame.grid(row=0, column=1, sticky="nsew", padx=10, pady=10)
        self.content_frame.grid_columnconfigure(0, weight=1)
        self.content_frame.grid_rowconfigure(0, weight=1)
        
        # Initialize views (lazy loading)
        self._view_classes: Dict[str, Type[ctk.CTkFrame]] = {
            "dashboard": DashboardView,
            "email": EmailView,
            "inbox": InboxView,
            "leads": LeadsView,
            "clients": ClientsView,
            "invoices": InvoicesView,
            "settings": SettingsView,
        }
    
    def _on_nav_click(self, view_name: str):
        """Handle navigation click from sidebar."""
        self.show_view(view_name)
    
    def show_view(self, view_name: str):
        """Show a specific view."""
        if view_name == self._current_view:
            return
        
        # Hide current view
        if self._current_view and self._current_view in self._views:
            self._views[self._current_view].grid_forget()
        
        # Create view if not exists (lazy loading)
        if view_name not in self._views:
            if view_name in self._view_classes:
                self._views[view_name] = self._view_classes[view_name](self.content_frame)
            else:
                logger.warning(f"Unknown view: {view_name}")
                return
        
        # Show view
        self._views[view_name].grid(row=0, column=0, sticky="nsew")
        self._current_view = view_name
        
        # Update sidebar selection
        self.sidebar.set_active(view_name)
        
        # Refresh view data
        if hasattr(self._views[view_name], 'refresh'):
            self._views[view_name].refresh()
        
        logger.debug(f"Switched to view: {view_name}")
    
    def _start_background_services(self):
        """Start background sync services."""
        # Email sync
        db = get_db()
        with db.session() as session:
            account_count = session.query(EmailAccount).filter_by(is_active=True).count()
        
        if account_count > 0:
            self._start_email_sync()
        else:
            logger.info("No email accounts configured, skipping email auto-sync")
        
        # Payment sync from website
        self._start_payment_sync()
    
    def _start_email_sync(self):
        """Start automatic email sync in background."""
        from ..services.sync_service import start_background_sync
        
        def on_new_emails(count: int):
            """Callback when new emails arrive."""
            # Update UI on main thread
            self.after(0, lambda: self._notify_new_emails(count))
        
        # Start scheduler with callback
        self._sync_scheduler = start_background_sync(
            interval_minutes=Config.EMAIL_SYNC_INTERVAL,
            on_new_emails=on_new_emails
        )
        
        logger.info(f"Auto-sync started: checking every {Config.EMAIL_SYNC_INTERVAL} minutes")
    
    def _start_payment_sync(self):
        """Start automatic payment sync from website."""
        from ..services.payment_sync_service import start_payment_sync
        
        def on_new_payments(count: int):
            """Callback when new payments are synced."""
            # Update UI on main thread
            self.after(0, lambda: self._notify_new_payments(count))
        
        # Start scheduler with callback
        self._payment_scheduler = start_payment_sync(
            interval_minutes=Config.PAYMENT_SYNC_INTERVAL,
            on_new_payments=on_new_payments
        )
        
        logger.info(f"Payment auto-sync started: checking every {Config.PAYMENT_SYNC_INTERVAL} minutes")
    
    def _notify_new_payments(self, count: int):
        """Show notification for new payments/invoices."""
        # Refresh invoices view if it's active
        if self._current_view in ['invoices', 'dashboard']:
            if self._current_view in self._views:
                self._views[self._current_view].refresh()
        
        # Show notification
        self._show_toast(f"💰 {count} nieuwe betaling{'en' if count > 1 else ''} geïmporteerd!")
    
    def _notify_new_emails(self, count: int):
        """Show notification for new emails."""
        # Update sidebar badge (future enhancement)
        # For now, just refresh the current view if it's email or dashboard
        if self._current_view in ['email', 'dashboard']:
            if self._current_view in self._views:
                self._views[self._current_view].refresh()
        
        # Show subtle notification
        self._show_toast(f"📧 {count} nieuwe email{'s' if count > 1 else ''} ontvangen!")
    
    def _show_toast(self, message: str, duration: int = 3000):
        """Show a toast notification."""
        # Create toast frame
        toast = ctk.CTkFrame(
            self,
            fg_color="#34a853",
            corner_radius=8
        )
        
        label = ctk.CTkLabel(
            toast,
            text=message,
            font=ctk.CTkFont(size=13),
            text_color="white"
        )
        label.pack(padx=20, pady=10)
        
        # Position at bottom right
        toast.place(relx=0.98, rely=0.98, anchor="se")
        
        # Auto-hide after duration
        def hide_toast():
            toast.destroy()
        
        self.after(duration, hide_toast)
    
    def _show_error(self, title: str, message: str):
        """Show error dialog."""
        messagebox.showerror(title, message)
    
    def on_closing(self):
        """Handle window close."""
        # Stop email sync scheduler
        if self._sync_scheduler:
            from ..services.sync_service import stop_background_sync
            stop_background_sync()
        
        # Stop payment sync scheduler
        if self._payment_scheduler:
            from ..services.payment_sync_service import stop_payment_sync
            stop_payment_sync()
        
        logger.info("Admin Portal closing")
        self.destroy()
    
    def run(self):
        """Start the application."""
        self.protocol("WM_DELETE_WINDOW", self.on_closing)
        self.mainloop()
