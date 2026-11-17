/* Estadística descriptiva y exploración de datos.
   Requiere clase_figuras.js (window.Fig).
   Convenciones: x̄, S², S, Q₁, Q₂ (mediana), Q₃, RIC = Q₃ − Q₁, CV = S / |x̄|.
   Principio didáctico: enunciado completo antes de los números; explicar por qué n − 1 en la varianza muestral. */
(function () {
  "use strict";
  const F = window.Fig, K = F.K, L = F.L, co = F.co, k = F.k;
  const D = F.CILINDROS, R = F.resumen(D), n = R.n;
  const m2 = D.reduce((a, b) => a + Math.pow(b - R.mean, 2), 0) / n;
  const m3 = D.reduce((a, b) => a + Math.pow(b - R.mean, 3), 0) / n;
  const m4 = D.reduce((a, b) => a + Math.pow(b - R.mean, 4), 0) / n;
  const ejes = { xmin: 20, xmax: 37, ticks: [20, 24, 28, 32, 36] };
  const verdeRojo = (v) => (v < 24.2 ? K.rojo : K.verde);

  function figDesviacionesNMinus1() {
    const sub = [24, 27, 29, 32], xb = 28, mu = 26;
    const X = (v) => 70 + (v - 22) / 12 * 500;
    let s = `<svg viewBox="0 0 640 340" role="img" aria-label="Comparación entre distancias al promedio muestral y a la media poblacional">`;
    s += `<line x1="60" y1="145" x2="580" y2="145" stroke="${K.medio}" stroke-width="2"/>`;
    s += `<line x1="60" y1="255" x2="580" y2="255" stroke="${K.medio}" stroke-width="2"/>`;
    s += `<line x1="${X(xb)}" y1="95" x2="${X(xb)}" y2="175" stroke="${K.azul}" stroke-width="4"/>`;
    s += `<text x="${X(xb)}" y="82" text-anchor="middle" font-size="21" font-weight="700" fill="${K.azul}">x̄ = 28 (centro de la muestra)</text>`;
    s += `<line x1="${X(mu)}" y1="205" x2="${X(mu)}" y2="285" stroke="${K.rojo}" stroke-width="4" stroke-dasharray="8 5"/>`;
    s += `<text x="${X(mu)}" y="314" text-anchor="middle" font-size="21" font-weight="700" fill="${K.rojo}">μ = 26 (media real del lote)</text>`;
    sub.forEach((v) => {
      s += `<circle cx="${X(v)}" cy="145" r="8" fill="${K.verde}"/>`;
      s += `<line x1="${X(v)}" y1="130" x2="${X(xb)}" y2="130" stroke="${K.azul}" stroke-width="2.5"/>`;
      s += `<circle cx="${X(v)}" cy="255" r="8" fill="${K.verde}"/>`;
      s += `<line x1="${X(v)}" y1="240" x2="${X(mu)}" y2="240" stroke="${K.rojo}" stroke-width="2.5"/>`;
    });
    s += `<text x="64" y="42" font-size="19" font-weight="700" fill="${K.azul}">Suma de cuadrados respecto a x̄ = 34 (suma mínima)</text>`;
    s += `<text x="64" y="198" font-size="19" font-weight="700" fill="${K.rojo}">Suma de cuadrados respecto a μ = 50</text>`;
    return s + `</svg><p class="fig-note">Al usar \\(\\bar{x}\\) en lugar de \\(\\mu\\), los datos quedan artificialmente más cerca de su centro; dividir entre \\(n - 1\\) compensa esa subestimación.</p>`;
  }

  window.COURSE = {
    id: "estadistica_descriptiva",
    title: "Estadística descriptiva",
    shortTitle: "Estadística descriptiva",
    subtitle: L`Identificar qué se midió, explorar la forma y elegir resúmenes que respondan la pregunta`,
    modules: [
      {
        id: "datos_graficos",
        title: "Población, muestra e histograma",
        summary: "Población vs. muestra aleatoria, enunciado del caso de 20 probetas y efecto del ancho de clase.",
        slides: [
          {
            id: "ed-1",
            title: L`Población y muestra`,
            lead: L`La población es todo el conjunto de interés; la muestra, la parte que se observa.`,
            body: L`<p><strong>Población:</strong> unidades o resultados sobre los que se desea aprender. <strong>Muestra:</strong> unidades efectivamente observadas.</p><p>Una muestra aleatoria se obtiene con un mecanismo de selección conocido. En una muestra simple sin reemplazo, todas las muestras del mismo tamaño son equiprobables; las extracciones no son independientes.</p><div class="enunciado">Se registran 20 resistencias a 28 días bajo condiciones de ensayo comparables. Son datos simulados para aprender a describir una muestra; no documentan la aceptación de un lote.</div><p class="datos-ejercicio"><strong>Datos simulados (MPa):</strong> 22,9; 24,1; 24,8; 25,6; 26,0; 26,4; 26,9; 27,2; 27,5; 27,9; 28,2; 28,4; 28,9; 29,3; 29,8; 30,4; 30,9; 31,6; 32,5; 34,3.</p>`,
            figure: F.puntos(D, Object.assign({}, ejes, { colorFn: () => K.verde, alt: "Veinte resistencias simuladas a 28 días", note: "Cada punto representa una medición en MPa; los datos no corresponden a una obra real." })),
            source: "Montgomery y Runger; caso ilustrativo de concreto."
          },
          {
            id: "ed-2",
            title: L`Histograma`,
            lead: L`Muestra la forma de los datos: centro, dispersión, simetría y valores atípicos.`,
            body: L`<p>Se divide el rango en clases y se cuenta cuántos valores caen en cada una. Con clases del mismo ancho, se pueden usar frecuencias como alturas.</p><p>Si los anchos son distintos, el <strong>área</strong> de cada barra debe representar la frecuencia: la altura es frecuencia dividida entre ancho. La elección de clases puede ocultar o exagerar patrones.</p>`,
            visual: "histograma",
            codigo: { python: "plt.hist(datos, bins=7)", excel: "Insertar → Estadístico → Histograma" },
            source: "Hayter; Devore."
          }
        ]
      },
      {
        id: "centro_dispersion",
        title: "Medidas de centro y de dispersión",
        summary: "Media muestral, mediana Q₂, sensibilidad a atípicos y explicación intuitiva del denominador n − 1.",
        slides: [
          {
            id: "ed-3",
            title: L`Media y mediana`,
            lead: L`La media se mueve con los datos extremos; la mediana no.`,
            body: L`<p>La media \(\bar{x}=\sum x_i/n\) incorpora la magnitud de todos los valores. La mediana \(Q_2\) depende de sus posiciones una vez ordenados.</p><div class="enunciado">Los 20 valores simulados son los que se muestran debajo. Cambiar únicamente 34,3 por 54,3 MPa permite estudiar sensibilidad; no autoriza eliminar un dato real porque sea extremo.</div><p class="datos-ejercicio"><strong>Datos simulados (MPa):</strong> 22,9; 24,1; 24,8; 25,6; 26,0; 26,4; 26,9; 27,2; 27,5; 27,9; 28,2; 28,4; 28,9; 29,3; 29,8; 30,4; 30,9; 31,6; 32,5; 34,3.</p>`,
            visual: "atipico",
            codigo: { python: "np.mean(x), np.median(x)", excel: "=PROMEDIO(rango), =MEDIANA(rango)" },
            source: "Devore; Hayter."
          },
          {
            id: "ed-9",
            title: L`Misma media, distinta dispersión`,
            lead: L`Dos conjuntos pueden tener la misma media y ser muy distintos; la media sola no basta.`,
            body: L`<p>Conjunto ${k("azul", "A")}: 28, 29, 30, 31, 32. Conjunto ${k("ocre", "B")}: 22, 26, 30, 34, 38.</p><p>Ambos tienen \(\bar x=30\) y mediana 30.</p><p>Varianzas:</p><p>\[\begin{aligned} s_A^2&=\frac{4+1+0+1+4}{4}=\azul{2{,}5}\\ s_B^2&=\frac{64+16+0+16+64}{4}=\ocre{40} \end{aligned}\]</p><p>Los datos de B se alejan 4 veces más del centro: \(s_A=1{,}58\), \(s_B=6{,}32\).</p>`,
            figure: `<svg viewBox="0 0 600 330" role="img" aria-label="Dos conjuntos de datos con media 30 y dispersión distinta"><text x="40" y="40" font-size="22" font-weight="700" fill="#1F5FA8">A: 28, 29, 30, 31, 32</text><line x1="40" y1="120" x2="560" y2="120" stroke="#565A5C" stroke-width="2"/><circle cx="248" cy="106" r="10" fill="#1F5FA8" fill-opacity=".85"/><text x="248" y="144" text-anchor="middle" font-size="17" fill="#1e231f">28</text><circle cx="274" cy="106" r="10" fill="#1F5FA8" fill-opacity=".85"/><text x="274" y="144" text-anchor="middle" font-size="17" fill="#1e231f">29</text><circle cx="300" cy="106" r="10" fill="#1F5FA8" fill-opacity=".85"/><text x="300" y="144" text-anchor="middle" font-size="17" fill="#1e231f">30</text><circle cx="326" cy="106" r="10" fill="#1F5FA8" fill-opacity=".85"/><text x="326" y="144" text-anchor="middle" font-size="17" fill="#1e231f">31</text><circle cx="352" cy="106" r="10" fill="#1F5FA8" fill-opacity=".85"/><text x="352" y="144" text-anchor="middle" font-size="17" fill="#1e231f">32</text><line x1="300" y1="74" x2="300" y2="124" stroke="#A61C31" stroke-width="3" stroke-dasharray="6 4"/><text x="40" y="200" font-size="22" font-weight="700" fill="#A85400">B: 22, 26, 30, 34, 38</text><line x1="40" y1="280" x2="560" y2="280" stroke="#565A5C" stroke-width="2"/><circle cx="92" cy="266" r="10" fill="#A85400" fill-opacity=".85"/><text x="92" y="304" text-anchor="middle" font-size="17" fill="#1e231f">22</text><circle cx="196" cy="266" r="10" fill="#A85400" fill-opacity=".85"/><text x="196" y="304" text-anchor="middle" font-size="17" fill="#1e231f">26</text><circle cx="300" cy="266" r="10" fill="#A85400" fill-opacity=".85"/><text x="300" y="304" text-anchor="middle" font-size="17" fill="#1e231f">30</text><circle cx="404" cy="266" r="10" fill="#A85400" fill-opacity=".85"/><text x="404" y="304" text-anchor="middle" font-size="17" fill="#1e231f">34</text><circle cx="508" cy="266" r="10" fill="#A85400" fill-opacity=".85"/><text x="508" y="304" text-anchor="middle" font-size="17" fill="#1e231f">38</text><line x1="300" y1="234" x2="300" y2="284" stroke="#A61C31" stroke-width="3" stroke-dasharray="6 4"/><text x="310" y="40" font-size="18" fill="#A61C31">— media = 30</text></svg>`,
            source: "Apuntes del docente."
          },
          {
            id: "ed-10",
            title: L`Por qué la varianza eleva al cuadrado`,
            lead: L`Las desviaciones respecto a la media siempre suman cero; elevarlas al cuadrado evita que se cancelen.`,
            body: L`<p>Con el conjunto B: desviaciones \(x_i-\bar x\) = −8, −4, 0, 4, 8. Su suma es \(\sum(x_i-\bar x)=0\), y lo mismo pasa con cualquier conjunto, porque \(\sum x_i=n\bar x\).</p><p>Al cuadrado: 64, 16, 0, 16, 64. Todas cuentan como positivas y las desviaciones grandes pesan más.</p><p>La varianza queda en unidades al cuadrado; la desviación estándar \(s=\sqrt{s^2}\) devuelve las unidades de los datos.</p>`,
            formula: L`\sum_{i=1}^{n}(x_i-\bar x)=\sum x_i-n\bar x=0\qquad\qquad s^2=\frac{\sum(x_i-\bar x)^2}{n-1}`,
            source: "Apuntes del docente; Hayter."
          },
          {
            id: "ed-4",
            title: L`Varianza muestral`,
            lead: L`Se divide entre \(n-1\) porque las desviaciones se miden respecto a \(\bar x\), calculada con los mismos datos.`,
            body: L`<p>Las desviaciones respecto a \(\bar{x}\) suman cero: conocidas \(n-1\), la última queda determinada.</p><p>Para observaciones independientes con igual distribución y varianza finita, \(E[\sum(X_i-\bar{X})^2]=(n-1)\sigma^2\). Por eso dividir entre \(n-1\) produce un estimador insesgado de la varianza poblacional.</p>`,
            formula: L`\morado{S^2} = \frac{\sum_{i=1}^{n} (X_i - \azul{\bar{X}})^2}{\ocre{n - 1}} \qquad\Longrightarrow\qquad E(\morado{S^2}) = \sigma^2`,
            lectura: L`La corrección es una propiedad del promedio de muchas muestras. Una varianza muestral concreta puede quedar por encima o por debajo de \(\sigma^2\).`,
            visual: "sesgo_varianza",
            codigo: { python: "np.var(x, ddof=1), np.std(x, ddof=1)", excel: "=VAR.S(rango), =DESVEST.M(rango)" },
            source: "Montgomery y Runger; Hayter."
          }
        ]
      },
      {
        id: "posicion_forma",
        title: "Cuartiles y medidas de forma",
        summary: "Cuartiles, rango intercuartílico RIC, diagrama de caja, coeficiente de variación, asimetría y curtosis.",
        slides: [
          {
            id: "ed-5",
            title: L`Cuartiles y diagrama de caja`,
            lead: L`Los cuartiles dividen los datos ordenados en cuatro partes con el mismo número de datos.`,
            body: L`<p>\(Q_1\), \(Q_2\) y \(Q_3\) estiman las posiciones del 25 %, 50 % y 75 %. En muestras pequeñas hay varias convenciones de interpolación.</p><p>Aquí se usa la posición \(p(n+1)\). La caja va de \(Q_1\) a \(Q_3\), y \(\mathrm{RIC}=Q_3-Q_1\).</p><p>Los bigotes llegan al dato más extremo que aún esté dentro de las vallas \(Q_1-1{,}5\mathrm{RIC}\) y \(Q_3+1{,}5\mathrm{RIC}\); no terminan necesariamente en las vallas.</p>`,
            figure: F.caja(D, { xmin: 20, xmax: 37, ticks: [20, 24, 28, 32, 36], note: `En los 20 cilindros: \\(Q_1 = ${co(R.q1, 2)}\\), \\(Q_2 = ${co(R.median, 2)}\\), \\(Q_3 = ${co(R.q3, 2)}\\text{ MPa}\\), y \\(\\mathrm{RIC} = ${co(R.q3 - R.q1, 2)}\\text{ MPa}\\).` }),
            codigo: {python: "np.quantile(x, [0.25,0.5,0.75], method='weibull')", excel: "=CUARTIL.EXC(rango; 1)"},
            source: "Tukey; Montgomery y Runger; Hayter."
          },
          {
            id: "ed-6",
            title: L`Coeficiente de variación, asimetría y curtosis`,
            lead: L`Dispersión relativa a la media y forma de la distribución.`,
            body: L`<table class="modelos"><tr><td>Variación relativa</td><td>\(\mathrm{CV}=s/\bar{x}\). Útil en escalas de razón, con cero significativo y media positiva lejos de cero.</td></tr><tr><td>Asimetría</td><td>\(g_1=m_3/m_2^{3/2}\). Una distribución simétrica tiene tercer momento central cero si existe; el recíproco no está garantizado.</td></tr><tr><td>Curtosis</td><td>\(g_2=m_4/m_2^2\). Resume peso de observaciones extremas; la normal tiene 3. El exceso es \(g_2-3\).</td></tr></table><p>\(m_k=n^{-1}\sum(x_i-\bar{x})^k\). Estas medidas complementan el gráfico; con pocos datos pueden ser inestables.</p>`,
            codigo: {python: "scipy.stats.skew(x, bias=True); scipy.stats.kurtosis(x, fisher=False, bias=True)", excel: "Usar momentos m2, m3 y m4 definidos arriba"},
            source: "Programas del curso; definiciones por momentos."
          }
        ]
      },
      {
        id: "taller",
        title: "Taller con tabla",
        summary: "Datos sin ordenar: media, mediana, cuartiles, varianza con dos fórmulas, frecuencias",
        slides: [
          {
            id: "ed-8",
            title: L`Taller: resumir un conjunto de datos`,
            lead: L`Media, mediana, cuartiles, varianza con sus dos fórmulas y desviación estándar, a partir de datos sin ordenar.`,
            body: L`<div class="enunciado"><strong>Datos.</strong> Resistencia a compresión de 10 cilindros de concreto, en el orden en que llegaron del laboratorio (MPa): <strong>28, 31, 25, 30, 27, 33, 26, 29, 32, 29</strong>.</div><p>Calcular, paso a paso: media, mediana, moda, rango, cuartiles \(Q_1, Q_2, Q_3\), varianza con sus dos fórmulas, desviación estándar y coeficiente de variación.</p>`,
            formula: L`\azul{\bar x}=\frac{\sum x_i}{n} \qquad \morado{s^2}=\frac{\sum (x_i-\azul{\bar x})^2}{n-1}=\frac{\sum x_i^2-n\,\azul{\bar x}^2}{n-1} \qquad s=\sqrt{\morado{s^2}}`,
            lectura: L`Las dos fórmulas de la varianza dan lo mismo: la primera mide desviaciones; la segunda ahorra la columna de diferencias.`,
            codigo: { python: "np.mean(x), np.median(x), np.var(x, ddof=1), np.std(x, ddof=1)", excel: "=PROMEDIO(r), =MEDIANA(r), =MODA.UNO(r), =VAR.S(r), =DESVEST.M(r), =CUARTIL.EXC(r;1)" },
            source: L`Ejemplo didáctico; datos hipotéticos.`,
            abajo: [
              {
                title: L`Taller, paso 1: ordenar y ubicar el centro`,
                body: L`<div class="enunciado"><strong>Datos sin ordenar (MPa):</strong> 28, 31, 25, 30, 27, 33, 26, 29, 32, 29. Halle media, mediana, moda y rango.</div><ol class="pasos"><li><strong>Ordenar de menor a mayor:</strong> 25, 26, 27, 28, 29, 29, 30, 31, 32, 33.</li><li><strong>Media:</strong> \(\bar x=\dfrac{\sum x_i}{n}=\dfrac{290}{10}=29\) MPa.</li><li><strong>Mediana:</strong> con \(n=10\) (par), promediar los datos 5.º y 6.º: \(\tilde x=\dfrac{29+29}{2}=29\) MPa.</li><li><strong>Moda:</strong> 29 MPa, el único valor que se repite.</li><li><strong>Rango:</strong> \(33-25=8\) MPa.</li></ol>`,
                source: L`Ejemplo didáctico; datos hipotéticos.`
              },
              {
                title: L`Taller, paso 2: cuartiles`,
                body: L`<div class="enunciado"><strong>Datos ordenados (MPa):</strong> 25, 26, 27, 28, 29, 29, 30, 31, 32, 33. Halle \(Q_1, Q_2, Q_3\) con la posición \(p(n+1)\) e interpolación, el RIC y las vallas.</div><ol class="pasos"><li><strong>\(Q_1\):</strong> posición \(0{,}25(11)=2{,}75\), entre el 2.º (26) y el 3.º (27): \(Q_1=26+0{,}75(27-26)=26{,}75\).</li><li><strong>\(Q_2\):</strong> posición \(0{,}5(11)=5{,}5\): \(Q_2=29\), la mediana.</li><li><strong>\(Q_3\):</strong> posición \(0{,}75(11)=8{,}25\), entre el 8.º (31) y el 9.º (32): \(Q_3=31+0{,}25(1)=31{,}25\).</li><li><strong>RIC:</strong> \(31{,}25-26{,}75=4{,}5\) MPa. Vallas: \(26{,}75-1{,}5(4{,}5)=20\) y \(31{,}25+1{,}5(4{,}5)=38\). Ningún dato queda fuera: no hay atípicos.</li></ol>`,
                source: L`Ejemplo didáctico; datos hipotéticos.`
              },
              {
                title: L`Taller, paso 3: varianza con la tabla de desviaciones`,
                body: L`<div style="display:flex;gap:1.4em;align-items:flex-start"><table class="tabla-num" style="width:auto;font-size:.9em"><tr><th>\(i\)</th><th>\(x_i\)</th><th>\(x_i-\bar x\)</th><th>\((x_i-\bar x)^2\)</th></tr><tr><td>1</td><td>28</td><td class="fragment" data-fragment-index="1">−1</td><td class="fragment" data-fragment-index="2">1</td></tr><tr><td>2</td><td>31</td><td class="fragment" data-fragment-index="1">2</td><td class="fragment" data-fragment-index="2">4</td></tr><tr><td>3</td><td>25</td><td class="fragment" data-fragment-index="1">−4</td><td class="fragment" data-fragment-index="2">16</td></tr><tr><td>4</td><td>30</td><td class="fragment" data-fragment-index="1">1</td><td class="fragment" data-fragment-index="2">1</td></tr><tr><td>5</td><td>27</td><td class="fragment" data-fragment-index="1">−2</td><td class="fragment" data-fragment-index="2">4</td></tr><tr><td>6</td><td>33</td><td class="fragment" data-fragment-index="1">4</td><td class="fragment" data-fragment-index="2">16</td></tr><tr><td>7</td><td>26</td><td class="fragment" data-fragment-index="1">−3</td><td class="fragment" data-fragment-index="2">9</td></tr><tr><td>8</td><td>29</td><td class="fragment" data-fragment-index="1">0</td><td class="fragment" data-fragment-index="2">0</td></tr><tr><td>9</td><td>32</td><td class="fragment" data-fragment-index="1">3</td><td class="fragment" data-fragment-index="2">9</td></tr><tr><td>10</td><td>29</td><td class="fragment" data-fragment-index="1">0</td><td class="fragment" data-fragment-index="2">0</td></tr><tr style="border-top:2px solid var(--rule);font-weight:700"><td>\(\Sigma\)</td><td>290</td><td class="fragment" data-fragment-index="3">0</td><td class="fragment" data-fragment-index="3">60</td></tr></table><div style="flex:1"><p class="fragment" data-fragment-index="1" style="margin:.25em 0"><strong>1.</strong> Restar la media \(\bar x=29\) a cada dato (en el orden original; no hace falta ordenar).</p><p class="fragment" data-fragment-index="2" style="margin:.25em 0"><strong>2.</strong> Elevar al cuadrado cada diferencia: así los signos no se cancelan.</p><p class="fragment" data-fragment-index="3" style="margin:.25em 0"><strong>3.</strong> Sumar. Comprobación: las diferencias suman 0.</p><p class="fragment" data-fragment-index="4" style="margin:.25em 0"><strong>4.</strong> Varianza muestral: \(s^2=\dfrac{\sum(x_i-\bar x)^2}{n-1}=\dfrac{60}{9}=6{,}67\ \text{MPa}^2\).</p><p class="fragment" data-fragment-index="5" style="margin:.25em 0"><strong>5.</strong> Desviación estándar: \(s=\sqrt{6{,}67}=2{,}58\) MPa, en las unidades de los datos.</p><p class="fragment" data-fragment-index="6" style="margin:.25em 0">Si los 10 cilindros fueran toda la población, se dividiría entre \(n\): \(\sigma^2=60/10=6\).</p></div></div>`,
                source: L`Ejemplo didáctico; datos hipotéticos.`
              },
              {
                title: L`Taller, paso 4: varianza con la fórmula abreviada`,
                body: L`<div style="display:flex;gap:1.4em;align-items:flex-start"><table class="tabla-num" style="width:auto;font-size:.9em"><tr><th>\(i\)</th><th>\(x_i\)</th><th>\(x_i^2\)</th></tr><tr><td>1</td><td>28</td><td class="fragment" data-fragment-index="1">784</td></tr><tr><td>2</td><td>31</td><td class="fragment" data-fragment-index="1">961</td></tr><tr><td>3</td><td>25</td><td class="fragment" data-fragment-index="1">625</td></tr><tr><td>4</td><td>30</td><td class="fragment" data-fragment-index="1">900</td></tr><tr><td>5</td><td>27</td><td class="fragment" data-fragment-index="1">729</td></tr><tr><td>6</td><td>33</td><td class="fragment" data-fragment-index="1">1089</td></tr><tr><td>7</td><td>26</td><td class="fragment" data-fragment-index="1">676</td></tr><tr><td>8</td><td>29</td><td class="fragment" data-fragment-index="1">841</td></tr><tr><td>9</td><td>32</td><td class="fragment" data-fragment-index="1">1024</td></tr><tr><td>10</td><td>29</td><td class="fragment" data-fragment-index="1">841</td></tr><tr style="border-top:2px solid var(--rule);font-weight:700"><td>\(\Sigma\)</td><td>290</td><td class="fragment" data-fragment-index="2">8470</td></tr></table><div style="flex:1"><p class="fragment" data-fragment-index="1" style="margin:.25em 0"><strong>1.</strong> Elevar al cuadrado cada dato, sin restar la media.</p><p class="fragment" data-fragment-index="2" style="margin:.25em 0"><strong>2.</strong> Sumar: \(\sum x_i=290\) y \(\sum x_i^2=8470\).</p><p class="fragment" data-fragment-index="3" style="margin:.25em 0"><strong>3.</strong> \(s^2=\dfrac{\sum x_i^2-n\bar x^2}{n-1}=\dfrac{8470-10(29)^2}{9}=\dfrac{8470-8410}{9}=\dfrac{60}{9}\).</p><p class="fragment" data-fragment-index="4" style="margin:.25em 0"><strong>4.</strong> Otra forma, sin calcular antes la media: \(s^2=\dfrac{\sum x_i^2-(\sum x_i)^2/n}{n-1}=\dfrac{8470-290^2/10}{9}=6{,}67\).</p><p class="fragment" data-fragment-index="5" style="margin:.25em 0"><strong>5.</strong> Mismo resultado que con la tabla de desviaciones. Si la media se redondea, no redondear antes de restar: se restan dos números grandes.</p></div></div>`,
                source: L`Ejemplo didáctico; datos hipotéticos.`
              },
              {
                title: L`Taller, paso 5: comprobación con calculadora y Excel`,
                body: L`<div class="enunciado"><strong>Resultados de los pasos anteriores.</strong> \(\bar x=29\), \(\tilde x=29\), moda 29, rango 8, \(Q_1=26{,}75\), \(Q_3=31{,}25\), \(s^2=6{,}67\) MPa², \(s=2{,}58\) MPa. Complete el resumen y verifique con calculadora o Excel.</div><ol class="pasos"><li><strong>Coeficiente de variación:</strong> \(CV=\dfrac{s}{\bar x}=\dfrac{2{,}58}{29}=8{,}9\,\%\): dispersión relativa baja.</li><li><strong>Lectura:</strong> media y mediana coinciden y no hay atípicos: datos aproximadamente simétricos alrededor de 29 MPa.</li><li><strong>Calculadora científica (modo estadístico):</strong> ingresar los 10 datos; \(\bar x=29\), \(\sigma_x=2{,}449\) (divide entre \(n\)) y \(s_x=2{,}582\) (divide entre \(n-1\)).</li><li><strong>Excel:</strong> =PROMEDIO, =MEDIANA, =MODA.UNO, =VAR.S (6,667), =DESVEST.M (2,582), =CUARTIL.EXC(r;1) (26,75) y =CUARTIL.EXC(r;3) (31,25).</li></ol>`,
                source: L`Ejemplo didáctico; datos hipotéticos.`
              },
              {
                title: L`Taller, paso 6: datos repetidos en una tabla de frecuencias`,
                body: L`<div class="enunciado">Se contaron las grietas visibles en 20 vigas: 3 vigas sin grietas, 6 con una, 5 con dos, 4 con tres y 2 con cuatro. Halle mediana, moda, media, varianza y desviación estándar.</div><div style="display:flex;gap:1.2em;align-items:flex-start"><table class="tabla-num" style="width:auto;font-size:.88em"><tr><th>\(x\)</th><th>\(f\)</th><th>\(F\)</th><th>\(f\,x\)</th><th>\(f\,(x-\bar x)^2\)</th><th>\(f\,x^2\)</th></tr><tr><td>0</td><td>3</td><td class="fragment" data-fragment-index="1">3</td><td class="fragment" data-fragment-index="2">0</td><td class="fragment" data-fragment-index="4">9,72</td><td class="fragment" data-fragment-index="6">0</td></tr><tr><td>1</td><td>6</td><td class="fragment" data-fragment-index="1">9</td><td class="fragment" data-fragment-index="2">6</td><td class="fragment" data-fragment-index="4">3,84</td><td class="fragment" data-fragment-index="6">6</td></tr><tr><td>2</td><td>5</td><td class="fragment" data-fragment-index="1">14</td><td class="fragment" data-fragment-index="2">10</td><td class="fragment" data-fragment-index="4">0,2</td><td class="fragment" data-fragment-index="6">20</td></tr><tr><td>3</td><td>4</td><td class="fragment" data-fragment-index="1">18</td><td class="fragment" data-fragment-index="2">12</td><td class="fragment" data-fragment-index="4">5,76</td><td class="fragment" data-fragment-index="6">36</td></tr><tr><td>4</td><td>2</td><td class="fragment" data-fragment-index="1">20</td><td class="fragment" data-fragment-index="2">8</td><td class="fragment" data-fragment-index="4">9,68</td><td class="fragment" data-fragment-index="6">32</td></tr><tr style="border-top:2px solid var(--rule);font-weight:700"><td>\(\Sigma\)</td><td>20</td><td></td><td class="fragment" data-fragment-index="2">36</td><td class="fragment" data-fragment-index="4">29,2</td><td class="fragment" data-fragment-index="6">94</td></tr></table><div style="flex:1"><p class="fragment" data-fragment-index="1" style="margin:.25em 0"><strong>1. Acumulada F:</strong> los datos 10.º y 11.º caen en \(x=2\): mediana 2. Moda: 1 (mayor frecuencia).</p><p class="fragment" data-fragment-index="3" style="margin:.25em 0"><strong>2. Media:</strong> \(\bar x=\dfrac{\sum f\,x}{n}=\dfrac{36}{20}=1{,}8\) grietas por viga.</p><p class="fragment" data-fragment-index="5" style="margin:.25em 0"><strong>3. Varianza con la tabla:</strong> \(s^2=\dfrac{\sum f\,(x-\bar x)^2}{n-1}=\dfrac{29{,}2}{19}=1{,}537\); \(s=1{,}24\).</p><p class="fragment" data-fragment-index="7" style="margin:.25em 0"><strong>4. Con la fórmula:</strong> \(s^2=\dfrac{94-20(1{,}8)^2}{19}=\dfrac{29{,}2}{19}\). Cada valor cuenta tantas veces como su frecuencia.</p></div></div>`,
                source: L`Ejemplo didáctico; datos hipotéticos.`
              }
            ]
          }
        ]
      }
    ]
  };
}());
