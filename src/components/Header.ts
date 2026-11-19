export function renderHeader(): string {
  return `
    <header class="site-header" data-site-header>
      <a class="wordmark" href="#top" aria-label="NEIYAKO — back to top">
        NEIYAKO<span aria-hidden="true">.</span>
      </a>

      <p class="header-role">
        <span>INDEPENDENT ENGINEER</span>
        <span>OPEN SOURCE DEVELOPER</span>
      </p>

      <button
        class="menu-toggle"
        type="button"
        aria-expanded="false"
        aria-controls="primary-nav"
        aria-label="Open navigation"
        data-menu-toggle
      >
        <span data-menu-label>Menu</span>
        <span class="menu-toggle__mark" aria-hidden="true"></span>
      </button>

      <nav class="site-nav" id="primary-nav" aria-label="Primary navigation" data-site-nav>
        <ul class="nav-list">
          <li><a href="#works">Works</a></li>
          <li><a href="#practice">Practice</a></li>
          <li><a href="#principles">Principles</a></li>
          <li><a href="#notes">Notes</a></li>
        </ul>
        <a class="nav-github" href="https://github.com/Neiyako" target="_blank" rel="noopener noreferrer">
          GitHub <span aria-hidden="true">↗</span>
        </a>
      </nav>
    </header>
  `;
}
