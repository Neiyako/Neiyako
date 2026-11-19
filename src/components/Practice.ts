import { practiceAreas } from '../content/site';

function stateLabel(state: 'applied' | 'developing'): string {
  return state === 'applied' ? 'Applied / project evidence' : 'Developing practice';
}

export function renderPractice(): string {
  return `
    <section class="section practice-section" id="practice" aria-labelledby="practice-title">
      <header class="section-heading section-heading--stacked">
        <div class="section-index">
          <span>03</span>
          <span>AREAS OF PRACTICE</span>
        </div>
        <div class="section-heading__main section-heading__main--wide">
          <h2 id="practice-title">Practice is a record, not a ranking.</h2>
          <p>
            Project evidence is separated from developing interests. Neither label is a claim of expertise.
          </p>
        </div>
      </header>

      <div class="practice-legend" aria-label="Practice label key">
        <div>
          <span class="practice-marker practice-marker--applied" aria-hidden="true"></span>
          <strong>Applied / project evidence</strong>
          <span>Grounded in the repository scope above.</span>
        </div>
        <div>
          <span class="practice-marker practice-marker--developing" aria-hidden="true"></span>
          <strong>Developing practice</strong>
          <span>Active learning direction, without expertise claims.</span>
        </div>
      </div>

      <ol class="practice-list">
        ${practiceAreas
          .map(
            (area) => `
              <li class="practice-row">
                <span class="practice-number">${area.number}</span>
                <h3 class="practice-name">${area.name}</h3>
                <span class="practice-state practice-state--${area.state}">${stateLabel(area.state)}</span>
                <p class="practice-detail">${area.detail}</p>
              </li>
            `,
          )
          .join('')}
      </ol>
    </section>
  `;
}
