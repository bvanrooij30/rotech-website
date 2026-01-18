"""
Email View - Email inbox, compose, en detail view.
Supports multiple email accounts.
"""

import customtkinter as ctk
from tkinter import filedialog, messagebox
from typing import Optional, List
from datetime import datetime
import threading

from ..database import get_db
from ..database.models import Email, EmailAccount
from ..utils.config import Config, logger
from ..utils.helpers import format_datetime, truncate_text, extract_email_name


class EmailListItem(ctk.CTkFrame):
    """Email list item widget."""
    
    def __init__(
        self, 
        parent, 
        email: Email,
        on_click: callable,
        **kwargs
    ):
        super().__init__(parent, corner_radius=8, **kwargs)
        
        self.email = email
        self.on_click = on_click
        
        # Make clickable
        self.bind("<Button-1>", self._handle_click)
        self.configure(cursor="hand2")
        
        self._setup_ui()
    
    def _setup_ui(self):
        """Setup email item UI."""
        self.grid_columnconfigure(1, weight=1)
        
        # Read indicator
        indicator_color = "#1a73e8" if not self.email.is_read else "transparent"
        indicator = ctk.CTkFrame(
            self,
            width=4,
            fg_color=indicator_color,
            corner_radius=2
        )
        indicator.grid(row=0, column=0, rowspan=2, sticky="ns", padx=(0, 10), pady=5)
        
        # From name
        from_text = extract_email_name(self.email.from_name or self.email.from_address)
        font_weight = "bold" if not self.email.is_read else "normal"
        
        from_label = ctk.CTkLabel(
            self,
            text=from_text,
            font=ctk.CTkFont(size=13, weight=font_weight),
            anchor="w"
        )
        from_label.grid(row=0, column=1, sticky="w", pady=(8, 0))
        from_label.bind("<Button-1>", self._handle_click)
        
        # Subject
        subject_label = ctk.CTkLabel(
            self,
            text=truncate_text(self.email.subject or "(geen onderwerp)", 50),
            font=ctk.CTkFont(size=12),
            text_color="gray60",
            anchor="w"
        )
        subject_label.grid(row=1, column=1, sticky="w", pady=(0, 8))
        subject_label.bind("<Button-1>", self._handle_click)
        
        # Time
        time_label = ctk.CTkLabel(
            self,
            text=format_datetime(self.email.sent_at),
            font=ctk.CTkFont(size=11),
            text_color="gray50"
        )
        time_label.grid(row=0, column=2, rowspan=2, padx=(10, 8))
        
        # Star button
        star_text = "⭐" if self.email.is_starred else "☆"
        star_btn = ctk.CTkButton(
            self,
            text=star_text,
            width=30,
            height=30,
            fg_color="transparent",
            hover_color=("gray75", "gray30"),
            command=self._toggle_star
        )
        star_btn.grid(row=0, column=3, rowspan=2, padx=(0, 5))
    
    def _handle_click(self, event=None):
        """Handle item click."""
        self.on_click(self.email)
    
    def _toggle_star(self):
        """Toggle starred status."""
        db = get_db()
        with db.session() as session:
            email = session.query(Email).get(self.email.id)
            email.is_starred = not email.is_starred
            session.commit()
            self.email.is_starred = email.is_starred


