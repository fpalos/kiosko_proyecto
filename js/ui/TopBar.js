/**
 * TopBar - Componente de barra superior navegable
 * Aparece en HCM y GCA, proporciona acceso rápido a funciones
 */

class TopBar {
  constructor(platformService, eventBus = null) {
    this.platformService = platformService;
    this.eventBus = eventBus || window.eventBus;
    this.navigationService = null; // Se setea después en content.js
    this.isVisible = false;
    
    Logger.logUI('TopBar inicializado');
  }

  /**
   * Inicializar el TopBar
   */
  init() {
    const platform = this.platformService.detectPlatform();
    
    if (!platform) {
      Logger.logUI('No hay plataforma detectada, TopBar no se mostrará');
      return;
    }

    this.create();
    this.attachEventListeners();
    this.isVisible = true;
    
    Logger.logUI('TopBar creado y visible');
    this.eventBus.emit(EVENTS.TOPBAR_SHOW);
  }

  /**
   * Crear el TopBar
   * @private
   */
  create() {
    const topBar = document.createElement('div');
    topBar.id = 'ext-top-bar';
    topBar.innerHTML = this.getHTML();
    
    document.body.appendChild(topBar);
    
    // Ajustar padding del body
    document.body.style.paddingTop = AppConfig.UI.TOP_BAR_HEIGHT;
  }

  /**
   * Obtener HTML del TopBar
   * @private
   * @returns {string} HTML del componente
   */
  getHTML() {
    return `
      <style>
        #ext-top-bar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: ${AppConfig.UI.TOP_BAR_HEIGHT};
          background: ${AppConfig.UI.GRADIENTS.PURPLE};
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 20px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          z-index: ${AppConfig.UI.TOP_BAR_Z_INDEX};
          font-family: ${AppConfig.UI.FONTS.FAMILY};
        }

        #ext-top-bar .left-section {
          display: flex;
          gap: 10px;
          align-items: center;
        }

        #ext-top-bar button {
          background: rgba(255, 255, 255, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: white;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-size: ${AppConfig.UI.FONTS.SIZE_BASE};
          font-weight: 500;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
          font-family: ${AppConfig.UI.FONTS.FAMILY};
        }

        #ext-top-bar button:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }

        #ext-top-bar button:active {
          transform: translateY(0);
        }

        #ext-top-bar .logo-text {
          color: white;
          font-size: ${AppConfig.UI.FONTS.SIZE_LARGE};
          font-weight: 600;
          margin-right: 20px;
        }

        #faq-modal {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          z-index: ${AppConfig.UI.MODAL_Z_INDEX};
          align-items: center;
          justify-content: center;
        }

        #faq-modal.active {
          display: flex;
        }

        #faq-content {
          background: white;
          border-radius: 12px;
          max-width: 600px;
          width: 90%;
          max-height: 80vh;
          overflow-y: auto;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
          font-family: ${AppConfig.UI.FONTS.FAMILY};
        }

        #faq-content .header {
          background: ${AppConfig.UI.GRADIENTS.PURPLE};
          color: white;
          padding: 20px;
          border-radius: 12px 12px 0 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        #faq-content .close-btn {
          background: rgba(255, 255, 255, 0.2);
          border: none;
          color: white;
          font-size: 24px;
          cursor: pointer;
          width: 32px;
          height: 32px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.3s;
          padding: 0;
        }

        #faq-content .close-btn:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        #faq-content .body {
          padding: 30px;
        }

        .faq-item {
          margin-bottom: 20px;
        }

        .faq-item .question {
          font-weight: 600;
          color: ${AppConfig.UI.COLORS.TEXT_DARK};
          margin-bottom: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          user-select: none;
        }

        .faq-item .question::before {
          content: '▶';
          margin-right: 10px;
          transition: transform 0.3s;
          font-size: 12px;
        }

        .faq-item.open .question::before {
          transform: rotate(90deg);
        }

        .faq-item .answer {
          display: none;
          color: ${AppConfig.UI.COLORS.TEXT_LIGHT};
          font-size: ${AppConfig.UI.FONTS.SIZE_SMALL};
          line-height: 1.6;
          margin-left: 20px;
          padding: 10px;
          background: ${AppConfig.UI.COLORS.BACKGROUND};
          border-radius: 6px;
        }

        .faq-item.open .answer {
          display: block;
        }
      </style>

      <div class="left-section">
        <div class="logo-text">📋 Navegador</div>
        <button id="btn-inicio">${AppConfig.MESSAGES.NAV_HOME}</button>
        <button id="btn-cerrar">${AppConfig.MESSAGES.NAV_LOGOUT}</button>
        <button id="btn-faq">${AppConfig.MESSAGES.NAV_FAQ}</button>
      </div>
    `;
  }

