# ============================================
# Ro-Tech Lead Dashboard - Snelkoppeling Maker
# Maakt snelkoppelingen op het bureaublad
# ============================================

Write-Host ""
Write-Host "  Ro-Tech Lead Dashboard - Snelkoppeling Maker" -ForegroundColor Cyan
Write-Host "  ============================================" -ForegroundColor Cyan
Write-Host ""

# Paden
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$desktopPath = [Environment]::GetFolderPath("Desktop")
$dashboardBat = Join-Path $scriptDir "Start-LeadDashboard.bat"
$scraperBat = Join-Path $scriptDir "Start-LeadScraper.bat"
$logoSvg = Join-Path $scriptDir "..\..\public\images\rotech\rotech-icon.svg"
$logoIco = Join-Path $scriptDir "rotech-icon.ico"

# Functie om snelkoppeling te maken
function Create-Shortcut {
    param (
        [string]$Name,
        [string]$TargetPath,
        [string]$IconPath,
        [string]$Description
    )
    
    $shortcutPath = Join-Path $desktopPath "$Name.lnk"
    
    $shell = New-Object -ComObject WScript.Shell
    $shortcut = $shell.CreateShortcut($shortcutPath)
    $shortcut.TargetPath = $TargetPath
    $shortcut.WorkingDirectory = $scriptDir
    $shortcut.Description = $Description
    
    # Gebruik icoon als beschikbaar
    if ($IconPath -and (Test-Path $IconPath)) {
        $shortcut.IconLocation = "$IconPath,0"
    }
    
    $shortcut.Save()
    
    Write-Host "  [OK] $Name.lnk gemaakt op bureaublad" -ForegroundColor Green
}

# Check of de .bat bestanden bestaan
if (-not (Test-Path $dashboardBat)) {
    Write-Host "  [FOUT] Start-LeadDashboard.bat niet gevonden!" -ForegroundColor Red
    exit 1
}

# Maak snelkoppelingen
Write-Host "  Snelkoppelingen maken..." -ForegroundColor Yellow
Write-Host ""

# Lead Dashboard snelkoppeling
Create-Shortcut `
    -Name "Ro-Tech Lead Dashboard" `
    -TargetPath $dashboardBat `
    -IconPath $logoIco `
    -Description "Start de Ro-Tech Lead Dashboard"

# Lead Scraper snelkoppeling  
Create-Shortcut `
    -Name "Ro-Tech Lead Scraper" `
    -TargetPath $scraperBat `
    -IconPath $logoIco `
    -Description "Start de Ro-Tech Lead Scraper"

Write-Host ""
Write-Host "  ============================================" -ForegroundColor Cyan
Write-Host "  Klaar! Je hebt nu 2 snelkoppelingen:" -ForegroundColor Green
Write-Host ""
Write-Host "    - Ro-Tech Lead Dashboard" -ForegroundColor White
Write-Host "      (Start website + opent dashboard)" -ForegroundColor Gray
Write-Host ""
Write-Host "    - Ro-Tech Lead Scraper" -ForegroundColor White
Write-Host "      (Menu voor scrapen en email outreach)" -ForegroundColor Gray
Write-Host ""
Write-Host "  ============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  TIP: Om het Ro-Tech logo als icoon te gebruiken:" -ForegroundColor Yellow
Write-Host "  1. Ga naar https://convertio.co/svg-ico/" -ForegroundColor Gray
Write-Host "  2. Upload: public/images/rotech/rotech-icon.svg" -ForegroundColor Gray
Write-Host "  3. Download de .ico en sla op als:" -ForegroundColor Gray
Write-Host "     tools/lead-finder/rotech-icon.ico" -ForegroundColor Gray
Write-Host "  4. Klik rechts op snelkoppeling > Eigenschappen > Ander pictogram" -ForegroundColor Gray
Write-Host ""

Read-Host "Druk op Enter om af te sluiten"
