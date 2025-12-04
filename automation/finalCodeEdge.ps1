# CONFIGURACIÓN
$WEB_SERVER     = "http://172.18.100.10:7001"
$EXTENSION_URL  = "$WEB_SERVER/glp/resources/extension"
#$EXTENSION_DIR  = "$env:USERPROFILE\Kiosko_extension"
$EXTENSION_DIR  = "$env:USERPROFILE\Kiosko_extension_V2"
$EDGE_PATH      = "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe"
$LOG_FILE       = "$EXTENSION_DIR\setup.log"
$url            = "$WEB_SERVER/glp/newproject.jsf" 

# ============================================================
# UTILIDADES
# ============================================================

function Write-ColorLog {
    param(
        [string]$Message,
        [string]$Level = "INFO"
    )
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] [$Level] $Message"
    
    # Escribir en archivo log
    try {
        Add-Content -Path $LOG_FILE -Value $logMessage -ErrorAction SilentlyContinue
    } catch {}
    
    # Colores en consola
    $color = @{
        "INFO"    = "White"
        "SUCCESS" = "Green"
        "WARNING" = "Yellow"
        "ERROR"   = "Red"
        "ACTION"  = "Cyan"
    }
    
    Write-Host $logMessage -ForegroundColor $color[$Level]
}

# ============================================================
# PASO 0: CREAR DIRECTORIOS NECESARIOS
# ============================================================

function Setup-Directories {
    Write-ColorLog "Verificando directorios necesarios..." "ACTION"
    
    # Crear directorio en perfil del usuario
    if (-not (Test-Path $EXTENSION_DIR)) {
        try {
            New-Item -ItemType Directory -Path $EXTENSION_DIR -Force | Out-Null
            Write-ColorLog "✅ Directorio creado: $EXTENSION_DIR" "SUCCESS"
        }
        catch {
            Write-ColorLog "❌ Error al crear directorio: $_" "ERROR"
            return $false
        }
    }
    else {
        Write-ColorLog "✅ Directorio ya existe: $EXTENSION_DIR" "SUCCESS"
    }
    
    return $true
}

# ============================================================
# PASO 1: VERIFICAR SI LA EXTENSIÓN EXISTE
# ============================================================

function Test-ExtensionExists {
    Write-ColorLog "Verificando si la extensión existe localmente..." "ACTION"
    
    $manifestPath = "$EXTENSION_DIR\manifest.json"
    $contentPath = "$EXTENSION_DIR\content.js"
    $logoPath = "$EXTENSION_DIR\kioskoAppLogo.png"
    $indexPath = "$EXTENSION_DIR\index.html"
    
    $manifestExists = Test-Path $manifestPath
    $contentExists = Test-Path $contentPath
    $logoExists = Test-Path $logoPath
    $indexExists = Test-Path $indexPath
    
    if ($manifestExists -and $contentExists -and $logoExists -and $indexExists) {
        Write-ColorLog "✅ Extensión EXISTE localmente" "SUCCESS"
        Write-ColorLog "   - manifest.json ✓" "SUCCESS"
        Write-ColorLog "   - content.js ✓" "SUCCESS"
        Write-ColorLog "   - kioskoAppLogo.png ✓" "SUCCESS"
        Write-ColorLog "   - index.html ✓" "SUCCESS"
        return $true
    }
    else {
        Write-ColorLog "⚠️  Extensión INCOMPLETA (archivos faltantes)" "WARNING"
        if (-not $manifestExists) { Write-ColorLog "   - manifest.json ✗" "WARNING" }
        if (-not $contentExists) { Write-ColorLog "   - content.js ✗" "WARNING" }
        if (-not $logoExists) { Write-ColorLog "   - kioskoAppLogo.png ✗" "WARNING" }
        if (-not $indexExists) { Write-ColorLog "   - index.html ✗" "WARNING" }
        return $false
    }
}

# ============================================================
# PASO 2: COMPARAR VERSIONES (manifest.json)
# ============================================================

function Get-ManifestVersion {
    param(
        [string]$FilePath
    )
    
    try {
        $manifestJson = Get-Content $FilePath -Raw | ConvertFrom-Json
        return $manifestJson.version
    }
    catch {
        Write-ColorLog "Error al parsear manifest.json: $_" "ERROR"
        return $null
    }
}

