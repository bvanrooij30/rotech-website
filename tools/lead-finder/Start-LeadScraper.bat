@echo off
:: ============================================
:: Ro-Tech Lead Scraper Launcher
:: Start de Apify lead scraper
:: ============================================

title Ro-Tech Lead Scraper

echo.
echo  =============================================
echo   ____   ___       _____ _____ ____ _   _
echo  ^|  _ \ / _ \     ^|_   _^| ____/ ___^| ^| ^| ^|
echo  ^| ^|_) ^| ^| ^| ^|______^| ^| ^|  _^| ^|   ^| ^|_^| ^|
echo  ^|  _ ^<^| ^|_^| ^|______^| ^| ^| ^|__^| ^|___^|  _  ^|
echo  ^|_^| \_\\___/       ^|_^| ^|_____\____^|_^| ^|_^|
echo.
echo   Lead Scraper - Vind nieuwe klanten
echo  =============================================
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
echo   --- TESTEN ---
echo   [1] Lokaal (Veldhoven, Eindhoven, Best) - GRATIS tier
echo.
echo   --- NEDERLAND ---
echo   [2] Brabant (10 steden)
echo   [3] Randstad (10 steden)
echo   [4] Noord-Nederland (10 steden)
echo   [5] Oost-Nederland (10 steden)  
echo   [6] Zuid-Nederland (10 steden)
echo   [7] HEEL NEDERLAND (85+ steden) - ~$200
echo.
echo   --- BELGIE ---
echo   [8] Vlaanderen (11 steden)
echo   [9] Brussel (10 gemeenten)
echo   [10] HEEL BELGIE (75+ steden) - ~$150
echo.
echo   --- ALLES ---
echo   [11] NL + BE COMPLEET (160+ steden) - ~$350
echo.
echo   --- TOOLS ---
echo   [E] Email Outreach starten
echo   [D] Dashboard openen
echo   [L] Lijst steden bekijken
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
    echo [INFO] Starten met Noord-Nederland preset...
    python apify_lead_finder.py --preset noord
)
if "%choice%"=="5" (
    echo.
    echo [INFO] Starten met Oost-Nederland preset...
    python apify_lead_finder.py --preset oost
)
if "%choice%"=="6" (
    echo.
    echo [INFO] Starten met Zuid-Nederland preset...
    python apify_lead_finder.py --preset zuid
)
if "%choice%"=="7" (
    echo.
    echo [WAARSCHUWING] Dit kost ongeveer $200 en duurt 30-60 minuten!
    set /p confirm="Weet je het zeker? (j/n): "
    if /i "%confirm%"=="j" (
        echo [INFO] Starten met heel Nederland...
        python apify_lead_finder.py --preset nederland
    )
)
if "%choice%"=="8" (
    echo.
    echo [INFO] Starten met Vlaanderen preset...
    python apify_lead_finder.py --preset vlaanderen
)
if "%choice%"=="9" (
    echo.
    echo [INFO] Starten met Brussel preset...
    python apify_lead_finder.py --preset brussel
)
if "%choice%"=="10" (
    echo.
    echo [WAARSCHUWING] Dit kost ongeveer $150 en duurt 20-40 minuten!
    set /p confirm="Weet je het zeker? (j/n): "
    if /i "%confirm%"=="j" (
        echo [INFO] Starten met heel Belgie...
        python apify_lead_finder.py --preset belgie
    )
)
if "%choice%"=="11" (
    echo.
    echo [WAARSCHUWING] Dit kost ongeveer $350 en duurt 60-90 minuten!
    echo Dit scraped Nederland EN Belgie compleet!
    set /p confirm="Weet je het zeker? (j/n): "
    if /i "%confirm%"=="j" (
        echo [INFO] Starten met NL + BE compleet...
        python apify_lead_finder.py --preset alles
    )
)
if /i "%choice%"=="E" (
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
if /i "%choice%"=="D" (
    echo [INFO] Dashboard openen in browser...
    start http://localhost:3000/dashboard/leads
)
if /i "%choice%"=="L" (
    echo.
    python apify_lead_finder.py --list-cities
)
if "%choice%"=="0" (
    exit /b 0
)

echo.
echo ============================================
echo Klaar! Druk op een toets om af te sluiten.
pause >nul
