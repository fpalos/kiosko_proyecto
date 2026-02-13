<#
.SYNOPSIS
    Hardening de políticas para el motor Chromium Puro.
    Bloqueo de gestos de navegación, zoom y menús contextuales.
#>

function Write-Check($text) {
    Write-Host "[✔] $text" -ForegroundColor Green
}

function Write-Step($text) {
    Write-Host ">> $text..." -ForegroundColor Cyan
}

Clear-Host
Write-Host "--- APLICANDO POLÍTICAS A CHROMIUM PURO ---" -ForegroundColor Yellow -BackgroundColor Black

# 1. DEFINICIÓN DE LA RUTA DE CHROMIUM
# A diferencia de Edge, Chromium busca en SOFTWARE\Policies\Chromium
$chromiumPolicy = "HKLM:\SOFTWARE\Policies\Chromium"
if (!(Test-Path $chromiumPolicy)) { New-Item $chromiumPolicy -Force | Out-Null }

# 2. DESACTIVAR GESTOS DE NAVEGACIÓN (BACK/FORWARD SWIPE)
# Evita que el usuario deslice para navegar en el historial
Write-Step "Desactivando Overscroll History Navigation"
Set-ItemProperty -Path $chromiumPolicy -Name "OverscrollHistoryNavigationEnabled" -Value 0 -Type DWord -Force

# 3. CONTROL DE EVENTOS TÁCTILES Y ZOOM
# Fuerza a Chromium a manejar los toques de forma simple (evita pinch-to-zoom)
Write-Step "Restringiendo eventos táctiles (Bloqueo de Zoom)"
Set-ItemProperty -Path $chromiumPolicy -Name "TouchEventsEnabled" -Value 1 -Type DWord -Force

# 4. DESACTIVAR MENÚ CONTEXTUAL (LONG PRESS)
# Evita que el toque prolongado abra el menú de 'Inspeccionar' o 'Guardar como'
Write-Step "Desactivando Menú Contextual (Clic derecho táctil)"
Set-ItemProperty -Path $chromiumPolicy -Name "DefaultContextMenuSetting" -Value 2 -Type DWord -Force

# 5. BLOQUEO DE POPUPS Y MINI-MENÚS DE SELECCIÓN
# Evita que aparezcan burbujas de búsqueda de Windows al seleccionar texto
Write-Step "Desactivando burbujas de búsqueda y mini-menús"
Set-ItemProperty -Path $chromiumPolicy -Name "QuickSearchShowMiniMenu" -Value 0 -Type DWord -Force

# 6. INSTALACIÓN FORZADA DE EXTENSIÓN (Si decides volver a usarla en Chromium)
# Sustituye TU_ID_AQUI por el ID de tu extensión local
$extId = "kaebgciankbnfahggmajibggfgekmkem"
$extPath = "C:/KioskDisplay/kiosko_extension"
$jsonConfig = '{"' + $extId + '": {"installation_mode": "force_installed", "path": "' + $extPath + '"}}'

Write-Step "Configurando carga forzada de extensión local"
Set-ItemProperty -Path $chromiumPolicy -Name "ExtensionSettings" -Value $jsonConfig -Type String -Force

# 7. REFRESCAR SISTEMA
Write-Step "Sincronizando políticas de grupo"
gpupdate /force | Out-Null

Write-Check "Hardening de Chromium completado exitosamente."
Write-Host ""
Write-Host "NOTA: Asegúrate de que tu binario de Chromium esté configurado para leer GPO." -ForegroundColor Gray