"""
Clients View - CRM voor klanten en projecten.
"""

import customtkinter as ctk
from tkinter import messagebox
from typing import Optional
from datetime import datetime

from ..database import get_db
from ..database.models import Client, ClientStatus, Project, ProjectStatus
from ..utils.helpers import format_datetime, truncate_text


class ClientListItem(ctk.CTkFrame):
    """Client list item widget."""
    
    STATUS_COLORS = {
        ClientStatus.PROSPECT.value: "#fbbc04",
        ClientStatus.ACTIVE.value: "#34a853",
        ClientStatus.INACTIVE.value: "gray50",
    }
    
    def __init__(self, parent, client: Client, on_click: callable, **kwargs):
        super().__init__(parent, corner_radius=8, **kwargs)
        
        self.client = client
        self.on_click = on_click
        
        self.bind("<Button-1>", lambda e: on_click(client))
        self.configure(cursor="hand2")
        
        self._setup_ui()
    
    def _setup_ui(self):
        """Setup client item UI."""
        self.grid_columnconfigure(1, weight=1)
        
        # Status indicator
        status_color = self.STATUS_COLORS.get(self.client.status, "gray50")
        indicator = ctk.CTkFrame(
            self,
            width=4,
            fg_color=status_color,
            corner_radius=2
        )
        indicator.grid(row=0, column=0, rowspan=2, sticky="ns", padx=(0, 10), pady=5)
        
        # Name
        name_label = ctk.CTkLabel(
            self,
            text=self.client.name,
            font=ctk.CTkFont(size=13, weight="bold"),
            anchor="w"
        )
        name_label.grid(row=0, column=1, sticky="w", pady=(8, 0))
        name_label.bind("<Button-1>", lambda e: self.on_click(self.client))
        
        # Company + Email
        info_parts = []
        if self.client.company:
            info_parts.append(self.client.company)
        if self.client.email:
            info_parts.append(self.client.email)
        
        info_label = ctk.CTkLabel(
            self,
            text=" • ".join(info_parts) if info_parts else "-",
            font=ctk.CTkFont(size=11),
            text_color="gray60",
            anchor="w"
        )
        info_label.grid(row=1, column=1, sticky="w", pady=(0, 8))
        info_label.bind("<Button-1>", lambda e: self.on_click(self.client))
        
        # Status badge
        status_labels = {
            ClientStatus.PROSPECT.value: "Prospect",
            ClientStatus.ACTIVE.value: "Actief",
            ClientStatus.INACTIVE.value: "Inactief",
        }
        
        status_label = ctk.CTkLabel(
            self,
            text=status_labels.get(self.client.status, self.client.status),
            font=ctk.CTkFont(size=10, weight="bold"),
            text_color="white",
            fg_color=status_color,
            corner_radius=4,
            width=60,
            height=20
        )
        status_label.grid(row=0, column=2, rowspan=2, padx=(10, 8))


