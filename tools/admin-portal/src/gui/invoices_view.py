"""
Invoices View - Facturatie beheer.
Upload, download en export facturen voor Snelstart.
"""

import customtkinter as ctk
from tkinter import filedialog, messagebox
from typing import Optional, List
from datetime import datetime, date
from pathlib import Path
import shutil
import csv
import subprocess
import os

from ..database import get_db
from ..database.models import Invoice, InvoiceStatus, InvoiceType, Client
from ..utils.config import Config, logger
from ..utils.helpers import format_datetime, truncate_text
from ..services.payment_sync_service import get_payment_sync_service, get_payment_sync_scheduler
from ..services.snelstart_sync_service import get_snelstart_sync_service


# Create invoices directory
INVOICES_DIR = Config.DATA_DIR / "invoices"
INVOICES_DIR.mkdir(exist_ok=True)


class InvoiceListItem(ctk.CTkFrame):
    """Invoice list item widget."""
    
    STATUS_COLORS = {
        InvoiceStatus.DRAFT.value: "gray50",
        InvoiceStatus.SENT.value: "#1a73e8",
        InvoiceStatus.PAID.value: "#34a853",
        InvoiceStatus.OVERDUE.value: "#ea4335",
        InvoiceStatus.CANCELLED.value: "gray40",
    }
    
    def __init__(self, parent, invoice: Invoice, on_click: callable, **kwargs):
        super().__init__(parent, corner_radius=8, **kwargs)
        
        self.invoice = invoice
        self.on_click = on_click
        
        self.bind("<Button-1>", lambda e: on_click(invoice))
        self.configure(cursor="hand2")
        
        self._setup_ui()
    
    def _setup_ui(self):
        """Setup invoice item UI."""
        self.grid_columnconfigure(2, weight=1)
        
        # Status indicator
        status_color = self.STATUS_COLORS.get(self.invoice.status, "gray50")
        indicator = ctk.CTkFrame(
            self,
            width=4,
            fg_color=status_color,
            corner_radius=2
        )
        indicator.grid(row=0, column=0, rowspan=2, sticky="ns", padx=(0, 10), pady=5)
        
        # Type icon
        icon = "📤" if self.invoice.invoice_type == InvoiceType.OUTGOING.value else "📥"
        icon_label = ctk.CTkLabel(
            self,
            text=icon,
            font=ctk.CTkFont(size=18)
        )
        icon_label.grid(row=0, column=1, rowspan=2, padx=(0, 10))
        
        # Invoice number + Company
        company = self.invoice.company_name or (self.invoice.client.name if self.invoice.client else "Onbekend")
        
        top_label = ctk.CTkLabel(
            self,
            text=f"{self.invoice.invoice_number} - {company}",
            font=ctk.CTkFont(size=13, weight="bold"),
            anchor="w"
        )
        top_label.grid(row=0, column=2, sticky="w", pady=(8, 0))
        top_label.bind("<Button-1>", lambda e: self.on_click(self.invoice))
        
        # Description + Date
        desc = truncate_text(self.invoice.description or "", 40)
        date_str = self.invoice.invoice_date.strftime("%d-%m-%Y") if self.invoice.invoice_date else ""
        
        bottom_label = ctk.CTkLabel(
            self,
            text=f"{desc} • {date_str}",
            font=ctk.CTkFont(size=11),
            text_color="gray60",
            anchor="w"
        )
        bottom_label.grid(row=1, column=2, sticky="w", pady=(0, 8))
        bottom_label.bind("<Button-1>", lambda e: self.on_click(self.invoice))
        
        # Amount
        amount_label = ctk.CTkLabel(
            self,
            text=f"€ {self.invoice.amount_incl_vat:,.2f}",
            font=ctk.CTkFont(size=13, weight="bold"),
            text_color="#34a853" if self.invoice.invoice_type == InvoiceType.OUTGOING.value else "#ea4335"
        )
        amount_label.grid(row=0, column=3, rowspan=2, padx=(10, 15))
        
        # File indicator
        if self.invoice.file_path:
            file_label = ctk.CTkLabel(
                self,
                text="📄",
                font=ctk.CTkFont(size=14)
            )
            file_label.grid(row=0, column=4, rowspan=2, padx=(0, 5))
        
        # Snelstart sync indicator
        if self.invoice.invoice_type == InvoiceType.OUTGOING.value:
            sync_status = self.invoice.snelstart_sync_status
            if sync_status == "synced":
                sync_icon = "✓"
                sync_color = "#34a853"
            elif sync_status == "error":
                sync_icon = "⚠"
                sync_color = "#ea4335"
            elif sync_status == "pending":
                sync_icon = "⏳"
                sync_color = "#fbbc04"
            else:
                sync_icon = "○"
                sync_color = "gray50"
            
            sync_label = ctk.CTkLabel(
                self,
                text=sync_icon,
                font=ctk.CTkFont(size=12),
                text_color=sync_color,
                width=20
            )
            sync_label.grid(row=0, column=5, rowspan=2, padx=(0, 10))


