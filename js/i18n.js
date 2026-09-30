/**
 * Detecta el idioma del navegador y permite alternar manualmente entre
 * las versiones en español e inglés sin depender de la ubicación o la IP.
 */
(function() {
  'use strict';

  const MASTER_THESIS_URL = 'https://repositorio.unal.edu.co/handle/unal/90216';

  const translations = {
    es: {
      metaDescription: 'Juan Camilo Osorio Oviedo: experiencia, educación y enlaces.',
      jobTitle: 'Docente · Ingeniero civil · M. Sc. en Matemática Aplicada',
      skip: 'Saltar al contenido',
      backToIndex: 'Volver al índice',
      paletteTitle: 'Cambiar paleta de colores',
      languageButton: 'EN',
      languageTitle: 'Ver en inglés',
      windowControls: {
        close: 'Cerrar',
        minimize: 'Minimizar',
        maximize: 'Maximizar ancho'
      },
      about: {
        heading: 'Sobre Juan Camilo Osorio Oviedo',
        nameKey: 'Nombre',
        roleKey: 'Rol',
        role: 'Docente · Ing. civil · M. Sc. Matemática aplicada.',
        profileKey: 'Perfil',
        profile: 'Aplico computación científica, aprendizaje automático e IA a la ingeniería civil y la docencia, con énfasis en confiabilidad estructural y automatización.',
        locationKey: 'Ubicación',
        location: 'Manizales, Caldas, Colombia',
        emailKey: 'Correo',
        codeRoleKey: 'rol',
        codeProfileKey: 'perfil',
        codeLocationKey: 'ubicación',
        codeEmailKey: 'correo',
        emailSubject: 'Contacto desde CV'
      },
      education: {
        title: 'Educación',
        master: 'Maestría en Ciencias — Matemática Aplicada',
        university: 'Universidad Nacional de Colombia',
        distinction: 'Distinción Meritoria',
        civilEngineering: 'Ingeniería Civil',
        teachingDiploma: 'Diplomado en Docencia Universitaria',
        thesisLabel: 'Tesis',
        masterThesis: '«An adaptive Bayesian Support Vector Regression Proposal for structural reliability»',
        undergraduateThesis: '«On the use of Support Vector Machines in structural reliability»'
      },
      experience: {
        title: 'Experiencia',
        teacher: 'Docente ocasional',
        university: 'Universidad Nacional de Colombia',
        statistics: 'Estadística I',
        differentialEquations: 'Ecuaciones diferenciales',
        differentialCalculus: 'Cálculo diferencial',
        basicMath: 'Matemáticas básicas',
        assistantships: 'Monitorías académicas',
        programming: 'Programación de computadores',
        solidMechanics: 'Mecánica de sólidos',
        integralCalculus: 'Cálculo integral',
        linearAlgebra: 'Álgebra lineal'
      },
      skills: {
        title: 'Habilidades',
        scientific: '<strong>Computación científica:</strong> Python, MATLAB y métodos numéricos.',
        ml: '<strong>Aprendizaje automático:</strong> scikit-learn, PyTorch y TensorFlow.',
        automation: '<strong>Automatización e IA:</strong> agentes y flujos de trabajo reproducibles.',
        engineering: '<strong>Ingeniería civil:</strong> AutoCAD, Robot, Revit, ETABS y memorias de cálculo.',
        teaching: '<strong>Docencia:</strong> matemáticas, estadística y recursos educativos digitales.',
        tools: '<strong>Herramientas:</strong> Git, LaTeX y Linux.',
        languages: '<strong>Idiomas:</strong> Español (nativo) · Inglés (C1).'
      },
      projects: {
        title: 'Proyectos',
        siteCode: 'Código de este sitio web',
        algebra: 'Laboratorio interactivo de álgebra lineal',
        absvr: 'Adaptive Bayesian Support Vector Regression'
      },
      linksTitle: 'Enlaces',
      footer: 'Hecho con HTML, CSS y JavaScript.'
    },
    en: {
      metaDescription: 'Juan Camilo Osorio Oviedo: experience, education, projects, and links.',
      jobTitle: 'Lecturer · Civil Engineer · M. Sc. in Applied Mathematics',
      skip: 'Skip to content',
      backToIndex: 'Back to index',
      paletteTitle: 'Change color palette',
      languageButton: 'ES',
      languageTitle: 'View in Spanish',
      windowControls: {
        close: 'Close',
        minimize: 'Minimize',
        maximize: 'Maximize width'
      },
      about: {
        heading: 'About Juan Camilo Osorio Oviedo',
        nameKey: 'Name',
        roleKey: 'Role',
        role: 'Lecturer · Civil Engineer · M. Sc. Applied Mathematics',
        profileKey: 'Profile',
        profile: 'I apply scientific computing, machine learning and AI to civil engineering and teaching, with a focus on structural reliability and automation.',
        locationKey: 'Location',
        location: 'Manizales, Caldas, Colombia',
        emailKey: 'Email',
        codeRoleKey: 'role',
        codeProfileKey: 'profile',
        codeLocationKey: 'location',
        codeEmailKey: 'email',
        emailSubject: 'Contact from CV'
      },
      education: {
        title: 'Education',
        master: 'Master of Science — Applied Mathematics',
        university: 'National University of Colombia',
        distinction: 'Meritorious distinction',
        civilEngineering: 'Civil Engineering',
        teachingDiploma: 'Diploma in University Teaching',
        thesisLabel: 'Thesis',
        masterThesis: '“An adaptive Bayesian Support Vector Regression Proposal for structural reliability”',
        undergraduateThesis: '“On the use of Support Vector Machines in structural reliability”'
      },
      experience: {
        title: 'Experience',
        teacher: 'Lecturer',
        university: 'National University of Colombia',
        statistics: 'Statistics I',
        differentialEquations: 'Differential Equations',
        differentialCalculus: 'Differential Calculus',
        basicMath: 'Basic Mathematics',
        assistantships: 'Academic assistantships',
        programming: 'Computer Programming',
        solidMechanics: 'Mechanics of Solids',
        integralCalculus: 'Integral Calculus',
        linearAlgebra: 'Linear Algebra'
      },
      skills: {
        title: 'Skills',
        scientific: '<strong>Scientific computing:</strong> Python, MATLAB and numerical methods.',
        ml: '<strong>Machine learning:</strong> scikit-learn, PyTorch and TensorFlow.',
        automation: '<strong>Automation & AI:</strong> agents and reproducible workflows.',
        engineering: '<strong>Civil engineering:</strong> AutoCAD, Robot, Revit, ETABS and engineering calculation reports.',
        teaching: '<strong>Teaching:</strong> mathematics, statistics and digital learning resources.',
        tools: '<strong>Tools:</strong> Git, LaTeX and Linux.',
        languages: '<strong>Languages:</strong> Spanish (native) · English (C1).'
      },
      projects: {
        title: 'Projects',
        siteCode: 'Source code for this website',
        algebra: 'Interactive linear algebra laboratory',
        absvr: 'Adaptive Bayesian Support Vector Regression'
      },
      linksTitle: 'Links',
      footer: 'Built with HTML, CSS, and JavaScript.'
    }
  };

  const getInitialLanguage = () => {
    const current = document.documentElement.getAttribute('data-language');
    return current === 'en' ? 'en' : 'es';
  };

  const setHtml = (selector, html) => {
    const element = document.querySelector(selector);
    if (element) element.innerHTML = html;
  };

  const setText = (selector, text) => {
    const element = document.querySelector(selector);
    if (element) element.textContent = text;
  };

  const persistLanguage = language => {
    try {
      localStorage.setItem('site-language', language);
    } catch (error) {
      // El cambio sigue funcionando aunque el navegador bloquee localStorage.
    }
  };

  const renderAbout = (copy) => {
    const subject = encodeURIComponent(copy.emailSubject);

    setText('#about #h-name', copy.heading);
    setHtml('#about .fetch-info', `
      <div class="fetch-title"><span class="user">osvo</span><span class="muted">@</span><span class="host">cv</span></div>
      <div class="fetch-rule" aria-hidden="true"></div>
      <div class="fetch-row"><span class="fetch-key">${copy.nameKey}</span><span class="fetch-value">Juan Camilo Osorio Oviedo</span></div>
      <div class="fetch-row"><span class="fetch-key">${copy.roleKey}</span><span class="fetch-value">${copy.role}</span></div>
      <div class="fetch-row"><span class="fetch-key">${copy.profileKey}</span><span class="fetch-value">${copy.profile}</span></div>
      <div class="fetch-row"><span class="fetch-key">${copy.locationKey}</span><span class="fetch-value">${copy.location}</span></div>
      <div class="fetch-row"><span class="fetch-key">${copy.emailKey}</span><span class="fetch-value"><a href="mailto:jucosorioov@unal.edu.co?subject=${subject}">jucosorioov@unal.edu.co</a></span></div>
      <div class="fetch-palette" aria-hidden="true">
        <span class="swatch red"></span><span class="swatch orange"></span><span class="swatch yellow"></span><span class="swatch green"></span><span class="swatch cyan"></span><span class="swatch blue"></span><span class="swatch magenta"></span>
      </div>
    `);

    setHtml('#about .about-code', `
      <div class="line"><span class="hdr"># Juan Camilo Osorio Oviedo</span></div>
      <div class="line"><span class="id">osvo</span> <span class="k">=</span> <span class="v">{</span></div>
      <div class="indent">
        <div class="line"><span class="k">${copy.codeRoleKey}</span>: <span class="v">"${copy.role}"</span>,</div>
        <div class="line"><span class="k">${copy.codeProfileKey}</span>: <span class="v">"${copy.profile}"</span>,</div>
        <div class="line"><span class="k">${copy.codeLocationKey}</span>: <span class="v">"${copy.location}"</span>,</div>
        <div class="line"><span class="k">${copy.codeEmailKey}</span>: <a href="mailto:jucosorioov@unal.edu.co?subject=${subject}">jucosorioov@unal.edu.co</a></div>
      </div>
      <div class="line"><span class="v">}</span></div>
    `);
  };

  const renderSections = (copy) => {
    setHtml('#education .card', `
      <h2 id="h-edu"># ${copy.education.title}</h2>
      <ul class="education-list">
        <li class="education-item">
          <div class="education-heading"><strong class="education-degree">${copy.education.master}</strong><span class="badge education-year">2026</span></div>
          <div class="education-meta"><div class="education-institution">${copy.education.university}</div></div>
          <div class="education-thesis"><div class="education-thesis-heading"><span class="education-thesis-label">${copy.education.thesisLabel}</span><span class="badge education-distinction">${copy.education.distinction}</span></div><a class="education-thesis-title" href="${MASTER_THESIS_URL}" target="_blank" rel="noopener noreferrer">${copy.education.masterThesis}</a></div>
        </li>
        <li class="education-item">
          <div class="education-heading"><strong class="education-degree">${copy.education.civilEngineering}</strong><span class="badge education-year">2022</span></div>
          <div class="education-meta"><div class="education-institution">${copy.education.university}</div></div>
          <div class="education-thesis"><div class="education-thesis-heading"><span class="education-thesis-label">${copy.education.thesisLabel}</span></div><span class="education-thesis-title">${copy.education.undergraduateThesis}</span></div>
        </li>
        <li class="education-item">
          <div class="education-heading"><strong class="education-degree">${copy.education.teachingDiploma}</strong><span class="badge education-year">2025</span></div>
          <div class="education-meta"><div class="education-institution">${copy.education.university}</div></div>
        </li>
      </ul>
    `);

    setHtml('#experience .card', `
      <h2 id="h-exp"># ${copy.experience.title}</h2>
      <ul class="experience-list">
        <li class="experience-item" id="expTeaching">
          <strong class="experience-role">${copy.experience.teacher}</strong>
          <div class="experience-institution">${copy.experience.university}</div>
          <ul class="experience-tasks">
            <li class="experience-task"><span>${copy.experience.statistics}</span><span class="experience-years"><span class="badge">2024</span></span></li>
            <li class="experience-task"><span>${copy.experience.differentialEquations}</span><span class="experience-years"><span class="badge">2024</span></span></li>
            <li class="experience-task"><span>${copy.experience.differentialCalculus}</span><span class="experience-years"><span class="badge">2022</span></span></li>
            <li class="experience-task"><span>${copy.experience.basicMath}</span><span class="experience-years"><span class="badge">2022</span></span></li>
          </ul>
        </li>
        <li class="experience-item" id="expMonitors">
          <strong class="experience-role">${copy.experience.assistantships}</strong>
          <div class="experience-institution">${copy.experience.university}</div>
          <ul class="experience-tasks">
            <li class="experience-task"><span>${copy.experience.programming}</span><span class="experience-years"><span class="badge">2019</span></span></li>
            <li class="experience-task"><span>${copy.experience.solidMechanics}</span><span class="experience-years"><span class="badge">2020</span><span class="badge">2021</span></span></li>
            <li class="experience-task"><span>${copy.experience.integralCalculus}</span><span class="experience-years"><span class="badge">2023</span></span></li>
            <li class="experience-task"><span>${copy.experience.linearAlgebra}</span><span class="experience-years"><span class="badge">2025</span></span></li>
          </ul>
        </li>
      </ul>
    `);

    setHtml('#skills .card', `
      <h2 id="h-skills"># ${copy.skills.title}</h2>
      <div class="grid">
        <ul>
          <li>${copy.skills.scientific}</li>
          <li>${copy.skills.ml}</li>
          <li>${copy.skills.automation}</li>
        </ul>
        <ul>
          <li>${copy.skills.engineering}</li>
          <li>${copy.skills.teaching}</li>
          <li>${copy.skills.tools}</li>
          <li>${copy.skills.languages}</li>
        </ul>
      </div>
    `);

    setHtml('#projects .card', `
      <h2 id="h-proj"># ${copy.projects.title}</h2>
      <ul>
        <li><a href="https://github.com/osvo/osvo.github.io/" target="_blank" rel="noopener">${copy.projects.siteCode}</a></li>
        <li><a href="https://osvo.github.io/algebra-lineal/" target="_blank" rel="noopener">${copy.projects.algebra}</a></li>
        <li><a href="https://github.com/osvo/ABSVR" target="_blank" rel="noopener">${copy.projects.absvr}</a></li>
      </ul>
    `);

    setHtml('#links .card', `
      <h2 id="h-links"># ${copy.linksTitle}</h2>
      <ul>
        <li><a href="https://github.com/osvo" target="_blank" rel="noopener">GitHub</a></li>
        <li><a href="https://www.linkedin.com/in/osvo/" target="_blank" rel="noopener">LinkedIn</a></li>
        <li><a href="https://www.youtube.com/@caosvo" target="_blank" rel="noopener">YouTube</a></li>
        <li><a href="https://goodreads.com/osvo" target="_blank" rel="noopener">Goodreads</a></li>
      </ul>
    `);
  };

  const updateMetadata = (copy) => {
    document.title = 'Juan Camilo Osorio Oviedo';
    document.querySelector('meta[name="description"]')?.setAttribute('content', copy.metaDescription);
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', copy.metaDescription);

    const schemaElement = document.querySelector('script[type="application/ld+json"]');
    if (!schemaElement) return;

    try {
      const schema = JSON.parse(schemaElement.textContent);
      schema.jobTitle = copy.jobTitle;
      schemaElement.textContent = JSON.stringify(schema, null, 2);
    } catch (error) {
      console.error('Could not update JSON-LD metadata:', error);
    }
  };

  // El HTML ya viene en español: en la primera carga en español no hace falta
  // volver a pintar las secciones (evita trabajo y reflujos innecesarios).
  const applyLanguage = (language, persist = false, initial = false) => {
    const normalizedLanguage = language === 'en' ? 'en' : 'es';
    const copy = translations[normalizedLanguage];
    const root = document.documentElement;

    root.lang = normalizedLanguage;
    root.setAttribute('data-language', normalizedLanguage);
    if (persist) persistLanguage(normalizedLanguage);

    setText('a[href="#sections"].sr-only', copy.skip);
    document.querySelector('.site-mark')?.setAttribute('aria-label', copy.backToIndex);

    const paletteButton = document.getElementById('togglePalette');
    paletteButton?.setAttribute('title', copy.paletteTitle);

    const languageButton = document.getElementById('toggleLanguage');
    if (languageButton) {
      languageButton.textContent = copy.languageButton;
      languageButton.setAttribute('title', copy.languageTitle);
      languageButton.setAttribute('aria-label', copy.languageTitle);
    }

    document.querySelectorAll('.dot.red').forEach(button => button.setAttribute('aria-label', copy.windowControls.close));
    document.querySelectorAll('.dot.yellow').forEach(button => button.setAttribute('aria-label', copy.windowControls.minimize));
    document.querySelectorAll('.dot.green').forEach(button => button.setAttribute('aria-label', copy.windowControls.maximize));

    if (!(initial && normalizedLanguage === 'es')) {
      renderAbout(copy.about);
      renderSections(copy);
      const renderedYear = document.getElementById('yearRoman')?.textContent || '';
      setHtml('.footer', `© <span id="yearRoman"></span> — Juan Camilo Osorio Oviedo — ${copy.footer}`);
      if (renderedYear) setText('#yearRoman', renderedYear);
    }
    updateMetadata(copy);

    document.dispatchEvent(new CustomEvent('site-language-change', {
      detail: { language: normalizedLanguage }
    }));
  };

  let currentLanguage = getInitialLanguage();
  applyLanguage(currentLanguage, false, true);

  document.getElementById('toggleLanguage')?.addEventListener('click', () => {
    currentLanguage = currentLanguage === 'es' ? 'en' : 'es';
    applyLanguage(currentLanguage, true);
  });

  window.__setLanguage = language => {
    currentLanguage = language === 'en' ? 'en' : 'es';
    applyLanguage(currentLanguage, true);
  };
})();