function Test-UpdateNeeded {
    Write-ColorLog "Comparando versiones del manifest..." "ACTION"
    
    $localManifestPath = "$EXTENSION_DIR\manifest.json"
    $remoteManifestUrl = "$EXTENSION_URL/manifest.json"
    
    # Descargar manifest remoto a temporal
    $tempRemoteManifest = "$env:TEMP\manifest-remote.json"
    
    try {
        Write-ColorLog "Descargando manifest remoto..." "INFO"
        Invoke-WebRequest -Uri $remoteManifestUrl -OutFile $tempRemoteManifest -ErrorAction Stop | Out-Null
        
        $remoteVersion = Get-ManifestVersion -FilePath $tempRemoteManifest
        
        if ($null -eq $remoteVersion) {
            Write-ColorLog "❌ No se pudo obtener versión remota" "ERROR"
            return $null
        }
        
        # Si no existe extensión local, necesita descarga
        if (-not (Test-Path $localManifestPath)) {
            Write-ColorLog "📦 Versión remota: $remoteVersion (Local: NO EXISTE)" "INFO"
            return $true
        }
        
        # Si existe, comparar versiones
        $localVersion = Get-ManifestVersion -FilePath $localManifestPath
        
        Write-ColorLog "📍 Versión local: $localVersion" "INFO"
        Write-ColorLog "📍 Versión remota: $remoteVersion" "INFO"
        
        if ($remoteVersion -ne $localVersion) {
            Write-ColorLog "🔄 Actualización disponible: $localVersion → $remoteVersion" "SUCCESS"
            return $true
        }
        else {
            Write-ColorLog "✅ Ya está en la versión actual: $remoteVersion" "SUCCESS"
            return $false
        }
    }
    catch {
        Write-ColorLog "❌ Error al verificar versiones: $_" "ERROR"
        return $null
    }
    finally {
        # Limpiar temporal
        if (Test-Path $tempRemoteManifest) {
            Remove-Item $tempRemoteManifest -Force -ErrorAction SilentlyContinue
        }
    }
}

# ============================================================
# PASO 3: DESCARGAR ARCHIVOS DE LA EXTENSIÓN
# ============================================================

function Download-ExtensionFile {
    param(
        [string]$FileName
    )
    
    $fileUrl = "$EXTENSION_URL/$FileName"
    $filePath = "$EXTENSION_DIR\$FileName"
    
    try {
        Write-ColorLog "⬇️  Descargando: $FileName" "ACTION"
        Invoke-WebRequest -Uri $fileUrl -OutFile $filePath -ErrorAction Stop
        
        # Esperar a que el archivo esté completamente escrito en disco
        Start-Sleep -Milliseconds 500
        
        $fileSize = (Get-Item $filePath).Length
        Write-ColorLog "✅ Descargado: $FileName ($fileSize bytes)" "SUCCESS"
        
        return $true
    }
    catch {
        Write-ColorLog "❌ Error al descargar $FileName : $_" "ERROR"
        return $false
    }
}

function Download-ExtensionFiles {
    Write-ColorLog "`n━━━ [DESCARGANDO ARCHIVOS] ━━━" "ACTION"
    
    $files = @("manifest.json", "content.js", "kioskoAppLogo.png", "index.html")
    $allDownloaded = $true
    
    foreach ($file in $files) {
        $success = Download-ExtensionFile -FileName $file
        if (-not $success) {
            $allDownloaded = $false
            break
        }
    }
    
    if ($allDownloaded) {
        Write-ColorLog "✅ Todos los archivos descargados correctamente" "SUCCESS"
        Write-ColorLog "⏳ Esperando a que los archivos se escriban en disco..." "INFO"
        Start-Sleep -Seconds 2
        Write-ColorLog "✅ Archivos listos para instalar" "SUCCESS"
        return $true
    }
    else {
        Write-ColorLog "❌ Fallo en descarga de archivos" "ERROR"
        return $false
    }
}

# ============================================================
# PASO 4: INSTALAR EXTENSIÓN EN MICROSOFT EDGE
# ============================================================

