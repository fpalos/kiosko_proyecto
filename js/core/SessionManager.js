/**
 * SessionManager - Gestión de sesiones con timeout de inactividad
 * Refactorizado para usar EventBus y Logger
 */

class SessionManager {
  constructor(config = null, eventBus = null) {
    this.config = config || (typeof AppConfig !== 'undefined' ? AppConfig.SESSION : {
      TIMEOUT_SECONDS: 40,
      WARNING_SECONDS: 10,
      ACTIVITY_EVENTS: ['mousedown', 'keydown', 'scroll', 'touchstart', 'click']
    });
    
    this.eventBus = eventBus || (typeof window.eventBus !== 'undefined' ? window.eventBus : null);
    this.navigationService = null; // Se establece después desde content.js
    
    this.inactivityTime = this.config.TIMEOUT_SECONDS * 1000;
    this.warningTime = this.config.WARNING_SECONDS * 1000;
    
    this.inactivityTimer = null;
    this.warningTimer = null;
    this.sessionActive = false;
    this.warningShown = false;
    
    Logger.logSession('SessionManager inicializado', {
      timeout: this.config.TIMEOUT_SECONDS + ' seg',
      warning: this.config.WARNING_SECONDS + ' seg'
    });
  }

  /**
   * Inicializar SessionManager
   */
  init() {
    try {
      const platform = platformService.detectPlatform();
      
      if (!platform) {
        Logger.logSession('No se detectó plataforma, SessionManager no iniciará');
        return;
      }

      if (!sessionStorage.getItem('session-started')) {
        this.startSession();
      } else {
        this.resumeSession();
      }
    } catch (error) {
      Logger.error('Error inicializando SessionManager:', error);
    }
  }

  /**
   * Iniciar nueva sesión
   */
  startSession() {
    Logger.logSession('🔐 Sesión iniciada');
    
    sessionStorage.setItem('session-started', 'true');
    sessionStorage.setItem('session-start-time', Date.now().toString());
    
    this.sessionActive = true;
    this.attachActivityListeners();
    this.resetInactivityTimer();
    
    if (this.eventBus) {
      this.eventBus.emit(EVENTS.SESSION_START, {
        timestamp: new Date(),
        timeout: this.config.TIMEOUT_SECONDS
      });
    }
  }

  /**
   * Reanudar sesión existente
   */
  resumeSession() {
    Logger.logSession('🔄 Sesión reanudada');
    
    this.sessionActive = true;
    this.attachActivityListeners();
    this.resetInactivityTimer();
    
    if (this.eventBus) {
      this.eventBus.emit(EVENTS.SESSION_RESUME, {
        timestamp: new Date()
      });
    }
  }

  /**
   * Adjuntar listeners de actividad del usuario
   * @private
   */
  attachActivityListeners() {
    this.config.ACTIVITY_EVENTS.forEach(event => {
      document.addEventListener(event, () => this.onUserActivity(), true);
    });
    
    Logger.logSession('Activity listeners adjuntados', this.config.ACTIVITY_EVENTS);
  }

  /**
   * Handler de actividad del usuario
   * @private
   */
  onUserActivity() {
    if (!this.sessionActive) return;
    
    Logger.logSession('Actividad detectada');
    this.resetInactivityTimer();
    
    if (this.warningShown) {
      this.hideInactivityWarning();
    }
    
    if (this.eventBus) {
      this.eventBus.emit(EVENTS.ACTIVITY_DETECTED, {
        timestamp: new Date()
      });
    }
  }

  /**
   * Resetear timer de inactividad
   */
  resetInactivityTimer() {
    if (this.inactivityTimer) clearTimeout(this.inactivityTimer);
    if (this.warningTimer) clearTimeout(this.warningTimer);
    
    this.warningShown = false;
    
    // Timer para mostrar warning
    this.warningTimer = setTimeout(() => {
      this.showInactivityWarning();
    }, this.inactivityTime - this.warningTime);
    
    // Timer para logout automático
    this.inactivityTimer = setTimeout(() => {
      this.endSessionDueToInactivity();
    }, this.inactivityTime);
    
    Logger.logSession('Timer de inactividad reseteado', {
      timeout: this.inactivityTime / 1000 + ' seg',
      warning_in: (this.inactivityTime - this.warningTime) / 1000 + ' seg'
    });
  }

