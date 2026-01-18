"""
Leads View - Lead management en import.
"""

import customtkinter as ctk
from tkinter import filedialog, messagebox
from typing import Optional, List
from datetime import datetime
from pathlib import Path
import csv

from ..database import get_db
from ..database.models import Lead, LeadStatus
from ..utils.config import Config, logger
from ..utils.helpers import format_datetime, truncate_text, generate_id


class LeadListItem(ctk.CTkFrame):
    """Lead list item widget."""
    
    # Status colors
    STATUS_COLORS = {
        LeadStatus.NEW.value: "#1a73e8",
        LeadStatus.CONTACTED.value: "#fbbc04",
        LeadStatus.QUALIFIED.value: "#34a853",
        LeadStatus.CONVERTED.value: "#0f9d58",
        LeadStatus.LOST.value: "#ea4335",
    }
    
    def __init__(self, parent, lead: Lead, on_click: callable, **kwargs):
        super().__init__(parent, corner_radius=8, **kwargs)
        
        self.lead = lead
        self.on_click = on_click
        
        self.bind("<Button-1>", lambda e: on_click(lead))
        self.configure(cursor="hand2")
        
        self._setup_ui()
    
    def _setup_ui(self):
        """Setup lead item UI."""
        self.grid_columnconfigure(1, weight=1)
        
        # Status indicator
        status_color = self.STATUS_COLORS.get(self.lead.status, "gray50")
        indicator = ctk.CTkFrame(
            self,
            width=4,
            fg_color=status_color,
            corner_radius=2
        )
        indicator.grid(row=0, column=0, rowspan=2, sticky="ns", padx=(0, 10), pady=5)
        
        # Business name
        name_label = ctk.CTkLabel(
            self,
            text=truncate_text(self.lead.business_name, 40),
            font=ctk.CTkFont(size=13, weight="bold"),
            anchor="w"
        )
        name_label.grid(row=0, column=1, sticky="w", pady=(8, 0))
        name_label.bind("<Button-1>", lambda e: self.on_click(self.lead))
        
        # City + Category
        info_parts = []
        if self.lead.city:
            info_parts.append(self.lead.city)
        if self.lead.category:
            info_parts.append(self.lead.category)
        
        info_label = ctk.CTkLabel(
            self,
            text=" • ".join(info_parts) if info_parts else "-",
            font=ctk.CTkFont(size=11),
            text_color="gray60",
            anchor="w"
        )
        info_label.grid(row=1, column=1, sticky="w", pady=(0, 8))
        info_label.bind("<Button-1>", lambda e: self.on_click(self.lead))
        
        # Score badge
        score = self.lead.lead_score or 0
        score_color = "#34a853" if score >= 70 else "#fbbc04" if score >= 40 else "#ea4335"
        
        score_label = ctk.CTkLabel(
            self,
            text=f"{score:.0f}",
            font=ctk.CTkFont(size=11, weight="bold"),
            text_color="white",
            fg_color=score_color,
            corner_radius=4,
            width=35,
            height=22
        )
        score_label.grid(row=0, column=2, rowspan=2, padx=(10, 8))
        
        # Website indicator
        website_text = "🌐" if self.lead.has_website else "❌"
        website_label = ctk.CTkLabel(
            self,
            text=website_text,
            font=ctk.CTkFont(size=14)
        )
        website_label.grid(row=0, column=3, rowspan=2, padx=(0, 8))


