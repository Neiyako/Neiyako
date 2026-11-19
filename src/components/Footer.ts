import { contactLinks } from '../content/site';

export function renderFooter(): string {
  return `
    <footer class="site-footer" aria-labelledby="footer-title">
      <div class="footer-top">
        <div class="footer-copy">
          <p class="eyebrow eyebrow--light">CLOSING NOTE / 2026</p>
          <h2 class="footer-statement" id="footer-title">
            <span>Build.</span>
            <span>Experiment.</span>
            <span>Verify.</span>
            <span>Improve.</span>
          </h2>
          <p class="footer-description">
            Practical systems, honest scope, and results that can be checked again.
          </p>
        </div>

        <div class="scene-frame scene-frame--structure" data-scene-frame="structure">
          <div class="scene-fallback structure-fallback" aria-hidden="true">
            <span class="structure-axis structure-axis--x"></span>
            <span class="structure-axis structure-axis--y"></span>
            <span class="structure-link structure-link--a"></span>
            <span class="structure-link structure-link--b"></span>
            <span class="structure-link structure-link--c"></span>
            <span class="structure-link structure-link--d"></span>
            <span class="structure-link structure-link--e"></span>
            <span class="structure-node structure-node--a"></span>
            <span class="structure-node structure-node--b"></span>
            <span class="structure-node structure-node--c"></span>
            <span class="structure-node structure-node--d"></span>
            <span class="structure-node structure-node--e"></span>
            <span class="structure-node structure-node--f"></span>
            <span class="structure-label structure-label--a">BASE / 01</span>
            <span class="structure-label structure-label--b">ASSEMBLE / 02</span>
            <span class="structure-label structure-label--c">CONNECT / 03</span>
          </div>
          <canvas class="scene-canvas" data-scene="structure" aria-hidden="true"></canvas>
        </div>
      </div>

      <div class="footer-bottom">
        <p class="footer-imprint">NEIYAKO · ENGINEERING NOTEBOOK · 2026</p>
        <nav class="footer-links" aria-label="Footer links">
          <a href="${contactLinks.github}" target="_blank" rel="noopener noreferrer">GitHub <span aria-hidden="true">↗</span></a>
          <a href="${contactLinks.contact}" target="_blank" rel="noopener noreferrer">Contact <span aria-hidden="true">↗</span></a>
          <a href="#top">Back to top <span aria-hidden="true">↑</span></a>
        </nav>
      </div>
    </footer>
  `;
}
