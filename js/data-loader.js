/**
 * @file Carga y muestra los datos del CV desde un archivo JSON.
 */

(function() {
  'use strict';

  /**
   * Carga los datos del CV desde un archivo JSON y los muestra en la página.
   * @param {string} url - La ruta al archivo JSON de datos.
   */
  async function loadCvData(url = 'cv-data.json') {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Error al cargar el archivo: ${response.statusText}`);
      }
      const data = await response.json();
      populateCv(data);
    } catch (error) {
      console.error('No se pudieron cargar los datos del CV:', error);
      // Opcional: Mostrar un mensaje de error en la UI.
      const desk = document.getElementById('desk');
      if(desk) {
        desk.innerHTML = '<div class="terminal"><div class="screen" style="padding: 1em;"><h1>Error</h1><p>No se pudieron cargar los datos del CV. Revisa la consola para más detalles.</p></div></div>';
      }
    }
  }

  /**
   * Rellena el HTML con los datos del CV.
   * @param {object} data - El objeto con todos los datos del CV.
   */
  function populateCv(data) {
    if (!data) return;

    // --- Schema.org y metadatos ---
    updateMetadata(data.person);

    // --- Sección: About ---
    populateAbout(data.about, data.person);

    // --- Sección: Education ---
    populateEducation(data.education);

    // --- Sección: Experience ---
    populateExperience(data.experience);

    // --- Sección: Skills ---
    populateSkills(data.skills);

    // --- Sección: Projects ---
    populateProjects(data.projects);

    // --- Sección: Links ---
    populateLinks(data.links);
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
   * Rellena la sección "About".
   * @param {object} about - Datos de la sección.
   * @param {object} person - Datos de la persona.
   */
  function populateAbout(about, person) {
    if (!about || !person) return;
    const aboutCard = document.querySelector('#about .card');
    if (aboutCard) {
      aboutCard.innerHTML = `
        <h2 class="hdr"># ${about.title}</h2>
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
  }

  /**
   * Rellena la sección "Education".
   * @param {object} education - Datos de la sección.
   */
  function populateEducation(education) {
    if (!education) return;
    const eduCard = document.querySelector('#education .card');
    if (eduCard) {
      const itemsHtml = education.items.map(item => `
        <li>
          <strong>${item.degree}</strong> — ${item.institution}
          ${item.status ? ` <span class="badge">${item.status}</span>` : ''}
        </li>
      `).join('');
      eduCard.innerHTML = `<h2 id="h-edu"># ${education.title}</h2><ul>${itemsHtml}</ul>`;
    }
  }

  /**
   * Rellena la sección "Experience".
   * @param {object} experience - Datos de la sección.
   */
  function populateExperience(experience) {
    if (!experience) return;
    const expCard = document.querySelector('#experience .card');
    if (expCard) {
        const itemsHtml = experience.items.map(item => `
            <li id="${item.id}">
                <strong>${item.rol}</strong> — ${item.institution}<br/>
                <ul>
                    ${item.tasks.map(task => `<li>${task}</li>`).join('')}
                </ul>
            </li>
        `).join('');
        expCard.innerHTML = `<h2 id="h-exp"># ${experience.title}</h2><ul>${itemsHtml}</ul>`;
    }
  }

  /**
   * Rellena la sección "Skills".
   * @param {object} skills - Datos de la sección.
   */
  function populateSkills(skills) {
    if (!skills) return;
    const skillsCard = document.querySelector('#skills .card');
    if (skillsCard) {
      const columnsHtml = skills.columns.map(column => `
        <ul>
          ${column.map(skill => `<li>${skill}</li>`).join('')}
        </ul>
      `).join('');
      skillsCard.innerHTML = `<h2 id="h-skills"># ${skills.title}</h2><div class="grid">${columnsHtml}</div>`;
    }
  }

  /**
   * Rellena la sección "Projects".
   * @param {object} projects - Datos de la sección.
   */
  function populateProjects(projects) {
    if (!projects) return;
    const projCard = document.querySelector('#projects .card');
    if (projCard) {
      const itemsHtml = projects.items.map(item => `<li><span class="c">${item}</span></li>`).join('');
      projCard.innerHTML = `<h2 id="h-proj"># ${projects.title}</h2><ul>${itemsHtml}</ul>`;
    }
  }

  /**
   * Rellena la sección "Links".
   * @param {object} links - Datos de la sección.
   */
  function populateLinks(links) {
    if (!links) return;
    const linksCard = document.querySelector('#links .card');
    if (linksCard) {
      const itemsHtml = links.items.map(link => `
        <li><a href="${link.url}" target="_blank" rel="noopener">${link.name}</a></li>
      `).join('');
      linksCard.innerHTML = `<h2 id="h-links"># ${links.title}</h2><ul>${itemsHtml}</ul>`;
    }
  }

  // --- INICIAR LA CARGA DE DATOS ---
  // Llama a la función principal al cargar el script.
  loadCvData();

})();
