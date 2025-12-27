/**
 * Helpers - Funciones auxiliares y utilidades
 * Funciones reutilizables para toda la extensión
 */

class Helpers {
  /**
   * Verificar si estamos en una plataforma específica
   * @param {string} platformKey - Clave de la plataforma
   * @returns {boolean}
   */
  static isOnPlatform(platformKey) {
    const platform = platformService.detectPlatform();
    return platform && platform.key === platformKey;
  }

  /**
   * Verificar si URL contiene cadena
   * @param {string} url - URL a verificar
   * @param {string} substring - Subcadena a buscar
   * @returns {boolean}
   */
  static urlContains(url = null, substring) {
    const checkUrl = url || window.location.href;
    return checkUrl.includes(substring);
  }

  /**
   * Esperar X milisegundos
   * @param {number} ms - Milisegundos
   * @returns {Promise}
   */
  static delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Ejecutar función después de X milisegundos
   * @param {function} callback - Función a ejecutar
   * @param {number} ms - Milisegundos
   * @returns {number} ID del timeout
   */
  static after(callback, ms) {
    return setTimeout(callback, ms);
  }

  /**
   * Debounce - ejecutar función solo después de que dejan de llamarla
   * @param {function} func - Función a debounce
   * @param {number} delay - Retraso en ms
   * @returns {function} Función debounced
   */
  static debounce(func, delay) {
    let timeoutId;
    return function(...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  }

  /**
   * Throttle - ejecutar función solo una vez por periodo
   * @param {function} func - Función a throttle
   * @param {number} limit - Límite en ms
   * @returns {function} Función throttled
   */
  static throttle(func, limit) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  /**
   * Obtener parámetro de URL
   * @param {string} param - Nombre del parámetro
   * @param {string} url - URL (opcional, usa location.href si no se proporciona)
   * @returns {string|null} Valor del parámetro o null
   */
  static getURLParam(param, url = null) {
    const checkUrl = url || window.location.href;
    const urlParams = new URLSearchParams(new URL(checkUrl).search);
    return urlParams.get(param);
  }

  /**
   * Obtener todos los parámetros de URL como objeto
   * @param {string} url - URL (opcional)
   * @returns {Object} Objeto con parámetros
   */
  static getAllURLParams(url = null) {
    const checkUrl = url || window.location.href;
    const urlParams = new URLSearchParams(new URL(checkUrl).search);
    const params = {};
    
    urlParams.forEach((value, key) => {
      params[key] = value;
    });
    
    return params;
  }

  /**
   * Formatear tiempo en HH:MM:SS
   * @param {number} seconds - Segundos
   * @returns {string} Tiempo formateado
   */
  static formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  /**
   * Formatear tiempo en MM:SS
   * @param {number} seconds - Segundos
   * @returns {string} Tiempo formateado
   */
  static formatTimeShort(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  /**
   * Obtener fecha actual formateada
   * @returns {string} Fecha en formato DD/MM/YYYY HH:MM:SS
   */
  static getCurrentDateTime() {
    const now = new Date();
    const date = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    return `${date}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  }

  /**
   * Verificar si es un email válido
   * @param {string} email - Email a verificar
   * @returns {boolean}
   */
  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Escapar caracteres especiales HTML
   * @param {string} text - Texto a escapar
   * @returns {string} Texto escapado
   */
  static escapeHTML(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  }

  /**
   * Copiar texto al portapapeles
   * @param {string} text - Texto a copiar
   * @returns {Promise<boolean>} True si se copió exitosamente
   */
  static async copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      Logger.log('Texto copiado al portapapeles');
      return true;
    } catch (err) {
      Logger.error('Error al copiar al portapapeles:', err);
      return false;
    }
  }

  /**
   * Descargar archivo
   * @param {string} data - Contenido del archivo
   * @param {string} filename - Nombre del archivo
   * @param {string} type - Tipo MIME
   */
  static downloadFile(data, filename, type = 'text/plain') {
    const element = document.createElement('a');
    element.setAttribute('href', `data:${type};charset=utf-8,${encodeURIComponent(data)}`);
    element.setAttribute('download', filename);
    element.style.display = 'none';

    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    Logger.log('Archivo descargado:', filename);
  }

  /**
   * Generar ID único
   * @returns {string} ID único
   */
  static generateId() {
    return 'id-' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }

  /**
   * Obtener cookie por nombre
   * @param {string} name - Nombre de la cookie
   * @returns {string|null} Valor de la cookie
   */
  static getCookie(name) {
    const nameEQ = name + '=';
    const cookies = document.cookie.split(';');

    for (let cookie of cookies) {
      cookie = cookie.trim();
      if (cookie.indexOf(nameEQ) === 0) {
        return cookie.substring(nameEQ.length);
      }
    }

    return null;
  }

  /**
   * Establecer cookie
   * @param {string} name - Nombre de la cookie
   * @param {string} value - Valor
   * @param {number} days - Días de expiración
   */
  static setCookie(name, value, days = 7) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    const expires = 'expires=' + date.toUTCString();

    document.cookie = name + '=' + value + ';' + expires + ';path=/';
    Logger.log('Cookie establecida:', name);
  }

  /**
   * Verificar si elemento existe
   * @param {string} selector - Selector CSS
   * @returns {boolean}
   */
  static elementExists(selector) {
    return document.querySelector(selector) !== null;
  }

  /**
   * Esperar a que elemento exista
   * @param {string} selector - Selector CSS
   * @param {number} timeout - Timeout en ms
   * @returns {Promise<Element|null>}
   */
  static waitForElement(selector, timeout = 10000) {
    return new Promise((resolve) => {
      const element = document.querySelector(selector);
      
      if (element) {
        resolve(element);
        return;
      }

      const observer = new MutationObserver(() => {
        const element = document.querySelector(selector);
        if (element) {
          observer.disconnect();
          resolve(element);
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      setTimeout(() => {
        observer.disconnect();
        resolve(null);
      }, timeout);
    });
  }

  /**
   * Hacer request (fetch wrapper)
   * @param {string} url - URL
   * @param {Object} options - Opciones de fetch
   * @returns {Promise<Response>}
   */
  static async request(url, options = {}) {
    try {
      const response = await fetch(url, options);
      return response;
    } catch (error) {
      Logger.error('Error en request:', error);
      throw error;
    }
  }

  /**
   * Debug: Imprimir información útil
   */
  static debugInfo() {
    if (typeof Logger === 'undefined' || typeof platformService === 'undefined') {
      console.log('Debug Info: Módulos no cargados aún');
      return;
    }

    Logger.group('Debug Info', () => {
      Logger.log('URL actual:', window.location.href);
      Logger.log('Plataforma:', platformService.getCurrentPlatform()?.name || 'ninguna');
      if (typeof sessionManager !== 'undefined') {
        Logger.log('Sesión activa:', sessionManager.isActive());
        Logger.log('Tiempo de sesión:', sessionManager.getSessionTime() + 's');
      }
      Logger.log('Fecha/Hora:', this.getCurrentDateTime());
    });
  }
}