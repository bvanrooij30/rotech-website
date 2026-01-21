"""
Werk Opdrachten View - Werkopdrachten van klanten via de website.
Contact forms, offerte aanvragen en werkorders.
"""

import customtkinter as ctk
from tkinter import messagebox
from typing import Optional
from datetime import datetime

from ..database import get_db
from ..database.models import FormSubmission, FormStatus, FormType, Note
from ..utils.helpers import format_datetime, format_relative_time, truncate_text
from ..services.cursor_prompt_generator import get_cursor_prompt_generator


class FormListItem(ctk.CTkFrame):
    """Form submission list item."""
    
    STATUS_COLORS = {
        FormStatus.NEW.value: "#1a73e8",
        FormStatus.IN_PROGRESS.value: "#fbbc04",
        FormStatus.DONE.value: "#34a853",
        FormStatus.ARCHIVED.value: "gray50",
    }
    
    TYPE_ICONS = {
        FormType.CONTACT.value: "📬",
        FormType.OFFERTE.value: "📝",
        FormType.QUOTE.value: "💰",
    }
    
    def __init__(self, parent, form: FormSubmission, on_click: callable, **kwargs):
        super().__init__(parent, corner_radius=8, **kwargs)
        
        self.form = form
        self.on_click = on_click
        
        self.bind("<Button-1>", lambda e: on_click(form))
        self.configure(cursor="hand2")
        
        self._setup_ui()
    
    def _setup_ui(self):
        """Setup form item UI."""
        self.grid_columnconfigure(2, weight=1)
        
        # Status indicator
        status_color = self.STATUS_COLORS.get(self.form.status, "gray50")
        indicator = ctk.CTkFrame(
            self,
            width=4,
            fg_color=status_color,
            corner_radius=2
        )
        indicator.grid(row=0, column=0, rowspan=2, sticky="ns", padx=(0, 10), pady=5)
        
        # Type icon
        icon = self.TYPE_ICONS.get(self.form.form_type, "📥")
        icon_label = ctk.CTkLabel(
            self,
            text=icon,
            font=ctk.CTkFont(size=20)
        )
        icon_label.grid(row=0, column=1, rowspan=2, padx=(0, 10))
        
        # Name + Subject
        name_text = self.form.name
        if self.form.company:
            name_text += f" ({self.form.company})"
        
        name_label = ctk.CTkLabel(
            self,
            text=name_text,
            font=ctk.CTkFont(size=13, weight="bold"),
            anchor="w"
        )
        name_label.grid(row=0, column=2, sticky="w", pady=(8, 0))
        name_label.bind("<Button-1>", lambda e: self.on_click(self.form))
        
        subject_label = ctk.CTkLabel(
            self,
            text=truncate_text(self.form.subject or self.form.message, 60),
            font=ctk.CTkFont(size=11),
            text_color="gray60",
            anchor="w"
        )
        subject_label.grid(row=1, column=2, sticky="w", pady=(0, 8))
        subject_label.bind("<Button-1>", lambda e: self.on_click(self.form))
        
        # Time
        time_label = ctk.CTkLabel(
            self,
            text=format_relative_time(self.form.submitted_at),
            font=ctk.CTkFont(size=11),
            text_color="gray50"
        )
        time_label.grid(row=0, column=3, rowspan=2, padx=(10, 8))


