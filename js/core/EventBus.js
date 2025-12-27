/**
 * EventBus - Sistema de eventos Pub/Sub global
 * Permite comunicación desacoplada entre módulos
 */

class EventBus {
  constructor() {
    this.events = {};
    this.eventHistory = [];
    this.maxHistorySize = 100;
  }

  /**
   * Suscribirse a un evento
   * @param {string} eventName - Nombre del evento
   * @param {function} callback - Función a ejecutar
   * @returns {function} Función para desuscribirse
   */
  on(eventName, callback) {
    if (typeof eventName !== 'string') {
      throw new Error('Event name must be a string');
    }
    if (typeof callback !== 'function') {
      throw new Error('Callback must be a function');
    }

    if (!this.events[eventName]) {
      this.events[eventName] = [];
    }

    this.events[eventName].push(callback);

    // Retornar función para desuscribirse fácilmente
    return () => this.off(eventName, callback);
  }

  /**
   * Desuscribirse de un evento
   * @param {string} eventName - Nombre del evento
   * @param {function} callback - Función a remover
   */
  off(eventName, callback) {
    if (!this.events[eventName]) return;

    this.events[eventName] = this.events[eventName].filter(
      cb => cb !== callback
    );

    if (this.events[eventName].length === 0) {
      delete this.events[eventName];
    }
  }

  /**
   * Emitir un evento
   * @param {string} eventName - Nombre del evento
   * @param {*} data - Datos a pasar a los listeners
   */
  emit(eventName, data = null) {
    // Registrar en historial
    this._addToHistory(eventName, data);

    if (!this.events[eventName]) {
      return;
    }

    this.events[eventName].forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in event listener for ${eventName}:`, error);
      }
    });
  }

  /**
   * Escuchar un evento solo una vez
   * @param {string} eventName - Nombre del evento
   * @param {function} callback - Función a ejecutar
   */
  once(eventName, callback) {
    const unsubscribe = this.on(eventName, (data) => {
      callback(data);
      unsubscribe();
    });

    return unsubscribe;
  }

  /**
   * Obtener listeners de un evento
   * @param {string} eventName - Nombre del evento
   * @returns {array} Array de listeners
   */
  listeners(eventName) {
    return this.events[eventName] || [];
  }

  /**
   * Obtener número de listeners
   * @param {string} eventName - Nombre del evento
   * @returns {number} Cantidad de listeners
   */
  listenerCount(eventName) {
    return this.listeners(eventName).length;
  }

  /**
   * Remover todos los listeners
   * @param {string} eventName - Nombre del evento (opcional)
   */
  removeAllListeners(eventName = null) {
    if (eventName) {
      delete this.events[eventName];
    } else {
      this.events = {};
    }
  }

  /**
   * Obtener historial de eventos
   * @returns {array} Historial de eventos emitidos
   */
  getHistory() {
    return [...this.eventHistory];
  }

  /**
   * Limpiar historial
   */
  clearHistory() {
    this.eventHistory = [];
  }

  /**
   * Agregar evento al historial
   * @private
   */
  _addToHistory(eventName, data) {
    if (typeof AppConfig === 'undefined') return;
    if (!AppConfig.DEBUG.LOG_EVENTS) return;

    this.eventHistory.push({
      name: eventName,
      data: data,
      timestamp: new Date().toISOString()
    });

    // Limitar tamaño del historial
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }
  }

  /**
   * Debug: Imprimir todos los eventos registrados
   */
  debugPrintEvents() {
    console.log('=== EventBus Events ===');
    Object.keys(this.events).forEach(eventName => {
      console.log(`${eventName}: ${this.listenerCount(eventName)} listeners`);
    });
  }

  /**
   * Debug: Imprimir historial de eventos
   */
  debugPrintHistory() {
    console.log('=== EventBus History ===');
    this.eventHistory.forEach(event => {
      console.log(`[${event.timestamp}] ${event.name}`, event.data);
    });
  }
}

// Crear instancia global
const eventBus = new EventBus();
window.eventBus = eventBus; // Exportar a window para acceso global

// Definir eventos estándar como constantes
const EVENTS = {
  SESSION_START: 'SESSION_START',
  SESSION_RESUME: 'SESSION_RESUME',
  SESSION_WARN: 'SESSION_WARN',
  SESSION_END: 'SESSION_END',
  SESSION_INACTIVITY_TIMEOUT: 'SESSION_INACTIVITY_TIMEOUT',
  
  ACTIVITY_DETECTED: 'ACTIVITY_DETECTED',
  
  TOPBAR_SHOW: 'TOPBAR_SHOW',
  TOPBAR_HIDE: 'TOPBAR_HIDE',
  
  MODAL_OPEN: 'MODAL_OPEN',
  MODAL_CLOSE: 'MODAL_CLOSE',
  
  PLATFORM_DETECTED: 'PLATFORM_DETECTED',
  PLATFORM_CHANGED: 'PLATFORM_CHANGED',
  
  NAVIGATION_START: 'NAVIGATION_START',
  NAVIGATION_COMPLETE: 'NAVIGATION_COMPLETE',
  
  ERROR_OCCURRED: 'ERROR_OCCURRED',
  DEBUG_MESSAGE: 'DEBUG_MESSAGE'
};