# ============================================================
#  AUTO-ELEVACIÓN A ADMINISTRADOR
# ============================================================
if (!([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "⏳ Reiniciando como Administrador..." -ForegroundColor Cyan
    Start-Process powershell.exe "-NoProfile -ExecutionPolicy Bypass -File `"$PSCommandPath`"" -Verb RunAs
    Exit
}

# ============================================================
# 1. DEFINICIÓN DE POLÍTICAS PARA EDGE
# ============================================================
$edgePolicyPath = "HKLM:\SOFTWARE\Policies\Microsoft\Edge"

# Diccionario de reglas (1 = Activado, 0 = Desactivado)
$edgePolicies = @{
    # --- PRIVACIDAD Y DATOS ---
    "PasswordManagerEnabled"        = 0  # No guardar contraseñas
    "SavingBrowserHistoryDisabled"  = 1  # No guardar historial
    "AutofillAddressEnabled"        = 0  # No autocompletar direcciones
    "AutofillCreditCardEnabled"     = 0  # No guardar tarjetas
    "BrowserSignin"                 = 0  # Bloquear inicio de sesión (cuenta Microsoft)
    "SearchSuggestEnabled"          = 0  # Sin sugerencias de búsqueda
    "HubsSidebarEnabled"            = 0  # DESACTIVAR BARRA LATERAL (Importante en Kiosko)
    
    # --- LIMPIEZA VISUAL Y BLOATWARE DE EDGE ---
    "ShoppingListEnabled"           = 0  # Desactivar sugerencias de compras
    "CollectionsEnabled"            = 0  # Desactivar 'Colecciones'
    "UserFeedbackAllowed"           = 0  # No pedir feedback
    "DefaultBrowserSettingEnabled"  = 0  # No preguntar si es navegador por defecto
    "ShowHomeButton"                = 0  # Ocultar casa
    "TranslateEnabled"              = 0  # No traducir
    "SmartScreenEnabled"            = 1  # Mantener seguridad (Opcional: poner 0 si da problemas con tu app)
    "RestoreOnStartup"              = 1  # Abrir páginas específicas (1=nueva pestaña, 4=no restaurar)
    
    # --- GESTIÓN DE PESTAÑAS Y RENDIMIENTO ---
    "SleepingTabsEnabled"           = 0  # Desactivar pestañas en suspensión (mejor para kiosko)    "TabServicesEnabled"            = 0  # Desactivar servicios de pestañas (grupos, vistas previas)
    "ShowRecommendationsEnabled"    = 0  # No mostrar sugerencias o consejos de pestañas
}

# Lista de limpieza automática al cerrar Edge
$clearList = @(
    "browsing_history", "download_history", "cookies_and_other_site_data",
    "cached_images_and_files", "password_signin", "autofill", 
    "site_settings", "hosted_app_data"
)

# --- POLÍTICAS DE EXTENSIONES ---
# Lista de extensiones bloqueadas (IDs de extensiones que no se permiten)
$extensionBlocklist = @(
    # Ejemplo: "*"  # Bloquear todas las extensiones
    # "gcbommkclmclpchllfjekcdonpmejbdp"  # HTTPS Everywhere (ejemplo)
)

# Lista de extensiones permitidas (solo estas pueden instalarse)
$extensionAllowlist = @(
    # Ejemplo de IDs de extensiones permitidas:
    # "cjpalhdlnbpafiamejdnhcphjbkeiagm"  # uBlock Origin
    # "lnkibfckepodhkmfpkmefcijeflmnica"  # Tu extensión personalizada
)

# ============================================================
# 2. APLICAR POLÍTICAS
# ============================================================
Write-Host "`n[1] APLICANDO POLÍTICAS A MICROSOFT EDGE..." -ForegroundColor Cyan

# Crear clave si no existe
if (!(Test-Path $edgePolicyPath)) { 
    New-Item -Path $edgePolicyPath -Force | Out-Null 
}

# Aplicar valores DWORD
foreach ($key in $edgePolicies.Keys) {
    Set-ItemProperty -Path $edgePolicyPath -Name $key -Value $edgePolicies[$key] -Type DWord -Force
}

# Aplicar la lista de limpieza
Set-ItemProperty -Path $edgePolicyPath -Name "ClearBrowsingDataOnExitList" -Value $clearList -Type MultiString -Force

# Aplicar políticas de extensiones si están definidas
if ($extensionBlocklist.Count -gt 0) {
    Set-ItemProperty -Path $edgePolicyPath -Name "ExtensionInstallBlocklist" -Value $extensionBlocklist -Type MultiString -Force
    Write-Host "   [✔] Lista de extensiones bloqueadas aplicada" -ForegroundColor Green
}

if ($extensionAllowlist.Count -gt 0) {
    Set-ItemProperty -Path $edgePolicyPath -Name "ExtensionInstallAllowlist" -Value $extensionAllowlist -Type MultiString -Force
    Write-Host "   [✔] Lista de extensiones permitidas aplicada" -ForegroundColor Green
}

# ============================================================
# 3. CONFIGURAR EXTENSIÓN (OPCIONAL)
# ============================================================
# Si tienes el update.xml de tu extensión, descomenta y ajusta esto:
# $ExtensionID = "tuextensionid..."
# $UpdateXML   = "file:///C:/Ruta/update.xml"
# Set-ItemProperty -Path "$edgePolicyPath\ExtensionInstallForcelist" -Name "1" -Value "$ExtensionID;$UpdateXML" -Force

Write-Host "[OK] ✔ Políticas registradas." -ForegroundColor Green

# ============================================================
# 4. AUDITORÍA (CHECK)
# ============================================================
Write-Host "`n[2] VERIFICANDO CONFIGURACIÓN..." -ForegroundColor Cyan

function Check-EdgePolicy ($name, $expected) {
    $currentVal = (Get-ItemProperty -Path $edgePolicyPath -Name $name -ErrorAction SilentlyContinue).$name
    if ($currentVal -eq $expected) {
        Write-Host "   [✔] $name : OK" -ForegroundColor Green
    } else {
        Write-Host "   [❌] $name : FALLÓ ($currentVal)" -ForegroundColor Red
    }
}

foreach ($key in $edgePolicies.Keys) {
    Check-EdgePolicy -name $key -expected $edgePolicies[$key]
}

Write-Host "`n✅ LISTO. Abre 'edge://policy' para confirmar." -ForegroundColor Yellow
Pause