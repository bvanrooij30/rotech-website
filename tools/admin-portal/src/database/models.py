"""
SQLAlchemy Models voor Ro-Tech Admin Portal.
Alle database tabellen en relaties.
"""

from datetime import datetime
from typing import Optional, List
from sqlalchemy import (
    Column, Integer, String, Text, Boolean, Float, DateTime, 
    ForeignKey, Enum, create_engine
)
from sqlalchemy.orm import relationship, DeclarativeBase
import enum


class Base(DeclarativeBase):
    """Base class voor alle models."""
    pass


# =============================================================================
# ENUMS
# =============================================================================

class FormType(str, enum.Enum):
    CONTACT = "contact"
    OFFERTE = "offerte"
    QUOTE = "quote"


class FormStatus(str, enum.Enum):
    NEW = "new"
    IN_PROGRESS = "in_progress"
    DONE = "done"
    ARCHIVED = "archived"


class LeadStatus(str, enum.Enum):
    NEW = "new"
    CONTACTED = "contacted"
    QUALIFIED = "qualified"
    CONVERTED = "converted"
    LOST = "lost"


class ClientStatus(str, enum.Enum):
    PROSPECT = "prospect"
    ACTIVE = "active"
    INACTIVE = "inactive"


class ProjectStatus(str, enum.Enum):
    QUOTE = "quote"
    ACTIVE = "active"
    PAUSED = "paused"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class InvoiceStatus(str, enum.Enum):
    DRAFT = "draft"
    SENT = "sent"
    PAID = "paid"
    OVERDUE = "overdue"
    CANCELLED = "cancelled"


class InvoiceType(str, enum.Enum):
    OUTGOING = "outgoing"  # Facturen die je verstuurt (verkoop)
    INCOMING = "incoming"  # Facturen die je ontvangt (inkoop)


# =============================================================================
# EMAIL MODELS
# =============================================================================

