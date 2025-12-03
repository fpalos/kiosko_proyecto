// Detectar qué plataforma es
const currentUrl = window.location.href;
const isHCM = currentUrl.includes('egoi.fa.us2.oraclecloud.com') || currentUrl.includes('egoi.login.us2.oraclecloud.com');
const isGCA = currentUrl.includes('gca.paquetexpress.com.mx');

// URL del menú principal - construir dinámicamente
const extensionId = chrome.runtime.id;
const MENU_URL = `chrome-extension://${extensionId}/index.html`;

// Esperar a que el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', inicializar);
} else {
  inicializar();
}

function inicializar() {
  // Detectar si estamos en página de confirmación de logout de HCM
  if (currentUrl.includes('logoutConsent.jsp')) {
    // Marcar que estamos en proceso de logout
    sessionStorage.setItem('hcm-en-logout', 'true');
    
    setTimeout(() => {
      const confirmBtn = document.getElementById('Confirm');
      if (confirmBtn) {
        // Si tiene logoutId, es el segundo paso - hacer click final
        if (currentUrl.includes('logoutId=')) {
          confirmBtn.click();
          console.log('Segundo click en HCM, logout en proceso...');
        } else {
          // Si NO tiene logoutId, es el primer paso - hacer primer click
          confirmBtn.click();
          console.log('Primer click en HCM...');
        }
      }
    }, 1000);
  }
  
  // Detectar si HCM nos redirigió al login DESPUÉS del logout (solo si marcamos en logout)
  if (currentUrl.includes('egoi.login.us2.oraclecloud.com/oam/server/obrareq.cgi') && 
      sessionStorage.getItem('hcm-en-logout') === 'true') {
    console.log('Detectado: HCM login después de logout, redirigiendo al menú...');
    sessionStorage.removeItem('hcm-en-logout');
    setTimeout(() => {
      redirigirYCerrarPestaña();
    }, 500);
  }
  
  // Detectar si HCM requiere autenticación DESPUÉS del logout
  if (currentUrl.includes('egoi.fa.us2.oraclecloud.com/fscmUI/adfAuthentication') && 
      sessionStorage.getItem('hcm-en-logout') === 'true') {
    console.log('Detectado: HCM requiere autenticación después de logout, redirigiendo al menú...');
    sessionStorage.removeItem('hcm-en-logout');
    setTimeout(() => {
      redirigirYCerrarPestaña();
    }, 500);
  }
  
  // Detectar si estamos en página de logout de GCA y redirigir al menú
  if (currentUrl.includes('gca.paquetexpress.com.mx/softexpert/selogout')) {
    setTimeout(() => {
      redirigirYCerrarPestaña();
    }, 1500);
  }
  
  // Solo mostrar la top bar en HCM o GCA
  if (isHCM || isGCA) {
    crearTopBar();
  }
}

function cerrarSesion() {
  let logoutUrl = '';
  
  if (currentUrl.includes('egoi')) {
    // HCM logout
    logoutUrl = 'https://egoi.login.us2.oraclecloud.com/fusion_apps/pages/logoutConsent.jsp?logout_done_url=https%3A%2F%2Fegoi.fa.us2.oraclecloud.com%3A443%2FfscmUI%2FadfAuthentication%3F_adf.authenticate%3Dtrue';
    window.location.href = logoutUrl;
  } else if (currentUrl.includes('gca')) {
    // GCA logout
    logoutUrl = 'https://gca.paquetexpress.com.mx/softexpert/selogout';
    window.location.href = logoutUrl;
  }
}

function irAlInicio() {
  // Si estamos en HCM
  if (currentUrl.includes('egoi')) {
    // Detectar si estamos en login o en la plataforma
    if (currentUrl.includes('login') || currentUrl.includes('logoutConsent')) {
      // Estamos en login, solo redirigir
      redirigirYCerrarPestaña();
    } else {
      // Estamos logueado en HCM, hacer logout primero
      cerrarSesion();
    }
  } 
  // Si estamos en GCA
  else if (currentUrl.includes('gca')) {
    // Detectar si estamos en login
    if (currentUrl.includes('/login')) {
      // Estamos en login, solo redirigir
      redirigirYCerrarPestaña();
    } else {
      // Estamos logueado en GCA, hacer logout primero
      cerrarSesion();
    }
  }
  // Si estamos en el menú principal, no hacer nada
  else if (isMenuPrincipal) {
    // Ya estamos en el menú, no hacer nada
    return;
  }
}

