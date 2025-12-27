# 🎯 Kiosco - Extensión de Chrome para Navegación de Plataformas

Una extensión de Chrome moderna y escalable que proporciona navegación centralizada, gestión de sesiones y funcionalidades mejoradas para acceder a sistemas empresariales (HCM y GCA).

## ✨ Características

- 🔐 **Gestión de Sesiones Automática** - Cierre de sesión automático después de 3 minutos de inactividad
- ⏱️ **Advertencia de Inactividad** - Modal de advertencia 30 segundos antes del cierre
- 📋 **Barra de Navegación Superior** - Acceso rápido a inicio, logout y FAQ
- 🔄 **Navegación entre Plataformas** - Cambio fluido entre HCM y GCA
- 🎨 **Interfaz Moderna** - Diseño limpio y responsivo con animaciones suaves
- 🏗️ **Arquitectura Escalable** - Estructura modular lista para futuras expansiones
- 📡 **Sistema de Eventos Global** - Comunicación desacoplada entre módulos
- 🔧 **Configuración Centralizada** - Un único archivo para todas las configuraciones

## 📦 Requisitos

- Chrome 88 o superior
- Acceso a los sistemas HCM y GCA

## 🚀 Instalación

### Carga Manual en Chrome

1. Clona o descarga el repositorio
2. Abre Chrome y ve a `chrome://extensions/`
3. Activa el "Modo de desarrollador" (esquina superior derecha)
4. Haz clic en "Cargar extensión sin empaquetar"
5. Selecciona la carpeta de la extensión
6. ¡Listo! La extensión está instalada

### Estructura de Carpetas

```
kioskoExtension/
├── manifest.json                 # Configuración de Chrome
├── index.html                    # Página del menú principal
├── index.js                      # Script del menú principal
├── kioskoAppLogo.png            # Icono de la extensión
├── assets/                       # Recursos visuales
│   ├── recurso9.svg
│   ├── hcm_logo_blanco.png
│   ├── GCA-Icono SVG.svg
│   ├── bonos.png
│   ├── nomina.png
│   ├── permisos.png
│   ├── vacaciones.png
│   ├── procedimientos.png
│   └── formatos.png
├── js/
│   ├── config/
│   │   └── app.config.js        # Configuración centralizada
│   ├── core/
│   │   ├── EventBus.js          # Sistema de eventos Pub/Sub
│   │   └── SessionManager.js    # Gestión de sesiones
│   ├── services/
│   │   ├── PlatformService.js   # Gestión de plataformas
│   │   └── NavigationService.js # Lógica de navegación
│   ├── ui/
│   │   ├── TopBar.js            # Barra superior
│   │   └── Modal.js             # Componente modal reutilizable
│   ├── utils/
│   │   ├── logger.js            # Logging centralizado
│   │   └── helpers.js           # Funciones auxiliares
│   └── content.js               # Orquestador principal
└── README.md
```

## 📚 Descripción de Archivos

### Configuración

**`js/config/app.config.js`**
- Centraliza TODA la configuración de la extensión
- Define tiempos de sesión, colores, mensajes, features
- Punto único de verdad para configuraciones

### Core (Núcleo)

**`js/core/EventBus.js`**
- Sistema global de eventos Pub/Sub
- Permite comunicación desacoplada entre módulos
- Eventos disponibles: SESSION_START, SESSION_WARN, SESSION_END, ACTIVITY_DETECTED, etc.

**`js/core/SessionManager.js`**
- Gestiona sesiones y timeout de inactividad
- Detecta actividad del usuario
- Muestra advertencias y cierra sesiones automáticamente

### Servicios (Lógica de Negocio)

**`js/services/PlatformService.js`**
- Detecta plataforma actual por URL
- Gestiona URLs y features de cada plataforma
- Facilita agregar nuevas plataformas

**`js/services/NavigationService.js`**
- Maneja navegación entre plataformas
- Controla redirecciones y logout
- Gestiona cierre de pestañas

### UI (Interfaz Visual)

**`js/ui/TopBar.js`**
- Barra superior visible en HCM y GCA
- Botones: Inicio, Cerrar Sesión, FAQ
- Modal interactivo de preguntas frecuentes