class AddClientDialog(ctk.CTkToplevel):
    """Dialog to add new client."""
    
    def __init__(self, parent, on_save: callable, client: Optional[Client] = None):
        super().__init__(parent)
        
        self.title("Nieuwe Klant" if not client else "Klant Bewerken")
        self.geometry("450x400")
        self.transient(parent)
        self.grab_set()
        
        self.on_save = on_save
        self.client = client
        
        self._setup_ui()
        
        if client:
            self._prefill()
    
    def _setup_ui(self):
        """Setup dialog UI."""
        self.grid_columnconfigure(0, weight=1)
        
        # Fields
        fields = [
            ("Naam *", "name_entry", "Volledige naam"),
            ("Email", "email_entry", "email@example.com"),
            ("Telefoon", "phone_entry", "+31 6 12345678"),
            ("Bedrijf", "company_entry", "Bedrijfsnaam"),
            ("Adres", "address_entry", "Straat 123, Stad"),
        ]
        
        for i, (label, attr, placeholder) in enumerate(fields):
            frame = ctk.CTkFrame(self, fg_color="transparent")
            frame.grid(row=i, column=0, sticky="ew", padx=20, pady=10)
            frame.grid_columnconfigure(1, weight=1)
            
            lbl = ctk.CTkLabel(
                frame,
                text=label,
                font=ctk.CTkFont(size=12),
                width=80,
                anchor="w"
            )
            lbl.grid(row=0, column=0, sticky="w")
            
            entry = ctk.CTkEntry(frame, placeholder_text=placeholder)
            entry.grid(row=0, column=1, sticky="ew")
            setattr(self, attr, entry)
        
        # Status dropdown
        status_frame = ctk.CTkFrame(self, fg_color="transparent")
        status_frame.grid(row=len(fields), column=0, sticky="ew", padx=20, pady=10)
        status_frame.grid_columnconfigure(1, weight=1)
        
        ctk.CTkLabel(
            status_frame,
            text="Status",
            font=ctk.CTkFont(size=12),
            width=80,
            anchor="w"
        ).grid(row=0, column=0, sticky="w")
        
        self.status_var = ctk.StringVar(value=ClientStatus.PROSPECT.value)
        status_dropdown = ctk.CTkOptionMenu(
            status_frame,
            values=[s.value for s in ClientStatus],
            variable=self.status_var,
            width=150
        )
        status_dropdown.grid(row=0, column=1, sticky="w")
        
        # Buttons
        button_frame = ctk.CTkFrame(self, fg_color="transparent")
        button_frame.grid(row=len(fields) + 1, column=0, sticky="ew", padx=20, pady=(20, 20))
        
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
        """Prefill form with existing client data."""
        if self.client:
            self.name_entry.insert(0, self.client.name or "")
            self.email_entry.insert(0, self.client.email or "")
            self.phone_entry.insert(0, self.client.phone or "")
            self.company_entry.insert(0, self.client.company or "")
            self.address_entry.insert(0, self.client.address or "")
            self.status_var.set(self.client.status)
    
    def _on_save(self):
        """Save client."""
        name = self.name_entry.get().strip()
        
        if not name:
            messagebox.showwarning("Validatie", "Naam is verplicht.")
            return
        
        db = get_db()
        with db.session() as session:
            if self.client:
                # Update existing
                client = session.query(Client).get(self.client.id)
            else:
                # Create new
                client = Client()
                session.add(client)
            
            client.name = name
            client.email = self.email_entry.get().strip() or None
            client.phone = self.phone_entry.get().strip() or None
            client.company = self.company_entry.get().strip() or None
            client.address = self.address_entry.get().strip() or None
            client.status = self.status_var.get()
            
            session.commit()
        
        self.on_save()
        self.destroy()


