"""
Support View - Customer Support Ticket Management Dashboard.
IT-style ticketing system met AI integration.
"""

import customtkinter as ctk
from tkinter import messagebox
from typing import Optional, List, Dict
from datetime import datetime
import threading

from ..database import get_db
from ..database.models import (
    SupportTicket, TicketMessage, Client,
    TicketStatus, TicketPriority, TicketCategory
)
from ..services.support_service import get_support_service, start_support_sync
from ..utils.config import logger
from ..utils.helpers import format_datetime, truncate_text


class TicketCard(ctk.CTkFrame):
    """Card voor een support ticket in de lijst."""
    
    def __init__(self, parent, ticket: Dict, on_click: callable, **kwargs):
        super().__init__(parent, corner_radius=8, **kwargs)
        
        self.ticket = ticket
        self.on_click = on_click
        
        self.bind("<Button-1>", self._handle_click)
        self.configure(cursor="hand2")
        
        self._setup_ui()
    
    def _setup_ui(self):
        self.grid_columnconfigure(1, weight=1)
        
        # Priority indicator
        priority_colors = {
            "low": "#34a853",
            "medium": "#1a73e8",
            "high": "#ff6d01",
            "urgent": "#ea4335"
        }
        color = priority_colors.get(self.ticket.get("priority", "medium"), "#1a73e8")
        
        indicator = ctk.CTkFrame(self, width=6, fg_color=color, corner_radius=3)
        indicator.grid(row=0, column=0, rowspan=3, sticky="ns", padx=(8, 12), pady=8)
        
        # Ticket number + Subject
        header_frame = ctk.CTkFrame(self, fg_color="transparent")
        header_frame.grid(row=0, column=1, sticky="ew", pady=(8, 0))
        header_frame.bind("<Button-1>", self._handle_click)
        
        ctk.CTkLabel(
            header_frame,
            text=self.ticket.get("ticket_number", ""),
            font=ctk.CTkFont(size=11, weight="bold"),
            text_color="#1a73e8"
        ).pack(side="left")
        
        # Status badge
        status = self.ticket.get("status", "open")
        status_colors = {
            "open": "#ea4335",
            "in_progress": "#1a73e8",
            "waiting_customer": "#fbbc04",
            "ai_processing": "#9c27b0",
            "resolved": "#34a853",
            "closed": "gray50"
        }
        
        status_text = status.replace("_", " ").upper()
        if status == "ai_processing":
            status_text = "🤖 AI"
        
        ctk.CTkLabel(
            header_frame,
            text=status_text,
            font=ctk.CTkFont(size=9),
            text_color="white",
            fg_color=status_colors.get(status, "gray50"),
            corner_radius=4,
            padx=6,
            pady=2
        ).pack(side="left", padx=(10, 0))
        
        # AI badge
        if self.ticket.get("ai_analyzed"):
            ctk.CTkLabel(
                header_frame,
                text="🧠 AI",
                font=ctk.CTkFont(size=9),
                text_color="white",
                fg_color="#9c27b0",
                corner_radius=4,
                padx=6,
                pady=2
            ).pack(side="left", padx=(5, 0))
        
        # Subject
        ctk.CTkLabel(
            self,
            text=truncate_text(self.ticket.get("subject", ""), 60),
            font=ctk.CTkFont(size=13, weight="bold"),
            anchor="w"
        ).grid(row=1, column=1, sticky="w")
        
        # Customer + Time
        info_frame = ctk.CTkFrame(self, fg_color="transparent")
        info_frame.grid(row=2, column=1, sticky="ew", pady=(0, 8))
        info_frame.bind("<Button-1>", self._handle_click)
        
        customer = self.ticket.get("customer_name", "")
        if self.ticket.get("company_name"):
            customer += f" ({self.ticket['company_name']})"
        
        ctk.CTkLabel(
            info_frame,
            text=f"👤 {customer}",
            font=ctk.CTkFont(size=11),
            text_color="gray50"
        ).pack(side="left")
        
        ctk.CTkLabel(
            info_frame,
            text=f"• {self.ticket.get('category', 'other').replace('_', ' ').title()}",
            font=ctk.CTkFont(size=11),
            text_color="gray50"
        ).pack(side="left", padx=(10, 0))
        
        # Time
        created = self.ticket.get("created_at", "")
        if created:
            try:
                dt = datetime.fromisoformat(created.replace("Z", "+00:00"))
                time_str = format_datetime(dt)
            except:
                time_str = created[:10]
        else:
            time_str = ""
        
        ctk.CTkLabel(
            self,
            text=time_str,
            font=ctk.CTkFont(size=10),
            text_color="gray50"
        ).grid(row=0, column=2, rowspan=3, padx=10)
        
        # Assigned
        assigned = self.ticket.get("assigned_to")
        if assigned:
            ctk.CTkLabel(
                self,
                text=f"→ {assigned}",
                font=ctk.CTkFont(size=10),
                text_color="gray60"
            ).grid(row=0, column=3, rowspan=3, padx=(0, 10))
    
    def _handle_click(self, event=None):
        if self.on_click:
            self.on_click(self.ticket)


