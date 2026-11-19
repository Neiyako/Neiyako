export function renderHero(): string {
  return `
    <section class="hero" id="top" aria-labelledby="hero-title">
        <div class="hero-edition" aria-label="Edition information">
          <span>PORTFOLIO / ISSUE 01</span>
          <span>ENGINEERING NOTEBOOK / 2026</span>
        </div>

        <div class="hero-grid">
          <div class="hero-copy">
            <p class="eyebrow">INDEPENDENT ENGINEER / OPEN SOURCE DEVELOPER</p>
            <h1 id="hero-title" class="hero-title">
              <span>Engineering</span>
              <span class="hero-title__indent">ideas into</span>
              <span>reality.</span>
            </h1>
          </div>

          <div class="hero-support">
            <p class="hero-lede">
              I build practical systems at the intersection of automation, artificial intelligence, and scientific computing.
            </p>
            <div class="hero-links" aria-label="Profile links">
              <a class="inline-link" href="https://github.com/Neiyako" target="_blank" rel="noopener noreferrer">
                GitHub <span aria-hidden="true">↗</span>
              </a>
              <a class="inline-link" href="https://github.com/Neiyako?tab=repositories" target="_blank" rel="noopener noreferrer">
                Repositories <span aria-hidden="true">↗</span>
              </a>
              <a class="inline-link" href="https://github.com/Neiyako" target="_blank" rel="noopener noreferrer">
                Contact <span aria-hidden="true">↗</span>
              </a>
            </div>
          </div>
        </div>

        <figure class="hero-figure" aria-labelledby="hero-figure-caption">
          <div class="scene-frame scene-frame--hero" data-scene-frame="kinetic">
            <div class="scene-fallback kinetic-fallback" aria-hidden="true">
              <span class="kinetic-registration kinetic-registration--tl"></span>
              <span class="kinetic-registration kinetic-registration--tr"></span>
              <span class="kinetic-registration kinetic-registration--bl"></span>
              <span class="kinetic-registration kinetic-registration--br"></span>
              <span class="kinetic-axis kinetic-axis--x"></span>
              <span class="kinetic-axis kinetic-axis--y"></span>
              <span class="kinetic-orbit kinetic-orbit--outer"></span>
              <span class="kinetic-orbit kinetic-orbit--inner"></span>
              <span class="kinetic-link kinetic-link--a"></span>
              <span class="kinetic-link kinetic-link--b"></span>
              <span class="kinetic-link kinetic-link--c"></span>
              <span class="kinetic-link kinetic-link--d"></span>
              <span class="kinetic-node kinetic-node--a"></span>
              <span class="kinetic-node kinetic-node--b"></span>
              <span class="kinetic-node kinetic-node--c"></span>
              <span class="kinetic-node kinetic-node--d"></span>
              <span class="kinetic-node kinetic-node--e"></span>
              <span class="kinetic-block kinetic-block--a"></span>
              <span class="kinetic-block kinetic-block--b"></span>
              <span class="kinetic-block kinetic-block--c"></span>
              <span class="kinetic-block kinetic-block--d"></span>
              <span class="kinetic-core">
                <span class="kinetic-core__ring"></span>
                <span class="kinetic-core__point"></span>
              </span>
              <span class="fallback-coordinate fallback-coordinate--a">MODULE / 01</span>
              <span class="fallback-coordinate fallback-coordinate--b">LINK / SIGNAL</span>
              <span class="fallback-coordinate fallback-coordinate--c">EMERGENT STRUCTURE</span>
              <span class="fallback-coordinate fallback-coordinate--d">X / GRID</span>
            </div>
            <canvas class="scene-canvas" data-scene="kinetic" aria-hidden="true"></canvas>
            <span class="scene-corner-note" aria-hidden="true">STATIC FALLBACK / LIVE GEOMETRY</span>
          </div>
          <figcaption class="figure-caption" id="hero-figure-caption">
            <span>FIG. 01</span>
            <span>Kinetic geometry — modules, links, controlled motion.</span>
          </figcaption>
        </figure>
    </section>
  `;
}
