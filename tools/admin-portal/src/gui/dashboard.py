"""
Dashboard View - Overzicht van alle data.
"""

import customtkinter as ctk
from datetime import datetime
from typing import List, Tuple

from ..database import get_db
from ..database.models import Email, FormSubmission, Lead, Client, FormStatus, LeadStatus
from ..utils.helpers import format_relative_time


class StatCard(ctk.CTkFrame):
    """Statistics card widget."""
    
    def __init__(
        self, 
        parent, 
        title: str, 
        value: str, 
        icon: str,
        subtitle: str = "",
        color: str = "#1a73e8"
    ):
        super().__init__(parent, corner_radius=12)
        
        self.grid_columnconfigure(0, weight=1)
        
        # Icon + Value row
        top_frame = ctk.CTkFrame(self, fg_color="transparent")
        top_frame.grid(row=0, column=0, sticky="ew", padx=20, pady=(20, 5))
        
        icon_label = ctk.CTkLabel(
            top_frame,
            text=icon,
            font=ctk.CTkFont(size=28)
        )
        icon_label.pack(side="left")
        
        self.value_label = ctk.CTkLabel(
            top_frame,
            text=value,
            font=ctk.CTkFont(size=32, weight="bold"),
            text_color=color
        )
        self.value_label.pack(side="right")
        
        # Title
        self.title_label = ctk.CTkLabel(
            self,
            text=title,
            font=ctk.CTkFont(size=14, weight="bold")
        )
        self.title_label.grid(row=1, column=0, sticky="w", padx=20)
        
        # Subtitle
        if subtitle:
            self.subtitle_label = ctk.CTkLabel(
                self,
                text=subtitle,
                font=ctk.CTkFont(size=11),
                text_color="gray50"
            )
            self.subtitle_label.grid(row=2, column=0, sticky="w", padx=20, pady=(0, 15))
        else:
            # Add bottom padding
            spacer = ctk.CTkFrame(self, fg_color="transparent", height=15)
            spacer.grid(row=2, column=0)
    
    def update_value(self, value: str, subtitle: str = ""):
        """Update card value."""
        self.value_label.configure(text=value)
        if hasattr(self, 'subtitle_label') and subtitle:
            self.subtitle_label.configure(text=subtitle)


class ActivityItem(ctk.CTkFrame):
    """Recent activity list item."""
    
    def __init__(
        self, 
        parent, 
        icon: str,
        text: str,
        time: str,
        **kwargs
    ):
        super().__init__(parent, fg_color="transparent", **kwargs)
        
        self.grid_columnconfigure(1, weight=1)
        
        # Icon
        icon_label = ctk.CTkLabel(
            self,
            text=icon,
            font=ctk.CTkFont(size=16),
            width=30
        )
        icon_label.grid(row=0, column=0, padx=(0, 10))
        
        # Text
        text_label = ctk.CTkLabel(
            self,
            text=text,
            font=ctk.CTkFont(size=13),
            anchor="w"
        )
        text_label.grid(row=0, column=1, sticky="w")
        
        # Time
        time_label = ctk.CTkLabel(
            self,
            text=time,
            font=ctk.CTkFont(size=11),
            text_color="gray50"
        )
        time_label.grid(row=0, column=2, padx=(10, 0))


