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
    $arguments = @(
        "--kiosk",                    # Fuerza pantalla completa real
        "--force-device-scale-factor=1", # Fuerza zoom al 100%
        "--no-first-run",            # Evita pantallas de bienvenida
        "--no-default-browser-check", # Evita preguntar si es el navegador por defecto
        "--disable-infobars",        # Deshabilita barras de información
        "--disable-extensions-except=`"$EXTENSION_DIR`"", # Solo cargar nuestra extensión
        "--load-extension=`"$EXTENSION_DIR`"",
        "--disable-web-security",    # Permite cargar extensiones locales
        "--disable-features=VizDisplayCompositor,TouchpadOverscrollHistoryNavigation,OverscrollHistoryNavigation", # Evita problemas con extensiones y navegación con gestos
        "--overscroll-history-navigation=0", # Deshabilita navegación con gestos de overscroll
        "--allow-running-insecure-content", # Permite contenido inseguro para extensiones locales
        "--disable-password-manager-reauthentication", # Deshabilita reautenticación de contraseñas
        "--disable-save-password-bubble", # Deshabilita burbujas de guardar contraseña
        "--disable-autofill",        # Deshabilita autocompletado
        "--disable-sync",            # Deshabilita sincronización
        "--disable-background-mode", # Deshabilita ejecución en segundo plano
        "--disable-background-timer-throttling", # Deshabilita throttling de timers
        "--disable-renderer-backgrounding", # Deshabilita backgrounding del renderer
        "--disable-backgrounding-occluded-windows", # Deshabilita backgrounding de ventanas ocultas
        "--disable-features=TranslateUI,PasswordManager,AutofillServerCommunication,AutofillDownloadManager", # Deshabilita completamente gestores
        "--disable-password-generation", # Deshabilita generación de contraseñas
        "--disable-autofill-keyboard-accessory-view", # Deshabilita vista de accesorios
        "--disable-single-click-autofill", # Deshabilita autofill con un click
        "--password-store=basic",    # Usa almacén básico (no funcional)
        "--disable-login-animations", # Deshabilita animaciones de login
        "--disable-credential-manager-api", # Deshabilita API de gestor de credenciales
        "$localHtmlUrl"              # URL a abrir
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
