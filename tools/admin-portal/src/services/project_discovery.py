"""
Project Discovery Service - Automatische detectie van projecten.

Projecten kunnen op twee manieren geregistreerd worden:
1. Via een `.rotech-monitor.json` config bestand in de project root
2. Via een centrale `projects` folder met project configs

De service scant periodiek voor nieuwe projecten en registreert ze automatisch.
"""

import os
import json
import time
import threading
from datetime import datetime
from typing import Optional, List, Dict, Any
from pathlib import Path
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler, FileCreatedEvent, FileModifiedEvent

from ..database import get_db
from ..database.models import MonitoredProject, ProjectType
from ..utils.config import Config, logger


# Config bestand naam dat in project roots gezocht wordt
CONFIG_FILENAME = ".rotech-monitor.json"

# Centrale projects folder
PROJECTS_DIR = os.path.join(Config.DATA_DIR, "projects")


class ProjectConfigSchema:
    """Schema voor project monitoring config."""
    
    EXAMPLE = {
        "name": "Mijn Website",
        "description": "Website voor klant X",
        "type": "website",  # website, api, bot, automation, database, other
        
        # Monitoring settings
        "url": "https://example.com",
        "health_endpoint": "https://example.com/api/health",
        "check_interval": 300,  # seconds
        
        # Alert settings
        "alert_on_down": True,
        "alert_email": "bart@ro-techdevelopment.dev",
        
        # Thresholds
        "response_time_warning": 2000,  # ms
        "response_time_critical": 5000,  # ms
        
        # Auto-fix commands (optional)
        "restart_command": "pm2 restart my-app",
        "deploy_command": "./deploy.sh",
        
        # Git repo (optional)
        "git_repo": "https://github.com/user/repo",
        
        # Client info (optional)
        "client_name": "Klant X",
        
        # Auto-start monitoring
        "auto_monitor": True
    }


def create_example_config(path: str) -> str:
    """Maak een voorbeeld config bestand."""
    config_path = os.path.join(path, CONFIG_FILENAME)
    
    with open(config_path, 'w', encoding='utf-8') as f:
        json.dump(ProjectConfigSchema.EXAMPLE, f, indent=2, ensure_ascii=False)
    
    return config_path


def parse_project_config(config_path: str) -> Optional[Dict[str, Any]]:
    """Parse een project config bestand."""
    try:
        with open(config_path, 'r', encoding='utf-8') as f:
            config = json.load(f)
        
        # Valideer required fields
        if not config.get('name'):
            logger.warning(f"Config missing 'name': {config_path}")
            return None
        
        if not config.get('url') and not config.get('health_endpoint'):
            logger.warning(f"Config needs 'url' or 'health_endpoint': {config_path}")
            return None
        
        # Set defaults
        config.setdefault('type', 'website')
        config.setdefault('check_interval', 300)
        config.setdefault('alert_on_down', True)
        config.setdefault('response_time_warning', 2000)
        config.setdefault('response_time_critical', 5000)
        config.setdefault('auto_monitor', True)
        
        # Add source path
        config['_config_path'] = config_path
        config['_project_path'] = os.path.dirname(config_path)
        
        return config
        
    except json.JSONDecodeError as e:
        logger.error(f"Invalid JSON in config: {config_path} - {e}")
        return None
    except Exception as e:
        logger.error(f"Error reading config: {config_path} - {e}")
        return None


