/* Modelos de probabilidad continuos y distribución normal.
   Requiere clase_figuras.js (window.Fig).
   Convenciones: U(a, b), Exp(λ), N(μ, σ²), Φ(z), z_α.
   Principio didáctico: priorizar los modelos esenciales (Uniforme, Exponencial, Weibull, Normal) con enunciados claros. */
(function () {
  "use strict";
  const F = window.Fig, K = F.K, L = F.L, co = F.co, k = F.k;

  function figExponencial() {
    const lam = 0.5, f = (t) => (t < 0 ? 0 : lam * Math.exp(-lam * t));
    return F.curvas([{ f, color: K.verde }], {
      xmin: 0, xmax: 10, ymax: 0.55,
      alt: "Densidad exponencial decreciente con tasa lambda igual a 0,5",
      xlabel: "t, tiempo de espera (horas)", ylabel: "f(t)",
      areas: [{ from: 3, to: 10, f, color: K.azul }],
      ticks: [0, 2, 3, 4, 6, 8, 10],
      vlines: [{ x: 2, color: K.rojo }],
      labels: [{ x: 2.2, y: 58, text: "E(T) = 1/λ = 2 h", color: K.rojo, anchor: "start" }, { x: 4.5, y: 245, text: "P(T > 3): cola hasta ∞", color: K.azul, anchor: "start" }],
      note: "La sombra visible termina en 10 h; la cola continúa. P(T > 10) = 0,00674. Modelo de Poisson con tasa \\(\\lambda = 0{,}5\\) eventos/hora."
    });
  }

  function figReglaEmpirica() {
    const f = F.normal(0, 1);
    return F.curvas([{ f, color: K.tinta }], {
      xmin: -3.5, xmax: 3.5, ymax: 0.44,
      alt: "Regla 68-95-99,7 por ciento bajo la campana normal",
      xlabel: "distancia desde μ en desviaciones estándar (z)", ylabel: "φ(z)",
      areas: [
        { from: -3, to: 3, f, color: K.gris },
        { from: -2, to: 2, f, color: K.azul },
        { from: -1, to: 1, f, color: K.verde }
      ],
      ticks: [{ x: -3, text: "μ−3σ" }, { x: -2, text: "μ−2σ" }, { x: -1, text: "μ−σ" }, { x: 0, text: "μ" }, { x: 1, text: "μ+σ" }, { x: 2, text: "μ+2σ" }, { x: 3, text: "μ+3σ" }],
      labels: [{ x: 0, y: 175, text: "68,3 %", color: K.verde }, { x: 0, y: 245, text: "95,4 % a ±2σ", color: K.azul }],
      note: "Cualquier variable normal mantiene exactamente las mismas proporciones al expresarse en unidades de \\(\\sigma\\)."
    });
  }

  window.COURSE = {
    id: "modelos_continuos",
    title: "Modelos de probabilidad continuos",
    shortTitle: "Modelos continuos",
    subtitle: L`Elegir el modelo por el mecanismo, calcular áreas y comprobar qué permiten concluir los supuestos`,
    modules: [
      {
        id: "uniforme_exp",
        title: "Uniforme, exponencial, gamma y Weibull",
        summary: "Densidad constante U(a, b), tiempos de espera sin memoria Exp(λ) y desgaste con Weibull.",
        slides: [
          {
            id: "mc-1",
            title: L`Distribución uniforme`,
            lead: L`Todos los subintervalos de igual longitud dentro de \([a,b]\) tienen la misma probabilidad.`,
            body: L`<p>La uniforme se justifica cuando el mecanismo asigna la misma probabilidad a subintervalos de igual longitud. Conocer solo un mínimo y un máximo no demuestra uniformidad.</p><p>En \(X\sim U(a,b)\), la densidad vale \(1/(b-a)\) dentro del intervalo y cero fuera. La probabilidad es base por altura.</p>`,
            formula: L`\mu = \frac{a + b}{2} \qquad \mathrm{Var}(X) = \frac{(b - a)^2}{12} \qquad P(c \le X \le d) = \frac{d - c}{b - a}`,
            lectura: L`La expresión de probabilidad supone \(a\le c\le d\le b\). La media tiene las unidades de \(X\); la varianza, sus unidades al cuadrado.`,
            codigo: {python: "scipy.stats.uniform.cdf(x, loc=a, scale=b-a)", excel: "=MAX(0;MIN(1;(x-a)/(b-a)))"},
            source: "Devore; Hayter.",
            abajo: [
              {
                title: L`Ejemplo: duración de una conferencia`,
                body: L`<div class="enunciado">Una sala de conferencias se puede reservar por no más de 4 horas. La duración \(X\) de una conferencia es uniforme en \([0,\ \azul{4}]\). a) ¿Cuál es la función de densidad? b) ¿Qué probabilidad hay de que una conferencia dure al menos 3 horas?</div><ol class="pasos"><li><strong>Variable:</strong> \(X\) = duración de una conferencia en horas, \(X\sim U(0,\ \azul{4})\).</li><li><strong>a) Densidad:</strong> \(f(x)=\dfrac{1}{B-A}=\dfrac{1}{\azul{4}-0}=\dfrac14\) para \(0\le x\le4\), y 0 en otro caso.</li><li><strong>b)</strong> \[P(X\ge3)=\int_{3}^{4}\frac14\,dx=\left.\frac{x}{4}\right|_{3}^{4}=\frac44-\frac34=\verde{\frac14}\]</li></ol>`,
                source: L`Ejemplo de los apuntes del docente (Walpole et al.).`
              },
              {
                title: L`Ejemplo: latas con media y rango conocidos`,
                body: L`<div class="enunciado">El peso \(X\) de unas latas de alimento es uniforme, con media \(\azul{16}\) onzas y rango \(\ocre{4{,}2}\) onzas. a) ¿Cuál es la lata más liviana posible? b) ¿Qué probabilidad hay de que una lata pese entre 15,8 y 16,5 onzas?</div><ol class="pasos"><li><strong>Variable:</strong> \(X\) = peso de una lata en onzas, \(X\sim U(A,B)\) con \(A\) y \(B\) desconocidos.</li><li><strong>Dos ecuaciones:</strong> \[\begin{aligned} \frac{A+B}{2}&=\azul{16} &&\Rightarrow\ A+B=32\\ B-A&=\ocre{4{,}2} \end{aligned}\] Sumando: \(2B=36{,}2\Rightarrow B=18{,}1\) y \(A=13{,}9\).</li><li><strong>a)</strong> la lata más liviana pesa \(A=\verde{13{,}9}\) onzas.</li><li><strong>b)</strong> con \(f(x)=\frac{1}{B-A}=\frac{1}{\ocre{4{,}2}}\): \[P(15{,}8&lt;X&lt;16{,}5)=\int_{15{,}8}^{16{,}5}\frac{1}{\ocre{4{,}2}}\,dx=\frac{16{,}5-15{,}8}{\ocre{4{,}2}}=\frac{0{,}7}{4{,}2}=\verde{\frac16}\]</li></ol>`,
                source: L`Ejemplo de los apuntes del docente (Webster).`
              },
              {
                title: L`Ejemplo: un cliente llegó en media hora`,
                body: L`<div class="enunciado">Los clientes llegan a una caja según un proceso de Poisson. Se sabe que en un periodo de \(\azul{30}\) minutos llegó exactamente un cliente. ¿Cuál es la probabilidad de que haya llegado en los últimos \(\ocre{5}\) minutos?</div><ol class="pasos"><li><strong>Resultado:</strong> si en \((0,t)\) ocurrió exactamente un evento de Poisson, su instante es uniforme en ese intervalo.</li><li><strong>Variable:</strong> \(X\) = minuto en que llegó el cliente, \(X\sim U(0,\ \azul{30})\), \(f(x)=\frac{1}{\azul{30}}\).</li><li><strong>Probabilidad:</strong> \[P(25&lt;X&lt;30)=\int_{25}^{30}\frac{1}{\azul{30}}\,dx=\frac{\ocre{5}}{\azul{30}}=\verde{\frac16}\]</li></ol>`,
                source: L`Ejemplo de los apuntes del docente (Walpole et al.).`
              }
            ]
          },
          {
            id: "mc-2",
            title: L`Distribución exponencial`,
            lead: L`Tiempo hasta el primer evento de un proceso de Poisson, o entre dos eventos.`,
            body: `<p>Sea \\(T \\ge 0\\) el tiempo hasta que ocurra el primer evento de un proceso de Poisson de tasa \\(\\azul{\\lambda} > 0\\). Que \\(T > t\\) equivale a «0 eventos en \\([0, t]\\)», cuya probabilidad Poisson es \\(e^{-\\lambda t}\\):</p>
                   <p>Por ello \\(F(t) = 1 - e^{-\\lambda t}\\), y derivando se obtiene la densidad \\(f(t) = \\lambda e^{-\\lambda t}\\).</p>`,
            formula: L`P(T > t) = e^{-\azul{\lambda} t} \qquad E(T) = \frac{1}{\azul{\lambda}} \qquad \mathrm{Var}(T) = \frac{1}{\azul{\lambda}^2}`,
            lectura: `A mayor tasa ${k("azul", "λ")}, menor es el tiempo promedio de espera \\(1/\\lambda\\). Además, no tiene memoria: haber esperado \\(s\\) no altera el futuro.`,
            figure: figExponencial(),
            codigo: { python: "scipy.stats.expon.cdf(t, scale=1/lam)", excel: "=DISTR.EXP.N(t; lam; VERDADERO)" },
            source: "Montgomery y Runger; Hayter.",
            abajo: [
              {
                title: L`Ejemplo: vida útil de una batería`,
                body: L`<div class="enunciado">La vida útil \(X\) de una batería, en cientos de horas, tiene densidad \(f(x)=\frac12e^{-x/2}\) para \(x&gt;0\). a) ¿Qué probabilidad hay de que dure menos de 200 o más de 400 horas? b) ¿Qué probabilidad hay de que dure más de 300 horas si ya funcionó más de 200?</div><ol class="pasos"><li><strong>Variable:</strong> \(X\) = vida útil en cientos de horas; es exponencial con media 2, así que \(P(X&gt;x)=e^{-x/2}\).</li><li><strong>a)</strong> los eventos son excluyentes: \[P(X&lt;2)+P(X&gt;4)=\left(1-e^{-1}\right)+e^{-2}=0{,}632+0{,}135=\verde{0{,}767}\]</li><li><strong>b) Condicional:</strong> \[P(X&gt;3\mid X&gt;2)=\frac{P(X&gt;3)}{P(X&gt;2)}=\frac{e^{-3/2}}{e^{-1}}=e^{-1/2}=\verde{0{,}607}\]</li><li><strong>Lectura:</strong> es igual a \(P(X&gt;1)\): haber funcionado 200 horas no cambia la probabilidad de durar 100 más. Es la falta de memoria.</li></ol>`,
                source: L`Ejemplo de los apuntes del docente.`
              },
              {
                title: L`Ejemplo: cinco componentes con vida exponencial`,
                body: L`<div class="enunciado">El tiempo de falla de un componente es exponencial con media \(\azul{5}\) años. Se instalan \(\ocre{5}\) componentes en sistemas distintos. ¿Cuál es la probabilidad de que al menos 2 sigan funcionando al final de \(\morado{8}\) años?</div><ol class="pasos"><li><strong>Variable 1:</strong> \(T\) = tiempo de falla, exponencial con \(\beta=\azul{5}\): \[p=P(T&gt;\morado{8})=e^{-\morado{8}/\azul{5}}=e^{-1{,}6}=0{,}2019\]</li><li><strong>Variable 2:</strong> \(X\) = componentes que funcionan a los 8 años, \(X\sim B(\ocre{5};\ 0{,}2019)\).</li><li><strong>Al menos dos, por el complemento:</strong> \[\begin{aligned} P(X\ge2)&=1-P(X=0)-P(X=1)\\ &=1-(0{,}7981)^{5}-\binom{5}{1}(0{,}2019)(0{,}7981)^{4}=\verde{0{,}267} \end{aligned}\]</li></ol>`,
                source: L`Ejemplo de los apuntes del docente (Walpole et al.).`
              }
            ]
          },
          {
            id: "mc-2g",
            title: L`Distribución gamma`,
            lead: L`Tiempo hasta que ocurren \(\alpha\) eventos de un proceso de Poisson.`,
            body: L`<p><strong>Parámetros:</strong> \(\alpha\) = forma (número de eventos que se esperan); \(\beta\) = escala (tiempo medio entre eventos), \(\beta=\frac{1}{\lambda}\) con \(\lambda\) la tasa.</p><p><strong>Función gamma:</strong> \(\Gamma(\alpha)=\int_0^\infty x^{\alpha-1}e^{-x}dx\); \(\Gamma(n)=(n-1)!\), \(\Gamma(1)=1\), \(\Gamma(\frac12)=\sqrt\pi\).</p><p>Con \(\alpha=1\) se obtiene la exponencial. Modela datos asimétricos a la derecha: tiempos de falla, de espera, de servicio.</p>`,
            formula: L`f(x)=\frac{x^{\azul{\alpha}-1}e^{-x/\ocre{\beta}}}{\ocre{\beta}^{\azul{\alpha}}\,\Gamma(\azul{\alpha})},\ x>0\qquad E(X)=\azul{\alpha}\ocre{\beta}\qquad \mathrm{Var}(X)=\azul{\alpha}\ocre{\beta}^2`,
            codigo: { python: "scipy.stats.gamma.cdf(x, a=alfa, scale=beta)", excel: "=DISTR.GAMMA(x;alfa;beta;VERDADERO)" },
            source: "Apuntes del docente; Walpole et al.; Hayter.",
            abajo: [
              {
                title: L`Ejemplo: tiempo hasta la segunda llamada`,
                body: L`<div class="enunciado">Las llamadas a un conmutador siguen un proceso de Poisson con \(\lambda=\azul{5}\) llamadas por minuto. Sea \(T\) el tiempo hasta que llegan \(\ocre{2}\) llamadas. ¿Cuál es la probabilidad de que pase más de un minuto?</div><ol class="pasos"><li><strong>Variable:</strong> \(T\) = minutos hasta la segunda llamada: gamma con \(\alpha=\ocre{2}\) y \(\beta=\frac{1}{\azul{5}}\).</li><li><strong>Densidad:</strong> \[f(t)=\frac{t^{\ocre{2}-1}e^{-t/\beta}}{\beta^{\ocre{2}}\,\Gamma(\ocre{2})}=\frac{t\,e^{-\azul{5}t}}{\left(\frac15\right)^2\cdot1}=25\,t\,e^{-5t},\quad t&gt;0\]</li><li><strong>Por partes</strong> (\(u=t\), \(dv=e^{-5t}dt\)): \[\begin{aligned} P(T\le1)&=25\int_0^1 t\,e^{-5t}\,dt=25\left[-\frac{t\,e^{-5t}}{5}-\frac{e^{-5t}}{25}\right]_0^1\\ &=1-6e^{-5}=0{,}960 \end{aligned}\]</li><li><strong>Respuesta:</strong> \(P(T&gt;1)=1-0{,}960=6e^{-5}=\verde{0{,}040}\).</li><li><strong>Comprobación con Poisson:</strong> \(T&gt;1\) significa menos de 2 llamadas en el primer minuto: \(e^{-5}(1+5)=0{,}040\).</li></ol>`,
                source: L`Ejemplo de los apuntes del docente (Walpole et al.).`
              }
            ]
          },
          {
            id: "mc-3",
            title: L`Distribución de Weibull`,
            lead: L`Generaliza la exponencial cuando la tasa de falla cambia con el tiempo.`,
            body: L`<p>Weibull usa una <strong>forma</strong> \(a>0\) y una <strong>escala temporal</strong> \(\eta>0\). Aquí se escribe \(\lambda=1/\eta\), la inversa de escala: si \(t\) está en años, \(\lambda\) está en año\(^{-1}\).</p><p>Su tasa de falla es constante si \(a=1\), creciente si \(a>1\) y decreciente si \(a<1\). La forma describe un patrón; no identifica por sí sola la causa física.</p>`,
            formula: L`\begin{gathered} \verde{R(t)} = P(T > t) = e^{-(\azul{\lambda} t)^{\ocre{a}}} \\[10pt] E(T) = \frac{1}{\azul{\lambda}}\,\Gamma\!\left(1 + \frac{1}{\ocre{a}}\right) \end{gathered}`,
            lectura: L`A forma fija, aumentar \(\eta=1/\lambda\) alarga los tiempos. Si cambia \(a\), las curvas pueden cruzarse: no hay un orden universal de confiabilidad.`,
            visual: "weibull",
            source: L`NIST/SEMATECH e-Handbook, distribución Weibull; Hayter.`
          }
        ]
      },
      {
        id: "normal",
        title: L`Normal y distribuciones derivadas`,
        summary: "Campana de Gauss, estandarización Z, regla empírica, combinaciones lineales y aproximación binomial.",
        slides: [
          {
            id: "mc-4",
            title: L`Distribución normal`,
            lead: L`Simétrica alrededor de \(\mu\), con dispersión \(\sigma\); regla 68–95–99,7.`,
            body: `<p>Una variable \\(X \\sim N(\\azul{\\mu}, \\ocre{\\sigma}^2)\\) tiene densidad en campana centrada en su media \\(\\azul{\\mu}\\) y con ancho controlado por su desviación estándar \\(\\ocre{\\sigma}\\).</p>
                   <p>Su densidad \\(f(x) = \\frac{1}{\\sigma\\sqrt{2\\pi}} e^{-\\frac{1}{2}\\left(\\frac{x - \\mu}{\\sigma}\\right)^2}\\) no tiene primitiva elemental; las áreas se obtienen mediante la normal estándar \\(Z \\sim N(0, 1)\\).</p>`,
            figure: figReglaEmpirica(),
            source: "Gauss; Devore; Hayter."
          },
          {
            id: "mc-5",
            title: L`Estandarización y tabla Z`,
            lead: L`\(Z=\frac{X-\mu}{\sigma}\) indica a cuántas desviaciones estándar está \(x\) de la media.`,
            body: L`<div class="enunciado">En un ejemplo hipotético, la resistencia medida a 28 días se modela como \(X\sim N(28,3^2)\), en MPa. Se desea conocer la proporción por debajo de un <strong>umbral de comparación</strong> de 24,2 MPa. No se está aplicando un criterio de aceptación de una norma.</div><p>Para usar la normal estándar, se resta la media y se divide entre la desviación: el resultado no tiene unidades.</p>`,
            formula: L`\begin{gathered} \azul{Z} = \frac{X - \verde{\mu}}{\ocre{\sigma}} \sim N(0, 1) \\[10pt] P(X \le x) = \Phi\!\left(\frac{x - \verde{\mu}}{\ocre{\sigma}}\right) \end{gathered}`,
            lectura: L`\(z=(24{,}2-28)/3=-1{,}2667\). Por tanto, \(P(X<24{,}2)=\Phi(-1{,}2667)\approx0{,}10264\): 10,26 %.`,
            visual: "normal",
            codigoSoloGuia: true,
            codigo: { python: "scipy.stats.norm.cdf(x, mu, sigma)", excel: "=DISTR.NORM.N(x; mu; sigma; VERDADERO)" },
            source: "Hayter; caso ilustrativo de concreto.",
            abajo: [
              {
                title: L`Ejemplo: diámetro de anillos de pistón`,
                body: L`<div class="enunciado">El diámetro interior \(X\) de un anillo de pistón es normal con media \(\mu=\azul{10}\) cm y desviación \(\sigma=\ocre{0{,}03}\) cm. a) ¿Qué proporción excede 10,075 cm? b) ¿Qué probabilidad hay de que esté entre 9,97 y 10,03 cm? c) ¿Por debajo de qué diámetro cae el 15 % de los anillos?</div><ol class="pasos"><li><strong>Variable:</strong> \(X\) = diámetro interior en cm, \(X\sim N(\azul{10};\ \ocre{0{,}03}^2)\).</li><li><strong>a)</strong> \[z=\frac{x-\mu}{\sigma}=\frac{10{,}075-\azul{10}}{\ocre{0{,}03}}=2{,}5,\qquad P(Z&gt;2{,}5)=1-0{,}99379=\verde{0{,}0062}\]</li><li><strong>b)</strong> \(z_1=\frac{9{,}97-\azul{10}}{\ocre{0{,}03}}=-1\), \(z_2=1\): \(P(-1&lt;Z&lt;1)=\verde{0{,}6827}\).</li><li><strong>c) Problema inverso:</strong> se busca \(x\), no una probabilidad. \(P(Z&lt;z)=0{,}15\Rightarrow z=-1{,}04\): \[x=\mu+z\sigma=\azul{10}+(-1{,}04)(\ocre{0{,}03})=\verde{9{,}969}\ \text{cm}\]</li></ol>`,
                source: L`Ejemplo de los apuntes del docente (Walpole et al.).`
              }
            ]
          },
          {
            id: "mc-6",
            title: L`Combinaciones lineales de normales`,
            lead: L`Una combinación lineal de normales independientes también es normal.`,
            body: `<p>Si \\(X_1 \\sim N(\\mu_1, \\sigma_1^2)\\) y \\(X_2 \\sim N(\\mu_2, \\sigma_2^2)\\) son independientes, para constantes \\(a, b\\):</p>`,
            formula: L`\azul{a}X_1 + \ocre{b}X_2 \sim N\!\left(\azul{a}\mu_1 + \ocre{b}\mu_2,\;\; \azul{a}^2\sigma_1^2 + \ocre{b}^2\sigma_2^2\right)`,
            lectura: L`La suma y la diferencia de normales independientes son normales. En una resta las medias se restan, pero las varianzas se suman.`,
            source: "Hayter; Montgomery y Runger."
          },
          {
            id: "mc-7",
            title: L`Aproximación normal a la binomial`,
            lead: L`Con \(np\) y \(n(1-p)\) grandes, la binomial se aproxima por una normal con corrección de continuidad.`,
            body: `<p>Si \\(X \\sim B(n, p)\\) tiene muchos ensayos, calcular sumas binomiales a mano es largo. Como \\(X\\) es suma de \\(n\\) Bernoulli independientes, puede aproximarse por \\(N(np,\\; np(1-p))\\).</p>
                   <p>Al pasar de barras discretas (ancho 1 centrado en cada entero \\(x\\)) a una curva continua, conviene extender los límites en \\(\\pm 0{,}5\\):</p>`,
            formula: L`P(X \ge x) \approx 1 - \Phi\!\left(\frac{(x - \ocre{0{,}5}) - np}{\sqrt{np(1 - p)}}\right)`,
            lectura: `Para incluir completa la barra centrada en \\(x\\), la integral continua comienza en ${k("ocre", "x − 0,5")}.`,
            source: "Hayter; De Moivre-Laplace."
          },
          {
            id: "mc-8",
            title: L`Distribuciones χ², t y F`,
            lead: L`Se derivan de la normal y se usan en los intervalos de confianza.`,
            body: L`<table class="modelos"><tr><td>\(\chi^2_\nu\)</td><td>\(\sum_{i=1}^{\nu}Z_i^2\), con \(Z_i\) normales estándar independientes.</td></tr><tr><td>\(t_\nu\)</td><td>\(Z/\sqrt{U/\nu}\), con \(Z\sim N(0,1)\), \(U\sim\chi^2_\nu\) e independencia entre ambos.</td></tr><tr><td>\(F_{\nu_1,\nu_2}\)</td><td>\((U/\nu_1)/(V/\nu_2)\), con \(U\) y \(V\) chi-cuadrado independientes.</td></tr></table><p>Las condiciones de independencia forman parte de las definiciones; no basta reconocer la forma del cociente.</p>`,
            source: "Hayter; Devore."
          }
        ]
      }
    ]
  };
}());
