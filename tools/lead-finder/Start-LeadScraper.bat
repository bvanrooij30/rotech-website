@echo off
:: ============================================
:: Ro-Tech Lead Scraper Launcher
:: Start de Apify lead scraper
:: ============================================

title Ro-Tech Lead Scraper

echo.
echo  ██████╗  ██████╗       ████████╗███████╗ ██████╗██╗  ██╗
echo  ██╔══██╗██╔═══██╗      ╚══██╔══╝██╔════╝██╔════╝██║  ██║
echo  ██████╔╝██║   ██║█████╗   ██║   █████╗  ██║     ███████║
echo  ██╔══██╗██║   ██║╚════╝   ██║   ██╔══╝  ██║     ██╔══██║
echo  ██║  ██║╚██████╔╝         ██║   ███████╗╚██████╗██║  ██║
echo  ╚═╝  ╚═╝ ╚═════╝          ╚═╝   ╚══════╝ ╚═════╝╚═╝  ╚═╝
echo.
echo  Lead Scraper - Vind nieuwe klanten
echo  ============================================
echo.

:: Ga naar de lead-finder directory
cd /d "C:\Users\bvrvl\Desktop\Online_projects\WebDev_Projects\rotech-website\tools\lead-finder"

:: Check of Python beschikbaar is
where python >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Python niet gevonden! Installeer Python eerst.
    pause
    exit /b 1
)

:: Check of .env bestaat
if not exist ".env" (
    echo [WAARSCHUWING] .env bestand niet gevonden!
    echo Maak een .env bestand met je APIFY_API_TOKEN
    echo.
)

echo Kies een optie:
echo.
echo   [1] Quick Start - Lokaal (Veldhoven, Eindhoven, Best)
echo   [2] Brabant preset (10 steden)
echo   [3] Randstad preset (10 steden)
echo   [4] Email Outreach starten
echo   [5] Dashboard openen
echo   [0] Afsluiten
echo.

set /p choice="Keuze: "

if "%choice%"=="1" (
    echo.
    echo [INFO] Starten met lokale preset...
    python apify_quick_start.py
)
if "%choice%"=="2" (
    echo.
    echo [INFO] Starten met Brabant preset...
    python apify_lead_finder.py --preset brabant
)
if "%choice%"=="3" (
    echo.
    echo [INFO] Starten met Randstad preset...
    python apify_lead_finder.py --preset randstad
)
if "%choice%"=="4" (
    echo.
    echo [INFO] Email outreach starten...
    echo Beschikbare CSV bestanden:
    dir /b output\*.csv 2>nul
    echo.
    set /p csvfile="CSV bestand (of Enter voor meest recente): "
    if "%csvfile%"=="" (
        python email_outreach.py
    ) else (
        python email_outreach.py --csv "output\%csvfile%"
    )
)
if "%choice%"=="5" (
    start http://localhost:3000/dashboard/leads
)
if "%choice%"=="0" (
    exit /b 0
)

echo.
echo ============================================
echo Klaar! Druk op een toets om af te sluiten.
pause >nul
