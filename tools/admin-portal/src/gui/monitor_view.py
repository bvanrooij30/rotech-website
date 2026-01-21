"""
Monitor View - Dashboard voor project monitoring en troubleshooting.
Toont real-time status, issues, en AI troubleshooting resultaten.
"""

import customtkinter as ctk
from tkinter import messagebox
from typing import Optional, List, Dict
from datetime import datetime, timedelta
import threading

from ..database import get_db
from ..database.models import (
    MonitoredProject, HealthCheck, MonitorIssue, MonitorReport,
    HealthStatus, IssueStatus, IssueSeverity, ProjectType
)
from ..services.monitor_service import get_monitor_service
from ..services.ai_troubleshooter import get_troubleshooter
from ..services.report_service import get_report_service
from ..services.project_discovery import get_discovery_service, PROJECTS_DIR
from ..utils.config import logger
from ..utils.helpers import format_datetime
import subprocess
import os


class ProjectCard(ctk.CTkFrame):
    """Card voor een gemonitord project."""
    
    def __init__(self, parent, project: MonitoredProject, on_click: callable, **kwargs):
        super().__init__(parent, corner_radius=10, **kwargs)
        
        self.project = project
        self.on_click = on_click
        
        self.bind("<Button-1>", self._handle_click)
        self.configure(cursor="hand2")
        
        self._setup_ui()
    
    def _setup_ui(self):
        self.grid_columnconfigure(1, weight=1)
        
        # Status indicator
        status_colors = {
            HealthStatus.HEALTHY.value: "#34a853",
            HealthStatus.DEGRADED.value: "#fbbc04",
            HealthStatus.DOWN.value: "#ea4335",
            HealthStatus.UNKNOWN.value: "gray50"
        }
        color = status_colors.get(self.project.current_status, "gray50")
        
        indicator = ctk.CTkFrame(self, width=8, fg_color=color, corner_radius=4)
        indicator.grid(row=0, column=0, rowspan=3, sticky="ns", padx=(10, 15), pady=10)
        
        # Project name
        name_label = ctk.CTkLabel(
            self,
            text=self.project.name,
            font=ctk.CTkFont(size=15, weight="bold"),
            anchor="w"
        )
        name_label.grid(row=0, column=1, sticky="w", pady=(10, 0))
        name_label.bind("<Button-1>", self._handle_click)
        
        # URL and type
        info_text = f"{self.project.project_type.upper()}"
        if self.project.url:
            info_text += f" • {self.project.url[:40]}..."
        
        info_label = ctk.CTkLabel(
            self,
            text=info_text,
            font=ctk.CTkFont(size=11),
            text_color="gray50",
            anchor="w"
        )
        info_label.grid(row=1, column=1, sticky="w")
        info_label.bind("<Button-1>", self._handle_click)
        
        # Stats row
        stats_frame = ctk.CTkFrame(self, fg_color="transparent")
        stats_frame.grid(row=2, column=1, sticky="w", pady=(5, 10))
        
        # Uptime
        uptime_text = f"⬆️ {self.project.uptime_percentage:.1f}%"
        ctk.CTkLabel(
            stats_frame,
            text=uptime_text,
            font=ctk.CTkFont(size=11),
            text_color="gray60"
        ).pack(side="left", padx=(0, 15))
        
        # Response time
        if self.project.last_response_time:
            rt_text = f"⏱️ {self.project.last_response_time}ms"
            ctk.CTkLabel(
                stats_frame,
                text=rt_text,
                font=ctk.CTkFont(size=11),
                text_color="gray60"
            ).pack(side="left", padx=(0, 15))
        
        # Last check
        if self.project.last_check:
            time_text = f"🕐 {format_datetime(self.project.last_check)}"
            ctk.CTkLabel(
                stats_frame,
                text=time_text,
                font=ctk.CTkFont(size=11),
                text_color="gray60"
            ).pack(side="left")
        
        # Right side: Status badge + actions
        right_frame = ctk.CTkFrame(self, fg_color="transparent")
        right_frame.grid(row=0, column=2, rowspan=3, padx=10, pady=10)
        
        # Status badge
        status_text = self.project.current_status.upper()
        badge = ctk.CTkLabel(
            right_frame,
            text=status_text,
            font=ctk.CTkFont(size=11, weight="bold"),
            text_color="white",
            fg_color=color,
            corner_radius=6,
            padx=10,
            pady=4
        )
        badge.pack(pady=(0, 5))
        
        # Check now button
        check_btn = ctk.CTkButton(
            right_frame,
            text="Check",
            width=60,
            height=26,
            font=ctk.CTkFont(size=11),
            fg_color="gray40",
            command=lambda: self._check_now()
        )
        check_btn.pack()
    
    def _handle_click(self, event=None):
        if self.on_click:
            self.on_click(self.project)
    
    def _check_now(self):
        """Trigger immediate check."""
        service = get_monitor_service()
        result = service.check_project_now(self.project.id)
        
        if result.get("error"):
            messagebox.showerror("Check Error", result["error"])
        else:
            status = result.get("overall_status", "unknown")
            messagebox.showinfo("Check Complete", f"Status: {status.upper()}")