function Stop-Edge {
    Write-ColorLog "`n━━━ [DETENIENDO MICROSOFT EDGE] ━━━" "ACTION"
    
    try {
        $edgeProcess = Get-Process msedge -ErrorAction SilentlyContinue
        
        if ($edgeProcess) {
            Write-ColorLog "Cerrando proceso msedge.exe..." "INFO"
            Stop-Process -Name msedge -Force -ErrorAction SilentlyContinue
            Start-Sleep -Seconds 2
            Write-ColorLog "✅ Microsoft Edge detenido" "SUCCESS"
        }
        else {
            Write-ColorLog "ℹ️  Microsoft Edge no estaba en ejecución" "INFO"
        }
        
        return $true
    }
    catch {
        Write-ColorLog "⚠️  Error al detener Microsoft Edge: $_" "WARNING"
        return $true
    }
}

function Deploy-KioskExtension {
    Write-ColorLog "`n━━━ [DEPLOYING KIOSKO CON EXTENSIÓN] ━━━" "ACTION"
    
    try {
        # Verificar que el archivo Edge existe
        if (-not (Test-Path $EDGE_PATH)) {
            Write-ColorLog "❌ Microsoft Edge no encontrado en: $EDGE_PATH" "ERROR"
            return $false
        }
        
        Write-ColorLog "✅ Microsoft Edge encontrado: $EDGE_PATH" "SUCCESS"
        
        # Verificar que todos los archivos de la extensión existen
        Write-ColorLog "🔍 Verificando archivos de la extensión..." "INFO"
        
        $manifestPath = "$EXTENSION_DIR\manifest.json"
        $contentPath = "$EXTENSION_DIR\content.js"
        $logoPath = "$EXTENSION_DIR\kioskoAppLogo.png"
        $indexPath = "$EXTENSION_DIR\index.html"
        
        if (-not (Test-Path $manifestPath)) {
            Write-ColorLog "❌ manifest.json NO encontrado en: $manifestPath" "ERROR"
            return $false
        }
        
        if (-not (Test-Path $contentPath)) {
            Write-ColorLog "❌ content.js NO encontrado en: $contentPath" "ERROR"
            return $false
        }
        
        if (-not (Test-Path $logoPath)) {
            Write-ColorLog "❌ kioskoAppLogo.png NO encontrado en: $logoPath" "ERROR"
            return $false
        }
        
        if (-not (Test-Path $indexPath)) {
            Write-ColorLog "❌ index.html NO encontrado en: $indexPath" "ERROR"
            return $false
        }
        
        Write-ColorLog "✅ Todos los archivos verificados" "SUCCESS"
        
        # 1. LIMPIEZA DE PROCESOS (CRUCIAL)
        # Si Edge ya está corriendo, ignorará el comando --kiosk. Hay que cerrarlo primero.
        Write-ColorLog "🔄 Cerrando instancias previas de Microsoft Edge..." "WARNING"
        Get-Process "msedge" -ErrorAction SilentlyContinue | Stop-Process -Force
        Start-Sleep -Seconds 1
        
        # 2. LANZAR EN MODO KIOSKO (FULL SCREEN REAL)
        # Verificar que existe el archivo index.html local
        $indexHtmlPath = "$EXTENSION_DIR\index.html"
        if (-not (Test-Path $indexHtmlPath)) {
            Write-ColorLog "❌ index.html NO encontrado en: $indexHtmlPath" "ERROR"
            return $false
        }
        
        # Convertir a file:// URL para Edge
        $localHtmlUrl = "file:///$($indexHtmlPath.Replace('\','/'))"
        
        # Usamos Start-Process para mayor control y argumentos más limpios
        $arguments = @(
            "--kiosk",                    # Fuerza pantalla completa real (sin F11, sin bordes)
            "--no-first-run",            # Evita pantallas de bienvenida
            "--no-default-browser-check", # Evita preguntar si es el navegador por defecto
            "--window-position=0,0",     # Asegura que empiece en la esquina superior izquierda
            "--load-extension=`"$EXTENSION_DIR`"",
            "$localHtmlUrl"
        )
        
        Write-ColorLog "🚀 Lanzando Kiosko en modo pantalla completa..." "SUCCESS"
        Write-ColorLog "   HTML Local: $indexHtmlPath" "INFO"
        Write-ColorLog "   URL: $localHtmlUrl" "INFO"
        Write-ColorLog "   Extensión: $EXTENSION_DIR" "INFO"
        
        # Usamos Start-Process en lugar de "&" para pasar mejor los argumentos
        Start-Process -FilePath "$EDGE_PATH" -ArgumentList $arguments
        
        Write-ColorLog "⏳ Esperando a que el kiosko se inicialice..." "INFO"
        Start-Sleep -Seconds 3
        
        # Verificar que Edge está corriendo
        $edgeRunning = Get-Process msedge -ErrorAction SilentlyContinue
        
        if ($edgeRunning) {
            Write-ColorLog "✅ Kiosko iniciado correctamente" "SUCCESS"
            return $true
        }
        else {
            Write-ColorLog "⚠️  Kiosko se inició pero podría no estar respondiendo" "WARNING"
            return $true
        }
    }
    catch {
        Write-ColorLog "❌ Error al desplegar kiosko: $_" "ERROR"
        return $false
    }
}

# ============================================================
# LÓGICA PRINCIPAL
# ============================================================

function Main {
    Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║   INSTALADOR EXTENSIÓN KIOSKO - MICROSOFT EDGE       ║" -ForegroundColor Cyan
    Write-Host "║   Usuario: $env:USERNAME" -ForegroundColor Cyan
    Write-Host "╚════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan
    
    Write-ColorLog "═════════════════════════════════════════════════════════" "INFO"
    Write-ColorLog "Iniciando proceso de instalación" "INFO"
    Write-ColorLog "Usuario: $env:USERNAME" "INFO"
    Write-ColorLog "═════════════════════════════════════════════════════════" "INFO"
    
    # PASO 0: Verificar directorios
    Write-ColorLog "`n[PASO 0] Creando directorios necesarios..." "ACTION"
    if (-not (Setup-Directories)) {
        Write-ColorLog "❌ Fallo en creación de directorios" "ERROR"
        exit 1
    }
    
    # PASO 1: Verificar si extensión existe
    Write-ColorLog "`n[PASO 1] Verificando extensión local..." "ACTION"
    $extensionExists = Test-ExtensionExists
    
    # PASO 2: Comparar versiones
    Write-ColorLog "`n[PASO 2] Verificando si hay actualización..." "ACTION"
    
    $updateNeeded = Test-UpdateNeeded
    
    if ($updateNeeded -eq $null) {
        Write-ColorLog "⚠️  Error al verificar versiones, continuando con archivos locales" "WARNING"
    }
    elseif ($updateNeeded) {
        Write-ColorLog "🔄 Actualización disponible, descargando..." "SUCCESS"
        # PASO 3: Descargar archivos
        if (-not (Download-ExtensionFiles)) {
            Write-ColorLog "❌ Fallo en descarga de archivos, usando versión local" "WARNING"
        }
    }
    else {
        Write-ColorLog "✅ La extensión está actualizada, usando versión local" "SUCCESS"
    }
    
    # PASO 4: DEPLOY DEL KIOSKO (SIEMPRE SE EJECUTA)
    Write-ColorLog "`n[PASO FINAL] Desplegando kiosko con extensión..." "ACTION"
    if (-not (Deploy-KioskExtension)) {
        Write-ColorLog "❌ Fallo en despliegue del kiosko" "ERROR"
        exit 1
    }
    
    # RESULTADO FINAL
    Write-Host "`n╔════════════════════════════════════════════════════════╗" -ForegroundColor Green
    Write-Host "║              ✅ ¡KIOSKO DESPLEGADO!                  ║" -ForegroundColor Green
    Write-Host "║   Microsoft Edge ejecutándose en modo kiosko           ║" -ForegroundColor Green
    Write-Host "║   con extensión cargada correctamente                 ║" -ForegroundColor Green
    Write-Host "║                                                        ║" -ForegroundColor Green
    Write-Host "║   🌐 URL: $url" -ForegroundColor Green
    Write-Host "║   📍 Extensión: $EXTENSION_DIR" -ForegroundColor Green
    Write-Host "║   📋 Log: $LOG_FILE" -ForegroundColor Green
    Write-Host "╚════════════════════════════════════════════════════════╝`n" -ForegroundColor Green
    
    Write-ColorLog "Kiosko desplegado exitosamente" "SUCCESS"
    Write-ColorLog "═════════════════════════════════════════════════════════" "INFO"
}

# EJECUTAR
Main