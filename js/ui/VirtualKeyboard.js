/**
 * VirtualKeyboard - Teclado Virtual en Español México
 * Teclado virtual compatible con aplicaciones third-party
 * Simula comportamiento de teclado físico usando eventos nativos
 */

class VirtualKeyboard {
  // Constantes de configuración
  static KEYBOARD_CONFIG = {
    ANIMATION_DURATION: 300,
    KEYBOARD_HEIGHT: 320,
    Z_INDEX: 9000,
    MAX_HEIGHT: '40vh'
  };

  static EVENT_OPTIONS = {
    ENTER: {
      key: 'Enter',
      code: 'Enter',
      keyCode: 13,
      which: 13,
      charCode: 13,
      bubbles: true,
      cancelable: true,
      composed: true,
      view: window
    }
  };

  constructor(eventBus = null) {
    this.eventBus = eventBus || window.eventBus;
    this.state = {
      isVisible: false,
      activeInput: null,
      capsLock: false,
      shift: false,
      altGr: false
    };
    
    this.keyLayout = this._initKeyLayout();
    Logger.logUI('VirtualKeyboard inicializado');
  }

  /**
   * Inicializar distribución de teclado
   * @private
   */
  _initKeyLayout() {
    return {
      row1: [
        { key: '`', shift: '~', altGr: null, label: '`' },
        { key: '1', shift: '!', altGr: null, label: '1' },
        { key: '2', shift: '@', altGr: null, label: '2' },
        { key: '3', shift: '#', altGr: null, label: '3' },
        { key: '4', shift: '$', altGr: null, label: '4' },
        { key: '5', shift: '%', altGr: null, label: '5' },
        { key: '6', shift: '^', altGr: null, label: '6' },
        { key: '7', shift: '&', altGr: null, label: '7' },
        { key: '8', shift: '*', altGr: null, label: '8' },
        { key: '9', shift: '(', altGr: null, label: '9' },
        { key: '0', shift: ')', altGr: null, label: '0' },
        { key: '-', shift: '_', altGr: null, label: '-' },
        { key: '=', shift: '+', altGr: null, label: '=' },
      ],
      row2: [
        { key: 'q', shift: 'Q', altGr: null, label: 'q' },
        { key: 'w', shift: 'W', altGr: null, label: 'w' },
        { key: 'e', shift: 'E', altGr: '€', label: 'e' },
        { key: 'r', shift: 'R', altGr: null, label: 'r' },
        { key: 't', shift: 'T', altGr: null, label: 't' },
        { key: 'y', shift: 'Y', altGr: null, label: 'y' },
        { key: 'u', shift: 'U', altGr: null, label: 'u' },
        { key: 'i', shift: 'I', altGr: null, label: 'i' },
        { key: 'o', shift: 'O', altGr: null, label: 'o' },
        { key: 'p', shift: 'P', altGr: null, label: 'p' },
        { key: '[', shift: '{', altGr: null, label: '[' },
        { key: ']', shift: '}', altGr: null, label: ']' },
      ],
      row3: [
        { key: 'a', shift: 'A', altGr: null, label: 'a' },
        { key: 's', shift: 'S', altGr: null, label: 's' },
        { key: 'd', shift: 'D', altGr: null, label: 'd' },
        { key: 'f', shift: 'F', altGr: null, label: 'f' },
        { key: 'g', shift: 'G', altGr: null, label: 'g' },
        { key: 'h', shift: 'H', altGr: null, label: 'h' },
        { key: 'j', shift: 'J', altGr: null, label: 'j' },
        { key: 'k', shift: 'K', altGr: null, label: 'k' },
        { key: 'l', shift: 'L', altGr: null, label: 'l' },
        { key: 'ñ', shift: 'Ñ', altGr: null, label: 'ñ' },
        { key: "'", shift: '"', altGr: null, label: "'" },
        { key: '\\', shift: '|', altGr: null, label: '\\' },
      ],
      row4: [
        { key: 'z', shift: 'Z', altGr: null, label: 'z' },
        { key: 'x', shift: 'X', altGr: null, label: 'x' },
        { key: 'c', shift: 'C', altGr: null, label: 'c' },
        { key: 'v', shift: 'V', altGr: null, label: 'v' },
        { key: 'b', shift: 'B', altGr: null, label: 'b' },
        { key: 'n', shift: 'N', altGr: null, label: 'n' },
        { key: 'm', shift: 'M', altGr: null, label: 'm' },
        { key: ',', shift: '<', altGr: null, label: ',' },
        { key: '.', shift: '>', altGr: null, label: '.' },
        { key: '/', shift: '?', altGr: null, label: '/' },
      ],
    };
  }

