/**
 * Modal - Componente reutilizable para modales
 * Proporciona funcionalidad genérica para crear modales
 * Se usa para advertencias, confirmaciones, info, etc.
 */

class Modal {
  constructor(options = {}) {
    this.options = {
      id: options.id || 'modal-' + Math.random().toString(36).substr(2, 9),
      title: options.title || 'Modal',
      content: options.content || '',
      type: options.type || 'info', // 'info', 'warning', 'error', 'success'
      buttons: options.buttons || [],
      onOpen: options.onOpen || null,
      onClose: options.onClose || null,
      dismissible: options.dismissible !== false, // Cerrable al hacer click fuera
      size: options.size || 'medium', // 'small', 'medium', 'large'
      eventBus: options.eventBus || window.eventBus
    };

    this.isOpen = false;
    this.overlay = null;
    this.modalElement = null;

    Logger.logUI('Modal creado:', this.options.id);
  }

  /**
   * Obtener colores según tipo de modal
   * @private
   */
  getColorsByType() {
    const colors = {
      info: {
        border: AppConfig.UI.COLORS.PRIMARY,
        header: AppConfig.UI.GRADIENTS.PURPLE,
        icon: 'ℹ️'
      },
      warning: {
        border: AppConfig.UI.COLORS.WARNING,
        header: 'linear-gradient(135deg, #ffd700 0%, #ffb700 100%)',
        icon: '⚠️'
      },
      error: {
        border: AppConfig.UI.COLORS.DANGER,
        header: 'linear-gradient(135deg, #ff6b6b 0%, #ff5252 100%)',
        icon: '❌'
      },
      success: {
        border: AppConfig.UI.COLORS.SUCCESS,
        header: 'linear-gradient(135deg, #51cf66 0%, #37b24d 100%)',
        icon: '✅'
      }
    };

    return colors[this.options.type] || colors.info;
  }

  /**
   * Obtener tamaño del modal
   * @private
   */
  getSizeStyles() {
    const sizes = {
      small: { maxWidth: '300px' },
      medium: { maxWidth: '500px' },
      large: { maxWidth: '700px' }
    };

    return sizes[this.options.size] || sizes.medium;
  }

  /**
   * Crear el HTML del modal
   * @private
   */
  createHTML() {
    const colors = this.getColorsByType();
    const sizeStyles = this.getSizeStyles();

    return `
      <style>
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          z-index: ${AppConfig.UI.OVERLAY_Z_INDEX};
          display: flex;
          align-items: center;
          justify-content: center;
          animation: fadeIn 0.3s ease-out;
        }

        .modal-container {
          background: white;
          border: 3px solid ${colors.border};
          border-radius: 12px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          font-family: ${AppConfig.UI.FONTS.FAMILY};
          animation: slideIn 0.3s ease-out;
          width: 90%;
          max-width: ${sizeStyles.maxWidth};
        }

        .modal-header {
          background: ${colors.header};
          color: white;
          padding: 20px;
          border-radius: 9px 9px 0 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
        }

        .modal-header-content {
          display: flex;
          align-items: center;
          gap: 10px;
          flex: 1;
        }

        .modal-header-icon {
          font-size: 24px;
        }

        .modal-header-title {
          font-size: 20px;
          font-weight: 600;
          margin: 0;
        }

        .modal-close-btn {
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
          flex-shrink: 0;
        }

        .modal-close-btn:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .modal-body {
          padding: 25px;
          color: ${AppConfig.UI.COLORS.TEXT_DARK};
          font-size: ${AppConfig.UI.FONTS.SIZE_BASE};
          line-height: 1.6;
        }

        .modal-footer {
          padding: 15px 25px;
          border-top: 1px solid #e0e0e0;
          display: flex;
          gap: 10px;
          justify-content: flex-end;
          flex-wrap: wrap;
        }

        .modal-button {
          padding: 10px 20px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          font-size: ${AppConfig.UI.FONTS.SIZE_BASE};
          transition: all 0.3s ease;
          font-family: ${AppConfig.UI.FONTS.FAMILY};
        }

        .modal-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .modal-button:active {
          transform: translateY(0);
        }

        .modal-button-primary {
          background: ${AppConfig.UI.COLORS.PRIMARY};
          color: white;
        }

        .modal-button-primary:hover {
          background: #5568d3;
        }

        .modal-button-secondary {
          background: #f0f0f0;
          color: ${AppConfig.UI.COLORS.TEXT_DARK};
          border: 1px solid #d0d0d0;
        }

        .modal-button-secondary:hover {
          background: #e0e0e0;
        }

        .modal-button-danger {
          background: ${AppConfig.UI.COLORS.DANGER};
          color: white;
        }

        .modal-button-danger:hover {
          background: #ff5252;
        }

        .modal-button-success {
          background: ${AppConfig.UI.COLORS.SUCCESS};
          color: white;
        }

        .modal-button-success:hover {
          background: #40c057;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      </style>

      <div class="modal-overlay" id="${this.options.id}-overlay">
        <div class="modal-container" id="${this.options.id}-container">
          <div class="modal-header">
            <div class="modal-header-content">
              <span class="modal-header-icon">${this.getColorsByType().icon}</span>
              <h2 class="modal-header-title">${this.options.title}</h2>
            </div>
            <button class="modal-close-btn" id="${this.options.id}-close">&times;</button>
          </div>

          <div class="modal-body" id="${this.options.id}-body">
            ${this.options.content}
          </div>

          ${this.options.buttons.length > 0 ? `
            <div class="modal-footer" id="${this.options.id}-footer">
              ${this.options.buttons.map((btn, idx) => `
                <button 
                  class="modal-button modal-button-${btn.type || 'primary'}" 
                  id="${this.options.id}-btn-${idx}"
                >
                  ${btn.label}
                </button>
              `).join('')}
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  /**
   * Abrir el modal
   */
  open() {
    if (this.isOpen) {
      Logger.logUI('Modal ya está abierto:', this.options.id);
      return;
    }

    Logger.logUI('Abriendo modal:', this.options.id);

    // Crear elementos
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.createHTML();
    
    this.overlay = wrapper.querySelector('.modal-overlay');
    this.modalElement = wrapper.querySelector('.modal-container');

    document.body.appendChild(this.overlay);

    // Adjuntar event listeners
    this.attachEventListeners();

    this.isOpen = true;

    // Callback onOpen
    if (this.options.onOpen) {
      this.options.onOpen();
    }

    this.options.eventBus.emit(EVENTS.MODAL_OPEN, {
      id: this.options.id,
      type: this.options.type
    });
  }

  /**
   * Cerrar el modal
   */
  close() {
    if (!this.isOpen) {
      Logger.logUI('Modal ya está cerrado:', this.options.id);
      return;
    }

    Logger.logUI('Cerrando modal:', this.options.id);

    if (this.overlay) {
      this.overlay.remove();
    }

    this.isOpen = false;

    // Callback onClose
    if (this.options.onClose) {
      this.options.onClose();
    }

    this.options.eventBus.emit(EVENTS.MODAL_CLOSE, {
      id: this.options.id,
      type: this.options.type
    });
  }

  /**
   * Adjuntar event listeners
   * @private
   */
  attachEventListeners() {
    // Botón de cerrar
    const closeBtn = document.getElementById(`${this.options.id}-close`);
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.close());
    }

