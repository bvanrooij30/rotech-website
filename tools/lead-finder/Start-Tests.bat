@echo off
chcp 65001 > nul
title Ro-Tech Email System Tests

echo.
echo  ╔════════════════════════════════════════════════════════════╗
echo  ║     RO-TECH EMAIL SYSTEM - TEST SUITE                      ║
echo  ║     Valideer het systeem ZONDER risico                     ║
echo  ╚════════════════════════════════════════════════════════════╝
echo.

:menu
echo  ┌────────────────────────────────────────────────────────────┐
echo  │  Kies een test:                                            │
echo  │                                                            │
echo  │  [1] Volledige Test Suite   - Test alle componenten        │
echo  │  [2] LIVE TEST OUTLOOK      - Stuur naar bartvrooij14      │
echo  │  [3] Mail-Tester Check      - Open mail-tester.com         │
echo  │  [4] MXToolbox Check        - Check SPF/DKIM/DMARC         │
echo  │  [5] Mailtrap Sandbox       - Test zonder echte emails     │
echo  │                                                            │
echo  │  [0] Terug                                                 │
echo  └────────────────────────────────────────────────────────────┘
echo.

set /p choice="Keuze: "

if "%choice%"=="1" goto fulltest
if "%choice%"=="2" goto livetest
if "%choice%"=="3" goto mailtester
if "%choice%"=="4" goto mxtoolbox
if "%choice%"=="5" goto mailtrap
if "%choice%"=="0" goto end

echo Ongeldige keuze.
goto menu

:fulltest
echo.
echo ═══════════════════════════════════════════════════════════════
echo  VOLLEDIGE TEST SUITE
echo ═══════════════════════════════════════════════════════════════
python test_email_system.py
echo.
pause
goto menu

:livetest
echo.
echo ═══════════════════════════════════════════════════════════════
echo  LIVE EMAIL TEST - VERSTUREN NAAR OUTLOOK
echo ═══════════════════════════════════════════════════════════════
echo.
echo  Dit verstuurt een ECHTE test email naar:
echo  bartvrooij14@hotmail.com
echo.
set /p confirm="Doorgaan? (ja/nee): "
if /i "%confirm%"=="ja" (
    python test_email_system.py live
) else (
    echo Geannuleerd.
)
echo.
pause
goto menu

:mailtrap
echo.
echo ═══════════════════════════════════════════════════════════════
echo  MAILTRAP SANDBOX TEST
echo ═══════════════════════════════════════════════════════════════
python test_email_system.py mailtrap
echo.
pause
goto menu

:mailtester
echo.
echo  Opening mail-tester.com...
start https://mail-tester.com/
echo.
echo  INSTRUCTIES:
echo  1. Kopieer het email adres dat je ziet
echo  2. Stuur een test email VANUIT je outreach mailbox naar dit adres
echo  3. Wacht 30 seconden
echo  4. Klik "Then check your score"
echo  5. Doel: 9/10 of hoger
echo.
pause
goto menu

:mxtoolbox
echo.
echo  Opening MXToolbox...
echo.
echo  Test deze URLs:
start https://mxtoolbox.com/spf.aspx
timeout /t 2 > nul
start https://mxtoolbox.com/dkim.aspx
timeout /t 2 > nul
start https://mxtoolbox.com/dmarc.aspx
echo.
echo  Voer je domein in (bijv: ro-techdevelopment.dev)
echo  Alle tests moeten GROEN zijn.
echo.
pause
goto menu

:end
exit
