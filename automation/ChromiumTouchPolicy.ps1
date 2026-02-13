<#
.SYNOPSIS
    Hardening Maestro para Chromium (Versión Corregida)
    Soluciona errores de "Obligatoria/Error" mediante sintaxis estricta.

    reg query "HKLM\SOFTWARE\Policies\Microsoft\Windows\EdgeUI" /v AllowEdgeSwipe

    reg add "HKLM\SOFTWARE\Policies\Microsoft\Windows\EdgeUI" /v AllowEdgeSwipe /t REG_DWORD /d 0 /f

#>

function Write-Check($text) { Write-Host "[✔] $text" -ForegroundColor Green }
function Write-Step($text) { Write-Host ">> $text..." -ForegroundColor Cyan }

Clear-Host
Write-Host "--- APLICANDO POLÍTICAS CORRECTIVAS A CHROMIUM ---" -ForegroundColor Yellow -BackgroundColor Black

# Definimos las rutas probables (Chromium puro suele usar la de Google o Chromium)
$regPaths = @("HKLM:\SOFTWARE\Policies\Chromium", "HKLM:\SOFTWARE\Policies\Google\Chrome")

foreach ($path in $regPaths) {
    if (!(Test-Path $path)) { New-Item $path -Force | Out-Null }
    Write-Step "Configurando ruta: $path"

    # 1. POLÍTICAS BOOLEANAS Y NUMÉRICAS (DWord)
    # Aquí bloqueamos gestos, zoom, menús y grupos de pestañas
    $settings = @{
        "OverscrollHistoryNavigationEnabled" = 0
        "TouchEventsEnabled"                 = 1
        "DefaultContextMenuSetting"          = 2
        "QuickSearchShowMiniMenu"            = 0
        "TabDiscardingEnabled"               = 0
        "TabGroupsEnabled"                   = 0
        "ClearBrowsingDataOnExit"            = 1
    }

    foreach ($name in $settings.Keys) {
        Set-ItemProperty -Path $path -Name $name -Value $settings[$name] -Type DWord -Force
    }

    # 2. CORRECCIÓN PARA ClearBrowsingDataOnExit
    # Esto elimina el error porque ahora sí le decimos QUÉ borrar
    $listPath = "$path\ClearBrowsingDataOnExitList"
    if (!(Test-Path $listPath)) { New-Item $listPath -Force | Out-Null }
    
    $dataTypes = @("browsing_history", "download_history", "cookies_and_other_site_data", "cached_images_and_files")
    for ($i=0; $i -lt $dataTypes.Count; $i++) {
        Set-ItemProperty -Path $listPath -Name ($i+1).ToString() -Value $dataTypes[$i] -Force
    }

    # 3. EXTENSIÓN FORZADA (Sintaxis String)
    $extId = "kaebgciankbnfahggmajibggfgekmkem"
    $extFolder = "C:/KioskDisplay/kiosko_extension"
    $json = '{"' + $extId + '": {"installation_mode": "force_installed", "path": "' + $extFolder + '"}}'
    Set-ItemProperty -Path $path -Name "ExtensionSettings" -Value $json -Type String -Force
}

# 4. REFRESCAR SISTEMA
Write-Step "Sincronizando políticas de grupo (GPUpdate)"
gpupdate /force | Out-Null

Write-Check "Hardening completado. Los errores de 'Obligatoria' deberían desaparecer."
Write-Host "TIP: Reinicia Chromium y revisa chrome://policy" -ForegroundColor Magenta


