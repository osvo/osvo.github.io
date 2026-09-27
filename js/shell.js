/**
 * @file Terminal interactiva dentro de la ventana ~/sections.
 * El visitante puede escribir comandos (help, ls, cd, cat, theme, lang, calc…),
 * con autocompletado (Tab), historial (↑ ↓) y el atajo "/" para enfocarla.
 * Todo el texto del usuario se inserta con textContent: nunca como HTML.
 */
(function() {
  'use strict';

  const screen = document.querySelector('#sections .screen');
  if (!screen) return;

  // --- Sistema de archivos ficticio: una carpeta por ventana del sitio. ---
  const SECTIONS = {
    about: 'about.txt',
    education: 'education.md',
    experience: 'experience.log',
    skills: 'skills.json',
    projects: null,  // carpeta: su contenido son los enlaces de la ventana
    links: null
  };
  const SECTION_NAMES = Object.keys(SECTIONS);
  const FILE_TO_SECTION = Object.fromEntries(
    SECTION_NAMES.filter(name => SECTIONS[name]).map(name => [SECTIONS[name], name])
  );

  const TEXT = {
    es: {
      placeholder: 'escribe help',
      inputLabel: 'Terminal interactiva: escribe un comando',
      help: [
        ['help', 'muestra esta ayuda'],
        ['ls [carpeta]', 'lista el contenido'],
        ['cd <sección>', 'abre una sección (cd .. vuelve)'],
        ['cat <archivo>', 'muestra un archivo'],
        ['open <enlace>', 'abre un enlace (p. ej. open github)'],
        ['whoami', '¿quién es osvo?'],
        ['fastfetch', 'ficha del sistema'],
        ['theme [nombre]', 'cambia la paleta de colores'],
        ['lang <es|en>', 'cambia el idioma'],
        ['motion [on|off]', 'anima o pausa el fondo'],
        ['calc <expresión>', 'calculadora (p. ej. calc sqrt(2)^2)'],
        ['email', 'escríbeme'],
        ['history', 'comandos anteriores'],
        ['clear', 'limpia la pantalla (Ctrl+L)']
      ],
      helpFooter: 'Tab autocompleta · ↑ ↓ historial · / enfoca la terminal',
      notFound: cmd => `bash: ${cmd}: orden no encontrada`,
      didYouMean: cmd => `¿Quisiste decir «${cmd}»?`,
      noSuchFile: name => `no existe el archivo o la carpeta: ${name}`,
      notADir: name => `no es una carpeta: ${name}`,
      isADir: name => `es una carpeta: ${name} (prueba con cd ${name})`,
      opening: name => `abriendo ${name}…`,
      themeNow: name => `paleta: ${name}`,
      themeUnknown: name => `paleta desconocida: ${name}`,
      langNow: lang => `idioma: ${lang}`,
      motionNow: on => `fondo animado: ${on ? 'activado' : 'en pausa'}`,
      calcUsage: 'uso: calc <expresión>   p. ej. calc 2^10, calc sin(pi/6), calc ln(e)',
      calcError: 'expresión no válida',
      emailLine: 'Escríbeme a',
      emailSubject: 'Contacto desde CV',
      sudo: 'osvo no está en el archivo sudoers. Este incidente será reportado.',
      rm: 'rm: permiso denegado. Buen intento.',
      exit: 'logout… es broma. Usa el botón rojo para cerrar la ventana.',
      vim: 'Para salir de vim: Esc, luego :q y Enter. Aquí no hace falta.',
      openUsage: name => `uso: open <enlace>   enlaces: ${name}`
    },
    en: {
      placeholder: 'type help',
      inputLabel: 'Interactive terminal: type a command',
      help: [
        ['help', 'show this help'],
        ['ls [dir]', 'list contents'],
        ['cd <section>', 'open a section (cd .. goes back)'],
        ['cat <file>', 'show a file'],
        ['open <link>', 'open a link (e.g. open github)'],
        ['whoami', 'who is osvo?'],
        ['fastfetch', 'system info'],
        ['theme [name]', 'change the color palette'],
        ['lang <es|en>', 'change the language'],
        ['motion [on|off]', 'animate or pause the background'],
        ['calc <expression>', 'calculator (e.g. calc sqrt(2)^2)'],
        ['email', 'write to me'],
        ['history', 'previous commands'],
        ['clear', 'clear the screen (Ctrl+L)']
      ],
      helpFooter: 'Tab completes · ↑ ↓ history · / focuses the terminal',
      notFound: cmd => `bash: ${cmd}: command not found`,
      didYouMean: cmd => `Did you mean "${cmd}"?`,
      noSuchFile: name => `no such file or directory: ${name}`,
      notADir: name => `not a directory: ${name}`,
      isADir: name => `is a directory: ${name} (try cd ${name})`,
      opening: name => `opening ${name}…`,
      themeNow: name => `palette: ${name}`,
      themeUnknown: name => `unknown palette: ${name}`,
      langNow: lang => `language: ${lang}`,
      motionNow: on => `animated background: ${on ? 'on' : 'paused'}`,
      calcUsage: 'usage: calc <expression>   e.g. calc 2^10, calc sin(pi/6), calc ln(e)',
      calcError: 'invalid expression',
      emailLine: 'Write to me at',
      emailSubject: 'Contact from CV',
      sudo: 'osvo is not in the sudoers file. This incident will be reported.',
      rm: 'rm: permission denied. Nice try.',
      exit: 'logout… just kidding. Use the red button to close the window.',
      vim: 'To exit vim: Esc, then :q and Enter. Not needed here.',
      openUsage: name => `usage: open <link>   links: ${name}`
    }
  };

  const t = () => TEXT[document.documentElement.lang === 'en' ? 'en' : 'es'];
  const EMAIL = 'jucosorioov@unal.edu.co';

  // --- DOM ---
  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  };

  const shell = el('div', 'shell');
  const output = el('div', 'shell-out');
  output.setAttribute('role', 'log');
  output.setAttribute('aria-live', 'polite');
  const form = el('form', 'shell-form');
  form.setAttribute('autocomplete', 'off');
  const promptLabel = el('label', 'prompt');
  promptLabel.htmlFor = 'shellInput';
  const input = el('input', 'shell-input');
  Object.assign(input, { id: 'shellInput', type: 'text', spellcheck: false });
  input.setAttribute('autocapitalize', 'off');
  input.setAttribute('autocorrect', 'off');
  input.setAttribute('enterkeyhint', 'send');
  form.append(promptLabel, input);
  shell.append(output, form);
  screen.appendChild(shell);

  let cwd = '';  // '' = ~/
  const history = [];
  let historyIndex = 0;

  const renderPrompt = (target, path = cwd) => {
    target.replaceChildren(
      el('span', 'user', 'osvo'), '@', el('span', 'host', 'cv'), ':',
      el('span', 'path', `~/${path ? path + '/' : ''}`), '$'
    );
  };

  const updateLanguage = () => {
    input.placeholder = t().placeholder;
    input.setAttribute('aria-label', t().inputLabel);
  };

  renderPrompt(promptLabel);
  updateLanguage();
  document.addEventListener('site-language-change', updateLanguage);

  // --- Salida ---
  const MAX_LINES = 200;
  const print = (...parts) => {
    const line = el('div', 'line');
    parts.forEach(part => line.append(typeof part === 'string' ? document.createTextNode(part) : part));
    output.appendChild(line);
    while (output.childElementCount > MAX_LINES) output.firstElementChild.remove();
    return line;
  };
  const printMuted = text => print(el('span', 'muted', text));
  const printError = text => print(el('span', 'shell-error', text));

  const link = (text, href, onClick) => {
    const a = el('a', null, text);
    a.href = href;
    if (onClick) {
      a.addEventListener('click', event => {
        event.preventDefault();
        onClick();
      });
    } else if (/^https?:/.test(href)) {
      a.target = '_blank';
      a.rel = 'noopener';
    }
    return a;
  };

  // Enlaces reales de las ventanas projects/ y links/, en el idioma actual.
  const linksOf = section =>
    Array.from(document.querySelectorAll(`#${section} .card a[href]`)).map(a => ({
      name: a.textContent.trim(),
      slug: a.textContent.trim().toLowerCase().replace(/\s+/g, '-'),
      href: a.href
    }));
  const allLinks = () => [...linksOf('links'), ...linksOf('projects')];

  // --- Navegación ---
  const openSection = name => {
    printMuted(t().opening(`~/${name}`));
    input.blur();
    if (window.__openFocusScroll) {
      window.__openFocusScroll(name, true);
    } else {
      document.getElementById(name)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const normalizePath = arg => {
    let path = (arg || '').trim().replace(/^~\/?/, '').replace(/^\.\//, '').replace(/\/+$/, '');
    if (!path) return '';
    if (path === '..') return '';
    if (path.startsWith('../')) path = path.slice(3);
    return path;
  };

  const sectionLinks = () => {
    const line = print();
    SECTION_NAMES.forEach((name, i) => {
      if (i) line.append('  ');
      line.appendChild(link(`${name}/`, `#${name}`, () => run(`cd ${name}`)));
    });
  };

  const listSection = name => {
    if (SECTIONS[name]) {
      const file = SECTIONS[name];
      print(link(file, `#${name}`, () => run(`cat ${file}`)));
      return;
    }
    const items = linksOf(name);
    items.forEach((item, i) => print(el('span', 'muted', i === items.length - 1 ? '└── ' : '├── '), link(item.name, item.href)));
  };

  // --- Calculadora: descenso recursivo, sin eval. ---
  const calc = source => {
    const tokens = source.match(/\d*\.?\d+(?:e[+-]?\d+)?|[a-z][a-z0-9]*|\*\*|[-+*/%^()]/gi) || [];
    if (tokens.join('') !== source.replace(/\s+/g, '')) throw new Error('token');
    let pos = 0;
    const peek = () => tokens[pos];
    const take = expected => {
      if (expected && tokens[pos] !== expected) throw new Error('expected ' + expected);
      return tokens[pos++];
    };
    const CONST = { pi: Math.PI, e: Math.E, tau: 2 * Math.PI, phi: (1 + Math.sqrt(5)) / 2 };
    const FN = {
      sqrt: Math.sqrt, cbrt: Math.cbrt, abs: Math.abs, exp: Math.exp, ln: Math.log, log: Math.log10,
      log2: Math.log2, sin: Math.sin, cos: Math.cos, tan: Math.tan, asin: Math.asin, acos: Math.acos,
      atan: Math.atan, sinh: Math.sinh, cosh: Math.cosh, tanh: Math.tanh, floor: Math.floor,
      ceil: Math.ceil, round: Math.round,
      fact: n => {
        if (!Number.isInteger(n) || n < 0 || n > 170) return NaN;
        let r = 1;
        for (let i = 2; i <= n; i++) r *= i;
        return r;
      }
    };
    // expr := term (('+'|'-') term)*
    const expr = () => {
      let v = term();
      while (peek() === '+' || peek() === '-') v = take() === '+' ? v + term() : v - term();
      return v;
    };
    // term := unary (('*'|'/'|'%') unary)*
    const term = () => {
      let v = unary();
      while (['*', '/', '%'].includes(peek())) {
        const op = take();
        const r = unary();
        v = op === '*' ? v * r : op === '/' ? v / r : v % r;
      }
      return v;
    };
    // unary := ('-'|'+') unary | power     (así -2^2 = -4, como en matemáticas)
    const unary = () => {
      if (peek() === '-') { take(); return -unary(); }
      if (peek() === '+') { take(); return unary(); }
      return power();
    };
    // power := atom (('^'|'**') unary)?   (asociativa por la derecha)
    const power = () => {
      const base = atom();
      if (peek() === '^' || peek() === '**') { take(); return Math.pow(base, unary()); }
      return base;
    };
    const atom = () => {
      const tok = take();
      if (tok === undefined) throw new Error('end');
      if (tok === '(') { const v = expr(); take(')'); return v; }
      if (/^\d*\.?\d/.test(tok)) return parseFloat(tok);
      const name = tok.toLowerCase();
      if (name in CONST) return CONST[name];
      if (name in FN) { take('('); const v = expr(); take(')'); return FN[name](v); }
      throw new Error('unknown ' + tok);
    };
    const value = expr();
    if (pos !== tokens.length) throw new Error('trailing');
    return value;
  };

  const formatNumber = v => {
    if (!Number.isFinite(v)) return String(v);
    const rounded = Number(v.toPrecision(12));
    return Math.abs(rounded) >= 1e15 || (rounded !== 0 && Math.abs(rounded) < 1e-9)
      ? rounded.toExponential(8)
      : String(rounded);
  };

  // --- Comandos ---
  const COMMANDS = {
    help() {
      const rows = t().help;
      const width = Math.max(...rows.map(([c]) => c.length)) + 2;
      rows.forEach(([cmd, desc]) => print(el('span', 'cmd', cmd.padEnd(width)), el('span', 'muted', desc)));
      printMuted(t().helpFooter);
    },
    ls(args) {
      const target = args.length ? normalizePath(args[0]) : cwd;
      if (!target) return sectionLinks();
      if (target in SECTIONS) return listSection(target);
      if (target in FILE_TO_SECTION) return print(target);
      printError(`ls: ${t().noSuchFile(args[0])}`);
    },
    cd(args) {
      const target = normalizePath(args[0]);
      if (!target) {
        cwd = '';
        renderPrompt(promptLabel);
        return;
      }
      if (target in SECTIONS) {
        cwd = target;
        renderPrompt(promptLabel);
        return openSection(target);
      }
      if (target in FILE_TO_SECTION) return printError(`cd: ${t().notADir(args[0])}`);
      printError(`cd: ${t().noSuchFile(args[0])}`);
    },
    cat(args) {
      if (!args.length) return printError('cat: ' + t().noSuchFile(''));
      const target = normalizePath(args[0]);
      const section = FILE_TO_SECTION[target] || FILE_TO_SECTION[target.split('/').pop()] ||
        (SECTIONS[target] ? target : null);
      if (section) return openSection(section);
      if (target in SECTIONS) return printError(`cat: ${t().isADir(target)}`);
      printError(`cat: ${t().noSuchFile(args[0])}`);
    },
    open(args) {
      const links = allLinks();
      const query = (args[0] || '').toLowerCase();
      if (!query) return printMuted(t().openUsage(links.map(l => l.slug).join(', ')));
      const target = normalizePath(query);
      if (target in SECTIONS || target in FILE_TO_SECTION) return COMMANDS.cat([target]);
      const match = links.find(l => l.slug === query) || links.find(l => l.slug.startsWith(query));
      if (!match) return printError(`open: ${t().noSuchFile(args[0])}`);
      printMuted(t().opening(match.href));
      window.open(match.href, '_blank', 'noopener');
    },
    pwd() {
      print(`/home/osvo${cwd ? '/' + cwd : ''}`);
    },
    whoami() {
      const values = document.querySelectorAll('#about .fetch-row .fetch-value');
      print(el('span', 'user', 'Juan Camilo Osorio Oviedo'), ' ', el('span', 'muted', '(osvo)'));
      if (values[1]) print(values[1].textContent.trim());
      if (values[2]) printMuted(values[2].textContent.trim());
    },
    fastfetch() {
      openSection('about');
    },
    theme(args) {
      const palettes = window.__palettes;
      if (!palettes) return;
      const query = (args[0] || '').toLowerCase();
      if (!query) {
        const current = palettes.get();
        palettes.list.forEach(name => {
          const line = print(name === current ? '* ' : '  ');
          line.appendChild(link(name, '#', () => run(`theme ${name}`)));
          line.append(el('span', 'muted', ' '.repeat(12 - name.length) + palettes.names[name]));
        });
        return;
      }
      let name = query;
      if (query === 'next' || query === 'random') {
        const others = palettes.list.filter(p => p !== palettes.get());
        const index = palettes.list.indexOf(palettes.get());
        name = query === 'next'
          ? palettes.list[(index + 1) % palettes.list.length]
          : others[Math.floor(Math.random() * others.length)];
      } else {
        name = palettes.list.find(p => p === query || p.startsWith(query)) || query;
      }
      if (!palettes.set(name)) return printError(t().themeUnknown(query));
      printMuted(t().themeNow(palettes.names[name]));
    },
    lang(args) {
      const lang = (args[0] || '').toLowerCase();
      if (lang !== 'es' && lang !== 'en') return printMuted(t().langNow(document.documentElement.lang) + '   (lang es | lang en)');
      window.__setLanguage?.(lang);
      printMuted(t().langNow(lang));
    },
    motion(args) {
      if (!window.__setBackgroundMotion) return;
      const arg = (args[0] || '').toLowerCase();
      const on = arg === 'on' ? true : arg === 'off' ? false : !window.__getBackgroundMotion();
      window.__setBackgroundMotion(on);
      printMuted(t().motionNow(on));
    },
    calc(args, raw) {
      const source = raw.replace(/^\s*\S+\s*/, '');
      if (!source) return printMuted(t().calcUsage);
      try {
        print(el('span', 'v', formatNumber(calc(source))));
      } catch (error) {
        printError(`calc: ${t().calcError}`);
      }
    },
    email() {
      const subject = encodeURIComponent(t().emailSubject);
      print(t().emailLine + ' ', link(EMAIL, `mailto:${EMAIL}?subject=${subject}`));
    },
    history() {
      history.forEach((cmd, i) => print(el('span', 'muted', String(i + 1).padStart(4) + '  '), cmd));
    },
    clear() {
      output.replaceChildren();
    },
    echo(args, raw) {
      print(raw.replace(/^\s*\S+\s?/, ''));
    },
    date() {
      print(new Date().toLocaleString(document.documentElement.lang === 'en' ? 'en-US' : 'es-CO', {
        dateStyle: 'full', timeStyle: 'medium'
      }));
    },
    sudo() { printError(t().sudo); },
    rm() { printError(t().rm); },
    exit() { printMuted(t().exit); },
    vim() { printMuted(t().vim); }
  };
  const ALIASES = {
    neofetch: 'fastfetch', dir: 'ls', ll: 'ls', cls: 'clear', man: 'help', '?': 'help',
    palette: 'theme', mail: 'email', contact: 'email', nano: 'vim', emacs: 'vim',
    vi: 'vim', logout: 'exit'
  };
  // Comandos que aparecen en el autocompletado (los "chistes" quedan ocultos).
  const VISIBLE = ['help', 'ls', 'cd', 'cat', 'open', 'pwd', 'whoami', 'fastfetch', 'theme', 'lang',
    'motion', 'calc', 'email', 'history', 'clear', 'echo', 'date'];

  const levenshtein = (a, b) => {
    const row = Array.from({ length: b.length + 1 }, (_, i) => i);
    for (let i = 1; i <= a.length; i++) {
      let prev = row[0];
      row[0] = i;
      for (let j = 1; j <= b.length; j++) {
        const tmp = row[j];
        row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
        prev = tmp;
      }
    }
    return row[b.length];
  };

  function run(raw) {
    const line = raw.trim();
    const echo = print();
    const promptCopy = el('span', 'prompt');
    renderPrompt(promptCopy);
    echo.append(promptCopy, ' ', line);
    if (!line) return scrollOutput();

    if (history[history.length - 1] !== line) history.push(line);
    historyIndex = history.length;

    const [word, ...args] = line.split(/\s+/);
    const name = word.toLowerCase();
    const command = COMMANDS[name] || COMMANDS[ALIASES[name]];
    if (command) {
      command(args, line);
    } else {
      printError(t().notFound(word));
      const guess = VISIBLE
        .map(cmd => [cmd, levenshtein(name, cmd)])
        .sort((a, b) => a[1] - b[1])[0];
      if (guess && guess[1] <= 2 && name.length > 1) printMuted(t().didYouMean(guess[0]));
    }
    scrollOutput();
  }

  const scrollOutput = () => {
    output.scrollTop = output.scrollHeight;
  };

  // --- Autocompletado ---
  const completionsFor = value => {
    const parts = value.split(/\s+/);
    if (parts.length === 1) return { prefix: '', options: VISIBLE, word: parts[0] };
    const name = parts[0].toLowerCase();
    const word = parts[parts.length - 1];
    const prefix = value.slice(0, value.length - word.length);
    const command = ALIASES[name] || name;
    let options = [];
    if (command === 'cd' || command === 'ls') options = SECTION_NAMES.map(n => n + '/');
    else if (command === 'cat') options = [...Object.keys(FILE_TO_SECTION), ...SECTION_NAMES.map(n => n + '/')];
    else if (command === 'open') options = allLinks().map(l => l.slug);
    else if (command === 'theme') options = [...(window.__palettes?.list || []), 'next', 'random'];
    else if (command === 'lang') options = ['es', 'en'];
    else if (command === 'motion') options = ['on', 'off'];
    return { prefix, options, word };
  };

  const complete = () => {
    const value = input.value;
    const { prefix, options, word } = completionsFor(value);
    const lower = word.toLowerCase();
    const matches = options.filter(o => o.toLowerCase().startsWith(lower));
    if (!matches.length) return;
    if (matches.length === 1) {
      const done = matches[0];
      input.value = prefix + done + (done.endsWith('/') ? '' : ' ');
      return;
    }
    // Varias opciones: se completa el prefijo común y se muestran todas.
    let common = matches[0];
    for (const m of matches) {
      while (!m.toLowerCase().startsWith(common.toLowerCase())) common = common.slice(0, -1);
    }
    if (common.length > word.length) {
      input.value = prefix + common;
    } else {
      const echo = print();
      const promptCopy = el('span', 'prompt');
      renderPrompt(promptCopy);
      echo.append(promptCopy, ' ', value);
      printMuted(matches.join('  '));
      scrollOutput();
    }
  };

  // --- Eventos ---
  form.addEventListener('submit', event => {
    event.preventDefault();
    const value = input.value;
    input.value = '';
    run(value);
  });

  input.addEventListener('keydown', event => {
    if (event.key === 'Tab' && input.value.trim()) {
      event.preventDefault();
      complete();
    } else if (event.key === 'ArrowUp') {
      if (!history.length) return;
      event.preventDefault();
      historyIndex = Math.max(0, historyIndex - 1);
      input.value = history[historyIndex];
    } else if (event.key === 'ArrowDown') {
      if (!history.length) return;
      event.preventDefault();
      historyIndex = Math.min(history.length, historyIndex + 1);
      input.value = history[historyIndex] || '';
    } else if (event.ctrlKey && (event.key === 'l' || event.key === 'L')) {
      event.preventDefault();
      COMMANDS.clear();
    } else if (event.ctrlKey && (event.key === 'c' || event.key === 'C') && input.selectionStart === input.selectionEnd) {
      // Ctrl+C sin texto seleccionado: "interrumpe" la línea, como en bash.
      const echo = print();
      const promptCopy = el('span', 'prompt');
      renderPrompt(promptCopy);
      echo.append(promptCopy, ' ', input.value + '^C');
      input.value = '';
      scrollOutput();
    } else if (event.key === 'Escape') {
      input.blur();
    }
  });

  // Clic en cualquier parte vacía de la terminal: enfocar la entrada.
  shell.addEventListener('click', event => {
    if (!event.target.closest('a') && !window.getSelection()?.toString()) input.focus();
  });

  // "/" o "`" desde cualquier parte de la página enfocan la terminal.
  document.addEventListener('keydown', event => {
    if (event.key !== '/' && event.key !== '`') return;
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    const target = event.target;
    if (target.closest?.('input, textarea, select, [contenteditable="true"]')) return;
    event.preventDefault();
    const term = document.getElementById('sections');
    term?.classList.remove('closed', 'minimized');
    input.focus({ preventScroll: true });
    shell.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
})();
