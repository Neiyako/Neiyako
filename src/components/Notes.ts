import { interests } from '../content/site';

export function renderNotes(): string {
  return `
    <section class="section notes-section" id="notes" aria-labelledby="notes-title">
      <div class="notes-layout">
        <header class="notes-heading">
          <div class="section-index">
            <span>05</span>
            <span>CURRENT INTERESTS</span>
          </div>
          <p class="notes-aside">A working set of questions.<br />Not a proficiency list.</p>
        </header>

        <div class="notes-content">
          <h2 id="notes-title">What keeps the notebook open.</h2>
          <ol class="interests-list">
            ${interests
              .map(
                (interest, index) => `
                  <li>
                    <span class="interest-number">${String(index + 1).padStart(2, '0')}</span>
                    <span>${interest}</span>
                  </li>
                `,
              )
              .join('')}
          </ol>
        </div>
      </div>
    </section>
  `;
}
