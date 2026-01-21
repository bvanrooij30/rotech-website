"""
Support Service - Customer Support Ticket Management met AI Integratie.

Features:
- Sync tickets from website
- AI-powered ticket analysis
- Auto-linking to monitored projects
- Auto-fix attempts with status updates
- Ticket thread management
"""

import os
import json
import requests
import threading
import time
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any, Tuple
from openai import OpenAI

from ..database import get_db
from ..database.models import (
    SupportTicket, TicketMessage, TicketAttachment,
    MonitoredProject, MonitorIssue, Client,
    TicketStatus, TicketPriority, TicketCategory,
    IssueStatus, IssueSeverity
)
from ..utils.config import Config, logger
from .ai_troubleshooter import get_troubleshooter


class SupportService:
    """Service voor customer support ticket management."""
    
    def __init__(self):
        self.api_url = Config.WEBSITE_API_URL
        self.api_key = Config.WEBSITE_ADMIN_API_KEY
        self.openai_key = os.getenv("OPENAI_API_KEY")
        self.client = None
        
        if self.openai_key:
            try:
                self.client = OpenAI(api_key=self.openai_key)
            except Exception as e:
                logger.warning(f"Failed to initialize OpenAI client: {e}")
    
    def _make_request(self, method: str, endpoint: str, **kwargs) -> Optional[Dict]:
        """Make authenticated API request to website."""
        url = f"{self.api_url}{endpoint}"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }
        
        try:
            response = requests.request(
                method=method,
                url=url,
                headers=headers,
                timeout=30,
                **kwargs
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"Support API request failed: {e}")
            return None
    
    def sync_tickets_from_website(self) -> Tuple[int, int, List[str]]:
        """
        Sync nieuwe tickets van de website naar de Admin Portal.
        Gebruikt v1/sync/tickets API.
        
        Returns:
            Tuple van (synced, errors, error_messages)
        """
        logger.info("Starting ticket sync from website (v1/sync API)...")
        
        # Try v1/sync/tickets first (new API)
        result = self._make_request("GET", "/v1/sync/tickets?limit=50")
        
        if result and result.get("success"):
            # v1 API - data is in 'data' field
            tickets = result.get("data", [])
        else:
            # Fallback to legacy endpoint
            result = self._make_request("GET", "/support/tickets?unsynced=true")
            if not result or not result.get("success"):
                logger.warning("Failed to fetch tickets from website")
                return (0, 0, ["Kon tickets niet ophalen van website"])
            tickets = result.get("tickets", [])
        
        if not tickets:
            logger.info("No new tickets to sync")
            return (0, 0, [])
        
        synced = 0
        errors = 0
        error_messages = []
        synced_ids = []
        
        db = get_db()
        
        for web_ticket in tickets:
            try:
                with db.session() as session:
                    # Handle both v1 API (camelCase) and legacy API (snake_case)
                    ticket_number = web_ticket.get("ticketNumber") or web_ticket.get("ticket_number")
                    customer_email = (
                        web_ticket.get("user", {}).get("email") or  # v1 API nested user
                        web_ticket.get("customerEmail") or 
                        web_ticket.get("customer_email")
                    )
                    customer_name = (
                        web_ticket.get("user", {}).get("name") or
                        web_ticket.get("customerName") or 
                        web_ticket.get("customer_name", "Onbekend")
                    )
                    company_name = (
                        web_ticket.get("user", {}).get("companyName") or
                        web_ticket.get("companyName") or 
                        web_ticket.get("company_name")
                    )
                    
                    # Check if already exists
                    existing = session.query(SupportTicket).filter_by(
                        ticket_number=ticket_number
                    ).first()
                    
                    if existing:
                        synced_ids.append(web_ticket["id"])
                        continue
                    
                    # Find or create client
                    client = None
                    if customer_email:
                        client = session.query(Client).filter_by(
                            email=customer_email
                        ).first()
                    
                    # Find related project
                    project = None
                    product_data = web_ticket.get("product")
                    if product_data and product_data.get("domain"):
                        project = session.query(MonitoredProject).filter(
                            MonitoredProject.url.contains(product_data["domain"])
                        ).first()
                    elif web_ticket.get("projectUrl"):
                        project = session.query(MonitoredProject).filter(
                            MonitoredProject.url.contains(web_ticket["projectUrl"])
                        ).first()
                    
                    # Get description from ticket or first message
                    description = web_ticket.get("description", "")
                    if not description and web_ticket.get("messages"):
                        description = web_ticket["messages"][0].get("message", "")
                    
                    # Create ticket
                    ticket = SupportTicket(
                        ticket_number=ticket_number,
                        customer_id=web_ticket.get("userId") or web_ticket.get("customerId"),
                        customer_name=customer_name,
                        customer_email=customer_email,
                        customer_phone=web_ticket.get("user", {}).get("phone") or web_ticket.get("customerPhone"),
                        company_name=company_name,
                        client_id=client.id if client else None,
                        project_id=project.id if project else None,
                        subject=web_ticket.get("subject", "Geen onderwerp"),
                        description=description,
                        category=web_ticket.get("category", "other"),
                        priority=web_ticket.get("priority", "medium"),
                        status=TicketStatus.OPEN.value,
                        source="website",
                        created_at=datetime.fromisoformat(
                            web_ticket["createdAt"].replace("Z", "+00:00")
                        ) if web_ticket.get("createdAt") else datetime.now()
                    )
                    
                    session.add(ticket)
                    session.commit()
                    
                    synced_ids.append(web_ticket["id"])
                    synced += 1
                    
                    logger.info(f"Synced ticket: {ticket.ticket_number}")
                    
                    # Trigger AI analysis in background
                    threading.Thread(
                        target=self._analyze_ticket_async,
                        args=(ticket.id,),
                        daemon=True
                    ).start()
                    
            except Exception as e:
                errors += 1
                error_messages.append(f"Ticket {web_ticket.get('ticketNumber')}: {e}")
                logger.error(f"Failed to sync ticket: {e}")
        
        # Mark tickets as synced on website via v1 API
        if synced_ids:
            for ticket_id in synced_ids:
                # Try v1 API first
                result = self._make_request(
                    "PATCH",
                    "/v1/sync/tickets",
                    json={"ticketId": ticket_id, "adminPortalId": ticket_id}
                )
                if not result:
                    # Fallback to legacy
                    self._make_request(
                        "PATCH",
                        f"/support/tickets/{ticket_id}",
                        json={"syncedToAdmin": True}
                    )
        
        logger.info(f"Ticket sync complete: {synced} synced, {errors} errors")
        return (synced, errors, error_messages)
    
    def _analyze_ticket_async(self, ticket_id: int):
        """Analyze ticket with AI in background."""
        try:
            self.analyze_ticket(ticket_id)
        except Exception as e:
            logger.error(f"Async ticket analysis failed: {e}")
    
    def analyze_ticket(self, ticket_id: int) -> Dict[str, Any]:
        """
        Analyze a ticket with AI to understand the issue and suggest solutions.
        
        Returns:
            Dict with analysis results
        """
        if not self.client:
            logger.warning("No OpenAI client - skipping ticket analysis")
            return {"error": "AI not configured"}
        
        db = get_db()
        result = {
            "ticket_id": ticket_id,
            "analyzed": False,
            "is_technical": False,
            "suggested_category": None,
            "suggested_priority": None,
            "analysis": None,
            "suggested_solution": None,
            "can_auto_resolve": False
        }
        
        with db.session() as session:
            ticket = session.query(SupportTicket).get(ticket_id)
            if not ticket:
                return {"error": "Ticket not found"}
            
            # Build context
            context = f"""
Support Ticket: {ticket.ticket_number}
Subject: {ticket.subject}
Category: {ticket.category}
Priority: {ticket.priority}

Description:
{ticket.description}

Customer: {ticket.customer_name} ({ticket.customer_email})
Company: {ticket.company_name or 'N/A'}
"""
            
            if ticket.project:
                context += f"""
Related Project: {ticket.project.name}
Project URL: {ticket.project.url}
Project Status: {ticket.project.current_status}
"""
            
            # AI Analysis
            messages = [
                {
                    "role": "system",
                    "content": """Je bent een expert IT support engineer. Analyseer het support ticket en bepaal:

1. Is dit een technisch probleem dat automatisch opgelost kan worden?
2. Wat is de juiste categorie? (bug, feature_request, question, performance, security, billing, other)
3. Wat is de juiste prioriteit? (low, medium, high, urgent)
4. Wat is de waarschijnlijke oorzaak?
5. Wat is de voorgestelde oplossing?
6. Kan dit automatisch worden opgelost door een script/restart/fix?

Antwoord in JSON:
{
    "is_technical": true/false,
    "category": "bug",
    "priority": "high",
    "analysis": "Korte analyse van het probleem",
    "root_cause": "Waarschijnlijke oorzaak",
    "suggested_solution": "Voorgestelde oplossing",
    "can_auto_resolve": true/false,
    "auto_resolve_action": "restart_service/redeploy/clear_cache/null",
    "confidence": 0.8,
    "customer_response": "Vriendelijke respons voor de klant"
}"""
                },
                {
                    "role": "user",
                    "content": context
                }
            ]
            
            try:
                response = self.client.chat.completions.create(
                    model="gpt-4o",
                    messages=messages,
                    response_format={"type": "json_object"},
                    temperature=0.3
                )
                
                analysis = json.loads(response.choices[0].message.content)
                
                # Update ticket with analysis
                ticket.ai_analyzed = True
                ticket.ai_analysis = analysis.get("analysis")
                ticket.ai_suggested_solution = analysis.get("suggested_solution")
                ticket.ai_confidence = analysis.get("confidence", 0.5)
                
                # Update category and priority if confidence is high
                if analysis.get("confidence", 0) >= 0.8:
                    if analysis.get("category"):
                        ticket.category = analysis["category"]
                    if analysis.get("priority"):
                        ticket.priority = analysis["priority"]
                
                # Set status to AI processing if can auto-resolve
                if analysis.get("can_auto_resolve") and analysis.get("confidence", 0) >= 0.8:
                    ticket.status = TicketStatus.AI_PROCESSING.value
                    ticket.assigned_to = "ai"
                
                session.commit()
                
                result.update({
                    "analyzed": True,
                    "is_technical": analysis.get("is_technical", False),
                    "suggested_category": analysis.get("category"),
                    "suggested_priority": analysis.get("priority"),
                    "analysis": analysis.get("analysis"),
                    "suggested_solution": analysis.get("suggested_solution"),
                    "can_auto_resolve": analysis.get("can_auto_resolve", False),
                    "auto_resolve_action": analysis.get("auto_resolve_action"),
                    "confidence": analysis.get("confidence"),
                    "customer_response": analysis.get("customer_response")
                })
                
                logger.info(f"Analyzed ticket {ticket.ticket_number}: {analysis.get('category')}, can_auto={analysis.get('can_auto_resolve')}")
                
                # If can auto-resolve, attempt it
                if analysis.get("can_auto_resolve") and ticket.project_id:
                    self._attempt_auto_resolve(ticket.id, analysis)
                
            except Exception as e:
                logger.error(f"AI analysis failed: {e}")
                result["error"] = str(e)
        
        return result
    
    def _attempt_auto_resolve(self, ticket_id: int, analysis: Dict):
        """Attempt to auto-resolve a ticket using AI troubleshooter."""
        db = get_db()
        
        with db.session() as session:
            ticket = session.query(SupportTicket).get(ticket_id)
            if not ticket or not ticket.project:
                return
            
            # Add internal message about auto-resolve attempt
            self.add_message(
                ticket_id,
                sender_type="ai",
                sender_name="AI Support Agent",
                message=f"🤖 Automatische analyse voltooid.\n\n"
                        f"**Analyse:** {analysis.get('analysis')}\n\n"
                        f"**Oorzaak:** {analysis.get('root_cause')}\n\n"
                        f"**Actie:** Poging tot automatische oplossing...",
                is_internal=True
            )
            
            # Create MonitorIssue for tracking
            issue = MonitorIssue(
                project_id=ticket.project_id,
                title=f"[Ticket {ticket.ticket_number}] {ticket.subject}",
                description=f"Automatisch aangemaakt vanuit support ticket.\n\n{ticket.description}",
                severity=self._priority_to_severity(ticket.priority),
                status=IssueStatus.INVESTIGATING.value,
                error_message=analysis.get("root_cause"),
                ai_analysis=analysis.get("analysis"),
                ai_suggested_fix=analysis.get("suggested_solution")
            )
            session.add(issue)
            session.flush()
            
            ticket.linked_issue_id = issue.id
            ticket.ai_auto_resolve_attempted = True
            session.commit()
            
            # Use AI troubleshooter to fix
            troubleshooter = get_troubleshooter()
            fix_result = troubleshooter.analyze_and_fix(issue.id, auto_fix=True)
            
            # Update ticket based on result
            with db.session() as session:
                ticket = session.query(SupportTicket).get(ticket_id)
                issue = session.query(MonitorIssue).get(issue.id)
                
                if fix_result.get("success"):
                    # Auto-resolved!
                    ticket.status = TicketStatus.RESOLVED.value
                    ticket.resolved_by = "ai"
                    ticket.resolved_at = datetime.now()
                    ticket.resolution = fix_result.get("fixes_applied", [{}])[0].get("description", "Automatisch opgelost")
                    
                    self.add_message(
                        ticket_id,
                        sender_type="ai",
                        sender_name="AI Support Agent",
                        message=f"✅ **Probleem opgelost!**\n\n"
                                f"{ticket.resolution}\n\n"
                                f"Uw probleem is automatisch opgelost. "
                                f"Als u nog vragen heeft, laat het ons weten.",
                        is_internal=False
                    )
                    
                    logger.info(f"Auto-resolved ticket {ticket.ticket_number}")
                    
                else:
                    # Could not auto-resolve
                    ticket.status = TicketStatus.IN_PROGRESS.value
                    ticket.assigned_to = "bart"  # Assign to human
                    
                    self.add_message(
                        ticket_id,
                        sender_type="ai",
                        sender_name="AI Support Agent",
                        message=f"⚠️ Automatische oplossing niet mogelijk.\n\n"
                                f"**Analyse:** {analysis.get('analysis')}\n\n"
                                f"**Aanbeveling:** {analysis.get('suggested_solution')}\n\n"
                                f"Ticket is toegewezen aan een medewerker.",
                        is_internal=True
                    )
                    
                    logger.info(f"Could not auto-resolve ticket {ticket.ticket_number}, assigned to human")
                
                session.commit()
    
    def _priority_to_severity(self, priority: str) -> str:
        """Convert ticket priority to issue severity."""
        mapping = {
            "low": IssueSeverity.LOW.value,
            "medium": IssueSeverity.MEDIUM.value,
            "high": IssueSeverity.HIGH.value,
            "urgent": IssueSeverity.CRITICAL.value
        }
        return mapping.get(priority, IssueSeverity.MEDIUM.value)
    
    def add_message(
        self,
        ticket_id: int,
        sender_type: str,
        sender_name: str,
        message: str,
        is_internal: bool = False,
        sender_email: str = None
    ) -> Optional[TicketMessage]:
        """Add a message to a ticket thread."""
        db = get_db()
        
        with db.session() as session:
            ticket = session.query(SupportTicket).get(ticket_id)
            if not ticket:
                return None
            
            msg = TicketMessage(
                ticket_id=ticket_id,
                sender_type=sender_type,
                sender_name=sender_name,
                sender_email=sender_email,
                message=message,
                is_internal=is_internal,
                ai_generated=(sender_type == "ai")
            )
            
            session.add(msg)
            
            # Update ticket
            ticket.updated_at = datetime.now()
            if sender_type == "support" and not ticket.first_response_at:
                ticket.first_response_at = datetime.now()
            
            session.commit()
            
            logger.debug(f"Added message to ticket {ticket.ticket_number}")
            return msg
    
    def get_ticket(self, ticket_id: int) -> Optional[Dict]:
        """Get a ticket with all messages."""
        db = get_db()
        
        with db.session() as session:
            ticket = session.query(SupportTicket).get(ticket_id)
            if not ticket:
                return None
            
            return {
                "id": ticket.id,
                "ticket_number": ticket.ticket_number,
                "customer_name": ticket.customer_name,
                "customer_email": ticket.customer_email,
                "company_name": ticket.company_name,
                "subject": ticket.subject,
                "description": ticket.description,
                "category": ticket.category,
                "priority": ticket.priority,
                "status": ticket.status,
                "assigned_to": ticket.assigned_to,
                "project": ticket.project.name if ticket.project else None,
                "ai_analyzed": ticket.ai_analyzed,
                "ai_analysis": ticket.ai_analysis,
                "ai_suggested_solution": ticket.ai_suggested_solution,
                "resolution": ticket.resolution,
                "resolved_by": ticket.resolved_by,
                "resolved_at": ticket.resolved_at.isoformat() if ticket.resolved_at else None,
                "created_at": ticket.created_at.isoformat(),
                "updated_at": ticket.updated_at.isoformat(),
                "messages": [{
                    "id": m.id,
                    "sender_type": m.sender_type,
                    "sender_name": m.sender_name,
                    "message": m.message,
                    "is_internal": m.is_internal,
                    "ai_generated": m.ai_generated,
                    "created_at": m.created_at.isoformat()
                } for m in ticket.messages]
            }
    
    def get_tickets(
        self,
        status: str = None,
        category: str = None,
        assigned_to: str = None,
        limit: int = 50
    ) -> List[Dict]:
        """Get tickets with optional filters."""
        db = get_db()
        
        with db.session() as session:
            query = session.query(SupportTicket)
            
            if status:
                query = query.filter_by(status=status)
            if category:
                query = query.filter_by(category=category)
            if assigned_to:
                query = query.filter_by(assigned_to=assigned_to)
            
            tickets = query.order_by(
                SupportTicket.created_at.desc()
            ).limit(limit).all()
            
            return [{
                "id": t.id,
                "ticket_number": t.ticket_number,
                "customer_name": t.customer_name,
                "company_name": t.company_name,
                "subject": t.subject,
                "category": t.category,
                "priority": t.priority,
                "status": t.status,
                "assigned_to": t.assigned_to,
                "ai_analyzed": t.ai_analyzed,
                "created_at": t.created_at.isoformat(),
                "updated_at": t.updated_at.isoformat()
            } for t in tickets]
    
    def update_ticket_status(self, ticket_id: int, status: str) -> bool:
        """Update ticket status."""
        db = get_db()
        
        with db.session() as session:
            ticket = session.query(SupportTicket).get(ticket_id)
            if not ticket:
                return False
            
            ticket.status = status
            ticket.updated_at = datetime.now()
            
            if status in [TicketStatus.RESOLVED.value, TicketStatus.CLOSED.value]:
                if not ticket.resolved_at:
                    ticket.resolved_at = datetime.now()
            
            session.commit()
            return True
    
    def assign_ticket(self, ticket_id: int, assigned_to: str) -> bool:
        """Assign ticket to someone."""
        db = get_db()
        
        with db.session() as session:
            ticket = session.query(SupportTicket).get(ticket_id)
            if not ticket:
                return False
            
            ticket.assigned_to = assigned_to
            ticket.updated_at = datetime.now()
            
            if ticket.status == TicketStatus.OPEN.value:
                ticket.status = TicketStatus.IN_PROGRESS.value
            
            session.commit()
            return True
    
    def get_stats(self) -> Dict[str, Any]:
        """Get support statistics."""
        db = get_db()
        
        with db.session() as session:
            total = session.query(SupportTicket).count()
            open_tickets = session.query(SupportTicket).filter_by(
                status=TicketStatus.OPEN.value
            ).count()
            in_progress = session.query(SupportTicket).filter_by(
                status=TicketStatus.IN_PROGRESS.value
            ).count()
            ai_processing = session.query(SupportTicket).filter_by(
                status=TicketStatus.AI_PROCESSING.value
            ).count()
            resolved = session.query(SupportTicket).filter_by(
                status=TicketStatus.RESOLVED.value
            ).count()
            
            # AI stats
            ai_analyzed = session.query(SupportTicket).filter_by(
                ai_analyzed=True
            ).count()
            ai_resolved = session.query(SupportTicket).filter_by(
                resolved_by="ai"
            ).count()
            
            return {
                "total": total,
                "open": open_tickets,
                "in_progress": in_progress,
                "ai_processing": ai_processing,
                "resolved": resolved,
                "ai_analyzed": ai_analyzed,
                "ai_resolved": ai_resolved,
                "ai_resolution_rate": (ai_resolved / resolved * 100) if resolved > 0 else 0
            }