  /**
   * Inicializar el teclado virtual
   */
  init() {
    this.create();
    this.attachGlobalListeners();
    Logger.logUI('VirtualKeyboard listo');
  }

  /**
   * Crear el HTML del teclado
   * @private
   */
  create() {
    const container = document.createElement('div');
    container.id = 'virtual-keyboard-container';
    container.innerHTML = this._getHTML();
    
    document.body.appendChild(container);
  }

  /**
   * Obtener estilos CSS del teclado
   * @private
   */
  _getStyles() {
    return `
      <style>
        #virtual-keyboard-container {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 9000;
          background: transparent !important;
          border-top: none;
          font-family: ${AppConfig.UI.FONTS.FAMILY};
          padding: 8px;
          max-height: 40vh;
          overflow-y: auto;
          backdrop-filter: none;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        #virtual-keyboard-container.visible {
          opacity: 1;
          pointer-events: auto;
          animation: slideUp 0.3s ease-out;
        }

        @keyframes slideUp {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }

        body.keyboard-open {
          padding-bottom: 320px;
          transition: padding-bottom 0.3s ease;
        }

        #virtual-keyboard {
          display: flex;
          flex-direction: column;
          gap: 4px;
          max-width: 100%;
          background: rgba(255, 255, 255, 0.08);
          border-radius: 12px 12px 0 0;
          padding: 10px;
          backdrop-filter: none;
          box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.25), 
                      inset 0 1px 1px rgba(255, 255, 255, 0.3);
          border-top: 2px solid rgba(102, 126, 234, 0.5);
          border-left: 1px solid rgba(255, 255, 255, 0.2);
          border-right: 1px solid rgba(255, 255, 255, 0.2);
        }

        .keyboard-row {
          display: flex;
          gap: 4px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .keyboard-key {
          min-width: 32px;
          height: 40px;
          padding: 4px 8px;
          border: 1px solid #bbb;
          border-radius: 6px;
          background: #ffffff;
          color: #333;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          user-select: none;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.1s ease;
          flex: 0 0 auto;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
        }

        .keyboard-key:hover {
          background: #f5f5f5;
          border-color: #999;
          box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15);
        }

        .keyboard-key:active {
          background: #e8e8e8;
          transform: scale(0.95);
        }

        .keyboard-key.special {
          background: linear-gradient(135deg, #667eea 0%, #5568d3 100%);
          color: white;
          font-size: 11px;
          min-width: 48px;
          border-color: #667eea;
          box-shadow: 0 2px 6px rgba(102, 126, 234, 0.3);
        }

        .keyboard-key.special:hover {
          background: linear-gradient(135deg, #5568d3 0%, #4a5fab 100%);
          border-color: #667eea;
          box-shadow: 0 3px 8px rgba(102, 126, 234, 0.4);
        }

        .keyboard-key.special:active {
          box-shadow: 0 1px 3px rgba(102, 126, 234, 0.3);
        }

        .keyboard-key.active {
          background: linear-gradient(135deg, #667eea 0%, #5568d3 100%);
          color: white;
          border-color: #667eea;
          box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.2);
        }

        .keyboard-key.shift-key,
        .keyboard-key.caps-key,
        .keyboard-key.altgr-key {
          min-width: 60px;
        }

        .keyboard-key.space-key {
          flex: 1;
          min-width: 200px;
          max-width: 400px;
        }

        .keyboard-key.backspace-key,
        .keyboard-key.enter-key,
        .keyboard-key.tab-key,
        .keyboard-key.close-key {
          min-width: 60px;
        }

        .keyboard-key.close-key {
          background: linear-gradient(135deg, #ff6b6b 0%, #ff5252 100%);
          color: white;
          border-color: #ff6b6b;
          box-shadow: 0 2px 6px rgba(255, 107, 107, 0.3);
        }

        .keyboard-key.close-key:hover {
          background: linear-gradient(135deg, #ff5252 0%, #ff3838 100%);
          box-shadow: 0 3px 8px rgba(255, 107, 107, 0.4);
        }

        #keyboard-info {
          text-align: center;
          font-size: 11px;
          color: #666;
          margin-bottom: 6px;
          padding: 4px;
          font-weight: 500;
        }

        .key-label {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
          font-size: 10px;
        }

        .key-main {
          font-size: 12px;
          font-weight: bold;
        }

        .key-shift {
          font-size: 8px;
          color: #999;
        }
      </style>
    `;
  }