class IssueCard(ctk.CTkFrame):
    """Card voor een issue."""
    
    def __init__(self, parent, issue: MonitorIssue, on_click: callable, **kwargs):
        super().__init__(parent, corner_radius=8, **kwargs)
        
        self.issue = issue
        self.on_click = on_click
        
        self.bind("<Button-1>", self._handle_click)
        self.configure(cursor="hand2")
        
        self._setup_ui()
    
    def _setup_ui(self):
        self.grid_columnconfigure(1, weight=1)
        
        # Severity indicator
        severity_colors = {
            IssueSeverity.LOW.value: "#34a853",
            IssueSeverity.MEDIUM.value: "#fbbc04",
            IssueSeverity.HIGH.value: "#ff6d01",
            IssueSeverity.CRITICAL.value: "#ea4335"
        }
        color = severity_colors.get(self.issue.severity, "gray50")
        
        indicator = ctk.CTkFrame(self, width=6, fg_color=color, corner_radius=3)
        indicator.grid(row=0, column=0, rowspan=2, sticky="ns", padx=(8, 12), pady=8)
        
        # Title
        title_label = ctk.CTkLabel(
            self,
            text=self.issue.title,
            font=ctk.CTkFont(size=13, weight="bold"),
            anchor="w"
        )
        title_label.grid(row=0, column=1, sticky="w", pady=(8, 0))
        title_label.bind("<Button-1>", self._handle_click)
        
        # Details
        details = f"{self.issue.severity.upper()} • {format_datetime(self.issue.detected_at)}"
        if self.issue.resolved_by == "ai_auto":
            details += " • 🤖 Auto-fixed"
        
        details_label = ctk.CTkLabel(
            self,
            text=details,
            font=ctk.CTkFont(size=11),
            text_color="gray50",
            anchor="w"
        )
        details_label.grid(row=1, column=1, sticky="w", pady=(0, 8))
        details_label.bind("<Button-1>", self._handle_click)
        
        # Status badge
        status_colors = {
            IssueStatus.OPEN.value: "#ea4335",
            IssueStatus.INVESTIGATING.value: "#fbbc04",
            IssueStatus.FIXING.value: "#1a73e8",
            IssueStatus.RESOLVED.value: "#34a853"
        }
        badge_color = status_colors.get(self.issue.status, "gray50")
        
        badge = ctk.CTkLabel(
            self,
            text=self.issue.status.upper(),
            font=ctk.CTkFont(size=10),
            text_color="white",
            fg_color=badge_color,
            corner_radius=4,
            padx=8,
            pady=2
        )
        badge.grid(row=0, column=2, rowspan=2, padx=10)
    
    def _handle_click(self, event=None):
        if self.on_click:
            self.on_click(self.issue)


