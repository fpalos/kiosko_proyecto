/**
 * NavigationService - Manejo de navegación entre plataformas
 * Lógica de rutas, redirecciones y logout
 */

class NavigationService {
  constructor(platformService, eventBus = null) {
    this.platformService = platformService;
    this.eventBus = eventBus || window.eventBus;
    Logger.log('NavigationService inicializado');
  }

  /**
   * Navegar a URL y marcar para cerrar pestaña después
   * @param {string} url - URL destino
   * @param {boolean} closeAfter - Cerrar pestaña después de navegar
   */
  navigateTo(url, closeAfter = true) {
    Logger.log('Navegando a:', url);
    
    if (closeAfter) {
      sessionStorage.setItem('cerrar-pestaña-después', 'true');
    }
    
    this.eventBus.emit(EVENTS.NAVIGATION_START, { url });
    
    setTimeout(() => {
      window.location.href = url;
    }, 100);
  }

  /**
   * Ir a inicio (menú principal)
   */
  goToHome() {
    Logger.log('Ir al inicio');
    const extensionId = chrome.runtime.id;
    const menuUrl = `chrome-extension://${extensionId}/index.html`;
    this.navigateTo(menuUrl);
  }

  /**
   * Cerrar sesión
   */
  logout() {
    Logger.log('Iniciando logout');
    
    const platform = this.platformService.getCurrentPlatform();
    if (!platform) {
      Logger.warn('No hay plataforma actual para logout');
      return;
    }

    const logoutUrl = this.platformService.getLogoutUrl();
    Logger.log('URL de logout:', logoutUrl);
    
    this.eventBus.emit(EVENTS.SESSION_END, {
      timestamp: new Date(),
      platform: platform.name
    });
    
    this.navigateTo(logoutUrl, false);
  }

  /**
   * Navegar a plataforma
   * @param {string} platformKey - Clave de la plataforma ('hcm', 'gca')
   */
  goToPlatform(platformKey) {
    Logger.log('Ir a plataforma:', platformKey);
    
    const platform = this.platformService.getPlatform(platformKey);
    if (!platform) {
      Logger.error('Plataforma no encontrada:', platformKey);
      return;
    }

    const url = platform.urls.home;
    sessionStorage.setItem('cerrar-pestaña-después', 'true');
    
    this.eventBus.emit(EVENTS.NAVIGATION_START, { 
      platform: platformKey,
      url 
    });
    
    this.navigateTo(url);
  }

  /**
   * Manejo de click en tarjeta del menú
   * @param {HTMLElement} cardElement - Elemento tarjeta
   */
  handleCardClick(cardElement) {
    const href = cardElement.getAttribute('href');
    const platform = cardElement.getAttribute('data-platform');
    
    Logger.log('Tarjeta clickeada', { platform, href });
    
    this.eventBus.emit(EVENTS.NAVIGATION_START, {
      from: 'menu',
      platform,
      url: href
    });
    
    this.navigateTo(href);
  }

  /**
   * Manejo de logout
   */
  handleLogout() {
    Logger.log('Manejando logout');
    this.logout();
  }

  /**
   * Manejo de ir a inicio
   */
  handleGoHome() {
    Logger.log('Manejando ir a inicio');
    
    const currentUrl = window.location.href;
    const platform = this.platformService.detectPlatform(currentUrl);

    if (!platform) {
      // Estamos en el menú principal
      Logger.log('Ya estamos en el menú principal');
      return;
    }

    if (currentUrl.includes('login') || currentUrl.includes('logoutConsent')) {
      // Estamos en login, solo redirigir
      this.goToHome();
    } else {
      // Estamos logueado en plataforma, hacer logout primero
      this.logout();
    }
  }

  /**
   * Verificar y manejar redirecciones post-logout
   */
  handlePostLogoutRedirect() {
    const url = window.location.href;
    
    if (sessionStorage.getItem('hcm-en-logout') === 'true') {
      Logger.log('Detectado: redirigiendo después de logout HCM');
      sessionStorage.removeItem('hcm-en-logout');
      
      this.goToHome();
    }

    // Manejar redirección desde SessionManager después de logout
    if (sessionStorage.getItem('redirect-after-logout') === 'true') {
      Logger.log('Detectado: redirigiendo después de logout (SessionManager)');
      sessionStorage.removeItem('redirect-after-logout');
      
      this.goToHome();
    }
  }

  /**
   * Verificar si debemos cerrar pestaña después de navegar
   */
  checkAndCloseTab() {
    if (sessionStorage.getItem('cerrar-pestaña-después') === 'true') {
      sessionStorage.removeItem('cerrar-pestaña-después');
      
      setTimeout(() => {
        try {
          window.close();
        } catch (e) {
          Logger.warn('No se pudo cerrar pestaña automáticamente');
        }
      }, 500);
    }
  }

  /**
   * Debug: Imprimir información de navegación
   */
  debugPrint() {
    Logger.log('=== NavigationService Debug ===');
    const currentPlatform = this.platformService.getCurrentPlatform();
    Logger.log('Current Platform:', currentPlatform ? currentPlatform.name : 'none');
    Logger.log('Current URL:', window.location.href);
  }
}