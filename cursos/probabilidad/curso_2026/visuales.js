(function () {
  "use strict";
  const SVG = "http://www.w3.org/2000/svg";
  const DEFAULT_SEED = 20261030;
  let uidSeq = 0;
  const known = new Set(["montecarlo", "promedio_largo", "poisson", "bayes_tres", "venn_ops", "venn_prob", "placas", "densidad", "medias", "intervalos", "confiabilidad", "binomial", "normal", "histograma", "atipico", "pvalor", "dosmedias", "regresion", "weibull", "union", "conteo", "arbol_bayes", "tiros_binomial", "momentos", "sesgo_varianza", "retorno", "adivina_quien", "primer_binomial", "hiper_vs_binom", "poisson_limite", "exponencial_memoria", "normal_significado", "tabla_z", "normal_aprox_binom", "caja_interactiva", "t_vs_z", "bernoulli_ensayo", "geometrica_espera", "selector_discreto", "uniforme_area", "gamma_espera", "suma_normales", "derivadas_normal", "desviaciones_cuadrado", "forma_asimetria", "tamano_muestra", "ic_chi2_asimetria", "arbol_conteo", "pmf_cdf_escalera", "lineal_ax_b", "correlacion_nube"]);
  const fmt = (value, digits) => Number(value).toLocaleString("es-CO", { minimumFractionDigits: digits, maximumFractionDigits: digits });
  const fmtSigned = (value, digits) => fmt(value, digits).replace("-", "−");

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }
  function svg(tag, attrs, text) {
    const node = document.createElementNS(SVG, tag);
    Object.entries(attrs || {}).forEach(([key, value]) => node.setAttribute(key, String(value)));
    if (text !== undefined) node.textContent = text;
    return node;
  }
  function add(parent, tag, attrs, text) {
    const node = svg(tag, attrs, text);
    parent.appendChild(node);
    return node;
  }
  function makeSvg(viewBox, label) {
    return svg("svg", { viewBox, role: "img", "aria-label": label, class: "widget-svg" });
  }
  function controlButton(label, active) {
    const button = el("button", "widget-button" + (active ? " is-active" : ""), label);
    button.type = "button";
    return button;
  }
  function seeded(seed) {
    let state = seed >>> 0;
    return function () {
      state += 0x6D2B79F5;
      let t = state;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function normal(random) {
    const u = Math.max(random(), Number.MIN_VALUE);
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * random());
  }
  function baseline(plot, left, right, bottom, top) {
    add(plot, "line", { x1: left, y1: bottom, x2: right, y2: bottom, class: "v-axis" });
    add(plot, "line", { x1: left, y1: top, x2: left, y2: bottom, class: "v-axis" });
  }

  function placas(host) {
    const widget = el("div", "widget widget-placas");
    const controls = el("div", "widget-controls");
    const options = [
      { key: "todas", label: "Todas", numerator: 86, denominator: 100, title: "P(impacto alto)", member: (i) => i < 100, hit: (i) => i < 80 || (i >= 89 && i < 95) },
      { key: "rayadura", label: "Rayadura alta", numerator: 80, denominator: 89, title: "P(impacto alto | rayadura alta)", member: (i) => i < 89, hit: (i) => i < 80 },
      { key: "impacto", label: "Impacto alto", numerator: 80, denominator: 86, title: "P(rayadura alta | impacto alto)", member: (i) => i < 80 || (i >= 89 && i < 95), hit: (i) => i < 80 }
    ];
    let selected = options[0];
    const buttons = options.map((option) => {
      const button = controlButton(option.label, option === selected);
      button.addEventListener("click", () => { selected = option; redraw(); });
      controls.appendChild(button);
      return button;
    });
    const plot = makeSvg("0 0 620 425", "Cien placas clasificadas por rayadura e impacto; controles cambian el denominador");
    const result = el("p", "widget-result");
    const legend = el("p", "widget-legend", "● Numerador · ○ Denominador restante · · Fuera de la condición");
    const foot = el("p", "widget-foot", "Conteos de la tabla: 80 ambas características, 9 solo rayadura alta, 6 solo impacto alto y 5 ninguna.");
    widget.append(controls, plot, result, legend, foot);
    host.appendChild(widget);
    function redraw() {
      buttons.forEach((button, i) => button.classList.toggle("is-active", options[i] === selected));
      plot.replaceChildren();
      add(plot, "text", { x: 26, y: 28, class: "v-kicker" }, "100 PLACAS · CADA MARCA ES UNA PLACA");
      for (let i = 0; i < 100; i++) {
        const col = i % 10, row = Math.floor(i / 10);
        const cx = 48 + col * 56, cy = 56 + row * 34;
        const member = selected.member(i), hit = selected.hit(i);
        const mark = add(plot, "circle", { cx, cy, r: member ? 11 : 4,
          class: member ? (hit ? "v-hit" : "v-member") : "v-outside" });
        const type = i < 80 ? "ambas" : i < 89 ? "solo rayadura alta" : i < 95 ? "solo impacto alto" : "ninguna";
        add(mark, "title", {}, `Placa ${i + 1}: ${type}; ${member ? "en denominador" : "fuera del denominador"}`);
      }
      result.textContent = `${selected.title} = ${selected.numerator}/${selected.denominator} = ${fmt(selected.numerator / selected.denominator * 100, 2)} %`;
      plot.setAttribute("aria-label", `${selected.title}: ${selected.numerator} de ${selected.denominator} placas; ${fmt(selected.numerator / selected.denominator * 100, 2)} por ciento`);
    }
    redraw();
  }

  function densidad(host) {
    const widget = el("div", "widget widget-density");
    const controls = el("div", "widget-controls slider-control");
    const label = el("label", "widget-label", "Límite superior b");
    const slider = el("input");
    slider.type = "range"; slider.min = "0"; slider.max = "10"; slider.step = "0.1"; slider.value = "4";
    slider.setAttribute("aria-label", "Límite b del intervalo desde 0");
    const value = el("output", "slider-value");
    label.appendChild(slider);
    controls.append(label, value);
    const plot = makeSvg("0 0 640 330", "Densidad uniforme de cero a diez y área sombreada de cero a b");
    const result = el("p", "widget-result");
    const foot = el("p", "widget-foot", "La probabilidad es área bajo la densidad: altura 0,1 multiplicada por ancho b.");
    widget.append(controls, plot, result, foot); host.appendChild(widget);
    function redraw() {
      const b = Number(slider.value), left = 64, right = 584, bottom = 254, top = 58;
      const x = (v) => left + (right - left) * v / 10;
      value.textContent = fmt(b, 1);
      plot.replaceChildren();
      baseline(plot, left, right, bottom, 34);
      add(plot, "rect", { x: left, y: top, width: right - left, height: bottom - top, class: "v-density" });
      if (b > 0) add(plot, "rect", { x: left, y: top, width: x(b) - left, height: bottom - top, class: "v-area" });
      add(plot, "line", { x1: x(b), y1: top - 13, x2: x(b), y2: bottom + 9, class: "v-marker" });
      for (let tick = 0; tick <= 10; tick += 2) {
        add(plot, "line", { x1: x(tick), y1: bottom, x2: x(tick), y2: bottom + 5, class: "v-axis" });
        add(plot, "text", { x: x(tick), y: bottom + 26, "text-anchor": "middle", class: "v-tick" }, String(tick));
      }
      add(plot, "text", { x: left - 12, y: top + 5, "text-anchor": "end", class: "v-tick" }, "0,1");
      add(plot, "text", { x: (left + right) / 2, y: 312, "text-anchor": "middle", class: "v-axis-label" }, "x");
      add(plot, "text", { x: Math.max(left + 14, Math.min(right - 14, x(b))), y: top - 19, "text-anchor": "middle", class: "v-marker-label" }, `b = ${fmt(b, 1)}`);
      result.textContent = `P(0 ≤ X ≤ ${fmt(b, 1)}) = ${fmt(b, 1)}/10 = ${fmt(b / 10, 2)}`;
      plot.setAttribute("aria-label", `Uniforme de 0 a 10; b igual a ${fmt(b, 1)}; área sombreada y probabilidad ${fmt(b / 10, 2)}`);
    }
    slider.addEventListener("input", redraw);
    redraw();
  }

  function drawHistogram(plot, values) {
    plot.replaceChildren();
    const left = 58, right = 594, top = 28, bottom = 260, bins = 25;
    const counts = Array(bins).fill(0);
    values.forEach((value) => counts[Math.min(bins - 1, Math.max(0, Math.floor((value - 1) / 5 * bins)))]++);
    const max = Math.max(1, ...counts);
    baseline(plot, left, right, bottom, top);
    const x = (v) => left + (v - 1) / 5 * (right - left);
    const y = (v) => bottom - v / max * (bottom - top - 9);
    counts.forEach((count, i) => {
      const barWidth = (right - left) / bins - 1;
      const height = bottom - y(count);
      const bar = add(plot, "rect", { x: left + i * (right - left) / bins + 0.5, y: y(count),
        width: barWidth, height, class: "v-histogram" });
      add(bar, "title", {}, `${count} de 1000 medias`);
    });
    add(plot, "line", { x1: x(3.5), y1: top, x2: x(3.5), y2: bottom, class: "v-mean-line" });
    add(plot, "text", { x: x(3.5) + 7, y: top + 14, class: "v-marker-label" }, "E = 3,5");
    for (let tick = 1; tick <= 6; tick++) {
      add(plot, "line", { x1: x(tick), y1: bottom, x2: x(tick), y2: bottom + 5, class: "v-axis" });
      add(plot, "text", { x: x(tick), y: bottom + 24, "text-anchor": "middle", class: "v-tick" }, String(tick));
    }
    add(plot, "text", { x: (left + right) / 2, y: 318, "text-anchor": "middle", class: "v-axis-label" }, "media de n dados");
    add(plot, "text", { x: left - 8, y: y(max) + 6, "text-anchor": "end", class: "v-tick" }, String(max));
    add(plot, "text", { x: left - 8, y: bottom + 5, "text-anchor": "end", class: "v-tick" }, "0");
  }

  function medias(host) {
    const parents = [
      { key: "dado", label: "Dado uniforme", mu: 3.5, sigma: Math.sqrt(35 / 12), xmin: 1, xmax: 6,
        sample: (rng) => 1 + Math.floor(rng() * 6), ticks: [1, 2, 3, 4, 5, 6] },
      { key: "exp", label: "Exponencial", mu: 2.0, sigma: 2.0, xmin: 0, xmax: 8,
        sample: (rng) => -2 * Math.log(Math.max(1e-9, 1 - rng())), ticks: [0, 2, 4, 6, 8] },
      { key: "u", label: "Bimodal en U", mu: 3.5, sigma: Math.sqrt(5 / 2), xmin: 1, xmax: 6,
        sample: (rng) => (rng() < 0.5 ? 1.4 : 5.6) + (rng() - 0.5) * 0.8, ticks: [1, 2, 3, 4, 5, 6] },
      { key: "bern", label: "Bernoulli (0,2)", mu: 0.2, sigma: Math.sqrt(0.16), xmin: 0, xmax: 1,
        sample: (rng) => (rng() < 0.2 ? 1 : 0), ticks: [0, 0.2, 0.4, 0.6, 0.8, 1] }
    ];
    let parent = parents[0], animId = null;
    const widget = el("div", "widget widget-means");
    const controls = el("div", "widget-controls");
    const pBtns = parents.map((p) => {
      const b = controlButton(p.label, p === parent);
      b.addEventListener("click", () => { stopAnim(); parent = p; runSimulation(1000); });
      controls.appendChild(b);
      return b;
    });
    const row2 = el("div", "widget-controls");
    const nLabel = el("label", "widget-label", "Tamaño n");
    const nSelect = el("select");
    [1, 2, 5, 10, 30].forEach((n) => { const option = el("option", "", String(n)); option.value = String(n); nSelect.appendChild(option); });
    nSelect.value = "5"; nLabel.appendChild(nSelect);
    const seedLabel = el("label", "widget-label", "Semilla");
    const seedInput = el("input");
    seedInput.type = "number"; seedInput.step = "1"; seedInput.value = String(DEFAULT_SEED); seedInput.min = "0";
    seedLabel.appendChild(seedInput);
    const run = controlButton("Simular M = 1.000", false);
    const animBtn = controlButton("Animar 1.000", false);
    const reset = controlButton("Restablecer", false);
    row2.append(nLabel, seedLabel, run, animBtn, reset);
    const plot = makeSvg("0 0 640 330", "Histograma de mil medias muestrales frente a la campana normal del teorema central del límite");
    const result = el("p", "widget-result");
    const foot = el("p", "widget-foot", "La línea roja marca μ; la curva azul discontinua muestra la aproximación normal N(μ, σ²/n).");
    widget.append(controls, row2, plot, result, foot); host.appendChild(widget);

    function stopAnim() { if (animId) { cancelAnimationFrame(animId); animId = null; } }
    function drawMeans(values, n) {
      pBtns.forEach((b, i) => b.classList.toggle("is-active", parents[i] === parent));
      plot.replaceChildren();
      const left = 58, right = 606, top = 34, bottom = 260, bins = 26;
      const se = parent.sigma / Math.sqrt(n);
      const xmin = parent.xmin, xmax = parent.xmax;
      const counts = Array(bins).fill(0);
      values.forEach((v) => {
        const clamped = Math.min(xmax - 1e-9, Math.max(xmin, v));
        counts[Math.min(bins - 1, Math.max(0, Math.floor((clamped - xmin) / (xmax - xmin) * bins)))]++;
      });
      const bwData = (xmax - xmin) / bins;
      const pdfPeak = 1 / (se * Math.sqrt(2 * Math.PI));
      const theoMaxCount = Math.max(values.length, 100) * bwData * pdfPeak;
      const maxC = Math.max(1, ...counts, n > 1 ? theoMaxCount * 1.05 : 0);
      baseline(plot, left, right, bottom, top);
      const X = (v) => left + (v - xmin) / (xmax - xmin) * (right - left);
      const Y = (c) => bottom - c / maxC * (bottom - top - 8);
      const bwPx = (right - left) / bins;
      counts.forEach((count, i) => {
        const h = bottom - Y(count);
        const bar = add(plot, "rect", { x: (left + i * bwPx + 0.5).toFixed(1), y: Y(count).toFixed(1),
          width: Math.max(2, bwPx - 1).toFixed(1), height: Math.max(0, h).toFixed(1), class: "v-histogram" });
        add(bar, "title", {}, `${count} de ${values.length} medias`);
      });
      if (values.length >= 20 && n >= 2) {
        let d = "";
        for (let i = 0; i <= 120; i++) {
          const x = xmin + (xmax - xmin) * i / 120;
          const density = Math.exp(-0.5 * Math.pow((x - parent.mu) / se, 2)) / (se * Math.sqrt(2 * Math.PI));
          const expectedCount = values.length * bwData * density;
          d += `${i ? "L" : "M"}${X(x).toFixed(1)} ${Y(expectedCount).toFixed(1)}`;
        }
        add(plot, "path", { d, fill: "none", stroke: K_PAL.azul, "stroke-width": 3, "stroke-dasharray": "8 5" });
      }
      add(plot, "line", { x1: X(parent.mu).toFixed(1), y1: top, x2: X(parent.mu).toFixed(1), y2: bottom, class: "v-mean-line" });
      add(plot, "text", { x: Math.min(right - 140, X(parent.mu) + 7).toFixed(1), y: top + 14, class: "v-marker-label" }, `μ = ${fmt(parent.mu, 2)}`);
      parent.ticks.forEach((tk) => {
        add(plot, "line", { x1: X(tk).toFixed(1), y1: bottom, x2: X(tk).toFixed(1), y2: bottom + 5, class: "v-axis" });
        add(plot, "text", { x: X(tk).toFixed(1), y: bottom + 24, "text-anchor": "middle", class: "v-tick" }, Number.isInteger(tk) ? String(tk) : fmt(tk, 1));
      });
      // Recuadro mínimo de la población original en la esquina superior izquierda (sin recuadro pesado)
      const ix = 74, iw = 108, iy = 24, ih = 46;
      add(plot, "text", { x: ix, y: iy - 4, "font-size": 12, "font-weight": 700, fill: K_PAL.medio }, "Población origen");
      add(plot, "line", { x1: ix, y1: iy + ih, x2: ix + iw, y2: iy + ih, stroke: K_PAL.medio, "stroke-width": 1.5 });
      if (parent.key === "dado") {
        for (let k = 0; k < 6; k++) add(plot, "rect", { x: ix + 6 + k * 16, y: iy + 12, width: 12, height: ih - 12, fill: K_PAL.azul, "fill-opacity": 0.4 });
      } else if (parent.key === "exp") {
        let dd = ""; for (let k = 0; k <= 30; k++) { const xx = ix + k / 30 * iw, yy = iy + ih - (ih - 6) * Math.exp(-k / 9); dd += `${k ? "L" : "M"}${xx.toFixed(1)} ${yy.toFixed(1)}`; }
        add(plot, "path", { d: `${dd}L${ix + iw} ${iy + ih}L${ix} ${iy + ih}Z`, fill: K_PAL.azul, "fill-opacity": 0.25, stroke: K_PAL.azul, "stroke-width": 2 });
      } else if (parent.key === "u") {
        add(plot, "rect", { x: ix + 8, y: iy + 8, width: 18, height: ih - 8, fill: K_PAL.azul, "fill-opacity": 0.45 });
        add(plot, "rect", { x: ix + iw - 26, y: iy + 8, width: 18, height: ih - 8, fill: K_PAL.azul, "fill-opacity": 0.45 });
      } else {
        add(plot, "rect", { x: ix + 10, y: iy + 8, width: 18, height: ih - 8, fill: K_PAL.azul, "fill-opacity": 0.45 });
        add(plot, "rect", { x: ix + iw - 28, y: iy + ih - 12, width: 18, height: 12, fill: K_PAL.azul, "fill-opacity": 0.45 });
      }
      add(plot, "text", { x: (left + right) / 2, y: 318, "text-anchor": "middle", class: "v-axis-label" }, `media muestral x̄ (n = ${n})`);
      add(plot, "text", { x: left - 8, y: Y(maxC) + 6, "text-anchor": "end", class: "v-tick" }, String(Math.round(maxC)));
      add(plot, "text", { x: left - 8, y: bottom + 5, "text-anchor": "end", class: "v-tick" }, "0");
      result.textContent = `${parent.label} · n = ${n} · M = ${fmt(values.length, 0)} muestras · E(X̄) = ${fmt(parent.mu, 2)} · EE = σ/√n = ${fmt(se, 3)}`;
      plot.setAttribute("aria-label", `TCL con población ${parent.label}, tamaño ${n}, ${values.length} muestras`);
    }

    function sampleAll(total) {
      const n = Number(nSelect.value), seed = Number(seedInput.value) >>> 0;
      seedInput.value = String(seed);
      const random = seeded(seed);
      const values = [];
      for (let m = 0; m < total; m++) {
        let sum = 0;
        for (let i = 0; i < n; i++) sum += parent.sample(random);
        values.push(sum / n);
      }
      return { values, n };
    }
    function runSimulation(target) {
      stopAnim();
      const { values, n } = sampleAll(target || 1000);
      drawMeans(values, n);
    }
    function animateSimulation() {
      stopAnim();
      const { values, n } = sampleAll(1000);
      let shown = 0;
      const step = () => {
        shown = Math.min(values.length, shown + 30);
        drawMeans(values.slice(0, shown), n);
        if (shown < values.length) animId = requestAnimationFrame(step);
        else animId = null;
      };
      animId = requestAnimationFrame(step);
    }
    nSelect.addEventListener("change", () => runSimulation(1000));
    run.addEventListener("click", () => runSimulation(1000));
    animBtn.addEventListener("click", animateSimulation);
    reset.addEventListener("click", () => { seedInput.value = String(DEFAULT_SEED); runSimulation(1000); });
    runSimulation(1000);
  }

  function intervalos(host) {
    const widget = el("div", "widget widget-intervals");
    const controls = el("div", "widget-controls");
    const seedLabel = el("label", "widget-label", "Semilla");
    const seedInput = el("input");
    seedInput.type = "number"; seedInput.step = "1"; seedInput.min = "0"; seedInput.value = String(DEFAULT_SEED);
    seedLabel.appendChild(seedInput);
    const run = controlButton("Generar otra tanda de 40", true);
    const reset = controlButton("Restablecer semilla", false);
    controls.append(seedLabel, run, reset);
    const plot = makeSvg("0 0 660 330", "Cuarenta intervalos de confianza de 95 por ciento para una media normal; línea vertical en mu igual a treinta");
    const result = el("p", "widget-result");
    const foot = el("p", "widget-foot", "Cada segmento es una muestra independiente. El 95 % es cobertura del procedimiento bajo el modelo; el conteo de 40 cambia con la semilla.");
    const legend = el("p", "widget-legend", "Línea continua: contiene μ · Línea discontinua: no contiene μ");
    widget.append(controls, plot, result, legend, foot); host.appendChild(widget);
    function redraw() {
      const seed = Number(seedInput.value) >>> 0, random = seeded(seed);
      seedInput.value = String(seed);
      const mu = 30, sigma = 4, n = 16, se = sigma / Math.sqrt(n), half = 1.96 * se;
      const left = 62, right = 608, top = 28, bottom = 286;
      const x = (v) => left + (v - 24) / 12 * (right - left);
      plot.replaceChildren();
      add(plot, "line", { x1: x(mu), y1: top - 8, x2: x(mu), y2: bottom, class: "v-mu-line" });
      let covered = 0;
      for (let i = 0; i < 40; i++) {
        const sampleMean = mu + se * normal(random);
        const lo = sampleMean - half, hi = sampleMean + half;
        const includes = lo <= mu && mu <= hi;
        if (includes) covered++;
        const y = top + i * 6.2;
        const line = add(plot, "line", { x1: x(lo), y1: y, x2: x(hi), y2: y,
          class: includes ? "v-interval-covered" : "v-interval-missed" });
        add(line, "title", {}, `Intervalo ${i + 1}: ${fmt(lo, 2)} a ${fmt(hi, 2)}; ${includes ? "contiene" : "no contiene"} μ`);
        add(plot, "circle", { cx: x(sampleMean), cy: y, r: includes ? 1.9 : 2.6, class: includes ? "v-center-covered" : "v-center-missed" });
      }
      add(plot, "line", { x1: left, y1: bottom, x2: right, y2: bottom, class: "v-axis" });
      [24, 26, 28, 30, 32, 34, 36].forEach((tick) => {
        add(plot, "text", { x: x(tick), y: bottom + 24, "text-anchor": "middle", class: "v-tick" }, String(tick));
      });
      add(plot, "text", { x: x(mu) + 8, y: top - 10, class: "v-marker-label" }, "μ = 30");
      result.textContent = `${covered} de 40 intervalos contienen μ = 30 · IC nominal 95 % · μ = 30, σ = 4, n = 16, semilla ${seed}`;
      plot.setAttribute("aria-label", `${covered} de 40 intervalos contienen la media verdadera treinta; semilla ${seed}; línea vertical en treinta`);
    }
    run.addEventListener("click", () => { seedInput.value = String((Number(seedInput.value) + 1) >>> 0); redraw(); });
    seedInput.addEventListener("change", redraw);
    reset.addEventListener("click", () => { seedInput.value = String(DEFAULT_SEED); redraw(); });
    redraw();
  }

  function reliabilityDiagram(plot, top, parallel, r1, r2, result) {
    const lineClass = "v-wire", blockClass = "v-component";
    if (!parallel) {
      add(plot, "line", { x1: 50, y1: top + 45, x2: 130, y2: top + 45, class: lineClass });
      add(plot, "rect", { x: 130, y: top + 14, width: 112, height: 62, class: blockClass });
      add(plot, "line", { x1: 242, y1: top + 45, x2: 318, y2: top + 45, class: lineClass });
      add(plot, "rect", { x: 318, y: top + 14, width: 112, height: 62, class: blockClass });
      add(plot, "line", { x1: 430, y1: top + 45, x2: 525, y2: top + 45, class: lineClass });
      add(plot, "text", { x: 186, y: top + 52, "text-anchor": "middle", class: "v-component-label" }, `r₁ ${fmt(r1, 2)}`);
      add(plot, "text", { x: 374, y: top + 52, "text-anchor": "middle", class: "v-component-label" }, `r₂ ${fmt(r2, 2)}`);
    } else {
      add(plot, "line", { x1: 50, y1: top + 72, x2: 115, y2: top + 72, class: lineClass });
      add(plot, "line", { x1: 115, y1: top + 30, x2: 115, y2: top + 114, class: lineClass });
      add(plot, "line", { x1: 115, y1: top + 30, x2: 205, y2: top + 30, class: lineClass });
      add(plot, "line", { x1: 115, y1: top + 114, x2: 205, y2: top + 114, class: lineClass });
      add(plot, "rect", { x: 205, y: top, width: 122, height: 60, class: blockClass });
      add(plot, "rect", { x: 205, y: top + 84, width: 122, height: 60, class: blockClass });
      add(plot, "text", { x: 266, y: top + 37, "text-anchor": "middle", class: "v-component-label" }, `r₁ ${fmt(r1, 2)}`);
      add(plot, "text", { x: 266, y: top + 121, "text-anchor": "middle", class: "v-component-label" }, `r₂ ${fmt(r2, 2)}`);
      add(plot, "line", { x1: 327, y1: top + 30, x2: 430, y2: top + 30, class: lineClass });
      add(plot, "line", { x1: 327, y1: top + 114, x2: 430, y2: top + 114, class: lineClass });
      add(plot, "line", { x1: 430, y1: top + 30, x2: 430, y2: top + 114, class: lineClass });
      add(plot, "line", { x1: 430, y1: top + 72, x2: 525, y2: top + 72, class: lineClass });
    }
    add(plot, "text", { x: 568, y: top + (parallel ? 80 : 53), class: "v-reliability-result" }, fmt(result, 3));
  }

  function confiabilidad(host) {
    const widget = el("div", "widget widget-reliability");
    const controls = el("div", "widget-controls reliability-controls");
    const sliders = [1, 2].map((id) => {
      const label = el("label", "widget-label", `Componente r${id}`);
      const input = el("input"); input.type = "range"; input.min = "0"; input.max = "1"; input.step = ".01";
      input.value = id === 1 ? ".80" : ".90";
      const output = el("output", "slider-value");
      label.append(input, output); controls.appendChild(label);
      return { input, output };
    });
    const plot = makeSvg("0 0 640 425", "Dos componentes conectados en serie y en paralelo con confiabilidades ajustables");
    const result = el("p", "widget-result");
    const foot = el("p", "widget-foot", "Las expresiones suponen funcionamiento independiente de los dos componentes.");
    widget.append(controls, plot, result, foot); host.appendChild(widget);
    function redraw() {
      const r1 = Number(sliders[0].input.value), r2 = Number(sliders[1].input.value);
      sliders[0].output.textContent = fmt(r1, 2); sliders[1].output.textContent = fmt(r2, 2);
      const series = r1 * r2, parallel = 1 - (1 - r1) * (1 - r2);
      plot.replaceChildren();
      add(plot, "text", { x: 45, y: 32, class: "v-kicker" }, "Serie: deben funcionar ambos");
      reliabilityDiagram(plot, 52, false, r1, r2, series);
      add(plot, "line", { x1: 45, y1: 174, x2: 595, y2: 174, class: "v-divider" });
      add(plot, "text", { x: 45, y: 211, class: "v-kicker" }, "Paralelo: basta uno");
      reliabilityDiagram(plot, 226, true, r1, r2, parallel);
      result.textContent = `Serie: r₁r₂ = ${fmt(series, 3)} · Paralelo: 1 − (1−r₁)(1−r₂) = ${fmt(parallel, 3)}`;
      plot.setAttribute("aria-label", `Confiabilidad en serie ${fmt(series, 3)} y en paralelo ${fmt(parallel, 3)} con componentes ${fmt(r1, 2)} y ${fmt(r2, 2)}`);
    }
    sliders.forEach(({ input }) => input.addEventListener("input", redraw));
    redraw();
  }

  function binomial(host) {
    let showNormal = false;
    const widget = el("div", "widget widget-binomial");
    const controls = el("div", "widget-controls slider-control");
    const make = (text, min, max, step, value) => {
      const label = el("label", "widget-label", text);
      const input = el("input"); input.type = "range"; input.min = min; input.max = max; input.step = step; input.value = value;
      const output = el("output", "slider-value");
      label.append(input, output); controls.appendChild(label);
      return { input, output };
    };
    const nCtl = make("Ensayos, n", "1", "40", "1", "10");
    const pCtl = make("Probabilidad, p", "0.02", "0.98", "0.02", "0.30");
    const nBtn = controlButton("Superponer normal", false);
    nBtn.addEventListener("click", () => { showNormal = !showNormal; redraw(); });
    controls.appendChild(nBtn);
    const plot = makeSvg("0 0 640 330", "Función de probabilidad binomial con opción de superponer la campana normal");
    const result = el("p", "widget-result");
    widget.append(controls, plot, result); host.appendChild(widget);
    function redraw() {
      nBtn.classList.toggle("is-active", showNormal);
      const n = Number(nCtl.input.value), p = Number(pCtl.input.value);
      nCtl.output.textContent = String(n); pCtl.output.textContent = fmt(p, 2);
      const probs = []; let c = 1;
      for (let x = 0; x <= n; x++) { probs.push(c * Math.pow(p, x) * Math.pow(1 - p, n - x)); c = c * (n - x) / (x + 1); }
      const mean = n * p, sd = Math.sqrt(n * p * (1 - p));
      const normPeak = sd > 0 ? 1 / (sd * Math.sqrt(2 * Math.PI)) : 0;
      const max = Math.max(...probs, showNormal ? normPeak : 0), left = 58, right = 610, top = 30, bottom = 262;
      const step = (right - left) / (n + 1), barWidth = Math.max(3, Math.min(42, step * 0.64));
      const xc = (x) => left + step * (x + 0.5);
      const Y = (value) => bottom - value / max * (bottom - top - 12);
      plot.replaceChildren();
      baseline(plot, left, right, bottom, top);
      probs.forEach((value, x) => {
        const height = bottom - Y(value);
        const bar = add(plot, "rect", { x: (xc(x) - barWidth / 2).toFixed(1), y: Y(value).toFixed(1), width: barWidth.toFixed(1), height: height.toFixed(1), class: "v-histogram" });
        add(bar, "title", {}, `P(X = ${x}) = ${fmt(value, 4)}`);
        if (n <= 15 || x % 5 === 0) add(plot, "text", { x: xc(x).toFixed(1), y: bottom + 24, "text-anchor": "middle", class: "v-tick" }, String(x));
      });
      if (showNormal && sd > 0) {
        let d = "";
        for (let i = 0; i <= 140; i++) {
          const x = -0.4 + (n + 0.8) * i / 140;
          const nv = Math.exp(-0.5 * Math.pow((x - mean) / sd, 2)) / (sd * Math.sqrt(2 * Math.PI));
          d += `${i ? "L" : "M"}${xc(x).toFixed(1)} ${Y(nv).toFixed(1)}`;
        }
        add(plot, "path", { d, fill: "none", stroke: K_PAL.azul, "stroke-width": 3 });
      }
      const xm = left + step * (mean + 0.5);
      add(plot, "line", { x1: xm.toFixed(1), y1: top - 6, x2: xm.toFixed(1), y2: bottom, class: "v-mean-line" });
      add(plot, "text", { x: Math.min(right - 150, xm + 8).toFixed(1), y: top + 8, class: "v-marker-label" }, `E(X) = np = ${fmt(mean, 2)}`);
      add(plot, "text", { x: (left + right) / 2, y: 316, "text-anchor": "middle", class: "v-axis-label" }, "x, número de éxitos");
      add(plot, "text", { x: left - 8, y: Y(max) + 6, "text-anchor": "end", class: "v-tick" }, fmt(max, 2));
      result.textContent = `X ~ B(${n}; ${fmt(p, 2)}) · np = ${fmt(mean, 2)} · n(1 − p) = ${fmt(n * (1 - p), 2)} · σ = ${fmt(sd, 3)}`;
      plot.setAttribute("aria-label", `Binomial con n ${n} y p ${fmt(p, 2)}; valor esperado ${fmt(mean, 2)}`);
    }
    nCtl.input.addEventListener("input", redraw); pCtl.input.addEventListener("input", redraw);
    redraw();
  }

  function phi(z) {
    const y = Math.abs(z) / Math.SQRT2, t = 1 / (1 + 0.3275911 * y);
    const erf = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-y * y);
    return z >= 0 ? 0.5 * (1 + erf) : 0.5 * (1 - erf);
  }
  function invPhi(p) {
    let lo = -5, hi = 5;
    for (let i = 0; i < 42; i++) { const m = 0.5 * (lo + hi); if (phi(m) < p) lo = m; else hi = m; }
    return 0.5 * (lo + hi);
  }

  function normalWidget(host) {
    const presets = [
      { key: "concreto", label: "Concreto (28; 3)", mu: 28, muMin: 22, muMax: 34, muStep: 0.5, sg: 3, sgMin: 1.5, sgMax: 6, sgStep: 0.25, xmin: 16, xmax: 40, xStep: 0.1, xDef: 24.2, aDef: 25.0, bDef: 31.0, unit: "MPa", xlabel: "resistencia, MPa", dec: 1 },
      { key: "anillos", label: "Anillos (10; 0,03)", mu: 10, muMin: 9.94, muMax: 10.06, muStep: 0.01, sg: 0.03, sgMin: 0.015, sgMax: 0.06, sgStep: 0.005, xmin: 9.88, xmax: 10.12, xStep: 0.005, xDef: 10.075, aDef: 9.97, bDef: 10.03, unit: "cm", xlabel: "diámetro, cm", dec: 3 },
      { key: "std", label: "Estándar (0; 1)", mu: 0, muMin: -1.5, muMax: 1.5, muStep: 0.25, sg: 1, sgMin: 0.5, sgMax: 2, sgStep: 0.1, xmin: -3.5, xmax: 3.5, xStep: 0.05, xDef: 1.28, aDef: -1.0, bDef: 1.0, unit: "", xlabel: "valor x", dec: 2 }
    ];
    const modes = [
      { key: "le", label: "P(X ≤ x)" },
      { key: "ge", label: "P(X ≥ x)" },
      { key: "mid", label: "P(a ≤ X ≤ b)" },
      { key: "inv", label: "Inverso (p → x)" }
    ];
    let preset = presets[0], mode = modes[0];
    const widget = el("div", "widget widget-normal");
    const rowTop = el("div", "widget-controls");
    const pBtns = presets.map((p) => { const b = controlButton(p.label, p === preset); b.addEventListener("click", () => applyPreset(p)); rowTop.appendChild(b); return b; });
    const mBtns = modes.map((m) => { const b = controlButton(m.label, m === mode); b.addEventListener("click", () => { mode = m; syncSliders(); redraw(); }); rowTop.appendChild(b); return b; });
    const controls = el("div", "widget-controls slider-control");
    const make = (text, min, max, step, value) => {
      const label = el("label", "widget-label", text);
      const input = el("input"); input.type = "range"; input.min = min; input.max = max; input.step = step; input.value = value;
      input.style.width = "140px"; input.style.maxWidth = "100%";
      const output = el("output", "slider-value");
      label.append(input, output); controls.appendChild(label);
      return { label, input, output };
    };
    const muCtl = make("Media, μ", "22", "34", "0.5", "28");
    const sgCtl = make("Desv., σ", "1.5", "6", "0.25", "3");
    const x1Ctl = make("Límite x", "16", "40", "0.1", "24.2");
    const x2Ctl = make("Superior b", "16", "40", "0.1", "31.0");
    const pProbCtl = make("Área p", "0.01", "0.99", "0.01", "0.15");
    const plot = makeSvg("0 0 640 340", "Densidad normal con ejes sincronizados X y Z y área acumulada");
    const result = el("p", "widget-result");
    widget.append(rowTop, controls, plot, result); host.appendChild(widget);

    function applyPreset(p) {
      preset = p;
      muCtl.input.min = p.muMin; muCtl.input.max = p.muMax; muCtl.input.step = p.muStep; muCtl.input.value = p.mu;
      sgCtl.input.min = p.sgMin; sgCtl.input.max = p.sgMax; sgCtl.input.step = p.sgStep; sgCtl.input.value = p.sg;
      x1Ctl.input.min = p.xmin; x1Ctl.input.max = p.xmax; x1Ctl.input.step = p.xStep; x1Ctl.input.value = p.xDef;
      x2Ctl.input.min = p.xmin; x2Ctl.input.max = p.xmax; x2Ctl.input.step = p.xStep; x2Ctl.input.value = p.bDef;
      syncSliders();
      redraw();
    }
    function syncSliders() {
      const firstNode = x1Ctl.label.firstChild;
      if (firstNode) firstNode.nodeValue = mode.key === "mid" ? "Inferior a" : "Límite x";
      x1Ctl.label.style.display = mode.key === "inv" ? "none" : "flex";
      x2Ctl.label.style.display = mode.key === "mid" ? "flex" : "none";
      pProbCtl.label.style.display = mode.key === "inv" ? "flex" : "none";
      if (mode.key === "mid" && Number(x1Ctl.input.value) >= Number(x2Ctl.input.value)) {
        x1Ctl.input.value = preset.aDef; x2Ctl.input.value = preset.bDef;
      }
    }
    function redraw() {
      pBtns.forEach((b, i) => b.classList.toggle("is-active", presets[i] === preset));
      mBtns.forEach((b, i) => b.classList.toggle("is-active", modes[i] === mode));
      const mu = Number(muCtl.input.value), sg = Number(sgCtl.input.value);
      const dec = preset.dec;
      muCtl.output.textContent = fmt(mu, dec); sgCtl.output.textContent = fmt(sg, Math.max(dec, 2));
      const left = 40, right = 612, top = 24, bottom = 236;
      const lo = mu - 3.8 * sg, hi = mu + 3.8 * sg;
      const X = (x) => left + (x - lo) / (hi - lo) * (right - left);
      const f = (x) => Math.exp(-0.5 * Math.pow((x - mu) / sg, 2)) / (sg * Math.sqrt(2 * Math.PI));
      const ymax = f(mu) * 1.12, Y = (val) => bottom - val / ymax * (bottom - top);
      let a = lo, b = hi, prob = 0, labelText = "";
      if (mode.key === "le") {
        const x0 = Number(x1Ctl.input.value); x1Ctl.output.textContent = fmt(x0, dec);
        b = x0; prob = phi((x0 - mu) / sg);
        labelText = `z = (${fmt(x0, dec)} − ${fmt(mu, dec)}) / ${fmt(sg, dec)} = ${fmtSigned((x0 - mu) / sg, 2)} · Φ(z) = ${fmt(prob, 4)}`;
      } else if (mode.key === "ge") {
        const x0 = Number(x1Ctl.input.value); x1Ctl.output.textContent = fmt(x0, dec);
        a = x0; prob = 1 - phi((x0 - mu) / sg);
        labelText = `z = ${fmtSigned((x0 - mu) / sg, 2)} · P(X ≥ ${fmt(x0, dec)}) = 1 − Φ(z) = ${fmt(prob, 4)}`;
      } else if (mode.key === "mid") {
        const xa = Number(x1Ctl.input.value), xb = Number(x2Ctl.input.value);
        a = Math.min(xa, xb); b = Math.max(xa, xb);
        x1Ctl.output.textContent = fmt(a, dec); x2Ctl.output.textContent = fmt(b, dec);
        const z1 = (a - mu) / sg, z2 = (b - mu) / sg;
        prob = phi(z2) - phi(z1);
        labelText = `z₁ = ${fmtSigned(z1, 2)}, z₂ = ${fmtSigned(z2, 2)} · Φ(z₂) − Φ(z₁) = ${fmt(prob, 4)}`;
      } else {
        const pTarget = Number(pProbCtl.input.value); pProbCtl.output.textContent = fmt(pTarget, 2);
        const zp = invPhi(pTarget), xp = mu + zp * sg;
        b = xp; prob = pTarget;
        labelText = `Área ${fmt(pTarget, 2)} → z = ${fmtSigned(zp, 2)} → x = μ + zσ = ${fmt(xp, Math.max(dec, 2))} ${preset.unit}`.trim();
      }
      plot.replaceChildren();
      const ca = Math.max(lo, Math.min(hi, a)), cb = Math.max(lo, Math.min(hi, b));
      if (cb > ca) {
        let area = `M${X(ca).toFixed(1)} ${bottom}`;
        for (let i = 0; i <= 90; i++) { const x = ca + (cb - ca) * i / 90; area += `L${X(x).toFixed(1)} ${Y(f(x)).toFixed(1)}`; }
        area += `L${X(cb).toFixed(1)} ${bottom}Z`;
        add(plot, "path", { d: area, class: "v-area" });
      }
      let curve = "";
      for (let i = 0; i <= 140; i++) { const x = lo + (hi - lo) * i / 140; curve += `${i ? "L" : "M"}${X(x).toFixed(1)} ${Y(f(x)).toFixed(1)}`; }
      add(plot, "path", { d: curve, class: "v-wire" });
      add(plot, "line", { x1: left, y1: bottom, x2: right, y2: bottom, class: "v-axis" });
      add(plot, "line", { x1: X(mu).toFixed(1), y1: top, x2: X(mu).toFixed(1), y2: bottom, class: "v-mean-line" });
      [-3, -2, -1, 0, 1, 2, 3].forEach((zv) => {
        const xv = mu + zv * sg, xp = X(xv);
        add(plot, "line", { x1: xp.toFixed(1), y1: bottom, x2: xp.toFixed(1), y2: bottom + 5, class: "v-axis" });
        add(plot, "text", { x: xp.toFixed(1), y: bottom + 21, "text-anchor": "middle", class: "v-tick" }, fmt(xv, dec === 3 ? 2 : dec));
        add(plot, "text", { x: xp.toFixed(1), y: bottom + 52, "text-anchor": "middle", "font-size": 15, "font-weight": 700, fill: K_PAL.azul }, zv === 0 ? "0" : fmtSigned(zv, 0));
      });
      add(plot, "line", { x1: left, y1: bottom + 31, x2: right, y2: bottom + 31, stroke: K_PAL.azul, "stroke-width": 1.5 });
      add(plot, "text", { x: left, y: bottom + 21, "font-size": 14, "font-weight": 700, fill: K_PAL.tinta }, "X:");
      add(plot, "text", { x: left, y: bottom + 52, "font-size": 14, "font-weight": 700, fill: K_PAL.azul }, "Z:");
      if (mode.key !== "mid" && b < hi && b > lo) add(plot, "line", { x1: X(b).toFixed(1), y1: Y(f(b)).toFixed(1), x2: X(b).toFixed(1), y2: bottom, stroke: K_PAL.verde, "stroke-width": 3 });
      if (mode.key === "ge" && a > lo && a < hi) add(plot, "line", { x1: X(a).toFixed(1), y1: Y(f(a)).toFixed(1), x2: X(a).toFixed(1), y2: bottom, stroke: K_PAL.verde, "stroke-width": 3 });
      add(plot, "text", { x: (left + right) / 2, y: 326, "text-anchor": "middle", class: "v-axis-label" }, `${preset.xlabel}  ↔  escala estandarizada Z = (X − μ)/σ`);
      result.textContent = labelText;
      plot.setAttribute("aria-label", `Normal media ${fmt(mu, dec)} y desviación ${fmt(sg, dec)}: ${labelText}`);
    }
    [muCtl, sgCtl, x1Ctl, x2Ctl, pProbCtl].forEach((c) => c.input.addEventListener("input", redraw));
    applyPreset(presets[0]);
  }

  const CILINDROS = [22.9, 24.1, 24.8, 25.6, 26.0, 26.4, 26.9, 27.2, 27.5, 27.9, 28.2, 28.4, 28.9, 29.3, 29.8, 30.4, 30.9, 31.6, 32.5, 34.3];
  const K_PAL = { azul: "#1F5FA8", verde: "#2F6B2A", rojo: "#A61C31", ocre: "#A85400", morado: "#6B3FA0", gris: "#B1B2B0", tinta: "#1e231f", medio: "#565A5C" };

  function makeSlider(controls, text, min, max, step, value) {
    const label = el("label", "widget-label", text);
    const input = el("input");
    input.type = "range"; input.min = min; input.max = max; input.step = step; input.value = value;
    input.style.width = "185px"; input.style.maxWidth = "100%";
    const output = el("output", "slider-value");
    label.append(input, output); controls.appendChild(label);
    return { label, input, output };
  }

  function mathApi() {
    if (window.Fig) return window.Fig;
    const lgamma = (x) => {
      const c = [76.18009172947146, -86.50532032941677, 24.01409824083091, -1.231739572450155, 0.001208650973866179, -0.000005395239384953];
      let y = x, tmp = x + 5.5; tmp -= (x + 0.5) * Math.log(tmp);
      let ser = 1.000000000190015;
      for (let j = 0; j < 6; j++) ser += c[j] / ++y;
      return -tmp + Math.log(2.5066282746310005 * ser / x);
    };
    const tpdf = (nu) => (x) => Math.exp(lgamma((nu + 1) / 2) - lgamma(nu / 2)) / Math.sqrt(nu * Math.PI) * Math.pow(1 + x * x / nu, -(nu + 1) / 2);
    const simpson = (f, a, b, n) => {
      const steps = n || 2000, h = (b - a) / steps;
      let s = f(a) + f(b);
      for (let i = 1; i < steps; i++) s += f(a + i * h) * (i % 2 ? 4 : 2);
      return s * h / 3;
    };
    const tcdf = (x, nu) => 0.5 + Math.sign(x) * simpson(tpdf(nu), 0, Math.abs(x), 800);
    const tCrit = (alpha, nu) => {
      let lo = -60, hi = 60, p = 1 - alpha;
      for (let i = 0; i < 60; i++) { const m = (lo + hi) / 2; if (tcdf(m, nu) < p) lo = m; else hi = m; }
      return (lo + hi) / 2;
    };
    const chi2pdf = (nu) => (x) => (x <= 0 ? 0 : Math.exp((nu / 2 - 1) * Math.log(x) - x / 2 - (nu / 2) * Math.LN2 - lgamma(nu / 2)));
    const chi2cdf = (x, nu) => (x <= 0 ? 0 : simpson(chi2pdf(nu), 1e-8, x, 1200));
    const chi2Crit = (alpha, nu) => {
      let lo = 0, hi = 20 * nu + 60, p = 1 - alpha;
      for (let i = 0; i < 60; i++) { const m = (lo + hi) / 2; if (chi2cdf(m, nu) < p) lo = m; else hi = m; }
      return (lo + hi) / 2;
    };
    const resumen = (data) => {
      const x = [...data].sort((a, b) => a - b), n = x.length, mean = x.reduce((a, b) => a + b, 0) / n;
      const s2 = x.reduce((a, b) => a + (b - mean) * (b - mean), 0) / (n - 1);
      return { x, n, mean, s2, s: Math.sqrt(s2), median: (x[Math.floor((n - 1) / 2)] + x[Math.floor(n / 2)]) / 2 };
    };
    return { lgamma, tpdf, tcdf, tCrit, chi2pdf, chi2Crit, simpson, resumen };
  }

  function histograma(host) {
    const M = mathApi(), data = (window.Fig && window.Fig.CILINDROS) || CILINDROS;
    const stats = M.resumen(data);
    const options = [
      { width: 1, label: "1 MPa (14 clases)" },
      { width: 2, label: "2 MPa (7 clases)" },
      { width: 3.5, label: "3,5 MPa (4 clases)" },
      { width: 7, label: "7 MPa (2 clases)" }
    ];
    let selected = options[1];
    const widget = el("div", "widget widget-histograma");
    const controls = el("div", "widget-controls");
    const buttons = options.map((opt) => {
      const b = controlButton(opt.label, opt === selected);
      b.addEventListener("click", () => { selected = opt; redraw(); });
      controls.appendChild(b);
      return b;
    });
    const plot = makeSvg("0 0 640 330", "Histograma interactivo de las veinte resistencias con ancho de clase ajustable");
    const result = el("p", "widget-result");
    widget.append(controls, plot, result);
    host.appendChild(widget);
    function redraw() {
      buttons.forEach((b, i) => b.classList.toggle("is-active", options[i] === selected));
      const xmin = 22, xmax = 36, width = selected.width, nb = Math.round((xmax - xmin) / width);
      const counts = Array(nb).fill(0);
      data.forEach((v) => { const idx = Math.min(nb - 1, Math.max(0, Math.floor((v - xmin) / width))); counts[idx]++; });
      const max = Math.max(1, ...counts), left = 56, right = 608, top = 34, bottom = 266, bw = (right - left) / nb;
      const X = (v) => left + (v - xmin) / (xmax - xmin) * (right - left);
      plot.replaceChildren();
      baseline(plot, left, right, bottom, top);
      counts.forEach((c, i) => {
        const h = c / max * (bottom - top - 24), x = left + i * bw;
        const bar = add(plot, "rect", { x: (x + 1.5).toFixed(1), y: (bottom - h).toFixed(1), width: Math.max(2, bw - 3).toFixed(1), height: h.toFixed(1), class: "v-histogram" });
        add(bar, "title", {}, `${fmt(xmin + i * width, width === 3.5 ? 1 : 0)} a ${fmt(xmin + (i + 1) * width, width === 3.5 ? 1 : 0)} MPa: ${c} cilindros`);
        if (c > 0) add(plot, "text", { x: (x + bw / 2).toFixed(1), y: (bottom - h - 8).toFixed(1), "text-anchor": "middle", "font-size": 19, "font-weight": 700, fill: K_PAL.verde }, String(c));
      });
      const xm = X(stats.mean);
      add(plot, "line", { x1: xm.toFixed(1), y1: top - 4, x2: xm.toFixed(1), y2: bottom, class: "v-mean-line" });
      add(plot, "text", { x: (xm + 8).toFixed(1), y: top + 12, class: "v-marker-label" }, `x̄ = ${fmt(stats.mean, 2)}`);
      for (let i = 0; i <= nb; i++) {
        if (nb > 8 && i % 2 === 1) continue;
        const val = xmin + i * width;
        add(plot, "text", { x: (left + i * bw).toFixed(1), y: bottom + 24, "text-anchor": "middle", class: "v-tick" }, fmt(val, width === 3.5 && val % 1 !== 0 ? 1 : 0));
      }
      add(plot, "text", { x: left - 10, y: top + 6, "text-anchor": "end", class: "v-tick" }, String(max));
      add(plot, "text", { x: left - 10, y: bottom + 5, "text-anchor": "end", class: "v-tick" }, "0");
      add(plot, "text", { x: (left + right) / 2, y: 318, "text-anchor": "middle", class: "v-axis-label" }, "resistencia, MPa");
      result.textContent = `Ancho = ${fmt(width, width === 3.5 ? 1 : 0)} MPa · ${nb} clases · x̄ = ${fmt(stats.mean, 2)} MPa · s = ${fmt(stats.s, 2)} MPa`;
      plot.setAttribute("aria-label", `Histograma con ${nb} clases de ${fmt(width, width === 3.5 ? 1 : 0)} megapascales`);
    }
    redraw();
  }

  function atipico(host) {
    const data = (window.Fig && window.Fig.CILINDROS) || CILINDROS;
    const base = data.slice(0, 19);
    const widget = el("div", "widget widget-atipico");
    const controls = el("div", "widget-controls slider-control");
    const ctl = makeSlider(controls, "Dato 20 (MPa)", "28", "56", "0.1", "54.3");
    const btnOk = controlButton("Sin errata (34,3)", false);
    const btnErr = controlButton("Con errata (54,3)", true);
    controls.append(btnOk, btnErr);
    const plot = makeSvg("0 0 640 330", "Diagrama de puntos con dato 20 ajustable; la media se mueve y la mediana permanece");
    const result = el("p", "widget-result");
    widget.append(controls, plot, result);
    host.appendChild(widget);
    function redraw() {
      const x20 = Number(ctl.input.value);
      ctl.output.textContent = fmt(x20, 1);
      btnOk.classList.toggle("is-active", Math.abs(x20 - 34.3) < 0.05);
      btnErr.classList.toggle("is-active", Math.abs(x20 - 54.3) < 0.05);
      const arr = [...base, x20], sorted = [...arr].sort((a, b) => a - b);
      const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
      const median = (sorted[9] + sorted[10]) / 2;
      const trimmed = sorted.slice(2, 18).reduce((a, b) => a + b, 0) / 16;
      const left = 42, right = 610, baseLine = 252, xmin = 20, xmax = 56, r = 8, step = (xmax - xmin) / 44;
      const X = (v) => left + (v - xmin) / (xmax - xmin) * (right - left);
      const stacks = {};
      plot.replaceChildren();
      [...base].sort((a, b) => a - b).forEach((v) => {
        const key = Math.round((v - xmin) / step);
        stacks[key] = (stacks[key] || 0) + 1;
        add(plot, "circle", { cx: X(v).toFixed(1), cy: baseLine - r - (stacks[key] - 1) * (2 * r + 3), r, fill: K_PAL.verde });
      });
      const key20 = Math.round((x20 - xmin) / step);
      stacks[key20] = (stacks[key20] || 0) + 1;
      add(plot, "circle", { cx: X(x20).toFixed(1), cy: baseLine - r - (stacks[key20] - 1) * (2 * r + 3), r: 10.5, fill: K_PAL.ocre, stroke: "#fff", "stroke-width": 2 });
      add(plot, "line", { x1: left, y1: baseLine + 6, x2: right, y2: baseLine + 6, class: "v-axis" });
      [20, 28, 36, 44, 52, 56].forEach((tick) => add(plot, "text", { x: X(tick).toFixed(1), y: baseLine + 32, "text-anchor": "middle", class: "v-tick" }, String(tick)));
      const xMed = X(median), xMean = X(mean);
      add(plot, "line", { x1: xMed.toFixed(1), y1: 58, x2: xMed.toFixed(1), y2: baseLine + 6, stroke: K_PAL.rojo, "stroke-width": 3, "stroke-dasharray": "9 6" });
      add(plot, "text", { x: (xMed - 8).toFixed(1), y: 74, "text-anchor": "end", "font-size": 20, "font-weight": 700, fill: K_PAL.rojo }, `mediana ${fmt(median, 2)}`);
      add(plot, "line", { x1: xMean.toFixed(1), y1: 30, x2: xMean.toFixed(1), y2: baseLine + 6, stroke: K_PAL.azul, "stroke-width": 3.5 });
      add(plot, "text", { x: (xMean + 8).toFixed(1), y: 44, "text-anchor": "start", "font-size": 20, "font-weight": 700, fill: K_PAL.azul }, `media ${fmt(mean, 2)}`);
      add(plot, "text", { x: (left + right) / 2, y: 318, "text-anchor": "middle", class: "v-axis-label" }, "resistencia, MPa (naranja: dato 20)");
      result.textContent = `Dato 20 = ${fmt(x20, 1)} MPa · Media x̄ = ${fmt(mean, 2)} MPa · Mediana = ${fmt(median, 2)} MPa · Media recortada (10 %) = ${fmt(trimmed, 2)} MPa`;
      plot.setAttribute("aria-label", `Dato 20 igual a ${fmt(x20, 1)}; media ${fmt(mean, 2)} y mediana ${fmt(median, 2)}`);
    }
    ctl.input.addEventListener("input", redraw);
    btnOk.addEventListener("click", () => { ctl.input.value = "34.3"; redraw(); });
    btnErr.addEventListener("click", () => { ctl.input.value = "54.3"; redraw(); });
    redraw();
  }

  function pvalor(host) {
    const M = mathApi(), data = (window.Fig && window.Fig.CILINDROS) || CILINDROS;
    const stats = M.resumen(data), nu = stats.n - 1, se = stats.s / Math.sqrt(stats.n), pdf = M.tpdf(nu);
    const modes = [
      { key: "two", label: "Bilateral (≠ 28)" },
      { key: "left", label: "Cola izq. (< 28)" },
      { key: "right", label: "Cola der. (> 28)" }
    ];
    let mode = modes[0];
    const widget = el("div", "widget widget-pvalor");
    const controls = el("div", "widget-controls slider-control");
    const ctl = makeSlider(controls, "Media muestral x̄", "25.5", "30.5", "0.02", "28.18");
    const buttons = modes.map((m) => {
      const b = controlButton(m.label, m === mode);
      b.addEventListener("click", () => { mode = m; redraw(); });
      controls.appendChild(b);
      return b;
    });
    const plot = makeSvg("0 0 640 330", "Distribución t con 19 grados de libertad y área del valor p");
    const result = el("p", "widget-result");
    widget.append(controls, plot, result);
    host.appendChild(widget);
    function redraw() {
      buttons.forEach((b, i) => b.classList.toggle("is-active", modes[i] === mode));
      const xbar = Number(ctl.input.value);
      ctl.output.textContent = fmt(xbar, 2);
      const t = (xbar - 28) / se;
      let pval = 0;
      if (mode.key === "two") pval = 2 * (1 - M.tcdf(Math.abs(t), nu));
      else if (mode.key === "left") pval = M.tcdf(t, nu);
      else pval = 1 - M.tcdf(t, nu);
      const left = 42, right = 610, top = 28, bottom = 264, lo = -4.2, hi = 4.2, ymax = pdf(0) * 1.08;
      const X = (v) => left + (v - lo) / (hi - lo) * (right - left);
      const Y = (v) => bottom - Math.min(v, ymax) / ymax * (bottom - top);
      const shade = (a, b) => {
        const ca = Math.max(lo, a), cb = Math.min(hi, b);
        if (cb <= ca) return;
        let d = `M${X(ca).toFixed(1)} ${bottom}`;
        for (let i = 0; i <= 50; i++) { const vx = ca + (cb - ca) * i / 50; d += `L${X(vx).toFixed(1)} ${Y(pdf(vx)).toFixed(1)}`; }
        d += `L${X(cb).toFixed(1)} ${bottom}Z`;
        add(plot, "path", { d, fill: K_PAL.rojo, "fill-opacity": 0.34 });
      };
      plot.replaceChildren();
      if (mode.key === "two") { shade(lo, -Math.abs(t)); shade(Math.abs(t), hi); }
      else if (mode.key === "left") shade(lo, t);
      else shade(t, hi);
      let curve = "";
      for (let i = 0; i <= 140; i++) {
        const vx = lo + (hi - lo) * i / 140;
        curve += `${i ? "L" : "M"}${X(vx).toFixed(1)} ${Y(pdf(vx)).toFixed(1)}`;
      }
      add(plot, "path", { d: curve, fill: "none", stroke: K_PAL.tinta, "stroke-width": 3 });
      add(plot, "line", { x1: left, y1: bottom, x2: right, y2: bottom, class: "v-axis" });
      const tc = Math.max(lo, Math.min(hi, t));
      add(plot, "line", { x1: X(tc).toFixed(1), y1: top, x2: X(tc).toFixed(1), y2: bottom, stroke: K_PAL.morado, "stroke-width": 3, "stroke-dasharray": "8 5" });
      add(plot, "text", { x: Math.min(right - 90, Math.max(left + 10, X(tc) + (tc > 2.4 ? -8 : 8))), y: top + 16, "text-anchor": tc > 2.4 ? "end" : "start", "font-size": 20, "font-weight": 700, fill: K_PAL.morado }, `t = ${fmtSigned(t, 2)}`);
      [-4, -3, -2, -1, 0, 1, 2, 3, 4].forEach((tick) => add(plot, "text", { x: X(tick).toFixed(1), y: bottom + 24, "text-anchor": "middle", class: "v-tick" }, fmtSigned(tick, 0)));
      add(plot, "text", { x: (left + right) / 2, y: 318, "text-anchor": "middle", class: "v-axis-label" }, "t con 19 grados de libertad (H₀: μ = 28)");
      const dec = pval < 0.05 ? "se rechaza H₀" : "no se rechaza H₀";
      result.textContent = `x̄ = ${fmt(xbar, 2)} MPa · t = ${fmtSigned(t, 2)} (19 g. l.) · valor p = ${fmt(pval, 4)} · Al 5 %: ${dec}`;
      plot.setAttribute("aria-label", `Estadístico t ${fmtSigned(t, 2)} y valor p ${fmt(pval, 4)}`);
    }
    ctl.input.addEventListener("input", redraw);
    redraw();
  }

  function dosmedias(host) {
    const M = mathApi(), A = (window.Fig && window.Fig.CILINDROS) || CILINDROS;
    const Bbase = [26.3, 27.4, 28.1, 28.8, 29.2, 29.6, 30.0, 30.3, 30.6, 30.9, 31.3, 31.7, 32.2, 32.8, 33.6, 34.9];
    const RA = M.resumen(A), RBbase = M.resumen(Bbase), n = RA.n, m = RBbase.n;
    const se = Math.sqrt(RA.s2 / n + RBbase.s2 / m);
    const nu = Math.pow(RA.s2 / n + RBbase.s2 / m, 2) / (Math.pow(RA.s2, 2) / (n * n * (n - 1)) + Math.pow(RBbase.s2, 2) / (m * m * (m - 1)));
    const tc = M.tCrit(0.025, nu);
    const widget = el("div", "widget widget-dosmedias");
    const controls = el("div", "widget-controls slider-control");
    const ctl = makeSlider(controls, "Cambio en planta B (Δ MPa)", "-3.0", "2.0", "0.1", "0.0");
    const reset = controlButton("Original (Δ = 0)", true);
    controls.appendChild(reset);
    const plot = makeSvg("0 0 640 330", "Comparación de dos plantas y su intervalo de confianza de Welch");
    const result = el("p", "widget-result");
    widget.append(controls, plot, result);
    host.appendChild(widget);
    function redraw() {
      const delta = Number(ctl.input.value);
      ctl.output.textContent = (delta > 0 ? "+" : "") + fmtSigned(delta, 1);
      reset.classList.toggle("is-active", Math.abs(delta) < 0.05);
      const B = Bbase.map((v) => v + delta), meanB = RBbase.mean + delta;
      const dif = RA.mean - meanB, lo = dif - tc * se, hi = dif + tc * se, t = dif / se, pv = 2 * (1 - M.tcdf(Math.abs(t), nu));
      const left = 46, right = 608, X = (v) => left + (v - 20) / 18 * (right - left);
      const r = 6.5, step = 18 / 44;
      const drawRow = (arr, base, color) => {
        const st = {};
        arr.forEach((v) => {
          const key = Math.round((v - 20) / step);
          st[key] = (st[key] || 0) + 1;
          add(plot, "circle", { cx: X(v).toFixed(1), cy: base - r - (st[key] - 1) * (2 * r + 2.5), r, fill: color });
        });
        add(plot, "line", { x1: left, y1: base + 4, x2: right, y2: base + 4, class: "v-axis" });
      };
      plot.replaceChildren();
      drawRow(A, 92, K_PAL.azul);
      drawRow(B, 178, K_PAL.ocre);
      add(plot, "line", { x1: X(RA.mean).toFixed(1), y1: 24, x2: X(RA.mean).toFixed(1), y2: 96, stroke: K_PAL.azul, "stroke-width": 3 });
      add(plot, "text", { x: (X(RA.mean) - 8).toFixed(1), y: 22, "text-anchor": "end", "font-size": 19, "font-weight": 700, fill: K_PAL.azul }, `A · x̄ = ${fmt(RA.mean, 2)}`);
      add(plot, "line", { x1: X(meanB).toFixed(1), y1: 112, x2: X(meanB).toFixed(1), y2: 182, stroke: K_PAL.ocre, "stroke-width": 3, "stroke-dasharray": "8 5" });
      add(plot, "text", { x: (X(meanB) + 8).toFixed(1), y: 112, "font-size": 19, "font-weight": 700, fill: K_PAL.ocre }, `B · ȳ = ${fmt(meanB, 2)}`);
      [20, 24, 28, 32, 36].forEach((tk) => add(plot, "text", { x: X(tk).toFixed(1), y: 202, "text-anchor": "middle", class: "v-tick" }, String(tk)));
      add(plot, "line", { x1: left, y1: 218, x2: right, y2: 218, class: "v-divider" });
      const xd = (v) => left + (v + 6) / 9 * (right - left), yci = 266, coveredZero = lo <= 0 && 0 <= hi;
      add(plot, "line", { x1: xd(0).toFixed(1), y1: 228, x2: xd(0).toFixed(1), y2: 294, stroke: K_PAL.rojo, "stroke-width": 2.5, "stroke-dasharray": "7 5" });
      add(plot, "text", { x: (xd(0) + 7).toFixed(1), y: 240, "font-size": 17, "font-weight": 700, fill: K_PAL.rojo }, "0 (sin diferencia)");
      add(plot, "line", { x1: xd(lo).toFixed(1), y1: yci, x2: xd(hi).toFixed(1), y2: yci, stroke: coveredZero ? K_PAL.medio : K_PAL.azul, "stroke-width": 5 });
      add(plot, "line", { x1: xd(lo).toFixed(1), y1: yci - 12, x2: xd(lo).toFixed(1), y2: yci + 12, stroke: coveredZero ? K_PAL.medio : K_PAL.azul, "stroke-width": 4 });
      add(plot, "line", { x1: xd(hi).toFixed(1), y1: yci - 12, x2: xd(hi).toFixed(1), y2: yci + 12, stroke: coveredZero ? K_PAL.medio : K_PAL.azul, "stroke-width": 4 });
      add(plot, "circle", { cx: xd(dif).toFixed(1), cy: yci, r: 7, fill: K_PAL.verde });
      add(plot, "line", { x1: left, y1: 294, x2: right, y2: 294, class: "v-axis" });
      [-6, -4, -2, 0, 2].forEach((tk) => add(plot, "text", { x: xd(tk).toFixed(1), y: 316, "text-anchor": "middle", class: "v-tick" }, fmtSigned(tk, 0)));
      add(plot, "text", { x: left, y: 240, "font-size": 17, "font-weight": 700, fill: K_PAL.tinta }, "IC 95 % para μ_A − μ_B");
      result.textContent = `x̄ − ȳ = ${fmtSigned(dif, 2)} MPa · IC 95 %: [${fmtSigned(lo, 2)}; ${fmtSigned(hi, 2)}] · EE = ${fmt(se, 3)} MPa · gl ≈ ${fmt(nu, 2)}`;
      plot.setAttribute("aria-label", `Diferencia de medias ${fmtSigned(dif, 2)} e intervalo de confianza del 95 % de ${fmt(lo, 3)} a ${fmt(hi, 3)} MPa`);
    }
    ctl.input.addEventListener("input", redraw);
    reset.addEventListener("click", () => { ctl.input.value = "0.0"; redraw(); });
    redraw();
  }

  function regresion(host) {
    // Datos de pureza del oxígeno de Montgomery y Runger (ejemplo 11-1).
    const X = [0.99, 1.02, 1.15, 1.29, 1.46, 1.36, 0.87, 1.23, 1.55, 1.40, 1.19, 1.15, 0.98, 1.01, 1.11, 1.20, 1.26, 1.32, 1.43, 0.95];
    const Y = [90.01, 89.05, 91.43, 93.74, 96.73, 94.45, 87.59, 91.77, 99.42, 93.65, 93.54, 92.52, 90.56, 89.54, 89.85, 90.39, 93.25, 93.41, 94.98, 87.33];
    const n = X.length, xb = X.reduce((a, b) => a + b, 0) / n, yb = Y.reduce((a, b) => a + b, 0) / n;
    const Sxx = X.reduce((a, v) => a + (v - xb) * (v - xb), 0);
    const Sxy = X.reduce((a, v, i) => a + (v - xb) * (Y[i] - yb), 0);
    const b1Opt = Sxy / Sxx, b0Opt = yb - b1Opt * xb;
    const sseMin = Y.reduce((a, v, i) => a + Math.pow(v - (b0Opt + b1Opt * X[i]), 2), 0);
    const b1Def = (Math.round(b1Opt * 50) / 50).toFixed(2), b0Def = (Math.round(b0Opt * 50) / 50).toFixed(2);
    let showSquares = true;
    const widget = el("div", "widget widget-regresion");
    const controls = el("div", "widget-controls slider-control");
    const b1Ctl = makeSlider(controls, "Pendiente b₁", "0", "30", "0.02", b1Def);
    const b0Ctl = makeSlider(controls, "Ordenada b₀", "60", "92", "0.02", b0Def);
    const btnMin = controlButton("Mínimos cuadrados", true);
    const btnAlt = controlButton("Otra recta (b₁ = 8)", false);
    const btnSq = controlButton("Cuadrados eᵢ²", true);
    controls.append(btnMin, btnAlt, btnSq);
    const plot = makeSvg("0 0 640 330", "Recta candidata y cuadrados de los residuos sobre los veinte datos de pureza del oxígeno");
    const result = el("p", "widget-result");
    widget.append(controls, plot, result);
    host.appendChild(widget);
    function redraw() {
      const b1 = Number(b1Ctl.input.value), b0 = Number(b0Ctl.input.value);
      b1Ctl.output.textContent = fmtSigned(b1, 2);
      b0Ctl.output.textContent = fmt(b0, 2);
      btnMin.classList.toggle("is-active", Math.abs(b1 - Number(b1Def)) < 0.05 && Math.abs(b0 - Number(b0Def)) < 0.05);
      btnAlt.classList.toggle("is-active", Math.abs(b1 - 8) < 0.05 && Math.abs(b0 - 82.59) < 0.1);
      btnSq.classList.toggle("is-active", showSquares);
      const fit = (x) => b0 + b1 * x, fitOpt = (x) => b0Opt + b1Opt * x;
      const Q = Y.reduce((a, v, i) => a + Math.pow(v - fit(X[i]), 2), 0);
      const left = 64, right = 610, top = 22, bottom = 266, x0 = 0.8, x1 = 1.6;
      const y0 = Math.max(70, Math.min(86, fit(x0), fit(x1), fitOpt(x0), fitOpt(x1)) - 1);
      const y1 = Math.min(115, Math.max(100, fit(x0), fit(x1), fitOpt(x0), fitOpt(x1)) + 1);
      const PX = (x) => left + (x - x0) / (x1 - x0) * (right - left);
      const PY = (y) => bottom - (y - y0) / (y1 - y0) * (bottom - top);
      plot.replaceChildren();
      baseline(plot, left, right, bottom, top);
      if (Math.abs(Q - sseMin) > 1) {
        add(plot, "line", { x1: PX(x0).toFixed(1), y1: PY(fitOpt(x0)).toFixed(1), x2: PX(x1).toFixed(1), y2: PY(fitOpt(x1)).toFixed(1), stroke: K_PAL.gris, "stroke-width": 2.5, "stroke-dasharray": "8 6" });
      }
      if (showSquares) {
        X.forEach((x, i) => {
          const px = PX(x), yd = PY(Y[i]), yh = PY(fit(x)), dy = Math.abs(yd - yh);
          if (dy > 1) {
            const rx = px + dy > right ? px - dy : px;
            add(plot, "rect", { x: rx.toFixed(1), y: Math.min(yd, yh).toFixed(1), width: dy.toFixed(1), height: dy.toFixed(1), fill: K_PAL.rojo, "fill-opacity": 0.14, stroke: K_PAL.rojo, "stroke-opacity": 0.55, "stroke-width": 1.4 });
          }
        });
      }
      X.forEach((x, i) => {
        add(plot, "line", { x1: PX(x).toFixed(1), y1: PY(Y[i]).toFixed(1), x2: PX(x).toFixed(1), y2: PY(fit(x)).toFixed(1), stroke: K_PAL.rojo, "stroke-width": 3.5 });
      });
      add(plot, "line", { x1: PX(x0).toFixed(1), y1: PY(fit(x0)).toFixed(1), x2: PX(x1).toFixed(1), y2: PY(fit(x1)).toFixed(1), stroke: K_PAL.azul, "stroke-width": 3.5 });
      X.forEach((x, i) => {
        add(plot, "circle", { cx: PX(x).toFixed(1), cy: PY(Y[i]).toFixed(1), r: 6.5, fill: K_PAL.verde, stroke: "#fff", "stroke-width": 1.8 });
      });
      [0.9, 1.1, 1.3, 1.5].forEach((v) => add(plot, "text", { x: PX(v).toFixed(1), y: bottom + 24, "text-anchor": "middle", class: "v-tick" }, fmt(v, 1)));
      [88, 92, 96, 100].filter((v) => v > y0 && v < y1).forEach((v) => add(plot, "text", { x: left - 10, y: (PY(v) + 6).toFixed(1), "text-anchor": "end", class: "v-tick" }, String(v)));
      add(plot, "text", { x: (left + right) / 2, y: 318, "text-anchor": "middle", class: "v-axis-label" }, "x, hidrocarburos (%)");
      result.textContent = `Recta: ŷ = ${fmt(b0, 2)} ${b1 < 0 ? "−" : "+"} ${fmt(Math.abs(b1), 2)} x · Suma de cuadrados Q = ${fmt(Q, 2)} (mínimo SSE = ${fmt(sseMin, 2)})`;
      plot.setAttribute("aria-label", `Recta con suma de cuadrados Q igual a ${fmt(Q, 2)}`);
    }
    b1Ctl.input.addEventListener("input", redraw);
    b0Ctl.input.addEventListener("input", redraw);
    btnMin.addEventListener("click", () => { b1Ctl.input.value = b1Def; b0Ctl.input.value = b0Def; redraw(); });
    btnAlt.addEventListener("click", () => { b1Ctl.input.value = "8.00"; b0Ctl.input.value = "82.59"; redraw(); });
    btnSq.addEventListener("click", () => { showSquares = !showSquares; redraw(); });
    redraw();
  }

  function weibull(host) {
    const M = mathApi();
    const views = [{ key: "r", label: "Confiabilidad r(t)" }, { key: "h", label: "Tasa de falla h(t)" }];
    let view = views[0];
    const widget = el("div", "widget widget-weibull");
    const controls = el("div", "widget-controls slider-control");
    const aCtl = makeSlider(controls, "Forma, a", "0.5", "3.0", "0.1", "2.0");
    const lCtl = makeSlider(controls, "Inversa de escala, λ (año⁻¹)", "0.05", "0.20", "0.01", "0.10");
    const buttons = views.map((v) => {
      const b = controlButton(v.label, v === view);
      b.addEventListener("click", () => { view = v; redraw(); });
      controls.appendChild(b);
      return b;
    });
    const plot = makeSvg("0 0 640 330", "Curva de confiabilidad y tasa de falla de una distribución Weibull");
    const result = el("p", "widget-result");
    widget.append(controls, plot, result);
    host.appendChild(widget);
    function redraw() {
      buttons.forEach((b, i) => b.classList.toggle("is-active", views[i] === view));
      const a = Number(aCtl.input.value), lam = Number(lCtl.input.value);
      aCtl.output.textContent = fmt(a, 1); lCtl.output.textContent = fmt(lam, 2);
      const rFn = (t) => Math.exp(-Math.pow(lam * t, a));
      const hFn = (t) => (t <= 0 ? (a < 1 ? Infinity : (a === 1 ? lam : 0)) : a * Math.pow(lam, a) * Math.pow(t, a - 1));
      const mttf = (1 / lam) * Math.exp(M.lgamma(1 + 1 / a));
      const r5 = rFn(5), h5 = hFn(5);
      const left = 56, right = 608, top = 28, bottom = 266, tmax = 25;
      const X = (t) => left + t / tmax * (right - left);
      const tStart = view.key === "r" ? 0 : (a < 1 ? 0.35 : 0);
      const ymax = view.key === "r" ? 1.05 : Math.max(hFn(tStart), hFn(tmax), h5) * 1.08;
      const Y = (val) => bottom - val / ymax * (bottom - top);
      plot.replaceChildren();
      baseline(plot, left, right, bottom, top);
      let d = "";
      for (let i = 0; i <= 120; i++) {
        const t = tStart + (tmax - tStart) * i / 120;
        const val = view.key === "r" ? rFn(t) : hFn(t);
        d += `${i ? "L" : "M"}${X(t).toFixed(1)} ${Y(val).toFixed(1)}`;
      }
      add(plot, "path", { d, fill: "none", stroke: view.key === "r" ? K_PAL.verde : K_PAL.morado, "stroke-width": 3.5 });
      const val5 = view.key === "r" ? r5 : h5;
      add(plot, "line", { x1: X(5).toFixed(1), y1: top, x2: X(5).toFixed(1), y2: bottom, stroke: K_PAL.azul, "stroke-width": 2.5, "stroke-dasharray": "8 5" });
      add(plot, "circle", { cx: X(5).toFixed(1), cy: Y(val5).toFixed(1), r: 6, fill: K_PAL.azul });
      add(plot, "text", { x: (X(5) + 8).toFixed(1), y: Math.max(top + 14, Y(val5) - 10).toFixed(1), "font-size": 19, "font-weight": 700, fill: K_PAL.azul }, `${view.key}(5) = ${fmt(val5, 3)}`);
      [0, 5, 10, 15, 20, 25].forEach((tk) => add(plot, "text", { x: X(tk).toFixed(1), y: bottom + 24, "text-anchor": "middle", class: "v-tick" }, String(tk)));
      add(plot, "text", { x: left - 10, y: view.key === "r" ? Y(1) + 6 : top + 6, "text-anchor": "end", class: "v-tick" }, view.key === "r" ? "1,0" : fmt(ymax, 2));
      add(plot, "text", { x: left - 10, y: bottom + 5, "text-anchor": "end", class: "v-tick" }, "0");
      add(plot, "text", { x: (left + right) / 2, y: 318, "text-anchor": "middle", class: "v-axis-label" }, "t, años");
      const behavior = a > 1 ? "tasa creciente" : a < 1 ? "tasa decreciente" : "tasa constante";
      result.textContent = `Weibull(a = ${fmt(a, 1)}; λ = ${fmt(lam, 2)} año⁻¹; escala = ${fmt(1 / lam, 1)} años) · Vida media = ${fmt(mttf, 2)} años · ${view.key === "r" ? `r(5) = ${fmt(r5, 3)}` : `h(5) = ${fmt(h5, 3)} año⁻¹`} · ${behavior}` + (view.key === "h" && a < 1 ? " · h(t) diverge al acercarse a 0; se dibuja desde 0,35 años" : "");
      plot.setAttribute("aria-label", `Weibull con a ${fmt(a, 1)} y lambda ${fmt(lam, 2)}; vida media ${fmt(mttf, 2)} años`);
    }
    aCtl.input.addEventListener("input", redraw);
    lCtl.input.addEventListener("input", redraw);
    redraw();
  }

  function union(host) {
    const steps = [
      { key: "base", label: "Eventos A y B" },
      { key: "doble", label: "Sumar P(A) + P(B)" },
      { key: "resta", label: "Restar P(A ∩ B)" },
      { key: "dm1", label: "4. (A ∪ B)′ = A′ ∩ B′" },
      { key: "dm2", label: "5. (A ∩ B)′ = A′ ∪ B′" }
    ];
    let current = steps[1], animId = null, animStage = null;
    const uid = "u" + (++uidSeq);
    const widget = el("div", "widget widget-union");
    const controls = el("div", "widget-controls");
    const buttons = steps.map((st) => {
      const b = controlButton(st.label, st === current);
      b.addEventListener("click", () => { stopAnim(); current = st; redraw(); });
      controls.appendChild(b);
      return b;
    });
    const bAnim = controlButton("Animar doble conteo", false);
    controls.appendChild(bAnim);
    const plot = makeSvg("0 0 640 320", "Diagrama interactivo de la unión de eventos, doble conteo y leyes de De Morgan");
    const result = el("p", "widget-result");
    widget.append(controls, plot, result);
    host.appendChild(widget);

    function stopAnim() { if (animId) { cancelAnimationFrame(animId); animId = null; } animStage = null; bAnim.classList.remove("is-active"); }

    function redraw() {
      buttons.forEach((b, i) => b.classList.toggle("is-active", !animStage && steps[i] === current));
      plot.replaceChildren();
      const defs = add(plot, "defs", {});
      const clipA = add(defs, "clipPath", { id: `clipA-${uid}` });
      add(clipA, "circle", { cx: 250, cy: 162, r: 102 });
      const clipB = add(defs, "clipPath", { id: `clipB-${uid}` });
      add(clipB, "circle", { cx: 390, cy: 162, r: 102 });
      const pat = add(defs, "pattern", { id: `hatch-${uid}`, width: 10, height: 10, patternUnits: "userSpaceOnUse", patternTransform: "rotate(45)" });
      add(pat, "line", { x1: 0, y1: 0, x2: 0, y2: 10, stroke: K_PAL.rojo, "stroke-width": 4 });

      const kKey = animStage ? animStage.key : current.key;
      const bxShift = animStage && animStage.bx !== undefined ? animStage.bx : 390;
      add(plot, "rect", { x: 24, y: 16, width: 592, height: 286, fill: kKey === "dm1" || kKey === "dm2" ? K_PAL.morado : "#ffffff", "fill-opacity": kKey === "dm1" || kKey === "dm2" ? 0.16 : 1, stroke: K_PAL.medio, "stroke-width": 2 });
      add(plot, "text", { x: 42, y: 46, "font-size": 24, "font-weight": 700, fill: K_PAL.medio }, "S");

      if (kKey === "base") {
        add(plot, "circle", { cx: 250, cy: 162, r: 102, fill: K_PAL.azul, "fill-opacity": 0.22, stroke: K_PAL.azul, "stroke-width": 3.5 });
        add(plot, "circle", { cx: bxShift, cy: 162, r: 102, fill: K_PAL.ocre, "fill-opacity": 0.22, stroke: K_PAL.ocre, "stroke-width": 3.5, "stroke-dasharray": "10 6" });
        result.textContent = animStage ? "Paso 1: se suman los puntos de A y se acerca B." : "Dos eventos A y B que comparten la zona central A ∩ B.";
      } else if (kKey === "doble") {
        add(plot, "circle", { cx: 250, cy: 162, r: 102, fill: K_PAL.azul, "fill-opacity": 0.24, stroke: K_PAL.azul, "stroke-width": 3.5 });
        add(plot, "circle", { cx: 390, cy: 162, r: 102, fill: K_PAL.ocre, "fill-opacity": 0.24, stroke: K_PAL.ocre, "stroke-width": 3.5 });
        add(plot, "circle", { cx: 390, cy: 162, r: 102, "clip-path": `url(#clipA-${uid})`, fill: `url(#hatch-${uid})` });
        add(plot, "rect", { x: 274, y: 146, width: 92, height: 30, fill: "#fff", "fill-opacity": 0.9 });
        add(plot, "text", { x: 320, y: 168, "text-anchor": "middle", "font-size": 20, "font-weight": 700, fill: K_PAL.rojo }, "×2 veces");
        result.textContent = "Al sumar P(A) + P(B), la intersección A ∩ B queda sumada dos veces.";
      } else if (kKey === "resta") {
        add(plot, "circle", { cx: 250, cy: 162, r: 102, fill: K_PAL.verde, "fill-opacity": 0.28, stroke: K_PAL.verde, "stroke-width": 3.5 });
        add(plot, "circle", { cx: 390, cy: 162, r: 102, fill: K_PAL.verde, "fill-opacity": 0.28, stroke: K_PAL.verde, "stroke-width": 3.5 });
        add(plot, "circle", { cx: 390, cy: 162, r: 102, "clip-path": `url(#clipA-${uid})`, fill: "#ffffff", "fill-opacity": 0.35 });
        add(plot, "circle", { cx: 390, cy: 162, r: 102, "clip-path": `url(#clipA-${uid})`, fill: K_PAL.verde, "fill-opacity": 0.28 });
        add(plot, "text", { x: 320, y: 168, "text-anchor": "middle", "font-size": 20, "font-weight": 700, fill: K_PAL.verde }, "×1 vez");
        result.textContent = "Al restar una vez P(A ∩ B), toda la unión A ∪ B queda cubierta exactamente una vez.";
      } else if (kKey === "dm1") {
        add(plot, "circle", { cx: 250, cy: 162, r: 102, fill: "#ffffff", stroke: K_PAL.azul, "stroke-width": 3 });
        add(plot, "circle", { cx: 390, cy: 162, r: 102, fill: "#ffffff", stroke: K_PAL.ocre, "stroke-width": 3 });
        add(plot, "text", { x: 480, y: 48, "font-size": 19, "font-weight": 700, fill: K_PAL.morado }, "Ni A ni B");
        result.textContent = "De Morgan 1: no ocurre (A o B) equivale a no ocurre A y no ocurre B: (A ∪ B)′ = A′ ∩ B′.";
      } else {
        add(plot, "circle", { cx: 250, cy: 162, r: 102, fill: K_PAL.morado, "fill-opacity": 0.16, stroke: K_PAL.azul, "stroke-width": 3 });
        add(plot, "circle", { cx: 390, cy: 162, r: 102, fill: K_PAL.morado, "fill-opacity": 0.16, stroke: K_PAL.ocre, "stroke-width": 3 });
        add(plot, "circle", { cx: 390, cy: 162, r: 102, "clip-path": `url(#clipA-${uid})`, fill: "#ffffff" });
        add(plot, "circle", { cx: 250, cy: 162, r: 102, fill: "none", stroke: K_PAL.azul, "stroke-width": 3 });
        add(plot, "circle", { cx: 390, cy: 162, r: 102, fill: "none", stroke: K_PAL.ocre, "stroke-width": 3 });
        add(plot, "text", { x: 320, y: 168, "text-anchor": "middle", "font-size": 18, "font-weight": 700, fill: K_PAL.tinta }, "A ∩ B fuera");
        result.textContent = "De Morgan 2: no ocurren ambos a la vez equivale a falla A o falla B: (A ∩ B)′ = A′ ∪ B′.";
      }
      add(plot, "text", { x: 185, y: 168, "text-anchor": "middle", "font-size": 30, "font-weight": 700, fill: K_PAL.azul }, "A");
      add(plot, "text", { x: bxShift + 65, y: 168, "text-anchor": "middle", "font-size": 30, "font-weight": 700, fill: K_PAL.ocre }, "B");
    }

    bAnim.addEventListener("click", () => {
      stopAnim();
      bAnim.classList.add("is-active");
      const t0 = performance.now(), dur = 2400;
      const tick = (now) => {
        const u = Math.min(1, (now - t0) / dur);
        if (u < 0.38) {
          const p = u / 0.38;
          animStage = { key: "base", bx: 470 - 80 * p };
        } else if (u < 0.72) {
          animStage = { key: "doble" };
        } else {
          animStage = { key: "resta" };
        }
        redraw();
        if (u < 1) animId = requestAnimationFrame(tick);
        else { animStage = null; current = steps[2]; bAnim.classList.remove("is-active"); animId = null; redraw(); }
      };
      animId = requestAnimationFrame(tick);
    });
    redraw();
  }

  function conteo(host) {
    const modes = [
      { key: "fact", label: "Factorial n!" },
      { key: "perm", label: "Permutación (con orden)" },
      { key: "comb", label: "Combinación (sin orden)" }
    ];
    let mode = modes[1];
    const widget = el("div", "widget widget-conteo");
    const controls = el("div", "widget-controls slider-control");
    const nCtl = makeSlider(controls, "Elementos, n", "3", "6", "1", "4");
    const kCtl = makeSlider(controls, "Elegidos, k", "1", "4", "1", "2");
    const buttons = modes.map((m) => {
      const b = controlButton(m.label, m === mode);
      b.addEventListener("click", () => { mode = m; redraw(); });
      controls.appendChild(b);
      return b;
    });
    const plot = makeSvg("0 0 640 310", "Esquema visual de factorial, permutaciones y combinaciones");
    const result = el("p", "widget-result");
    widget.append(controls, plot, result);
    host.appendChild(widget);

    const fact = (m) => { let r = 1; for (let i = 2; i <= m; i++) r *= i; return r; };
    function redraw() {
      buttons.forEach((b, i) => b.classList.toggle("is-active", modes[i] === mode));
      const n = Number(nCtl.input.value);
      let k = Number(kCtl.input.value);
      if (k > n) { k = n; kCtl.input.value = String(k); }
      nCtl.output.textContent = String(n);
      kCtl.output.textContent = String(k);
      const slots = mode.key === "fact" ? n : k;
      const permVal = fact(n) / fact(n - k);
      const combVal = permVal / fact(k);
      const letters = "ABCDEF".slice(0, n).split("");

      plot.replaceChildren();
      add(plot, "text", { x: 24, y: 28, class: "v-kicker" }, "Elección paso a paso en casillas");
      const slotW = Math.min(92, 560 / Math.max(1, slots) - 14), gap = 16;
      const startX = 320 - (slots * slotW + (slots - 1) * gap) / 2;
      for (let i = 0; i < slots; i++) {
        const x = startX + i * (slotW + gap), opts = n - i;
        add(plot, "rect", { x: x.toFixed(1), y: 46, width: slotW.toFixed(1), height: 70, rx: 6, fill: "#eef4e9", stroke: K_PAL.verde, "stroke-width": 2.5 });
        add(plot, "text", { x: (x + slotW / 2).toFixed(1), y: 84, "text-anchor": "middle", "font-size": 28, "font-weight": 700, fill: K_PAL.verde }, String(opts));
        add(plot, "text", { x: (x + slotW / 2).toFixed(1), y: 108, "text-anchor": "middle", "font-size": 14, fill: K_PAL.medio }, "opciones");
        if (i < slots - 1) add(plot, "text", { x: (x + slotW + gap / 2).toFixed(1), y: 88, "text-anchor": "middle", "font-size": 24, "font-weight": 700, fill: K_PAL.tinta }, "×");
      }

      add(plot, "line", { x1: 24, y1: 142, x2: 616, y2: 142, class: "v-divider" });
      const sample = letters.slice(0, Math.min(k, 3));
      if (mode.key === "fact") {
        add(plot, "text", { x: 24, y: 174, "font-size": 20, "font-weight": 700, fill: K_PAL.azul }, `Ordenar los ${n} elementos (${letters.join(", ")}): ${n}! = ${fact(n)} órdenes`);
        add(plot, "text", { x: 24, y: 215, "font-size": 19, fill: K_PAL.tinta }, `Cada posición reduce en 1 las opciones disponibles: ${Array.from({ length: n }, (_, i) => n - i).join(" × ")} = ${fact(n)}.`);
        result.textContent = `Factorial: ${n}! = ${fact(n)} formas de ordenar todos los elementos.`;
      } else if (mode.key === "perm") {
        add(plot, "text", { x: 24, y: 174, "font-size": 20, "font-weight": 700, fill: K_PAL.azul }, `Importa el orden: (${sample.join(", ")}) ≠ (${[...sample].reverse().join(", ")})`);
        add(plot, "text", { x: 24, y: 214, "font-size": 19, fill: K_PAL.tinta }, `Se llenan solo ${k} casillas de ${n}: ${Array.from({ length: k }, (_, i) => n - i).join(" × ")} = ${permVal}.`);
        add(plot, "text", { x: 24, y: 252, "font-size": 18, fill: K_PAL.medio }, `Equivale a dividir ${n}! entre los (${n} − ${k})! arreglos de los elementos no elegidos.`);
        result.textContent = `Permutaciones P(${n}, ${k}) = ${n}! / (${n} − ${k})! = ${permVal} listas ordenadas.`;
      } else {
        const kFact = fact(k);
        add(plot, "text", { x: 24, y: 174, "font-size": 20, "font-weight": 700, fill: K_PAL.ocre }, `No importa el orden: {${sample.join(", ")}} agrupa ${k}! = ${kFact} órdenes iguales`);
        add(plot, "rect", { x: 24, y: 196, width: 592, height: 64, rx: 6, fill: "#fbf4ea", stroke: K_PAL.ocre, "stroke-width": 2 });
        add(plot, "text", { x: 320, y: 224, "text-anchor": "middle", "font-size": 20, "font-weight": 700, fill: K_PAL.tinta }, `Se divide P(${n}, ${k}) = ${permVal} entre ${k}! = ${kFact} reordenamientos repetidos`);
        add(plot, "text", { x: 320, y: 248, "text-anchor": "middle", "font-size": 18, fill: K_PAL.ocre }, `Resultado: ${permVal} / ${kFact} = ${combVal} subconjuntos distintos`);
        result.textContent = `Combinaciones C(${n}, ${k}) = ${n}! / (${k}!(${n} − ${k})!) = ${combVal} grupos sin orden.`;
      }
    }
    nCtl.input.addEventListener("input", redraw);
    kCtl.input.addEventListener("input", redraw);
    redraw();
  }

  function arbolBayes(host) {
    const modes = [
      { key: "arbol", label: "Árbol (envases producidos)" },
      { key: "paradoja", label: "Filtro de correo" }
    ];
    let mode = modes[0];
    const widget = el("div", "widget widget-bayes");
    const controls = el("div", "widget-controls slider-control");
    const prevCtl = makeSlider(controls, "Correo no deseado (%)", "0.5", "10.0", "0.5", "1.0");
    const accCtl = makeSlider(controls, "Sensibilidad y especificidad (%)", "85.0", "99.5", "0.5", "99.0");
    const buttons = modes.map((m) => {
      const b = controlButton(m.label, m === mode);
      b.addEventListener("click", () => { mode = m; redraw(); });
      controls.appendChild(b);
      return b;
    });
    const plot = makeSvg("0 0 640 320", "Árbol de probabilidad total entre envases y filtro de correo con sensibilidad y especificidad iguales");
    const result = el("p", "widget-result");
    widget.append(controls, plot, result);
    host.appendChild(widget);

    function redraw() {
      buttons.forEach((b, i) => b.classList.toggle("is-active", modes[i] === mode));
      const isTree = mode.key === "arbol";
      prevCtl.input.parentElement.style.display = isTree ? "none" : "flex";
      accCtl.input.parentElement.style.display = isTree ? "none" : "flex";
      plot.replaceChildren();

      if (isTree) {
        add(plot, "text", { x: 24, y: 26, class: "v-kicker" }, "Fracción de envases producidos, no fracción del tiempo");
        const lines = [
          { name: "Alta vel.", p: 0.30, d: 0.010, y: 105, color: K_PAL.ocre },
          { name: "Baja vel.", p: 0.70, d: 0.001, y: 225, color: K_PAL.azul }
        ];
        const pTotal = lines.reduce((a, b) => a + b.p * b.d, 0);
        lines.forEach((ln) => {
          add(plot, "line", { x1: 48, y1: 160, x2: 205, y2: ln.y, stroke: ln.color, "stroke-width": 3.5 });
          add(plot, "text", { x: 120, y: ln.y < 160 ? 118 : 214, "font-size": 17, "font-weight": 700, fill: ln.color }, fmt(ln.p, 2));
          add(plot, "rect", { x: 205, y: ln.y - 22, width: 102, height: 44, rx: 6, fill: "#fff", stroke: ln.color, "stroke-width": 2.5 });
          add(plot, "text", { x: 256, y: ln.y + 6, "text-anchor": "middle", "font-size": 18, "font-weight": 700, fill: ln.color }, ln.name);
          add(plot, "line", { x1: 307, y1: ln.y, x2: 465, y2: ln.y - 16, stroke: K_PAL.rojo, "stroke-width": 3 });
          add(plot, "line", { x1: 307, y1: ln.y, x2: 465, y2: ln.y + 18, stroke: K_PAL.gris, "stroke-width": 2 });
          const contrib = ln.p * ln.d;
          add(plot, "text", { x: 382, y: ln.y - 25, "text-anchor": "middle", "font-size": 16, "font-weight": 700, fill: K_PAL.rojo }, fmt(ln.d, 3));
          add(plot, "text", { x: 472, y: ln.y - 10, "font-size": 17, "font-weight": 700, fill: K_PAL.rojo }, `Defecto: ${fmt(contrib, 4)}`);
          add(plot, "text", { x: 472, y: ln.y + 22, "font-size": 15, fill: K_PAL.medio }, `Cumple: ${fmt(ln.p * (1 - ln.d), 4)}`);
        });
        const highDefect = lines[0].p * lines[0].d;
        result.textContent = `Entre envases producidos: P(D) = ${fmt(highDefect, 4)} + ${fmt(lines[1].p * lines[1].d, 4)} = ${fmt(pTotal, 4)} · P(alta velocidad | D) = ${fmt(highDefect / pTotal * 100, 1)} %`;
        plot.setAttribute("aria-label", `Árbol de envases producidos: treinta por ciento a alta velocidad y setenta a baja; defecto total ${fmt(pTotal, 4)}, probabilidad de alta velocidad dado defecto ${fmt(highDefect / pTotal * 100, 1)} por ciento`);
      } else {
        const prev = Number(prevCtl.input.value) / 100;
        const acc = Number(accCtl.input.value) / 100;
        prevCtl.output.textContent = fmt(prev * 100, 1) + " %";
        accCtl.output.textContent = fmt(acc * 100, 1) + " %";
        const N = 10000, unwanted = N * prev, wanted = N - unwanted;
        const tp = unwanted * acc, fp = wanted * (1 - acc), totalPos = tp + fp, post = tp / totalPos;
        add(plot, "text", { x: 24, y: 26, class: "v-kicker" }, "DE 10.000 CORREOS · ¿CUÁNTOS MARCA EL FILTRO?");
        const barW = 592;
        const wUnwanted = barW * prev, wWanted = barW - wUnwanted;
        add(plot, "rect", { x: 24, y: 46, width: wUnwanted.toFixed(1), height: 48, fill: K_PAL.verde });
        add(plot, "rect", { x: (24 + wUnwanted).toFixed(1), y: 46, width: wWanted.toFixed(1), height: 48, fill: "#dfe4dc", stroke: K_PAL.medio, "stroke-width": 1.5 });
        add(plot, "text", { x: 24, y: 118, "font-size": 18, "font-weight": 700, fill: K_PAL.verde }, `No deseados: ${fmt(unwanted, 0)} de 10.000`);
        add(plot, "text", { x: 616, y: 118, "text-anchor": "end", "font-size": 18, fill: K_PAL.medio }, `Deseados: ${fmt(wanted, 0)} de 10.000`);

        add(plot, "line", { x1: 24, y1: 142, x2: 616, y2: 142, class: "v-divider" });
        add(plot, "text", { x: 24, y: 170, "font-size": 19, "font-weight": 700, fill: K_PAL.tinta }, `De los ${fmt(totalPos, 1)} correos marcados:`);
        const wTP = barW * (tp / totalPos), wFP = barW - wTP;
        add(plot, "rect", { x: 24, y: 188, width: wTP.toFixed(1), height: 54, fill: K_PAL.verde });
        add(plot, "rect", { x: (24 + wTP).toFixed(1), y: 188, width: wFP.toFixed(1), height: 54, fill: K_PAL.rojo });
        add(plot, "text", { x: (24 + wTP / 2).toFixed(1), y: 222, "text-anchor": "middle", "font-size": 18, "font-weight": 700, fill: "#fff" }, tp >= 1 ? fmt(tp, 1) : "");
        add(plot, "text", { x: (24 + wTP + wFP / 2).toFixed(1), y: 222, "text-anchor": "middle", "font-size": 18, "font-weight": 700, fill: "#fff" }, fp >= 1 ? fmt(fp, 1) : "");
        add(plot, "text", { x: 24, y: 270, "font-size": 18, "font-weight": 700, fill: K_PAL.verde }, `No deseados: ${fmt(tp, 1)}`);
        add(plot, "text", { x: 616, y: 270, "text-anchor": "end", "font-size": 18, "font-weight": 700, fill: K_PAL.rojo }, `Deseados por error: ${fmt(fp, 1)}`);
        result.textContent = `P(no deseado | marcado) = ${fmt(tp, 1)} / (${fmt(tp, 1)} + ${fmt(fp, 1)}) = ${fmt(post * 100, 1)} % · Conteos esperados en 10.000 correos; sensibilidad = especificidad`;
        plot.setAttribute("aria-label", `Filtro de correo: tasa base ${fmt(prev * 100, 1)} por ciento, sensibilidad y especificidad ${fmt(acc * 100, 1)} por ciento; probabilidad de no deseado dado marcado ${fmt(post * 100, 1)} por ciento`);
      }
    }
    prevCtl.input.addEventListener("input", redraw);
    accCtl.input.addEventListener("input", redraw);
    redraw();
  }

  function tirosBinomial(host) {
    const modes = [
      { key: "tres", label: "3 tiros libres (8 rutas)" },
      { key: "diez", label: "10 tiros libres: B(10, p)" }
    ];
    let mode = modes[0];
    const widget = el("div", "widget widget-tiros");
    const controls = el("div", "widget-controls slider-control");
    const pCtl = makeSlider(controls, "Acierto por tiro, p", "0.10", "0.95", "0.05", "0.70");
    const buttons = modes.map((m) => {
      const b = controlButton(m.label, m === mode);
      b.addEventListener("click", () => { mode = m; redraw(); });
      controls.appendChild(b);
      return b;
    });
    const plot = makeSvg("0 0 640 320", "Analogía de tiros libres de baloncesto para Bernoulli y Binomial");
    const result = el("p", "widget-result");
    widget.append(controls, plot, result);
    host.appendChild(widget);

    const combLocal = (n, x) => { let c = 1; for (let i = 0; i < x; i++) c = c * (n - i) / (i + 1); return c; };
    function redraw() {
      buttons.forEach((b, i) => b.classList.toggle("is-active", modes[i] === mode));
      const p = Number(pCtl.input.value);
      pCtl.output.textContent = fmt(p, 2);
      plot.replaceChildren();

      if (mode.key === "tres") {
        const groups = [
          { x: 3, seqs: ["AAA"], color: K_PAL.verde },
          { x: 2, seqs: ["AAF", "AFA", "FAA"], color: K_PAL.azul },
          { x: 1, seqs: ["AFF", "FAF", "FFA"], color: K_PAL.ocre },
          { x: 0, seqs: ["FFF"], color: K_PAL.rojo }
        ];
        add(plot, "text", { x: 24, y: 26, class: "v-kicker" }, "8 SECUENCIAS POSIBLES AGRUPADAS POR ACIERTOS X");
        groups.forEach((g, gi) => {
          const yBase = 58 + gi * 68;
          const probSeq = Math.pow(p, g.x) * Math.pow(1 - p, 3 - g.x), probGroup = g.seqs.length * probSeq;
          add(plot, "text", { x: 24, y: yBase + 6, "font-size": 21, "font-weight": 700, fill: g.color }, `X = ${g.x}`);
          g.seqs.forEach((seq, si) => {
            const sx = 96 + si * 94;
            seq.split("").forEach((ch, ci) => {
              add(plot, "circle", { cx: sx + ci * 22, cy: yBase, r: 8, fill: ch === "A" ? K_PAL.verde : "#fff", stroke: ch === "A" ? K_PAL.verde : K_PAL.rojo, "stroke-width": 2.2 });
            });
          });
          const barLen = probGroup * 210;
          add(plot, "rect", { x: 382, y: yBase - 14, width: barLen.toFixed(1), height: 28, fill: g.color, "fill-opacity": 0.78 });
          add(plot, "text", { x: 382, y: yBase + 34, "font-size": 16, "font-weight": 700, fill: g.color }, `${g.seqs.length} × ${fmt(probSeq, 3)} = ${fmt(probGroup, 3)}`);
        });
        result.textContent = `X ~ B(3; ${fmt(p, 2)}) · E(X) = 3p = ${fmt(3 * p, 2)} canastas · Var(X) = 3p(1 − p) = ${fmt(3 * p * (1 - p), 3)}`;
      } else {
        const n = 10, probs = [];
        for (let x = 0; x <= n; x++) probs.push(combLocal(n, x) * Math.pow(p, x) * Math.pow(1 - p, n - x));
        const max = Math.max(...probs), left = 54, right = 608, top = 30, bottom = 256, step = (right - left) / (n + 1), bw = step * 0.62;
        const xc = (x) => left + step * (x + 0.5);
        baseline(plot, left, right, bottom, top);
        probs.forEach((v, x) => {
          const h = v / max * (bottom - top - 16);
          add(plot, "rect", { x: (xc(x) - bw / 2).toFixed(1), y: (bottom - h).toFixed(1), width: bw.toFixed(1), height: h.toFixed(1), class: "v-histogram" });
          add(plot, "text", { x: xc(x).toFixed(1), y: bottom + 24, "text-anchor": "middle", class: "v-tick" }, String(x));
        });
        const xm = left + step * (n * p + 0.5);
        add(plot, "line", { x1: xm.toFixed(1), y1: top - 4, x2: xm.toFixed(1), y2: bottom, class: "v-mean-line" });
        add(plot, "text", { x: Math.min(right - 130, xm + 8).toFixed(1), y: top + 12, class: "v-marker-label" }, `E(X) = ${fmt(n * p, 1)}`);
        add(plot, "text", { x: (left + right) / 2, y: 306, "text-anchor": "middle", class: "v-axis-label" }, "x, tiros encestados de 10");
        result.textContent = `X ~ B(10; ${fmt(p, 2)}) · E(X) = ${fmt(10 * p, 2)} · Var(X) = ${fmt(10 * p * (1 - p), 3)}`;
      }
    }
    pCtl.input.addEventListener("input", redraw);
    redraw();
  }

  /* Esperanza como punto de equilibrio y contribuciones ponderadas a la varianza. */
  function momentos(host) {
    const presets = [
      { label: "Tres monedas", xs: [0, 1, 2, 3], ps: [0.125, 0.375, 0.375, 0.125], unidad: "caras" },
      { label: "Concentrada", xs: [0, 1, 2, 3, 4], ps: [0.05, 0.20, 0.50, 0.20, 0.05], unidad: "" },
      { label: "Dispersa", xs: [0, 1, 2, 3, 4], ps: [0.30, 0.10, 0.20, 0.10, 0.30], unidad: "" },
      { label: "Asimétrica", xs: [0, 1, 2, 3, 4], ps: [0.40, 0.30, 0.15, 0.10, 0.05], unidad: "" }
    ];
    let preset = presets[1], cuadrados = true;
    const widget = el("div", "widget widget-momentos");
    const controls = el("div", "widget-controls");
    const buttons = presets.map((p) => { const b = controlButton(p.label, p === preset); b.addEventListener("click", () => { preset = p; redraw(); }); controls.appendChild(b); return b; });
    const toggle = controlButton("Contribuciones a Var(X)", true);
    toggle.addEventListener("click", () => { cuadrados = !cuadrados; redraw(); });
    controls.appendChild(toggle);
    const plot = makeSvg("0 0 640 340", "Distribución discreta con esperanza y contribuciones p(x) por desviación cuadrática a la varianza");
    const result = el("p", "widget-result");
    widget.append(controls, plot, result); host.appendChild(widget);
    function redraw() {
      buttons.forEach((b, i) => b.classList.toggle("is-active", presets[i] === preset));
      toggle.classList.toggle("is-active", cuadrados);
      const { xs, ps } = preset;
      const mu = xs.reduce((a, x, i) => a + x * ps[i], 0);
      const varianza = xs.reduce((a, x, i) => a + ps[i] * (x - mu) * (x - mu), 0);
      const lo = 0, hi = 4, left = 70, right = 590, beam = cuadrados ? 140 : 230;
      const X = (x) => left + (x - lo) / (hi - lo) * (right - left);
      const hmax = cuadrados ? 96 : 170;
      plot.replaceChildren();
      add(plot, "line", { x1: left - 30, y1: beam, x2: right + 30, y2: beam, stroke: K_PAL.tinta, "stroke-width": 5 });
      xs.forEach((x, i) => {
        const h = ps[i] * hmax;
        add(plot, "rect", { x: (X(x) - 24).toFixed(1), y: (beam - 3 - h).toFixed(1), width: 48, height: h.toFixed(1), fill: K_PAL.azul, "fill-opacity": 0.85 });
        add(plot, "text", { x: X(x).toFixed(1), y: (beam - h - 10).toFixed(1), "text-anchor": "middle", "font-size": 19, "font-weight": 700, fill: K_PAL.azul }, fmt(ps[i], ps[i] < 0.01 ? 3 : 2));
        add(plot, "text", { x: X(x).toFixed(1), y: beam + 26, "text-anchor": "middle", class: "v-tick" }, String(x));
      });
      const xm = X(mu);
      add(plot, "polygon", { points: `${xm.toFixed(1)},${beam + 3} ${(xm - 16).toFixed(1)},${beam + 36} ${(xm + 16).toFixed(1)},${beam + 36}`, fill: K_PAL.rojo });
      add(plot, "text", { x: (xm + 22).toFixed(1), y: beam + 30, "font-size": 20, "font-weight": 700, fill: K_PAL.rojo }, `E(X) = ${fmt(mu, 2)}`);
      if (cuadrados) {
        const contributions = xs.map((x, i) => ps[i] * (x - mu) ** 2);
        const cmax = Math.max(...contributions);
        const bottom = 316, heightMax = 82;
        add(plot, "text", { x: left - 24, y: 206, "font-size": 16, fill: K_PAL.morado }, `Aportes a Var(X) · escala local: máximo ${fmt(cmax, 3)}`);
        add(plot, "line", { x1: left - 24, y1: bottom, x2: right + 24, y2: bottom, stroke: K_PAL.medio, "stroke-width": 2 });
        xs.forEach((x, i) => {
          const h = contributions[i] / cmax * heightMax;
          add(plot, "rect", { x: (X(x) - 22).toFixed(1), y: (bottom - h).toFixed(1), width: 44, height: h.toFixed(1), fill: K_PAL.morado, "fill-opacity": 0.75 });
          add(plot, "text", { x: X(x).toFixed(1), y: (bottom - h - 7).toFixed(1), "text-anchor": "middle", "font-size": 16, "font-weight": 700, fill: K_PAL.morado }, fmt(contributions[i], 3));
        });
      }
      result.textContent = `E(X) = Σ x·p(x) = ${fmt(mu, 2)}` + (cuadrados ? ` · Var(X) = Σ (x − μ)²·p(x) = ${fmt(varianza, 3)} · σ = ${fmt(Math.sqrt(varianza), 3)} · Barras moradas reescaladas en cada caso` : "");
      plot.setAttribute("aria-label", `Distribución ${preset.label}: esperanza ${fmt(mu, 2)}, varianza ${fmt(varianza, 3)}`);
    }
    redraw();
  }

  /* Simulación: promedio de la varianza muestral dividiendo entre n y entre n − 1. */
  function sesgoVarianza(host) {
    const mu = 28, sigma = 3, M = 2000;
    const widget = el("div", "widget widget-sesgo");
    const controls = el("div", "widget-controls slider-control");
    const ctl = makeSlider(controls, "Tamaño de cada muestra, n", "2", "30", "1", "3");
    const again = controlButton(`Tomar otras ${fmt(M, 0)} muestras`, false);
    controls.appendChild(again);
    const plot = makeSvg("0 0 640 340", "Histograma de varianzas muestrales y comparación de sus promedios con la varianza real");
    const result = el("p", "widget-result");
    widget.append(controls, plot, result); host.appendChild(widget);
    let seed = 20261116;
    function redraw() {
      const n = Number(ctl.input.value); ctl.output.textContent = String(n);
      const random = seeded(seed);
      const s2 = [], s2n = [];
      for (let m = 0; m < M; m++) {
        const xs = []; for (let i = 0; i < n; i++) xs.push(mu + sigma * normal(random));
        const xb = xs.reduce((a, b) => a + b, 0) / n, ss = xs.reduce((a, b) => a + (b - xb) * (b - xb), 0);
        s2.push(ss / (n - 1)); s2n.push(ss / n);
      }
      const avg = (a) => a.reduce((x, y) => x + y, 0) / a.length, aN1 = avg(s2), aN = avg(s2n);
      const left = 40, right = 612, top = 40, bottom = 262, vmax = 30, bins = 30;
      const X = (v) => left + Math.min(v, vmax) / vmax * (right - left);
      const counts = Array(bins).fill(0); let fuera = 0; s2.forEach((v) => { if (v >= vmax) { fuera++; return; } counts[Math.floor(v / vmax * bins)]++; });
      const cmax = Math.max(...counts);
      plot.replaceChildren();
      counts.forEach((c, i) => { const h = c / cmax * (bottom - top - 30); add(plot, "rect", { x: (left + i * (right - left) / bins + 1).toFixed(1), y: (bottom - h).toFixed(1), width: ((right - left) / bins - 2).toFixed(1), height: h.toFixed(1), fill: K_PAL.gris }); });
      add(plot, "line", { x1: left, y1: bottom, x2: right, y2: bottom, class: "v-axis" });
      [0, 5, 10, 15, 20, 25, 30].forEach((t) => add(plot, "text", { x: X(t).toFixed(1), y: bottom + 24, "text-anchor": "middle", class: "v-tick" }, String(t)));
      const marca = (v, color, dash, texto, y) => {
        add(plot, "line", { x1: X(v).toFixed(1), y1: top - 10, x2: X(v).toFixed(1), y2: bottom, stroke: color, "stroke-width": 4, "stroke-dasharray": dash || "" });
        add(plot, "line", { x1: right - 300, y1: y - 7, x2: right - 268, y2: y - 7, stroke: color, "stroke-width": 4, "stroke-dasharray": dash || "" });
        add(plot, "text", { x: right - 260, y, "font-size": 20, "font-weight": 700, fill: color }, texto);
      };
      marca(sigma * sigma, K_PAL.azul, "", `σ² real = 9`, top + 4);
      marca(aN, K_PAL.rojo, "9 6", `promedio entre n: ${fmt(aN, 2)}`, top + 32);
      marca(aN1, K_PAL.verde, "3 5", `promedio entre n − 1: ${fmt(aN1, 2)}`, top + 60);
      add(plot, "text", { x: (left + right) / 2, y: 316, "text-anchor": "middle", class: "v-axis-label" }, `varianza de ${fmt(M, 0)} muestras (MPa²)`);
      result.textContent = `Con n = ${n}, dividir entre n subestima σ² en promedio un factor (n − 1)/n = ${fmt((n - 1) / n, 3)}; dividir entre n − 1 acierta en promedio.` + (fuera ? ` En el histograma se omiten ${fuera} varianzas ≥ 30 MPa².` : "");
      plot.setAttribute("aria-label", `Con n ${n}: promedio dividiendo entre n ${fmt(aN, 2)}, entre n menos 1 ${fmt(aN1, 2)}, varianza real 9`);
    }
    ctl.input.addEventListener("input", redraw);
    again.addEventListener("click", () => { seed += 7919; redraw(); });
    redraw();
  }

  /* Periodo de retorno: probabilidad de al menos una excedencia en n años. */
  function retorno(host) {
    const widget = el("div", "widget widget-retorno");
    const controls = el("div", "widget-controls slider-control");
    const tCtl = makeSlider(controls, "Periodo de retorno T (años)", "2", "100", "1", "25");
    const nCtl = makeSlider(controls, "Vida útil de la obra n (años)", "1", "100", "1", "25");
    const plot = makeSvg("0 0 640 340", "Probabilidad de al menos una excedencia en función de los años de vida útil");
    const result = el("p", "widget-result");
    const foot = el("p", "widget-foot", "Excedencia significa superar un umbral anual. El cálculo supone años independientes y probabilidad anual constante; no estima por sí solo la falla de la obra.");
    widget.append(controls, plot, result, foot); host.appendChild(widget);
    function redraw() {
      const T = Number(tCtl.input.value), n = Number(nCtl.input.value), p = 1 / T;
      tCtl.output.textContent = String(T); nCtl.output.textContent = String(n);
      const left = 60, right = 610, top = 30, bottom = 262, nmax = 100;
      const X = (k) => left + k / nmax * (right - left), Y = (q) => bottom - q * (bottom - top);
      const P = (k) => 1 - Math.pow(1 - p, k);
      plot.replaceChildren();
      [0, 0.25, 0.5, 0.75, 1].forEach((q) => { add(plot, "line", { x1: left, y1: Y(q), x2: right, y2: Y(q), class: "v-divider" }); add(plot, "text", { x: left - 10, y: Y(q) + 6, "text-anchor": "end", class: "v-tick" }, `${fmt(q * 100, 0)} %`); });
      add(plot, "line", { x1: left, y1: bottom, x2: right, y2: bottom, class: "v-axis" });
      [0, 20, 40, 60, 80, 100].forEach((k) => add(plot, "text", { x: X(k), y: bottom + 24, "text-anchor": "middle", class: "v-tick" }, String(k)));
      let d = ""; for (let k = 0; k <= nmax; k++) d += `${k ? "L" : "M"}${X(k).toFixed(1)} ${Y(P(k)).toFixed(1)}`;
      add(plot, "path", { d, fill: "none", stroke: K_PAL.azul, "stroke-width": 4 });
      if (T <= nmax && Math.abs(T - n) > 4) {
        add(plot, "line", { x1: X(T), y1: Y(P(T)), x2: X(T), y2: bottom, stroke: K_PAL.ocre, "stroke-width": 2.5, "stroke-dasharray": "7 5" });
        add(plot, "circle", { cx: X(T), cy: Y(P(T)), r: 7, fill: K_PAL.ocre });
        add(plot, "text", { x: X(T) + (T > 75 ? -10 : 10), y: Y(P(T)) + 26, "text-anchor": T > 75 ? "end" : "start", "font-size": 19, "font-weight": 700, fill: K_PAL.ocre }, `n = T: ${fmt(P(T) * 100, 1)} %`);
      }
      add(plot, "line", { x1: X(n), y1: top, x2: X(n), y2: bottom, stroke: K_PAL.rojo, "stroke-width": 3 });
      add(plot, "circle", { cx: X(n), cy: Y(P(n)), r: 9, fill: K_PAL.rojo });
      add(plot, "text", { x: Math.min(X(n) + 12, right - 150), y: Math.max(Y(P(n)) - 12, top + 16), "font-size": 21, "font-weight": 700, fill: K_PAL.rojo }, `${fmt(P(n) * 100, 1)} %`);
      add(plot, "text", { x: (left + right) / 2, y: 316, "text-anchor": "middle", class: "v-axis-label" }, "n, años de vida útil");
      result.textContent = `P(al menos una excedencia en ${n} años) = 1 − (1 − 1/${T})^${n} = ${fmt(P(n) * 100, 1)} %`;
      plot.setAttribute("aria-label", `Periodo de retorno ${T} años y vida útil ${n} años: probabilidad ${fmt(P(n) * 100, 1)} por ciento`);
    }
    tCtl.input.addEventListener("input", redraw); nCtl.input.addEventListener("input", redraw);
    redraw();
  }


  /* Operaciones entre eventos en el espacio muestral S: se sombrea la región que corresponde. */
  function vennOps(host) {
    const ops = [
      { key: "u", label: "A ∪ B", txt: "A ∪ B: ocurre A, ocurre B o ambos." },
      { key: "i", label: "A ∩ B", txt: "A ∩ B: ocurren A y B a la vez." },
      { key: "c", label: "A′", txt: "A′: todo lo de S que no está en A." },
      { key: "d", label: "A − B", txt: "A − B = A ∩ B′: ocurre A pero no B." },
      { key: "m", label: "(A ∪ B)′", txt: "(A ∪ B)′ = A′ ∩ B′: no ocurre ninguno (De Morgan)." },
      { key: "m2", label: "(A ∩ B)′", txt: "(A ∩ B)′ = A′ ∪ B′: falla A o falla B (De Morgan)." },
      { key: "x", label: "Excluyentes", txt: "A ∩ B = ∅: no pueden ocurrir a la vez." }
    ];
    let cur = ops[0];
    const uid = "u" + (++uidSeq);
    const widget = el("div", "widget widget-venn");
    const controls = el("div", "widget-controls");
    const buttons = ops.map((o) => { const b = controlButton(o.label, o === cur); b.addEventListener("click", () => { cur = o; redraw(); }); controls.appendChild(b); return b; });
    const plot = makeSvg("0 0 640 330", "Diagrama de Venn con el espacio muestral S y los eventos A y B");
    const result = el("p", "widget-result");
    widget.append(controls, plot, result); host.appendChild(widget);
    function redraw() {
      buttons.forEach((b, i) => b.classList.toggle("is-active", ops[i] === cur));
      plot.replaceChildren();
      const sep = cur.key === "x";
      const ax = sep ? 200 : 255, bx = sep ? 440 : 385, cy = 168, r = 100;
      const defs = add(plot, "defs", {});
      const cA = add(defs, "clipPath", { id: `vA-${uid}` }); add(cA, "circle", { cx: ax, cy, r });
      const cB = add(defs, "clipPath", { id: `vB-${uid}` }); add(cB, "circle", { cx: bx, cy, r });
      const mk = add(defs, "mask", { id: `vnB-${uid}` });
      add(mk, "rect", { x: 0, y: 0, width: 640, height: 330, fill: "#fff" }); add(mk, "circle", { cx: bx, cy, r, fill: "#000" });
      const mAB = add(defs, "mask", { id: `vnAB-${uid}` });
      add(mAB, "rect", { x: 0, y: 0, width: 640, height: 330, fill: "#fff" }); add(mAB, "circle", { cx: ax, cy, r, fill: "#000" }); add(mAB, "circle", { cx: bx, cy, r, fill: "#000" });
      const mA = add(defs, "mask", { id: `vnA-${uid}` });
      add(mA, "rect", { x: 0, y: 0, width: 640, height: 330, fill: "#fff" }); add(mA, "circle", { cx: ax, cy, r, fill: "#000" });
      const sh = { fill: K_PAL.verde, "fill-opacity": 0.35 };
      add(plot, "rect", { x: 24, y: 20, width: 592, height: 296, fill: "#fff", stroke: K_PAL.medio, "stroke-width": 2 });
      if (cur.key === "u" || cur.key === "x") { add(plot, "circle", { cx: ax, cy, r, ...sh }); add(plot, "circle", { cx: bx, cy, r, ...sh }); }
      if (cur.key === "i") add(plot, "circle", { cx: bx, cy, r, "clip-path": `url(#vA-${uid})`, ...sh });
      if (cur.key === "c") add(plot, "rect", { x: 24, y: 20, width: 592, height: 296, mask: `url(#vnA-${uid})`, ...sh });
      if (cur.key === "d") add(plot, "circle", { cx: ax, cy, r, mask: `url(#vnB-${uid})`, ...sh });
      if (cur.key === "m") add(plot, "rect", { x: 24, y: 20, width: 592, height: 296, mask: `url(#vnAB-${uid})`, ...sh });
      if (cur.key === "m2") {
        add(plot, "rect", { x: 24, y: 20, width: 592, height: 296, ...sh });
        add(plot, "circle", { cx: bx, cy, r, "clip-path": `url(#vA-${uid})`, fill: "#fff" });
      }
      add(plot, "circle", { cx: ax, cy, r, fill: "none", stroke: K_PAL.azul, "stroke-width": 3.5 });
      add(plot, "circle", { cx: bx, cy, r, fill: "none", stroke: K_PAL.ocre, "stroke-width": 3.5 });
      add(plot, "text", { x: 44, y: 54, "font-size": 26, "font-weight": 700, fill: K_PAL.medio }, "S");
      add(plot, "text", { x: ax - (sep ? 0 : 50), y: cy + 9, "text-anchor": "middle", "font-size": 30, "font-weight": 700, fill: K_PAL.azul }, "A");
      add(plot, "text", { x: bx + (sep ? 0 : 50), y: cy + 9, "text-anchor": "middle", "font-size": 30, "font-weight": 700, fill: K_PAL.ocre }, "B");
      result.textContent = cur.txt;
    }
    redraw();
  }

  /* Probabilidades de A, B y A ∩ B con deslizadores: unión, condicional e independencia. */
  function vennProb(host) {
    const widget = el("div", "widget widget-venn");
    const controls = el("div", "widget-controls slider-control");
    const a = makeSlider(controls, "P(A)", "0", "1", "0.01", "0.40");
    const b = makeSlider(controls, "P(B)", "0", "1", "0.01", "0.30");
    const ab = makeSlider(controls, "P(A ∩ B)", "0", "1", "0.01", "0.12");
    const plot = makeSvg("0 0 640 300", "Diagrama de Venn proporcional con P(A), P(B) y P(A ∩ B)");
    const result = el("div", "widget-result");
    widget.append(controls, plot, result); host.appendChild(widget);
    const f2 = (v) => v.toFixed(2).replace(".", ",");
    function redraw() {
      let pa = +a.input.value, pb = +b.input.value, pab = +ab.input.value;
      const lo = Math.max(0, pa + pb - 1), hi = Math.min(pa, pb);
      if (pab < lo) pab = lo; if (pab > hi) pab = hi;
      ab.input.value = pab;
      a.output.textContent = f2(pa); b.output.textContent = f2(pb); ab.output.textContent = f2(pab);
      plot.replaceChildren();
      // Barra de S dividida en regiones: solo A, A ∩ B, solo B, ninguno.
      const W = 560, x0 = 40, y = 70, h = 90;
      const regs = [[pa - pab, K_PAL.azul, "A ∩ B′"], [pab, K_PAL.verde, "A ∩ B"], [pb - pab, K_PAL.ocre, "A′ ∩ B"], [1 - pa - pb + pab, "#ffffff", "A′ ∩ B′"]];
      let x = x0;
      add(plot, "text", { x: x0, y: 50, "font-size": 22, "font-weight": 700, fill: K_PAL.medio }, "S (área total = 1)");
      regs.forEach(([v, c, lab]) => {
        const w = W * v;
        if (w > 0.5) add(plot, "rect", { x, y, width: w, height: h, fill: c, "fill-opacity": c === "#ffffff" ? 1 : 0.35, stroke: K_PAL.medio, "stroke-width": 1.5 });
        if (w > 58) { add(plot, "text", { x: x + w / 2, y: y + 40, "text-anchor": "middle", "font-size": 19, "font-weight": 700, fill: K_PAL.tinta }, lab); add(plot, "text", { x: x + w / 2, y: y + 68, "text-anchor": "middle", "font-size": 19, fill: K_PAL.tinta }, f2(v)); }
        x += w;
      });
      add(plot, "line", { x1: x0, y1: y + h + 22, x2: x0 + W * pa, y2: y + h + 22, stroke: K_PAL.azul, "stroke-width": 6 });
      add(plot, "text", { x: x0, y: y + h + 50, "font-size": 19, "font-weight": 700, fill: K_PAL.azul }, "A");
      add(plot, "line", { x1: x0 + W * (pa - pab), y1: y + h + 64, x2: x0 + W * (pa + pb - pab), y2: y + h + 64, stroke: K_PAL.ocre, "stroke-width": 6 });
      add(plot, "text", { x: x0 + W * (pa - pab), y: y + h + 92, "font-size": 19, "font-weight": 700, fill: K_PAL.ocre }, "B");
      const pu = pa + pb - pab, cond = pb > 0 ? pab / pb : NaN, ind = Math.abs(pab - pa * pb) < 0.005;
      result.innerHTML = `P(A ∪ B) = ${f2(pa)} + ${f2(pb)} − ${f2(pab)} = <strong>${f2(pu)}</strong> · ` +
        `P(A | B) = ${f2(pab)} / ${f2(pb)} = <strong>${isNaN(cond) ? "—" : f2(cond)}</strong> · ` +
        (ind ? `<strong>independientes</strong>: P(A ∩ B) = P(A)·P(B)` : `no independientes: P(A)·P(B) = ${f2(pa * pb)}`);
    }
    [a, b, ab].forEach((s) => s.input.addEventListener("input", redraw));
    redraw();
  }


  /* Valor esperado como promedio a largo plazo: lanzamientos de un dado y promedio acumulado. */
  function promedioLargo(host) {
    const widget = el("div", "widget widget-promedio");
    const controls = el("div", "widget-controls");
    const b1 = controlButton("Lanzar 1 vez", false), b10 = controlButton("Lanzar 10", false), bAnim = controlButton("Animar hasta 1000", true), bReset = controlButton("Reiniciar", false);
    controls.append(b1, b10, bAnim, bReset);
    const plot = makeSvg("0 0 640 330", "Promedio acumulado de los lanzamientos de un dado frente al número de lanzamientos");
    const result = el("p", "widget-result");
    widget.append(controls, plot, result); host.appendChild(widget);
    let tiros = [], suma = 0, anim = null, seed = DEFAULT_SEED + 5, rng = seeded(seed);
    const cuenta = [0, 0, 0, 0, 0, 0];
    function lanzar(k) { for (let i = 0; i < k; i++) { const v = 1 + Math.floor(rng() * 6); tiros.push(v); suma += v; cuenta[v - 1]++; } }
    function redraw() {
      plot.replaceChildren();
      const left = 60, right = 430, top = 20, bottom = 280, N = Math.max(10, tiros.length);
      const PX = (i) => left + Math.log10(i) / Math.log10(Math.max(10, N)) * (right - left), PY = (y) => bottom - (y - 1) / 5 * (bottom - top);
      add(plot, "path", { d: `M${left} ${top}V${bottom}H${right}`, stroke: K_PAL.medio, "stroke-width": 2, fill: "none" });
      add(plot, "line", { x1: left, y1: PY(3.5), x2: right, y2: PY(3.5), stroke: K_PAL.rojo, "stroke-width": 2.5, "stroke-dasharray": "8 6" });
      add(plot, "text", { x: right - 2, y: PY(3.5) - 8, "text-anchor": "end", class: "v-tick", fill: K_PAL.rojo }, "E(X) = 3,5");
      [1, 2, 3, 4, 5, 6].forEach((v) => add(plot, "text", { x: left - 10, y: PY(v) + 6, "text-anchor": "end", class: "v-tick" }, String(v)));
      [1, 10, 100, 1000].filter((v) => v <= Math.max(10, N)).forEach((v) => add(plot, "text", { x: PX(v), y: bottom + 24, "text-anchor": "middle", class: "v-tick" }, String(v)));
      add(plot, "text", { x: (left + right) / 2, y: 322, "text-anchor": "middle", class: "v-axis-label" }, "número de lanzamientos (escala logarítmica)");
      if (tiros.length) {
        let s = 0, d = "";
        const paso = Math.max(1, Math.floor(tiros.length / 400));
        for (let i = 0; i < tiros.length; i++) { s += tiros[i]; if (i % paso === 0 || i === tiros.length - 1) d += (d ? "L" : "M") + PX(i + 1).toFixed(1) + " " + PY(s / (i + 1)).toFixed(1); }
        add(plot, "path", { d, stroke: K_PAL.azul, "stroke-width": 3, fill: "none" });
      }
      // Frecuencias relativas
      const hx = 470, hw = 150, hb = 280, maxF = Math.max(0.3, ...cuenta.map((c) => c / Math.max(1, tiros.length)));
      add(plot, "text", { x: hx + hw / 2, y: 30, "text-anchor": "middle", class: "v-tick" }, "frecuencia relativa");
      cuenta.forEach((c, i) => {
        const f = c / Math.max(1, tiros.length), h = f / maxF * 200, x = hx + i * 25;
        add(plot, "rect", { x, y: hb - h, width: 19, height: h, fill: K_PAL.verde, "fill-opacity": 0.7 });
        add(plot, "text", { x: x + 9.5, y: hb + 22, "text-anchor": "middle", class: "v-tick" }, String(i + 1));
      });
      add(plot, "line", { x1: hx - 4, y1: hb - (1 / 6) / maxF * 200, x2: hx + 150, y2: hb - (1 / 6) / maxF * 200, stroke: K_PAL.rojo, "stroke-width": 2, "stroke-dasharray": "5 5" });
      result.textContent = tiros.length ? `Lanzamientos: ${tiros.length} · promedio = ${fmt(suma / tiros.length, 3)} · E(X) = (1 + 2 + 3 + 4 + 5 + 6)/6 = 3,5` : "Pulse «Lanzar» o «Animar»: el promedio de los resultados se acerca a E(X) = 3,5.";
    }
    function parar() { if (anim) { cancelAnimationFrame(anim); anim = null; } }
    b1.addEventListener("click", () => { parar(); lanzar(1); redraw(); });
    b10.addEventListener("click", () => { parar(); lanzar(10); redraw(); });
    bReset.addEventListener("click", () => { parar(); seed += 97; rng = seeded(seed); tiros = []; suma = 0; cuenta.fill(0); redraw(); });
    bAnim.addEventListener("click", () => {
      parar();
      const paso = () => { if (tiros.length >= 1000) { anim = null; return; } lanzar(Math.max(1, Math.ceil(tiros.length / 40))); redraw(); anim = requestAnimationFrame(paso); };
      anim = requestAnimationFrame(paso);
    });
    redraw();
  }

  /* Método de Montecarlo: estimar una probabilidad repitiendo el experimento en el computador.
     Caso 1: dos dados, P(suma ≥ 10) = 6/36. Caso 2: carga C ~ N(22, 2²) y resistencia R ~ N(30, 3²), P(R < C) = Φ(−8/√13). */
  function montecarloWidget(host) {
    const widget = el("div", "widget widget-montecarlo");
    const tabs = el("div", "widget-controls");
    const tDados = controlButton("Dos dados: suma ≥ 10", true), tCarga = controlButton("Carga y resistencia", false);
    tabs.append(tDados, tCarga);
    const controls = el("div", "widget-controls");
    const b10 = controlButton("Simular 10", false), b100 = controlButton("Simular 100", false), bAnim = controlButton("Animar hasta 10 000", false), bReset = controlButton("Reiniciar", false);
    controls.append(b10, b100, bAnim, bReset);
    const plot = makeSvg("0 0 640 330", "Estimación de Montecarlo de una probabilidad frente al número de simulaciones");
    const result = el("p", "widget-result");
    widget.append(tabs, controls, plot, result); host.appendChild(widget);
    const PHI = (z) => 0.5 * (1 + erfAprox(z / Math.SQRT2));
    function erfAprox(x) { const s = Math.sign(x), a = Math.abs(x), t = 1 / (1 + 0.3275911 * a); const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-a * a); return s * y; }
    const CASOS = {
      dados: { exacta: 6 / 36, textoExacta: "6/36 = 0,1667", ymax: 0.4 },
      carga: { exacta: PHI(-8 / Math.sqrt(13)), textoExacta: "Φ(−8/√13) = 0,0132", ymax: 0.06 }
    };
    let caso = "dados", n = 0, exitos = 0, traza = [], ultimos = [], anim = null, seed = DEFAULT_SEED + 11, rng = seeded(seed);
    const normal = () => { let u = 0, v = 0; while (u === 0) u = rng(); v = rng(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
    function simular(k) {
      for (let i = 0; i < k; i++) {
        let ok, punto;
        if (caso === "dados") { const a = 1 + Math.floor(rng() * 6), b = 1 + Math.floor(rng() * 6); ok = a + b >= 10; punto = [a, b, ok]; }
        else { const c = 22 + 2 * normal(), r = 30 + 3 * normal(); ok = r < c; punto = [c, r, ok]; }
        n++; if (ok) exitos++;
        traza.push(exitos / n);
        ultimos.push(punto); if (ultimos.length > 600) ultimos.shift();
      }
    }
    function redraw() {
      plot.replaceChildren();
      const C = CASOS[caso];
      const left = 62, right = 400, top = 20, bottom = 270, N = Math.max(10, n);
      const PX = (i) => left + Math.log10(i) / Math.log10(Math.max(10, N)) * (right - left), PY = (y) => bottom - Math.min(y, C.ymax) / C.ymax * (bottom - top);
      add(plot, "path", { d: `M${left} ${top}V${bottom}H${right}`, stroke: K_PAL.medio, "stroke-width": 2, fill: "none" });
      add(plot, "line", { x1: left, y1: PY(C.exacta), x2: right, y2: PY(C.exacta), stroke: K_PAL.rojo, "stroke-width": 2.5, "stroke-dasharray": "8 6" });
      add(plot, "text", { x: right, y: PY(C.exacta) - 8, "text-anchor": "end", class: "v-tick", fill: K_PAL.rojo }, "exacta");
      [0, C.ymax / 2, C.ymax].forEach((v) => add(plot, "text", { x: left - 8, y: PY(v) + 6, "text-anchor": "end", class: "v-tick" }, fmt(v, caso === "dados" ? 1 : 2)));
      [1, 10, 100, 1000, 10000].filter((v) => v <= N).forEach((v) => add(plot, "text", { x: PX(v), y: bottom + 24, "text-anchor": "middle", class: "v-tick" }, v === 10000 ? "10 000" : String(v)));
      add(plot, "text", { x: (left + right) / 2, y: 322, "text-anchor": "middle", class: "v-axis-label" }, "simulaciones (escala logarítmica)");
      if (traza.length) {
        let d = ""; const paso = Math.max(1, Math.floor(traza.length / 500));
        for (let i = 0; i < traza.length; i++) if (i % paso === 0 || i === traza.length - 1) d += (d ? "L" : "M") + PX(i + 1).toFixed(1) + " " + PY(traza[i]).toFixed(1);
        add(plot, "path", { d, stroke: K_PAL.azul, "stroke-width": 3, fill: "none" });
      }
      // Panel derecho: lo que se simuló
      const hx = 440, hy = 30, hs = 180;
      if (caso === "dados") {
        add(plot, "text", { x: hx + hs / 2, y: 18, "text-anchor": "middle", class: "v-tick" }, "dado 1 × dado 2");
        const cnt = {}; ultimos.forEach(([a, b]) => { cnt[a + "," + b] = (cnt[a + "," + b] || 0) + 1; });
        const mx = Math.max(1, ...Object.values(cnt));
        for (let a = 1; a <= 6; a++) for (let b = 1; b <= 6; b++) {
          const f = (cnt[a + "," + b] || 0) / mx, ok = a + b >= 10;
          add(plot, "rect", { x: hx + (a - 1) * 30, y: hy + (6 - b) * 30, width: 27, height: 27, fill: ok ? K_PAL.verde : K_PAL.medio, "fill-opacity": ((ok ? 0.22 : 0.06) + 0.75 * f).toFixed(2) });
        }
        add(plot, "text", { x: hx + hs / 2, y: hy + hs + 30, "text-anchor": "middle", class: "v-tick", fill: K_PAL.verde }, "verde: suma ≥ 10 (6 de 36)");
      } else {
        add(plot, "text", { x: hx + hs / 2, y: 18, "text-anchor": "middle", class: "v-tick" }, "carga C frente a resistencia R");
        const X = (c) => hx + (c - 14) / 24 * hs, Y = (r) => hy + hs - (r - 18) / 24 * hs;
        add(plot, "path", { d: `M${hx} ${hy}V${hy + hs}H${hx + hs}`, stroke: K_PAL.medio, "stroke-width": 1.5, fill: "none" });
        add(plot, "line", { x1: X(18), y1: Y(18), x2: X(38), y2: Y(38), stroke: K_PAL.rojo, "stroke-width": 2, "stroke-dasharray": "6 5" });
        ultimos.forEach(([c, r, ok]) => { if (c > 14 && c < 38 && r > 18 && r < 42) add(plot, "circle", { cx: X(c).toFixed(1), cy: Y(r).toFixed(1), r: ok ? 4 : 2.2, fill: ok ? K_PAL.rojo : K_PAL.azul, "fill-opacity": ok ? 1 : 0.35 }); });
        add(plot, "text", { x: hx + hs / 2, y: hy + hs + 30, "text-anchor": "middle", class: "v-tick", fill: K_PAL.rojo }, "rojo: R < C, el elemento falla");
      }
      const est = n ? exitos / n : 0;
      const miles = (v) => String(v).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
      result.innerHTML = n
        ? `Simulaciones: ${miles(n)} · éxitos: ${miles(exitos)} · estimación = ${fmt(est, 4)} · exacta = <strong>${C.textoExacta}</strong>`
        : (caso === "dados" ? "Se lanzan dos dados muchas veces y se cuenta qué fracción suma 10 o más." : "Se generan muchas parejas de carga y resistencia y se cuenta qué fracción falla.");
    }
    function parar() { if (anim) { cancelAnimationFrame(anim); anim = null; } }
    function reiniciar() { parar(); seed += 97; rng = seeded(seed); n = 0; exitos = 0; traza = []; ultimos = []; redraw(); }
    function elegir(c) { caso = c; tDados.classList.toggle("is-active", c === "dados"); tCarga.classList.toggle("is-active", c === "carga"); reiniciar(); }
    tDados.addEventListener("click", () => elegir("dados"));
    tCarga.addEventListener("click", () => elegir("carga"));
    b10.addEventListener("click", () => { parar(); simular(10); redraw(); });
    b100.addEventListener("click", () => { parar(); simular(100); redraw(); });
    bReset.addEventListener("click", reiniciar);
    bAnim.addEventListener("click", () => {
      parar();
      const paso = () => { if (n >= 10000) { anim = null; return; } simular(Math.min(10000 - n, Math.max(1, Math.ceil(n / 30)))); redraw(); anim = requestAnimationFrame(paso); };
      anim = requestAnimationFrame(paso);
    });
    redraw();
  }

  /* Función de probabilidad de Poisson con deslizador para λ. */
  function poissonWidget(host) {
    const widget = el("div", "widget widget-poisson");
    const controls = el("div", "widget-controls slider-control");
    const lCtl = makeSlider(controls, "Promedio de eventos, λ", "0.5", "12", "0.1", "2.0");
    const plot = makeSvg("0 0 640 330", "Función de probabilidad de Poisson");
    const result = el("p", "widget-result");
    widget.append(controls, plot, result); host.appendChild(widget);
    function redraw() {
      const lam = Number(lCtl.input.value); lCtl.output.textContent = fmt(lam, 1);
      plot.replaceChildren();
      const xs = [...Array(21).keys()], ps = [];
      let pk = Math.exp(-lam); xs.forEach((x) => { if (x > 0) pk *= lam / x; ps.push(pk); });
      const left = 56, right = 620, top = 24, bottom = 276, mx = Math.max(...ps) * 1.12, w = (right - left) / xs.length;
      add(plot, "path", { d: `M${left} ${top}V${bottom}H${right}`, stroke: K_PAL.medio, "stroke-width": 2, fill: "none" });
      xs.forEach((x, i) => {
        const h = ps[i] / mx * (bottom - top);
        add(plot, "rect", { x: left + i * w + 3, y: bottom - h, width: w - 6, height: h, fill: K_PAL.morado || "#6B3FA0", "fill-opacity": 0.7 });
        if (x % 2 === 0) add(plot, "text", { x: left + i * w + w / 2, y: bottom + 22, "text-anchor": "middle", class: "v-tick" }, String(x));
      });
      const xm = left + lam * w + w / 2;
      add(plot, "line", { x1: xm, y1: top, x2: xm, y2: bottom, stroke: K_PAL.rojo, "stroke-width": 2.5, "stroke-dasharray": "8 6" });
      add(plot, "text", { x: Math.min(right - 60, xm + 6), y: top + 16, class: "v-tick", fill: K_PAL.rojo }, "E(X) = λ");
      add(plot, "text", { x: (left + right) / 2, y: 318, "text-anchor": "middle", class: "v-axis-label" }, "x, número de eventos en el intervalo");
      result.textContent = `P(X = 0) = ${fmt(ps[0], 3)} · E(X) = Var(X) = ${fmt(lam, 1)} · σ = ${fmt(Math.sqrt(lam), 2)}`;
    }
    lCtl.input.addEventListener("input", redraw);
    redraw();
  }

  /* Probabilidad total y Bayes con tres causas (o prueba médica 99 %): presets, deslizadores y árbol proporcional. */
  function bayesTres(host) {
    const widget = el("div", "widget widget-bayes3");
    const presetRow = el("div", "widget-controls");
    let medMode = false;
    const btnM3 = controlButton("3 máquinas (apuntes)", true);
    const btnFab = controlButton("Fábrica M₁–M₃", false);
    const btnMed = controlButton("Prueba médica 99 % (paradoja)", false);
    presetRow.append(btnM3, btnFab, btnMed);

    const controls = el("div", "widget-controls slider-control");
    const a1 = makeSlider(controls, "P(A₁)", "0.05", "0.9", "0.01", "0.10");
    const a2 = makeSlider(controls, "P(A₂)", "0.05", "0.9", "0.01", "0.30");
    const d1 = makeSlider(controls, "P(D | A₁)", "0", "0.2", "0.005", "0.01");
    const d2 = makeSlider(controls, "P(D | A₂)", "0", "0.2", "0.005", "0.03");
    const d3 = makeSlider(controls, "P(D | A₃)", "0", "0.2", "0.005", "0.05");
    const plot = makeSvg("0 0 640 275", "Árbol de probabilidad con ramas, probabilidad total y posteriores de Bayes");
    plot.style.height = "235px"; plot.style.maxHeight = "235px";
    const result = el("div", "widget-result");
    widget.append(presetRow, controls, plot, result); host.appendChild(widget);
    const f = (v, d) => fmt(v, d === undefined ? 3 : d);

    function applyThree(v1, v2, r1, r2, r3, activeBtn) {
      medMode = false;
      [btnM3, btnFab, btnMed].forEach((b) => b.classList.toggle("is-active", b === activeBtn));
      controls.style.display = "flex";
      a1.input.value = String(v1); a2.input.value = String(v2);
      d1.input.value = String(r1); d2.input.value = String(r2); d3.input.value = String(r3);
      redraw();
    }

    function redraw() {
      plot.replaceChildren();
      if (medMode) {
        [btnM3, btnFab, btnMed].forEach((b) => b.classList.toggle("is-active", b === btnMed));
        controls.style.display = "none";
        const prev = 0.01, sens = 0.99, fp = 0.01;
        const tp = prev * sens, fpos = (1 - prev) * fp, pPos = tp + fpos, post = tp / pPos;
        const ys = [78, 196];
        [[prev, sens, tp, "Enfermo (1 %)", K_PAL.rojo, "99 verdaderos positivos"],
         [1 - prev, fp, fpos, "Sano (99 %)", K_PAL.azul, "99 falsos positivos"]].forEach(([pr, ql, rm, lab, col, nTxt], i) => {
          add(plot, "line", { x1: 36, y1: 138, x2: 175, y2: ys[i], stroke: col, "stroke-width": 2.5 + 8 * pr });
          add(plot, "text", { x: 96, y: (138 + ys[i]) / 2 - 8, class: "v-tick", fill: col }, f(pr, 2));
          add(plot, "text", { x: 184, y: ys[i] + 6, "font-size": 16, "font-weight": 700, fill: col }, lab);
          add(plot, "line", { x1: 300, y1: ys[i], x2: 400, y2: ys[i] - 12, stroke: K_PAL.ocre, "stroke-width": 3 });
          add(plot, "text", { x: 348, y: ys[i] - 18, "text-anchor": "middle", class: "v-tick", fill: K_PAL.ocre }, f(ql, 2));
          add(plot, "text", { x: 408, y: ys[i] - 7, "font-size": 16, "font-weight": 700, fill: K_PAL.ocre }, "+");
          add(plot, "text", { x: 432, y: ys[i] - 8, "font-size": 15, fill: K_PAL.tinta }, `rama = ${f(rm, 4)} (${nTxt.split(" ")[0]} de 10 000)`);
          add(plot, "text", { x: 432, y: ys[i] + 15, "font-size": 15, "font-weight": 700, fill: K_PAL.verde }, i === 0 ? `P(Enf | +) = 99 / 198 = 50,0 %` : `P(Sano | +) = 99 / 198 = 50,0 %`);
        });
        add(plot, "text", { x: 36, y: 26, class: "v-kicker" }, "En 10 000 personas: 100 ENFERMAS Y 9 900 SANAS · TEST FIABLE AL 99 %");
        add(plot, "circle", { cx: 36, cy: 138, r: 6, fill: K_PAL.tinta });
        result.innerHTML = `<strong>1. Ramas:</strong> 0,0099 + 0,0099 · <strong>2. Total P(+):</strong> ${f(pPos, 4)} · <strong>3. Bayes:</strong> P(Enf | +) = <strong>${fmt(post * 100, 1)} %</strong> (solo 1 de cada 2 positivos)`;
        return;
      }

      controls.style.display = "flex";
      let p1 = +a1.input.value, p2 = +a2.input.value;
      if (p1 + p2 > 0.95) { p2 = 0.95 - p1; a2.input.value = p2; }
      const p3 = 1 - p1 - p2, q = [+d1.input.value, +d2.input.value, +d3.input.value], pr = [p1, p2, p3];
      a1.output.textContent = f(p1, 2); a2.output.textContent = f(p2, 2); d1.output.textContent = f(q[0]); d2.output.textContent = f(q[1]); d3.output.textContent = f(q[2]);
      const ramas = pr.map((p, i) => p * q[i]), pd = ramas.reduce((a, b) => a + b, 0);
      const ys = [52, 138, 224];
      pr.forEach((p, i) => {
        add(plot, "line", { x1: 40, y1: 138, x2: 190, y2: ys[i], stroke: K_PAL.azul, "stroke-width": 2 + 10 * p });
        add(plot, "text", { x: 100, y: (138 + ys[i]) / 2 - 10, class: "v-tick", fill: K_PAL.azul }, f(p, 2));
        add(plot, "text", { x: 200, y: ys[i] + 7, class: "v-tick", "font-weight": 700, fill: K_PAL.azul }, `A${"₁₂₃"[i]}`);
        add(plot, "line", { x1: 235, y1: ys[i], x2: 360, y2: ys[i] - 18, stroke: K_PAL.ocre, "stroke-width": 2 + 40 * q[i] });
        add(plot, "text", { x: 280, y: ys[i] - 24, class: "v-tick", fill: K_PAL.ocre }, f(q[i]));
        add(plot, "text", { x: 370, y: ys[i] - 12, class: "v-tick", "font-weight": 700, fill: K_PAL.ocre }, "D");
        add(plot, "text", { x: 400, y: ys[i] - 12, class: "v-tick" }, `rama: ${f(ramas[i], 4)}`);
        add(plot, "text", { x: 400, y: ys[i] + 14, class: "v-tick", fill: K_PAL.verde, "font-weight": 700 }, `P(A${"₁₂₃"[i]} | D) = ${pd ? f(ramas[i] / pd) : "—"}`);
      });
      add(plot, "circle", { cx: 40, cy: 138, r: 6, fill: K_PAL.tinta });
      const pPost = ramas.map((r) => (pd ? fmt(r / pd * 100, 1) + " %" : "—"));
      result.innerHTML = `P(A₃) = ${f(p3, 2)} · P(D) = ${ramas.map((r) => f(r, 4)).join(" + ")} = <strong>${f(pd, 4)}</strong> · P(Aᵢ | D): <strong>${pPost.join(" / ")}</strong>`;
    }

    btnM3.addEventListener("click", () => applyThree(0.10, 0.30, 0.01, 0.03, 0.05, btnM3));
    btnFab.addEventListener("click", () => applyThree(0.60, 0.30, 0.02, 0.03, 0.04, btnFab));
    btnMed.addEventListener("click", () => { medMode = true; redraw(); });
    [a1, a2, d1, d2, d3].forEach((s) => s.input.addEventListener("input", () => {
      medMode = false;
      [btnM3, btnFab, btnMed].forEach((b) => b.classList.remove("is-active"));
      redraw();
    }));
    redraw();
  }

  /* ---------- Adivina Quién: probabilidad condicional clásica y actualización bayesiana con testigo ---------- */
  function adivinaQuien(host) {
    const chars = [
      { name: "Ana", gafas: false, sombrero: false, barba: false, azul: true, hair: "largo" },
      { name: "Bruno", gafas: true, sombrero: false, barba: true, azul: true, hair: "corto" },
      { name: "Clara", gafas: true, sombrero: true, barba: false, azul: false, hair: "largo" },
      { name: "Diego", gafas: false, sombrero: true, barba: true, azul: false, hair: "corto" },
      { name: "Elena", gafas: true, sombrero: false, barba: false, azul: false, hair: "largo" },
      { name: "Felipe", gafas: false, sombrero: false, barba: true, azul: true, hair: "corto" },
      { name: "Greta", gafas: false, sombrero: true, barba: false, azul: false, hair: "largo" },
      { name: "Hugo", gafas: true, sombrero: true, barba: true, azul: true, hair: "corto" },
      { name: "Inés", gafas: true, sombrero: true, barba: false, azul: true, hair: "largo" },
      { name: "Jorge", gafas: false, sombrero: false, barba: true, azul: false, hair: "corto" },
      { name: "Lucía", gafas: true, sombrero: false, barba: false, azul: true, hair: "largo" },
      { name: "Mateo", gafas: false, sombrero: true, barba: true, azul: true, hair: "corto" }
    ];
    const traits = [
      { key: "gafas", label: "¿Usa gafas?" },
      { key: "sombrero", label: "¿Lleva sombrero?" },
      { key: "barba", label: "¿Tiene barba?" },
      { key: "azul", label: "¿Camisa azul?" }
    ];
    let mode = "clasico", seed = DEFAULT_SEED + 17, secretIdx = 7, revealed = false, inspectedIdx = null, demoStep = 0;
    let alive = chars.map(() => true), probs = chars.map(() => 1 / chars.length), factors = chars.map(() => []), asked = new Set(), logMsg = "Formule una pregunta para reducir el espacio muestral.";

    const wrap = el("div", "widget aq-wrap");
    const top = el("div", "aq-top");
    const cLeft = el("div", "widget-controls");
    const btnClas = controlButton("Clásico (certeza 100 %)", true);
    const btnBay = controlButton("Bayesiano (testigo imperfecto)", false);
    const qCtl = makeSlider(cLeft, "Fiabilidad testigo, q", "0.60", "0.95", "0.05", "0.80");
    qCtl.label.style.display = "none";
    const cRight = el("div", "widget-controls");
    const btnDemo = controlButton("Demo guiada (Paso 1→4)", false);
    const btnReset = controlButton("Reiniciar pistas", false);
    const btnNew = controlButton("Nueva partida", false);
    const btnRev = controlButton("Revelar secreto", false);
    cLeft.insertBefore(btnBay, qCtl.label);
    cLeft.insertBefore(btnClas, btnBay);
    cRight.append(btnDemo, btnReset, btnNew, btnRev);
    top.append(cLeft, cRight);

    const qbar = el("div", "aq-qbar");
    const qBtns = traits.map((tr) => {
      const b = controlButton(tr.label, false);
      b.addEventListener("click", () => { demoStep = 0; ask(tr); });
      qbar.appendChild(b);
      return b;
    });
    const logEl = el("div", "aq-log", logMsg);
    const board = el("div", "aq-board");
    const mathEl = el("div", "aq-math");
    const result = el("p", "widget-result");
    wrap.append(top, qbar, logEl, board, mathEl, result);
    host.appendChild(wrap);

    function portraitSvg(ch, isOut) {
      const shirt = ch.azul ? K_PAL.azul : K_PAL.ocre;
      let parts = `<rect x="0" y="0" width="110" height="88" fill="#fbfcf9"/>`;
      parts += `<path d="M18 88 C22 65, 88 65, 92 88 Z" fill="${shirt}"/>`;
      if (ch.hair === "largo" && !ch.sombrero) {
        parts += `<path d="M31 44 C29 14, 81 14, 79 44 L81 66 L29 66 Z" fill="#3a3d39"/>`;
      }
      parts += `<circle cx="55" cy="44" r="20" fill="#ecd7c4" stroke="${K_PAL.tinta}" stroke-width="2"/>`;
      if (ch.hair === "corto" && !ch.sombrero) {
        parts += `<path d="M35 38 C35 19, 75 19, 75 38 C69 27, 41 27, 35 38 Z" fill="#3a3d39"/>`;
      }
      parts += `<circle cx="47" cy="42" r="2.6" fill="${K_PAL.tinta}"/><circle cx="63" cy="42" r="2.6" fill="${K_PAL.tinta}"/>`;
      parts += `<path d="M49 52 Q55 56 61 52" fill="none" stroke="${K_PAL.tinta}" stroke-width="1.8" stroke-linecap="round"/>`;
      if (ch.gafas) {
        parts += `<rect x="38" y="36" width="14" height="11" fill="#d9ecff" fill-opacity=".6" stroke="${K_PAL.tinta}" stroke-width="2.2"/>`;
        parts += `<rect x="58" y="36" width="14" height="11" fill="#d9ecff" fill-opacity=".6" stroke="${K_PAL.tinta}" stroke-width="2.2"/>`;
        parts += `<line x1="52" y1="41" x2="58" y2="41" stroke="${K_PAL.tinta}" stroke-width="2.2"/>`;
      }
      if (ch.barba) {
        parts += `<path d="M37 49 Q55 72 73 49 L68 62 Q55 71 42 62 Z" fill="#2c332d"/>`;
        parts += `<path d="M49 52 Q55 56 61 52" fill="none" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/>`;
      }
      if (ch.sombrero) {
        parts += `<path d="M34 29 L39 10 H71 L76 29 Z" fill="#252c26"/>`;
        parts += `<line x1="22" y1="29" x2="88" y2="29" stroke="${K_PAL.tinta}" stroke-width="4.5" stroke-linecap="round"/>`;
      }
      if (isOut) parts += `<line x1="12" y1="78" x2="98" y2="10" stroke="${K_PAL.rojo}" stroke-width="2.5" stroke-dasharray="6 4"/>`;
      return `<svg viewBox="0 0 110 88" aria-hidden="true">${parts}</svg>`;
    }

    function resetBoard(newSecret) {
      if (newSecret) {
        seed += 1009;
        const rng = seeded(seed);
        secretIdx = Math.floor(rng() * chars.length);
      }
      demoStep = 0;
      inspectedIdx = null;
      revealed = false;
      alive = chars.map(() => true);
      probs = chars.map(() => 1 / chars.length);
      factors = chars.map(() => []);
      asked = new Set();
      logMsg = mode === "clasico"
        ? "Modo clásico: cada pista descarta por completo a quienes no coinciden."
        : "Modo bayesiano: el testigo responde con acierto q; ninguna sospecha cae a cero.";
      redraw();
    }

    function applyBayesEvidence(tr, answer, q) {
      asked.add(tr.key);
      let sum = 0;
      const raw = chars.map((c, i) => {
        const match = Boolean(c[tr.key]) === answer;
        const f = match ? q : 1 - q;
        factors[i].push(f);
        const v = probs[i] * f;
        sum += v;
        return v;
      });
      probs = raw.map((v) => v / sum);
    }

    function ask(tr) {
      const truth = Boolean(chars[secretIdx][tr.key]);
      if (mode === "clasico") {
        asked.add(tr.key);
        chars.forEach((c, i) => { if (Boolean(c[tr.key]) !== truth) alive[i] = false; });
        const count = alive.filter(Boolean).length;
        probs = alive.map((a) => (a ? 1 / count : 0));
        logMsg = `${tr.label} → ${truth ? "SÍ" : "NO"} · Sobreviven ${count} de 12 candidatos (probabilidad ${fmt(100 / count, 1)} % cada uno).`;
      } else {
        const q = Number(qCtl.input.value);
        seed += 7919;
        const rng = seeded(seed);
        const answer = rng() < q ? truth : !truth;
        applyBayesEvidence(tr, answer, q);
        const notaTestigo = answer === truth ? "acertó" : "se equivocó";
        logMsg = `Testigo (q = ${fmt(q, 2)}): ${tr.label} → ${answer ? "SÍ" : "NO"} · Factor Bayes = ${fmt(q / (1 - q), 1)}×` + (revealed ? ` (el testigo ${notaTestigo})` : ".");
      }
      redraw();
    }

    function runDemoStep() {
      const nextStep = (demoStep % 4) + 1;
      if (nextStep === 1) {
        mode = "bayes"; qCtl.input.value = "0.80";
        resetBoard(false);
        secretIdx = 7; demoStep = 1;
        logMsg = "Demo 1/4: previa uniforme P(Hᵢ) = 1/12 = 8,3 %. Ninguna pista aún.";
      } else if (nextStep === 2) {
        demoStep = 2; applyBayesEvidence(traits[0], true, 0.80);
        logMsg = "Demo 2/4: testigo (q = 0,80) dice «¿Usa gafas? → SÍ». Quienes tienen gafas se multiplican por 4× respecto al resto.";
      } else if (nextStep === 3) {
        demoStep = 3; applyBayesEvidence(traits[2], true, 0.80);
        logMsg = "Demo 3/4: se agrega «¿Tiene barba? → SÍ». Bruno y Hugo reúnen ambas evidencias (24,2 % cada uno).";
      } else {
        demoStep = 4; applyBayesEvidence(traits[0], true, 0.80);
        logMsg = "Demo 4/4: segundo testigo independiente repite «¿Usa gafas? → SÍ». Se concentra la probabilidad sin descartar a nadie.";
      }
      inspectedIdx = null;
      redraw();
    }

    function redraw() {
      btnClas.classList.toggle("is-active", mode === "clasico");
      btnBay.classList.toggle("is-active", mode === "bayes");
      btnDemo.classList.toggle("is-active", demoStep > 0);
      btnDemo.textContent = demoStep > 0 ? `Demo guiada (${demoStep}/4 →)` : "Demo guiada (Paso 1→4)";
      qCtl.label.style.display = mode === "bayes" ? "flex" : "none";
      const q = Number(qCtl.input.value);
      qCtl.output.textContent = fmt(q, 2);
      btnRev.classList.toggle("is-active", revealed);
      qBtns.forEach((b, i) => {
        const key = traits[i].key;
        b.disabled = mode === "clasico" && asked.has(key);
        b.classList.toggle("is-active", asked.has(key));
      });
      logEl.textContent = logMsg;
      board.replaceChildren();
      let maxP = -1, topIdx = 0;
      probs.forEach((p, i) => { if (p > maxP) { maxP = p; topIdx = i; } });
      const activeIdx = inspectedIdx !== null ? inspectedIdx : topIdx;
      const topName = chars[topIdx].name;

      chars.forEach((ch, i) => {
        const p = probs[i];
        const isOut = mode === "clasico" && !alive[i];
        const card = el("button", "widget-button aq-card" + (isOut ? " is-out" : "") + (i === activeIdx ? " is-inspected" : "") + (revealed && i === secretIdx ? " is-secret" : ""));
        card.type = "button";
        card.innerHTML = portraitSvg(ch, isOut);
        const meta = el("div", "aq-meta");
        meta.append(el("span", "aq-name", ch.name), el("span", "aq-prob", `${fmt(p * 100, 1)} %`));
        const track = el("div", "aq-bar-track");
        const fill = el("div", "aq-bar-fill");
        fill.style.width = `${Math.min(100, p * 100).toFixed(1)}%`;
        fill.style.backgroundColor = revealed && i === secretIdx ? K_PAL.verde : (p >= maxP - 1e-6 && asked.size > 0 ? K_PAL.azul : "#6e88a6");
        track.appendChild(fill);
        const resumen = [ch.gafas ? "gafas" : "sin gafas", ch.sombrero ? "sombrero" : "no sombr.", ch.barba ? "barba" : "no barba", ch.azul ? "azul" : "ocre"].join(" · ");
        card.append(meta, track, el("div", "aq-traits", resumen));
        card.addEventListener("click", () => { inspectedIdx = i; redraw(); });
        board.appendChild(card);
      });

      const sel = chars[activeIdx];
      if (mode === "clasico") {
        const rem = alive.filter(Boolean).length;
        mathEl.innerHTML = `Desglose para <strong>${sel.name}</strong> (clic en cualquier carta): ` +
          (alive[activeIdx] ? `cumple las pistas (∈ B) → P(${sel.name} | B) = 1/${rem} = <strong>${fmt(100 / rem, 1)} %</strong>` : `descartado por una pista (∉ B) → <strong>0,0 %</strong>`);
        result.textContent = `Espacio reducido |B| = ${rem} · P(secreto | pistas) = 1/${rem} = ${fmt(100 / rem, 1)} %` + (revealed ? ` · Secreto: ${chars[secretIdx].name}` : "");
      } else {
        const fs = factors[activeIdx];
        const normSum = chars.reduce((acc, _, idx) => acc + (1 / chars.length) * factors[idx].reduce((p, x) => p * x, 1), 0);
        const unnorm = (1 / chars.length) * fs.reduce((p, x) => p * x, 1);
        const multTxt = fs.length ? ` × ${fs.map((v) => fmt(v, 2)).join(" × ")} = ${fmt(unnorm, 4)} → posterior = ${fmt(unnorm, 4)} / ${fmt(normSum, 4)}` : "";
        mathEl.innerHTML = `Regla de Bayes para <strong>${sel.name}</strong> (clic en cualquier carta): previa 1/12 (8,3 %)${multTxt} = <strong>${fmt(probs[activeIdx] * 100, 1)} %</strong>`;
        result.textContent = `Más probable: ${topName} (${fmt(maxP * 100, 1)} %)` + (revealed ? ` · Secreto real: ${chars[secretIdx].name} (${fmt(probs[secretIdx] * 100, 1)} %)` : " · Puede repetir una pregunta para simular otro testigo independiente.");
      }
    }

    btnClas.addEventListener("click", () => { mode = "clasico"; resetBoard(false); });
    btnBay.addEventListener("click", () => { mode = "bayes"; resetBoard(false); });
    btnDemo.addEventListener("click", runDemoStep);
    qCtl.input.addEventListener("input", () => { qCtl.output.textContent = fmt(Number(qCtl.input.value), 2); });
    btnReset.addEventListener("click", () => resetBoard(false));
    btnNew.addEventListener("click", () => resetBoard(true));
    btnRev.addEventListener("click", () => { revealed = !revealed; redraw(); });
    redraw();
  }

  /* ---------- Binomial estilo Primer: simulación animada de tiros libres + árbol de rutas ---------- */
  function primerBinomial(host) {
    const modes = [{ key: "sim", label: "Simulación de tiros" }, { key: "arbol", label: "Árbol de rutas (n = 3)" }];
    let mode = modes[0], seed = DEFAULT_SEED + 31, animId = null, treeFilter = null;
    let totalRounds = 0, counts = [], lastRoundShots = [], animBall = null;

    const widget = el("div", "widget widget-primer");
    const row1 = el("div", "widget-controls");
    const mBtns = modes.map((m) => {
      const b = controlButton(m.label, m === mode);
      b.addEventListener("click", () => { stopAnim(); mode = m; redraw(); });
      row1.appendChild(b); return b;
    });
    const bRound = controlButton("1 ronda animada", false);
    const b25 = controlButton("+25 rondas", false);
    const b200 = controlButton("Animar 200", false);
    const bReset = controlButton("Reiniciar", false);
    const filterOpts = [[null, "Todas (8)"], [3, "X = 3 (1)"], [2, "X = 2 (3)"], [1, "X = 1 (3)"], [0, "X = 0 (1)"]];
    const fBtns = filterOpts.map(([val, lab]) => {
      const b = controlButton(lab, val === treeFilter);
      b.addEventListener("click", () => { treeFilter = val; redraw(); });
      return b;
    });
    row1.append(bRound, b25, b200, bReset, ...fBtns);

    const row2 = el("div", "widget-controls slider-control");
    const nCtl = makeSlider(row2, "Tiros por ronda, n", "3", "12", "1", "6");
    const pCtl = makeSlider(row2, "Probabilidad de acierto, p", "0.10", "0.90", "0.05", "0.70");

    const plot = makeSvg("0 0 640 320", "Simulador de tiros libres y distribución binomial empírica frente a teórica");
    const result = el("p", "widget-result");
    widget.append(row1, row2, plot, result);
    host.appendChild(widget);

    const combL = (n, x) => { let c = 1; for (let i = 0; i < x; i++) c = c * (n - i) / (i + 1); return c; };
    function stopAnim() { if (animId) { cancelAnimationFrame(animId); animId = null; } animBall = null; }
    function resetCounts() {
      stopAnim();
      const n = Number(nCtl.input.value);
      counts = Array(n + 1).fill(0);
      totalRounds = 0;
      lastRoundShots = [];
      redraw();
    }

    function simulateOneSync(rng, n, p) {
      let hits = 0; const shots = [];
      for (let i = 0; i < n; i++) { const ok = rng() < p; if (ok) hits++; shots.push(ok); }
      counts[hits]++; totalRounds++; lastRoundShots = shots;
    }

    function runBatch(k) {
      stopAnim();
      const n = Number(nCtl.input.value), p = Number(pCtl.input.value);
      if (counts.length !== n + 1) counts = Array(n + 1).fill(0);
      seed += 101;
      const rng = seeded(seed);
      let leftToRun = k;
      const step = () => {
        const chunk = Math.min(leftToRun, k <= 25 ? 2 : 5);
        for (let i = 0; i < chunk; i++) simulateOneSync(rng, n, p);
        leftToRun -= chunk;
        redraw();
        if (leftToRun > 0) animId = requestAnimationFrame(step);
        else animId = null;
      };
      animId = requestAnimationFrame(step);
    }

    function runAnimatedRound() {
      stopAnim();
      const n = Number(nCtl.input.value), p = Number(pCtl.input.value);
      if (counts.length !== n + 1) counts = Array(n + 1).fill(0);
      seed += 313;
      const rng = seeded(seed);
      const shots = []; for (let i = 0; i < n; i++) shots.push(rng() < p);
      let sIdx = 0;
      lastRoundShots = [];
      const dur = 160;
      let t0 = performance.now();
      const tick = (now) => {
        const u = Math.min(1, (now - t0) / dur);
        animBall = { u, make: shots[sIdx] };
        redraw();
        if (u < 1) { animId = requestAnimationFrame(tick); return; }
        lastRoundShots.push(shots[sIdx]);
        sIdx++;
        if (sIdx < n) { t0 = performance.now(); animId = requestAnimationFrame(tick); return; }
        animBall = null;
        counts[shots.filter(Boolean).length]++;
        totalRounds++;
        redraw();
        animId = null;
      };
      animId = requestAnimationFrame(tick);
    }

    function redraw() {
      mBtns.forEach((b, i) => b.classList.toggle("is-active", modes[i] === mode));
      const isSim = mode.key === "sim";
      [bRound, b25, b200, bReset].forEach((b) => { b.disabled = !isSim; b.style.display = isSim ? "" : "none"; });
      fBtns.forEach((b, i) => { b.style.display = isSim ? "none" : ""; b.classList.toggle("is-active", filterOpts[i][0] === treeFilter); });
      nCtl.label.style.display = isSim ? "flex" : "none";
      const n = Number(nCtl.input.value), p = Number(pCtl.input.value);
      nCtl.output.textContent = String(n); pCtl.output.textContent = fmt(p, 2);
      if (counts.length !== n + 1) counts = Array(n + 1).fill(0);
      plot.replaceChildren();

      if (isSim) {
        // Zona superior: cancha minimalista y secuencia de la ronda actual
        add(plot, "line", { x1: 28, y1: 92, x2: 254, y2: 92, stroke: K_PAL.medio, "stroke-width": 1.5 });
        add(plot, "circle", { cx: 48, cy: 52, r: 6, fill: K_PAL.tinta });
        add(plot, "line", { x1: 48, y1: 58, x2: 48, y2: 80, stroke: K_PAL.tinta, "stroke-width": 3 });
        add(plot, "line", { x1: 48, y1: 64, x2: 64, y2: 52, stroke: K_PAL.tinta, "stroke-width": 2.5 });
        add(plot, "line", { x1: 48, y1: 80, x2: 42, y2: 92, stroke: K_PAL.tinta, "stroke-width": 2.5 });
        add(plot, "line", { x1: 48, y1: 80, x2: 54, y2: 92, stroke: K_PAL.tinta, "stroke-width": 2.5 });
        add(plot, "line", { x1: 242, y1: 22, x2: 242, y2: 64, stroke: K_PAL.tinta, "stroke-width": 4 });
        add(plot, "line", { x1: 216, y1: 48, x2: 242, y2: 48, stroke: K_PAL.ocre, "stroke-width": 3.5 });
        add(plot, "path", { d: "M218 48 L223 64 H235 L240 48", fill: "none", stroke: K_PAL.medio, "stroke-width": 1.4 });
        if (animBall) {
          const u = animBall.u, bx = 66 + (228 - 66) * u;
          const peakY = animBall.make ? 14 : 20;
          const by = (1 - u) * (1 - u) * 52 + 2 * (1 - u) * u * peakY + u * u * (animBall.make ? 54 : 36);
          add(plot, "circle", { cx: bx.toFixed(1), cy: by.toFixed(1), r: 6.5, fill: animBall.make ? K_PAL.verde : K_PAL.rojo });
        }
        add(plot, "text", { x: 274, y: 26, class: "v-kicker" }, `Ronda (${lastRoundShots.length}/${n} tiros · aciertos = ${lastRoundShots.filter(Boolean).length})`);
        for (let i = 0; i < n; i++) {
          const cx = 286 + i * Math.min(28, 320 / n), cy = 58;
          const shot = lastRoundShots[i];
          const fill = shot === undefined ? "#fff" : (shot ? K_PAL.verde : "#fff");
          const stroke = shot === undefined ? K_PAL.gris : (shot ? K_PAL.verde : K_PAL.rojo);
          add(plot, "circle", { cx: cx.toFixed(1), cy, r: 9, fill, stroke, "stroke-width": 2.4 });
        }
        add(plot, "text", { x: 274, y: 88, "font-size": 15, fill: K_PAL.medio }, "Barras verdes: frecuencia simulada · Contorno azul: B(n, p) teórico");

        // Zona inferior: histograma empírico vs contorno binomial exacto
        const probs = []; for (let x = 0; x <= n; x++) probs.push(combL(n, x) * Math.pow(p, x) * Math.pow(1 - p, n - x));
        const emp = counts.map((c) => (totalRounds ? c / totalRounds : 0));
        const ymax = Math.max(...probs, ...emp, 0.25) * 1.12;
        const left = 56, right = 610, top = 124, bottom = 270;
        const step = (right - left) / (n + 1), bw = Math.max(12, Math.min(46, step * 0.68));
        const xc = (x) => left + step * (x + 0.5), Y = (v) => bottom - v / ymax * (bottom - top);
        baseline(plot, left, right, bottom, top);
        probs.forEach((pv, x) => {
          const eh = bottom - Y(emp[x]), th = bottom - Y(pv);
          add(plot, "rect", { x: (xc(x) - bw * 0.36).toFixed(1), y: Y(emp[x]).toFixed(1), width: (bw * 0.72).toFixed(1), height: eh.toFixed(1), fill: K_PAL.verde, "fill-opacity": 0.72 });
          add(plot, "rect", { x: (xc(x) - bw / 2).toFixed(1), y: Y(pv).toFixed(1), width: bw.toFixed(1), height: th.toFixed(1), fill: "none", stroke: K_PAL.azul, "stroke-width": 2.2 });
          add(plot, "text", { x: xc(x).toFixed(1), y: bottom + 20, "text-anchor": "middle", class: "v-tick" }, String(x));
        });
        const xm = left + step * (n * p + 0.5);
        add(plot, "line", { x1: xm.toFixed(1), y1: top, x2: xm.toFixed(1), y2: bottom, class: "v-mean-line" });
        add(plot, "text", { x: Math.min(right - 125, xm + 6).toFixed(1), y: top + 12, class: "v-marker-label" }, `E(X) = ${fmt(n * p, 2)}`);
        add(plot, "text", { x: (left + right) / 2, y: 312, "text-anchor": "middle", class: "v-axis-label" }, "x, aciertos encestados en la ronda");
        add(plot, "text", { x: left - 8, y: Y(ymax * 0.9) + 5, "text-anchor": "end", class: "v-tick" }, fmt(ymax * 0.9, 2));
        result.textContent = `X ~ B(${n}; ${fmt(p, 2)}) · Rondas simuladas: ${totalRounds} · E(X) = ${fmt(n * p, 2)} · Var(X) = ${fmt(n * p * (1 - p), 3)}`;
      } else {
        // Árbol completo de 8 rutas para n = 3 (estilo Primer) con filtro interactivo por valor de X
        add(plot, "text", { x: 20, y: 24, class: "v-kicker" }, "8 RUTAS EN 3 TIROS · VERDE = ACIERTO (p), ROJO = FALLO (1−p)");
        const yLeaves = [54, 88, 122, 156, 190, 224, 258, 292];
        const xCols = [42, 134, 226, 318];
        const seqTxt = ["AAA", "AAF", "AFA", "AFF", "FAA", "FAF", "FFA", "FFF"];
        const xsOfSeq = [3, 2, 2, 1, 2, 1, 1, 0];
        const hasHit = (a, b) => {
          if (treeFilter === null) return true;
          for (let k = a; k <= b; k++) if (xsOfSeq[k] === treeFilter) return true;
          return false;
        };
        const y0 = 173, y1s = [(yLeaves[0] + yLeaves[3]) / 2, (yLeaves[4] + yLeaves[7]) / 2];
        const y2s = [(yLeaves[0] + yLeaves[1]) / 2, (yLeaves[2] + yLeaves[3]) / 2, (yLeaves[4] + yLeaves[5]) / 2, (yLeaves[6] + yLeaves[7]) / 2];
        const edge = (xA, yA, xB, yB, ok, active) => add(plot, "line", { x1: xA, y1: yA, x2: xB, y2: yB, stroke: ok ? K_PAL.verde : K_PAL.rojo, "stroke-width": active && treeFilter !== null ? 3.5 : (ok ? 2.6 : 2), "stroke-opacity": active ? 1 : 0.14, "stroke-dasharray": ok ? "" : "6 4" });
        edge(xCols[0], y0, xCols[1], y1s[0], true, hasHit(0, 3)); edge(xCols[0], y0, xCols[1], y1s[1], false, hasHit(4, 7));
        edge(xCols[1], y1s[0], xCols[2], y2s[0], true, hasHit(0, 1)); edge(xCols[1], y1s[0], xCols[2], y2s[1], false, hasHit(2, 3));
        edge(xCols[1], y1s[1], xCols[2], y2s[2], true, hasHit(4, 5)); edge(xCols[1], y1s[1], xCols[2], y2s[3], false, hasHit(6, 7));
        for (let i = 0; i < 8; i++) edge(xCols[2], y2s[Math.floor(i / 2)], xCols[3], yLeaves[i], i % 2 === 0, hasHit(i, i));
        add(plot, "circle", { cx: xCols[0], cy: y0, r: 5, fill: K_PAL.tinta });
        seqTxt.forEach((sq, i) => {
          const act = hasHit(i, i);
          add(plot, "circle", { cx: xCols[3], cy: yLeaves[i], r: act && treeFilter !== null ? 5.5 : 4.5, fill: xsOfSeq[i] >= 2 ? K_PAL.azul : K_PAL.ocre, "fill-opacity": act ? 1 : 0.18 });
          add(plot, "text", { x: xCols[3] + 10, y: yLeaves[i] + 5, "font-size": 14, "font-weight": 700, fill: K_PAL.tinta, "fill-opacity": act ? 1 : 0.22 }, `${sq} (X=${xsOfSeq[i]})`);
        });
        [3, 2, 1, 0].forEach((xv, bi) => {
          const yy = 62 + bi * 66, c = combL(3, xv), pr = c * Math.pow(p, xv) * Math.pow(1 - p, 3 - xv);
          const col = [K_PAL.verde, K_PAL.azul, K_PAL.ocre, K_PAL.rojo][bi];
          const actBar = treeFilter === null || treeFilter === xv;
          add(plot, "text", { x: 420, y: yy - 4, "font-size": 16, "font-weight": 700, fill: col, "fill-opacity": actBar ? 1 : 0.28 }, `X = ${xv} (${c} ${c === 1 ? "ruta" : "rutas"})`);
          add(plot, "rect", { x: 420, y: yy + 4, width: Math.max(4, pr * 190).toFixed(1), height: 22, fill: col, "fill-opacity": actBar ? 0.85 : 0.18, stroke: treeFilter === xv ? K_PAL.tinta : "none", "stroke-width": 2 });
          add(plot, "text", { x: 428 + Math.max(4, pr * 190), y: yy + 20, "font-size": 15, "font-weight": 700, fill: K_PAL.tinta, "fill-opacity": actBar ? 1 : 0.28 }, fmt(pr, 3));
        });
        if (treeFilter === null) {
          result.textContent = `Para n = 3 y p = ${fmt(p, 2)}: P(X = 2) = 3 · p²(1 − p) = ${fmt(3 * p * p * (1 - p), 3)} · E(X) = ${fmt(3 * p, 2)}`;
        } else {
          const c = combL(3, treeFilter), each = Math.pow(p, treeFilter) * Math.pow(1 - p, 3 - treeFilter), tot = c * each;
          const rutas = seqTxt.filter((_, i) => xsOfSeq[i] === treeFilter).join(", ");
          result.textContent = `X = ${treeFilter}: ${c} ${c === 1 ? "ruta" : "rutas"} (${rutas}) · cada ruta vale ${fmt(each, 3)} · P(X = ${treeFilter}) = ${c} × ${fmt(each, 3)} = ${fmt(tot, 3)}`;
        }
      }
    }

    bRound.addEventListener("click", runAnimatedRound);
    b25.addEventListener("click", () => runBatch(25));
    b200.addEventListener("click", () => runBatch(200));
    bReset.addEventListener("click", resetCounts);
    nCtl.input.addEventListener("input", resetCounts);
    pCtl.input.addEventListener("input", resetCounts);
    redraw();
  }

  /* ---------- Hipergeométrica sin reemplazo frente a Binomial ---------- */
  function hiperVsBinom(host) {
    let seed = DEFAULT_SEED + 73, drawnObs = null;
    const widget = el("div", "widget widget-hiper");
    const controls = el("div", "widget-controls slider-control");
    const nPopCtl = makeSlider(controls, "Lote N", "12", "60", "2", "20");
    const rCtl = makeSlider(controls, "Éxitos r", "2", "19", "1", "6");
    const nCtl = makeSlider(controls, "Muestra n", "2", "10", "1", "6");
    const drawBtn = controlButton("Extraer muestra", false);
    controls.appendChild(drawBtn);
    const plot = makeSvg("0 0 640 320", "Comparación entre distribución hipergeométrica sin reemplazo y binomial");
    const result = el("p", "widget-result");
    widget.append(controls, plot, result);
    host.appendChild(widget);

    const combL = (n, x) => { if (x < 0 || x > n) return 0; let c = 1; for (let i = 0; i < x; i++) c = c * (n - i) / (i + 1); return c; };
    function sampleOnce() {
      const N = Number(nPopCtl.input.value), r = Math.min(N - 1, Number(rCtl.input.value)), n = Math.min(N, Number(nCtl.input.value));
      seed += 977;
      const rng = seeded(seed);
      const idxs = [...Array(N).keys()];
      for (let i = 0; i < n; i++) {
        const j = i + Math.floor(rng() * (N - i));
        [idxs[i], idxs[j]] = [idxs[j], idxs[i]];
      }
      const chosen = new Set(idxs.slice(0, n));
      let xObs = 0; chosen.forEach((id) => { if (id < r) xObs++; });
      drawnObs = { chosen, xObs };
      redraw();
    }

    function redraw() {
      const N = Number(nPopCtl.input.value);
      rCtl.input.max = String(N - 1);
      nCtl.input.max = String(Math.min(10, N));
      const r = Math.min(N - 1, Number(rCtl.input.value)); rCtl.input.value = String(r);
      const n = Math.min(10, Math.min(N, Number(nCtl.input.value))); nCtl.input.value = String(n);
      nPopCtl.output.textContent = String(N); rCtl.output.textContent = String(r); nCtl.output.textContent = String(n);
      const p = r / N, totalComb = combL(N, n);
      const pH = [], pB = [];
      for (let x = 0; x <= n; x++) {
        pH.push(combL(r, x) * combL(N - r, n - x) / totalComb);
        pB.push(combL(n, x) * Math.pow(p, x) * Math.pow(1 - p, n - x));
      }
      plot.replaceChildren();
      // Urna superior compacta
      add(plot, "text", { x: 24, y: 20, class: "v-kicker" }, `LOTE DE ${N} ELEMENTOS (${r} ÉXITOS EN AZUL)` + (drawnObs ? ` · MUESTRA: ${drawnObs.xObs} ÉXITOS` : ""));
      if (N <= 40) {
        const cols = Math.min(N, 20), dx = (590) / cols;
        for (let i = 0; i < N; i++) {
          const cx = 30 + (i % cols) * dx, cy = 36 + Math.floor(i / cols) * 20;
          const isSucc = i < r, isSel = drawnObs && drawnObs.chosen.has(i);
          add(plot, "circle", { cx: cx.toFixed(1), cy, r: isSel ? 7 : 5.5, fill: isSucc ? K_PAL.azul : "#d9ddd5", stroke: isSel ? K_PAL.rojo : "none", "stroke-width": isSel ? 2.4 : 0 });
        }
      } else {
        add(plot, "rect", { x: 24, y: 32, width: 590 * p, height: 18, fill: K_PAL.azul });
        add(plot, "rect", { x: 24 + 590 * p, y: 32, width: 590 * (1 - p), height: 18, fill: "#d9ddd5" });
      }
      const left = 54, right = 610, top = 84, bottom = 266, maxP = Math.max(...pH, ...pB, 0.25) * 1.1;
      const step = (right - left) / (n + 1), bw = Math.min(22, step * 0.36);
      const xc = (x) => left + step * (x + 0.5), Y = (v) => bottom - v / maxP * (bottom - top);
      baseline(plot, left, right, bottom, top);
      for (let x = 0; x <= n; x++) {
        add(plot, "rect", { x: (xc(x) - bw - 1).toFixed(1), y: Y(pH[x]).toFixed(1), width: bw.toFixed(1), height: (bottom - Y(pH[x])).toFixed(1), fill: K_PAL.azul });
        add(plot, "rect", { x: (xc(x) + 1).toFixed(1), y: Y(pB[x]).toFixed(1), width: bw.toFixed(1), height: (bottom - Y(pB[x])).toFixed(1), fill: K_PAL.ocre, "fill-opacity": 0.65 });
        add(plot, "text", { x: xc(x).toFixed(1), y: bottom + 22, "text-anchor": "middle", class: "v-tick" }, String(x));
      }
      add(plot, "rect", { x: right - 245, y: top - 4, width: 14, height: 12, fill: K_PAL.azul });
      add(plot, "text", { x: right - 225, y: top + 6, "font-size": 14, "font-weight": 700, fill: K_PAL.azul }, "Hipergeométrica");
      add(plot, "rect", { x: right - 105, y: top - 4, width: 14, height: 12, fill: K_PAL.ocre, "fill-opacity": 0.7 });
      add(plot, "text", { x: right - 85, y: top + 6, "font-size": 14, "font-weight": 700, fill: K_PAL.ocre }, "Binomial");
      add(plot, "text", { x: (left + right) / 2, y: 310, "text-anchor": "middle", class: "v-axis-label" }, "x, éxitos en la muestra");
      const varB = n * p * (1 - p), fpc = (N - n) / (N - 1), varH = varB * fpc;
      result.textContent = `E(X) = ${fmt(n * p, 2)} en ambas · Var Hiper = ${fmt(varH, 3)} vs Binom = ${fmt(varB, 3)} (factor (N−n)/(N−1) = ${fmt(fpc, 2)})`;
    }

    [nPopCtl, rCtl, nCtl].forEach((c) => c.input.addEventListener("input", () => { drawnObs = null; redraw(); }));
    drawBtn.addEventListener("click", sampleOnce);
    redraw();
  }

  /* ---------- Poisson como límite de la Binomial cuando n → ∞ y np = λ ---------- */
  function poissonLimite(host) {
    let animId = null;
    const widget = el("div", "widget widget-poisson-lim");
    const controls = el("div", "widget-controls slider-control");
    const lCtl = makeSlider(controls, "Promedio fijo λ = np", "1.0", "8.0", "0.5", "3.0");
    const nCtl = makeSlider(controls, "Ensayos, n", "6", "300", "1", "10");
    const presetsN = [10, 50, 300].map((v) => {
      const b = controlButton(`n = ${v}`, v === 10);
      b.addEventListener("click", () => { stopAnim(); nCtl.input.value = String(v); redraw(); });
      controls.appendChild(b); return { v, b };
    });
    const bAnim = controlButton("Animar n → 300", false);
    controls.appendChild(bAnim);
    const plot = makeSvg("0 0 640 320", "Convergencia de barras binomiales hacia puntos Poisson con lambda constante");
    const result = el("p", "widget-result");
    widget.append(controls, plot, result);
    host.appendChild(widget);

    function stopAnim() { if (animId) { cancelAnimationFrame(animId); animId = null; } }
    function redraw() {
      const lam = Number(lCtl.input.value);
      const minN = Math.ceil(lam / 0.92);
      if (Number(nCtl.input.value) < minN) nCtl.input.value = String(minN);
      const n = Number(nCtl.input.value), p = lam / n;
      lCtl.output.textContent = fmt(lam, 1); nCtl.output.textContent = String(n);
      presetsN.forEach(({ v, b }) => b.classList.toggle("is-active", v === n));

      const xmax = Math.min(18, Math.max(10, Math.round(lam + 4 * Math.sqrt(lam) + 2)));
      const pB = [], pP = [];
      let b0 = Math.pow(1 - p, n), po0 = Math.exp(-lam);
      for (let x = 0; x <= xmax; x++) {
        pB.push(b0); pP.push(po0);
        b0 = b0 * (n - x) / (x + 1) * (p / Math.max(1e-12, 1 - p));
        po0 = po0 * lam / (x + 1);
      }
      let maxDiff = 0;
      for (let x = 0; x <= xmax; x++) maxDiff = Math.max(maxDiff, Math.abs(pB[x] - pP[x]));
      const left = 56, right = 610, top = 28, bottom = 266, maxY = Math.max(...pB, ...pP) * 1.14;
      const step = (right - left) / (xmax + 1), bw = step * 0.62;
      const xc = (x) => left + step * (x + 0.5), Y = (v) => bottom - v / maxY * (bottom - top);
      plot.replaceChildren();
      baseline(plot, left, right, bottom, top);
      for (let x = 0; x <= xmax; x++) {
        add(plot, "rect", { x: (xc(x) - bw / 2).toFixed(1), y: Y(pB[x]).toFixed(1), width: bw.toFixed(1), height: (bottom - Y(pB[x])).toFixed(1), fill: K_PAL.azul, "fill-opacity": 0.42 });
        add(plot, "line", { x1: xc(x).toFixed(1), y1: bottom, x2: xc(x).toFixed(1), y2: Y(pP[x]).toFixed(1), stroke: K_PAL.morado, "stroke-width": 2.4 });
        add(plot, "circle", { cx: xc(x).toFixed(1), cy: Y(pP[x]).toFixed(1), r: 5, fill: K_PAL.morado });
        if (xmax <= 14 || x % 2 === 0) add(plot, "text", { x: xc(x).toFixed(1), y: bottom + 22, "text-anchor": "middle", class: "v-tick" }, String(x));
      }
      add(plot, "rect", { x: right - 245, y: top - 2, width: 14, height: 12, fill: K_PAL.azul, "fill-opacity": 0.55 });
      add(plot, "text", { x: right - 225, y: top + 8, "font-size": 14, "font-weight": 700, fill: K_PAL.azul }, `Binomial(${n}; ${fmt(p, 3)})`);
      add(plot, "circle", { cx: right - 95, cy: top + 4, r: 5, fill: K_PAL.morado });
      add(plot, "text", { x: right - 84, y: top + 8, "font-size": 14, "font-weight": 700, fill: K_PAL.morado }, `Poisson(${fmt(lam, 1)})`);
      add(plot, "text", { x: (left + right) / 2, y: 310, "text-anchor": "middle", class: "v-axis-label" }, "x, eventos");
      result.textContent = `p = λ/n = ${fmt(p, 4)} · Error máximo |P_Bin − P_Pois| = ${fmt(maxDiff, 4)}`;
    }
    bAnim.addEventListener("click", () => {
      stopAnim();
      let cur = Math.max(Number(nCtl.input.value), 6);
      if (cur >= 300) cur = 6;
      const tick = () => {
        cur = Math.min(300, cur + (cur < 40 ? 1 : cur < 120 ? 3 : 6));
        nCtl.input.value = String(cur);
        redraw();
        if (cur < 300) animId = requestAnimationFrame(tick); else animId = null;
      };
      animId = requestAnimationFrame(tick);
    });
    lCtl.input.addEventListener("input", () => { stopAnim(); redraw(); });
    nCtl.input.addEventListener("input", () => { stopAnim(); redraw(); });
    redraw();
  }

  /* ---------- Exponencial y falta de memoria ---------- */
  function exponencialMemoria(host) {
    let conditioned = true;
    const widget = el("div", "widget widget-exponencial");
    const controls = el("div", "widget-controls slider-control");
    const lCtl = makeSlider(controls, "Tasa, λ (h⁻¹)", "0.2", "1.5", "0.1", "0.5");
    const sCtl = makeSlider(controls, "Ya transcurrió, s (h)", "0.5", "5.0", "0.5", "2.0");
    const memBtn = controlButton("Condicionar en T > s", true);
    controls.appendChild(memBtn);
    const plot = makeSvg("0 0 640 320", "Densidad exponencial y renormalización condicional por falta de memoria");
    const result = el("p", "widget-result");
    widget.append(controls, plot, result);
    host.appendChild(widget);

    function redraw() {
      memBtn.classList.toggle("is-active", conditioned);
      const lam = Number(lCtl.input.value), s = Number(sCtl.input.value);
      lCtl.output.textContent = fmt(lam, 1); sCtl.output.textContent = fmt(s, 1);
      const left = 54, right = 610, top = 26, bottom = 266, tmax = 12, ymax = Math.max(0.8, lam * 1.12);
      const X = (t) => left + t / tmax * (right - left), Y = (v) => bottom - v / ymax * (bottom - top);
      const f = (t) => lam * Math.exp(-lam * t);
      plot.replaceChildren();
      // Área bajo f(t) para t > s
      let tail = `M${X(s).toFixed(1)} ${bottom}`;
      for (let i = 0; i <= 80; i++) { const t = s + (tmax - s) * i / 80; tail += `L${X(t).toFixed(1)} ${Y(f(t)).toFixed(1)}`; }
      tail += `L${X(tmax).toFixed(1)} ${bottom}Z`;
      add(plot, "path", { d: tail, fill: K_PAL.gris, "fill-opacity": 0.45 });
      let orig = "";
      for (let i = 0; i <= 120; i++) { const t = tmax * i / 120; orig += `${i ? "L" : "M"}${X(t).toFixed(1)} ${Y(f(t)).toFixed(1)}`; }
      add(plot, "path", { d: orig, fill: "none", stroke: K_PAL.verde, "stroke-width": 3 });
      if (conditioned) {
        let condCurve = "", condFill = `M${X(s).toFixed(1)} ${bottom}`;
        for (let i = 0; i <= 80; i++) {
          const t = s + (tmax - s) * i / 80, val = lam * Math.exp(-lam * (t - s));
          condCurve += `${i ? "L" : "M"}${X(t).toFixed(1)} ${Y(val).toFixed(1)}`;
          condFill += `L${X(t).toFixed(1)} ${Y(val).toFixed(1)}`;
        }
        condFill += `L${X(tmax).toFixed(1)} ${bottom}Z`;
        add(plot, "path", { d: condFill, fill: K_PAL.azul, "fill-opacity": 0.22 });
        add(plot, "path", { d: condCurve, fill: "none", stroke: K_PAL.azul, "stroke-width": 3, "stroke-dasharray": "9 5" });
        add(plot, "text", { x: X(s + 1.6).toFixed(1), y: Y(lam * 0.72).toFixed(1), "font-size": 15, "font-weight": 700, fill: K_PAL.azul }, "f(t | T > s) = λe^{−λ(t−s)} (idéntica desde s)");
      }
      add(plot, "line", { x1: X(s).toFixed(1), y1: top, x2: X(s).toFixed(1), y2: bottom, stroke: K_PAL.ocre, "stroke-width": 2.5, "stroke-dasharray": "6 4" });
      add(plot, "text", { x: X(s) + 6, y: top + 12, "font-size": 15, "font-weight": 700, fill: K_PAL.ocre }, `s = ${fmt(s, 1)} h`);
      baseline(plot, left, right, bottom, top);
      [0, 2, 4, 6, 8, 10, 12].forEach((tk) => add(plot, "text", { x: X(tk).toFixed(1), y: bottom + 22, "text-anchor": "middle", class: "v-tick" }, String(tk)));
      add(plot, "text", { x: (left + right) / 2, y: 310, "text-anchor": "middle", class: "v-axis-label" }, "t, tiempo de espera (horas)");
      const ps = Math.exp(-lam * s), pMore1 = Math.exp(-lam * 1);
      result.textContent = `E(T) = 1/λ = ${fmt(1 / lam, 2)} h · P(T > ${fmt(s, 1)}) = ${fmt(ps, 3)} · P(T > ${fmt(s + 1, 1)} | T > ${fmt(s, 1)}) = P(T > 1) = ${fmt(pMore1, 3)}`;
    }
    memBtn.addEventListener("click", () => { conditioned = !conditioned; redraw(); });
    lCtl.input.addEventListener("input", redraw); sCtl.input.addEventListener("input", redraw);
    redraw();
  }

  /* ---------- Significado geométrico de la Normal: μ, σ y P(X = a) = 0 ---------- */
  function normalSignificado(host) {
    let bandK = 1, delta = null, animId = null;
    const widget = el("div", "widget widget-normal-sig");
    const row1 = el("div", "widget-controls");
    const kBtns = [1, 2, 3].map((k) => {
      const b = controlButton(`±${k}σ`, k === 1);
      b.addEventListener("click", () => { stopAnim(); delta = null; bandK = k; redraw(); });
      row1.appendChild(b); return { k, b };
    });
    const ptBtn = controlButton("¿Por qué P(X = μ) = 0?", false);
    row1.appendChild(ptBtn);
    const controls = el("div", "widget-controls slider-control");
    const muCtl = makeSlider(controls, "Media, μ", "-3.0", "3.0", "0.25", "0.0");
    const sgCtl = makeSlider(controls, "Desviación, σ", "0.5", "2.4", "0.1", "1.0");
    const plot = makeSvg("0 0 640 320", "Campana normal con ejes fijos mostrando efecto de mu, sigma y colapso de ancho");
    const result = el("p", "widget-result");
    widget.append(row1, controls, plot, result);
    host.appendChild(widget);

    function stopAnim() { if (animId) { cancelAnimationFrame(animId); animId = null; } }
    ptBtn.addEventListener("click", () => {
      stopAnim(); bandK = 0; delta = 1.4;
      const tick = () => {
        delta *= 0.91;
        redraw();
        if (delta > 0.015) animId = requestAnimationFrame(tick);
        else { delta = 0.01; redraw(); animId = null; }
      };
      animId = requestAnimationFrame(tick);
    });

    function redraw() {
      const mu = Number(muCtl.input.value), sg = Number(sgCtl.input.value);
      muCtl.output.textContent = fmtSigned(mu, 2); sgCtl.output.textContent = fmt(sg, 1);
      kBtns.forEach(({ k, b }) => b.classList.toggle("is-active", delta === null && bandK === k));
      ptBtn.classList.toggle("is-active", delta !== null);

      const left = 48, right = 608, top = 24, bottom = 266, xmin = -6, xmax = 6, ymax = 0.86;
      const X = (x) => left + (x - xmin) / (xmax - xmin) * (right - left);
      const f = (x) => Math.exp(-0.5 * Math.pow((x - mu) / sg, 2)) / (sg * Math.sqrt(2 * Math.PI));
      const Y = (v) => bottom - v / ymax * (bottom - top);
      plot.replaceChildren();
      // Curva estándar fantasma para comparar traslación y escala
      let refD = "";
      for (let i = 0; i <= 120; i++) {
        const x = xmin + (xmax - xmin) * i / 120, fv = Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
        refD += `${i ? "L" : "M"}${X(x).toFixed(1)} ${Y(fv).toFixed(1)}`;
      }
      add(plot, "path", { d: refD, fill: "none", stroke: "#d4d8d0", "stroke-width": 2, "stroke-dasharray": "5 4" });
      add(plot, "text", { x: X(-4.8), y: top + 14, "font-size": 14, fill: K_PAL.medio }, "Referencia punteada: N(0, 1)");

      const a = delta !== null ? mu - delta : mu - bandK * sg;
      const b = delta !== null ? mu + delta : mu + bandK * sg;
      let area = `M${X(Math.max(xmin, a)).toFixed(1)} ${bottom}`;
      for (let i = 0; i <= 80; i++) {
        const x = Math.max(xmin, a) + (Math.min(xmax, b) - Math.max(xmin, a)) * i / 80;
        area += `L${X(x).toFixed(1)} ${Y(f(x)).toFixed(1)}`;
      }
      area += `L${X(Math.min(xmax, b)).toFixed(1)} ${bottom}Z`;
      add(plot, "path", { d: area, fill: delta !== null ? K_PAL.ocre : K_PAL.verde, "fill-opacity": 0.28 });

      let curve = "";
      for (let i = 0; i <= 140; i++) { const x = xmin + (xmax - xmin) * i / 140; curve += `${i ? "L" : "M"}${X(x).toFixed(1)} ${Y(f(x)).toFixed(1)}`; }
      add(plot, "path", { d: curve, fill: "none", stroke: K_PAL.azul, "stroke-width": 3.5 });
      add(plot, "line", { x1: X(mu).toFixed(1), y1: Y(f(mu)).toFixed(1), x2: X(mu).toFixed(1), y2: bottom, class: "v-mean-line" });
      baseline(plot, left, right, bottom, top);
      [-6, -4, -2, 0, 2, 4, 6].forEach((tk) => add(plot, "text", { x: X(tk).toFixed(1), y: bottom + 22, "text-anchor": "middle", class: "v-tick" }, fmtSigned(tk, 0)));
      add(plot, "text", { x: (left + right) / 2, y: 310, "text-anchor": "middle", class: "v-axis-label" }, "ejes fijos x ∈ [−6, 6] · área total bajo la curva = 1");
      const prob = phi((b - mu) / sg) - phi((a - mu) / sg);
      if (delta !== null) {
        result.textContent = `Intervalo [μ − ${fmt(delta, 2)}; μ + ${fmt(delta, 2)}] · Altura f(μ) = ${fmt(f(mu), 3)} > 0, pero área = ${fmt(prob, 4)} → 0`;
      } else {
        result.textContent = `N(${fmtSigned(mu, 2)}; ${fmt(sg * sg, 2)}) · Banda μ ± ${bandK}σ: [${fmtSigned(a, 2)}; ${fmtSigned(b, 2)}] · Área = ${fmt(prob * 100, 1)} %`;
      }
    }
    muCtl.input.addEventListener("input", () => { stopAnim(); delta = null; if (!bandK) bandK = 1; redraw(); });
    sgCtl.input.addEventListener("input", () => { stopAnim(); delta = null; if (!bandK) bandK = 1; redraw(); });
    redraw();
  }

  /* ---------- Tabla Z acumulada interactiva bidireccional ---------- */
  function tablaZ(host) {
    const ranges = [
      { label: "−3,0 a −1,6", rows: [...Array(15)].map((_, i) => -30 + i), neg: true },
      { label: "−1,5 a −0,0", rows: [...Array(16)].map((_, i) => -15 + i), neg: true },
      { label: "+0,0 a +1,5", rows: [...Array(16)].map((_, i) => i), neg: false },
      { label: "+1,6 a +3,0", rows: [...Array(15)].map((_, i) => 16 + i), neg: false }
    ];
    let zVal = -1.27, zNeg = true, mode = "directo", queryType = "izq", targetP = 0.15, rangeIdx = 1;
    const wrap = el("div", "widget tz-wrap");
    const top = el("div", "widget-controls");
    const rBtns = ranges.map((rg, idx) => {
      const b = controlButton(rg.label, idx === rangeIdx);
      b.addEventListener("click", () => { rangeIdx = idx; redraw(); });
      top.appendChild(b); return b;
    });
    const modeBtn = controlButton("Inverso (área p → z)", false);
    top.appendChild(modeBtn);
    const invPresets = [0.15, 0.95, 0.975, 0.995].map((pv) => {
      const b = controlButton(`p=${fmt(pv, pv === 0.15 || pv === 0.95 ? 2 : 3)}`, false);
      b.addEventListener("click", () => {
        mode = "inverso"; queryType = "izq"; targetP = pv; pCtl.input.value = String(pv);
        const zp = Math.round(invPhi(pv) * 100) / 100;
        setZ(zp, zp < 0);
      });
      top.appendChild(b); return b;
    });

    const grid = el("div", "tz-grid");
    const leftCol = el("div", "tz-left");
    const qRow = el("div", "widget-controls");
    const qTypes = [["izq", "P(Z ≤ z)"], ["der", "P(Z > z)"], ["centro", "P(−|z| ≤ Z ≤ |z|)"]];
    const qTypeBtns = qTypes.map(([key, lab]) => {
      const b = controlButton(lab, key === queryType);
      b.addEventListener("click", () => { queryType = key; mode = "directo"; redraw(); });
      qRow.appendChild(b); return b;
    });
    const sliders = el("div", "widget-controls slider-control");
    const zCtl = makeSlider(sliders, "Valor z", "-3.09", "3.09", "0.01", "-1.27");
    const pCtl = makeSlider(sliders, "Área p = Φ(z)", "0.002", "0.998", "0.001", "0.15");
    pCtl.label.style.display = "none";
    const plot = makeSvg("0 0 460 225", "Normal estándar Z con área acumulada y tabla Z interactiva");
    const readout = el("div", "tz-readout");
    leftCol.append(qRow, sliders, plot, readout);

    const rightCol = el("div", "tz-right");
    const table = el("table", "tz-table");
    rightCol.appendChild(table);
    grid.append(leftCol, rightCol);
    wrap.append(top, grid);
    host.appendChild(wrap);

    function rangeForZ(cents, neg) {
      const t = neg ? -Math.floor(Math.abs(cents) / 10) : Math.floor(Math.abs(cents) / 10);
      if (neg) return t <= -16 ? 0 : 1;
      return t <= 15 ? 2 : 3;
    }
    function setZ(val, negHint) {
      zVal = Math.max(-3.09, Math.min(3.09, Math.round(val * 100) / 100));
      zNeg = zVal === 0 ? Boolean(negHint) : zVal < 0;
      zCtl.input.value = String(zVal);
      rangeIdx = rangeForZ(Math.round(zVal * 100), zNeg);
      redraw();
    }

    function rowLabel(t, neg) {
      if (t === 0) return neg ? "−0,0" : "+0,0";
      return (t < 0 ? "−" : "+") + (Math.abs(t) / 10).toFixed(1).replace(".", ",");
    }

    function redraw() {
      modeBtn.classList.toggle("is-active", mode === "inverso");
      modeBtn.textContent = mode === "inverso" ? "Inverso (activo)" : "Inverso (área p → z)";
      qTypeBtns.forEach((b, i) => b.classList.toggle("is-active", qTypes[i][0] === queryType && mode !== "inverso"));
      rBtns.forEach((b, i) => b.classList.toggle("is-active", i === rangeIdx));
      zCtl.label.style.display = mode === "directo" ? "flex" : "none";
      pCtl.label.style.display = mode === "inverso" ? "flex" : "none";
      zCtl.output.textContent = (zVal === 0 ? (zNeg ? "−0,00" : "+0,00") : fmtSigned(zVal, 2));
      pCtl.output.textContent = fmt(targetP, 3);

      const cents = Math.round(zVal * 100), absC = Math.abs(cents);
      const hitRow = zNeg ? -Math.floor(absC / 10) : Math.floor(absC / 10);
      const hitCol = absC % 10;
      const areaVal = phi(zVal), absZ = Math.abs(zVal), centerArea = 2 * phi(absZ) - 1;

      // Curva izquierda Z según consulta activa
      plot.replaceChildren();
      const left = 26, right = 434, topY = 26, bottom = 186, lo = -3.5, hi = 3.5, ymax = 0.43;
      const X = (v) => left + (v - lo) / (hi - lo) * (right - left);
      const Y = (v) => bottom - v / ymax * (bottom - topY);
      const f = (v) => Math.exp(-0.5 * v * v) / Math.sqrt(2 * Math.PI);
      const shadeBand = (from, to, fill, opacity) => {
        const ca = Math.max(lo, from), cb = Math.min(hi, to);
        if (cb <= ca) return;
        let d = `M${X(ca).toFixed(1)} ${bottom}`;
        for (let i = 0; i <= 70; i++) { const zv = ca + (cb - ca) * i / 70; d += `L${X(zv).toFixed(1)} ${Y(f(zv)).toFixed(1)}`; }
        d += `L${X(cb).toFixed(1)} ${bottom}Z`;
        add(plot, "path", { d, fill, "fill-opacity": opacity });
      };
      const cz = Math.max(lo, Math.min(hi, zVal));
      if (queryType === "der") {
        shadeBand(lo, cz, K_PAL.gris, 0.25);
        shadeBand(cz, hi, K_PAL.verde, 0.30);
      } else if (queryType === "centro") {
        shadeBand(-Math.min(hi, absZ), Math.min(hi, absZ), K_PAL.verde, 0.30);
      } else {
        shadeBand(lo, cz, K_PAL.verde, 0.28);
      }
      let curve = "";
      for (let i = 0; i <= 110; i++) { const zv = lo + (hi - lo) * i / 110; curve += `${i ? "L" : "M"}${X(zv).toFixed(1)} ${Y(f(zv)).toFixed(1)}`; }
      add(plot, "path", { d: curve, fill: "none", stroke: K_PAL.tinta, "stroke-width": 2.5 });
      add(plot, "line", { x1: left, y1: bottom, x2: right, y2: bottom, class: "v-axis" });
      if (queryType === "centro") {
        const nz = Math.max(lo, -absZ), pz = Math.min(hi, absZ);
        add(plot, "line", { x1: X(nz).toFixed(1), y1: topY - 4, x2: X(nz).toFixed(1), y2: bottom, stroke: K_PAL.azul, "stroke-width": 2.4 });
        add(plot, "line", { x1: X(pz).toFixed(1), y1: topY - 4, x2: X(pz).toFixed(1), y2: bottom, stroke: K_PAL.azul, "stroke-width": 2.4 });
        add(plot, "text", { x: (X(nz) + X(pz)) / 2, y: 16, "text-anchor": "middle", "font-size": 14, "font-weight": 700, fill: K_PAL.azul }, `−${fmt(absZ, 2)} ≤ Z ≤ +${fmt(absZ, 2)}`);
      } else {
        add(plot, "line", { x1: X(cz).toFixed(1), y1: topY - 4, x2: X(cz).toFixed(1), y2: bottom, stroke: K_PAL.azul, "stroke-width": 2.5 });
        add(plot, "text", { x: Math.max(left + 38, Math.min(right - 45, X(cz))), y: 16, "text-anchor": "middle", "font-size": 14, "font-weight": 700, fill: K_PAL.azul }, `z = ${fmtSigned(zVal, 2)}`);
      }
      [-3, -2, -1, 0, 1, 2, 3].forEach((tk) => add(plot, "text", { x: X(tk).toFixed(1), y: bottom + 19, "text-anchor": "middle", class: "v-tick" }, fmtSigned(tk, 0)));

      const zStr = zVal === 0 ? (zNeg ? "−0,00" : "+0,00") : fmtSigned(zVal, 2);
      if (queryType === "der") {
        readout.innerHTML =
          `<div>Tabla <strong style="color:${K_PAL.azul}">Φ(${zStr}) = ${fmt(areaVal, 4)}</strong> (fila ${rowLabel(hitRow, zNeg)}, col. ,0${hitCol})</div>` +
          `<div>Cola derecha: <strong style="color:${K_PAL.verde}">P(Z &gt; ${zStr}) = 1 − ${fmt(areaVal, 4)} = ${fmt(1 - areaVal, 4)}</strong></div>`;
      } else if (queryType === "centro") {
        readout.innerHTML =
          `<div>Simetría: Φ(+${fmt(absZ, 2)}) − Φ(−${fmt(absZ, 2)}) = ${fmt(phi(absZ), 4)} − ${fmt(phi(-absZ), 4)}</div>` +
          `<div>Banda central: <strong style="color:${K_PAL.verde}">P(−${fmt(absZ, 2)} ≤ Z ≤ +${fmt(absZ, 2)}) = ${fmt(centerArea, 4)}</strong></div>`;
      } else {
        readout.innerHTML =
          `<div>Fila <strong style="color:${K_PAL.azul}">${rowLabel(hitRow, zNeg)}</strong> · Columna <strong style="color:${K_PAL.ocre}">,0${hitCol}</strong> → <strong style="color:${K_PAL.verde}">Φ(${zStr}) = ${fmt(areaVal, 4)}</strong></div>` +
          `<div>Cola der.: P(Z &gt; z) = <strong>${fmt(1 - areaVal, 4)}</strong> · Centro: P(−|z| ≤ Z ≤ |z|) = <strong>${fmt(centerArea, 4)}</strong></div>`;
      }

      // Matriz tabular derecha
      table.replaceChildren();
      const rg = ranges[rangeIdx];
      const thead = document.createElement("thead"), htr = document.createElement("tr");
      const corner = document.createElement("th"); corner.className = "tz-corner"; corner.textContent = "z";
      htr.appendChild(corner);
      for (let c = 0; c < 10; c++) {
        const th = document.createElement("th");
        th.textContent = `,0${c}`;
        if (c === hitCol && rg.neg === zNeg && rg.rows.includes(hitRow)) th.className = "is-col";
        htr.appendChild(th);
      }
      thead.appendChild(htr);
      const tbody = document.createElement("tbody");
      rg.rows.forEach((rt) => {
        const tr = document.createElement("tr");
        const rowHit = rg.neg === zNeg && rt === hitRow;
        const rth = document.createElement("th");
        rth.className = "tz-rhead" + (rowHit ? " is-row" : "");
        rth.textContent = rowLabel(rt, rg.neg);
        tr.appendChild(rth);
        for (let c = 0; c < 10; c++) {
          const td = document.createElement("td");
          const colHit = c === hitCol && rg.neg === zNeg && rg.rows.includes(hitRow);
          const cellHit = rowHit && c === hitCol;
          if (cellHit) td.className = "is-hit";
          else if (rowHit) td.className = "is-row";
          else if (colHit) td.className = "is-col";
          const cellZ = rg.neg ? -(Math.abs(rt) / 10 + c / 100) : (rt / 10 + c / 100);
          const btn = document.createElement("button");
          btn.type = "button";
          btn.className = "widget-button tz-cell" + (cellHit ? " is-hit" : "");
          btn.textContent = fmt(phi(cellZ), 4);
          btn.addEventListener("click", () => { mode = "directo"; setZ(cellZ, rg.neg); });
          td.appendChild(btn);
          tr.appendChild(td);
        }
        tbody.appendChild(tr);
      });
      table.append(thead, tbody);
    }

    modeBtn.addEventListener("click", () => {
      mode = mode === "directo" ? "inverso" : "directo";
      if (mode === "inverso") {
        targetP = Math.round(phi(zVal) * 1000) / 1000;
        pCtl.input.value = String(Math.max(0.002, Math.min(0.998, targetP)));
      }
      redraw();
    });
    zCtl.input.addEventListener("input", () => { mode = "directo"; const v = Number(zCtl.input.value); setZ(v, v < 0); });
    pCtl.input.addEventListener("input", () => {
      mode = "inverso";
      targetP = Number(pCtl.input.value);
      const zp = Math.round(invPhi(targetP) * 100) / 100;
      setZ(zp, zp < 0);
    });
    redraw();
  }

  /* ---------- Aproximación normal a la binomial con corrección de continuidad ±0,5 ---------- */
  function normalAproxBinom(host) {
    let useCC = true;
    const widget = el("div", "widget widget-normal-binom");
    const controls = el("div", "widget-controls slider-control");
    const nCtl = makeSlider(controls, "Ensayos, n", "10", "50", "1", "20");
    const pCtl = makeSlider(controls, "Probabilidad, p", "0.15", "0.85", "0.05", "0.40");
    const xCtl = makeSlider(controls, "Corte P(X ≥ x)", "1", "19", "1", "10");
    const ccBtn = controlButton("Corrección −0,5 (activa)", true);
    controls.appendChild(ccBtn);
    const plot = makeSvg("0 0 640 320", "Aproximación normal a la binomial resaltando la corrección de continuidad");
    const result = el("p", "widget-result");
    widget.append(controls, plot, result);
    host.appendChild(widget);

    const combL = (n, x) => { let c = 1; for (let i = 0; i < x; i++) c = c * (n - i) / (i + 1); return c; };
    function redraw() {
      ccBtn.classList.toggle("is-active", useCC);
      ccBtn.textContent = useCC ? "Corrección −0,5 (activa)" : "Sin corrección";
      const n = Number(nCtl.input.value), p = Number(pCtl.input.value);
      xCtl.input.max = String(n - 1);
      const xCut = Math.min(n - 1, Math.max(1, Number(xCtl.input.value)));
      xCtl.input.value = String(xCut);
      nCtl.output.textContent = String(n); pCtl.output.textContent = fmt(p, 2); xCtl.output.textContent = String(xCut);

      const mu = n * p, sd = Math.sqrt(n * p * (1 - p));
      const xmin = Math.max(-0.5, Math.floor(mu - 3.6 * sd)), xmax = Math.min(n + 0.5, Math.ceil(mu + 3.6 * sd));
      const probs = [];
      let exactGe = 0;
      for (let k = 0; k <= n; k++) {
        const pv = combL(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k);
        probs.push(pv);
        if (k >= xCut) exactGe += pv;
      }
      const normPeak = 1 / (sd * Math.sqrt(2 * Math.PI));
      const maxY = Math.max(...probs, normPeak) * 1.12;
      const left = 52, right = 610, top = 26, bottom = 266;
      const X = (v) => left + (v - xmin) / (xmax - xmin) * (right - left), Y = (v) => bottom - v / maxY * (bottom - top);
      const fNorm = (v) => Math.exp(-0.5 * Math.pow((v - mu) / sd, 2)) / (sd * Math.sqrt(2 * Math.PI));

      plot.replaceChildren();
      const bound = useCC ? xCut - 0.5 : xCut;
      const ca = Math.max(xmin, Math.min(xmax, bound));
      if (ca < xmax) {
        let area = `M${X(ca).toFixed(1)} ${bottom}`;
        for (let i = 0; i <= 70; i++) { const v = ca + (xmax - ca) * i / 70; area += `L${X(v).toFixed(1)} ${Y(fNorm(v)).toFixed(1)}`; }
        area += `L${X(xmax).toFixed(1)} ${bottom}Z`;
        add(plot, "path", { d: area, fill: K_PAL.azul, "fill-opacity": 0.22 });
      }
      if (useCC && xCut - 0.5 >= xmin && xCut <= xmax) {
        let strip = `M${X(xCut - 0.5).toFixed(1)} ${bottom}`;
        for (let i = 0; i <= 12; i++) { const v = (xCut - 0.5) + 0.5 * i / 12; strip += `L${X(v).toFixed(1)} ${Y(fNorm(v)).toFixed(1)}`; }
        strip += `L${X(xCut).toFixed(1)} ${bottom}Z`;
        add(plot, "path", { d: strip, fill: K_PAL.ocre, "fill-opacity": 0.42 });
      }
      const bwPx = Math.max(4, (right - left) / (xmax - xmin) * 0.88);
      for (let k = Math.max(0, Math.ceil(xmin)); k <= Math.min(n, Math.floor(xmax)); k++) {
        const h = bottom - Y(probs[k]);
        add(plot, "rect", { x: (X(k) - bwPx / 2).toFixed(1), y: Y(probs[k]).toFixed(1), width: bwPx.toFixed(1), height: h.toFixed(1),
          fill: k >= xCut ? K_PAL.azul : "#d2d7ce", "fill-opacity": k >= xCut ? 0.55 : 0.7 });
      }
      let curve = "";
      for (let i = 0; i <= 130; i++) { const v = xmin + (xmax - xmin) * i / 130; curve += `${i ? "L" : "M"}${X(v).toFixed(1)} ${Y(fNorm(v)).toFixed(1)}`; }
      add(plot, "path", { d: curve, fill: "none", stroke: K_PAL.tinta, "stroke-width": 2.8 });
      add(plot, "line", { x1: X(ca).toFixed(1), y1: top, x2: X(ca).toFixed(1), y2: bottom, stroke: useCC ? K_PAL.ocre : K_PAL.rojo, "stroke-width": 2.5, "stroke-dasharray": "7 5" });
      baseline(plot, left, right, bottom, top);
      const stepT = Math.max(1, Math.ceil((xmax - xmin) / 10));
      for (let k = Math.ceil(xmin); k <= Math.floor(xmax); k += stepT) add(plot, "text", { x: X(k).toFixed(1), y: bottom + 22, "text-anchor": "middle", class: "v-tick" }, String(k));
      add(plot, "text", { x: (left + right) / 2, y: 310, "text-anchor": "middle", class: "v-axis-label" }, `x (límite continuo en ${fmt(bound, 1)})`);
      const approx = 1 - phi((bound - mu) / sd);
      result.textContent = `Exacta P(X ≥ ${xCut}) = ${fmt(exactGe, 4)} · Normal = ${fmt(approx, 4)} · Error = ${fmt(Math.abs(exactGe - approx), 4)}`;
    }
    ccBtn.addEventListener("click", () => { useCC = !useCC; redraw(); });
    [nCtl, pCtl, xCtl].forEach((c) => c.input.addEventListener("input", redraw));
    redraw();
  }

  /* ---------- Diagrama de caja interactivo: bigotes, vallas 1,5·RIC y atípico ---------- */
  function repartirEtiquetas(items, minX, maxX, gap) {
    const it = items.map((o) => ({ ...o, cx: o.x })).sort((a, b) => a.x - b.x);
    for (let vuelta = 0; vuelta < 60; vuelta++) {
      let movio = false;
      for (let i = 1; i < it.length; i++) {
        const a = it[i - 1], b = it[i], falta = (a.w + b.w) / 2 + gap - (b.cx - a.cx);
        if (falta > 0.5) { a.cx -= falta / 2; b.cx += falta / 2; movio = true; }
      }
      it.forEach((o) => { o.cx = Math.max(minX + o.w / 2, Math.min(maxX - o.w / 2, o.cx)); });
      if (!movio) break;
    }
    return it;
  }

  function cajaInteractiva(host) {
    const baseData = ((window.Fig && window.Fig.CILINDROS) || CILINDROS).slice();
    const widget = el("div", "widget widget-caja");
    const controls = el("div", "widget-controls slider-control");
    const dCtl = makeSlider(controls, "Mayor dato, x₍₂₀₎ (MPa)", "31.5", "44.0", "0.1", "34.3");
    const pBtns = [
      { label: "Original (34,3)", val: 34.3 },
      { label: "En la valla (36,4)", val: 36.4 },
      { label: "Atípico (41,0)", val: 41.0 }
    ].map((o) => {
      const b = controlButton(o.label, o.val === 34.3);
      b.addEventListener("click", () => { dCtl.input.value = String(o.val); redraw(); });
      controls.appendChild(b); return { ...o, b };
    });
    const plot = makeSvg("0 0 640 320", "Diagrama de caja interactivo con cuartiles Q1, Q2, Q3, bigotes y detección de atípicos");
    const result = el("p", "widget-result");
    widget.append(controls, plot, result);
    host.appendChild(widget);

    function redraw() {
      const x20 = Number(dCtl.input.value); dCtl.output.textContent = fmt(x20, 1);
      pBtns.forEach(({ val, b }) => b.classList.toggle("is-active", Math.abs(x20 - val) < 0.06));
      const arr = baseData.slice(0, 19).concat([x20]).sort((a, b) => a - b), n = arr.length;
      const q = (p) => { const pos = p * (n + 1), i = Math.floor(pos), f = pos - i; if (i < 1) return arr[0]; if (i >= n) return arr[n - 1]; return arr[i - 1] + f * (arr[i] - arr[i - 1]); };
      const q1 = q(0.25), q2 = q(0.5), q3 = q(0.75), ric = q3 - q1, vInf = q1 - 1.5 * ric, vSup = q3 + 1.5 * ric;
      const inliers = arr.filter((v) => v >= vInf && v <= vSup), outliers = arr.filter((v) => v < vInf || v > vSup);
      const wLo = inliers[0], wHi = inliers[inliers.length - 1];

      const left = 40, right = 608, xmin = 20, xmax = 45, y = 112, h = 82;
      const X = (v) => left + (v - xmin) / (xmax - xmin) * (right - left);
      plot.replaceChildren();
      add(plot, "line", { x1: X(wLo).toFixed(1), y1: y + h / 2, x2: X(q1).toFixed(1), y2: y + h / 2, stroke: K_PAL.tinta, "stroke-width": 3 });
      add(plot, "line", { x1: X(q3).toFixed(1), y1: y + h / 2, x2: X(wHi).toFixed(1), y2: y + h / 2, stroke: K_PAL.tinta, "stroke-width": 3 });
      add(plot, "line", { x1: X(wLo).toFixed(1), y1: y + 20, x2: X(wLo).toFixed(1), y2: y + h - 20, stroke: K_PAL.tinta, "stroke-width": 3 });
      add(plot, "line", { x1: X(wHi).toFixed(1), y1: y + 20, x2: X(wHi).toFixed(1), y2: y + h - 20, stroke: K_PAL.tinta, "stroke-width": 3 });
      add(plot, "rect", { x: X(q1).toFixed(1), y, width: (X(q3) - X(q1)).toFixed(1), height: h, fill: K_PAL.azul, "fill-opacity": 0.16, stroke: K_PAL.azul, "stroke-width": 3.5 });
      add(plot, "line", { x1: X(q2).toFixed(1), y1: y, x2: X(q2).toFixed(1), y2: y + h, stroke: K_PAL.rojo, "stroke-width": 4.5 });
      if (vSup <= xmax) {
        add(plot, "line", { x1: X(vSup).toFixed(1), y1: 42, x2: X(vSup).toFixed(1), y2: 248, stroke: K_PAL.ocre, "stroke-width": 2, "stroke-dasharray": "7 5" });
        add(plot, "text", { x: X(vSup).toFixed(1), y: 34, "text-anchor": "middle", "font-size": 15, "font-weight": 700, fill: K_PAL.ocre }, `Valla sup. = ${fmt(vSup, 2)}`);
      }
      outliers.forEach((v) => {
        add(plot, "circle", { cx: X(v).toFixed(1), cy: y + h / 2, r: 8, fill: "#fff", stroke: K_PAL.rojo, "stroke-width": 3 });
        add(plot, "text", { x: X(v).toFixed(1), y: y + h / 2 - 16, "text-anchor": "middle", "font-size": 15, "font-weight": 700, fill: K_PAL.rojo }, `Atípico ${fmt(v, 1)}`);
      });
      repartirEtiquetas([
        { x: X(q1), text: `Q₁ = ${fmt(q1, 1)}`, color: K_PAL.azul },
        { x: X(q2), text: `Q₂ = ${fmt(q2, 1)}`, color: K_PAL.rojo },
        { x: X(q3), text: `Q₃ = ${fmt(q3, 1)}`, color: K_PAL.azul }
      ].map((e) => ({ ...e, w: e.text.length * 10 })), left, right, 12).forEach((e) => {
        if (Math.abs(e.cx - e.x) > 2) add(plot, "path", { d: `M${e.cx.toFixed(1)} ${y - 26}L${e.x.toFixed(1)} ${y - 3}`, stroke: e.color, "stroke-width": 1.5, fill: "none" });
        add(plot, "text", { x: e.cx.toFixed(1), y: y - 32, "text-anchor": "middle", "font-size": 18, "font-weight": 700, fill: e.color }, e.text);
      });
      add(plot, "text", { x: X(wLo).toFixed(1), y: y + h + 30, "text-anchor": "middle", "font-size": 17, "font-weight": 700, fill: K_PAL.tinta }, `bigote ${fmt(wLo, 1)}`);
      add(plot, "text", { x: X(wHi).toFixed(1), y: y + h + 30, "text-anchor": "middle", "font-size": 17, "font-weight": 700, fill: K_PAL.tinta }, `bigote ${fmt(wHi, 1)}`);
      add(plot, "line", { x1: left, y1: 256, x2: right, y2: 256, class: "v-axis" });
      [20, 25, 30, 35, 40, 45].forEach((tk) => add(plot, "text", { x: X(tk).toFixed(1), y: 280, "text-anchor": "middle", class: "v-tick" }, String(tk)));
      add(plot, "text", { x: (left + right) / 2, y: 310, "text-anchor": "middle", class: "v-axis-label" }, "resistencia, MPa");
      result.textContent = `Q₁ = ${fmt(q1, 2)}, Q₂ = ${fmt(q2, 2)}, Q₃ = ${fmt(q3, 2)} · RIC = ${fmt(ric, 2)} · Valla superior = ${fmt(vSup, 2)} MPa` + (outliers.length ? " (atípico detectado)" : "");
    }
    dCtl.input.addEventListener("input", redraw);
    redraw();
  }

  /* ---------- Comparación t de Student frente a normal estándar Z ---------- */
  function tVsZ(host) {
    const M = mathApi();
    const widget = el("div", "widget widget-tvsz");
    const controls = el("div", "widget-controls slider-control");
    const dfCtl = makeSlider(controls, "Grados de libertad, ν = n − 1", "1", "60", "1", "4");
    const presets = [2, 11, 35].map((v) => {
      const b = controlButton(`ν = ${v}`, false);
      b.addEventListener("click", () => { dfCtl.input.value = String(v); redraw(); });
      controls.appendChild(b); return { v, b };
    });
    const plot = makeSvg("0 0 640 320", "Comparación entre las colas de la distribución t de Student y la normal estándar Z");
    const result = el("p", "widget-result");
    widget.append(controls, plot, result);
    host.appendChild(widget);

    function redraw() {
      const nu = Number(dfCtl.input.value); dfCtl.output.textContent = String(nu);
      presets.forEach(({ v, b }) => b.classList.toggle("is-active", v === nu));
      const tpdf = M.tpdf(nu), tC = M.tCrit(0.025, nu), zC = 1.960;
      const left = 44, right = 608, top = 26, bottom = 266, lo = -4.8, hi = 4.8, ymax = 0.43;
      const X = (x) => left + (x - lo) / (hi - lo) * (right - left), Y = (v) => bottom - v / ymax * (bottom - top);
      const zpdf = (x) => Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
      plot.replaceChildren();
      // Colas del 2,5 % bajo t_ν
      const shadeTail = (from, to) => {
        const ca = Math.max(lo, from), cb = Math.min(hi, to);
        if (cb <= ca) return;
        let d = `M${X(ca).toFixed(1)} ${bottom}`;
        for (let i = 0; i <= 40; i++) { const x = ca + (cb - ca) * i / 40; d += `L${X(x).toFixed(1)} ${Y(tpdf(x)).toFixed(1)}`; }
        d += `L${X(cb).toFixed(1)} ${bottom}Z`;
        add(plot, "path", { d, fill: K_PAL.rojo, "fill-opacity": 0.25 });
      };
      shadeTail(lo, -tC); shadeTail(tC, hi);
      let dZ = "", dT = "";
      for (let i = 0; i <= 140; i++) {
        const x = lo + (hi - lo) * i / 140;
        dZ += `${i ? "L" : "M"}${X(x).toFixed(1)} ${Y(zpdf(x)).toFixed(1)}`;
        dT += `${i ? "L" : "M"}${X(x).toFixed(1)} ${Y(tpdf(x)).toFixed(1)}`;
      }
      add(plot, "path", { d: dZ, fill: "none", stroke: K_PAL.medio, "stroke-width": 2.5, "stroke-dasharray": "7 5" });
      add(plot, "path", { d: dT, fill: "none", stroke: K_PAL.morado, "stroke-width": 3.5 });
      add(plot, "line", { x1: X(zC).toFixed(1), y1: 60, x2: X(zC).toFixed(1), y2: bottom, stroke: K_PAL.medio, "stroke-width": 1.8, "stroke-dasharray": "4 4" });
      if (tC <= hi) {
        add(plot, "line", { x1: X(tC).toFixed(1), y1: 38, x2: X(tC).toFixed(1), y2: bottom, stroke: K_PAL.rojo, "stroke-width": 2.4 });
        add(plot, "text", { x: Math.min(right - 10, X(tC) + 5).toFixed(1), y: 52, "font-size": 15, "font-weight": 700, fill: K_PAL.rojo }, `t = ${fmt(tC, 3)}`);
      }
      add(plot, "text", { x: X(zC) - 6, y: 74, "text-anchor": "end", "font-size": 14, fill: K_PAL.medio }, "z = 1,960");
      add(plot, "text", { x: left + 12, y: top + 12, "font-size": 15, "font-weight": 700, fill: K_PAL.morado }, `t con ${nu} g. l. (colas más pesadas)`);
      add(plot, "text", { x: left + 12, y: top + 34, "font-size": 14, fill: K_PAL.medio }, "Punteada: Normal estándar Z");
      baseline(plot, left, right, bottom, top);
      [-4, -3, -2, -1, 0, 1, 2, 3, 4].forEach((tk) => add(plot, "text", { x: X(tk).toFixed(1), y: bottom + 22, "text-anchor": "middle", class: "v-tick" }, fmtSigned(tk, 0)));
      add(plot, "text", { x: (left + right) / 2, y: 310, "text-anchor": "middle", class: "v-axis-label" }, "cuantil estandarizado (95 % central entre −t y +t)");
      const pctWider = (tC / zC - 1) * 100;
      result.textContent = `ν = ${nu} (n = ${nu + 1}) · t₀,₀₂₅ = ${fmt(tC, 3)} frente a z₀,₀₂₅ = 1,960 (+${fmt(pctWider, 1)} % más ancho al 95 %)`;
    }
    dfCtl.input.addEventListener("input", redraw);
    redraw();
  }

  /* ---------- 1. Ensayo Bernoulli B(1, p) y parábola de varianza ---------- */
  function bernoulliEnsayo(host) {
    let seed = DEFAULT_SEED + 201, trials = [];
    const widget = el("div", "widget widget-bernoulli");
    const controls = el("div", "widget-controls slider-control");
    const pCtl = makeSlider(controls, "Probabilidad de éxito, p", "0.05", "0.95", "0.05", "0.30");
    const b1 = controlButton("1 ensayo", false), b20 = controlButton("+20 ensayos", false), bR = controlButton("Reiniciar", false);
    controls.append(b1, b20, bR);
    const plot = makeSvg("0 0 640 310", "Ensayos de Bernoulli, frecuencias y varianza p(1−p)");
    const result = el("p", "widget-result");
    widget.append(controls, plot, result); host.appendChild(widget);

    function sample(k) {
      const p = Number(pCtl.input.value); seed += 137; const rng = seeded(seed);
      for (let i = 0; i < k; i++) trials.push(rng() < p ? 1 : 0);
      redraw();
    }
    function redraw() {
      const p = Number(pCtl.input.value); pCtl.output.textContent = fmt(p, 2);
      plot.replaceChildren();
      add(plot, "text", { x: 24, y: 24, class: "v-kicker" }, `Ensayos recientes (${trials.length} TOTAL) · VERDE = 1 (ÉXITO), ROJO = 0 (FALLO)`);
      const recent = trials.slice(-16);
      for (let i = 0; i < 16; i++) {
        const cx = 38 + i * 36, v = recent[i];
        const col = v === undefined ? K_PAL.gris : (v ? K_PAL.verde : K_PAL.rojo);
        add(plot, "circle", { cx, cy: 52, r: 12, fill: v === 1 ? K_PAL.verde : "#fff", stroke: col, "stroke-width": 2.4 });
        if (v !== undefined) add(plot, "text", { x: cx, y: 57, "text-anchor": "middle", "font-size": 14, "font-weight": 700, fill: v === 1 ? "#fff" : K_PAL.rojo }, String(v));
      }
      // PMF izquierda
      const bl = 52, br = 280, bt = 104, bb = 260, yMax = 1.05;
      const Yp = (v) => bb - v / yMax * (bb - bt);
      baseline(plot, bl, br, bb, bt);
      const ones = trials.filter((v) => v === 1).length, tot = trials.length;
      const emp = tot ? [1 - ones / tot, ones / tot] : [0, 0];
      [0, 1].forEach((k, i) => {
        const xc = bl + 65 + i * 100, theo = k ? p : 1 - p, hT = bb - Yp(theo), hE = bb - Yp(emp[i]);
        if (tot) add(plot, "rect", { x: xc - 16, y: Yp(emp[i]).toFixed(1), width: 32, height: hE.toFixed(1), fill: k ? K_PAL.verde : K_PAL.gris, "fill-opacity": 0.65 });
        add(plot, "rect", { x: xc - 22, y: Yp(theo).toFixed(1), width: 44, height: hT.toFixed(1), fill: tot ? "none" : (k ? K_PAL.azul : K_PAL.gris), "fill-opacity": tot ? 1 : 0.45, stroke: k ? K_PAL.azul : K_PAL.medio, "stroke-width": 2.4 });
        add(plot, "text", { x: xc, y: bb + 20, "text-anchor": "middle", class: "v-tick" }, `X = ${k}`);
        add(plot, "text", { x: xc, y: Yp(theo) - 7, "text-anchor": "middle", "font-size": 15, "font-weight": 700, fill: k ? K_PAL.azul : K_PAL.medio }, fmt(theo, 2));
      });
      add(plot, "text", { x: (bl + br) / 2, y: 298, "text-anchor": "middle", class: "v-axis-label" }, "función de probabilidad p(x)");
      // Parábola Var(X) = p(1-p) derecha
      const vl = 355, vr = 610, vt = 104, vb = 260, vxMax = 0.28;
      const Xp = (pv) => vl + pv * (vr - vl), Yv = (vv) => vb - vv / vxMax * (vb - vt);
      baseline(plot, vl, vr, vb, vt);
      let dVar = "";
      for (let i = 0; i <= 60; i++) { const pv = i / 60; dVar += `${i ? "L" : "M"}${Xp(pv).toFixed(1)} ${Yv(pv * (1 - pv)).toFixed(1)}`; }
      add(plot, "path", { d: dVar, fill: "none", stroke: K_PAL.morado, "stroke-width": 3 });
      const vrCur = p * (1 - p);
      add(plot, "line", { x1: Xp(0.5).toFixed(1), y1: Yv(0.25).toFixed(1), x2: Xp(0.5).toFixed(1), y2: vb, stroke: K_PAL.gris, "stroke-dasharray": "4 4", "stroke-width": 1.5 });
      add(plot, "circle", { cx: Xp(p).toFixed(1), cy: Yv(vrCur).toFixed(1), r: 6.5, fill: K_PAL.verde, stroke: "#fff", "stroke-width": 2 });
      add(plot, "text", { x: Xp(p).toFixed(1), y: Yv(vrCur) - 12, "text-anchor": "middle", "font-size": 15, "font-weight": 700, fill: K_PAL.verde }, fmt(vrCur, 3));
      [0, 0.5, 1].forEach((tk) => add(plot, "text", { x: Xp(tk).toFixed(1), y: vb + 20, "text-anchor": "middle", class: "v-tick" }, fmt(tk, 1)));
      add(plot, "text", { x: (vl + vr) / 2, y: 298, "text-anchor": "middle", class: "v-axis-label" }, "Var(X) = p(1 − p), máxima en p = 0,5");
      result.textContent = `X ~ B(1; ${fmt(p, 2)}) · E(X) = ${fmt(p, 2)} · Var(X) = ${fmt(vrCur, 3)}` + (tot ? ` · Proporción muestral = ${fmt(ones / tot, 2)} (${ones}/${tot})` : "");
    }
    b1.addEventListener("click", () => sample(1));
    b20.addEventListener("click", () => sample(20));
    bR.addEventListener("click", () => { trials = []; redraw(); });
    pCtl.input.addEventListener("input", () => { trials = []; redraw(); });
    redraw();
  }

  /* ---------- 2. Geométrica y binomial negativa: espera hasta el r-ésimo éxito ---------- */
  function geometricaEspera(host) {
    let rTarget = 1, seed = DEFAULT_SEED + 211, simSeq = null;
    const widget = el("div", "widget widget-geometrica");
    const row1 = el("div", "widget-controls");
    const rBtns = [1, 2, 3].map((rv) => {
      const b = controlButton(rv === 1 ? "Geométrica (r = 1)" : `Binomial neg. (r = ${rv})`, rv === rTarget);
      b.addEventListener("click", () => { rTarget = rv; simSeq = null; redraw(); });
      row1.appendChild(b); return { rv, b };
    });
    const bSim = controlButton("Simular espera", false);
    row1.appendChild(bSim);
    const row2 = el("div", "widget-controls slider-control");
    const pCtl = makeSlider(row2, "Probabilidad de acierto, p", "0.10", "0.70", "0.05", "0.25");
    const plot = makeSvg("0 0 640 315", "Distribución del ensayo en que aparece el r-ésimo éxito");
    const result = el("p", "widget-result");
    widget.append(row1, row2, plot, result); host.appendChild(widget);

    const combN = (n, k) => { let c = 1; for (let i = 0; i < k; i++) c = c * (n - i) / (i + 1); return c; };
    function simulate() {
      const p = Number(pCtl.input.value); seed += 431; const rng = seeded(seed);
      const seq = []; let hits = 0;
      while (hits < rTarget && seq.length < 24) { const ok = rng() < p; seq.push(ok); if (ok) hits++; }
      simSeq = seq; redraw();
    }
    function redraw() {
      rBtns.forEach(({ rv, b }) => b.classList.toggle("is-active", rv === rTarget));
      const p = Number(pCtl.input.value); pCtl.output.textContent = fmt(p, 2);
      plot.replaceChildren();
      if (simSeq) {
        add(plot, "text", { x: 40, y: 24, class: "v-kicker" }, `Secuencia simulada: X = ${simSeq.length} INTENTOS HASTA EL ${rTarget}.º ÉXITO`);
        const showN = Math.min(18, simSeq.length);
        for (let i = 0; i < showN; i++) {
          const cx = 44 + i * 31, ok = simSeq[i];
          add(plot, "circle", { cx, cy: 48, r: 9, fill: ok ? K_PAL.verde : "#fff", stroke: ok ? K_PAL.verde : K_PAL.rojo, "stroke-width": 2.2 });
          add(plot, "text", { x: cx, y: 52, "text-anchor": "middle", "font-size": 12, "font-weight": 700, fill: ok ? "#fff" : K_PAL.rojo }, ok ? "A" : "F");
        }
      } else {
        add(plot, "text", { x: 40, y: 24, class: "v-kicker" }, rTarget === 1 ? "Geométrica: fallos seguidos de 1 éxito, sin memoria" : `Binomial negativa: ensayo del éxito n.º ${rTarget}`);
      }
      const xMax = 18, ps = [];
      for (let x = rTarget; x <= xMax; x++) ps.push({ x, pv: combN(x - 1, rTarget - 1) * Math.pow(p, rTarget) * Math.pow(1 - p, x - rTarget) });
      const ymax = Math.max(...ps.map((o) => o.pv), 0.12) * 1.15;
      const left = 56, right = 612, top = 74, bottom = 266;
      const step = (right - left) / xMax, bw = Math.max(12, step * 0.68), xc = (x) => left + (x - 0.5) * step, Y = (v) => bottom - v / ymax * (bottom - top);
      baseline(plot, left, right, bottom, top);
      ps.forEach(({ x, pv }) => {
        const hitSim = simSeq && simSeq.length === x;
        const h = bottom - Y(pv);
        add(plot, "rect", { x: (xc(x) - bw / 2).toFixed(1), y: Y(pv).toFixed(1), width: bw.toFixed(1), height: h.toFixed(1), fill: hitSim ? K_PAL.ocre : K_PAL.azul, "fill-opacity": hitSim ? 0.85 : 0.68 });
        if (x % 2 === 1 || x <= 4) add(plot, "text", { x: xc(x).toFixed(1), y: bottom + 20, "text-anchor": "middle", class: "v-tick" }, String(x));
      });
      const mu = rTarget / p, vr = rTarget * (1 - p) / (p * p);
      if (mu <= xMax) {
        add(plot, "line", { x1: xc(mu).toFixed(1), y1: top, x2: xc(mu).toFixed(1), y2: bottom, class: "v-mean-line" });
        add(plot, "text", { x: Math.min(right - 120, xc(mu) + 6).toFixed(1), y: top + 14, class: "v-marker-label" }, `E(X) = ${fmt(mu, 2)}`);
      }
      add(plot, "text", { x: (left + right) / 2, y: 304, "text-anchor": "middle", class: "v-axis-label" }, `x, ensayo del ${rTarget === 1 ? "primer" : `${rTarget}.º`} éxito`);
      result.textContent = `r = ${rTarget}, p = ${fmt(p, 2)} · E(X) = r/p = ${fmt(mu, 2)} · σ = ${fmt(Math.sqrt(vr), 2)}` + (simSeq ? ` · Simulación: ${simSeq.length} intentos` : "");
    }
    bSim.addEventListener("click", simulate);
    pCtl.input.addEventListener("input", () => { simSeq = null; redraw(); });
    redraw();
  }

  /* ---------- 3. Selector interactivo del modelo discreto ---------- */
  function selectorDiscreto(host) {
    let q1 = null, q2 = null, q3 = null;
    const widget = el("div", "widget widget-seldisc");
    const row = el("div", "widget-controls");
    const q1Ens = controlButton("Ensayos discretos", false);
    const q1Int = controlButton("Intervalo continuo", false);
    const q2Fijo = controlButton("n fijo", false);
    const q2Hasta = controlButton("Hasta éxito r", false);
    const q3Con = controlButton("Con reemplazo", false);
    const q3Sin = controlButton("Sin reemplazo", false);
    const bRst = controlButton("Reiniciar", false);
    row.append(q1Ens, q1Int, q2Fijo, q2Hasta, q3Con, q3Sin, bRst);
    const plot = makeSvg("0 0 640 295", "Árbol de decisión para elegir entre Binomial, Geométrica, Hipergeométrica y Poisson");
    const result = el("p", "widget-result");
    widget.append(row, plot, result); host.appendChild(widget);

    function redraw() {
      q1Ens.classList.toggle("is-active", q1 === "ens"); q1Int.classList.toggle("is-active", q1 === "int");
      q2Fijo.style.display = q1 === "ens" ? "" : "none"; q2Hasta.style.display = q1 === "ens" ? "" : "none";
      q2Fijo.classList.toggle("is-active", q2 === "fijo"); q2Hasta.classList.toggle("is-active", q2 === "hasta");
      q3Con.style.display = q1 === "ens" && q2 === "fijo" ? "" : "none"; q3Sin.style.display = q1 === "ens" && q2 === "fijo" ? "" : "none";
      q3Con.classList.toggle("is-active", q3 === "con"); q3Sin.classList.toggle("is-active", q3 === "sin");

      plot.replaceChildren();
      const chosen = q1 === "int" ? "pois" : q2 === "hasta" ? "geom" : q3 === "con" ? "bin" : q3 === "sin" ? "hip" : null;
      const colEdge = (act) => act ? K_PAL.verde : "#c9cfc7";
      const edge = (x1, y1, x2, y2, act, lab, lx, ly) => {
        add(plot, "line", { x1, y1, x2, y2, stroke: colEdge(act), "stroke-width": act ? 4 : 2 });
        if (lab) add(plot, "text", { x: lx, y: ly, "font-size": 14, "font-weight": 700, fill: act ? K_PAL.verde : K_PAL.medio }, lab);
      };
      // Nodos y ramas
      edge(68, 148, 225, 62, q1 === "int", "intervalo", 116, 90);
      edge(68, 148, 205, 190, q1 === "ens", "ensayos", 110, 188);
      edge(205, 190, 395, 130, q1 === "ens" && q2 === "hasta", "hasta éxito", 262, 146);
      edge(205, 190, 340, 228, q1 === "ens" && q2 === "fijo", "n fijo", 252, 226);
      edge(340, 228, 448, 195, q3 === "con", "con reemp.", 356, 196);
      edge(340, 228, 448, 262, q3 === "sin", "sin reemp.", 356, 262);

      const node = (x, y, txt, act) => {
        add(plot, "circle", { cx: x, cy: y, r: 10, fill: act ? K_PAL.verde : "#fff", stroke: act ? K_PAL.verde : K_PAL.medio, "stroke-width": 2.5 });
        add(plot, "text", { x, y: y - 16, "text-anchor": "middle", "font-size": 14, "font-weight": 700, fill: K_PAL.tinta }, txt);
      };
      node(68, 148, "¿Qué cuenta?", true);
      node(205, 190, "¿n fijo?", q1 === "ens");
      node(340, 228, "¿Reemplazo?", q2 === "fijo");

      const leaf = (x, y, name, sub, id) => {
        const hit = chosen === id;
        add(plot, "rect", { x, y: y - 22, width: 178, height: 44, fill: hit ? "#eaf0e5" : "#fff", stroke: hit ? K_PAL.verde : K_PAL.gris, "stroke-width": hit ? 2.5 : 1.4 });
        add(plot, "text", { x: x + 10, y: y - 2, "font-size": 16, "font-weight": 700, fill: hit ? K_PAL.verde : K_PAL.tinta }, name);
        add(plot, "text", { x: x + 10, y: y + 15, "font-size": 13, fill: K_PAL.medio }, sub);
      };
      leaf(225, 62, "Poisson P(λ)", "tasa λ por ventana", "pois");
      leaf(395, 130, "Geométrica / Pascal", "primer éxito o r-ésimo", "geom");
      leaf(448, 195, "Binomial B(n, p)", "n fijo, independientes", "bin");
      leaf(448, 262, "Hipergeométrica", "lote N sin reemplazo", "hip");

      const desc = {
        pois: "Poisson: P(X = x) = e^(−λ) λˣ / x! · Ej.: grietas por km de pavimento o goles por partido.",
        geom: "Geométrica / Binomial negativa: ¿en qué intento ocurre el éxito? · Ej.: llamadas hasta conectar.",
        bin: "Binomial B(n, p): cuántos éxitos en n ensayos independientes · Ej.: envíos tarde o caras en moneda.",
        hip: "Hipergeométrica H(N, r, n): sin reemplazo en lote finito · Ej.: contratar candidatos con título."
      };
      result.textContent = chosen ? desc[chosen] : "Responda las preguntas arriba para identificar qué modelo aplica.";
    }
    q1Ens.addEventListener("click", () => { q1 = "ens"; q2 = null; q3 = null; redraw(); });
    q1Int.addEventListener("click", () => { q1 = "int"; q2 = null; q3 = null; redraw(); });
    q2Fijo.addEventListener("click", () => { q2 = "fijo"; q3 = null; redraw(); });
    q2Hasta.addEventListener("click", () => { q2 = "hasta"; q3 = null; redraw(); });
    q3Con.addEventListener("click", () => { q3 = "con"; redraw(); });
    q3Sin.addEventListener("click", () => { q3 = "sin"; redraw(); });
    bRst.addEventListener("click", () => { q1 = null; q2 = null; q3 = null; redraw(); });
    redraw();
  }

  /* ---------- 4. Distribución uniforme U(a, b): rectángulo de área constante 1 ---------- */
  function uniformeArea(host) {
    let domainMax = 10;
    const widget = el("div", "widget widget-uniforme");
    const row1 = el("div", "widget-controls");
    const pConf = controlButton("Conferencia [0, 4]", true), pCli = controlButton("Cliente [0, 30]", false);
    row1.append(pConf, pCli);
    const row2 = el("div", "widget-controls slider-control");
    const bCtl = makeSlider(row2, "Límite b", "2", "10", "0.5", "4");
    const cCtl = makeSlider(row2, "Inicio c", "0", "30", "0.5", "3");
    const dCtl = makeSlider(row2, "Fin d", "0", "30", "0.5", "4");
    const plot = makeSvg("0 0 640 310", "Densidad uniforme con área sombreada en el intervalo [c, d]");
    const result = el("p", "widget-result");
    widget.append(row1, row2, plot, result); host.appendChild(widget);

    function setPreset(maxDom, bVal, cVal, dVal, btn) {
      domainMax = maxDom;
      [pConf, pCli].forEach((x) => x.classList.toggle("is-active", x === btn));
      bCtl.input.max = String(maxDom); bCtl.input.min = maxDom === 30 ? "10" : "2"; bCtl.input.step = maxDom === 30 ? "1" : "0.5"; bCtl.input.value = String(bVal);
      cCtl.input.max = String(maxDom); cCtl.input.step = maxDom === 30 ? "1" : "0.5"; cCtl.input.value = String(cVal);
      dCtl.input.max = String(maxDom); dCtl.input.step = maxDom === 30 ? "1" : "0.5"; dCtl.input.value = String(dVal);
      redraw();
    }
    function redraw() {
      const b = Number(bCtl.input.value);
      let c = Math.min(b, Number(cCtl.input.value)), d = Math.min(b, Number(dCtl.input.value));
      if (c > d) { const tmp = c; c = d; d = tmp; }
      cCtl.input.value = String(c); dCtl.input.value = String(d);
      bCtl.output.textContent = fmt(b, 1); cCtl.output.textContent = fmt(c, 1); dCtl.output.textContent = fmt(d, 1);
      const h = 1 / b, yMax = domainMax === 30 ? 0.12 : 0.55;
      const left = 56, right = 608, top = 28, bottom = 258;
      const X = (v) => left + v / domainMax * (right - left), Y = (v) => bottom - Math.min(v, yMax) / yMax * (bottom - top);
      plot.replaceChildren();
      add(plot, "rect", { x: X(c).toFixed(1), y: Y(h).toFixed(1), width: Math.max(0, X(d) - X(c)).toFixed(1), height: (bottom - Y(h)).toFixed(1), fill: K_PAL.verde, "fill-opacity": 0.35 });
      add(plot, "rect", { x: left, y: Y(h).toFixed(1), width: (X(b) - left).toFixed(1), height: (bottom - Y(h)).toFixed(1), fill: "none", stroke: K_PAL.azul, "stroke-width": 3 });
      baseline(plot, left, right, bottom, top);
      add(plot, "text", { x: left - 8, y: Y(h) + 5, "text-anchor": "end", "font-size": 15, "font-weight": 700, fill: K_PAL.azul }, fmt(h, 3));
      const stepT = domainMax === 30 ? 5 : 2;
      for (let tk = 0; tk <= domainMax; tk += stepT) add(plot, "text", { x: X(tk).toFixed(1), y: bottom + 22, "text-anchor": "middle", class: "v-tick" }, String(tk));
      add(plot, "text", { x: (X(c) + X(d)) / 2, y: (Y(h) + bottom) / 2 + 5, "text-anchor": "middle", "font-size": 17, "font-weight": 700, fill: K_PAL.verde }, `P = ${fmt((d - c) / b, 3)}`);
      add(plot, "text", { x: (left + right) / 2, y: 298, "text-anchor": "middle", class: "v-axis-label" }, `x ∈ [0; ${fmt(b, 1)}] · altura f(x) = 1/${fmt(b, 1)} = ${fmt(h, 3)}`);
      result.textContent = `P(${fmt(c, 1)} ≤ X ≤ ${fmt(d, 1)}) = (${fmt(d - c, 1)}) × (1/${fmt(b, 1)}) = ${fmt((d - c) / b, 4)} · μ = ${fmt(b / 2, 2)}`;
    }
    pConf.addEventListener("click", () => setPreset(10, 4, 3, 4, pConf));
    pCli.addEventListener("click", () => setPreset(30, 30, 25, 30, pCli));
    [bCtl, cCtl, dCtl].forEach((c) => c.input.addEventListener("input", redraw));
    setPreset(10, 4, 3, 4, pConf);
  }

  /* ---------- 5. Distribución Gamma: espera hasta α eventos de Poisson ---------- */
  function gammaEspera(host) {
    const M = mathApi();
    const widget = el("div", "widget widget-gamma");
    const row1 = el("div", "widget-controls");
    const bExp = controlButton("Exponencial (α=1, λ=1)", false);
    const b2da = controlButton("2.ª llamada (α=2, λ=5)", true);
    const b5ta = controlButton("5 esperas (α=5, λ=2)", false);
    row1.append(bExp, b2da, b5ta);
    const row2 = el("div", "widget-controls slider-control");
    const aCtl = makeSlider(row2, "Eventos, α", "1", "6", "1", "2");
    const lCtl = makeSlider(row2, "Tasa, λ", "0.5", "5.0", "0.5", "5.0");
    const plot = makeSvg("0 0 640 310", "Densidad gamma como espera hasta α eventos");
    const result = el("p", "widget-result");
    widget.append(row1, row2, plot, result); host.appendChild(widget);

    function apply(av, lv, active) {
      [bExp, b2da, b5ta].forEach((b) => b.classList.toggle("is-active", b === active));
      aCtl.input.value = String(av); lCtl.input.value = String(lv); redraw();
    }
    function redraw() {
      const alpha = Number(aCtl.input.value), lam = Number(lCtl.input.value), beta = 1 / lam;
      aCtl.output.textContent = String(alpha); lCtl.output.textContent = fmt(lam, 1);
      const logNorm = alpha * Math.log(lam) - M.lgamma(alpha);
      const f = (t) => (t <= 0 ? 0 : Math.exp(logNorm + (alpha - 1) * Math.log(t) - lam * t));
      const xMax = Math.max(2.5, Math.ceil((alpha / lam + 4 * Math.sqrt(alpha) / lam) * 2) / 2);
      let ymax = 0; for (let i = 1; i <= 100; i++) ymax = Math.max(ymax, f(xMax * i / 100));
      ymax = Math.max(0.2, ymax * 1.12);
      const left = 52, right = 610, top = 26, bottom = 264;
      const X = (v) => left + v / xMax * (right - left), Y = (v) => bottom - Math.min(v, ymax) / ymax * (bottom - top);
      plot.replaceChildren();
      const cut = 1.0;
      if (cut < xMax) {
        let dA = `M${X(cut).toFixed(1)} ${bottom}`;
        for (let i = 0; i <= 60; i++) { const t = cut + (xMax - cut) * i / 60; dA += `L${X(t).toFixed(1)} ${Y(f(t)).toFixed(1)}`; }
        dA += `L${right} ${bottom}Z`;
        add(plot, "path", { d: dA, fill: K_PAL.ocre, "fill-opacity": 0.30 });
      }
      let curve = "";
      for (let i = 0; i <= 140; i++) { const t = Math.max(1e-4, xMax * i / 140); curve += `${i ? "L" : "M"}${X(t).toFixed(1)} ${Y(f(t)).toFixed(1)}`; }
      add(plot, "path", { d: curve, fill: "none", stroke: K_PAL.azul, "stroke-width": 3.5 });
      baseline(plot, left, right, bottom, top);
      const mu = alpha * beta;
      add(plot, "line", { x1: X(mu).toFixed(1), y1: top, x2: X(mu).toFixed(1), y2: bottom, class: "v-mean-line" });
      add(plot, "text", { x: Math.min(right - 120, X(mu) + 6).toFixed(1), y: top + 14, class: "v-marker-label" }, `E(T) = ${fmt(mu, 2)}`);
      if (cut < xMax) add(plot, "text", { x: X(cut), y: bottom + 22, "text-anchor": "middle", "font-size": 15, "font-weight": 700, fill: K_PAL.ocre }, "1");
      add(plot, "text", { x: right - 4, y: bottom + 22, "text-anchor": "end", class: "v-tick" }, fmt(xMax, 1));
      add(plot, "text", { x: (left + right) / 2, y: 298, "text-anchor": "middle", class: "v-axis-label" }, "t, tiempo de espera hasta el evento α-ésimo");
      const pGt1 = cut < xMax ? M.simpson(f, cut, xMax + 8 / lam, 500) : 0;
      result.textContent = `α = ${alpha}, β = 1/λ = ${fmt(beta, 2)} · E(T) = ${fmt(mu, 2)} · σ = ${fmt(Math.sqrt(alpha) * beta, 2)} · P(T > 1) = ${fmt(Math.max(0, Math.min(1, pGt1)), 3)}`;
    }
    bExp.addEventListener("click", () => apply(1, 1.0, bExp));
    b2da.addEventListener("click", () => apply(2, 5.0, b2da));
    b5ta.addEventListener("click", () => apply(5, 2.0, b5ta));
    [aCtl, lCtl].forEach((c) => c.input.addEventListener("input", () => { [bExp, b2da, b5ta].forEach((b) => b.classList.remove("is-active")); redraw(); }));
    redraw();
  }

  /* ---------- 6. Combinación lineal de normales: M = R − C vs S = R + C ---------- */
  function sumaNormales(host) {
    let op = "diff";
    const muR = 50, muC = 37;
    const widget = el("div", "widget widget-sumanorm");
    const row1 = el("div", "widget-controls");
    const bDiff = controlButton("Margen M = R − C", true), bSum = controlButton("Suma S = R + C", false);
    row1.append(bDiff, bSum);
    const row2 = el("div", "widget-controls slider-control");
    const srCtl = makeSlider(row2, "Desv. R, σ_R", "1.0", "8.0", "0.5", "4.0");
    const scCtl = makeSlider(row2, "Desv. C, σ_C", "1.0", "8.0", "0.5", "3.0");
    const plot = makeSvg("0 0 640 315", "Combinación lineal de variables normales independientes");
    const result = el("p", "widget-result");
    widget.append(row1, row2, plot, result); host.appendChild(widget);

    const gpdf = (x, m, s) => Math.exp(-0.5 * Math.pow((x - m) / s, 2)) / (s * Math.sqrt(2 * Math.PI));
    function redraw() {
      bDiff.classList.toggle("is-active", op === "diff"); bSum.classList.toggle("is-active", op === "sum");
      const sR = Number(srCtl.input.value), sC = Number(scCtl.input.value);
      srCtl.output.textContent = fmt(sR, 1); scCtl.output.textContent = fmt(sC, 1);
      const sTot = Math.sqrt(sR * sR + sC * sC), muTot = op === "diff" ? muR - muC : muR + muC;
      plot.replaceChildren();

      // Panel superior: R y C originales
      const left = 46, right = 608, t1 = 22, b1 = 122, lo1 = 20, hi1 = 68;
      const X1 = (v) => left + (v - lo1) / (hi1 - lo1) * (right - left);
      const yMax1 = Math.max(gpdf(muC, muC, sC), gpdf(muR, muR, sR), 0.12) * 1.1;
      const Y1 = (v) => b1 - v / yMax1 * (b1 - t1);
      let dC = "", dR = "";
      for (let i = 0; i <= 110; i++) {
        const x = lo1 + (hi1 - lo1) * i / 110;
        dC += `${i ? "L" : "M"}${X1(x).toFixed(1)} ${Y1(gpdf(x, muC, sC)).toFixed(1)}`;
        dR += `${i ? "L" : "M"}${X1(x).toFixed(1)} ${Y1(gpdf(x, muR, sR)).toFixed(1)}`;
      }
      add(plot, "path", { d: dC, fill: "none", stroke: K_PAL.ocre, "stroke-width": 2.8 });
      add(plot, "path", { d: dR, fill: "none", stroke: K_PAL.azul, "stroke-width": 2.8 });
      add(plot, "line", { x1: left, y1: b1, x2: right, y2: b1, class: "v-axis" });
      add(plot, "text", { x: X1(muC), y: t1 + 10, "text-anchor": "middle", "font-size": 15, "font-weight": 700, fill: K_PAL.ocre }, "Carga C (μ=37)");
      add(plot, "text", { x: X1(muR), y: t1 + 10, "text-anchor": "middle", "font-size": 15, "font-weight": 700, fill: K_PAL.azul }, "Resistencia R (μ=50)");

      // Panel inferior: M o S resultante
      const t2 = 158, b2 = 256, lo2 = op === "diff" ? -12 : 60, hi2 = op === "diff" ? 38 : 114;
      const X2 = (v) => left + (v - lo2) / (hi2 - lo2) * (right - left);
      const yMax2 = gpdf(muTot, muTot, sTot) * 1.15;
      const Y2 = (v) => b2 - v / yMax2 * (b2 - t2);
      if (op === "diff") {
        let dFail = `M${X2(lo2).toFixed(1)} ${b2}`;
        for (let i = 0; i <= 50; i++) { const x = lo2 + (0 - lo2) * i / 50; dFail += `L${X2(x).toFixed(1)} ${Y2(gpdf(x, muTot, sTot)).toFixed(1)}`; }
        dFail += `L${X2(0).toFixed(1)} ${b2}Z`;
        add(plot, "path", { d: dFail, fill: K_PAL.rojo, "fill-opacity": 0.35 });
        add(plot, "line", { x1: X2(0).toFixed(1), y1: t2, x2: X2(0).toFixed(1), y2: b2, stroke: K_PAL.rojo, "stroke-width": 2.2, "stroke-dasharray": "6 4" });
        add(plot, "text", { x: X2(0) - 6, y: t2 + 16, "text-anchor": "end", "font-size": 14, "font-weight": 700, fill: K_PAL.rojo }, "Falla M < 0");
      }
      let dT = "";
      for (let i = 0; i <= 120; i++) { const x = lo2 + (hi2 - lo2) * i / 120; dT += `${i ? "L" : "M"}${X2(x).toFixed(1)} ${Y2(gpdf(x, muTot, sTot)).toFixed(1)}`; }
      add(plot, "path", { d: dT, fill: "none", stroke: K_PAL.verde, "stroke-width": 3.5 });
      add(plot, "line", { x1: left, y1: b2, x2: right, y2: b2, class: "v-axis" });
      (op === "diff" ? [-10, 0, 13, 25, 35] : [65, 75, 87, 100, 110]).forEach((tk) => add(plot, "text", { x: X2(tk).toFixed(1), y: b2 + 19, "text-anchor": "middle", class: "v-tick" }, fmtSigned(tk, 0)));
      add(plot, "text", { x: (left + right) / 2, y: 306, "text-anchor": "middle", class: "v-axis-label" }, op === "diff" ? "M = R − C (medias se restan; varianzas se suman)" : "S = R + C (medias y varianzas se suman)");
      const pFail = phi(-muTot / sTot);
      result.textContent = (op === "diff" ? `M ~ N(${fmt(muTot, 1)}; ${fmt(sTot * sTot, 1)}) · P(R < C) = Φ(−13/${fmt(sTot, 2)}) = ${fmt(pFail, 4)}` : `S ~ N(${fmt(muTot, 1)}; ${fmt(sTot * sTot, 1)}) · σ = √(σ_R² + σ_C²) = ${fmt(sTot, 2)} (igual en suma y resta)`);
    }
    bDiff.addEventListener("click", () => { op = "diff"; redraw(); });
    bSum.addEventListener("click", () => { op = "sum"; redraw(); });
    [srCtl, scCtl].forEach((c) => c.input.addEventListener("input", redraw));
    redraw();
  }

  /* ---------- 7. Distribuciones derivadas de la normal: χ², t y F ---------- */
  function derivadasNormal(host) {
    const M = mathApi();
    let dist = "chi2";
    const widget = el("div", "widget widget-derivadas");
    const row1 = el("div", "widget-controls");
    const btns = [["chi2", "χ²_ν (varianza)"], ["t", "t_ν (media)"], ["f", "F_{ν, 12} (cociente)"]].map(([key, lab]) => {
      const b = controlButton(lab, key === dist);
      b.addEventListener("click", () => { dist = key; redraw(); });
      row1.appendChild(b); return { key, b };
    });
    const row2 = el("div", "widget-controls slider-control");
    const vCtl = makeSlider(row2, "Grados de libertad, ν", "2", "30", "1", "5");
    const plot = makeSvg("0 0 640 310", "Densidades χ², t de Student y F de Fisher");
    const result = el("p", "widget-result");
    widget.append(row1, row2, plot, result); host.appendChild(widget);

    const fpdf = (x, d1, d2) => {
      if (x <= 0) return 0;
      const lc = M.lgamma((d1 + d2) / 2) - M.lgamma(d1 / 2) - M.lgamma(d2 / 2) + (d1 / 2) * Math.log(d1 / d2);
      return Math.exp(lc + (d1 / 2 - 1) * Math.log(x) - ((d1 + d2) / 2) * Math.log(1 + (d1 / d2) * x));
    };
    function redraw() {
      btns.forEach(({ key, b }) => b.classList.toggle("is-active", key === dist));
      const nu = Number(vCtl.input.value); vCtl.output.textContent = String(nu);
      const lo = dist === "t" ? -4.5 : 0.02, hi = dist === "t" ? 4.5 : (dist === "chi2" ? Math.max(18, nu + 3.5 * Math.sqrt(2 * nu)) : 5.5);
      const pdf = dist === "t" ? M.tpdf(nu) : dist === "chi2" ? M.chi2pdf(nu) : (x) => fpdf(x, nu, 12);
      let ymax = 0; for (let i = 0; i <= 120; i++) ymax = Math.max(ymax, pdf(lo + (hi - lo) * i / 120));
      ymax = Math.max(0.12, ymax * 1.15);
      const left = 50, right = 610, top = 26, bottom = 250;
      const X = (v) => left + (v - lo) / (hi - lo) * (right - left), Y = (v) => bottom - Math.min(v, ymax) / ymax * (bottom - top);
      plot.replaceChildren();
      if (dist === "t") {
        let dZ = "";
        for (let i = 0; i <= 100; i++) { const x = lo + (hi - lo) * i / 100; dZ += `${i ? "L" : "M"}${X(x).toFixed(1)} ${Y(Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI)).toFixed(1)}`; }
        add(plot, "path", { d: dZ, fill: "none", stroke: K_PAL.medio, "stroke-width": 2, "stroke-dasharray": "6 5" });
      }
      let curve = "";
      for (let i = 0; i <= 140; i++) { const x = lo + (hi - lo) * i / 140; curve += `${i ? "L" : "M"}${X(x).toFixed(1)} ${Y(pdf(x)).toFixed(1)}`; }
      add(plot, "path", { d: curve, fill: "none", stroke: dist === "chi2" ? K_PAL.ocre : dist === "t" ? K_PAL.morado : K_PAL.azul, "stroke-width": 3.5 });
      baseline(plot, left, right, bottom, top);
      (dist === "t" ? [-4, -2, 0, 2, 4] : [0, Math.round(hi / 2), Math.round(hi)]).forEach((tk) => add(plot, "text", { x: X(Math.max(lo, tk)).toFixed(1), y: bottom + 20, "text-anchor": "middle", class: "v-tick" }, fmtSigned(tk, 0)));
      add(plot, "text", { x: (left + right) / 2, y: 300, "text-anchor": "middle", class: "v-axis-label" }, dist === "t" ? `t con ν = ${nu} (punteada: Z)` : dist === "chi2" ? `χ² con ν = ${nu} g. l. (x ≥ 0)` : `F con ν₁ = ${nu}, ν₂ = 12 (x > 0)`);
      result.textContent = dist === "chi2" ? `χ²_${nu}: soporte x ≥ 0 · E(X) = ν = ${nu} · Var(X) = 2ν = ${2 * nu}` : dist === "t" ? `t_${nu}: simétrica en ℝ · E(X) = 0 · colas más pesadas que Z` : `F_{${nu},12}: asimétrica en x > 0 · E(X) = ν₂/(ν₂ − 2) = 1,20`;
    }
    vCtl.input.addEventListener("input", redraw);
    redraw();
  }

  /* ---------- 8. Por qué la varianza eleva al cuadrado (datos B = 22..38) ---------- */
  function desviacionesCuadrado(host) {
    const pts = [22, 26, 30, 34, 38], mean = 30;
    let step = 1;
    const widget = el("div", "widget widget-cuadrados");
    const controls = el("div", "widget-controls");
    const bOpts = [[1, "Desviaciones (suma = 0)"], [2, "Áreas cuadradas (xᵢ − x̄)²"], [3, "Varianza s² y raíz s"]];
    const btns = bOpts.map(([k, lab]) => {
      const b = controlButton(lab, k === step);
      b.addEventListener("click", () => { step = k; redraw(); });
      controls.appendChild(b); return { k, b };
    });
    const plot = makeSvg("0 0 640 315", "Desviaciones lineales frente a áreas al cuadrado y desviación estándar");
    const result = el("p", "widget-result");
    widget.append(controls, plot, result); host.appendChild(widget);

    function redraw() {
      btns.forEach(({ k, b }) => b.classList.toggle("is-active", k === step));
      plot.replaceChildren();
      const left = 56, right = 584, lo = 18, hi = 42, lineY = 236;
      const X = (v) => left + (v - lo) / (hi - lo) * (right - left);
      const pxPerUnit = (right - left) / (hi - lo);
      add(plot, "line", { x1: left, y1: lineY, x2: right, y2: lineY, class: "v-axis" });
      add(plot, "line", { x1: X(mean).toFixed(1), y1: 42, x2: X(mean).toFixed(1), y2: lineY + 12, stroke: K_PAL.rojo, "stroke-width": 2.5, "stroke-dasharray": "6 4" });
      add(plot, "text", { x: X(mean).toFixed(1), y: 28, "text-anchor": "middle", "font-size": 16, "font-weight": 700, fill: K_PAL.rojo }, "x̄ = 30");

      pts.forEach((v, i) => {
        const d = v - mean, col = d < 0 ? K_PAL.ocre : d > 0 ? K_PAL.azul : K_PAL.tinta;
        add(plot, "circle", { cx: X(v).toFixed(1), cy: lineY, r: 7, fill: col });
        add(plot, "text", { x: X(v).toFixed(1), y: lineY + 26, "text-anchor": "middle", class: "v-tick" }, String(v));
        if (step === 1 && d !== 0) {
          const yA = 100 + (i % 2) * 44;
          add(plot, "line", { x1: X(mean).toFixed(1), y1: yA, x2: X(v).toFixed(1), y2: yA, stroke: col, "stroke-width": 4 });
          add(plot, "text", { x: (X(mean) + X(v)) / 2, y: yA - 8, "text-anchor": "middle", "font-size": 16, "font-weight": 700, fill: col }, fmtSigned(d, 0));
        }
        if (step >= 2 && d !== 0) {
          const side = Math.abs(d) * pxPerUnit;
          const sqLeft = d < 0 ? X(v) : X(mean);
          const labelY = Math.abs(d) > 4 ? lineY - side * 0.75 + 6 : lineY - side / 2 + 6;
          add(plot, "rect", { x: sqLeft.toFixed(1), y: (lineY - side).toFixed(1), width: side.toFixed(1), height: side.toFixed(1), fill: col, "fill-opacity": 0.16, stroke: col, "stroke-width": 2 });
          add(plot, "text", { x: (sqLeft + side / 2).toFixed(1), y: labelY.toFixed(1), "text-anchor": "middle", "font-size": 16, "font-weight": 700, fill: col }, String(d * d));
        }
      });
      if (step === 3) {
        add(plot, "line", { x1: X(mean).toFixed(1), y1: lineY + 42, x2: X(mean + 6.32).toFixed(1), y2: lineY + 42, stroke: K_PAL.verde, "stroke-width": 5 });
        add(plot, "text", { x: X(mean + 3.16).toFixed(1), y: lineY + 66, "text-anchor": "middle", "font-size": 16, "font-weight": 700, fill: K_PAL.verde }, "s = √40 = 6,32");
      }
      result.textContent = step === 1 ? "Σ(xᵢ − x̄) = (−8) + (−4) + 0 + 4 + 8 = 0 · las distancias con signo se anulan." : step === 2 ? "Áreas cuadradas: 64 + 16 + 0 + 16 + 64 = 160 (todas positivas; extremos pesan más)." : "Varianza s² = 160 / (5 − 1) = 40 (unidades²) · Desviación s = √40 = 6,32 (unidades reales).";
    }
    redraw();
  }

  /* ---------- 9. Forma de la distribución: asimetría g₁ y curtosis g₂ ---------- */
  function formaAsimetria(host) {
    let kind = "der";
    const modes = [
      { key: "sim", label: "Simétrica", g1: "0,00", ex: "0,00", txt: "Media = Mediana = Moda · g₁ = 0" },
      { key: "der", label: "Asimétrica derecha", g1: "+1,15", ex: "+2,00", txt: "Cola derecha larga: Moda < Mediana < Media · g₁ > 0" },
      { key: "izq", label: "Asimétrica izquierda", g1: "−1,15", ex: "+2,00", txt: "Cola izquierda larga: Media < Mediana < Moda · g₁ < 0" },
      { key: "curt", label: "Colas pesadas", g1: "0,00", ex: "+3,00", txt: "Más probabilidad en el centro y en los extremos (exceso g₂ − 3 > 0)" }
    ];
    const widget = el("div", "widget widget-forma");
    const controls = el("div", "widget-controls");
    const btns = modes.map((m) => {
      const b = controlButton(m.label, m.key === kind);
      b.addEventListener("click", () => { kind = m.key; redraw(); });
      controls.appendChild(b); return b;
    });
    const plot = makeSvg("0 0 640 305", "Comparación de simetría, sesgo a derecha o izquierda y curtosis");
    const result = el("p", "widget-result");
    widget.append(controls, plot, result); host.appendChild(widget);

    const gammaDens = (x) => (x <= 0 ? 0 : (Math.pow(x, 2) * Math.exp(-x)) / 2);
    function redraw() {
      btns.forEach((b, i) => b.classList.toggle("is-active", modes[i].key === kind));
      const cur = modes.find((m) => m.key === kind);
      const lo = -4.2, hi = 4.2, left = 42, right = 606, top = 34, bottom = 262;
      const X = (v) => left + (v - lo) / (hi - lo) * (right - left), ymax = 0.56, Y = (v) => bottom - Math.min(v, ymax) / ymax * (bottom - top);
      const fn = kind === "sim" ? (x) => Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI)
        : kind === "der" ? (x) => 1.5 * gammaDens((x + 2.4) * 1.1)
        : kind === "izq" ? (x) => 1.5 * gammaDens((2.4 - x) * 1.1)
        : (x) => 0.45 * Math.pow(1 + x * x / 2.2, -1.6);
      plot.replaceChildren();
      if (kind === "curt") {
        let dN = ""; for (let i = 0; i <= 100; i++) { const x = lo + (hi - lo) * i / 100; dN += `${i ? "L" : "M"}${X(x).toFixed(1)} ${Y(Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI)).toFixed(1)}`; }
        add(plot, "path", { d: dN, fill: "none", stroke: K_PAL.medio, "stroke-width": 2, "stroke-dasharray": "6 5" });
      }
      let d = ""; for (let i = 0; i <= 120; i++) { const x = lo + (hi - lo) * i / 120; d += `${i ? "L" : "M"}${X(x).toFixed(1)} ${Y(fn(x)).toFixed(1)}`; }
      add(plot, "path", { d, fill: "none", stroke: K_PAL.azul, "stroke-width": 3.5 });
      const mk = kind === "der" ? [[-0.58, "Moda", K_PAL.verde, 20], [-0.1, "Med.", K_PAL.ocre, 46], [0.33, "Media", K_PAL.rojo, 72]]
        : kind === "izq" ? [[-0.33, "Media", K_PAL.rojo, 72], [0.1, "Med.", K_PAL.ocre, 46], [0.58, "Moda", K_PAL.verde, 20]]
        : [[0, "Media = Mediana = Moda", K_PAL.verde, 20]];
      mk.forEach(([xm, txt, col, yt]) => {
        add(plot, "line", { x1: X(xm).toFixed(1), y1: yt + 6, x2: X(xm).toFixed(1), y2: bottom, stroke: col, "stroke-width": 2.2, "stroke-dasharray": "5 4" });
        add(plot, "text", { x: X(xm) + 5, y: yt, "font-size": 14, "font-weight": 700, fill: col }, txt);
      });
      add(plot, "line", { x1: left, y1: bottom, x2: right, y2: bottom, class: "v-axis" });
      result.textContent = `${cur.txt} · Asimetría g₁ = ${cur.g1} · Exceso de curtosis = ${cur.ex}`;
    }
    redraw();
  }

  /* ---------- 10. Tamaño de muestra n frente al margen de error E (regla 1/√n) ---------- */
  function tamanoMuestra(host) {
    const M = mathApi(), s0 = 2.8860098;
    let conf = 0.95;
    const widget = el("div", "widget widget-nmuestra");
    const row1 = el("div", "widget-controls");
    const cBtns = [0.90, 0.95, 0.99].map((c) => {
      const b = controlButton(`Confianza ${Math.round(c * 100)} %`, c === conf);
      b.addEventListener("click", () => { conf = c; redraw(); });
      row1.appendChild(b); return { c, b };
    });
    const row2 = el("div", "widget-controls slider-control");
    const eCtl = makeSlider(row2, "Margen máximo deseado, E (MPa)", "0.35", "1.50", "0.05", "0.75");
    const plot = makeSvg("0 0 640 305", "Curva de amplitud del intervalo t frente al tamaño de muestra n");
    const result = el("p", "widget-result");
    widget.append(row1, row2, plot, result); host.appendChild(widget);

    function redraw() {
      cBtns.forEach(({ c, b }) => b.classList.toggle("is-active", c === conf));
      const E = Number(eCtl.input.value), targetLen = 2 * E, alpha = (1 - conf) / 2;
      eCtl.output.textContent = fmt(E, 2);
      const len = (n) => 2 * M.tCrit(alpha, n - 1) * s0 / Math.sqrt(n);
      let reqN = 10; while (reqN < 400 && len(reqN) > targetLen) reqN++;
      const nMin = 10, nMax = Math.max(120, reqN + 20), yMax = 4.2;
      const left = 54, right = 608, top = 26, bottom = 260;
      const X = (n) => left + (n - nMin) / (nMax - nMin) * (right - left), Y = (l) => bottom - Math.min(l, yMax) / yMax * (bottom - top);
      plot.replaceChildren();
      let d = ""; for (let n = nMin; n <= nMax; n += 2) d += `${n === nMin ? "M" : "L"}${X(n).toFixed(1)} ${Y(len(n)).toFixed(1)}`;
      add(plot, "path", { d, fill: "none", stroke: K_PAL.azul, "stroke-width": 3.5 });
      add(plot, "line", { x1: left, y1: Y(targetLen).toFixed(1), x2: right, y2: Y(targetLen).toFixed(1), stroke: K_PAL.ocre, "stroke-width": 2.4, "stroke-dasharray": "7 5" });
      add(plot, "text", { x: right - 4, y: Y(targetLen) - 8, "text-anchor": "end", "font-size": 15, "font-weight": 700, fill: K_PAL.ocre }, `Amplitud límite 2E = ${fmt(targetLen, 2)} MPa`);
      if (reqN <= nMax) {
        add(plot, "line", { x1: X(reqN).toFixed(1), y1: top, x2: X(reqN).toFixed(1), y2: bottom, stroke: K_PAL.verde, "stroke-width": 2.5, "stroke-dasharray": "5 4" });
        add(plot, "circle", { cx: X(reqN).toFixed(1), cy: Y(len(reqN)).toFixed(1), r: 6, fill: K_PAL.verde });
        add(plot, "text", { x: Math.min(right - 70, X(reqN) + 6).toFixed(1), y: top + 14, "font-size": 16, "font-weight": 700, fill: K_PAL.verde }, `n = ${reqN}`);
      }
      baseline(plot, left, right, bottom, top);
      [nMin, Math.round(nMax / 2), nMax].forEach((tk) => add(plot, "text", { x: X(tk).toFixed(1), y: bottom + 22, "text-anchor": "middle", class: "v-tick" }, String(tk)));
      add(plot, "text", { x: (left + right) / 2, y: 296, "text-anchor": "middle", class: "v-axis-label" }, "tamaño de muestra n (reducir E a la mitad exige 4× datos)");
      result.textContent = `Para E ≤ ${fmt(E, 2)} MPa al ${Math.round(conf * 100)} % con s₀ = 2,89: n = ${reqN} (L = ${fmt(len(reqN), 3)} MPa)`;
    }
    eCtl.input.addEventListener("input", redraw);
    redraw();
  }

  /* ---------- 11. Asimetría del intervalo χ² para la varianza σ² ---------- */
  function icChi2Asimetria(host) {
    const M = mathApi(), s2 = 0.286;
    const widget = el("div", "widget widget-icchi2");
    const controls = el("div", "widget-controls slider-control");
    const nCtl = makeSlider(controls, "Tamaño de muestra, n", "5", "30", "1", "10");
    const bSem = controlButton("Semillas (n = 10, s² = 0,286)", true);
    controls.appendChild(bSem);
    const plot = makeSvg("0 0 640 315", "Densidad χ² con colas del 2,5 % e intervalo asimétrico para la varianza");
    const result = el("p", "widget-result");
    widget.append(controls, plot, result); host.appendChild(widget);

    function redraw() {
      const n = Number(nCtl.input.value), nu = n - 1;
      nCtl.output.textContent = String(n); bSem.classList.toggle("is-active", n === 10);
      const chiLo = M.chi2Crit(0.975, nu), chiHi = M.chi2Crit(0.025, nu);
      const pdf = M.chi2pdf(nu), xMax = Math.max(chiHi * 1.22, nu + 12);
      const left = 52, right = 608, t1 = 22, b1 = 166;
      const Xc = (v) => left + v / xMax * (right - left);
      let ym = 0; for (let i = 1; i <= 100; i++) ym = Math.max(ym, pdf(xMax * i / 100)); ym = Math.max(0.05, ym * 1.15);
      const Yc = (v) => b1 - Math.min(v, ym) / ym * (b1 - t1);
      plot.replaceChildren();
      const shade = (a, b) => {
        let d = `M${Xc(a).toFixed(1)} ${b1}`;
        for (let i = 0; i <= 35; i++) { const v = a + (b - a) * i / 35; d += `L${Xc(v).toFixed(1)} ${Yc(pdf(v)).toFixed(1)}`; }
        d += `L${Xc(b).toFixed(1)} ${b1}Z`;
        add(plot, "path", { d, fill: K_PAL.rojo, "fill-opacity": 0.30 });
      };
      shade(0.01, chiLo); shade(chiHi, xMax);
      let cur = ""; for (let i = 0; i <= 120; i++) { const v = Math.max(0.02, xMax * i / 120); cur += `${i ? "L" : "M"}${Xc(v).toFixed(1)} ${Yc(pdf(v)).toFixed(1)}`; }
      add(plot, "path", { d: cur, fill: "none", stroke: K_PAL.tinta, "stroke-width": 2.8 });
      add(plot, "line", { x1: left, y1: b1, x2: right, y2: b1, class: "v-axis" });
      add(plot, "text", { x: Xc(chiLo), y: b1 + 20, "text-anchor": "middle", "font-size": 14, "font-weight": 700, fill: K_PAL.morado }, `χ²₀,₉₇₅=${fmt(chiLo, 2)}`);
      add(plot, "text", { x: Xc(chiHi), y: b1 + 20, "text-anchor": "middle", "font-size": 14, "font-weight": 700, fill: K_PAL.ocre }, `χ²₀,₀₂₅=${fmt(chiHi, 2)}`);

      // Intervalo inferior resultante para σ²
      const icL = nu * s2 / chiHi, icU = nu * s2 / chiLo, vMax = Math.max(1.2, icU * 1.18);
      const Xv = (v) => left + v / vMax * (right - left), yBar = 248;
      add(plot, "line", { x1: left, y1: yBar + 28, x2: right, y2: yBar + 28, class: "v-axis" });
      add(plot, "line", { x1: Xv(icL).toFixed(1), y1: yBar, x2: Xv(icU).toFixed(1), y2: yBar, stroke: K_PAL.azul, "stroke-width": 5 });
      add(plot, "circle", { cx: Xv(s2).toFixed(1), cy: yBar, r: 7, fill: K_PAL.verde });
      add(plot, "text", { x: Xv(icL).toFixed(1), y: yBar - 14, "text-anchor": "middle", "font-size": 14, "font-weight": 700, fill: K_PAL.ocre }, `${fmt(icL, 3)} (÷ χ² mayor)`);
      add(plot, "text", { x: Xv(icU).toFixed(1), y: yBar - 14, "text-anchor": "middle", "font-size": 14, "font-weight": 700, fill: K_PAL.morado }, `${fmt(icU, 3)} (÷ χ² menor)`);
      add(plot, "text", { x: Xv(s2).toFixed(1), y: yBar + 20, "text-anchor": "middle", "font-size": 14, "font-weight": 700, fill: K_PAL.verde }, `s²=${fmt(s2, 3)}`);
      add(plot, "text", { x: (left + right) / 2, y: 304, "text-anchor": "middle", class: "v-axis-label" }, "intervalo del 95 % para σ² (cola derecha más larga que la izquierda)");
      result.textContent = `ν = ${nu}: IC del 95 % para σ² = [${fmt(icL, 3)}; ${fmt(icU, 3)}] · razón (sup − s²) / (s² − inf) = ${fmt((icU - s2) / (s2 - icL), 1)}×`;
    }
    bSem.addEventListener("click", () => { nCtl.input.value = "10"; redraw(); });
    nCtl.input.addEventListener("input", redraw);
    redraw();
  }

  /* ---------- 12. Árbol multiplicativo de conteo etapa por etapa ---------- */
  function arbolConteo(host) {
    const presets = [
      { key: "vest", label: "Vestirse (3×2×4)", stages: [["Blusa", 3], ["Pantalón", 2], ["Zapatos", 4]] },
      { key: "ruta", label: "Rutas (2×1×2)", stages: [["1→2", 2], ["2→3", 1], ["3→4", 2]] }
    ];
    let cur = presets[0], maxSt = 3;
    const widget = el("div", "widget widget-arbc");
    const row1 = el("div", "widget-controls");
    const pBtns = presets.map((p) => { const b = controlButton(p.label, p === cur); b.addEventListener("click", () => { cur = p; redraw(); }); row1.appendChild(b); return b; });
    const sBtns = [1, 2, 3].map((s) => { const b = controlButton(`Etapas: ${s}`, s === maxSt); b.addEventListener("click", () => { maxSt = s; redraw(); }); row1.appendChild(b); return { s, b }; });
    const plot = makeSvg("0 0 640 300", "Árbol del principio multiplicativo por etapas");
    const result = el("p", "widget-result");
    widget.append(row1, plot, result); host.appendChild(widget);

    function redraw() {
      pBtns.forEach((b, i) => b.classList.toggle("is-active", presets[i] === cur));
      sBtns.forEach(({ s, b }) => b.classList.toggle("is-active", s === maxSt));
      plot.replaceChildren();
      const xs = [64, 210, 380, 560], cols = [K_PAL.azul, K_PAL.ocre, K_PAL.morado];
      let nodes = [{ x: xs[0], y: 150 }];
      add(plot, "circle", { cx: xs[0], cy: 150, r: 6, fill: K_PAL.tinta });
      for (let st = 0; st < maxSt; st++) {
        const [name, cnt] = cur.stages[st], nextNodes = [];
        add(plot, "text", { x: xs[st + 1], y: 24, "text-anchor": "middle", "font-size": 15, "font-weight": 700, fill: cols[st] }, `${name} (×${cnt})`);
        const totalOut = nodes.length * cnt;
        nodes.forEach((nd, ni) => {
          for (let j = 0; j < cnt; j++) {
            const idx = ni * cnt + j, ny = 42 + (236 / totalOut) * (idx + 0.5);
            add(plot, "line", { x1: nd.x, y1: nd.y, x2: xs[st + 1], y2: ny, stroke: cols[st], "stroke-width": 2.2 });
            add(plot, "circle", { cx: xs[st + 1], cy: ny, r: 4, fill: cols[st] });
            nextNodes.push({ x: xs[st + 1], y: ny });
          }
        });
        nodes = nextNodes;
      }
      const nums = cur.stages.slice(0, maxSt).map((s) => s[1]);
      const prod = nums.reduce((a, b) => a * b, 1);
      result.textContent = `${maxSt} ${maxSt === 1 ? "etapa" : "etapas"}: ${nums.join(" × ")} = ${prod} formas en total`;
    }
    redraw();
  }

  /* ---------- 13. Función de probabilidad p(x) y acumulada escalonada F(x) ---------- */
  function pmfCdfEscalera(host) {
    const xs = [0, 1, 2, 3], ps = [0.125, 0.375, 0.375, 0.125], fs = [0.125, 0.5, 0.875, 1];
    const widget = el("div", "widget widget-escalera");
    const controls = el("div", "widget-controls slider-control");
    const xCtl = makeSlider(controls, "Punto de corte, x", "-0.5", "3.5", "0.5", "1.5");
    const plot = makeSvg("0 0 640 315", "Función de probabilidad discreta y función de distribución acumulada escalonada");
    const result = el("p", "widget-result");
    widget.append(controls, plot, result); host.appendChild(widget);

    function redraw() {
      const cut = Number(xCtl.input.value); xCtl.output.textContent = fmtSigned(cut, 1);
      const left = 60, right = 600, X = (v) => left + (v + 0.8) / 4.6 * (right - left);
      plot.replaceChildren();
      // Arriba: p(x)
      const b1 = 118, t1 = 22, Yp = (v) => b1 - v / 0.45 * (b1 - t1);
      baseline(plot, left, right, b1, t1);
      add(plot, "text", { x: left + 8, y: t1 + 10, class: "v-kicker" }, "P(X = x) EN 3 LANZAMIENTOS DE MONEDA");
      xs.forEach((v, i) => {
        const hit = v <= cut + 1e-9, h = b1 - Yp(ps[i]);
        add(plot, "rect", { x: X(v) - 18, y: Yp(ps[i]).toFixed(1), width: 36, height: h.toFixed(1), fill: hit ? K_PAL.verde : K_PAL.gris, "fill-opacity": hit ? 0.78 : 0.45 });
        add(plot, "text", { x: X(v), y: Yp(ps[i]) - 6, "text-anchor": "middle", "font-size": 14, "font-weight": 700, fill: hit ? K_PAL.verde : K_PAL.medio }, fmt(ps[i], 3));
      });
      // Abajo: escalera F(x)
      const b2 = 268, t2 = 154, Yf = (v) => b2 - v * (b2 - t2);
      baseline(plot, left, right, b2, t2);
      add(plot, "line", { x1: left, y1: Yf(0), x2: X(0), y2: Yf(0), stroke: K_PAL.azul, "stroke-width": 3 });
      xs.forEach((v, i) => {
        const nextX = i < 3 ? X(xs[i + 1]) : right, yVal = Yf(fs[i]), prevY = Yf(i === 0 ? 0 : fs[i - 1]);
        add(plot, "line", { x1: X(v), y1: prevY, x2: X(v), y2: yVal, stroke: K_PAL.verde, "stroke-width": 2, "stroke-dasharray": "4 4" });
        add(plot, "circle", { cx: X(v), cy: prevY, r: 4.5, fill: "#fff", stroke: K_PAL.azul, "stroke-width": 2 });
        add(plot, "line", { x1: X(v), y1: yVal, x2: nextX, y2: yVal, stroke: K_PAL.azul, "stroke-width": 3.5 });
        add(plot, "circle", { cx: X(v), cy: yVal, r: 5.5, fill: v <= cut ? K_PAL.verde : K_PAL.azul });
        add(plot, "text", { x: X(v), y: b2 + 22, "text-anchor": "middle", class: "v-tick" }, String(v));
      });
      const fx = cut < 0 ? 0 : fs[Math.min(3, Math.floor(cut + 1e-9))];
      add(plot, "line", { x1: X(cut).toFixed(1), y1: t1, x2: X(cut).toFixed(1), y2: b2, stroke: K_PAL.rojo, "stroke-width": 2, "stroke-dasharray": "5 5" });
      add(plot, "text", { x: (left + right) / 2, y: 302, "text-anchor": "middle", class: "v-axis-label" }, "cada salto en F(x) mide exactamente p(x)");
      result.textContent = `F(${fmtSigned(cut, 1)}) = P(X ≤ ${fmtSigned(cut, 1)}) = ${fmt(fx, 3)} · suma de barras verdes arriba = ${fmt(fx, 3)}`;
    }
    xCtl.input.addEventListener("input", redraw);
    redraw();
  }

  /* ---------- 14. Propiedades de E(aX + b) y Var(aX + b) ---------- */
  function linealAxB(host) {
    const widget = el("div", "widget widget-lineal");
    const controls = el("div", "widget-controls slider-control");
    const aCtl = makeSlider(controls, "Escala, a", "0.5", "3.0", "0.5", "2.0");
    const bCtl = makeSlider(controls, "Desplazamiento, b", "-4", "4", "1", "0");
    const bPista = controlButton("Pista libre (3X − 2)", false);
    controls.appendChild(bPista);
    const plot = makeSvg("0 0 640 305", "Efecto de la transformación lineal Y = aX + b en media y dispersión");
    const result = el("p", "widget-result");
    widget.append(controls, plot, result); host.appendChild(widget);

    const gpdf = (x, m, s) => Math.exp(-0.5 * Math.pow((x - m) / s, 2)) / (s * Math.sqrt(2 * Math.PI));
    function redraw() {
      const a = Number(aCtl.input.value), b = Number(bCtl.input.value);
      aCtl.output.textContent = fmt(a, 1); bCtl.output.textContent = fmtSigned(b, 0);
      bPista.classList.toggle("is-active", Math.abs(a - 3) < 0.01 && Math.abs(b + 2) < 0.01);
      const muY = 2 * a + b, sY = Math.abs(a), left = 46, right = 608, top = 34, bottom = 260, lo = -6, hi = 14, ymax = 0.85;
      const X = (v) => left + (v - lo) / (hi - lo) * (right - left), Y = (v) => bottom - Math.min(v, ymax) / ymax * (bottom - top);
      plot.replaceChildren();
      let dX = "", dY = "";
      for (let i = 0; i <= 140; i++) {
        const x = lo + (hi - lo) * i / 140;
        dX += `${i ? "L" : "M"}${X(x).toFixed(1)} ${Y(gpdf(x, 2, 1)).toFixed(1)}`;
        dY += `${i ? "L" : "M"}${X(x).toFixed(1)} ${Y(gpdf(x, muY, sY)).toFixed(1)}`;
      }
      add(plot, "path", { d: dX, fill: "none", stroke: K_PAL.medio, "stroke-width": 2.4, "stroke-dasharray": "7 5" });
      add(plot, "path", { d: dY, fill: "none", stroke: K_PAL.verde, "stroke-width": 3.5 });
      add(plot, "line", { x1: left, y1: bottom, x2: right, y2: bottom, class: "v-axis" });
      add(plot, "text", { x: X(2), y: Y(gpdf(2, 2, 1)) - 10, "text-anchor": "middle", "font-size": 15, "font-weight": 700, fill: K_PAL.medio }, "X (μ=2, σ=1)");
      add(plot, "text", { x: Math.max(left + 70, Math.min(right - 70, X(muY))), y: 20, "text-anchor": "middle", "font-size": 16, "font-weight": 700, fill: K_PAL.verde }, `Y = ${fmt(a, 1)}X ${b >= 0 ? "+" : "−"} ${fmt(Math.abs(b), 0)}`);
      [-4, 0, 4, 8, 12].forEach((tk) => add(plot, "text", { x: X(tk).toFixed(1), y: bottom + 22, "text-anchor": "middle", class: "v-tick" }, fmtSigned(tk, 0)));
      add(plot, "text", { x: (left + right) / 2, y: 296, "text-anchor": "middle", class: "v-axis-label" }, "ejes fijos: b traslada la curva; a la estira");
      result.textContent = `E(Y) = ${fmt(a, 1)}(2) ${b >= 0 ? "+" : "−"} ${fmt(Math.abs(b), 0)} = ${fmtSigned(muY, 1)} · Var(Y) = (${fmt(a, 1)})²(1) = ${fmt(a * a, 2)} · σ_Y = ${fmt(sY, 1)}`;
    }
    bPista.addEventListener("click", () => { aCtl.input.value = "3.0"; bCtl.input.value = "-2"; redraw(); });
    [aCtl, bCtl].forEach((c) => c.input.addEventListener("input", redraw));
    redraw();
  }

  /* ---------- 15. Correlación lineal vs dependencia no lineal ---------- */
  function correlacionNube(host) {
    let nonlinear = false;
    const rng = seeded(DEFAULT_SEED + 313);
    const z1 = [], z2 = [];
    for (let i = 0; i < 32; i++) { z1.push(normal(rng)); z2.push(normal(rng)); }
    const widget = el("div", "widget widget-corr");
    const controls = el("div", "widget-controls slider-control");
    const rCtl = makeSlider(controls, "Correlación objetivo, r", "-0.95", "0.95", "0.05", "0.80");
    const bPara = controlButton("Parábola (r = 0, dependientes)", false);
    controls.appendChild(bPara);
    const plot = makeSvg("0 0 640 305", "Nube de dispersión según ρ y contraejemplo parabólico con ρ = 0");
    const result = el("p", "widget-result");
    widget.append(controls, plot, result); host.appendChild(widget);

    function redraw() {
      bPara.classList.toggle("is-active", nonlinear);
      const rGoal = Number(rCtl.input.value); rCtl.output.textContent = fmtSigned(rGoal, 2);
      const left = 64, right = 596, top = 26, bottom = 264, lo = -2.8, hi = 2.8;
      const X = (v) => left + (v - lo) / (hi - lo) * (right - left), Y = (v) => bottom - (v - lo) / (hi - lo) * (bottom - top);
      plot.replaceChildren();
      add(plot, "line", { x1: left, y1: Y(0), x2: right, y2: Y(0), stroke: K_PAL.gris, "stroke-width": 1.2 });
      add(plot, "line", { x1: X(0), y1: top, x2: X(0), y2: bottom, stroke: K_PAL.gris, "stroke-width": 1.2 });
      if (nonlinear) {
        for (let i = -12; i <= 12; i++) {
          const x = i / 6, y = x * x - 1.3;
          add(plot, "circle", { cx: X(x).toFixed(1), cy: Y(y).toFixed(1), r: 5.5, fill: K_PAL.rojo });
        }
        add(plot, "text", { x: (left + right) / 2, y: 296, "text-anchor": "middle", class: "v-axis-label" }, "Y = X² − 1,3 (relación exacta no lineal)");
        result.textContent = "r = 0,00 porque no hay relación lineal, aunque Y depende por completo de X.";
      } else {
        const s = Math.sqrt(1 - rGoal * rGoal);
        const pts = z1.map((x, i) => [x * 0.85, (rGoal * x + s * z2[i]) * 0.85]);
        pts.forEach(([x, y]) => add(plot, "circle", { cx: X(Math.max(lo + 0.1, Math.min(hi - 0.1, x))).toFixed(1), cy: Y(Math.max(lo + 0.1, Math.min(hi - 0.1, y))).toFixed(1), r: 5.5, fill: K_PAL.azul, "fill-opacity": 0.78 }));
        add(plot, "line", { x1: X(-2.3), y1: Y(-2.3 * rGoal), x2: X(2.3), y2: Y(2.3 * rGoal), stroke: K_PAL.verde, "stroke-width": 2.4, "stroke-dasharray": "7 5" });
        add(plot, "text", { x: (left + right) / 2, y: 296, "text-anchor": "middle", class: "v-axis-label" }, "escala estandarizada (sin unidades)");
        result.textContent = `Correlación r = ${fmtSigned(rGoal, 2)} · sentido ${rGoal > 0.05 ? "positivo" : rGoal < -0.05 ? "negativo" : "nulo"} (acotada entre −1 y +1)`;
      }
      baseline(plot, left, right, bottom, top);
    }
    bPara.addEventListener("click", () => { nonlinear = !nonlinear; redraw(); });
    rCtl.input.addEventListener("input", () => { nonlinear = false; redraw(); });
    redraw();
  }

  const mounters = { montecarlo: montecarloWidget, promedio_largo: promedioLargo, poisson: poissonWidget, bayes_tres: bayesTres, venn_ops: vennOps, venn_prob: vennProb, placas, densidad, medias, intervalos, confiabilidad, binomial, normal: normalWidget, histograma, atipico, pvalor, dosmedias, regresion, weibull, union, conteo, arbol_bayes: arbolBayes, tiros_binomial: tirosBinomial, momentos, sesgo_varianza: sesgoVarianza, retorno, adivina_quien: adivinaQuien, primer_binomial: primerBinomial, hiper_vs_binom: hiperVsBinom, poisson_limite: poissonLimite, exponencial_memoria: exponencialMemoria, normal_significado: normalSignificado, tabla_z: tablaZ, normal_aprox_binom: normalAproxBinom, caja_interactiva: cajaInteractiva, t_vs_z: tVsZ, bernoulli_ensayo: bernoulliEnsayo, geometrica_espera: geometricaEspera, selector_discreto: selectorDiscreto, uniforme_area: uniformeArea, gamma_espera: gammaEspera, suma_normales: sumaNormales, derivadas_normal: derivadasNormal, desviaciones_cuadrado: desviacionesCuadrado, forma_asimetria: formaAsimetria, tamano_muestra: tamanoMuestra, ic_chi2_asimetria: icChi2Asimetria, arbol_conteo: arbolConteo, pmf_cdf_escalera: pmfCdfEscalera, lineal_ax_b: linealAxB, correlacion_nube: correlacionNube };
  window.CourseVisuals = Object.freeze({
    has: (name) => known.has(name),
    mount: (name, host) => { if (!known.has(name)) return false; mounters[name](host); return true; },
    seeded,
    normal
  });
}());

