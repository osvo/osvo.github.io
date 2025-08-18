/**
 * @file Script principal para la funcionalidad del CV interactivo.
 * Incluye:
 * - Lógica para manejar temas (paletas de colores).
 * - Controles de ventana (cerrar, minimizar, maximizar).
 * - Navegación y scroll suave entre secciones.
 * - Funciones de utilidad (conversor a números romanos).
 */

(function() {
  'use strict';

  /**
   * Convierte un número a su representación en números romanos.
   * @param {number} num - El número a convertir.
   * @returns {string} El número en formato romano.
   */
  const toRoman = (num) => {
    const romanMap = [
      [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'],
      [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'],
      [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']
    ];
    let result = '';
    for (const [value, symbol] of romanMap) {
      while (num >= value) {
        result += symbol;
        num -= value;
      }
    }
    return result;
  };

  // Actualiza el año en el pie de página a números romanos.
  document.querySelectorAll('#yearRoman').forEach(el => {
    el.textContent = toRoman(new Date().getFullYear());
  });

  // --- LÓGICA DEL INTERRUPTOR DE PALETA DE COLORES ---
  const PALETTES = ['one-dark', 'dracula', 'nord', 'solarized', 'gruvbox', 'monokai', 'tokyonight', 'catppuccin', 'night-owl'];
  const PALETTE_NAMES = {
    'one-dark': 'One Dark', 'dracula': 'Dracula', 'nord': 'Nord', 'solarized': 'Solarized',
    'gruvbox': 'Gruvbox', 'monokai': 'Monokai', 'tokyonight': 'Tokyo Night',
    'catppuccin': 'Catppuccin', 'night-owl': 'Night Owl'
  };

  const paletteBtn = document.getElementById('togglePalette');
  const paletteNameSpan = document.getElementById('paletteName');

  const getCurrentPalette = () => document.documentElement.getAttribute('data-palette') || PALETTES[0];

  const setPalette = (palette) => {
    document.documentElement.setAttribute('data-palette', palette);
    localStorage.setItem('palette', palette);
    if (paletteNameSpan) {
      paletteNameSpan.textContent = PALETTE_NAMES[palette] || palette;
    }
  };

  const savedPalette = localStorage.getItem('palette');
  let initialPalette;

  if (savedPalette && PALETTES.includes(savedPalette)) {
    // Si hay una paleta guardada, usarla.
    initialPalette = savedPalette;
  } else {
    // Si no, elegir una aleatoria como inicial.
    initialPalette = PALETTES[Math.floor(Math.random() * PALETTES.length)];
  }

  setPalette(initialPalette);

  paletteBtn?.addEventListener('click', () => {
    const current = getCurrentPalette();
    const nextIndex = (PALETTES.indexOf(current) + 1) % PALETTES.length;
    const nextPalette = PALETTES[nextIndex];
    setPalette(nextPalette);
  });


  // --- LÓGICA DE CONTROLES DE VENTANA (TERMINAL) ---
  document.querySelectorAll('.terminal').forEach(term => {
    const redBtn = term.querySelector('.dot.red');
    const yellowBtn = term.querySelector('.dot.yellow');
    const greenBtn = term.querySelector('.dot.green');
    const title = term.querySelector('.title');

    // Refresca el título para reflejar el estado (ej. [minimizada])
    const refreshTitleState = () => {
      if (!title) return;
      const states = [];
      if (term.classList.contains('closed')) states.push('cerrada');
      if (term.classList.contains('minimized')) states.push('minimizada');
      if (term.classList.contains('maxwide')) states.push('max');
      title.setAttribute('data-state', states.join(' '));
    };

    redBtn?.addEventListener('click', () => {
      term.classList.toggle('closed');
      term.classList.remove('minimized', 'maxwide');
      refreshTitleState();
    });

    yellowBtn?.addEventListener('click', () => {
      term.classList.toggle('minimized');
      term.classList.remove('closed', 'maxwide');
      refreshTitleState();
    });

    greenBtn?.addEventListener('click', () => {
      const wasMaximized = term.classList.contains('maxwide');
      // Desmaximizar cualquier otra ventana
      document.querySelectorAll('.terminal.maxwide').forEach(t => t.classList.remove('maxwide'));

      term.classList.remove('closed', 'minimized');

      if (!wasMaximized) {
        term.classList.add('maxwide');
        // Si la función de scroll ajustado está disponible, úsala.
        if (window.__scrollAdjusted) {
          window.__scrollAdjusted(term, true);
        } else {
          // Fallback simple
          term.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
      refreshTitleState();
    });

    // Observar cambios en las clases para mantener el título actualizado
    new MutationObserver(refreshTitleState).observe(term, { attributes: true, attributeFilter: ['class'] });
    refreshTitleState();
  });
})();


/**
 * IIFE para manejar la navegación, el scroll y la apertura de ventanas.
 */
(function() {
  'use strict';

  const IDs_TO_ADJUST_SCROLL = new Set(['about', 'education', 'experience']);

  const getToolbarOffset = () => {
    const toolbar = document.querySelector('.toolbar');
    return (toolbar ? toolbar.getBoundingClientRect().height : 0) + 12; // 12px de margen
  };

  const focusTerminal = (term) => {
    document.querySelectorAll('.terminal.maxwide').forEach(t => t.classList.remove('maxwide'));
    term.classList.remove('closed', 'minimized');
    term.classList.add('maxwide');
  };

  const scrollAdjusted = (term, forceAdjust = false) => {
    const offset = getToolbarOffset();
    const termRect = term.getBoundingClientRect();
    const absoluteTermTop = window.scrollY + termRect.top;
    const viewportHeight = window.innerHeight;

    // Si la ventana cabe en la pantalla, la centramos. Si no, la alineamos arriba.
    const fitsInViewport = termRect.height + offset + 16 <= viewportHeight;
    const targetScrollTop = fitsInViewport
      ? Math.max(0, absoluteTermTop - (viewportHeight - termRect.height) / 2)
      : Math.max(0, absoluteTermTop - offset - 8);

    window.scrollTo({ top: targetScrollTop, behavior: 'smooth' });

    // Después del scroll, se hace una re-validación para asegurar que la ventana es visible.
    // Esto es útil si el scroll 'smooth' no es perfecto.
    setTimeout(() => {
      const r = term.getBoundingClientRect();
      if (r.top < offset + 6) {
        window.scrollBy({ top: r.top - (offset + 6), behavior: 'auto' });
      }
      if (r.bottom > viewportHeight - 8 && (fitsInViewport || forceAdjust)) {
        window.scrollBy({ top: r.bottom - (viewportHeight - 8), behavior: 'auto' });
      }
    }, 450); // 450ms es una duración razonable para un scroll 'smooth'
  };

  function openFocusScroll(id, forceAdjust = false) {
    const term = document.getElementById(id);
    if (!term) return;

    focusTerminal(term);

    const shouldAdjust = forceAdjust || IDs_TO_ADJUST_SCROLL.has(id);
    if (shouldAdjust) {
        scrollAdjusted(term, forceAdjust);
    }

    try {
      history.replaceState(null, '', '#' + id);
    } catch (e) {
      // Ignorar errores en entornos donde history.replaceState no esté permitido.
      console.error("History API not supported or blocked.", e);
    }
  }

  // Exponer funciones globalmente para que puedan ser llamadas desde otros scripts si es necesario.
  window.__scrollAdjusted = scrollAdjusted;
  window.__openFocusScroll = openFocusScroll;

  // --- MANEJADORES DE EVENTOS ---

  // Clicks en los enlaces del índice
  const indexEl = document.getElementById('sections');
  if (indexEl) {
    indexEl.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (event) => {
        event.preventDefault();
        const targetId = anchor.getAttribute('href').slice(1);
        openFocusScroll(targetId, true);
      });
    });
  }

  // Navegación directa al cargar la página con un hash en la URL
  const initialHash = location.hash ? location.hash.slice(1) : '';
  if (initialHash) {
    // Esperar un poco para que la página se renderice completamente
    setTimeout(() => openFocusScroll(initialHash, true), 100);
  }
})();