  /**
   * Obtener HTML del teclado
   * @private
   */
  _getHTML() {
    return `
      ${this._getStyles()}

      <div id="virtual-keyboard">
        <div id="keyboard-info">
          Teclado Virtual - Español México (QWERTY)
        </div>

        <!-- Row 1: Numbers -->
        <div class="keyboard-row">
          ${this._generateKeysHTML(this.keyLayout.row1)}
          <button class="keyboard-key special backspace-key" data-action="backspace">
            ← Retroceso
          </button>
        </div>

        <!-- Row 2: QWERTY -->
        <div class="keyboard-row">
          <button class="keyboard-key special tab-key" data-action="tab">
            ⇥ Tab
          </button>
          ${this._generateKeysHTML(this.keyLayout.row2)}
        </div>

        <!-- Row 3: ASDFGH -->
        <div class="keyboard-row">
          <button class="keyboard-key special caps-key" id="caps-key" data-action="caps">
            ⬆ Bloq Mayús
          </button>
          ${this._generateKeysHTML(this.keyLayout.row3)}
          <button class="keyboard-key special enter-key" data-action="enter">
            ↵ Enter
          </button>
        </div>

        <!-- Row 4: ZXCVBN -->
        <div class="keyboard-row">
          <button class="keyboard-key special shift-key" id="shift-key" data-action="shift">
            ⬆ Mayús
          </button>
          ${this._generateKeysHTML(this.keyLayout.row4)}
          <button class="keyboard-key special shift-key" data-action="shift">
            ⬆ Mayús
          </button>
        </div>

        <!-- Row 5: Space and Controls -->
        <div class="keyboard-row">
          <button class="keyboard-key special altgr-key" id="altgr-key" data-action="altgr">
            AltGr
          </button>
          <button class="keyboard-key space-key" data-key=" ">
            Espacio
          </button>
          <button class="keyboard-key special close-key" data-action="close">
            ✕ Cerrar
          </button>
        </div>
      </div>
    `;
  }

  /**
   * Generar HTML para las teclas
   * @private
   */
  _generateKeysHTML(row) {
    return row.map(keyObj => {
      const label = keyObj.shift 
        ? `<div class="key-label"><span class="key-shift">${keyObj.shift}</span><span class="key-main">${keyObj.label}</span></div>`
        : keyObj.label;
      
      return `
        <button 
          class="keyboard-key" 
          data-key="${keyObj.key}"
          data-shift="${keyObj.shift || ''}"
          data-altgr="${keyObj.altGr || ''}"
          title="${keyObj.shift ? keyObj.shift + ' + ' + keyObj.label : keyObj.label}"
        >
          ${label}
        </button>
      `;
    }).join('');
  }

  /**
   * Adjuntar listeners globales
   * @private
   */
  attachGlobalListeners() {
    document.addEventListener('click', this._handleDocumentClick.bind(this), true);
    
    const keyboard = document.getElementById('virtual-keyboard');
    if (keyboard) {
      keyboard.addEventListener('click', this._handleKeyboardClick.bind(this));
    }
  }