class DashboardView(ctk.CTkFrame):
    """Dashboard main view."""
    
    def __init__(self, parent):
        super().__init__(parent, fg_color="transparent")
        
        self.grid_columnconfigure(0, weight=1)
        self.grid_rowconfigure(1, weight=1)
        
        self._setup_ui()
    
    def _setup_ui(self):
        """Setup dashboard UI."""
        # Header
        header = ctk.CTkLabel(
            self,
            text="Dashboard",
            font=ctk.CTkFont(size=24, weight="bold"),
            anchor="w"
        )
        header.grid(row=0, column=0, sticky="w", pady=(0, 20))
        
        # Content frame
        content = ctk.CTkFrame(self, fg_color="transparent")
        content.grid(row=1, column=0, sticky="nsew")
        content.grid_columnconfigure((0, 1, 2, 3), weight=1)
        content.grid_rowconfigure(1, weight=1)
        
        # Stats cards row
        self.email_card = StatCard(
            content,
            title="Emails",
            value="0",
            icon="📧",
            subtitle="ongelezen",
            color="#1a73e8"
        )
        self.email_card.grid(row=0, column=0, sticky="ew", padx=(0, 10), pady=(0, 20))
        
        self.inbox_card = StatCard(
            content,
            title="Website Inbox",
            value="0",
            icon="📥",
            subtitle="nieuwe aanvragen",
            color="#34a853"
        )
        self.inbox_card.grid(row=0, column=1, sticky="ew", padx=10, pady=(0, 20))
        
        self.leads_card = StatCard(
            content,
            title="Leads",
            value="0",
            icon="🔍",
            subtitle="totaal",
            color="#fbbc04"
        )
        self.leads_card.grid(row=0, column=2, sticky="ew", padx=10, pady=(0, 20))
        
        self.clients_card = StatCard(
            content,
            title="Klanten",
            value="0",
            icon="👥",
            subtitle="actief",
            color="#ea4335"
        )
        self.clients_card.grid(row=0, column=3, sticky="ew", padx=(10, 0), pady=(0, 20))
        
        # Bottom section with two columns
        bottom_frame = ctk.CTkFrame(content, fg_color="transparent")
        bottom_frame.grid(row=1, column=0, columnspan=4, sticky="nsew")
        bottom_frame.grid_columnconfigure((0, 1), weight=1)
        bottom_frame.grid_rowconfigure(0, weight=1)
        
        # Recent Activity
        activity_frame = ctk.CTkFrame(bottom_frame, corner_radius=12)
        activity_frame.grid(row=0, column=0, sticky="nsew", padx=(0, 10))
        activity_frame.grid_columnconfigure(0, weight=1)
        activity_frame.grid_rowconfigure(1, weight=1)
        
        activity_header = ctk.CTkLabel(
            activity_frame,
            text="Recente Activiteit",
            font=ctk.CTkFont(size=16, weight="bold"),
            anchor="w"
        )
        activity_header.grid(row=0, column=0, sticky="w", padx=20, pady=(15, 10))
        
        self.activity_list = ctk.CTkScrollableFrame(
            activity_frame,
            fg_color="transparent"
        )
        self.activity_list.grid(row=1, column=0, sticky="nsew", padx=10, pady=(0, 10))
        
        # Quick Actions
        actions_frame = ctk.CTkFrame(bottom_frame, corner_radius=12)
        actions_frame.grid(row=0, column=1, sticky="nsew", padx=(10, 0))
        actions_frame.grid_columnconfigure(0, weight=1)
        
        actions_header = ctk.CTkLabel(
            actions_frame,
            text="Snelle Acties",
            font=ctk.CTkFont(size=16, weight="bold"),
            anchor="w"
        )
        actions_header.grid(row=0, column=0, sticky="w", padx=20, pady=(15, 10))
        
        actions_content = ctk.CTkFrame(actions_frame, fg_color="transparent")
        actions_content.grid(row=1, column=0, sticky="ew", padx=20, pady=(0, 20))
        
        # Action buttons
        compose_btn = ctk.CTkButton(
            actions_content,
            text="📧  Nieuwe Email",
            anchor="w",
            height=40,
            command=self._on_compose_email
        )
        compose_btn.pack(fill="x", pady=5)
        
        import_btn = ctk.CTkButton(
            actions_content,
            text="🔍  Import Leads",
            anchor="w",
            height=40,
            fg_color="#34a853",
            hover_color="#2d8f47",
            command=self._on_import_leads
        )
        import_btn.pack(fill="x", pady=5)
        
        sync_btn = ctk.CTkButton(
            actions_content,
            text="🔄  Sync Emails",
            anchor="w",
            height=40,
            fg_color="#fbbc04",
            hover_color="#d9a504",
            text_color="black",
            command=self._on_sync_emails
        )
        sync_btn.pack(fill="x", pady=5)
        
        # Email config warning (if not configured)
        self.warning_frame = ctk.CTkFrame(actions_frame, fg_color="#fff3cd", corner_radius=8)
        self.warning_label = ctk.CTkLabel(
            self.warning_frame,
            text="⚠️ Email nog niet geconfigureerd.\nGa naar Instellingen.",
            font=ctk.CTkFont(size=12),
            text_color="#856404",
            justify="left"
        )
        self.warning_label.pack(padx=15, pady=10)
    
    def refresh(self):
        """Refresh dashboard data."""
        db = get_db()
        
        with db.session() as session:
            # Count emails
            unread_emails = session.query(Email).filter_by(is_read=False, folder="inbox").count()
            self.email_card.update_value(str(unread_emails), "ongelezen")
            
            # Count form submissions
            new_forms = session.query(FormSubmission).filter_by(status=FormStatus.NEW.value).count()
            self.inbox_card.update_value(str(new_forms), "nieuwe aanvragen")
            
            # Count leads
            total_leads = session.query(Lead).count()
            new_leads = session.query(Lead).filter_by(status=LeadStatus.NEW.value).count()
            self.leads_card.update_value(str(total_leads), f"{new_leads} nieuw")
            
            # Count clients
            active_clients = session.query(Client).count()
            self.clients_card.update_value(str(active_clients), "totaal")
            
            # Get recent activity
            self._load_recent_activity(session)
        
        # Show/hide email warning
        from ..utils.config import Config
        if Config.is_email_configured():
            self.warning_frame.grid_forget()
        else:
            self.warning_frame.grid(row=2, column=0, sticky="ew", padx=20, pady=(10, 20))
    
    def _load_recent_activity(self, session):
        """Load recent activity items."""
        # Clear existing items
        for widget in self.activity_list.winfo_children():
            widget.destroy()
        
        activities: List[Tuple[str, str, datetime]] = []
        
        # Recent emails
        recent_emails = session.query(Email).order_by(Email.received_at.desc()).limit(5).all()
        for email in recent_emails:
            activities.append((
                "📧",
                f"{email.from_name or email.from_address}: {email.subject[:40]}...",
                email.received_at
            ))
        
        # Recent form submissions
        recent_forms = session.query(FormSubmission).order_by(
            FormSubmission.submitted_at.desc()
        ).limit(5).all()
        for form in recent_forms:
            form_type = "Contact" if form.form_type == "contact" else "Offerte"
            activities.append((
                "📥",
                f"{form_type} - {form.name}",
                form.submitted_at
            ))
        
        # Recent leads
        recent_leads = session.query(Lead).order_by(Lead.imported_at.desc()).limit(5).all()
        for lead in recent_leads:
            activities.append((
                "🔍",
                f"Lead: {lead.business_name}",
                lead.imported_at
            ))
        
        # Sort by time and take top 10
        activities.sort(key=lambda x: x[2] if x[2] else datetime.min, reverse=True)
        activities = activities[:10]
        
        if not activities:
            empty_label = ctk.CTkLabel(
                self.activity_list,
                text="Nog geen activiteit.\nBegin met emails syncen of leads importeren!",
                text_color="gray50",
                justify="center"
            )
            empty_label.pack(pady=30)
        else:
            for icon, text, time in activities:
                item = ActivityItem(
                    self.activity_list,
                    icon=icon,
                    text=text,
                    time=format_relative_time(time) if time else "-"
                )
                item.pack(fill="x", pady=5)
    
    def _on_compose_email(self):
        """Open compose email dialog."""
        # Navigate to email view
        self.master.master.show_view("email")
    
    def _on_import_leads(self):
        """Open import leads dialog."""
        self.master.master.show_view("leads")
    
    def _on_sync_emails(self):
        """Trigger email sync."""
        # TODO: Implement sync
        pass