class TicketDetailView(ctk.CTkFrame):
    """Detail view voor een ticket met conversation thread."""
    
    def __init__(self, parent, on_back: callable, **kwargs):
        super().__init__(parent, **kwargs)
        
        self.on_back = on_back
        self.current_ticket = None
        self.service = get_support_service()
        
        self.grid_columnconfigure(0, weight=1)
        self.grid_rowconfigure(2, weight=1)
        
        self._setup_ui()
    
    def _setup_ui(self):
        # Header
        header = ctk.CTkFrame(self, fg_color="transparent")
        header.grid(row=0, column=0, sticky="ew", pady=(0, 10))
        header.grid_columnconfigure(1, weight=1)
        
        ctk.CTkButton(
            header,
            text="← Terug",
            width=80,
            fg_color="gray40",
            command=self.on_back
        ).grid(row=0, column=0, sticky="w")
        
        self.ticket_title = ctk.CTkLabel(
            header,
            text="",
            font=ctk.CTkFont(size=18, weight="bold"),
            anchor="w"
        )
        self.ticket_title.grid(row=0, column=1, sticky="w", padx=(15, 0))
        
        # Actions
        actions = ctk.CTkFrame(header, fg_color="transparent")
        actions.grid(row=0, column=2)
        
        self.status_menu = ctk.CTkOptionMenu(
            actions,
            values=["open", "in_progress", "waiting_customer", "resolved", "closed"],
            width=140,
            command=self._change_status
        )
        self.status_menu.pack(side="left", padx=5)
        
        self.assign_menu = ctk.CTkOptionMenu(
            actions,
            values=["Niet toegewezen", "ai", "bart"],
            width=120,
            command=self._change_assignment
        )
        self.assign_menu.pack(side="left", padx=5)
        
        ctk.CTkButton(
            actions,
            text="🤖 AI Analyse",
            width=100,
            fg_color="#9c27b0",
            command=self._trigger_ai_analysis
        ).pack(side="left", padx=5)
        
        # Info panel
        self.info_panel = ctk.CTkFrame(self)
        self.info_panel.grid(row=1, column=0, sticky="ew", pady=(0, 10))
        
        # Messages thread
        self.thread_frame = ctk.CTkScrollableFrame(self, fg_color="transparent")
        self.thread_frame.grid(row=2, column=0, sticky="nsew")
        
        # Reply box
        reply_frame = ctk.CTkFrame(self)
        reply_frame.grid(row=3, column=0, sticky="ew", pady=(10, 0))
        reply_frame.grid_columnconfigure(0, weight=1)
        
        self.reply_text = ctk.CTkTextbox(reply_frame, height=80)
        self.reply_text.grid(row=0, column=0, sticky="ew", padx=(0, 10))
        
        btn_frame = ctk.CTkFrame(reply_frame, fg_color="transparent")
        btn_frame.grid(row=0, column=1)
        
        ctk.CTkButton(
            btn_frame,
            text="Verzenden",
            width=100,
            fg_color="#34a853",
            command=self._send_reply
        ).pack(pady=2)
        
        ctk.CTkButton(
            btn_frame,
            text="Intern",
            width=100,
            fg_color="gray40",
            command=lambda: self._send_reply(internal=True)
        ).pack(pady=2)
    
    def show_ticket(self, ticket_id: int):
        """Load and display a ticket."""
        ticket = self.service.get_ticket(ticket_id)
        if not ticket:
            return
        
        self.current_ticket = ticket
        
        # Update header
        self.ticket_title.configure(
            text=f"{ticket['ticket_number']} - {ticket['subject']}"
        )
        
        # Update status menu
        self.status_menu.set(ticket["status"])
        self.assign_menu.set(ticket.get("assigned_to") or "Niet toegewezen")
        
        # Update info panel
        for widget in self.info_panel.winfo_children():
            widget.destroy()
        
        info_items = [
            ("Klant", f"{ticket['customer_name']} <{ticket['customer_email']}>"),
            ("Bedrijf", ticket.get("company_name") or "-"),
            ("Categorie", ticket["category"].replace("_", " ").title()),
            ("Prioriteit", ticket["priority"].upper()),
            ("Project", ticket.get("project") or "-"),
            ("Aangemaakt", ticket["created_at"][:19].replace("T", " "))
        ]
        
        for i, (label, value) in enumerate(info_items):
            ctk.CTkLabel(
                self.info_panel,
                text=f"{label}:",
                font=ctk.CTkFont(size=11, weight="bold"),
                text_color="gray60"
            ).grid(row=0, column=i*2, padx=(10, 5), pady=5)
            
            ctk.CTkLabel(
                self.info_panel,
                text=value,
                font=ctk.CTkFont(size=11)
            ).grid(row=0, column=i*2+1, padx=(0, 15), pady=5)
        
        # AI Analysis panel
        if ticket.get("ai_analyzed"):
            ai_frame = ctk.CTkFrame(self.info_panel, fg_color=("#f3e5f5", "#2d1f3d"))
            ai_frame.grid(row=1, column=0, columnspan=12, sticky="ew", padx=10, pady=5)
            
            ctk.CTkLabel(
                ai_frame,
                text="🧠 AI Analyse",
                font=ctk.CTkFont(size=12, weight="bold"),
                text_color="#9c27b0"
            ).pack(anchor="w", padx=10, pady=(5, 0))
            
            ctk.CTkLabel(
                ai_frame,
                text=ticket.get("ai_analysis") or "",
                font=ctk.CTkFont(size=11),
                wraplength=800,
                justify="left"
            ).pack(anchor="w", padx=10, pady=(0, 5))
        
        # Load messages
        self._load_messages(ticket)
    
    def _load_messages(self, ticket: Dict):
        """Load message thread."""
        for widget in self.thread_frame.winfo_children():
            widget.destroy()
        
        # Original description as first message
        desc_frame = ctk.CTkFrame(self.thread_frame, fg_color=("gray90", "gray20"))
        desc_frame.pack(fill="x", pady=5)
        
        ctk.CTkLabel(
            desc_frame,
            text=f"👤 {ticket['customer_name']} • Oorspronkelijk bericht",
            font=ctk.CTkFont(size=11, weight="bold"),
            anchor="w"
        ).pack(fill="x", padx=10, pady=(8, 0))
        
        ctk.CTkLabel(
            desc_frame,
            text=ticket["description"],
            font=ctk.CTkFont(size=12),
            wraplength=700,
            justify="left",
            anchor="w"
        ).pack(fill="x", padx=10, pady=(5, 10))
        
        # Messages
        for msg in ticket.get("messages", []):
            self._add_message_bubble(msg)
    
    def _add_message_bubble(self, msg: Dict):
        """Add a message bubble to the thread."""
        sender_type = msg.get("sender_type", "customer")
        is_internal = msg.get("is_internal", False)
        
        # Color based on sender
        if sender_type == "ai":
            bg_color = ("#f3e5f5", "#2d1f3d")  # Purple for AI
            icon = "🤖"
        elif sender_type == "support":
            bg_color = ("#e3f2fd", "#1a2744")  # Blue for support
            icon = "👨‍💻"
        elif sender_type == "system":
            bg_color = ("gray85", "gray25")
            icon = "ℹ️"
        else:
            bg_color = ("gray90", "gray20")  # Gray for customer
            icon = "👤"
        
        if is_internal:
            bg_color = ("#fff3e0", "#3d2d1f")  # Orange for internal
            icon = "📝"
        
        frame = ctk.CTkFrame(self.thread_frame, fg_color=bg_color)
        frame.pack(fill="x", pady=3)
        
        header = f"{icon} {msg['sender_name']}"
        if is_internal:
            header += " (Intern)"
        header += f" • {msg['created_at'][:16].replace('T', ' ')}"
        
        ctk.CTkLabel(
            frame,
            text=header,
            font=ctk.CTkFont(size=10, weight="bold"),
            text_color="gray50",
            anchor="w"
        ).pack(fill="x", padx=10, pady=(5, 0))
        
        ctk.CTkLabel(
            frame,
            text=msg["message"],
            font=ctk.CTkFont(size=11),
            wraplength=700,
            justify="left",
            anchor="w"
        ).pack(fill="x", padx=10, pady=(3, 8))
    
    def _send_reply(self, internal: bool = False):
        """Send a reply."""
        text = self.reply_text.get("1.0", "end").strip()
        if not text or not self.current_ticket:
            return
        
        self.service.add_message(
            self.current_ticket["id"],
            sender_type="support",
            sender_name="Bart",
            message=text,
            is_internal=internal
        )
        
        # Clear and reload
        self.reply_text.delete("1.0", "end")
        self.show_ticket(self.current_ticket["id"])
    
    def _change_status(self, status: str):
        """Change ticket status."""
        if self.current_ticket:
            self.service.update_ticket_status(self.current_ticket["id"], status)
    
    def _change_assignment(self, assigned: str):
        """Change ticket assignment."""
        if self.current_ticket:
            if assigned == "Niet toegewezen":
                assigned = None
            self.service.assign_ticket(self.current_ticket["id"], assigned)
    
    def _trigger_ai_analysis(self):
        """Trigger AI analysis for ticket."""
        if not self.current_ticket:
            return
        
        def analyze():
            self.service.analyze_ticket(self.current_ticket["id"])
            self.after(0, lambda: self.show_ticket(self.current_ticket["id"]))
        
        threading.Thread(target=analyze, daemon=True).start()
        messagebox.showinfo("AI Analyse", "AI analyse gestart...")


