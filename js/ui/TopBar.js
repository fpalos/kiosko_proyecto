/**
 * TopBar - Componente de barra superior rediseñado (Crystal Design)
 * Aparece en HCM y GCA, proporciona acceso rápido a funciones
 * Basado en diseño moderno con botones laterales y home circular
 */

class TopBar {
  constructor(platformService, eventBus = null) {
    this.platformService = platformService;
    this.eventBus = eventBus || (typeof window.eventBus !== 'undefined' ? window.eventBus : null);
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
    const topBar = document.createElement('header');
    topBar.id = 'ext-top-bar';
    topBar.innerHTML = this.getHTML();
    
    document.body.insertBefore(topBar, document.body.firstChild);
    
    // Ajustar padding del body
    document.body.style.paddingTop = '60px';
  }

  /**
   * Obtener HTML del TopBar
   * @private
   * @returns {string} HTML del componente
   */
  getHTML() {
    return `
      <style>
        :root {
          /* ===== Layout ===== */
          --bar-height: 60px;
          --bar-bg: #1d1d1f;

          /* ===== Buttons ===== */
          --btn-bg: #32383f;
          --btn-hover: #4fa3ff;
          --text: #ffffff;
          --side-btn-offset: -4px;

          /* ===== Home button ===== */
          --home-size: 65px;
          --home-offset: -1px;
          --home-bg: #32383f;

          /* ===== Icon sizes ===== */
          --icon-nav-size: 22px;
          --icon-home-size: 38px;
        }

        #ext-top-bar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: var(--bar-height);
          background: var(--bar-bg);
          display: grid;
          grid-template-columns: 1fr 1fr;
          align-items: center;
          padding: 0 18px;
          z-index: 10000;
          font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
        }

        /* Navigation Buttons */
        .top-bar-nav-btn {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          background: var(--btn-bg);
          color: var(--text);
          border: none;
          border-radius: 10px;
          padding: 12px 22px;
          font-size: 16px;
          cursor: pointer;
          transition: background 0.2s ease, transform 0.1s ease;
          transform: translateY(var(--side-btn-offset));
          font-weight: 500;
        }

        .top-bar-nav-btn:hover {
          background: var(--btn-hover);
        }

        .top-bar-nav-btn:active {
          transform: scale(0.96);
        }

        .top-bar-right {
          justify-self: end;
        }

        /* SVG icons */
        .top-bar-nav-icon {
          width: var(--icon-nav-size);
          height: var(--icon-nav-size);
          flex-shrink: 0;
        }

        /* Home Button (rectangular like Info) */
        .top-bar-home-wrapper {
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: flex-start;
          padding-left: 0;
        }

        .top-bar-home-btn {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          background: var(--btn-bg);
          color: var(--text);
          border: none;
          border-radius: 10px;
          padding: 12px 22px;
          font-size: 16px;
          cursor: pointer;
          transition: background 0.2s ease, transform 0.1s ease;
          transform: translateY(var(--side-btn-offset));
          font-weight: 500;
          justify-content: flex-start;
          box-shadow: none;
        }

        .top-bar-home-btn:hover {
          background: var(--btn-hover);
        }

        .top-bar-home-btn:active {
          transform: scale(0.96);
        }

        /* Home SVG icon */
        .top-bar-home-icon {
          width: var(--icon-nav-size);
          height: var(--icon-nav-size);
          flex-shrink: 0;
        }

        /* FAQ Modal */
        #faq-modal-topbar {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          z-index: 10001;
          align-items: center;
          justify-content: center;
        }

        #faq-modal-topbar.active {
          display: flex;
        }

        #faq-content-topbar {
          background: white;
          border-radius: 12px;
          max-width: 600px;
          width: 90%;
          max-height: 80vh;
          overflow-y: auto;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
          animation: slideInModal 0.3s ease-out;
        }

        @keyframes slideInModal {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        #faq-content-topbar .header {
          background: linear-gradient(135deg, #4fa3ff 0%, #2563eb 100%);
          color: white;
          padding: 20px;
          border-radius: 12px 12px 0 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        #faq-content-topbar .close-btn {
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

        #faq-content-topbar .close-btn:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        #faq-content-topbar .body {
          padding: 30px;
        }

        .faq-item-topbar {
          margin-bottom: 20px;
        }

        .faq-item-topbar .question {
          font-weight: 600;
          color: #333;
          margin-bottom: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          user-select: none;
          background: rgba(79, 163, 255, 0.1);
          padding: 14px 18px;
          border-radius: 8px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .faq-item-topbar .question:hover {
          background: rgba(79, 163, 255, 0.2);
          transform: translateY(-2px);
          box-shadow: 0 2px 8px rgba(79, 163, 255, 0.2);
        }

        .faq-item-topbar .question:active {
          transform: translateY(0);
          background: rgba(79, 163, 255, 0.15);
        }

        .faq-item-topbar .question::before {
          content: '▶';
          margin-right: 10px;
          transition: transform 0.3s;
          font-size: 12px;
        }

        .faq-item-topbar.open .question::before {
          transform: rotate(90deg);
        }

        .faq-item-topbar .answer {
          display: none;
          color: #666;
          font-size: 14px;
          line-height: 1.6;
          margin-left: 20px;
          padding: 10px;
          background: #f5f5f5;
          border-radius: 6px;
        }

        .faq-item-topbar.open .answer {
          display: block;
        }
      </style>

      <!-- Top Bar -->
      <!-- Home Button (Left) -->
      <div class="top-bar-home-wrapper">
        <button class="top-bar-home-btn" id="btn-inicio" aria-label="Inicio">
          <svg class="top-bar-home-icon top-bar-nav-icon" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16">
            <path d="M8.707 1.5a1 1 0 0 0-1.414 0L.646 8.146a.5.5 0 0 0 .708.708L2 8.207V13.5A1.5 1.5 0 0 0 3.5 15h9a1.5 1.5 0 0 0 1.5-1.5V8.207l.646.647a.5.5 0 0 0 .708-.708L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293zM13 7.207V13.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V7.207l5-5z"/>
          </svg>
          <span>Inicio</span>
        </button>
      </div>

      <!-- Info Button (Right) -->
      <div class="top-bar-right">
        <button class="top-bar-nav-btn" id="btn-informacion">
          <svg class="top-bar-nav-icon" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16">
            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
            <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0"/>
          </svg>
          Información
        </button>
      </div>

      <!-- FAQ Modal -->
      <div id="faq-modal-topbar">
        <div id="faq-content-topbar">
          <div class="header">
            <h2>Información y Ayuda</h2>
            <button class="close-btn">&times;</button>
          </div>
          <div class="body">
            <div class="faq-item-topbar">
              <div class="question">1. ¿Cómo consulto mis bonos en HCM?</div>
              <div class="answer">
                                  1.- Ingresa a <b>HCM</b>.<br>
                                  2.- Dirígete al apartado <b>“Yo”</b>.<br>
                                  3.- Presiona la opción <b>“Mostrar más”</b>.<br>
                                  4.- Desplázate hacia abajo hasta la sección <b>“Compensación”</b>.<br>
                                  5.- Da clic en <b>“Mi compensación”</b>.<br>
                                  6.- Ubica la sección <b>“Compensación adicional”</b>.<br>
                                  7.- Por último, presiona <b>“Mostrar compensación anterior”</b> para consultar tus bonos.</div>
            </div>
            <div class="faq-item-topbar">
              <div class="question">2. ¿Cómo solicito vacaciones o un permiso?</div>
              <div class="answer">
                                1.- Ingresa a <b>HCM</b>.<br>
                                2.- Dirígete al apartado <b>“Yo”</b>.<br>
                                3.- Selecciona <b>“Tiempo y Ausencias”</b>.<br>
                                4.- Da clic en <b>“Agregar ausencia”</b>.<br>
                                5.- Elige el <b>tipo de ausencia </b> que deseas solicitar.<br>
                                6.- Captura la información correspondiente.<br>
                                7.- Por último, presiona <b>“Enviar”</b> y confirma que tu líder apruebe tu solicitud <b>antes de la fecha de inicio</b> de la ausencia.</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Adjuntar event listeners
   * @private
   */
  attachEventListeners() {
    const btnInicio = document.getElementById('btn-inicio');
    const btnInformacion = document.getElementById('btn-informacion');

    if (btnInicio) {
      btnInicio.addEventListener('click', () => {
        Logger.logUI('Click en Inicio');
        this.navigationService?.handleGoHome();
      });
    }

    if (btnInformacion) {
      btnInformacion.addEventListener('click', () => {
        Logger.logUI('Click en Información');
        this.openInformacionModal();
      });
    }

    this.setupInformacionModal();
  }

  /**
   * Setup del modal de Información
   * @private
   */
  setupInformacionModal() {
    const closeBtn = document.querySelector('#faq-content-topbar .close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this.closeInformacionModal();
      });
    }

    const modalElement = document.getElementById('faq-modal-topbar');
    if (modalElement) {
      modalElement.addEventListener('click', (e) => {
        if (e.target.id === 'faq-modal-topbar') {
          this.closeInformacionModal();
        }
      });
    }

    // FAQ items toggle
    document.querySelectorAll('.faq-item-topbar .question').forEach(question => {
      question.addEventListener('click', function() {
        this.parentElement.classList.toggle('open');
      });
    });
  }

  /**
   * Abrir modal de Información
   */
  openInformacionModal() {
    Logger.logUI('Abriendo modal Información');
    document.getElementById('faq-modal-topbar').classList.add('active');
    if (this.eventBus) {
      this.eventBus.emit(EVENTS.MODAL_OPEN, { type: 'informacion' });
    }
  }

  /**
   * Cerrar modal de Información
   */
  closeInformacionModal() {
    Logger.logUI('Cerrando modal Información');
    document.getElementById('faq-modal-topbar').classList.remove('active');
    if (this.eventBus) {
      this.eventBus.emit(EVENTS.MODAL_CLOSE, { type: 'informacion' });
    }
  }

  /**
   * Mostrar TopBar
   */
  show() {
    const topBar = document.getElementById('ext-top-bar');
    if (topBar) {
      topBar.style.display = 'grid';
      this.isVisible = true;
      if (this.eventBus) {
        this.eventBus.emit(EVENTS.TOPBAR_SHOW);
      }
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
      if (this.eventBus) {
        this.eventBus.emit(EVENTS.TOPBAR_HIDE);
      }
    }
  }

  /**
   * Toggle visibilidad
   */
  toggle() {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
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