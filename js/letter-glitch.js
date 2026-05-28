(function() {
  'use strict';

  const config = {
    glitchSpeed: 100,
    smooth: true,
    centerVignette: true,
    outerVignette: true
  };

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  const fontSize = 16;
  const charWidth = 10;
  const charHeight = 20;
  const lettersAndSymbols = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z','!','@','#','$','&','*','(',')','-','_','+','=','/','[',']','{','}',';',':','<','>',',','0','1','2','3','4','5','6','7','8','9'];

  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.top = '0';
  container.style.left = '0';
  container.style.width = '100%';
  container.style.height = '100%';
  container.style.zIndex = '-1';
  container.style.pointerEvents = 'none';
  document.body.prepend(container);

  const canvas = document.createElement('canvas');
  canvas.style.display = 'block';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  container.appendChild(canvas);

  if (config.outerVignette) {
    const v = document.createElement('div');
    v.style.position = 'absolute';
    v.style.top = '0';
    v.style.left = '0';
    v.style.width = '100%';
    v.style.height = '100%';
    v.style.pointerEvents = 'none';
    v.style.background = 'radial-gradient(circle, rgba(0,0,0,0) 60%, rgba(0,0,0,1) 100%)';
    container.appendChild(v);
  }

  if (config.centerVignette) {
    const v = document.createElement('div');
    v.style.position = 'absolute';
    v.style.top = '0';
    v.style.left = '0';
    v.style.width = '100%';
    v.style.height = '100%';
    v.style.pointerEvents = 'none';
    v.style.background = 'radial-gradient(circle, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 60%)';
    container.appendChild(v);
  }

  const ctx = canvas.getContext('2d');
  let letters = [];
  let grid = { columns: 0, rows: 0 };
  let lastGlitchTime = Date.now();
  let animationId;
  let glitchColors = [];
  let glitchRgbColors = [];
  let canvasWidth = 0;
  let canvasHeight = 0;

  function getPaletteColors() {
    const styles = getComputedStyle(document.documentElement);
    return [
      styles.getPropertyValue('--green').trim(),
      styles.getPropertyValue('--cyan').trim(),
      styles.getPropertyValue('--blue').trim()
    ];
  }

  function updatePalette() {
    glitchColors = getPaletteColors();
    glitchRgbColors = glitchColors.map(hexToRgb);
    container.style.backgroundColor = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim();
    letters.forEach(l => {
      l.color = getRandomColor();
      l.rgb = hexToRgb(l.color);
      l.targetColor = getRandomColor();
      l.targetRgb = hexToRgb(l.targetColor);
      l.colorProgress = 1;
    });
    drawLetters();
  }

  function getRandomChar() {
    return lettersAndSymbols[Math.floor(Math.random() * lettersAndSymbols.length)];
  }

  function getRandomColor() {
    return glitchColors[Math.floor(Math.random() * glitchColors.length)];
  }

  function getRandomRgbColor() {
    return glitchRgbColors[Math.floor(Math.random() * glitchRgbColors.length)];
  }

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

  function interpolateColor(start, end, factor) {
    const r = Math.round(start.r + (end.r - start.r) * factor);
    const g = Math.round(start.g + (end.g - start.g) * factor);
    const b = Math.round(start.b + (end.b - start.b) * factor);
    return `rgb(${r}, ${g}, ${b})`;
  }

  function calculateGrid(width, height) {
    return {
      columns: Math.ceil(width / charWidth),
      rows: Math.ceil(height / charHeight)
    };
  }

  function initializeLetters(columns, rows) {
    grid = { columns, rows };
    const total = columns * rows;
    letters = Array.from({ length: total }, () => {
      const rgb = getRandomRgbColor();
      const targetRgb = getRandomRgbColor();
      return {
        char: getRandomChar(),
        rgb,
        targetRgb,
        color: rgb ? `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` : getRandomColor(),
        targetColor: targetRgb ? `rgb(${targetRgb.r}, ${targetRgb.g}, ${targetRgb.b})` : getRandomColor(),
        colorProgress: 1
      };
    });
  }

  function resizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const rect = container.getBoundingClientRect();
    canvasWidth = rect.width;
    canvasHeight = rect.height;
    canvas.width = canvasWidth * dpr;
    canvas.height = canvasHeight * dpr;
    canvas.style.width = canvasWidth + 'px';
    canvas.style.height = canvasHeight + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const g = calculateGrid(canvasWidth, canvasHeight);
    initializeLetters(g.columns, g.rows);
    drawLetters();
  }

  function drawLetters() {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.font = `${fontSize}px monospace`;
    ctx.textBaseline = 'top';
    letters.forEach((letter, index) => {
      const x = (index % grid.columns) * charWidth;
      const y = Math.floor(index / grid.columns) * charHeight;
      ctx.fillStyle = letter.color;
      ctx.fillText(letter.char, x, y);
    });
  }

  function updateLetters() {
    const updateCount = Math.max(1, Math.floor(letters.length * 0.05));
    for (let i = 0; i < updateCount; i++) {
      const index = Math.floor(Math.random() * letters.length);
      const l = letters[index];
      if (!l) continue;
      l.char = getRandomChar();
      l.targetRgb = getRandomRgbColor();
      l.targetColor = l.targetRgb ? `rgb(${l.targetRgb.r}, ${l.targetRgb.g}, ${l.targetRgb.b})` : getRandomColor();
      if (!config.smooth) {
        l.color = l.targetColor;
        l.rgb = l.targetRgb;
        l.colorProgress = 1;
      } else {
        l.colorProgress = 0;
      }
    }
  }

  function handleSmoothTransitions() {
    let needsRedraw = false;
    letters.forEach(l => {
      if (l.colorProgress < 1) {
        l.colorProgress += 0.05;
        if (l.colorProgress > 1) l.colorProgress = 1;
        const start = l.rgb;
        const end = l.targetRgb;
        if (start && end) {
          l.color = interpolateColor(start, end, l.colorProgress);
          if (l.colorProgress === 1) {
            l.rgb = end;
          }
          needsRedraw = true;
        }
      }
    });
    if (needsRedraw) {
      drawLetters();
    }
  }

  function animate() {
    if (document.hidden || prefersReducedMotion.matches) {
      animationId = null;
      return;
    }
    const now = Date.now();
    if (now - lastGlitchTime >= config.glitchSpeed) {
      updateLetters();
      drawLetters();
      lastGlitchTime = now;
    }
    if (config.smooth) {
      handleSmoothTransitions();
    }
    animationId = requestAnimationFrame(animate);
  }

  function startAnimation() {
    if (!animationId && !document.hidden && !prefersReducedMotion.matches) {
      lastGlitchTime = Date.now();
      animationId = requestAnimationFrame(animate);
    }
  }

  function init() {
    cancelAnimationFrame(animationId);
    animationId = null;
    updatePalette();
    resizeCanvas();
    startAnimation();
  }

  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(init, 150);
  }, { passive: true });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(animationId);
      animationId = null;
    } else {
      drawLetters();
      startAnimation();
    }
  });

  prefersReducedMotion.addEventListener('change', init);

  const observer = new MutationObserver(mutations => {
    if (mutations.some(m => m.attributeName === 'data-palette')) {
      updatePalette();
    }
  });
  observer.observe(document.documentElement, { attributes: true });

  init();
})();