  /**
   * Manejar clicks en el documento
   * @private
   */
  _handleDocumentClick(e) {
    const el = e.target;
    const isTextInput = el.matches('input, textarea, [contenteditable="true"]');
    
    if (isTextInput) {
      this.show(el);
      return;
    }
    
    const keyboard = document.getElementById('virtual-keyboard-container');
    const isClickOnKeyboard = keyboard && keyboard.contains(el);
    
    if (!isClickOnKeyboard && !isTextInput && this.state.isVisible) {
      this.hide();
    }
  }

  /**
   * Manejar clicks en el teclado
   * @private
   */
  _handleKeyboardClick(e) {
    const btn = e.target.closest('.keyboard-key');
    if (btn) {
      this._handleKeyPress(btn);
    }
  }

  /**
   * Manejar presión de tecla
   * @private
   */
  _handleKeyPress(btn) {
    const { action, key } = btn.dataset;

    // Map de acciones especiales
    const actionHandlers = {
      shift: () => this._toggleShift(),
      caps: () => this._toggleCaps(),
      altgr: () => this._toggleAltGr(),
      backspace: () => this._handleBackspace(),
      enter: () => this._handleEnter(),
      tab: () => this._insertText('\t'),
      close: () => this.hide()
    };

    if (action && actionHandlers[action]) {
      actionHandlers[action]();
      return;
    }

    // Insertar carácter normal
    if (key) {
      const charToInsert = this._getCharToInsert(key, btn.dataset);
      this._insertText(charToInsert);
      Logger.logUI('Tecla presionada:', charToInsert);
    }
  }

  /**
   * Obtener carácter a insertar según modificadores
   * @private
   */
  _getCharToInsert(key, dataset) {
    if (this.state.altGr && dataset.altgr) {
      this._resetAltGr();
      return dataset.altgr;
    }
    
    if (this.state.shift || this.state.capsLock) {
      const char = dataset.shift || key;
      if (this.state.shift && !this.state.capsLock) {
        this._resetShift();
      }
      return char;
    }
    
    return key;
  }

  /**
   * Insertar texto en el campo activo usando execCommand o fallback manual
   * @private
   */
  _insertText(text) {
    if (!this.state.activeInput) return;

    try {
      this.state.activeInput.focus();
      
      // Intentar execCommand primero (más compatible con third-party apps)
      if (document.execCommand('insertText', false, text)) {
        Logger.logUI('Texto insertado con execCommand:', text);
        return;
      }
      
      // Fallback: inserción manual
      this._insertTextManually(text);
      this._dispatchInputEvents(text, 'insertText');
      
      Logger.logUI('Texto insertado manualmente:', text);
    } catch (error) {
      Logger.logError('Error en insertText:', error);
    }

    this.state.activeInput.focus();
  }

  /**
   * Inserción manual de texto (fallback)
   * @private
   */
  _insertTextManually(text) {
    const { activeInput } = this.state;
    const start = activeInput.selectionStart;
    const end = activeInput.selectionEnd;
    const currentValue = activeInput.value || activeInput.textContent;
    const newValue = currentValue.substring(0, start) + text + currentValue.substring(end);

    if (activeInput.tagName === 'TEXTAREA' || activeInput.tagName === 'INPUT') {
      activeInput.value = newValue;
      activeInput.selectionStart = activeInput.selectionEnd = start + text.length;
    } else {
      activeInput.textContent = newValue;
    }
  }

  /**
   * Disparar eventos de input para compatibilidad
   * @private
   */
  _dispatchInputEvents(data, inputType) {
    const { activeInput } = this.state;
    
    activeInput.dispatchEvent(new InputEvent('input', { 
      bubbles: true,
      cancelable: false,
      inputType,
      data 
    }));
    
    activeInput.dispatchEvent(new Event('change', { bubbles: true }));
  }

  /**
   * Manejar tecla Enter con compatibilidad third-party
   * @private
   */
  _handleEnter() {
    if (!this.state.activeInput) return;

    try {
      const eventOptions = VirtualKeyboard.EVENT_OPTIONS.ENTER;
      const keydownNotPrevented = this._dispatchKeyboardEvents(eventOptions);

      if (keydownNotPrevented) {
        this._executeEnterAction();
      }

      this.state.activeInput.focus();
    } catch (error) {
      Logger.logError('Error en handleEnter:', error);
      this._handleEnterFallback();
    }
  }

