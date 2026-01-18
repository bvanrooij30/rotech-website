"""
Webhook Service - Ontvang website form submissions.
Twee modi: Webhook server (realtime) of API polling.
"""

import json
import threading
import hashlib
import hmac
from datetime import datetime
from typing import Optional, Dict, List
from http.server import HTTPServer, BaseHTTPRequestHandler
import requests

from ..database import get_db
from ..database.models import FormSubmission, FormType, FormStatus
from ..utils.config import Config, logger


class WebhookHandler(BaseHTTPRequestHandler):
    """HTTP Handler voor incoming webhooks."""
    
    webhook_secret: str = ""
    
    def log_message(self, format, *args):
        """Override to use our logger."""
        logger.debug(f"Webhook: {args[0]}")
    
    def do_POST(self):
        """Handle POST requests (webhooks)."""
        try:
            # Read body
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length)
            
            # Verify signature if configured
            if self.webhook_secret:
                signature = self.headers.get('X-Webhook-Signature', '')
                expected = hmac.new(
                    self.webhook_secret.encode(),
                    body,
                    hashlib.sha256
                ).hexdigest()
                
                if not hmac.compare_digest(signature, expected):
                    logger.warning("Invalid webhook signature")
                    self.send_error(403, "Invalid signature")
                    return
            
            # Parse JSON
            data = json.loads(body.decode('utf-8'))
            
            # Process based on path
            if self.path == '/webhook/contact':
                self._handle_contact_form(data)
            elif self.path == '/webhook/offerte':
                self._handle_offerte_form(data)
            else:
                self._handle_generic_form(data)
            
            # Send success response
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"status": "ok"}).encode())
            
        except json.JSONDecodeError:
            self.send_error(400, "Invalid JSON")
        except Exception as e:
            logger.error(f"Webhook error: {e}")
            self.send_error(500, str(e))
    
    def _handle_contact_form(self, data: Dict):
        """Handle contact form submission."""
        self._save_form(data, FormType.CONTACT)
    
    def _handle_offerte_form(self, data: Dict):
        """Handle offerte/quote form submission."""
        self._save_form(data, FormType.OFFERTE)
    
    def _handle_generic_form(self, data: Dict):
        """Handle generic form submission."""
        form_type = data.get('type', 'contact')
        if form_type in [t.value for t in FormType]:
            self._save_form(data, FormType(form_type))
        else:
            self._save_form(data, FormType.CONTACT)
    
    def _save_form(self, data: Dict, form_type: FormType):
        """Save form submission to database."""
        db = get_db()
        
        with db.session() as session:
            form = FormSubmission(
                form_type=form_type.value,
                status=FormStatus.NEW.value,
                name=data.get('name', 'Unknown'),
                email=data.get('email', ''),
                phone=data.get('phone'),
                company=data.get('company'),
                subject=data.get('subject'),
                message=data.get('message', ''),
                source='webhook',
                ip_address=self.client_address[0] if self.client_address else None,
                submitted_at=datetime.now()
            )
            
            session.add(form)
            session.commit()
        
        logger.info(f"Saved {form_type.value} form from {form.name}")


class WebhookServer:
    """Lokale webhook server."""
    
    def __init__(self, port: int = 8765, secret: str = None):
        """
        Initialize webhook server.
        
        Args:
            port: Port om te luisteren
            secret: Webhook secret voor verificatie
        """
        self.port = port
        self.secret = secret or Config.WEBHOOK_SECRET
        self._server: Optional[HTTPServer] = None
        self._thread: Optional[threading.Thread] = None
        self._running = False
    
    def start(self):
        """Start webhook server in background thread."""
        if self._running:
            logger.warning("Webhook server already running")
            return
        
        # Set secret on handler class
        WebhookHandler.webhook_secret = self.secret
        
        self._server = HTTPServer(('0.0.0.0', self.port), WebhookHandler)
        self._running = True
        
        def serve():
            logger.info(f"Webhook server started on port {self.port}")
            while self._running:
                self._server.handle_request()
        
        self._thread = threading.Thread(target=serve, daemon=True)
        self._thread.start()
    
    def stop(self):
        """Stop webhook server."""
        self._running = False
        if self._server:
            self._server.shutdown()
        logger.info("Webhook server stopped")


class WebsitePoller:
    """Poll website API voor nieuwe form submissions."""
    
    def __init__(self, api_url: str = None, api_key: str = None):
        """
        Initialize API poller.
        
        Args:
            api_url: Website API base URL
            api_key: API key voor authenticatie
        """
        self.api_url = api_url or Config.WEBSITE_API_URL
        self.api_key = api_key
        self._last_check: Optional[datetime] = None
    
    def poll(self) -> List[FormSubmission]:
        """
        Poll API voor nieuwe submissions.
        
        Returns:
            Lijst met nieuwe FormSubmission objects
        """
        try:
            # Build request
            headers = {
                'Accept': 'application/json',
            }
            
            if self.api_key:
                headers['Authorization'] = f'Bearer {self.api_key}'
            
            params = {}
            if self._last_check:
                params['since'] = self._last_check.isoformat()
            
            # Make request
            response = requests.get(
                f"{self.api_url}/forms/submissions",
                headers=headers,
                params=params,
                timeout=30
            )
            
            if response.status_code == 404:
                # API endpoint doesn't exist yet
                logger.debug("Forms API not available")
                return []
            
            response.raise_for_status()
            data = response.json()
            
            # Update last check time
            self._last_check = datetime.now()
            
            # Parse and save submissions
            new_forms = []
            submissions = data.get('submissions', [])
            
            if not submissions:
                return []
            
            db = get_db()
            with db.session() as session:
                for item in submissions:
                    # Check if already exists
                    external_id = item.get('id')
                    if external_id:
                        existing = session.query(FormSubmission).filter(
                            FormSubmission.source == f"api:{external_id}"
                        ).first()
                        
                        if existing:
                            continue
                    
                    form = FormSubmission(
                        form_type=item.get('type', FormType.CONTACT.value),
                        status=FormStatus.NEW.value,
                        name=item.get('name', 'Unknown'),
                        email=item.get('email', ''),
                        phone=item.get('phone'),
                        company=item.get('company'),
                        subject=item.get('subject'),
                        message=item.get('message', ''),
                        source=f"api:{external_id}" if external_id else 'api',
                        submitted_at=datetime.fromisoformat(item['submitted_at']) 
                            if item.get('submitted_at') else datetime.now()
                    )
                    
                    session.add(form)
                    new_forms.append(form)
                
                session.commit()
            
            if new_forms:
                logger.info(f"Polled {len(new_forms)} new form submissions")
            
            return new_forms
            
        except requests.exceptions.ConnectionError:
            logger.debug("Could not connect to website API")
            return []
        except requests.exceptions.Timeout:
            logger.warning("Website API timeout")
            return []
        except Exception as e:
            logger.error(f"API poll error: {e}")
            return []


# Convenience functions

def start_webhook_server(port: int = 8765) -> WebhookServer:
    """Start webhook server."""
    server = WebhookServer(port=port)
    server.start()
    return server


def poll_website_forms() -> List[FormSubmission]:
    """Poll website for new forms."""
    poller = WebsitePoller()
    return poller.poll()
