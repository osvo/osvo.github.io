(function() {
  'use strict';

  const config = {
    glitchSpeed: 100,       // ms entre tandas de letras nuevas
    updateRatio: 0.05,      // fracción de letras que cambian en cada tanda
    transitionMs: 333,      // duración de la transición de color (≈ 20 frames a 60 Hz)
    smooth: true,
    centerVignette: true,
    outerVignette: true
  };

  let motionEnabled = true;
  try {
    motionEnabled = localStorage.getItem('site-background-motion') !== 'off';
  } catch (error) {
    // El almacenamiento puede estar deshabilitado en modo privado.
  }

  const fontSize = 16;
  const charWidth = 10;
  const charHeight = 20;
  const lettersAndSymbols = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$&*()-_+=/[]{};:<>,0123456789';

  const fill = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;';

  const container = document.createElement('div');
  container.className = 'bg-glitch';
  container.setAttribute('aria-hidden', 'true');
  container.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:-1;pointer-events:none;';
  document.body.prepend(container);

  const canvas = document.createElement('canvas');
  canvas.style.display = 'block';
  container.appendChild(canvas);

  if (config.outerVignette) {
    const v = document.createElement('div');
    v.style.cssText = fill + 'background:radial-gradient(circle, rgba(0,0,0,0) 60%, rgba(0,0,0,1) 100%);';
    container.appendChild(v);
  }

  if (config.centerVignette) {
    const v = document.createElement('div');
    v.style.cssText = fill + 'background:radial-gradient(circle, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 60%);';
    container.appendChild(v);
  }

  const ctx = canvas.getContext('2d', { alpha: true });

  // Estado de la cuadrícula en arreglos planos: menos objetos y menos trabajo
  // para el recolector de basura que un arreglo de objetos por letra.
  let columns = 0;
  let rows = 0;
  let total = 0;
  let chars = new Uint8Array(0);      // índice en lettersAndSymbols
  let fromColor = new Uint8Array(0);  // índice en la paleta
  let toColor = new Uint8Array(0);
  let progress = new Float32Array(0); // 0 → 1
  // Celdas con transición activa; solo esas se redibujan en cada frame.
  let active = new Set();

  let palette = [];      // [{ r, g, b, css }]
  let canvasWidth = 0;
  let canvasHeight = 0;
  let animationId = null;
  let lastGlitchTime = 0;
  let lastFrameTime = 0;

  function hexToRgb(hex) {
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  function readPalette() {
    const styles = getComputedStyle(document.documentElement);
    palette = ['--green', '--cyan', '--blue']
      .map(name => hexToRgb(styles.getPropertyValue(name).trim()))
      .filter(Boolean)
      .map(c => ({ ...c, css: `rgb(${c.r}, ${c.g}, ${c.b})` }));
    if (!palette.length) palette = [{ r: 152, g: 195, b: 121, css: 'rgb(152, 195, 121)' }];
    container.style.backgroundColor = styles.getPropertyValue('--bg').trim();
  }

  const randomInt = (n) => (Math.random() * n) | 0;

  function colorAt(i) {
    const p = progress[i];
    const end = palette[toColor[i]];
    if (p >= 1) return end.css;
    const start = palette[fromColor[i]];
    const r = Math.round(start.r + (end.r - start.r) * p);
    const g = Math.round(start.g + (end.g - start.g) * p);
    const b = Math.round(start.b + (end.b - start.b) * p);
    return `rgb(${r}, ${g}, ${b})`;
  }

  function drawCell(i) {
    const x = (i % columns) * charWidth;
    const y = ((i / columns) | 0) * charHeight;
    ctx.clearRect(x, y, charWidth, charHeight);
    ctx.fillStyle = colorAt(i);
    ctx.fillText(lettersAndSymbols[chars[i]], x, y);
  }

  function drawAll() {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    for (let i = 0; i < total; i++) {
      ctx.fillStyle = colorAt(i);
      ctx.fillText(lettersAndSymbols[chars[i]], (i % columns) * charWidth, ((i / columns) | 0) * charHeight);
    }
  }

  function randomizeColors() {
    const n = palette.length;
    for (let i = 0; i < total; i++) {
      fromColor[i] = toColor[i] = randomInt(n);
      progress[i] = 1;
    }
    active.clear();
  }

  function resizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const rect = container.getBoundingClientRect();
    canvasWidth = rect.width;
    canvasHeight = rect.height;
    canvas.width = Math.round(canvasWidth * dpr);
    canvas.height = Math.round(canvasHeight * dpr);
    canvas.style.width = canvasWidth + 'px';
    canvas.style.height = canvasHeight + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    // Cambiar el tamaño del canvas reinicia su estado: hay que volver a fijar la fuente.
    ctx.font = `${fontSize}px monospace`;
    ctx.textBaseline = 'top';

    columns = Math.ceil(canvasWidth / charWidth);
    rows = Math.ceil(canvasHeight / charHeight);
    total = columns * rows;
    chars = new Uint8Array(total);
    fromColor = new Uint8Array(total);
    toColor = new Uint8Array(total);
    progress = new Float32Array(total);
    for (let i = 0; i < total; i++) chars[i] = randomInt(lettersAndSymbols.length);
    randomizeColors();
    drawAll();
  }

  function glitch() {
    const n = palette.length;
    const updateCount = Math.max(1, Math.floor(total * config.updateRatio));
    for (let k = 0; k < updateCount; k++) {
      const i = randomInt(total);
      chars[i] = randomInt(lettersAndSymbols.length);
      if (config.smooth) {
        // La transición parte del color que se ve ahora mismo.
        fromColor[i] = progress[i] >= 0.5 ? toColor[i] : fromColor[i];
        toColor[i] = randomInt(n);
        progress[i] = 0;
        active.add(i);
      } else {
        fromColor[i] = toColor[i] = randomInt(n);
        progress[i] = 1;
      }
      drawCell(i);
    }
  }

  function advanceTransitions(dt) {
    if (!active.size) return;
    const step = dt / config.transitionMs;
    for (const i of active) {
      const p = progress[i] + step;
      if (p >= 1) {
        progress[i] = 1;
        fromColor[i] = toColor[i];
        active.delete(i);
      } else {
        progress[i] = p;
      }
      drawCell(i);
    }
  }

  function animate(now) {
    if (document.hidden || !motionEnabled) {
      animationId = null;
      return;
    }
    // Se limita dt para que una pestaña que vuelve de segundo plano no salte.
    const dt = Math.min(now - lastFrameTime, 100);
    lastFrameTime = now;
    if (now - lastGlitchTime >= config.glitchSpeed) {
      glitch();
      lastGlitchTime = now;
    }
    if (config.smooth) advanceTransitions(dt);
    animationId = requestAnimationFrame(animate);
  }

  function startAnimation() {
    if (!animationId && !document.hidden && motionEnabled) {
      lastGlitchTime = lastFrameTime = performance.now();
      animationId = requestAnimationFrame(animate);
    }
  }

  function stopAnimation() {
    cancelAnimationFrame(animationId);
    animationId = null;
  }

  function init() {
    stopAnimation();
    readPalette();
    resizeCanvas();
    startAnimation();
  }

  let resizeTimeout;
  let lastWidth = window.innerWidth;
  window.addEventListener('resize', () => {
    // En móvil, la barra de direcciones cambia la altura al hacer scroll;
    // solo se reconstruye la cuadrícula si cambia el ancho o crece la altura.
    const widthChanged = window.innerWidth !== lastWidth;
    if (!widthChanged && window.innerHeight <= canvasHeight) return;
    lastWidth = window.innerWidth;
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(init, 150);
  }, { passive: true });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopAnimation();
    } else {
      startAnimation();
    }
  });

  const motionButton = document.createElement('button');
  motionButton.type = 'button';
  motionButton.className = 'btn';
  motionButton.id = 'toggleMotion';
  document.querySelector('.toolbar').appendChild(motionButton);

  function updateMotionButton() {
    const english = document.documentElement.lang === 'en';
    motionButton.textContent = motionEnabled ? (english ? 'Pause' : 'Pausar') : (english ? 'Animate' : 'Animar');
    motionButton.setAttribute('aria-label', english ? 'Animated background' : 'Fondo animado');
    motionButton.setAttribute('aria-pressed', String(motionEnabled));
  }

  function setMotion(enabled) {
    motionEnabled = enabled;
    try {
      localStorage.setItem('site-background-motion', motionEnabled ? 'on' : 'off');
    } catch (error) {
      // La preferencia funciona en esta visita aunque no se pueda guardar.
    }
    updateMotionButton();
    if (motionEnabled) {
      startAnimation();
    } else {
      stopAnimation();
    }
  }

  motionButton.addEventListener('click', () => setMotion(!motionEnabled));
  document.addEventListener('site-language-change', updateMotionButton);
  updateMotionButton();

  window.__setBackgroundMotion = setMotion;
  window.__getBackgroundMotion = () => motionEnabled;

  const observer = new MutationObserver(mutations => {
    if (mutations.some(m => m.attributeName === 'data-palette')) {
      readPalette();
      randomizeColors();
      drawAll();
    }
  });
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-palette'] });

  init();
})();
