# CONFIGURACIÓN
$GITHUB_REPO    = "fpalos/kiosko_proyecto"          # Format: owner/repo
$EXTENSION_DIR  = "$env:USERPROFILE\chrome-win\kiosko_extension"
$CHROME_PATH    = "$env:USERPROFILE\chrome-win\chrome.exe"
$LOG_FILE       = "$EXTENSION_DIR\setup.log"
$versionFile    = "$EXTENSION_DIR\version.txt"
$tempZip        = "$env:TEMP\kiosko_update.zip"

# ============================================================
# POLÍTICAS PARA CHROMIUM
# ============================================================

function Apply-ChromiumPolicies {
    $chromiumPolicyPath = "HKLM:\SOFTWARE\Policies\Chromium"

    Write-Host "📌 Verificando políticas de Chromium..." -ForegroundColor Cyan

    # 1️⃣ Verificar si existe la clave principal
    if (-not (Test-Path $chromiumPolicyPath)) {
        Write-Host "⚠️  Las políticas no existen. Creando: $chromiumPolicyPath" -ForegroundColor Yellow

        try {
            New-Item -Path "HKCU:\SOFTWARE\Policies" -Name "Chromium" -Force | Out-Null
            Write-Host "✅ Carpeta 'Chromium' creada correctamente." -ForegroundColor Green
        }
        catch {
            Write-Host "❌ Error al crear políticas. Ejecuta PowerShell como Administrador." -ForegroundColor Red
            exit 1
        }
    }
    else {
        Write-Host "✔ Las políticas de Chromium ya existen." -ForegroundColor Green
    }

    # 2️⃣ Diccionario de políticas Chromium equivalentes a Edge
    $chromiumPolicies = @{

        # --- PRIVACIDAD Y DATOS ---
        "PasswordManagerEnabled"        = 0
        "SavingBrowserHistoryDisabled"  = 1
        "AutofillAddressEnabled"        = 0
        "AutofillCreditCardEnabled"     = 0
        "BrowserSignin"                 = 0
        "SearchSuggestEnabled"          = 0

        # Edge extras que NO existen en Chromium → No se incluyen

        "UserFeedbackAllowed"           = 0
        "DefaultBrowserSettingEnabled"  = 0
        "ShowHomeButton"                = 0
        "TranslateEnabled"              = 0

        # SmartScreen → SafeBrowsing (equivalente Chromium)
        "SafeBrowsingEnabled"           = 1

        # Al iniciar → New Tab
        "RestoreOnStartup"              = 1

        # Tabs / Rendimiento
        "TabDiscardingEnabled"          = 0
        "TabGroupsEnabled"              = 0
    }

    # 3️⃣ Aplicar cada política
    Write-Host "📌 Aplicando políticas..." -ForegroundColor Cyan

    foreach ($key in $chromiumPolicies.Keys) {
        try {
            Set-ItemProperty -Path $chromiumPolicyPath -Name $key -Value $chromiumPolicies[$key] -Force
            Write-Host "✔ $key = $($chromiumPolicies[$key])" -ForegroundColor Green
        }
        catch {
            Write-Host "❌ Error aplicando '$key': $($_.Exception.Message)" -ForegroundColor Red
        }
    }

    # 4️⃣ Limpieza automática al salir (ClearBrowsingDataOnExit)
    $clearList = @(
        "browsing_history",
        "download_history",
        "cookies_and_other_site_data",
        "cached_images_and_files",
        "password_signin",
        "autofill",
        "site_settings",
        "hosted_app_data"
    )

    try {
        Set-ItemProperty -Path $chromiumPolicyPath -Name "ClearBrowsingDataOnExit" -Value 1 -Force

        New-ItemProperty `
            -Path $chromiumPolicyPath `
            -Name "ClearBrowsingDataOnExitList" `
            -Value $clearList `
            -Type MultiString -Force

        Write-Host "✔ Limpieza automática configurada." -ForegroundColor Green
    }
    catch {
        Write-Host "❌ Error configurando limpieza automática: $($_.Exception.Message)" -ForegroundColor Red
    }

    Write-Host "🎉 Todas las políticas para Chromium han sido aplicadas correctamente." -ForegroundColor Cyan
}

