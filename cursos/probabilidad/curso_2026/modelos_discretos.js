/* Modelos de probabilidad discretos, en el orden de los apuntes del docente:
   proceso de Bernoulli, binomial, geométrica y binomial negativa, hipergeométrica, Poisson y Poisson como límite.
   Cada definición trae su valor esperado y su varianza con una deducción corta; los ejemplos son de los apuntes. */
(function () {
  "use strict";
  const F = window.Fig, K = F.K, L = F.L, k = F.k, E = F.ejemplo;

  const pasos = (lista) => `<ol class="pasos">${lista.map((x) => `<li>${x}</li>`).join("")}</ol>`;
  const ej = (o) => ({ title: o.t, lead: o.lead, body: `<div class="enunciado">${o.e}</div>` + pasos(o.p), figure: o.fig, notes: o.n, source: o.s });
  const AP = "Ejemplo de los apuntes del docente.";
  const AW = "Ejemplo de los apuntes del docente (Walpole et al.).";
  const AB = "Ejemplo de los apuntes del docente (Webster).";

  window.COURSE = {
    id: "modelos_discretos",
    title: "Modelos de probabilidad discretos",
    shortTitle: "Modelos discretos",
    modules: [
      {
        id: "bernoulli_binomial",
        title: "Bernoulli y binomial",
        slides: [
          {
            id: "md-1",
            title: "Proceso de Bernoulli",
            lead: L`Ensayos idénticos e independientes con dos resultados posibles y la misma probabilidad de éxito.`,
            body: L`<p><strong>Proceso de Bernoulli:</strong> (1) \(n\) ensayos idénticos; (2) cada uno con dos resultados, éxito o fracaso; (3) probabilidad de éxito \(p\) constante; (4) ensayos independientes.</p><p><strong>Un ensayo:</strong> \(X=1\) si hay éxito y \(X=0\) si no; \(X\sim B(1,p)\).</p><p><strong>Deducción:</strong> \(E(X)=0(1-p)+1\cdot p=p\); \(E(X^2)=0^2(1-p)+1^2p=p\); \(\mathrm{Var}(X)=p-p^2=p(1-p)\).</p>`,
            formula: L`X \sim B(1, \azul{p}) \qquad E(X) = \azul{p} \qquad \mathrm{Var}(X) = \azul{p}(1 - \azul{p})`,
            visual: "bernoulli_ensayo",
            source: "Apuntes del docente; Hayter.",
            abajo: [
              E({
                t: "Ejemplo: una pieza de una máquina",
                e: L`Una máquina produce cierta proporción de piezas defectuosas. Se elige una pieza al azar.`,
                d: [[L`\azul{p}=\azul{0{,}03}`, "proporción de piezas defectuosas"]],
                i: [L`Defina una variable aleatoria para el resultado.`, L`Halle su media, su varianza y su desviación estándar.`],
                p: [
                  L`<strong>a)</strong> \(X=1\) si la pieza es defectuosa y \(X=0\) si no: \(X\sim B(1;\ \azul{0{,}03})\), con \(p(1)=\azul{0{,}03}\) y \(p(0)=0{,}97\).`,
                  L`<strong>b)</strong> \[\begin{aligned} E(X)&=p=\verde{0{,}03}\\ \mathrm{Var}(X)&=p(1-p)=\azul{0{,}03}(0{,}97)=\verde{0{,}0291}\\ \sigma&=\sqrt{\mathrm{Var}(X)}=\sqrt{0{,}0291}=\verde{0{,}171} \end{aligned}\]`
                ],
                n: "", s: AP
              })
            ]
          },
          {
            id: "md-2",
            title: "Distribución binomial",
            lead: L`Número de éxitos en \(n\) ensayos de Bernoulli.`,
            body: L`<p><strong>Por qué esa fórmula:</strong> una secuencia concreta con \(x\) éxitos y \(n-x\) fracasos tiene probabilidad \(p^x(1-p)^{n-x}\) (independencia), y hay \(\binom{n}{x}\) maneras de ubicar los \(x\) éxitos.</p><p><strong>Media y varianza:</strong> \(X=X_1+\cdots+X_n\), con \(X_i\sim B(1,p)\) independientes. Las medias se suman: \(E(X)=np\). Sin covarianza, las varianzas también: \(\mathrm{Var}(X)=np(1-p)\).</p>`,
            formula: L`P(X = x) = \binom{\azul{n}}{x}\,\ocre{p}^x(1 - \ocre{p})^{\azul{n} - x}\qquad E(X)=\azul{n}\ocre{p}\qquad \mathrm{Var}(X)=\azul{n}\ocre{p}(1-\ocre{p})`,
            visual: "primer_binomial",
            codigo: { python: "scipy.stats.binom.pmf(x, n, p), scipy.stats.binom.cdf(x, n, p)", excel: "=DISTR.BINOM.N(x;n;p;FALSO), =DISTR.BINOM.N(x;n;p;VERDADERO)" },
            source: "Apuntes del docente; Canal Primer; Hayter.",
            abajo: [
              E({
                t: "Ejemplo: envíos que llegan tarde",
                e: L`En una empresa de transporte, cierta proporción de los envíos llega tarde. Se programan varios envíos, independientes entre sí.`,
                d: [[L`\azul{n}=\azul{8}`, "envíos programados"], [L`\ocre{p}=\ocre{0{,}30}`, "probabilidad de que un envío llegue tarde"]],
                i: [L`Halle la probabilidad de que exactamente ${k("morado", "3")} lleguen tarde.`, L`Halle la probabilidad de que al menos uno llegue tarde.`, L`Halle la probabilidad de que a lo sumo uno llegue tarde.`],
                p: [
                  L`<strong>Variable:</strong> \(X\) = envíos que llegan tarde, \(X\sim B(\azul{8};\ \ocre{0{,}3})\): \[P(X=x)=\binom{n}{x}p^x(1-p)^{n-x}\]`,
                  L`<strong>a)</strong> \[\begin{aligned} P(X=\morado{3})&=\binom{\azul{8}}{\morado{3}}\ocre{0{,}3}^{\morado{3}}(0{,}7)^{\azul{8}-\morado{3}}\\ &=56\,(0{,}027)(0{,}16807)=\verde{0{,}2541} \end{aligned}\]`,
                  L`<strong>b)</strong> Por el complemento: \[\begin{aligned} P(X\ge 1)&=1-P(X=0)\\ &=1-\binom{\azul{8}}{0}\ocre{0{,}3}^{0}(0{,}7)^{\azul{8}}=1-0{,}0576=\verde{0{,}9424} \end{aligned}\]`,
                  L`<strong>c)</strong> \[\begin{aligned} P(X\le 1)&=P(X=0)+P(X=1)\\ &=0{,}0576+\binom{\azul{8}}{1}\ocre{0{,}3}(0{,}7)^{7}=0{,}0576+0{,}1977=\verde{0{,}2553} \end{aligned}\]`
                ],
                n: "", s: AP
              }),
              E({
                t: "Ejemplo: seis caras en diez lanzamientos",
                e: L`Se lanza una moneda equilibrada varias veces.`,
                d: [[L`\azul{n}=\azul{10}`, "lanzamientos"], [L`\ocre{p}=\ocre{\tfrac12}`, "probabilidad de cara"]],
                i: [L`¿Cuál es la probabilidad de obtener exactamente ${k("morado", "6")} caras?`, L`Halle la media, la varianza y la desviación estándar del número de caras.`],
                p: [
                  L`<strong>Variable:</strong> \(X\) = número de caras, \(X\sim B(\azul{10};\ \ocre{\tfrac12})\).`,
                  L`<strong>a)</strong> \[\begin{aligned} P(X=x)&=\binom{n}{x}p^x(1-p)^{n-x}\\ P(X=\morado{6})&=\binom{\azul{10}}{\morado{6}}\left(\ocre{\tfrac12}\right)^{\morado{6}}\left(\tfrac12\right)^{4}=\frac{210}{1024}=\verde{0{,}205} \end{aligned}\]`,
                  L`<strong>b)</strong> \[\begin{aligned} E(X)&=np=\azul{10}\cdot\ocre{\tfrac12}=\verde{5}\\ \mathrm{Var}(X)&=np(1-p)=\azul{10}\cdot\ocre{\tfrac12}\cdot\tfrac12=\verde{2{,}5},\qquad \sigma=\sqrt{2{,}5}=\verde{1{,}58} \end{aligned}\]`
                ],
                n: "", s: AP
              }),
              E({
                t: "Ejemplo: cargamentos con artículos defectuosos",
                e: L`Una cadena de tiendas compra artículos con cierta proporción de defectuosos. De cada cargamento se inspecciona una muestra.`,
                d: [[L`\ocre{p}=\ocre{0{,}03}`, "proporción de defectuosos"], [L`\azul{n}=\azul{20}`, "artículos inspeccionados por cargamento"], [L`\morado{m}=\morado{10}`, "cargamentos recibidos"]],
                i: [L`¿Qué probabilidad hay de que un cargamento tenga al menos un defectuoso en la muestra?`, L`¿Qué probabilidad hay de que exactamente 3 de los 10 cargamentos tengan al menos un defectuoso?`],
                p: [
                  L`<strong>a)</strong> \(X\) = defectuosos entre 20, \(X\sim B(\azul{20};\ \ocre{0{,}03})\): \[\begin{aligned} P(X\ge 1)&=1-P(X=0)=1-(1-p)^n\\ &=1-0{,}97^{\azul{20}}=\verde{0{,}4562} \end{aligned}\]`,
                  L`<strong>b)</strong> Nuevo ensayo: cada cargamento es «éxito» si tiene algún defectuoso, con probabilidad 0,4562. \(Y\) = cargamentos con defecto, \(Y\sim B(\morado{10};\ 0{,}4562)\).`,
                  L`\[\begin{aligned} P(Y=y)&=\binom{m}{y}q^y(1-q)^{m-y}\\ P(Y=3)&=\binom{\morado{10}}{3}(0{,}4562)^{3}(0{,}5438)^{7}=\verde{0{,}1602} \end{aligned}\]`
                ],
                n: "", s: AP
              })
            ]
          },
          {
            id: "md-3",
            title: "Forma de la binomial según n y p",
            lead: L`Con \(p=0{,}5\) es simétrica; con \(p\) cerca de 0 o de 1 es asimétrica; al crecer \(n\) se parece a una campana.`,
            body: L`<p>El centro está en \(np\) y la dispersión crece con \(n\) como \(\sqrt{np(1-p)}\).</p>`,
            visual: "binomial",
            source: "Hayter."
          }
        ]
      },
      {
        id: "geometrica",
        title: "Geométrica y binomial negativa",
        slides: [
          {
            id: "md-4",
            title: "Distribución geométrica",
            lead: L`Número del ensayo en que aparece el primer éxito.`,
            body: L`<p><strong>Por qué esa fórmula:</strong> el primer éxito en el ensayo \(x\) exige \(x-1\) fracasos seguidos de un éxito.</p><p><strong>Media</strong> (serie geométrica derivada, \(\sum_{x\ge1}x\,q^{x-1}=\frac{1}{(1-q)^2}\) con \(q=1-p\)): \[E(X)=\sum_{x\ge1}x\,q^{x-1}p=\frac{p}{(1-q)^2}=\frac{p}{p^2}=\frac1p\]</p><p><strong>Binomial negativa:</strong> ensayo en que aparece el éxito número \(r\): \(P(X=x)=\binom{x-1}{r-1}p^r(1-p)^{x-r}\), \(E(X)=\frac{r}{p}\).</p>`,
            formula: L`P(X = x) = (1 - \azul{p})^{x - 1}\,\azul{p}, \quad x = 1, 2, \dots \qquad E(X) = \frac{1}{\azul{p}} \qquad \mathrm{Var}(X) = \frac{1 - \azul{p}}{\azul{p}^2}`,
            visual: "geometrica_espera",
            codigo: { python: "scipy.stats.geom.pmf(x, p)", excel: "=(1-p)^(x-1)*p" },
            source: "Apuntes del docente; Hayter.",
            abajo: [
              E({
                t: "Ejemplo: llamadas a un conmutador ocupado",
                e: L`En una hora de alta demanda se intenta conectar con un conmutador; cada intento tiene la misma probabilidad de éxito, de forma independiente.`,
                d: [[L`\azul{p}=\azul{0{,}05}`, "probabilidad de conectar en un intento"]],
                i: [L`¿Cuál es la probabilidad de necesitar exactamente ${k("ocre", "5")} intentos?`, L`¿Cuántos intentos se esperan?`],
                p: [
                  L`<strong>Variable:</strong> \(X\) = intento en que se logra la conexión, geométrica con \(p=\azul{0{,}05}\).`,
                  L`<strong>a)</strong> \[\begin{aligned} P(X=x)&=(1-p)^{x-1}p\\ P(X=\ocre{5})&=(1-\azul{0{,}05})^{\ocre{5}-1}\,\azul{0{,}05}=0{,}95^{4}(0{,}05)=\verde{0{,}0407} \end{aligned}\]`,
                  L`<strong>b)</strong> \[\begin{aligned} E(X)&=\frac{1}{p}\\ &=\frac{1}{\azul{0{,}05}}=\verde{20}\text{ intentos} \end{aligned}\]`
                ],
                n: "", s: AP
              })
            ]
          },
          {
            id: "md-4b",
            title: "Periodo de retorno",
            lead: L`Un evento de periodo de retorno \(T\) tiene probabilidad \(\frac{1}{T}\) de ocurrir cada año; no llega puntual cada \(T\) años.`,
            body: L`<p>Si los años son independientes y la probabilidad anual de excedencia es \(p=\frac1T\), el número de años hasta la primera excedencia es geométrico, con media \(\frac1p=T\).</p><p>La probabilidad de al menos una excedencia en \(n\) años sale del complemento de «ninguna en \(n\) años».</p>`,
            formula: L`P(\text{al menos una excedencia en } \azul{n} \text{ años}) = 1 - \left(1 - \frac{1}{\ocre{T}}\right)^{\azul{n}}`,
            visual: "retorno",
            source: "Chow, Maidment y Mays; Hayter."
          }
        ]
      },
      {
        id: "hipergeometrica",
        title: "Hipergeométrica",
        slides: [
          {
            id: "md-5",
            title: "Distribución hipergeométrica",
            lead: L`Éxitos en una muestra tomada sin reemplazo de una población finita.`,
            body: L`<p>Población de \(N\) elementos, \(r\) de ellos éxitos; se toma una muestra de \(n\) sin reemplazo. Los ensayos ya no son independientes.</p><p><strong>Por qué esa fórmula:</strong> casos favorables, elegir \(x\) éxitos de \(r\) y \(n-x\) fracasos de \(N-r\); casos posibles, \(\binom{N}{n}\).</p>`,
            formula: L`P(X = x) = \frac{\binom{\rojo{r}}{x}\binom{\azul{N}-\rojo{r}}{\ocre{n}-x}}{\binom{\azul{N}}{\ocre{n}}} \qquad\qquad E(X) = \ocre{n}\,\frac{\rojo{r}}{\azul{N}}`,
            visual: "hiper_vs_binom",
            codigo: { python: "scipy.stats.hypergeom.pmf(x, N, r, n)", excel: "=DISTR.HIPERGEOM.N(x;n;r;N;FALSO)" },
            source: "Apuntes del docente; Hayter.",
            abajo: [
              E({
                t: "Ejemplo: contratar personal con título",
                e: L`Un subgerente debe contratar personal entre un grupo de candidatos, algunos con título profesional. Elige al azar.`,
                d: [[L`\azul{N}=\azul{30}`, "candidatos"], [L`\rojo{r}=\rojo{22}`, "candidatos con título"], [L`\ocre{n}=\ocre{10}`, "personas que contrata"]],
                i: [L`¿Cuál es la probabilidad de que exactamente ${k("morado", "5")} de los contratados tengan título?`, L`¿Cuántos contratados con título se esperan?`],
                p: [
                  L`<strong>Variable:</strong> \(X\) = contratados con título. Muestra sin reemplazo de una población finita: hipergeométrica.`,
                  L`<strong>a)</strong> \[\begin{aligned} P(X=x)&=\frac{\binom{r}{x}\binom{N-r}{n-x}}{\binom{N}{n}}\\ P(X=\morado{5})&=\frac{\binom{\rojo{22}}{\morado{5}}\binom{\azul{30}-\rojo{22}}{\ocre{10}-\morado{5}}}{\binom{\azul{30}}{\ocre{10}}}=\frac{26\,334\cdot 56}{30\,045\,015}=\verde{0{,}0491} \end{aligned}\]`,
                  L`<strong>b)</strong> \[\begin{aligned} E(X)&=n\,\frac{r}{N}\\ &=\ocre{10}\cdot\frac{\rojo{22}}{\azul{30}}=\verde{7{,}33} \end{aligned}\] Lo esperable son unos 7; por eso 5 es poco probable.`
                ],
                n: "", s: AB
              })
            ]
          }
        ]
      },
      {
        id: "poisson",
        title: "Poisson",
        slides: [
          {
            id: "md-6",
            visual: "poisson",
            title: "Distribución de Poisson",
            lead: L`Número de eventos en un intervalo de tiempo, longitud, área o volumen.`,
            body: L`<p>Los eventos ocurren de forma independiente, a una tasa constante, y no ocurren dos en el mismo instante. \(\lambda\) es el número promedio de eventos en el intervalo.</p><p><strong>Media:</strong> \[E(X)=\sum_{x\ge0}x\frac{e^{-\lambda}\lambda^x}{x!}=\lambda\sum_{x\ge1}\frac{e^{-\lambda}\lambda^{x-1}}{(x-1)!}=\lambda\cdot1=\lambda\]</p><p>De forma similar, \(\mathrm{Var}(X)=\lambda\).</p>`,
            formula: L`P(X = x) = \frac{e^{-\morado{\lambda}}\,\morado{\lambda}^x}{x!},\quad x=0,1,2,\dots \qquad E(X) = \mathrm{Var}(X) = \morado{\lambda}`,
            codigo: { python: "scipy.stats.poisson.pmf(x, lam), scipy.stats.poisson.cdf(x, lam)", excel: "=POISSON.DIST(x;lambda;FALSO)" },
            source: "Apuntes del docente; Hayter.",
            abajo: [
              E({
                t: "Ejemplo: defectos en un pavimento",
                e: L`Después de un año de uso, un pavimento presenta defectos que aparecen al azar a lo largo de la vía.`,
                d: [[L`\morado{\lambda}=\morado{2}`, "defectos promedio por kilómetro"]],
                q: L`¿Cuál es la probabilidad de encontrar exactamente ${k("azul", "3")} defectos en un kilómetro?`,
                p: [
                  L`<strong>Variable:</strong> \(X\) = defectos en un kilómetro, Poisson con \(\lambda=\morado{2}\).`,
                  L`<strong>Probabilidad:</strong> \[\begin{aligned} P(X=x)&=\frac{e^{-\lambda}\lambda^x}{x!}\\ P(X=\azul{3})&=\frac{e^{-\morado{2}}\,\morado{2}^{\azul{3}}}{\azul{3}!}=\frac{8}{6}\,e^{-2}=\verde{0{,}180} \end{aligned}\]`
                ],
                n: "", s: AP
              }),
              E({
                t: "Ejemplo: desbordamientos de un río en 100 años",
                e: L`Un río se desborda en promedio una vez cada 100 años; los desbordamientos ocurren al azar.`,
                d: [[L`\morado{\lambda}=\morado{1}`, "desbordamientos promedio en 100 años"]],
                q: L`¿Cuál es la probabilidad de que no se desborde en los próximos 100 años?`,
                p: [
                  L`<strong>Variable:</strong> \(X\) = desbordamientos en 100 años, Poisson con \(\lambda=\morado{1}\).`,
                  L`<strong>Ninguno:</strong> \[\begin{aligned} P(X=x)&=\frac{e^{-\lambda}\lambda^x}{x!}\\ P(X=0)&=\frac{e^{-\morado{1}}\,\morado{1}^{0}}{0!}=e^{-1}=\verde{0{,}368} \end{aligned}\]`,
                  L`<strong>Los demás valores:</strong> \(P(1)=0{,}368\), \(P(2)=0{,}184\), \(P(3)=0{,}061\), \(P(4)=0{,}015\). «Una vez cada cien años» no garantiza un desbordamiento en ese lapso.`
                ],
                n: "", s: AP
              }),
              E({
                t: "Ejemplo: goles en un partido",
                e: L`En el Mundial de fútbol, los goles de un partido ocurren al azar durante el juego.`,
                d: [[L`\morado{\lambda}=\morado{2{,}5}`, "goles promedio por partido"]],
                q: L`¿Cuál es la probabilidad de que haya exactamente ${k("azul", "un")} gol en un partido?`,
                p: [
                  L`<strong>Variable:</strong> \(X\) = goles en un partido, Poisson con \(\lambda=\morado{2{,}5}\).`,
                  L`<strong>Probabilidad:</strong> \[\begin{aligned} P(X=x)&=\frac{e^{-\lambda}\lambda^x}{x!}\\ P(X=\azul{1})&=\frac{e^{-\morado{2{,}5}}\,\morado{2{,}5}^{\azul{1}}}{\azul{1}!}=2{,}5\,e^{-2{,}5}=\verde{0{,}205} \end{aligned}\]`
                ],
                n: "", s: AP
              })
            ]
          },
          {
            id: "md-6b",
            title: "Poisson como límite de la binomial",
            lead: L`Si \(n\) es grande, \(p\) pequeño y \(\lambda=np\) se mantiene, la binomial se aproxima por una Poisson.`,
            body: L`<p><strong>Teorema:</strong> si \(X\sim B(n,p)\) con \(n\to\infty\), \(p\to0\) y \(np=\lambda\) constante, entonces \(P(X=x)\to\dfrac{e^{-\lambda}\lambda^x}{x!}\).</p><p>Muchos ensayos, cada uno con probabilidad muy pequeña: solo importa el producto \(np\).</p>`,
            formula: L`\binom{\azul{n}}{x}\ocre{p}^x(1-\ocre{p})^{\azul{n}-x}\ \approx\ \frac{e^{-\morado{\lambda}}\,\morado{\lambda}^x}{x!},\qquad \morado{\lambda}=\azul{n}\ocre{p}`,
            visual: "poisson_limite",
            source: "Apuntes del docente; Walpole et al.",
            abajo: [
              E({
                t: "Ejemplo: burbujas en piezas de vidrio",
                e: L`En la fabricación de piezas de vidrio, algunas salen con burbujas. Se revisa una muestra grande.`,
                d: [[L`\ocre{p}=\ocre{0{,}001}`, "proporción de piezas con burbujas"], [L`\azul{n}=\azul{8000}`, "piezas en la muestra"]],
                q: L`¿Cuál es la probabilidad de que haya menos de ${k("magenta", "7")} piezas con burbujas?`,
                p: [
                  L`<strong>Variable:</strong> \(X\) = piezas con burbujas, \(X\sim B(\azul{8000};\ \ocre{0{,}001})\).`,
                  L`<strong>Aproximación:</strong> \(n\) grande y \(p\) pequeño: \[\lambda=np=\azul{8000}(\ocre{0{,}001})=\morado{8}\]`,
                  L`<strong>Probabilidad:</strong> \[\begin{aligned} P(X\lt\magenta{7})&=P(X\le 6)=\sum_{x=0}^{6}\frac{e^{-\lambda}\lambda^{x}}{x!}\\ &=\sum_{x=0}^{6}\frac{e^{-\morado{8}}\,\morado{8}^{x}}{x!}=\verde{0{,}3134} \end{aligned}\]`
                ],
                n: "", s: AP
              }),
              E({
                t: "Ejemplo: tubos de ensayo rotos",
                e: L`Cada vez que un estudiante hace una práctica de química puede romper un tubo de ensayo, de forma independiente de los demás.`,
                d: [[L`\ocre{p}=\ocre{0{,}01}`, "probabilidad de romper un tubo"], [L`\azul{n}=\azul{300}`, "estudiantes que hacen la práctica"]],
                q: L`¿Cuál es la probabilidad de que no se rompa ningún tubo? Compare la binomial con la Poisson.`,
                p: [
                  L`<strong>Variable:</strong> \(X\) = tubos rotos, \(X\sim B(\azul{300};\ \ocre{0{,}01})\), con \(\lambda=np=\azul{300}(\ocre{0{,}01})=\morado{3}\).`,
                  L`<strong>Binomial:</strong> \[\begin{aligned} P(X=0)&=(1-p)^n\\ &=0{,}99^{\azul{300}}=\verde{0{,}0490} \end{aligned}\]`,
                  L`<strong>Poisson:</strong> \[\begin{aligned} P(X=0)&=\frac{e^{-\lambda}\lambda^0}{0!}\\ &=e^{-\morado{3}}=\verde{0{,}0498} \end{aligned}\] La diferencia es menor que una milésima.`
                ],
                n: "", s: AP
              })
            ]
          },
          {
            id: "md-7",
            title: "Cómo elegir el modelo discreto",
            lead: L`Primero se identifica qué se cuenta y cómo se observa; después se elige la fórmula.`,
            body: L`<table class="modelos"><tr><td>Binomial</td><td>número fijo de ensayos independientes con la misma \(p\): ¿cuántos éxitos?</td></tr><tr><td>Geométrica</td><td>se repite hasta el primer éxito: ¿en qué ensayo?</td></tr><tr><td>Binomial negativa</td><td>se repite hasta el éxito número \(r\).</td></tr><tr><td>Hipergeométrica</td><td>muestra sin reemplazo de una población finita.</td></tr><tr><td>Poisson</td><td>eventos en un intervalo de tiempo o espacio, con tasa \(\lambda\).</td></tr></table>`,
            visual: "selector_discreto",
            source: "Hayter."
          }
        ]
      }
    ]
  };
}());
