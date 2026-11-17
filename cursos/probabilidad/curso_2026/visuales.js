(function () {
  "use strict";
  const SVG = "http://www.w3.org/2000/svg";
  const DEFAULT_SEED = 20261030;
  const known = new Set(["promedio_largo", "poisson", "bayes_tres", "venn_ops", "venn_prob", "placas", "densidad", "medias", "intervalos", "confiabilidad", "binomial", "normal", "histograma", "atipico", "pvalor", "dosmedias", "regresion", "weibull", "union", "conteo", "arbol_bayes", "tiros_binomial", "momentos", "sesgo_varianza", "retorno"]);
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
    const widget = el("div", "widget widget-means");
    const controls = el("div", "widget-controls");
    const nLabel = el("label", "widget-label", "Dados por muestra, n");
    const nSelect = el("select");
    [1, 2, 5, 10, 30].forEach((n) => { const option = el("option", "", String(n)); option.value = String(n); nSelect.appendChild(option); });
    nSelect.value = "5"; nLabel.appendChild(nSelect);
    const seedLabel = el("label", "widget-label", "Semilla");
    const seedInput = el("input");
    seedInput.type = "number"; seedInput.step = "1"; seedInput.value = String(DEFAULT_SEED); seedInput.min = "0";
    seedLabel.appendChild(seedInput);
    const run = controlButton("Simular M = 1.000", true);
    const reset = controlButton("Restablecer semilla", false);
    controls.append(nLabel, seedLabel, run, reset);
    const plot = makeSvg("0 0 640 330", "Histograma de mil medias de dados justos");
    const result = el("p", "widget-result");
    const foot = el("p", "widget-foot", "La línea roja marca E(X̄) = 3,5. La dispersión teórica es el error estándar σ / √n; el histograma muestra M = 1.000 muestras simuladas.");
    widget.append(controls, plot, result, foot); host.appendChild(widget);
    function runSimulation() {
      const n = Number(nSelect.value), seed = Number(seedInput.value) >>> 0;
      seedInput.value = String(seed);
      const random = seeded(seed);
      const values = [];
      for (let m = 0; m < 1000; m++) {
        let sum = 0;
        for (let i = 0; i < n; i++) sum += 1 + Math.floor(random() * 6);
        values.push(sum / n);
      }
      drawHistogram(plot, values);
      result.textContent = `n = ${n} dados por muestra · M = 1.000 muestras · E(X̄) = 3,5 · Error estándar = ${fmt(Math.sqrt(35 / (12 * n)), 3)}`;
      plot.setAttribute("aria-label", `Histograma de mil medias de ${n} dados con semilla ${seed}; esperanza 3,5 y error estándar ${fmt(Math.sqrt(35 / (12 * n)), 3)}`);
    }
    nSelect.addEventListener("change", runSimulation);
    run.addEventListener("click", runSimulation);
    reset.addEventListener("click", () => { seedInput.value = String(DEFAULT_SEED); runSimulation(); });
    runSimulation();
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
      add(plot, "text", { x: 45, y: 32, class: "v-kicker" }, "SERIE · DEBEN FUNCIONAR AMBOS");
      reliabilityDiagram(plot, 52, false, r1, r2, series);
      add(plot, "line", { x1: 45, y1: 174, x2: 595, y2: 174, class: "v-divider" });
      add(plot, "text", { x: 45, y: 211, class: "v-kicker" }, "PARALELO · BASTA UNO");
      reliabilityDiagram(plot, 226, true, r1, r2, parallel);
      result.textContent = `Serie: r₁r₂ = ${fmt(series, 3)} · Paralelo: 1 − (1−r₁)(1−r₂) = ${fmt(parallel, 3)}`;
      plot.setAttribute("aria-label", `Confiabilidad en serie ${fmt(series, 3)} y en paralelo ${fmt(parallel, 3)} con componentes ${fmt(r1, 2)} y ${fmt(r2, 2)}`);
    }
    sliders.forEach(({ input }) => input.addEventListener("input", redraw));
    redraw();
  }

  function binomial(host) {
    const widget = el("div", "widget widget-binomial");
    const controls = el("div", "widget-controls slider-control");
    const make = (text, min, max, step, value) => {
      const label = el("label", "widget-label", text);
      const input = el("input"); input.type = "range"; input.min = min; input.max = max; input.step = step; input.value = value;
      const output = el("output", "slider-value");
      label.append(input, output); controls.appendChild(label);
      return { input, output };
    };
    const nCtl = make("Ensayos, n", "1", "30", "1", "3");
    const pCtl = make("Probabilidad, p", "0.01", "0.99", "0.01", "0.10");
    const plot = makeSvg("0 0 640 330", "Función de masa de probabilidad de una binomial");
    const result = el("p", "widget-result");
    widget.append(controls, plot, result); host.appendChild(widget);
    function redraw() {
      const n = Number(nCtl.input.value), p = Number(pCtl.input.value);
      nCtl.output.textContent = String(n); pCtl.output.textContent = fmt(p, 2);
      const probs = []; let c = 1;
      for (let x = 0; x <= n; x++) { probs.push(c * Math.pow(p, x) * Math.pow(1 - p, n - x)); c = c * (n - x) / (x + 1); }
      const max = Math.max(...probs), left = 58, right = 610, top = 30, bottom = 262;
      const step = (right - left) / (n + 1), barWidth = Math.max(4, Math.min(42, step * 0.62));
      const xc = (x) => left + step * (x + 0.5);
      const Y = (value) => bottom - value / max * (bottom - top - 12);
      plot.replaceChildren();
      baseline(plot, left, right, bottom, top);
      probs.forEach((value, x) => {
        const height = bottom - Y(value);
        const bar = add(plot, "rect", { x: xc(x) - barWidth / 2, y: Y(value), width: barWidth, height, class: "v-histogram" });
        add(bar, "title", {}, `P(X = ${x}) = ${fmt(value, 4)}`);
        if (n <= 15 || x % 5 === 0) add(plot, "text", { x: xc(x), y: bottom + 24, "text-anchor": "middle", class: "v-tick" }, String(x));
      });
      const mean = n * p, xm = left + step * (mean + 0.5);
      add(plot, "line", { x1: xm, y1: top - 6, x2: xm, y2: bottom, class: "v-mean-line" });
      add(plot, "text", { x: Math.min(right - 150, xm + 8), y: top + 8, class: "v-marker-label" }, `E(X) = np = ${fmt(mean, 2)}`);
      add(plot, "text", { x: (left + right) / 2, y: 316, "text-anchor": "middle", class: "v-axis-label" }, "x, número de éxitos");
      add(plot, "text", { x: left - 8, y: Y(max) + 6, "text-anchor": "end", class: "v-tick" }, fmt(max, 2));
      result.textContent = `X ~ B(${n}, ${fmt(p, 2)}) · E(X) = ${fmt(mean, 2)} · Var(X) = np(1 − p) = ${fmt(n * p * (1 - p), 3)} · σ = ${fmt(Math.sqrt(n * p * (1 - p)), 3)} · P(X = 0) = ${fmt(probs[0], 3)}`;
      plot.setAttribute("aria-label", `Número de éxitos, binomial con n ${n} y p ${fmt(p, 2)}; valor esperado ${fmt(mean, 2)}`);
    }
    nCtl.input.addEventListener("input", redraw); pCtl.input.addEventListener("input", redraw);
    redraw();
  }

  function phi(z) {
    const y = Math.abs(z) / Math.SQRT2, t = 1 / (1 + 0.3275911 * y);
    const erf = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-y * y);
    return z >= 0 ? 0.5 * (1 + erf) : 0.5 * (1 - erf);
  }

  function normalWidget(host) {
    const widget = el("div", "widget widget-normal");
    const controls = el("div", "widget-controls slider-control");
    const make = (text, min, max, step, value) => {
      const label = el("label", "widget-label", text);
      const input = el("input"); input.type = "range"; input.min = min; input.max = max; input.step = step; input.value = value;
      const output = el("output", "slider-value");
      label.append(input, output); controls.appendChild(label);
      return { input, output };
    };
    const muCtl = make("Centro, μ", "22", "34", "0.5", "28");
    const sgCtl = make("Desviación, σ", "1.5", "6", "0.25", "3");
    const xCtl = make("Límite, x", "16", "40", "0.1", "24.2");
    const plot = makeSvg("0 0 640 330", "Densidad normal con el área a la izquierda del límite");
    const result = el("p", "widget-result");
    widget.append(controls, plot, result); host.appendChild(widget);
    function redraw() {
      const mu = Number(muCtl.input.value), sg = Number(sgCtl.input.value), x0 = Number(xCtl.input.value);
      muCtl.output.textContent = fmt(mu, 1); sgCtl.output.textContent = fmt(sg, 2); xCtl.output.textContent = fmt(x0, 1);
      const left = 40, right = 612, top = 26, bottom = 262;
      const lo = Math.min(14, mu - 5 * sg), hi = Math.max(42, mu + 5 * sg);
      const X = (x) => left + (x - lo) / (hi - lo) * (right - left);
      const f = (x) => Math.exp(-0.5 * Math.pow((x - mu) / sg, 2)) / (sg * Math.sqrt(2 * Math.PI));
      const ymax = 0.28, Y = (val) => bottom - Math.min(val, ymax) / ymax * (bottom - top);
      plot.replaceChildren();
      let area = `M${X(lo)} ${bottom}`, curve = "";
      for (let i = 0; i <= 140; i++) {
        const x = lo + (hi - lo) * i / 140;
        curve += `${i ? "L" : "M"}${X(x).toFixed(1)} ${Y(f(x)).toFixed(1)}`;
        if (x <= x0) area += `L${X(x).toFixed(1)} ${Y(f(x)).toFixed(1)}`;
      }
      area += `L${X(Math.min(x0, hi)).toFixed(1)} ${Y(f(Math.min(x0, hi))).toFixed(1)}L${X(Math.min(x0, hi)).toFixed(1)} ${bottom}Z`;
      add(plot, "path", { d: area, class: "v-area" });
      add(plot, "path", { d: curve, class: "v-wire" });
      add(plot, "line", { x1: left, y1: bottom, x2: right, y2: bottom, class: "v-axis" });
      add(plot, "line", { x1: X(mu), y1: top, x2: X(mu), y2: bottom, class: "v-mean-line" });
      add(plot, "text", { x: X(mu) + 8, y: top + 10, class: "v-marker-label" }, `μ = ${fmt(mu, 1)}`);
      [16, 20, 24, 28, 32, 36, 40].forEach((tick) => add(plot, "text", { x: X(tick), y: bottom + 24, "text-anchor": "middle", class: "v-tick" }, String(tick)));
      add(plot, "text", { x: (left + right) / 2, y: 316, "text-anchor": "middle", class: "v-axis-label" }, "resistencia, MPa");
      const z = (x0 - mu) / sg;
      result.textContent = `X ~ N(${fmt(mu, 1)}; ${fmt(sg * sg, 2)}) · z = ${fmt(z, 2)} · P(X ≤ ${fmt(x0, 1)}) = Φ(${fmt(z, 2)}) = ${fmt(phi(z), 3)}`;
      plot.setAttribute("aria-label", `Normal con media ${fmt(mu, 1)} y desviación ${fmt(sg, 2)}; probabilidad a la izquierda de ${fmt(x0, 1)} igual a ${fmt(phi(z), 3)}`);
    }
    [muCtl, sgCtl, xCtl].forEach((c) => c.input.addEventListener("input", redraw));
    redraw();
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
    return { input, output };
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
    const resumen = (data) => {
      const x = [...data].sort((a, b) => a - b), n = x.length, mean = x.reduce((a, b) => a + b, 0) / n;
      const s2 = x.reduce((a, b) => a + (b - mean) * (b - mean), 0) / (n - 1);
      return { x, n, mean, s2, s: Math.sqrt(s2), median: (x[Math.floor((n - 1) / 2)] + x[Math.floor(n / 2)]) / 2 };
    };
    return { lgamma, tpdf, tcdf, tCrit, resumen };
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
    const widget = el("div", "widget widget-regresion");
    const controls = el("div", "widget-controls slider-control");
    const b1Ctl = makeSlider(controls, "Pendiente b₁", "0", "30", "0.02", b1Def);
    const b0Ctl = makeSlider(controls, "Ordenada b₀", "60", "92", "0.02", b0Def);
    const btnMin = controlButton("Mínimos cuadrados", true);
    const btnAlt = controlButton("Otra recta (b₁ = 8)", false);
    controls.append(btnMin, btnAlt);
    const plot = makeSvg("0 0 640 330", "Recta candidata y residuos verticales sobre los veinte datos de pureza del oxígeno");
    const result = el("p", "widget-result");
    widget.append(controls, plot, result);
    host.appendChild(widget);
    function redraw() {
      const b1 = Number(b1Ctl.input.value), b0 = Number(b0Ctl.input.value);
      b1Ctl.output.textContent = fmtSigned(b1, 2);
      b0Ctl.output.textContent = fmt(b0, 2);
      btnMin.classList.toggle("is-active", Math.abs(b1 - Number(b1Def)) < 0.05 && Math.abs(b0 - Number(b0Def)) < 0.05);
      btnAlt.classList.toggle("is-active", Math.abs(b1 - 8) < 0.05 && Math.abs(b0 - 82.59) < 0.1);
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
      { key: "base", label: "1. Eventos A y B" },
      { key: "doble", label: "2. Sumar P(A) + P(B)" },
      { key: "resta", label: "3. Restar P(A ∩ B)" },
      { key: "dm1", label: "4. (A ∪ B)′ = A′ ∩ B′" },
      { key: "dm2", label: "5. (A ∩ B)′ = A′ ∪ B′" }
    ];
    let current = steps[1];
    const uid = Math.random().toString(36).slice(2, 7);
    const widget = el("div", "widget widget-union");
    const controls = el("div", "widget-controls");
    const buttons = steps.map((st) => {
      const b = controlButton(st.label, st === current);
      b.addEventListener("click", () => { current = st; redraw(); });
      controls.appendChild(b);
      return b;
    });
    const plot = makeSvg("0 0 640 320", "Diagrama interactivo de la unión de eventos, doble conteo y leyes de De Morgan");
    const result = el("p", "widget-result");
    widget.append(controls, plot, result);
    host.appendChild(widget);

    function redraw() {
      buttons.forEach((b, i) => b.classList.toggle("is-active", steps[i] === current));
      plot.replaceChildren();
      const defs = add(plot, "defs", {});
      const clipA = add(defs, "clipPath", { id: `clipA-${uid}` });
      add(clipA, "circle", { cx: 250, cy: 162, r: 102 });
      const clipB = add(defs, "clipPath", { id: `clipB-${uid}` });
      add(clipB, "circle", { cx: 390, cy: 162, r: 102 });
      const pat = add(defs, "pattern", { id: `hatch-${uid}`, width: 10, height: 10, patternUnits: "userSpaceOnUse", patternTransform: "rotate(45)" });
      add(pat, "line", { x1: 0, y1: 0, x2: 0, y2: 10, stroke: K_PAL.rojo, "stroke-width": 4 });

      const kKey = current.key;
      add(plot, "rect", { x: 24, y: 16, width: 592, height: 286, fill: kKey === "dm1" || kKey === "dm2" ? K_PAL.morado : "#ffffff", "fill-opacity": kKey === "dm1" || kKey === "dm2" ? 0.16 : 1, stroke: K_PAL.medio, "stroke-width": 2 });
      add(plot, "text", { x: 42, y: 46, "font-size": 24, "font-weight": 700, fill: K_PAL.medio }, "S");

      if (kKey === "base") {
        add(plot, "circle", { cx: 250, cy: 162, r: 102, fill: K_PAL.azul, "fill-opacity": 0.20, stroke: K_PAL.azul, "stroke-width": 3.5 });
        add(plot, "circle", { cx: 390, cy: 162, r: 102, fill: K_PAL.ocre, "fill-opacity": 0.20, stroke: K_PAL.ocre, "stroke-width": 3.5, "stroke-dasharray": "10 6" });
        result.textContent = "Dos eventos A y B que comparten la zona central A ∩ B.";
      } else if (kKey === "doble") {
        add(plot, "circle", { cx: 250, cy: 162, r: 102, fill: K_PAL.azul, "fill-opacity": 0.24, stroke: K_PAL.azul, "stroke-width": 3.5 });
        add(plot, "circle", { cx: 390, cy: 162, r: 102, fill: K_PAL.ocre, "fill-opacity": 0.24, stroke: K_PAL.ocre, "stroke-width": 3.5 });
        add(plot, "circle", { cx: 390, cy: 162, r: 102, "clip-path": `url(#clipA-${uid})`, fill: `url(#hatch-${uid})` });
        add(plot, "text", { x: 320, y: 168, "text-anchor": "middle", "font-size": 20, "font-weight": 700, fill: K_PAL.rojo, stroke: "#fff", "stroke-width": 6, "paint-order": "stroke" }, "×2 veces");
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
      add(plot, "text", { x: 455, y: 168, "text-anchor": "middle", "font-size": 30, "font-weight": 700, fill: K_PAL.ocre }, "B");
    }
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
      add(plot, "text", { x: 24, y: 28, class: "v-kicker" }, "ELECCIÓN PASO A PASO EN CASILLAS");
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
        add(plot, "text", { x: 24, y: 26, class: "v-kicker" }, "FRACCIÓN DE ENVASES PRODUCIDOS · NO FRACCIÓN DEL TIEMPO");
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
      { key: "x", label: "Excluyentes", txt: "A ∩ B = ∅: no pueden ocurrir a la vez." }
    ];
    let cur = ops[0];
    const uid = Math.random().toString(36).slice(2, 7);
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
    let tiros = [], suma = 0, anim = null;
    const cuenta = [0, 0, 0, 0, 0, 0];
    function lanzar(k) { for (let i = 0; i < k; i++) { const v = 1 + Math.floor(Math.random() * 6); tiros.push(v); suma += v; cuenta[v - 1]++; } }
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
    bReset.addEventListener("click", () => { parar(); tiros = []; suma = 0; cuenta.fill(0); redraw(); });
    bAnim.addEventListener("click", () => {
      parar();
      const paso = () => { if (tiros.length >= 1000) { anim = null; return; } lanzar(Math.max(1, Math.ceil(tiros.length / 40))); redraw(); anim = requestAnimationFrame(paso); };
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

  /* Probabilidad total y Bayes con tres causas: deslizadores y árbol proporcional. */
  function bayesTres(host) {
    const widget = el("div", "widget widget-bayes3");
    const controls = el("div", "widget-controls slider-control");
    const a1 = makeSlider(controls, "P(A₁)", "0.05", "0.9", "0.01", "0.10");
    const a2 = makeSlider(controls, "P(A₂)", "0.05", "0.9", "0.01", "0.30");
    const d1 = makeSlider(controls, "P(D | A₁)", "0", "0.2", "0.005", "0.01");
    const d2 = makeSlider(controls, "P(D | A₂)", "0", "0.2", "0.005", "0.03");
    const d3 = makeSlider(controls, "P(D | A₃)", "0", "0.2", "0.005", "0.05");
    const plot = makeSvg("0 0 640 300", "Árbol de probabilidad con tres causas y la probabilidad posterior de cada una");
    const result = el("p", "widget-result");
    widget.append(controls, plot, result); host.appendChild(widget);
    const f = (v, d) => fmt(v, d === undefined ? 3 : d);
    function redraw() {
      let p1 = +a1.input.value, p2 = +a2.input.value;
      if (p1 + p2 > 0.95) { p2 = 0.95 - p1; a2.input.value = p2; }
      const p3 = 1 - p1 - p2, q = [+d1.input.value, +d2.input.value, +d3.input.value], pr = [p1, p2, p3];
      a1.output.textContent = f(p1, 2); a2.output.textContent = f(p2, 2); d1.output.textContent = f(q[0]); d2.output.textContent = f(q[1]); d3.output.textContent = f(q[2]);
      const ramas = pr.map((p, i) => p * q[i]), pd = ramas.reduce((a, b) => a + b, 0);
      plot.replaceChildren();
      const ys = [60, 150, 240];
      pr.forEach((p, i) => {
        add(plot, "line", { x1: 40, y1: 150, x2: 190, y2: ys[i], stroke: K_PAL.azul, "stroke-width": 2 + 10 * p });
        add(plot, "text", { x: 100, y: (150 + ys[i]) / 2 - 10, class: "v-tick", fill: K_PAL.azul }, f(p, 2));
        add(plot, "text", { x: 200, y: ys[i] + 7, class: "v-tick", "font-weight": 700, fill: K_PAL.azul }, `A${"₁₂₃"[i]}`);
        add(plot, "line", { x1: 235, y1: ys[i], x2: 360, y2: ys[i] - 18, stroke: K_PAL.ocre, "stroke-width": 2 + 40 * q[i] });
        add(plot, "text", { x: 280, y: ys[i] - 24, class: "v-tick", fill: K_PAL.ocre }, f(q[i]));
        add(plot, "text", { x: 370, y: ys[i] - 12, class: "v-tick", "font-weight": 700, fill: K_PAL.ocre }, "D");
        add(plot, "text", { x: 400, y: ys[i] - 12, class: "v-tick" }, `rama: ${f(ramas[i], 4)}`);
        add(plot, "text", { x: 400, y: ys[i] + 14, class: "v-tick", fill: K_PAL.verde, "font-weight": 700 }, `P(A${"₁₂₃"[i]} | D) = ${pd ? f(ramas[i] / pd) : "—"}`);
      });
      add(plot, "circle", { cx: 40, cy: 150, r: 6, fill: K_PAL.tinta });
      result.textContent = `P(A₃) = 1 − P(A₁) − P(A₂) = ${f(p3, 2)} · Probabilidad total: P(D) = ${ramas.map((r) => f(r, 4)).join(" + ")} = ${f(pd, 4)}`;
    }
    [a1, a2, d1, d2, d3].forEach((s) => s.input.addEventListener("input", redraw));
    redraw();
  }

  const mounters = { promedio_largo: promedioLargo, poisson: poissonWidget, bayes_tres: bayesTres, venn_ops: vennOps, venn_prob: vennProb, placas, densidad, medias, intervalos, confiabilidad, binomial, normal: normalWidget, histograma, atipico, pvalor, dosmedias, regresion, weibull, union, conteo, arbol_bayes: arbolBayes, tiros_binomial: tirosBinomial, momentos, sesgo_varianza: sesgoVarianza, retorno };
  window.CourseVisuals = Object.freeze({
    has: (name) => known.has(name),
    mount: (name, host) => { if (!known.has(name)) return false; mounters[name](host); return true; },
    seeded,
    normal
  });
}());