class ClientDetailView(ctk.CTkFrame):
    """Client detail view."""
    
    def __init__(self, parent, on_back: callable, on_refresh: callable):
        super().__init__(parent, fg_color="transparent")
        
        self.on_back = on_back
        self.on_refresh = on_refresh
        self.current_client: Optional[Client] = None
        
        self.grid_columnconfigure(0, weight=1)
        self.grid_rowconfigure(2, weight=1)
        
        self._setup_ui()
    
    def _setup_ui(self):
        """Setup detail view UI."""
        # Header
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
        
        edit_btn = ctk.CTkButton(
            header_frame,
            text="✏️ Bewerken",
            width=100,
            command=self._on_edit
        )
        edit_btn.pack(side="right")
        
        delete_btn = ctk.CTkButton(
            header_frame,
            text="🗑️",
            width=40,
            fg_color="#ea4335",
            hover_color="#d33426",
            command=self._on_delete
        )
        delete_btn.pack(side="right", padx=(0, 10))
        
        # Info card
        info_frame = ctk.CTkFrame(self, corner_radius=12)
        info_frame.grid(row=1, column=0, sticky="ew", pady=(0, 15))
        info_frame.grid_columnconfigure(1, weight=1)
        
        # Name
        self.name_label = ctk.CTkLabel(
            info_frame,
            text="",
            font=ctk.CTkFont(size=20, weight="bold"),
            anchor="w"
        )
        self.name_label.grid(row=0, column=0, columnspan=2, sticky="w", padx=20, pady=(15, 10))
        
        # Fields
        fields = [
            ("📧 Email:", "email_label"),
            ("📞 Telefoon:", "phone_label"),
            ("🏢 Bedrijf:", "company_label"),
            ("📍 Adres:", "address_label"),
            ("📊 Status:", "status_label"),
            ("📅 Klant sinds:", "date_label"),
        ]
        
        for i, (title, attr) in enumerate(fields):
            row = i + 1
            
            title_label = ctk.CTkLabel(
                info_frame,
                text=title,
                font=ctk.CTkFont(size=12),
                text_color="gray50",
                width=100,
                anchor="w"
            )
            title_label.grid(row=row, column=0, sticky="w", padx=(20, 5), pady=3)
            
            value_label = ctk.CTkLabel(
                info_frame,
                text="",
                font=ctk.CTkFont(size=12),
                anchor="w"
            )
            value_label.grid(row=row, column=1, sticky="w", pady=3)
            setattr(self, attr, value_label)
        
        spacer = ctk.CTkFrame(info_frame, fg_color="transparent", height=15)
        spacer.grid(row=len(fields) + 1, column=0)
        
        # Projects section
        projects_frame = ctk.CTkFrame(self, corner_radius=12)
        projects_frame.grid(row=2, column=0, sticky="nsew")
        projects_frame.grid_columnconfigure(0, weight=1)
        projects_frame.grid_rowconfigure(1, weight=1)
        
        projects_header = ctk.CTkFrame(projects_frame, fg_color="transparent")
        projects_header.grid(row=0, column=0, sticky="ew", padx=20, pady=(15, 10))
        
        ctk.CTkLabel(
            projects_header,
            text="Projecten",
            font=ctk.CTkFont(size=14, weight="bold"),
            anchor="w"
        ).pack(side="left")
        
        add_project_btn = ctk.CTkButton(
            projects_header,
            text="+ Nieuw",
            width=80,
            height=28,
            command=self._on_add_project
        )
        add_project_btn.pack(side="right")
        
        self.projects_list = ctk.CTkScrollableFrame(
            projects_frame,
            fg_color="transparent"
        )
        self.projects_list.grid(row=1, column=0, sticky="nsew", padx=10, pady=(0, 10))
    
    def show_client(self, client: Client):
        """Display client details."""
        self.current_client = client
        
        self.name_label.configure(text=client.name)
        self.email_label.configure(text=client.email or "-")
        self.phone_label.configure(text=client.phone or "-")
        self.company_label.configure(text=client.company or "-")
        self.address_label.configure(text=client.address or "-")
        
        status_labels = {
            ClientStatus.PROSPECT.value: "Prospect",
            ClientStatus.ACTIVE.value: "Actief",
            ClientStatus.INACTIVE.value: "Inactief",
        }
        self.status_label.configure(text=status_labels.get(client.status, client.status))
        
        self.date_label.configure(
            text=client.created_at.strftime("%d-%m-%Y") if client.created_at else "-"
        )
        
        # Load projects
        self._load_projects()
    
    def _load_projects(self):
        """Load client projects."""
        for widget in self.projects_list.winfo_children():
            widget.destroy()
        
        if not self.current_client:
            return
        
        db = get_db()
        with db.session() as session:
            projects = session.query(Project).filter_by(
                client_id=self.current_client.id
            ).all()
            
            if not projects:
                ctk.CTkLabel(
                    self.projects_list,
                    text="Nog geen projecten.",
                    text_color="gray50"
                ).pack(pady=20)
            else:
                for project in projects:
                    project_frame = ctk.CTkFrame(self.projects_list, corner_radius=8)
                    project_frame.pack(fill="x", pady=2)
                    
                    ctk.CTkLabel(
                        project_frame,
                        text=project.name,
                        font=ctk.CTkFont(size=12, weight="bold"),
                        anchor="w"
                    ).pack(side="left", padx=10, pady=8)
                    
                    status_colors = {
                        ProjectStatus.QUOTE.value: "#fbbc04",
                        ProjectStatus.ACTIVE.value: "#1a73e8",
                        ProjectStatus.COMPLETED.value: "#34a853",
                    }
                    
                    ctk.CTkLabel(
                        project_frame,
                        text=project.status,
                        font=ctk.CTkFont(size=10),
                        text_color="white",
                        fg_color=status_colors.get(project.status, "gray50"),
                        corner_radius=4,
                        width=70,
                        height=20
                    ).pack(side="right", padx=10)
    
    def _on_edit(self):
        """Edit client."""
        if self.current_client:
            def on_save():
                self.on_refresh()
                # Reload current client
                db = get_db()
                with db.session() as session:
                    client = session.query(Client).get(self.current_client.id)
                    if client:
                        self.show_client(client)
            
            AddClientDialog(self, on_save, self.current_client)
    
    def _on_delete(self):
        """Delete client."""
        if self.current_client:
            if messagebox.askyesno(
                "Verwijderen",
                f"Weet je zeker dat je '{self.current_client.name}' wilt verwijderen?"
            ):
                db = get_db()
                with db.session() as session:
                    client = session.query(Client).get(self.current_client.id)
                    session.delete(client)
                    session.commit()
                self.on_back()
                self.on_refresh()
    
    def _on_add_project(self):
        """Add new project."""
        # TODO: Implement project dialog
        pass