    // Click fuera del modal
    if (this.options.dismissible) {
      this.overlay.addEventListener('click', (e) => {
        if (e.target === this.overlay) {
          this.close();
        }
      });
    }

    // Botones de acción
    this.options.buttons.forEach((btn, idx) => {
      const btnElement = document.getElementById(`${this.options.id}-btn-${idx}`);
      if (btnElement && btn.onClick) {
        btnElement.addEventListener('click', () => {
          Logger.logUI('Button clicked en modal:', btn.label);
          btn.onClick();
        });
      }
    });
  }

  /**
   * Actualizar contenido del modal
   * @param {string} newContent - Nuevo contenido HTML
   */
  setContent(newContent) {
    const bodyElement = document.getElementById(`${this.options.id}-body`);
    if (bodyElement) {
      bodyElement.innerHTML = newContent;
      this.options.content = newContent;
    }
  }

  /**
   * Actualizar título
   * @param {string} newTitle - Nuevo título
   */
  setTitle(newTitle) {
    const titleElement = document.querySelector(`#${this.options.id}-container .modal-header-title`);
    if (titleElement) {
      titleElement.textContent = newTitle;
      this.options.title = newTitle;
    }
  }

  /**
   * Agregar un botón
   * @param {Object} button - Configuración del botón
   */
  addButton(button) {
    this.options.buttons.push(button);
    
    if (this.isOpen) {
      const footer = document.getElementById(`${this.options.id}-footer`);
      if (footer) {
        const btnIdx = this.options.buttons.length - 1;
        const btnElement = document.createElement('button');
        btnElement.id = `${this.options.id}-btn-${btnIdx}`;
        btnElement.className = `modal-button modal-button-${button.type || 'primary'}`;
        btnElement.textContent = button.label;
        btnElement.addEventListener('click', () => {
          if (button.onClick) button.onClick();
        });
        footer.appendChild(btnElement);
      }
    }
  }

  /**
   * Toggle visibilidad del modal
   */
  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  /**
   * Debug: Imprimir información del modal
   */
  debugPrint() {
    Logger.log('=== Modal Debug ===');
    Logger.log('ID:', this.options.id);
    Logger.log('Is Open:', this.isOpen);
    Logger.log('Type:', this.options.type);
    Logger.log('Buttons:', this.options.buttons.length);
  }
}