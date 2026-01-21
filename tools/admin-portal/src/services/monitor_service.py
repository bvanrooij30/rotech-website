"""
Monitor Service - Background monitoring van alle projecten.
Voert health checks uit, detecteert issues, en triggert AI troubleshooting.
"""

import threading
import time
import ssl
import socket
import json
import re
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any, Tuple
from urllib.parse import urlparse
import requests
from requests.exceptions import RequestException, Timeout, SSLError

from ..database import get_db
from ..database.models import (
    MonitoredProject, HealthCheck, MonitorIssue, IssueSolution,
    HealthStatus, IssueSeverity, IssueStatus
)
from ..utils.config import Config, logger


class MonitorService:
    """Service voor project monitoring en health checks."""
    
    _instance: Optional['MonitorService'] = None
    
    def __new__(cls):
        """Singleton pattern."""
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = False
        return cls._instance
    
    def __init__(self):
        if self._initialized:
            return
        
        self._initialized = True
        self._running = False
        self._thread: Optional[threading.Thread] = None
        self._check_interval = 60  # Base check interval (seconds)
        self._on_status_change: Optional[callable] = None
        self._on_issue_detected: Optional[callable] = None
        self._ai_troubleshooter = None
    
    def set_callbacks(
        self, 
        on_status_change: callable = None,
        on_issue_detected: callable = None
    ):
        """Set callback functions."""
        self._on_status_change = on_status_change
        self._on_issue_detected = on_issue_detected
    
    def set_ai_troubleshooter(self, troubleshooter):
        """Set the AI troubleshooter for auto-fixing."""
        self._ai_troubleshooter = troubleshooter
    
    def start(self):
        """Start de monitoring loop."""
        if self._running:
            logger.warning("Monitor service already running")
            return
        
        self._running = True
        self._thread = threading.Thread(target=self._monitor_loop, daemon=True)
        self._thread.start()
        logger.info("Monitor service started")
    
    def stop(self):
        """Stop de monitoring."""
        self._running = False
        logger.info("Monitor service stopped")
    
    @property
    def is_running(self) -> bool:
        return self._running
    
    def _monitor_loop(self):
        """Main monitoring loop."""
        # Initial delay
        time.sleep(5)
        
        while self._running:
            try:
                self._run_checks()
            except Exception as e:
                logger.error(f"Monitor loop error: {e}")
            
            # Wait before next cycle
            time.sleep(self._check_interval)
    
    def _run_checks(self):
        """Run health checks voor alle actieve projecten."""
        db = get_db()
        
        with db.session() as session:
            projects = session.query(MonitoredProject).filter_by(is_active=True).all()
            
            for project in projects:
                # Check if it's time to check this project
                if project.last_check:
                    next_check = project.last_check + timedelta(seconds=project.check_interval)
                    if datetime.now() < next_check:
                        continue
                
                try:
                    self._check_project(session, project)
                except Exception as e:
                    logger.error(f"Error checking {project.name}: {e}")
            
            session.commit()
    
    def check_project_now(self, project_id: int) -> Dict[str, Any]:
        """Voer direct een check uit voor een specifiek project."""
        db = get_db()
        
        with db.session() as session:
            project = session.query(MonitoredProject).get(project_id)
            if not project:
                return {"error": "Project not found"}
            
            result = self._check_project(session, project)
            session.commit()
            return result
    
    def _check_project(self, session, project: MonitoredProject) -> Dict[str, Any]:
        """Voer alle relevante checks uit voor een project."""
        results = {
            "project_id": project.id,
            "project_name": project.name,
            "checks": [],
            "overall_status": HealthStatus.HEALTHY.value,
            "issues": []
        }
        
        previous_status = project.current_status
        
        # HTTP check
        if project.url:
            http_result = self._check_http(project.url)
            results["checks"].append(http_result)
            
            # Save health check
            check = HealthCheck(
                project_id=project.id,
                status=http_result["status"],
                response_time=http_result.get("response_time"),
                status_code=http_result.get("status_code"),
                check_type="http",
                endpoint=project.url,
                error_message=http_result.get("error")
            )
            session.add(check)
            
            # Update project status based on HTTP check
            if http_result["status"] == HealthStatus.DOWN.value:
                results["overall_status"] = HealthStatus.DOWN.value
            elif http_result["status"] == HealthStatus.DEGRADED.value:
                if results["overall_status"] != HealthStatus.DOWN.value:
                    results["overall_status"] = HealthStatus.DEGRADED.value
        
        # Health endpoint check
        if project.health_endpoint:
            health_result = self._check_health_endpoint(project.health_endpoint)
            results["checks"].append(health_result)
            
            check = HealthCheck(
                project_id=project.id,
                status=health_result["status"],
                response_time=health_result.get("response_time"),
                status_code=health_result.get("status_code"),
                check_type="api",
                endpoint=project.health_endpoint,
                error_message=health_result.get("error"),
                response_body=health_result.get("body", "")[:1000]  # Truncate
            )
            session.add(check)
        
        # SSL check
        if project.url and project.url.startswith("https"):
            ssl_result = self._check_ssl(project.url)
            results["checks"].append(ssl_result)
            
            check = HealthCheck(
                project_id=project.id,
                status=ssl_result["status"],
                check_type="ssl",
                endpoint=project.url,
                ssl_valid=ssl_result.get("valid"),
                ssl_expires_at=ssl_result.get("expires_at"),
                error_message=ssl_result.get("error")
            )
            session.add(check)
        
        # Update project
        project.last_check = datetime.now()
        project.current_status = results["overall_status"]
        project.total_checks += 1
        
        # Get response time from HTTP check
        for check in results["checks"]:
            if check.get("type") == "http" and check.get("response_time"):
                project.last_response_time = check["response_time"]
                break
        
        # Detect issues
        if results["overall_status"] in [HealthStatus.DOWN.value, HealthStatus.DEGRADED.value]:
            issue = self._create_issue(session, project, results)
            if issue:
                results["issues"].append({
                    "id": issue.id,
                    "title": issue.title,
                    "severity": issue.severity
                })
                
                # Trigger AI troubleshooter if available
                if self._ai_troubleshooter and issue.severity in [
                    IssueSeverity.HIGH.value, 
                    IssueSeverity.CRITICAL.value
                ]:
                    try:
                        self._ai_troubleshooter.analyze_and_fix(issue.id)
                    except Exception as e:
                        logger.error(f"AI troubleshooter error: {e}")
        
        # Status change callback
        if previous_status != project.current_status and self._on_status_change:
            self._on_status_change(project, previous_status, project.current_status)
        
        logger.debug(f"Checked {project.name}: {results['overall_status']}")
        return results
    
    def _check_http(self, url: str, timeout: int = 10) -> Dict[str, Any]:
        """HTTP health check."""
        result = {
            "type": "http",
            "url": url,
            "status": HealthStatus.HEALTHY.value
        }
        
        try:
            start = time.time()
            response = requests.get(url, timeout=timeout, allow_redirects=True)
            elapsed = int((time.time() - start) * 1000)  # ms
            
            result["response_time"] = elapsed
            result["status_code"] = response.status_code
            
            if response.status_code >= 500:
                result["status"] = HealthStatus.DOWN.value
                result["error"] = f"Server error: {response.status_code}"
            elif response.status_code >= 400:
                result["status"] = HealthStatus.DEGRADED.value
                result["error"] = f"Client error: {response.status_code}"
            elif elapsed > 5000:  # Slow response
                result["status"] = HealthStatus.DEGRADED.value
                result["error"] = f"Slow response: {elapsed}ms"
            
        except Timeout:
            result["status"] = HealthStatus.DOWN.value
            result["error"] = f"Timeout after {timeout}s"
        except SSLError as e:
            result["status"] = HealthStatus.DOWN.value
            result["error"] = f"SSL Error: {str(e)}"
        except RequestException as e:
            result["status"] = HealthStatus.DOWN.value
            result["error"] = str(e)
        
        return result
    
    def _check_health_endpoint(self, url: str, timeout: int = 10) -> Dict[str, Any]:
        """Check /health or /api/health endpoint."""
        result = {
            "type": "health_api",
            "url": url,
            "status": HealthStatus.HEALTHY.value
        }
        
        try:
            start = time.time()
            response = requests.get(url, timeout=timeout)
            elapsed = int((time.time() - start) * 1000)
            
            result["response_time"] = elapsed
            result["status_code"] = response.status_code
            
            if response.status_code == 200:
                try:
                    data = response.json()
                    result["body"] = json.dumps(data)
                    
                    # Check for status field in response
                    if data.get("status") in ["error", "unhealthy", "down"]:
                        result["status"] = HealthStatus.DOWN.value
                        result["error"] = data.get("message", "Health check failed")
                    elif data.get("status") in ["degraded", "warning"]:
                        result["status"] = HealthStatus.DEGRADED.value
                        result["error"] = data.get("message", "Service degraded")
                        
                except json.JSONDecodeError:
                    result["body"] = response.text[:500]
            else:
                result["status"] = HealthStatus.DOWN.value
                result["error"] = f"Health endpoint returned {response.status_code}"
                
        except Exception as e:
            result["status"] = HealthStatus.DOWN.value
            result["error"] = str(e)
        
        return result
    
    def _check_ssl(self, url: str) -> Dict[str, Any]:
        """Check SSL certificate validity and expiration."""
        result = {
            "type": "ssl",
            "url": url,
            "status": HealthStatus.HEALTHY.value,
            "valid": True
        }
        
        try:
            parsed = urlparse(url)
            hostname = parsed.hostname
            port = parsed.port or 443
            
            context = ssl.create_default_context()
            with socket.create_connection((hostname, port), timeout=10) as sock:
                with context.wrap_socket(sock, server_hostname=hostname) as ssock:
                    cert = ssock.getpeercert()
                    
                    # Parse expiration date
                    expires_str = cert.get('notAfter')
                    if expires_str:
                        expires = datetime.strptime(expires_str, '%b %d %H:%M:%S %Y %Z')
                        result["expires_at"] = expires
                        
                        days_until_expiry = (expires - datetime.now()).days
                        
                        if days_until_expiry < 0:
                            result["status"] = HealthStatus.DOWN.value
                            result["valid"] = False
                            result["error"] = "SSL certificate expired!"
                        elif days_until_expiry < 7:
                            result["status"] = HealthStatus.DEGRADED.value
                            result["error"] = f"SSL expires in {days_until_expiry} days"
                        elif days_until_expiry < 30:
                            result["status"] = HealthStatus.DEGRADED.value
                            result["error"] = f"SSL expires in {days_until_expiry} days"
                    
        except ssl.SSLCertVerificationError as e:
            result["status"] = HealthStatus.DOWN.value
            result["valid"] = False
            result["error"] = f"SSL verification failed: {str(e)}"
        except Exception as e:
            result["status"] = HealthStatus.UNKNOWN.value
            result["error"] = f"SSL check failed: {str(e)}"
        
        return result
    
    def _create_issue(
        self, 
        session, 
        project: MonitoredProject, 
        check_results: Dict
    ) -> Optional[MonitorIssue]:
        """Create an issue from failed checks."""
        # Check if similar open issue already exists
        existing = session.query(MonitorIssue).filter(
            MonitorIssue.project_id == project.id,
            MonitorIssue.status.in_([IssueStatus.OPEN.value, IssueStatus.INVESTIGATING.value])
        ).first()
        
        if existing:
            # Update existing issue
            existing.updated_at = datetime.now()
            return None
        
        # Determine severity based on checks
        severity = IssueSeverity.MEDIUM.value
        error_messages = []
        
        for check in check_results.get("checks", []):
            if check.get("error"):
                error_messages.append(f"{check['type']}: {check['error']}")
            
            if check.get("status") == HealthStatus.DOWN.value:
                severity = IssueSeverity.CRITICAL.value
        
        # Create issue
        issue = MonitorIssue(
            project_id=project.id,
            title=f"{project.name} - {check_results['overall_status'].upper()}",
            description="\n".join(error_messages),
            severity=severity,
            status=IssueStatus.OPEN.value,
            error_type=check_results.get("checks", [{}])[0].get("type", "unknown"),
            error_message="\n".join(error_messages)
        )
        session.add(issue)
        session.flush()  # Get ID
        
        logger.warning(f"Issue detected: {issue.title}")
        
        # Callback
        if self._on_issue_detected:
            self._on_issue_detected(issue)
        
        return issue
    
    def get_project_stats(self, project_id: int, hours: int = 24) -> Dict[str, Any]:
        """Get stats for a project over the last N hours."""
        db = get_db()
        since = datetime.now() - timedelta(hours=hours)
        
        with db.session() as session:
            project = session.query(MonitoredProject).get(project_id)
            if not project:
                return {"error": "Project not found"}
            
            # Get checks
            checks = session.query(HealthCheck).filter(
                HealthCheck.project_id == project_id,
                HealthCheck.checked_at >= since
            ).all()
            
            # Calculate stats
            total = len(checks)
            healthy = sum(1 for c in checks if c.status == HealthStatus.HEALTHY.value)
            response_times = [c.response_time for c in checks if c.response_time]
            
            return {
                "project_name": project.name,
                "period_hours": hours,
                "total_checks": total,
                "healthy_checks": healthy,
                "uptime_percentage": (healthy / total * 100) if total > 0 else 100,
                "avg_response_time": sum(response_times) / len(response_times) if response_times else 0,
                "max_response_time": max(response_times) if response_times else 0,
                "min_response_time": min(response_times) if response_times else 0,
                "current_status": project.current_status,
                "last_check": project.last_check.isoformat() if project.last_check else None
            }
    
    def get_all_status(self) -> List[Dict[str, Any]]:
        """Get status overview of all projects."""
        db = get_db()
        
        with db.session() as session:
            projects = session.query(MonitoredProject).filter_by(is_active=True).all()
            
            return [{
                "id": p.id,
                "name": p.name,
                "type": p.project_type,
                "url": p.url,
                "status": p.current_status,
                "last_check": p.last_check.isoformat() if p.last_check else None,
                "last_response_time": p.last_response_time,
                "uptime": p.uptime_percentage
            } for p in projects]


# Global instance
_monitor_service: Optional[MonitorService] = None


def get_monitor_service() -> MonitorService:
    """Get the global monitor service instance."""
    global _monitor_service
    if _monitor_service is None:
        _monitor_service = MonitorService()
    return _monitor_service


def start_monitoring():
    """Start the monitoring service."""
    service = get_monitor_service()
    service.start()
    return service


def stop_monitoring():
    """Stop the monitoring service."""
    service = get_monitor_service()
    service.stop()
