"""
Settings View - Application configuration.
"""

import customtkinter as ctk
from tkinter import messagebox
from typing import Optional

from ..database import get_db
from ..database.models import EmailAccount, Setting
from ..utils.config import Config, logger


class SettingsView(ctk.CTkFrame):
    """Settings main view."""
    
    def __init__(self, parent):
        super().__init__(parent, fg_color="transparent")
        
        self.grid_columnconfigure(0, weight=1)
        self.grid_rowconfigure(1, weight=1)
        
        self._setup_ui()
    
    def _setup_ui(self):
        """Setup settings UI."""
        # Header
        header = ctk.CTkLabel(
            self,
            text="⚙️ Instellingen",
            font=ctk.CTkFont(size=24, weight="bold"),
            anchor="w"
        )
        header.grid(row=0, column=0, sticky="w", pady=(0, 20))
        
        # Content (scrollable)
        content = ctk.CTkScrollableFrame(self, fg_color="transparent")
        content.grid(row=1, column=0, sticky="nsew")
        content.grid_columnconfigure(0, weight=1)
        
        # === APPEARANCE SECTION ===
        appearance_frame = ctk.CTkFrame(content, corner_radius=12)
        appearance_frame.pack(fill="x", pady=(0, 15))
        appearance_frame.grid_columnconfigure(1, weight=1)
        
        ctk.CTkLabel(
            appearance_frame,
            text="🎨 Uiterlijk",
            font=ctk.CTkFont(size=16, weight="bold"),
            anchor="w"
        ).grid(row=0, column=0, columnspan=2, sticky="w", padx=20, pady=(15, 15))
        
        # Theme
        ctk.CTkLabel(
            appearance_frame,
            text="Thema:",
            font=ctk.CTkFont(size=12),
            width=100,
            anchor="w"
        ).grid(row=1, column=0, sticky="w", padx=(20, 5), pady=5)
        
        self.theme_var = ctk.StringVar(value=Config.APP_THEME)
        theme_dropdown = ctk.CTkOptionMenu(
            appearance_frame,
            values=["dark", "light", "system"],
            variable=self.theme_var,
            command=self._on_theme_change,
            width=150
        )
        theme_dropdown.grid(row=1, column=1, sticky="w", pady=5)
        
        spacer = ctk.CTkFrame(appearance_frame, fg_color="transparent", height=15)
        spacer.grid(row=2, column=0)
        
        # === EMAIL SECTION ===
        email_frame = ctk.CTkFrame(content, corner_radius=12)
        email_frame.pack(fill="x", pady=(0, 15))
        email_frame.grid_columnconfigure(1, weight=1)
        
        ctk.CTkLabel(
            email_frame,
            text="📧 Email Configuratie",
            font=ctk.CTkFont(size=16, weight="bold"),
            anchor="w"
        ).grid(row=0, column=0, columnspan=2, sticky="w", padx=20, pady=(15, 15))
        
        # Status indicator
        if Config.is_email_configured():
            status_text = "✅ Geconfigureerd"
            status_color = "#34a853"
        else:
            status_text = "⚠️ Niet geconfigureerd"
            status_color = "#fbbc04"
        
        status_label = ctk.CTkLabel(
            email_frame,
            text=status_text,
            font=ctk.CTkFont(size=12, weight="bold"),
            text_color=status_color
        )
        status_label.grid(row=1, column=0, columnspan=2, sticky="w", padx=20, pady=(0, 10))
        
        # Email fields
        email_fields = [
            ("IMAP Host:", "imap_host_entry", Config.EMAIL_HOST),
            ("IMAP Port:", "imap_port_entry", str(Config.EMAIL_PORT_IMAP)),
            ("SMTP Host:", "smtp_host_entry", Config.EMAIL_HOST),
            ("SMTP Port:", "smtp_port_entry", str(Config.EMAIL_PORT_SMTP)),
            ("Username:", "email_user_entry", Config.EMAIL_USERNAME),
            ("Password:", "email_pass_entry", ""),
        ]
        
        for i, (label, attr, default) in enumerate(email_fields):
            row = i + 2
            
            ctk.CTkLabel(
                email_frame,
                text=label,
                font=ctk.CTkFont(size=12),
                width=100,
                anchor="w"
            ).grid(row=row, column=0, sticky="w", padx=(20, 5), pady=5)
            
            show = "*" if "password" in attr.lower() else None
            entry = ctk.CTkEntry(email_frame, show=show, width=250)
            entry.insert(0, default)
            entry.grid(row=row, column=1, sticky="w", pady=5)
            setattr(self, attr, entry)
        
        # Test connection button
        test_btn = ctk.CTkButton(
            email_frame,
            text="🔗 Test Verbinding",
            command=self._test_email_connection
        )
        test_btn.grid(row=len(email_fields) + 2, column=0, columnspan=2, sticky="w", padx=20, pady=15)
        
        # === SYNC SECTION ===
        sync_frame = ctk.CTkFrame(content, corner_radius=12)
        sync_frame.pack(fill="x", pady=(0, 15))
        sync_frame.grid_columnconfigure(1, weight=1)
        
        ctk.CTkLabel(
            sync_frame,
            text="🔄 Synchronisatie",
            font=ctk.CTkFont(size=16, weight="bold"),
            anchor="w"
        ).grid(row=0, column=0, columnspan=2, sticky="w", padx=20, pady=(15, 15))
        
        # Sync interval
        ctk.CTkLabel(
            sync_frame,
            text="Sync interval:",
            font=ctk.CTkFont(size=12),
            width=100,
            anchor="w"
        ).grid(row=1, column=0, sticky="w", padx=(20, 5), pady=5)
        
        interval_frame = ctk.CTkFrame(sync_frame, fg_color="transparent")
        interval_frame.grid(row=1, column=1, sticky="w", pady=5)
        
        self.sync_interval_entry = ctk.CTkEntry(interval_frame, width=60)
        self.sync_interval_entry.insert(0, str(Config.EMAIL_SYNC_INTERVAL))
        self.sync_interval_entry.pack(side="left")
        
        ctk.CTkLabel(
            interval_frame,
            text="minuten",
            font=ctk.CTkFont(size=12)
        ).pack(side="left", padx=(10, 0))
        
        spacer = ctk.CTkFrame(sync_frame, fg_color="transparent", height=15)
        spacer.grid(row=2, column=0)
        
        # === DATABASE SECTION ===
        db_frame = ctk.CTkFrame(content, corner_radius=12)
        db_frame.pack(fill="x", pady=(0, 15))
        db_frame.grid_columnconfigure(1, weight=1)
        
        ctk.CTkLabel(
            db_frame,
            text="💾 Database",
            font=ctk.CTkFont(size=16, weight="bold"),
            anchor="w"
        ).grid(row=0, column=0, columnspan=2, sticky="w", padx=20, pady=(15, 15))
        
        # Database location
        ctk.CTkLabel(
            db_frame,
            text="Locatie:",
            font=ctk.CTkFont(size=12),
            width=100,
            anchor="w"
        ).grid(row=1, column=0, sticky="w", padx=(20, 5), pady=5)
        
        ctk.CTkLabel(
            db_frame,
            text=str(Config.DATABASE_PATH),
            font=ctk.CTkFont(size=11),
            text_color="gray50"
        ).grid(row=1, column=1, sticky="w", pady=5)
        
        # Backup button
        backup_btn = ctk.CTkButton(
            db_frame,
            text="📦 Backup Maken",
            fg_color="gray40",
            command=self._create_backup
        )
        backup_btn.grid(row=2, column=0, sticky="w", padx=20, pady=(10, 15))
        
        # === ABOUT SECTION ===
        about_frame = ctk.CTkFrame(content, corner_radius=12)
        about_frame.pack(fill="x", pady=(0, 15))
        
        ctk.CTkLabel(
            about_frame,
            text="ℹ️ Over",
            font=ctk.CTkFont(size=16, weight="bold"),
            anchor="w"
        ).grid(row=0, column=0, sticky="w", padx=20, pady=(15, 10))
        
        about_text = """Ro-Tech Admin Portal v1.0.0

Ontwikkeld door Ro-Tech Development
https://ro-techdevelopment.dev

© 2024-2026 Ro-Tech Development
Alle rechten voorbehouden."""
        
        ctk.CTkLabel(
            about_frame,
            text=about_text,
            font=ctk.CTkFont(size=11),
            text_color="gray50",
            justify="left"
        ).grid(row=1, column=0, sticky="w", padx=20, pady=(0, 15))
    
    def refresh(self):
        """Refresh settings view."""
        pass  # Settings are static
    
    def _on_theme_change(self, theme: str):
        """Handle theme change."""
        ctk.set_appearance_mode(theme)
        
        # Save to settings
        db = get_db()
        with db.session() as session:
            setting = session.query(Setting).filter_by(key="app_theme").first()
            if setting:
                setting.value = theme
            else:
                session.add(Setting(key="app_theme", value=theme))
            session.commit()
        
        logger.info(f"Theme changed to: {theme}")
    
    def _test_email_connection(self):
        """Test email connection."""
        host = self.imap_host_entry.get()
        port = int(self.imap_port_entry.get() or "993")
        username = self.email_user_entry.get()
        password = self.email_pass_entry.get()
        
        if not all([host, username, password]):
            messagebox.showwarning("Validatie", "Vul alle velden in.")
            return
        
        try:
            import imaplib
            import ssl
            
            context = ssl.create_default_context()
            
            with imaplib.IMAP4_SSL(host, port, ssl_context=context) as imap:
                imap.login(username, password)
                imap.select("INBOX")
                
            messagebox.showinfo(
                "Succes",
                "✅ Verbinding succesvol!\n\nEmail configuratie werkt correct."
            )
            logger.info("Email connection test successful")
            
        except Exception as e:
            messagebox.showerror(
                "Verbinding Mislukt",
                f"❌ Kon niet verbinden:\n\n{e}"
            )
            logger.error(f"Email connection test failed: {e}")
    
    def _create_backup(self):
        """Create database backup."""
        import shutil
        from datetime import datetime
        
        try:
            source = Config.DATABASE_PATH
            if not source.exists():
                messagebox.showwarning("Backup", "Database bestand niet gevonden.")
                return
            
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            backup_name = f"admin_portal_backup_{timestamp}.db"
            backup_path = Config.BACKUPS_DIR / backup_name
            
            shutil.copy2(source, backup_path)
            
            messagebox.showinfo(
                "Backup Gemaakt",
                f"✅ Backup opgeslagen:\n{backup_path}"
            )
            logger.info(f"Backup created: {backup_path}")
            
        except Exception as e:
            messagebox.showerror("Backup Fout", f"Kon backup niet maken:\n{e}")
            logger.error(f"Backup failed: {e}")
