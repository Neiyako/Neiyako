import { principles } from '../content/site';

export function renderPrinciples(): string {
  return `
    <section class="section principles-section" id="principles" aria-labelledby="principles-title">
      <header class="section-heading section-heading--stacked">
        <div class="section-index">
          <span>04</span>
          <span>ENGINEERING PRINCIPLES</span>
        </div>
        <div class="section-heading__main section-heading__main--wide">
          <h2 id="principles-title">The rules before the tools.</h2>
        </div>
      </header>

      <ol class="principles-list">
        ${principles
          .map(
            (principle) => `
              <li class="principle">
                <span class="principle-number">${principle.number}</span>
                <div class="principle-copy">
                  <h3>${principle.name}</h3>
                  <p>${principle.statement}</p>
                </div>
              </li>
            `,
          )
          .join('')}
      </ol>
    </section>
  `;
}
