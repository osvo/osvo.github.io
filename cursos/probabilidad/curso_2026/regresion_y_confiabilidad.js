/* Regresión lineal simple y confiabilidad de sistemas.
   Regresión: datos reales de Montgomery y Runger (ejemplo 11-1): pureza del oxígeno (%) frente al nivel de
   hidrocarburos (%) en el condensador de una unidad de destilación; b1 = 14,947, b0 = 74,283, R² = 0,877.
   Confiabilidad: componentes con vida exponencial (apuntes del docente) y sistema de cuatro componentes de Walpole et al. */
(function () {
  "use strict";
  const F = window.Fig, K = F.K, L = F.L, co = F.co, k = F.k;

  const pasos = (lista) => `<ol class="pasos">${lista.map((x) => `<li>${x}</li>`).join("")}</ol>`;
  const ej = (o) => ({ title: o.t, lead: o.lead, body: `<div class="enunciado">${o.e}</div>` + pasos(o.p), figure: o.fig, notes: o.n, source: o.s });
  const MR = "Montgomery y Runger, ejemplo 11-1 (datos de pureza del oxígeno).";

  const X = [0.99, 1.02, 1.15, 1.29, 1.46, 1.36, 0.87, 1.23, 1.55, 1.40, 1.19, 1.15, 0.98, 1.01, 1.11, 1.20, 1.26, 1.32, 1.43, 0.95];
  const Y = [90.01, 89.05, 91.43, 93.74, 96.73, 94.45, 87.59, 91.77, 99.42, 93.65, 93.54, 92.52, 90.56, 89.54, 89.85, 90.39, 93.25, 93.41, 94.98, 87.33];
  const n = X.length, xb = X.reduce((a, b) => a + b, 0) / n, yb = Y.reduce((a, b) => a + b, 0) / n;
  const Sxx = X.reduce((a, v) => a + (v - xb) * (v - xb), 0);
  const Sxy = X.reduce((a, v, i) => a + (v - xb) * (Y[i] - yb), 0);
  const b1 = Sxy / Sxx, b0 = yb - b1 * xb, fit = (x) => b0 + b1 * x;
  const resid = Y.map((v, i) => v - fit(X[i]));

  const x0 = 0.8, x1 = 1.6, y0 = 86, y1 = 100;
  function dispersion(o) {
    o = o || {};
    const left = 76, right = 612, top = 24, bottom = 316;
    const PX = (x) => left + (x - x0) / (x1 - x0) * (right - left), PY = (y) => bottom - (y - y0) / (y1 - y0) * (bottom - top);
    let g = `<svg viewBox="0 0 640 400" role="img" aria-label="Diagrama de dispersión de la pureza del oxígeno frente al nivel de hidrocarburos">`;
    g += `<path d="M${left} ${top - 8}V${bottom}H${right}" fill="none" stroke="${K.medio}" stroke-width="2"/>`;
    [0.9, 1.1, 1.3, 1.5].forEach((v) => { g += `<text x="${PX(v).toFixed(1)}" y="${bottom + 30}" text-anchor="middle" font-size="21" fill="${K.tinta}">${co(v, 1)}</text>`; });
    [88, 92, 96, 100].forEach((v) => { g += `<text x="${left - 10}" y="${(PY(v) + 7).toFixed(1)}" text-anchor="end" font-size="21" fill="${K.tinta}">${v}</text>`; });
    if (o.residuos) X.forEach((x, i) => { g += `<path d="M${PX(x).toFixed(1)} ${PY(Y[i]).toFixed(1)}V${PY(fit(x)).toFixed(1)}" stroke="${K.rojo}" stroke-width="3"/>`; });
    if (o.recta) g += `<path d="M${PX(0.82).toFixed(1)} ${PY(fit(0.82)).toFixed(1)}L${PX(1.6).toFixed(1)} ${PY(fit(1.6)).toFixed(1)}" stroke="${K.azul}" stroke-width="4"/>`;
    X.forEach((x, i) => { g += `<circle cx="${PX(x).toFixed(1)}" cy="${PY(Y[i]).toFixed(1)}" r="7" fill="${K.verde}" stroke="#fff" stroke-width="2"/>`; });
    g += `<text x="${(left + right) / 2}" y="388" text-anchor="middle" font-size="21" font-weight="700" fill="${K.tinta}">x, hidrocarburos (%)</text>`;
    g += `<text x="20" y="${(top + bottom) / 2}" text-anchor="middle" font-size="21" font-weight="700" fill="${K.tinta}" transform="rotate(-90 20 ${(top + bottom) / 2})">y, pureza (%)</text></svg>`;
    return g;
  }

  function residuos() {
    const left = 76, right = 612, bottom = 316, top = 40, PX = (x) => left + (x - x0) / (x1 - x0) * (right - left), PY = (e) => (top + bottom) / 2 - e / 2.5 * (bottom - top) / 2;
    let g = `<svg viewBox="0 0 640 400" role="img" aria-label="Residuos de la regresión frente al nivel de hidrocarburos">`;
    g += `<path d="M${left} ${PY(0)}H${right}" stroke="${K.azul}" stroke-width="3"/><path d="M${left} ${top}V${bottom}" stroke="${K.medio}" stroke-width="2"/>`;
    [-2, -1, 0, 1, 2].forEach((v) => { g += `<text x="${left - 10}" y="${PY(v) + 7}" text-anchor="end" font-size="21" fill="${K.tinta}">${String(v).replace("-", "−")}</text>`; });
    [0.9, 1.1, 1.3, 1.5].forEach((v) => { g += `<text x="${PX(v).toFixed(1)}" y="${bottom + 30}" text-anchor="middle" font-size="21" fill="${K.tinta}">${co(v, 1)}</text>`; });
    X.forEach((x, i) => { g += `<path d="M${PX(x).toFixed(1)} ${PY(0)}V${PY(resid[i]).toFixed(1)}" stroke="${K.rojo}" stroke-width="3"/><circle cx="${PX(x).toFixed(1)}" cy="${PY(resid[i]).toFixed(1)}" r="7" fill="${K.rojo}"/>`; });
    g += `<text x="344" y="388" text-anchor="middle" font-size="21" font-weight="700" fill="${K.tinta}">x, hidrocarburos (%)</text>`;
    g += `<text x="20" y="178" text-anchor="middle" font-size="21" font-weight="700" fill="${K.tinta}" transform="rotate(-90 20 178)">residuo, e = y − ŷ</text></svg>`;
    return g;
  }

  // Sistema de Walpole: A y B en serie con el bloque paralelo C ∥ D.
  function sistemaWalpole(resaltar) {
    const b = (x, y, t, c) => `<rect x="${x}" y="${y}" width="96" height="56" fill="${c}" fill-opacity=".12" stroke="${c}" stroke-width="3"/><text x="${x + 48}" y="${y + 36}" text-anchor="middle" font-size="22" font-weight="700" fill="${c}">${t}</text>`;
    let s = `<svg viewBox="0 0 640 300" role="img" aria-label="Sistema con los componentes A y B en serie y los componentes C y D en paralelo">`;
    s += `<path d="M10 150H50M146 150H190M286 150H360M360 80V220M360 80H400M360 220H400M496 80H540M496 220H540M540 80V220M540 150H630" fill="none" stroke="${K.medio}" stroke-width="3"/>`;
    s += b(50, 122, "A · 0,9", K.azul) + b(190, 122, "B · 0,9", K.azul) + b(400, 52, "C · 0,8", K.ocre) + b(400, 192, "D · 0,8", K.ocre);
    if (resaltar) s += `<rect x="342" y="30" width="216" height="240" fill="none" stroke="${K.ocre}" stroke-width="2" stroke-dasharray="9 6"/><text x="450" y="292" text-anchor="middle" font-size="19" font-weight="700" fill="${K.ocre}">bloque paralelo: 0,96</text>`;
    return s + `</svg>`;
  }

  window.COURSE = {
    id: "regresion_y_confiabilidad",
    title: "Regresión lineal y confiabilidad",
    shortTitle: "Regresión y confiabilidad",
    modules: [
      {
        id: "regresion",
        title: "Regresión lineal simple",
        slides: [
          {
            id: "rc-1",
            title: L`Correlación y regresión`,
            lead: L`La correlación mide la fuerza de la relación lineal; la regresión permite predecir \(y\) a partir de \(x\).`,
            body: L`<p><strong>Modelo:</strong> cada respuesta es una recta media más un error aleatorio, independiente, centrado en cero y con varianza constante \(\sigma^2\).</p><p><strong>Datos del ejemplo:</strong> pureza del oxígeno \(y\) (%) y nivel de hidrocarburos \(x\) (%) en el condensador de una unidad de destilación; 20 observaciones.</p><p>\(r=\dfrac{S_{xy}}{\sqrt{S_{xx}S_{yy}}}\), con \(S_{xx}=\sum(x_i-\bar x)^2\), \(S_{xy}=\sum(x_i-\bar x)(y_i-\bar y)\).</p>`,
            formula: L`\verde{Y_i} = \azul{\beta_0 + \beta_1 x_i} + \rojo{\varepsilon_i}, \qquad \rojo{\varepsilon_i} \sim N(0, \sigma^2)`,
            figure: dispersion(),
            source: MR,
            abajo: [
              ej({
                t: "Ejemplo: correlación entre hidrocarburos y pureza",
                e: L`Para las 20 observaciones de pureza del oxígeno se obtuvo \(S_{xx}=\azul{0{,}68088}\), \(S_{yy}=\ocre{173{,}38}\) y \(S_{xy}=\morado{10{,}17744}\). Calcule el coeficiente de correlación.`,
                p: [
                  L`<strong>Variables:</strong> \(x\) = nivel de hidrocarburos (%), \(y\) = pureza del oxígeno (%).`,
                  L`<strong>Fórmula y sustitución:</strong> \[r=\frac{S_{xy}}{\sqrt{S_{xx}\,S_{yy}}}=\frac{\morado{10{,}17744}}{\sqrt{\azul{0{,}68088}\cdot\ocre{173{,}38}}}=\frac{10{,}177}{10{,}865}=\verde{0{,}937}\]`,
                  L`<strong>Lectura:</strong> relación lineal positiva y fuerte: a más hidrocarburos, mayor pureza. La correlación no dice cuánto cambia la pureza por cada punto de hidrocarburos; eso lo da la pendiente.`
                ],
                n: "",
                s: MR
              })
            ]
          },
          {
            id: "rc-2",
            title: L`Mínimos cuadrados`,
            lead: L`La recta de mínimos cuadrados hace mínima la suma de los cuadrados de los residuos verticales.`,
            body: L`<p>Para una recta candidata \(\hat y=b_0+b_1x\), el residuo \(e_i=y_i-\hat y_i\) es la distancia vertical del dato a la recta.</p><p><strong>Deducción:</strong> se deriva \(Q\) respecto a \(b_0\) y \(b_1\) y se iguala a cero: \(\sum(y_i-b_0-b_1x_i)=0\) y \(\sum x_i(y_i-b_0-b_1x_i)=0\). La primera da \(b_0=\bar y-b_1\bar x\) (la recta pasa por \((\bar x,\bar y)\)); al sustituir en la segunda sale \(b_1=\frac{S_{xy}}{S_{xx}}\).</p>`,
            formula: L`Q = \sum_{i=1}^{n} \big(\verde{y_i} - (\azul{b_0 + b_1 x_i})\big)^2\qquad b_1=\frac{S_{xy}}{S_{xx}}\qquad b_0=\bar y-b_1\bar x`,
            visual: "regresion",
            codigo: { python: "scipy.stats.linregress(x, y)", excel: "=PENDIENTE(y;x), =INTERSECCION.EJE(y;x)" },
            source: MR,
            abajo: [
              ej({
                t: "Ejemplo: recta de la pureza del oxígeno",
                e: L`Con los 20 datos: \(\sum x_i=\azul{23{,}92}\), \(\sum y_i=\ocre{1843{,}21}\), \(\sum x_i^2=29{,}2892\) y \(\sum x_iy_i=2214{,}6566\). Halle la recta de mínimos cuadrados y prediga la pureza cuando los hidrocarburos son 1,00 %.`,
                p: [
                  L`<strong>Medias:</strong> \(\bar x=\frac{\azul{23{,}92}}{20}=1{,}196\), \(\bar y=\frac{\ocre{1843{,}21}}{20}=92{,}1605\).`,
                  L`<strong>Sumas de cuadrados:</strong> \[\begin{aligned} S_{xx}&=\sum x_i^2-\frac{(\sum x_i)^2}{n}=29{,}2892-\frac{\azul{23{,}92}^2}{20}=0{,}68088\\ S_{xy}&=\sum x_iy_i-\frac{\sum x_i\sum y_i}{n}=2214{,}6566-\frac{\azul{23{,}92}(\ocre{1843{,}21})}{20}=10{,}17744 \end{aligned}\]`,
                  L`<strong>Coeficientes:</strong> \[b_1=\frac{10{,}17744}{0{,}68088}=\verde{14{,}947},\qquad b_0=92{,}1605-14{,}947(1{,}196)=\verde{74{,}283}\]`,
                  L`<strong>Predicción:</strong> \(\hat y=74{,}283+14{,}947(1{,}00)=\verde{89{,}23}\,\%\). Cada punto porcentual adicional de hidrocarburos aumenta la pureza media en unos 14,9 puntos (dentro del rango observado, 0,87 a 1,55 %).`
                ],
                n: "",
                s: MR
              })
            ]
          },
          {
            id: "rc-3",
            title: L`Coeficiente de determinación y residuos`,
            lead: L`\(R^2\) es la fracción de la variación de \(y\) que explica la recta; los residuos permiten revisar los supuestos.`,
            body: L`<p>\(\mathrm{SST}=\sum(y_i-\bar y)^2\) se divide en la parte explicada \(\mathrm{SSR}=b_1S_{xy}\) y el error \(\mathrm{SSE}=\mathrm{SST}-\mathrm{SSR}\).</p><p>En los residuos se busca que no haya patrón curvo ni dispersión cambiante alrededor de cero. Un \(R^2\) alto no exime de revisarlos.</p>`,
            formula: L`\morado{R^2} = \frac{\azul{\mathrm{SSR}}}{\mathrm{SST}} = 1 - \frac{\rojo{\mathrm{SSE}}}{\mathrm{SST}} = \morado{r}^2 \qquad\qquad \hat{\sigma}^2 = \frac{\rojo{\mathrm{SSE}}}{n - 2}`,
            figure: residuos(),
            source: MR,
            abajo: [
              ej({
                t: "Ejemplo: qué tanto explica la recta de pureza",
                e: L`Para los datos de pureza: \(\mathrm{SST}=S_{yy}=\ocre{173{,}38}\), \(b_1=\azul{14{,}947}\) y \(S_{xy}=\morado{10{,}17744}\). Halle \(R^2\) y la varianza estimada del error.`,
                p: [
                  L`<strong>Parte explicada:</strong> \(\mathrm{SSR}=b_1S_{xy}=\azul{14{,}947}(\morado{10{,}17744})=152{,}13\).`,
                  L`<strong>Error:</strong> \(\mathrm{SSE}=\ocre{173{,}38}-152{,}13=21{,}25\).`,
                  L`<strong>Coeficiente de determinación:</strong> \[R^2=\frac{152{,}13}{\ocre{173{,}38}}=\verde{0{,}877}\qquad\left(=r^2=0{,}937^2\right)\]`,
                  L`<strong>Varianza del error:</strong> \(\hat\sigma^2=\dfrac{21{,}25}{20-2}=\verde{1{,}18}\), \(\hat\sigma=1{,}09\) puntos de pureza.`,
                  L`<strong>Lectura:</strong> la recta explica el 87,7 % de la variación de la pureza; las predicciones tienen un error típico de alrededor de 1 punto.`
                ],
                n: "",
                s: MR
              })
            ]
          },
          {
            id: "rc-4",
            title: L`Regresión con datos reales en Python`,
            lead: L`El mismo procedimiento con los 1030 ensayos de concreto del repositorio UCI.`,
            body: L`<p>El cuaderno <code>cuadernos/concreto.ipynb</code> ajusta la resistencia a compresión en función de los ingredientes y la edad del concreto.</p><p><strong>Pasos:</strong> definir la pregunta; separar datos de entrenamiento (826) y de prueba (204); ajustar; medir el error en los datos de prueba, no en los mismos con que se ajustó.</p><p>Son datos observacionales de muchas mezclas: sirven para asociar y predecir, no para validar una dosificación.</p>`,
            codigo: { python: "numpy.polyfit(x, y, 1); scipy.stats.linregress(x, y)", excel: "Datos → Análisis de datos → Regresión" },
            source: "Yeh (1998), UCI Concrete Compressive Strength; cuaderno local concreto.ipynb."
          }
        ]
      },
      {
        id: "confiabilidad",
        title: "Confiabilidad de sistemas",
        slides: [
          {
            id: "rc-5",
            title: L`Confiabilidad y tasa de falla`,
            lead: L`La confiabilidad \(R(t)\) es la probabilidad de que un componente siga funcionando después del tiempo \(t\).`,
            body: L`<p>Sea \(T\ge0\) el tiempo hasta la falla, con densidad \(f(t)\) y acumulada \(F(t)=P(T\le t)\).</p><p>La ${k("verde", "confiabilidad")} es \(R(t)=1-F(t)\). La ${k("morado", "tasa de falla")} \(h(t)\) es el riesgo instantáneo de fallar dado que llegó funcionando hasta \(t\): \(h(t)\,\Delta t\approx P(t&lt;T\le t+\Delta t\mid T&gt;t)\).</p>`,
            formula: L`\verde{R(t)} = P(T > t) = 1 - F(t) \qquad\qquad \morado{h(t)} = \frac{\rojo{f(t)}}{\verde{R(t)}}`,
            visual: "weibull",
            source: "Hayter; apuntes del docente.",
            abajo: [
              ej({
                t: "Ejemplo: confiabilidad de un componente exponencial",
                e: L`El tiempo de falla \(T\) de un componente es exponencial con media \(\beta=\azul{5}\) años. Halle \(R(t)\), la confiabilidad a los \(\ocre{8}\) años y la tasa de falla.`,
                p: [
                  L`<strong>Variable:</strong> \(T\) = tiempo hasta la falla en años, \(f(t)=\frac{1}{\azul{5}}e^{-t/\azul{5}}\).`,
                  L`<strong>Confiabilidad:</strong> \[R(t)=\int_t^\infty\frac{1}{\azul{5}}e^{-u/\azul{5}}\,du=e^{-t/\azul{5}},\qquad R(\ocre{8})=e^{-\ocre{8}/\azul{5}}=\verde{0{,}202}\]`,
                  L`<strong>Tasa de falla:</strong> \[h(t)=\frac{f(t)}{R(t)}=\frac{\frac15e^{-t/5}}{e^{-t/5}}=\verde{\frac15\ \text{por año}}\]`,
                  L`<strong>Lectura:</strong> la tasa es constante: la exponencial no envejece. Para equipos con desgaste se usa Weibull con forma mayor que 1.`
                ],
                n: "",
                s: "Ejemplo de los apuntes del docente (Walpole et al.)."
              })
            ]
          },
          {
            id: "rc-6",
            title: L`Sistemas en serie y en paralelo`,
            lead: L`En serie deben funcionar todos los componentes; en paralelo basta con uno.`,
            body: L`<p>Sea \(r_i\) la probabilidad de que el componente \(i\) funcione durante la misión, con componentes independientes.</p><p><strong>Serie:</strong> por independencia, el producto. <strong>Paralelo:</strong> el sistema falla solo si fallan todos; por el complemento, \(1-\prod(1-r_i)\).</p>`,
            formula: L`\rojo{R_{\text{serie}}} = \prod_{i=1}^{n} r_i \qquad\qquad \verde{R_{\text{paralelo}}} = 1 - \prod_{i=1}^{n} (1 - r_i)`,
            lectura: L`En serie, la confiabilidad no supera la del componente más débil; en paralelo, no es menor que la del más fuerte.`,
            visual: "confiabilidad",
            source: "Hayter; Walpole et al."
          },
          {
            id: "rc-7",
            title: L`Sistemas mixtos`,
            lead: L`Se reduce cada bloque en paralelo a un componente equivalente y luego se combina en serie.`,
            body: L`<p>Se identifica cada grupo en paralelo, se calcula su confiabilidad con la regla del complemento y se reemplaza por un solo bloque. El sistema resultante queda en serie.</p>`,
            figure: sistemaWalpole(true),
            source: "Walpole et al.; Hayter.",
            abajo: [
              ej({
                t: "Ejemplo: un sistema eléctrico de cuatro componentes",
                e: L`Un sistema eléctrico funciona si funcionan los componentes A y B, y al menos uno de los componentes C o D. Las probabilidades de que funcionen son \(\azul{0{,}9}\) para A y B, y \(\ocre{0{,}8}\) para C y D, de forma independiente. ¿Cuál es la probabilidad de que el sistema funcione?`,
                p: [
                  L`<strong>Eventos:</strong> \(A, B, C, D\) = el componente funciona.`,
                  L`<strong>Serie A–B:</strong> \(P(A\cap B)=\azul{0{,}9}\times\azul{0{,}9}=0{,}81\).`,
                  L`<strong>Paralelo C–D:</strong> falla solo si fallan ambos: \[P(C\cup D)=1-(1-\ocre{0{,}8})(1-\ocre{0{,}8})=1-0{,}04=0{,}96\]`,
                  L`<strong>Sistema:</strong> los dos bloques en serie: \[P(\text{sistema})=0{,}81\times0{,}96=\verde{0{,}7776}\]`
                ],
                fig: sistemaWalpole(true),
                n: "",
                s: "Walpole et al., ejemplo de sistema eléctrico con cuatro componentes."
              })
            ]
          }
        ]
      }
    ]
  };
}());
