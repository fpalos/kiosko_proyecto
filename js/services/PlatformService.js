/**
 * PlatformService - Gestión centralizada de plataformas
 * Maneja toda la lógica relacionada con HCM, GCA, y futuras plataformas
 */

class PlatformService {
  constructor() {
    this.platforms = {
      hcm: {
        key: 'hcm',
        name: 'HCM',
        displayName: 'Sistema HCM',
        domains: [
          'egoi.fa.us2.oraclecloud.com',
          'egoi.login.us2.oraclecloud.com'
        ],
        urls: {
          home: 'https://egoi.fa.us2.oraclecloud.com/fscmUI/faces/FuseWelcome',
          login: 'https://egoi.fa.us2.oraclecloud.com/fscmUI/faces/FuseWelcome',
          logout: 'https://egoi.login.us2.oraclecloud.com/fusion_apps/pages/logoutConsent.jsp?logout_done_url=https%3A%2F%2Fegoi.fa.us2.oraclecloud.com%3A443%2FfscmUI%2FadfAuthentication%3F_adf.authenticate%3Dtrue',
          logoutConsent: 'logoutConsent.jsp',
          authentication: 'adfAuthentication'
        },
        features: ['bonos', 'nomina', 'permisos', 'vacaciones'],
        color: '#002DC7',
        icon: './assets/hcm_logo_blanco.png'
      },

      gca: {
        key: 'gca',
        name: 'GCA',
        displayName: 'Sistema GCA',
        domains: ['gca.paquetexpress.com.mx'],
        urls: {
          home: 'https://gca.paquetexpress.com.mx/softexpert/login',
          login: 'https://gca.paquetexpress.com.mx/softexpert/login',
          logout: 'https://gca.paquetexpress.com.mx/softexpert/selogout',
          path: '/softexpert/selogout'
        },
        features: ['procedimientos', 'formatos'],
        color: '#DBDBDB',
        icon: './assets/GCA-Icono SVG.svg'
      }
    };

    this.currentPlatform = null;
  }

  /**
   * Detectar plataforma actual por URL
   * @param {string} url - URL a analizar (usa location.href si no se proporciona)
   * @returns {Object} Objeto plataforma o null
   */
  detectPlatform(url = window.location.href) {
    Logger.log('Detectando plataforma...', url);

    for (const [key, platform] of Object.entries(this.platforms)) {
      for (const domain of platform.domains) {
        if (url.includes(domain)) {
          Logger.log(`✓ Plataforma detectada: ${platform.name}`);
          this.currentPlatform = platform;
          return platform;
        }
      }
    }

    Logger.warn('No se pudo detectar plataforma');
    return null;
  }

  /**
   * Obtener plataforma por clave
   * @param {string} key - Clave de la plataforma ('hcm', 'gca', etc)
   * @returns {Object} Objeto plataforma
   */
  getPlatform(key) {
    return this.platforms[key] || null;
  }

  /**
   * Obtener todas las plataformas
   * @returns {Object} Todas las plataformas
   */
  getAllPlatforms() {
    return this.platforms;
  }

  /**
   * Obtener plataforma actual
   * @returns {Object} Plataforma actual o null
   */
  getCurrentPlatform() {
    return this.currentPlatform;
  }

  /**
   * Verificar si estamos en una plataforma específica
   * @param {string} platformKey - Clave de la plataforma
   * @returns {boolean}
   */
  isCurrentPlatform(platformKey) {
    return this.currentPlatform && this.currentPlatform.key === platformKey;
  }

  /**
   * Obtener features de una plataforma
   * @param {string} platformKey - Clave de la plataforma
   * @returns {Array} Features disponibles
   */
  getFeatures(platformKey) {
    const platform = this.getPlatform(platformKey);
    return platform ? platform.features : [];
  }

  /**
   * Obtener URL de logout para la plataforma actual
   * @returns {string} URL de logout
   */
  getLogoutUrl() {
    if (!this.currentPlatform) {
      Logger.error('No hay plataforma actual para obtener logout URL');
      return null;
    }

    return this.currentPlatform.urls.logout;
  }

  /**
   * Obtener URL de inicio/home para la plataforma actual
   * @returns {string} URL de home
   */
  getHomeUrl() {
    if (!this.currentPlatform) {
      Logger.error('No hay plataforma actual para obtener home URL');
      return null;
    }

    return this.currentPlatform.urls.home;
  }

  /**
   * Verificar si URL es de logout
   * @param {string} url - URL a verificar
   * @returns {boolean}
   */
  isLogoutUrl(url) {
    if (url.includes('logoutConsent.jsp')) return true;
    if (url.includes('selogout')) return true;
    return false;
  }

  /**
   * Verificar si URL es de login
   * @param {string} url - URL a verificar
   * @returns {boolean}
   */
  isLoginUrl(url) {
    if (url.includes('adfAuthentication')) return true;
    if (url.includes('/login')) return true;
    return false;
  }

  /**
   * Obtener color de la plataforma
   * @param {string} platformKey - Clave de la plataforma
   * @returns {string} Color hex
   */
  getColor(platformKey) {
    const platform = this.getPlatform(platformKey);
    return platform ? platform.color : '#667eea';
  }

  /**
   * Obtener nombre display de la plataforma
   * @param {string} platformKey - Clave de la plataforma
   * @returns {string} Nombre display
   */
  getDisplayName(platformKey) {
    const platform = this.getPlatform(platformKey);
    return platform ? platform.displayName : 'Plataforma desconocida';
  }

  /**
   * Agregar nueva plataforma (para futuras expansiones)
   * @param {string} key - Clave única
   * @param {Object} config - Configuración de la plataforma
   */
  addPlatform(key, config) {
    if (this.platforms[key]) {
      Logger.warn(`Plataforma ${key} ya existe`);
      return false;
    }

    this.platforms[key] = {
      key,
      ...config
    };

    Logger.log(`Nueva plataforma agregada: ${key}`, config);
    return true;
  }

  /**
   * Obtener información de todas las plataformas (para debugging)
   * @returns {Array} Array con info de todas las plataformas
   */
  getInfo() {
    return Object.values(this.platforms).map(p => ({
      key: p.key,
      name: p.name,
      domains: p.domains,
      features: p.features
    }));
  }

  /**
   * Debug: Imprimir información de plataformas
   */
  debugPrint() {
    Logger.log('=== Plataformas disponibles ===');
    Logger.table(this.getInfo(), 'Plataformas');
    if (this.currentPlatform) {
      Logger.log('Plataforma actual:', this.currentPlatform.name);
    }
  }
}

// Crear instancia global
const platformService = new PlatformService();