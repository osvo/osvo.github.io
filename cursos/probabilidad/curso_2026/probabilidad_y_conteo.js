/* Probabilidad, conteo y teorema de Bayes.
   Orden y ejemplos de los apuntes del docente (fuentes/apuntes_profesor), resultados verificados.
   Definiciones primero; en cada ejemplo: eventos o variable, fórmula, sustitución con el mismo color del dato, resultado en verde.
   Notación de la calculadora para conteo: nPr y nCr. */
(function () {
  "use strict";
  const F = window.Fig, K = F.K, L = F.L, k = F.k;

  const pasos = (lista) => `<ol class="pasos">${lista.map((x) => `<li>${x}</li>`).join("")}</ol>`;
  const ej = (o) => ({ title: o.t, lead: o.lead, body: `<div class="enunciado">${o.e}</div>` + pasos(o.p), figure: o.fig, notes: o.n, source: o.s });
  const AP = "Ejemplo de los apuntes del docente.";
  const AW = "Ejemplo de los apuntes del docente (Walpole et al.).";

  function figEspacioMuestral() {
    return `<svg viewBox="0 0 600 330" role="img" aria-label="Espacio muestral de dos lanzamientos de moneda y el evento al menos una cara">
      <rect x="10" y="10" width="580" height="310" fill="#fff" stroke="${K.medio}" stroke-width="2"/>
      <text x="28" y="44" font-size="24" font-weight="700" fill="${K.medio}">S</text>
      <ellipse cx="250" cy="175" rx="190" ry="115" fill="${K.azul}" fill-opacity=".10" stroke="${K.azul}" stroke-width="3"/>
      <text x="120" y="92" font-size="24" font-weight="700" fill="${K.azul}">A: al menos una cara</text>
      <text x="170" y="170" text-anchor="middle" font-size="28" fill="${K.tinta}">cc</text>
      <text x="290" y="150" text-anchor="middle" font-size="28" fill="${K.tinta}">cs</text>
      <text x="290" y="220" text-anchor="middle" font-size="28" fill="${K.tinta}">sc</text>
      <text x="510" y="190" text-anchor="middle" font-size="28" fill="${K.tinta}">ss</text>
      <text x="510" y="232" text-anchor="middle" font-size="20" fill="${K.medio}">A′</text>
    </svg>`;
  }

  function figIndependencia() {
    return `<svg viewBox="0 0 640 340" role="img" aria-label="Eventos excluyentes separados; eventos independientes como franjas en un espacio uniforme">
      <rect x="16" y="18" width="294" height="300" fill="white" stroke="${K.medio}"/>
      <text x="163" y="50" text-anchor="middle" font-size="22" font-weight="700">Excluyentes</text>
      <circle cx="96" cy="165" r="51" fill="${K.azul}" fill-opacity=".18" stroke="${K.azul}" stroke-width="3"/>
      <circle cx="230" cy="165" r="51" fill="${K.ocre}" fill-opacity=".18" stroke="${K.ocre}" stroke-width="3"/>
      <text x="96" y="173" text-anchor="middle" font-size="26">A</text><text x="230" y="173" text-anchor="middle" font-size="26">B</text>
      <text x="163" y="282" text-anchor="middle" font-size="21">A ∩ B = ∅</text>
      <rect x="326" y="18" width="298" height="300" fill="white" stroke="${K.medio}"/>
      <text x="475" y="50" text-anchor="middle" font-size="22" font-weight="700">Independientes</text>
      <rect x="365" y="80" width="220" height="160" fill="white" stroke="${K.medio}" stroke-width="2"/>
      <rect x="365" y="80" width="88" height="160" fill="${K.azul}" fill-opacity=".25"/>
      <rect x="365" y="160" width="220" height="80" fill="${K.ocre}" fill-opacity=".25"/>
      <path d="M453 80V240M365 160H585" stroke="${K.medio}" stroke-dasharray="5 4"/>
      <text x="405" y="129" text-anchor="middle" font-size="22">A</text><text x="525" y="207" text-anchor="middle" font-size="22">B</text>
      <text x="475" y="276" text-anchor="middle" font-size="19">P(A) = 0,4 · P(B) = 0,5</text>
      <text x="475" y="304" text-anchor="middle" font-size="19">P(A ∩ B) = 0,2 = 0,4 · 0,5</text>
    </svg>`;
  }

  function arbol(causas, efecto, titulo) {
    const n = causas.length, H = 340, gap = H / n;
    let s = `<svg viewBox="0 0 560 ${H}" role="img" aria-label="${titulo}">`;
    causas.forEach(([c, pc, pd], i) => {
      const y = gap * i + gap / 2;
      s += `<line x1="40" y1="${H / 2}" x2="200" y2="${y}" stroke="${K.azul}" stroke-width="3"/>`;
      s += `<text x="105" y="${(H / 2 + y) / 2 - 8}" font-size="21" font-weight="700" fill="${K.azul}">${pc}</text>`;
      s += `<text x="215" y="${y + 8}" text-anchor="middle" font-size="22" font-weight="700" fill="${K.azul}">${c}</text>`;
      s += `<line x1="240" y1="${y}" x2="380" y2="${y - 22}" stroke="${K.ocre}" stroke-width="3"/><text x="295" y="${y - 22}" font-size="20" font-weight="700" fill="${K.ocre}">${pd}</text>`;
      s += `<text x="392" y="${y - 15}" font-size="22" font-weight="700" fill="${K.ocre}">${efecto}</text>`;
      s += `<line x1="240" y1="${y}" x2="380" y2="${y + 22}" stroke="${K.gris}" stroke-width="2.5"/><text x="392" y="${y + 30}" font-size="22" fill="${K.medio}">${efecto}′</text>`;
    });
    return s + `<circle cx="40" cy="${H / 2}" r="7" fill="${K.tinta}"/></svg>`;
  }

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

  function venn3() {
    const t = (x, y, v, c) => `<text x="${x}" y="${y}" text-anchor="middle" font-size="28" font-weight="700" fill="${c}">${v}</text>`;
    return `<svg viewBox="0 0 560 380" role="img" aria-label="Diagrama de Venn de tres materias con el número de estudiantes en cada región">
      <rect x="10" y="10" width="540" height="360" fill="#fff" stroke="${K.medio}" stroke-width="2"/>
      <text x="26" y="42" font-size="22" font-weight="700" fill="${K.medio}">S (165)</text>
      <circle cx="210" cy="150" r="105" fill="${K.azul}" fill-opacity=".10" stroke="${K.azul}" stroke-width="3"/>
      <circle cx="350" cy="150" r="105" fill="${K.ocre}" fill-opacity=".10" stroke="${K.ocre}" stroke-width="3"/>
      <circle cx="280" cy="260" r="105" fill="${K.morado}" fill-opacity=".10" stroke="${K.morado}" stroke-width="3"/>
      <text x="120" y="70" font-size="22" font-weight="700" fill="${K.azul}">Cálculo</text>
      <text x="380" y="70" font-size="22" font-weight="700" fill="${K.ocre}">Psicología</text>
      <text x="220" y="362" font-size="22" font-weight="700" fill="${K.morado}">Computación</text>
      ${t(165, 135, 34, K.azul)}${t(395, 135, 47, K.ocre)}${t(280, 320, 14, K.morado)}
      ${t(280, 115, 12, K.tinta)}${t(215, 235, 25, K.tinta)}${t(345, 235, 16, K.tinta)}${t(280, 195, 8, K.rojo)}
      ${t(510, 350, 9, K.medio)}
    </svg>`;
  }

  window.COURSE = {
    id: "probabilidad_y_conteo",
    title: "Probabilidad, conteo y teorema de Bayes",
    shortTitle: "Probabilidad y conteo",
    modules: [
      {
        id: "espacio",
        title: "Espacio muestral y eventos",
        slides: [
          {
            id: "pc-1",
            title: "Experimento aleatorio y espacio muestral",
            lead: L`El espacio muestral \(S\) reúne todos los resultados posibles; un evento es un subconjunto de \(S\).`,
            body: L`<p>Un ${k("azul", "experimento aleatorio")} es un proceso cuyo resultado no puede predecirse con certeza antes de realizarlo, aunque se repita en condiciones similares.</p><p>El ${k("verde", "espacio muestral")} \(S\) es el conjunto de todos los resultados posibles. Es <strong>discreto</strong> si sus resultados se pueden contar (finitos o infinitos contables) y <strong>continuo</strong> si forman un intervalo.</p><p>Un ${k("rojo", "evento")} es cualquier subconjunto de \(S\).</p>`,
            figure: figEspacioMuestral(),
            source: "Apuntes del docente; Hayter.",
            abajo: [
              ej({
                t: "Ejemplo: espacios muestrales de varios experimentos",
                e: L`Escriba el espacio muestral de cada experimento y diga si es discreto o continuo: a) lanzar un dado; b) lanzar una moneda; c) medir la duración de una lámpara en horas.`,
                p: [
                  L`<strong>a) Dado:</strong> \(S=\{1,2,3,4,5,6\}\). Discreto y finito.`,
                  L`<strong>b) Moneda:</strong> \(S=\{c,\ s\}\). Discreto y finito.`,
                  L`<strong>c) Duración:</strong> \(S=[0,\infty)\): cualquier valor no negativo. Continuo.`
                ],
                n: "",
                s: AP
              }),
              ej({
                t: "Ejemplo: lanzar una moneda dos veces",
                e: L`Se lanza una moneda dos veces. Escriba \(S\) y el evento ${k("azul", "A")} = «al menos una cara».`,
                p: [
                  L`<strong>Resultados por lanzamiento:</strong> 2; por el principio multiplicativo, \(2\times2=4\) resultados.`,
                  L`<strong>Espacio muestral:</strong> \(S=\{cc,\ cs,\ sc,\ ss\}\). El orden importa: \(cs\ne sc\).`,
                  L`<strong>Evento:</strong> \(\azul{A}=\{cc,\ cs,\ sc\}\) y su complemento \(A'=\{ss\}\).`
                ],
                n: "",
                s: AP
              })
            ]
          },
          {
            id: "pc-2",
            title: "Operaciones entre eventos y leyes de De Morgan",
            lead: L`Unión, intersección y complemento permiten escribir condiciones compuestas.`,
            body: L`<p>${k("azul", "Unión")} \(A\cup B\): ocurre \(A\), ocurre \(B\) o ambos.</p><p>${k("verde", "Intersección")} \(A\cap B\): ocurren ambos.</p><p>Complemento \(A'\): no ocurre \(A\). Diferencia \(A-B=A\cap B'\).</p><p>Si \(A\cap B=\varnothing\), los eventos son <strong>mutuamente excluyentes</strong>.</p>`,
            formula: L`(A \cup B)' = \azul{A'} \cap \ocre{B'} \qquad (A \cap B)' = \azul{A'} \cup \ocre{B'}`,
            visual: "venn_ops",
            source: "Apuntes del docente; Hayter.",
            abajo: [
              ej({
                t: "Ejemplo: eventos al lanzar un dado",
                e: L`Se lanza un dado. Sean ${k("azul", "A")} = «sale par» y ${k("ocre", "B")} = «sale impar». Halle \(A\cup B\) y \(A\cap B\). ¿Son excluyentes?`,
                p: [
                  L`<strong>Eventos:</strong> \(\azul{A}=\{2,4,6\}\), \(\ocre{B}=\{1,3,5\}\).`,
                  L`<strong>Unión:</strong> \(\azul{A}\cup\ocre{B}=\{1,2,3,4,5,6\}=S\).`,
                  L`<strong>Intersección:</strong> \(\azul{A}\cap\ocre{B}=\varnothing\): son mutuamente excluyentes.`
                ],
                n: "",
                s: AP
              }),
              ej({
                t: "Ejemplo: aumentos y promociones en una compañía",
                e: L`Una compañía tiene 350 empleados: ${k("azul", "160")} recibieron aumento, ${k("ocre", "100")} fueron promovidos y ${k("rojo", "60")} recibieron ambos. ¿Cuántos recibieron aumento sin promoción, promoción sin aumento y ninguno?`,
                p: [
                  L`<strong>Eventos:</strong> \(\azul{A}\) = recibió aumento, \(\ocre{P}\) = fue promovido. Se llena el diagrama desde el centro.`,
                  L`<strong>Centro:</strong> \(n(\rojo{A\cap P})=\rojo{60}\).`,
                  L`<strong>Aumento sin promoción:</strong> \(n(A\cap P')=\azul{160}-\rojo{60}=100\).`,
                  L`<strong>Promoción sin aumento:</strong> \(n(A'\cap P)=\ocre{100}-\rojo{60}=40\).`,
                  L`<strong>Ninguno:</strong> \(n(A'\cap P')=350-(100+\rojo{60}+40)=\verde{150}\).`
                ],
                fig: vennNumeros(100, 60, 40, 150, "A", "P", 350),
                n: "",
                s: AP
              })
            ]
          },
          {
            id: "pc-3",
            title: "Axiomas de probabilidad",
            lead: L`Tres reglas básicas; de ellas se deducen la regla del complemento y la de la suma.`,
            body: L`<p><strong>Axiomas:</strong> \(P(A)\ge0\); \(P(S)=1\); si \(A\cap B=\varnothing\), \(P(A\cup B)=P(A)+P(B)\).</p><p><strong>Consecuencias:</strong> \(P(\varnothing)=0\), \(0\le P(A)\le1\), \(P(A')=1-P(A)\).</p><p><strong>Resultados igualmente probables:</strong> \(P(A)=\dfrac{n(A)}{n(S)}\).</p>`,
            formula: L`P(\azul{A} \cup \ocre{B}) = P(\azul{A}) + P(\ocre{B}) - P(\rojo{A \cap B})`,
            lectura: L`Al sumar \(P(A)+P(B)\) la ${k("rojo", "intersección")} queda contada dos veces; se resta una vez.`,
            visual: "union",
            source: "Apuntes del docente; Hayter.",
            abajo: [
              ej({
                t: "Ejemplo: par o divisible por 3",
                e: L`Se lanza un dado. ¿Cuál es la probabilidad de obtener un número ${k("azul", "par")} o ${k("ocre", "divisible por 3")}?`,
                p: [
                  L`<strong>Eventos:</strong> \(\azul{A}=\{2,4,6\}\), \(\ocre{B}=\{3,6\}\), \(\rojo{A\cap B}=\{6\}\).`,
                  L`<strong>Regla de la suma:</strong> \[\begin{aligned} P(\azul{A}\cup\ocre{B})&=P(\azul{A})+P(\ocre{B})-P(\rojo{A\cap B})\\ &=\frac{\azul{3}}{6}+\frac{\ocre{2}}{6}-\frac{\rojo{1}}{6}=\verde{\frac{4}{6}=\frac23} \end{aligned}\]`
                ],
                n: "",
                s: AP
              }),
              ej({
                t: "Ejemplo: canicas ganadoras en una urna",
                e: L`Una urna tiene 20 canicas: 5 azules, ${k("azul", "5 blancas")}, 4 verdes, ${k("ocre", "3 rojas")} y 3 amarillas. Se gana si sale una canica blanca o roja. ¿Cuál es la probabilidad de ganar?`,
                p: [
                  L`<strong>Eventos:</strong> \(\azul{B}\) = sale blanca, \(\ocre{R}\) = sale roja. Son excluyentes: una canica no tiene dos colores.`,
                  L`<strong>Axioma 3:</strong> \[P(\azul{B}\cup\ocre{R})=P(\azul{B})+P(\ocre{R})=\frac{\azul{5}}{20}+\frac{\ocre{3}}{20}=\verde{\frac{8}{20}=\frac25}\]`
                ],
                n: "",
                s: AP
              }),
              ej({
                t: "Ejemplo: tres materias en un diagrama de Venn",
                e: L`De 165 estudiantes, ${k("azul", "79")} toman cálculo, ${k("ocre", "83")} psicología y ${k("morado", "63")} computación; 20 toman cálculo y psicología, 33 cálculo y computación, 24 psicología y computación, y ${k("rojo", "8")} las tres. ¿Cuántos toman solo psicología, exactamente dos, al menos una y ninguna?`,
                p: [
                  L`<strong>Centro:</strong> las tres, \(\rojo{8}\).`,
                  L`<strong>Parejas sin la tercera:</strong> \(20-\rojo{8}=12\), \(33-\rojo{8}=25\), \(24-\rojo{8}=16\).`,
                  L`<strong>Solo una:</strong> cálculo \(\azul{79}-12-25-\rojo{8}=34\); psicología \(\ocre{83}-12-16-\rojo{8}=47\); computación \(\morado{63}-25-16-\rojo{8}=14\).`,
                  L`<strong>Respuestas:</strong> solo psicología \(\verde{47}\); exactamente dos \(12+25+16=\verde{53}\); al menos una \(34+47+14+53+8=\verde{156}\); ninguna \(165-156=\verde{9}\).`
                ],
                fig: venn3(),
                n: "",
                s: AP
              }),
              ej({
                t: "Ejemplo: cumpleaños compartidos",
                e: L`En un salón hay \(n\) personas y cada uno de los 365 días es igual de probable como cumpleaños. ¿Cuál es la probabilidad de que al menos dos cumplan el mismo día? Calcule para \(n=23\) y \(n=42\).`,
                p: [
                  L`<strong>Evento:</strong> \(A\) = al menos una coincidencia. Es más fácil contar \(A'\) = todos los cumpleaños distintos.`,
                  L`<strong>Complemento:</strong> \[P(A')=\frac{365\cdot364\cdots(365-n+1)}{365^{\,n}}=\frac{{}_{365}P_{n}}{365^{\,n}}\]`,
                  L`<strong>Resultado:</strong> \(P(A)=1-P(A')\). Con \(n=23\): \(\verde{0{,}507}\). Con \(n=42\): \(\verde{0{,}914}\).`
                ],
                n: "",
                s: AP
              })
            ]
          },
          {
            id: "pc-3f",
            title: "Probabilidad como frecuencia relativa",
            lead: L`Estimación de \(P(A)\) con la fracción de veces que ocurrió \(A\) en datos observados.`,
            body: L`<p><strong>Frecuencia relativa:</strong> si el evento \(A\) ocurrió \(\azul{k}\) veces en \(\ocre{n}\) observaciones, \(P(A)\approx\frac{\azul{k}}{\ocre{n}}\). La aproximación mejora cuando \(\ocre{n}\) crece.</p><p><strong>Supuesto:</strong> el proceso que produjo los datos no cambia (mismos materiales, clima y prácticas). Si cambia, la estimación deja de valer.</p><p><strong>Ejemplo:</strong> de \(\ocre{425}\) ensayos de concreto a 28 días, \(\azul{49}\) quedaron por debajo de 20 MPa. Para mezclas como esas, \(P(\text{resistencia}\lt 20\text{ MPa})\approx\frac{\azul{49}}{\ocre{425}}=\verde{0{,}115}\).</p>`,
            formula: L`P(A)\approx\frac{\azul{k}}{\ocre{n}}=\frac{\azul{\text{veces que ocurrió }A}}{\ocre{\text{observaciones}}}`,
            source: "Datos de concreto UCI (Yeh, 1998)."
          },
          {
            id: "pc-3m",
            title: "Método de Montecarlo",
            lead: L`Estimación de una probabilidad simulando el experimento muchas veces en el computador.`,
            body: L`<p><strong>Receta:</strong> describir qué es aleatorio y con qué probabilidades; generar un resultado al azar; anotar si ocurrió el evento \(A\); repetir \(N\) veces; dividir.</p><p><strong>Precisión:</strong> el error típico de la estimación es \(\sqrt{p(1-p)/N}\). Para reducirlo a la mitad hacen falta cuatro veces más simulaciones.</p><p>En ingeniería se usa para estimar probabilidades de falla con muchas variables a la vez (cargas, resistencias, caudales) cuando no hay una fórmula cerrada.</p>`,
            formula: L`\hat P(A)=\frac{\verde{\text{simulaciones en que ocurre }A}}{\azul{N}}`,
            visual: "montecarlo",
            codigo: { python: "rng = np.random.default_rng(); d = rng.integers(1, 7, size=(10000, 2)); np.mean(d.sum(axis=1) >= 10)", excel: "=ALEATORIO.ENTRE(1;6) en dos columnas; =SI(A2+B2>=10;1;0); =PROMEDIO(C2:C10001)" },
            source: "Montgomery y Runger, Probabilidad y estadística aplicadas a la ingeniería."
          }
        ]
      },
      {
        id: "conteo",
        title: "Técnicas de conteo",
        slides: [
          {
            id: "pc-4",
            title: "Principio multiplicativo y factorial",
            lead: L`Si una tarea se hace en etapas sucesivas, se multiplican las opciones de cada etapa.`,
            body: L`<p><strong>Principio multiplicativo:</strong> \(n_1\) opciones en la primera etapa y \(n_2\) en la segunda dan \(n_1\,n_2\) formas.</p><p><strong>Con repetición y orden:</strong> \(r\) elecciones entre \(n\) opciones dan \(n^r\).</p><p><strong>Factorial:</strong> ordenar \(n\) objetos distintos: \(n\) opciones para el primer puesto, \(n-1\) para el segundo, …</p>`,
            formula: L`\verde{n!} = n \times (n - 1) \times (n - 2) \times \cdots \times 1 \qquad (0! = 1)`,
            visual: "arbol_conteo",
            codigo: { python: "scipy.special.factorial(n, exact=True)", excel: "=FACT(n)" },
            source: "Apuntes del docente; Hayter.",
            abajo: [
              ej({
                t: "Ejemplo: formas de vestirse",
                e: L`Rosa tiene ${k("azul", "3")} blusas, ${k("ocre", "2")} pantalones y ${k("morado", "4")} pares de zapatos. ¿De cuántas formas puede vestirse?`,
                p: [
                  L`<strong>Etapas:</strong> elegir blusa, luego pantalón, luego zapatos.`,
                  L`<strong>Principio multiplicativo:</strong> \(\azul{3}\times\ocre{2}\times\morado{4}=\verde{24}\) formas.`
                ],
                n: "",
                s: AP
              }),
              ej({
                t: "Ejemplo: rutas entre pueblos",
                e: L`Del pueblo 1 al 2 hay ${k("azul", "2")} rutas, del 2 al 3 hay ${k("ocre", "1")} y del 3 al 4 hay ${k("morado", "2")}. a) ¿De cuántas formas se va del 1 al 4? b) ¿Ida y vuelta? c) ¿Ida y vuelta sin repetir en el regreso la misma ruta de ida?`,
                p: [
                  L`<strong>a) Ida:</strong> \(\azul{2}\times\ocre{1}\times\morado{2}=\verde{4}\).`,
                  L`<strong>b) Ida y vuelta:</strong> 4 formas de ir y 4 de volver: \(4\times4=\verde{16}\).`,
                  L`<strong>c) Sin repetir la ruta completa:</strong> 4 formas de ir y, para volver, las 3 rutas distintas a la de ida: \(4\times3=\verde{12}\).`
                ],
                n: "",
                s: AP
              }),
              ej({
                t: "Ejemplo: examen de falso o verdadero",
                e: L`Un examen tiene ${k("ocre", "10")} preguntas de falso o verdadero. ¿De cuántas formas se puede responder?`,
                p: [
                  L`<strong>Cada pregunta:</strong> \(\azul{2}\) opciones; se repiten y el orden importa.`,
                  L`<strong>Con repetición:</strong> \(n^r=\azul{2}^{\ocre{10}}=\verde{1024}\) formas.`,
                  L`<strong>Consecuencia:</strong> respondiendo al azar, acertar todas tiene probabilidad \(\frac{1}{1024}\).`
                ],
                n: "",
                s: AP
              })
            ]
          },
          {
            id: "pc-5",
            title: "Permutaciones y combinaciones",
            lead: L`Permutación si importa el orden; combinación si no importa.`,
            body: L`<p>${k("azul", "Permutación")} \({}_nP_r\): se eligen \(r\) de \(n\) elementos y <strong>sí importa el orden</strong> (puestos, cargos, filas).</p><p>${k("ocre", "Combinación")} \({}_nC_r=\binom{n}{r}\): se eligen \(r\) de \(n\) y <strong>no importa el orden</strong> (grupos, comisiones, muestras).</p><p>Es la notación de la calculadora; otros textos escriben \(P_r^n\) o \(P(n,r)\).</p>`,
            formula: L`\azul{{}_{n}P_{r}} = \frac{n!}{(n - r)!} \qquad\qquad \ocre{{}_{n}C_{r}}=\binom{n}{r} = \frac{\azul{{}_{n}P_{r}}}{r!} = \frac{n!}{r!\,(n - r)!}`,
            lectura: L`Cada grupo de \(r\) elementos aparece en \(r!\) órdenes; por eso la ${k("ocre", "combinación")} divide la ${k("azul", "permutación")} entre \(r!\).`,
            visual: "conteo",
            codigo: { python: "scipy.special.perm(n, r, exact=True), scipy.special.comb(n, r, exact=True)", excel: "=PERMUTACIONES(n;r), =COMBINAT(n;r)" },
            source: "Apuntes del docente; Hayter; Walpole et al.",
            abajo: [
              ej({
                t: "Ejemplo: diez personas y un banco de cuatro puestos",
                e: L`¿De cuántas formas pueden sentarse ${k("azul", "10")} personas en un banco de ${k("ocre", "4")} puestos?`,
                p: [
                  L`<strong>¿Importa el orden?</strong> Sí: cambiar de puesto es otra disposición. Permutación.`,
                  L`<strong>Fórmula y sustitución:</strong> \[{}_{\azul{10}}P_{\ocre{4}}=\frac{\azul{10}!}{(\azul{10}-\ocre{4})!}=\frac{10!}{6!}=10\cdot9\cdot8\cdot7=\verde{5040}\]`
                ],
                n: "",
                s: AP
              }),
              ej({
                t: "Ejemplo: comisión de matemáticos y físicos",
                e: L`Se forma una comisión de ${k("azul", "2")} matemáticos elegidos entre ${k("azul", "5")} y ${k("ocre", "3")} físicos elegidos entre ${k("ocre", "7")}. ¿Cuántas comisiones hay si a) no hay restricciones; b) un físico determinado debe estar; c) dos matemáticos determinados no pueden estar?`,
                p: [
                  L`<strong>¿Importa el orden?</strong> No. Combinaciones, multiplicadas por etapas.`,
                  L`<strong>a)</strong> \(\binom{\azul{5}}{\azul{2}}\binom{\ocre{7}}{\ocre{3}}=10\cdot35=\verde{350}\).`,
                  L`<strong>b)</strong> Faltan 2 físicos de los 6 restantes: \(\binom{\azul{5}}{\azul{2}}\binom{6}{2}=10\cdot15=\verde{150}\).`,
                  L`<strong>c)</strong> Los matemáticos se eligen entre 3: \(\binom{3}{2}\binom{\ocre{7}}{\ocre{3}}=3\cdot35=\verde{105}\).`
                ],
                n: "",
                s: AP
              }),
              ej({
                t: "Ejemplo: tres canicas de una caja",
                e: L`Una caja tiene ${k("rojo", "8")} canicas rojas, ${k("azul", "3")} blancas y ${k("ocre", "9")} azules. Se sacan 3 al azar. Halle la probabilidad de a) tres blancas; b) dos rojas y una blanca; c) al menos una blanca; d) una de cada color.`,
                p: [
                  L`<strong>Casos posibles:</strong> \(\binom{20}{3}=1140\).`,
                  L`<strong>a)</strong> \(P=\dfrac{\binom{\azul{3}}{3}}{1140}=\dfrac{1}{1140}=\verde{0{,}00088}\).`,
                  L`<strong>b)</strong> \(P=\dfrac{\binom{\rojo{8}}{2}\binom{\azul{3}}{1}}{1140}=\dfrac{84}{1140}=\verde{0{,}0737}\).`,
                  L`<strong>c) Complemento</strong> (ninguna blanca): \(P=1-\dfrac{\binom{17}{3}}{1140}=1-\dfrac{680}{1140}=\verde{0{,}4035}\).`,
                  L`<strong>d)</strong> \(P=\dfrac{\binom{\rojo{8}}{1}\binom{\azul{3}}{1}\binom{\ocre{9}}{1}}{1140}=\dfrac{216}{1140}=\verde{0{,}1895}\).`
                ],
                n: "",
                s: AP
              }),
              ej({
                t: "Ejemplo: manos de póker",
                e: L`Se reparten 5 cartas de una baraja de 52. Halle la probabilidad de a) dos ases y tres jotas; b) exactamente tres ases; c) cuatro corazones y un trébol.`,
                p: [
                  L`<strong>Casos posibles:</strong> \(\binom{52}{5}=2\,598\,960\).`,
                  L`<strong>a)</strong> \(\dfrac{\binom{4}{2}\binom{4}{3}}{\binom{52}{5}}=\dfrac{6\cdot4}{2\,598\,960}=\verde{9{,}23\times10^{-6}}\).`,
                  L`<strong>b)</strong> tres de los 4 ases y dos de las 48 cartas restantes: \(\dfrac{\binom{4}{3}\binom{48}{2}}{\binom{52}{5}}=\dfrac{4\cdot1128}{2\,598\,960}=\verde{1{,}736\times10^{-3}}\).`,
                  L`<strong>c)</strong> \(\dfrac{\binom{13}{4}\binom{13}{1}}{\binom{52}{5}}=\dfrac{715\cdot13}{2\,598\,960}=\verde{3{,}576\times10^{-3}}\).`
                ],
                n: "",
                s: AP
              }),
              ej({
                t: "Ejemplo: tres libros juntos en un estante",
                e: L`Se colocan al azar en un estante ${k("azul", "6")} libros de matemáticas y ${k("ocre", "4")} de física. ¿Cuál es la probabilidad de que tres libros de matemáticas determinados queden juntos?`,
                p: [
                  L`<strong>Casos posibles:</strong> \(10!\) órdenes.`,
                  L`<strong>Favorables:</strong> se pegan los 3 libros en un bloque: quedan \(8\) objetos, \(8!\) órdenes, y el bloque se ordena por dentro de \(3!\) formas.`,
                  L`<strong>Probabilidad:</strong> \[P=\frac{8!\cdot3!}{10!}=\frac{3!}{10\cdot9}=\frac{6}{90}=\verde{\frac{1}{15}}\]`
                ],
                n: "",
                s: AP
              }),
              ej({
                t: "Ejemplo: premio mayor del Baloto",
                e: L`En el Baloto se eligen ${k("azul", "5")} números distintos del 1 al ${k("azul", "43")}, sin importar el orden, y una superbalota del 1 al ${k("ocre", "16")}. ¿Cuál es la probabilidad de ganar el premio mayor con un tiquete?`,
                p: [
                  L`<strong>Cinco números sin orden:</strong> \(\binom{\azul{43}}{\azul{5}}=962\,598\).`,
                  L`<strong>Superbalota:</strong> \(\ocre{16}\) opciones: \(962\,598\times\ocre{16}=15\,401\,568\) tiquetes.`,
                  L`<strong>Probabilidad:</strong> \(P=\dfrac{1}{15\,401\,568}=\verde{6{,}49\times10^{-8}}\).`
                ],
                n: "",
                s: "Ejemplo de los apuntes del docente; reglas del Baloto según Portafolio y El País."
              }),
              ej({
                t: "Ejemplo: PIN de cuatro dígitos sin repetir",
                e: L`Un PIN tiene ${k("ocre", "4")} dígitos del 0 al ${k("azul", "9")}. ¿Qué fracción de los PIN posibles no repite ningún dígito?`,
                p: [
                  L`<strong>Todos:</strong> con repetición, \(10^{4}=10\,000\).`,
                  L`<strong>Sin repetir:</strong> \({}_{10}P_{4}=10\cdot9\cdot8\cdot7=5040\).`,
                  L`<strong>Fracción:</strong> \(\dfrac{5040}{10\,000}=\verde{0{,}504}\).`
                ],
                n: "",
                s: AP
              })
            ]
          }
        ]
      },
      {
        id: "condicional",
        title: "Probabilidad condicional, total y Bayes",
        slides: [
          {
            id: "pc-6",
            title: "Probabilidad condicional",
            lead: L`Saber que ocurrió \(B\) reduce el espacio muestral a \(B\).`,
            body: L`<p>La probabilidad de \(A\) dado \(B\), con \(P(B)&gt;0\), es la fracción de \(B\) que también está en \(A\).</p><p><strong>Regla de la multiplicación:</strong> despejando, \(P(A\cap B)=P(B)\,P(A\mid B)=P(A)\,P(B\mid A)\).</p><p>En general \(P(A\mid B)\ne P(B\mid A)\): los denominadores son distintos.</p>`,
            formula: L`P(\verde{A} \mid \azul{B}) = \frac{P(\verde{A \cap B})}{P(\azul{B})}, \quad P(\azul{B}) > 0`,
            visual: "venn_prob",
            source: "Apuntes del docente; Hayter.",
            abajo: [
              ej({
                t: "Ejemplo: empleo por sexo en una ciudad",
                e: L`Los adultos de una ciudad pequeña que terminaron la secundaria se clasifican así:<table class="tabla-num" style="width:auto;margin:.4em 0"><tr><th></th><th>Empleado</th><th>Desempleado</th><th>Total</th></tr><tr><td>Hombre</td><td>${k("azul", "460")}</td><td>40</td><td>500</td></tr><tr><td>Mujer</td><td>140</td><td>${k("ocre", "260")}</td><td>${k("ocre", "400")}</td></tr><tr><td>Total</td><td>${k("azul", "600")}</td><td>300</td><td>900</td></tr></table>Se elige uno al azar. Halle \(P(H\mid E)\) y \(P(D\mid M)\).`,
                p: [
                  L`<strong>Eventos:</strong> \(H\) hombre, \(M\) mujer, \(E\) empleado, \(D\) desempleado.`,
                  L`<strong>Hombre, dado que está empleado:</strong> \[P(H\mid E)=\frac{P(H\cap E)}{P(E)}=\frac{\frac{\azul{460}}{900}}{\frac{\azul{600}}{900}}=\frac{\azul{460}}{\azul{600}}=\verde{\frac{23}{30}\approx0{,}767}\]`,
                  L`<strong>Desempleada, dado que es mujer:</strong> \(P(D\mid M)=\dfrac{\ocre{260}}{\ocre{400}}=\verde{0{,}65}\).`
                ],
                n: "",
                s: AW
              }),
              ej({
                t: "Ejemplo: vehículo y vivienda propia en un barrio",
                e: L`En un barrio, el ${k("azul", "18 %")} de las familias tiene vehículo, el ${k("ocre", "20 %")} vivienda propia y el ${k("rojo", "12 %")} ambas cosas. Halle a) la probabilidad de que una familia tenga vivienda propia dado que tiene vehículo; b) la probabilidad de que tenga vehículo dado que no tiene vivienda propia.`,
                p: [
                  L`<strong>Eventos:</strong> \(\azul{V}\) = tiene vehículo, \(\ocre{H}\) = tiene vivienda propia.`,
                  L`<strong>a)</strong> \[P(\ocre{H}\mid\azul{V})=\frac{P(\rojo{H\cap V})}{P(\azul{V})}=\frac{\rojo{0{,}12}}{\azul{0{,}18}}=\verde{\frac23}\]`,
                  L`<strong>b)</strong> \(P(V\cap H')=\azul{0{,}18}-\rojo{0{,}12}=0{,}06\) y \(P(H')=1-\ocre{0{,}20}=0{,}80\): \[P(V\mid H')=\frac{0{,}06}{0{,}80}=\verde{0{,}075}\]`
                ],
                fig: vennNumeros("0,06", "0,12", "0,08", "0,74", "V", "H", "1"),
                n: "",
                s: AP
              }),
              ej({
                t: "Ejemplo: dos hijos",
                e: L`Una familia tiene dos hijos; cada uno es niña (M) o niño (H) con probabilidad \(\frac12\), de forma independiente. Halle a) \(P(\text{dos niñas}\mid\text{al menos una niña})\); b) \(P(\text{dos niñas}\mid\text{la mayor es niña})\).`,
                p: [
                  L`<strong>Espacio muestral</strong> (mayor, menor): MM, MH, HM, HH, cada uno con \(\frac14\).`,
                  L`<strong>a)</strong> «Al menos una niña» deja MM, MH, HM: \[P=\frac{\frac14}{\frac34}=\verde{\frac13}\]`,
                  L`<strong>b)</strong> «La mayor es niña» deja MM, MH: \[P=\frac{\frac14}{\frac24}=\verde{\frac12}\]`
                ],
                n: "",
                s: AP
              }),
              ej({
                t: "Ejemplo: dos monedas falsas en una caja",
                e: L`Una caja tiene ${k("azul", "10")} monedas, ${k("ocre", "2")} de ellas falsas. Se sacan dos sin reemplazo. ¿Cuál es la probabilidad de que ambas sean falsas?`,
                p: [
                  L`<strong>Eventos:</strong> \(F_1\) = la primera es falsa, \(F_2\) = la segunda es falsa.`,
                  L`<strong>Regla de la multiplicación:</strong> \[P(F_1\cap F_2)=P(F_1)\,P(F_2\mid F_1)=\frac{\ocre{2}}{\azul{10}}\cdot\frac{1}{9}=\verde{\frac{1}{45}\approx0{,}022}\]`
                ],
                n: "",
                s: AP
              })
            ]
          },
          {
            id: "pc-7",
            title: "Independencia y eventos excluyentes",
            lead: L`Dos eventos son independientes si saber que uno ocurrió no cambia la probabilidad del otro.`,
            body: L`<p>Definición: \(P(A\cap B)=P(A)\,P(B)\). Si \(P(B)&gt;0\), equivale a \(P(A\mid B)=P(A)\).</p><p><strong>Excluyentes:</strong> \(A\cap B=\varnothing\), no ocurren a la vez. <strong>Independientes:</strong> no se afectan. Si ambos tienen probabilidad positiva, excluyentes implica dependientes.</p>`,
            formula: L`P(\azul{A} \cap \ocre{B}) = P(\azul{A})\,P(\ocre{B})`,
            figure: figIndependencia(),
            source: "Apuntes del docente; Hayter.",
            abajo: [
              ej({
                t: "Ejemplo: carro de bomberos y ambulancia",
                e: L`Un pueblo tiene un carro de bomberos, disponible con probabilidad ${k("azul", "0,98")}, y una ambulancia, disponible con probabilidad ${k("ocre", "0,92")}, de forma independiente. Si hay un incendio con heridos, ¿cuál es la probabilidad de que ambos estén disponibles?`,
                p: [
                  L`<strong>Eventos:</strong> \(\azul{B}\) = carro disponible, \(\ocre{A}\) = ambulancia disponible.`,
                  L`<strong>Independencia:</strong> \[P(\azul{B}\cap\ocre{A})=P(\azul{B})\,P(\ocre{A})=\azul{0{,}98}\times\ocre{0{,}92}=\verde{0{,}9016}\]`
                ],
                n: "",
                s: AW
              }),
              ej({
                t: "Ejemplo: moneda cargada",
                e: L`Una moneda está cargada de modo que la cara es dos veces más probable que el sello. Se lanza tres veces. ¿Cuál es la probabilidad de obtener exactamente dos sellos y una cara?`,
                p: [
                  L`<strong>Probabilidades por lanzamiento:</strong> \(P(c)=2P(s)\) y \(P(c)+P(s)=1\), así que \(\azul{P(s)=\frac13}\) y \(\ocre{P(c)=\frac23}\).`,
                  L`<strong>Una secuencia</strong>, por ejemplo \(ssc\), por independencia: \(\azul{\frac13}\cdot\azul{\frac13}\cdot\ocre{\frac23}=\frac{2}{27}\).`,
                  L`<strong>Secuencias posibles:</strong> \(ssc,\ scs,\ css\), tres: \[P=3\cdot\frac{2}{27}=\verde{\frac29}\]`
                ],
                n: "",
                s: AP
              }),
              ej({
                t: "Ejemplo: tres ases seguidos sin reposición",
                e: L`De una baraja española de ${k("azul", "40")} cartas (${k("ocre", "4")} ases) se sacan tres cartas sin reposición. ¿Cuál es la probabilidad de que las tres sean ases?`,
                p: [
                  L`<strong>Eventos:</strong> \(A_i\) = la carta \(i\) es as. No son independientes: cada as que sale cambia la caja.`,
                  L`<strong>Regla de la multiplicación:</strong> \[P(A_1\cap A_2\cap A_3)=\frac{\ocre{4}}{\azul{40}}\cdot\frac{3}{39}\cdot\frac{2}{38}=\frac{24}{59\,280}=\verde{\frac{1}{2470}}\]`
                ],
                n: "",
                s: AP
              })
            ]
          },
          {
            id: "pc-8",
            title: "Regla de la probabilidad total",
            lead: L`Si un efecto puede ocurrir por varias causas excluyentes, se suman las ramas del árbol que llevan a él.`,
            body: L`<p>\(A_1,\dots,A_k\) forman una <strong>partición</strong> de \(S\): son excluyentes y su unión es \(S\).</p><p>Entonces \(D=(D\cap A_1)\cup\cdots\cup(D\cap A_k)\), con piezas excluyentes, y cada pieza vale \(P(A_i)\,P(D\mid A_i)\).</p>`,
            formula: L`P(\ocre{D}) = \sum_{i=1}^{k} P(\azul{A_i})\,P(\ocre{D} \mid \azul{A_i})`,
            figure: arbol([["A₁", "P(A₁)", "P(D | A₁)"], ["A₂", "P(A₂)", "P(D | A₂)"], ["A₃", "P(A₃)", "P(D | A₃)"]], "D", "Árbol de probabilidad total con tres causas"),
            source: "Apuntes del docente; Hayter.",
            abajo: [
              ej({
                t: "Ejemplo: tres máquinas en una fábrica",
                e: L`Las máquinas \(M_1\), \(M_2\) y \(M_3\) producen el ${k("azul", "60 %")}, ${k("azul", "30 %")} y ${k("azul", "10 %")} de los artículos, con ${k("ocre", "2 %")}, ${k("ocre", "3 %")} y ${k("ocre", "4 %")} de defectuosos. ¿Qué probabilidad hay de que un artículo al azar sea defectuoso?`,
                p: [
                  L`<strong>Eventos:</strong> \(M_i\) = lo produjo la máquina \(i\) (causa); \(D\) = es defectuoso (efecto).`,
                  L`<strong>Probabilidad total:</strong> \[\begin{aligned} P(D)&=P(M_1)P(D\mid M_1)+P(M_2)P(D\mid M_2)+P(M_3)P(D\mid M_3)\\ &=\azul{0{,}60}(\ocre{0{,}02})+\azul{0{,}30}(\ocre{0{,}03})+\azul{0{,}10}(\ocre{0{,}04})\\ &=0{,}012+0{,}009+0{,}004=\verde{0{,}025} \end{aligned}\]`
                ],
                fig: arbol([["M₁", "0,60", "0,02"], ["M₂", "0,30", "0,03"], ["M₃", "0,10", "0,04"]], "D", "Árbol de tres máquinas y artículos defectuosos"),
                n: "",
                s: AP
              }),
              ej({
                t: "Ejemplo: bombillos de dos fábricas",
                e: L`En una ciudad, la fábrica X suministra el ${k("azul", "60 %")} de los bombillos y la Y el ${k("azul", "40 %")}. Duran más de 5000 horas el ${k("ocre", "99 %")} de los de X y el ${k("ocre", "95 %")} de los de Y. ¿Qué probabilidad hay de que un bombillo comprado al azar dure más de 5000 horas?`,
                p: [
                  L`<strong>Eventos:</strong> \(X\), \(Y\) = fábrica; \(A\) = dura más de 5000 horas.`,
                  L`<strong>Probabilidad total:</strong> \[P(A)=P(X)P(A\mid X)+P(Y)P(A\mid Y)=\azul{0{,}6}(\ocre{0{,}99})+\azul{0{,}4}(\ocre{0{,}95})=\verde{0{,}974}\]`
                ],
                n: "",
                s: AP
              }),
              ej({
                t: "Ejemplo: pasar una bola de una bolsa a otra",
                e: L`La bolsa 1 tiene ${k("azul", "4")} bolas blancas y ${k("azul", "3")} negras; la bolsa 2 tiene ${k("ocre", "3")} blancas y ${k("ocre", "5")} negras. Se pasa una bola de la bolsa 1 a la 2 sin verla y luego se saca una bola de la bolsa 2. ¿Cuál es la probabilidad de que sea negra?`,
                p: [
                  L`<strong>Causa:</strong> la bola que se pasa, \(B_1\) (blanca) o \(N_1\) (negra). <strong>Efecto:</strong> \(N_2\) = la segunda es negra.`,
                  L`<strong>Bolsa 2 tras el paso</strong> (9 bolas): si pasó blanca, 4 blancas y 5 negras; si pasó negra, 3 blancas y 6 negras.`,
                  L`<strong>Probabilidad total:</strong> \[P(N_2)=P(B_1)P(N_2\mid B_1)+P(N_1)P(N_2\mid N_1)=\frac{\azul{4}}{7}\cdot\frac{5}{9}+\frac{\azul{3}}{7}\cdot\frac{6}{9}=\frac{20+18}{63}=\verde{\frac{38}{63}}\]`
                ],
                n: "",
                s: AW
              })
            ]
          },
          {
            id: "pc-9",
            visual: "bayes_tres",
            title: "Teorema de Bayes",
            lead: L`Bayes responde por la causa cuando se conoce el efecto.`,
            body: L`<p><strong>Deducción:</strong> \(P(A_i\cap D)=P(A_i)\,P(D\mid A_i)=P(D)\,P(A_i\mid D)\). Despejando \(P(A_i\mid D)\) y usando probabilidad total en el denominador:</p>`,
            formula: L`P(\azul{A_i} \mid \ocre{D}) = \frac{P(\azul{A_i})\,P(\ocre{D} \mid \azul{A_i})}{\sum_{j} P(\azul{A_j})\,P(\ocre{D} \mid \azul{A_j})}`,
            lectura: L`Causa → efecto: <strong>probabilidad total</strong> si se pregunta por el efecto; <strong>Bayes</strong> si se pregunta por la causa. El numerador es una sola rama; el denominador, todas las ramas que llevan al efecto.`,
            source: "Apuntes del docente; Hayter.",
            abajo: [
              ej({
                t: "Ejemplo: máquina que produjo un artículo defectuoso",
                e: L`Con las máquinas \(M_1\), \(M_2\), \(M_3\) (60 %, 30 %, 10 % de la producción; 2 %, 3 %, 4 % defectuosos), se sabe que \(P(D)=0{,}025\). Si un artículo es defectuoso, ¿qué probabilidad hay de que lo haya producido \(M_2\)?`,
                p: [
                  L`<strong>Se pregunta por la causa:</strong> Bayes.`,
                  L`<strong>Fórmula y sustitución:</strong> \[P(M_2\mid D)=\frac{P(M_2)\,P(D\mid M_2)}{P(D)}=\frac{\azul{0{,}30}(\ocre{0{,}03})}{0{,}025}=\frac{0{,}009}{0{,}025}=\verde{0{,}36}\]`,
                  L`<strong>Lectura:</strong> \(M_2\) produce el 30 % de los artículos, pero el 36 % de los defectuosos.`
                ],
                n: "",
                s: AP
              }),
              ej({
                t: "Ejemplo: tres máquinas, probabilidad de cada causa",
                e: L`Las máquinas A, B y C producen el ${k("azul", "10 %")}, ${k("azul", "30 %")} y ${k("azul", "60 %")} de las piezas, con ${k("ocre", "1 %")}, ${k("ocre", "3 %")} y ${k("ocre", "5 %")} de defectuosas. a) ¿Qué probabilidad hay de que una pieza sea defectuosa? b) Si es defectuosa, ¿qué probabilidad hay de que la produjera A?`,
                p: [
                  L`<strong>a) Efecto, probabilidad total:</strong> \[P(D)=\azul{0{,}10}(\ocre{0{,}01})+\azul{0{,}30}(\ocre{0{,}03})+\azul{0{,}60}(\ocre{0{,}05})=0{,}001+0{,}009+0{,}030=\verde{0{,}04}\]`,
                  L`<strong>b) Causa, Bayes:</strong> \[P(A\mid D)=\frac{\azul{0{,}10}(\ocre{0{,}01})}{0{,}04}=\verde{0{,}025}\]`
                ],
                fig: arbol([["A", "0,10", "0,01"], ["B", "0,30", "0,03"], ["C", "0,60", "0,05"]], "D", "Árbol de tres máquinas y piezas defectuosas"),
                n: "",
                s: AP
              })
            ]
          },
          {
            id: "pc-9b",
            title: "Adivina Quién: probabilidad condicional y Bayes",
            lead: "Con testigo exacto el espacio muestral se reduce; con testigo imperfecto cada pista actualiza las probabilidades.",
            visual: "adivina_quien",
            visualAncho: true,
            source: "Actividad inspirada en Guess Who y 3Blue1Brown (actualización bayesiana)."
          }
        ]
      }
    ]
  };
}());