def register_project_from_config(config: Dict[str, Any]) -> Optional[MonitoredProject]:
    """Registreer een project in de database vanuit config."""
    db = get_db()
    
    with db.session() as session:
        # Check of project al bestaat (op basis van naam of URL)
        existing = session.query(MonitoredProject).filter(
            (MonitoredProject.name == config['name']) |
            (MonitoredProject.url == config.get('url'))
        ).first()
        
        if existing:
            logger.debug(f"Project already registered: {config['name']}")
            # Update existing project with new config
            existing.url = config.get('url') or existing.url
            existing.health_endpoint = config.get('health_endpoint') or existing.health_endpoint
            existing.check_interval = config.get('check_interval', existing.check_interval)
            existing.local_path = config.get('_project_path') or existing.local_path
            existing.restart_command = config.get('restart_command') or existing.restart_command
            existing.deploy_command = config.get('deploy_command') or existing.deploy_command
            existing.git_repo = config.get('git_repo') or existing.git_repo
            session.commit()
            return existing
        
        # Maak nieuw project
        project = MonitoredProject(
            name=config['name'],
            description=config.get('description'),
            project_type=config.get('type', ProjectType.WEBSITE.value),
            url=config.get('url'),
            health_endpoint=config.get('health_endpoint'),
            check_interval=config.get('check_interval', 300),
            alert_on_down=config.get('alert_on_down', True),
            alert_email=config.get('alert_email'),
            response_time_warning=config.get('response_time_warning', 2000),
            response_time_critical=config.get('response_time_critical', 5000),
            local_path=config.get('_project_path'),
            restart_command=config.get('restart_command'),
            deploy_command=config.get('deploy_command'),
            git_repo=config.get('git_repo'),
            is_active=config.get('auto_monitor', True)
        )
        
        session.add(project)
        session.commit()
        
        logger.info(f"Auto-registered new project: {config['name']}")
        return project


class ProjectConfigHandler(FileSystemEventHandler):
    """Handler voor file system events op project configs."""
    
    def __init__(self, on_project_found: callable):
        self.on_project_found = on_project_found
    
    def on_created(self, event):
        if event.is_directory:
            return
        
        if os.path.basename(event.src_path) == CONFIG_FILENAME:
            logger.info(f"New project config detected: {event.src_path}")
            self._process_config(event.src_path)
    
    def on_modified(self, event):
        if event.is_directory:
            return
        
        if os.path.basename(event.src_path) == CONFIG_FILENAME:
            logger.info(f"Project config updated: {event.src_path}")
            self._process_config(event.src_path)
    
    def _process_config(self, config_path: str):
        config = parse_project_config(config_path)
        if config:
            project = register_project_from_config(config)
            if project and self.on_project_found:
                self.on_project_found(project)


