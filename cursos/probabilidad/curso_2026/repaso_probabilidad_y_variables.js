/* Primera clase con el grupo: probabilidad y variables aleatorias (temas vistos con el profesor anterior).
   Orden y ejemplos tomados de los apuntes del docente (transcripción en fuentes/apuntes_profesor),
   con resultados verificados. Definiciones primero; luego ejemplos con la variable definida en el primer paso,
   la fórmula antes de sustituir y el mismo color para cada dato en el enunciado y en el cálculo.
   Colores: azul y ocre, datos; morado, otros datos; rojo, intersección o término que se resta; verde, resultado. */
(function () {
  "use strict";
  const F = window.Fig, K = F.K, L = F.L, k = F.k;

  const pasos = (lista) => `<ol class="pasos">${lista.map((x) => `<li>${x}</li>`).join("")}</ol>`;
  const ej = (o) => ({ title: o.t, lead: o.lead, body: `<div class="enunciado">${o.e}</div>` + pasos(o.p), figure: o.fig, notes: o.n, source: o.s });
  const AP = "Ejemplo de los apuntes del docente.";
  const AW = "Ejemplo de los apuntes del docente (Walpole et al.).";

  /* ---------- Figuras ---------- */
  function vennNumeros(a, ab, b, fuera, la, lb, total) {
    return `<svg viewBox="0 0 560 330" role="img" aria-label="Diagrama de Venn con ${la} y ${lb}">
      <rect x="10" y="10" width="540" height="300" fill="#fff" stroke="${K.medio}" stroke-width="2"/>
      <text x="28" y="44" font-size="24" font-weight="700" fill="${K.medio}">S (${total})</text>
      <circle cx="215" cy="170" r="115" fill="${K.azul}" fill-opacity=".12" stroke="${K.azul}" stroke-width="3.5"/>
      <circle cx="345" cy="170" r="115" fill="${K.ocre}" fill-opacity=".12" stroke="${K.ocre}" stroke-width="3.5"/>
      <text x="150" y="98" font-size="26" font-weight="700" fill="${K.azul}">${la}</text>
      <text x="395" y="98" font-size="26" font-weight="700" fill="${K.ocre}">${lb}</text>
      <text x="160" y="180" text-anchor="middle" font-size="34" font-weight="700" fill="${K.azul}">${a}</text>
      <text x="280" y="180" text-anchor="middle" font-size="34" font-weight="700" fill="${K.rojo}">${ab}</text>
      <text x="400" y="180" text-anchor="middle" font-size="34" font-weight="700" fill="${K.ocre}">${b}</text>
      <text x="505" y="292" text-anchor="end" font-size="30" font-weight="700" fill="${K.medio}">${fuera}</text>
    </svg>`;
  }

  function arbolMaquinas() {
    const ramas = [["A", "0,10", "0,01", 70], ["B", "0,30", "0,03", 170], ["C", "0,60", "0,05", 270]];
    let s = `<svg viewBox="0 0 560 340" role="img" aria-label="Árbol de probabilidad de tres máquinas y piezas defectuosas">`;
    ramas.forEach(([m, pm, pd, y]) => {
      s += `<line x1="40" y1="170" x2="200" y2="${y}" stroke="${K.azul}" stroke-width="3"/>`;
      s += `<text x="${110}" y="${(170 + y) / 2 - 8}" font-size="21" font-weight="700" fill="${K.azul}">${pm}</text>`;
      s += `<circle cx="215" cy="${y}" r="20" fill="#fff" stroke="${K.azul}" stroke-width="3"/><text x="215" y="${y + 8}" text-anchor="middle" font-size="22" font-weight="700" fill="${K.azul}">${m}</text>`;
      s += `<line x1="235" y1="${y}" x2="380" y2="${y - 24}" stroke="${K.ocre}" stroke-width="3"/><text x="300" y="${y - 22}" font-size="20" font-weight="700" fill="${K.ocre}">${pd}</text>`;
      s += `<text x="392" y="${y - 17}" font-size="22" font-weight="700" fill="${K.ocre}">D</text>`;
      s += `<line x1="235" y1="${y}" x2="380" y2="${y + 24}" stroke="${K.gris}" stroke-width="2.5"/><text x="392" y="${y + 32}" font-size="22" fill="${K.medio}">D′</text>`;
    });
    s += `<circle cx="40" cy="170" r="7" fill="${K.tinta}"/></svg>`;
    return s;
  }

  // Variable aleatoria: S → ℝ; función de probabilidad: valores → [0, 1].
  function figVA() {
    const S = [["cc", 70], ["cs", 130], ["sc", 190], ["ss", 250]];
    const X = { cc: 2, cs: 1, sc: 1, ss: 0 }, yv = { 0: 250, 1: 160, 2: 70 }, pv = { 0: "1/4", 1: "1/2", 2: "1/4" };
    let s = `<svg viewBox="0 0 640 330" role="img" aria-label="Variable aleatoria como función del espacio muestral a los reales, y función de probabilidad de los reales a cero uno">`;
    s += `<ellipse cx="90" cy="160" rx="66" ry="138" fill="none" stroke="${K.medio}" stroke-width="2.5"/><text x="90" y="16" text-anchor="middle" font-size="22" font-weight="700" fill="${K.medio}">S</text>`;
    s += `<line x1="320" y1="40" x2="320" y2="290" stroke="${K.azul}" stroke-width="2.5"/><text x="320" y="20" text-anchor="middle" font-size="22" font-weight="700" fill="${K.azul}">ℝ</text>`;
    s += `<line x1="545" y1="40" x2="545" y2="290" stroke="${K.verde}" stroke-width="2.5"/><text x="545" y="20" text-anchor="middle" font-size="22" font-weight="700" fill="${K.verde}">[0, 1]</text>`;
    S.forEach(([o, y]) => {
      s += `<text x="90" y="${y + 8}" text-anchor="middle" font-size="24" fill="${K.tinta}">${o}</text>`;
      s += `<line x1="118" y1="${y}" x2="306" y2="${yv[X[o]]}" stroke="${K.azul}" stroke-width="2" marker-end="url(#fl)"/>`;
    });
    [0, 1, 2].forEach((v) => {
      s += `<circle cx="320" cy="${yv[v]}" r="6" fill="${K.azul}"/><text x="300" y="${yv[v] + 8}" text-anchor="end" font-size="24" font-weight="700" fill="${K.azul}">${v}</text>`;
      s += `<line x1="334" y1="${yv[v]}" x2="531" y2="${yv[v]}" stroke="${K.verde}" stroke-width="2" marker-end="url(#fl2)"/>`;
      s += `<text x="560" y="${yv[v] + 8}" font-size="22" font-weight="700" fill="${K.verde}">${pv[v]}</text>`;
    });
    s += `<text x="212" y="318" text-anchor="middle" font-size="22" font-weight="700" fill="${K.azul}">X</text><text x="432" y="318" text-anchor="middle" font-size="22" font-weight="700" fill="${K.verde}">p(x)</text>`;
    s += `<defs><marker id="fl" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="${K.azul}"/></marker><marker id="fl2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="${K.verde}"/></marker></defs>`;
    return s + `</svg>`;
  }

  // Gráfica de una densidad con área sombreada entre a y b.
  function figDensidad(f, x0, x1, y1, a, b, ticks, etiqueta) {
    const W = 560, H = 300, L0 = 50, B0 = 260, sx = (x) => L0 + (x - x0) / (x1 - x0) * (W - 70), sy = (y) => B0 - y / y1 * 220;
    let curva = "", area = `M${sx(a).toFixed(1)} ${B0}`;
    for (let i = 0; i <= 300; i++) {
      const x = x0 + (x1 - x0) * i / 300, y = f(x);
      curva += (i ? "L" : "M") + sx(x).toFixed(1) + " " + sy(y).toFixed(1);
      if (x >= a && x <= b) area += `L${sx(x).toFixed(1)} ${sy(y).toFixed(1)}`;
    }
    area += `L${sx(b).toFixed(1)} ${B0}Z`;
    let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${etiqueta}">`;
    s += `<path d="${area}" fill="${K.verde}" fill-opacity=".3"/>`;
    s += `<line x1="${L0 - 10}" y1="${B0}" x2="${W - 10}" y2="${B0}" stroke="${K.medio}" stroke-width="2"/>`;
    s += `<path d="${curva}" fill="none" stroke="${K.azul}" stroke-width="4"/>`;
    ticks.forEach((t) => { s += `<line x1="${sx(t)}" y1="${B0}" x2="${sx(t)}" y2="${B0 + 8}" stroke="${K.medio}" stroke-width="2"/><text x="${sx(t)}" y="${B0 + 32}" text-anchor="middle" font-size="22" fill="${K.tinta}">${String(t).replace(".", ",").replace("-", "−")}</text>`; });
    s += `<text x="${W - 14}" y="${B0 - 10}" text-anchor="end" font-size="22" font-style="italic" fill="${K.medio}">x</text>`;
    return s + `</svg>`;
  }

  function barras(xs, ps, etiquetas, titulo) {
    const W = 520, H = 300, B0 = 250, w = 70, gap = (W - 80) / xs.length, mx = Math.max(...ps);
    let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${titulo}">`;
    s += `<line x1="30" y1="${B0}" x2="${W - 10}" y2="${B0}" stroke="${K.medio}" stroke-width="2"/>`;
    xs.forEach((x, i) => {
      const h = ps[i] / mx * 190, cx = 60 + gap * i + gap / 2;
      s += `<rect x="${cx - w / 2}" y="${B0 - h}" width="${w}" height="${h}" fill="${K.azul}" fill-opacity=".75"/>`;
      s += `<text x="${cx}" y="${B0 - h - 10}" text-anchor="middle" font-size="22" font-weight="700" fill="${K.verde}">${etiquetas[i]}</text>`;
      s += `<text x="${cx}" y="${B0 + 30}" text-anchor="middle" font-size="24" font-weight="700" fill="${K.azul}">${x}</text>`;
    });
    return s + `</svg>`;
  }

  /* ---------- Contenido ---------- */
  window.COURSE = {
    id: "repaso_probabilidad_y_variables",
    title: "Probabilidad y variables aleatorias",
    shortTitle: "Probabilidad y variables aleatorias",
    modules: [
      {
        id: "probabilidad",
        title: "Probabilidad",
        slides: [
          {
            id: "pv-1",
            title: "Espacio muestral y eventos",
            lead: L`El espacio muestral S reúne todos los resultados posibles de un experimento; un evento es un subconjunto de S.`,
            body: L`<p><strong>Experimento:</strong> proceso cuyo resultado no se conoce con certeza antes de realizarlo.</p><p><strong>Espacio muestral</strong> \(S\): conjunto de todos los resultados posibles. Puede ser discreto (finito o contable) o continuo (un intervalo).</p><p><strong>Operaciones:</strong> ${k("azul", "unión")} \(A\cup B\), ${k("verde", "intersección")} \(A\cap B\), complemento \(A'\), diferencia \(A-B=A\cap B'\). Si \(A\cap B=\varnothing\), los eventos son <strong>mutuamente excluyentes</strong>.</p>`,
            visual: "venn_ops",
            source: "Apuntes del docente; Walpole et al.",
            abajo: [
              ej({
                t: "Ejemplo: eventos al lanzar un dado",
                e: L`Se lanza un dado. Sean ${k("azul", "A")} = «sale par» y ${k("ocre", "B")} = «sale impar». Escriba \(S\), \(A\), \(B\), \(A\cup B\) y \(A\cap B\). ¿Son excluyentes?`,
                p: [
                  L`<strong>Espacio muestral:</strong> \(S=\{1,2,3,4,5,6\}\).`,
                  L`<strong>Eventos:</strong> \(\azul{A}=\{2,4,6\}\) y \(\ocre{B}=\{1,3,5\}\).`,
                  L`<strong>Unión:</strong> \(\azul{A}\cup\ocre{B}=\{1,2,3,4,5,6\}=S\).`,
                  L`<strong>Intersección:</strong> \(\azul{A}\cap\ocre{B}=\varnothing\): ningún número es par e impar a la vez, así que \(A\) y \(B\) son <strong>mutuamente excluyentes</strong>.`
                ],
                n: "",
                s: AP
              }),
              ej({
                t: "Ejemplo: espacio muestral de dos lanzamientos",
                e: L`Se lanza una moneda dos veces (c = cara, s = sello). Escriba \(S\) y el evento ${k("azul", "A")} = «al menos una cara».`,
                p: [
                  L`<strong>Cada lanzamiento</strong> tiene dos resultados; por el principio multiplicativo hay \(2\times2=4\) resultados.`,
                  L`<strong>Espacio muestral:</strong> \(S=\{cc,\ cs,\ sc,\ ss\}\). El orden importa: \(cs\) y \(sc\) son resultados distintos.`,
                  L`<strong>Evento:</strong> \(\azul{A}=\{cc,\ cs,\ sc\}\); su complemento es \(A'=\{ss\}\), «ninguna cara».`
                ],
                n: "",
                s: AP
              })
            ]
          },
          {
            id: "pv-2",
            title: "Axiomas de probabilidad",
            lead: L`Tres reglas básicas; las demás propiedades se deducen de ellas.`,
            body: L`<p><strong>Axiomas.</strong> (1) \(P(A)\ge 0\). (2) \(P(S)=1\). (3) Si \(A\cap B=\varnothing\), \(P(A\cup B)=P(A)+P(B)\).</p><p><strong>Consecuencias:</strong> \(P(\varnothing)=0\); \(0\le P(A)\le 1\); \(P(A')=1-P(A)\).</p><p><strong>Resultados igualmente probables:</strong> \(P(A)=\dfrac{\text{casos favorables}}{\text{casos posibles}}=\dfrac{n(A)}{n(S)}\).</p>`,
            formula: L`P(\azul{A}\cup\ocre{B})=P(\azul{A})+P(\ocre{B})-P(\rojo{A\cap B})`,
            lectura: L`Al sumar \(P(A)+P(B)\) la ${k("rojo", "intersección")} se cuenta dos veces; por eso se resta una vez.`,
            visual: "venn_prob",
            source: "Apuntes del docente; Hayter.",
            abajo: [
              ej({
                t: "Ejemplo: par o divisible por 3",
                e: L`Se lanza un dado. ¿Cuál es la probabilidad de que salga un número ${k("azul", "par")} o ${k("ocre", "divisible por 3")}?`,
                p: [
                  L`<strong>Eventos:</strong> \(\azul{A}=\{2,4,6\}\), \(\ocre{B}=\{3,6\}\) y \(\rojo{A\cap B}=\{6\}\).`,
                  L`<strong>Probabilidades</strong> (6 resultados igualmente probables): \(P(\azul{A})=\frac{\azul{3}}{6}\), \(P(\ocre{B})=\frac{\ocre{2}}{6}\), \(P(\rojo{A\cap B})=\frac{\rojo{1}}{6}\).`,
                  L`<strong>Regla de la suma:</strong> \[\begin{aligned} P(\azul{A}\cup\ocre{B})&=P(\azul{A})+P(\ocre{B})-P(\rojo{A\cap B})\\ &=\frac{\azul{3}}{6}+\frac{\ocre{2}}{6}-\frac{\rojo{1}}{6}=\verde{\frac{4}{6}=\frac{2}{3}} \end{aligned}\]`,
                  L`<strong>Comprobación:</strong> \(A\cup B=\{2,3,4,6\}\) tiene 4 elementos de 6.`
                ],
                n: "",
                s: AP
              }),
              ej({
                t: "Ejemplo: aumentos y promociones en una compañía",
                e: L`Una compañía tiene ${k("medio", "350")} empleados: ${k("azul", "160")} recibieron aumento, ${k("ocre", "100")} fueron promovidos y ${k("rojo", "60")} recibieron ambos. ¿Cuántos recibieron aumento sin promoción, promoción sin aumento y ninguno de los dos?`,
                p: [
                  L`<strong>Eventos:</strong> \(\azul{A}\) = «recibió aumento», \(\ocre{P}\) = «fue promovido». Se llena el diagrama desde el centro.`,
                  L`<strong>Centro:</strong> \(n(\rojo{A\cap P})=\rojo{60}\).`,
                  L`<strong>Aumento sin promoción:</strong> \(n(A\cap P')=\azul{160}-\rojo{60}=100\).`,
                  L`<strong>Promoción sin aumento:</strong> \(n(A'\cap P)=\ocre{100}-\rojo{60}=40\).`,
                  L`<strong>Ninguno:</strong> \(n(A'\cap P')=350-(100+\rojo{60}+40)=\verde{150}\). Como probabilidad: \(P(A'\cap P')=\dfrac{150}{350}=0{,}43\).`
                ],
                fig: vennNumeros(100, 60, 40, 150, "A", "P", 350),
                n: "",
                s: AP
              })
            ]
          },
          {
            id: "pv-3",
            title: "Técnicas de conteo",
            lead: L`Permiten contar los casos posibles sin escribirlos uno por uno.`,
            body: L`<p><strong>Principio multiplicativo:</strong> si una operación tiene \(n_1\) formas, la siguiente \(n_2\), …, el total es \(n_1\,n_2\cdots n_k\). Con repetición y orden: \(n^r\).</p><p><strong>Permutaciones</strong> (importa el orden) y <strong>combinaciones</strong> (no importa), con la notación de la calculadora:</p>`,
            formula: L`{}_{\azul{n}}P_{\ocre{r}}=\frac{\azul{n}!}{(\azul{n}-\ocre{r})!}\qquad\qquad {}_{\azul{n}}C_{\ocre{r}}=\binom{\azul{n}}{\ocre{r}}=\frac{{}_{\azul{n}}P_{\ocre{r}}}{\ocre{r}!}=\frac{\azul{n}!}{\ocre{r}!\,(\azul{n}-\ocre{r})!}`,
            lectura: L`Cada grupo de ${k("ocre", "r")} elementos aparece en \(r!\) órdenes distintos; por eso la combinación divide la permutación entre \(r!\).`,
            visual: "conteo",
            codigo: { python: "scipy.special.perm(n, r), scipy.special.comb(n, r)", excel: "=PERMUTACIONES(n;r), =COMBINAT(n;r)" },
            source: "Apuntes del docente; Hayter; Walpole et al.",
            abajo: [
              ej({
                t: "Ejemplo: diez personas y un banco de cuatro puestos",
                e: L`¿De cuántas formas pueden sentarse ${k("azul", "10")} personas en un banco de ${k("ocre", "4")} puestos?`,
                p: [
                  L`<strong>¿Importa el orden?</strong> Sí: cambiar de puesto da una disposición distinta. Es una permutación.`,
                  L`<strong>Fórmula y sustitución:</strong> \[\begin{aligned} {}_{\azul{n}}P_{\ocre{r}}&=\frac{\azul{n}!}{(\azul{n}-\ocre{r})!}\\ {}_{\azul{10}}P_{\ocre{4}}&=\frac{\azul{10}!}{(\azul{10}-\ocre{4})!}=\frac{10!}{6!}=10\cdot9\cdot8\cdot7=\verde{5040} \end{aligned}\]`
                ],
                n: "",
                s: AP
              }),
              ej({
                t: "Ejemplo: comisión de matemáticos y físicos",
                e: L`Se forma una comisión de ${k("azul", "2")} matemáticos elegidos entre ${k("azul", "5")} y ${k("ocre", "3")} físicos elegidos entre ${k("ocre", "7")}. ¿Cuántas comisiones hay si a) no hay restricciones; b) un físico determinado debe estar; c) dos matemáticos determinados no pueden estar?`,
                p: [
                  L`<strong>¿Importa el orden?</strong> No: es una comisión. Se usan combinaciones y se multiplica por etapas.`,
                  L`<strong>a)</strong> \(\binom{\azul{5}}{\azul{2}}\binom{\ocre{7}}{\ocre{3}}=10\cdot35=\verde{350}\).`,
                  L`<strong>b)</strong> El físico fijo ya está; faltan 2 físicos de los 6 restantes: \(\binom{\azul{5}}{\azul{2}}\binom{6}{2}=10\cdot15=\verde{150}\).`,
                  L`<strong>c)</strong> Los 2 matemáticos se eligen entre los 3 permitidos: \(\binom{3}{2}\binom{\ocre{7}}{\ocre{3}}=3\cdot35=\verde{105}\).`
                ],
                n: "",
                s: AP
              }),
              ej({
                t: "Ejemplo: tres canicas de una caja",
                e: L`Una caja tiene ${k("rojo", "8")} canicas rojas, ${k("azul", "3")} blancas y ${k("ocre", "9")} azules (20 en total). Se sacan 3 al azar. Halle la probabilidad de a) dos rojas y una blanca; b) al menos una blanca; c) una de cada color.`,
                p: [
                  L`<strong>Casos posibles:</strong> \(n(S)=\binom{20}{3}=1140\).`,
                  L`<strong>a)</strong> \[P=\frac{\binom{\rojo{8}}{2}\binom{\azul{3}}{1}}{\binom{20}{3}}=\frac{28\cdot3}{1140}=\verde{0{,}0737}\]`,
                  L`<strong>b) Por el complemento</strong> («ninguna blanca»: las 3 entre las 17 no blancas): \[P=1-\frac{\binom{17}{3}}{\binom{20}{3}}=1-\frac{680}{1140}=\verde{0{,}4035}\]`,
                  L`<strong>c)</strong> \[P=\frac{\binom{\rojo{8}}{1}\binom{\azul{3}}{1}\binom{\ocre{9}}{1}}{\binom{20}{3}}=\frac{216}{1140}=\verde{0{,}1895}\]`
                ],
                n: "",
                s: AP
              })
            ]
          },
          {
            id: "pv-4",
            title: "Probabilidad condicional e independencia",
            lead: L`Saber que ocurrió B reduce el espacio muestral a B.`,
            body: L`<p><strong>Probabilidad condicional</strong> de A dado B, con \(P(B)&gt;0\):</p>`,
            formula: L`P(\verde{A}\mid\azul{B})=\frac{P(\verde{A}\cap\azul{B})}{P(\azul{B})}\qquad P(A\cap B)=P(B)\,P(A\mid B)\qquad \text{independientes: } P(A\cap B)=P(A)\,P(B)`,
            lectura: L`<strong>Excluyentes:</strong> no pueden ocurrir a la vez. <strong>Independientes:</strong> que ocurra uno no cambia la probabilidad del otro. Dos eventos excluyentes con probabilidad positiva nunca son independientes.`,
            visual: "venn_prob",
            source: "Apuntes del docente; Walpole et al.",
            abajo: [
              ej({
                t: "Ejemplo: empleo por sexo en una ciudad",
                e: L`Los adultos de una ciudad pequeña que terminaron la secundaria se clasifican así:<table class="tabla-num" style="width:auto;margin:.4em 0"><tr><th></th><th>Empleado</th><th>Desempleado</th><th>Total</th></tr><tr><td>Hombre</td><td>${k("azul", "460")}</td><td>40</td><td>500</td></tr><tr><td>Mujer</td><td>140</td><td>${k("ocre", "260")}</td><td>${k("ocre", "400")}</td></tr><tr><td>Total</td><td>${k("azul", "600")}</td><td>300</td><td>900</td></tr></table>Se elige uno al azar. Halle \(P(H\mid E)\) y \(P(D\mid M)\).`,
                p: [
                  L`<strong>Eventos:</strong> \(H\) = hombre, \(M\) = mujer, \(E\) = empleado, \(D\) = desempleado.`,
                  L`<strong>Hombre, dado que está empleado:</strong> el espacio se reduce a los 600 empleados: \[P(H\mid E)=\frac{P(H\cap E)}{P(E)}=\frac{\frac{\azul{460}}{900}}{\frac{\azul{600}}{900}}=\frac{\azul{460}}{\azul{600}}=\verde{\frac{23}{30}\approx0{,}767}\]`,
                  L`<strong>Desempleada, dado que es mujer:</strong> \[P(D\mid M)=\frac{\ocre{260}}{\ocre{400}}=\verde{0{,}65}\]`
                ],
                n: "",
                s: AW
              }),
              ej({
                t: "Ejemplo: dos monedas falsas en una caja",
                e: L`Una caja tiene ${k("azul", "10")} monedas, de las cuales ${k("ocre", "2")} son falsas. Se sacan dos, una tras otra, sin reemplazo. ¿Cuál es la probabilidad de que ambas sean falsas?`,
                p: [
                  L`<strong>Eventos:</strong> \(F_1\) = la primera es falsa, \(F_2\) = la segunda es falsa.`,
                  L`<strong>Regla de la multiplicación:</strong> \[\begin{aligned} P(F_1\cap F_2)&=P(F_1)\,P(F_2\mid F_1)\\ &=\frac{\ocre{2}}{\azul{10}}\cdot\frac{1}{9}=\verde{\frac{1}{45}\approx0{,}022} \end{aligned}\]`,
                  L`<strong>Por qué \(\tfrac19\):</strong> tras sacar una falsa quedan 9 monedas y solo 1 falsa. Sin reemplazo, las extracciones no son independientes.`
                ],
                n: "",
                s: AP
              }),
              ej({
                t: "Ejemplo: carro de bomberos y ambulancia",
                e: L`Un pueblo tiene un carro de bomberos y una ambulancia. El carro está disponible con probabilidad ${k("azul", "0,98")} y la ambulancia con ${k("ocre", "0,92")}, de forma independiente. Si hay un incendio con heridos, ¿cuál es la probabilidad de que ambos estén disponibles?`,
                p: [
                  L`<strong>Eventos:</strong> \(\azul{B}\) = carro disponible, \(\ocre{A}\) = ambulancia disponible.`,
                  L`<strong>Independencia:</strong> \[\begin{aligned} P(\azul{B}\cap\ocre{A})&=P(\azul{B})\,P(\ocre{A})\\ &=\azul{0{,}98}\times\ocre{0{,}92}=\verde{0{,}9016} \end{aligned}\]`
                ],
                n: "",
                s: AW
              })
            ]
          },
          {
            id: "pv-5",
            visual: "bayes_tres",
            title: "Probabilidad total y teorema de Bayes",
            lead: L`Probabilidad total cuando se pregunta por el efecto; Bayes cuando se pregunta por la causa.`,
            body: L`<p>Si \(A_1,\dots,A_k\) forman una partición de \(S\) (excluyentes y cubren todo S) y \(D\) es un evento:</p>`,
            formula: L`P(\ocre{D})=\sum_{i=1}^{k}P(\azul{A_i})\,P(\ocre{D}\mid\azul{A_i})\qquad\qquad P(\azul{A_i}\mid\ocre{D})=\frac{P(\azul{A_i})\,P(\ocre{D}\mid\azul{A_i})}{P(\ocre{D})}`,
            lectura: L`En el árbol, la ${k("azul", "causa")} va en la primera rama y el ${k("ocre", "efecto")} en la segunda. Bayes divide una sola rama entre la suma de todas las ramas que llevan al efecto.`,
            source: "Apuntes del docente; Hayter.",
            abajo: [
              ej({
                t: "Ejemplo: tres máquinas y piezas defectuosas",
                e: L`Las máquinas A, B y C producen el ${k("azul", "10&nbsp;%")}, el ${k("azul", "30&nbsp;%")} y el ${k("azul", "60&nbsp;%")} de las piezas de una fábrica; sus porcentajes de piezas defectuosas son ${k("ocre", "1&nbsp;%")}, ${k("ocre", "3&nbsp;%")} y ${k("ocre", "5&nbsp;%")}. a) ¿Qué probabilidad hay de que una pieza al azar sea defectuosa? b) Si una pieza resultó defectuosa, ¿qué probabilidad hay de que la haya producido A?`,
                p: [
                  L`<strong>Eventos:</strong> \(A, B, C\) = máquina que produjo la pieza (causa); \(D\) = la pieza es defectuosa (efecto).`,
                  L`<strong>a) Se pregunta por el efecto: probabilidad total.</strong> \[\begin{aligned} P(D)&=P(A)P(D\mid A)+P(B)P(D\mid B)+P(C)P(D\mid C)\\ &=\azul{0{,}10}(\ocre{0{,}01})+\azul{0{,}30}(\ocre{0{,}03})+\azul{0{,}60}(\ocre{0{,}05})\\ &=0{,}001+0{,}009+0{,}030=\verde{0{,}04} \end{aligned}\]`,
                  L`<strong>b) Se pregunta por la causa: Bayes.</strong> \[P(A\mid D)=\frac{P(A)\,P(D\mid A)}{P(D)}=\frac{\azul{0{,}10}(\ocre{0{,}01})}{0{,}04}=\frac{0{,}001}{0{,}04}=\verde{0{,}025}\]`
                ],
                fig: arbolMaquinas(),
                n: "",
                s: AP
              })
            ]
          }
        ]
      },
      {
        id: "variables",
        title: "Variables aleatorias",
        slides: [
          {
            id: "pv-6",
            title: "Variable aleatoria, función de probabilidad y función de densidad",
            lead: L`Una variable aleatoria asigna un número real a cada resultado; la función de probabilidad asigna a cada número su probabilidad.`,
            body: L`<p><strong>Variable aleatoria</strong> \(X: S\to\mathbb{R}\). Se escribe con mayúscula (\(X\)) y sus valores con minúscula (\(x\)).</p><p><strong>Discreta:</strong> función de probabilidad \(p(x)=P(X=x)\), de \(\mathbb{R}\) en \([0,1]\).</p><p><strong>Continua:</strong> función de densidad \(f(x)\ge0\), de \(\mathbb{R}\) en \([0,\infty)\). La probabilidad es el área bajo \(f\), no el valor \(f(x)\).</p>`,
            figure: figVA(),
            source: "Apuntes del docente; Hayter."
          },
          {
            id: "pv-7",
            title: "Función de probabilidad y función de distribución acumulada",
            lead: L`Variables discretas: \(p(x)\) da la probabilidad de cada valor y \(F(x)\) acumula hasta \(x\).`,
            body: L`<p>\(p(x)\ge0\) y \(\sum_x p(x)=1\).</p><p>\(F(x)=P(X\le x)=\sum_{t\le x}p(t)\): es escalonada, no decrece, va de 0 a 1.</p><p>Para valores enteros: \(P(a\le X\le b)=F(b)-F(a-1)\).</p>`,
            formula: L`F(\azul{x})=P(X\le\azul{x})=\sum_{t\le \azul{x}}p(t)`,
            source: "Apuntes del docente; Walpole et al.",
            abajo: [
              ej({
                t: "Ejemplo: número de caras en tres lanzamientos",
                e: L`Se lanza una moneda tres veces. Sea ${k("azul", "X")} el número de caras. Halle \(p(x)\), \(F(x)\) y \(P(X&gt;1)\).`,
                p: [
                  L`<strong>Variable:</strong> \(\azul{X}\) = número de caras; valores posibles 0, 1, 2, 3.`,
                  L`<strong>Espacio muestral:</strong> \(2^3=8\) resultados igualmente probables: ccc, ccs, csc, scc, css, scs, ssc, sss.`,
                  L`<strong>Contar:</strong> \(p(0)=\frac18,\ p(1)=\frac38,\ p(2)=\frac38,\ p(3)=\frac18\). Suman 1.`,
                  L`<strong>Acumulada:</strong> \(F(0)=\frac18,\ F(1)=\frac48=\frac12,\ F(2)=\frac78,\ F(3)=1\).`,
                  L`<strong>Pregunta:</strong> \(P(X&gt;1)=1-F(1)=1-\dfrac12=\verde{\dfrac12}\).`
                ],
                fig: barras([0, 1, 2, 3], [1, 3, 3, 1], ["1/8", "3/8", "3/8", "1/8"], "Función de probabilidad del número de caras en tres lanzamientos"),
                n: "",
                s: AP
              }),
              ej({
                t: "Ejemplo: computadores defectuosos en un pedido",
                e: L`Un envío de ${k("medio", "8")} computadores contiene ${k("ocre", "3")} defectuosos. Una escuela compra ${k("azul", "2")} al azar. Sea \(X\) el número de defectuosos comprados. Halle la función de probabilidad de \(X\).`,
                p: [
                  L`<strong>Variable:</strong> \(X\) = defectuosos entre los 2 comprados; valores 0, 1, 2.`,
                  L`<strong>Casos posibles:</strong> \(\binom{8}{\azul{2}}=28\).`,
                  L`<strong>Fórmula:</strong> se eligen \(x\) de los 3 defectuosos y \(2-x\) de los 5 buenos: \[p(x)=\frac{\binom{\ocre{3}}{x}\binom{5}{\azul{2}-x}}{\binom{8}{\azul{2}}}\]`,
                  L`<strong>Valores:</strong> \(p(0)=\frac{1\cdot10}{28}=\frac{10}{28}\), \(p(1)=\frac{3\cdot5}{28}=\frac{15}{28}\), \(p(2)=\frac{3\cdot1}{28}=\frac{3}{28}\). Suman \(\frac{28}{28}=1\).`
                ],
                n: "",
                s: AW
              })
            ]
          },
          {
            id: "pv-8",
            title: "Función de densidad",
            lead: L`Variables continuas: la probabilidad de un intervalo es el área bajo la curva; \(P(X=a)=0\).`,
            body: L`<p>\(f(x)\ge0\) y \(\int_{-\infty}^{\infty}f(x)\,dx=1\).</p><p>\(P(a&lt;X&lt;b)=\int_a^b f(x)\,dx\). No importa si la desigualdad incluye el igual.</p><p>Acumulada: \(F(x)=\int_{-\infty}^{x}f(t)\,dt\), y \(P(a&lt;X\le b)=F(b)-F(a)\).</p>`,
            formula: L`P(\azul{a}<X<\azul{b})=\int_{\azul{a}}^{\azul{b}}f(x)\,dx=F(\azul{b})-F(\azul{a})`,
            visual: "densidad",
            source: "Apuntes del docente; Walpole et al.",
            abajo: [
              ej({
                t: "Ejemplo: error en la temperatura de una reacción",
                e: L`El error \(X\) (en °C) en la temperatura de un experimento de laboratorio tiene densidad \(f(x)=\dfrac{x^2}{3}\) para \(-1&lt;x&lt;2\) y \(f(x)=0\) en otro caso. a) Verifique que el área total es 1. b) Halle \(P(0&lt;X\le1)\).`,
                p: [
                  L`<strong>Variable:</strong> \(X\) = error de temperatura en °C.`,
                  L`<strong>a) Área total:</strong> se parte la recta donde cambia la fórmula de \(f\): \[\int_{-\infty}^{\infty}f(x)\,dx=\underbrace{\int_{-\infty}^{-1}0\,dx}_{0}+\int_{-1}^{2}\frac{x^2}{3}\,dx+\underbrace{\int_{2}^{\infty}0\,dx}_{0}\]`,
                  L`Solo queda el intervalo donde \(f\) no es cero: \[\int_{-1}^{2}\frac{x^2}{3}\,dx=\left.\frac{x^3}{9}\right|_{-1}^{2}=\frac{8}{9}-\frac{-1}{9}=\frac{9}{9}=\verde{1}\]`,
                  L`<strong>b)</strong> \[P(0&lt;X\le1)=\int_{0}^{1}\frac{x^2}{3}\,dx=\left.\frac{x^3}{9}\right|_{0}^{1}=\frac19-0=\verde{\frac19}\]`
                ],
                fig: figDensidad((x) => (x > -1 && x < 2 ? x * x / 3 : 0), -1.5, 2.5, 1.45, 0, 1, [-1, 0, 1, 2], "Densidad x²/3 entre −1 y 2 con el área entre 0 y 1 sombreada"),
                n: "",
                s: AW
              }),
              ej({
                t: "Ejemplo: la acumulada de la misma densidad",
                e: L`Para el error de temperatura con \(f(x)=\dfrac{x^2}{3}\) en \(-1&lt;x&lt;2\), halle \(F(x)\) y úsela para calcular de nuevo \(P(0&lt;X\le1)\).`,
                p: [
                  L`<strong>Para \(x\le-1\):</strong> no hay área a la izquierda, \(F(x)=0\).`,
                  L`<strong>Para \(-1&lt;x&lt;2\):</strong> \[F(x)=\int_{-\infty}^{-1}0\,dt+\int_{-1}^{x}\frac{t^2}{3}\,dt=\left.\frac{t^3}{9}\right|_{-1}^{x}=\frac{x^3+1}{9}\]`,
                  L`<strong>Para \(x\ge2\):</strong> ya se acumuló toda el área, \(F(x)=1\).`,
                  L`<strong>Probabilidad:</strong> \[P(0&lt;X\le1)=F(1)-F(0)=\frac{2}{9}-\frac{1}{9}=\verde{\frac19}\]`
                ],
                n: "",
                s: AW
              }),
              ej({
                t: "Ejemplo: demanda semanal de un proveedor de combustible",
                e: L`Un proveedor llena cada semana un tanque de 200 galones. La demanda semanal \(X\), en cientos de galones, tiene densidad \(f(x)=x\) si \(0\le x\le1\), \(f(x)=\tfrac12\) si \(1&lt;x\le2\) y \(0\) en otro caso. Halle \(F(x)\) y la probabilidad de que la demanda supere 150 galones.`,
                p: [
                  L`<strong>Variable:</strong> \(X\) = demanda semanal en cientos de galones; 150 galones es \(x=1{,}5\).`,
                  L`<strong>Para \(0\le x\le1\):</strong> \(F(x)=\int_0^x t\,dt=\dfrac{x^2}{2}\). En \(x=1\): \(F(1)=\tfrac12\).`,
                  L`<strong>Para \(1&lt;x\le2\):</strong> se suma lo acumulado hasta 1: \[F(x)=\frac12+\int_1^x\frac12\,dt=\frac12+\frac{x-1}{2}=\frac{x}{2}\]`,
                  L`<strong>Probabilidad:</strong> \[P(X&gt;1{,}5)=1-F(1{,}5)=1-\frac{1{,}5}{2}=\verde{0{,}25}\]`
                ],
                fig: figDensidad((x) => (x >= 0 && x <= 1 ? x : (x > 1 && x <= 2 ? 0.5 : 0)), -0.3, 2.4, 1.15, 1.5, 2, [0, 1, 1.5, 2], "Densidad por tramos de la demanda semanal con el área a la derecha de 1,5 sombreada"),
                n: "",
                s: AP
              })
            ]
          },
          {
            id: "pv-9",
            title: "Valor esperado",
            lead: L`Promedio de los valores de \(X\) ponderado por su probabilidad: el centro de equilibrio de la distribución.`,
            body: L`<p><strong>Por qué esa fórmula:</strong> si el experimento se repite \(N\) veces, el valor \(x\) aparece cerca de \(N\,p(x)\) veces. El promedio de los resultados es entonces</p><p>\[\frac{\sum_x x\cdot N\,p(x)}{N}=\sum_x x\,p(x).\]</p>`,
            formula: L`\azul{\mu}=E(X)=\sum_x x\,p(x)\qquad\qquad \azul{\mu}=E(X)=\int_{-\infty}^{\infty}x\,f(x)\,dx`,
            visual: "promedio_largo",
            source: "Apuntes del docente; Hayter.",
            abajo: [
              ej({
                t: "Ejemplo: componentes buenos en una muestra",
                e: L`Un lote de ${k("medio", "7")} componentes tiene ${k("azul", "4")} buenos y ${k("ocre", "3")} defectuosos. Un inspector toma ${k("morado", "3")} al azar. Sea \(X\) el número de componentes buenos en la muestra. Halle \(E(X)\).`,
                p: [
                  L`<strong>Variable:</strong> \(X\) = buenos en la muestra; valores 0, 1, 2, 3.`,
                  L`<strong>Función de probabilidad:</strong> \[p(x)=\frac{\binom{\azul{4}}{x}\binom{\ocre{3}}{\morado{3}-x}}{\binom{7}{\morado{3}}}:\quad p(0)=\frac{1}{35},\ p(1)=\frac{12}{35},\ p(2)=\frac{18}{35},\ p(3)=\frac{4}{35}\]`,
                  L`<strong>Valor esperado:</strong> \[\begin{aligned} E(X)&=\sum_x x\,p(x)=0\cdot\frac{1}{35}+1\cdot\frac{12}{35}+2\cdot\frac{18}{35}+3\cdot\frac{4}{35}\\ &=\frac{60}{35}=\verde{\frac{12}{7}\approx1{,}71} \end{aligned}\]`,
                  L`<strong>Lectura:</strong> en muchas muestras de 3, el promedio de componentes buenos es 1,71, aunque en una muestra nunca salga 1,71.`
                ],
                n: "",
                s: AW
              }),
              ej({
                t: "Ejemplo: vida esperada de un dispositivo electrónico",
                e: L`La vida \(X\), en horas, de un dispositivo electrónico tiene densidad \(f(x)=\dfrac{20\,000}{x^3}\) para \(x&gt;100\) y \(0\) en otro caso. Halle la vida esperada.`,
                p: [
                  L`<strong>Variable:</strong> \(X\) = vida del dispositivo en horas.`,
                  L`<strong>Partir la integral:</strong> entre \(-\infty\) y 100 la densidad vale 0: \[E(X)=\int_{-\infty}^{100}x\cdot0\,dx+\int_{100}^{\infty}x\,\frac{20\,000}{x^3}\,dx=\int_{100}^{\infty}\frac{20\,000}{x^2}\,dx\]`,
                  L`<strong>Integral impropia:</strong> \[\begin{aligned} E(X)&=20\,000\lim_{c\to\infty}\left[-\frac1x\right]_{100}^{c}=20\,000\lim_{c\to\infty}\left(-\frac1c+\frac1{100}\right)\\ &=\frac{20\,000}{100}=\verde{200\ \text{horas}} \end{aligned}\]`
                ],
                n: "",
                s: AW
              })
            ]
          },
          {
            id: "pv-10",
            visual: "momentos",
            title: "Varianza y desviación estándar",
            lead: L`Promedio de las desviaciones al cuadrado respecto a \(\mu\); la desviación estándar devuelve las unidades de X.`,
            body: L`<p><strong>Por qué al cuadrado:</strong> las desviaciones \(x-\mu\) se compensan y su promedio siempre es cero, \(\sum (x-\mu)p(x)=0\). Al elevarlas al cuadrado todas cuentan como positivas y las grandes pesan más.</p><p><strong>Fórmula de cálculo:</strong> \[\begin{aligned} \sigma^2&=E\!\left[(X-\mu)^2\right]=E\!\left[X^2-2\mu X+\mu^2\right]\\ &=E(X^2)-2\mu\,E(X)+\mu^2=E(X^2)-\mu^2 \end{aligned}\]</p>`,
            formula: L`\morado{\sigma^2}=\mathrm{Var}(X)=\sum_x(x-\azul{\mu})^2p(x)=E(X^2)-\azul{\mu}^2\qquad \sigma=\sqrt{\morado{\sigma^2}}`,
            source: "Apuntes del docente; Hayter.",
            abajo: [
              ej({
                t: "Ejemplo: número de perros por hogar",
                e: L`En un barrio, el número \(X\) de perros por hogar tiene esta función de probabilidad: \(p(0)=0{,}30\), \(p(1)=0{,}45\), \(p(2)=0{,}10\), \(p(3)=0{,}10\), \(p(4)=0{,}05\). Halle \(E(X)\), \(\mathrm{Var}(X)\) y \(\sigma\).`,
                p: [
                  L`<strong>Variable:</strong> \(X\) = número de perros en un hogar.`,
                  L`<strong>Valor esperado:</strong> \[\azul{\mu}=0(0{,}30)+1(0{,}45)+2(0{,}10)+3(0{,}10)+4(0{,}05)=\azul{1{,}15}\]`,
                  L`<strong>Segundo momento:</strong> \[E(X^2)=0^2(0{,}30)+1^2(0{,}45)+2^2(0{,}10)+3^2(0{,}10)+4^2(0{,}05)=2{,}55\]`,
                  L`<strong>Varianza y desviación:</strong> \[\begin{aligned} \sigma^2&=E(X^2)-\azul{\mu}^2=2{,}55-\azul{1{,}15}^2=\verde{1{,}2275}\\ \sigma&=\sqrt{1{,}2275}=\verde{1{,}108}\ \text{perros} \end{aligned}\]`
                ],
                n: "",
                s: AP
              }),
              ej({
                t: "Ejemplo: fracción de tiempo de uso de un horno",
                e: L`La fracción \(X\) de una semana de 40 horas en que trabaja un horno de un taller tiene densidad \(f(x)=3x^2\) para \(0\le x\le1\). Halle la media y la desviación estándar.`,
                p: [
                  L`<strong>Variable:</strong> \(X\) = fracción de la semana en que el horno trabaja.`,
                  L`<strong>Media:</strong> \[\azul{\mu}=\int_0^1 x\cdot3x^2\,dx=\left.\frac{3x^4}{4}\right|_0^1=\azul{\frac34}=0{,}75\]`,
                  L`<strong>Segundo momento:</strong> \[E(X^2)=\int_0^1 x^2\cdot3x^2\,dx=\left.\frac{3x^5}{5}\right|_0^1=\frac35\]`,
                  L`<strong>Varianza y desviación:</strong> \[\sigma^2=\frac35-\left(\azul{\frac34}\right)^2=\frac{48-45}{80}=\verde{\frac{3}{80}=0{,}0375},\qquad \sigma=\verde{0{,}194}\]`
                ],
                n: "",
                s: AP
              })
            ]
          },
          {
            id: "pv-11",
            title: "Propiedades del valor esperado y la varianza",
            lead: L`Un cambio de escala multiplica; un cambio de origen solo desplaza.`,
            body: L`<p><strong>Valor esperado</strong> (la suma y la constante salen de la suma o la integral): \[E(aX+b)=\sum_x(ax+b)p(x)=a\sum_x x\,p(x)+b\sum_x p(x)=a\,E(X)+b\]</p><p><strong>Varianza:</strong> \[\mathrm{Var}(aX+b)=E\!\left[(aX+b-a\mu-b)^2\right]=a^2E\!\left[(X-\mu)^2\right]=a^2\,\mathrm{Var}(X)\]</p>`,
            formula: L`E(\azul{a}X+\ocre{b})=\azul{a}\,E(X)+\ocre{b}\qquad\qquad \mathrm{Var}(\azul{a}X+\ocre{b})=\azul{a}^2\,\mathrm{Var}(X)`,
            lectura: L`La constante ${k("ocre", "b")} mueve toda la distribución sin dispersarla; el factor ${k("azul", "a")} la estira y entra al cuadrado en la varianza.`,
            source: "Apuntes del docente; Hayter.",
            abajo: [
              ej({
                t: "Ejemplo: tiempo para obtener pista libre",
                e: L`El tiempo, en minutos, para que un avión obtenga pista libre es \(Y=\azul{3}X\ocre{-2}\), donde \(X\) tiene densidad \(f(x)=\tfrac14e^{-x/4}\) para \(x&gt;0\). Se sabe que \(E(X)=4\) y \(\mathrm{Var}(X)=16\). Halle la media y la desviación estándar de \(Y\).`,
                p: [
                  L`<strong>Variables:</strong> \(X\) con la densidad dada; \(Y\) = tiempo en minutos.`,
                  L`<strong>Valor esperado:</strong> \[E(Y)=\azul{3}\,E(X)\ocre{-2}=\azul{3}(4)\ocre{-2}=\verde{10\ \text{min}}\]`,
                  L`<strong>Varianza:</strong> la constante no aporta: \[\mathrm{Var}(Y)=\azul{3}^2\,\mathrm{Var}(X)=9(16)=144\]`,
                  L`<strong>Desviación:</strong> \(\sigma_Y=\sqrt{144}=\verde{12\ \text{min}}\).`
                ],
                n: "",
                s: AP
              })
            ]
          },
          {
            id: "pv-12",
            title: "Distribución conjunta y covarianza",
            lead: L`Con dos variables se necesita su distribución conjunta; la covarianza mide si tienden a variar en la misma dirección.`,
            body: L`<p><strong>Conjunta:</strong> \(p(x,y)=P(X=x,\,Y=y)\). <strong>Marginales:</strong> \(p_X(x)=\sum_y p(x,y)\), \(p_Y(y)=\sum_x p(x,y)\).</p><p><strong>Independientes</strong> si \(p(x,y)=p_X(x)\,p_Y(y)\) para todo par.</p><p><strong>Covarianza</strong> (desarrollando el producto como en la varianza): \[\mathrm{Cov}(X,Y)=E\!\left[(X-\mu_X)(Y-\mu_Y)\right]=E(XY)-\mu_X\mu_Y\]</p>`,
            formula: L`\mathrm{Cov}(X,Y)=\sum_x\sum_y xy\,p(x,y)-\azul{\mu_X}\,\ocre{\mu_Y}`,
            lectura: L`Positiva: cuando una variable está por encima de su media, la otra también tiende a estarlo. Negativa: tienden a moverse en sentidos opuestos. Si son independientes, la covarianza es cero.`,
            source: "Apuntes del docente; Walpole et al.",
            abajo: [
              ej({
                t: "Ejemplo: repuestos de bolígrafo, tabla conjunta",
                e: L`De una caja con ${k("azul", "3")} repuestos azules, ${k("ocre", "2")} rojos y 3 verdes se sacan 2 al azar. Sea \(\azul{X}\) el número de azules e \(\ocre{Y}\) el de rojos. Halle la distribución conjunta y las marginales.`,
                p: [
                  L`<strong>Variables:</strong> \(\azul{X}\) = azules, \(\ocre{Y}\) = rojos; cada una toma 0, 1 o 2, con \(x+y\le2\).`,
                  L`<strong>Fórmula:</strong> \[p(x,y)=\frac{\binom{\azul{3}}{x}\binom{\ocre{2}}{y}\binom{3}{2-x-y}}{\binom{8}{2}}\]`,
                  L`<strong>Tabla</strong> (en 28 avos): <table class="tabla-num" style="width:auto;display:inline-table;vertical-align:middle;margin-left:.6em"><tr><th></th><th>\(x=0\)</th><th>\(x=1\)</th><th>\(x=2\)</th><th>\(p_Y\)</th></tr><tr><td>\(y=0\)</td><td>3</td><td>9</td><td>3</td><td>15</td></tr><tr><td>\(y=1\)</td><td>6</td><td>6</td><td>0</td><td>12</td></tr><tr><td>\(y=2\)</td><td>1</td><td>0</td><td>0</td><td>1</td></tr><tr><td>\(p_X\)</td><td>10</td><td>15</td><td>3</td><td>28</td></tr></table>`,
                  L`<strong>¿Independientes?</strong> \(p(1,0)=\frac{9}{28}\) pero \(p_X(1)\,p_Y(0)=\frac{15}{28}\cdot\frac{15}{28}\ne\frac{9}{28}\): no lo son.`
                ],
                n: "",
                s: AW
              }),
              ej({
                t: "Ejemplo: repuestos de bolígrafo, covarianza",
                e: L`Con la tabla conjunta de los repuestos (azules \(\azul{X}\), rojos \(\ocre{Y}\)), halle \(\mathrm{Cov}(X,Y)\).`,
                p: [
                  L`<strong>Medias marginales:</strong> \[\azul{\mu_X}=0\cdot\tfrac{10}{28}+1\cdot\tfrac{15}{28}+2\cdot\tfrac{3}{28}=\azul{\tfrac34},\qquad \ocre{\mu_Y}=0\cdot\tfrac{15}{28}+1\cdot\tfrac{12}{28}+2\cdot\tfrac{1}{28}=\ocre{\tfrac12}\]`,
                  L`<strong>\(E(XY)\):</strong> solo aporta la casilla con \(x=1,\ y=1\): \(E(XY)=1\cdot1\cdot\frac{6}{28}=\frac{3}{14}\).`,
                  L`<strong>Covarianza:</strong> \[\mathrm{Cov}(X,Y)=E(XY)-\azul{\mu_X}\,\ocre{\mu_Y}=\frac{3}{14}-\azul{\frac34}\cdot\ocre{\frac12}=\frac{12-21}{56}=\verde{-\frac{9}{56}}\]`,
                  L`<strong>Lectura:</strong> negativa: si salen más azules, quedan menos lugares para los rojos.`
                ],
                n: "",
                s: AW
              })
            ]
          },
          {
            id: "pv-13",
            title: "Varianza de una suma de variables",
            lead: L`Las medias siempre se suman; las varianzas se suman solo si la covarianza es cero.`,
            body: L`<p><strong>Deducción.</strong> \[\begin{aligned} \mathrm{Var}(X+Y)&=E\!\left[(X+Y-\mu_X-\mu_Y)^2\right]=E\!\left[\big((X-\mu_X)+(Y-\mu_Y)\big)^2\right]\\ &=E\!\left[(X-\mu_X)^2\right]+E\!\left[(Y-\mu_Y)^2\right]+2E\!\left[(X-\mu_X)(Y-\mu_Y)\right]\\ &=\mathrm{Var}(X)+\mathrm{Var}(Y)+2\,\mathrm{Cov}(X,Y) \end{aligned}\]</p>`,
            formula: L`\mathrm{Var}(\azul{a}X+\ocre{b}Y)=\azul{a}^2\mathrm{Var}(X)+\ocre{b}^2\mathrm{Var}(Y)+2\azul{a}\ocre{b}\,\mathrm{Cov}(X,Y)`,
            lectura: L`Con \(a=1,\ b=-1\): \(\mathrm{Var}(X-Y)=\mathrm{Var}(X)+\mathrm{Var}(Y)-2\,\mathrm{Cov}(X,Y)\). Si X e Y son independientes, la varianza de la diferencia también es la suma de las varianzas.`,
            source: "Apuntes del docente; Hayter.",
            abajo: [
              ej({
                t: "Ejemplo: repuestos que no son verdes",
                e: L`Con los repuestos de bolígrafo, \(\azul{X+Y}\) es el número de repuestos que no son verdes entre los 2 sacados. Halle \(\mathrm{Var}(X+Y)\) usando la fórmula de la suma.`,
                p: [
                  L`<strong>Varianzas marginales:</strong> \[\begin{aligned} E(X^2)&=1\cdot\tfrac{15}{28}+4\cdot\tfrac{3}{28}=\tfrac{27}{28}, & \mathrm{Var}(X)&=\tfrac{27}{28}-\left(\tfrac34\right)^2=\tfrac{45}{112}\\ E(Y^2)&=1\cdot\tfrac{12}{28}+4\cdot\tfrac{1}{28}=\tfrac{16}{28}, & \mathrm{Var}(Y)&=\tfrac{16}{28}-\left(\tfrac12\right)^2=\tfrac{36}{112} \end{aligned}\]`,
                  L`<strong>Fórmula de la suma:</strong> \[\begin{aligned} \mathrm{Var}(X+Y)&=\mathrm{Var}(X)+\mathrm{Var}(Y)+2\,\mathrm{Cov}(X,Y)\\ &=\tfrac{45}{112}+\tfrac{36}{112}+2\left(-\tfrac{9}{56}\right)=\tfrac{81-36}{112}=\verde{\tfrac{45}{112}\approx0{,}40} \end{aligned}\]`,
                  L`<strong>Sin la covarianza</strong> se obtendría \(\tfrac{81}{112}\approx0{,}72\): casi el doble. La covarianza negativa reduce la variación de la suma.`
                ],
                n: "",
                s: "Adaptado del ejemplo de Walpole et al. en los apuntes del docente."
              })
            ]
          }
        ]
      }
    ]
  };
}());