class SupportView(ctk.CTkFrame):
    """Main support dashboard view."""
    
    def __init__(self, parent):
        super().__init__(parent, fg_color="transparent")
        
        self.grid_columnconfigure(0, weight=1)
        self.grid_rowconfigure(2, weight=1)
        
        self._showing_detail = False
        self._current_filter = None
        self.service = get_support_service()
        
        self._setup_ui()
        
        # Start sync
        start_support_sync()
    
    def _setup_ui(self):
        # Header
        header = ctk.CTkFrame(self, fg_color="transparent")
        header.grid(row=0, column=0, sticky="ew", pady=(0, 15))
        header.grid_columnconfigure(1, weight=1)
        
        ctk.CTkLabel(
            header,
            text="🎫 Customer Support",
            font=ctk.CTkFont(size=24, weight="bold"),
            anchor="w"
        ).grid(row=0, column=0, sticky="w")
        
        # Actions
        actions = ctk.CTkFrame(header, fg_color="transparent")
        actions.grid(row=0, column=1, sticky="e")
        
        ctk.CTkButton(
            actions,
            text="➕ Nieuw Ticket",
            width=120,
            fg_color="#34a853",
            command=self._create_ticket
        ).pack(side="left", padx=(0, 10))
        
        ctk.CTkButton(
            actions,
            text="🔄 Sync",
            width=80,
            fg_color="gray40",
            command=self._sync_tickets
        ).pack(side="left")
        
        # Stats bar
        self.stats_frame = ctk.CTkFrame(self, fg_color="transparent")
        self.stats_frame.grid(row=1, column=0, sticky="ew", pady=(0, 15))
        
        # Content
        self.content_frame = ctk.CTkFrame(self, fg_color="transparent")
        self.content_frame.grid(row=2, column=0, sticky="nsew")
        self.content_frame.grid_columnconfigure(0, weight=1)
        self.content_frame.grid_rowconfigure(0, weight=1)
        
        # Ticket list
        self.list_frame = ctk.CTkScrollableFrame(self.content_frame, fg_color="transparent")
        self.list_frame.grid(row=0, column=0, sticky="nsew")
        
        # Detail view
        self.detail_view = TicketDetailView(self.content_frame, self._on_back)
    
    def refresh(self):
        """Refresh data."""
        if self._showing_detail:
            return
        
        self._refresh_stats()
        self._refresh_tickets()
    
    def _refresh_stats(self):
        """Update stats bar."""
        for widget in self.stats_frame.winfo_children():
            widget.destroy()
        
        stats = self.service.get_stats()
        
        stat_items = [
            ("📊 Totaal", stats.get("total", 0), "gray50"),
            ("🔴 Open", stats.get("open", 0), "#ea4335"),
            ("🔵 In behandeling", stats.get("in_progress", 0), "#1a73e8"),
            ("🤖 AI bezig", stats.get("ai_processing", 0), "#9c27b0"),
            ("✅ Opgelost", stats.get("resolved", 0), "#34a853"),
            ("🧠 AI opgelost", stats.get("ai_resolved", 0), "#9c27b0"),
        ]
        
        for label, value, color in stat_items:
            card = ctk.CTkFrame(self.stats_frame, corner_radius=8)
            card.pack(side="left", padx=(0, 15), pady=5)
            
            ctk.CTkLabel(
                card,
                text=label,
                font=ctk.CTkFont(size=11),
                text_color="gray60"
            ).pack(padx=15, pady=(8, 0))
            
            ctk.CTkLabel(
                card,
                text=str(value),
                font=ctk.CTkFont(size=22, weight="bold"),
                text_color=color
            ).pack(padx=15, pady=(0, 8))
    
    def _refresh_tickets(self):
        """Refresh ticket list."""
        for widget in self.list_frame.winfo_children():
            widget.destroy()
        
        tickets = self.service.get_tickets(limit=50)
        
        if not tickets:
            ctk.CTkLabel(
                self.list_frame,
                text="Geen tickets gevonden.\n\n"
                     "Tickets worden automatisch gesynchroniseerd van de website.",
                text_color="gray50",
                justify="center"
            ).pack(pady=50)
        else:
            for ticket in tickets:
                card = TicketCard(
                    self.list_frame,
                    ticket=ticket,
                    on_click=self._on_ticket_click
                )
                card.pack(fill="x", pady=3)
    
    def _on_ticket_click(self, ticket: Dict):
        """Handle ticket click."""
        self._showing_detail = True
        self.list_frame.grid_forget()
        self.detail_view.grid(row=0, column=0, sticky="nsew")
        self.detail_view.show_ticket(ticket["id"])
    
    def _on_back(self):
        """Go back to list."""
        self._showing_detail = False
        self.detail_view.grid_forget()
        self.list_frame.grid(row=0, column=0, sticky="nsew")
        self.refresh()
    
    def _create_ticket(self):
        """Create a new ticket manually."""
        # TODO: Create ticket dialog
        messagebox.showinfo("Nieuw Ticket", "Handmatig ticket aanmaken komt binnenkort...")
    
    def _sync_tickets(self):
        """Manual sync."""
        synced, errors, msgs = self.service.sync_tickets_from_website()
        self.refresh()
        
        if synced > 0:
            messagebox.showinfo("Sync", f"{synced} nieuwe tickets gesynchroniseerd!")
        elif errors > 0:
            messagebox.showwarning("Sync", f"Sync voltooid met {errors} fouten:\n" + "\n".join(msgs))
        else:
            messagebox.showinfo("Sync", "Geen nieuwe tickets gevonden.")