class LeadDetailView(ctk.CTkFrame):
    """Lead detail view."""
    
    def __init__(self, parent, on_back: callable, on_refresh: callable):
        super().__init__(parent, fg_color="transparent")
        
        self.on_back = on_back
        self.on_refresh = on_refresh
        self.current_lead: Optional[Lead] = None
        
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
        
        # Status dropdown
        self.status_var = ctk.StringVar(value=LeadStatus.NEW.value)
        self.status_dropdown = ctk.CTkOptionMenu(
            header_frame,
            values=[s.value for s in LeadStatus],
            variable=self.status_var,
            command=self._on_status_change,
            width=150
        )
        self.status_dropdown.pack(side="right")
        
        status_label = ctk.CTkLabel(
            header_frame,
            text="Status:",
            font=ctk.CTkFont(size=12)
        )
        status_label.pack(side="right", padx=(0, 10))
        
        # Info card
        info_frame = ctk.CTkFrame(self, corner_radius=12)
        info_frame.grid(row=1, column=0, sticky="ew", pady=(0, 15))
        info_frame.grid_columnconfigure(1, weight=1)
        
        # Business name
        self.name_label = ctk.CTkLabel(
            info_frame,
            text="",
            font=ctk.CTkFont(size=20, weight="bold"),
            anchor="w"
        )
        self.name_label.grid(row=0, column=0, columnspan=3, sticky="w", padx=20, pady=(15, 10))
        
        # Contact info
        fields = [
            ("📍 Adres:", "address_label"),
            ("📞 Telefoon:", "phone_label"),
            ("📧 Email:", "email_label"),
            ("🌐 Website:", "website_label"),
            ("📊 Score:", "score_label"),
            ("📁 Categorie:", "category_label"),
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
        
        # Spacer for bottom padding
        spacer = ctk.CTkFrame(info_frame, fg_color="transparent", height=15)
        spacer.grid(row=len(fields) + 1, column=0)
        
        # Actions
        actions_frame = ctk.CTkFrame(self, corner_radius=12)
        actions_frame.grid(row=2, column=0, sticky="new")
        actions_frame.grid_columnconfigure(0, weight=1)
        
        actions_title = ctk.CTkLabel(
            actions_frame,
            text="Acties",
            font=ctk.CTkFont(size=14, weight="bold"),
            anchor="w"
        )
        actions_title.grid(row=0, column=0, sticky="w", padx=20, pady=(15, 10))
        
        buttons_frame = ctk.CTkFrame(actions_frame, fg_color="transparent")
        buttons_frame.grid(row=1, column=0, sticky="ew", padx=20, pady=(0, 15))
        
        email_btn = ctk.CTkButton(
            buttons_frame,
            text="📧 Email Sturen",
            command=self._on_send_email
        )
        email_btn.pack(side="left", padx=(0, 10))
        
        convert_btn = ctk.CTkButton(
            buttons_frame,
            text="👥 Naar Klant",
            fg_color="#34a853",
            hover_color="#2d8f47",
            command=self._on_convert_to_client
        )
        convert_btn.pack(side="left", padx=(0, 10))
        
        delete_btn = ctk.CTkButton(
            buttons_frame,
            text="🗑️ Verwijderen",
            fg_color="#ea4335",
            hover_color="#d33426",
            command=self._on_delete
        )
        delete_btn.pack(side="left")
    
    def show_lead(self, lead: Lead):
        """Display lead details."""
        self.current_lead = lead
        
        self.name_label.configure(text=lead.business_name)
        self.address_label.configure(text=lead.address or "-")
        self.phone_label.configure(text=lead.phone or "-")
        self.email_label.configure(text=lead.email or "-")
        self.website_label.configure(text=lead.website or "-")
        self.score_label.configure(text=f"{lead.lead_score:.0f}" if lead.lead_score else "-")
        self.category_label.configure(text=lead.category or "-")
        
        self.status_var.set(lead.status)
    
    def _on_status_change(self, new_status: str):
        """Handle status change."""
        if self.current_lead:
            db = get_db()
            with db.session() as session:
                lead = session.query(Lead).get(self.current_lead.id)
                lead.status = new_status
                session.commit()
            logger.info(f"Lead {self.current_lead.id} status changed to {new_status}")
    
    def _on_send_email(self):
        """Open email compose for this lead."""
        # TODO: Navigate to email compose with lead email prefilled
        pass
    
    def _on_convert_to_client(self):
        """Convert lead to client."""
        # TODO: Implement conversion
        pass
    
    def _on_delete(self):
        """Delete lead."""
        if self.current_lead:
            if messagebox.askyesno("Verwijderen", f"Weet je zeker dat je '{self.current_lead.business_name}' wilt verwijderen?"):
                db = get_db()
                with db.session() as session:
                    lead = session.query(Lead).get(self.current_lead.id)
                    session.delete(lead)
                    session.commit()
                logger.info(f"Lead {self.current_lead.id} deleted")
                self.on_back()
                self.on_refresh()


class ImportDialog(ctk.CTkToplevel):
    """CSV import dialog."""
    
    def __init__(self, parent, on_complete: callable):
        super().__init__(parent)
        
        self.title("Leads Importeren")
        self.geometry("500x400")
        self.transient(parent)
        self.grab_set()
        
        self.on_complete = on_complete
        self.file_path: Optional[Path] = None
        
        self._setup_ui()
    
    def _setup_ui(self):
        """Setup import dialog UI."""
        self.grid_columnconfigure(0, weight=1)
        self.grid_rowconfigure(2, weight=1)
        
        # Header
        header = ctk.CTkLabel(
            self,
            text="📥 CSV Importeren",
            font=ctk.CTkFont(size=18, weight="bold")
        )
        header.grid(row=0, column=0, pady=(20, 10))
        
        # File selection
        file_frame = ctk.CTkFrame(self, fg_color="transparent")
        file_frame.grid(row=1, column=0, sticky="ew", padx=20, pady=10)
        file_frame.grid_columnconfigure(0, weight=1)
        
        self.file_label = ctk.CTkLabel(
            file_frame,
            text="Geen bestand geselecteerd",
            text_color="gray50"
        )
        self.file_label.grid(row=0, column=0, sticky="w")
        
        browse_btn = ctk.CTkButton(
            file_frame,
            text="📁 Bladeren...",
            command=self._browse_file
        )
        browse_btn.grid(row=0, column=1, padx=(10, 0))
        
        # Preview area
        preview_frame = ctk.CTkFrame(self, corner_radius=12)
        preview_frame.grid(row=2, column=0, sticky="nsew", padx=20, pady=10)
        preview_frame.grid_columnconfigure(0, weight=1)
        preview_frame.grid_rowconfigure(1, weight=1)
        
        preview_label = ctk.CTkLabel(
            preview_frame,
            text="Preview",
            font=ctk.CTkFont(size=14, weight="bold"),
            anchor="w"
        )
        preview_label.grid(row=0, column=0, sticky="w", padx=15, pady=(10, 5))
        
        self.preview_text = ctk.CTkTextbox(preview_frame, font=ctk.CTkFont(size=11))
        self.preview_text.grid(row=1, column=0, sticky="nsew", padx=10, pady=(0, 10))
        
        # Import info
        self.info_label = ctk.CTkLabel(
            self,
            text="",
            font=ctk.CTkFont(size=12),
            text_color="gray50"
        )
        self.info_label.grid(row=3, column=0, pady=5)
        
        # Buttons
        button_frame = ctk.CTkFrame(self, fg_color="transparent")
        button_frame.grid(row=4, column=0, sticky="ew", padx=20, pady=(10, 20))
        
        self.import_btn = ctk.CTkButton(
            button_frame,
            text="📥 Importeren",
            fg_color="#34a853",
            hover_color="#2d8f47",
            state="disabled",
            command=self._do_import
        )
        self.import_btn.pack(side="right", padx=(10, 0))
        
        cancel_btn = ctk.CTkButton(
            button_frame,
            text="Annuleren",
            fg_color="gray40",
            command=self.destroy
        )
        cancel_btn.pack(side="right")
    
    def _browse_file(self):
        """Open file browser."""
        # Start in lead-finder output folder if exists
        initial_dir = Config.get_lead_finder_path()
        if not initial_dir.exists():
            initial_dir = Path.home()
        
        file_path = filedialog.askopenfilename(
            title="Selecteer CSV bestand",
            initialdir=initial_dir,
            filetypes=[("CSV bestanden", "*.csv"), ("Alle bestanden", "*.*")]
        )
        
        if file_path:
            self.file_path = Path(file_path)
            self.file_label.configure(text=self.file_path.name)
            self._preview_file()
    
    def _preview_file(self):
        """Preview CSV content."""
        if not self.file_path:
            return
        
        try:
            with open(self.file_path, 'r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                rows = list(reader)
            
            # Show preview
            self.preview_text.delete("1.0", "end")
            
            if rows:
                # Show headers
                headers = list(rows[0].keys())
                self.preview_text.insert("end", "Kolommen gevonden:\n")
                self.preview_text.insert("end", ", ".join(headers[:5]) + "...\n\n")
                
                # Show first few rows
                self.preview_text.insert("end", f"Eerste {min(3, len(rows))} rijen:\n")
                for row in rows[:3]:
                    name = row.get('business_name', row.get('name', row.get('title', 'Unknown')))
                    self.preview_text.insert("end", f"  • {name}\n")
                
                self.info_label.configure(text=f"Gevonden: {len(rows)} leads")
                self.import_btn.configure(state="normal")
            else:
                self.preview_text.insert("end", "Geen data gevonden in bestand.")
                self.import_btn.configure(state="disabled")
                
        except Exception as e:
            self.preview_text.delete("1.0", "end")
            self.preview_text.insert("end", f"Fout bij lezen bestand:\n{e}")
            self.import_btn.configure(state="disabled")
    
    def _do_import(self):
        """Execute import."""
        if not self.file_path:
            return
        
        try:
            with open(self.file_path, 'r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                rows = list(reader)
            
            batch_id = generate_id()
            imported = 0
            skipped = 0
            
            db = get_db()
            with db.session() as session:
                for row in rows:
                    # Map CSV columns to Lead fields
                    business_name = row.get('business_name') or row.get('name') or row.get('title')
                    
                    if not business_name:
                        skipped += 1
                        continue
                    
                    # Check for duplicate
                    existing = session.query(Lead).filter_by(
                        business_name=business_name,
                        city=row.get('city', row.get('location'))
                    ).first()
                    
                    if existing:
                        skipped += 1
                        continue
                    
                    lead = Lead(
                        business_name=business_name,
                        address=row.get('address') or row.get('full_address'),
                        city=row.get('city') or row.get('location'),
                        phone=row.get('phone') or row.get('telephone'),
                        email=row.get('email'),
                        website=row.get('website') or row.get('url'),
                        lead_score=float(row.get('lead_score', 0) or 0),
                        has_website=row.get('has_website', '').lower() in ('true', '1', 'yes', 'ja'),
                        website_quality=row.get('website_quality'),
                        category=row.get('category') or row.get('search_query'),
                        search_query=row.get('search_query'),
                        import_batch=batch_id,
                        source_file=self.file_path.name,
                        status=LeadStatus.NEW.value
                    )
                    session.add(lead)
                    imported += 1
                
                session.commit()
            
            logger.info(f"Imported {imported} leads, skipped {skipped}")
            messagebox.showinfo(
                "Import Voltooid",
                f"✅ {imported} leads geïmporteerd\n⏭️ {skipped} overgeslagen (duplicaten)"
            )
            
            self.on_complete()
            self.destroy()
            
        except Exception as e:
            logger.error(f"Import error: {e}")
            messagebox.showerror("Import Fout", f"Er ging iets mis:\n{e}")


class LeadsView(ctk.CTkFrame):
    """Leads main view."""
    
    def __init__(self, parent):
        super().__init__(parent, fg_color="transparent")
        
        self.grid_columnconfigure(0, weight=1)
        self.grid_rowconfigure(2, weight=1)
        
        self._showing_detail = False
        self._current_filter = "all"
        
        self._setup_ui()
    
    def _setup_ui(self):
        """Setup leads view UI."""
        # Header
        header_frame = ctk.CTkFrame(self, fg_color="transparent")
        header_frame.grid(row=0, column=0, sticky="ew", pady=(0, 15))
        header_frame.grid_columnconfigure(1, weight=1)
        
        title = ctk.CTkLabel(
            header_frame,
            text="🔍 Leads",
            font=ctk.CTkFont(size=24, weight="bold"),
            anchor="w"
        )
        title.grid(row=0, column=0, sticky="w")
        
        # Import button
        import_btn = ctk.CTkButton(
            header_frame,
            text="📥 Import CSV",
            fg_color="#34a853",
            hover_color="#2d8f47",
            command=self._on_import
        )
        import_btn.grid(row=0, column=2)
        
        # Filters
        filter_frame = ctk.CTkFrame(self, fg_color="transparent")
        filter_frame.grid(row=1, column=0, sticky="ew", pady=(0, 10))
        
        filters = [
            ("Alle", "all"),
            ("Nieuw", LeadStatus.NEW.value),
            ("Gecontacteerd", LeadStatus.CONTACTED.value),
            ("Gekwalificeerd", LeadStatus.QUALIFIED.value),
            ("Geconverteerd", LeadStatus.CONVERTED.value),
        ]
        
        self.filter_buttons = {}
        for text, value in filters:
            btn = ctk.CTkButton(
                filter_frame,
                text=text,
                width=100,
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
        self.detail_view = LeadDetailView(
            self.content_frame,
            self._on_back_to_list,
            self.refresh
        )
    
    def refresh(self):
        """Refresh leads list."""
        if self._showing_detail:
            return
        
        # Clear list
        for widget in self.list_frame.winfo_children():
            widget.destroy()
        
        db = get_db()
        with db.session() as session:
            query = session.query(Lead)
            
            if self._current_filter != "all":
                query = query.filter_by(status=self._current_filter)
            
            leads = query.order_by(Lead.lead_score.desc()).limit(100).all()
            
            if not leads:
                empty_label = ctk.CTkLabel(
                    self.list_frame,
                    text="Geen leads gevonden.\n\nKlik op 'Import CSV' om leads te importeren\nvanuit de lead-finder.",
                    text_color="gray50",
                    justify="center"
                )
                empty_label.pack(pady=50)
            else:
                for lead in leads:
                    item = LeadListItem(
                        self.list_frame,
                        lead=lead,
                        on_click=self._on_lead_click
                    )
                    item.pack(fill="x", pady=2)
    
    def _set_filter(self, filter_value: str):
        """Set filter and refresh."""
        self._current_filter = filter_value
        
        # Update button states
        for value, btn in self.filter_buttons.items():
            if value == filter_value:
                btn.configure(fg_color=["#1a73e8", "#1a73e8"])
            else:
                btn.configure(fg_color="gray40")
        
        self.refresh()
    
    def _on_lead_click(self, lead: Lead):
        """Handle lead click."""
        self._showing_detail = True
        self.list_frame.grid_forget()
        self.detail_view.grid(row=0, column=0, sticky="nsew")
        self.detail_view.show_lead(lead)
    
    def _on_back_to_list(self):
        """Go back to list."""
        self._showing_detail = False
        self.detail_view.grid_forget()
        self.list_frame.grid(row=0, column=0, sticky="nsew")
        self.refresh()
    
    def _on_import(self):
        """Open import dialog."""
        ImportDialog(self, self.refresh)
