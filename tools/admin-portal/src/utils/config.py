"""
Configuration management voor Ro-Tech Admin Portal.
Laadt settings uit .env bestand en biedt centrale toegang.
"""

import os
import logging
from pathlib import Path
from typing import Optional
from dotenv import load_dotenv
from cryptography.fernet import Fernet

# Bepaal project root
PROJECT_ROOT = Path(__file__).parent.parent.parent
DATA_DIR = PROJECT_ROOT / "data"
LOGS_DIR = PROJECT_ROOT / "logs"

# Maak directories aan als ze niet bestaan
DATA_DIR.mkdir(exist_ok=True)
LOGS_DIR.mkdir(exist_ok=True)
(DATA_DIR / "attachments").mkdir(exist_ok=True)
(DATA_DIR / "backups").mkdir(exist_ok=True)

# Load .env
load_dotenv(PROJECT_ROOT / ".env")


class Config:
    """Centrale configuratie class."""
    
    # === PATHS ===
    PROJECT_ROOT = PROJECT_ROOT
    DATA_DIR = DATA_DIR
    LOGS_DIR = LOGS_DIR
    DATABASE_PATH = DATA_DIR / "admin_portal.db"
    ATTACHMENTS_DIR = DATA_DIR / "attachments"
    BACKUPS_DIR = DATA_DIR / "backups"
    
    # === EMAIL ===
    EMAIL_HOST: str = os.getenv("EMAIL_HOST", "mail.ro-techdevelopment.com")
    EMAIL_PORT_IMAP: int = int(os.getenv("EMAIL_PORT_IMAP", "993"))
    EMAIL_PORT_SMTP: int = int(os.getenv("EMAIL_PORT_SMTP", "587"))
    EMAIL_USERNAME: str = os.getenv("EMAIL_USERNAME", "")
    EMAIL_PASSWORD: str = os.getenv("EMAIL_PASSWORD", "")
    EMAIL_SYNC_INTERVAL: int = int(os.getenv("EMAIL_SYNC_INTERVAL", "5"))  # minutes
    
    # === WEBSITE ===
    WEBHOOK_SECRET: str = os.getenv("WEBHOOK_SECRET", "")
    WEBSITE_API_URL: str = os.getenv("WEBSITE_API_URL", "https://ro-techdevelopment.dev/api")
    WEBSITE_ADMIN_API_KEY: str = os.getenv("WEBSITE_ADMIN_API_KEY", "rotech-admin-secret-key")
    PAYMENT_SYNC_INTERVAL: int = int(os.getenv("PAYMENT_SYNC_INTERVAL", "5"))  # minutes
    
    # === LEAD FINDER ===
    LEAD_FINDER_OUTPUT: Path = Path(os.getenv("LEAD_FINDER_OUTPUT", "../lead-finder/output"))
    
    # === APP ===
    APP_THEME: str = os.getenv("APP_THEME", "dark")
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
    
    # === SECURITY ===
    _encryption_key: Optional[bytes] = None
    
    @classmethod
    def get_encryption_key(cls) -> bytes:
        """Get of genereer encryption key voor gevoelige data."""
        if cls._encryption_key is None:
            key_file = cls.DATA_DIR / ".key"
            
            if key_file.exists():
                cls._encryption_key = key_file.read_bytes()
            else:
                # Genereer nieuwe key
                cls._encryption_key = Fernet.generate_key()
                key_file.write_bytes(cls._encryption_key)
                # Maak bestand alleen leesbaar voor owner
                key_file.chmod(0o600)
        
        return cls._encryption_key
    
    @classmethod
    def encrypt(cls, data: str) -> str:
        """Encrypt sensitive data."""
        f = Fernet(cls.get_encryption_key())
        return f.encrypt(data.encode()).decode()
    
    @classmethod
    def decrypt(cls, encrypted_data: str) -> str:
        """Decrypt sensitive data."""
        f = Fernet(cls.get_encryption_key())
        return f.decrypt(encrypted_data.encode()).decode()
    
    @classmethod
    def is_email_configured(cls) -> bool:
        """Check of email credentials zijn ingevuld."""
        return bool(cls.EMAIL_USERNAME and cls.EMAIL_PASSWORD)
    
    @classmethod
    def get_lead_finder_path(cls) -> Path:
        """Get absolute path naar lead-finder output."""
        path = cls.LEAD_FINDER_OUTPUT
        if not path.is_absolute():
            path = cls.PROJECT_ROOT / path
        return path.resolve()


def setup_logging() -> logging.Logger:
    """Configureer application logging."""
    log_file = LOGS_DIR / "app.log"
    
    logging.basicConfig(
        level=getattr(logging, Config.LOG_LEVEL),
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.FileHandler(log_file, encoding='utf-8'),
            logging.StreamHandler()
        ]
    )
    
    return logging.getLogger("admin_portal")


# Global logger instance
logger = setup_logging()
