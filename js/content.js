/**
 * CONTENT.JS - Orquestador Principal
 * Punto de entrada que inicializa todos los módulos
 * 
 * Este archivo es mucho más limpio que antes.
 * La lógica está distribuida en módulos específicos.
 */

// ============================================
// 1. DETECTAR PLATAFORMA
// ============================================
Logger.log('Iniciando extension...');

const platform = platformService.detectPlatform();

if (!platform) {
  Logger.log('No estamos en una plataforma reconocida. Saliendo...');
  // En páginas que no sean HCM o GCA, no hacemos nada
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      navigationService.checkAndCloseTab();
    });
  } else {
    navigationService.checkAndCloseTab();
  }
} else {
  // ============================================
  // 2. INICIALIZAR MÓDULOS PRINCIPALES
  // ============================================
  
  Logger.log(`Plataforma detectada: ${platform.name}`);
  
  // Crear instancia de NavigationService
  const navigationService = new NavigationService(platformService, eventBus);
  
  // Asignar navigationService al TopBar (dependency injection)
  const topBar = new TopBar(platformService, eventBus);
  topBar.navigationService = navigationService;
  
  // ============================================
  // 3. ESPERAR A QUE DOM ESTÉ LISTO
  // ============================================
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializar);
  } else {
    inicializar();
  }
  
  /**
   * Función principal de inicialización
   */
  function inicializar() {
    Logger.log('DOM listo, inicializando módulos...');
    
    // ========================================
    // 4. INICIALIZAR SESSION MANAGER
    // ========================================
    sessionManager.init();
    
    // ========================================
    // 5. INICIALIZAR TOP BAR
    // ========================================
    if (AppConfig.FEATURES.TOP_BAR) {
      topBar.init();
    }
    
    // ========================================
    // 6. MANEJO POST-LOGOUT
    // ========================================
    handleLogoutRedirects();
    
    // ========================================
    // 7. LISTENERS DE EVENTOS GLOBALES
    // ========================================
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
      Logger.log('Evento: Sesión terminada por inactividad');
    });
    
    // Listener para cuando el usuario continúa la sesión
    eventBus.on(EVENTS.SESSION_WARN, (data) => {
      if (data.action === 'continue') {
        Logger.log('Evento: Usuario continuó sesión activa');
      }
    });
    
    // Listener para detectar cambios de plataforma
    eventBus.on(EVENTS.PLATFORM_DETECTED, (data) => {
      Logger.log('Evento: Plataforma detectada:', data);
    });
  }
}