'use strict';

/* =========================================================
   Interactividad - 4.3 Machine Learning · GAES 6
   1. Utilidades
   2. Navegación: menú (con versión celular), sección activa y progreso
   2.1 Aparición de secciones al hacer scroll
   3. Banner: puntos de datos que se agrupan (canvas)
   4. Pestañas accesibles (WAI-ARIA) + repetir animación
   5. Filtro de aplicaciones con animación FLIP
   6. Arranque
   ========================================================= */

/* ---------- Bloque 1: Utilidades ---------- */
// Si la persona pidió "reducir movimiento" en su sistema, lo respetamos
const sinMovimiento = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Bloque 2: Navegación ---------- */
const initNavegacion = () => {
  const raiz = document.documentElement;
  const sitio = document.querySelector('.sitio');
  const nav = document.querySelector('.sitio__nav');
  const botonMenu = document.querySelector('.sitio__menu-btn');
  const progreso = document.querySelector('.sitio__progreso');
  const enlaces = Array.from(document.querySelectorAll('.sitio__nav ul a'));
  if (!sitio) return; // Guarda

  // Secciones a las que apunta el menú (#concepto, #tipos...)
  const secciones = enlaces
    .map((a) => document.querySelector(a.hash))
    .filter(Boolean);

  // --- Menú en celular: botón hamburguesa ---
  const cerrarMenu = () => {
    nav?.classList.remove('abierto');
    botonMenu?.setAttribute('aria-expanded', 'false');
    botonMenu?.setAttribute('aria-label', 'Abrir menú');
  };
  botonMenu?.addEventListener('click', () => {
    const abrir = botonMenu.getAttribute('aria-expanded') !== 'true';
    nav?.classList.toggle('abierto', abrir);
    botonMenu.setAttribute('aria-expanded', String(abrir));
    botonMenu.setAttribute('aria-label', abrir ? 'Cerrar menú' : 'Abrir menú');
  });
  nav?.addEventListener('click', (evento) => {
    if (evento.target.closest('a')) cerrarMenu(); // al elegir una sección se cierra
  });
  document.addEventListener('keydown', (evento) => {
    if (evento.key === 'Escape' && nav?.classList.contains('abierto')) {
      cerrarMenu();
      botonMenu?.focus();
    }
  });

  // --- Scroll: barra de progreso + enlace de la sección actual ---
  // requestAnimationFrame agrupa los eventos de scroll en uno por cuadro (rendimiento).
  const actualizar = () => {
    const max = raiz.scrollHeight - window.innerHeight;
    if (progreso) progreso.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;

    // La sección actual es la última cuyo inicio ya pasó el tercio superior de la pantalla
    const linea = window.innerHeight * 0.35;
    const actual = secciones.filter((s) => s.getBoundingClientRect().top <= linea).pop();
    enlaces.forEach((a) => {
      if (actual && a.hash === `#${actual.id}`) a.setAttribute('aria-current', 'location');
      else a.removeAttribute('aria-current');
    });
    pendiente = false;
  };
  let pendiente = false;
  window.addEventListener('scroll', () => {
    if (!pendiente) {
      pendiente = true;
      requestAnimationFrame(actualizar);
    }
  }, { passive: true });
  window.addEventListener('resize', actualizar);
  actualizar();
};

/* ---------- Bloque 2.1: Aparición al hacer scroll ---------- */
// Cuando una sección entra en vista se le pone la clase .activa (una sola vez):
// el CSS usa esa clase para animar su contenido y sus dibujos.
const initRevelar = () => {
  const secciones = document.querySelectorAll('main > section');
  if (!('IntersectionObserver' in window) || sinMovimiento()) {
    secciones.forEach((s) => s.classList.add('activa'));
    return;
  }
  document.documentElement.classList.add('js-revelar');

  const observador = new IntersectionObserver((entradas) => {
    entradas.forEach((entrada) => {
      if (!entrada.isIntersecting) return;
      entrada.target.classList.add('activa');
      observador.unobserve(entrada.target); // ya se animó: deja de observarla
    });
  }, { rootMargin: '0px 0px -20% 0px' }); // se activa cuando la sección pasa el último quinto de la pantalla

  secciones.forEach((s) => observador.observe(s));
};

