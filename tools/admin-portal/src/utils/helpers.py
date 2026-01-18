"""
Helper functies voor Ro-Tech Admin Portal.
"""

import uuid
from datetime import datetime
from typing import Optional
from dateutil import parser as date_parser
from dateutil.relativedelta import relativedelta


def generate_id() -> str:
    """Genereer een unieke ID."""
    return str(uuid.uuid4())[:8]


def format_datetime(dt: Optional[datetime], relative: bool = False) -> str:
    """
    Format datetime naar leesbare string.
    
    Args:
        dt: Datetime object
        relative: Als True, geef relatieve tijd (bijv. "5 minuten geleden")
    """
    if dt is None:
        return "-"
    
    if relative:
        return format_relative_time(dt)
    
    now = datetime.now()
    
    # Vandaag: alleen tijd
    if dt.date() == now.date():
        return dt.strftime("%H:%M")
    
    # Gisteren
    if dt.date() == (now - relativedelta(days=1)).date():
        return f"Gisteren {dt.strftime('%H:%M')}"
    
    # Deze week
    if (now - dt).days < 7:
        days = ["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"]
        return f"{days[dt.weekday()]} {dt.strftime('%H:%M')}"
    
    # Dit jaar
    if dt.year == now.year:
        return dt.strftime("%d %b %H:%M")
    
    # Ouder
    return dt.strftime("%d-%m-%Y")


def format_relative_time(dt: datetime) -> str:
    """Format datetime als relatieve tijd (bijv. '5 minuten geleden')."""
    now = datetime.now()
    diff = now - dt
    
    seconds = diff.total_seconds()
    
    if seconds < 60:
        return "Zojuist"
    
    minutes = int(seconds / 60)
    if minutes < 60:
        return f"{minutes} min geleden"
    
    hours = int(minutes / 60)
    if hours < 24:
        return f"{hours} uur geleden"
    
    days = int(hours / 24)
    if days < 7:
        return f"{days} dag{'en' if days > 1 else ''} geleden"
    
    weeks = int(days / 7)
    if weeks < 4:
        return f"{weeks} week geleden"
    
    months = int(days / 30)
    if months < 12:
        return f"{months} maand{'en' if months > 1 else ''} geleden"
    
    years = int(days / 365)
    return f"{years} jaar geleden"


def truncate_text(text: str, max_length: int = 50, suffix: str = "...") -> str:
    """Kort tekst in met suffix als te lang."""
    if not text:
        return ""
    
    if len(text) <= max_length:
        return text
    
    return text[:max_length - len(suffix)] + suffix


def parse_date(date_string: str) -> Optional[datetime]:
    """Parse datum string naar datetime, tolerant voor verschillende formaten."""
    if not date_string:
        return None
    
    try:
        return date_parser.parse(date_string)
    except (ValueError, TypeError):
        return None


def sanitize_filename(filename: str) -> str:
    """Maak filename veilig voor opslag."""
    # Vervang illegale karakters
    illegal_chars = '<>:"/\\|?*'
    for char in illegal_chars:
        filename = filename.replace(char, '_')
    
    # Beperk lengte
    if len(filename) > 200:
        name, ext = filename.rsplit('.', 1) if '.' in filename else (filename, '')
        filename = name[:195] + ('.' + ext if ext else '')
    
    return filename


def format_file_size(size_bytes: int) -> str:
    """Format bestandsgrootte naar leesbare string."""
    if size_bytes < 1024:
        return f"{size_bytes} B"
    elif size_bytes < 1024 * 1024:
        return f"{size_bytes / 1024:.1f} KB"
    elif size_bytes < 1024 * 1024 * 1024:
        return f"{size_bytes / (1024 * 1024):.1f} MB"
    else:
        return f"{size_bytes / (1024 * 1024 * 1024):.1f} GB"


def extract_email_address(email_string: str) -> str:
    """Extract email adres uit string zoals 'Naam <email@domain.com>'."""
    if '<' in email_string and '>' in email_string:
        start = email_string.index('<') + 1
        end = email_string.index('>')
        return email_string[start:end].strip()
    return email_string.strip()


def extract_email_name(email_string: str) -> str:
    """Extract naam uit email string zoals 'Naam <email@domain.com>'."""
    if '<' in email_string:
        return email_string[:email_string.index('<')].strip().strip('"')
    return email_string.split('@')[0] if '@' in email_string else email_string
