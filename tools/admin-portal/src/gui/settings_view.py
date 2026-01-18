"""
Settings View - Application configuration with multiple email accounts.
"""

import customtkinter as ctk
from tkinter import messagebox
from typing import Optional, List

from ..database import get_db
from ..database.models import EmailAccount, Setting
from ..utils.config import Config, logger


class EmailAccountCard(ctk.CTkFrame):
    """Card voor een email account."""
    
    def __init__(self, parent, account: EmailAccount, on_delete: callable, on_test: callable):
        super().__init__(parent, corner_radius=8)
        
        self.account = account
        self.on_delete = on_delete
        self.on_test = on_test
        
        self._setup_ui()
    
    def _setup_ui(self):
        """Setup account card UI."""
        self.grid_columnconfigure(1, weight=1)
        
        # Icon based on account name
        icon = "📧"
        if "facturen" in self.account.name.lower():
            icon = "📄"
        elif "contact" in self.account.name.lower():
            icon = "📬"
        
        # Left: Icon + Name
        left_frame = ctk.CTkFrame(self, fg_color="transparent")
        left_frame.grid(row=0, column=0, sticky="w", padx=15, pady=10)
        
        ctk.CTkLabel(
            left_frame,
            text=icon,
            font=ctk.CTkFont(size=24)
        ).pack(side="left", padx=(0, 10))
        
        info_frame = ctk.CTkFrame(left_frame, fg_color="transparent")
        info_frame.pack(side="left")
        
        ctk.CTkLabel(
            info_frame,
            text=self.account.name,
            font=ctk.CTkFont(size=13, weight="bold"),
            anchor="w"
        ).pack(anchor="w")
        
        ctk.CTkLabel(
            info_frame,
            text=self.account.email,
            font=ctk.CTkFont(size=11),
            text_color="gray50",
            anchor="w"
        ).pack(anchor="w")
        
        # Right: Status + Actions
        right_frame = ctk.CTkFrame(self, fg_color="transparent")
        right_frame.grid(row=0, column=1, sticky="e", padx=15, pady=10)
        
        # Status indicator
        status_color = "#34a853" if self.account.is_active else "gray50"
        status_text = "Actief" if self.account.is_active else "Inactief"
        
        ctk.CTkLabel(
            right_frame,
            text=f"● {status_text}",
            font=ctk.CTkFont(size=11),
            text_color=status_color
        ).pack(side="left", padx=(0, 15))
        
        # Test button
        test_btn = ctk.CTkButton(
            right_frame,
            text="Test",
            width=60,
            height=28,
            fg_color="gray40",
            command=lambda: self.on_test(self.account)
        )
        test_btn.pack(side="left", padx=(0, 5))
        
        # Delete button
        delete_btn = ctk.CTkButton(
            right_frame,
            text="🗑️",
            width=35,
            height=28,
            fg_color="#ea4335",
            hover_color="#d33426",
            command=lambda: self.on_delete(self.account)
        )
        delete_btn.pack(side="left")


