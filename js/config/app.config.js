/**
 * Configuración centralizada de la aplicación
 * Cambiar aquí afecta toda la extension
 */

const AppConfig = {
  // Configuración de sesión
  SESSION: {
    TIMEOUT_MINUTES: 1,           // Tiempo total antes de logout
    WARNING_SECONDS: 30,           // Segundos para mostrar warning
    ACTIVITY_EVENTS: [             // Eventos que resetean el timeout
      'mousedown',
      'keydown',
      'scroll',
      'touchstart',
      'click'
    ]
  },

  // Configuración de UI
  UI: {
    TOP_BAR_HEIGHT: '60px',
    TOP_BAR_Z_INDEX: 10000,
    MODAL_Z_INDEX: 99999,
    OVERLAY_Z_INDEX: 99998,
    
    COLORS: {
      PRIMARY: '#667eea',
      SECONDARY: '#764ba2',
      DANGER: '#ff6b6b',
      SUCCESS: '#51cf66',
      WARNING: '#ffd700',
      TEXT_DARK: '#333',
      TEXT_LIGHT: '#666',
      BACKGROUND: '#f5f5f5'
    },

    GRADIENTS: {
      PURPLE: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      HCM: 'linear-gradient(135deg, #002DC7 0%, #1a47e8 100%)',
      GCA: 'linear-gradient(135deg, #DBDBDB 0%, #e8e8e8 100%)'
    },

    FONTS: {
      FAMILY: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif',
      SIZE_SMALL: '13px',
      SIZE_BASE: '14px',
      SIZE_LARGE: '16px',
      SIZE_XLARGE: '20px'
    }
  },

  // Configuración de plataformas (se expande en PlatformService)
  PLATFORMS: {
    HCM: 'hcm',
    GCA: 'gca'
  },

  // Features habilitadas/deshabilitadas
  FEATURES: {
    SESSION_TIMEOUT: true,
    TOP_BAR: true,
    FAQ: true,
    ACTIVITY_TRACKING: true,
    EVENT_BUS: true
  },

  // Debug
  DEBUG: {
    LOGS_ENABLED: true,
    LOG_EVENTS: true,
    LOG_SESSION: true,
    LOG_UI: false
  },

  // Mensajes
  MESSAGES: {
    SESSION_INACTIVE: '⏱️ Sesión Inactiva',
    SESSION_EXPIRE_SOON: 'Tu sesión se cerrará por inactividad en:',
    CONTINUE_ACTIVE: '¿Deseas continuar activo?',
    SESSION_EXPIRED: 'Sesión Expirada',
    SESSION_CLOSED_INACTIVITY: 'Tu sesión fue cerrada por inactividad. Serás redirigido al menú principal...',
    CLOSE_SESSION_WARNING: '⚠️ Recuerda cerrar tu sesión después de tus consultas. Tu información es importante y confidencial.',
    NAV_HOME: '🏠 Inicio',
    NAV_LOGOUT: '🔒 Cerrar Sesión',
    NAV_FAQ: '❓ FAQ',
    CONTINUE: 'Continuar',
    LOGOUT: 'Cerrar Sesión'
  },

  // URLs base
  URLS: {
    // Se configuran por plataforma en PlatformService
  }
};

// Validación básica
if (AppConfig.SESSION.TIMEOUT_MINUTES <= 0) {
  console.error('SESSION.TIMEOUT_MINUTES debe ser mayor a 0');
}

if (AppConfig.SESSION.WARNING_SECONDS >= AppConfig.SESSION.TIMEOUT_MINUTES * 60) {
  console.error('WARNING_SECONDS no puede ser mayor o igual a TIMEOUT_MINUTES');
}