class AddInvoiceDialog(ctk.CTkToplevel):
    """Dialog to add/edit invoice."""
    
    def __init__(self, parent, on_save: callable, invoice: Optional[Invoice] = None):
        super().__init__(parent)
        
        self.title("Factuur Toevoegen" if not invoice else "Factuur Bewerken")
        self.geometry("550x650")
        self.transient(parent)
        self.grab_set()
        
        self.on_save = on_save
        self.invoice = invoice
        self.selected_file: Optional[Path] = None
        
        self._setup_ui()
        
        if invoice:
            self._prefill()
    
    def _setup_ui(self):
        """Setup dialog UI."""
        self.grid_columnconfigure(0, weight=1)
        
        # Scrollable content
        content = ctk.CTkScrollableFrame(self, fg_color="transparent")
        content.pack(fill="both", expand=True, padx=20, pady=20)
        content.grid_columnconfigure(1, weight=1)
        
        row = 0
        
        # Type dropdown
        ctk.CTkLabel(content, text="Type:", width=100, anchor="w").grid(row=row, column=0, sticky="w", pady=5)
        self.type_var = ctk.StringVar(value=InvoiceType.OUTGOING.value)
        type_dropdown = ctk.CTkOptionMenu(
            content,
            values=[InvoiceType.OUTGOING.value, InvoiceType.INCOMING.value],
            variable=self.type_var,
            width=200
        )
        type_dropdown.grid(row=row, column=1, sticky="w", pady=5)
        row += 1
        
        # Invoice number
        ctk.CTkLabel(content, text="Factuurnr: *", width=100, anchor="w").grid(row=row, column=0, sticky="w", pady=5)
        self.number_entry = ctk.CTkEntry(content, placeholder_text="2024-001")
        self.number_entry.grid(row=row, column=1, sticky="ew", pady=5)
        row += 1
        
        # Company name
        ctk.CTkLabel(content, text="Bedrijf: *", width=100, anchor="w").grid(row=row, column=0, sticky="w", pady=5)
        self.company_entry = ctk.CTkEntry(content, placeholder_text="Klantnaam BV")
        self.company_entry.grid(row=row, column=1, sticky="ew", pady=5)
        row += 1
        
        # Description
        ctk.CTkLabel(content, text="Omschrijving:", width=100, anchor="w").grid(row=row, column=0, sticky="w", pady=5)
        self.description_entry = ctk.CTkEntry(content, placeholder_text="Website ontwikkeling")
        self.description_entry.grid(row=row, column=1, sticky="ew", pady=5)
        row += 1
        
        # Amount excl VAT
        ctk.CTkLabel(content, text="Bedrag excl:", width=100, anchor="w").grid(row=row, column=0, sticky="w", pady=5)
        amount_frame = ctk.CTkFrame(content, fg_color="transparent")
        amount_frame.grid(row=row, column=1, sticky="w", pady=5)
        ctk.CTkLabel(amount_frame, text="€").pack(side="left", padx=(0, 5))
        self.amount_entry = ctk.CTkEntry(amount_frame, width=120, placeholder_text="0.00")
        self.amount_entry.pack(side="left")
        self.amount_entry.bind("<FocusOut>", self._calculate_vat)
        row += 1
        
        # VAT percentage
        ctk.CTkLabel(content, text="BTW %:", width=100, anchor="w").grid(row=row, column=0, sticky="w", pady=5)
        self.vat_var = ctk.StringVar(value="21")
        vat_dropdown = ctk.CTkOptionMenu(
            content,
            values=["0", "9", "21"],
            variable=self.vat_var,
            width=80,
            command=lambda x: self._calculate_vat()
        )
        vat_dropdown.grid(row=row, column=1, sticky="w", pady=5)
        row += 1
        
        # VAT amount (calculated)
        ctk.CTkLabel(content, text="BTW bedrag:", width=100, anchor="w").grid(row=row, column=0, sticky="w", pady=5)
        self.vat_label = ctk.CTkLabel(content, text="€ 0.00", anchor="w")
        self.vat_label.grid(row=row, column=1, sticky="w", pady=5)
        row += 1
        
        # Total incl VAT
        ctk.CTkLabel(content, text="Totaal incl:", width=100, anchor="w").grid(row=row, column=0, sticky="w", pady=5)
        self.total_label = ctk.CTkLabel(content, text="€ 0.00", font=ctk.CTkFont(weight="bold"), anchor="w")
        self.total_label.grid(row=row, column=1, sticky="w", pady=5)
        row += 1
        
        # Invoice date
        ctk.CTkLabel(content, text="Factuurdatum:", width=100, anchor="w").grid(row=row, column=0, sticky="w", pady=5)
        self.date_entry = ctk.CTkEntry(content, placeholder_text="DD-MM-YYYY")
        self.date_entry.insert(0, datetime.now().strftime("%d-%m-%Y"))
        self.date_entry.grid(row=row, column=1, sticky="w", pady=5)
        row += 1
        
        # Due date
        ctk.CTkLabel(content, text="Vervaldatum:", width=100, anchor="w").grid(row=row, column=0, sticky="w", pady=5)
        self.due_date_entry = ctk.CTkEntry(content, placeholder_text="DD-MM-YYYY (optioneel)")
        self.due_date_entry.grid(row=row, column=1, sticky="w", pady=5)
        row += 1
        
        # Status
        ctk.CTkLabel(content, text="Status:", width=100, anchor="w").grid(row=row, column=0, sticky="w", pady=5)
        self.status_var = ctk.StringVar(value=InvoiceStatus.DRAFT.value)
        status_dropdown = ctk.CTkOptionMenu(
            content,
            values=[s.value for s in InvoiceStatus],
            variable=self.status_var,
            width=150
        )
        status_dropdown.grid(row=row, column=1, sticky="w", pady=5)
        row += 1
        
        # File upload
        ctk.CTkLabel(content, text="PDF bestand:", width=100, anchor="w").grid(row=row, column=0, sticky="w", pady=5)
        file_frame = ctk.CTkFrame(content, fg_color="transparent")
        file_frame.grid(row=row, column=1, sticky="ew", pady=5)
        
        self.file_label = ctk.CTkLabel(file_frame, text="Geen bestand", text_color="gray50")
        self.file_label.pack(side="left")
        
        upload_btn = ctk.CTkButton(
            file_frame,
            text="📁 Uploaden",
            width=100,
            command=self._select_file
        )
        upload_btn.pack(side="right")
        row += 1
        
        # Notes
        ctk.CTkLabel(content, text="Notities:", width=100, anchor="w").grid(row=row, column=0, sticky="nw", pady=5)
        self.notes_entry = ctk.CTkTextbox(content, height=60)
        self.notes_entry.grid(row=row, column=1, sticky="ew", pady=5)
        row += 1
        
        # Buttons
        button_frame = ctk.CTkFrame(self, fg_color="transparent")
        button_frame.pack(fill="x", padx=20, pady=20)
        
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
        """Prefill form with existing invoice data."""
        if not self.invoice:
            return
        
        self.type_var.set(self.invoice.invoice_type)
        self.number_entry.insert(0, self.invoice.invoice_number or "")
        self.company_entry.insert(0, self.invoice.company_name or "")
        self.description_entry.insert(0, self.invoice.description or "")
        self.amount_entry.insert(0, str(self.invoice.amount_excl_vat or 0))
        self.vat_var.set(str(int(self.invoice.vat_percentage or 21)))
        
        if self.invoice.invoice_date:
            self.date_entry.delete(0, "end")
            self.date_entry.insert(0, self.invoice.invoice_date.strftime("%d-%m-%Y"))
        
        if self.invoice.due_date:
            self.due_date_entry.insert(0, self.invoice.due_date.strftime("%d-%m-%Y"))
        
        self.status_var.set(self.invoice.status)
        
        if self.invoice.file_name:
            self.file_label.configure(text=self.invoice.file_name)
        
        if self.invoice.notes:
            self.notes_entry.insert("1.0", self.invoice.notes)
        
        self._calculate_vat()
    
    def _calculate_vat(self, event=None):
        """Calculate VAT and total."""
        try:
            amount = float(self.amount_entry.get() or 0)
            vat_pct = float(self.vat_var.get() or 0)
            
            vat_amount = round(amount * (vat_pct / 100), 2)
            total = round(amount + vat_amount, 2)
            
            self.vat_label.configure(text=f"€ {vat_amount:,.2f}")
            self.total_label.configure(text=f"€ {total:,.2f}")
        except ValueError:
            pass
    
    def _select_file(self):
        """Select PDF file."""
        file_path = filedialog.askopenfilename(
            title="Selecteer factuur PDF",
            filetypes=[("PDF bestanden", "*.pdf"), ("Alle bestanden", "*.*")]
        )
        
        if file_path:
            self.selected_file = Path(file_path)
            self.file_label.configure(text=self.selected_file.name)
    
    def _parse_date(self, date_str: str) -> Optional[datetime]:
        """Parse date string to datetime."""
        if not date_str:
            return None
        
        for fmt in ["%d-%m-%Y", "%d/%m/%Y", "%Y-%m-%d"]:
            try:
                return datetime.strptime(date_str.strip(), fmt)
            except ValueError:
                continue
        return None
    
    def _on_save(self):
        """Save invoice."""
        invoice_number = self.number_entry.get().strip()
        company_name = self.company_entry.get().strip()
        
        if not invoice_number or not company_name:
            messagebox.showwarning("Validatie", "Factuurnummer en bedrijf zijn verplicht.")
            return
        
        invoice_date = self._parse_date(self.date_entry.get())
        if not invoice_date:
            messagebox.showwarning("Validatie", "Ongeldige factuurdatum.")
            return
        
        try:
            amount_excl = float(self.amount_entry.get() or 0)
        except ValueError:
            messagebox.showwarning("Validatie", "Ongeldig bedrag.")
            return
        
        db = get_db()
        with db.session() as session:
            if self.invoice:
                invoice = session.query(Invoice).get(self.invoice.id)
            else:
                invoice = Invoice()
                session.add(invoice)
            
            invoice.invoice_type = self.type_var.get()
            invoice.invoice_number = invoice_number
            invoice.company_name = company_name
            invoice.description = self.description_entry.get().strip() or None
            invoice.amount_excl_vat = amount_excl
            invoice.vat_percentage = float(self.vat_var.get())
            invoice.calculate_vat()
            invoice.invoice_date = invoice_date
            invoice.due_date = self._parse_date(self.due_date_entry.get())
            invoice.status = self.status_var.get()
            invoice.notes = self.notes_entry.get("1.0", "end").strip() or None
            
            # Handle file upload
            if self.selected_file:
                # Copy file to invoices directory
                year_dir = INVOICES_DIR / str(invoice_date.year)
                year_dir.mkdir(exist_ok=True)
                
                dest_filename = f"{invoice_number.replace('/', '-')}_{self.selected_file.name}"
                dest_path = year_dir / dest_filename
                
                shutil.copy2(self.selected_file, dest_path)
                
                invoice.file_path = str(dest_path)
                invoice.file_name = dest_filename
            
            session.commit()
            logger.info(f"Invoice saved: {invoice_number}")
        
        self.on_save()
        self.destroy()


