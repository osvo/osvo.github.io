/* Motor de las presentaciones del curso.
   Modos: presentación (por defecto), presentar (pantalla completa, tecla F), guía (?guia=1, para la pantalla del docente)
   y lectura (?lectura=1). Navegación: → y ← avanzan y retroceden, paso a paso cuando hay pasos; los ejemplos van en secuencia
   después de su concepto; un número seguido de Enter salta a esa diapositiva; la barra superior enlaza las secciones. */
(function () {
  "use strict";
  const course = window.COURSE;
  const visuales = window.CourseVisuals;
  const params = new URLSearchParams(window.location.search);
  const readingMode = params.get("lectura") === "1";
  const guideMode = !readingMode && params.get("guia") === "1";
  const $ = (id) => document.getElementById(id);
  const slidesRoot = $("slides");
  const readingRoot = $("reading");
  const entries = [];
  const R = () => window.Reveal;

  function el(tag, className, content) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (content !== undefined) node.textContent = content;
    return node;
  }
  const sectionName = (title) => { const m = (title || "").match(/^\d\d[A-Z]? · (.*)$/); return m ? m[1] : title; };

  // Colores con significado: el mismo color marca un término en la fórmula (\azul{...}) y en la frase (<span class="k-azul">).
  const COLOR_ROLES = { azul: "#1F5FA8", verde: "#2F6B2A", rojo: "#A61C31", ocre: "#A85400", morado: "#6B3FA0", magenta: "#B0307A", amarillo: "#B58900" };
  // Se sustituye el nombre del color antes de KaTeX (una macro con #1 chocaría con el # del color).
  // Además, la coma decimal entre dígitos va entre llaves para que KaTeX no la trate como separador (0{,}864 y no 0, 864).
  // \blanco{…} y \negro{…}: para ejercicios en que el número representa objetos de ese color.
  const colorize = (source) => source.replace(/\\(azul|verde|rojo|ocre|morado|magenta|amarillo)\{/g, (_, name) => `\\textcolor{${COLOR_ROLES[name]}}{`)
    .replace(/\\blanco\{/g, "\\htmlClass{k-blanco}{").replace(/\\negro\{/g, "\\htmlClass{k-negro}{").replace(/(\d),(?=\d)/g, "$1{,}");
  const KATEX_TRUST = (ctx) => ctx.command === "\\htmlClass" && /^k-(blanco|negro)$/.test(ctx.class);

  function addFormula(container, source) {
    if (!source) return;
    const block = el("div", "slide-formula", source);
    block.setAttribute("aria-label", "Fórmula");
    if (window.katex && typeof window.katex.render === "function") {
      try { window.katex.render(colorize(source), block, { displayMode: true, throwOnError: true, trust: KATEX_TRUST, strict: false }); }
      catch (_) { block.textContent = source; }
    }
    container.appendChild(block);
  }

  function renderInlineMath(root) {
    if (!root || !window.katex || typeof window.katex.renderToString !== "function") return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    const nodes = [];
    let cur;
    while ((cur = walker.nextNode())) {
      if (cur.nodeValue && (cur.nodeValue.indexOf("\\(") !== -1 || cur.nodeValue.indexOf("\\[") !== -1) && cur.parentNode && (!cur.parentNode.closest || !cur.parentNode.closest("svg, .katex, code, pre, script, style"))) {
        nodes.push(cur);
      }
    }
    nodes.forEach((node) => {
      const text = node.nodeValue;
      const re = /\\\(([\s\S]*?)\\\)|\\\[([\s\S]*?)\\\]/g;
      let last = 0, m;
      const frag = document.createDocumentFragment();
      while ((m = re.exec(text)) !== null) {
        if (m.index > last) frag.appendChild(document.createTextNode(text.slice(last, m.index)));
        const display = m[2] !== undefined, src = display ? m[2] : m[1];
        const span = document.createElement(display ? "div" : "span");
        span.className = display ? "display-math" : "inline-math";
        try { span.innerHTML = window.katex.renderToString(display ? colorize(src) : colorize(src).replace(/\\frac(?=[{\s])/g, "\\dfrac"), { displayMode: display, throwOnError: false, trust: KATEX_TRUST, strict: false }); }
        catch (_) { span.textContent = src; }
        frag.appendChild(span);
        last = re.lastIndex;
      }
      if (last === 0) return;
      if (last < text.length) frag.appendChild(document.createTextNode(text.slice(last)));
      node.parentNode.replaceChild(frag, node);
    });
  }

  function formatCodigo(codigo) {
    if (!codigo) return "";
    if (typeof codigo === "string") return codigo;
    const parts = [];
    if (codigo.python) parts.push(`<strong>Python:</strong> <code>${codigo.python}</code>`);
    if (codigo.excel) parts.push(`<strong>Excel:</strong> <code>${codigo.excel}</code>`);
    return parts.join(" &nbsp;·&nbsp; ");
  }

  // El pie muestra una fuente citable; la procedencia completa (rutas y archivos) queda en la guía.
  const SOURCE_REWRITES = [
    [/ · ver fuentes_locales\/\S+ para archivos y páginas/, ""],
    [/ · document\.tex \(2024-I\)/, " (2024-I)"],
    [/^concreto\.csv · resultados reproducidos en cuadernos\/concreto\.py\./, "Datos de concreto (UCI 165) · resultados reproducibles en el cuaderno."],
    [/^concreto\.csv · cuadernos\/figuras\/edad_resistencia\.png\./, "Datos de concreto (UCI 165)."],
    [/^UCI165 · concreto\.csv y diccionario\.md locales; I-Cheng Yeh\./, "I-Cheng Yeh · Concrete Compressive Strength (UCI 165)."],
    [/concreto\.csv/g, "datos de concreto (UCI 165)"],
    [/ reproducido en verificar_curso\.py/, ", verificado numéricamente"],
    [/Simulacion_ConceptosDeProbabilidad_Simulacion_Dado_Moneda\.pdf/, "simulación de dado y moneda"],
    [/Unidad5_VectoresAleatorios/, "la unidad 5, vectores aleatorios"],
    [/Unidad1 del curso anterior/, "unidad 1 del curso anterior"],
    [/ No exigido explícitamente en la captura actual\./, ""]
  ];
  const publicSource = (source) => SOURCE_REWRITES.reduce((text, [pattern, value]) => text.replace(pattern, value), source || "").trim();

  const CHEVRON = '<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M3 6l5 5 5-5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  const DOCENTE = "Ing., M. Sc. Juan Camilo Osorio Oviedo";

  // Motivo gráfico de cada unidad para la portada: un dibujo del tema, en trazo fino.
  function motivoPortada(id) {
    const G = "#466B3F", A = "#1F5FA8", O = "#A85400", T = "#1e231f";
    const ns = 'xmlns="http://www.w3.org/2000/svg" viewBox="0 0 620 440" aria-hidden="true"';
    const ejes = `<line x1="30" y1="400" x2="600" y2="400" stroke="${T}" stroke-opacity=".35" stroke-width="2"/>`;
    const normal = (mu, sg, h) => { let d = ""; for (let i = 0; i <= 120; i++) { const x = 30 + 570 * i / 120, z = (x - mu) / sg; d += (i ? "L" : "M") + x.toFixed(1) + " " + (400 - h * Math.exp(-z * z / 2)).toFixed(1); } return d; };
    if (/probabilidad_y_conteo|repaso/.test(id)) {
      return `<svg ${ns}><rect x="20" y="20" width="580" height="400" fill="none" stroke="${T}" stroke-opacity=".3" stroke-width="2"/><text x="42" y="62" font-family="Georgia,serif" font-size="30" fill="${T}" fill-opacity=".45">S</text>
        <circle cx="250" cy="185" r="120" fill="${A}" fill-opacity=".10" stroke="${A}" stroke-opacity=".55" stroke-width="3"/>
        <circle cx="370" cy="185" r="120" fill="${O}" fill-opacity=".10" stroke="${O}" stroke-opacity=".55" stroke-width="3"/>
        <circle cx="310" cy="285" r="120" fill="${G}" fill-opacity=".10" stroke="${G}" stroke-opacity=".55" stroke-width="3"/></svg>`;
    }
    if (/variables/.test(id)) {
      const ps = [0.06, 0.18, 0.28, 0.24, 0.14, 0.07, 0.03]; let s = `<svg ${ns}>${ejes}`;
      ps.forEach((q, i) => { const x = 70 + i * 75, h = q * 1100; s += `<rect x="${x}" y="${400 - h}" width="46" height="${h}" fill="${A}" fill-opacity=".22" stroke="${A}" stroke-opacity=".5" stroke-width="2"/>`; });
      return s + `<path d="${normal(285, 95, 320)}" fill="none" stroke="${G}" stroke-opacity=".7" stroke-width="4"/><line x1="285" y1="70" x2="285" y2="400" stroke="${O}" stroke-opacity=".6" stroke-width="3" stroke-dasharray="8 7"/></svg>`;
    }
    if (/discretos/.test(id)) {
      const c = (n, k) => { let r = 1; for (let i = 1; i <= k; i++) r = r * (n - k + i) / i; return r; };
      let s = `<svg ${ns}>${ejes}`;
      for (let k = 0; k <= 10; k++) { const q = c(10, k) * Math.pow(0.3, k) * Math.pow(0.7, 10 - k), h = q * 1250, x = 50 + k * 50; s += `<rect x="${x}" y="${400 - h}" width="34" height="${h}" fill="${G}" fill-opacity=".25" stroke="${G}" stroke-opacity=".6" stroke-width="2"/>`; }
      return s + `</svg>`;
    }
    if (/continuos/.test(id)) {
      const d = normal(315, 85, 330); let area = "";
      for (let i = 0; i <= 60; i++) { const x = 400 + 200 * i / 60, z = (x - 315) / 85; area += (i ? "L" : "M") + x.toFixed(1) + " " + (400 - 330 * Math.exp(-z * z / 2)).toFixed(1); }
      return `<svg ${ns}>${ejes}<path d="${area}L600 400L400 400Z" fill="${O}" fill-opacity=".18"/><path d="${d}" fill="none" stroke="${A}" stroke-opacity=".7" stroke-width="4"/><line x1="315" y1="60" x2="315" y2="400" stroke="${G}" stroke-opacity=".55" stroke-width="3" stroke-dasharray="8 7"/></svg>`;
    }
    if (/descriptiva/.test(id)) {
      const hs = [40, 90, 170, 250, 210, 130, 70, 30]; let s = `<svg ${ns}>`;
      hs.forEach((h, i) => { s += `<rect x="${60 + i * 62}" y="${320 - h}" width="62" height="${h}" fill="${A}" fill-opacity=".18" stroke="${A}" stroke-opacity=".5" stroke-width="2"/>`; });
      return s + `<line x1="40" y1="320" x2="600" y2="320" stroke="${T}" stroke-opacity=".35" stroke-width="2"/><line x1="110" y1="385" x2="520" y2="385" stroke="${G}" stroke-opacity=".6" stroke-width="3"/><rect x="230" y="360" width="160" height="50" fill="#fff" stroke="${G}" stroke-opacity=".7" stroke-width="3"/><line x1="300" y1="360" x2="300" y2="410" stroke="${O}" stroke-opacity=".8" stroke-width="4"/></svg>`;
    }
    if (/muestreo/.test(id)) {
      let s = `<svg ${ns}><line x1="310" y1="30" x2="310" y2="420" stroke="${O}" stroke-opacity=".6" stroke-width="3" stroke-dasharray="8 7"/>`;
      const c = [-40, 25, -10, 60, -70, 15, 35, -25, 5, -55, 160, -15];
      c.forEach((d, i) => { const y = 50 + i * 31, w = 110 + (i % 3) * 18, x = 310 + d, fuera = Math.abs(d) > w; s += `<line x1="${x - w}" y1="${y}" x2="${x + w}" y2="${y}" stroke="${fuera ? O : G}" stroke-opacity=".7" stroke-width="4"/><circle cx="${x}" cy="${y}" r="6" fill="${fuera ? O : G}" fill-opacity=".8"/>`; });
      return s + `</svg>`;
    }
    if (/regresion/.test(id)) {
      const xs = [0.99, 1.02, 1.15, 1.29, 1.46, 1.36, 0.87, 1.23, 1.55, 1.40, 1.19, 1.15, 0.98, 1.01, 1.11, 1.20, 1.26, 1.32, 1.43, 0.95];
      const ys = [90.01, 89.05, 91.43, 93.74, 96.73, 94.45, 87.59, 91.77, 99.42, 93.65, 93.54, 92.52, 90.56, 89.54, 89.85, 90.39, 93.25, 93.41, 94.98, 87.33];
      const X = (x) => 40 + (x - 0.8) / 0.85 * 540, Y = (y) => 400 - (y - 86) / 15 * 360;
      let s = `<svg ${ns}>${ejes}<line x1="${X(0.82)}" y1="${Y(74.283 + 14.947 * 0.82)}" x2="${X(1.62)}" y2="${Y(74.283 + 14.947 * 1.62)}" stroke="${O}" stroke-opacity=".75" stroke-width="4"/>`;
      xs.forEach((x, i) => { s += `<circle cx="${X(x).toFixed(1)}" cy="${Y(ys[i]).toFixed(1)}" r="9" fill="${A}" fill-opacity=".35" stroke="${A}" stroke-opacity=".7" stroke-width="2"/>`; });
      return s + `</svg>`;
    }
    return "";
  }

  function buildCover(asReading) {
    const outer = el(asReading ? "article" : "section", asReading ? "reading-sheet cover-slide" : "course-slide cover-slide");
    outer.dataset.index = "0";
    if (asReading) outer.id = "leer-0";
    const frame = el("div", "slide-frame cover-frame");
    const head = el("div", "cover-head");
    const logo = el("img", "cover-logo");
    logo.src = "../assets/marca/logosimbolo_unal_verde.png";
    logo.alt = "Universidad Nacional de Colombia";
    logo.width = 165; logo.height = 70;
    head.append(logo, el("span", "cover-course", "Probabilidad y Estadística"));
    const content = el("div", "cover-content");
    content.appendChild(el("h1", "cover-title", course.title));
    content.appendChild(el("p", "cover-author", DOCENTE));
    const art = el("div", "cover-art");
    art.innerHTML = motivoPortada(course.id || "");
    const list = el("ol", "cover-list");
    course.modules.forEach((module, moduleIndex) => {
      const grupo = entries.filter((e) => e.moduleIndex === moduleIndex);
      if (!grupo.length || grupo[0].isRefs) return;
      const li = el("li");
      const link = el("button", "cover-link");
      link.type = "button";
      link.append(el("span", "cover-link-name", sectionName(module.title)), el("span", "cover-link-range", `Diapositivas ${grupo[0].index}–${grupo[grupo.length - 1].index}`));
      link.addEventListener("click", () => goTo(grupo[0].index));
      li.appendChild(link);
      list.appendChild(li);
    });
    list.style.setProperty("--cols", String(list.children.length));
    frame.append(head, art, content, list);
    outer.appendChild(frame);
    return outer;
  }

  /* Separa los incisos escritos en línea («… a) … b) …») en una lista, un renglón por inciso.
     Solo cuenta marcas fuera de las fórmulas y en orden a, b, c… */
  function partirIncisos(node) {
    if (node.querySelector(".incisos")) return;
    const html = node.innerHTML;
    const dentroDeFormula = (i) => {
      const antes = html.slice(0, i);
      const abre = (antes.match(/\\\(|\\\[/g) || []).length, cierra = (antes.match(/\\\)|\\\]/g) || []).length;
      return abre > cierra;
    };
    const re = /(^|[\s>:.;,?¿])([a-h])\)\s+/g;
    const marcas = [];
    let letra = 97, m;
    while ((m = re.exec(html))) {
      if (m[2].charCodeAt(0) === letra && !dentroDeFormula(m.index)) { marcas.push({ desde: m.index + m[1].length, hasta: m.index + m[0].length }); letra++; }
    }
    if (marcas.length < 2) return;
    const cabeza = html.slice(0, marcas[0].desde).trim();
    const items = marcas.map((mk, i) => html.slice(mk.hasta, i + 1 < marcas.length ? marcas[i + 1].desde : html.length)
      .trim().replace(/\s*[;,]?\s*(?:\by\b|\bo\b)?\s*$/, "").replace(/[;,]$/, ""));
    const cuerpo = cabeza.replace(/^<p>/, "").replace(/<\/p>$/, "");
    node.innerHTML = (cuerpo ? `<p>${cuerpo}</p>` : "") + `<ol class="incisos">${items.map((x) => `<li>${x}</li>`).join("")}</ol>`;
  }

  /* Listas escritas en un párrafo, «(1) … (2) …», pasan a una lista con un elemento por renglón. */
  function partirNumerados(body) {
    body.querySelectorAll(":scope > p, :scope > .enunciado > p, :scope > .enunciado").forEach((p) => {
      if (p.classList && p.classList.contains("enunciado") && p.querySelector("p")) return;
      const html = p.innerHTML;
      const fuera = (i) => {
        const antes = html.slice(0, i);
        return (antes.match(/\\\(|\\\[/g) || []).length <= (antes.match(/\\\)|\\\]/g) || []).length;
      };
      const marcas = [];
      const re = /\((\d)\)\s+/g;
      let n = 1, m;
      while ((m = re.exec(html))) if (+m[1] === n && fuera(m.index)) { marcas.push({ desde: m.index, hasta: m.index + m[0].length }); n++; }
      if (marcas.length < 2) return;
      const cabeza = html.slice(0, marcas[0].desde).trim();
      const items = marcas.map((mk, i) => html.slice(mk.hasta, i + 1 < marcas.length ? marcas[i + 1].desde : html.length).trim().replace(/[;,]\s*$/, ""));
      const ol = document.createElement("ol");
      ol.className = "lista-numerada";
      ol.innerHTML = items.map((x) => `<li>${x}</li>`).join("");
      if (cabeza) { p.innerHTML = cabeza; p.after(ol); } else p.replaceWith(ol);
    });
  }

  /* Ejemplo largo: con «partir: k» se divide en dos diapositivas. La segunda repite el enunciado
     y continúa la numeración de los pasos, para no reducir la letra. */
  function partirEjemplo(ex) {
    const k = ex && ex.partir;
    if (!k || typeof document === "undefined") return [ex];
    const tmp = document.createElement("div");
    tmp.innerHTML = ex.body || "";
    const ol = tmp.querySelector("ol.pasos");
    if (!ol || ol.children.length <= k) return [ex];
    const lis = [...ol.children];
    const armar = (desde, hasta) => {
      const t = document.createElement("div");
      t.innerHTML = ex.body;
      const o = t.querySelector("ol.pasos");
      [...o.children].forEach((li, i) => { if (i < desde || i >= hasta) li.remove(); });
      if (desde) o.setAttribute("start", String(desde + 1));
      return t.innerHTML;
    };
    return [
      Object.assign({}, ex, { body: armar(0, k) }),
      Object.assign({}, ex, { title: ex.title + " (continuación)", body: armar(k, lis.length), notes: ex.notes })
    ];
  }

  /* Una diapositiva principal o uno de sus complementos (los que viven abajo). */
  function buildFrame(entry, data, asReading, sub) {
    const outer = el(asReading ? "article" : "section", (asReading ? "reading-sheet" : "course-slide") + " content-slide" + (entry.isExample ? " example-slide" : ""));
    outer.dataset.index = String(entry.index);
    outer.dataset.slideId = entry.id || String(entry.index);
    if (asReading) outer.id = `leer-${entry.index}`;
    if (!asReading) outer.id = outer.dataset.slideId;
    const frame = el("div", "slide-frame");
    const header = el("header", "slide-heading");
    header.appendChild(el("h2", "slide-title", data.title));
    const content = el("div", "slide-content");
    const prose = el("div", "slide-prose");
    if (data.lead) prose.appendChild(el("p", "slide-lead", data.lead));
    const body = el("div", "slide-body");
    body.innerHTML = data.body || "";
    // En los ejemplos (complementos), cada paso aparece al pulsar →; en Lectura se ve todo.
    if (!asReading) body.querySelectorAll("ol.pasos > li").forEach((li) => li.classList.add("fragment"));
    partirNumerados(body);
    body.querySelectorAll("ol.pasos > li > .otra-ruta:first-child").forEach((d) => d.parentElement.classList.add("paso-ruta"));
    const enunciado = body.querySelector(":scope > .enunciado");
    const pasosLista = body.querySelector(":scope > ol.pasos");
    let columnaEnunciado = null;
    if (entry.isExample && enunciado) {
      partirIncisos(enunciado);
      if (pasosLista) {
        // Enunciado fijo a la izquierda; la solución se escribe a la derecha.
        columnaEnunciado = el("div", "ej-enunciado");
        const columnaPasos = el("div", "ej-pasos");
        columnaEnunciado.appendChild(enunciado);
        [...body.childNodes].forEach((n) => columnaPasos.appendChild(n));
        body.append(columnaEnunciado, columnaPasos);
        body.classList.add("ej-grid");
        outer.classList.add("has-ej-grid");
      }
    }
    prose.appendChild(body);
    addFormula(prose, data.formula);
    // «Qué es cada símbolo»: pares [símbolo en LaTeX, significado], debajo de la fórmula.
    if (data.simbolos && data.simbolos.length) {
      const dl = el("dl", "simbolos");
      dl.innerHTML = data.simbolos.map(([sim, que]) => `<dt>\\(${sim}\\)</dt><dd>${que}</dd>`).join("");
      prose.appendChild(dl);
    }
    if (data.lectura) {
      const reading = el("p", "slide-reading");
      reading.innerHTML = data.lectura;
      prose.appendChild(reading);
      outer.classList.add("has-reading");
    }
    if (data.codigo && !data.codigoSoloGuia) {
      const codeBox = el("div", "codigo-box");
      codeBox.innerHTML = formatCodigo(data.codigo);
      prose.appendChild(codeBox);
    }
    renderInlineMath(prose);
    content.appendChild(prose);
    if (data.figure && columnaEnunciado) {
      const host = el("div", "figure-host ej-figura");
      host.innerHTML = data.figure;
      renderInlineMath(host);
      columnaEnunciado.appendChild(host);
    } else if (data.figure) {
      const host = el("div", "visual-host figure-host");
      host.innerHTML = data.figure;
      renderInlineMath(host);
      content.appendChild(host);
      outer.classList.add("has-visual");
    }
    if (data.visual && visuales && visuales.has(data.visual)) {
      const host = el("div", `visual-host visual-${data.visual}`);
      host.setAttribute("aria-label", `Visual interactivo: ${data.visual}`);
      content.appendChild(host);
      outer.classList.add(data.visualAncho ? "has-full-visual" : "has-visual");
      visuales.mount(data.visual, host);
    }
    const footer = el("footer", "slide-foot");

    frame.append(header, content, footer);
    outer.appendChild(frame);
    return outer;
  }

  function buildSlide(entry, asReading) {
    return [buildFrame(entry, entry.slide, asReading, null)];
  }

  // Encaje: cada diapositiva usa el tamaño grande por defecto y solo se reduce lo necesario para no desbordar.
  function fitSlide(section) {
    if (!section || readingMode) return;
    const content = section.querySelector(".slide-content");
    const foot = section.querySelector(".slide-foot");
    const prose = section.querySelector(".slide-prose");
    if (!content || !foot || !prose) return;
    if (foot.getBoundingClientRect().height === 0) return;
    const scale = (R() && R().getScale && R().getScale()) || 1;
    const body = section.querySelector(".slide-body");
    const formula = section.querySelector(".slide-formula");
    const reading = section.querySelector(".slide-reading");
    // Las fórmulas de KaTeX usan <svg> internos (raíces, flechas): no son gráficas y no se tocan.
    const notMath = (g) => !g.closest(".katex");
    const graphics = [...section.querySelectorAll(".slide-body svg, .widget-svg, .figure-host svg")].filter(notMath);
    section.classList.add("fitting");
    graphics.forEach((g) => { g.style.height = ""; g.style.maxHeight = ""; });
    [body, formula, reading, section.querySelector(".ej-pasos"), section.querySelector(".ej-enunciado")].forEach((node) => { if (node) node.style.fontSize = ""; });
    if (formula) {
      const bases = formula.querySelectorAll(".katex-html .base");
      if (bases.length) {
        let left = Infinity, rightEdge = -Infinity;
        bases.forEach((b) => { const r = b.getBoundingClientRect(); if (r.width) { left = Math.min(left, r.left); rightEdge = Math.max(rightEdge, r.right); } });
        const width = (rightEdge - left) / scale, room = prose.getBoundingClientRect().width / scale;
        if (width > room) formula.style.fontSize = `${Math.floor(parseFloat(getComputedStyle(formula).fontSize) * room / width)}px`;
      }
    }
    // Ecuaciones de los pasos y del enunciado: si una no cabe a lo ancho de su renglón, se reduce esa sola.
    section.querySelectorAll(".slide-body .katex-display").forEach((kd) => { kd.style.fontSize = ""; });
    section.querySelectorAll(".slide-body .katex-display").forEach((kd) => {
      const room = kd.parentElement ? kd.parentElement.getBoundingClientRect().width : 0;
      let izq = Infinity, der = -Infinity;
      kd.querySelectorAll(".katex-html > .base, .katex-html > .tag").forEach((bs) => { const r = bs.getBoundingClientRect(); if (r.width) { izq = Math.min(izq, r.left); der = Math.max(der, r.right); } });
      const ancho = der > izq ? der - izq : 0;
      if (room && ancho > room) kd.style.fontSize = `${Math.max(0.62, room / ancho * 0.98).toFixed(3)}em`;
    });
    // Cada columna se ajusta por separado: la gráfica solo se reduce si es su columna la que no cabe.
    const lateral = section.querySelector(".visual-host");
    const proseBlocks = () => [...prose.children, ...(body ? body.children : []), ...(body ? body.querySelectorAll(".ej-enunciado > *, .ej-pasos > *, .ej-pasos > ol > li") : [])];
    const sideBlocks = () => (lateral ? [...lateral.querySelectorAll(":scope > *, .widget > *")] : []);
    const overflow = (nodes) => {
      const limit = foot.getBoundingClientRect().top - 16 * scale;
      let bottom = 0;
      nodes.forEach((node) => { const r = node.getBoundingClientRect(); if (r.height > 0 && r.bottom > bottom) bottom = r.bottom; });
      return (bottom - limit) / scale;
    };
    if (section.classList.contains("has-full-visual")) {
      const topSvg = lateral ? [...lateral.querySelectorAll(".widget > svg.widget-svg")].find(notMath) || null : null;
      if (topSvg) {
        const extraTop = overflow([topSvg, ...sideBlocks()]);
        if (extraTop > 0) {
          const h = Math.max(190, topSvg.getBoundingClientRect().height / scale - extraTop);
          topSvg.style.height = `${h}px`; topSvg.style.maxHeight = `${h}px`;
        }
      }
      section.classList.remove("fitting");
      return;
    }
    const shrink = (g, extra) => {
      const height = Math.max(170, g.getBoundingClientRect().height / scale - extra);
      g.style.height = `${height}px`; g.style.maxHeight = `${height}px`;
    };
    // Si la columna de texto no cabe, primero se oculta el recuadro de código (sigue en la guía y en Lectura).
    const codeBox = section.querySelector(".codigo-box");
    if (codeBox) { codeBox.style.display = ""; if (overflow(proseBlocks()) > 0) codeBox.style.display = "none"; }
    const sideGraphic = lateral ? [...lateral.querySelectorAll("svg")].find(notMath) || null : null;
    const bodyGraphic = body ? [...body.querySelectorAll("svg")].find(notMath) || null : null;
    if (sideGraphic) { const extraSide = overflow(sideBlocks()); if (extraSide > 0) shrink(sideGraphic, extraSide); }
    const reduce = (node, floor, blocks = proseBlocks) => {
      if (!node) return;
      let size = parseFloat(getComputedStyle(node).fontSize);
      while (size > floor && overflow(blocks()) > 0) {
        size = Math.max(floor, size - 2);
        node.style.fontSize = `${size}px`;
      }
    };
    const columnaPasos = body ? body.querySelector(":scope > .ej-pasos") : null;
    if (columnaPasos) {
      const enunciado = body.querySelector(":scope > .ej-enunciado");
      const bloquesIzquierda = () => [...enunciado.children];
      const excesoIzquierda = overflow(bloquesIzquierda());
      if (bodyGraphic && enunciado.contains(bodyGraphic) && excesoIzquierda > 0) shrink(bodyGraphic, excesoIzquierda);
      reduce(enunciado, 20, bloquesIzquierda);
      // La columna izquierda puede contener una figura alta. Su altura no
      // determina el cuerpo de letra necesario para los pasos de la derecha.
      reduce(columnaPasos, 17, () => [...columnaPasos.children, ...columnaPasos.querySelectorAll("ol > li")]);
    } else if (body && body.children.length) {
      const extra = overflow(proseBlocks());
      if (bodyGraphic && extra > 0) shrink(bodyGraphic, extra);
      reduce(body, 22);
    }
    reduce(section.querySelector(".simbolos"), 18);
    reduce(reading, 20);
    reduce(formula, 22);
    if (body && !columnaPasos) reduce(body, 20);
    section.classList.remove("fitting");
  }
  function fitCurrent() {
    if (!R() || typeof R().getCurrentSlide !== "function") return;
    setTimeout(() => fitSlide(R().getCurrentSlide()), 40);
  }

  function position() {
    if (readingMode) return { h: Number(document.body.dataset.readingIndex || 0), v: 0 };
    if (!R() || typeof R().getIndices !== "function") return { h: 0, v: 0 };
    const i = R().getIndices();
    return { h: i.h || 0, v: i.v || 0 };
  }
  const currentIndex = () => position().h;

  function goTo(index, v) {
    const clamped = Math.max(0, Math.min(entries.length - 1, index));
    if (readingMode) {
      document.body.dataset.readingIndex = String(clamped);
      $(`leer-${clamped}`).scrollIntoView({ behavior: "smooth", block: "start" });
      updateChrome();
    } else if (R()) R().slide(clamped, v || 0, -1);
  }

  /* ---------- Paso a paso y avance ---------- */
  function slideStepGroups(slide) {
    if (!slide) return [];
    const raw = [...slide.querySelectorAll(".fragment:not(.disabled)")];
    if (!raw.length) return [];
    const indexed = new Map();
    const sequential = [];
    raw.forEach((node) => {
      if (node.hasAttribute("data-fragment-index")) {
        const idx = parseInt(node.getAttribute("data-fragment-index"), 10);
        if (!Number.isNaN(idx) && idx >= 0) {
          if (!indexed.has(idx)) indexed.set(idx, []);
          indexed.get(idx).push(node);
          return;
        }
      }
      sequential.push([node]);
    });
    const buckets = [...[...indexed.keys()].sort((a, b) => a - b).map((idx) => indexed.get(idx)), ...sequential];
    return buckets.map((nodes, revealIndex) => {
      const proseNodes = nodes.filter((n) => !n.matches("td, th") && !n.closest("svg"));
      const sampleNodes = proseNodes.length ? proseNodes : nodes;
      const plainText = (node) => {
        const clone = node.cloneNode(true);
        clone.querySelectorAll(".katex-mathml, style").forEach((m) => m.remove());
        return (clone.textContent || "").replace(/\s+/g, " ").trim();
      };
      const cleanText = sampleNodes.map(plainText).filter(Boolean).join(" · ");
      const label = cleanText.length > 74 ? cleanText.slice(0, 71).trimEnd() + "…" : (cleanText || `Paso ${revealIndex + 1}`);
      const html = proseNodes.length
        ? proseNodes.map((n) => n.innerHTML).join("<br>")
        : `<p><strong>Tabla:</strong> ${sampleNodes.slice(0, 4).map((n) => n.textContent.trim()).filter(Boolean).join(", ")}${sampleNodes.length > 4 ? "…" : ""}</p>`;
      return { revealIndex, nodes, label, html };
    });
  }
  function stepState(slide) {
    const groups = slideStepGroups(slide);
    let current = 0;
    groups.forEach((g, idx) => { if (g.nodes.some((n) => n.classList.contains("visible"))) current = idx + 1; });
    return { total: groups.length, current, groups };
  }
  function jumpStep(stepNum) {
    if (readingMode || !R()) return;
    const st = stepState(R().getCurrentSlide());
    if (!st.total) return;
    const clamped = Math.max(0, Math.min(st.total, stepNum));
    const changed = typeof R().navigateFragment === "function" ? R().navigateFragment(clamped - 1) : (R().slide(position().h, position().v, clamped - 1), true);
    if (!changed) updateChrome();
  }
  function toggleAllSteps() {
    if (readingMode || !R()) return;
    const st = stepState(R().getCurrentSlide());
    if (st.total) jumpStep(st.current < st.total ? st.total : 0);
  }
  function resetSteps() { jumpStep(0); }

  function advance() {
    const slide = R().getCurrentSlide();
    if (slide && slide.querySelector(".fragment:not(.visible)")) { R().nextFragment(); return; }
    const { h } = position();
    if (h < entries.length - 1) R().slide(h + 1, 0, -1);
  }
  function retreat() {
    const slide = R().getCurrentSlide();
    const { h } = position();
    if (slide && slide.querySelector(".fragment.visible")) { R().prevFragment(); return; }
    if (h > 0) R().slide(h - 1, 0);
  }

  /* ---------- Barra de secciones: enlaces a cada tema y un punto por diapositiva. ---------- */
  let sectionBar = null;
  function buildSectionBar() {
    sectionBar = el("nav", "section-bar");
    sectionBar.setAttribute("aria-label", "Secciones");
    course.modules.forEach((module, moduleIndex) => {
      const group = entries.filter((e) => e.moduleIndex === moduleIndex);
      if (!group.length) return;
      const item = el("div", "sec");
      item.dataset.module = String(moduleIndex);
      const link = el("button", "sec-name", sectionName(module.title));
      link.type = "button";
      link.title = `Ir a «${sectionName(module.title)}»`;
      link.addEventListener("click", () => goTo(group[0].index));
      const dots = el("span", "sec-dots");
      group.forEach((entry) => {
        const dot = el("button", "dot");
        dot.type = "button"; dot.dataset.index = String(entry.index);
        dot.title = `${entry.index}. ${entry.slide.title}`;
        dot.setAttribute("aria-label", dot.title);
        dot.addEventListener("click", () => goTo(entry.index));
        dots.appendChild(dot);
      });
      item.append(link, dots);
      sectionBar.appendChild(item);
    });
    const top = document.querySelector(".chrome-top");
    top.insertBefore(sectionBar, top.querySelector(".chrome-actions"));
  }

  /* ---------- Salto por número: se digita y se confirma con Enter. ---------- */
  let jumpBox = null, jumpBuffer = "", jumpTimer = null;
  function showJump() {
    if (!jumpBox) { jumpBox = el("div", "jump-box"); jumpBox.setAttribute("role", "status"); document.body.appendChild(jumpBox); }
    clearTimeout(jumpTimer);
    if (!jumpBuffer) { jumpBox.classList.remove("is-open"); return; }
    const n = Number(jumpBuffer), ok = n >= 1 && n <= entries.length - 1;
    jumpBox.replaceChildren(el("span", "jump-label", "Ir a la diapositiva"), el("strong", "", jumpBuffer),
      el("span", "jump-hint", ok ? `${entries[n].slide.title} · Enter` : `Solo hay ${entries.length - 1}`));
    jumpBox.classList.toggle("is-bad", !ok);
    jumpBox.classList.add("is-open");
    jumpTimer = setTimeout(() => { jumpBuffer = ""; showJump(); }, 4000);
  }
  function handleJumpKey(event) {
    if (/^[0-9]$/.test(event.key)) { jumpBuffer = (jumpBuffer + event.key).slice(0, 3); showJump(); return true; }
    if (!jumpBuffer) return false;
    if (event.key === "Enter") { const n = Number(jumpBuffer); jumpBuffer = ""; showJump(); if (n >= 1 && n <= entries.length - 1) goTo(n); return true; }
    if (event.key === "Backspace") { jumpBuffer = jumpBuffer.slice(0, -1); showJump(); return true; }
    if (event.key === "Escape") { jumpBuffer = ""; showJump(); return true; }
    return false;
  }

  /* ---------- Guía docente: el texto completo vive en otra ventana, sincronizada con la proyectada. ---------- */
  const VISUAL_NOTES = {
    placas: "Conteos de la tabla: 80 ambas características, 9 solo rayadura alta, 6 solo impacto alto y 5 ninguna.",
    venn_ops: "Muestra en el espacio muestral S las operaciones básicas: unión, intersección, complemento, diferencia, ley de De Morgan y eventos excluyentes.",
    venn_prob: "Barra proporcional del espacio muestral S: al mover P(A), P(B) y P(A ∩ B) se observa cómo P(A | B) cambia el denominador a B y cuándo ocurre independencia.",
    bayes_tres: "Árbol de tres causas (máquinas A, B, C o M₁, M₂, M₃) con grosores proporcionales a la probabilidad. Permite ver cómo cambia cada probabilidad posterior P(Aᵢ | D) al variar tasas base o defectos.",
    adivina_quien: "Adivina Quién: el docente o un estudiante piensa en un personaje; el grupo pregunta y se marca Sí o No. Cada respuesta descarta a quienes no coinciden y la probabilidad de cada candidato pasa a 1/(candidatos que quedan). El historial muestra cómo cambia con cada dato. Junto a cada pregunta aparece en cuántos de los que quedan la respuesta sería sí.",
    densidad: "La probabilidad es área bajo la densidad: altura 0,1 multiplicada por ancho b.",
    medias: "Muestra el teorema central del límite para cuatro poblaciones origen (dado uniforme, exponencial asimétrica, bimodal en U y Bernoulli), comparando el histograma de 1.000 medias con la campana N(μ, σ²/n).",
    intervalos: "Cada segmento es una muestra independiente. El 95 % es cobertura del procedimiento bajo el modelo; el conteo de 40 cambia con la semilla. Los intervalos que no contienen μ van en línea discontinua.",
    confiabilidad: "Las expresiones suponen funcionamiento independiente de los dos componentes.",
    binomial: "Las barras son P(X = x) para X ~ B(n, p). La línea discontinua marca E(X) = np. El botón opcional superpone la campana normal N(np, np(1 − p)) para ver cómo emerge la simetría al crecer n.",
    normal: "Explorador de la normal general con ejes sincronizados en X y en Z = (X − μ)/σ: permite calcular colas, intervalos y cuantiles inversos en ejemplos del curso.",
    histograma: "Los mismos 20 resultados ilustrativos, agrupados en clases de distinto ancho. Las clases estrechas pueden mostrar huecos sensibles a esta muestra pequeña; las anchas ocultan detalles. Comparar representaciones sin atribuir cada hueco a la población.",
    atipico: "Deslizar el dato 20 muestra cómo la media persigue al extremo mientras la mediana y la media recortada permanecen estables.",
    pvalor: "Mover x̄ desplaza t = (x̄ − 28)/(S/√n) y cambia el área roja bajo la t con 19 g. l.",
    dosmedias: "El IC de Welch estima μA − μB bajo independencia. Al desplazar B cambia la diferencia estimada y puede entrar cero en el intervalo. Contener cero no demuestra igualdad; la anchura muestra la precisión disponible.",
    regresion: "Cada segmento rojo es un residuo yᵢ − ŷᵢ y puede mostrarse su área cuadrada eᵢ². Cualquier cambio respecto a b₁ y b₀ de mínimos cuadrados hace crecer la suma de cuadrados Q = Σeᵢ².",
    weibull: "Con a < 1 la tasa de falla decrece; con a = 1 es constante (exponencial); con a > 1 crece. Esas formas pueden representar distintos patrones de vida útil, pero no identifican por sí solas la causa física. λ es inversa de escala: la escala temporal es 1/λ.",
    union: "Paso a paso: sumar P(A) + P(B) cuenta dos veces el traslape A ∩ B; restarlo corrige la suma. Luego se ilustran las leyes de De Morgan.",
    conteo: "Comparación entre n!, permutaciones (importa el orden) y combinaciones (se divide entre k! para agrupar los reordenamientos equivalentes).",
    arbol_bayes: "El árbol compara dos líneas de producción con 30 % y 70 % de los envases. Las ramas se ponderan por proporciones de envases, no por tiempo de operación. El segundo caso es un filtro de correo: prevalencia de spam 1 %, sensibilidad 99 % y especificidad 99 %. El 50 % de las alertas corresponde a spam bajo esos supuestos.",
    tiros_binomial: "Cada tiro libre es un ensayo Bernoulli con acierto p. Bajo independencia y p constante, n = 3 produce 8 secuencias, agrupadas por cantidad de aciertos X. Las barras conservan las probabilidades exactas aunque alguna resulte muy pequeña.",
    momentos: "Las pesas verdes son proporcionales a las probabilidades y el apoyo está en E(X). Las barras de contribuciones muestran p(x)(x − μ)²; su escala vertical se ajusta en cada distribución y no sirve para comparar alturas entre configuraciones.",
    retorno: "La excedencia significa superar el umbral. T = 1/p es el tiempo medio bajo el modelo anual estacionario e independiente, no una periodicidad ni una probabilidad de daño.",
    promedio_largo: "Ley de los grandes números al lanzar un dado: el promedio acumulado converge al valor esperado teórico E(X) = 3,5.",
    poisson: "Distribución de Poisson P(λ): al aumentar la tasa promedio λ, la distribución se desplaza a la derecha y se vuelve más simétrica alrededor de E(X) = λ.",
    sesgo_varianza: "Simulación de 2.000 muestras normales de tamaño n: muestra cuánta varianza se subestima en promedio al dividir entre n frente a n − 1.",
    primer_binomial: "Inspirado en el canal Primer: simulación animada de rondas de tiros libres con probabilidad p que construyen el histograma sobre la distribución teórica B(n, p), más el árbol de 8 rutas para n = 3.",
    hiper_vs_binom: "Lote de N elementos con r éxitos (verde) y N − r fracasos (rojo). Las barras dan P(X = x) para una muestra de n sin reemplazo. «Extraer muestra» marca una muestra al azar. «Comparar con binomial» agrega en ocre lo que pasaría con reemplazo, para mostrar que con lotes grandes casi no cambia.",
    poisson_limite: "Muestra la convergencia de la binomial B(n, λ/n) hacia Poisson P(λ) a medida que aumenta n manteniendo fijo np = λ.",
    exponencial_memoria: "Ilustra la propiedad de falta de memoria: al condicionar en T > s, renormalizar la cola derecha produce exactamente la misma curva exponencial desplazada desde t = 0.",
    normal_significado: "Con ejes fijos se distinguen dos hechos clave: μ traslada la curva, σ la ensancha manteniendo área 1, y al colapsar el ancho a 0 el área tiende a cero (P(X = a) = 0) aunque f(μ) > 0.",
    tabla_z: "Tabla normal estándar acumulada Φ(z) interactiva conectada con la gráfica: pulsar una celda o mover el deslizador ubica fila y columna; en modo inverso resalta la celda más cercana al área buscada.",
    normal_aprox_binom: "Compara barras binomiales con el área normal continua y resalta en ocre la media barra que se pierde si no se corta a mitad de camino entre enteros.",
    caja_interactiva: "Permite desplazar el mayor valor de los 20 cilindros para ver cómo Q₁, Q₂ y Q₃ permanecen estables y los bigotes se detienen en el último dato dentro de la valla Q₃ + 1,5·RIC antes de marcar el atípico.",
    t_vs_z: "Compara las colas de la distribución t de Student con ν = n − 1 grados de libertad frente a la normal estándar Z y el ensanchamiento porcentual del intervalo del 95 %.",
    bernoulli_ensayo: "Simulador de un ensayo Bernoulli X ~ B(1, p) con historial de resultados, comparación empírica y parábola de varianza p(1 − p) máxima en p = 0,5.",
    geometrica_espera: "Muestra el conteo de intentos hasta el primer éxito (r = 1, geométrica) o el éxito número r (binomial negativa) y marca la media teórica E(X) = r/p.",
    selector_discreto: "Árbol de decisión interactivo en tres preguntas para distinguir Binomial, Geométrica/Binomial negativa, Hipergeométrica y Poisson según el mecanismo de observación.",
    uniforme_area: "Rectángulo de densidad uniforme U(a, b) donde el área en [c, d] equivale literalmente a base por altura (d − c)/(b − a).",
    gamma_espera: "Densidad Gamma(α, β = 1/λ) como suma de α esperas exponenciales independientes: con α = 1 coincide con la exponencial.",
    suma_normales: "Compara la diferencia M = R − C (margen estructural) frente a la suma S = R + C: las medias se restan o suman según el signo, mientras la varianza total siempre suma σ_R² + σ_C².",
    derivadas_normal: "Explorador de las distribuciones χ², t de Student y F de Fisher según los grados de libertad ν, mostrando soporte, simetría y aproximación a la normal.",
    desviaciones_cuadrado: "Recorrido en tres pasos sobre el conjunto B = {22, 26, 30, 34, 38}: cancelación de desviaciones lineales, áreas cuadradas (xᵢ − x̄)² y varianza s² frente a s.",
    forma_asimetria: "Compara distribuciones simétrica, asimétrica positiva, asimétrica negativa y de colas pesadas indicando posición relativa de moda, mediana y media.",
    tamano_muestra: "Curva L(n) = 2·t·s₀/√n frente al umbral de amplitud 2E: ilustra por qué reducir a la mitad el margen de error exige multiplicar n por 4.",
    ic_chi2_asimetria: "Densidad asimétrica χ²_{n−1} con las dos colas críticas de 2,5 % conectadas al intervalo de confianza de σ², explicando por qué el mayor cuantil divide al límite inferior.",
    arbol_conteo: "Construcción etapa por etapa del principio multiplicativo mostrando cómo se multiplican las ramas en cada decisión.",
    pmf_cdf_escalera: "Conecta simultáneamente los saltos de la función de probabilidad p(x) con los escalones acumulados F(x) = P(X ≤ x).",
    lineal_ax_b: "Compara X frente a Y = aX + b en ejes fijos: b desplaza sin dispersar; a estira multiplicando la desviación estándar por |a| y la varianza por a².",
    correlacion_nube: "Diagrama de dispersión controlado por r más un contraejemplo parabólico con r = 0 pero relación exacta no lineal."
  };
  function guideData() {
    const { h, v } = position();
    const entry = entries[h] || entries[0], next = entries[h + 1];
    let nextLabel = next && next.slide ? next.slide.title : "Fin del tema";
    if (next && next.slide) {
      const nextEl = !readingMode && R() && typeof R().getSlide === "function" ? R().getSlide(h + 1) : null;
      const nextSteps = nextEl ? slideStepGroups(nextEl).length : 0;
      if (nextSteps) nextLabel += ` (${nextSteps} pasos)`;
      else if (next.slide.visual) nextLabel += " (interactivo)";
    }
    if (!entry.slide) return { counter: "Portada", section: "", title: course.title, notes: "", visual: "", codigo: "", source: "", next: nextLabel, v: 0, h };
    const data = entry.slide;
    return {
      counter: `${h} / ${entries.length - 1}`,
      section: sectionName(entry.module.title), title: data.title,
      notes: data.notes || "Sin notas adicionales para esta diapositiva.",
      visual: entry.slide.visual ? (VISUAL_NOTES[entry.slide.visual] || "") : "",
      codigo: formatCodigo(data.codigo),
      source: data.source || entry.slide.source || "", next: nextLabel, v, h
    };
  }

  let guide = null, startedAt = null;
  function buildGuide() {
    guide = el("aside", "guide");
    guide.setAttribute("aria-label", "Guía docente");
    guide.innerHTML = `
      <div class="guide-head"><span id="g-counter" class="guide-counter"></span><span class="guide-clock"><span id="g-clock"></span><button type="button" id="g-timer" title="Cronómetro de la clase. Clic para reiniciar">00:00</button></span></div>
      <p id="g-section" class="guide-section"></p>
      <h2 id="g-title" class="guide-title"></h2>
      <div class="guide-block" id="g-steps-block">
        <div class="guide-steps-head"><h3>Paso a paso en vivo</h3><span id="g-step-badge" class="guide-step-badge"></span></div>
        <div class="guide-step-actions"><button type="button" id="g-step-all">Mostrar todo (T)</button><button type="button" id="g-step-reset">Reiniciar (R)</button></div>
        <div id="g-step-next" class="guide-step-preview"></div>
        <div id="g-step-list" class="guide-step-list"></div>
      </div>
      <div class="guide-block"><h3>Qué explicar</h3><p id="g-notes" class="guide-notes"></p></div>
      <div class="guide-block" id="g-visual-block"><h3>Sobre el visual</h3><p id="g-visual"></p></div>
      <div class="guide-block" id="g-code-block"><h3>Python / Excel</h3><p id="g-code" class="guide-code"></p></div>
      <div class="guide-block"><h3>Sigue</h3><p id="g-next"></p></div>
      <div class="guide-block"><h3>Fuente</h3><p id="g-source" class="guide-source"></p></div>
      <div class="guide-controls"><button type="button" id="g-prev">Anterior</button><button type="button" id="g-next-btn">Siguiente</button><label>Ir a <input id="g-jump" type="number" min="1" inputmode="numeric" aria-label="Número de diapositiva"></label></div>
      <p class="guide-keys">Flechas: avanzar paso a paso. T: mostrar todos los pasos; R: reiniciar pasos; número y Enter: saltar. Controles sincronizados con el proyector.</p>`;
    document.querySelector(".course-app").appendChild(guide);
    $("g-prev").addEventListener("click", retreat);
    $("g-next-btn").addEventListener("click", advance);
    $("g-step-all").addEventListener("click", () => jumpStep(stepState(R().getCurrentSlide()).total));
    $("g-step-reset").addEventListener("click", resetSteps);
    $("g-jump").max = String(entries.length - 1);
    $("g-jump").addEventListener("keydown", (event) => { if (event.key === "Enter") { const n = Number(event.target.value); event.target.value = ""; event.target.blur(); if (n >= 1) goTo(n); } });
    $("g-timer").addEventListener("click", () => { startedAt = Date.now(); tick(); });
    setInterval(tick, 1000); tick();
  }
  function tick() {
    if (!guide) return;
    const now = new Date();
    $("g-clock").textContent = now.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit", hour12: false });
    const s = startedAt ? Math.floor((Date.now() - startedAt) / 1000) : 0;
    $("g-timer").textContent = `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  }
  function renderGuide() {
    if (!guide) return;
    const d = guideData();
    $("g-counter").textContent = d.counter; $("g-section").textContent = d.section; $("g-title").textContent = d.title;
    $("g-notes").textContent = d.notes; $("g-visual").textContent = d.visual; $("g-next").textContent = d.next; $("g-source").textContent = d.source;
    $("g-code").innerHTML = d.codigo;
    renderInlineMath($("g-notes"));
    renderInlineMath($("g-visual"));
    $("g-visual-block").hidden = !d.visual;
    $("g-code-block").hidden = !d.codigo;

    const slideNode = !readingMode && R() && typeof R().getCurrentSlide === "function" ? R().getCurrentSlide() : null;
    const st = stepState(slideNode);
    $("g-steps-block").hidden = !st.total;
    if (st.total) {
      $("g-step-badge").textContent = `Paso ${st.current} de ${st.total}`;
      const preview = $("g-step-next");
      if (st.current < st.total) {
        const nextGrp = st.groups[st.current];
        preview.innerHTML = `<span class="guide-step-preview-kicker">Siguiente paso al pulsar → (Paso ${st.current + 1})</span>${nextGrp.html}`;
        renderInlineMath(preview);
      } else {
        preview.innerHTML = `<span class="guide-step-preview-kicker">Pasos completos</span><p>Todos los pasos están visibles; la siguiente pulsación avanza de diapositiva.</p>`;
      }
      const list = $("g-step-list");
      list.replaceChildren();
      const zeroBtn = el("button", "guide-step-item" + (st.current === 0 ? " is-current" : ""), "0 · Solo enunciado");
      zeroBtn.type = "button";
      zeroBtn.addEventListener("click", () => jumpStep(0));
      list.appendChild(zeroBtn);
      st.groups.forEach((grp, idx) => {
        const stepNum = idx + 1;
        const b = el("button", "guide-step-item" + (st.current === stepNum ? " is-current" : ""), `${stepNum} · ${grp.label}`);
        b.type = "button";
        b.addEventListener("click", () => jumpStep(stepNum));
        list.appendChild(b);
      });
    }
    if (!startedAt && d.h > 0) startedAt = Date.now();
  }
  function openGuide() {
    if (readingMode) { openNotesDialog(); return; }
    if (guideMode) return;
    const url = new URL(window.location.href);
    url.searchParams.set("guia", "1");
    const win = window.open(url.href, "guia-docente", "width=1320,height=820");
    if (!win && window.confirm("El navegador bloqueó la ventana de la guía. ¿Mostrar las notas aquí, sobre la diapositiva? Si se está proyectando, el grupo las verá.")) openNotesDialog();
  }
  function openNotesDialog() {
    const d = guideData();
    $("notes-slide-title").textContent = d.title;
    $("notes-content").textContent = d.visual ? `${d.notes}\n\n${d.visual}` : d.notes;
    $("notes-source").textContent = d.source;
    $("notes-dialog").showModal();
  }

  /* ---------- Sincronía entre la ventana proyectada y la guía. ---------- */
  const channel = !readingMode && "BroadcastChannel" in window ? new BroadcastChannel("curso:" + window.location.pathname) : null;
  let applyingRemote = false;
  const state = () => { const i = R().getIndices(); return { h: i.h || 0, v: i.v || 0, f: i.f === undefined ? -1 : i.f }; };
  function broadcast() { if (channel && !applyingRemote && R()) channel.postMessage(state()); }
  function syncWidgetEvent(event) {
    if (!channel || applyingRemote) return;
    const target = event.target && event.target.closest ? event.target.closest("input, select, button.widget-button") : null;
    if (!target) return;
    if (event.type === "click" && !target.matches("button.widget-button")) return;
    const host = target.closest(".visual-host");
    const slide = target.closest(".course-slide");
    if (!host || !slide || !slide.dataset.slideId) return;
    const controls = [...host.querySelectorAll("input, select, button.widget-button")];
    const controlIndex = controls.indexOf(target);
    if (controlIndex < 0) return;
    const values = [...host.querySelectorAll("input, select")].map((node) => node.value);
    channel.postMessage({ widget: true, slideId: slide.dataset.slideId, controlIndex, eventType: event.type, values });
  }
  function applyRemoteWidget(d) {
    const slide = [...slidesRoot.querySelectorAll(".course-slide")].find((node) => node.dataset.slideId === d.slideId);
    const host = slide ? slide.querySelector(".visual-host") : null;
    if (!host) return;
    const inputs = [...host.querySelectorAll("input, select")];
    (d.values || []).forEach((val, idx) => { if (inputs[idx]) inputs[idx].value = val; });
    const controls = [...host.querySelectorAll("input, select, button.widget-button")];
    const target = controls[d.controlIndex];
    if (!target) return;
    applyingRemote = true;
    try {
      if (d.eventType === "click") target.click();
      else target.dispatchEvent(new Event(d.eventType, { bubbles: true }));
    } finally { applyingRemote = false; }
  }
  if (channel) {
    slidesRoot.addEventListener("input", syncWidgetEvent);
    slidesRoot.addEventListener("change", syncWidgetEvent);
    // Enviar los valores previos al clic: el receptor ejecuta la misma acción.
    // Si el botón ya incrementó la semilla, reenviarla y pulsarlo la incrementa dos veces.
    slidesRoot.addEventListener("click", syncWidgetEvent, true);
    channel.onmessage = (event) => {
      const d = event.data || {};
      if (!R() || typeof R().getIndices !== "function") return;
      if (d.hello) { broadcast(); return; }
      if (d.widget) { applyRemoteWidget(d); return; }
      const s = state();
      if (s.h === d.h && s.v === d.v && s.f === d.f) return;
      applyingRemote = true;
      try { R().slide(d.h, d.v, d.f); } finally { applyingRemote = false; }
    };
  }

  let syncClassroomInk = null;
  function updateChrome() {
    const { h, v } = position();
    const entry = entries[h] || entries[0];
    $("slide-counter").textContent = h === 0 ? "" : `${h} / ${entries.length - 1}`;
    const firma = $("chrome-firma");
    if (firma) firma.textContent = FIRMAS[h % 2];
    $("progress-fill").style.width = `${entries.length > 1 ? (100 * h / (entries.length - 1)) : 100}%`;
    $("prev-button").disabled = h <= 0 && v === 0;
    const current = !readingMode && R() && typeof R().getCurrentSlide === "function" ? R().getCurrentSlide() : null;
    const pending = !!(current && current.querySelector(".fragment:not(.visible)"));
    $("next-button").disabled = h >= entries.length - 1 && !pending;
    $("next-button").textContent = pending ? "Siguiente paso" : "Siguiente";
    $("next-button").setAttribute("aria-label", pending ? "Mostrar el siguiente paso" : "Diapositiva siguiente");
    const stepTools = $("step-tools");
    if (stepTools) {
      const st = stepState(current);
      stepTools.hidden = readingMode || !st.total;
      if (st.total) {
        $("step-counter").textContent = `Paso ${st.current} / ${st.total}`;
        const allBtn = $("steps-all-button");
        allBtn.textContent = st.current < st.total ? "Todo" : "Ocultar";
        $("steps-reset-button").disabled = st.current === 0;
      }
    }
    document.querySelectorAll(".index-link").forEach((button) => {
      const active = Number(button.dataset.index) === h;
      button.classList.toggle("is-current", active);
      if (active) button.setAttribute("aria-current", "page"); else button.removeAttribute("aria-current");
    });
    if (sectionBar) {
      sectionBar.querySelectorAll(".sec").forEach((item) => item.classList.toggle("is-current", Number(item.dataset.module) === entry.moduleIndex));
      sectionBar.querySelectorAll(".dot").forEach((dot) => { const i = Number(dot.dataset.index); dot.classList.toggle("is-current", i === h); dot.classList.toggle("is-done", i < h); });
    }
    document.body.classList.toggle("on-complement", v > 0);
    if (syncClassroomInk) syncClassroomInk();
    renderGuide();
  }

  function buildIndex() {
    const list = $("index-list");
    if (!/\/(?:clases|index)\.html$/.test(window.location.pathname)) {
      const otras = el("a", "index-otras", "Todas las clases del curso");
      otras.href = "clases.html";
      list.parentNode.insertBefore(otras, list);
    }
    const cover = el("button", "index-link index-cover", "Portada");
    cover.type = "button"; cover.dataset.index = "0";
    cover.addEventListener("click", () => { $("index-dialog").close(); goTo(0); });
    list.appendChild(cover);
    let lastModule = null, group = null;
    entries.slice(1).forEach((entry) => {
      if (entry.module !== lastModule) {
        lastModule = entry.module;
        const section = el("section", "index-module");
        section.appendChild(el("h3", "index-module-title", sectionName(entry.module.title)));
        group = el("div", "index-module-slides");
        section.appendChild(group);
        list.appendChild(section);
      }
      const button = el("button", "index-link" + (entry.isExample ? " index-example" : ""), `${entry.index}.  ${entry.slide.title}`);
      button.type = "button"; button.dataset.index = String(entry.index);
      button.addEventListener("click", () => { $("index-dialog").close(); goTo(entry.index); });
      group.appendChild(button);
    });
  }

  function buildHelpDialog() {
    const dlg = document.createElement("dialog");
    dlg.id = "help-dialog";
    dlg.className = "course-dialog";
    dlg.setAttribute("aria-labelledby", "help-title");
    dlg.innerHTML = `<div class="dialog-head"><div><p class="dialog-kicker">Atajos</p><h2 id="help-title">Atajos de teclado para clase</h2></div><button type="button" class="dialog-close" data-close="help-dialog" aria-label="Cerrar ayuda">×</button></div>` +
      `<div class="help-grid">` +
      `<kbd>→ / Espacio</kbd><span>Siguiente paso o siguiente diapositiva</span>` +
      `<kbd>←</kbd><span>Paso anterior o diapositiva anterior</span>` +
      `<kbd>T</kbd><span>Mostrar u ocultar todos los pasos de la diapositiva</span>` +
      `<kbd>R</kbd><span>Reiniciar pasos al enunciado inicial</span>` +
      `<kbd>N / G</kbd><span>Abrir ventana Guía docente sincronizada</span>` +
      `<kbd>F</kbd><span>Pantalla completa sin barras (modo presentar)</span>` +
      `<kbd>Número + Enter</kbd><span>Saltar directo a ese número de diapositiva</span>` +
      `<kbd>Esc</kbd><span>Cerrar un diálogo o salir de pantalla completa</span>` +
      `</div>`;
    document.body.appendChild(dlg);
    return dlg;
  }

  /* Firma discreta en la barra inferior: alterna entre el docente y la universidad según la diapositiva. */
  const FIRMAS = [DOCENTE, "Universidad Nacional de Colombia · Sede Manizales"];
  function setupFirma() {
    const bottom = document.querySelector(".chrome-bottom");
    if (!bottom || guideMode) return;
    const firma = el("span", "chrome-firma", DOCENTE);
    firma.id = "chrome-firma";
    bottom.insertBefore(firma, bottom.firstChild);
  }

  /* Tablas acumuladas a la mano: botón «Tablas», tecla T y botones «ver en la tabla» dentro de los pasos. */
  function abrirTabla(t, f, c) {
    let dlg = document.getElementById("tablas-dialog");
    if (!dlg) {
      dlg = document.createElement("dialog");
      dlg.id = "tablas-dialog";
      dlg.innerHTML = '<button type="button" class="tablas-cerrar" aria-label="Cerrar tablas">×</button><iframe title="Tablas acumuladas"></iframe>';
      document.body.appendChild(dlg);
      dlg.querySelector(".tablas-cerrar").addEventListener("click", () => dlg.close());
      dlg.addEventListener("click", (e) => { if (e.target === dlg) dlg.close(); });
    }
    const fr = dlg.querySelector("iframe");
    const q = new URLSearchParams({ embed: "1" });
    if (t) q.set("t", t); if (f) q.set("f", f); if (c) q.set("c", c);
    const url = "tablas.html?" + q.toString();
    if (fr.dataset.cargado && fr.contentWindow) fr.contentWindow.postMessage({ tabla: t, f, c }, "*");
    else { fr.src = url; fr.dataset.cargado = "1"; }
    if (!dlg.open) dlg.showModal();
  }
  window.abrirTabla = abrirTabla;
  window.addEventListener("message", (e) => { if (e.data && e.data.cerrarTablas) { const d = document.getElementById("tablas-dialog"); if (d) d.close(); } });
  document.addEventListener("click", (e) => {
    const b = e.target.closest(".ver-tabla");
    if (!b) return;
    e.preventDefault(); e.stopPropagation();
    abrirTabla(b.dataset.t, b.dataset.f, b.dataset.c);
  }, true);
  document.addEventListener("keydown", (e) => {
    if ((e.key === "t" || e.key === "T") && !e.ctrlKey && !e.metaKey && !e.altKey && !/INPUT|TEXTAREA|SELECT/.test((e.target.tagName || ""))) {
      const dlg = document.getElementById("tablas-dialog");
      if (dlg && dlg.open) dlg.close(); else abrirTabla();
    }
  });

  function setupChrome() {
    $("course-short-title").textContent = course.shortTitle || course.title;
    const actions = document.querySelector(".chrome-actions");
    if (!/\/(?:clases|index)\.html$/.test(window.location.pathname)) {
      const glos = el("a", "", "Fórmulas"); glos.href = "formulario.html"; glos.title = "Glosario de fórmulas y buscador de temas";
      actions.insertBefore(glos, actions.firstChild);
    }
    const tablasBtn = el("button", "", "Tablas"); tablasBtn.type = "button";
    tablasBtn.title = "Tablas acumuladas Z, t y χ² (tecla T)";
    tablasBtn.addEventListener("click", () => abrirTabla());
    actions.insertBefore(tablasBtn, actions.firstChild);
    const modeUrl = new URL(window.location.href);
    modeUrl.hash = ""; modeUrl.searchParams.delete("guia");
    if (readingMode) {
      modeUrl.searchParams.delete("lectura");
      $("mode-link").textContent = "Presentación";
      document.body.classList.add("reading-mode");
    } else { modeUrl.searchParams.set("lectura", "1"); $("mode-link").textContent = "Lectura"; }
    $("mode-link").href = modeUrl.href;
    $("index-button").addEventListener("click", () => $("index-dialog").showModal());
    const guideButton = $("notes-button");
    guideButton.textContent = readingMode ? "Notas" : "Guía";
    guideButton.title = "Abre la guía docente en otra ventana (tecla N)";
    const publico = document.documentElement.dataset.publico === "1";
    guideButton.hidden = guideMode || publico;
    guideButton.addEventListener("click", openGuide);
    const present = $("present-button");
    if (present) {
      present.hidden = readingMode || guideMode;
      present.addEventListener("click", () => {
        if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen().catch(() => document.body.classList.add("presenting", "compact"));
        else document.body.classList.add("presenting", "compact");
      });
    }
    document.addEventListener("fullscreenchange", () => {
      const on = !!document.fullscreenElement;
      document.body.classList.toggle("presenting", on);
      if (!guideMode) document.body.classList.toggle("compact", on);
    });

    const controls = document.querySelector(".slide-controls");
    const stepTools = el("span", "step-tools"); stepTools.id = "step-tools"; stepTools.hidden = true;
    const stepCounter = el("span", "step-counter"); stepCounter.id = "step-counter"; stepCounter.setAttribute("aria-live", "polite");
    const stepAll = el("button", "", "Todo"); stepAll.type = "button"; stepAll.id = "steps-all-button"; stepAll.title = "Mostrar todos los pasos (tecla T)";
    const stepReset = el("button", "", "Reiniciar"); stepReset.type = "button"; stepReset.id = "steps-reset-button"; stepReset.title = "Volver al enunciado sin pasos (tecla R)";
    stepAll.addEventListener("click", toggleAllSteps);
    stepReset.addEventListener("click", resetSteps);
    stepTools.append(stepCounter, stepAll, stepReset);
    controls.insertBefore(stepTools, controls.firstChild);

    const helpDialog = buildHelpDialog();
    setupFirma();

    document.querySelectorAll("[data-close]").forEach((button) => button.addEventListener("click", () => $(button.dataset.close).close()));
    // Teclado propio, antes que el de Reveal.
    document.addEventListener("keydown", (event) => {
      const dialog = [$("index-dialog"), $("notes-dialog"), helpDialog].find((item) => item && item.open);
      if (dialog) { event.stopImmediatePropagation(); if (event.key === "Escape") { event.preventDefault(); dialog.close(); } return; }
      if ((event.target.closest && event.target.closest("input,select,textarea")) || event.ctrlKey || event.metaKey || event.altKey) return;
      if (!readingMode && handleJumpKey(event)) { event.preventDefault(); event.stopImmediatePropagation(); return; }
      if (!publico && (event.key === "n" || event.key === "N" || event.key === "g" || event.key === "G")) { event.stopImmediatePropagation(); openGuide(); return; }
      if (!readingMode && (event.key === "t" || event.key === "T")) { event.preventDefault(); event.stopImmediatePropagation(); toggleAllSteps(); return; }
      if (!readingMode && (event.key === "r" || event.key === "R")) { event.preventDefault(); event.stopImmediatePropagation(); resetSteps(); return; }
      if (!readingMode && (event.key === "?" || (event.key === "/" && event.shiftKey))) { event.preventDefault(); event.stopImmediatePropagation(); helpDialog.showModal(); return; }
      if (event.key === "Escape") {
        if (!document.fullscreenElement && !guideMode) document.body.classList.remove("presenting", "compact");
      }
    }, true);
    $("prev-button").textContent = "Anterior";
    $("prev-button").addEventListener("click", () => readingMode ? goTo(currentIndex() - 1) : retreat());
    $("next-button").addEventListener("click", () => readingMode ? goTo(currentIndex() + 1) : advance());
  }

  function setupReadingObserver() {
    if (!("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver((visible) => {
      const candidates = visible.filter((item) => item.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio);
      if (!candidates.length) return;
      document.body.dataset.readingIndex = String(Number(candidates[0].target.dataset.index));
      updateChrome();
    }, { threshold: [0.15, 0.4, 0.7] });
    readingRoot.querySelectorAll(".reading-sheet").forEach((sheet) => observer.observe(sheet));
  }

  /* Complementos externos opcionales desde clase_complementos.js, indexados por course.id o título. */
  function applyExtras() {
    const key = course.id || ((course.subtitle || "").match(/^Clase \d+/) || [""])[0];
    const extra = (window.COURSE_EXTRAS || {})[key];
    if (!extra) return;
    Object.entries(extra.abajo || {}).forEach(([id, list]) => {
      course.modules.forEach((module) => (module.slides || []).forEach((slide) => { if (slide.id === id && !slide.abajo) slide.abajo = list; }));
    });
  }

  const BIBLIO = [
    [/Hayter/i, "Hayter, A. J. <em>Probabilidad y estadística para ingenieros y científicos</em>. Cengage."],
    [/Walpole/i, "Walpole, R. E., Myers, R. H., Myers, S. L. y Ye, K. <em>Probabilidad y estadística para ingeniería y ciencias</em>. Pearson."],
    [/Webster/i, "Webster, A. L. <em>Estadística aplicada a los negocios y la economía</em>. McGraw-Hill."],
    [/Montgomery/i, "Montgomery, D. C. y Runger, G. C. <em>Probabilidad y estadística aplicadas a la ingeniería</em>. Limusa Wiley."],
    [/Devore/i, "Devore, J. L. <em>Probabilidad y estadística para ingeniería y ciencias</em>. Cengage."],
    [/Mendenhall/i, "Mendenhall, W., Beaver, R. J. y Beaver, B. M. <em>Introducción a la probabilidad y estadística</em>. Cengage."],
    [/UCI|Yeh/i, "Yeh, I-C. <em>Concrete Compressive Strength</em>. UCI Machine Learning Repository."],
    [/Primer/i, "Primer (Justin Helps). <em>Binomial distributions</em>, visualización interactiva de probabilidad."],
    [/apuntes del docente/i, "Osorio Oviedo, J. C. Apuntes del curso de Probabilidad y Estadística, Universidad Nacional de Colombia, sede Manizales."]
  ];
  function referencias() {
    const fuentes = [];
    course.modules.forEach((m) => (m.slides || []).forEach((s) => { fuentes.push(s.source || ""); (s.abajo || []).forEach((a) => fuentes.push(a.source || "")); }));
    const texto = fuentes.join(" ") + " Hayter " + (course.referencias || []).join(" ");
    const lista = BIBLIO.filter(([re]) => re.test(texto)).map(([, ref]) => `<li>${ref}</li>`);
    return lista.length ? `<ol class="referencias">${lista.join("")}</ol>` : "";
  }

  function main() {
    if (!course || !Array.isArray(course.modules)) {
      slidesRoot.appendChild(el("section", "missing-content", "Falta el archivo de contenido o window.COURSE no cumple el contrato."));
      return;
    }
    applyExtras();
    entries.push({ index: 0, module: null, slide: null, moduleIndex: -1 });
    course.modules.forEach((module, moduleIndex) => {
      (module.slides || []).forEach((slide) => {
        entries.push({ index: entries.length, module, slide, moduleIndex, id: slide.id });
        (slide.abajo || []).forEach((ex, n) => partirEjemplo(ex).forEach((pe, k) => entries.push({ index: entries.length, module, slide: pe, parent: slide, moduleIndex, isExample: true, id: `${slide.id}-abajo-${n + 1}` + (k ? "-cont" : "") })));
      });
    });
    const refs = referencias();
    if (refs) {
      const module = { title: "Referencias" };
      course.modules.push({ title: "Referencias", slides: [] });
      entries.push({ index: entries.length, module, moduleIndex: course.modules.length - 1, isRefs: true, id: "referencias",
        slide: { id: "referencias", title: "Referencias", body: refs } });
    }
    slidesRoot.appendChild(buildCover(false));
    readingRoot.appendChild(buildCover(true));
    entries.slice(1).forEach((entry) => {
      buildSlide(entry, false).forEach((node) => slidesRoot.appendChild(node));
      buildSlide(entry, true).forEach((node) => readingRoot.appendChild(node));
    });
    buildIndex();
    buildSectionBar();
    if (guideMode) { document.body.classList.add("guide-mode", "compact"); buildGuide(); document.title = "Guía · " + document.title; }
    setupChrome();
    updateChrome();
    if (readingMode) { setupReadingObserver(); return; }
    if (!R() || typeof R().initialize !== "function") {
      slidesRoot.appendChild(el("p", "missing-content", "Falta Reveal.js local."));
      return;
    }
    R().on("slidechanged", () => { updateChrome(); fitCurrent(); broadcast(); });
    R().on("slidetransitionend", fitCurrent);
    R().on("fragmentshown", () => { updateChrome(); broadcast(); });
    R().on("fragmenthidden", () => { updateChrome(); broadcast(); });
    R().initialize({ width: 1600, height: 900, margin: 0, minScale: 0.1, maxScale: 1.5, embedded: guideMode,
      controls: false, progress: false, slideNumber: false, hash: true, center: false, jumpToSlide: false,
      transition: "fade", transitionSpeed: "fast", overview: false, navigationMode: "default", autoSlide: 0, postMessage: false,
      keyboard: { 39: advance, 32: advance, 34: advance, 37: retreat, 33: retreat, 40: () => R().down(), 38: () => R().up(), 78: null, 80: null, 72: null, 74: null, 75: null, 76: null, 71: null } }).then(() => {
      updateChrome(); fitCurrent();
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitCurrent);
      new MutationObserver(() => { R().layout(); fitCurrent(); }).observe(document.body, { attributes: true, attributeFilter: ["class"] });
      window.addEventListener("resize", fitCurrent);
      if (channel && guideMode) channel.postMessage({ hello: true });
    });
  }

  main();
}());
