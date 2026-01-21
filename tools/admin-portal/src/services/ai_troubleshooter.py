"""
AI Troubleshooter - AI-powered error analysis en auto-fix.
Gebruikt OpenAI/Claude voor intelligente probleemanalyse en oplossingen.
Bevat self-learning capabilities.
"""

import os
import json
import subprocess
import re
from datetime import datetime
from typing import Optional, List, Dict, Any, Tuple
from openai import OpenAI

from ..database import get_db
from ..database.models import (
    MonitoredProject, MonitorIssue, IssueSolution, AILearning,
    IssueStatus, IssueSeverity
)
from ..utils.config import Config, logger


class AITroubleshooter:
    """AI-powered troubleshooting en auto-fix service."""
    
    def __init__(self, api_key: str = None):
        """Initialize met OpenAI API key."""
        self.api_key = api_key or os.getenv("OPENAI_API_KEY") or Config.get_setting("openai_api_key")
        self.client = None
        self.model = "gpt-4o"  # Best for code analysis
        
        if self.api_key:
            self.client = OpenAI(api_key=self.api_key)
        else:
            logger.warning("No OpenAI API key configured - AI troubleshooting disabled")
        
        # Known fix patterns (hardcoded common fixes)
        self.known_fixes = {
            "timeout": [
                {"action": "restart_service", "description": "Restart de service"},
                {"action": "check_resources", "description": "Check server resources"}
            ],
            "500": [
                {"action": "check_logs", "description": "Check application logs"},
                {"action": "restart_service", "description": "Restart de applicatie"}
            ],
            "ssl_expired": [
                {"action": "renew_ssl", "description": "Vernieuw SSL certificaat"}
            ],
            "connection_refused": [
                {"action": "check_port", "description": "Check of service draait op poort"},
                {"action": "restart_service", "description": "Restart de service"}
            ],
            "memory_error": [
                {"action": "restart_service", "description": "Restart om geheugen vrij te maken"},
                {"action": "check_memory_leak", "description": "Check voor memory leaks"}
            ]
        }
    
    def analyze_and_fix(self, issue_id: int, auto_fix: bool = True) -> Dict[str, Any]:
        """
        Analyseer een issue en probeer automatisch te fixen.
        
        Args:
            issue_id: ID van de MonitorIssue
            auto_fix: Of automatisch fixes toegepast mogen worden
            
        Returns:
            Dict met analyse resultaat en eventuele fix acties
        """
        db = get_db()
        result = {
            "issue_id": issue_id,
            "analyzed": False,
            "analysis": None,
            "suggested_fixes": [],
            "fixes_applied": [],
            "success": False
        }
        
        with db.session() as session:
            issue = session.query(MonitorIssue).get(issue_id)
            if not issue:
                result["error"] = "Issue not found"
                return result
            
            project = issue.project
            
            # Update status
            issue.status = IssueStatus.INVESTIGATING.value
            session.commit()
            
            # 1. Check for known patterns first (fast path)
            known_solution = self._check_known_patterns(issue)
            if known_solution:
                result["suggested_fixes"].append(known_solution)
            
            # 2. AI Analysis
            if self.client:
                try:
                    analysis = self._ai_analyze(issue, project)
                    result["analyzed"] = True
                    result["analysis"] = analysis.get("analysis")
                    
                    # Store AI analysis
                    issue.ai_analysis = analysis.get("analysis")
                    issue.ai_suggested_fix = analysis.get("suggested_fix")
                    issue.ai_confidence = analysis.get("confidence", 0.5)
                    
                    if analysis.get("suggested_fix"):
                        result["suggested_fixes"].append({
                            "action": "ai_suggested",
                            "description": analysis["suggested_fix"],
                            "confidence": analysis.get("confidence", 0.5)
                        })
                    
                except Exception as e:
                    logger.error(f"AI analysis error: {e}")
                    result["ai_error"] = str(e)
            
            # 3. Auto-fix if enabled and we have suggestions
            if auto_fix and result["suggested_fixes"]:
                issue.status = IssueStatus.FIXING.value
                session.commit()
                
                for fix in result["suggested_fixes"]:
                    if fix.get("confidence", 0.8) >= 0.7:  # Only apply high-confidence fixes
                        fix_result = self._apply_fix(session, issue, project, fix)
                        result["fixes_applied"].append(fix_result)
                        
                        if fix_result.get("success"):
                            issue.status = IssueStatus.RESOLVED.value
                            issue.resolved_by = "ai_auto"
                            issue.resolved_at = datetime.now()
                            issue.resolution = fix_result.get("description")
                            project.issues_resolved_auto += 1
                            result["success"] = True
                            
                            # Learn from success
                            self._learn_from_fix(session, issue, fix, success=True)
                            break
                        else:
                            # Learn from failure
                            self._learn_from_fix(session, issue, fix, success=False)
            
            # If no auto-fix applied, keep investigating
            if not result["success"]:
                issue.status = IssueStatus.OPEN.value
            
            session.commit()
        
        return result
    
    def _ai_analyze(self, issue: MonitorIssue, project: MonitoredProject) -> Dict[str, Any]:
        """Gebruik AI om het probleem te analyseren."""
        
        # Build context
        context = f"""
Project: {project.name}
Type: {project.project_type}
URL: {project.url or 'N/A'}

Issue:
- Title: {issue.title}
- Severity: {issue.severity}
- Error Type: {issue.error_type}
- Error Message: {issue.error_message}
- Stack Trace: {issue.stack_trace or 'N/A'}

Project Config:
- Local Path: {project.local_path or 'N/A'}
- Git Repo: {project.git_repo or 'N/A'}
- Restart Command: {project.restart_command or 'N/A'}
- Deploy Command: {project.deploy_command or 'N/A'}
"""
        
        messages = [
            {
                "role": "system",
                "content": """Je bent een expert DevOps engineer en troubleshooter.
Analyseer het probleem en geef:
1. Een korte analyse van wat er mis is
2. De meest waarschijnlijke oorzaak
3. Een concrete oplossing die automatisch uitgevoerd kan worden
4. Een confidence score (0-1) voor je analyse

Antwoord in JSON format:
{
    "analysis": "Korte analyse van het probleem",
    "probable_cause": "Meest waarschijnlijke oorzaak",
    "suggested_fix": "Concrete stappen om te fixen",
    "fix_command": "Optioneel: shell command om uit te voeren",
    "confidence": 0.8,
    "requires_manual": false
}"""
            },
            {
                "role": "user",
                "content": context
            }
        ]
        
        response = self.client.chat.completions.create(
            model=self.model,
            messages=messages,
            response_format={"type": "json_object"},
            temperature=0.3
        )
        
        result = json.loads(response.choices[0].message.content)
        return result
    
    def _check_known_patterns(self, issue: MonitorIssue) -> Optional[Dict]:
        """Check tegen bekende error patterns."""
        error_lower = (issue.error_message or "").lower()
        
        for pattern, fixes in self.known_fixes.items():
            if pattern in error_lower:
                # Check learning database for best fix
                best_fix = self._get_best_learned_fix(pattern)
                if best_fix:
                    return best_fix
                
                # Return first known fix
                return {
                    **fixes[0],
                    "pattern": pattern,
                    "confidence": 0.9
                }
        
        return None
    
    def _get_best_learned_fix(self, error_pattern: str) -> Optional[Dict]:
        """Get de beste fix uit het learning systeem."""
        db = get_db()
        
        with db.session() as session:
            # Find best performing solution for this pattern
            learning = session.query(AILearning).filter(
                AILearning.error_pattern.contains(error_pattern),
                AILearning.success_rate >= 0.7
            ).order_by(AILearning.success_rate.desc()).first()
            
            if learning:
                learning.times_matched += 1
                learning.last_used = datetime.now()
                session.commit()
                
                return {
                    "action": learning.solution_type,
                    "description": learning.solution_steps,
                    "confidence": learning.success_rate,
                    "learned": True
                }
        
        return None
    
    def _apply_fix(
        self, 
        session,
        issue: MonitorIssue, 
        project: MonitoredProject,
        fix: Dict
    ) -> Dict[str, Any]:
        """Pas een fix toe."""
        result = {
            "action": fix.get("action"),
            "description": fix.get("description"),
            "success": False
        }
        
        action = fix.get("action", "")
        
        try:
            if action == "restart_service" and project.restart_command:
                # Execute restart command
                output = self._execute_command(project.restart_command, project.local_path)
                result["success"] = output.get("success", False)
                result["output"] = output.get("output")
                
            elif action == "check_logs" and project.local_path:
                # Get recent logs
                log_path = os.path.join(project.local_path, "logs")
                if os.path.exists(log_path):
                    result["output"] = self._get_recent_logs(log_path)
                    result["success"] = True
                    
            elif action == "redeploy" and project.deploy_command:
                output = self._execute_command(project.deploy_command, project.local_path)
                result["success"] = output.get("success", False)
                result["output"] = output.get("output")
                
            elif fix.get("fix_command"):
                # AI-suggested command
                output = self._execute_command(fix["fix_command"], project.local_path)
                result["success"] = output.get("success", False)
                result["output"] = output.get("output")
            
            else:
                result["error"] = "No executable action found"
                
        except Exception as e:
            result["error"] = str(e)
            logger.error(f"Fix application error: {e}")
        
        # Save solution
        solution = IssueSolution(
            issue_id=issue.id,
            action_type=action,
            action_command=fix.get("fix_command"),
            action_description=fix.get("description"),
            was_successful=result["success"],
            error_output=result.get("error") or result.get("output")
        )
        session.add(solution)
        
        return result
    
    def _execute_command(self, command: str, working_dir: str = None) -> Dict[str, Any]:
        """Execute a shell command safely."""
        result = {
            "success": False,
            "output": ""
        }
        
        # Safety check - don't execute dangerous commands
        dangerous = ["rm -rf /", "format", "del /", ":(){:|:&};:"]
        if any(d in command.lower() for d in dangerous):
            result["error"] = "Dangerous command blocked"
            return result
        
        try:
            process = subprocess.run(
                command,
                shell=True,
                cwd=working_dir,
                capture_output=True,
                text=True,
                timeout=60
            )
            
            result["output"] = process.stdout + process.stderr
            result["success"] = process.returncode == 0
            result["return_code"] = process.returncode
            
        except subprocess.TimeoutExpired:
            result["error"] = "Command timed out"
        except Exception as e:
            result["error"] = str(e)
        
        return result
    
    def _get_recent_logs(self, log_path: str, lines: int = 100) -> str:
        """Get recent log entries."""
        logs = []
        
        try:
            for filename in os.listdir(log_path):
                if filename.endswith('.log'):
                    filepath = os.path.join(log_path, filename)
                    with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                        # Get last N lines
                        content = f.readlines()[-lines:]
                        logs.extend(content)
        except Exception as e:
            return f"Error reading logs: {e}"
        
        return "".join(logs[-lines:])
    
    def _learn_from_fix(self, session, issue: MonitorIssue, fix: Dict, success: bool):
        """Learn from a fix attempt for future improvements."""
        error_pattern = self._extract_error_pattern(issue.error_message)
        
        # Find or create learning entry
        learning = session.query(AILearning).filter(
            AILearning.error_pattern == error_pattern,
            AILearning.solution_type == fix.get("action")
        ).first()
        
        if learning:
            learning.times_matched += 1
            if success:
                learning.times_successful += 1
            learning.success_rate = learning.times_successful / learning.times_matched
            learning.last_used = datetime.now()
        else:
            # Create new learning entry
            learning = AILearning(
                error_pattern=error_pattern,
                error_type=issue.error_type,
                solution_type=fix.get("action", "unknown"),
                solution_steps=fix.get("description"),
                times_matched=1,
                times_successful=1 if success else 0,
                success_rate=1.0 if success else 0.0,
                project_types=issue.project.project_type
            )
            session.add(learning)
        
        logger.info(f"Learned from fix: {fix.get('action')} - {'Success' if success else 'Failed'}")
    
    def _extract_error_pattern(self, error_message: str) -> str:
        """Extract a generalizable pattern from error message."""
        if not error_message:
            return "unknown"
        
        # Remove specific values (IPs, paths, timestamps)
        pattern = error_message.lower()
        pattern = re.sub(r'\d+\.\d+\.\d+\.\d+', 'IP', pattern)  # IP addresses
        pattern = re.sub(r':\d+', ':PORT', pattern)  # Ports
        pattern = re.sub(r'/[a-z0-9_/-]+', '/PATH', pattern)  # Paths
        pattern = re.sub(r'\d{2,}', 'NUM', pattern)  # Numbers
        
        # Truncate
        return pattern[:200]
    
    def get_learning_stats(self) -> Dict[str, Any]:
        """Get statistics about learned patterns."""
        db = get_db()
        
        with db.session() as session:
            entries = session.query(AILearning).all()
            
            return {
                "total_patterns": len(entries),
                "total_matches": sum(e.times_matched for e in entries),
                "total_successes": sum(e.times_successful for e in entries),
                "avg_success_rate": sum(e.success_rate for e in entries) / len(entries) if entries else 0,
                "top_patterns": [
                    {
                        "pattern": e.error_pattern[:50],
                        "solution": e.solution_type,
                        "success_rate": e.success_rate,
                        "times_used": e.times_matched
                    }
                    for e in sorted(entries, key=lambda x: x.times_matched, reverse=True)[:10]
                ]
            }
    
    def manual_feedback(self, issue_id: int, was_helpful: bool, correct_solution: str = None):
        """Record manual feedback for learning."""
        db = get_db()
        
        with db.session() as session:
            issue = session.query(MonitorIssue).get(issue_id)
            if issue:
                issue.was_helpful = was_helpful
                
                if correct_solution:
                    issue.resolution = correct_solution
                    # Learn from manual fix
                    self._learn_from_fix(
                        session, 
                        issue, 
                        {"action": "manual", "description": correct_solution},
                        success=True
                    )
                
                session.commit()


# Global instance
_troubleshooter: Optional[AITroubleshooter] = None


def get_troubleshooter() -> AITroubleshooter:
    """Get the global AI troubleshooter instance."""
    global _troubleshooter
    if _troubleshooter is None:
        _troubleshooter = AITroubleshooter()
    return _troubleshooter
