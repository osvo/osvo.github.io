/**
 * @file Efecto de escritura: el comando de cada ventana ($ cat about.txt, …) se
 * "teclea" la primera vez que la ventana entra en pantalla y luego aparece su
 * contenido. El script del <head> oculta ese texto antes del primer pintado
 * (clase .typing) y no activa el efecto si el usuario prefiere menos movimiento.
 */
(function() {
  'use strict';

  window.__typewriterReady = true;
  const root = document.documentElement;
  if (!root.classList.contains('typing')) return;

  const CHAR_MS = 24;      // velocidad media por carácter
  const STAGGER_MS = 120;  // separación entre ventanas que aparecen a la vez
  const pending = new Map(); // terminal → { line, nodes: [{ node, text }] }

  const isVisible = node => node.parentElement && node.parentElement.getClientRects().length > 0;

  document.querySelectorAll('.terminal').forEach(term => {
    const line = term.querySelector('.screen > .line');
    const prompt = line?.querySelector('.prompt');
    if (!line || !prompt) return;

    // Nodos de texto del comando (todo lo que va después del prompt).
    const nodes = [];
    const walker = document.createTreeWalker(line, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const node = walker.currentNode;
      if (prompt.contains(node) || !node.nodeValue) continue;
      nodes.push({ node, text: node.nodeValue });
    }
    if (!nodes.length) return;

    nodes.forEach(item => { item.node.nodeValue = ''; });
    term.classList.add('type-pending');
    pending.set(term, { line, nodes });
  });

  // A partir de aquí la visibilidad la controla cada ventana (.type-pending).
  root.classList.remove('typing');

  const finish = term => {
    const job = pending.get(term);
    if (!job) return;
    pending.delete(term);
    job.nodes.forEach(item => { item.node.nodeValue = item.text; });
    job.line.classList.remove('is-typing');
    term.classList.remove('type-pending');
  };

  const finishAll = () => Array.from(pending.keys()).forEach(finish);

  const type = term => {
    const job = pending.get(term);
    if (!job) return;
    job.line.classList.add('is-typing');
    let n = 0;
    let c = 0;
    const tick = () => {
      if (!pending.has(term)) return;
      // Los nodos ocultos (p. ej. la variante móvil/escritorio del comando) se completan de una vez.
      while (n < job.nodes.length && (c >= job.nodes[n].text.length || !isVisible(job.nodes[n].node))) {
        job.nodes[n].node.nodeValue = job.nodes[n].text;
        n++;
        c = 0;
      }
      if (n >= job.nodes.length) {
        setTimeout(() => finish(term), 120);
        return;
      }
      const item = job.nodes[n];
      c++;
      item.node.nodeValue = item.text.slice(0, c);
      // Ritmo algo irregular, como al teclear de verdad; los espacios van un poco más lentos.
      const delay = CHAR_MS * (0.6 + Math.random() * 0.8) + (item.text[c - 1] === ' ' ? 40 : 0);
      setTimeout(tick, delay);
    };
    tick();
  };

  let nextStart = performance.now() + 150;
  const schedule = term => {
    const now = performance.now();
    const start = Math.max(now, nextStart);
    nextStart = start + STAGGER_MS;
    setTimeout(() => type(term), start - now);
  };

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);
        schedule(entry.target);
      });
    }, { threshold: 0.1 });
    pending.forEach((job, term) => observer.observe(term));
  } else {
    finishAll();
  }

  // Nunca ocultar contenido a quien navega con teclado, imprime o usa la terminal.
  document.addEventListener('focusin', event => {
    const term = event.target.closest?.('.terminal');
    if (term) finish(term);
  });
  window.addEventListener('beforeprint', finishAll);
})();
