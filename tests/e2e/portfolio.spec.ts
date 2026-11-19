import { expect, test, type Page } from '@playwright/test';

const VIEWPORTS = [
  { label: '1440x900', width: 1440, height: 900 },
  { label: '1280x800', width: 1280, height: 800 },
  { label: '768x1024', width: 768, height: 1024 },
  { label: '390x844', width: 390, height: 844 },
  { label: '375x667', width: 375, height: 667 },
] as const;

const PROJECT_NAMES = ['ResearchDataHub', 'HydroWeave', 'HydroWeave-DBAS', 'MCMtools'] as const;
const SETTLED_SCENE_STATES = new Set(['ready', 'fallback']);

interface RuntimeIssues {
  consoleErrors: string[];
  pageErrors: string[];
}

function isExpectedFallbackError(message: string): boolean {
  return (
    /(?:webgpu|webgl).*(?:not supported|unsupported|unavailable|falling back|fallback)/i.test(message) ||
    /(?:falling back|fallback).*(?:webgpu|webgl)/i.test(message)
  );
}

function watchRuntimeIssues(page: Page): RuntimeIssues {
  const issues: RuntimeIssues = {
    consoleErrors: [],
    pageErrors: [],
  };

  page.on('console', (message) => {
    if (message.type() !== 'error') {
      return;
    }

    const text = message.text();
    if (!isExpectedFallbackError(text)) {
      issues.consoleErrors.push(text);
    }
  });

  page.on('pageerror', (error) => {
    issues.pageErrors.push(error.message);
  });

  return issues;
}

async function waitForSettledScenes(page: Page): Promise<string[]> {
  const scenes = page.locator('[data-scene-state]');

  await expect
    .poll(async () => scenes.count(), {
      message: 'Expected at least one scene container with data-scene-state.',
      timeout: 20_000,
    })
    .toBeGreaterThan(0);

  await expect
    .poll(
      async () =>
        scenes.evaluateAll((nodes, settledStates) => {
          const allowed = new Set(settledStates);
          return nodes.every((node) => allowed.has(node.getAttribute('data-scene-state') ?? ''));
        }, [...SETTLED_SCENE_STATES]),
      {
        message: 'Scene initialization must settle to ready or fallback.',
        timeout: 20_000,
      },
    )
    .toBe(true);

  return scenes.evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-scene-state') ?? 'missing'));
}

async function ensurePrimaryNavigationVisible(page: Page) {
  const navigation = page.locator('nav[data-site-nav], nav').first();

  if (!(await navigation.isVisible())) {
    const menuToggle = page.locator('[data-menu-toggle], button[aria-controls="primary-nav"]').first();
    await expect(menuToggle).toBeVisible();
    await menuToggle.click();
  }

  await expect(navigation).toBeVisible();
}

async function horizontalOverflow(page: Page) {
  return page.evaluate(() => {
    const viewportWidth = document.documentElement.clientWidth;
    const scrollWidth = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth);

    if (scrollWidth <= viewportWidth + 1) {
      return null;
    }

    const offenders = [...document.querySelectorAll<HTMLElement>('body *')]
      .map((element) => ({
        element,
        rect: element.getBoundingClientRect(),
      }))
      .filter(({ rect }) => rect.width > 0 && rect.height > 0 && (rect.right > viewportWidth + 1 || rect.left < -1))
      .slice(0, 8)
      .map(({ element, rect }) => ({
        node: `${element.tagName.toLowerCase()}${element.id ? `#${element.id}` : ''}${
          element.classList.length > 0 ? `.${[...element.classList].join('.')}` : ''
        }`,
        left: Math.round(rect.left),
        right: Math.round(rect.right),
      }));

    return {
      viewportWidth,
      scrollWidth,
      offenders,
    };
  });
}

test.describe('responsive integrity', () => {
  for (const viewport of VIEWPORTS) {
    test(`${viewport.label} keeps the editorial layout legible`, async ({ page }) => {
      const issues = watchRuntimeIssues(page);

      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      const response = await page.goto('/', { waitUntil: 'domcontentloaded' });

      expect(response?.ok(), 'The local Vite server should return the document successfully.').toBe(true);
      await expect(page.locator('h1')).toHaveCount(1);
      await expect(page.locator('h1')).toBeVisible();
      await ensurePrimaryNavigationVisible(page);

      const main = page.locator('main');
      await expect(main).toBeVisible();

      for (const projectName of PROJECT_NAMES) {
        await expect(main.getByRole('heading', { name: new RegExp(projectName, 'i') }).first()).toBeVisible();
      }

      await waitForSettledScenes(page);
      expect(await horizontalOverflow(page)).toBeNull();
      expect(issues.consoleErrors, 'Unexpected browser console errors.').toEqual([]);
      expect(issues.pageErrors, 'Uncaught page errors.').toEqual([]);
    });
  }
});

test.describe('accessibility behavior', () => {
  test('primary navigation links are reachable and operable by keyboard', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const navigation = page.locator('nav').first();
    await expect(navigation).toBeVisible();

    const navLinks = navigation.locator('a[href]');
    const navLinkCount = await navLinks.count();
    expect(navLinkCount).toBeGreaterThan(0);

    for (let index = 0; index < navLinkCount; index += 1) {
      const link = navLinks.nth(index);
      await expect(link).toBeVisible();
      expect(await link.getAttribute('tabindex')).not.toBe('-1');
    }

    let focusedInternalHref: string | null = null;

    for (let attempt = 0; attempt < 80; attempt += 1) {
      await page.keyboard.press('Tab');
      const focusedHref = await page.evaluate(() => {
        const active = document.activeElement;
        if (!(active instanceof HTMLAnchorElement) || !active.closest('nav')) {
          return null;
        }
        return active.getAttribute('href');
      });

      if (focusedHref?.startsWith('#') && focusedHref.length > 1) {
        focusedInternalHref = focusedHref;
        break;
      }
    }

    expect(focusedInternalHref, 'A primary navigation link should be reachable with Tab.').not.toBeNull();
    if (!focusedInternalHref) {
      return;
    }

    const targetId = decodeURIComponent(focusedInternalHref.slice(1));
    expect(await page.evaluate((id) => document.getElementById(id) !== null, targetId)).toBe(true);

    await page.keyboard.press('Enter');
    await expect.poll(() => page.evaluate(() => window.location.hash)).toBe(focusedInternalHref);
  });

  test.use({ viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce' });

  test('reduced motion settles scenes without runtime failures', async ({ page }) => {
    const issues = watchRuntimeIssues(page);
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    expect(await page.evaluate(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)).toBe(true);

    const sceneStates = await waitForSettledScenes(page);
    expect(sceneStates.length).toBeGreaterThan(0);
    expect(sceneStates.every((state) => SETTLED_SCENE_STATES.has(state))).toBe(true);
    expect(issues.consoleErrors, 'Unexpected console errors in reduced-motion mode.').toEqual([]);
    expect(issues.pageErrors, 'Uncaught page errors in reduced-motion mode.').toEqual([]);
  });
});
