/* Glosario de fórmulas del curso y buscador de temas en todas las unidades.
   Cada fórmula enlaza con la diapositiva donde se explica (unidad.html#/id). */
(function () {
  "use strict";

  const version = new URL(document.currentScript.src).search;
  const UNIDADES = [
    ["repaso_probabilidad_y_variables", "Sesión de repaso"],
    ["probabilidad_y_conteo", "Probabilidad y conteo"],
    ["variables_aleatorias", "Variables aleatorias"],
    ["modelos_discretos", "Modelos discretos"],
    ["modelos_continuos", "Modelos continuos"],
    ["estadistica_descriptiva", "Estadística descriptiva"],
    ["muestreo_e_intervalos", "Muestreo e intervalos"],
    ["regresion_y_confiabilidad", "Regresión y confiabilidad"]
  ];
  const NOMBRE = Object.fromEntries(UNIDADES);

  const TEMAS = [
    ["prob", "Probabilidad y conteo"],
    ["va", "Variables aleatorias"],
    ["disc", "Modelos discretos"],
    ["cont", "Modelos continuos"],
    ["desc", "Estadística descriptiva"],
    ["muest", "Distribuciones muestrales"],
    ["ic", "Intervalos de confianza"],
    ["reg", "Regresión"],
    ["conf", "Confiabilidad"]
  ];

  // [tema, nombre, LaTeX, cuándo se usa, unidad, id de diapositiva, palabras clave]
  const PC = "probabilidad_y_conteo", VA = "variables_aleatorias", MD = "modelos_discretos", MC = "modelos_continuos",
        ED = "estadistica_descriptiva", MI = "muestreo_e_intervalos", RC = "regresion_y_confiabilidad";
  const F = [
    ["prob", "Probabilidad clásica", String.raw`P(A)=\frac{\text{casos favorables}}{\text{casos posibles}}`, "Resultados igualmente probables.", PC, "pc-1", "laplace equiprobable"],
    ["prob", "Complemento", String.raw`P(A')=1-P(A)`, "Cuando «al menos uno» es más difícil de contar que «ninguno».", PC, "pc-3", "al menos ninguno cumpleaños"],
    ["prob", "Frecuencia relativa", String.raw`P(A)\approx\frac{k}{n}`, "Probabilidad estimada con datos del pasado: k veces que ocurrió A en n observaciones.", PC, "pc-3f", "pasado futuro datos historicos frecuencia"],
    ["prob", "Estimación de Montecarlo", String.raw`\hat P(A)=\frac{\text{simulaciones en que ocurre }A}{N}\qquad \text{error típico}\approx\sqrt{\frac{p(1-p)}{N}}`, "Simular el experimento N veces cuando no hay fórmula cerrada.", PC, "pc-3m", "simulacion montecarlo monte carlo aleatorio"],
    ["prob", "Regla de la suma", String.raw`P(A\cup B)=P(A)+P(B)-P(A\cap B)`, "Unión de dos eventos; si son excluyentes, la intersección es 0.", PC, "pc-3", "union adición excluyentes"],
    ["prob", "Unión de tres eventos", String.raw`\begin{aligned}P(A\cup B\cup C)={}&P(A)+P(B)+P(C)\\&-P(A\cap B)-P(A\cap C)\\&-P(B\cap C)+P(A\cap B\cap C)\end{aligned}`, "Diagramas de Venn con tres conjuntos.", PC, "pc-3", "venn inclusión exclusión"],
    ["prob", "Leyes de De Morgan", String.raw`(A\cup B)'=A'\cap B' \qquad (A\cap B)'=A'\cup B'`, "Negar «o» y «y».", PC, "pc-2", "complemento negación conjuntos"],
    ["prob", "Principio multiplicativo", String.raw`n_1\cdot n_2\cdots n_k \qquad n^r\ \text{(con repetición)}`, "Etapas sucesivas; con repetición y orden, n^r.", PC, "pc-4", "conteo árbol multiplicación"],
    ["prob", "Factorial", String.raw`n!=n(n-1)(n-2)\cdots1,\quad 0!=1`, "Ordenar n objetos distintos.", PC, "pc-4", "factorial orden"],
    ["prob", "Permutaciones", String.raw`{}_{n}P_{r}=\frac{n!}{(n-r)!}`, "Elegir r de n cuando importa el orden (tecla nPr de la calculadora).", PC, "pc-5", "variaciones orden importa"],
    ["prob", "Combinaciones", String.raw`{}_{n}C_{r}=\binom{n}{r}=\frac{n!}{r!\,(n-r)!}`, "Elegir r de n sin importar el orden (tecla nCr).", PC, "pc-5", "combinatoria comité muestra"],
    ["prob", "Probabilidad condicional", String.raw`P(A\mid B)=\frac{P(A\cap B)}{P(B)},\quad P(B)>0`, "La información B cambia el denominador.", PC, "pc-6", "condicionada dado que"],
    ["prob", "Regla de la multiplicación", String.raw`P(A\cap B)=P(A)\,P(B\mid A)`, "Ramas de un árbol; extracciones sin reemplazo.", PC, "pc-6", "árbol intersección"],
    ["prob", "Independencia", String.raw`P(A\cap B)=P(A)\,P(B)\iff P(A\mid B)=P(A)`, "Un evento no cambia la probabilidad del otro (no es lo mismo que excluyentes).", PC, "pc-7", "independientes excluyentes"],
    ["prob", "Probabilidad total", String.raw`P(D)=\sum_{i=1}^{k}P(A_i)\,P(D\mid A_i)`, "Se pregunta por el efecto: sumar las ramas del árbol.", PC, "pc-8", "partición efecto árbol"],
    ["prob", "Teorema de Bayes", String.raw`P(A_i\mid D)=\frac{P(A_i)\,P(D\mid A_i)}{\sum_j P(A_j)\,P(D\mid A_j)}`, "Se pregunta por la causa, conocido el efecto.", PC, "pc-9", "causa inversa posterior"],

    ["va", "Función de probabilidad", String.raw`p(x)=P(X=x)\ge0,\qquad \sum_x p(x)=1`, "Variable discreta.", VA, "va-7", "pmf masa probabilidad discreta"],
    ["va", "Acumulada discreta", String.raw`F(x)=P(X\le x)=\sum_{t\le x}p(t)`, "P(a ≤ X ≤ b) = F(b) − F(a − 1) para enteros.", VA, "va-7", "cdf distribución acumulada"],
    ["va", "Densidad y área", String.raw`P(a\le X\le b)=\int_a^b f(x)\,dx,\qquad \int_{-\infty}^{\infty}f(x)\,dx=1`, "Variable continua: la probabilidad es un área; P(X = a) = 0.", VA, "va-8", "pdf densidad continua integral"],
    ["va", "Acumulada continua", String.raw`F(x)=\int_{-\infty}^{x}f(t)\,dt,\qquad f(x)=F'(x)`, "Mediana y percentiles: resolver F(x) = p.", VA, "va-8", "cdf mediana percentil"],
    ["va", "Valor esperado", String.raw`E(X)=\sum_x x\,p(x)\qquad E(X)=\int x\,f(x)\,dx`, "Centro de equilibrio; promedio a largo plazo.", VA, "va-9", "media esperanza juego justo"],
    ["va", "Esperanza de una función", String.raw`E[g(X)]=\sum_x g(x)\,p(x)\qquad E(aX+b)=a\,E(X)+b`, "Costos, ganancias y transformaciones lineales.", VA, "va-11", "linealidad costo"],
    ["va", "Varianza", String.raw`\mathrm{Var}(X)=E[(X-\mu)^2]=E(X^2)-\mu^2,\qquad \sigma=\sqrt{\mathrm{Var}(X)}`, "Dispersión alrededor de la media.", VA, "va-10", "varianza desviación estándar"],
    ["va", "Varianza de una transformación", String.raw`\mathrm{Var}(aX+b)=a^2\,\mathrm{Var}(X)`, "La constante no dispersa; el factor entra al cuadrado.", VA, "va-11", "propiedades varianza"],
    ["va", "Marginales", String.raw`P(X=x_i)=\sum_j p_{ij}\qquad P(Y=y_j)=\sum_i p_{ij}`, "Sumar la tabla conjunta por filas o columnas.", VA, "va-12", "conjunta marginal tabla"],
    ["va", "Condicional de variables", String.raw`P(X=x\mid Y=y)=\frac{p(x,y)}{p_Y(y)}`, "Una fila o columna de la tabla, normalizada.", VA, "va-12", "conjunta condicional"],
    ["va", "Independencia de variables", String.raw`p(x,y)=p_X(x)\,p_Y(y)\ \ \text{para todo }(x,y)`, "Basta una casilla que falle para negarla.", VA, "va-12", "independientes conjunta"],
    ["va", "Covarianza y correlación", String.raw`\mathrm{Cov}(X,Y)=E(XY)-E(X)E(Y)\qquad \rho=\frac{\mathrm{Cov}(X,Y)}{\sigma_X\sigma_Y}`, "Si varían juntas; ρ sin unidades, entre −1 y 1.", VA, "va-14", "covarianza correlación"],
    ["va", "Suma de variables", String.raw`\begin{aligned}E(aX+bY)&=aE(X)+bE(Y)\\ \mathrm{Var}(aX+bY)&=a^2\sigma_X^2+b^2\sigma_Y^2+2ab\,\mathrm{Cov}(X,Y)\end{aligned}`, "Sin covarianza si son independientes.", VA, "va-13", "suma diferencia varianza dos variables"],

    ["disc", "Bernoulli", String.raw`X\sim B(1,p)\qquad E(X)=p\qquad \mathrm{Var}(X)=p(1-p)`, "Un ensayo con dos resultados.", MD, "md-1", "bernoulli ensayo éxito"],
    ["disc", "Binomial", String.raw`P(X=x)=\binom{n}{x}p^x(1-p)^{n-x}\qquad E(X)=np\qquad \mathrm{Var}(X)=np(1-p)`, "Número de éxitos en n ensayos independientes con la misma p.", MD, "md-2", "binomial éxitos ensayos"],
    ["disc", "Geométrica", String.raw`P(X=x)=(1-p)^{x-1}p\qquad E(X)=\frac1p\qquad \mathrm{Var}(X)=\frac{1-p}{p^2}`, "Intento en que aparece el primer éxito.", MD, "md-4", "geométrica primer éxito espera"],
    ["disc", "Binomial negativa (Pascal)", String.raw`P(X=x)=\binom{x-1}{r-1}p^r(1-p)^{x-r}\qquad E(X)=\frac rp`, "Intento en que aparece el éxito número r. La geométrica es el caso r = 1.", MD, "md-4n", "pascal r éxitos"],
    ["disc", "Hipergeométrica", String.raw`P(X=x)=\frac{\binom{r}{x}\binom{N-r}{n-x}}{\binom{N}{n}}\qquad E(X)=n\frac rN`, "Muestra sin reemplazo de un lote finito.", MD, "md-5", "sin reemplazo lote defectuosos"],
    ["disc", "Poisson", String.raw`P(X=x)=\frac{e^{-\lambda}\lambda^x}{x!}\qquad E(X)=\mathrm{Var}(X)=\lambda`, "Conteos en una ventana de tiempo, longitud o área, con tasa constante.", MD, "md-6", "poisson llegadas conteo tasa"],
    ["disc", "Poisson como límite", String.raw`B(n,p)\approx P(\lambda),\quad \lambda=np`, "n grande y p pequeño.", MD, "md-6b", "aproximación binomial poisson"],

    ["cont", "Uniforme", String.raw`f(x)=\frac1{b-a}\qquad E(X)=\frac{a+b}2\qquad \mathrm{Var}(X)=\frac{(b-a)^2}{12}`, "Todos los intervalos de igual longitud son igual de probables.", MC, "mc-1", "uniforme rectangular"],
    ["cont", "Exponencial", String.raw`\begin{aligned}&f(t)=\lambda e^{-\lambda t},\quad P(T>t)=e^{-\lambda t}\\&E(T)=\frac1\lambda,\quad \mathrm{Var}(T)=\frac1{\lambda^2}\end{aligned}`, "Tiempo hasta el primer evento de Poisson.", MC, "mc-2", "exponencial espera falla"],
    ["cont", "Falta de memoria", String.raw`P(T>s+t\mid T>s)=P(T>t)`, "Propiedad de la exponencial: no envejece.", MC, "mc-2", "sin memoria exponencial"],
    ["cont", "Gamma", String.raw`f(x)=\frac{x^{\alpha-1}e^{-x/\beta}}{\beta^\alpha\,\Gamma(\alpha)}\qquad E(X)=\alpha\beta\qquad \mathrm{Var}(X)=\alpha\beta^2`, "Con α entero: tiempo hasta α eventos de Poisson; β = 1/λ.", MC, "mc-2g", "gamma erlang segunda llamada"],
    ["cont", "Función gamma", String.raw`\Gamma(\alpha)=\int_0^\infty x^{\alpha-1}e^{-x}dx\qquad \Gamma(n)=(n-1)!\qquad \Gamma(\tfrac12)=\sqrt\pi`, "Aparece en la densidad gamma y en la media de Weibull.", MC, "mc-2g", "función gamma factorial"],
    ["cont", "Weibull", String.raw`R(t)=P(T>t)=e^{-(\lambda t)^a}\qquad E(T)=\frac1\lambda\Gamma\!\left(1+\frac1a\right)`, "Vida de equipos cuya tasa de falla cambia con el tiempo.", MC, "mc-3", "weibull envejecimiento"],
    ["cont", "Normal", String.raw`f(x)=\frac{1}{\sigma\sqrt{2\pi}}e^{-\frac12\left(\frac{x-\mu}{\sigma}\right)^2}\qquad X\sim N(\mu,\sigma^2)`, "Campana simétrica; regla 68–95–99,7.", MC, "mc-4", "normal gauss campana"],
    ["cont", "Estandarizar", String.raw`Z=\frac{X-\mu}{\sigma}\sim N(0,1)\qquad P(X\le x)=\Phi\!\left(\frac{x-\mu}{\sigma}\right)`, "Llevar cualquier normal a la tabla Z.", MC, "mc-5", "tabla z estandarización"],
    ["cont", "Tabla normal estándar y simetría", String.raw`\Phi(z)=P(Z\le z)\qquad \Phi(-z)=1-\Phi(z)\qquad P(a\le Z\le b)=\Phi(b)-\Phi(a)`, "Lectura directa (fila y columna) o búsqueda inversa por área.", MC, "mc-5t", "tabla z normal estándar acumulado simetría"],
    ["cont", "Percentil de una normal", String.raw`x_p=\mu+z_p\,\sigma`, "Problema inverso: se da la probabilidad y se busca x.", MC, "mc-5", "percentil inverso garantía"],
    ["cont", "Combinación lineal de normales", String.raw`aX_1+bX_2\sim N(a\mu_1+b\mu_2,\ a^2\sigma_1^2+b^2\sigma_2^2)`, "Normales independientes: margen, suma de cargas.", MC, "mc-6", "suma normales diferencia margen"],
    ["cont", "Aproximación normal a la binomial", String.raw`P(X\ge x)\approx1-\Phi\!\left(\frac{(x-0{,}5)-np}{\sqrt{np(1-p)}}\right)`, "np y n(1 − p) grandes; corrección de continuidad.", MC, "mc-7", "corrección continuidad"],
    ["cont", "Chi-cuadrado", String.raw`\frac{(n-1)S^2}{\sigma^2}\sim\chi^2_{n-1}`, "Varianza de una población normal; tabla con área a la derecha.", MC, "mc-8c", "ji chi cuadrado varianza"],
    ["cont", "t de Student", String.raw`T=\frac{\bar X-\mu}{S/\sqrt n}\sim t_{n-1}`, "Media con σ desconocida y población normal; colas más pesadas que Z.", MC, "mc-8t", "student gosset media"],
    ["cont", "F", String.raw`F=\frac{S_1^2/\sigma_1^2}{S_2^2/\sigma_2^2}\sim F_{n_1-1,\,n_2-1}`, "Comparar dos varianzas de poblaciones normales.", MC, "mc-8f", "fisher snedecor cociente varianzas"],

    ["desc", "Media muestral", String.raw`\bar x=\frac{\sum x_i}{n}\qquad \bar x=\frac{\sum f\,x}{n}\ \text{(con frecuencias)}`, "No requiere ordenar los datos.", ED, "ed-8", "promedio media frecuencias"],
    ["desc", "Mediana", String.raw`\tilde x=x_{((n+1)/2)}\ \ (n\text{ impar})\qquad \tilde x=\frac{x_{(n/2)}+x_{(n/2+1)}}2\ \ (n\text{ par})`, "Ordenar primero; robusta ante atípicos.", ED, "ed-c", "mediana posición central"],
    ["desc", "Varianza muestral (definición)", String.raw`s^2=\frac{\sum(x_i-\bar x)^2}{n-1}`, "Tabla de desviaciones; se divide entre n − 1.", ED, "ed-8", "varianza tabla desviaciones n-1"],
    ["desc", "Varianza muestral (abreviada)", String.raw`s^2=\frac{\sum x_i^2-n\bar x^2}{n-1}=\frac{\sum x_i^2-(\sum x_i)^2/n}{n-1}`, "Con la columna de cuadrados; la que usa la calculadora.", ED, "ed-8", "varianza fórmula corta calculadora"],
    ["desc", "Varianza con frecuencias", String.raw`s^2=\frac{\sum f\,(x-\bar x)^2}{n-1}=\frac{\sum f\,x^2-n\bar x^2}{n-1}`, "Datos repetidos en tabla de frecuencias.", ED, "ed-8", "frecuencias agrupados"],
    ["desc", "Desviación estándar", String.raw`s=\sqrt{s^2}\qquad \sigma=\sqrt{\frac{\sum(x_i-\mu)^2}{N}}\ \text{(población)}`, "En las unidades de los datos; calculadora: s_x y σ_x.", ED, "ed-4", "desviación típica sx sigma"],
    ["desc", "Cuartiles", String.raw`\text{posición de }Q_k=\frac k4(n+1)\ \text{con interpolación}`, "Declarar la convención (Excel CUARTIL.EXC).", ED, "ed-5", "cuartiles percentiles posición"],
    ["desc", "Percentil p", String.raw`L=\frac{p}{100}(n+1),\qquad P_p=x_{(k)}+d\,(x_{(k+1)}-x_{(k)}),\ L=k+d`, "Valor que deja el p % de los datos ordenados por debajo.", ED, "ed-p", "percentil posicion"],
    ["desc", "RIC y vallas", String.raw`\mathrm{RIC}=Q_3-Q_1\qquad Q_1-1{,}5\,\mathrm{RIC},\ \ Q_3+1{,}5\,\mathrm{RIC}`, "Diagrama de caja y datos atípicos.", ED, "ed-5", "boxplot atípicos rango intercuartílico"],
    ["desc", "Coeficiente de variación", String.raw`CV=\frac{s}{\bar x}\times100\,\%`, "Comparar dispersión de medidas en escalas distintas.", ED, "ed-6", "variación relativa"],
    ["desc", "Rango", String.raw`R=x_{\max}-x_{\min}`, "Distancia entre los extremos; depende solo de dos datos.", ED, "ed-d", "dispersion amplitud"],

    ["muest", "Media muestral: centro y error estándar", String.raw`E(\bar X)=\mu\qquad \sigma_{\bar X}=\frac{\sigma}{\sqrt n}\qquad \widehat{\mathrm{EE}}(\bar X)=\frac{S}{\sqrt n}`, "Observaciones independientes. El promedio oscila menos que un dato.", MI, "mi-2", "error estándar media muestral"],
    ["muest", "Estandarizar la media", String.raw`Z=\frac{\bar X-\mu}{\sigma/\sqrt n}`, "Exacta con población normal; aproximada con n grande (TCL).", MI, "mi-2", "z media muestral"],
    ["muest", "Teorema central del límite", String.raw`\bar X\approx N\!\left(\mu,\frac{\sigma^2}{n}\right)\qquad \sum X_i\approx N(n\mu,\ n\sigma^2)`, "n grande, observaciones independientes de cualquier población con varianza finita.", MI, "mi-3", "tcl suma total normal"],
    ["muest", "Proporción muestral", String.raw`\hat p=\frac Xn\qquad E(\hat p)=p\qquad \sigma_{\hat p}=\sqrt{\frac{p(1-p)}n}`, "Media de ceros y unos; normal si np y n(1 − p) son grandes.", MI, "mi-3", "proporción muestral p gorro"],
    ["muest", "Distribución t", String.raw`T=\frac{\bar X-\mu}{S/\sqrt n}\sim t_{n-1}`, "Población normal y σ desconocida.", MI, "mi-4", "student t grados libertad"],
    ["muest", "Varianza muestral y χ²", String.raw`\frac{(n-1)S^2}{\sigma^2}\sim\chi^2_{n-1}`, "Población normal; la χ² no es simétrica.", MI, "mi-7", "chi cuadrado varianza"],
    ["muest", "Error cuadrático medio", String.raw`\mathrm{ECM}(\hat\theta)=\mathrm{Var}(\hat\theta)+[E(\hat\theta)-\theta]^2`, "Comparar estimadores: varianza más sesgo al cuadrado.", MI, "mi-1", "ecm sesgo estimador"],

    ["ic", "Media con σ conocida", String.raw`\bar x\pm z_{\alpha/2}\frac{\sigma}{\sqrt n}`, "Exacto con población normal; aproximado con n grande. z₀,₀₂₅ = 1,96; z₀,₀₀₅ = 2,576.", MI, "mi-4", "intervalo z media"],
    ["ic", "Media con σ desconocida", String.raw`\bar x\pm t_{\alpha/2,\,n-1}\frac{s}{\sqrt n}`, "Población normal y σ desconocida.", MI, "mi-4", "intervalo t media"],
    ["ic", "Proporción", String.raw`\hat p\pm z_{\alpha/2}\sqrt{\frac{\hat p(1-\hat p)}n}`, "np̂ y n(1 − p̂) grandes.", MI, "mi-7", "intervalo proporción"],
    ["ic", "Varianza", String.raw`\frac{(n-1)s^2}{\chi^2_{\alpha/2,\,n-1}}<\sigma^2<\frac{(n-1)s^2}{\chi^2_{1-\alpha/2,\,n-1}}`, "Población normal; no simétrico alrededor de s².", MI, "mi-7", "intervalo varianza chi"],
    ["ic", "Tamaño de muestra", String.raw`n\ge\left(\frac{z_{\alpha/2}\,\sigma}{E}\right)^2\qquad n\ge\frac{z_{\alpha/2}^2\,p(1-p)}{E^2}`, "E = margen deseado; con p desconocida, p = 0,5.", MI, "mi-6", "tamaño muestra margen error"],
    ["ic", "Dos medias, σ conocidas", String.raw`(\bar x_1-\bar x_2)\pm z_{\alpha/2}\sqrt{\frac{\sigma_1^2}{n_1}+\frac{\sigma_2^2}{n_2}}`, "Muestras independientes. Si contiene el 0, no hay evidencia de diferencia.", MI, "mi-8", "diferencia medias z"],
    ["ic", "Dos medias, n grandes y σ estimadas", String.raw`(\bar x_1-\bar x_2)\pm z_{\alpha/2}\sqrt{\frac{s_1^2}{n_1}+\frac{s_2^2}{n_2}}`, "Muestras grandes: s₁ y s₂ reemplazan a σ₁ y σ₂ (aproximado).", MI, "mi-8", "diferencia medias z aproximación"],
    ["ic", "Dos medias, varianzas iguales", String.raw`\begin{aligned}&(\bar x_1-\bar x_2)\pm t_{\alpha/2,\,n_1+n_2-2}\,s_p\sqrt{\frac1{n_1}+\frac1{n_2}}\\&s_p^2=\frac{(n_1-1)s_1^2+(n_2-1)s_2^2}{n_1+n_2-2}\end{aligned}`, "Poblaciones normales con varianzas iguales; sₚ² las combina.", MI, "mi-8", "pooled combinada"],
    ["ic", "Dos medias, varianzas distintas (Welch)", String.raw`(\bar x_A-\bar x_B)\pm t_{\alpha/2,\nu}\sqrt{\frac{s_A^2}{n_A}+\frac{s_B^2}{n_B}}`, "Poblaciones normales, varianzas distintas; ν por Welch–Satterthwaite.", MI, "mi-8", "welch varianzas distintas"],
    ["ic", "Datos pareados", String.raw`\bar d\pm t_{\alpha/2,\,n-1}\frac{s_d}{\sqrt n}`, "Mismas unidades medidas dos veces: trabajar con las diferencias.", MI, "mi-8", "pareados diferencias"],

    ["reg", "Modelo de regresión lineal", String.raw`Y_i=\beta_0+\beta_1x_i+\varepsilon_i,\qquad \varepsilon_i\sim N(0,\sigma^2)`, "Predicción de Y a partir de x.", RC, "rc-1", "modelo lineal"],
    ["reg", "Mínimos cuadrados", String.raw`b_1=\frac{S_{xy}}{S_{xx}}\qquad b_0=\bar y-b_1\bar x\qquad S_{xy}=\sum(x_i-\bar x)(y_i-\bar y)`, "La recta pasa por (x̄, ȳ).", RC, "rc-2", "pendiente intercepto recta"],
    ["reg", "Correlación y R²", String.raw`r=\frac{S_{xy}}{\sqrt{S_{xx}S_{yy}}}\qquad R^2=1-\frac{\mathrm{SSE}}{\mathrm{SST}}=r^2\qquad \hat\sigma^2=\frac{\mathrm{SSE}}{n-2}`, "Bondad de ajuste y varianza residual.", RC, "rc-3", "correlación determinación residuos"],

    ["conf", "Confiabilidad y tasa de falla", String.raw`R(t)=P(T>t)=1-F(t)\qquad h(t)=\frac{f(t)}{R(t)}`, "Probabilidad de seguir funcionando a tiempo t.", RC, "rc-5", "confiabilidad supervivencia tasa falla"],
    ["conf", "Serie y paralelo", String.raw`R_{\text{serie}}=\prod r_i\qquad R_{\text{paralelo}}=1-\prod(1-r_i)`, "Componentes independientes.", RC, "rc-6", "sistemas serie paralelo redundancia"]
  ];

  const $ = (id) => document.getElementById(id);
  const norm = (s) => (s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const tex = (s) => { try { return katex.renderToString(s.replace(/(\d),(?=\d)/g, "$1{,}"), { displayMode: true, throwOnError: false }); } catch (e) { return s; } };
  const inline = (root) => root.querySelectorAll(".md").forEach((n) => { n.innerHTML = n.textContent.replace(/\\\((.+?)\\\)/g, (_, m) => katex.renderToString(m, { throwOnError: false })); });
  let vista = "formulas", diapositivas = [];

  function nav(grupos) {
    const ul = $("indice"); ul.innerHTML = "";
    grupos.forEach(([id, nombre, n]) => {
      const li = document.createElement("li");
      li.innerHTML = `<a href="#${id}"><span>${nombre}</span><span class="n">${n}</span></a>`;
      ul.appendChild(li);
    });
    observar();
  }

  function formulas(q) {
    const host = $("resultados"); host.innerHTML = "";
    const grupos = []; let total = 0;
    TEMAS.forEach(([k, nombre]) => {
      const lista = F.filter((f) => f[0] === k && (!q || norm([f[1], f[3], f[6], nombre, NOMBRE[f[4]]].join(" ")).includes(q)));
      if (!lista.length) return;
      total += lista.length; grupos.push([`t-${k}`, nombre, lista.length]);
      const sec = document.createElement("section");
      sec.id = `t-${k}`;
      sec.innerHTML = `<h2>${nombre}</h2>`;
      lista.forEach((f) => {
        const fila = document.createElement("div"); fila.className = "fila";
        fila.innerHTML = `<div class="meta"><h3>${f[1]}</h3><p>${f[3]}</p><a href="${f[4]}.html#/${f[5]}">${NOMBRE[f[4]]}</a></div><div class="eq">${tex(f[2])}</div>`;
        sec.appendChild(fila);
      });
      host.appendChild(sec);
    });
    host.querySelectorAll(".eq").forEach((eq) => {
      let size = 22;
      while (eq.scrollWidth > eq.clientWidth + 2 && size > 14) { size -= 1; eq.style.fontSize = size + "px"; }
    });
    nav(grupos);
    $("cuenta").textContent = total ? `${total} fórmula${total === 1 ? "" : "s"}` : "Ninguna fórmula coincide con la búsqueda.";
  }

  function temas(q) {
    const host = $("resultados"); host.innerHTML = "";
    if (!diapositivas.length) { $("cuenta").textContent = "Cargando las clases…"; nav([]); return; }
    const filtro = diapositivas.filter((d) => !q || norm(d.texto).includes(q));
    const grupos = []; let total = 0;
    UNIDADES.forEach(([u, nombre]) => {
      const lista = filtro.filter((d) => d.u === u && !d.modulo);
      if (!lista.length) return;
      total += lista.length; grupos.push([`u-${u}`, nombre, lista.length]);
      const sec = document.createElement("section"); sec.id = `u-${u}`;
      sec.innerHTML = `<h2><a href="${u}.html">${nombre}</a></h2>`;
      const ul = document.createElement("ul"); ul.className = "lista";
      lista.forEach((d) => {
        const li = document.createElement("li"); if (d.sub) li.className = "sub";
        li.innerHTML = `<a href="${u}.html#/${d.id}"><span class="md">${d.titulo}</span></a><span class="mod">${d.moduloNombre}</span>`;
        ul.appendChild(li);
      });
      sec.appendChild(ul); host.appendChild(sec);
    });
    inline(host); nav(grupos);
    $("cuenta").textContent = total ? `${total} diapositiva${total === 1 ? "" : "s"}` : "Ningún tema coincide con la búsqueda.";
  }

  let obs = null;
  function observar() {
    if (obs) obs.disconnect();
    const links = [...document.querySelectorAll("#indice a")];
    obs = new IntersectionObserver((es) => {
      es.forEach((e) => { if (e.isIntersecting) links.forEach((a) => a.classList.toggle("on", a.getAttribute("href") === "#" + e.target.id)); });
    }, { rootMargin: "-20% 0px -70% 0px" });
    document.querySelectorAll("#resultados section").forEach((s) => obs.observe(s));
  }

  function pintar() {
    const q = norm($("buscar").value.trim());
    document.querySelectorAll("#vistas button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.vista === vista)));
    $("buscar").placeholder = vista === "formulas" ? "Buscar una fórmula: binomial, varianza, Bayes…" : "Buscar un tema en las clases: Poisson, cuartiles…";
    if (vista === "formulas") formulas(q); else temas(q);
  }

  function cargarUnidades() {
    const cargar = (i) => {
      if (i >= UNIDADES.length) { if (vista === "temas") pintar(); return; }
      const [u] = UNIDADES[i];
      const s = document.createElement("script");
      s.src = `${u}.js${version}`;
      s.onload = () => {
        const c = window.COURSE;
        if (c && c.modules) c.modules.forEach((m) => {
          const mn = m.title.replace(/^\d\d[A-Z]? · /, "");
          (m.slides || []).forEach((sl) => {
            const id = sl.id || "";
            diapositivas.push({ u, id, titulo: sl.title, moduloNombre: mn, texto: [mn, sl.title, sl.lead || ""].join(" ") });
            (sl.abajo || []).forEach((ab, n) => diapositivas.push({ u, id: `${id}-abajo-${n + 1}`, sub: true, titulo: ab.title, moduloNombre: mn, texto: [mn, sl.title, ab.title].join(" ") }));
          });
        });
        cargar(i + 1);
      };
      s.onerror = () => cargar(i + 1);
      document.body.appendChild(s);
    };
    cargar(0);
  }

  function main() {
    document.querySelectorAll("#vistas button").forEach((b) => b.addEventListener("click", () => { vista = b.dataset.vista; pintar(); window.scrollTo({ top: 0 }); }));
    $("buscar").addEventListener("input", pintar);
    document.addEventListener("keydown", (e) => { if (e.key === "/" && document.activeElement !== $("buscar")) { e.preventDefault(); $("buscar").focus(); } });
    const prm = new URLSearchParams(location.search);
    if (prm.get("q")) $("buscar").value = prm.get("q");
    if (prm.get("vista") === "temas") vista = "temas";
    pintar();
    cargarUnidades();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", main); else main();
}());
