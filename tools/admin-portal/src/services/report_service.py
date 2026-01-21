"""
Report Service - Genereer dagelijkse/wekelijkse monitoring rapporten.
Slaat rapporten op en kan AI-powered samenvattingen maken.
"""

import os
import json
import threading
import time
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any

from ..database import get_db
from ..database.models import (
    MonitoredProject, HealthCheck, MonitorIssue, MonitorReport,
    HealthStatus, IssueStatus
)
from ..utils.config import Config, logger


class ReportService:
    """Service voor het genereren van monitoring rapporten."""
    
    _instance: Optional['ReportService'] = None
    
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
        self._report_dir = os.path.join(Config.DATA_DIR, "reports")
        
        # Ensure report directory exists
        os.makedirs(self._report_dir, exist_ok=True)
    
    def start_scheduler(self):
        """Start de dagelijkse rapport scheduler."""
        if self._running:
            return
        
        self._running = True
        self._thread = threading.Thread(target=self._scheduler_loop, daemon=True)
        self._thread.start()
        logger.info("Report scheduler started")
    
    def stop_scheduler(self):
        """Stop de scheduler."""
        self._running = False
    
    def _scheduler_loop(self):
        """Check elke uur of het tijd is voor een rapport."""
        while self._running:
            try:
                now = datetime.now()
                
                # Generate daily report at 6:00 AM
                if now.hour == 6 and now.minute < 5:
                    self.generate_daily_report()
                
                # Generate weekly report on Monday at 7:00 AM
                if now.weekday() == 0 and now.hour == 7 and now.minute < 5:
                    self.generate_weekly_report()
                
            except Exception as e:
                logger.error(f"Report scheduler error: {e}")
            
            # Wait 5 minutes
            time.sleep(300)
    
    def generate_daily_report(self, date: datetime = None) -> Dict[str, Any]:
        """
        Genereer een dagelijks rapport.
        
        Args:
            date: Datum voor het rapport (default: gisteren)
        """
        if date is None:
            date = datetime.now() - timedelta(days=1)
        
        period_start = date.replace(hour=0, minute=0, second=0, microsecond=0)
        period_end = period_start + timedelta(days=1)
        
        return self._generate_report("daily", period_start, period_end)
    
    def generate_weekly_report(self, date: datetime = None) -> Dict[str, Any]:
        """Genereer een wekelijks rapport."""
        if date is None:
            date = datetime.now()
        
        # Start from last Monday
        days_since_monday = date.weekday()
        period_end = date.replace(hour=0, minute=0, second=0, microsecond=0)
        period_start = period_end - timedelta(days=7)
        
        return self._generate_report("weekly", period_start, period_end)
    
    def _generate_report(
        self, 
        report_type: str, 
        period_start: datetime, 
        period_end: datetime
    ) -> Dict[str, Any]:
        """Generate a monitoring report."""
        db = get_db()
        
        report_data = {
            "type": report_type,
            "period_start": period_start.isoformat(),
            "period_end": period_end.isoformat(),
            "generated_at": datetime.now().isoformat(),
            "projects": [],
            "summary": {}
        }
        
        with db.session() as session:
            # Get all projects
            projects = session.query(MonitoredProject).filter_by(is_active=True).all()
            
            total_checks = 0
            total_healthy = 0
            total_issues = 0
            issues_resolved = 0
            issues_auto_resolved = 0
            
            for project in projects:
                # Get health checks for this period
                checks = session.query(HealthCheck).filter(
                    HealthCheck.project_id == project.id,
                    HealthCheck.checked_at >= period_start,
                    HealthCheck.checked_at < period_end
                ).all()
                
                # Get issues for this period
                issues = session.query(MonitorIssue).filter(
                    MonitorIssue.project_id == project.id,
                    MonitorIssue.detected_at >= period_start,
                    MonitorIssue.detected_at < period_end
                ).all()
                
                # Calculate stats
                check_count = len(checks)
                healthy_count = sum(1 for c in checks if c.status == HealthStatus.HEALTHY.value)
                response_times = [c.response_time for c in checks if c.response_time]
                
                project_data = {
                    "id": project.id,
                    "name": project.name,
                    "type": project.project_type,
                    "url": project.url,
                    "current_status": project.current_status,
                    "stats": {
                        "total_checks": check_count,
                        "healthy_checks": healthy_count,
                        "uptime_percentage": (healthy_count / check_count * 100) if check_count > 0 else 100,
                        "avg_response_time": sum(response_times) / len(response_times) if response_times else 0,
                        "max_response_time": max(response_times) if response_times else 0
                    },
                    "issues": [{
                        "title": i.title,
                        "severity": i.severity,
                        "status": i.status,
                        "resolved_by": i.resolved_by,
                        "detected_at": i.detected_at.isoformat()
                    } for i in issues]
                }
                
                report_data["projects"].append(project_data)
                
                # Update totals
                total_checks += check_count
                total_healthy += healthy_count
                total_issues += len(issues)
                issues_resolved += sum(1 for i in issues if i.status == IssueStatus.RESOLVED.value)
                issues_auto_resolved += sum(1 for i in issues if i.resolved_by == "ai_auto")
            
            # Summary
            report_data["summary"] = {
                "total_projects": len(projects),
                "total_checks": total_checks,
                "overall_uptime": (total_healthy / total_checks * 100) if total_checks > 0 else 100,
                "total_issues": total_issues,
                "issues_resolved": issues_resolved,
                "issues_auto_resolved": issues_auto_resolved,
                "issues_open": total_issues - issues_resolved
            }
            
            # Generate summary text
            summary_text = self._generate_summary_text(report_data)
            report_data["summary_text"] = summary_text
            
            # Save to database
            db_report = MonitorReport(
                report_type=report_type,
                period_start=period_start,
                period_end=period_end,
                total_projects=len(projects),
                total_checks=total_checks,
                total_issues=total_issues,
                issues_resolved=issues_resolved,
                issues_auto_resolved=issues_auto_resolved,
                average_uptime=report_data["summary"]["overall_uptime"],
                summary=summary_text,
                details=json.dumps(report_data)
            )
            
            # Save to file
            filename = f"{report_type}_{period_start.strftime('%Y-%m-%d')}.json"
            filepath = os.path.join(self._report_dir, filename)
            
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(report_data, f, indent=2, ensure_ascii=False)
            
            db_report.file_path = filepath
            session.add(db_report)
            session.commit()
            
            logger.info(f"Generated {report_type} report: {filepath}")
        
        return report_data
    
    def _generate_summary_text(self, report_data: Dict) -> str:
        """Generate a human-readable summary."""
        summary = report_data["summary"]
        period = f"{report_data['period_start'][:10]} - {report_data['period_end'][:10]}"
        
        text = f"""
=== MONITORING RAPPORT ===
Periode: {period}
Type: {report_data['type'].upper()}

📊 OVERZICHT
• Totaal projecten: {summary['total_projects']}
• Totaal checks: {summary['total_checks']}
• Overall uptime: {summary['overall_uptime']:.2f}%

⚠️ ISSUES
• Totaal issues: {summary['total_issues']}
• Opgelost: {summary['issues_resolved']}
• Auto-opgelost door AI: {summary['issues_auto_resolved']}
• Nog open: {summary['issues_open']}

📈 PROJECT STATUS
"""
        
        for project in report_data["projects"]:
            status_icon = "✅" if project["current_status"] == "healthy" else "⚠️" if project["current_status"] == "degraded" else "❌"
            text += f"\n{status_icon} {project['name']}"
            text += f"\n   Uptime: {project['stats']['uptime_percentage']:.1f}%"
            text += f" | Avg Response: {project['stats']['avg_response_time']:.0f}ms"
            if project["issues"]:
                text += f"\n   Issues: {len(project['issues'])}"
        
        text += "\n\n=== EINDE RAPPORT ==="
        
        return text
    
    def get_recent_reports(self, limit: int = 10) -> List[Dict]:
        """Get recent reports."""
        db = get_db()
        
        with db.session() as session:
            reports = session.query(MonitorReport).order_by(
                MonitorReport.generated_at.desc()
            ).limit(limit).all()
            
            return [{
                "id": r.id,
                "type": r.report_type,
                "period_start": r.period_start.isoformat(),
                "period_end": r.period_end.isoformat(),
                "generated_at": r.generated_at.isoformat(),
                "summary": {
                    "projects": r.total_projects,
                    "checks": r.total_checks,
                    "uptime": r.average_uptime,
                    "issues": r.total_issues,
                    "auto_resolved": r.issues_auto_resolved
                },
                "file_path": r.file_path
            } for r in reports]
    
    def get_report_content(self, report_id: int) -> Optional[Dict]:
        """Get full report content."""
        db = get_db()
        
        with db.session() as session:
            report = session.query(MonitorReport).get(report_id)
            if not report:
                return None
            
            if report.details:
                return json.loads(report.details)
            
            # Try to read from file
            if report.file_path and os.path.exists(report.file_path):
                with open(report.file_path, 'r', encoding='utf-8') as f:
                    return json.load(f)
            
            return None


# Global instance
_report_service: Optional[ReportService] = None


def get_report_service() -> ReportService:
    """Get the global report service instance."""
    global _report_service
    if _report_service is None:
        _report_service = ReportService()
    return _report_service