class EmailDetailView(ctk.CTkFrame):
    """Email detail/reading view."""
    
    def __init__(self, parent, on_back: callable):
        super().__init__(parent, fg_color="transparent")
        
        self.on_back = on_back
        self.current_email: Optional[Email] = None
        
        self.grid_columnconfigure(0, weight=1)
        self.grid_rowconfigure(2, weight=1)
        
        self._setup_ui()
    
    def _setup_ui(self):
        """Setup detail view UI."""
        # Header with back button
        header_frame = ctk.CTkFrame(self, fg_color="transparent")
        header_frame.grid(row=0, column=0, sticky="ew", pady=(0, 15))
        
        back_btn = ctk.CTkButton(
            header_frame,
            text="← Terug",
            width=80,
            fg_color="transparent",
            text_color=("gray10", "gray90"),
            hover_color=("gray75", "gray30"),
            command=self.on_back
        )
        back_btn.pack(side="left")
        
        # Action buttons
        actions_frame = ctk.CTkFrame(header_frame, fg_color="transparent")
        actions_frame.pack(side="right")
        
        reply_btn = ctk.CTkButton(
            actions_frame,
            text="↩️ Beantwoorden",
            width=120,
            command=self._on_reply
        )
        reply_btn.pack(side="left", padx=5)
        
        forward_btn = ctk.CTkButton(
            actions_frame,
            text="↪️ Doorsturen",
            width=120,
            fg_color="gray40",
            command=self._on_forward
        )
        forward_btn.pack(side="left", padx=5)
        
        # Email header info
        self.info_frame = ctk.CTkFrame(self, corner_radius=12)
        self.info_frame.grid(row=1, column=0, sticky="ew", pady=(0, 15))
        self.info_frame.grid_columnconfigure(1, weight=1)
        
        # Subject
        self.subject_label = ctk.CTkLabel(
            self.info_frame,
            text="",
            font=ctk.CTkFont(size=18, weight="bold"),
            anchor="w"
        )
        self.subject_label.grid(row=0, column=0, columnspan=2, sticky="w", padx=20, pady=(15, 10))
        
        # From
        from_title = ctk.CTkLabel(
            self.info_frame,
            text="Van:",
            font=ctk.CTkFont(size=12),
            text_color="gray50",
            width=50
        )
        from_title.grid(row=1, column=0, sticky="w", padx=(20, 5))
        
        self.from_label = ctk.CTkLabel(
            self.info_frame,
            text="",
            font=ctk.CTkFont(size=12),
            anchor="w"
        )
        self.from_label.grid(row=1, column=1, sticky="w")
        
        # To
        to_title = ctk.CTkLabel(
            self.info_frame,
            text="Aan:",
            font=ctk.CTkFont(size=12),
            text_color="gray50",
            width=50
        )
        to_title.grid(row=2, column=0, sticky="w", padx=(20, 5))
        
        self.to_label = ctk.CTkLabel(
            self.info_frame,
            text="",
            font=ctk.CTkFont(size=12),
            anchor="w"
        )
        self.to_label.grid(row=2, column=1, sticky="w")
        
        # Date
        date_title = ctk.CTkLabel(
            self.info_frame,
            text="Datum:",
            font=ctk.CTkFont(size=12),
            text_color="gray50",
            width=50
        )
        date_title.grid(row=3, column=0, sticky="w", padx=(20, 5), pady=(0, 15))
        
        self.date_label = ctk.CTkLabel(
            self.info_frame,
            text="",
            font=ctk.CTkFont(size=12),
            anchor="w"
        )
        self.date_label.grid(row=3, column=1, sticky="w", pady=(0, 15))
        
        # Body
        self.body_text = ctk.CTkTextbox(
            self,
            corner_radius=12,
            font=ctk.CTkFont(size=13)
        )
        self.body_text.grid(row=2, column=0, sticky="nsew")
    
    def show_email(self, email: Email):
        """Display email details."""
        self.current_email = email
        
        # Mark as read
        if not email.is_read:
            db = get_db()
            with db.session() as session:
                db_email = session.query(Email).get(email.id)
                db_email.is_read = True
                session.commit()
        
        # Update UI
        self.subject_label.configure(text=email.subject or "(geen onderwerp)")
        self.from_label.configure(
            text=f"{email.from_name or ''} <{email.from_address}>".strip()
        )
        self.to_label.configure(text=email.to_address)
        self.date_label.configure(
            text=email.sent_at.strftime("%d-%m-%Y %H:%M") if email.sent_at else "-"
        )
        
        # Body
        self.body_text.delete("1.0", "end")
        body = email.body_text or email.body_html or "(geen inhoud)"
        self.body_text.insert("1.0", body)
    
    def _on_reply(self):
        """Handle reply button."""
        # TODO: Open compose with reply
        pass
    
    def _on_forward(self):
        """Handle forward button."""
        # TODO: Open compose with forward
        pass


