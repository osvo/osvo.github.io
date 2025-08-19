/**
 * @file Carga y muestra los datos del CV desde un archivo JSON.
 * Versión optimizada para minimizar la manipulación del DOM.
 */

(function() {
  'use strict';

  /**
   * Carga los datos del CV desde un archivo JSON y los muestra en la página.
   * @param {string} url - La ruta al archivo JSON de datos.
   */
  async function loadCvData(url = 'cv-data.json') {
    try {
      const response = await fetch(url, { cache: 'force-cache' });
      if (!response.ok) {
        throw new Error(`Error al cargar el archivo: ${response.statusText}`);
      }
      const data = await response.json();
      populateCv(data);
    } catch (error) {
      console.error('No se pudieron cargar los datos del CV:', error);
      const desk = document.getElementById('desk');
      if (desk) {
        desk.innerHTML = '<div class="terminal"><div class="screen" style="padding: 1em;"><h1>Error</h1><p>No se pudieron cargar los datos del CV. Revisa la consola para más detalles.</p></div></div>';
      }
    }
  }

  /**
   * Rellena el HTML con los datos del CV de forma optimizada.
   * @param {object} data - El objeto con todos los datos del CV.
   */
  function populateCv(data) {
    if (!data) return;

    // --- 1. Query all DOM elements at once ---
    const elements = {
      about: document.querySelector('#about .card'),
      education: document.querySelector('#education .card'),
      experience: document.querySelector('#experience .card'),
      skills: document.querySelector('#skills .card'),
      projects: document.querySelector('#projects .card'),
      links: document.querySelector('#links .card')
    };

    // --- 2. Generate all HTML strings ---
    const htmlContents = {
      about: generateAboutHtml(data.about, data.person),
      education: generateEducationHtml(data.education),
      experience: generateExperienceHtml(data.experience),
      skills: generateSkillsHtml(data.skills),
      projects: generateProjectsHtml(data.projects),
      links: generateLinksHtml(data.links)
    };

    // --- 3. Batch update the DOM ---
    for (const key in elements) {
      if (elements[key] && htmlContents[key]) {
        elements[key].innerHTML = htmlContents[key];
      }
    }

    // --- Metadatos (pueden seguir actualizándose directamente, es menos crítico) ---
    updateMetadata(data.person);
  }

  /**
   * Actualiza los metadatos de la página (título y JSON-LD).
   * @param {object} person - Datos de la persona.
   */
  function updateMetadata(person) {
    if (!person) return;
    document.title = `${person.name} — CV`;
    const metaDesc = `Currículum de ${person.name} (${person.alternateName}): experiencia, educación y enlaces.`;
    document.querySelector('meta[name="description"]')?.setAttribute('content', metaDesc);
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', `${person.name} — CV`);
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', metaDesc);

    const schemaEl = document.querySelector('script[type="application/ld+json"]');
    if (schemaEl) {
      try {
        const schema = JSON.parse(schemaEl.textContent);
        schema.name = person.name;
        schema.alternateName = person.alternateName;
        schema.jobTitle = person.jobTitle;
        schema.url = person.url;
        schema.sameAs = person.sameAs;
        schemaEl.textContent = JSON.stringify(schema, null, 2);
      } catch (e) {
        console.error("Error al actualizar el schema JSON-LD:", e);
      }
    }
  }

  /**
   * Genera el HTML para la sección "About".
   * @param {object} about - Datos de la sección.
   * @param {object} person - Datos de la persona.
   * @returns {string} El HTML generado.
   */
  function generateAboutHtml(about, person) {
    if (!about || !person) return '';
    return `
      <div class="line"><span class="hdr"># ${about.title}</span></div>
      <div class="line"><span class="id">${person.alternateName}</span> <span class="k">=</span> <span class="v">{</span></div>
      <div class="indent">
        <div class="line"><span class="k">rol</span>: <span class="v">[${about.rol.map(r => `"${r}"`).join(', ')}]</span>,</div>
        <div class="line"><span class="k">intereses</span>: <span class="v">[${about.interests.map(i => `"${i}"`).join(', ')}]</span>,</div>
        <div class="line"><span class="k">ubicación</span>: <span class="v">"${about.location}"</span>,</div>
        <div class="line"><span class="k">email</span>: <a href="mailto:${about.email}?subject=Contacto%20desde%20CV">${about.email}</a></div>
      </div>
      <div class="line"><span class="v">}</span></div>
    `;
  }

  /**
   * Genera el HTML para la sección "Education".
   * @param {object} education - Datos de la sección.
   * @returns {string} El HTML generado.
   */
  function generateEducationHtml(education) {
    if (!education) return '';
    const itemsHtml = education.items.map(item => `
      <li>
        <strong>${item.degree}</strong> — ${item.institution}
        ${item.status ? ` <span class="badge">${item.status}</span>` : ''}
      </li>
    `).join('');
    return `<h2 id="h-edu"># ${education.title}</h2><ul>${itemsHtml}</ul>`;
  }

  /**
   * Genera el HTML para la sección "Experience".
   * @param {object} experience - Datos de la sección.
   * @returns {string} El HTML generado.
   */
  function generateExperienceHtml(experience) {
    if (!experience) return '';
    const itemsHtml = experience.items.map(item => `
        <li id="${item.id}">
            <strong>${item.rol}</strong> — ${item.institution}<br/>
            <ul>
                ${item.tasks.map(task => `<li>${task.name}${task.year ? ` <span class="badge">${task.year}</span>` : ''}</li>`).join('')}
            </ul>
        </li>
    `).join('');
    return `<h2 id="h-exp"># ${experience.title}</h2><ul>${itemsHtml}</ul>`;
  }

  /**
   * Genera el HTML para la sección "Skills".
   * @param {object} skills - Datos de la sección.
   * @returns {string} El HTML generado.
   */
  function generateSkillsHtml(skills) {
    if (!skills) return '';
    const columnsHtml = skills.columns.map(column => `
      <ul>
        ${column.map(skill => `<li>${skill}</li>`).join('')}
      </ul>
    `).join('');
    return `<h2 id="h-skills"># ${skills.title}</h2><div class="grid">${columnsHtml}</div>`;
  }

  /**
   * Genera el HTML para la sección "Projects".
   * @param {object} projects - Datos de la sección.
   * @returns {string} El HTML generado.
   */
  function generateProjectsHtml(projects) {
    if (!projects) return '';
    const itemsHtml = projects.items.map(item => `<li><a href="${item.url}" target="_blank" rel="noopener">${item.name}</a></li>`).join('');
    return `<h2 id="h-proj"># ${projects.title}</h2><ul>${itemsHtml}</ul>`;
  }

  /**
   * Genera el HTML para la sección "Links".
   * @param {object} links - Datos de la sección.
   * @returns {string} El HTML generado.
   */
  function generateLinksHtml(links) {
    if (!links) return '';
    const itemsHtml = links.items.map(link => `
      <li><a href="${link.url}" target="_blank" rel="noopener">${link.name}</a></li>
    `).join('');
    return `<h2 id="h-links"># ${links.title}</h2><ul>${itemsHtml}</ul>`;
  }

  // --- INICIAR LA CARGA DE DATOS ---
  loadCvData();

})();