# Singleton
_support_service: Optional[SupportService] = None


def get_support_service() -> SupportService:
    """Get the support service instance."""
    global _support_service
    if _support_service is None:
        _support_service = SupportService()
    return _support_service


class SupportSyncScheduler:
    """Background scheduler voor ticket synchronisatie."""
    
    _instance = None
    
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
        self._thread = None
        self._interval = 60  # Check every minute
        self._service = get_support_service()
    
    def start(self):
        if self._running:
            return
        
        self._running = True
        self._thread = threading.Thread(target=self._sync_loop, daemon=True)
        self._thread.start()
        logger.info("Support sync scheduler started")
    
    def stop(self):
        self._running = False
    
    def _sync_loop(self):
        time.sleep(15)  # Initial delay
        
        while self._running:
            try:
                self._service.sync_tickets_from_website()
            except Exception as e:
                logger.error(f"Support sync error: {e}")
            
            # Wait
            for _ in range(self._interval):
                if not self._running:
                    break
                time.sleep(1)


_support_scheduler = None


def start_support_sync():
    """Start support ticket sync."""
    global _support_scheduler
    if _support_scheduler is None:
        _support_scheduler = SupportSyncScheduler()
    _support_scheduler.start()
    return _support_scheduler


def stop_support_sync():
    """Stop support sync."""
    global _support_scheduler
    if _support_scheduler:
        _support_scheduler.stop()
