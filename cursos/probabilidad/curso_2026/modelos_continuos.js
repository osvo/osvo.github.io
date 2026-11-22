/* Modelos de probabilidad continuos y distribución normal.
   Requiere clase_figuras.js (window.Fig).
   Convenciones: U(a, b), Exp(λ), N(μ, σ²), Φ(z), z_α.
   Principio didáctico: priorizar los modelos esenciales (Uniforme, Exponencial, Weibull, Normal) con enunciados claros. */
(function () {
  "use strict";
  const F = window.Fig, K = F.K, L = F.L, co = F.co, k = F.k, E = F.ejemplo;

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
            visual: "uniforme_area",
            codigo: {python: "scipy.stats.uniform.cdf(x, loc=a, scale=b-a)", excel: "=MAX(0;MIN(1;(x-a)/(b-a)))"},
            source: "Devore; Hayter.",
            abajo: [
              E({
                t: "Ejemplo: duración de una conferencia",
                e: L`Una sala de conferencias se puede reservar por no más de 4 horas. La duración de una conferencia se distribuye de manera uniforme en ese lapso.`,
                d: [[L`\ocre{a}=\ocre{0}`, "duración mínima (h)"], [L`\azul{b}=\azul{4}`, "duración máxima (h)"]],
                i: [L`Escriba la función de densidad.`, L`Halle la probabilidad de que una conferencia dure al menos ${k("morado", "3")} horas.`],
                p: [
                  L`<strong>Variable:</strong> \(X\) = duración de una conferencia en horas, \(X\sim U(\ocre{0},\ \azul{4})\).`,
                  L`<strong>a)</strong> \[\begin{aligned} f(x)&=\frac{1}{b-a}\\ &=\frac{1}{\azul{4}-\ocre{0}}=\verde{\frac14},\qquad 0\le x\le 4 \end{aligned}\] y \(f(x)=0\) fuera del intervalo.`,
                  L`<strong>b)</strong> \[\begin{aligned} P(X\ge c)&=\int_{c}^{b}\frac{1}{b-a}\,dx=\frac{b-c}{b-a}\\ P(X\ge\morado{3})&=\frac{\azul{4}-\morado{3}}{\azul{4}-\ocre{0}}=\verde{\frac14} \end{aligned}\]`
                ],
                n: "", s: "Ejemplo de los apuntes del docente (Walpole et al.)."
              }),
              E({
                t: "Ejemplo: latas con media y rango conocidos",
                e: L`El peso de unas latas de alimento se distribuye de manera uniforme. Se conocen su media y su rango.`,
                d: [[L`\azul{\mu}=\azul{16}`, "peso medio (onzas)"], [L`\ocre{b-a}=\ocre{4{,}2}`, "rango (onzas)"]],
                i: [L`¿Cuánto pesa la lata más liviana posible?`, L`¿Qué probabilidad hay de que una lata pese entre ${k("morado", "15,8")} y ${k("morado", "16,5")} onzas?`],
                p: [
                  L`<strong>Variable:</strong> \(X\) = peso de una lata en onzas, \(X\sim U(a,b)\) con \(a\) y \(b\) desconocidos.`,
                  L`<strong>a)</strong> Media y rango dan dos ecuaciones: \[\begin{aligned} \mu=\frac{a+b}{2}&=\azul{16}\ \Rightarrow\ a+b=32\\ b-a&=\ocre{4{,}2} \end{aligned}\] Al restarlas: \(2a=32-\ocre{4{,}2}=27{,}8\), así que \(a=\verde{13{,}9}\) onzas (y \(b=18{,}1\)).`,
                  L`<strong>b)</strong> \[\begin{aligned} P(c\lt X\lt d)&=\frac{d-c}{b-a}\\ P(\morado{15{,}8}\lt X\lt\morado{16{,}5})&=\frac{\morado{16{,}5}-\morado{15{,}8}}{\ocre{4{,}2}}=\frac{0{,}7}{4{,}2}=\verde{\frac16} \end{aligned}\]`
                ],
                n: "", s: "Ejemplo de los apuntes del docente (Walpole et al.)."
              }),
              E({
                t: "Ejemplo: instante de llegada de un cliente",
                e: L`Los clientes llegan a una caja según un proceso de Poisson. Se sabe que en un periodo de media hora llegó exactamente un cliente.`,
                d: [[L`\azul{t}=\azul{30}`, "duración del periodo (min)"], [L`\ocre{5}`, "últimos minutos del periodo"]],
                q: L`¿Cuál es la probabilidad de que el cliente haya llegado en los últimos 5 minutos?`,
                p: [
                  L`<strong>Resultado que se usa:</strong> si en \((0,t)\) ocurrió exactamente un evento de un proceso de Poisson, el instante del evento es uniforme en \((0,t)\).`,
                  L`<strong>Variable:</strong> \(X\) = minuto en que llegó el cliente, \(X\sim U(0,\ \azul{30})\).`,
                  L`<strong>Probabilidad:</strong> \[\begin{aligned} P(c\lt X\lt d)&=\frac{d-c}{b-a}\\ P(25\lt X\lt 30)&=\frac{\ocre{5}}{\azul{30}-0}=\verde{\frac16} \end{aligned}\]`
                ],
                n: "", s: "Ejemplo de los apuntes del docente (Walpole et al.)."
              })
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
            visual: "exponencial_memoria",
            codigo: { python: "scipy.stats.expon.cdf(t, scale=1/lam)", excel: "=DISTR.EXP.N(t; lam; VERDADERO)" },
            source: "Montgomery y Runger; Hayter.",
            abajo: [
              E({
                t: "Ejemplo: vida útil de una batería",
                e: L`La vida útil de una batería, medida en cientos de horas, tiene función de densidad \(f(x)=\frac12e^{-x/2}\) para \(x\gt 0\).`,
                d: [[L`\azul{\lambda}=\azul{\tfrac12}`, "tasa de falla (por cada cien horas)"], [L`E(X)=\tfrac{1}{\azul{\lambda}}=2`, "vida media: 200 horas"]],
                i: [L`¿Qué probabilidad hay de que dure menos de ${k("morado", "200")} horas o más de ${k("morado", "400")}?`, L`¿Qué probabilidad hay de que dure más de 300 horas si ya funcionó más de 200?`],
                p: [
                  L`<strong>Variable:</strong> \(X\) = vida útil en cientos de horas, exponencial con \(\azul{\lambda}=\azul{\tfrac12}\): \[P(X\gt x)=e^{-\azul{\lambda}x}=e^{-x/2}\]`,
                  L`<strong>a)</strong> «Menos de 2» y «más de 4» son excluyentes, así que se suman: \[\begin{aligned} P(X\lt\morado{2})+P(X\gt\morado{4})&=\left(1-e^{-\azul{\lambda}\cdot\morado{2}}\right)+e^{-\azul{\lambda}\cdot\morado{4}}\\ &=\left(1-e^{-1}\right)+e^{-2}\\ &=0{,}632+0{,}135=\verde{0{,}767} \end{aligned}\]`,
                  L`<strong>b)</strong> Probabilidad condicional: \[\begin{aligned} P(A\mid B)&=\frac{P(A\cap B)}{P(B)}\\ P(X\gt 3\mid X\gt 2)&=\frac{P(X\gt 3)}{P(X\gt 2)}=\frac{e^{-3/2}}{e^{-1}}=e^{-1/2}=\verde{0{,}607} \end{aligned}\]`,
                  L`<strong>Lectura:</strong> el resultado es \(P(X\gt 1)\). Haber funcionado 200 horas no cambia la probabilidad de durar 100 horas más: la exponencial no tiene memoria.`
                ],
                n: "", s: "Ejemplo de los apuntes del docente (Walpole et al.)."
              }),
              E({
                t: "Ejemplo: cinco componentes con vida exponencial",
                e: L`El tiempo de falla de un componente es exponencial. Se instalan cinco componentes en sistemas distintos, que fallan de forma independiente.`,
                d: [[L`\azul{\beta}=\azul{5}`, "vida media de un componente (años)"], [L`\ocre{n}=\ocre{5}`, "componentes instalados"], [L`\morado{t}=\morado{8}`, "tiempo de observación (años)"]],
                q: L`¿Cuál es la probabilidad de que al menos 2 componentes sigan funcionando al cabo de 8 años?`,
                p: [
                  L`<strong>Un componente:</strong> \(T\) = tiempo de falla, exponencial de media \(\azul{\beta}\): \[\begin{aligned} p=P(T\gt t)&=e^{-t/\beta}\\ &=e^{-\morado{8}/\azul{5}}=e^{-1{,}6}=0{,}2019 \end{aligned}\]`,
                  L`<strong>Los cinco:</strong> \(X\) = componentes que siguen funcionando a los 8 años, \(X\sim B(\ocre{5};\ 0{,}2019)\).`,
                  L`<strong>Al menos dos, por el complemento:</strong> \[\begin{aligned} P(X=x)&=\binom{n}{x}p^x(1-p)^{n-x}\\ P(X\ge 2)&=1-P(X=0)-P(X=1)\\ &=1-(0{,}7981)^{\ocre{5}}-\binom{\ocre{5}}{1}(0{,}2019)(0{,}7981)^{4}\\ &=1-0{,}3238-0{,}4096=\verde{0{,}267} \end{aligned}\]`
                ],
                n: "", s: "Ejemplo de los apuntes del docente (Walpole et al.)."
              })
            ]
          },
          {
            id: "mc-2g",
            title: L`Distribución gamma`,
            lead: L`Tiempo hasta que ocurren \(\alpha\) eventos de un proceso de Poisson.`,
            body: L`<p><strong>Parámetros:</strong> \(\alpha\) = forma (número de eventos que se esperan); \(\beta\) = escala (tiempo medio entre eventos), \(\beta=\frac{1}{\lambda}\) con \(\lambda\) la tasa.</p><p><strong>Función gamma:</strong> \(\Gamma(\alpha)=\int_0^\infty x^{\alpha-1}e^{-x}dx\); \(\Gamma(n)=(n-1)!\), \(\Gamma(1)=1\), \(\Gamma(\frac12)=\sqrt\pi\).</p><p>Con \(\alpha=1\) se obtiene la exponencial. Modela datos asimétricos a la derecha: tiempos de falla, de espera, de servicio.</p>`,
            formula: L`f(x)=\frac{x^{\azul{\alpha}-1}e^{-x/\ocre{\beta}}}{\ocre{\beta}^{\azul{\alpha}}\,\Gamma(\azul{\alpha})},\ x>0\qquad E(X)=\azul{\alpha}\ocre{\beta}\qquad \mathrm{Var}(X)=\azul{\alpha}\ocre{\beta}^2`,
            visual: "gamma_espera",
            codigo: { python: "scipy.stats.gamma.cdf(x, a=alfa, scale=beta)", excel: "=DISTR.GAMMA(x;alfa;beta;VERDADERO)" },
            source: "Apuntes del docente; Walpole et al.; Hayter.",
            abajo: [
              E({
                t: "Ejemplo: tiempo hasta la segunda llamada",
                e: L`Las llamadas a un conmutador siguen un proceso de Poisson. Sea \(T\) el tiempo hasta que llega la segunda llamada.`,
                d: [[L`\azul{\lambda}=\azul{5}`, "llamadas por minuto"], [L`\ocre{\alpha}=\ocre{2}`, "llamadas que se esperan"], [L`\beta=\tfrac{1}{\azul{\lambda}}=\tfrac15`, "minutos entre llamadas, en promedio"]],
                q: L`¿Cuál es la probabilidad de que pase más de un minuto hasta la segunda llamada?`,
                p: [
                  L`<strong>Variable:</strong> \(T\) = minutos hasta la segunda llamada, gamma con \(\ocre{\alpha}=\ocre{2}\) y \(\beta=\tfrac15\).`,
                  L`<strong>Densidad:</strong> \[\begin{aligned} f(t)&=\frac{t^{\alpha-1}e^{-t/\beta}}{\beta^{\alpha}\,\Gamma(\alpha)}\\ &=\frac{t^{\ocre{2}-1}e^{-\azul{5}t}}{\left(\frac15\right)^{\ocre{2}}\Gamma(\ocre{2})}=25\,t\,e^{-5t},\qquad t\gt 0 \end{aligned}\]`,
                  L`<strong>Por partes</strong> (\(u=t\), \(dv=e^{-5t}dt\)): \[\begin{aligned} P(T\le 1)&=\int_0^1 25\,t\,e^{-5t}\,dt\\ &=25\left[-\frac{t\,e^{-5t}}{5}-\frac{e^{-5t}}{25}\right]_0^1=1-6e^{-5}=0{,}960 \end{aligned}\]`,
                  L`<strong>Complemento:</strong> \(P(T\gt 1)=1-P(T\le 1)=6e^{-5}=\verde{0{,}040}\).`,
                  L`<strong>Comprobación con Poisson:</strong> \(T\gt 1\) significa menos de 2 llamadas en el primer minuto: \[\begin{aligned} P(Y\le 1)&=e^{-\lambda}(1+\lambda)\\ &=e^{-\azul{5}}(1+\azul{5})=0{,}040 \end{aligned}\]`
                ],
                n: "", s: "Ejemplo de los apuntes del docente (Walpole et al.)."
              })
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
            source: L`NIST/SEMATECH e-Handbook, distribución Weibull; Hayter.`,
            abajo: [
              E({
                t: "Ejemplo: vida de un rodamiento",
                e: L`El tiempo hasta la falla de un rodamiento en un eje mecánico se modela con una distribución de Weibull.`,
                d: [[L`\ocre{a}=\ocre{\tfrac12}`, "forma"], [L`\eta=5000`, "escala (horas)"], [L`\azul{\lambda}=\tfrac{1}{\eta}=\azul{\tfrac{1}{5000}}`, "inversa de la escala (por hora)"]],
                i: [L`Halle el tiempo medio hasta la falla.`, L`Halle la probabilidad de que un rodamiento dure al menos ${k("morado", "6000")} horas.`],
                p: [
                  L`<strong>Variable:</strong> \(T\) = horas hasta la falla. Como \(\ocre{a}\lt 1\), la tasa de falla disminuye con el tiempo.`,
                  L`<strong>a)</strong> \[\begin{aligned} E(T)&=\frac{1}{\lambda}\,\Gamma\!\left(1+\frac{1}{a}\right)\\ &=5000\,\Gamma\!\left(1+\frac{1}{\ocre{1/2}}\right)=5000\,\Gamma(3)=5000\cdot 2!=\verde{10\,000}\text{ h} \end{aligned}\]`,
                  L`<strong>b)</strong> \[\begin{aligned} P(T\gt t)&=e^{-(\lambda t)^{a}}\\ P(T\gt\morado{6000})&=e^{-\left(\morado{6000}/5000\right)^{\ocre{1/2}}}=e^{-\sqrt{1{,}2}}=e^{-1{,}095}=\verde{0{,}334} \end{aligned}\]`,
                  L`<strong>Lectura:</strong> la media (10 000 h) supera a la mayoría de las vidas: solo un tercio pasa de 6000 h. Con \(\ocre{a}\lt 1\), unos pocos rodamientos duran muchísimo y elevan el promedio.`
                ],
                n: "", s: "Montgomery y Runger, Probabilidad y estadística aplicadas a la ingeniería."
              })
            ]
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
            visual: "normal_significado",
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
              E({
                t: "Ejemplo: diámetro de anillos de pistón",
                e: L`El diámetro interior de un anillo de pistón se distribuye normalmente.`,
                d: [[L`\azul{\mu}=\azul{10}`, "media (cm)"], [L`\ocre{\sigma}=\ocre{0{,}03}`, "desviación estándar (cm)"]],
                i: [L`¿Qué proporción de los anillos excede ${k("morado", "10,075")} cm?`, L`¿Qué probabilidad hay de que el diámetro esté entre ${k("morado", "9,97")} y ${k("morado", "10,03")} cm?`, L`¿Por debajo de qué diámetro queda el 15&nbsp;% de los anillos?`],
                p: [
                  L`<strong>Variable:</strong> \(X\) = diámetro interior en cm, \(X\sim N(\azul{10};\ \ocre{0{,}03}^2)\).`,
                  L`<strong>a)</strong> \[\begin{aligned} z&=\frac{x-\mu}{\sigma}=\frac{\morado{10{,}075}-\azul{10}}{\ocre{0{,}03}}=2{,}5\\ P(X\gt\morado{10{,}075})&=1-\Phi(2{,}5)=1-0{,}99379=\verde{0{,}0062} \end{aligned}\]`,
                  L`<strong>b)</strong> \[\begin{aligned} z_1&=\frac{\morado{9{,}97}-\azul{10}}{\ocre{0{,}03}}=-1,\qquad z_2=\frac{\morado{10{,}03}-\azul{10}}{\ocre{0{,}03}}=1\\ P(-1\lt Z\lt 1)&=\Phi(1)-\Phi(-1)=0{,}84134-0{,}15866=\verde{0{,}6827} \end{aligned}\]`,
                  L`<strong>c)</strong> Problema inverso: se conoce la probabilidad y se busca \(x\). En la tabla, \(\Phi(z)=0{,}15\) da \(z=-1{,}04\): \[\begin{aligned} x&=\mu+z\,\sigma\\ &=\azul{10}+(-1{,}04)(\ocre{0{,}03})=\verde{9{,}969}\text{ cm} \end{aligned}\]`
                ],
                n: "", s: "Ejemplo de los apuntes del docente (Walpole et al.)."
              })
            ]
          },
          {
            id: "mc-5b",
            title: L`Tabla normal estándar interactiva`,
            lead: L`Cada celda da el área acumulada \(\Phi(z)=P(Z\le z)\): fila con entero y décima, columna con centésima.`,
            visual: "tabla_z",
            visualAncho: true,
            source: "Devore; Hayter; tabla normal estándar."
          },
          {
            id: "mc-6",
            title: L`Combinaciones lineales de normales`,
            lead: L`Una combinación lineal de normales independientes también es normal.`,
            body: `<p>Si \\(X_1 \\sim N(\\mu_1, \\sigma_1^2)\\) y \\(X_2 \\sim N(\\mu_2, \\sigma_2^2)\\) son independientes, para constantes \\(a, b\\):</p>`,
            formula: L`\azul{a}X_1 + \ocre{b}X_2 \sim N\!\left(\azul{a}\mu_1 + \ocre{b}\mu_2,\;\; \azul{a}^2\sigma_1^2 + \ocre{b}^2\sigma_2^2\right)`,
            lectura: L`La suma y la diferencia de normales independientes son normales. En una resta las medias se restan, pero las varianzas se suman.`,
            visual: "suma_normales",
            source: "Hayter; Montgomery y Runger.",
            abajo: [
              E({
                t: "Ejemplo: perímetro de una pieza",
                e: L`El largo \(X_1\) y el ancho \(X_2\) de una pieza rectangular son normales e independientes.`,
                d: [[L`\mu_1=\azul{2},\ \sigma_1=\ocre{0{,}1}`, "largo (cm)"], [L`\mu_2=\azul{5},\ \sigma_2=\ocre{0{,}2}`, "ancho (cm)"]],
                q: L`¿Qué probabilidad hay de que el perímetro supere ${k("morado", "14,5")} cm?`,
                p: [
                  L`<strong>Variable:</strong> perímetro \(Y=2X_1+2X_2\), combinación lineal con \(a=b=2\).`,
                  L`<strong>Media y varianza:</strong> \[\begin{aligned} E(Y)&=a\mu_1+b\mu_2=2(\azul{2})+2(\azul{5})=14\\ \mathrm{Var}(Y)&=a^2\sigma_1^2+b^2\sigma_2^2=4(\ocre{0{,}1})^2+4(\ocre{0{,}2})^2=0{,}2 \end{aligned}\]`,
                  L`<strong>Probabilidad:</strong> \(Y\sim N(14;\ 0{,}2)\): \[\begin{aligned} z&=\frac{y-\mu_Y}{\sigma_Y}=\frac{\morado{14{,}5}-14}{\sqrt{0{,}2}}=1{,}12\\ P(Y\gt\morado{14{,}5})&=1-\Phi(1{,}12)=1-0{,}8686=\verde{0{,}131} \end{aligned}\]`,
                  L`<strong>Lectura:</strong> las desviaciones no se suman (\(2\cdot0{,}1+2\cdot0{,}2=0{,}6\)); se suman las varianzas, y \(\sigma_Y=\sqrt{0{,}2}=0{,}447\).`
                ],
                n: "", s: "Montgomery y Runger, Probabilidad y estadística aplicadas a la ingeniería."
              })
            ]
          },
          {
            id: "mc-7",
            title: L`Aproximación normal a la binomial`,
            lead: L`Con \(np\) y \(n(1-p)\) grandes, la binomial se aproxima por una normal con corrección de continuidad.`,
            body: `<p>Si \\(X \\sim B(n, p)\\) tiene muchos ensayos, calcular sumas binomiales a mano es largo. Como \\(X\\) es suma de \\(n\\) Bernoulli independientes, puede aproximarse por \\(N(np,\\; np(1-p))\\).</p>
                   <p>Al pasar de barras discretas (ancho 1 centrado en cada entero \\(x\\)) a una curva continua, conviene extender los límites en \\(\\pm 0{,}5\\):</p>`,
            formula: L`P(X \ge x) \approx 1 - \Phi\!\left(\frac{(x - \ocre{0{,}5}) - np}{\sqrt{np(1 - p)}}\right)`,
            lectura: `Para incluir completa la barra centrada en \\(x\\), la integral continua comienza en ${k("ocre", "x − 0,5")}.`,
            visual: "normal_aprox_binom",
            source: "Hayter; De Moivre-Laplace.",
            abajo: [
              E({
                t: "Ejemplo: bits con error en un canal digital",
                e: L`En un canal de comunicación digital, cada bit se recibe con error de manera independiente. Se transmiten 16 millones de bits.`,
                d: [[L`\azul{n}=\azul{16\,000\,000}`, "bits transmitidos"], [L`\ocre{p}=\ocre{10^{-5}}`, "probabilidad de error por bit"]],
                q: L`¿Qué probabilidad hay de que ocurran ${k("morado", "150")} errores o menos?`,
                p: [
                  L`<strong>Variable:</strong> \(X\) = bits con error, \(X\sim B(\azul{n},\ \ocre{p})\). La suma exacta tendría 151 términos.`,
                  L`<strong>Media y desviación:</strong> \[\begin{aligned} np&=\azul{16\,000\,000}(\ocre{10^{-5}})=160\\ \sqrt{np(1-p)}&=\sqrt{160(1-10^{-5})}=12{,}65 \end{aligned}\] Como \(np\) y \(n(1-p)\) son grandes, se usa la normal.`,
                  L`<strong>Con corrección de continuidad:</strong> \[\begin{aligned} P(X\le x)&\approx\Phi\!\left(\frac{(x+0{,}5)-np}{\sqrt{np(1-p)}}\right)\\ P(X\le\morado{150})&\approx\Phi\!\left(\frac{\morado{150}+0{,}5-160}{12{,}65}\right)=\Phi(-0{,}75)=\verde{0{,}227} \end{aligned}\]`
                ],
                n: "", s: "Montgomery y Runger, Probabilidad y estadística aplicadas a la ingeniería."
              })
            ]
          },
          {
            id: "mc-8",
            title: L`Distribuciones χ², t y F`,
            lead: L`Se derivan de la normal y se usan en los intervalos de confianza.`,
            body: L`<table class="modelos"><tr><td>\(\chi^2_\nu\)</td><td>\(\sum_{i=1}^{\nu}Z_i^2\), con \(Z_i\) normales estándar independientes.</td></tr><tr><td>\(t_\nu\)</td><td>\(Z/\sqrt{U/\nu}\), con \(Z\sim N(0,1)\), \(U\sim\chi^2_\nu\) e independencia entre ambos.</td></tr><tr><td>\(F_{\nu_1,\nu_2}\)</td><td>\((U/\nu_1)/(V/\nu_2)\), con \(U\) y \(V\) chi-cuadrado independientes.</td></tr></table><p>Las condiciones de independencia forman parte de las definiciones; no basta reconocer la forma del cociente.</p>`,
            visual: "derivadas_normal",
            source: "Hayter; Devore."
          }
        ]
      }
    ]
  };
}());
