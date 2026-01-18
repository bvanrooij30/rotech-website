"""
Database connection en session management.
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from contextlib import contextmanager
from typing import Generator

from .models import Base
from ..utils.config import Config, logger


class Database:
    """Database connection manager."""
    
    _instance = None
    _engine = None
    _session_factory = None
    
    def __new__(cls):
        """Singleton pattern."""
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialize()
        return cls._instance
    
    def _initialize(self):
        """Initialize database connection."""
        db_path = Config.DATABASE_PATH
        db_url = f"sqlite:///{db_path}"
        
        logger.info(f"Initializing database at: {db_path}")
        
        self._engine = create_engine(
            db_url,
            echo=False,  # Set True for SQL debugging
            connect_args={"check_same_thread": False}  # Nodig voor SQLite + threading
        )
        
        self._session_factory = sessionmaker(
            bind=self._engine,
            autocommit=False,
            autoflush=False
        )
    
    def create_tables(self):
        """Create all tables in database."""
        logger.info("Creating database tables...")
        Base.metadata.create_all(self._engine)
        logger.info("Database tables created successfully")
    
    @contextmanager
    def session(self) -> Generator[Session, None, None]:
        """Context manager voor database sessions."""
        session = self._session_factory()
        try:
            yield session
            session.commit()
        except Exception as e:
            session.rollback()
            logger.error(f"Database error: {e}")
            raise
        finally:
            session.close()
    
    def get_session(self) -> Session:
        """Get a new session (caller moet zelf managen)."""
        return self._session_factory()
    
    @property
    def engine(self):
        return self._engine


# Global database instance
_db: Database = None


def get_db() -> Database:
    """Get database instance."""
    global _db
    if _db is None:
        _db = Database()
    return _db


def init_db():
    """Initialize database and create tables."""
    db = get_db()
    db.create_tables()
    
    # Create default settings
    with db.session() as session:
        from .models import Setting
        
        defaults = {
            "app_theme": Config.APP_THEME,
            "email_sync_interval": str(Config.EMAIL_SYNC_INTERVAL),
            "first_run": "true"
        }
        
        for key, value in defaults.items():
            existing = session.query(Setting).filter_by(key=key).first()
            if not existing:
                session.add(Setting(key=key, value=value))
        
        session.commit()
    
    logger.info("Database initialized with default settings")
