@echo off
:: ============================================
:: Ro-Tech Lead Dashboard Launcher
:: Start de website + opent het dashboard
:: ============================================

title Ro-Tech Lead Dashboard

echo.
echo  ██████╗  ██████╗       ████████╗███████╗ ██████╗██╗  ██╗
echo  ██╔══██╗██╔═══██╗      ╚══██╔══╝██╔════╝██╔════╝██║  ██║
echo  ██████╔╝██║   ██║█████╗   ██║   █████╗  ██║     ███████║
echo  ██╔══██╗██║   ██║╚════╝   ██║   ██╔══╝  ██║     ██╔══██║
echo  ██║  ██║╚██████╔╝         ██║   ███████╗╚██████╗██║  ██║
echo  ╚═╝  ╚═╝ ╚═════╝          ╚═╝   ╚══════╝ ╚═════╝╚═╝  ╚═╝
echo.
echo  Lead Dashboard - Interne Tool
echo  ============================================
echo.

:: Ga naar de website directory
cd /d "C:\Users\bvrvl\Desktop\Online_projects\WebDev_Projects\rotech-website"

:: Check of npm beschikbaar is
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] npm niet gevonden! Installeer Node.js eerst.
    pause
    exit /b 1
)

:: Check of node_modules bestaat
if not exist "node_modules" (
    echo [INFO] node_modules niet gevonden, installeren...
    npm install
)

echo [INFO] Website starten op http://localhost:3000
echo [INFO] Dashboard: http://localhost:3000/dashboard/leads
echo.
echo [TIP] Druk Ctrl+C om te stoppen
echo.

:: Start de dev server en open de browser na 5 seconden
start "" cmd /c "timeout /t 5 /nobreak >nul && start http://localhost:3000/dashboard/leads"

:: Start Next.js dev server (blijft draaien)
npm run dev
