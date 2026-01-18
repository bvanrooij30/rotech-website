@echo off
title Ro-Tech Admin Portal
cd /d "%~dp0"

echo.
echo  ===============================================
echo   Ro-Tech Admin Portal
echo   Lokaal beheerportaal voor Ro-Tech Development
echo  ===============================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python is niet geinstalleerd!
    echo Download Python van: https://python.org
    pause
    exit /b 1
)

REM Check if virtual environment exists
if not exist "venv" (
    echo [INFO] Virtual environment aanmaken...
    python -m venv venv
)

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Check if dependencies are installed
python -c "import customtkinter" >nul 2>&1
if errorlevel 1 (
    echo [INFO] Dependencies installeren...
    pip install -r requirements.txt
    echo.
)

REM Start the application
echo [INFO] Admin Portal starten...
echo.
python main.py

pause