class ComposeDialog(ctk.CTkToplevel):
    """Compose new email dialog."""
    
    def __init__(self, parent, reply_to: Optional[Email] = None):
        super().__init__(parent)
        
        self.title("Nieuwe Email")
        self.geometry("600x500")
        self.transient(parent)
        self.grab_set()
        
        self.reply_to = reply_to
        
        self._setup_ui()
        
        if reply_to:
            self._prefill_reply()
    
    def _setup_ui(self):
        """Setup compose dialog UI."""
        self.grid_columnconfigure(0, weight=1)
        self.grid_rowconfigure(4, weight=1)
        
        # To field
        to_frame = ctk.CTkFrame(self, fg_color="transparent")
        to_frame.grid(row=0, column=0, sticky="ew", padx=20, pady=(20, 10))
        to_frame.grid_columnconfigure(1, weight=1)
        
        ctk.CTkLabel(to_frame, text="Aan:", width=60).grid(row=0, column=0)
        self.to_entry = ctk.CTkEntry(to_frame, placeholder_text="email@example.com")
        self.to_entry.grid(row=0, column=1, sticky="ew")
        
        # Subject field
        subject_frame = ctk.CTkFrame(self, fg_color="transparent")
        subject_frame.grid(row=1, column=0, sticky="ew", padx=20, pady=10)
        subject_frame.grid_columnconfigure(1, weight=1)
        
        ctk.CTkLabel(subject_frame, text="Onderwerp:", width=60).grid(row=0, column=0)
        self.subject_entry = ctk.CTkEntry(subject_frame, placeholder_text="Onderwerp...")
        self.subject_entry.grid(row=0, column=1, sticky="ew")
        
        # Divider
        divider = ctk.CTkFrame(self, height=1, fg_color="gray50")
        divider.grid(row=2, column=0, sticky="ew", padx=20, pady=10)
        
        # Body
        self.body_text = ctk.CTkTextbox(self, corner_radius=8)
        self.body_text.grid(row=4, column=0, sticky="nsew", padx=20)
        
        # Buttons
        button_frame = ctk.CTkFrame(self, fg_color="transparent")
        button_frame.grid(row=5, column=0, sticky="ew", padx=20, pady=20)
        
        send_btn = ctk.CTkButton(
            button_frame,
            text="📤 Versturen",
            command=self._on_send
        )
        send_btn.pack(side="right", padx=(10, 0))
        
        cancel_btn = ctk.CTkButton(
            button_frame,
            text="Annuleren",
            fg_color="gray40",
            command=self.destroy
        )
        cancel_btn.pack(side="right")
    
    def _prefill_reply(self):
        """Prefill fields for reply."""
        if self.reply_to:
            self.to_entry.insert(0, self.reply_to.from_address)
            self.subject_entry.insert(0, f"Re: {self.reply_to.subject or ''}")
            
            # Quote original message
            original = f"\n\n--- Oorspronkelijk bericht ---\n"
            original += f"Van: {self.reply_to.from_address}\n"
            original += f"Datum: {self.reply_to.sent_at}\n\n"
            original += self.reply_to.body_text or ""
            
            self.body_text.insert("end", original)
            self.body_text.see("1.0")  # Scroll to top
    
    def _on_send(self):
        """Handle send button."""
        # TODO: Implement send via SMTP
        to = self.to_entry.get()
        subject = self.subject_entry.get()
        body = self.body_text.get("1.0", "end").strip()
        
        if not to or not subject:
            return
        
        # For now just close
        self.destroy()


