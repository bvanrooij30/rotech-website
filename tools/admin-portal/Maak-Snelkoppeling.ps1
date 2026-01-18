# Maak een Windows snelkoppeling voor Ro-Tech Admin Portal
# Voer dit script eenmaal uit als administrator

$WshShell = New-Object -ComObject WScript.Shell

# Desktop snelkoppeling
$DesktopPath = [Environment]::GetFolderPath("Desktop")
$ShortcutPath = Join-Path $DesktopPath "Ro-Tech Admin Portal.lnk"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$TargetPath = Join-Path $ScriptDir "Start-AdminPortal.bat"

$Shortcut = $WshShell.CreateShortcut($ShortcutPath)
$Shortcut.TargetPath = $TargetPath
$Shortcut.WorkingDirectory = $ScriptDir
$Shortcut.Description = "Ro-Tech Admin Portal - Lokaal beheerportaal"
$Shortcut.Save()

Write-Host ""
Write-Host "✅ Snelkoppeling aangemaakt op je bureaublad!" -ForegroundColor Green
Write-Host ""
Write-Host "   Ro-Tech Admin Portal.lnk"
Write-Host ""
Write-Host "Dubbelklik op de snelkoppeling om de Admin Portal te starten."
Write-Host ""

Read-Host "Druk op Enter om te sluiten"
