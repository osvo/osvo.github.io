/* Muestreo, teorema central del límite e intervalos de confianza.
   Requiere clase_figuras.js (window.Fig).
   Convenciones: sin "s.e." (usar error estándar EE(X̄) = S/√n o σ_X̄ = σ/√n); sin pruebas de hipótesis como tema principal (Estadística II).
   Principio didáctico: enunciados completos, raíces en LaTeX completo, intuición de por qué aparece t y cómo leer la confianza. */
(function () {
  "use strict";
  const F = window.Fig, K = F.K, L = F.L, co = F.co, k = F.k;
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
              {
                title: L`Ejemplo: todas las muestras de una población pequeña`,
                body: L`<div class="enunciado">La población es \(\{1,2,3,4,5\}\). a) Forme todas las muestras de tamaño 2 sin repetir elementos. b) Halle la media de cada muestra. c) Halle la media de las medias muestrales y compárela con la media poblacional.</div><ol class="pasos"><li><strong>a) Muestras:</strong> \(\binom52=10\): {1,2}, {1,3}, {1,4}, {1,5}, {2,3}, {2,4}, {2,5}, {3,4}, {3,5}, {4,5}.</li><li><strong>b) Medias:</strong> \(\bar x\) = 1,5; 2; 2,5; 3; 2,5; 3; 3,5; 3,5; 4; 4,5.</li><li><strong>c)</strong> \[E(\bar X)=\frac{1{,}5+2+2{,}5+3+2{,}5+3+3{,}5+3{,}5+4+4{,}5}{10}=\frac{30}{10}=\verde{3}\] y \(\mu=\frac{1+2+3+4+5}{5}=\verde{3}\).</li><li><strong>Lectura:</strong> el promedio de todas las medias muestrales es la media poblacional; las medias muestrales varían menos que los datos (de 1,5 a 4,5 frente a 1 a 5).</li></ol>`,
                source: L`Ejemplo de los apuntes del docente.`
              },
              {
                title: L`Ejemplo: incremento salarial promedio`,
                body: L`<div class="enunciado">El incremento porcentual de los salarios en las empresas medianas es normal con media \(\mu=\azul{12{,}2}\,\%\) y desviación \(\sigma=\ocre{3{,}6}\,\%\). Se toma una muestra de \(n=\morado{9}\) funcionarios. a) ¿Qué probabilidad hay de que la media muestral supere el 10 %? b) ¿Y de que un solo funcionario supere el 10 %?</div><ol class="pasos"><li><strong>Variables:</strong> \(X\) = incremento de un funcionario; \(\bar X\) = media de 9 funcionarios.</li><li><strong>Error estándar:</strong> \(\sigma_{\bar X}=\dfrac{\ocre{3{,}6}}{\sqrt{\morado{9}}}=1{,}2\).</li><li><strong>a)</strong> \[z=\frac{10-\azul{12{,}2}}{1{,}2}=-1{,}83,\qquad P(\bar X&gt;10)=P(Z&gt;-1{,}83)=1-0{,}0336=\verde{0{,}9664}\]</li><li><strong>b)</strong> \[z=\frac{10-\azul{12{,}2}}{\ocre{3{,}6}}=-0{,}61,\qquad P(X&gt;10)=1-0{,}2709=\verde{0{,}7291}\]</li><li><strong>Lectura:</strong> el promedio de 9 se aleja menos de la media que un solo dato.</li></ol>`,
                source: L`Ejemplo de los apuntes del docente.`
              },
              {
                title: L`Ejemplo: duración de bujías`,
                body: L`<div class="enunciado">Un fabricante declara que la duración de sus bujías es normal con media \(\mu=\azul{36\,000}\) km y desviación \(\sigma=\ocre{4000}\) km. En una muestra de \(n=\morado{16}\) bujías la duración media fue 34 500 km. Si el fabricante tiene razón, ¿qué probabilidad hay de obtener una media tan pequeña o menor?</div><ol class="pasos"><li><strong>Variable:</strong> \(\bar X\) = duración media de 16 bujías.</li><li><strong>Distribución de la media:</strong> \(\bar X\sim N\!\left(\azul{36\,000};\ \sigma_{\bar X}^2\right)\) con \[\sigma_{\bar X}=\frac{\ocre{4000}}{\sqrt{\morado{16}}}=1000\ \text{km}\]</li><li><strong>Estandarizar:</strong> \[z=\frac{34\,500-\azul{36\,000}}{1000}=-1{,}5,\qquad P(\bar X\le34\,500)=P(Z\le-1{,}5)=\verde{0{,}0668}\]</li><li><strong>Lectura:</strong> una media así ocurre cerca de 7 veces en 100 si el fabricante tiene razón.</li></ol>`,
                source: L`Ejemplo de los apuntes del docente (Webster).`
              }
            ]
          },
          {
            id: "mi-3",
            title: L`Teorema central del límite`,
            lead: L`Con \(n\) grande, \(\bar X\) y la proporción muestral son aproximadamente normales.`,
            body: L`<div class="enunciado">Cada dado justo tiene media \(\mu=3{,}5\) y varianza \(\sigma^2=35/12\). Una muestra contiene \(n\) lanzamientos independientes. El simulador repite el muestreo 1.000 veces y grafica sus promedios.</div><p>El TCL aproxima \(\bar X\) por \(N(\mu,\sigma^2/n)\) para \(n\) suficientemente grande. No convierte los datos individuales en normales. La asimetría y las colas influyen en cuántos datos se necesitan.</p>`,
            visual: "medias",
            source: "Laplace; Seeing Theory; simulación propia.",
            abajo: [
              {
                title: L`Ejemplo: programa de capacitación`,
                body: L`<div class="enunciado">El \(\azul{30}\,\%\) de todos los empleados tiene capacitación avanzada. Si en una muestra de \(\ocre{500}\) empleados menos del 27 % está capacitado, se abrirá un programa de capacitación. ¿Qué probabilidad hay de que se abra?</div><ol class="pasos"><li><strong>Variable:</strong> \(\hat p\) = proporción de capacitados en la muestra; \(E(\hat p)=\azul{0{,}30}\).</li><li><strong>Error estándar:</strong> \(\sigma_{\hat p}=\sqrt{\dfrac{\azul{0{,}3}(0{,}7)}{\ocre{500}}}=0{,}0205\).</li><li><strong>Probabilidad:</strong> \[z=\frac{0{,}27-\azul{0{,}30}}{0{,}0205}=-1{,}46,\qquad P(\hat p&lt;0{,}27)=P(Z&lt;-1{,}46)=\verde{0{,}0721}\]</li></ol>`,
                source: L`Ejemplo de los apuntes del docente.`
              },
              {
                title: L`Ejemplo: instalaciones eléctricas inseguras`,
                body: L`<div class="enunciado">En una población de edificios antiguos, el \(\azul{30}\,\%\) de las casas tiene instalación eléctrica insegura. Se revisa una muestra de \(n=\ocre{250}\) casas. ¿Qué probabilidad hay de que la proporción muestral esté entre 0,25 y 0,35?</div><ol class="pasos"><li><strong>Variable:</strong> \(\hat p\) = proporción de casas inseguras en la muestra; \(E(\hat p)=\azul{0{,}30}\).</li><li><strong>Error estándar:</strong> \[\sigma_{\hat p}=\sqrt{\frac{p(1-p)}{n}}=\sqrt{\frac{\azul{0{,}3}(0{,}7)}{\ocre{250}}}=0{,}029\]</li><li><strong>Estandarizar:</strong> \[z=\frac{0{,}25-\azul{0{,}30}}{0{,}029}=-1{,}73,\quad z=\frac{0{,}35-\azul{0{,}30}}{0{,}029}=1{,}73\]</li><li><strong>Probabilidad:</strong> \(P(-1{,}73&lt;Z&lt;1{,}73)=\verde{0{,}916}\).</li></ol>`,
                source: L`Ejemplo de los apuntes del docente (Walpole et al.).`
              }
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
            body: L`<p>Para una muestra independiente de una población <strong>normal</strong>, \((\bar X-\mu)/(\sigma/\sqrt n)\) es normal estándar si se conoce \(\sigma\).</p><p>Si se estima \(\sigma\) con \(S\), el cociente \((\bar X-\mu)/(S/\sqrt n)\) sigue exactamente una \(t_{n-1}\). Fuera del modelo normal, el procedimiento puede ser aproximado y debe evaluarse su pertinencia.</p>`,
            formula: L`\mu \in \left(\verde{\bar{x}} - \morado{t_{\alpha/2,\,n-1}}\,\frac{\ocre{s}}{\sqrt{n}},\;\; \verde{\bar{x}} + \morado{t_{\alpha/2,\,n-1}}\,\frac{\ocre{s}}{\sqrt{n}}\right)`,
            lectura: L`El cuantil positivo \(t_{\alpha/2,\nu}\) deja área \(\alpha/2\) a su <strong>derecha</strong>. Se usa −t en la cola izquierda y +t en la derecha.`,
            codigo: {python: "scipy.stats.t.interval(0.95, df=n-1, loc=xb, scale=s/np.sqrt(n))", excel: "=INTERVALO.CONFIANZA.T(0.05; s; n) devuelve el margen"},
            source: "Gosset ('Student'); Hayter.",
            abajo: [
              {
                title: L`Ejemplo: concentración de zinc en un río`,
                body: L`<div class="enunciado">La concentración media de zinc en el agua de un río, medida en \(\ocre{36}\) sitios, es \(\bar x=\azul{2{,}6}\) g/mL. Suponga que la desviación poblacional es \(\sigma=\morado{0{,}3}\). Encuentre un intervalo de confianza del 95 % para la concentración media.</div><ol class="pasos"><li><strong>Variable:</strong> \(X\) = concentración de zinc en un sitio; se estima \(\mu\).</li><li><strong>Cuantil:</strong> \(1-\alpha=0{,}95\Rightarrow\frac{\alpha}{2}=0{,}025\Rightarrow z_{0{,}025}=1{,}96\).</li><li><strong>Intervalo:</strong> \[\bar x\pm z_{\alpha/2}\frac{\sigma}{\sqrt n}=\azul{2{,}6}\pm1{,}96\frac{\morado{0{,}3}}{\sqrt{\ocre{36}}}=\azul{2{,}6}\pm0{,}098\ \Rightarrow\ \verde{2{,}502&lt;\mu&lt;2{,}698}\]</li></ol>`,
                source: L`Ejemplo de los apuntes del docente (Walpole et al.).`
              },
              {
                title: L`Ejemplo: comprobantes de una constructora`,
                body: L`<div class="enunciado">Una constructora es acusada de inflar los comprobantes de un tipo de trabajo que, según el contrato, debe promediar \(\azul{1150}\) dólares. Se revisan \(n=\ocre{12}\) comprobantes: media \(\bar x=\morado{1275}\) y desviación \(s=\morado{235}\). Suponiendo normalidad, ¿un intervalo del 95 % apoya la acusación?</div><ol class="pasos"><li><strong>Variable:</strong> \(X\) = valor de un comprobante; se estima \(\mu\).</li><li><strong>Distribución:</strong> \(\sigma\) desconocida y \(n\) pequeño: \(t\) con \(\ocre{12}-1=11\) grados de libertad, \(t_{0{,}025;\,11}=2{,}201\).</li><li><strong>Intervalo:</strong> \[\begin{aligned} \bar x\pm t\frac{s}{\sqrt n}&=\morado{1275}\pm2{,}201\cdot\frac{\morado{235}}{\sqrt{\ocre{12}}}=1275\pm149{,}3\\ &\Rightarrow\ \verde{1125{,}7&lt;\mu&lt;1424{,}3} \end{aligned}\]</li><li><strong>Lectura:</strong> \(\azul{1150}\) está dentro del intervalo: con 12 comprobantes no se puede afirmar que el promedio supere lo pactado.</li></ol>`,
                source: L`Ejemplo de los apuntes del docente (Webster).`
              },
              {
                title: L`Ejemplo: rendimiento de taxis`,
                body: L`<div class="enunciado">Una empresa compra una flota de taxis solo si el rendimiento medio es de al menos \(\azul{27{,}5}\) millas por galón. En \(n=\ocre{36}\) carros probados, la media fue \(\bar x=\morado{25{,}6}\) y la desviación \(s=\morado{3{,}5}\). Con un intervalo del 99 %, ¿qué se aconseja?</div><ol class="pasos"><li><strong>Variable:</strong> \(X\) = rendimiento de un carro; se estima \(\mu\).</li><li><strong>Muestra grande:</strong> por el TCL se usa \(z_{0{,}005}=2{,}576\) y \(s\) en lugar de \(\sigma\).</li><li><strong>Intervalo:</strong> \[\morado{25{,}6}\pm2{,}576\cdot\frac{\morado{3{,}5}}{\sqrt{\ocre{36}}}=25{,}6\pm1{,}50\ \Rightarrow\ \verde{24{,}10&lt;\mu&lt;27{,}10}\]</li><li><strong>Decisión:</strong> todo el intervalo está por debajo de \(\azul{27{,}5}\): se aconseja no comprar.</li></ol>`,
                source: L`Ejemplo de los apuntes del docente (Webster).`
              }
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
            body: L`<div class="enunciado">Una muestra piloto de 20 resistencias dio \(s_0=2{,}8860098\) MPa. Se planifica una nueva campaña con IC t del 95 % y longitud aproximada no mayor de 1,5 MPa. Se supone proceso estable y población normal.</div><p>Se reemplaza la desviación futura por \(s_0\) y se busca el menor entero \(n\) que satisfaga la desigualdad. El cuantil también depende de \(n\).</p>`,
            formula: L`2\,t_{0{,}025,n-1}\,\frac{s_0}{\sqrt n}\le1{,}5\text{ MPa}`,
            lectura: L`Se obtiene \(n=${nNecesario}\) mediciones independientes en total. La desviación futura puede diferir de la piloto; no se garantiza la amplitud realizada.`,
            source: "Hayter; Montgomery y Runger."
          },
          {
            id: "mi-7",
            abajo: [
              {
                title: L`Ejemplo: varianza del peso de paquetes de semillas`,
                body: L`<div class="enunciado">Los pesos, en decagramos, de 10 paquetes de semillas de pasto son 46,4; 46,1; 45,8; 47,0; 46,1; 45,9; 45,8; 46,9; 45,2; 46,0. Suponiendo población normal, encuentre un intervalo de confianza del 95 % para la varianza.</div><ol class="pasos"><li><strong>Variable:</strong> \(X\) = peso de un paquete; \(n=10\), 9 grados de libertad.</li><li><strong>Varianza muestral:</strong> \(s^2=\dfrac{\sum(x_i-\bar x)^2}{n-1}=\azul{0{,}286}\).</li><li><strong>Cuantiles χ² con 9 gl:</strong> \(\chi^2_{0{,}025}=\ocre{19{,}023}\) y \(\chi^2_{0{,}975}=\morado{2{,}700}\).</li><li><strong>Intervalo:</strong> \[\frac{9(\azul{0{,}286})}{\ocre{19{,}023}}&lt;\sigma^2&lt;\frac{9(\azul{0{,}286})}{\morado{2{,}700}}\ \Rightarrow\ \verde{0{,}135&lt;\sigma^2&lt;0{,}953}\]</li></ol>`,
                source: L`Ejemplo de los apuntes del docente (Walpole et al.).`
              },
              {
                title: L`Ejemplo: impurezas en lotes de un producto químico`,
                body: L`<div class="enunciado">La concentración de impurezas en los lotes de un producto químico es normal con varianza \(\sigma^2=\azul{1}\). Se toma una muestra de \(n=\ocre{21}\) lotes. ¿Qué probabilidad hay de que la varianza muestral sea mayor que 2?</div><ol class="pasos"><li><strong>Variable:</strong> \(S^2\) = varianza muestral de 21 lotes.</li><li><strong>Distribución:</strong> bajo normalidad, \(\dfrac{(n-1)S^2}{\sigma^2}\sim\chi^2_{n-1}\), con \(\ocre{21}-1=20\) grados de libertad.</li><li><strong>Convertir:</strong> \[\chi^2=\frac{(\ocre{21}-1)(2)}{\azul{1}}=40\]</li><li><strong>Probabilidad:</strong> \(P(S^2&gt;2)=P(\chi^2_{20}&gt;40)=1-0{,}995=\verde{0{,}005}\).</li></ol>`,
                source: L`Ejemplo de los apuntes del docente (Walpole et al.).`
              },
              {
                title: L`Ejemplo: computadores en casa`,
                body: L`<div class="enunciado">Una cadena de noticias informó que el \(\azul{68}\,\%\) de los estudiantes de secundaria tiene computador en casa. En una muestra de \(n=\ocre{1020}\) estudiantes, \(\morado{673}\) lo tienen. ¿Un intervalo del 99 % apoya la noticia?</div><ol class="pasos"><li><strong>Variable:</strong> \(\hat p\) = proporción muestral: \(\hat p=\dfrac{\morado{673}}{\ocre{1020}}=0{,}66\).</li><li><strong>Cuantil:</strong> \(1-\alpha=0{,}99\Rightarrow z_{0{,}005}=2{,}58\).</li><li><strong>Intervalo</strong> (con \(\hat p\) en la raíz porque no se conoce \(p\)): \[0{,}66\pm2{,}58\sqrt{\frac{0{,}66(0{,}34)}{\ocre{1020}}}=0{,}66\pm0{,}038\ \Rightarrow\ \verde{0{,}622&lt;p&lt;0{,}698}\]</li><li><strong>Lectura:</strong> \(\azul{0{,}68}\) está dentro del intervalo: los datos son compatibles con la noticia.</li></ol>`,
                source: L`Ejemplo de los apuntes del docente (Webster).`
              }
            ],
            title: L`Intervalos para una proporción y para una varianza`,
            lead: L`Proporción con la normal; varianza con la χ², bajo normalidad.`,
            body: L`<table class="modelos"><tr><td>Proporción \(p\)</td><td>Datos binarios independientes. El intervalo normal sencillo es aproximado; funciona mal con pocos éxitos o fracasos.</td></tr><tr><td>Varianza \(\sigma^2\)</td><td>Datos iid normales. El intervalo chi-cuadrado es sensible a la falta de normalidad.</td></tr></table><p>Los complementos desarrollan cada ejemplo: parámetro, muestra, método y supuestos.</p>`,
            formula: L``,
            lectura: L``,
            source: "Hayter; Montgomery y Runger."
          },
          {
            id: "mi-8",
            title: L`Intervalo para la diferencia de dos medias`,
            lead: L`Si el intervalo contiene el 0, los datos no muestran diferencia entre las medias.`,
            body: L`<div class="enunciado">Dos muestras normales independientes tienen: A, \(n_A=20\), \(\bar x_A=28{,}18\) MPa, \(s_A=2{,}88601\) MPa; B, \(n_B=16\), \(\bar x_B=30{,}48125\) MPa, \(s_B=2{,}28158\) MPa. Se estima \(\mu_A-\mu_B\), sin imponer varianzas iguales.</div><p>Welch combina las incertidumbres de las dos medias. El simulador desplaza B para explorar el intervalo.</p>`,
            formula: L`(\bar x_A-\bar x_B)\ \pm\ t_{\alpha/2,\nu}\sqrt{\frac{s_A^2}{n_A}+\frac{s_B^2}{n_B}}`,
            lectura: L`Diferencia \(${co(dif,5)}\) MPa; IC del 95 % \([${co(icDif[0],3)};${co(icDif[1],3)}]\) MPa.`,
            visual: "dosmedias",
            codigoSoloGuia: true,
            codigo: {python: "EE=(sA**2/nA+sB**2/nB)**0.5; q=scipy.stats.t.ppf(.975,df)", excel: "Calcular EE y grados de libertad de Welch; ver complemento"},
            source: "Hayter; Welch.",
            abajo: [
              {
                title: L`Ejemplo: tubos de acero de dos procesos`,
                body: L`<div class="enunciado">Dos procesos fabrican tubos de acero. Una muestra de \(n_1=\azul{100}\) tubos del primero tiene longitud media \(\azul{27{,}3}\) in y desviación \(\azul{10{,}3}\) in; una de \(n_2=\ocre{100}\) del segundo, media \(\ocre{30{,}1}\) in y desviación \(\ocre{5{,}2}\) in. ¿Qué revela un intervalo del 99 % para la diferencia de medias?</div><ol class="pasos"><li><strong>Variables:</strong> \(X_1\), \(X_2\) = longitudes en cada proceso; se estima \(\mu_1-\mu_2\).</li><li><strong>Muestras grandes:</strong> se usan las desviaciones muestrales como \(\sigma_1\), \(\sigma_2\) y \(z_{0{,}005}=2{,}576\).</li><li><strong>Error estándar:</strong> \[\sqrt{\frac{\azul{10{,}3}^2}{\azul{100}}+\frac{\ocre{5{,}2}^2}{\ocre{100}}}=1{,}154\]</li><li><strong>Intervalo:</strong> \[(\azul{27{,}3}-\ocre{30{,}1})\pm2{,}576(1{,}154)=-2{,}8\pm2{,}97\ \Rightarrow\ \verde{-5{,}77&lt;\mu_1-\mu_2&lt;0{,}17}\]</li><li><strong>Lectura:</strong> contiene el 0: no se puede afirmar que los procesos produzcan longitudes medias distintas.</li></ol>`,
                source: L`Ejemplo de los apuntes del docente (Webster).`
              }
            ]
          }
        ]
      }
    ]
  };
}());