class InvoiceDetailView(ctk.CTkFrame):
    """Invoice detail view."""
    
    def __init__(self, parent, on_back: callable, on_refresh: callable):
        super().__init__(parent, fg_color="transparent")
        
        self.on_back = on_back
        self.on_refresh = on_refresh
        self.current_invoice: Optional[Invoice] = None
        
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
        
        # Actions
        self.download_btn = ctk.CTkButton(
            header_frame,
            text="📥 Download PDF",
            width=130,
            command=self._on_download
        )
        self.download_btn.pack(side="right", padx=(10, 0))
        
        edit_btn = ctk.CTkButton(
            header_frame,
            text="✏️ Bewerken",
            width=100,
            fg_color="gray40",
            command=self._on_edit
        )
        edit_btn.pack(side="right", padx=(10, 0))
        
        delete_btn = ctk.CTkButton(
            header_frame,
            text="🗑️",
            width=40,
            fg_color="#ea4335",
            hover_color="#d33426",
            command=self._on_delete
        )
        delete_btn.pack(side="right")
        
        # Info card
        info_frame = ctk.CTkFrame(self, corner_radius=12)
        info_frame.grid(row=1, column=0, sticky="ew", pady=(0, 15))
        info_frame.grid_columnconfigure(1, weight=1)
        
        # Invoice number (header)
        self.number_label = ctk.CTkLabel(
            info_frame,
            text="",
            font=ctk.CTkFont(size=20, weight="bold"),
            anchor="w"
        )
        self.number_label.grid(row=0, column=0, columnspan=2, sticky="w", padx=20, pady=(15, 10))
        
        # Fields
        fields = [
            ("Type:", "type_label"),
            ("Bedrijf:", "company_label"),
            ("Omschrijving:", "desc_label"),
            ("Bedrag excl:", "amount_excl_label"),
            ("BTW:", "vat_label"),
            ("Totaal incl:", "total_label"),
            ("Factuurdatum:", "date_label"),
            ("Vervaldatum:", "due_label"),
            ("Status:", "status_label"),
            ("PDF:", "file_label"),
        ]
        
        for i, (title, attr) in enumerate(fields):
            row = i + 1
            
            ctk.CTkLabel(
                info_frame,
                text=title,
                font=ctk.CTkFont(size=12),
                text_color="gray50",
                width=100,
                anchor="w"
            ).grid(row=row, column=0, sticky="w", padx=(20, 5), pady=3)
            
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
        
        # Action buttons frame
        action_btns_frame = ctk.CTkFrame(info_frame, fg_color="transparent")
        action_btns_frame.grid(row=len(fields) + 2, column=0, columnspan=2, sticky="w", padx=20, pady=(10, 20))
        
        # Mark as paid button
        self.paid_btn = ctk.CTkButton(
            action_btns_frame,
            text="✅ Markeer als Betaald",
            fg_color="#34a853",
            hover_color="#2d8f47",
            command=self._mark_as_paid
        )
        self.paid_btn.pack(side="left", padx=(0, 10))
        
        # Snelstart sync button
        self.snelstart_btn = ctk.CTkButton(
            action_btns_frame,
            text="📊 Push naar Snelstart",
            fg_color="#1a73e8",
            hover_color="#1557b0",
            command=self._push_to_snelstart
        )
        self.snelstart_btn.pack(side="left")
    
    def show_invoice(self, invoice: Invoice):
        """Display invoice details."""
        self.current_invoice = invoice
        
        self.number_label.configure(text=f"Factuur {invoice.invoice_number}")
        
        type_label = "📤 Uitgaand (Verkoop)" if invoice.invoice_type == InvoiceType.OUTGOING.value else "📥 Inkomend (Inkoop)"
        self.type_label.configure(text=type_label)
        
        self.company_label.configure(text=invoice.company_name or "-")
        self.desc_label.configure(text=invoice.description or "-")
        self.amount_excl_label.configure(text=f"€ {invoice.amount_excl_vat:,.2f}")
        self.vat_label.configure(text=f"€ {invoice.vat_amount:,.2f} ({invoice.vat_percentage:.0f}%)")
        self.total_label.configure(text=f"€ {invoice.amount_incl_vat:,.2f}")
        self.date_label.configure(text=invoice.invoice_date.strftime("%d-%m-%Y") if invoice.invoice_date else "-")
        self.due_label.configure(text=invoice.due_date.strftime("%d-%m-%Y") if invoice.due_date else "-")
        
        status_labels = {
            InvoiceStatus.DRAFT.value: "Concept",
            InvoiceStatus.SENT.value: "Verzonden",
            InvoiceStatus.PAID.value: "Betaald",
            InvoiceStatus.OVERDUE.value: "Verlopen",
            InvoiceStatus.CANCELLED.value: "Geannuleerd",
        }
        self.status_label.configure(text=status_labels.get(invoice.status, invoice.status))
        
        if invoice.file_name:
            self.file_label.configure(text=f"📄 {invoice.file_name}")
            self.download_btn.configure(state="normal")
        else:
            self.file_label.configure(text="Geen bestand")
            self.download_btn.configure(state="disabled")
        
        # Hide paid button if already paid
        if invoice.status == InvoiceStatus.PAID.value:
            self.paid_btn.configure(text="✅ Betaald", state="disabled")
        else:
            self.paid_btn.configure(text="✅ Markeer als Betaald", state="normal")
        
        # Update Snelstart button based on sync status
        if invoice.invoice_type == InvoiceType.OUTGOING.value:
            self.snelstart_btn.pack(side="left")
            if invoice.snelstart_sync_status == "synced":
                self.snelstart_btn.configure(
                    text="✓ Gesynchroniseerd", 
                    state="disabled",
                    fg_color="gray40"
                )
            elif invoice.snelstart_sync_status == "error":
                self.snelstart_btn.configure(
                    text="⚠️ Opnieuw proberen",
                    state="normal",
                    fg_color="#ea4335",
                    hover_color="#d33426"
                )
            else:
                self.snelstart_btn.configure(
                    text="📊 Push naar Snelstart",
                    state="normal",
                    fg_color="#1a73e8",
                    hover_color="#1557b0"
                )
        else:
            # Hide for incoming invoices
            self.snelstart_btn.pack_forget()
    
    def _on_download(self):
        """Download invoice PDF."""
        if not self.current_invoice or not self.current_invoice.file_path:
            return
        
        file_path = Path(self.current_invoice.file_path)
        if file_path.exists():
            # Open file location or file itself
            if os.name == 'nt':  # Windows
                os.startfile(file_path)
            else:
                subprocess.run(['xdg-open', str(file_path)])
        else:
            messagebox.showerror("Fout", "Bestand niet gevonden.")
    
    def _on_edit(self):
        """Edit invoice."""
        if self.current_invoice:
            def on_save():
                self.on_refresh()
                db = get_db()
                with db.session() as session:
                    inv = session.query(Invoice).get(self.current_invoice.id)
                    if inv:
                        self.show_invoice(inv)
            
            AddInvoiceDialog(self, on_save, self.current_invoice)
    
    def _on_delete(self):
        """Delete invoice."""
        if self.current_invoice:
            if messagebox.askyesno(
                "Verwijderen",
                f"Weet je zeker dat je factuur '{self.current_invoice.invoice_number}' wilt verwijderen?"
            ):
                db = get_db()
                with db.session() as session:
                    inv = session.query(Invoice).get(self.current_invoice.id)
                    session.delete(inv)
                    session.commit()
                logger.info(f"Invoice deleted: {self.current_invoice.invoice_number}")
                self.on_back()
                self.on_refresh()
    
    def _mark_as_paid(self):
        """Mark invoice as paid."""
        if self.current_invoice:
            db = get_db()
            with db.session() as session:
                inv = session.query(Invoice).get(self.current_invoice.id)
                inv.status = InvoiceStatus.PAID.value
                inv.paid_date = datetime.now()
                session.commit()
            
            logger.info(f"Invoice marked as paid: {self.current_invoice.invoice_number}")
            self.on_refresh()
            
            # Reload
            db = get_db()
            with db.session() as session:
                inv = session.query(Invoice).get(self.current_invoice.id)
                self.show_invoice(inv)
    
    def _push_to_snelstart(self):
        """Push invoice to Snelstart."""
        if not self.current_invoice:
            return
        
        if not Config.is_snelstart_configured():
            messagebox.showwarning(
                "Niet Geconfigureerd",
                "Snelstart API is niet geconfigureerd.\n\n"
                "Ga naar Snelstart Integratie om de configuratie te bekijken."
            )
            return
        
        # Check if invoice has a linked client
        if not self.current_invoice.client_id:
            messagebox.showwarning(
                "Geen Klant Gekoppeld",
                "Deze factuur heeft geen gekoppelde klant.\n\n"
                "Koppel eerst een klant aan deze factuur om te synchroniseren naar Snelstart."
            )
            return
        
        self.snelstart_btn.configure(state="disabled", text="⏳ Bezig...")
        
        import threading
        
        def do_sync():
            sync_service = get_snelstart_sync_service()
            
            # Reload invoice from database
            db = get_db()
            with db.session() as session:
                invoice = session.query(Invoice).get(self.current_invoice.id)
                success, result = sync_service.sync_invoice_to_snelstart(invoice)
            
            self.after(0, lambda: self._on_snelstart_sync_complete(success, result))
        
        threading.Thread(target=do_sync, daemon=True).start()
    
    def _on_snelstart_sync_complete(self, success: bool, result: str):
        """Handle Snelstart sync completion."""
        self.on_refresh()
        
        # Reload invoice
        db = get_db()
        with db.session() as session:
            inv = session.query(Invoice).get(self.current_invoice.id)
            self.show_invoice(inv)
        
        if success:
            messagebox.showinfo(
                "Synchronisatie Voltooid",
                f"Factuur succesvol gesynchroniseerd naar Snelstart!\n\n"
                f"Snelstart ID: {result}"
            )
        else:
            messagebox.showerror(
                "Synchronisatie Mislukt",
                f"Kon factuur niet synchroniseren:\n\n{result}"
            )