  /**
   * Adjuntar event listeners
   * @private
   */
  attachEventListeners() {
    const btnInicio = document.getElementById('btn-inicio');
    const btnCerrar = document.getElementById('btn-cerrar');
    const btnFaq = document.getElementById('btn-faq');

    if (btnInicio) {
      btnInicio.addEventListener('click', () => {
        Logger.logUI('Click en Inicio');
        this.navigationService?.handleGoHome();
      });
    }

    if (btnCerrar) {
      btnCerrar.addEventListener('click', () => {
        Logger.logUI('Click en Cerrar Sesión');
        this.navigationService?.handleLogout();
      });
    }

    if (btnFaq) {
      btnFaq.addEventListener('click', () => {
        Logger.logUI('Click en FAQ');
        this.openFAQModal();
      });
    }

    this.setupFAQModal();
  }

  /**
   * Setup del modal FAQ
   * @private
   */
  setupFAQModal() {
    const faqModal = document.createElement('div');
    faqModal.id = 'faq-modal';
    faqModal.innerHTML = `
      <div id="faq-content">
        <div class="header">
          <h2>Preguntas Frecuentes</h2>
          <button class="close-btn">&times;</button>
        </div>
        <div class="body">
          <div class="faq-item">
            <div class="question">¿Cómo accedo a HCM?</div>
            <div class="answer">HCM es el sistema de Gestión de Capital Humano. Puedes acceder desde el menú principal haciendo click en la tarjeta de HCM. Necesitarás tus credenciales de usuario.</div>
          </div>
          <div class="faq-item">
            <div class="question">¿Cómo uso GCA?</div>
            <div class="answer">GCA es el Sistema de Gestión de Calidad. Accede desde el menú principal. Aquí puedes consultar procedimientos y formatos autorizados.</div>
          </div>
          <div class="faq-item">
            <div class="question">¿Cómo cierro mi sesión?</div>
            <div class="answer">Haz click en el botón "Cerrar Sesión" en la barra superior (🔒). También puedes usar el botón en el menú principal. Siempre cierra sesión después de tus consultas.</div>
          </div>
          <div class="faq-item">
            <div class="question">¿Qué hago si olvido mi contraseña?</div>
            <div class="answer">Cada plataforma tiene su propio sistema de recuperación de contraseña. Busca el enlace "¿Olvidaste tu contraseña?" en la pantalla de login.</div>
          </div>
          <div class="faq-item">
            <div class="question">¿Cómo navego entre plataformas?</div>
            <div class="answer">Usa el botón "Inicio" (🏠) en la barra superior para volver al menú principal. Desde allí puedes acceder a cualquier plataforma.</div>
          </div>
          <div class="faq-item">
            <div class="question">¿Mi sesión se cierra automáticamente?</div>
            <div class="answer">Sí, por seguridad tu sesión se cierra automáticamente después de 3 minutos de inactividad. Recibirás una advertencia 30 segundos antes.</div>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(faqModal);

    // Event listeners del FAQ
    const closeBtn = document.querySelector('#faq-content .close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this.closeFAQModal();
      });
    }

    const modalElement = document.getElementById('faq-modal');
    if (modalElement) {
      modalElement.addEventListener('click', (e) => {
        if (e.target.id === 'faq-modal') {
          this.closeFAQModal();
        }
      });
    }

    // FAQ items toggle
    document.querySelectorAll('.faq-item .question').forEach(question => {
      question.addEventListener('click', function() {
        this.parentElement.classList.toggle('open');
      });
    });
  }

  /**
   * Abrir modal FAQ
   */
  openFAQModal() {
    Logger.logUI('Abriendo modal FAQ');
    document.getElementById('faq-modal').classList.add('active');
    if (this.eventBus) {
      this.eventBus.emit(EVENTS.MODAL_OPEN, { type: 'faq' });
    }
  }

  /**
   * Cerrar modal FAQ
   */
  closeFAQModal() {
    Logger.logUI('Cerrando modal FAQ');
    document.getElementById('faq-modal').classList.remove('active');
    if (this.eventBus) {
      this.eventBus.emit(EVENTS.MODAL_CLOSE, { type: 'faq' });
    }
  }

  /**
   * Mostrar TopBar
   */
  show() {
    const topBar = document.getElementById('ext-top-bar');
    if (topBar) {
      topBar.style.display = 'flex';
      this.isVisible = true;
      this.eventBus.emit(EVENTS.TOPBAR_SHOW);
    }
  }

  /**
   * Ocultar TopBar
   */
  hide() {
    const topBar = document.getElementById('ext-top-bar');
    if (topBar) {
      topBar.style.display = 'none';
      this.isVisible = false;
      this.eventBus.emit(EVENTS.TOPBAR_HIDE);
    }
  }

  /**
   * Debug: Imprimir información del TopBar
   */
  debugPrint() {
    Logger.log('=== TopBar Debug ===');
    Logger.log('Is Visible:', this.isVisible);
    const topBar = document.getElementById('ext-top-bar');
    Logger.log('Element exists:', !!topBar);
  }
}