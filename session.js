// Session Manager with Inactivity Timeout
// Add this to your content.js or create a new session.js file

class SessionManager {
  constructor(inactivityTimeMinutes = 3, warningBeforeLogoutSeconds = 30) {
    // ⏱️ MAIN CONFIGURATION VARIABLES
    this.inactivityTime = inactivityTimeMinutes * 60 * 1000; // Total time before logout (in milliseconds)
    this.warningTime = warningBeforeLogoutSeconds * 1000; // When to show warning (in milliseconds)
    
    this.inactivityTimer = null;
    this.warningTimer = null;
    this.sessionActive = false;
    this.warningShown = false;
    
    // Track user activity events
    this.activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    
    this.init();
  }

  init() {
    // Check if we should start a session
    const isHCM = window.location.href.includes('egoi.fa.us2.oraclecloud.com');
    const isGCA = window.location.href.includes('gca.paquetexpress.com.mx');
    
    if (isHCM || isGCA) {
      // Check if session already started
      if (!sessionStorage.getItem('session-started')) {
        this.startSession();
      } else {
        this.resumeSession();
      }
    }
  }

  startSession() {
    console.log('🔐 Session started');
    sessionStorage.setItem('session-started', 'true');
    sessionStorage.setItem('session-start-time', Date.now().toString());
    this.sessionActive = true;
    this.attachActivityListeners();
    this.resetInactivityTimer();
  }

  resumeSession() {
    console.log('🔄 Session resumed');
    this.sessionActive = true;
    this.attachActivityListeners();
    this.resetInactivityTimer();
  }

  attachActivityListeners() {
    this.activityEvents.forEach(event => {
      document.addEventListener(event, () => this.onUserActivity(), true);
    });
  }

  onUserActivity() {
    if (!this.sessionActive) return;
    
    // Reset the inactivity timer on any user activity
    this.resetInactivityTimer();
    
    // Hide warning if it was shown
    if (this.warningShown) {
      this.hideInactivityWarning();
    }
  }

  resetInactivityTimer() {
    // Clear existing timers
    if (this.inactivityTimer) clearTimeout(this.inactivityTimer);
    if (this.warningTimer) clearTimeout(this.warningTimer);
    
    this.warningShown = false;
    
    // Show warning X seconds before logout
    this.warningTimer = setTimeout(() => {
      this.showInactivityWarning();
    }, this.inactivityTime - this.warningTime);
    
    // Logout after 3 minutes of inactivity
    this.inactivityTimer = setTimeout(() => {
      this.endSessionDueToInactivity();
    }, this.inactivityTime);
  }