class ClientsView(ctk.CTkFrame):
    """Clients main view."""
    
    def __init__(self, parent):
        super().__init__(parent, fg_color="transparent")
        
        self.grid_columnconfigure(0, weight=1)
        self.grid_rowconfigure(2, weight=1)
        
        self._showing_detail = False
        self._current_filter = "all"
        
        self._setup_ui()
    
    def _setup_ui(self):
        """Setup clients view UI."""
        # Header
        header_frame = ctk.CTkFrame(self, fg_color="transparent")
        header_frame.grid(row=0, column=0, sticky="ew", pady=(0, 15))
        header_frame.grid_columnconfigure(1, weight=1)
        
        title = ctk.CTkLabel(
            header_frame,
            text="👥 Klanten",
            font=ctk.CTkFont(size=24, weight="bold"),
            anchor="w"
        )
        title.grid(row=0, column=0, sticky="w")
        
        # Add button
        add_btn = ctk.CTkButton(
            header_frame,
            text="+ Nieuwe Klant",
            fg_color="#34a853",
            hover_color="#2d8f47",
            command=self._on_add
        )
        add_btn.grid(row=0, column=2)
        
        # Filters
        filter_frame = ctk.CTkFrame(self, fg_color="transparent")
        filter_frame.grid(row=1, column=0, sticky="ew", pady=(0, 10))
        
        filters = [
            ("Alle", "all"),
            ("Prospects", ClientStatus.PROSPECT.value),
            ("Actief", ClientStatus.ACTIVE.value),
            ("Inactief", ClientStatus.INACTIVE.value),
        ]
        
        self.filter_buttons = {}
        for text, value in filters:
            btn = ctk.CTkButton(
                filter_frame,
                text=text,
                width=90,
                height=30,
                fg_color="gray40" if value != "all" else None,
                command=lambda v=value: self._set_filter(v)
            )
            btn.pack(side="left", padx=2)
            self.filter_buttons[value] = btn
        
        # Content
        self.content_frame = ctk.CTkFrame(self, fg_color="transparent")
        self.content_frame.grid(row=2, column=0, sticky="nsew")
        self.content_frame.grid_columnconfigure(0, weight=1)
        self.content_frame.grid_rowconfigure(0, weight=1)
        
        # List
        self.list_frame = ctk.CTkScrollableFrame(self.content_frame, fg_color="transparent")
        self.list_frame.grid(row=0, column=0, sticky="nsew")
        
        # Detail view
        self.detail_view = ClientDetailView(
            self.content_frame,
            self._on_back_to_list,
            self.refresh
        )
    
    def refresh(self):
        """Refresh clients list."""
        if self._showing_detail:
            return
        
        # Clear list
        for widget in self.list_frame.winfo_children():
            widget.destroy()
        
        db = get_db()
        with db.session() as session:
            query = session.query(Client)
            
            if self._current_filter != "all":
                query = query.filter_by(status=self._current_filter)
            
            clients = query.order_by(Client.name).limit(100).all()
            
            if not clients:
                empty_label = ctk.CTkLabel(
                    self.list_frame,
                    text="Nog geen klanten.\n\nKlik op '+ Nieuwe Klant' om te beginnen.",
                    text_color="gray50",
                    justify="center"
                )
                empty_label.pack(pady=50)
            else:
                for client in clients:
                    item = ClientListItem(
                        self.list_frame,
                        client=client,
                        on_click=self._on_client_click
                    )
                    item.pack(fill="x", pady=2)
    
    def _set_filter(self, filter_value: str):
        """Set filter."""
        self._current_filter = filter_value
        
        for value, btn in self.filter_buttons.items():
            if value == filter_value:
                btn.configure(fg_color=["#1a73e8", "#1a73e8"])
            else:
                btn.configure(fg_color="gray40")
        
        self.refresh()
    
    def _on_client_click(self, client: Client):
        """Handle client click."""
        self._showing_detail = True
        self.list_frame.grid_forget()
        self.detail_view.grid(row=0, column=0, sticky="nsew")
        self.detail_view.show_client(client)
    
    def _on_back_to_list(self):
        """Go back to list."""
        self._showing_detail = False
        self.detail_view.grid_forget()
        self.list_frame.grid(row=0, column=0, sticky="nsew")
        self.refresh()
    
    def _on_add(self):
        """Add new client."""
        AddClientDialog(self, self.refresh)