  /**
   * Mostrar warning de inactividad
   */
  showInactivityWarning() {
    Logger.logSession('⚠️ Mostrando warning de inactividad');
    this.warningShown = true;

    // Crear overlay
    const overlay = document.createElement('div');
    overlay.id = 'inactivity-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.6);
      z-index: 99998;
    `;
    document.body.appendChild(overlay);

    // Crear modal de warning
    const warning = document.createElement('div');
    warning.id = 'inactivity-warning';
    warning.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      border: 3px solid ${AppConfig.UI.COLORS.DANGER};
      border-radius: 12px;
      padding: 30px;
      z-index: 99999;
      max-width: 400px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
      text-align: center;
      font-family: ${AppConfig.UI.FONTS.FAMILY};
      animation: slideIn 0.3s ease-out;
    `;

    warning.innerHTML = `
      <style>
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
        }
      </style>

      <h2 style="color: ${AppConfig.UI.COLORS.DANGER}; margin-bottom: 15px; font-size: 20px;">${AppConfig.MESSAGES.SESSION_INACTIVE}</h2>
      <p style="color: ${AppConfig.UI.COLORS.TEXT_DARK}; margin-bottom: 20px; font-size: 14px; line-height: 1.5;">${AppConfig.MESSAGES.SESSION_EXPIRE_SOON}</p>
      <div id="timer" style="font-size: 24px; font-weight: bold; color: ${AppConfig.UI.COLORS.DANGER}; margin: 15px 0;">0:${this.config.WARNING_SECONDS.toString().padStart(2, '0')}</div>
      <p style="color: ${AppConfig.UI.COLORS.TEXT_DARK}; margin-bottom: 20px; font-size: 14px; line-height: 1.5;">${AppConfig.MESSAGES.CONTINUE_ACTIVE}</p>
      <div style="display: flex; gap: 10px; justify-content: center; margin-top: 20px;">
        <button id="continue-session" style="padding: 10px 20px; border: none; border-radius: 6px; cursor: pointer; font-weight: 500; background: ${AppConfig.UI.COLORS.PRIMARY}; color: white; font-size: 14px; transition: all 0.3s ease;">
          ${AppConfig.MESSAGES.CONTINUE}
        </button>
        <button id="force-logout" style="padding: 10px 20px; border: none; border-radius: 6px; cursor: pointer; font-weight: 500; background: ${AppConfig.UI.COLORS.DANGER}; color: white; font-size: 14px; transition: all 0.3s ease;">
          ${AppConfig.MESSAGES.LOGOUT}
        </button>
      </div>
    `;

    document.body.appendChild(warning);

    // Countdown timer
    let seconds = this.config.WARNING_SECONDS;
    const timerInterval = setInterval(() => {
      seconds--;
      const timerEl = document.getElementById('timer');
      if (timerEl) {
        timerEl.textContent = `0:${seconds.toString().padStart(2, '0')}`;
      }
      if (seconds <= 0) clearInterval(timerInterval);
    }, 1000);

    // Continue button
    const continueBtn = document.getElementById('continue-session');
    if (continueBtn) {
      continueBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        Logger.logSession('✅ Usuario continuó sesión activa');
        this.hideInactivityWarning();
        this.resetInactivityTimer();
        if (this.eventBus) {
          this.eventBus.emit(EVENTS.SESSION_WARN, { action: 'continue' });
        }
      });
    }

    // Logout button
    const logoutBtn = document.getElementById('force-logout');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        Logger.logSession('🚪 Usuario cerró sesión manualmente');
        this.endSession();
      });
    }

    this.eventBus.emit(EVENTS.MODAL_OPEN, { type: 'inactivity-warning' });
  }

  /**
   * Ocultar warning de inactividad
   * @private
   */
  hideInactivityWarning() {
    const warning = document.getElementById('inactivity-warning');
    const overlay = document.getElementById('inactivity-overlay');
    
    if (warning) warning.remove();
    if (overlay) overlay.remove();
    
    if (this.eventBus) {
      this.eventBus.emit(EVENTS.MODAL_CLOSE, { type: 'inactivity-warning' });
    }
  }

  /**
   * Terminar sesión por inactividad
   */
  endSessionDueToInactivity() {
    Logger.logSession('🚪 Sesión cerrada por inactividad');
    
    this.hideInactivityWarning();
    
    sessionStorage.removeItem('session-started');
    sessionStorage.removeItem('session-start-time');
    this.sessionActive = false;
    
    if (this.eventBus) {
      this.eventBus.emit(EVENTS.SESSION_INACTIVITY_TIMEOUT, {
        timestamp: new Date()
      });
    }

    // Mostrar mensaje y luego hacer logout + redirect
    this.showSessionExpiredMessage();
  }

  /**
   * Terminar sesión (logout manual)
   */
  endSession() {
    Logger.logSession('👋 Sesión terminada (logout manual)');
    
    this.hideInactivityWarning();
    
    sessionStorage.removeItem('session-started');
    sessionStorage.removeItem('session-start-time');
    this.sessionActive = false;

    if (this.eventBus) {
      this.eventBus.emit(EVENTS.SESSION_END, {
        timestamp: new Date(),
        manual: true
      });
    }

    // Usar NavigationService si está disponible, sino usar lógica de logout manual
    if (this.navigationService) {
      this.navigationService.handleGoHome();
    } else {
      this._fallbackLogoutAndRedirect();
    }
  }

  /**
   * Mostrar mensaje de sesión expirada
   * @private
   */
  showSessionExpiredMessage() {
    const container = document.createElement('div');
    container.innerHTML = `
      <style>
        .session-expired-modal {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: white;
          border-radius: 12px;
          padding: 40px;
          z-index: 99999;
          max-width: 400px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
          text-align: center;
          font-family: ${AppConfig.UI.FONTS.FAMILY};
        }

        .session-expired-modal h2 {
          color: ${AppConfig.UI.COLORS.DANGER};
          margin-bottom: 15px;
          font-size: 20px;
        }

        .session-expired-modal p {
          color: ${AppConfig.UI.COLORS.TEXT_LIGHT};
          margin-bottom: 20px;
          font-size: 14px;
          line-height: 1.6;
        }

        .session-expired-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          z-index: 99998;
        }
      </style>

      <div class="session-expired-overlay"></div>
      <div class="session-expired-modal">
        <h2>${AppConfig.MESSAGES.SESSION_EXPIRED}</h2>
        <p>${AppConfig.MESSAGES.SESSION_CLOSED_INACTIVITY}</p>
      </div>
    `;
    
    document.body.appendChild(container);

    // Hacer logout y redirigir después de 2 segundos
    setTimeout(() => {
      if (this.navigationService) {
        this.navigationService.handleGoHome();
      } else {
        this._fallbackLogoutAndRedirect();
      }
    }, 2000);
  }

  /**
   * Fallback para logout y redirect cuando NavigationService no está disponible
   * @private
   */
  _fallbackLogoutAndRedirect() {
    const currentUrl = window.location.href;
    const platform = platformService.detectPlatform(currentUrl);

    if (!platform) {
      // No hay plataforma, ir directo a index
      this._redirectToIndex();
      return;
    }

    // Verificar si ya estamos en login/logout
    if (currentUrl.includes('login') || currentUrl.includes('logoutConsent')) {
      this._redirectToIndex();
      return;
    }

    // Hacer logout primero
    const logoutUrl = platformService.getLogoutUrl();
    if (logoutUrl) {
      Logger.logSession('Redirigiendo a logout URL:', logoutUrl);
      // Marcar para redireccionar después del logout
      sessionStorage.setItem('redirect-after-logout', 'true');
      window.location.href = logoutUrl;
    } else {
      this._redirectToIndex();
    }
  }

  /**
   * Redirigir a index.html
   * @private
   */
  _redirectToIndex() {
    const extensionId = chrome.runtime.id;
    const menuUrl = `chrome-extension://${extensionId}/index.html`;
    Logger.logSession('Redirigiendo a index.html:', menuUrl);
    window.location.href = menuUrl;
  }

  /**
   * Obtener tiempo de sesión transcurrido
   * @returns {number} Segundos transcurridos
   */
  getSessionTime() {
    const startTime = sessionStorage.getItem('session-start-time');
    if (startTime) {
      return Math.floor((Date.now() - parseInt(startTime)) / 1000);
    }
    return 0;
  }

  /**
   * Verificar si sesión está activa
   * @returns {boolean}
   */
  isActive() {
    return this.sessionActive;
  }

  /**
   * Debug: Imprimir información de sesión
   */
  debugPrint() {
    Logger.log('=== SessionManager Debug Info ===');
    Logger.log('Session Active:', this.sessionActive);
    Logger.log('Session Time:', this.getSessionTime() + ' seconds');
    Logger.log('Warning Shown:', this.warningShown);
    Logger.log('Config:', {
      timeout: this.config.TIMEOUT_SECONDS + ' seconds',
      warning: this.config.WARNING_SECONDS + ' seconds'
    });
  }
}

// Crear instancia global
const sessionManager = new SessionManager();