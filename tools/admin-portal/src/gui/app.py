"""
Main Application Window voor Ro-Tech Admin Portal.
"""

import customtkinter as ctk
from typing import Optional, Dict, Type
import threading

from ..utils.config import Config, logger
from ..database import get_db, init_db
from .sidebar import Sidebar
from .dashboard import DashboardView
from .email_view import EmailView
from .leads_view import LeadsView
from .inbox_view import InboxView
from .clients_view import ClientsView
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
        # Email sync thread
        if Config.is_email_configured():
            self._start_email_sync()
    
    def _start_email_sync(self):
        """Start email sync in background."""
        def sync_loop():
            import time
            while True:
                try:
                    # TODO: Implement email sync
                    logger.debug("Email sync tick")
                except Exception as e:
                    logger.error(f"Email sync error: {e}")
                time.sleep(Config.EMAIL_SYNC_INTERVAL * 60)
        
        thread = threading.Thread(target=sync_loop, daemon=True)
        thread.start()
    
    def _show_error(self, title: str, message: str):
        """Show error dialog."""
        dialog = ctk.CTkInputDialog(
            text=message,
            title=title
        )
    
    def on_closing(self):
        """Handle window close."""
        logger.info("Admin Portal closing")
        self.destroy()
    
    def run(self):
        """Start the application."""
        self.protocol("WM_DELETE_WINDOW", self.on_closing)
        self.mainloop()
