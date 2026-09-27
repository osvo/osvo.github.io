# Sitio web de Juan Camilo Osorio Oviedo

Este repositorio contiene el código fuente del sitio web con el CV de Juan Camilo Osorio Oviedo, diseñado para simular ventanas de terminal.

## ¿Cómo ver el sitio web?

En [osvo.com.co](https://osvo.com.co) (osvo.github.io redirige ahí).

## Terminal interactiva

La ventana `~/sections` incluye una línea de comandos. Presiona `/` desde cualquier parte de la página para enfocarla y escribe `help`.

| Comando | Qué hace |
| --- | --- |
| `ls [carpeta]` | lista las secciones o su contenido |
| `cd <sección>`, `cat <archivo>` | abre la ventana correspondiente |
| `open <enlace>` | abre un enlace (`open github`, `open linkedin`…) |
| `whoami`, `fastfetch` | información sobre mí |
| `theme [nombre]`, `lang <es\|en>`, `motion [on\|off]` | paleta, idioma y fondo animado |
| `calc <expresión>` | calculadora (`calc sqrt(2)^2`, `calc sin(pi/6)`, `calc fact(5)`) |
| `email`, `history`, `clear` | contacto, historial y limpiar |

Atajos: `Tab` autocompleta, `↑`/`↓` recorren el historial y `Ctrl+L` limpia la pantalla.

## Estructura

- `index.html`: contenido en español (se muestra aunque JavaScript esté desactivado).
- `js/i18n.js`: traducción al inglés y cambio de idioma.
- `js/main.js`: paletas de colores y controles de ventana.
- `js/letter-glitch.js`: fondo animado (solo redibuja las celdas que cambian).
- `js/shell.js`: terminal interactiva.
- `js/typewriter.js`: efecto de escritura de los comandos (se desactiva con `prefers-reduced-motion`).

## Tecnologías utilizadas

Este proyecto fue construido utilizando únicamente tecnologías web estándar, sin dependencias:

- HTML
- CSS
- JavaScript
