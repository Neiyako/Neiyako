import './styles/tokens.css';
import './styles/global.css';
import './styles/layout.css';
import './styles/components.css';
import './styles/animations.css';

import { renderFlowBand } from './components/FlowBand';
import { renderFooter } from './components/Footer';
import { renderHeader } from './components/Header';
import { renderHero } from './components/Hero';
import { renderNotes } from './components/Notes';
import { renderPractice } from './components/Practice';
import { renderPrinciples } from './components/Principles';
import { renderWorks } from './components/Works';
import { mountScenes } from './scenes';

const app = document.querySelector<HTMLElement>('#app');

if (!app) {
  throw new Error('Missing #app mount point.');
}

app.innerHTML = `
  <a class="skip-link" href="#main-content">Skip to content</a>
  ${renderHeader()}
  <main id="main-content">
    ${renderHero()}
    ${renderWorks()}
    ${renderFlowBand()}
    ${renderPractice()}
    ${renderPrinciples()}
    ${renderNotes()}
  </main>
  ${renderFooter()}
`;

function setupNavigation(): () => void {
  const header = document.querySelector<HTMLElement>('[data-site-header]');
  const toggle = document.querySelector<HTMLButtonElement>('[data-menu-toggle]');
  const nav = document.querySelector<HTMLElement>('[data-site-nav]');
  const label = document.querySelector<HTMLElement>('[data-menu-label]');
  const mobileQuery = window.matchMedia('(max-width: 48rem)');

  if (!header || !toggle || !nav || !label) {
    return () => undefined;
  }

  let isOpen = false;

  const setOpen = (nextOpen: boolean, returnFocus = false): void => {
    isOpen = mobileQuery.matches && nextOpen;
    nav.hidden = mobileQuery.matches ? !isOpen : false;
    toggle.setAttribute('aria-expanded', String(isOpen));
    toggle.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
    label.textContent = isOpen ? 'Close' : 'Menu';
    header.classList.toggle('is-nav-open', isOpen);

    if (returnFocus) {
      toggle.focus();
    }
  };

  const syncViewport = (): void => {
    setOpen(false);
  };

  const onToggle = (): void => {
    setOpen(!isOpen);
  };

  const onKeydown = (event: KeyboardEvent): void => {
    if (event.key === 'Escape' && isOpen) {
      event.preventDefault();
      setOpen(false, true);
    }
  };

  const onDocumentPointerDown = (event: PointerEvent): void => {
    if (isOpen && event.target instanceof Node && !header.contains(event.target)) {
      setOpen(false);
    }
  };

  const onNavClick = (event: Event): void => {
    const target = event.target;
    if (target instanceof Element && target.closest('a') && mobileQuery.matches) {
      setOpen(false);
    }
  };

  syncViewport();
  toggle.addEventListener('click', onToggle);
  nav.addEventListener('click', onNavClick);
  document.addEventListener('keydown', onKeydown);
  document.addEventListener('pointerdown', onDocumentPointerDown);
  mobileQuery.addEventListener('change', syncViewport);

  return () => {
    toggle.removeEventListener('click', onToggle);
    nav.removeEventListener('click', onNavClick);
    document.removeEventListener('keydown', onKeydown);
    document.removeEventListener('pointerdown', onDocumentPointerDown);
    mobileQuery.removeEventListener('change', syncViewport);
  };
}

const teardownNavigation = setupNavigation();
const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

let teardownScenes: (() => void) | undefined;
let sceneReloadFrame = 0;

function initializeScenes(): void {
  teardownScenes?.();
  teardownScenes = undefined;

  try {
    teardownScenes = mountScenes({ reducedMotion: reducedMotionQuery.matches });
    delete document.documentElement.dataset.scenes;
  } catch {
    document.documentElement.dataset.scenes = 'fallback';
  }
}

function onMotionPreferenceChange(): void {
  cancelAnimationFrame(sceneReloadFrame);
  sceneReloadFrame = requestAnimationFrame(initializeScenes);
}

initializeScenes();
reducedMotionQuery.addEventListener('change', onMotionPreferenceChange);

window.addEventListener(
  'pagehide',
  () => {
    cancelAnimationFrame(sceneReloadFrame);
    reducedMotionQuery.removeEventListener('change', onMotionPreferenceChange);
    teardownScenes?.();
    teardownNavigation();
  },
  { once: true },
);
