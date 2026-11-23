/* Biblioteca común de las clases 3 en adelante: colores, formato, funciones numéricas y figuras SVG.
   Se carga antes del archivo de contenido de cada clase y expone window.Fig.
   Las clases 1 y 2 traen sus propias copias y no dependen de este archivo. */
(function () {
  "use strict";
  const K = { azul: "#1F5FA8", verde: "#2F6B2A", rojo: "#A61C31", ocre: "#A85400", morado: "#6B3FA0", magenta: "#B0307A", gris: "#B1B2B0", tinta: "#1e231f", medio: "#565A5C" };
  const co = (v, d) => Number(v).toLocaleString("es-CO", { minimumFractionDigits: d, maximumFractionDigits: d }).replace("-", "−");
  const k = (color, text) => `<span class="k-${color}">${text}</span>`;
  const H = (sec) => `Hayter, 4.ª ed., ${sec}.`;

  /* ---------- Funciones numéricas ---------- */
  function lgamma(x) {
    const c = [76.18009172947146, -86.50532032941677, 24.01409824083091, -1.231739572450155, 0.001208650973866179, -0.000005395239384953];
    let y = x, tmp = x + 5.5; tmp -= (x + 0.5) * Math.log(tmp);
    let ser = 1.000000000190015;
    for (let j = 0; j < 6; j++) ser += c[j] / ++y;
    return -tmp + Math.log(2.5066282746310005 * ser / x);
  }
  function Phi(z) {
    const y = Math.abs(z) / Math.SQRT2, t = 1 / (1 + 0.3275911 * y);
    const erf = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-y * y);
    return z >= 0 ? 0.5 * (1 + erf) : 0.5 * (1 - erf);
  }
  const normal = (mu, s) => (x) => Math.exp(-0.5 * Math.pow((x - mu) / s, 2)) / (s * Math.sqrt(2 * Math.PI));
  const tpdf = (nu) => (x) => Math.exp(lgamma((nu + 1) / 2) - lgamma(nu / 2)) / Math.sqrt(nu * Math.PI) * Math.pow(1 + x * x / nu, -(nu + 1) / 2);
  const chi2pdf = (nu) => (x) => x <= 0 ? 0 : Math.exp((nu / 2 - 1) * Math.log(x) - x / 2 - (nu / 2) * Math.LN2 - lgamma(nu / 2));
  function simpson(f, a, b, n) {
    n = n || 2000; const h = (b - a) / n; let s = f(a) + f(b);
    for (let i = 1; i < n; i++) s += f(a + i * h) * (i % 2 ? 4 : 2);
    return s * h / 3;
  }
  const tcdf = (x, nu) => 0.5 + Math.sign(x) * simpson(tpdf(nu), 0, Math.abs(x));
  const chi2cdf = (x, nu) => (x <= 0 ? 0 : simpson(chi2pdf(nu), 1e-9, x, 4000));
  function inversa(cdf, p, lo, hi) { for (let i = 0; i < 70; i++) { const m = (lo + hi) / 2; if (cdf(m) < p) lo = m; else hi = m; } return (lo + hi) / 2; }
  /* Puntos críticos con la convención de Hayter: área α a la DERECHA. */
  const zCrit = (alpha) => inversa(Phi, 1 - alpha, -10, 10);
  const tCrit = (alpha, nu) => inversa((x) => tcdf(x, nu), 1 - alpha, -60, 60);
  const chi2Crit = (alpha, nu) => inversa((x) => chi2cdf(x, nu), 1 - alpha, 0, 20 * nu + 60);
  const comb = (n, x) => { let c = 1; for (let i = 0; i < x; i++) c = c * (n - i) / (i + 1); return c; };

  /* ---------- Estadísticos muestrales (definiciones de Hayter, sección 6.3) ---------- */
  function resumen(data) {
    const x = [...data].sort((a, b) => a - b), n = x.length, mean = x.reduce((a, b) => a + b, 0) / n;
    const s2 = x.reduce((a, b) => a + (b - mean) * (b - mean), 0) / (n - 1);
    const q = (p) => { const pos = p * (n + 1), i = Math.floor(pos), f = pos - i; if (i < 1) return x[0]; if (i >= n) return x[n - 1]; return x[i - 1] + f * (x[i] - x[i - 1]); };
    return { x, n, mean, s2, s: Math.sqrt(s2), min: x[0], max: x[n - 1], median: q(0.5), q1: q(0.25), q3: q(0.75), q };
  }

  /* ---------- Figuras ---------- */
  const W = 640, HH = 400;
  const halo = "";

  function curvas(list, o) {
    const left = 44, right = 612, top = 40, bottom = 316, N = 160;
    const X = (x) => left + (x - o.xmin) / (o.xmax - o.xmin) * (right - left);
    let ymax = o.ymax || 0;
    if (!o.ymax) list.forEach((c) => { for (let i = 0; i <= N; i++) { const v = c.f(o.xmin + (o.xmax - o.xmin) * i / N); if (isFinite(v) && v > ymax) ymax = v; } });
    const Y = (v) => bottom - Math.min(v, ymax) / ymax * (bottom - top);
    let s = `<svg viewBox="0 0 ${W} ${HH}" role="img" aria-label="${o.alt}">`;
    (o.areas || []).forEach((a) => {
      let d = `M${X(a.from).toFixed(1)} ${bottom}`;
      for (let i = 0; i <= 60; i++) { const x = a.from + (a.to - a.from) * i / 60; d += `L${X(x).toFixed(1)} ${Y(a.f(x)).toFixed(1)}`; }
      s += `<path d="${d}L${X(a.to).toFixed(1)} ${bottom}Z" fill="${a.color}" fill-opacity=".32"/>`;
    });
    list.forEach((c) => {
      let d = "";
      for (let i = 0; i <= N; i++) { const x = o.xmin + (o.xmax - o.xmin) * i / N; d += `${i ? "L" : "M"}${X(x).toFixed(1)} ${Y(c.f(x)).toFixed(1)}`; }
      s += `<path d="${d}" fill="none" stroke="${c.color || K.tinta}" stroke-width="${c.width || 3.5}"${c.dash ? ` stroke-dasharray="${c.dash}"` : ""}/>`;
    });
    s += `<path d="M${left} ${bottom}H${right}" stroke="${K.medio}" stroke-width="2"/>`;
    (o.ticks || []).forEach((t) => {
      const v = typeof t === "object" ? t.x : t, text = typeof t === "object" ? t.text : co(v, Number.isInteger(v) ? 0 : 1), color = (typeof t === "object" && t.color) || K.tinta;
      s += `<path d="M${X(v).toFixed(1)} ${bottom}v7" stroke="${K.medio}" stroke-width="2"/><text x="${X(v).toFixed(1)}" y="${bottom + 30}" text-anchor="middle" font-size="21" fill="${color}" font-weight="${color === K.tinta ? 400 : 700}">${text}</text>`;
    });
    (o.vlines || []).forEach((v) => { s += `<path d="M${X(v.x).toFixed(1)} ${top - 8}V${bottom}" stroke="${v.color}" stroke-width="3" stroke-dasharray="9 6"/>`; });
    (o.labels || []).forEach((t) => {
      const size = t.size || 22, anchor = t.anchor || "middle";
      const width = Math.min(W - 16, [...String(t.text)].length * size * 0.59);
      const pad = anchor === "start" ? 0 : anchor === "end" ? width : width / 2;
      const x = Math.max(8 + pad, Math.min(W - 8 - (width - pad), X(t.x)));
      s += `<text x="${x.toFixed(1)}" y="${t.y}" text-anchor="${anchor}" font-size="${size}" font-weight="700" fill="${t.color || K.tinta}" ${halo}>${t.text}</text>`;
    });
    s += `<text x="${(left + right) / 2}" y="${HH - 12}" text-anchor="middle" font-size="21" font-weight="700" fill="${K.tinta}">${o.xlabel}</text>`;
    s += `<text x="${left}" y="${top - 18}" font-size="19" fill="${K.medio}">${o.ylabel || "f(x)"}</text></svg>`;
    return s + (o.note ? `<p class="fig-note">${o.note}</p>` : "");
  }

  /* Diagrama de puntos apilados; marks: [{x, color, text, dash}]; bands: [{from, to, color, text}] */
  function puntos(data, o) {
    o = o || {};
    const left = 40, right = 612, base = o.base || 286, X = (v) => left + (v - o.xmin) / (o.xmax - o.xmin) * (right - left);
    const r = o.r || 9, step = o.bin || (o.xmax - o.xmin) / 44, stacks = {};
    let s = `<svg viewBox="0 0 ${W} ${HH}" role="img" aria-label="${o.alt || "Diagrama de puntos de los datos"}">`;
    (o.bands || []).forEach((b) => {
      s += `<rect x="${X(b.from).toFixed(1)}" y="${b.y || 60}" width="${(X(b.to) - X(b.from)).toFixed(1)}" height="${base - (b.y || 60) + 12}" fill="${b.color}" fill-opacity=".14"/>`;
      if (b.text) s += `<text x="${((X(b.from) + X(b.to)) / 2).toFixed(1)}" y="${(b.y || 60) - 10}" text-anchor="middle" font-size="21" font-weight="700" fill="${b.color}">${b.text}</text>`;
    });
    [...data].sort((a, b) => a - b).forEach((v) => {
      const key = Math.round((v - o.xmin) / step); stacks[key] = (stacks[key] || 0) + 1;
      const color = o.colorFn ? o.colorFn(v) : K.verde;
      s += `<circle cx="${X(v).toFixed(1)}" cy="${base - r - (stacks[key] - 1) * (2 * r + 3)}" r="${r}" fill="${color}"/>`;
    });
    s += `<path d="M${left} ${base + 4}H${right}" stroke="${K.medio}" stroke-width="2"/>`;
    (o.ticks || []).forEach((t) => { s += `<path d="M${X(t).toFixed(1)} ${base + 4}v7" stroke="${K.medio}" stroke-width="2"/><text x="${X(t).toFixed(1)}" y="${base + 36}" text-anchor="middle" font-size="21" fill="${K.tinta}">${co(t, 0)}</text>`; });
    (o.marks || []).forEach((m, i) => {
      const y0 = m.y || 70 + i * 34;
      s += `<path d="M${X(m.x).toFixed(1)} ${y0 + 8}V${base + 4}" stroke="${m.color}" stroke-width="3.5"${m.dash ? ` stroke-dasharray="${m.dash}"` : ""}/>`;
      s += `<text x="${(X(m.x) + (m.anchor === "end" ? -8 : 8)).toFixed(1)}" y="${y0 + 6}" text-anchor="${m.anchor || "start"}" font-size="22" font-weight="700" fill="${m.color}" ${halo}>${m.text}</text>`;
    });
    s += `<text x="${(left + right) / 2}" y="${HH - 12}" text-anchor="middle" font-size="21" font-weight="700" fill="${K.tinta}">${o.xlabel || "resistencia, MPa"}</text></svg>`;
    return s + (o.note ? `<p class="fig-note">${o.note}</p>` : "");
  }

  function histograma(data, o) {
    const left = 56, right = 612, top = 44, bottom = 316, nb = Math.round((o.xmax - o.xmin) / o.width), counts = Array(nb).fill(0);
    data.forEach((v) => { const i = Math.min(nb - 1, Math.max(0, Math.floor((v - o.xmin) / o.width))); counts[i]++; });
    const max = Math.max(...counts), bw = (right - left) / nb;
    let s = `<svg viewBox="0 0 ${W} ${HH}" role="img" aria-label="${o.alt || "Histograma de los datos"}"><path d="M${left} ${top - 10}V${bottom}H${right}" fill="none" stroke="${K.medio}" stroke-width="2"/>`;
    counts.forEach((c, i) => {
      const h = c / max * (bottom - top - 26), x = left + i * bw;
      s += `<rect x="${(x + 1.5).toFixed(1)}" y="${(bottom - h).toFixed(1)}" width="${(bw - 3).toFixed(1)}" height="${h.toFixed(1)}" fill="${K.verde}"/>`;
      if (c) s += `<text x="${(x + bw / 2).toFixed(1)}" y="${(bottom - h - 9).toFixed(1)}" text-anchor="middle" font-size="21" font-weight="700" fill="${K.verde}">${c}</text>`;
    });
    for (let i = 0; i <= nb; i++) s += `<text x="${(left + i * bw).toFixed(1)}" y="${bottom + 30}" text-anchor="middle" font-size="21" fill="${K.tinta}">${co(o.xmin + i * o.width, 0)}</text>`;
    s += `<text x="${(left + right) / 2}" y="${HH - 12}" text-anchor="middle" font-size="21" font-weight="700" fill="${K.tinta}">${o.xlabel || "resistencia, MPa"}</text>`;
    s += `<text x="${left - 14}" y="${bottom}" font-size="19" fill="${K.medio}" transform="rotate(-90 ${left - 14} ${bottom})">frecuencia</text></svg>`;
    return s + (o.note ? `<p class="fig-note">${o.note}</p>` : "");
  }

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

  function caja(data, o) {
    const r = resumen(data), left = 40, right = 612, X = (v) => left + (v - o.xmin) / (o.xmax - o.xmin) * (right - left), y = 170, h = 90;
    const ric = r.q3 - r.q1, lower = r.q1 - 1.5 * ric, upper = r.q3 + 1.5 * ric;
    const inliers = r.x.filter((v) => v >= lower && v <= upper);
    const lowWhisker = inliers[0], highWhisker = inliers[inliers.length - 1];
    const outliers = r.x.filter((v) => v < lower || v > upper);
    const t = (v, text, color, dy) => `<text x="${X(v).toFixed(1)}" y="${dy}" text-anchor="middle" font-size="21" font-weight="700" fill="${color}" ${halo}>${text}</text>`;
    let s = `<svg viewBox="0 0 ${W} ${HH}" role="img" aria-label="Diagrama de caja: bigotes hasta el dato observado más extremo dentro de 1,5 veces el rango intercuartílico; ${outliers.length} valores atípicos">`;
    s += `<path d="M${X(lowWhisker).toFixed(1)} ${y + h / 2}H${X(r.q1).toFixed(1)}M${X(r.q3).toFixed(1)} ${y + h / 2}H${X(highWhisker).toFixed(1)}M${X(lowWhisker).toFixed(1)} ${y + 22}v${h - 44}M${X(highWhisker).toFixed(1)} ${y + 22}v${h - 44}" stroke="${K.tinta}" stroke-width="3" fill="none"/>`;
    outliers.forEach((v) => { s += `<circle cx="${X(v).toFixed(1)}" cy="${y + h / 2}" r="7" fill="none" stroke="${K.rojo}" stroke-width="3"/>`; });
    s += `<rect x="${X(r.q1).toFixed(1)}" y="${y}" width="${(X(r.q3) - X(r.q1)).toFixed(1)}" height="${h}" fill="${K.azul}" fill-opacity=".16" stroke="${K.azul}" stroke-width="3.5"/>`;
    s += `<path d="M${X(r.median).toFixed(1)} ${y}v${h}" stroke="${K.rojo}" stroke-width="5"/>`;
    s += t(lowWhisker, "bigote " + co(lowWhisker, 1), K.tinta, y + h + 38) + t(highWhisker, "bigote " + co(highWhisker, 1), K.tinta, y + h + 38);
    // Cuartiles en una sola fila sobre la caja; si se tocan, se separan y una línea fina señala su valor.
    const etiquetas = repartirEtiquetas([
      { x: X(r.q1), text: "Q₁ = " + co(r.q1, 1), color: K.azul },
      { x: X(r.median), text: "Q₂ = " + co(r.median, 1), color: K.rojo },
      { x: X(r.q3), text: "Q₃ = " + co(r.q3, 1), color: K.azul }
    ].map((e) => ({ ...e, w: e.text.length * 11.5 })), left, right, 14);
    etiquetas.forEach((e) => {
      if (Math.abs(e.cx - e.x) > 2) s += `<path d="M${e.cx.toFixed(1)} ${y - 30}L${e.x.toFixed(1)} ${y - 4}" stroke="${e.color}" stroke-width="1.5" fill="none"/>`;
      s += `<text x="${e.cx.toFixed(1)}" y="${y - 38}" text-anchor="middle" font-size="21" font-weight="700" fill="${e.color}">${e.text}</text>`;
    });
    s += `<path d="M${left} 330H${right}" stroke="${K.medio}" stroke-width="2"/>`;
    (o.ticks || []).forEach((v) => { s += `<text x="${X(v).toFixed(1)}" y="358" text-anchor="middle" font-size="21" fill="${K.tinta}">${co(v, 0)}</text>`; });
    s += `<text x="${(left + right) / 2}" y="${HH - 8}" text-anchor="middle" font-size="21" font-weight="700" fill="${K.tinta}">${o.xlabel || "resistencia, MPa"}</text></svg>`;
    return s + `<p class="fig-note">${o.note ? o.note + " " : ""}Los bigotes llegan a los datos extremos dentro de 1,5 RIC; los círculos señalan valores fuera de ese intervalo.</p>`;
  }

  /* Intervalo sobre una recta: {lo, hi, centro, xmin, xmax, ticks, ref:{x,text,color}} */
  function intervalo(o) {
    const left = 40, right = 612, X = (v) => left + (v - o.xmin) / (o.xmax - o.xmin) * (right - left), y = 190;
    let s = `<svg viewBox="0 0 ${W} 340" role="img" aria-label="${o.alt || "Intervalo de confianza sobre una recta"}">`;
    s += `<path d="M${left} ${y + 70}H${right}" stroke="${K.medio}" stroke-width="2"/>`;
    (o.ticks || []).forEach((v) => { s += `<path d="M${X(v).toFixed(1)} ${y + 70}v7" stroke="${K.medio}" stroke-width="2"/><text x="${X(v).toFixed(1)}" y="${y + 104}" text-anchor="middle" font-size="21" fill="${K.tinta}">${co(v, 0)}</text>`; });
    s += `<path d="M${X(o.lo).toFixed(1)} ${y}H${X(o.hi).toFixed(1)}M${X(o.lo).toFixed(1)} ${y - 18}v36M${X(o.hi).toFixed(1)} ${y - 18}v36" stroke="${K.azul}" stroke-width="6" fill="none"/>`;
    s += `<circle cx="${X(o.centro).toFixed(1)}" cy="${y}" r="11" fill="${K.verde}"/>`;
    s += `<text x="${X(o.centro).toFixed(1)}" y="${y - 34}" text-anchor="middle" font-size="24" font-weight="700" fill="${K.verde}">${o.centroText}</text>`;
    s += `<text x="${X(o.lo).toFixed(1)}" y="${y + 50}" text-anchor="middle" font-size="22" font-weight="700" fill="${K.azul}">${co(o.lo, o.dec === undefined ? 1 : o.dec)}</text><text x="${X(o.hi).toFixed(1)}" y="${y + 50}" text-anchor="middle" font-size="22" font-weight="700" fill="${K.azul}">${co(o.hi, o.dec === undefined ? 1 : o.dec)}</text>`;
    if (o.ref) s += `<path d="M${X(o.ref.x).toFixed(1)} 60V${y + 70}" stroke="${o.ref.color || K.rojo}" stroke-width="3" stroke-dasharray="9 6"/><text x="${(X(o.ref.x) + 8).toFixed(1)}" y="76" font-size="22" font-weight="700" fill="${o.ref.color || K.rojo}">${o.ref.text}</text>`;
    s += `<text x="${(left + right) / 2}" y="328" text-anchor="middle" font-size="21" font-weight="700" fill="${K.tinta}">${o.xlabel || "resistencia media, MPa"}</text></svg>`;
    return s + (o.note ? `<p class="fig-note">${o.note}</p>` : "");
  }

  /* Datos del hilo: 20 cilindros del mismo lote. Simulados para ilustrar; no son ensayos reales. */
  const CILINDROS = [22.9, 24.1, 24.8, 25.6, 26.0, 26.4, 26.9, 27.2, 27.5, 27.9, 28.2, 28.4, 28.9, 29.3, 29.8, 30.4, 30.9, 31.6, 32.5, 34.3];

  /* Ejemplo de clase con formato fijo:
     o.e  contexto del enunciado (sin las preguntas),
     o.d  datos: pares [símbolo y valor en KaTeX, significado], cada uno en su color,
     o.q  pregunta única (si no hay incisos),
     o.i  incisos, uno por renglón,
     o.p  pasos de la solución (cada uno aparece con →): primero la fórmula general, luego la sustitución.
     El motor pone el enunciado a la izquierda y los pasos a la derecha. */
  function ejemplo(o) {
    const datos = (o.d || []).length
      ? `<dl class="datos">${o.d.map(([sim, que]) => `<dt>\\(${sim}\\)</dt><dd>${que}</dd>`).join("")}</dl>` : "";
    const inc = (o.i || []).length ? `<ol class="incisos">${o.i.map((x) => `<li>${x}</li>`).join("")}</ol>` : "";
    const preg = o.q ? `<p class="pregunta">${o.q}</p>` : "";
    const enun = `<div class="enunciado"><p>${o.e}</p>${datos}${preg}${inc}</div>`;
    const pasos = `<ol class="pasos">${(o.p || []).map((x) => `<li>${x}</li>`).join("")}</ol>`;
    return { title: o.t, lead: o.lead, body: enun + pasos, figure: o.fig, notes: o.n, source: o.s, partir: o.partir };
  }

  /* Otra forma de resolver el mismo ejemplo: va como último paso, después del resultado.
     nombre: la idea en pocas palabras («complemento», «tabla», «calculadora»); texto: la ruta, corta. */
  function ruta(nombre, texto) {
    return `<div class="otra-ruta"><span class="ruta-tag">Otra ruta${nombre ? ` · ${nombre}` : ""}</span> ${texto}</div>`;
  }

  window.Fig = Object.freeze({ K, co, k, H, L: String.raw, ejemplo, ruta, lgamma, Phi, normal, tpdf, chi2pdf, tcdf, chi2cdf, zCrit, tCrit, chi2Crit, comb, simpson, resumen, curvas, puntos, histograma, caja, intervalo, CILINDROS });
}());