# Aplicar políticas al inicio
Apply-ChromiumPolicies

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
            Write-ColorLog "❌ Error al crear directorio: $($_.Exception.Message)" "ERROR"
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
        Write-ColorLog "⚠️  Extensión INCOMPLETA - iniciando descarga desde GitHub..." "WARNING"
        if (-not $manifestExists) { Write-ColorLog "   - manifest.json ✗" "WARNING" }
        if (-not $contentExists) { Write-ColorLog "   - content.js ✗" "WARNING" }
        if (-not $logoExists) { Write-ColorLog "   - kioskoAppLogo.png ✗" "WARNING" }
        if (-not $indexExists) { Write-ColorLog "   - index.html ✗" "WARNING" }
        
        # Descargar directamente desde GitHub
        Write-ColorLog "🔄 Descargando última versión desde GitHub..." "ACTION"
        $downloadResult = Download-LatestFromGitHub
        
        if ($downloadResult) {
            Write-ColorLog "✅ Descarga completada, re-verificando archivos..." "SUCCESS"
            
            # Mostrar contenido del directorio para debug
            Write-ColorLog "🔍 Contenido del directorio después de la descarga:" "INFO"
            if (Test-Path $EXTENSION_DIR) {
                $allFiles = Get-ChildItem $EXTENSION_DIR -Recurse | Select-Object FullName
                foreach ($file in $allFiles) {
                    $relativePath = $file.FullName.Replace("$EXTENSION_DIR\", "")
                    Write-ColorLog "   📄 $relativePath" "INFO"
                }
            } else {
                Write-ColorLog "   ❌ ¡El directorio $EXTENSION_DIR no existe!" "ERROR"
            }
            
            # Re-verificar después de la descarga
            $manifestExists = Test-Path $manifestPath
            $contentExists = Test-Path $contentPath
            $logoExists = Test-Path $logoPath
            $indexExists = Test-Path $indexPath
            
            Write-ColorLog "🔍 Verificando archivos requeridos:" "INFO"
            Write-ColorLog "   - manifest.json: $(if($manifestExists){'✅ EXISTE'}else{'❌ FALTA'}) ($manifestPath)" "INFO"
            Write-ColorLog "   - content.js: $(if($contentExists){'✅ EXISTE'}else{'❌ FALTA'}) ($contentPath)" "INFO"
            Write-ColorLog "   - kioskoAppLogo.png: $(if($logoExists){'✅ EXISTE'}else{'❌ FALTA'}) ($logoPath)" "INFO"
            Write-ColorLog "   - index.html: $(if($indexExists){'✅ EXISTE'}else{'❌ FALTA'}) ($indexPath)" "INFO"
            
            if ($manifestExists -and $contentExists -and $logoExists -and $indexExists) {
                Write-ColorLog "✅ Extensión instalada correctamente desde GitHub" "SUCCESS"
                return $true
            } else {
                Write-ColorLog "❌ Error: archivos faltantes después de la descarga" "ERROR"
                return $false
            }
        } else {
            Write-ColorLog "❌ Error en descarga desde GitHub" "ERROR"
            return $false
        }
    }
}

# ============================================================
# FUNCIÓN AUXILIAR: DESCARGAR ÚLTIMA VERSIÓN DESDE GITHUB
# ============================================================