**`js/ui/Modal.js`**
- Componente modal reutilizable
- Soporta diferentes tipos: info, warning, error, success
- Botones y acciones personalizables

### Utilidades

**`js/utils/logger.js`**
- Logging centralizado respetando configuración de debug
- Métodos específicos: logSession, logEvent, logUI
- Facilita debugging sin escribir console.log

**`js/utils/helpers.js`**
- Funciones auxiliares reutilizables
- Includes: delay, debounce, formatTime, copyToClipboard, etc.

### Entrada

**`js/content.js`**
- Orquestador principal para HCM y GCA
- Inicializa todos los módulos
- Maneja redirecciones post-logout

**`index.js`**
- Script para la página del menú principal
- Maneja clicks en tarjetas de plataformas

**`index.html`**
- Página de menú principal
- Contiene tarjetas interactivas para HCM y GCA

## ⚙️ Configuración

### Cambiar Tiempo de Timeout

Edita `js/config/app.config.js`:

```javascript
SESSION: {
  TIMEOUT_MINUTES: 3,        // Cambiar a 5 para 5 minutos
  WARNING_SECONDS: 30,       // Cambiar a 60 para 1 minuto
  ACTIVITY_EVENTS: [...]
}
```

### Cambiar Colores

```javascript
UI: {
  COLORS: {
    PRIMARY: '#667eea',
    DANGER: '#ff6b6b',
    // ... más colores
  }
}
```

### Habilitar/Desabilitar Features

```javascript
FEATURES: {
  SESSION_TIMEOUT: true,
  TOP_BAR: true,
  FAQ: true,
  ACTIVITY_TRACKING: true
}
```

### Debug

```javascript
DEBUG: {
  LOGS_ENABLED: true,        // Habilita todos los logs
  LOG_EVENTS: true,          // Logs de eventos
  LOG_SESSION: true,         // Logs de sesión
  LOG_UI: false              // Logs de UI
}
```

## 🔄 Flujo de Funcionamiento

```
┌─────────────────────────────────────────────┐
│  Usuario abre HCM o GCA                     │
└────────────────┬────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────┐
│  content.js se ejecuta (inyectado por Chrome)│
└────────────────┬────────────────────────────┘
                 │
        ┌────────┴────────┬────────────┬─────────┐
        ▼                 ▼            ▼         ▼
┌──────────────┐  ┌─────────────┐ ┌─────────┐ ┌────────┐
│ Detecta      │  │ Inicializa  │ │ Crea    │ │ Configura │
│ plataforma   │  │ SessionMgr  │ │ TopBar  │ │ listeners │
└──────────────┘  └─────────────┘ └─────────┘ └────────┘
                 │
                 ▼
┌──────────────────────────────────────────────┐
│  SessionManager comienza a contar inactividad│
└────────────────┬─────────────────────────────┘
                 │
         ┌───────┴────────┐
         ▼                ▼
    ¿Actividad?    ¿3 minutos?
         │                │
        SÍ               NO
         │                │
    Resetea timer    Muestra warning
         │            (30 segundos)
         │                │
         │        ┌───────┴──────┐
         │        ▼              ▼
         │   ¿Click?        Timeout
         │        │              │
         │       SÍ              NO
         │        │              │
         │   Continúa        Cierra
         │   sesión          sesión
         │        │              │
         └────────┴──────────────┘
                 │
                 ▼
           (Vuelve al inicio)
```

## 📡 Sistema de Eventos

### Eventos Disponibles

```javascript
// Sesión
EVENTS.SESSION_START              // Sesión iniciada
EVENTS.SESSION_RESUME             // Sesión reanudada
EVENTS.SESSION_WARN               // Warning de inactividad
EVENTS.SESSION_END                // Sesión terminada
EVENTS.SESSION_INACTIVITY_TIMEOUT // Timeout por inactividad

// Actividad
EVENTS.ACTIVITY_DETECTED          // Actividad del usuario

// TopBar
EVENTS.TOPBAR_SHOW                // TopBar mostrado
EVENTS.TOPBAR_HIDE                // TopBar oculto

// Modal
EVENTS.MODAL_OPEN                 // Modal abierto
EVENTS.MODAL_CLOSE                // Modal cerrado

// Plataforma
EVENTS.PLATFORM_DETECTED          // Plataforma detectada
EVENTS.PLATFORM_CHANGED           // Plataforma cambió

// Navegación
EVENTS.NAVIGATION_START            // Navegación iniciada
EVENTS.NAVIGATION_COMPLETE         // Navegación completada

// Errores
EVENTS.ERROR_OCCURRED             // Error ocurrió
```

