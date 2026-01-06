/**
 * CONTENT.JS - Orquestador Principal
 * Punto de entrada que inicializa todos los módulos
 * 
 * Este archivo es mucho más limpio que antes.
 * La lógica está distribuida en módulos específicos.
 */

// Esperar a que DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', inicializar);
} else {
  inicializar();
}

/**
 * Función principal de inicialización
 */
function inicializar() {
  Logger.log('Iniciando extension...');

  // ============================================
  // 1. DETECTAR PLATAFORMA
  // ============================================
  
  const platform = platformService.detectPlatform();

  if (!platform) {
    Logger.log('No estamos en una plataforma reconocida. Saliendo...');
    navigationService.checkAndCloseTab();
    return;
  }

  Logger.log(`Plataforma detectada: ${platform.name}`);
  
  // ============================================
  // 2. INICIALIZAR MODULES
  // ============================================
  
  // NavigationService es necesario para otros módulos
  if (typeof navigationService === 'undefined') {
    window.navigationService = new NavigationService(platformService, eventBus);
  }
  
  // TopBar necesita navigationService
  const topBar = new TopBar(platformService, eventBus);
  topBar.navigationService = navigationService;
  
  // ============================================
  // 3. INICIALIZAR SESSION MANAGER
  // ============================================
  sessionManager.init();
  
  // ============================================
  // 4. INICIALIZAR TOP BAR
  // ============================================
  if (AppConfig.FEATURES.TOP_BAR) {
    topBar.init();
  }
  
  // ============================================
  // 5. INICIALIZAR VIRTUAL KEYBOARD
  // ============================================
  if (typeof virtualKeyboard !== 'undefined') {
    virtualKeyboard.init();
    Logger.log('✅ Virtual Keyboard inicializado');
  }
  
  // ============================================
  // 5. MANEJO POST-LOGOUT
  // ============================================
  handleLogoutRedirects();
  
  // ============================================
  // 6. LISTENERS DE EVENTOS GLOBALES
  // ============================================
  setupEventListeners();
  
  Logger.log('✅ Extensión inicializada correctamente');
  
  // Debug
  if (AppConfig.DEBUG.LOGS_ENABLED) {
    Logger.log('Debug: Escribe estos comandos en la consola:');
    Logger.log('  platformService.debugPrint()');
    Logger.log('  sessionManager.debugPrint()');
    Logger.log('  eventBus.debugPrintEvents()');
  }
}

/**
 * Manejo de redirecciones post-logout
 * @private
 */
function handleLogoutRedirects() {
  const currentUrl = window.location.href;
  
  // Detectar si estamos en página de confirmación de logout de HCM
  if (currentUrl.includes('logoutConsent.jsp')) {
    Logger.log('Detectado: página de confirmación de logout HCM');
    sessionStorage.setItem('hcm-en-logout', 'true');
    
    setTimeout(() => {
      const confirmBtn = document.getElementById('Confirm');
      if (confirmBtn) {
        if (currentUrl.includes('logoutId=')) {
          Logger.log('Segundo click en HCM logout...');
          confirmBtn.click();
        } else {
          Logger.log('Primer click en HCM logout...');
          confirmBtn.click();
        }
      }
    }, 1000);
  }
  
  // Detectar si HCM redirijo al login después del logout
  if (currentUrl.includes('egoi.login.us2.oraclecloud.com/oam/server/obrareq.cgi') && 
      sessionStorage.getItem('hcm-en-logout') === 'true') {
    Logger.log('Detectado: HCM login después de logout, redirigiendo...');
    sessionStorage.removeItem('hcm-en-logout');
    setTimeout(() => {
      navigationService.goToHome();
    }, 500);
  }
  
  // Detectar si HCM requiere autenticación después de logout
  if (currentUrl.includes('egoi.fa.us2.oraclecloud.com/fscmUI/adfAuthentication') && 
      sessionStorage.getItem('hcm-en-logout') === 'true') {
    Logger.log('Detectado: HCM authentication después de logout, redirigiendo...');
    sessionStorage.removeItem('hcm-en-logout');
    setTimeout(() => {
      navigationService.goToHome();
    }, 500);
  }
  
  // Detectar si estamos en logout de GCA y redirigir al menú
  if (currentUrl.includes('gca.paquetexpress.com.mx/softexpert/selogout')) {
    Logger.log('Detectado: GCA logout page, redirigiendo...');
    setTimeout(() => {
      navigationService.goToHome();
    }, 1500);
  }
}

/**
 * Setup de event listeners globales
 * @private
 */
function setupEventListeners() {
  // Listener para cuando termina la sesión por inactividad
  eventBus.on(EVENTS.SESSION_INACTIVITY_TIMEOUT, () => {
    Logger.logEvent('Sesión terminada por inactividad');
  });
  
  // Listener para cuando el usuario continúa la sesión
  eventBus.on(EVENTS.SESSION_WARN, (data) => {
    if (data && data.action === 'continue') {
      Logger.logEvent('Usuario continuó sesión activa');
    }
  });
  
  // Listener para detectar cambios de plataforma
  eventBus.on(EVENTS.PLATFORM_DETECTED, (data) => {
    Logger.logEvent('Plataforma detectada:', data);
  });
  
  // Listener para errores
  eventBus.on(EVENTS.ERROR_OCCURRED, (data) => {
    Logger.error('Error en la extensión:', data);
  });
}