/* Muestreo, teorema central del límite e intervalos de confianza.
   Requiere clase_figuras.js (window.Fig).
   Convenciones: sin "s.e." (usar error estándar EE(X̄) = S/√n o σ_X̄ = σ/√n); sin pruebas de hipótesis como tema principal (Estadística II).
   Principio didáctico: enunciados completos, raíces en LaTeX completo, intuición de por qué aparece t y cómo leer la confianza. */
(function () {
  "use strict";
  const F = window.Fig, K = F.K, L = F.L, co = F.co, k = F.k, E = F.ejemplo;
  const D = F.CILINDROS, R = F.resumen(D), n = R.n, nu = n - 1, ee = R.s / Math.sqrt(n);
  const t95 = F.tCrit(0.025, nu), t99 = F.tCrit(0.005, nu), z95 = F.zCrit(0.025);
  const ic95 = [R.mean - t95 * ee, R.mean + t95 * ee], ic99 = [R.mean - t99 * ee, R.mean + t99 * ee];
  const nNecesario = (() => { let q = Math.ceil(Math.pow(z95 * R.s / 0.75, 2)); while (2 * F.tCrit(0.025, q - 1) * R.s / Math.sqrt(q) > 1.5) q++; return q; })();
  const ph = 0.13, eeP = Math.sqrt(ph * (1 - ph) / 100), icP = [ph - z95 * eeP, ph + z95 * eeP];
  const chiA = F.chi2Crit(0.025, nu), chiB = F.chi2Crit(0.975, nu), icV = [nu * R.s2 / chiA, nu * R.s2 / chiB];

  /* Dos muestras (comparación entre plantas) */
  const B = [26.3, 27.4, 28.1, 28.8, 29.2, 29.6, 30.0, 30.3, 30.6, 30.9, 31.3, 31.7, 32.2, 32.8, 33.6, 34.9];
  const RB = F.resumen(B), m = RB.n, dif = R.mean - RB.mean, eeDif = Math.sqrt(R.s2 / n + RB.s2 / m);
  const nuW = Math.pow(R.s2 / n + RB.s2 / m, 2) / (Math.pow(R.s2, 2) / (n * n * (n - 1)) + Math.pow(RB.s2, 2) / (m * m * (m - 1)));
  const tcW = F.tCrit(0.025, nuW), icDif = [dif - tcW * eeDif, dif + tcW * eeDif];

  window.COURSE = {
    id: "muestreo_e_intervalos",
    title: "Muestreo e intervalos de confianza",
    shortTitle: "Muestreo e intervalos",
    subtitle: L`Pasar de una muestra a una estimación, cuantificar su incertidumbre y reconocer los límites de la inferencia`,
    modules: [
      {
        id: "estimacion",
        title: "Distribuciones muestrales",
        summary: "Parámetro vs. estimador, sesgo, ECM, momentos/verosimilitud, TCL y error estándar de la media.",
        slides: [
          {
            id: "mi-1",
            title: L`Parámetro y estimador puntual`,
            lead: L`Un estimador es una función de la muestra; cambia de una muestra a otra.`,
            body: `<p>${k("azul", "Parámetro")} \\(\\theta\\): constante desconocida de la población (\\(\\mu\\), \\(\\sigma^2\\), \\(p\\)). ${k("verde", "Estimador")} \\(\\hat{\\theta}\\): regla calculada con la muestra aleatoria (\\(\\bar{X}\\), \\(S^2\\), \\(\\hat{p}\\)).</p>
                   <p>Un buen estimador busca ser ${k("verde", "insesgado")} (\\(E(\\hat{\\theta}) = \\theta\\)) y tener varianza pequeña. Ambos criterios se combinan en el error cuadrático medio (\\(\\mathrm{ECM}\\)):</p>`,
            formula: L`\mathrm{ECM}(\hat\theta) = E\!\left[(\hat\theta - \theta)^2\right] = \azul{\mathrm{Var}(\hat\theta)} + \rojo{\left[E(\hat\theta) - \theta\right]^2}`,
            lectura: `El error total suma la ${k("azul", "varianza del estimador")} más el ${k("rojo", "sesgo al cuadrado")}.`,
            figure: F.curvas([{ f: F.normal(28, 0.65), color: K.verde }, { f: F.normal(29.3, 0.65), color: K.rojo, dash: "12 7" }], {
              xmin: 25.5, xmax: 32, alt: "Estimador insesgado centrado en el parámetro frente a estimador sesgado", xlabel: "valor del estimador", ylabel: "",
              ticks: [{ x: 28, text: "θ", color: K.azul }], vlines: [{ x: 28, color: K.azul }],
              labels: [{ x: 27.1, y: 120, text: "insesgado", color: K.verde, anchor: "end" }, { x: 30.2, y: 120, text: "sesgado", color: K.rojo, anchor: "start" }]
            }),
            source: "Hayter; Devore."
          },
          {
            id: "mi-2",
            title: L`Distribución de la media muestral`,
            lead: L`\(E(\bar X)=\mu\) y \(\sigma_{\bar X}=\frac{\sigma}{\sqrt n}\): el promedio varía menos que cada dato.`,
            body: L`<p>Si \(X_1,\ldots,X_n\) son observaciones independientes con media \(\mu\) y varianza \(\sigma^2\), entonces \(\bar X=n^{-1}\sum X_i\).</p><p>La regla de varianzas da \(\operatorname{Var}(\bar X)=n^{-2}\sum\sigma^2=\sigma^2/n\). Cuando \(\sigma\) es desconocida, se estima el error estándar con \(S/\sqrt n\).</p>`,
            formula: L`\sigma_{\bar{X}} = \frac{\sigma}{\sqrt{\morado{n}}} \qquad\qquad \ocre{\mathrm{EE}(\bar{X})} = \frac{\ocre{S}}{\sqrt{\morado{n}}}`,
            lectura: `Para reducir el error estándar a la mitad, hay que cuadruplicar el tamaño de muestra \\(n\\).`,
            figure: F.curvas([{ f: F.normal(R.mean, R.s), color: K.medio, dash: "12 7" }, { f: F.normal(R.mean, ee) }], {
              xmin: 20, xmax: 37, alt: "Densidad de una probeta individual comparada con la de la media de 20 probetas", xlabel: "resistencia, MPa",
              ticks: [20, 24, 28, 32, 36], labels: [{ x: 32.6, y: 286, text: "1 probeta (s = 2,89)", color: K.medio, anchor: "start" }, { x: 29.4, y: 90, text: "media de 20 (EE = 0,65)", anchor: "start" }]
            }),
            source: "Hayter; StatQuest ('Standard Error').",
            abajo: [
              E({
                t: "Ejemplo: todas las muestras de una población pequeña",
                e: L`Una población tiene cinco elementos: \(\{1,2,3,4,5\}\). Se toman muestras de tamaño 2 sin repetir elementos.`,
                d: [[L`\azul{N}=\azul{5}`, "elementos de la población"], [L`\morado{n}=\morado{2}`, "tamaño de cada muestra"]],
                i: [L`Forme todas las muestras posibles.`, L`Halle la media de cada muestra.`, L`Halle la media de las medias muestrales y compárela con la media poblacional.`],
                p: [
                  L`<strong>a)</strong> Número de muestras: \[\begin{aligned} {}_{N}C_{n}&=\frac{N!}{n!\,(N-n)!}\\ {}_{\azul{5}}C_{\morado{2}}&=\frac{5!}{2!\,3!}=10 \end{aligned}\] {1,2}, {1,3}, {1,4}, {1,5}, {2,3}, {2,4}, {2,5}, {3,4}, {3,5}, {4,5}.`,
                  L`<strong>b)</strong> \(\bar x=\frac{x_1+x_2}{2}\): 1,5; 2; 2,5; 3; 2,5; 3; 3,5; 3,5; 4; 4,5.`,
                  L`<strong>c)</strong> \[\begin{aligned} E(\bar X)&=\frac{\sum\bar x}{10}=\frac{1{,}5+2+2{,}5+\cdots+4{,}5}{10}=\frac{30}{10}=\verde{3}\\ \mu&=\frac{\sum x}{N}=\frac{1+2+3+4+5}{\azul{5}}=\verde{3} \end{aligned}\]`,
                  L`<strong>Lectura:</strong> el promedio de todas las medias muestrales es la media poblacional. Las medias van de 1,5 a 4,5; los datos, de 1 a 5: el promedio varía menos que cada dato.`
                ],
                n: "", s: "Ejemplo de los apuntes del docente (Webster)."
              }),
              E({
                t: "Ejemplo: incremento salarial promedio",
                e: L`El incremento porcentual de los salarios en las empresas medianas es normal. Se toma una muestra de funcionarios.`,
                d: [[L`\azul{\mu}=\azul{12{,}2}`, "incremento medio (%)"], [L`\ocre{\sigma}=\ocre{3{,}6}`, "desviación estándar (%)"], [L`\morado{n}=\morado{9}`, "funcionarios en la muestra"]],
                i: [L`¿Qué probabilidad hay de que la media muestral supere el ${k("magenta", "10&nbsp;%")}?`, L`¿Y de que un solo funcionario supere el 10&nbsp;%?`],
                p: [
                  L`<strong>Variables:</strong> \(X\) = incremento de un funcionario; \(\bar X\) = media de los 9.`,
                  L`<strong>Error estándar:</strong> \[\begin{aligned} \sigma_{\bar X}&=\frac{\sigma}{\sqrt n}\\ &=\frac{\ocre{3{,}6}}{\sqrt{\morado{9}}}=1{,}2 \end{aligned}\]`,
                  L`<strong>a)</strong> \[\begin{aligned} z&=\frac{\bar x-\mu}{\sigma_{\bar X}}=\frac{\magenta{10}-\azul{12{,}2}}{1{,}2}=-1{,}83\\ P(\bar X\gt\magenta{10})&=1-\Phi(-1{,}83)=1-0{,}0336=\verde{0{,}9664} \end{aligned}\]`,
                  L`<strong>b)</strong> \[\begin{aligned} z&=\frac{x-\mu}{\sigma}=\frac{\magenta{10}-\azul{12{,}2}}{\ocre{3{,}6}}=-0{,}61\\ P(X\gt\magenta{10})&=1-\Phi(-0{,}61)=1-0{,}2709=\verde{0{,}7291} \end{aligned}\]`,
                  L`<strong>Lectura:</strong> el promedio de 9 se aleja menos de la media que un solo dato; por eso es más probable que supere el 10&nbsp;%.`
                ],
                n: "", s: "Ejemplo de los apuntes del docente (Webster)."
              }),
              E({
                t: "Ejemplo: duración de bujías",
                e: L`Un fabricante declara que la duración de sus bujías es normal. En una muestra la duración media fue menor que la declarada.`,
                d: [[L`\azul{\mu}=\azul{36\,000}`, "media declarada (km)"], [L`\ocre{\sigma}=\ocre{4000}`, "desviación declarada (km)"], [L`\morado{n}=\morado{16}`, "bujías probadas"], [L`\magenta{\bar x}=\magenta{34\,500}`, "media observada (km)"]],
                q: L`Si el fabricante tiene razón, ¿qué probabilidad hay de obtener una media de 34 500 km o menos?`,
                p: [
                  L`<strong>Variable:</strong> \(\bar X\) = duración media de 16 bujías.`,
                  L`<strong>Distribución de la media:</strong> \(\bar X\sim N(\azul{\mu},\ \sigma_{\bar X}^2)\), con \[\begin{aligned} \sigma_{\bar X}&=\frac{\sigma}{\sqrt n}\\ &=\frac{\ocre{4000}}{\sqrt{\morado{16}}}=1000\text{ km} \end{aligned}\]`,
                  L`<strong>Estandarizar:</strong> \[\begin{aligned} z&=\frac{\bar x-\mu}{\sigma_{\bar X}}=\frac{\magenta{34\,500}-\azul{36\,000}}{1000}=-1{,}5\\ P(\bar X\le\magenta{34\,500})&=\Phi(-1{,}5)=\verde{0{,}0668} \end{aligned}\]`,
                  L`<strong>Lectura:</strong> una media así ocurre unas 7 veces de cada 100 si el fabricante tiene razón.`
                ],
                n: "", s: "Ejemplo de los apuntes del docente (Walpole et al.)."
              })
            ]
          },
          {
            id: "mi-3",
            title: L`Teorema central del límite`,
            lead: L`Con \(n\) grande, \(\bar X\) y la proporción muestral son aproximadamente normales.`,
            body: L`<div class="enunciado">Se elige una población de partida (dado uniforme, exponencial asimétrica, bimodal en U o Bernoulli) y se extraen \(1000\) muestras independientes de tamaño \(n\).</div><p>El TCL aproxima \(\bar X\) por \(N(\mu,\sigma^2/n)\) para \(n\) suficientemente grande. No convierte los datos individuales en normales. La asimetría inicial influye en qué tan grande debe ser \(n\).</p>`,
            visual: "medias",
            source: "Laplace; Seeing Theory; simulación propia.",
            abajo: [
              E({
                t: "Ejemplo: programa de capacitación",
                e: L`Una empresa sabe qué porcentaje de sus empleados tiene capacitación avanzada. Si en una muestra menos del 27&nbsp;% está capacitado, abrirá un programa de capacitación.`,
                d: [[L`\azul{p}=\azul{0{,}30}`, "proporción de capacitados en la empresa"], [L`\morado{n}=\morado{500}`, "empleados en la muestra"], [L`\magenta{0{,}27}`, "umbral para abrir el programa"]],
                q: L`¿Qué probabilidad hay de que se abra el programa?`,
                p: [
                  L`<strong>Variable:</strong> \(\hat p\) = proporción de capacitados en la muestra; por el teorema central del límite, \(\hat p\) es aproximadamente normal con media \(\azul{p}\).`,
                  L`<strong>Error estándar:</strong> \[\begin{aligned} \sigma_{\hat p}&=\sqrt{\frac{p(1-p)}{n}}\\ &=\sqrt{\frac{\azul{0{,}30}(0{,}70)}{\morado{500}}}=0{,}0205 \end{aligned}\]`,
                  L`<strong>Probabilidad:</strong> \[\begin{aligned} z&=\frac{\hat p-p}{\sigma_{\hat p}}=\frac{\magenta{0{,}27}-\azul{0{,}30}}{0{,}0205}=-1{,}46\\ P(\hat p\lt\magenta{0{,}27})&=\Phi(-1{,}46)=\verde{0{,}0721} \end{aligned}\]`
                ],
                n: "", s: "Ejemplo de los apuntes del docente (Webster)."
              }),
              E({
                t: "Ejemplo: instalaciones eléctricas inseguras",
                e: L`En una población de edificios antiguos se conoce la proporción de casas con instalación eléctrica insegura. Se revisa una muestra de casas.`,
                d: [[L`\azul{p}=\azul{0{,}30}`, "proporción de casas inseguras"], [L`\morado{n}=\morado{250}`, "casas revisadas"]],
                q: L`¿Qué probabilidad hay de que la proporción muestral esté entre ${k("magenta", "0,25")} y ${k("magenta", "0,35")}?`,
                p: [
                  L`<strong>Variable:</strong> \(\hat p\) = proporción de casas inseguras en la muestra, aproximadamente normal con media \(\azul{p}\).`,
                  L`<strong>Error estándar:</strong> \[\begin{aligned} \sigma_{\hat p}&=\sqrt{\frac{p(1-p)}{n}}\\ &=\sqrt{\frac{\azul{0{,}30}(0{,}70)}{\morado{250}}}=0{,}029 \end{aligned}\]`,
                  L`<strong>Estandarizar:</strong> \[\begin{aligned} z_1&=\frac{\magenta{0{,}25}-\azul{0{,}30}}{0{,}029}=-1{,}73\\ z_2&=\frac{\magenta{0{,}35}-\azul{0{,}30}}{0{,}029}=1{,}73 \end{aligned}\]`,
                  L`<strong>Probabilidad:</strong> \[\begin{aligned} P(-1{,}73\lt Z\lt 1{,}73)&=\Phi(1{,}73)-\Phi(-1{,}73)\\ &=0{,}9582-0{,}0418=\verde{0{,}916} \end{aligned}\]`
                ],
                n: "", s: "Ejemplo de los apuntes del docente (Walpole et al.)."
              })
            ]
          }
        ]
      },
      {
        id: "intervalos",
        title: "Intervalos de confianza",
        summary: "De dónde sale el intervalo, qué significa 95 % de confianza, intervalos t, proporción, varianza y dos muestras.",
        slides: [
          {
            id: "mi-4",
            title: L`Intervalo de confianza para la media`,
            lead: L`Con \(\sigma\) conocida se usa \(z\); con \(\sigma\) desconocida y población normal, \(t\) con \(n-1\) grados de libertad.`,
            body: L`<p>Para una muestra independiente de una población <strong>normal</strong>, \((\bar X-\mu)/(\sigma/\sqrt n)\) es normal estándar si se conoce \(\sigma\).</p><p>Si se estima \(\sigma\) con \(S\), el cociente \((\bar X-\mu)/(S/\sqrt n)\) sigue exactamente una \(t_{n-1}\). Si la población no es normal, el intervalo es solo aproximado.</p>`,
            formula: L`\mu \in \left(\verde{\bar{x}} - \morado{t_{\alpha/2,\,n-1}}\,\frac{\ocre{s}}{\sqrt{n}},\;\; \verde{\bar{x}} + \morado{t_{\alpha/2,\,n-1}}\,\frac{\ocre{s}}{\sqrt{n}}\right)`,
            lectura: L`El cuantil positivo \(t_{\alpha/2,\nu}\) deja área \(\alpha/2\) a su <strong>derecha</strong>. Al desconocer \(\sigma\), el intervalo se ensancha para absorber la incertidumbre adicional de \(S\).`,
            visual: "t_vs_z",
            codigo: {python: "scipy.stats.t.interval(0.95, df=n-1, loc=xb, scale=s/np.sqrt(n))", excel: "=INTERVALO.CONFIANZA.T(0.05; s; n) devuelve el margen"},
            source: "Gosset ('Student'); Hayter.",
            abajo: [
              E({
                t: "Ejemplo: concentración de zinc en un río",
                e: L`Se midió la concentración de zinc en el agua de un río en varios sitios. Suponga conocida la desviación estándar poblacional.`,
                d: [[L`\morado{n}=\morado{36}`, "sitios medidos"], [L`\magenta{\bar x}=\magenta{2{,}6}`, "concentración media (g/mL)"], [L`\ocre{\sigma}=\ocre{0{,}3}`, "desviación poblacional (g/mL)"], [L`1-\alpha=0{,}95`, "nivel de confianza"]],
                q: L`Encuentre un intervalo de confianza del 95&nbsp;% para la concentración media.`,
                p: [
                  L`<strong>Variable:</strong> \(X\) = concentración de zinc en un sitio; se estima \(\mu\). Con \(\ocre{\sigma}\) conocida se usa \(z\).`,
                  L`<strong>Cuantil:</strong> \(1-\alpha=0{,}95\Rightarrow\frac{\alpha}{2}=0{,}025\Rightarrow z_{0{,}025}=1{,}96\).`,
                  L`<strong>Intervalo:</strong> \[\begin{aligned} \bar x&\pm z_{\alpha/2}\frac{\sigma}{\sqrt n}\\ \magenta{2{,}6}&\pm 1{,}96\,\frac{\ocre{0{,}3}}{\sqrt{\morado{36}}}=\magenta{2{,}6}\pm 0{,}098 \end{aligned}\] \[\verde{2{,}502\lt\mu\lt 2{,}698}\]`
                ],
                n: "", s: "Ejemplo de los apuntes del docente (Walpole et al.)."
              }),
              E({
                t: "Ejemplo: comprobantes de una constructora",
                e: L`Una constructora es acusada de inflar los comprobantes de un tipo de trabajo cuyo valor promedio está fijado en el contrato. Se revisa una muestra de comprobantes; suponga normalidad.`,
                d: [[L`\azul{1150}`, "promedio pactado (dólares)"], [L`\morado{n}=\morado{12}`, "comprobantes revisados"], [L`\magenta{\bar x}=\magenta{1275}`, "media observada"], [L`\ocre{s}=\ocre{235}`, "desviación muestral"]],
                q: L`¿Un intervalo de confianza del 95&nbsp;% apoya la acusación?`,
                p: [
                  L`<strong>Variable:</strong> \(X\) = valor de un comprobante; se estima \(\mu\).`,
                  L`<strong>Distribución:</strong> \(\sigma\) desconocida y \(n\) pequeño: \(t\) con \(\morado{12}-1=11\) grados de libertad, \(t_{0{,}025;\,11}=2{,}201\).`,
                  L`<strong>Intervalo:</strong> \[\begin{aligned} \bar x&\pm t_{\alpha/2,\,n-1}\frac{s}{\sqrt n}\\ \magenta{1275}&\pm 2{,}201\,\frac{\ocre{235}}{\sqrt{\morado{12}}}=\magenta{1275}\pm 149{,}3 \end{aligned}\] \[\verde{1125{,}7\lt\mu\lt 1424{,}3}\]`,
                  L`<strong>Lectura:</strong> \(\azul{1150}\) queda dentro del intervalo: con 12 comprobantes no se puede afirmar que el promedio supere lo pactado.`
                ],
                n: "", s: "Ejemplo de los apuntes del docente (Walpole et al.)."
              }),
              E({
                t: "Ejemplo: rendimiento de taxis",
                e: L`Una empresa compra una flota de taxis solo si el rendimiento medio es de al menos 27,5 millas por galón. Se prueba una muestra de carros.`,
                d: [[L`\azul{27{,}5}`, "rendimiento mínimo exigido (mpg)"], [L`\morado{n}=\morado{36}`, "carros probados"], [L`\magenta{\bar x}=\magenta{25{,}6}`, "media observada (mpg)"], [L`\ocre{s}=\ocre{3{,}5}`, "desviación muestral (mpg)"]],
                q: L`Con un intervalo de confianza del 99&nbsp;%, ¿qué se aconseja?`,
                p: [
                  L`<strong>Variable:</strong> \(X\) = rendimiento de un carro; se estima \(\mu\).`,
                  L`<strong>Muestra grande:</strong> por el teorema central del límite se usa \(z_{0{,}005}=2{,}576\), con \(\ocre{s}\) en lugar de \(\sigma\).`,
                  L`<strong>Intervalo:</strong> \[\begin{aligned} \bar x&\pm z_{\alpha/2}\frac{s}{\sqrt n}\\ \magenta{25{,}6}&\pm 2{,}576\,\frac{\ocre{3{,}5}}{\sqrt{\morado{36}}}=\magenta{25{,}6}\pm 1{,}50 \end{aligned}\] \[\verde{24{,}10\lt\mu\lt 27{,}10}\]`,
                  L`<strong>Decisión:</strong> todo el intervalo queda por debajo de \(\azul{27{,}5}\): se aconseja no comprar.`
                ],
                n: "", s: "Ejemplo de los apuntes del docente (Walpole et al.)."
              })
            ]
          },
          {
            id: "mi-5",
            title: L`Interpretación del nivel de confianza`,
            lead: L`\(\mu\) es fija; lo que cambia de muestra en muestra es el intervalo.`,
            body: `<div class="enunciado"><strong>Simulación:</strong> Se extraen 40 muestras independientes de tamaño \\(n = 16\\) de una población normal con media verdadera conocida \\(\\mu = 30\\) y desviación \\(\\sigma = 4\\). Para cada muestra se calcula su intervalo del 95 %.</div>
                   <p>Si el procedimiento se repite muchas veces, aproximadamente el \\(95\\,\\%\\) de los intervalos construidos contendrá a \\(\\mu\\). De un intervalo particular observado no se dice «hay 95 % de probabilidad de que \\(\\mu\\) esté ahí».</p>`,
            visual: "intervalos",
            source: "Neyman (1937); Hayter."
          },
          {
            id: "mi-6",
            title: L`Tamaño de muestra`,
            lead: L`Se elige \(n\) para que el margen de error no supere un valor fijado.`,
            body: L`<div class="enunciado">Una muestra piloto de 20 resistencias dio \(s_0=2{,}89\) MPa. Se planifica una nueva campaña con IC t del 95 % y longitud aproximada no mayor de 1,5 MPa. Se supone proceso estable y población normal.</div><p>Se reemplaza la desviación futura por \(s_0\) y se busca el menor entero \(n\) que satisfaga la desigualdad. El cuantil también depende de \(n\).</p>`,
            formula: L`2\,t_{0{,}025,n-1}\,\frac{s_0}{\sqrt n}\le1{,}5\text{ MPa}`,
            lectura: L`Se obtiene \(n=${nNecesario}\) mediciones independientes en total. La desviación futura puede diferir de la piloto; no se garantiza la amplitud realizada.`,
            visual: "tamano_muestra",
            source: "Hayter; Montgomery y Runger."
          },
          {
            id: "mi-7",
            abajo: [
              E({
                t: "Ejemplo: varianza del peso de paquetes de semillas",
                e: L`Se pesaron 10 paquetes de semillas de pasto, en decagramos: 46,4; 46,1; 45,8; 47,0; 46,1; 45,9; 45,8; 46,9; 45,2; 46,0. Suponga población normal.`,
                d: [[L`\morado{n}=\morado{10}`, "paquetes pesados"], [L`1-\alpha=0{,}95`, "nivel de confianza"]],
                q: L`Encuentre un intervalo de confianza del 95&nbsp;% para la varianza.`,
                p: [
                  L`<strong>Variable:</strong> \(X\) = peso de un paquete; \(\morado{n}-1=9\) grados de libertad.`,
                  L`<strong>Varianza muestral:</strong> \[\begin{aligned} s^2&=\frac{\sum(x_i-\bar x)^2}{n-1}\\ &=\frac{2{,}576}{9}=\azul{0{,}2862},\qquad \bar x=46{,}12 \end{aligned}\]`,
                  L`<strong>Cuantiles χ² con 9 gl:</strong> \(\chi^2_{0{,}025}=\ocre{19{,}023}\) y \(\chi^2_{0{,}975}=\magenta{2{,}700}\).`,
                  L`<strong>Intervalo:</strong> \[\begin{aligned} \frac{(n-1)s^2}{\chi^2_{\alpha/2}}&\lt\sigma^2\lt\frac{(n-1)s^2}{\chi^2_{1-\alpha/2}}\\ \frac{9(\azul{0{,}2862})}{\ocre{19{,}023}}&\lt\sigma^2\lt\frac{9(\azul{0{,}2862})}{\magenta{2{,}700}} \end{aligned}\] \[\verde{0{,}135\lt\sigma^2\lt 0{,}954}\]`
                ],
                n: "", s: "Ejemplo de los apuntes del docente (Walpole et al.)."
              }),
              E({
                t: "Ejemplo: impurezas en lotes de un producto químico",
                e: L`La concentración de impurezas en los lotes de un producto químico es normal, con varianza conocida. Se toma una muestra de lotes.`,
                d: [[L`\azul{\sigma^2}=\azul{1}`, "varianza poblacional"], [L`\morado{n}=\morado{21}`, "lotes en la muestra"], [L`\magenta{2}`, "valor de referencia para \\(S^2\\)"]],
                q: L`¿Qué probabilidad hay de que la varianza muestral sea mayor que 2?`,
                p: [
                  L`<strong>Variable:</strong> \(S^2\) = varianza muestral de los 21 lotes.`,
                  L`<strong>Distribución:</strong> bajo normalidad, \(\dfrac{(n-1)S^2}{\sigma^2}\sim\chi^2_{n-1}\), con \(\morado{21}-1=20\) grados de libertad.`,
                  L`<strong>Convertir:</strong> \[\begin{aligned} \chi^2&=\frac{(n-1)s^2}{\sigma^2}\\ &=\frac{(\morado{21}-1)(\magenta{2})}{\azul{1}}=40 \end{aligned}\]`,
                  L`<strong>Probabilidad:</strong> en la tabla, \(\chi^2_{0{,}005;\,20}=40{,}0\): \(P(S^2\gt\magenta{2})=P(\chi^2_{20}\gt 40)=\verde{0{,}005}\).`
                ],
                n: "", s: "Ejemplo de los apuntes del docente (Walpole et al.)."
              }),
              E({
                t: "Ejemplo: computadores en casa",
                e: L`Una cadena de noticias informó qué porcentaje de los estudiantes de secundaria tiene computador en casa. Se toma una muestra de estudiantes.`,
                d: [[L`\azul{0{,}68}`, "proporción informada"], [L`\morado{n}=\morado{1020}`, "estudiantes en la muestra"], [L`\magenta{x}=\magenta{673}`, "tienen computador"]],
                q: L`¿Un intervalo de confianza del 99&nbsp;% apoya la noticia?`,
                p: [
                  L`<strong>Proporción muestral:</strong> \[\hat p=\frac{x}{n}=\frac{\magenta{673}}{\morado{1020}}=0{,}66\]`,
                  L`<strong>Cuantil:</strong> \(1-\alpha=0{,}99\Rightarrow z_{0{,}005}=2{,}58\).`,
                  L`<strong>Intervalo</strong> (se usa \(\hat p\) en la raíz porque \(p\) es desconocida): \[\begin{aligned} \hat p&\pm z_{\alpha/2}\sqrt{\frac{\hat p(1-\hat p)}{n}}\\ 0{,}66&\pm 2{,}58\sqrt{\frac{0{,}66(0{,}34)}{\morado{1020}}}=0{,}66\pm 0{,}038 \end{aligned}\] \[\verde{0{,}622\lt p\lt 0{,}698}\]`,
                  L`<strong>Lectura:</strong> \(\azul{0{,}68}\) queda dentro del intervalo: los datos son compatibles con la noticia.`
                ],
                n: "", s: "Ejemplo de los apuntes del docente (Walpole et al.)."
              })
            ],
            title: L`Intervalos para una proporción y para una varianza`,
            lead: L`Proporción con la normal; varianza con la χ², bajo normalidad.`,
            body: L`<table class="modelos"><tr><td>Proporción \(p\)</td><td>Datos binarios independientes. El intervalo normal sencillo es aproximado; funciona mal con pocos éxitos o fracasos.</td></tr><tr><td>Varianza \(\sigma^2\)</td><td>Datos iid normales. El intervalo chi-cuadrado es sensible a la falta de normalidad.</td></tr></table><p>Las diapositivas siguientes desarrollan cada ejemplo: parámetro, muestra, método y supuestos.</p>`,
            formula: L`\hat p \pm z_{\alpha/2}\sqrt{\frac{\hat p(1-\hat p)}{n}} \qquad\qquad \frac{(n-1)s^2}{\chi^2_{\alpha/2,\,n-1}} < \sigma^2 < \frac{(n-1)s^2}{\chi^2_{1-\alpha/2,\,n-1}}`,
            lectura: L``,
            visual: "ic_chi2_asimetria",
            source: "Hayter; Montgomery y Runger."
          },
          {
            id: "mi-8",
            title: L`Intervalo para la diferencia de dos medias`,
            lead: L`Si el intervalo contiene el 0, los datos no muestran diferencia entre las medias.`,
            body: L`<div class="enunciado">Dos muestras normales independientes tienen: A, \(n_A=20\), \(\bar x_A=28{,}18\) MPa, \(s_A=2{,}89\) MPa; B, \(n_B=16\), \(\bar x_B=30{,}48\) MPa, \(s_B=2{,}28\) MPa. Se estima \(\mu_A-\mu_B\), sin imponer varianzas iguales.</div><p>Welch combina las incertidumbres de las dos medias. El simulador desplaza B para explorar el intervalo.</p>`,
            formula: L`(\bar x_A-\bar x_B)\ \pm\ t_{\alpha/2,\nu}\sqrt{\frac{s_A^2}{n_A}+\frac{s_B^2}{n_B}}`,
            lectura: L`Diferencia \(${co(dif,5)}\) MPa; IC del 95 % \([${co(icDif[0],3)};${co(icDif[1],3)}]\) MPa.`,
            visual: "dosmedias",
            codigoSoloGuia: true,
            codigo: {python: "EE=(sA**2/nA+sB**2/nB)**0.5; q=scipy.stats.t.ppf(.975,df)", excel: "Calcular EE y grados de libertad de Welch"},
            source: "Hayter; Welch.",
            abajo: [
              E({
                t: "Ejemplo: tubos de acero de dos procesos",
                e: L`Dos procesos fabrican tubos de acero. Se mide la longitud de una muestra de cada proceso.`,
                d: [[L`\azul{n_1}=\azul{100},\ \azul{\bar x_1}=\azul{27{,}3},\ \azul{s_1}=\azul{10{,}3}`, "proceso 1 (pulgadas)"], [L`\ocre{n_2}=\ocre{100},\ \ocre{\bar x_2}=\ocre{30{,}1},\ \ocre{s_2}=\ocre{5{,}2}`, "proceso 2 (pulgadas)"]],
                q: L`¿Qué revela un intervalo de confianza del 99&nbsp;% para la diferencia de las longitudes medias?`,
                p: [
                  L`<strong>Variables:</strong> \(X_1\), \(X_2\) = longitud de un tubo de cada proceso; se estima \(\mu_1-\mu_2\).`,
                  L`<strong>Muestras grandes:</strong> las desviaciones muestrales reemplazan a \(\sigma_1\) y \(\sigma_2\), y se usa \(z_{0{,}005}=2{,}576\).`,
                  L`<strong>Error estándar:</strong> \[\begin{aligned} \sigma_{\bar X_1-\bar X_2}&=\sqrt{\frac{s_1^2}{n_1}+\frac{s_2^2}{n_2}}\\ &=\sqrt{\frac{\azul{10{,}3}^2}{\azul{100}}+\frac{\ocre{5{,}2}^2}{\ocre{100}}}=1{,}154 \end{aligned}\]`,
                  L`<strong>Intervalo:</strong> \[\begin{aligned} (\bar x_1-\bar x_2)&\pm z_{\alpha/2}\,\sigma_{\bar X_1-\bar X_2}\\ (\azul{27{,}3}-\ocre{30{,}1})&\pm 2{,}576(1{,}154)=-2{,}8\pm 2{,}97 \end{aligned}\] \[\verde{-5{,}77\lt\mu_1-\mu_2\lt 0{,}17}\]`,
                  L`<strong>Lectura:</strong> el intervalo contiene el 0: no se puede afirmar que los procesos produzcan longitudes medias distintas.`
                ],
                n: "", s: "Ejemplo de los apuntes del docente (Walpole et al.)."
              })
            ]
          }
        ]
      }
    ]
  };
}());
