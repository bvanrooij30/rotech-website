"""
Sidebar Navigation Component.
"""

import customtkinter as ctk
from typing import Callable, Dict, Optional


class SidebarButton(ctk.CTkButton):
    """Custom sidebar navigation button."""
    
    def __init__(
        self, 
        parent, 
        text: str, 
        icon: str,
        view_name: str,
        command: Callable,
        **kwargs
    ):
        self.view_name = view_name
        self._is_active = False
        
        super().__init__(
            parent,
            text=f"  {icon}  {text}",
            command=lambda: command(view_name),
            anchor="w",
            height=40,
            corner_radius=8,
            fg_color="transparent",
            text_color=("gray10", "gray90"),
            hover_color=("gray75", "gray30"),
            font=ctk.CTkFont(size=14),
            **kwargs
        )
    
    def set_active(self, active: bool):
        """Set active state."""
        self._is_active = active
        if active:
            self.configure(
                fg_color=("gray75", "gray30"),
                text_color=("#1a73e8", "#4da3ff")
            )
        else:
            self.configure(
                fg_color="transparent",
                text_color=("gray10", "gray90")
            )


class Sidebar(ctk.CTkFrame):
    """Navigation sidebar."""
    
    def __init__(self, parent, on_click: Callable):
        super().__init__(parent, width=220, corner_radius=0)
        self.grid_propagate(False)
        
        self.on_click = on_click
        self.buttons: Dict[str, SidebarButton] = {}
        
        self._setup_ui()
    
    def _setup_ui(self):
        """Setup sidebar UI."""
        # Logo / Title
        title_frame = ctk.CTkFrame(self, fg_color="transparent")
        title_frame.pack(fill="x", padx=15, pady=(20, 30))
        
        logo_label = ctk.CTkLabel(
            title_frame,
            text="🏢 Ro-Tech",
            font=ctk.CTkFont(size=22, weight="bold")
        )
        logo_label.pack(anchor="w")
        
        subtitle_label = ctk.CTkLabel(
            title_frame,
            text="Admin Portal",
            font=ctk.CTkFont(size=12),
            text_color="gray60"
        )
        subtitle_label.pack(anchor="w")
        
        # Navigation buttons
        nav_items = [
            ("Dashboard", "📊", "dashboard"),
            ("Email", "📧", "email"),
            ("Werk Opdrachten", "📋", "inbox"),
            ("Leads", "🔍", "leads"),
            ("Klanten", "👥", "clients"),
            ("Facturatie", "📄", "invoices"),
            ("Snelstart", "📈", "snelstart"),
            ("Support", "🎫", "support"),
            ("Website API", "🌐", "api"),
            ("Monitoring", "🛡️", "monitor"),
        ]
        
        nav_frame = ctk.CTkFrame(self, fg_color="transparent")
        nav_frame.pack(fill="x", padx=10)
        
        for text, icon, view_name in nav_items:
            btn = SidebarButton(
                nav_frame,
                text=text,
                icon=icon,
                view_name=view_name,
                command=self.on_click
            )
            btn.pack(fill="x", pady=2)
            self.buttons[view_name] = btn
        
        # Spacer
        spacer = ctk.CTkFrame(self, fg_color="transparent")
        spacer.pack(fill="both", expand=True)
        
        # Bottom section
        bottom_frame = ctk.CTkFrame(self, fg_color="transparent")
        bottom_frame.pack(fill="x", padx=10, pady=(0, 10))
        
        # Divider
        divider = ctk.CTkFrame(bottom_frame, height=1, fg_color="gray50")
        divider.pack(fill="x", pady=10)
        
        # Settings button
        settings_btn = SidebarButton(
            bottom_frame,
            text="Instellingen",
            icon="⚙️",
            view_name="settings",
            command=self.on_click
        )
        settings_btn.pack(fill="x", pady=2)
        self.buttons["settings"] = settings_btn
        
        # Version info
        version_label = ctk.CTkLabel(
            bottom_frame,
            text="v1.0.0",
            font=ctk.CTkFont(size=10),
            text_color="gray50"
        )
        version_label.pack(anchor="w", padx=10, pady=(10, 0))
    
    def set_active(self, view_name: str):
        """Set active button."""
        for name, btn in self.buttons.items():
            btn.set_active(name == view_name)