class ProjectDiscoveryService:
    """Service voor automatische project detectie."""
    
    _instance: Optional['ProjectDiscoveryService'] = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = False
        return cls._instance
    
    def __init__(self):
        if self._initialized:
            return
        
        self._initialized = True
        self._running = False
        self._observer: Optional[Observer] = None
        self._scan_thread: Optional[threading.Thread] = None
        self._on_project_found: Optional[callable] = None
        
        # Watch directories
        self._watch_dirs: List[str] = []
        
        # Ensure projects directory exists
        os.makedirs(PROJECTS_DIR, exist_ok=True)
    
    def set_callback(self, on_project_found: callable):
        """Set callback voor wanneer nieuw project gevonden wordt."""
        self._on_project_found = on_project_found
    
    def add_watch_directory(self, path: str):
        """Voeg een directory toe om te watchen voor project configs."""
        if os.path.isdir(path) and path not in self._watch_dirs:
            self._watch_dirs.append(path)
            logger.info(f"Added watch directory: {path}")
    
    def start(self):
        """Start de discovery service."""
        if self._running:
            return
        
        self._running = True
        
        # Add default watch directories
        self.add_watch_directory(PROJECTS_DIR)
        
        # Add common project locations
        common_paths = [
            os.path.expanduser("~/projects"),
            os.path.expanduser("~/Projects"),
            os.path.expanduser("~/Desktop/Projects"),
            "C:\\Projects",
            "D:\\Projects",
        ]
        
        for path in common_paths:
            if os.path.isdir(path):
                self.add_watch_directory(path)
        
        # Initial scan
        self._scan_all_directories()
        
        # Start file watcher
        self._start_watcher()
        
        # Start periodic scan thread
        self._scan_thread = threading.Thread(target=self._periodic_scan, daemon=True)
        self._scan_thread.start()
        
        logger.info(f"Project discovery started. Watching {len(self._watch_dirs)} directories")
    
    def stop(self):
        """Stop de discovery service."""
        self._running = False
        
        if self._observer:
            self._observer.stop()
            self._observer.join()
        
        logger.info("Project discovery stopped")
    
    def _start_watcher(self):
        """Start file system watcher."""
        try:
            from watchdog.observers import Observer
            
            self._observer = Observer()
            handler = ProjectConfigHandler(self._on_project_found)
            
            for watch_dir in self._watch_dirs:
                self._observer.schedule(handler, watch_dir, recursive=True)
                logger.debug(f"Watching: {watch_dir}")
            
            self._observer.start()
            
        except ImportError:
            logger.warning("watchdog not installed - file watching disabled")
        except Exception as e:
            logger.error(f"Failed to start file watcher: {e}")
    
    def _periodic_scan(self):
        """Periodieke scan voor nieuwe projecten."""
        while self._running:
            time.sleep(300)  # Scan elke 5 minuten
            
            if self._running:
                self._scan_all_directories()
    
    def _scan_all_directories(self):
        """Scan alle watch directories voor project configs."""
        found = 0
        
        for watch_dir in self._watch_dirs:
            found += self._scan_directory(watch_dir)
        
        if found > 0:
            logger.info(f"Scan complete: found {found} project configs")
    
    def _scan_directory(self, path: str, max_depth: int = 3) -> int:
        """Scan een directory voor project configs."""
        found = 0
        
        try:
            for root, dirs, files in os.walk(path):
                # Limit depth
                depth = root.replace(path, '').count(os.sep)
                if depth >= max_depth:
                    dirs.clear()
                    continue
                
                # Skip common non-project directories
                dirs[:] = [d for d in dirs if d not in [
                    'node_modules', '.git', '__pycache__', 'venv', 
                    '.venv', 'env', '.env', 'dist', 'build'
                ]]
                
                # Check for config file
                if CONFIG_FILENAME in files:
                    config_path = os.path.join(root, CONFIG_FILENAME)
                    config = parse_project_config(config_path)
                    
                    if config:
                        project = register_project_from_config(config)
                        if project and self._on_project_found:
                            self._on_project_found(project)
                        found += 1
        
        except PermissionError:
            pass
        except Exception as e:
            logger.error(f"Error scanning {path}: {e}")
        
        return found
    
    def scan_project_path(self, path: str) -> Optional[MonitoredProject]:
        """Scan een specifiek project pad en registreer het."""
        config_path = os.path.join(path, CONFIG_FILENAME)
        
        if not os.path.exists(config_path):
            # Maak een basis config
            logger.info(f"Creating default config for: {path}")
            
            project_name = os.path.basename(path)
            config = {
                "name": project_name,
                "description": f"Auto-discovered project: {project_name}",
                "type": "website",
                "auto_monitor": True
            }
            
            with open(config_path, 'w', encoding='utf-8') as f:
                json.dump(config, f, indent=2)
        
        config = parse_project_config(config_path)
        if config:
            return register_project_from_config(config)
        
        return None
    
    def get_projects_folder(self) -> str:
        """Get het pad naar de centrale projects folder."""
        return PROJECTS_DIR
    
    def get_watch_directories(self) -> List[str]:
        """Get alle watch directories."""
        return self._watch_dirs.copy()


# Global instance
_discovery_service: Optional[ProjectDiscoveryService] = None


def get_discovery_service() -> ProjectDiscoveryService:
    """Get de global discovery service instance."""
    global _discovery_service
    if _discovery_service is None:
        _discovery_service = ProjectDiscoveryService()
    return _discovery_service


def start_project_discovery(on_project_found: callable = None) -> ProjectDiscoveryService:
    """Start de project discovery service."""
    service = get_discovery_service()
    
    if on_project_found:
        service.set_callback(on_project_found)
    
    service.start()
    return service


def stop_project_discovery():
    """Stop de discovery service."""
    service = get_discovery_service()
    service.stop()