function redirigirYCerrarPestaña() {
  // Marcar que vamos a cerrar pestaña después de redirigir
  sessionStorage.setItem('cerrar-pestaña-después', 'true');
  // Redirigir a la URL del menú en la misma pestaña
  window.location.href = MENU_URL;
}

function cerrarPestañaDespuésDeRedirigir() {
  // Si marcamos que cerremos pestaña después de redirigir
  if (sessionStorage.getItem('cerrar-pestaña-después') === 'true') {
    sessionStorage.removeItem('cerrar-pestaña-después');
    // Esperar un momento y luego cerrar la pestaña
    setTimeout(() => {
      // Intentar cerrar usando diferentes métodos
      try {
        window.close();
      } catch (e) {
        // Si window.close() no funciona, ignorar
        console.log('No se pudo cerrar la pestaña automáticamente');
      }
    }, 500);
  }
}

function crearTopBar() {
  // Crear contenedor de la top bar
  const topBar = document.createElement('div');
  topBar.id = 'ext-top-bar';
  topBar.innerHTML = `
    <style>
      #ext-top-bar {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        height: 60px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 20px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 10000;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
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
        font-size: 14px;
        font-weight: 500;
        transition: all 0.3s ease;
        backdrop-filter: blur(10px);
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
        font-size: 16px;
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
        z-index: 10001;
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
      }

      #faq-content .header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
        color: #333;
        margin-bottom: 8px;
        cursor: pointer;
        display: flex;
        align-items: center;
      }

      .faq-item .question::before {
        content: '▶';
        margin-right: 10px;
        transition: transform 0.3s;
      }

      .faq-item.open .question::before {
        transform: rotate(90deg);
      }

      .faq-item .answer {
        display: none;
        color: #666;
        font-size: 14px;
        line-height: 1.6;
        margin-left: 20px;
        padding: 10px;
        background: #f5f5f5;
        border-radius: 6px;
      }

      .faq-item.open .answer {
        display: block;
      }
    </style>

    <div class="left-section">
      <div class="logo-text">🔗 Navegador</div>
      <button id="btn-inicio">🏠 Inicio</button>
      <button id="btn-cerrar">🔒 Cerrar Sesión</button>
      <button id="btn-faq">❓ FAQ</button>
    </div>
  `;

  document.body.appendChild(topBar);

  // Agregar modal de FAQ
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
          <div class="answer">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</div>
        </div>
        <div class="faq-item">
          <div class="question">¿Cómo uso GCA?</div>
          <div class="answer">Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</div>
        </div>
        <div class="faq-item">
          <div class="question">¿Cómo cierro mi sesión?</div>
          <div class="answer">Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</div>
        </div>
        <div class="faq-item">
          <div class="question">¿Qué hago si olvido mi contraseña?</div>
          <div class="answer">Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</div>
        </div>
        <div class="faq-item">
          <div class="question">¿Cómo navego entre plataformas?</div>
          <div class="answer">Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.</div>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(faqModal);

  // Ajustar el body para que no quede detrás de la top bar
  document.body.style.paddingTop = '60px';

  // Event listeners
  const btnInicio = document.getElementById('btn-inicio');
  const btnCerrar = document.getElementById('btn-cerrar');
  const btnFaq = document.getElementById('btn-faq');

  console.log('Botones encontrados:', { btnInicio, btnCerrar, btnFaq });

  if (btnInicio) {
    btnInicio.addEventListener('click', () => {
      console.log('Click en Inicio');
      irAlInicio();
    });
  }

  if (btnCerrar) {
    btnCerrar.addEventListener('click', () => {
      console.log('Click en Cerrar Sesión');
      cerrarSesion();
    });
  }

  if (btnFaq) {
    btnFaq.addEventListener('click', () => {
      console.log('Click en FAQ');
      document.getElementById('faq-modal').classList.add('active');
    });
  }

  // Cerrar modal
  const closeBtn = document.querySelector('#faq-content .close-btn');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      document.getElementById('faq-modal').classList.remove('active');
    });
  }

  // Cerrar modal al hacer click fuera
  const modalElement = document.getElementById('faq-modal');
  if (modalElement) {
    modalElement.addEventListener('click', (e) => {
      if (e.target.id === 'faq-modal') {
        document.getElementById('faq-modal').classList.remove('active');
      }
    });
  }

  // Abrir/cerrar items del FAQ
  document.querySelectorAll('.faq-item .question').forEach(question => {
    question.addEventListener('click', function() {
      this.parentElement.classList.toggle('open');
    });
  });
}