class AddProjectDialog(ctk.CTkToplevel):
    """Dialog voor het toevoegen van een project."""
    
    def __init__(self, parent, on_save: callable):
        super().__init__(parent)
        
        self.on_save = on_save
        
        self.title("Project Toevoegen")
        self.geometry("500x600")
        self.resizable(False, False)
        
        # Center on parent
        self.transient(parent)
        self.grab_set()
        
        self._setup_ui()
    
    def _setup_ui(self):
        # Form
        form = ctk.CTkScrollableFrame(self)
        form.pack(fill="both", expand=True, padx=20, pady=20)
        
        # Name
        ctk.CTkLabel(form, text="Project Naam *", font=ctk.CTkFont(weight="bold")).pack(anchor="w", pady=(0, 5))
        self.name_entry = ctk.CTkEntry(form, width=400)
        self.name_entry.pack(fill="x", pady=(0, 15))
        
        # Type
        ctk.CTkLabel(form, text="Type", font=ctk.CTkFont(weight="bold")).pack(anchor="w", pady=(0, 5))
        self.type_var = ctk.StringVar(value=ProjectType.WEBSITE.value)
        type_menu = ctk.CTkOptionMenu(
            form,
            variable=self.type_var,
            values=[t.value for t in ProjectType],
            width=200
        )
        type_menu.pack(anchor="w", pady=(0, 15))
        
        # URL
        ctk.CTkLabel(form, text="URL", font=ctk.CTkFont(weight="bold")).pack(anchor="w", pady=(0, 5))
        self.url_entry = ctk.CTkEntry(form, width=400, placeholder_text="https://example.com")
        self.url_entry.pack(fill="x", pady=(0, 15))
        
        # Health endpoint
        ctk.CTkLabel(form, text="Health Endpoint", font=ctk.CTkFont(weight="bold")).pack(anchor="w", pady=(0, 5))
        self.health_entry = ctk.CTkEntry(form, width=400, placeholder_text="https://example.com/api/health")
        self.health_entry.pack(fill="x", pady=(0, 15))
        
        # Check interval
        ctk.CTkLabel(form, text="Check Interval (seconden)", font=ctk.CTkFont(weight="bold")).pack(anchor="w", pady=(0, 5))
        self.interval_entry = ctk.CTkEntry(form, width=100, placeholder_text="300")
        self.interval_entry.insert(0, "300")
        self.interval_entry.pack(anchor="w", pady=(0, 15))
        
        # Local path
        ctk.CTkLabel(form, text="Lokaal Pad (voor auto-fix)", font=ctk.CTkFont(weight="bold")).pack(anchor="w", pady=(0, 5))
        self.path_entry = ctk.CTkEntry(form, width=400, placeholder_text="C:\\projects\\my-project")
        self.path_entry.pack(fill="x", pady=(0, 15))
        
        # Restart command
        ctk.CTkLabel(form, text="Restart Command", font=ctk.CTkFont(weight="bold")).pack(anchor="w", pady=(0, 5))
        self.restart_entry = ctk.CTkEntry(form, width=400, placeholder_text="pm2 restart my-app")
        self.restart_entry.pack(fill="x", pady=(0, 15))
        
        # Deploy command
        ctk.CTkLabel(form, text="Deploy Command", font=ctk.CTkFont(weight="bold")).pack(anchor="w", pady=(0, 5))
        self.deploy_entry = ctk.CTkEntry(form, width=400, placeholder_text="./deploy.sh")
        self.deploy_entry.pack(fill="x", pady=(0, 20))
        
        # Buttons
        btn_frame = ctk.CTkFrame(self, fg_color="transparent")
        btn_frame.pack(fill="x", padx=20, pady=(0, 20))
        
        ctk.CTkButton(
            btn_frame,
            text="Annuleren",
            fg_color="gray40",
            command=self.destroy
        ).pack(side="left")
        
        ctk.CTkButton(
            btn_frame,
            text="Opslaan",
            fg_color="#34a853",
            command=self._save
        ).pack(side="right")
    
    def _save(self):
        name = self.name_entry.get().strip()
        if not name:
            messagebox.showerror("Fout", "Naam is verplicht")
            return
        
        try:
            interval = int(self.interval_entry.get() or "300")
        except ValueError:
            interval = 300
        
        project_data = {
            "name": name,
            "project_type": self.type_var.get(),
            "url": self.url_entry.get().strip() or None,
            "health_endpoint": self.health_entry.get().strip() or None,
            "check_interval": interval,
            "local_path": self.path_entry.get().strip() or None,
            "restart_command": self.restart_entry.get().strip() or None,
            "deploy_command": self.deploy_entry.get().strip() or None
        }
        
        if self.on_save:
            self.on_save(project_data)
        
        self.destroy()