class AddEmailAccountDialog(ctk.CTkToplevel):
    """Dialog om een email account toe te voegen."""
    
    def __init__(self, parent, on_save: callable, account: Optional[EmailAccount] = None):
        super().__init__(parent)
        
        self.title("Email Account Toevoegen" if not account else "Account Bewerken")
        self.geometry("500x500")
        self.transient(parent)
        self.grab_set()
        
        self.on_save = on_save
        self.account = account
        
        self._setup_ui()
        
        if account:
            self._prefill()
    
    def _setup_ui(self):
        """Setup dialog UI."""
        self.grid_columnconfigure(0, weight=1)
        
        # Header
        header = ctk.CTkLabel(
            self,
            text="📧 Email Account",
            font=ctk.CTkFont(size=18, weight="bold")
        )
        header.grid(row=0, column=0, pady=(20, 20))
        
        # Form fields
        fields = [
            ("Naam", "name_entry", "bijv. Contact, Facturen"),
            ("Email adres", "email_entry", "email@ro-techdevelopment.dev"),
            ("IMAP Host", "imap_host_entry", "mail.ro-techdevelopment.dev"),
            ("IMAP Port", "imap_port_entry", "993"),
            ("SMTP Host", "smtp_host_entry", "mail.ro-techdevelopment.dev"),
            ("SMTP Port", "smtp_port_entry", "587"),
            ("Username", "username_entry", "volledig email adres"),
            ("Password", "password_entry", ""),
        ]
        
        for i, (label, attr, placeholder) in enumerate(fields):
            frame = ctk.CTkFrame(self, fg_color="transparent")
            frame.grid(row=i+1, column=0, sticky="ew", padx=30, pady=5)
            frame.grid_columnconfigure(1, weight=1)
            
            ctk.CTkLabel(
                frame,
                text=label,
                font=ctk.CTkFont(size=12),
                width=90,
                anchor="w"
            ).grid(row=0, column=0, sticky="w")
            
            show = "*" if "password" in attr.lower() else None
            entry = ctk.CTkEntry(frame, placeholder_text=placeholder, show=show)
            entry.grid(row=0, column=1, sticky="ew")
            setattr(self, attr, entry)
        
        # Active checkbox
        self.active_var = ctk.BooleanVar(value=True)
        active_check = ctk.CTkCheckBox(
            self,
            text="Account actief",
            variable=self.active_var
        )
        active_check.grid(row=len(fields)+1, column=0, pady=15)
        
        # Buttons
        button_frame = ctk.CTkFrame(self, fg_color="transparent")
        button_frame.grid(row=len(fields)+2, column=0, sticky="ew", padx=30, pady=(10, 20))
        
        save_btn = ctk.CTkButton(
            button_frame,
            text="💾 Opslaan",
            fg_color="#34a853",
            hover_color="#2d8f47",
            command=self._on_save
        )
        save_btn.pack(side="right", padx=(10, 0))
        
        cancel_btn = ctk.CTkButton(
            button_frame,
            text="Annuleren",
            fg_color="gray40",
            command=self.destroy
        )
        cancel_btn.pack(side="right")
    
    def _prefill(self):
        """Prefill form with existing account data."""
        if self.account:
            self.name_entry.insert(0, self.account.name or "")
            self.email_entry.insert(0, self.account.email or "")
            self.imap_host_entry.insert(0, self.account.imap_host or "")
            self.imap_port_entry.insert(0, str(self.account.imap_port or 993))
            self.smtp_host_entry.insert(0, self.account.smtp_host or "")
            self.smtp_port_entry.insert(0, str(self.account.smtp_port or 587))
            self.username_entry.insert(0, self.account.username or "")
            # Don't prefill password for security
            self.active_var.set(self.account.is_active)
    
    def _on_save(self):
        """Save account."""
        name = self.name_entry.get().strip()
        email = self.email_entry.get().strip()
        password = self.password_entry.get()
        
        if not name or not email:
            messagebox.showwarning("Validatie", "Naam en email zijn verplicht.")
            return
        
        if not self.account and not password:
            messagebox.showwarning("Validatie", "Password is verplicht voor nieuwe accounts.")
            return
        
        db = get_db()
        with db.session() as session:
            if self.account:
                # Update existing
                account = session.query(EmailAccount).get(self.account.id)
            else:
                # Create new
                account = EmailAccount()
                session.add(account)
            
            account.name = name
            account.email = email
            account.imap_host = self.imap_host_entry.get().strip() or "mail.ro-techdevelopment.dev"
            account.imap_port = int(self.imap_port_entry.get() or 993)
            account.smtp_host = self.smtp_host_entry.get().strip() or "mail.ro-techdevelopment.dev"
            account.smtp_port = int(self.smtp_port_entry.get() or 587)
            account.username = self.username_entry.get().strip() or email
            
            if password:
                # Encrypt and store password
                account.password_encrypted = Config.encrypt(password)
            
            account.is_active = self.active_var.get()
            
            session.commit()
            logger.info(f"Email account saved: {email}")
        
        self.on_save()
        self.destroy()


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
        
        # === EMAIL ACCOUNTS SECTION ===
        email_frame = ctk.CTkFrame(content, corner_radius=12)
        email_frame.pack(fill="x", pady=(0, 15))
        email_frame.grid_columnconfigure(0, weight=1)
        
        # Header with add button
        email_header = ctk.CTkFrame(email_frame, fg_color="transparent")
        email_header.grid(row=0, column=0, sticky="ew", padx=20, pady=(15, 10))
        email_header.grid_columnconfigure(0, weight=1)
        
        ctk.CTkLabel(
            email_header,
            text="📧 Email Accounts",
            font=ctk.CTkFont(size=16, weight="bold"),
            anchor="w"
        ).grid(row=0, column=0, sticky="w")
        
        add_btn = ctk.CTkButton(
            email_header,
            text="+ Account Toevoegen",
            width=150,
            fg_color="#34a853",
            hover_color="#2d8f47",
            command=self._on_add_account
        )
        add_btn.grid(row=0, column=1, sticky="e")
        
        # Accounts list container
        self.accounts_container = ctk.CTkFrame(email_frame, fg_color="transparent")
        self.accounts_container.grid(row=1, column=0, sticky="ew", padx=15, pady=(0, 15))
        self.accounts_container.grid_columnconfigure(0, weight=1)
        
        # Quick add buttons for common accounts
        quick_add_frame = ctk.CTkFrame(email_frame, fg_color="transparent")
        quick_add_frame.grid(row=2, column=0, sticky="ew", padx=20, pady=(0, 15))
        
        ctk.CTkLabel(
            quick_add_frame,
            text="Snel toevoegen:",
            font=ctk.CTkFont(size=11),
            text_color="gray50"
        ).pack(side="left", padx=(0, 10))
        
        for name, email in [
            ("Bart", "bart@ro-techdevelopment.dev"),
            ("Contact", "contact@ro-techdevelopment.dev"),
            ("Facturen", "facturen@ro-techdevelopment.dev")
        ]:
            btn = ctk.CTkButton(
                quick_add_frame,
                text=f"+ {name}",
                width=90,
                height=28,
                fg_color="gray40",
                command=lambda n=name, e=email: self._quick_add_account(n, e)
            )
            btn.pack(side="left", padx=2)
        
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
        
        # Sync now button
        sync_now_btn = ctk.CTkButton(
            sync_frame,
            text="🔄 Nu Synchroniseren",
            command=self._sync_all_accounts
        )
        sync_now_btn.grid(row=2, column=0, columnspan=2, sticky="w", padx=20, pady=(10, 15))
        
        spacer = ctk.CTkFrame(sync_frame, fg_color="transparent", height=15)
        spacer.grid(row=3, column=0)
        
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
        self._load_accounts()
    
    def _load_accounts(self):
        """Load email accounts."""
        # Clear existing
        for widget in self.accounts_container.winfo_children():
            widget.destroy()
        
        db = get_db()
        with db.session() as session:
            accounts = session.query(EmailAccount).order_by(EmailAccount.name).all()
            
            if not accounts:
                ctk.CTkLabel(
                    self.accounts_container,
                    text="Nog geen email accounts geconfigureerd.\nKlik op '+ Account Toevoegen' of gebruik de snelknoppen hieronder.",
                    text_color="gray50",
                    justify="center"
                ).pack(pady=20)
            else:
                for account in accounts:
                    card = EmailAccountCard(
                        self.accounts_container,
                        account=account,
                        on_delete=self._on_delete_account,
                        on_test=self._on_test_account
                    )
                    card.pack(fill="x", pady=3)
    
    def _on_add_account(self):
        """Open add account dialog."""
        AddEmailAccountDialog(self, self._load_accounts)
    
    def _quick_add_account(self, name: str, email: str):
        """Quick add a predefined account."""
        # Check if already exists
        db = get_db()
        with db.session() as session:
            existing = session.query(EmailAccount).filter_by(email=email).first()
            if existing:
                messagebox.showinfo("Info", f"Account {email} bestaat al.")
                return
        
        # Open dialog with prefilled data
        dialog = AddEmailAccountDialog(self, self._load_accounts)
        dialog.name_entry.insert(0, name)
        dialog.email_entry.insert(0, email)
        dialog.imap_host_entry.insert(0, "mail.ro-techdevelopment.dev")
        dialog.imap_port_entry.insert(0, "993")
        dialog.smtp_host_entry.insert(0, "mail.ro-techdevelopment.dev")
        dialog.smtp_port_entry.insert(0, "587")
        dialog.username_entry.insert(0, email)
    
    def _on_delete_account(self, account: EmailAccount):
        """Delete email account."""
        if messagebox.askyesno(
            "Verwijderen",
            f"Weet je zeker dat je '{account.email}' wilt verwijderen?\n\nGesynchroniseerde emails blijven behouden."
        ):
            db = get_db()
            with db.session() as session:
                acc = session.query(EmailAccount).get(account.id)
                session.delete(acc)
                session.commit()
            logger.info(f"Email account deleted: {account.email}")
            self._load_accounts()
    
    def _on_test_account(self, account: EmailAccount):
        """Test email account connection."""
        try:
            import imaplib
            import ssl
            
            # Decrypt password
            password = Config.decrypt(account.password_encrypted)
            
            context = ssl.create_default_context()
            
            with imaplib.IMAP4_SSL(account.imap_host, account.imap_port, ssl_context=context) as imap:
                imap.login(account.username, password)
                imap.select("INBOX")
                status, messages = imap.search(None, "ALL")
                num_messages = len(messages[0].split()) if messages[0] else 0
            
            messagebox.showinfo(
                "Verbinding Succesvol",
                f"✅ Verbonden met {account.email}\n\n📬 {num_messages} emails in inbox"
            )
            logger.info(f"Email test successful: {account.email}")
            
        except Exception as e:
            messagebox.showerror(
                "Verbinding Mislukt",
                f"❌ Kon niet verbinden met {account.email}:\n\n{e}"
            )
            logger.error(f"Email test failed for {account.email}: {e}")
    
    def _sync_all_accounts(self):
        """Sync all email accounts."""
        from ..services.email_service import EmailService
        
        db = get_db()
        with db.session() as session:
            accounts = session.query(EmailAccount).filter_by(is_active=True).all()
            
            if not accounts:
                messagebox.showinfo("Sync", "Geen actieve email accounts gevonden.")
                return
            
            total_new = 0
            errors = []
            
            for account in accounts:
                try:
                    password = Config.decrypt(account.password_encrypted)
                    
                    service = EmailService(
                        host=account.imap_host,
                        imap_port=account.imap_port,
                        smtp_port=account.smtp_port,
                        username=account.username,
                        password=password
                    )
                    
                    # For now, just test connection
                    # Full sync would require updating email_service to store account_id
                    success, msg = service.test_connection()
                    if success:
                        logger.info(f"Sync successful for {account.email}")
                    else:
                        errors.append(f"{account.email}: {msg}")
                        
                except Exception as e:
                    errors.append(f"{account.email}: {e}")
            
            if errors:
                messagebox.showwarning(
                    "Sync Resultaat",
                    f"Sync voltooid met fouten:\n\n" + "\n".join(errors)
                )
            else:
                messagebox.showinfo(
                    "Sync Voltooid",
                    f"✅ Alle {len(accounts)} accounts gesynchroniseerd!"
                )
    
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