  /**
   * Disparar eventos de teclado (keydown, keypress, keyup)
   * @private
   * @returns {boolean} True si keydown no fue prevenido
   */
  _dispatchKeyboardEvents(eventOptions) {
    const { activeInput } = this.state;
    
    const keydownEvent = new KeyboardEvent('keydown', eventOptions);
    const keypressEvent = new KeyboardEvent('keypress', eventOptions);
    const keyupEvent = new KeyboardEvent('keyup', eventOptions);

    const keydownNotPrevented = activeInput.dispatchEvent(keydownEvent);
    Logger.logUI('Enter keydown disparado, prevented:', !keydownNotPrevented);

    if (keydownNotPrevented) {
      activeInput.dispatchEvent(keypressEvent);
    }

    activeInput.dispatchEvent(keyupEvent);
    return keydownNotPrevented;
  }

  /**
   * Ejecutar acción de Enter según tipo de elemento
   * @private
   */
  _executeEnterAction() {
    const { activeInput } = this.state;
    const tagName = activeInput.tagName;
    const isContentEditable = activeInput.contentEditable === 'true';

    if (tagName === 'TEXTAREA' || isContentEditable) {
      this._handleEnterInTextArea();
    } else if (tagName === 'INPUT') {
      this._handleEnterInInput();
    }
  }

  /**
   * Manejar Enter en textarea o contenteditable
   * @private
   */
  _handleEnterInTextArea() {
    const { activeInput } = this.state;
    
    // Intentar execCommand primero
    if (!document.execCommand('insertLineBreak')) {
      this._insertText('\n');
    }
    
    this._dispatchInputEvents('\n', 'insertLineBreak');
    Logger.logUI('Enter: Nueva línea insertada en', activeInput.tagName);
  }

  /**
   * Manejar Enter en input (submit form)
   * @private
   */
  _handleEnterInInput() {
    const { activeInput } = this.state;
    const form = activeInput.closest('form');
    
    if (form) {
      const submitBtn = form.querySelector('button[type="submit"], input[type="submit"]');
      
      if (submitBtn) {
        submitBtn.click();
        Logger.logUI('Enter: Click en botón submit');
      } else {
        const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
        if (form.dispatchEvent(submitEvent)) {
          form.submit();
        }
        Logger.logUI('Enter: Form submit disparado');
      }
    } else {
      activeInput.dispatchEvent(new Event('change', { bubbles: true }));
      Logger.logUI('Enter: Change event en input sin form');
    }
  }

  /**
   * Fallback para Enter en caso de error
   * @private
   */
  _handleEnterFallback() {
    const { activeInput } = this.state;
    if (activeInput.tagName === 'TEXTAREA' || activeInput.contentEditable === 'true') {
      this._insertText('\n');
    }
  }

  /**
   * Borrar carácter (Backspace)
   * @private
   */
  _handleBackspace() {
    if (!this.state.activeInput) return;

    const { activeInput } = this.state;
    const start = activeInput.selectionStart;
    const end = activeInput.selectionEnd;
    const currentValue = activeInput.value || activeInput.textContent;

    let newValue, newPosition;

    if (start === end && start > 0) {
      newValue = currentValue.substring(0, start - 1) + currentValue.substring(end);
      newPosition = start - 1;
    } else {
      newValue = currentValue.substring(0, start) + currentValue.substring(end);
      newPosition = start;
    }

    this._setInputValue(newValue, newPosition);
    activeInput.dispatchEvent(new Event('input', { bubbles: true }));
    activeInput.focus();
  }

  /**
   * Establecer valor del input y posición del cursor
   * @private
   */
  _setInputValue(value, cursorPosition) {
    const { activeInput } = this.state;
    
    if (activeInput.tagName === 'TEXTAREA' || activeInput.tagName === 'INPUT') {
      activeInput.value = value;
      activeInput.selectionStart = activeInput.selectionEnd = cursorPosition;
    } else {
      activeInput.textContent = value;
    }
  }

