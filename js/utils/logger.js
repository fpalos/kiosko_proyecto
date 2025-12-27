/**
 * Logger - Logging centralizado
 * Respeta la configuración de DEBUG en app.config.js
 */

class Logger {
  static LOG_LEVELS = {
    DEBUG: 'DEBUG',
    INFO: 'INFO',
    WARN: 'WARN',
    ERROR: 'ERROR'
  };

  /**
   * Log de nivel info
   * @param {string} message - Mensaje
   * @param {*} data - Datos adicionales (opcional)
   */
  static log(message, data = null) {
    // Verificar si AppConfig está disponible
    if (typeof AppConfig === 'undefined') {
      console.log(`[Kiosco] ${message}`, data || '');
      return;
    }

    if (!AppConfig.DEBUG.LOGS_ENABLED) return;

    const timestamp = new Date().toLocaleTimeString();
    const prefix = `[${timestamp}] [Kiosco]`;

    if (data) {
      console.log(`${prefix} ${message}`, data);
    } else {
      console.log(`${prefix} ${message}`);
    }
  }

  /**
   * Log de sesión
   * @param {string} message - Mensaje
   * @param {*} data - Datos adicionales (opcional)
   */
  static logSession(message, data = null) {
    if (typeof AppConfig === 'undefined') return;
    if (!AppConfig.DEBUG.LOG_SESSION) return;

    const prefix = '[🔐 SESSION]';
    if (data) {
      console.log(`${prefix} ${message}`, data);
    } else {
      console.log(`${prefix} ${message}`);
    }
  }

  /**
   * Log de eventos
   * @param {string} eventName - Nombre del evento
   * @param {*} data - Datos del evento
   */
  static logEvent(eventName, data = null) {
    if (typeof AppConfig === 'undefined') return;
    if (!AppConfig.DEBUG.LOG_EVENTS) return;

    const prefix = '[📡 EVENT]';
    if (data) {
      console.log(`${prefix} ${eventName}`, data);
    } else {
      console.log(`${prefix} ${eventName}`);
    }
  }

  /**
   * Log de UI
   * @param {string} message - Mensaje
   * @param {*} data - Datos adicionales (opcional)
   */
  static logUI(message, data = null) {
    if (typeof AppConfig === 'undefined') return;
    if (!AppConfig.DEBUG.LOG_UI) return;

    const prefix = '[🎨 UI]';
    if (data) {
      console.log(`${prefix} ${message}`, data);
    } else {
      console.log(`${prefix} ${message}`);
    }
  }

  /**
   * Log de warning
   * @param {string} message - Mensaje
   * @param {*} data - Datos adicionales (opcional)
   */
  static warn(message, data = null) {
    if (typeof AppConfig === 'undefined') {
      console.warn(`[⚠️ Kiosco WARN] ${message}`, data || '');
      return;
    }

    if (!AppConfig.DEBUG.LOGS_ENABLED) return;

    const timestamp = new Date().toLocaleTimeString();
    const prefix = `[${timestamp}] [⚠️ Kiosco WARN]`;

    if (data) {
      console.warn(`${prefix} ${message}`, data);
    } else {
      console.warn(`${prefix} ${message}`);
    }
  }

  /**
   * Log de error
   * @param {string} message - Mensaje
   * @param {Error} error - Objeto error
   */
  static error(message, error = null) {
    const timestamp = new Date().toLocaleTimeString();
    const prefix = `[${timestamp}] [❌ Kiosco ERROR]`;

    if (error instanceof Error) {
      console.error(`${prefix} ${message}`, error.message);
      console.error('Stack:', error.stack);
    } else {
      console.error(`${prefix} ${message}`, error);
    }
  }

  /**
   * Log de debug (solo si DEBUG.LOGS_ENABLED es true)
   * @param {string} message - Mensaje
   * @param {*} data - Datos adicionales
   */
  static debug(message, data = null) {
    if (typeof AppConfig === 'undefined') return;
    if (!AppConfig.DEBUG.LOGS_ENABLED) return;

    const prefix = '[🔍 DEBUG]';
    if (data) {
      console.log(`${prefix} ${message}`, data);
    } else {
      console.log(`${prefix} ${message}`);
    }
  }

  /**
   * Log de tabla (para visualizar datos estructurados)
   * @param {array} data - Datos a mostrar en tabla
   * @param {string} label - Etiqueta de la tabla
   */
  static table(data, label = 'Data') {
    if (typeof AppConfig === 'undefined') return;
    if (!AppConfig.DEBUG.LOGS_ENABLED) return;

    console.log(`%c${label}`, 'font-weight: bold; color: #667eea');
    console.table(data);
  }

  /**
   * Log de grupo (para agrupar logs relacionados)
   * @param {string} groupName - Nombre del grupo
   * @param {function} callback - Función que contiene los logs
   */
  static group(groupName, callback) {
    if (typeof AppConfig === 'undefined') return;
    if (!AppConfig.DEBUG.LOGS_ENABLED) return;

    console.group(`%c${groupName}`, 'font-weight: bold; color: #667eea');
    callback();
    console.groupEnd();
  }

  /**
   * Habilitar/deshabilitar logs globalmente
   * @param {boolean} enabled - True para habilitar
   */
  static setEnabled(enabled) {
    if (typeof AppConfig === 'undefined') return;
    AppConfig.DEBUG.LOGS_ENABLED = enabled;
    this.log(`Logging ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Crear un log estilizado
   * @param {string} message - Mensaje
   * @param {string} style - Estilos CSS
   */
  static styled(message, style = 'color: #667eea; font-weight: bold;') {
    if (typeof AppConfig === 'undefined') return;
    if (!AppConfig.DEBUG.LOGS_ENABLED) return;
    console.log(`%c${message}`, style);
  }

  /**
   * Timer para medir performance
   * @param {string} label - Etiqueta del timer
   */
  static time(label) {
    if (typeof AppConfig === 'undefined') return;
    if (!AppConfig.DEBUG.LOGS_ENABLED) return;
    console.time(label);
  }

  /**
   * End timer
   * @param {string} label - Etiqueta del timer
   */
  static timeEnd(label) {
    if (typeof AppConfig === 'undefined') return;
    if (!AppConfig.DEBUG.LOGS_ENABLED) return;
    console.timeEnd(label);
  }
}