### Suscribirse a Eventos

```javascript
eventBus.on(EVENTS.SESSION_WARN, (data) => {
  console.log('¡Sesión a punto de expirar!');
});

eventBus.once(EVENTS.SESSION_END, (data) => {
  console.log('Sesión terminada');
});
```

## 🐛 Debugging

### Habilitar Logs Completos

En la consola de Chrome (F12):

```javascript
AppConfig.DEBUG.LOGS_ENABLED = true;
```

### Comandos de Debug Útiles

```javascript
// Ver información de plataformas
platformService.debugPrint();

// Ver información de sesión
sessionManager.debugPrint();

// Ver eventos registrados
eventBus.debugPrintEvents();
eventBus.debugPrintHistory();

// Ver información general
Helpers.debugInfo();
```

## 📈 Escalabilidad y Futuras Features

Esta arquitectura está diseñada para crecer fácilmente:

### Agregar Nueva Plataforma

```javascript
// En PlatformService.js
platformService.addPlatform('newPlatform', {
  name: 'Nueva Plataforma',
  domains: ['newplatform.com'],
  urls: { home: '...', logout: '...' },
  features: ['feature1', 'feature2']
});
```

### Agregar Nueva Feature

1. Crear nuevo servicio en `js/services/`
2. Emitir eventos relevantes
3. Otros módulos se suscriben y reaccionan

### Agregar Nuevas Configuraciones

```javascript
// En app.config.js
CUSTOM: {
  myNewFeature: 'value'
}
```

## 🔐 Seguridad

- ✅ Cierre automático de sesión por inactividad
- ✅ Sin almacenamiento de credenciales
- ✅ Comunicación solo a dominios autorizados
- ✅ Scripts inyectados solo en plataformas específicas

## 📝 Changelog

### v1.0.1
- ✨ Arquitectura modular refactorizada
- ✨ Sistema de eventos global (EventBus)
- ✨ Servicios y componentes UI reutilizables
- 🐛 Mejoras en manejo de errores
- 🐛 Fixes en gestión de dependencias

### v1.0.0
- 🎉 Versión inicial
- ✨ Session timeout
- ✨ TopBar con navegación
- ✨ Soporte HCM y GCA

## 🤝 Contribución

Para contribuir al proyecto:

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### Guías de Desarrollo

- Mantén la estructura modular
- Usa `Logger` en lugar de `console.log`
- Emite eventos relevantes cuando algo importante sucede
- Documenta funciones públicas
- Sigue las convenciones de nombres existentes

## 📄 Licencia

Este proyecto está bajo licencia MIT. Ver archivo `LICENSE` para más detalles.

## 👥 Autores

- Desarrollado como extensión moderna para gestión de sesiones
- Arquitectura diseñada para escalabilidad

## 📞 Soporte

Para reportar bugs o sugerir features:
- Abre un Issue en el repositorio
- Incluye pasos para reproducir el problema
- Adjunta screenshots o logs si es posible

## 🎯 Roadmap

- [ ] Autenticación mejorada
- [ ] Integración con SSO
- [ ] Dashboard de actividad
- [ ] Exportar logs
- [ ] Modo offline
- [ ] Sincronización entre pestañas
- [ ] Notificaciones push
- [ ] Analytics avanzado

## 💡 Tips

### Para Desarrolladores

1. **Entiende el flujo:** Lee `js/content.js` primero
2. **Usa EventBus:** Para comunicación entre módulos
3. **Centraliza config:** Todos los valores en `app.config.js`
4. **Debug en consola:** Los logs están habilitados por defecto

### Para Usuarios

1. **La sesión se cierra automáticamente:** Por seguridad
2. **Verás un warning 30 segundos antes:** Para poder continuar
3. **El FAQ está siempre disponible:** Usa el botón en la barra superior
4. **Puedes cambiar de plataforma:** Usa el botón Inicio

---

**Made with ❤️ for better platform navigation**