class EmailAccount(Base):
    """Email account configuratie."""
    __tablename__ = "email_accounts"
    
    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)  # "Contact", "Facturen"
    email = Column(String(255), unique=True, nullable=False)
    
    # IMAP settings
    imap_host = Column(String(255), nullable=False)
    imap_port = Column(Integer, default=993)
    
    # SMTP settings
    smtp_host = Column(String(255), nullable=False)
    smtp_port = Column(Integer, default=587)
    
    # Credentials (encrypted)
    username = Column(String(255), nullable=False)
    password_encrypted = Column(String(500), nullable=False)
    
    # Status
    is_active = Column(Boolean, default=True)
    last_sync = Column(DateTime, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relations
    emails = relationship("Email", back_populates="account", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<EmailAccount {self.name}: {self.email}>"


class Email(Base):
    """Email bericht."""
    __tablename__ = "emails"
    
    id = Column(Integer, primary_key=True)
    message_id = Column(String(255), unique=True, nullable=False)
    thread_id = Column(String(255), nullable=True)
    
    # Account
    account_id = Column(Integer, ForeignKey("email_accounts.id"), nullable=False)
    account = relationship("EmailAccount", back_populates="emails")
    
    # Headers
    from_address = Column(String(255), nullable=False)
    from_name = Column(String(255), nullable=True)
    to_address = Column(String(255), nullable=False)
    cc = Column(Text, nullable=True)
    subject = Column(String(500), nullable=True)
    
    # Content
    body_text = Column(Text, nullable=True)
    body_html = Column(Text, nullable=True)
    
    # Status
    is_read = Column(Boolean, default=False)
    is_starred = Column(Boolean, default=False)
    is_archived = Column(Boolean, default=False)
    folder = Column(String(50), default="inbox")  # inbox, sent, drafts, trash
    
    # Timestamps
    sent_at = Column(DateTime, nullable=False)
    received_at = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relations
    attachments = relationship("Attachment", back_populates="email", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Email {self.subject[:30]}...>"


class Attachment(Base):
    """Email bijlage."""
    __tablename__ = "attachments"
    
    id = Column(Integer, primary_key=True)
    email_id = Column(Integer, ForeignKey("emails.id"), nullable=False)
    email = relationship("Email", back_populates="attachments")
    
    filename = Column(String(255), nullable=False)
    mime_type = Column(String(100), nullable=True)
    size = Column(Integer, default=0)  # bytes
    file_path = Column(String(500), nullable=False)  # lokaal pad
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f"<Attachment {self.filename}>"


# =============================================================================
# FORM SUBMISSIONS
# =============================================================================

class FormSubmission(Base):
    """Website formulier inzending."""
    __tablename__ = "form_submissions"
    
    id = Column(Integer, primary_key=True)
    
    # Type & Status
    form_type = Column(String(20), default=FormType.CONTACT.value)
    status = Column(String(20), default=FormStatus.NEW.value)
    
    # Contact info
    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False)
    phone = Column(String(50), nullable=True)
    company = Column(String(255), nullable=True)
    
    # Content
    subject = Column(String(255), nullable=True)
    message = Column(Text, nullable=False)
    
    # Meta
    source = Column(String(50), default="website")
    ip_address = Column(String(50), nullable=True)
    
    # Timestamps
    submitted_at = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relations
    client_id = Column(Integer, ForeignKey("clients.id"), nullable=True)
    client = relationship("Client", back_populates="form_submissions")
    notes = relationship("Note", back_populates="form_submission", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<FormSubmission {self.form_type}: {self.name}>"


# =============================================================================
# LEADS
# =============================================================================

class Lead(Base):
    """Lead van lead-finder of handmatig."""
    __tablename__ = "leads"
    
    id = Column(Integer, primary_key=True)
    
    # Status
    status = Column(String(20), default=LeadStatus.NEW.value)
    
    # Business info
    business_name = Column(String(255), nullable=False)
    address = Column(String(500), nullable=True)
    city = Column(String(100), nullable=True)
    phone = Column(String(50), nullable=True)
    email = Column(String(255), nullable=True)
    website = Column(String(500), nullable=True)
    
    # Scoring
    lead_score = Column(Float, default=0.0)
    has_website = Column(Boolean, default=False)
    website_quality = Column(String(20), nullable=True)  # none, poor, average, good
    
    # Categories
    category = Column(String(100), nullable=True)
    search_query = Column(String(255), nullable=True)
    
    # Import meta
    import_batch = Column(String(50), nullable=True)
    source_file = Column(String(255), nullable=True)
    imported_at = Column(DateTime, default=datetime.utcnow)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relations
    client_id = Column(Integer, ForeignKey("clients.id"), nullable=True)
    client = relationship("Client", back_populates="leads")
    notes = relationship("Note", back_populates="lead", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Lead {self.business_name}>"


# =============================================================================
# CRM
# =============================================================================

class Client(Base):
    """Klant in CRM."""
    __tablename__ = "clients"
    
    id = Column(Integer, primary_key=True)
    
    # Basic info
    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=True)
    phone = Column(String(50), nullable=True)
    company = Column(String(255), nullable=True)
    address = Column(Text, nullable=True)
    
    # Status
    status = Column(String(20), default=ClientStatus.PROSPECT.value)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relations
    form_submissions = relationship("FormSubmission", back_populates="client")
    leads = relationship("Lead", back_populates="client")
    projects = relationship("Project", back_populates="client", cascade="all, delete-orphan")
    invoices = relationship("Invoice", back_populates="client")
    notes = relationship("Note", back_populates="client", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Client {self.name}>"


class Project(Base):
    """Project voor een klant."""
    __tablename__ = "projects"
    
    id = Column(Integer, primary_key=True)
    
    # Client
    client_id = Column(Integer, ForeignKey("clients.id"), nullable=False)
    client = relationship("Client", back_populates="projects")
    
    # Details
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String(20), default=ProjectStatus.QUOTE.value)
    budget = Column(Float, nullable=True)
    
    # Dates
    start_date = Column(DateTime, nullable=True)
    end_date = Column(DateTime, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f"<Project {self.name}>"


# =============================================================================
# INVOICES
# =============================================================================

class Invoice(Base):
    """Factuur (inkomend of uitgaand)."""
    __tablename__ = "invoices"
    
    id = Column(Integer, primary_key=True)
    
    # Type & Status
    invoice_type = Column(String(20), default=InvoiceType.OUTGOING.value)  # outgoing/incoming
    status = Column(String(20), default=InvoiceStatus.DRAFT.value)
    
    # Invoice details
    invoice_number = Column(String(50), nullable=False)
    reference = Column(String(100), nullable=True)  # PO number, reference
    
    # Client/Vendor info
    client_id = Column(Integer, ForeignKey("clients.id"), nullable=True)
    client = relationship("Client", back_populates="invoices")
    company_name = Column(String(255), nullable=True)  # If no client linked
    
    # Description
    description = Column(Text, nullable=True)
    
    # Amounts (in EUR)
    amount_excl_vat = Column(Float, default=0.0)
    vat_percentage = Column(Float, default=21.0)
    vat_amount = Column(Float, default=0.0)
    amount_incl_vat = Column(Float, default=0.0)
    
    # Dates
    invoice_date = Column(DateTime, nullable=False)
    due_date = Column(DateTime, nullable=True)
    paid_date = Column(DateTime, nullable=True)
    
    # File
    file_path = Column(String(500), nullable=True)  # Path to PDF
    file_name = Column(String(255), nullable=True)
    
    # Notes
    notes = Column(Text, nullable=True)
    
    # Snelstart export
    exported_to_snelstart = Column(Boolean, default=False)
    exported_at = Column(DateTime, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f"<Invoice {self.invoice_number}>"
    
    def calculate_vat(self):
        """Calculate VAT and total from excl amount."""
        self.vat_amount = round(self.amount_excl_vat * (self.vat_percentage / 100), 2)
        self.amount_incl_vat = round(self.amount_excl_vat + self.vat_amount, 2)


class Note(Base):
    """Notitie, gekoppeld aan form/lead/client."""
    __tablename__ = "notes"
    
    id = Column(Integer, primary_key=True)
    content = Column(Text, nullable=False)
    
    # Polymorphic relations (één van deze is gevuld)
    form_submission_id = Column(Integer, ForeignKey("form_submissions.id"), nullable=True)
    form_submission = relationship("FormSubmission", back_populates="notes")
    
    lead_id = Column(Integer, ForeignKey("leads.id"), nullable=True)
    lead = relationship("Lead", back_populates="notes")
    
    client_id = Column(Integer, ForeignKey("clients.id"), nullable=True)
    client = relationship("Client", back_populates="notes")
    
    # Timestamp
    created_at = Column(DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f"<Note {self.content[:30]}...>"


# =============================================================================
# SYSTEM
# =============================================================================

class Setting(Base):
    """Applicatie settings."""
    __tablename__ = "settings"
    
    id = Column(Integer, primary_key=True)
    key = Column(String(100), unique=True, nullable=False)
    value = Column(Text, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f"<Setting {self.key}>"