class MonitorView(ctk.CTkFrame):
    """Main monitoring dashboard view."""
    
    def __init__(self, parent):
        super().__init__(parent, fg_color="transparent")
        
        self.grid_columnconfigure(0, weight=1)
        self.grid_rowconfigure(2, weight=1)
        
        self._selected_project = None
        
        self._setup_ui()
        self._start_services()
    
    def _setup_ui(self):
        # Header
        header = ctk.CTkFrame(self, fg_color="transparent")
        header.grid(row=0, column=0, sticky="ew", pady=(0, 15))
        header.grid_columnconfigure(1, weight=1)
        
        title = ctk.CTkLabel(
            header,
            text="🔍 Monitoring & Troubleshooting",
            font=ctk.CTkFont(size=24, weight="bold"),
            anchor="w"
        )
        title.grid(row=0, column=0, sticky="w")
        
        # Actions
        actions = ctk.CTkFrame(header, fg_color="transparent")
        actions.grid(row=0, column=1, sticky="e")
        
        ctk.CTkButton(
            actions,
            text="➕ Project",
            width=100,
            fg_color="#34a853",
            command=self._add_project
        ).pack(side="left", padx=(0, 10))
        
        ctk.CTkButton(
            actions,
            text="📊 Rapport",
            width=100,
            fg_color="gray40",
            command=self._generate_report
        ).pack(side="left", padx=(0, 10))
        
        self.service_btn = ctk.CTkButton(
            actions,
            text="⏸️ Pause",
            width=80,
            fg_color="gray40",
            command=self._toggle_service
        )
        self.service_btn.pack(side="left")
        
        # Stats row
        self.stats_frame = ctk.CTkFrame(self, fg_color="transparent")
        self.stats_frame.grid(row=1, column=0, sticky="ew", pady=(0, 15))
        
        # Content tabs
        self.tabs = ctk.CTkTabview(self)
        self.tabs.grid(row=2, column=0, sticky="nsew")
        
        # Projects tab
        self.projects_tab = self.tabs.add("Projecten")
        self.projects_tab.grid_columnconfigure(0, weight=1)
        self.projects_tab.grid_rowconfigure(0, weight=1)
        
        self.projects_scroll = ctk.CTkScrollableFrame(self.projects_tab, fg_color="transparent")
        self.projects_scroll.grid(row=0, column=0, sticky="nsew")
        self.projects_scroll.grid_columnconfigure(0, weight=1)
        
        # Issues tab
        self.issues_tab = self.tabs.add("Issues")
        self.issues_tab.grid_columnconfigure(0, weight=1)
        self.issues_tab.grid_rowconfigure(0, weight=1)
        
        self.issues_scroll = ctk.CTkScrollableFrame(self.issues_tab, fg_color="transparent")
        self.issues_scroll.grid(row=0, column=0, sticky="nsew")
        self.issues_scroll.grid_columnconfigure(0, weight=1)
        
        # Reports tab
        self.reports_tab = self.tabs.add("Rapporten")
        self.reports_tab.grid_columnconfigure(0, weight=1)
        self.reports_tab.grid_rowconfigure(0, weight=1)
        
        self.reports_scroll = ctk.CTkScrollableFrame(self.reports_tab, fg_color="transparent")
        self.reports_scroll.grid(row=0, column=0, sticky="nsew")
        
        # AI Learning tab
        self.ai_tab = self.tabs.add("AI Learning")
        self.ai_tab.grid_columnconfigure(0, weight=1)
        self.ai_tab.grid_rowconfigure(0, weight=1)
        
        self.ai_scroll = ctk.CTkScrollableFrame(self.ai_tab, fg_color="transparent")
        self.ai_scroll.grid(row=0, column=0, sticky="nsew")
        
        # Auto-Discovery tab
        self.discovery_tab = self.tabs.add("Auto-Discovery")
        self.discovery_tab.grid_columnconfigure(0, weight=1)
        self.discovery_scroll = ctk.CTkScrollableFrame(self.discovery_tab, fg_color="transparent")
        self.discovery_scroll.grid(row=0, column=0, sticky="nsew")
    
    def _start_services(self):
        """Start monitoring services."""
        try:
            # Start project discovery service
            discovery = get_discovery_service()
            discovery.set_callback(self._on_project_discovered)
            discovery.start()
            
            # Start monitor service
            monitor = get_monitor_service()
            monitor.set_callbacks(
                on_status_change=self._on_status_change,
                on_issue_detected=self._on_issue_detected
            )
            
            # Connect AI troubleshooter
            troubleshooter = get_troubleshooter()
            monitor.set_ai_troubleshooter(troubleshooter)
            
            monitor.start()
            
            # Start report scheduler
            report_service = get_report_service()
            report_service.start_scheduler()
            
            logger.info("Monitoring services started")
        except Exception as e:
            logger.error(f"Failed to start monitoring services: {e}")
    
    def _on_project_discovered(self, project):
        """Callback when new project is discovered."""
        logger.info(f"New project discovered: {project.name}")
        self.after(0, self.refresh)
        self.after(0, lambda: self._show_toast(f"🆕 Nieuw project: {project.name}"))
    
    def _on_status_change(self, project, old_status, new_status):
        """Callback when project status changes."""
        logger.info(f"Status change: {project.name} {old_status} -> {new_status}")
        # Refresh UI on main thread
        self.after(0, self.refresh)
    
    def _on_issue_detected(self, issue):
        """Callback when new issue detected."""
        logger.warning(f"New issue: {issue.title}")
        # Show notification
        self.after(0, lambda: messagebox.showwarning(
            "Issue Gedetecteerd",
            f"{issue.title}\n\nSeverity: {issue.severity}"
        ))
    
    def refresh(self):
        """Refresh all data."""
        self._refresh_stats()
        self._refresh_projects()
        self._refresh_issues()
        self._refresh_reports()
        self._refresh_ai_learning()
        self._refresh_discovery()
    
    def _refresh_stats(self):
        """Update stats overview."""
        for widget in self.stats_frame.winfo_children():
            widget.destroy()
        
        db = get_db()
        with db.session() as session:
            total = session.query(MonitoredProject).filter_by(is_active=True).count()
            healthy = session.query(MonitoredProject).filter_by(
                is_active=True, current_status=HealthStatus.HEALTHY.value
            ).count()
            degraded = session.query(MonitoredProject).filter_by(
                is_active=True, current_status=HealthStatus.DEGRADED.value
            ).count()
            down = session.query(MonitoredProject).filter_by(
                is_active=True, current_status=HealthStatus.DOWN.value
            ).count()
            open_issues = session.query(MonitorIssue).filter_by(
                status=IssueStatus.OPEN.value
            ).count()
        
        stats = [
            ("📊 Totaal", total, "gray50"),
            ("✅ Healthy", healthy, "#34a853"),
            ("⚠️ Degraded", degraded, "#fbbc04"),
            ("❌ Down", down, "#ea4335"),
            ("🚨 Open Issues", open_issues, "#ea4335" if open_issues > 0 else "gray50")
        ]
        
        for label, value, color in stats:
            stat_card = ctk.CTkFrame(self.stats_frame, corner_radius=8)
            stat_card.pack(side="left", padx=(0, 15), pady=5)
            
            ctk.CTkLabel(
                stat_card,
                text=label,
                font=ctk.CTkFont(size=11),
                text_color="gray60"
            ).pack(padx=15, pady=(8, 0))
            
            ctk.CTkLabel(
                stat_card,
                text=str(value),
                font=ctk.CTkFont(size=24, weight="bold"),
                text_color=color
            ).pack(padx=15, pady=(0, 8))
    
    def _refresh_projects(self):
        """Refresh projects list."""
        for widget in self.projects_scroll.winfo_children():
            widget.destroy()
        
        db = get_db()
        with db.session() as session:
            projects = session.query(MonitoredProject).filter_by(
                is_active=True
            ).order_by(MonitoredProject.name).all()
            
            if not projects:
                ctk.CTkLabel(
                    self.projects_scroll,
                    text="Geen projecten geconfigureerd.\n\nKlik op '➕ Project' om een project toe te voegen.",
                    text_color="gray50",
                    justify="center"
                ).pack(pady=50)
            else:
                for project in projects:
                    card = ProjectCard(
                        self.projects_scroll,
                        project=project,
                        on_click=self._on_project_click
                    )
                    card.pack(fill="x", pady=5)
    
    def _refresh_issues(self):
        """Refresh issues list."""
        for widget in self.issues_scroll.winfo_children():
            widget.destroy()
        
        db = get_db()
        with db.session() as session:
            issues = session.query(MonitorIssue).order_by(
                MonitorIssue.detected_at.desc()
            ).limit(50).all()
            
            if not issues:
                ctk.CTkLabel(
                    self.issues_scroll,
                    text="Geen issues gevonden.\n\n✅ Alle systemen operationeel!",
                    text_color="gray50",
                    justify="center"
                ).pack(pady=50)
            else:
                for issue in issues:
                    card = IssueCard(
                        self.issues_scroll,
                        issue=issue,
                        on_click=self._on_issue_click
                    )
                    card.pack(fill="x", pady=3)
    
    def _refresh_reports(self):
        """Refresh reports list."""
        for widget in self.reports_scroll.winfo_children():
            widget.destroy()
        
        report_service = get_report_service()
        reports = report_service.get_recent_reports(20)
        
        if not reports:
            ctk.CTkLabel(
                self.reports_scroll,
                text="Nog geen rapporten gegenereerd.\n\nKlik op '📊 Rapport' om een rapport te genereren.",
                text_color="gray50",
                justify="center"
            ).pack(pady=50)
        else:
            for report in reports:
                report_frame = ctk.CTkFrame(self.reports_scroll, corner_radius=8)
                report_frame.pack(fill="x", pady=3, padx=5)
                
                # Type + period
                ctk.CTkLabel(
                    report_frame,
                    text=f"📊 {report['type'].upper()} - {report['period_start'][:10]}",
                    font=ctk.CTkFont(size=13, weight="bold"),
                    anchor="w"
                ).pack(fill="x", padx=10, pady=(8, 2))
                
                # Stats
                summary = report["summary"]
                stats_text = f"Projecten: {summary['projects']} | Uptime: {summary['uptime']:.1f}% | Issues: {summary['issues']}"
                if summary['auto_resolved'] > 0:
                    stats_text += f" | 🤖 Auto-fixed: {summary['auto_resolved']}"
                
                ctk.CTkLabel(
                    report_frame,
                    text=stats_text,
                    font=ctk.CTkFont(size=11),
                    text_color="gray50",
                    anchor="w"
                ).pack(fill="x", padx=10, pady=(0, 8))
    
    def _refresh_ai_learning(self):
        """Refresh AI learning stats."""
        for widget in self.ai_scroll.winfo_children():
            widget.destroy()
        
        troubleshooter = get_troubleshooter()
        stats = troubleshooter.get_learning_stats()
        
        # Header
        ctk.CTkLabel(
            self.ai_scroll,
            text="🧠 AI Learning Statistics",
            font=ctk.CTkFont(size=18, weight="bold"),
            anchor="w"
        ).pack(fill="x", padx=10, pady=(10, 15))
        
        # Stats grid
        stats_grid = ctk.CTkFrame(self.ai_scroll, fg_color="transparent")
        stats_grid.pack(fill="x", padx=10, pady=(0, 20))
        
        stats_data = [
            ("Patterns Learned", stats.get("total_patterns", 0)),
            ("Times Matched", stats.get("total_matches", 0)),
            ("Successful Fixes", stats.get("total_successes", 0)),
            ("Avg Success Rate", f"{stats.get('avg_success_rate', 0) * 100:.1f}%")
        ]
        
        for i, (label, value) in enumerate(stats_data):
            card = ctk.CTkFrame(stats_grid, corner_radius=8)
            card.pack(side="left", padx=(0, 15), pady=5)
            
            ctk.CTkLabel(card, text=label, font=ctk.CTkFont(size=11), text_color="gray60").pack(padx=15, pady=(8, 0))
            ctk.CTkLabel(card, text=str(value), font=ctk.CTkFont(size=20, weight="bold")).pack(padx=15, pady=(0, 8))
        
        # Top patterns
        if stats.get("top_patterns"):
            ctk.CTkLabel(
                self.ai_scroll,
                text="Top Learned Patterns",
                font=ctk.CTkFont(size=14, weight="bold"),
                anchor="w"
            ).pack(fill="x", padx=10, pady=(10, 10))
            
            for pattern in stats["top_patterns"][:5]:
                pattern_frame = ctk.CTkFrame(self.ai_scroll, corner_radius=6)
                pattern_frame.pack(fill="x", padx=10, pady=2)
                
                ctk.CTkLabel(
                    pattern_frame,
                    text=f"🔧 {pattern['solution']} - Success: {pattern['success_rate']*100:.0f}% ({pattern['times_used']} uses)",
                    font=ctk.CTkFont(size=12),
                    anchor="w"
                ).pack(fill="x", padx=10, pady=8)
    
    def _add_project(self):
        """Open add project dialog."""
        AddProjectDialog(self, on_save=self._save_project)
    
    def _save_project(self, data: Dict):
        """Save new project."""
        db = get_db()
        
        with db.session() as session:
            project = MonitoredProject(**data)
            session.add(project)
            session.commit()
        
        self.refresh()
        messagebox.showinfo("Succes", f"Project '{data['name']}' toegevoegd!")
    
    def _on_project_click(self, project: MonitoredProject):
        """Handle project click."""
        self._selected_project = project
        # TODO: Show project detail view
    
    def _on_issue_click(self, issue: MonitorIssue):
        """Handle issue click."""
        # Show issue details
        details = f"""
Issue: {issue.title}
Severity: {issue.severity}
Status: {issue.status}

Error: {issue.error_message or 'N/A'}

AI Analysis: {issue.ai_analysis or 'N/A'}

Suggested Fix: {issue.ai_suggested_fix or 'N/A'}

Resolution: {issue.resolution or 'Not yet resolved'}
"""
        messagebox.showinfo("Issue Details", details)
    
    def _generate_report(self):
        """Generate a report manually."""
        report_service = get_report_service()
        
        try:
            result = report_service.generate_daily_report(datetime.now())
            self._refresh_reports()
            
            messagebox.showinfo(
                "Rapport Gegenereerd",
                f"Rapport opgeslagen:\n{result.get('summary_text', '')[:500]}..."
            )
        except Exception as e:
            messagebox.showerror("Fout", f"Rapport generatie mislukt: {e}")
    
    def _toggle_service(self):
        """Toggle monitoring service."""
        monitor = get_monitor_service()
        
        if monitor.is_running:
            monitor.stop()
            self.service_btn.configure(text="▶️ Start", fg_color="#34a853")
        else:
            monitor.start()
            self.service_btn.configure(text="⏸️ Pause", fg_color="gray40")
    
    def _refresh_discovery(self):
        """Refresh auto-discovery tab."""
        for widget in self.discovery_scroll.winfo_children():
            widget.destroy()
        
        discovery = get_discovery_service()
        
        # Header
        ctk.CTkLabel(
            self.discovery_scroll,
            text="📂 Auto-Discovery",
            font=ctk.CTkFont(size=18, weight="bold"),
            anchor="w"
        ).pack(fill="x", padx=10, pady=(10, 5))
        
        ctk.CTkLabel(
            self.discovery_scroll,
            text="Projecten worden automatisch gedetecteerd via .rotech-monitor.json config bestanden.",
            font=ctk.CTkFont(size=12),
            text_color="gray50",
            anchor="w",
            wraplength=600
        ).pack(fill="x", padx=10, pady=(0, 20))
        
        # Projects folder card
        folder_card = ctk.CTkFrame(self.discovery_scroll, corner_radius=10)
        folder_card.pack(fill="x", padx=10, pady=5)
        
        ctk.CTkLabel(
            folder_card,
            text="📁 Projects Folder",
            font=ctk.CTkFont(size=14, weight="bold"),
            anchor="w"
        ).pack(fill="x", padx=15, pady=(15, 5))
        
        # Path display
        path_frame = ctk.CTkFrame(folder_card, fg_color=("gray85", "gray20"), corner_radius=6)
        path_frame.pack(fill="x", padx=15, pady=5)
        
        ctk.CTkLabel(
            path_frame,
            text=PROJECTS_DIR,
            font=ctk.CTkFont(size=11, family="Consolas"),
            anchor="w"
        ).pack(fill="x", padx=10, pady=8)
        
        # Buttons
        btn_frame = ctk.CTkFrame(folder_card, fg_color="transparent")
        btn_frame.pack(fill="x", padx=15, pady=(5, 15))
        
        ctk.CTkButton(
            btn_frame,
            text="📂 Open Folder",
            width=120,
            fg_color="#1a73e8",
            command=self._open_projects_folder
        ).pack(side="left", padx=(0, 10))
        
        ctk.CTkButton(
            btn_frame,
            text="🔄 Scan Nu",
            width=100,
            fg_color="gray40",
            command=self._scan_projects
        ).pack(side="left")
        
        # Watch directories
        ctk.CTkLabel(
            self.discovery_scroll,
            text="👁️ Gemonitorde Folders",
            font=ctk.CTkFont(size=14, weight="bold"),
            anchor="w"
        ).pack(fill="x", padx=10, pady=(20, 10))
        
        watch_dirs = discovery.get_watch_directories()
        
        for path in watch_dirs:
            dir_frame = ctk.CTkFrame(self.discovery_scroll, corner_radius=6)
            dir_frame.pack(fill="x", padx=10, pady=2)
            
            exists = os.path.isdir(path)
            status = "✅" if exists else "❌"
            
            ctk.CTkLabel(
                dir_frame,
                text=f"{status} {path}",
                font=ctk.CTkFont(size=11),
                text_color="gray70" if not exists else None,
                anchor="w"
            ).pack(fill="x", padx=10, pady=6)
        
        # How to use section
        ctk.CTkLabel(
            self.discovery_scroll,
            text="📝 Hoe te Gebruiken",
            font=ctk.CTkFont(size=14, weight="bold"),
            anchor="w"
        ).pack(fill="x", padx=10, pady=(20, 10))
        
        instructions = """
1. Maak een subfolder in de Projects folder voor je project
2. Voeg een .rotech-monitor.json config bestand toe
3. Het project wordt automatisch gedetecteerd en gemonitord!

Voorbeeld config:
{
  "name": "Mijn Website",
  "url": "https://example.com",
  "check_interval": 300,
  "auto_monitor": true
}

Je kunt ook een .rotech-monitor.json in de root van elk project plaatsen.
"""
        
        ctk.CTkLabel(
            self.discovery_scroll,
            text=instructions.strip(),
            font=ctk.CTkFont(size=11),
            text_color="gray60",
            anchor="w",
            justify="left"
        ).pack(fill="x", padx=10, pady=(0, 20))
    
    def _open_projects_folder(self):
        """Open de projects folder in verkenner."""
        try:
            if os.name == 'nt':  # Windows
                os.startfile(PROJECTS_DIR)
            elif os.name == 'posix':  # Linux/Mac
                subprocess.run(['xdg-open', PROJECTS_DIR])
        except Exception as e:
            messagebox.showerror("Fout", f"Kon folder niet openen: {e}")
    
    def _scan_projects(self):
        """Trigger handmatige scan."""
        discovery = get_discovery_service()
        discovery._scan_all_directories()
        self.refresh()
        messagebox.showinfo("Scan Voltooid", "Project scan is uitgevoerd!")
    
    def _show_toast(self, message: str, duration: int = 3000):
        """Show a toast notification."""
        toast = ctk.CTkFrame(
            self.winfo_toplevel(),
            fg_color="#34a853",
            corner_radius=8
        )
        
        label = ctk.CTkLabel(
            toast,
            text=message,
            font=ctk.CTkFont(size=13),
            text_color="white"
        )
        label.pack(padx=20, pady=10)
        
        toast.place(relx=0.98, rely=0.98, anchor="se")
        
        def hide_toast():
            toast.destroy()
        
        self.after(duration, hide_toast)