  showInactivityWarning() {
    console.log('⚠️ Showing inactivity warning');
    this.warningShown = true;
    
    // Create overlay
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

    // Create warning modal
    const warning = document.createElement('div');
    warning.id = 'inactivity-warning';
    warning.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      border: 3px solid #ff6b6b;
      border-radius: 12px;
      padding: 30px;
      z-index: 99999;
      max-width: 400px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
      text-align: center;
      font-family: 'Segoe UI', sans-serif;
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

      <h2 style="color: #ff6b6b; margin-bottom: 15px; font-size: 20px;">⏱️ Sesión Inactiva</h2>
      <p style="color: #333; margin-bottom: 20px; font-size: 14px; line-height: 1.5;">Tu sesión se cerrará por inactividad en:</p>
      <div id="timer" style="font-size: 24px; font-weight: bold; color: #ff6b6b; margin: 15px 0;">0:30</div>
      <p style="color: #333; margin-bottom: 20px; font-size: 14px; line-height: 1.5;">¿Deseas continuar activo?</p>
      <div style="display: flex; gap: 10px; justify-content: center; margin-top: 20px;">
        <button id="continue-session" style="padding: 10px 20px; border: none; border-radius: 6px; cursor: pointer; font-weight: 500; background: #667eea; color: white; font-size: 14px; transition: all 0.3s ease;">Continuar</button>
        <button id="force-logout" style="padding: 10px 20px; border: none; border-radius: 6px; cursor: pointer; font-weight: 500; background: #ff6b6b; color: white; font-size: 14px; transition: all 0.3s ease;">Cerrar Sesión</button>
      </div>
    `;

    document.body.appendChild(warning);

    // Update timer every second
    let seconds = Math.floor(this.warningTime / 1000);
    const timerInterval = setInterval(() => {
      seconds--;
      const timerEl = document.getElementById('timer');
      if (timerEl) {
        timerEl.textContent = `0:${seconds.toString().padStart(2, '0')}`;
      }
      if (seconds <= 0) clearInterval(timerInterval);
    }, 1000);

    // Continue session button
    const continueBtn = document.getElementById('continue-session');
    if (continueBtn) {
      continueBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        console.log('✅ Continue button clicked');
        this.hideInactivityWarning();
        this.resetInactivityTimer();
      });
    }

    // Force logout button
    const logoutBtn = document.getElementById('force-logout');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        console.log('🚪 Logout button clicked');
        this.endSession();
      });
    }
  }

  hideInactivityWarning() {
    const warning = document.getElementById('inactivity-warning');
    const overlay = document.getElementById('inactivity-overlay');
    
    if (warning) {
      warning.remove();
    }
    if (overlay) {
      overlay.remove();
    }
  }

  endSessionDueToInactivity() {
    console.log('🚪 Session ended due to inactivity');
    sessionStorage.removeItem('session-started');
    sessionStorage.removeItem('session-start-time');
    this.sessionActive = false;
    
    // Show message before redirecting
    this.showSessionExpiredMessage();
  }

  endSession() {
    console.log('👋 Session ended by user');
    
    const isHCM = window.location.href.includes('egoi');
    const isGCA = window.location.href.includes('gca');
    
    sessionStorage.removeItem('session-started');
    sessionStorage.removeItem('session-start-time');
    this.sessionActive = false;

    if (isHCM) {
      // Perform HCM logout
      const logoutUrl = 'https://egoi.login.us2.oraclecloud.com/fusion_apps/pages/logoutConsent.jsp?logout_done_url=https%3A%2F%2Fegoi.fa.us2.oraclecloud.com%3A443%2FfscmUI%2FadfAuthentication%3F_adf.authenticate%3Dtrue';
      window.location.href = logoutUrl;
    } else if (isGCA) {
      // Perform GCA logout
      window.location.href = 'https://gca.paquetexpress.com.mx/softexpert/selogout';
    }
  }

  showSessionExpiredMessage() {
    const overlay = document.createElement('div');
    overlay.innerHTML = `
      <style>
        .session-expired {
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
          font-family: 'Segoe UI', sans-serif;
        }

        .session-expired h2 {
          color: #ff6b6b;
          margin-bottom: 15px;
        }

        .session-expired p {
          color: #666;
          margin-bottom: 20px;
        }
      </style>

      <div class="session-expired">
        <h2>Sesión Expirada</h2>
        <p>Tu sesión fue cerrada por inactividad. Serás redirigido al menú principal...</p>
      </div>
    `;
    document.body.appendChild(overlay);

    // Redirect after 2 seconds
    setTimeout(() => {
      const extensionId = chrome.runtime.id;
      const menuUrl = `chrome-extension://${extensionId}/index.html`;
      window.location.href = menuUrl;
    }, 2000);
  }

  getSessionTime() {
    const startTime = sessionStorage.getItem('session-start-time');
    if (startTime) {
      return Math.floor((Date.now() - parseInt(startTime)) / 1000);
    }
    return 0;
  }
}

// Initialize session manager when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    // ⚙️ CONFIGURATION
    window.sessionManager = new SessionManager(
      1,   // Total inactivity time in MINUTES (change to desired limit)
      30   // Show warning X seconds BEFORE logout (change to desired warning time)
    );
  });
} else {
  // ⚙️ CONFIGURATION
  window.sessionManager = new SessionManager(
    1,   // Total inactivity time in MINUTES (change to desired limit)
    30   // Show warning X seconds BEFORE logout (change to desired warning time)
  );
}