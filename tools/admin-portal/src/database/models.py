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
# MONITORING & TROUBLESHOOTING
# =============================================================================

class ProjectType(str, enum.Enum):
    WEBSITE = "website"
    API = "api"
    BOT = "bot"
    AUTOMATION = "automation"
    DATABASE = "database"
    OTHER = "other"


class HealthStatus(str, enum.Enum):
    HEALTHY = "healthy"
    DEGRADED = "degraded"
    DOWN = "down"
    UNKNOWN = "unknown"


class IssueSeverity(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class IssueStatus(str, enum.Enum):
    OPEN = "open"
    INVESTIGATING = "investigating"
    FIXING = "fixing"
    RESOLVED = "resolved"
    WONT_FIX = "wont_fix"


class MonitoredProject(Base):
    """Project dat gemonitord wordt door de AI agent."""
    __tablename__ = "monitored_projects"
    
    id = Column(Integer, primary_key=True)
    
    # Basic info
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    project_type = Column(String(20), default=ProjectType.WEBSITE.value)
    
    # Client link (optional)
    client_id = Column(Integer, ForeignKey("clients.id"), nullable=True)
    client = relationship("Client")
    
    # Monitoring config
    url = Column(String(500), nullable=True)  # Main URL to check
    health_endpoint = Column(String(500), nullable=True)  # /api/health endpoint
    
    # Check intervals (in seconds)
    check_interval = Column(Integer, default=300)  # Default 5 minutes
    
    # Alert config
    alert_on_down = Column(Boolean, default=True)
    alert_email = Column(String(255), nullable=True)
    
    # Thresholds
    response_time_warning = Column(Integer, default=2000)  # ms
    response_time_critical = Column(Integer, default=5000)  # ms
    
    # Project paths (for auto-fix capabilities)
    local_path = Column(String(500), nullable=True)  # Path on server
    git_repo = Column(String(500), nullable=True)  # Git repository URL
    deploy_command = Column(String(500), nullable=True)  # Command to redeploy
    restart_command = Column(String(500), nullable=True)  # Command to restart
    
    # Status
    is_active = Column(Boolean, default=True)
    current_status = Column(String(20), default=HealthStatus.UNKNOWN.value)
    last_check = Column(DateTime, nullable=True)
    last_response_time = Column(Integer, nullable=True)  # ms
    uptime_percentage = Column(Float, default=100.0)
    
    # Stats
    total_checks = Column(Integer, default=0)
    total_downtime_minutes = Column(Integer, default=0)
    issues_resolved_auto = Column(Integer, default=0)  # Auto-fixed issues
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relations
    health_checks = relationship("HealthCheck", back_populates="project", cascade="all, delete-orphan")
    issues = relationship("MonitorIssue", back_populates="project", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<MonitoredProject {self.name}>"


class HealthCheck(Base):
    """Individuele health check resultaat."""
    __tablename__ = "health_checks"
    
    id = Column(Integer, primary_key=True)
    
    # Project
    project_id = Column(Integer, ForeignKey("monitored_projects.id"), nullable=False)
    project = relationship("MonitoredProject", back_populates="health_checks")
    
    # Check result
    status = Column(String(20), nullable=False)  # healthy, degraded, down
    response_time = Column(Integer, nullable=True)  # ms
    status_code = Column(Integer, nullable=True)  # HTTP status code
    
    # Details
    check_type = Column(String(50), default="http")  # http, ssl, dns, ping, api
    endpoint = Column(String(500), nullable=True)
    error_message = Column(Text, nullable=True)
    response_body = Column(Text, nullable=True)  # Truncated response
    
    # SSL info (if applicable)
    ssl_valid = Column(Boolean, nullable=True)
    ssl_expires_at = Column(DateTime, nullable=True)
    
    # Timestamp
    checked_at = Column(DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f"<HealthCheck {self.project_id}: {self.status}>"


class MonitorIssue(Base):
    """Gedetecteerd probleem."""
    __tablename__ = "monitor_issues"
    
    id = Column(Integer, primary_key=True)
    
    # Project
    project_id = Column(Integer, ForeignKey("monitored_projects.id"), nullable=False)
    project = relationship("MonitoredProject", back_populates="issues")
    
    # Issue details
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    severity = Column(String(20), default=IssueSeverity.MEDIUM.value)
    status = Column(String(20), default=IssueStatus.OPEN.value)
    
    # Error info
    error_type = Column(String(100), nullable=True)  # timeout, 500, ssl_expired, etc.
    error_message = Column(Text, nullable=True)
    stack_trace = Column(Text, nullable=True)
    
    # AI Analysis
    ai_analysis = Column(Text, nullable=True)  # AI's analyse van het probleem
    ai_suggested_fix = Column(Text, nullable=True)  # AI's voorgestelde oplossing
    ai_confidence = Column(Float, nullable=True)  # 0-1 confidence score
    
    # Resolution
    resolution = Column(Text, nullable=True)
    resolved_by = Column(String(50), nullable=True)  # "ai_auto", "manual"
    resolved_at = Column(DateTime, nullable=True)
    
    # Learning
    was_helpful = Column(Boolean, nullable=True)  # User feedback
    
    # Timestamps
    detected_at = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relations
    solutions = relationship("IssueSolution", back_populates="issue", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<MonitorIssue {self.title}>"


class IssueSolution(Base):
    """Toegepaste oplossing (voor self-learning)."""
    __tablename__ = "issue_solutions"
    
    id = Column(Integer, primary_key=True)
    
    # Issue
    issue_id = Column(Integer, ForeignKey("monitor_issues.id"), nullable=False)
    issue = relationship("MonitorIssue", back_populates="solutions")
    
    # Solution details
    action_type = Column(String(50), nullable=False)  # restart, redeploy, clear_cache, rollback, etc.
    action_command = Column(Text, nullable=True)  # Actual command executed
    action_description = Column(Text, nullable=True)
    
    # Result
    was_successful = Column(Boolean, default=False)
    error_output = Column(Text, nullable=True)
    
    # Learning
    similarity_pattern = Column(Text, nullable=True)  # JSON: patterns to match similar issues
    reuse_count = Column(Integer, default=0)  # How often this solution was reused
    success_rate = Column(Float, default=0.0)  # Success rate when reused
    
    # Timestamps
    applied_at = Column(DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f"<IssueSolution {self.action_type}>"


class MonitorReport(Base):
    """Dagelijks/wekelijks monitoring rapport."""
    __tablename__ = "monitor_reports"
    
    id = Column(Integer, primary_key=True)
    
    # Report period
    report_type = Column(String(20), default="daily")  # daily, weekly, monthly
    period_start = Column(DateTime, nullable=False)
    period_end = Column(DateTime, nullable=False)
    
    # Summary stats
    total_projects = Column(Integer, default=0)
    total_checks = Column(Integer, default=0)
    total_issues = Column(Integer, default=0)
    issues_resolved = Column(Integer, default=0)
    issues_auto_resolved = Column(Integer, default=0)
    
    # Uptime
    average_uptime = Column(Float, default=100.0)
    
    # Content
    summary = Column(Text, nullable=True)  # AI-generated summary
    details = Column(Text, nullable=True)  # JSON with full details
    
    # File
    file_path = Column(String(500), nullable=True)  # Path to saved report
    
    # Timestamp
    generated_at = Column(DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f"<MonitorReport {self.report_type}: {self.period_start}>"


class AILearning(Base):
    """AI learning data voor self-improvement."""
    __tablename__ = "ai_learning"
    
    id = Column(Integer, primary_key=True)
    
    # Pattern matching
    error_pattern = Column(Text, nullable=False)  # Regex of error signature
    error_type = Column(String(100), nullable=True)
    
    # Solution
    solution_type = Column(String(50), nullable=False)
    solution_steps = Column(Text, nullable=True)  # JSON array of steps
    
    # Stats
    times_matched = Column(Integer, default=0)
    times_successful = Column(Integer, default=0)
    success_rate = Column(Float, default=0.0)
    
    # Context
    project_types = Column(String(255), nullable=True)  # Comma-separated types where this works
    
    # Timestamps
    first_learned = Column(DateTime, default=datetime.utcnow)
    last_used = Column(DateTime, nullable=True)
    
    def __repr__(self):
        return f"<AILearning {self.error_type}: {self.solution_type}>"


# =============================================================================
# CUSTOMER SUPPORT TICKETING
# =============================================================================

class TicketPriority(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"


class TicketStatus(str, enum.Enum):
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    WAITING_CUSTOMER = "waiting_customer"
    WAITING_INTERNAL = "waiting_internal"
    AI_PROCESSING = "ai_processing"
    RESOLVED = "resolved"
    CLOSED = "closed"


class TicketCategory(str, enum.Enum):
    BUG = "bug"
    FEATURE_REQUEST = "feature_request"
    QUESTION = "question"
    PERFORMANCE = "performance"
    SECURITY = "security"
    BILLING = "billing"
    OTHER = "other"


class SupportTicket(Base):
    """Customer support ticket."""
    __tablename__ = "support_tickets"
    
    id = Column(Integer, primary_key=True)
    
    # Ticket identifier (human readable)
    ticket_number = Column(String(20), unique=True, nullable=False)  # e.g., "TKT-2026-0001"
    
    # Customer info (from website user or manual)
    customer_id = Column(String(100), nullable=True)  # Website user ID
    customer_name = Column(String(255), nullable=False)
    customer_email = Column(String(255), nullable=False)
    customer_phone = Column(String(50), nullable=True)
    company_name = Column(String(255), nullable=True)
    
    # Link to client in CRM (optional)
    client_id = Column(Integer, ForeignKey("clients.id"), nullable=True)
    client = relationship("Client")
    
    # Link to monitored project (for technical issues)
    project_id = Column(Integer, ForeignKey("monitored_projects.id"), nullable=True)
    project = relationship("MonitoredProject")
    
    # Ticket details
    subject = Column(String(500), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String(30), default=TicketCategory.OTHER.value)
    priority = Column(String(20), default=TicketPriority.MEDIUM.value)
    status = Column(String(30), default=TicketStatus.OPEN.value)
    
    # Tags for filtering/categorization
    tags = Column(String(500), nullable=True)  # Comma-separated
    
    # Assignment
    assigned_to = Column(String(100), nullable=True)  # "ai", "bart", etc.
    
    # AI Analysis
    ai_analyzed = Column(Boolean, default=False)
    ai_analysis = Column(Text, nullable=True)  # AI's understanding of the issue
    ai_suggested_solution = Column(Text, nullable=True)
    ai_confidence = Column(Float, nullable=True)  # 0-1
    ai_auto_resolve_attempted = Column(Boolean, default=False)
    
    # Linked issue (if AI created a MonitorIssue from this)
    linked_issue_id = Column(Integer, ForeignKey("monitor_issues.id"), nullable=True)
    linked_issue = relationship("MonitorIssue")
    
    # Resolution
    resolution = Column(Text, nullable=True)
    resolved_by = Column(String(100), nullable=True)  # "ai", "bart", "customer"
    resolved_at = Column(DateTime, nullable=True)
    
    # Customer satisfaction (1-5)
    satisfaction_rating = Column(Integer, nullable=True)
    satisfaction_comment = Column(Text, nullable=True)
    
    # Source
    source = Column(String(50), default="website")  # website, email, portal, api
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    first_response_at = Column(DateTime, nullable=True)
    
    # SLA tracking
    sla_deadline = Column(DateTime, nullable=True)
    sla_breached = Column(Boolean, default=False)
    
    # Relations
    messages = relationship("TicketMessage", back_populates="ticket", cascade="all, delete-orphan")
    attachments = relationship("TicketAttachment", back_populates="ticket", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<SupportTicket {self.ticket_number}: {self.subject[:30]}>"


class TicketMessage(Base):
    """Message/reply in a support ticket thread."""
    __tablename__ = "ticket_messages"
    
    id = Column(Integer, primary_key=True)
    
    # Ticket
    ticket_id = Column(Integer, ForeignKey("support_tickets.id"), nullable=False)
    ticket = relationship("SupportTicket", back_populates="messages")
    
    # Sender
    sender_type = Column(String(20), nullable=False)  # "customer", "support", "ai", "system"
    sender_name = Column(String(255), nullable=False)
    sender_email = Column(String(255), nullable=True)
    
    # Content
    message = Column(Text, nullable=False)
    is_internal = Column(Boolean, default=False)  # Internal notes not visible to customer
    
    # AI generated
    ai_generated = Column(Boolean, default=False)
    
    # Timestamp
    created_at = Column(DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f"<TicketMessage {self.ticket_id} by {self.sender_type}>"


class TicketAttachment(Base):
    """File attachment on a support ticket."""
    __tablename__ = "ticket_attachments"
    
    id = Column(Integer, primary_key=True)
    
    # Ticket
    ticket_id = Column(Integer, ForeignKey("support_tickets.id"), nullable=False)
    ticket = relationship("SupportTicket", back_populates="attachments")
    
    # File info
    filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_size = Column(Integer, default=0)  # bytes
    mime_type = Column(String(100), nullable=True)
    
    # Uploader
    uploaded_by = Column(String(255), nullable=True)
    
    # Timestamp
    created_at = Column(DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f"<TicketAttachment {self.filename}>"


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
