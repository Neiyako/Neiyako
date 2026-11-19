import { projects } from '../content/site';
import { renderProjectVisual } from './visuals';

function renderProject(index: number): string {
  const project = projects[index];
  if (!project) return '';

  const id = `project-${project.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
  const reverseClass = index % 2 === 1 ? ' project--reverse' : '';

  return `
    <article class="project${reverseClass}" aria-labelledby="${id}">
      <div class="project-copy">
        <div class="project-overline">
          <span class="project-number">${project.number}</span>
          <span>${project.classification}</span>
        </div>
        <h3 class="project-title" id="${id}">${project.name}</h3>
        <p class="project-description">${project.description}</p>

        <dl class="project-facts">
          <div class="project-fact">
            <dt>Classification</dt>
            <dd>${project.classification}</dd>
          </div>
          <div class="project-fact">
            <dt>Implemented scope</dt>
            <dd>
              <ul class="evidence-list">
                ${project.evidence.map((item) => `<li>${item}</li>`).join('')}
              </ul>
            </dd>
          </div>
        </dl>

        ${project.scopeNote ? `<p class="scope-note">${project.scopeNote}</p>` : ''}

        <div class="project-links">
          <a
            class="text-link"
            href="${project.repositoryUrl}"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View ${project.repositoryLabel} repository on GitHub (opens in a new tab)"
          >
            Repository <span aria-hidden="true">↗</span>
          </a>
          ${
            project.secondaryUrl
              ? `<a
                  class="text-link text-link--secondary"
                  href="${project.secondaryUrl}"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="View ${project.secondaryLabel} on GitHub (opens in a new tab)"
                >
                  ${project.secondaryLabel} <span aria-hidden="true">↗</span>
                </a>`
              : ''
          }
        </div>
      </div>

      <div class="project-aside">
        ${renderProjectVisual(project)}
      </div>
    </article>
  `;
}

export function renderWorks(): string {
  return `
    <section class="section works-section" id="works" aria-labelledby="works-title">
      <header class="section-heading">
        <div class="section-index">
          <span>02</span>
          <span>SELECTED WORKS</span>
        </div>
        <div class="section-heading__main">
          <h2 id="works-title">Systems built around evidence.</h2>
          <p>
            Four working repositories, described at the level their current implementation supports.
            No projections dressed as completed work.
          </p>
        </div>
      </header>

      <div class="project-list">
        ${projects.map((_, index) => renderProject(index)).join('')}
      </div>
    </section>
  `;
}
