"""
Email View - Email inbox, compose, en detail view.
Supports multiple email accounts.
"""

import customtkinter as ctk
from tkinter import filedialog, messagebox
from typing import Optional, List
from datetime import datetime
import threading

from sqlalchemy.orm import joinedload

from ..database import get_db
from ..database.models import Email, EmailAccount
from ..utils.config import Config, logger
from ..utils.helpers import format_datetime, truncate_text, extract_email_name


class EmailListItem(ctk.CTkFrame):
    """Email list item widget - improved layout with more info."""
    
    def __init__(
        self, 
        parent, 
        email: Email,
        on_click: callable,
        show_account: bool = True,
        **kwargs
    ):
        # Darker background for unread
        bg_color = ("gray85", "gray20") if not email.is_read else ("gray90", "gray17")
        super().__init__(parent, corner_radius=8, fg_color=bg_color, **kwargs)
        
        self.email = email
        self.on_click = on_click
        self.show_account = show_account
        
        # Make clickable
        self.bind("<Button-1>", self._handle_click)
        self.configure(cursor="hand2")
        
        self._setup_ui()
    
    def _setup_ui(self):
        """Setup email item UI with improved layout."""
        self.grid_columnconfigure(1, weight=1)
        
        # Read indicator (left border)
        indicator_color = "#1a73e8" if not self.email.is_read else "gray40"
        indicator = ctk.CTkFrame(
            self,
            width=4,
            fg_color=indicator_color,
            corner_radius=2
        )
        indicator.grid(row=0, column=0, rowspan=3, sticky="ns", padx=(0, 12), pady=8)
        
        # Content container
        content = ctk.CTkFrame(self, fg_color="transparent")
        content.grid(row=0, column=1, rowspan=3, sticky="nsew", pady=8)
        content.grid_columnconfigure(0, weight=1)
        content.bind("<Button-1>", self._handle_click)
        
        # === ROW 1: From + Account badge + Time ===
        row1 = ctk.CTkFrame(content, fg_color="transparent")
        row1.grid(row=0, column=0, sticky="ew")
        row1.grid_columnconfigure(1, weight=1)
        row1.bind("<Button-1>", self._handle_click)
        
        # From name (bold for unread)
        from_name = extract_email_name(self.email.from_name or self.email.from_address)
        font_weight = "bold" if not self.email.is_read else "normal"
        
        from_label = ctk.CTkLabel(
            row1,
            text=from_name,
            font=ctk.CTkFont(size=14, weight=font_weight),
            anchor="w"
        )
        from_label.grid(row=0, column=0, sticky="w")
        from_label.bind("<Button-1>", self._handle_click)
        
        # Account badge (which inbox received this)
        if self.show_account and self.email.account:
            account_name = self.email.account.name or self.email.account.email.split('@')[0]
            badge = ctk.CTkLabel(
                row1,
                text=f"📥 {account_name}",
                font=ctk.CTkFont(size=10),
                text_color="gray50",
                fg_color=("gray80", "gray25"),
                corner_radius=4,
                padx=6,
                pady=2
            )
            badge.grid(row=0, column=1, sticky="w", padx=(10, 0))
            badge.bind("<Button-1>", self._handle_click)
        
        # Date/Time (right side)
        time_text = format_datetime(self.email.sent_at)
        time_label = ctk.CTkLabel(
            row1,
            text=time_text,
            font=ctk.CTkFont(size=11),
            text_color="gray50"
        )
        time_label.grid(row=0, column=2, sticky="e", padx=(10, 0))
        time_label.bind("<Button-1>", self._handle_click)
        
        # === ROW 2: Subject ===
        subject_text = self.email.subject or "(geen onderwerp)"
        subject_label = ctk.CTkLabel(
            content,
            text=truncate_text(subject_text, 80),
            font=ctk.CTkFont(size=13, weight="bold" if not self.email.is_read else "normal"),
            anchor="w"
        )
        subject_label.grid(row=1, column=0, sticky="w", pady=(4, 2))
        subject_label.bind("<Button-1>", self._handle_click)
        
        # === ROW 3: Preview + From email ===
        row3 = ctk.CTkFrame(content, fg_color="transparent")
        row3.grid(row=2, column=0, sticky="ew")
        row3.grid_columnconfigure(0, weight=1)
        row3.bind("<Button-1>", self._handle_click)
        
        # Body preview (first line of content)
        preview_text = ""
        if self.email.body_text:
            # Clean up and get first meaningful line
            lines = self.email.body_text.strip().split('\n')
            for line in lines:
                clean = line.strip()
                if clean and not clean.startswith('---') and not clean.startswith('>'):
                    preview_text = clean
                    break
        
        if preview_text:
            preview_label = ctk.CTkLabel(
                row3,
                text=truncate_text(preview_text, 100),
                font=ctk.CTkFont(size=11),
                text_color="gray50",
                anchor="w"
            )
            preview_label.grid(row=0, column=0, sticky="w")
            preview_label.bind("<Button-1>", self._handle_click)
        
        # From email address (smaller, below preview)
        from_email = self.email.from_address or ""
        if from_email and from_email != from_name:
            email_label = ctk.CTkLabel(
                row3,
                text=f"✉️ {from_email}",
                font=ctk.CTkFont(size=10),
                text_color="gray45",
                anchor="w"
            )
            email_label.grid(row=1, column=0, sticky="w", pady=(2, 0))
            email_label.bind("<Button-1>", self._handle_click)
        
        # === Right side: Star button ===
        star_text = "⭐" if self.email.is_starred else "☆"
        star_btn = ctk.CTkButton(
            self,
            text=star_text,
            width=32,
            height=32,
            fg_color="transparent",
            hover_color=("gray75", "gray30"),
            font=ctk.CTkFont(size=16),
            command=self._toggle_star
        )
        star_btn.grid(row=0, column=2, rowspan=3, padx=(10, 8), sticky="e")
    
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
        """Display email details (legacy, uses Email object)."""
        email_data = {
            'id': email.id,
            'subject': email.subject,
            'from_address': email.from_address,
            'from_name': email.from_name,
            'to_address': email.to_address,
            'body_text': email.body_text,
            'body_html': email.body_html,
            'sent_at': email.sent_at,
            'is_read': email.is_read,
        }
        self.show_email_data(email_data)
    
    def show_email_data(self, email_data: dict):
        """Display email details from dictionary data."""
        self.current_email_data = email_data
        
        # Mark as read in database
        if not email_data.get('is_read'):
            db = get_db()
            with db.session() as session:
                db_email = session.query(Email).get(email_data['id'])
                if db_email:
                    db_email.is_read = True
                    session.commit()
        
        # Update UI - Subject
        subject = email_data.get('subject') or "(geen onderwerp)"
        self.subject_label.configure(text=subject)
        
        # From
        from_name = email_data.get('from_name') or ''
        from_address = email_data.get('from_address') or ''
        from_text = f"{from_name} <{from_address}>".strip() if from_address else "-"
        self.from_label.configure(text=from_text)
        
        # To
        to_address = email_data.get('to_address') or "-"
        self.to_label.configure(text=to_address)
        
        # Date
        sent_at = email_data.get('sent_at')
        if sent_at:
            date_text = sent_at.strftime("%d-%m-%Y %H:%M")
        else:
            date_text = "-"
        self.date_label.configure(text=date_text)
        
        # Body
        self.body_text.delete("1.0", "end")
        body = email_data.get('body_text') or email_data.get('body_html') or "(geen inhoud)"
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
            # Query with account relationship loaded
            query = session.query(Email).options(
                joinedload(Email.account)
            ).filter_by(folder=self._current_folder)
            
            # Filter by account if selected
            show_account_badge = True
            if self._account_filter:
                query = query.filter_by(account_id=self._account_filter)
                show_account_badge = False  # Don't show badge when filtering by account
            
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
                        on_click=self._on_email_click,
                        show_account=show_account_badge
                    )
                    item.pack(fill="x", pady=4)
    
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
        # Re-fetch email from database to get fresh data (avoid detached session issues)
        db = get_db()
        with db.session() as session:
            fresh_email = session.query(Email).options(
                joinedload(Email.account)
            ).filter_by(id=email.id).first()
            
            if not fresh_email:
                logger.error(f"Email {email.id} not found in database")
                return
            
            # Copy attributes to avoid detached object issues
            email_data = {
                'id': fresh_email.id,
                'message_id': fresh_email.message_id,
                'subject': fresh_email.subject,
                'from_address': fresh_email.from_address,
                'from_name': fresh_email.from_name,
                'to_address': fresh_email.to_address,
                'cc': fresh_email.cc,
                'body_text': fresh_email.body_text,
                'body_html': fresh_email.body_html,
                'sent_at': fresh_email.sent_at,
                'is_read': fresh_email.is_read,
                'is_starred': fresh_email.is_starred,
                'folder': fresh_email.folder,
            }
        
        self._showing_detail = True
        self.list_frame.grid_forget()
        self.detail_view.grid(row=0, column=0, sticky="nsew")
        self.detail_view.show_email_data(email_data)
    
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
                        
                        # Fetch emails with account_id
                        new_emails = service.fetch_emails(
                            folder="INBOX", 
                            limit=30,
                            account_id=account.id
                        )
                        total_new += len(new_emails)
                        
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