class InvoicesView(ctk.CTkFrame):
    """Invoices main view."""
    
    def __init__(self, parent):
        super().__init__(parent, fg_color="transparent")
        
        self.grid_columnconfigure(0, weight=1)
        self.grid_rowconfigure(2, weight=1)
        
        self._showing_detail = False
        self._current_filter = "all"
        self._type_filter = None
        
        self._setup_ui()
    
    def _setup_ui(self):
        """Setup invoices view UI."""
        # Header
        header_frame = ctk.CTkFrame(self, fg_color="transparent")
        header_frame.grid(row=0, column=0, sticky="ew", pady=(0, 15))
        header_frame.grid_columnconfigure(1, weight=1)
        
        title = ctk.CTkLabel(
            header_frame,
            text="📄 Facturatie",
            font=ctk.CTkFont(size=24, weight="bold"),
            anchor="w"
        )
        title.grid(row=0, column=0, sticky="w")
        
        # Action buttons
        actions_frame = ctk.CTkFrame(header_frame, fg_color="transparent")
        actions_frame.grid(row=0, column=1, sticky="e")
        
        # Auto-sync status indicator
        self.sync_status_label = ctk.CTkLabel(
            actions_frame,
            text="",
            font=ctk.CTkFont(size=11),
            text_color="gray50"
        )
        self.sync_status_label.pack(side="left", padx=(0, 10))
        
        # Sync from website button
        self.sync_btn = ctk.CTkButton(
            actions_frame,
            text="🔄 Sync Nu",
            width=100,
            fg_color="#1a73e8",
            hover_color="#1557b0",
            command=self._sync_from_website
        )
        self.sync_btn.pack(side="left", padx=(0, 10))
        
        export_btn = ctk.CTkButton(
            actions_frame,
            text="📊 Export CSV",
            width=110,
            fg_color="gray40",
            command=self._export_csv
        )
        export_btn.pack(side="left", padx=(0, 10))
        
        add_btn = ctk.CTkButton(
            actions_frame,
            text="+ Nieuwe Factuur",
            fg_color="#34a853",
            hover_color="#2d8f47",
            command=self._on_add
        )
        add_btn.pack(side="left")
        
        # Filters
        filter_frame = ctk.CTkFrame(self, fg_color="transparent")
        filter_frame.grid(row=1, column=0, sticky="ew", pady=(0, 10))
        
        # Status filters
        status_filters = [
            ("Alle", "all"),
            ("Concept", InvoiceStatus.DRAFT.value),
            ("Verzonden", InvoiceStatus.SENT.value),
            ("Betaald", InvoiceStatus.PAID.value),
            ("Verlopen", InvoiceStatus.OVERDUE.value),
        ]
        
        self.filter_buttons = {}
        for text, value in status_filters:
            btn = ctk.CTkButton(
                filter_frame,
                text=text,
                width=85,
                height=30,
                fg_color="gray40" if value != "all" else None,
                command=lambda v=value: self._set_filter(v)
            )
            btn.pack(side="left", padx=2)
            self.filter_buttons[value] = btn
        
        # Type filter separator
        ctk.CTkLabel(filter_frame, text="│", text_color="gray50").pack(side="left", padx=10)
        
        # Type filters
        type_filters = [
            ("📤 Uitgaand", InvoiceType.OUTGOING.value),
            ("📥 Inkomend", InvoiceType.INCOMING.value),
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
        self.detail_view = InvoiceDetailView(
            self.content_frame,
            self._on_back_to_list,
            self.refresh
        )
    
    def refresh(self):
        """Refresh invoices list."""
        if self._showing_detail:
            return
        
        # Update sync status
        self._update_sync_status()
        
        # Clear list
        for widget in self.list_frame.winfo_children():
            widget.destroy()
        
        db = get_db()
        with db.session() as session:
            query = session.query(Invoice)
            
            if self._current_filter != "all":
                query = query.filter_by(status=self._current_filter)
            
            if self._type_filter:
                query = query.filter_by(invoice_type=self._type_filter)
            
            invoices = query.order_by(Invoice.invoice_date.desc()).limit(100).all()
            
            if not invoices:
                empty_label = ctk.CTkLabel(
                    self.list_frame,
                    text="Geen facturen gevonden.\n\nKlik op '+ Nieuwe Factuur' om te beginnen.",
                    text_color="gray50",
                    justify="center"
                )
                empty_label.pack(pady=50)
            else:
                # Calculate totals
                total_out = sum(i.amount_incl_vat for i in invoices if i.invoice_type == InvoiceType.OUTGOING.value)
                total_in = sum(i.amount_incl_vat for i in invoices if i.invoice_type == InvoiceType.INCOMING.value)
                
                # Summary bar
                summary = ctk.CTkFrame(self.list_frame, corner_radius=8, fg_color=("gray85", "gray20"))
                summary.pack(fill="x", pady=(0, 10))
                
                ctk.CTkLabel(
                    summary,
                    text=f"📤 Uitgaand: € {total_out:,.2f}",
                    font=ctk.CTkFont(size=12),
                    text_color="#34a853"
                ).pack(side="left", padx=15, pady=8)
                
                ctk.CTkLabel(
                    summary,
                    text=f"📥 Inkomend: € {total_in:,.2f}",
                    font=ctk.CTkFont(size=12),
                    text_color="#ea4335"
                ).pack(side="left", padx=15, pady=8)
                
                ctk.CTkLabel(
                    summary,
                    text=f"Saldo: € {total_out - total_in:,.2f}",
                    font=ctk.CTkFont(size=12, weight="bold")
                ).pack(side="right", padx=15, pady=8)
                
                for invoice in invoices:
                    item = InvoiceListItem(
                        self.list_frame,
                        invoice=invoice,
                        on_click=self._on_invoice_click
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
    
    def _on_invoice_click(self, invoice: Invoice):
        """Handle invoice click."""
        self._showing_detail = True
        self.list_frame.grid_forget()
        self.detail_view.grid(row=0, column=0, sticky="nsew")
        self.detail_view.show_invoice(invoice)
    
    def _on_back_to_list(self):
        """Go back to list."""
        self._showing_detail = False
        self.detail_view.grid_forget()
        self.list_frame.grid(row=0, column=0, sticky="nsew")
        self.refresh()
    
    def _update_sync_status(self):
        """Update the auto-sync status indicator."""
        try:
            scheduler = get_payment_sync_scheduler()
            if scheduler.is_running:
                last_sync = scheduler.last_sync
                if last_sync:
                    time_ago = datetime.now() - last_sync
                    if time_ago.seconds < 60:
                        status = f"✓ Auto-sync actief (zojuist)"
                    elif time_ago.seconds < 3600:
                        mins = time_ago.seconds // 60
                        status = f"✓ Auto-sync actief ({mins}m geleden)"
                    else:
                        status = f"✓ Auto-sync actief ({last_sync.strftime('%H:%M')})"
                else:
                    status = "✓ Auto-sync actief"
                self.sync_status_label.configure(text=status, text_color="#34a853")
            else:
                self.sync_status_label.configure(text="Auto-sync uit", text_color="gray50")
        except Exception:
            self.sync_status_label.configure(text="", text_color="gray50")
    
    def _on_add(self):
        """Add new invoice."""
        AddInvoiceDialog(self, self.refresh)
    
    def _sync_from_website(self):
        """Sync payments from website and create invoices."""
        import threading
        
        # Disable button during sync
        self.sync_btn.configure(state="disabled", text="⏳ Synchroniseren...")
        
        def do_sync():
            try:
                sync_service = get_payment_sync_service()
                synced, errors, error_messages = sync_service.sync_payments()
                
                # Update UI on main thread
                self.after(0, lambda: self._on_sync_complete(synced, errors, error_messages))
            except Exception as e:
                logger.error(f"Sync failed: {e}")
                self.after(0, lambda: self._on_sync_error(str(e)))
        
        # Run sync in background thread
        thread = threading.Thread(target=do_sync, daemon=True)
        thread.start()
    
    def _on_sync_complete(self, synced: int, errors: int, error_messages: list):
        """Handle sync completion."""
        self.sync_btn.configure(state="normal", text="🔄 Sync Website")
        
        if synced > 0 or errors > 0:
            message = f"✅ {synced} betaling(en) geïmporteerd als factuur"
            if errors > 0:
                message += f"\n⚠️ {errors} fout(en):\n" + "\n".join(error_messages[:5])
            
            messagebox.showinfo("Sync Voltooid", message)
            self.refresh()
        else:
            messagebox.showinfo("Sync Voltooid", "Geen nieuwe betalingen om te synchroniseren.")
    
    def _on_sync_error(self, error: str):
        """Handle sync error."""
        self.sync_btn.configure(state="normal", text="🔄 Sync Website")
        messagebox.showerror("Sync Fout", f"Kon niet synchroniseren met website:\n{error}")
    
    def _export_csv(self):
        """Export invoices to CSV for Snelstart."""
        # Ask for save location
        file_path = filedialog.asksaveasfilename(
            title="Exporteer facturen",
            defaultextension=".csv",
            initialfilename=f"facturen_export_{datetime.now().strftime('%Y%m%d')}.csv",
            filetypes=[("CSV bestanden", "*.csv")]
        )
        
        if not file_path:
            return
        
        db = get_db()
        with db.session() as session:
            query = session.query(Invoice)
            
            if self._current_filter != "all":
                query = query.filter_by(status=self._current_filter)
            
            if self._type_filter:
                query = query.filter_by(invoice_type=self._type_filter)
            
            invoices = query.order_by(Invoice.invoice_date.desc()).all()
            
            if not invoices:
                messagebox.showinfo("Export", "Geen facturen om te exporteren.")
                return
            
            # Write CSV
            with open(file_path, 'w', newline='', encoding='utf-8-sig') as f:
                writer = csv.writer(f, delimiter=';')
                
                # Header (Snelstart compatible)
                writer.writerow([
                    'Factuurnummer',
                    'Type',
                    'Bedrijfsnaam',
                    'Omschrijving',
                    'Factuurdatum',
                    'Vervaldatum',
                    'Bedrag excl BTW',
                    'BTW %',
                    'BTW bedrag',
                    'Totaal incl BTW',
                    'Status',
                    'Betaald op'
                ])
                
                for inv in invoices:
                    writer.writerow([
                        inv.invoice_number,
                        'Verkoop' if inv.invoice_type == InvoiceType.OUTGOING.value else 'Inkoop',
                        inv.company_name or '',
                        inv.description or '',
                        inv.invoice_date.strftime('%d-%m-%Y') if inv.invoice_date else '',
                        inv.due_date.strftime('%d-%m-%Y') if inv.due_date else '',
                        f"{inv.amount_excl_vat:.2f}".replace('.', ','),
                        f"{inv.vat_percentage:.0f}",
                        f"{inv.vat_amount:.2f}".replace('.', ','),
                        f"{inv.amount_incl_vat:.2f}".replace('.', ','),
                        inv.status,
                        inv.paid_date.strftime('%d-%m-%Y') if inv.paid_date else ''
                    ])
            
            # Mark as exported
            for inv in invoices:
                inv.exported_to_snelstart = True
                inv.exported_at = datetime.now()
            session.commit()
        
        messagebox.showinfo(
            "Export Voltooid",
            f"✅ {len(invoices)} facturen geëxporteerd naar:\n{file_path}"
        )
        logger.info(f"Exported {len(invoices)} invoices to {file_path}")
        
        # Open file location
        if os.name == 'nt':
            os.startfile(Path(file_path).parent)