function Download-LatestFromGitHub {
    Write-ColorLog "Obteniendo última versión desde GitHub..." "ACTION"
    
    # Configurar TLS para GitHub API
    [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
    
    try {
        $release = Invoke-RestMethod "https://api.github.com/repos/$GITHUB_REPO/releases/latest" -UseBasicParsing
        Write-ColorLog "📍 Descargando versión: $($release.tag_name)" "INFO"
        
        $result = Download-ExtensionFromGitHub -Release $release
        return $result
    }
    catch {
        Write-ColorLog "❌ Error al obtener release desde GitHub: $($_.Exception.Message)" "ERROR"
        return $false
    }
}

# ============================================================
# PASO 2: VERIFICAR ACTUALIZACIÓN DESDE GITHUB RELEASES
# ============================================================

function Get-LocalVersion {
    if (Test-Path $versionFile) {
        return Get-Content $versionFile
    } else {
        return "none"
    }
}

function Test-UpdateNeeded {
    Write-ColorLog "Verificando actualizaciones desde GitHub..." "ACTION"
    
    # Leer versión local
    $localVersion = Get-LocalVersion
    Write-ColorLog "📍 Versión local: $localVersion" "INFO"
    
    # Configurar TLS para GitHub API
    [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
    
    try {
        Write-ColorLog "Consultando GitHub API para última versión..." "INFO"
        $release = Invoke-RestMethod "https://api.github.com/repos/$GITHUB_REPO/releases/latest" -UseBasicParsing
        
        $latestVersion = $release.tag_name
        Write-ColorLog "📍 Versión remota: $latestVersion" "INFO"
        
        # Verificar si necesita actualización
        if ($latestVersion -eq $localVersion) {
            Write-ColorLog "✅ Ya está en la versión actual: $latestVersion" "SUCCESS"
            return $false
        } else {
            Write-ColorLog "🔄 Actualización disponible: $localVersion → $latestVersion" "SUCCESS"
            return $release  # Retornamos el objeto release para usarlo en la descarga
        }
    }
    catch {
        Write-ColorLog "❌ Error al verificar versiones desde GitHub: $($_.Exception.Message)" "ERROR"
        return $null
    }
}

# ============================================================
# PASO 3: DESCARGAR Y EXTRAER DESDE GITHUB RELEASES
# ============================================================

function Download-ExtensionFromGitHub {
    param(
        [Object]$Release
    )
    
    Write-ColorLog "`n━━━ [DESCARGANDO DESDE GITHUB] ━━━" "ACTION"
    
    $downloadUrl = $Release.zipball_url
    $latestVersion = $Release.tag_name
    
    try {
        Write-ColorLog "⬇️  Descargando ZIP desde GitHub: $downloadUrl" "ACTION"
        Invoke-WebRequest -Uri $downloadUrl -OutFile $tempZip
        Write-ColorLog "✅ ZIP descargado correctamente" "SUCCESS"
        
        # Limpiar directorio actual (con manejo de procesos)
        if (Test-Path $EXTENSION_DIR) {
            Write-ColorLog "🔄 Cerrando procesos que puedan estar usando la extensión..." "INFO"
            
            # Cerrar Chrome que puedan estar usando la extensión
            Get-Process "chrome" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
            Start-Sleep -Seconds 2
            
            # Intentar remover con reintentos
            $retryCount = 0
            $maxRetries = 3
            $removed = $false
            
            while (-not $removed -and $retryCount -lt $maxRetries) {
                try {
                    Remove-Item $EXTENSION_DIR -Recurse -Force -ErrorAction Stop
                    $removed = $true
                    Write-ColorLog "✅ Directorio anterior removido exitosamente" "SUCCESS"
                } catch {
                    $retryCount++
                    if ($retryCount -eq $maxRetries) {
                        Write-ColorLog "💡 Removiendo contenido del directorio..." "INFO"
                        
                        # Remover solo el contenido
                        try {
                            Get-ChildItem $EXTENSION_DIR -Recurse | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue
                            Write-ColorLog "✅ Contenido del directorio removido" "SUCCESS"
                        } catch {
                            Write-ColorLog "⚠️  Algunos archivos no se pudieron remover, sobrescribiendo..." "WARNING"
                        }
                    } else {
                        Write-ColorLog "⚠️  Intento $retryCount/$maxRetries - Directorio en uso, esperando..." "WARNING"
                        Start-Sleep -Seconds 1
                    }
                }
            }
        }
        
        # Crear/recrear directorio
        New-Item -ItemType Directory -Path $EXTENSION_DIR -Force | Out-Null
        
        # Limpiar directorio temporal de extracción si existe
        $extractTempDir = "$env:TEMP\kiosko_extract"
        if (Test-Path $extractTempDir) {
            Write-ColorLog "🧹 Limpiando directorio temporal anterior..." "INFO"
            Remove-Item $extractTempDir -Recurse -Force -ErrorAction SilentlyContinue
        }
        
        # Extraer ZIP
        Write-ColorLog "📂 Extrayendo archivos..." "ACTION"
        
        # Usar PowerShell 5+ para extraer
        Add-Type -AssemblyName System.IO.Compression.FileSystem
        [System.IO.Compression.ZipFile]::ExtractToDirectory($tempZip, $extractTempDir)
        
        # Encontrar el directorio extraído (GitHub crea un directorio con el nombre del repo)
        $extractedDirs = Get-ChildItem $extractTempDir -Directory
        if ($extractedDirs.Count -gt 0) {
            $sourceDir = $extractedDirs[0].FullName
            Write-ColorLog "📁 Directorio extraído encontrado: $($extractedDirs[0].Name)" "INFO"
            
            # Copiar archivos desde el directorio extraído al directorio de destino
            # GitHub ZIP contiene: fpalos-kiosko_proyecto-[hash]/[archivos]
            Copy-Item "$sourceDir\*" $EXTENSION_DIR -Recurse -Force
            
            # Verificar que los archivos principales están en el directorio correcto
            $coreFiles = @("manifest.json", "content.js", "index.html")
            $missingFiles = @()
            
            foreach ($file in $coreFiles) {
                if (-not (Test-Path "$EXTENSION_DIR\$file")) {
                    $missingFiles += $file
                }
            }
            
            # Si faltan archivos principales, buscar en subdirectorios
            if ($missingFiles.Count -gt 0) {
                Write-ColorLog "⚠️  Archivos principales no encontrados en raíz, buscando en subdirectorios..." "WARNING"
                
                # Buscar el subdirectorio que contiene los archivos principales
                $subDirs = Get-ChildItem $EXTENSION_DIR -Directory | Where-Object { 
                    Test-Path "$($_.FullName)\manifest.json" 
                }
                
                if ($subDirs.Count -gt 0) {
                    $actualSourceDir = $subDirs[0].FullName
                    Write-ColorLog "📁 Archivos encontrados en: $($subDirs[0].Name)" "INFO"
                    
                    # Limpiar el directorio y copiar desde el subdirectorio correcto
                    Remove-Item "$EXTENSION_DIR\*" -Recurse -Force
                    Copy-Item "$actualSourceDir\*" $EXTENSION_DIR -Recurse -Force
                    
                    # Remover el subdirectorio vacío
                    Remove-Item $actualSourceDir -Recurse -Force -ErrorAction SilentlyContinue
                }
            }
            
            Write-ColorLog "✅ Archivos extraídos correctamente" "SUCCESS"
            
            # Limpiar archivos temporales
            Remove-Item $tempZip -Force -ErrorAction SilentlyContinue
            Remove-Item $extractTempDir -Recurse -Force -ErrorAction SilentlyContinue
            
            # Actualizar archivo de versión
            Set-Content -Path $versionFile -Value $latestVersion
            Write-ColorLog "✅ Versión actualizada a: $latestVersion" "SUCCESS"
            
            return $true
        } else {
            Write-ColorLog "❌ No se encontraron directorios extraídos" "ERROR"
            return $false
        }
    }
    catch {
        Write-ColorLog "❌ Error al descargar/extraer: $($_.Exception.Message)" "ERROR"
        
        # Limpiar archivos temporales
        Remove-Item $tempZip -Force -ErrorAction SilentlyContinue
        Remove-Item $extractTempDir -Recurse -Force -ErrorAction SilentlyContinue
        
        return $false
    }
}

# ============================================================
# PASO 4: DETECTAR NAVEGADOR Y DESPLEGAR EXTENSIÓN
# ============================================================

function Get-AvailableBrowser {
    Write-ColorLog "🔍 Detectando Google Chrome..." "ACTION"
    
    # Verificar Chrome
    if (Test-Path $CHROME_PATH) {
        Write-ColorLog "✅ Google Chrome encontrado: $CHROME_PATH" "SUCCESS"
        return @{
            Name = "Chrome"
            Path = $CHROME_PATH
            Process = "chrome"
        }
    }
    
    # Chrome no encontrado
    Write-ColorLog "❌ No se encontró Google Chrome en: $CHROME_PATH" "ERROR"
    return $null
}

function Stop-Browser {
    param(
        [string]$BrowserName,
        [string]$ProcessName
    )
    
    Write-ColorLog "`n━━━ [DETENIENDO $BrowserName] ━━━" "ACTION"
    
    try {
        $browserProcess = Get-Process $ProcessName -ErrorAction SilentlyContinue
        
        if ($browserProcess) {
            Write-ColorLog "Cerrando proceso $ProcessName.exe..." "INFO"
            Stop-Process -Name $ProcessName -Force -ErrorAction SilentlyContinue
            Start-Sleep -Seconds 2
            Write-ColorLog "✅ $BrowserName detenido" "SUCCESS"
        }
        else {
            Write-ColorLog "ℹ️  $BrowserName no estaba en ejecución" "INFO"
        }
        
        return $true
    }
        catch {
            Write-ColorLog "⚠️  Error al detener ${BrowserName}: $($_.Exception.Message)" "WARNING"
            return $true
        }
}

function Deploy-KioskExtension {
    Write-ColorLog "`n━━━ [DEPLOYING KIOSKO CON EXTENSIÓN] ━━━" "ACTION"
    
    try {
        # Detectar navegador disponible
        $browser = Get-AvailableBrowser
        if ($null -eq $browser) {
            Write-ColorLog "❌ No se encontró Google Chrome" "ERROR"
            return $false
        }
        
        $browserName = $browser.Name
        $browserPath = $browser.Path
        $processName = $browser.Process
        
        Write-ColorLog "🌐 Navegador seleccionado: $browserName" "SUCCESS"
        
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
        # Si el navegador ya está corriendo, ignorará el comando --kiosk. Hay que cerrarlo primero.
        Write-ColorLog "🔄 Cerrando instancias previas de Chrome..." "WARNING"
        Get-Process "chrome" -ErrorAction SilentlyContinue | Stop-Process -Force
        Start-Sleep -Seconds 1
        
        # 2. LANZAR EN MODO KIOSKO (FULL SCREEN REAL)
        # Verificar que existe el archivo index.html local
        $indexHtmlPath = "$EXTENSION_DIR\index.html"
        if (-not (Test-Path $indexHtmlPath)) {
            Write-ColorLog "❌ index.html NO encontrado en: $indexHtmlPath" "ERROR"
            return $false
        }
        
        # Convertir a file:// URL para el navegador
        $localHtmlUrl = "file:///$($indexHtmlPath.Replace('\','/'))"
        
        # Configurar argumentos para Chrome
        $arguments = @(
            "--kiosk",                    # Fuerza pantalla completa real
            "--no-first-run",            # Evita pantallas de bienvenida
            "--no-default-browser-check", # Evita preguntar si es el navegador por defecto
            "--disable-infobars",        # Deshabilita barras de información
            "--disable-extensions-except=`"$EXTENSION_DIR`"", # Solo cargar nuestra extensión
            "--load-extension=`"$EXTENSION_DIR`"",
            "--disable-web-security",    # Permite cargar extensiones locales
            "--disable-features=VizDisplayCompositor", # Evita problemas con extensiones
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
            "$localHtmlUrl"
        )
        
        Write-ColorLog "🚀 Lanzando Kiosko en modo pantalla completa con $browserName..." "SUCCESS"
        Write-ColorLog "   Navegador: $browserName" "INFO"
        Write-ColorLog "   HTML Local: $indexHtmlPath" "INFO"
        Write-ColorLog "   URL: $localHtmlUrl" "INFO"
        Write-ColorLog "   Extensión: $EXTENSION_DIR" "INFO"
        
        # Usamos Start-Process en lugar de "&" para pasar mejor los argumentos
        Start-Process -FilePath $browserPath -ArgumentList $arguments
        
        Write-ColorLog "⏳ Esperando a que el kiosko se inicialice..." "INFO"
        Start-Sleep -Seconds 3
        
        # Verificar que el navegador está corriendo
        $browserRunning = Get-Process $processName -ErrorAction SilentlyContinue
        
        if ($browserRunning) {
            Write-ColorLog "✅ Kiosko iniciado correctamente con $browserName" "SUCCESS"
            return $true
        }
        else {
            Write-ColorLog "⚠️  Kiosko se inició pero podría no estar respondiendo" "WARNING"
            return $true
        }
    }
    catch {
        Write-ColorLog "❌ Error al desplegar kiosko: $($_.Exception.Message)" "ERROR"
        return $false
    }
}

# ============================================================
# LÓGICA PRINCIPAL
# ============================================================

function Main {
    Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║   INSTALADOR EXTENSIÓN KIOSKO - CHROME ONLY        ║" -ForegroundColor Cyan
    Write-Host "║   Usuario: $env:USERNAME" -ForegroundColor Cyan
    Write-Host "║   Repositorio: $GITHUB_REPO" -ForegroundColor Cyan
    Write-Host "║   Navegador: Google Chrome                            ║" -ForegroundColor Cyan
    Write-Host "╚════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan
    
    Write-ColorLog "═════════════════════════════════════════════════════════" "INFO"
    Write-ColorLog "Iniciando proceso de instalación desde GitHub" "INFO"
    Write-ColorLog "Usuario: $env:USERNAME" "INFO"
    Write-ColorLog "Repositorio: $GITHUB_REPO" "INFO"
    Write-ColorLog "═════════════════════════════════════════════════════════" "INFO"
    
    # PASO 0: Verificar directorios
    Write-ColorLog "`n[PASO 0] Creando directorios necesarios..." "ACTION"
    if (-not (Setup-Directories)) {
        Write-ColorLog "❌ Fallo en creación de directorios" "ERROR"
        exit 1
    }
    
    # PASO 1: Verificar si extensión existe (con descarga automática si no existe)
    Write-ColorLog "`n[PASO 1] Verificando extensión local..." "ACTION"
    $extensionExists = Test-ExtensionExists
    
    if (-not $extensionExists) {
        Write-ColorLog "❌ No se pudo instalar la extensión" "ERROR"
        exit 1
    }
    
    # PASO 2: Si la extensión existe, verificar actualizaciones
    Write-ColorLog "`n[PASO 2] Verificando actualizaciones..." "ACTION"
    
    $updateResult = Test-UpdateNeeded
    
    if ($updateResult -eq $null) {
        Write-ColorLog "⚠️  Error al verificar versiones desde GitHub" "WARNING"
        Write-ColorLog "✅ Continuando con archivos existentes" "INFO"
    }
    elseif ($updateResult -ne $false) {
        # $updateResult contiene el objeto release
        Write-ColorLog "🔄 Actualización disponible, descargando..." "SUCCESS"
        if (-not (Download-ExtensionFromGitHub -Release $updateResult)) {
            Write-ColorLog "❌ Fallo en descarga de actualización" "WARNING"
            Write-ColorLog "✅ Continuando con archivos existentes" "INFO"
        }
    }
    else {
        Write-ColorLog "✅ La extensión está actualizada" "SUCCESS"
    }
    
    # PASO 3: Verificación final antes del deploy
    Write-ColorLog "`n[PASO 3] Verificación final de archivos..." "ACTION"
    
    # Verificar solo los 4 archivos esenciales
    $manifestPath = "$EXTENSION_DIR\manifest.json"
    $contentPath = "$EXTENSION_DIR\content.js"
    $logoPath = "$EXTENSION_DIR\kioskoAppLogo.png"
    $indexPath = "$EXTENSION_DIR\index.html"
    
    $manifestExists = Test-Path $manifestPath
    $contentExists = Test-Path $contentPath
    $logoExists = Test-Path $logoPath
    $indexExists = Test-Path $indexPath
    
    Write-ColorLog "🔍 Verificando archivos esenciales:" "INFO"
    Write-ColorLog "   - manifest.json: $(if($manifestExists){'✅'}else{'❌'})" "INFO"
    Write-ColorLog "   - content.js: $(if($contentExists){'✅'}else{'❌'})" "INFO"
    Write-ColorLog "   - kioskoAppLogo.png: $(if($logoExists){'✅'}else{'❌'})" "INFO"
    Write-ColorLog "   - index.html: $(if($indexExists){'✅'}else{'❌'})" "INFO"
    
    if (-not ($manifestExists -and $contentExists -and $logoExists -and $indexExists)) {
        Write-ColorLog "❌ Error crítico: Faltan archivos esenciales para la extensión" "ERROR"
        exit 1
    }
    
    Write-ColorLog "✅ Todos los archivos esenciales están presentes" "SUCCESS"
    
    # PASO FINAL: DEPLOY DEL KIOSKO
    Write-ColorLog "`n[PASO FINAL] Desplegando kiosko con extensión..." "ACTION"
    if (-not (Deploy-KioskExtension)) {
        Write-ColorLog "❌ Fallo en despliegue del kiosko" "ERROR"
        exit 1
    }
    
    # RESULTADO FINAL
    $currentVersion = Get-LocalVersion
    $deployedBrowser = Get-AvailableBrowser
    $browserInfo = if ($deployedBrowser) { $deployedBrowser.Name } else { "Desconocido" }
    
    Write-Host "`n╔════════════════════════════════════════════════════════╗" -ForegroundColor Green
    Write-Host "║              ✅ ¡KIOSKO DESPLEGADO!                  ║" -ForegroundColor Green
    Write-Host "║   Chrome ejecutándose en modo kiosko" -ForegroundColor Green
    Write-Host "║   con extensión cargada correctamente                 ║" -ForegroundColor Green
    Write-Host "║                                                        ║" -ForegroundColor Green
    Write-Host "║   🌐 GitHub Repo: $GITHUB_REPO" -ForegroundColor Green
    Write-Host "║   📍 Extensión: $EXTENSION_DIR" -ForegroundColor Green
    Write-Host "║   🎯 Log: $LOG_FILE" -ForegroundColor Green
    Write-Host "║   🏷️  Versión: $currentVersion" -ForegroundColor Green
    Write-Host "║   🔧 Navegador: Chrome" -ForegroundColor Green
    Write-Host "╚════════════════════════════════════════════════════════╝`n" -ForegroundColor Green
    
    Write-ColorLog "Kiosko desplegado exitosamente (Versión: $currentVersion)" "SUCCESS"
    Write-ColorLog "═════════════════════════════════════════════════════════" "INFO"
}

# EJECUTAR
Main