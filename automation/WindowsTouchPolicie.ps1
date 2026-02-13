<#
.SYNOPSIS
    Blindaje de Gestos Táctiles y Restricción de Interfaz de Usuario.
    Objetivo: Evitar que el usuario salga de la aplicación mediante gestos de borde.
#>

function Write-Check($text) {
    Write-Host "[✔] $text" -ForegroundColor Green
}

function Write-Step($text) {
    Write-Host ">> $text..." -ForegroundColor Cyan
}

Clear-Host
Write-Host "--- DESACTIVANDO GESTOS Y BLINDANDO INTERFAZ ---" -ForegroundColor Yellow -BackgroundColor Black

# 1. DESACTIVAR GESTOS DE BORDE (EDGE SWIPES)
# Esto mata el gesto de derecha a izquierda (Centro de Actividades) y de izquierda a derecha (Multitarea)
Write-Step "Desactivando gestos de borde (Swipe Left/Right)"
$edgeUI = "HKLM:\SOFTWARE\Policies\Microsoft\Windows\EdgeUI"
if (!(Test-Path $edgeUI)) { New-Item $edgeUI -Force | Out-Null }
Set-ItemProperty -Path $edgeUI -Name "AllowEdgeSwipe" -Value 0 -Type DWord -Force
Write-Check "Gestos de borde desactivados."

# 2. DESACTIVAR EL CENTRO DE NOTIFICACIONES Y ACCIONES
# Evita que aparezcan globos de texto o el panel de control lateral
Write-Step "Bloqueando Centro de Notificaciones y Action Center"
$polExplorer = "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\Explorer"
if (!(Test-Path $polExplorer)) { New-Item $polExplorer -Force | Out-Null }
Set-ItemProperty -Path $polExplorer -Name "DisableNotificationCenter" -Value 1 -Type DWord -Force
Write-Check "Centro de notificaciones bloqueado."

# 3. DESACTIVAR EL "SWIPE DOWN" PARA CERRAR APLICACIONES
# En tablets, deslizar desde arriba hacia abajo puede cerrar o minimizar la app. 
# Esto restringe el acceso al buscador y gestos de sistema desde el borde superior.
Write-Step "Restringiendo interfaz de búsqueda y gestos superiores"
$searchPol = "HKLM:\SOFTWARE\Policies\Microsoft\Windows\Windows Search"
if (!(Test-Path $searchPol)) { New-Item $searchPol -Force | Out-Null }
Set-ItemProperty -Path $searchPol -Name "AllowSearchToUseLocation" -Value 0 -Type DWord -Force
Write-Check "Gestos de búsqueda superior limitados."

# 4. OCULTAR BARRA DE TAREAS Y BOTÓN DE INICIO (POLÍTICA LPO)
# Esto evita que la barra de tareas "salte" al tocar la parte inferior
Write-Step "Configurando restricciones de la barra de tareas"
Set-ItemProperty -Path $polExplorer -Name "NoTaskGrouping" -Value 1 -Type DWord -Force
Set-ItemProperty -Path $polExplorer -Name "NoSetTaskbar" -Value 1 -Type DWord -Force
Write-Check "Configuración de barra de tareas protegida."

# 5. BLOQUEO DE TECLAS DE "ESCAPE" (WIN, ALT+TAB, CTRL+ALT+DEL)
# Aunque no es táctil, protege contra teclados externos o gestos que simulan teclas
Write-Step "Desactivando atajos de teclado del sistema"
Set-ItemProperty -Path $polExplorer -Name "NoKeyShortcuts" -Value 1 -Type DWord -Force
Set-ItemProperty -Path $polExplorer -Name "NoWinKeys" -Value 1 -Type DWord -Force
Write-Check "Atajos de teclado (WinKey) desactivados."

# 6. REFRESCAR POLÍTICAS
Write-Step "Aplicando cambios de forma inmediata"
gpupdate /force | Out-Null
Write-Check "Políticas de sistema refrescadas."

Write-Host ""
Write-Host "--- PROCESO FINALIZADO ---" -ForegroundColor Yellow -BackgroundColor Black
Write-Host "RECOMENDACIÓN: Reinicia para aplicar el bloqueo de EdgeUI por completo." -ForegroundColor Magenta