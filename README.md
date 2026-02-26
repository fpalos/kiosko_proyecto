# � Módulos de Atención Digital - Menú de Acceso

**User Story #133093** | [Ver en TargetProcess](https://ptxit.tpondemand.com/entity/133093-desarrollo-or-implementacion-or-proyecto-kiosko)

Sistema automatizado de kiosco empresarial con extensión Chrome en modo pantalla completa, gestión inteligente de sesiones y actualización automática para facilitar el acceso de colaboradores a plataformas HCM y GCA de forma segura y controlada.

---

## 📋 Tabla de Contenidos

- [¿Qué es este proyecto?](#-qué-es-este-proyecto)
- [¿Por qué existe?](#-por-qué-existe)
- [Características Principales](#-características-principales)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación y Configuración](#-instalación-y-configuración)
- [Arquitectura del Proyecto](#-arquitectura-del-proyecto)
- [Configuración Avanzada](#-configuración-avanzada)
- [Mantenimiento y Actualizaciones](#-mantenimiento-y-actualizaciones)

---

## 🎯 ¿Qué es este proyecto?

### Descripción General

Este proyecto es una **solución integral de kiosko empresarial** diseñada para dispositivos dedicados que facilita el acceso seguro y controlado a sistemas internos de la empresa. Consta de tres componentes principales:

#### 1. **Interfaz de Usuario Optimizada**
El proyecto brinda una interfaz de usuario moderna e intuitiva para navegar en las plataformas **HCM** (Human Capital Management) y **GCA** (Gestión de Colaboradores y Administración), facilitando al usuario final el acceso a información crítica como:
- 📅 Consulta de vacaciones y días disponibles
- 💰 Bonos y compensaciones
- 📄 Documentación personal (nóminas, recibos)
- 📋 Formatos y procedimientos empresariales
- ✉️ Gestión de permisos y solicitudes

#### 2. **Extensión Chrome en Modo Kiosko**
Se implementa una **extensión para navegador base Chromium** que permite navegar en modo kiosko de manera segura sobre estas plataformas, logrado mediante:
- 🔒 Controles compensatorios a nivel sistema operativo
- 🌐 Restricciones y optimizaciones a nivel navegador web
- 🛡️ Políticas de seguridad para prevenir uso indebido
- 📱 Interfaz fullscreen sin acceso a funciones externas del SO

#### 3. **Sistema de Automatización y Versionamiento**
Se implementan **sistemas de actualización automática** basados en GitHub Releases para:
- 🔄 Distribución automática de actualizaciones
- 📦 Mantenimiento centralizado de **n cantidad** de dispositivos kiosko
- 🚀 Despliegue remoto sin intervención manual
- 📊 Gestión de versiones y rollback cuando sea necesario

---

## 💡 ¿Por qué existe?

### Justificación y Problema que Resuelve

Este proyecto nace del **SRS: Módulos de Atención Digital - Menú de Acceso** que identifica una necesidad crítica en la operación de los kioscos empresariales:

> **Situación Actual:**
> 
> Actualmente los Kioscos funcionan con una versión de Windows 10, la cual, si bien cuenta con un diseño enfocado en un entorno de "Escritorio", no está optimizada para atender las necesidades específicas de este proyecto por su estructura y distribución, ocasionando que el usuario promedio presente dudas al intentar acceder a los sistemas internos por este medio y tienda a querer utilizar el equipo de la misma manera que una computadora convencional.

### Beneficios Logrados

Con este proyecto se logra:

✅ **Aplicación optimizada de usuario final** para atender las necesidades del SRS  
✅ **Control centralizado** de las aplicaciones internas: HCM & GCA  
✅ **Control de hardware y software específico** para modo Kiosko  
✅ **Control de seguridad de integridad** en las sesiones de usuario  
✅ **Reducción de confusión** para usuarios no técnicos  
✅ **Prevención de uso inadecuado** del hardware empresarial  
✅ **Mantenimiento simplificado** a través de actualizaciones automáticas

---

## ✨ Características Principales

### 1. 🔐 Control Automático de Sesiones

Sistema inteligente de gestión de sesiones con cierre automático por inactividad para garantizar la seguridad de los datos:

- **Timeout Configurable**: Cierre automático después de 3 minutos de inactividad (configurable)
- **Advertencia Proactiva**: Modal de advertencia 30 segundos antes del cierre automático
- **Detección de Actividad**: Monitoreo continuo de interacciones del usuario (clicks, movimientos, teclado)
- **Cierre de Sesión Inteligente**: Redirección automática a logout de plataforma al detectar inactividad
- **Prevención de Sesiones Abiertas**: Protege información sensible cuando el usuario se aleja del kiosko
- **Historial de Sesiones**: Registro de eventos de sesión para auditoría

**Beneficio**: Garantiza que ningún usuario deje información sensible expuesta en un kiosko compartido, cumpliendo con políticas de seguridad empresarial.

### 2. 🎨 Interfaz Estética y Optimizada

Diseño moderno centrado en la experiencia del usuario final con énfasis en simplicidad y accesibilidad:

- **Diseño Limpio y Minimalista**: Sin elementos que distraigan o confundan al usuario
- **Navegación Intuitiva**: Menú principal con tarjetas grandes y visuales para HCM y GCA
- **Barra Superior Contextual**: Acceso rápido a inicio, logout y preguntas frecuentes
- **Animaciones Suaves**: Transiciones fluidas que guían al usuario
- **Responsivo y Adaptable**: Se ajusta a diferentes resoluciones de pantalla táctil
- **Iconografía Clara**: Uso de íconos universales para facilitar comprensión
- **FAQ Integrado**: Sistema de preguntas frecuentes accesible desde cualquier pantalla
- **Colores Corporativos**: Identidad visual alineada con branding empresarial

**Beneficio**: Reduce la curva de aprendizaje a cero, permitiendo que cualquier colaborador use el kiosko sin capacitación previa.

### 3. 📊 Control de Monitoreo de Aplicación

Sistema de logging centralizado y eventos para debugging, análisis de uso y detección de problemas:

- **Logging Estructurado**: Sistema de logs categorizados (sesión, eventos, UI, errores)
- **EventBus Global**: Sistema pub/sub que registra todos los eventos de la aplicación
- **Niveles de Debug**: Configuración granular de qué logs mostrar (INFO, SUCCESS, WARNING, ERROR)
- **Historial de Eventos**: Seguimiento cronológico de acciones del usuario y del sistema
- **Tracking de Actividad**: Monitoreo de patrones de uso y comportamiento
- **Detección de Errores**: Captura automática de excepciones y errores JavaScript
- **Comandos de Diagnóstico**: Funciones debug accesibles desde consola del navegador
- **Performance Monitoring**: Medición de tiempos de carga y respuesta

**Beneficio**: Permite identificar y resolver problemas rápidamente, optimizar la experiencia y tomar decisiones basadas en datos de uso real.

### 4. 🔄 Actualizaciones Automáticas

Sistema robusto de actualización basado en GitHub Releases con despliegue desatendido:

- **Verificación Automática**: Chequeo de nuevas versiones al iniciar la aplicación
- **Descarga Inteligente**: Descarga de ZIPs desde GitHub Releases usando autenticación
- **Instalación Transparente**: Extracción y actualización sin intervención del usuario
- **Gestión de Versiones**: Archivo `version.txt` para tracking de versión instalada
- **Rollback Automático**: Mantiene versión anterior como respaldo en caso de fallo
- **Reintentos y Resiliencia**: Manejo de errores de red con reintentos automáticos
- **Logs Detallados**: Registro completo del proceso de actualización para diagnóstico
- **Deploy Centralizado**: Actualizar **todos los kioscos** publicando un nuevo Release en GitHub
- **Sin Downtime**: Aplicación sigue funcionando mientras descarga actualizaciones en segundo plano

**Beneficio**: Mantenimiento centralizado sin necesidad de visitar físicamente cada kiosko, ahorrando tiempo y recursos de soporte.

---

## 📦 Requisitos Previos

### Conectividad de Red

El dispositivo kiosko debe tener conexión hacia los siguientes sitios en red pública:

| Servicio | Dominio | Propósito |
|----------|---------|-----------|
| **GitHub** | `github.com` | Descarga de actualizaciones y releases |
| **HCM** | `egoi.fa.us2.oraclecloud.com` | Plataforma Oracle HCM |
| **GCA** | `gca.paquetexpress.com.mx` | Plataforma de gestión colaboradores |
| **Microsoft SharePoint** | `*.sharepoint.com` | Recursos y documentación |

### Recursos Requeridos

#### Chromium Portable (chrome-win)

Se requiere una versión portable de Chromium que se descarga del repositorio de SharePoint:

📥 **Link de descarga**: [Kiosko - SharePoint](https://paquetexpress1-my.sharepoint.com/:f:/g/personal/fpalos_paquetexpress_com_mx/IgCe-NowzjTuT7HqadgJnZKVAT7lFDeTXwyZkJMD4Y93cTg?e=KraoPC)

📎 **Link directo ZIP**: [chrome-win.zip](https://paquetexpress1-my.sharepoint.com/:u:/g/personal/fpalos_paquetexpress_com_mx/IQBivsC5ROifQrVs9CPrfJRzATPuoKYkKAEVEAFQozFw8fo?e=Mztwll)

**Permisos actuales**: `sbatiz@paquetexpress.com.mx`

⚠️ **Nota importante**: El link es accesible para todo el dominio `@paquetexpress.com.mx` de Microsoft 365.

---

## 🚀 Instalación y Configuración

La instalación debe realizarse dentro del **usuario destinado** a la implementación del aplicativo Kiosko. El proceso consta de 4 pasos principales más una prueba de despliegue.

### 📂 Paso 1: Descargar y Ubicar chrome-win

1. Descargar el archivo `chrome-win.zip` desde SharePoint
2. Descomprimir la carpeta completa
3. Ubicarla en la **raíz del perfil del usuario**

**Ejemplo de ruta correcta**:
```
C:\Users\usuario_kiosko\chrome-win\
```

⚠️ **IMPORTANTE - Verificar estructura después de descomprimir**:

```
✅ CORRECTO:
C:\Users\usuario_kiosko\chrome-win\chrome.exe
C:\Users\usuario_kiosko\chrome-win\kiosko_extension\
C:\Users\usuario_kiosko\chrome-win\... (otros archivos)

❌ INCORRECTO (carpeta duplicada):
C:\Users\usuario_kiosko\chrome-win\chrome-win\chrome.exe
```

Si la carpeta queda duplicada, mover el contenido de la carpeta interna una nivel arriba.

### ⚙️ Paso 2A: Activar Ejecución de Scripts

Antes de ejecutar cualquier script de PowerShell, es necesario habilitar la ejecución de scripts en el sistema.

**Ejecutar en PowerShell con permisos de Administrador**:

```powershell
Set-ExecutionPolicy RemoteSigned -Scope LocalMachine
```

**¿Qué hace este comando?**
- Permite ejecutar scripts firmados remotamente y scripts locales sin firmar
- Scope `LocalMachine` aplica la política a todos los usuarios de la máquina
- Es necesario para que los scripts de automatización puedan funcionar

### 🔑 Paso 2B: Configurar Autenticación de GitHub

Para que el sistema de actualizaciones automáticas funcione, se requiere configurar un token de autenticación de GitHub (ya que el repositorio es privado).

**Ejecutar comando de PowerShell con permisos de Administrador**:

📄 **Obtener el comando desde**: [github_key.txt](https://paquetexpress1-my.sharepoint.com/:t:/r/personal/fpalos_paquetexpress_com_mx/Documents/Proyectos/Kiosko/github_key.txt?csf=1&web=1&e=pGZo3t)  
*(Solo personal autorizado tiene acceso)*

El comando tiene el siguiente formato:
```powershell
[System.Environment]::SetEnvironmentVariable("GITHUB_TOKEN","<token_secreto>","User")
```

**Copiar y pegar el comando completo** desde el archivo `github_key.txt` en la consola de PowerShell.

**Validar que se configuró correctamente**:
```powershell
$env:GITHUB_TOKEN
```

Debería mostrar el token configurado. Si no muestra nada, repetir el paso anterior.

### 🛠️ Paso 2C: Implementar Políticas y Tareas Programadas

Este script configura el entorno del sistema operativo para funcionar como kiosko, incluyendo:
- Creación de tareas programadas de Windows
- Configuración de políticas de sistema
- Preparación del entorno de ejecución automática

**Ejecutar en PowerShell con permisos de Administrador**:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "$env:USERPROFILE\chrome-win\kiosko_extension\automation\starter.ps1"
```

**¿Qué hace este script?**
- Crea tarea programada que se ejecuta al iniciar sesión del usuario
- Configura políticas de ejecución persistentes
- Establece el launcher como aplicación de inicio automático

### 🚀 Paso 2D: Desplegar Aplicación Kiosko

Este es el script principal que lanza el kiosko en modo pantalla completa.

**Ejecutar en PowerShell (NO requiere permisos de Administrador)**:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "$env:USERPROFILE\chrome-win\kiosko_extension\automation\launcher.ps1"
```

**¿Qué hace este script?**
- Ejecuta el script `autoUpdate.ps1` para verificar y aplicar actualizaciones
- Verifica que todos los archivos de la extensión estén presentes
- Cierra cualquier instancia previa de Chrome
- Lanza Chrome en modo kiosko con la extensión cargada
- Abre la página principal del menú de plataformas

**Validación de instalación exitosa**:
✅ La aplicación se despliega en **modo fullscreen** (pantalla completa)  
✅ Se muestra el menú principal con las tarjetas de HCM y GCA  
✅ La barra superior está visible con botones de navegación  
✅ No hay barras de herramientas ni opciones de Chrome visibles

---

## 🏗️ Arquitectura del Proyecto

### Estructura de Directorios

```
C:\Users\usuario_kiosko\chrome-win\
├── chrome.exe                              # Navegador Chromium portable
├── kiosko_extension/                       # Extensión de Chrome (repositorio Git)
│   ├── manifest.json                       # Manifiesto de la extensión
│   ├── version.txt                         # Archivo de versión actual
│   ├── index.html                          # Página principal del menú
│   ├── script.js                           # Script de index.html
│   ├── kioskoAppLogo.png                   # Logo de la aplicación
│   │
│   ├── assets/                             # Recursos visuales
│   │   ├── recurso9.svg
│   │   ├── hcm_logo_blanco.png
│   │   ├── GCA-Icono SVG.svg
│   │   ├── bonos.png
│   │   ├── nomina.png
│   │   ├── permisos.png
│   │   ├── vacaciones.png
│   │   ├── procedimientos.png
│   │   └── formatos.png
│   │
│   ├── automation/                         # Scripts de automatización
│   │   ├── autoUpdate.ps1                  # Script principal de actualización
│   │   ├── launcher.ps1                    # Lanzador de la aplicación
│   │   ├── starter.ps1                     # Configuración de inicio automático
│   │   └── silentLauncher.vbs              # Launcher silencioso (sin ventana)
│   │
│   └── js/                                 # Código JavaScript de la extensión
│       ├── content.js                      # Content script principal
│       │
│       ├── config/
│       │   └── app.config.js               # Configuración centralizada
│       │
│       ├── core/
│       │   ├── EventBus.js                 # Sistema pub/sub de eventos
│       │   └── SessionManager.js           # Gestión de sesiones y timeout
│       │
│       ├── services/
│       │   ├── PlatformService.js          # Gestión de plataformas (HCM/GCA)
│       │   └── NavigationService.js        # Lógica de navegación
│       │
│       ├── ui/
│       │   ├── TopBar.js                   # Barra superior de navegación
│       │   ├── Modal.js                    # Componente modal reutilizable
│       │   └── VirtualKeyboard.js          # Teclado virtual en pantalla
│       │
│       └── utils/
│           ├── logger.js                   # Sistema de logging
│           └── helpers.js                  # Funciones auxiliares
```

### Componentes Clave

#### 🤖 Scripts de Automatización (automation/)

| Script | Propósito | Requiere Admin |
|--------|-----------|----------------|
| **autoUpdate.ps1** | Script principal que verifica, descarga e instala actualizaciones desde GitHub Releases | No |
| **launcher.ps1** | Ejecuta autoUpdate.ps1 y después despliega el kiosko | No |
| **starter.ps1** | Configura tareas programadas y políticas de sistema | **Sí** |
| **silentLauncher.vbs** | Ejecuta launcher.ps1 sin mostrar ventana de PowerShell | No |

#### 🧩 Módulos JavaScript (js/)

| Módulo | Ubicación | Responsabilidad |
|--------|-----------|-----------------|
| **AppConfig** | `js/config/app.config.js` | Configuración centralizada (timeouts, colores, URLs, features) |
| **EventBus** | `js/core/EventBus.js` | Sistema pub/sub para comunicación entre módulos |
| **SessionManager** | `js/core/SessionManager.js` | Control de inactividad y cierre automático de sesión |
| **PlatformService** | `js/services/PlatformService.js` | Detecta y gestiona plataforma actual (HCM o GCA) |
| **NavigationService** | `js/services/NavigationService.js` | Manejo de navegación y redirecciones |
| **TopBar** | `js/ui/TopBar.js` | Barra superior con botones (Inicio, Logout, FAQ) |
| **Modal** | `js/ui/Modal.js` | Modales reutilizables (advertencias, confirmaciones) |
| **VirtualKeyboard** | `js/ui/VirtualKeyboard.js` | Teclado en pantalla para dispositivos táctiles |
| **Logger** | `js/utils/logger.js` | Sistema de logging con niveles |
| **Helpers** | `js/utils/helpers.js` | Funciones auxiliares (delay, debounce, etc.) |

### Flujo de Ejecución

```
┌─────────────────────────────────────────────────────────┐
│  Usuario inicia sesión en Windows                       │
│                                                          │
│  ↓ (Tarea programada configurada por starter.ps1)      │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│  silentLauncher.vbs ejecuta launcher.ps1                │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│  launcher.ps1 ejecuta autoUpdate.ps1                    │
│                                                          │
│  → Verifica versión local vs GitHub Releases            │
│  → Si hay actualización: descarga, extrae, instala      │
│  → Si no hay actualización: continúa con deploy         │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│  launcher.ps1 lanza Chrome en modo kiosko               │
│                                                          │
│  Chrome.exe --kiosk --load-extension=... index.html     │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│  Chrome muestra index.html en fullscreen                │
│                                                          │
│  → Usuario ve menú principal con HCM y GCA              │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│  Usuario hace click en HCM o GCA                        │
│                                                          │
│  → Chrome navega a la URL de la plataforma              │
│  → content.js se inyecta en la página                   │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│  content.js inicializa módulos:                         │
│                                                          │
│  → PlatformService detecta plataforma actual            │
│  → SessionManager inicia timer de inactividad           │
│  → TopBar crea barra superior de navegación             │
│  → EventBus empieza a escuchar eventos                  │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│  Usuario interactúa con plataforma                      │
│                                                          │
│  → Cada interacción resetea timer de sesión             │
│  → Si inactividad > 3 min: Modal de advertencia         │
│  → Si no responde: Logout automático y regreso a menú   │
└─────────────────────────────────────────────────────────┘
```

---

## ⚙️ Configuración Avanzada

### Modificar Configuración de Sesión

Editar `js/config/app.config.js`:

```javascript
SESSION: {
  TIMEOUT_MINUTES: 3,          // Cambiar a 5 para timeout de 5 minutos
  WARNING_SECONDS: 30,         // Cambiar a 60 para advertencia de 1 minuto
  ACTIVITY_EVENTS: [
    'mousedown',
    'keypress',
    'touchstart',
    'scroll'
  ]
}
```

### Modificar Colores de la Interfaz

```javascript
UI: {
  COLORS: {
    PRIMARY: '#667eea',        // Color principal (botones, enlaces)
    DANGER: '#ff6b6b',         // Color de advertencias y errores
    SUCCESS: '#51cf66',        // Color de éxito
    WARNING: '#ffd43b',        // Color de alertas
    INFO: '#4dabf7'            // Color informativo
  }
}
```

### Habilitar/Deshabilitar Features

```javascript
FEATURES: {
  SESSION_TIMEOUT: true,       // Deshabilitar para quitar timeout automático
  TOP_BAR: true,               // Deshabilitar para ocultar barra superior
  FAQ: true,                   // Deshabilitar para quitar botón FAQ
  ACTIVITY_TRACKING: true,     // Deshabilitar tracking de actividad
  VIRTUAL_KEYBOARD: true       // Habilitar teclado virtual en pantalla
}
```

### Configurar Modo Debug

```javascript
DEBUG: {
  LOGS_ENABLED: true,          // Habilitar logs en consola
  LOG_EVENTS: true,            // Logs de eventos EventBus
  LOG_SESSION: true,           // Logs de gestión de sesión
  LOG_UI: false                // Logs de componentes UI (verbose)
}
```

### Cambiar Repositorio de GitHub

Editar `automation/autoUpdate.ps1`:

```powershell
$GITHUB_REPO = "ptxit/operators-kiosk"   # Cambiar a tu repo
```

---

## 🔄 Mantenimiento y Actualizaciones

### Cómo Publicar una Actualización

1. **Hacer cambios** en el código de la extensión
2. **Actualizar versión** en `manifest.json` y `version.txt`
3. **Commit y push** a la rama principal del repositorio
4. **Crear un Release** en GitHub:
   - Ir a "Releases" → "Create a new release"
   - Tag version: `v1.2.3` (debe coincidir con version.txt)
   - Title: "Release v1.2.3"
   - Descripción: Changelog de cambios
   - Publicar release

5. **Los kioscos se actualizan automáticamente**:
   - Al próximo inicio de sesión
   - O al reiniciar el launcher manualmente
   - El script `autoUpdate.ps1` descarga e instala la nueva versión

### Verificar Versión Instalada

```powershell
Get-Content "$env:USERPROFILE\chrome-win\kiosko_extension\version.txt"
```

### Forzar Actualización Manual

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "$env:USERPROFILE\chrome-win\kiosko_extension\automation\autoUpdate.ps1"
```

### Ver Logs de Actualización

```powershell
Get-Content "$env:USERPROFILE\chrome-win\kiosko_extension\setup.log" -Tail 50
```

### Debugging en Consola de Chrome

Presionar **F12** para abrir DevTools, luego:

```javascript
// Ver configuración actual
AppConfig

// Ver historial de eventos
eventBus.debugPrintHistory()

// Ver información de sesión
sessionManager.debugPrint()

// Ver plataforma detectada
platformService.debugPrint()
```

---

## 🔐 Seguridad y Cumplimiento

- ✅ **Cierre automático de sesión** por inactividad
- ✅ **Sin almacenamiento local** de credenciales
- ✅ **Comunicación restringida** solo a dominios autorizados
- ✅ **Modo kiosko** sin acceso a sistema operativo
- ✅ **Actualizaciones firmadas** desde repositorio privado
- ✅ **Token de GitHub** almacenado de forma segura en variables de entorno
- ✅ **Logs detallados** para auditoría

---

## 📞 Soporte y Contacto

Para reportar problemas o solicitar soporte:

1. Crear un **Issue** en el repositorio de GitHub
2. Incluir logs relevantes (`setup.log` y consola de Chrome)
3. Describir pasos para reproducir el problema
4. Indicar versión instalada y sistema operativo

---

## 📝 Notas Finales

- Este proyecto está diseñado para dispositivos kiosko dedicados
- No está pensado para uso en estaciones de trabajo convencionales
- Requiere Windows 10/11 con permisos administrativos para configuración inicial
- Los scripts de automatización están optimizados para PowerShell 5.1+
- La extensión requiere Chrome/Chromium 88 o superior

---

**Desarrollado para facilitar el acceso seguro a plataformas empresariales** 🚀