  /**
   * Toggle Shift
   * @private
   */
  _toggleShift() {
    this.state.shift = !this.state.shift;
    this._updateKeyboardDisplay();
  }

  /**
   * Reset Shift
   * @private
   */
  _resetShift() {
    this.state.shift = false;
    this._updateKeyboardDisplay();
  }

  /**
   * Toggle Caps Lock
   * @private
   */
  _toggleCaps() {
    this.state.capsLock = !this.state.capsLock;
    this._updateKeyboardDisplay();
  }

  /**
   * Toggle AltGr
   * @private
   */
  _toggleAltGr() {
    this.state.altGr = !this.state.altGr;
    this._updateKeyboardDisplay();
  }

  /**
   * Reset AltGr
   * @private
   */
  _resetAltGr() {
    this.state.altGr = false;
    this._updateKeyboardDisplay();
  }

  /**
   * Actualizar display del teclado según modificadores activos
   * @private
   */
  _updateKeyboardDisplay() {
    const keyboard = document.getElementById('virtual-keyboard');
    if (!keyboard) return;

    // Actualizar display de teclas
    keyboard.querySelectorAll('.keyboard-key[data-key]').forEach(btn => {
      const { key, shift, altgr } = btn.dataset;
      let display = key;

      if (this.state.altGr && altgr) {
        display = altgr;
      } else if (this.state.shift || this.state.capsLock) {
        display = shift || key;
      }

      btn.textContent = display;
    });

    // Actualizar estado visual de modificadores
    this._updateModifierKeys(keyboard);
  }

  /**
   * Actualizar estado visual de teclas modificadoras
   * @private
   */
  _updateModifierKeys(keyboard) {
    const modifiers = {
      '[data-action="shift"]': this.state.shift,
      '#caps-key': this.state.capsLock,
      '#altgr-key': this.state.altGr
    };

    Object.entries(modifiers).forEach(([selector, isActive]) => {
      const btn = keyboard.querySelector(selector);
      if (btn) {
        btn.classList.toggle('active', isActive);
      }
    });
  }

  /**
   * Mostrar teclado para un input específico
   * @param {HTMLElement} input - Elemento de entrada activo
   */
  show(input) {
    this.state.activeInput = input;
    this.state.isVisible = true;
    
    const container = document.getElementById('virtual-keyboard-container');
    if (!container) return;

    container.classList.add('visible');
    document.body.classList.add('keyboard-open');
    
    Logger.logUI('VirtualKeyboard mostrado');
    
    // Scroll hacia el input después de la animación
    setTimeout(() => {
      input.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, VirtualKeyboard.KEYBOARD_CONFIG.ANIMATION_DURATION);
    
    this._emitEvent(EVENTS.MODAL_OPEN, { type: 'virtual-keyboard' });
  }

  /**
   * Ocultar teclado
   */
  hide() {
    this.state.isVisible = false;
    this.state.activeInput = null;
    
    const container = document.getElementById('virtual-keyboard-container');
    if (!container) return;

    container.classList.remove('visible');
    document.body.classList.remove('keyboard-open');
    
    Logger.logUI('VirtualKeyboard ocultado');
    this._emitEvent(EVENTS.MODAL_CLOSE, { type: 'virtual-keyboard' });
  }

  /**
   * Emitir evento a través del EventBus
   * @private
   */
  _emitEvent(eventType, data) {
    if (this.eventBus) {
      this.eventBus.emit(eventType, data);
    }
  }

  /**
   * Toggle visibilidad del teclado
   */
  toggle() {
    if (this.state.isVisible) {
      this.hide();
    } else if (this.state.activeInput) {
      this.show(this.state.activeInput);
    }
  }

  /**
   * Información de debug del estado del teclado
   */
  debugPrint() {
    Logger.log('=== VirtualKeyboard Debug ===');
    Logger.log('Estado:', {
      visible: this.state.isVisible,
      activeInput: this.state.activeInput?.tagName || 'none',
      capsLock: this.state.capsLock,
      shift: this.state.shift,
      altGr: this.state.altGr
    });
  }
}

// Crear instancia global
const virtualKeyboard = new VirtualKeyboard();