class FormDetailView(ctk.CTkFrame):
    """Form submission detail view."""
    
    def __init__(self, parent, on_back: callable, on_refresh: callable):
        super().__init__(parent, fg_color="transparent")
        
        self.on_back = on_back
        self.on_refresh = on_refresh
        self.current_form: Optional[FormSubmission] = None
        
        self.grid_columnconfigure(0, weight=1)
        self.grid_rowconfigure(3, weight=1)
        
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
        self.status_var = ctk.StringVar(value=FormStatus.NEW.value)
        status_options = [s.value for s in FormStatus]
        status_labels = {
            FormStatus.NEW.value: "Nieuw",
            FormStatus.IN_PROGRESS.value: "In Behandeling",
            FormStatus.DONE.value: "Afgerond",
            FormStatus.ARCHIVED.value: "Gearchiveerd",
        }
        
        self.status_dropdown = ctk.CTkOptionMenu(
            header_frame,
            values=status_options,
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
        
        # Contact info card
        info_frame = ctk.CTkFrame(self, corner_radius=12)
        info_frame.grid(row=1, column=0, sticky="ew", pady=(0, 15))
        info_frame.grid_columnconfigure(1, weight=1)
        
        # Type badge
        self.type_label = ctk.CTkLabel(
            info_frame,
            text="",
            font=ctk.CTkFont(size=11, weight="bold"),
            text_color="white",
            fg_color="#1a73e8",
            corner_radius=4,
            width=80,
            height=22
        )
        self.type_label.grid(row=0, column=0, columnspan=2, sticky="w", padx=20, pady=(15, 10))
        
        # Contact details
        fields = [
            ("👤 Naam:", "name_label"),
            ("📧 Email:", "email_label"),
            ("📞 Telefoon:", "phone_label"),
            ("🏢 Bedrijf:", "company_label"),
            ("📋 Onderwerp:", "subject_label"),
            ("📅 Ontvangen:", "date_label"),
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
        
        # Message
        message_frame = ctk.CTkFrame(self, corner_radius=12)
        message_frame.grid(row=2, column=0, sticky="ew", pady=(0, 15))
        message_frame.grid_columnconfigure(0, weight=1)
        message_frame.grid_rowconfigure(1, weight=1)
        
        message_title = ctk.CTkLabel(
            message_frame,
            text="Bericht",
            font=ctk.CTkFont(size=14, weight="bold"),
            anchor="w"
        )
        message_title.grid(row=0, column=0, sticky="w", padx=20, pady=(15, 5))
        
        self.message_text = ctk.CTkTextbox(
            message_frame,
            height=150,
            font=ctk.CTkFont(size=12)
        )
        self.message_text.grid(row=1, column=0, sticky="ew", padx=20, pady=(0, 15))
        
        # Actions
        actions_frame = ctk.CTkFrame(self, corner_radius=12)
        actions_frame.grid(row=3, column=0, sticky="new")
        
        actions_title = ctk.CTkLabel(
            actions_frame,
            text="Acties",
            font=ctk.CTkFont(size=14, weight="bold"),
            anchor="w"
        )
        actions_title.grid(row=0, column=0, sticky="w", padx=20, pady=(15, 10))
        
        buttons_frame = ctk.CTkFrame(actions_frame, fg_color="transparent")
        buttons_frame.grid(row=1, column=0, sticky="ew", padx=20, pady=(0, 15))
        
        reply_btn = ctk.CTkButton(
            buttons_frame,
            text="📧 Email Sturen",
            command=self._on_reply
        )
        reply_btn.pack(side="left", padx=(0, 10))
        
        convert_btn = ctk.CTkButton(
            buttons_frame,
            text="👥 Naar Klant",
            fg_color="#34a853",
            hover_color="#2d8f47",
            command=self._on_convert
        )
        convert_btn.pack(side="left", padx=(0, 10))
        
        # Cursor AI Prompt button
        cursor_btn = ctk.CTkButton(
            buttons_frame,
            text="🤖 Cursor Prompt",
            fg_color="#7c3aed",
            hover_color="#6d28d9",
            command=self._on_generate_cursor_prompt
        )
        cursor_btn.pack(side="left")
    
    def show_form(self, form: FormSubmission):
        """Display form details."""
        self.current_form = form
        
        # Type badge
        type_labels = {
            FormType.CONTACT.value: "📬 Contact",
            FormType.OFFERTE.value: "📝 Offerte",
            FormType.QUOTE.value: "💰 Quote",
        }
        self.type_label.configure(text=type_labels.get(form.form_type, "📥 Form"))
        
        # Fields
        self.name_label.configure(text=form.name)
        self.email_label.configure(text=form.email)
        self.phone_label.configure(text=form.phone or "-")
        self.company_label.configure(text=form.company or "-")
        self.subject_label.configure(text=form.subject or "-")
        self.date_label.configure(
            text=form.submitted_at.strftime("%d-%m-%Y %H:%M") if form.submitted_at else "-"
        )
        
        # Message
        self.message_text.delete("1.0", "end")
        self.message_text.insert("1.0", form.message or "")
        
        # Status
        self.status_var.set(form.status)
    
    def _on_status_change(self, new_status: str):
        """Handle status change."""
        if self.current_form:
            db = get_db()
            with db.session() as session:
                form = session.query(FormSubmission).get(self.current_form.id)
                form.status = new_status
                session.commit()
    
    def _on_reply(self):
        """Open email compose with reply."""
        # TODO: Navigate to email compose
        pass
    
    def _on_convert(self):
        """Convert to client."""
        # TODO: Implement conversion
        pass
    
    def _on_generate_cursor_prompt(self):
        """Generate and show Cursor AI prompt."""
        if not self.current_form:
            return
        
        # Generate prompt
        generator = get_cursor_prompt_generator()
        prompt = generator.generate_prompt(self.current_form)
        
        # Show in popup window
        CursorPromptDialog(self, prompt, self.current_form.name)


class CursorPromptDialog(ctk.CTkToplevel):
    """Dialog window showing generated Cursor AI prompt."""
    
    def __init__(self, parent, prompt: str, customer_name: str):
        super().__init__(parent)
        
        self.prompt = prompt
        
        # Window settings
        self.title(f"🤖 Cursor AI Prompt - {customer_name}")
        self.geometry("900x700")
        self.minsize(700, 500)
        
        # Center window
        self.update_idletasks()
        x = (self.winfo_screenwidth() - 900) // 2
        y = (self.winfo_screenheight() - 700) // 2
        self.geometry(f"+{x}+{y}")
        
        # Make modal
        self.transient(parent)
        self.grab_set()
        
        self._setup_ui()
        
        # Focus
        self.after(100, self.focus_force)
    
    def _setup_ui(self):
        """Setup dialog UI."""
        self.grid_columnconfigure(0, weight=1)
        self.grid_rowconfigure(1, weight=1)
        
        # Header
        header_frame = ctk.CTkFrame(self, fg_color="transparent")
        header_frame.grid(row=0, column=0, sticky="ew", padx=20, pady=(20, 10))
        
        title_label = ctk.CTkLabel(
            header_frame,
            text="🤖 Gegenereerde Cursor AI Prompt",
            font=ctk.CTkFont(size=18, weight="bold")
        )
        title_label.pack(side="left")
        
        # Copy button in header
        copy_btn = ctk.CTkButton(
            header_frame,
            text="📋 Kopieer naar Klembord",
            fg_color="#7c3aed",
            hover_color="#6d28d9",
            command=self._copy_to_clipboard
        )
        copy_btn.pack(side="right")
        
        # Info label
        info_label = ctk.CTkLabel(
            self,
            text="Kopieer deze prompt en plak in een nieuwe Cursor AI chat om het project te starten.",
            font=ctk.CTkFont(size=12),
            text_color="gray50"
        )
        info_label.grid(row=0, column=0, sticky="w", padx=20, pady=(50, 0))
        
        # Prompt text area
        text_frame = ctk.CTkFrame(self, corner_radius=12)
        text_frame.grid(row=1, column=0, sticky="nsew", padx=20, pady=10)
        text_frame.grid_columnconfigure(0, weight=1)
        text_frame.grid_rowconfigure(0, weight=1)
        
        self.prompt_text = ctk.CTkTextbox(
            text_frame,
            font=ctk.CTkFont(size=12, family="Consolas"),
            wrap="word"
        )
        self.prompt_text.grid(row=0, column=0, sticky="nsew", padx=10, pady=10)
        
        # Insert prompt
        self.prompt_text.insert("1.0", self.prompt)
        
        # Footer with buttons
        footer_frame = ctk.CTkFrame(self, fg_color="transparent")
        footer_frame.grid(row=2, column=0, sticky="ew", padx=20, pady=(0, 20))
        
        # Status label
        self.status_label = ctk.CTkLabel(
            footer_frame,
            text="",
            font=ctk.CTkFont(size=11),
            text_color="#34a853"
        )
        self.status_label.pack(side="left")
        
        # Close button
        close_btn = ctk.CTkButton(
            footer_frame,
            text="Sluiten",
            fg_color="gray40",
            width=100,
            command=self.destroy
        )
        close_btn.pack(side="right")
        
        # Select all button
        select_btn = ctk.CTkButton(
            footer_frame,
            text="Alles Selecteren",
            fg_color="gray40",
            width=120,
            command=self._select_all
        )
        select_btn.pack(side="right", padx=(0, 10))
    
    def _copy_to_clipboard(self):
        """Copy prompt to clipboard."""
        self.clipboard_clear()
        self.clipboard_append(self.prompt)
        self.update()  # Required for clipboard
        
        self.status_label.configure(text="✓ Gekopieerd naar klembord!")
        self.after(3000, lambda: self.status_label.configure(text=""))
    
    def _select_all(self):
        """Select all text in prompt."""
        self.prompt_text.tag_add("sel", "1.0", "end")
        self.prompt_text.focus_set()


class InboxView(ctk.CTkFrame):
    """Website inbox main view."""
    
    def __init__(self, parent):
        super().__init__(parent, fg_color="transparent")
        
        self.grid_columnconfigure(0, weight=1)
        self.grid_rowconfigure(2, weight=1)
        
        self._showing_detail = False
        self._current_filter = "all"
        
        self._setup_ui()
    
    def _setup_ui(self):
        """Setup inbox view UI."""
        # Header
        header_frame = ctk.CTkFrame(self, fg_color="transparent")
        header_frame.grid(row=0, column=0, sticky="ew", pady=(0, 15))
        
        title = ctk.CTkLabel(
            header_frame,
            text="📋 Werk Opdrachten",
            font=ctk.CTkFont(size=24, weight="bold"),
            anchor="w"
        )
        title.pack(side="left")
        
        # Sync button
        sync_btn = ctk.CTkButton(
            header_frame,
            text="🔄 Sync",
            width=80,
            fg_color="gray40",
            command=self._sync_orders
        )
        sync_btn.pack(side="right")
        
        # Filters
        filter_frame = ctk.CTkFrame(self, fg_color="transparent")
        filter_frame.grid(row=1, column=0, sticky="ew", pady=(0, 10))
        
        filters = [
            ("Alle", "all"),
            ("Nieuw", FormStatus.NEW.value),
            ("In Behandeling", FormStatus.IN_PROGRESS.value),
            ("Afgerond", FormStatus.DONE.value),
        ]
        
        self.filter_buttons = {}
        for text, value in filters:
            btn = ctk.CTkButton(
                filter_frame,
                text=text,
                width=110,
                height=30,
                fg_color="gray40" if value != "all" else None,
                command=lambda v=value: self._set_filter(v)
            )
            btn.pack(side="left", padx=2)
            self.filter_buttons[value] = btn
        
        # Form type filter
        ctk.CTkLabel(
            filter_frame,
            text="│",
            text_color="gray50"
        ).pack(side="left", padx=10)
        
        type_filters = [
            ("📬 Contact", FormType.CONTACT.value),
            ("📝 Offerte", FormType.OFFERTE.value),
        ]
        
        self.type_buttons = {}
        for text, value in type_filters:
            btn = ctk.CTkButton(
                filter_frame,
                text=text,
                width=100,
                height=30,
                fg_color="gray40",
                command=lambda v=value: self._set_type_filter(v)
            )
            btn.pack(side="left", padx=2)
            self.type_buttons[value] = btn
        
        # Content
        self.content_frame = ctk.CTkFrame(self, fg_color="transparent")
        self.content_frame.grid(row=2, column=0, sticky="nsew")
        self.content_frame.grid_columnconfigure(0, weight=1)
        self.content_frame.grid_rowconfigure(0, weight=1)
        
        # List
        self.list_frame = ctk.CTkScrollableFrame(self.content_frame, fg_color="transparent")
        self.list_frame.grid(row=0, column=0, sticky="nsew")
        
        # Detail view
        self.detail_view = FormDetailView(
            self.content_frame,
            self._on_back_to_list,
            self.refresh
        )
        
        self._type_filter = None
    
    def refresh(self):
        """Refresh form list."""
        if self._showing_detail:
            return
        
        # Clear list
        for widget in self.list_frame.winfo_children():
            widget.destroy()
        
        db = get_db()
        with db.session() as session:
            query = session.query(FormSubmission)
            
            if self._current_filter != "all":
                query = query.filter_by(status=self._current_filter)
            
            if self._type_filter:
                query = query.filter_by(form_type=self._type_filter)
            
            forms = query.order_by(FormSubmission.submitted_at.desc()).limit(50).all()
            
            if not forms:
                empty_label = ctk.CTkLabel(
                    self.list_frame,
                    text="Geen werk opdrachten.\n\nWerk opdrachten van klanten worden hier\nautomatisch weergegeven zodra ze binnenkomen.",
                    text_color="gray50",
                    justify="center"
                )
                empty_label.pack(pady=50)
            else:
                for form in forms:
                    item = FormListItem(
                        self.list_frame,
                        form=form,
                        on_click=self._on_form_click
                    )
                    item.pack(fill="x", pady=2)
    
    def _set_filter(self, filter_value: str):
        """Set status filter."""
        self._current_filter = filter_value
        
        for value, btn in self.filter_buttons.items():
            if value == filter_value:
                btn.configure(fg_color=["#1a73e8", "#1a73e8"])
            else:
                btn.configure(fg_color="gray40")
        
        self.refresh()
    
    def _set_type_filter(self, type_value: str):
        """Set type filter."""
        if self._type_filter == type_value:
            self._type_filter = None
        else:
            self._type_filter = type_value
        
        for value, btn in self.type_buttons.items():
            if value == self._type_filter:
                btn.configure(fg_color=["#1a73e8", "#1a73e8"])
            else:
                btn.configure(fg_color="gray40")
        
        self.refresh()
    
    def _on_form_click(self, form: FormSubmission):
        """Handle form click."""
        self._showing_detail = True
        self.list_frame.grid_forget()
        self.detail_view.grid(row=0, column=0, sticky="nsew")
        self.detail_view.show_form(form)
    
    def _on_back_to_list(self):
        """Go back to list."""
        self._showing_detail = False
        self.detail_view.grid_forget()
        self.list_frame.grid(row=0, column=0, sticky="nsew")
        self.refresh()
    
    def _sync_orders(self):
        """Sync work orders from website."""
        from tkinter import messagebox
        from ..services.work_order_service import get_work_order_sync_service
        
        service = get_work_order_sync_service()
        synced, errors, msgs = service.sync_work_orders()
        
        self.refresh()
        
        if synced > 0:
            messagebox.showinfo("Sync", f"{synced} nieuwe werk opdrachten gesynchroniseerd!")
        elif errors > 0:
            messagebox.showwarning("Sync", f"Sync met fouten:\n" + "\n".join(msgs))
        else:
            messagebox.showinfo("Sync", "Geen nieuwe werk opdrachten gevonden.")
