@echo off
chcp 65001 > nul
title Ro-Tech Email Scheduler

echo.
echo  ╔════════════════════════════════════════════════════════════╗
echo  ║     RO-TECH EMAIL SCHEDULER - Veilige Email Outreach       ║
echo  ║     Automatische warm-up en bescherming                    ║
echo  ╚════════════════════════════════════════════════════════════╝
echo.

:menu
echo  ┌────────────────────────────────────────────────────────────┐
echo  │  Kies een optie:                                           │
echo  │                                                            │
echo  │  [1] Status bekijken     - Zie huidige fase en limieten    │
echo  │  [2] Test run            - Simuleer verzending (geen mail) │
echo  │  [3] Emails verwerken    - Verstuur geplande emails        │
echo  │  [4] Scheduler hervatten - Hervat na pauze                 │
echo  │  [5] Reset dagelijks     - Reset vandaag's tellers         │
echo  │  [6] Leads inplannen     - Plan leads uit JSON bestand     │
echo  │                                                            │
echo  │  [0] Afsluiten                                             │
echo  └────────────────────────────────────────────────────────────┘
echo.

set /p choice="Keuze: "

if "%choice%"=="1" goto status
if "%choice%"=="2" goto test
if "%choice%"=="3" goto process
if "%choice%"=="4" goto resume
if "%choice%"=="5" goto reset
if "%choice%"=="6" goto schedule
if "%choice%"=="0" goto end

echo Ongeldige keuze, probeer opnieuw.
goto menu

:status
echo.
echo ═══════════════════════════════════════════════════════════════
python email_scheduler.py status
echo ═══════════════════════════════════════════════════════════════
echo.
pause
goto menu

:test
echo.
echo ═══════════════════════════════════════════════════════════════
echo  TEST MODUS - Geen echte emails worden verstuurd
echo ═══════════════════════════════════════════════════════════════
python email_scheduler.py test
echo.
pause
goto menu

:process
echo.
echo ═══════════════════════════════════════════════════════════════
echo  EMAILS VERSTUREN
echo  Let op: Dit verstuurt echte emails!
echo ═══════════════════════════════════════════════════════════════
echo.
set /p confirm="Weet je het zeker? (ja/nee): "
if /i "%confirm%"=="ja" (
    python email_scheduler.py process
) else (
    echo Geannuleerd.
)
echo.
pause
goto menu

:resume
echo.
python email_scheduler.py resume
echo.
pause
goto menu

:reset
echo.
python email_scheduler.py reset
echo.
pause
goto menu

:schedule
echo.
echo Voer het pad naar je leads JSON bestand in:
echo (bijv: output\leads_20260121.json)
echo.
set /p leadsfile="Bestand: "
if exist "%leadsfile%" (
    python email_scheduler.py status --leads "%leadsfile%"
    echo.
    echo Leads zijn ingepland!
) else (
    echo Bestand niet gevonden: %leadsfile%
)
echo.
pause
goto menu

:end
echo.
echo Tot ziens!
exit
