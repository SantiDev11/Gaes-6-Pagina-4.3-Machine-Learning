# 4.3. Introducción al aprendizaje automático (machine learning)

Página web interactiva que apoya la exposición del **GAES 6** sobre el tema 4.3 del programa **Tecnología en Análisis y Desarrollo de Software (ADSO)** del SENA.

| | |
|---|---|
| **Grupo** | GAES 6 |
| **Integrantes** | Kevin Santiago Pedraza · Jose Alejandro Perez · Fabio Enrique Chamorro · Juan Felipe Aguillon |
| **Instructor** | JJ |
| **Sede** | SENA C.S.E.T. Bucaramanga |
| **Duración de la exposición** | 60 minutos |

---

## Cómo abrir la página

No necesita instalación, internet ni servidor.

1. Descarga o clona la carpeta completa del proyecto (incluida la carpeta `img/`).
2. Abre `index.html` con doble clic en Chrome, Edge o Firefox.

> Para proyectar, pon el navegador en pantalla completa con la tecla **F11**.

Si prefieres usar un servidor local (por ejemplo, para probar desde el celular en la misma red):

```bash
python -m http.server 8000
```

y luego abre `http://localhost:8000` en el navegador.

---

## Contenido

La página es una *landing* de una sola vista con estas secciones:

| Sección | Qué muestra |
|---|---|
| **Banner** | Título del tema, con puntos de datos que se agrupan solos (como hace un modelo al encontrar patrones). |
| **Accesos rápidos** | Tres tarjetas que llevan a cada tema. |
| **1. Concepto y diferenciación** | Definición de machine learning y comparación entre algoritmos tradicionales y machine learning. |
| **2. Tipos de aprendizaje** | Pestañas para supervisado, no supervisado y por refuerzo, cada una con una animación que explica el concepto. |
| **3. Aplicaciones y desarrollos** | Tarjetas filtrables entre *Aplicaciones actuales* y *Desarrollos avanzados*. |
| **Equipo** | Integrantes del GAES 6 y datos de la exposición. |

**Regla de contenido:** todo el texto sobre el tema proviene únicamente del documento oficial del apartado 4.3. No se agregaron definiciones ni ejemplos propios.

---

## Estructura del proyecto

```
├── index.html            Estructura (HTML5 semántico)
├── css/
│   └── styles.css        Presentación (diseño, colores, animaciones)
├── js/
│   └── main.js           Comportamiento (interactividad)
├── img/
│   ├── logo-sena.png         Logo del encabezado y del pie
│   ├── favicon-sena.png      Icono de la pestaña
│   └── apple-touch-icon.png  Icono para iPhone/iPad
└── README.md
```

Se separan **estructura, presentación y comportamiento** en tres archivos para que cada uno tenga una sola responsabilidad y sea más fácil de mantener.

---

## Tecnologías y técnicas

Sin librerías ni frameworks: solo HTML, CSS y JavaScript nativos.

### HTML5 semántico
- Etiquetas estructurales: `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`.
- Patrón **WAI-ARIA Tabs** (`role="tablist"`, `role="tab"`, `role="tabpanel"`, `aria-selected`).
- Enlace «Saltar al contenido» para quien navega con teclado.

### CSS3
- **Variables CSS** (`:root`) con la paleta institucional: verde `#39A900` y azul `#00324D`.
- **Flexbox** para alinear (menú, botones) y **CSS Grid** para las cuadrículas de tarjetas.
- Diseño **responsive**: menú hamburguesa y una sola columna en celular.
- Animaciones con `@keyframes` y transiciones suaves.
- Respeta la preferencia del sistema **«reducir movimiento»** (`prefers-reduced-motion`).

### JavaScript (ES6+)
| Función | Qué hace | Técnica |
|---|---|---|
| `initNavegacion()` | Menú de celular, enlace de la sección activa y barra de progreso | `requestAnimationFrame` para no recalcular en cada evento de scroll |
| `initRevelar()` | Anima cada sección cuando aparece en pantalla | `IntersectionObserver` |
| `initPortada()` | Dibuja los puntos de datos del banner | `<canvas>` 2D; se pausa cuando no se ve |
| `initTabs()` | Pestañas de tipos de aprendizaje, con teclado (↑ ↓ Inicio Fin) | Patrón WAI-ARIA |
| `initFiltro()` | Filtra las tarjetas de aplicaciones | Delegación de eventos + animación **FLIP** |

---

## Accesibilidad

- Contraste de colores según **WCAG AA**.
- Navegación completa con teclado y foco siempre visible.
- Iconos decorativos ocultos para lectores de pantalla (`aria-hidden="true"`).
- El contador del filtro avisa los cambios a lectores de pantalla (`aria-live="polite"`).
- Sin JavaScript, las secciones se siguen viendo; las animaciones de aparición solo se activan si el script carga (mejora progresiva).

---

## Pendiente

- [ ] Completar la tarjeta **«Vehículos …»** en *Desarrollos avanzados* con el texto oficial del apartado 4.3. Está marcada en `index.html` con el comentario `<!-- PENDIENTE -->`.

---

## Créditos

Desarrollado por el **GAES 6** para la formación ADSO del **SENA C.S.E.T. Bucaramanga**.
El logo del SENA pertenece al Servicio Nacional de Aprendizaje y se usa con fines académicos.