/* ---------- Bloque 3: Banner (canvas) ---------- */
// Idea: los datos llegan dispersos y el "modelo" los agrupa en 3 clústeres,
// como hace el aprendizaje automático al detectar patrones.
const initPortada = () => {
  const portada = document.getElementById('portada');
  const canvas = document.querySelector('.portada__datos');
  if (!portada || !canvas) return; // Guarda
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const COLORES = ['#39A900', '#50E5F9', '#FDC300'];
  const RGB = COLORES.map((hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)));
  const GRIS = [143, 166, 179];
  const raton = { x: -9999, y: -9999 };

  let ancho = 0;
  let alto = 0;
  let radio = 0;
  let puntos = [];
  let centros = [];
  let inicio = performance.now();
  let frame = null;
  let visible = true;

  const limitar = (v) => Math.min(Math.max(v, 0), 1);
  const suavizar = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

  // Calcula tamaños y crea los puntos (posición inicial aleatoria y destino en su grupo)
  const preparar = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    ancho = canvas.clientWidth;
    alto = canvas.clientHeight;
    if (!ancho || !alto) return;
    canvas.width = Math.round(ancho * dpr);
    canvas.height = Math.round(alto * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const vertical = ancho < 900 || ancho < alto;
    const cx = vertical ? ancho * 0.6 : ancho * 0.73;
    const cy = vertical ? alto * 0.2 : alto * 0.45;
    const sep = Math.min(ancho, alto) * (vertical ? 0.22 : 0.2);
    centros = [
      { x: cx - sep * 0.9, y: cy - sep * 0.55 },
      { x: cx + sep * 0.9, y: cy - sep * 0.25 },
      { x: cx + sep * 0.05, y: cy + sep * 0.85 },
    ];
    radio = sep * 0.55;

    const cantidad = vertical ? 54 : 105;
    puntos = Array.from({ length: cantidad }, (_, i) => {
      const grupo = i % 3;
      const angulo = Math.random() * Math.PI * 2;
      const distancia = Math.sqrt(Math.random()) * radio; // reparto uniforme en el círculo
      return {
        grupo,
        x0: Math.random() * ancho,
        y0: Math.random() * alto,
        tx: centros[grupo].x + Math.cos(angulo) * distancia,
        ty: centros[grupo].y + Math.sin(angulo) * distancia,
        r: 2.2 + Math.random() * 2.6,
        fase: Math.random() * Math.PI * 2,
        retraso: Math.random() * 0.4,
        ox: 0,
        oy: 0,
      };
    });
  };

  // Dibuja un cuadro de la animación; t = segundos desde el inicio
  const dibujar = (t) => {
    ctx.clearRect(0, 0, ancho, alto);

    // Anillos y cruz de cada centroide (aparecen cuando los grupos ya se formaron)
    const aAnillo = limitar((t - 2.6) / 0.8);
    if (aAnillo > 0) {
      centros.forEach((c, g) => {
        const [r, v, b] = RGB[g];
        ctx.setLineDash([4, 6]);
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = `rgba(${r}, ${v}, ${b}, ${0.5 * aAnillo})`;
        ctx.beginPath();
        ctx.arc(c.x, c.y, radio * 1.3 + (1 - aAnillo) * 24, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.strokeStyle = `rgba(255, 255, 255, ${0.75 * aAnillo})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(c.x - 6, c.y); ctx.lineTo(c.x + 6, c.y);
        ctx.moveTo(c.x, c.y - 6); ctx.lineTo(c.x, c.y + 6);
        ctx.stroke();
      });
    }

    puntos.forEach((p) => {
      // Progreso de cada punto hacia su grupo (con un pequeño retraso individual)
      const e = suavizar(limitar((t - 0.3 - p.retraso) / 1.8));
      let x = p.x0 + (p.tx - p.x0) * e + Math.sin(t * 0.9 + p.fase) * 3 * e;
      let y = p.y0 + (p.ty - p.y0) * e + Math.cos(t * 0.7 + p.fase) * 3 * e;

      // Repulsión suave del puntero (responde a la acción del usuario)
      const dx = x - raton.x;
      const dy = y - raton.y;
      const d = Math.hypot(dx, dy);
      const alcance = 110;
      const fuerza = d > 0 && d < alcance ? (1 - d / alcance) * 28 : 0;
      p.ox += ((fuerza ? (dx / d) * fuerza : 0) - p.ox) * 0.12;
      p.oy += ((fuerza ? (dy / d) * fuerza : 0) - p.oy) * 0.12;
      x += p.ox;
      y += p.oy;

      // Color: gris (dato sin agrupar) que pasa al color de su grupo
      const k = limitar((e - 0.55) / 0.45);
      const [r, v, b] = RGB[p.grupo];
      const mezclar = (de, a) => Math.round(de + (a - de) * k);
      ctx.fillStyle = `rgb(${mezclar(GRIS[0], r)}, ${mezclar(GRIS[1], v)}, ${mezclar(GRIS[2], b)})`;
      ctx.globalAlpha = 0.55 + 0.45 * k;
      ctx.beginPath();
      ctx.arc(x, y, p.r, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
  };

  const bucle = (ahora) => {
    dibujar((ahora - inicio) / 1000);
    frame = visible && !document.hidden ? requestAnimationFrame(bucle) : null;
  };
  const arrancar = () => {
    if (!frame && visible && !sinMovimiento()) frame = requestAnimationFrame(bucle);
  };

  // Solo se anima mientras el banner se ve en pantalla (ahorra CPU y batería)
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entrada]) => {
      visible = entrada.isIntersecting;
      if (visible) arrancar();
    }).observe(portada);
  }

  preparar();
  if (sinMovimiento()) dibujar(10); // estado final, sin animación
  else arrancar();

  portada.addEventListener('pointermove', (evento) => {
    const caja = canvas.getBoundingClientRect();
    raton.x = evento.clientX - caja.left;
    raton.y = evento.clientY - caja.top;
  });
  portada.addEventListener('pointerleave', () => {
    raton.x = -9999;
    raton.y = -9999;
  });
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) arrancar();
  });

  // Al cambiar el tamaño: recalcula sin repetir la intro
  let espera;
  window.addEventListener('resize', () => {
    clearTimeout(espera);
    espera = setTimeout(() => {
      preparar();
      inicio = performance.now() - 10000;
      if (sinMovimiento()) dibujar(10);
      else if (visible) arrancar();
    }, 150);
  });
};

/* ---------- Bloque 4: Pestañas (WAI-ARIA, orientación vertical) ---------- */
const initTabs = () => {
  const lista = document.querySelector('[role="tablist"]');
  if (!lista) return; // Guarda: sin pestañas no hay nada que hacer

  const tabs = Array.from(lista.querySelectorAll('[role="tab"]'));
  if (tabs.length === 0) return;

  // Activa una pestaña, muestra su panel y oculta los demás.
  // Al pasar de hidden a visible, las animaciones CSS del dibujo arrancan de nuevo.
  const activarPestana = (tab) => {
    tabs.forEach((t) => {
      const activa = t === tab;
      t.setAttribute('aria-selected', String(activa));
      t.setAttribute('tabindex', activa ? '0' : '-1');

      const panel = document.getElementById(t.getAttribute('aria-controls'));
      if (panel) panel.hidden = !activa;
    });
    tab.focus();
  };

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => activarPestana(tab));
  });

  // ↑ ↓ cambian de pestaña (lista vertical); Inicio y Fin van a la primera y la última.
  lista.addEventListener('keydown', (evento) => {
    const actual = tabs.indexOf(document.activeElement);
    if (actual === -1) return;

    let nuevo = null;
    switch (evento.key) {
      case 'ArrowDown': nuevo = (actual + 1) % tabs.length; break;
      case 'ArrowUp':   nuevo = (actual - 1 + tabs.length) % tabs.length; break;
      case 'Home':      nuevo = 0; break;
      case 'End':       nuevo = tabs.length - 1; break;
      default: return;
    }
    evento.preventDefault(); // evita que la página haga scroll con estas teclas
    activarPestana(tabs[nuevo]);
  });

  // Botones "Repetir animación": reinician las animaciones CSS del dibujo
  document.querySelectorAll('.repetir').forEach((boton) => {
    boton.addEventListener('click', () => {
      const dibujo = boton.closest('.panel__figura')?.querySelector('svg');
      dibujo?.getAnimations({ subtree: true }).forEach((animacion) => {
        animacion.cancel();
        animacion.play();
      });
    });
  });
};

/* ---------- Bloque 5: Filtro de aplicaciones ---------- */
const initFiltro = () => {
  const grupo = document.querySelector('.filtros');
  const contador = document.getElementById('contador');
  const tarjetas = Array.from(document.querySelectorAll('.tarjeta'));
  if (!grupo || !contador || tarjetas.length === 0) return; // Guarda

  const botones = Array.from(grupo.querySelectorAll('[data-filtro]'));
  const indicador = grupo.querySelector('.filtros__indicador');
  const EASING = 'cubic-bezier(.2, .8, .2, 1)';
  let turno = 0; // evita conflictos si se hace clic muy rápido

  // Mueve el fondo azul bajo el botón activo
  const moverIndicador = (boton) => {
    if (!indicador || !boton) return;
    indicador.style.width = `${boton.offsetWidth}px`;
    indicador.style.height = `${boton.offsetHeight}px`;
    indicador.style.transform = `translate(${boton.offsetLeft}px, ${boton.offsetTop}px)`;
  };

  // Técnica FLIP: First (medir), Last (aplicar cambio), Invert + Play (animar la diferencia)
  const aplicarFiltro = async (filtro) => {
    const miTurno = ++turno;
    const animar = !sinMovimiento();
    const coincide = (t) => filtro === 'todas' || t.dataset.categoria === filtro;

    tarjetas.forEach((t) => t.getAnimations().forEach((a) => a.cancel()));

    // 1) Salida: las tarjetas que sobran se desvanecen
    const salen = tarjetas.filter((t) => !t.hidden && !coincide(t));
    if (animar && salen.length) {
      await Promise.all(salen.map((t) => t.animate(
        [{ opacity: 1, transform: 'scale(1)' }, { opacity: 0, transform: 'scale(.94)' }],
        { duration: 180, easing: 'ease-in', fill: 'forwards' },
      ).finished.catch(() => {})));
      if (miTurno !== turno) return; // llegó otro clic mientras tanto
    }

    // 2) First: posición de las tarjetas que se quedan
    const antes = new Map(
      tarjetas.filter((t) => !t.hidden && coincide(t)).map((t) => [t, t.getBoundingClientRect()]),
    );

    // 3) Last: aplicar el filtro
    let visibles = 0;
    tarjetas.forEach((t) => {
      t.hidden = !coincide(t);
      if (!t.hidden) visibles += 1;
    });
    salen.forEach((t) => t.getAnimations().forEach((a) => a.cancel()));
    contador.textContent = `Mostrando ${visibles} ${visibles === 1 ? 'elemento' : 'elementos'}`;

    if (!animar) return;

    // 4) Invert + Play: las que se quedan se deslizan; las nuevas entran
    let orden = 0;
    tarjetas.filter((t) => !t.hidden).forEach((t) => {
      const previo = antes.get(t);
      const actual = t.getBoundingClientRect();
      if (previo) {
        const dx = previo.left - actual.left;
        const dy = previo.top - actual.top;
        if (dx || dy) {
          t.animate(
            [{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'none' }],
            { duration: 450, easing: EASING },
          );
        }
      } else {
        t.animate(
          [{ opacity: 0, transform: 'translateY(16px) scale(.96)' }, { opacity: 1, transform: 'none' }],
          { duration: 400, delay: orden * 60, easing: EASING, fill: 'backwards' },
        );
        orden += 1;
      }
    });
  };

  // Delegación de eventos: un solo listener para todos los botones
  grupo.addEventListener('click', (evento) => {
    const boton = evento.target.closest('[data-filtro]');
    if (!boton || boton.getAttribute('aria-pressed') === 'true') return;

    botones.forEach((b) => b.setAttribute('aria-pressed', String(b === boton)));
    moverIndicador(boton);
    aplicarFiltro(boton.dataset.filtro);
  });

  // Posición inicial del indicador; luego se activan sus transiciones
  const activo = () => botones.find((b) => b.getAttribute('aria-pressed') === 'true');
  const recolocar = () => moverIndicador(activo());
  recolocar();
  requestAnimationFrame(() => grupo.classList.add('filtros--listo'));
  window.addEventListener('resize', recolocar);
  document.fonts?.ready.then(recolocar); // la fuente cambia el ancho de los botones
};

/* ---------- Bloque 6: Arranque ---------- */
document.addEventListener('DOMContentLoaded', () => {
  initNavegacion();
  initRevelar();
  initPortada();
  initTabs();
  initFiltro();
});
