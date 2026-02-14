# ============================================================
# KIOSKO LAUNCHER - Simple Chrome/Chromium Launcher
# ============================================================
# Este script simplemente lanza Chrome/Chromium con la extensión
# del kiosko y todos los argumentos necesarios.
# ============================================================

# CONFIGURACIÓN
$EXTENSION_DIR  = "$env:USERPROFILE\chrome-win\kiosko_extension"
$CHROME_PATH    = "$env:USERPROFILE\chrome-win\chrome.exe"

# ============================================================
# FUNCIÓN: LAUNCH KIOSKO
# ============================================================

function Launch-Kiosko {
    Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║        LANZADOR DE KIOSKO - CHROME/CHROMIUM         ║" -ForegroundColor Cyan
    Write-Host "║        Usuario: $env:USERNAME" -ForegroundColor Cyan
    Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host ""

    # Verificar que Chrome existe
    if (-not (Test-Path $CHROME_PATH)) {
        Write-Host "❌ Chrome no encontrado en: $CHROME_PATH" -ForegroundColor Red
        Write-Host "   Por favor, verifica la ruta en la variable `$CHROME_PATH" -ForegroundColor Yellow
        return $false
    }
    
    Write-Host "✅ Chrome encontrado: $CHROME_PATH" -ForegroundColor Green

    # Verificar que la extensión existe
    if (-not (Test-Path $EXTENSION_DIR)) {
        Write-Host "❌ Directorio de extensión no encontrado: $EXTENSION_DIR" -ForegroundColor Red
        Write-Host "   Por favor, verifica la ruta en la variable `$EXTENSION_DIR" -ForegroundColor Yellow
        return $false
    }
    
    Write-Host "✅ Extensión encontrada: $EXTENSION_DIR" -ForegroundColor Green

    # Verificar archivos críticos
    $indexHtmlPath = "$EXTENSION_DIR\index.html"
    $manifestPath = "$EXTENSION_DIR\manifest.json"
    
    if (-not (Test-Path $indexHtmlPath)) {
        Write-Host "❌ index.html no encontrado en: $indexHtmlPath" -ForegroundColor Red
        return $false
    }
    
    if (-not (Test-Path $manifestPath)) {
        Write-Host "❌ manifest.json no encontrado en: $manifestPath" -ForegroundColor Red
        return $false
    }
    
    Write-Host "✅ Archivos de extensión verificados" -ForegroundColor Green
    Write-Host ""

    # Cerrar instancias previas de Chrome
    Write-Host "🔄 Cerrando instancias previas de Chrome..." -ForegroundColor Yellow
    Get-Process "chrome" -ErrorAction SilentlyContinue | Stop-Process -Force
    Start-Sleep -Seconds 1
    
    # Convertir ruta local a URL file://
    $localHtmlUrl = "file:///$($indexHtmlPath.Replace('\','/'))"
    
    Write-Host "🚀 Lanzando Chrome en modo Kiosko..." -ForegroundColor Cyan
    Write-Host "   📄 HTML Local: $indexHtmlPath" -ForegroundColor White
    Write-Host "   🔗 URL: $localHtmlUrl" -ForegroundColor White
    Write-Host "   🧩 Extensión: $EXTENSION_DIR" -ForegroundColor White
    Write-Host ""

    # Configurar todos los argumentos de Chrome
    # ARGUMENTOS ACTUALIZADOS (Específicos para matar el Swipe Lateral)
    $chromeArgs = @(
        "--kiosk",
        "--user-data-dir=`"$KIOSK_DATA`"",
        "--no-first-run",
        "--no-default-browser-check",
        "--disable-infobars",
        
        # --- BLOQUEO DE NAVEGACIÓN LATERAL (SWIPE) ---
        "--overscroll-history-navigation=0", 
        "--disable-features=OverscrollHistoryNavigation,TouchpadOverscrollHistoryNavigation,EdgeSwipe",
        "--touch-events=enabled",           # Fuerza a Chrome a pasar el toque al HTML, no al navegador
        # --------------------------------------------

        "--disable-pinch",                  # Bloquea zoom
        "--disable-extensions-except=`"$EXTENSION_DIR`"",
        "--load-extension=`"$EXTENSION_DIR`"",
        "--disable-web-security",
        "--allow-running-insecure-content",
        "--disable-session-crashed-bubble",
        "`"$localHtmlUrl`""
    )

    try {
        # Lanzar Chrome con todos los argumentos
        Start-Process -FilePath $CHROME_PATH -ArgumentList $arguments
        
        Write-Host "⏳ Esperando a que el kiosko se inicialice..." -ForegroundColor Yellow
        Start-Sleep -Seconds 3
        
        # Verificar que Chrome está corriendo
        $chromeRunning = Get-Process "chrome" -ErrorAction SilentlyContinue
        
        if ($chromeRunning) {
            Write-Host "✅ Kiosko iniciado correctamente" -ForegroundColor Green
            Write-Host ""
            Write-Host "ℹ️  Para cerrar el kiosko, presiona Alt+F4 o cierra todas las ventanas de Chrome" -ForegroundColor Cyan
            return $true
        }
        else {
            Write-Host "⚠️  Chrome se inició pero podría no estar respondiendo" -ForegroundColor Yellow
            return $true
        }
    }
    catch {
        Write-Host "❌ Error al lanzar Chrome: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# ============================================================
# EJECUTAR LAUNCHER
# ============================================================

Write-Host ""
$result = Launch-Kiosko

if ($result) {
    Write-Host "🎉 Proceso completado" -ForegroundColor Green
}
else {
    Write-Host "❌ Error al lanzar el kiosko" -ForegroundColor Red
    Write-Host "   Presiona cualquier tecla para salir..." -ForegroundColor Yellow
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

Write-Host ""