class EmailView(ctk.CTkFrame):
    """Email main view."""
    
    def __init__(self, parent):
        super().__init__(parent, fg_color="transparent")
        
        self.grid_columnconfigure(0, weight=1)
        self.grid_rowconfigure(2, weight=1)
        
        self._current_folder = "inbox"
        self._account_filter = None  # None = all accounts
        self._showing_detail = False
        self._syncing = False
        
        self._setup_ui()
    
    def _setup_ui(self):
        """Setup email view UI."""
        # Header row 1: Title
        header_frame = ctk.CTkFrame(self, fg_color="transparent")
        header_frame.grid(row=0, column=0, sticky="ew", pady=(0, 10))
        header_frame.grid_columnconfigure(1, weight=1)
        
        title = ctk.CTkLabel(
            header_frame,
            text="📧 Email",
            font=ctk.CTkFont(size=24, weight="bold"),
            anchor="w"
        )
        title.grid(row=0, column=0, sticky="w")
        
        # Actions (right side)
        actions_frame = ctk.CTkFrame(header_frame, fg_color="transparent")
        actions_frame.grid(row=0, column=1, sticky="e")
        
        # Compose button
        compose_btn = ctk.CTkButton(
            actions_frame,
            text="✏️ Nieuw",
            width=80,
            fg_color="#34a853",
            hover_color="#2d8f47",
            command=self._on_compose
        )
        compose_btn.pack(side="left", padx=(0, 10))
        
        # Sync button
        self.sync_btn = ctk.CTkButton(
            actions_frame,
            text="🔄 Sync",
            width=70,
            fg_color="gray40",
            command=self._on_sync
        )
        self.sync_btn.pack(side="left")
        
        # Header row 2: Filters
        filter_frame = ctk.CTkFrame(self, fg_color="transparent")
        filter_frame.grid(row=1, column=0, sticky="ew", pady=(0, 10))
        
        # Account filter dropdown
        ctk.CTkLabel(
            filter_frame,
            text="Account:",
            font=ctk.CTkFont(size=12)
        ).pack(side="left", padx=(0, 5))
        
        self._account_filter = "all"
        self.account_var = ctk.StringVar(value="Alle accounts")
        self.account_dropdown = ctk.CTkOptionMenu(
            filter_frame,
            variable=self.account_var,
            values=["Alle accounts"],
            command=self._on_account_filter,
            width=200
        )
        self.account_dropdown.pack(side="left", padx=(0, 20))
        
        # Folder tabs
        self.inbox_btn = ctk.CTkButton(
            filter_frame,
            text="Inbox",
            width=80,
            command=lambda: self._switch_folder("inbox")
        )
        self.inbox_btn.pack(side="left", padx=2)
        
        self.sent_btn = ctk.CTkButton(
            filter_frame,
            text="Verzonden",
            width=80,
            fg_color="gray40",
            command=lambda: self._switch_folder("sent")
        )
        self.sent_btn.pack(side="left", padx=2)
        
        # Content area (list or detail)
        self.content_frame = ctk.CTkFrame(self, fg_color="transparent")
        self.content_frame.grid(row=2, column=0, sticky="nsew")
        self.content_frame.grid_columnconfigure(0, weight=1)
        self.content_frame.grid_rowconfigure(0, weight=1)
        
        # Email list
        self.list_frame = ctk.CTkScrollableFrame(
            self.content_frame,
            fg_color="transparent"
        )
        self.list_frame.grid(row=0, column=0, sticky="nsew")
        
        # Detail view (hidden initially)
        self.detail_view = EmailDetailView(self.content_frame, self._on_back_to_list)
        
        # Load account options
        self._load_account_options()
    
    def refresh(self):
        """Refresh email list."""
        if self._showing_detail:
            return
        
        # Reload account options
        self._load_account_options()
        
        # Clear list
        for widget in self.list_frame.winfo_children():
            widget.destroy()
        
        db = get_db()
        with db.session() as session:
            query = session.query(Email).filter_by(folder=self._current_folder)
            
            # Filter by account if selected
            if self._account_filter:
                query = query.filter_by(account_id=self._account_filter)
            
            emails = query.order_by(Email.sent_at.desc()).limit(50).all()
            
            # Check if any accounts configured
            accounts_count = session.query(EmailAccount).count()
            
            if not emails:
                if accounts_count == 0:
                    empty_text = "Geen email accounts geconfigureerd.\n\nGa naar ⚙️ Instellingen om je email accounts toe te voegen."
                else:
                    empty_text = "Geen emails in deze folder.\n\nKlik op 🔄 Sync om emails op te halen."
                
                empty_label = ctk.CTkLabel(
                    self.list_frame,
                    text=empty_text,
                    text_color="gray50",
                    justify="center"
                )
                empty_label.pack(pady=50)
            else:
                for email in emails:
                    item = EmailListItem(
                        self.list_frame,
                        email=email,
                        on_click=self._on_email_click
                    )
                    item.pack(fill="x", pady=2)
    
    def _switch_folder(self, folder: str):
        """Switch email folder."""
        self._current_folder = folder
        
        # Update button states
        if folder == "inbox":
            self.inbox_btn.configure(fg_color=["#1a73e8", "#1a73e8"])
            self.sent_btn.configure(fg_color="gray40")
        else:
            self.inbox_btn.configure(fg_color="gray40")
            self.sent_btn.configure(fg_color=["#1a73e8", "#1a73e8"])
        
        self.refresh()
    
    def _on_email_click(self, email: Email):
        """Handle email item click."""
        self._showing_detail = True
        self.list_frame.grid_forget()
        self.detail_view.grid(row=0, column=0, sticky="nsew")
        self.detail_view.show_email(email)
    
    def _on_back_to_list(self):
        """Go back to email list."""
        self._showing_detail = False
        self.detail_view.grid_forget()
        self.list_frame.grid(row=0, column=0, sticky="nsew")
        self.refresh()
    
    def _load_account_options(self):
        """Load email accounts into dropdown."""
        db = get_db()
        with db.session() as session:
            accounts = session.query(EmailAccount).filter_by(is_active=True).all()
            
            options = ["Alle accounts"]
            self._account_map = {"Alle accounts": None}
            
            for acc in accounts:
                label = f"{acc.name} ({acc.email})"
                options.append(label)
                self._account_map[label] = acc.id
            
            self.account_dropdown.configure(values=options)
    
    def _on_account_filter(self, selection: str):
        """Handle account filter change."""
        self._account_filter = self._account_map.get(selection)
        self.refresh()
    
    def _on_compose(self):
        """Open compose dialog."""
        ComposeDialog(self)
    
    def _on_sync(self):
        """Sync emails from all accounts."""
        if self._syncing:
            return
        
        self._syncing = True
        self.sync_btn.configure(text="⏳...", state="disabled")
        
        def do_sync():
            from ..services.email_service import EmailService
            
            db = get_db()
            total_new = 0
            errors = []
            
            with db.session() as session:
                accounts = session.query(EmailAccount).filter_by(is_active=True).all()
                
                if not accounts:
                    self.after(0, lambda: messagebox.showinfo(
                        "Sync",
                        "Geen email accounts geconfigureerd.\n\nGa naar Instellingen om accounts toe te voegen."
                    ))
                    return
                
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
                        
                        # Fetch emails
                        new_emails = service.fetch_emails(folder="INBOX", limit=30)
                        total_new += len(new_emails)
                        
                        # Update account_id on fetched emails
                        for email in new_emails:
                            email.account_id = account.id
                        
                        service.disconnect_imap()
                        logger.info(f"Synced {len(new_emails)} emails from {account.email}")
                        
                    except Exception as e:
                        errors.append(f"{account.name}: {e}")
                        logger.error(f"Sync error for {account.email}: {e}")
            
            # Update UI on main thread
            def finish():
                self._syncing = False
                self.sync_btn.configure(text="🔄 Sync", state="normal")
                self._load_account_options()
                self.refresh()
                
                if errors:
                    messagebox.showwarning(
                        "Sync Resultaat",
                        f"Sync voltooid met fouten:\n\n" + "\n".join(errors)
                    )
                else:
                    messagebox.showinfo(
                        "Sync Voltooid",
                        f"✅ {total_new} nieuwe emails opgehaald!"
                    )
            
            self.after(0, finish)
        
        # Run sync in background thread
        thread = threading.Thread(target=do_sync, daemon=True)
        thread.start()
