#!/usr/bin/env node

import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const README_PATH = path.join(ROOT, 'README.md');
const SOURCE_ROOTS = ['src', 'public'];
const SOURCE_EXTENSIONS = new Set(['.css', '.html', '.js', '.jsx', '.json', '.mjs', '.svg', '.ts', '.tsx']);
const PENDING_PAGES_URL = 'https://neiyako.github.io/Neiyako/';
const NON_LINK_NAMESPACE_URLS = new Set([
  'http://www.w3.org/1999/xhtml',
  'http://www.w3.org/1999/xlink',
  'http://www.w3.org/2000/svg',
]);
const REQUEST_TIMEOUT_MS = Number(process.env.LINK_TIMEOUT_MS ?? 15_000);

const markdownLinkPattern = /!?\[[^\]]*\]\(\s*(?:<([^>\n]+)>|([^)\s]+))(?:\s+["'][^"']*["'])?\s*\)/g;
const markdownReferencePattern = /^\s*\[[^\]]+\]:\s*<?(https?:\/\/[^\s>]+)>?/gm;
const htmlHrefPattern = /\bhref\s*=\s*["'](https?:\/\/[^"']+)["']/gi;
const rawUrlPattern = /https?:\/\/[^\s<>"'`]+/gi;

function stripMarkdownCode(content) {
  return content
    .replace(/```[\s\S]*?```/g, '')
    .replace(/~~~[\s\S]*?~~~/g, '')
    .replace(/`[^`\n]*`/g, '');
}

function normalizeHttpUrl(candidate) {
  let value = candidate.trim();
  value = value.replace(/[.,;:!?]+$/g, '');

  while (value.endsWith(')') && !value.includes('(')) {
    value = value.slice(0, -1);
  }

  if (!/^https?:\/\//i.test(value)) {
    return null;
  }

  try {
    const url = new URL(value);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return null;
    }
    url.hash = '';
    return url.toString();
  } catch {
    return null;
  }
}

function collectMatches(content, pattern, preferredGroup = 1) {
  const matches = [];
  for (const match of content.matchAll(pattern)) {
    const value = match[preferredGroup] ?? match[2] ?? match[1];
    if (value) {
      matches.push(value);
    }
  }
  return matches;
}

async function walk(directory) {
  let entries;
  try {
    entries = await readdir(directory, { withFileTypes: true });
  } catch (error) {
    if (error?.code === 'ENOENT') {
      return [];
    }
    throw error;
  }

  const files = [];
  for (const entry of entries) {
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== 'dist' && entry.name !== '.git') {
        files.push(...(await walk(absolutePath)));
      }
      continue;
    }

    if (entry.isFile() && SOURCE_EXTENSIONS.has(path.extname(entry.name))) {
      files.push(absolutePath);
    }
  }
  return files;
}

async function collectTargetFiles() {
  const files = [README_PATH, path.join(ROOT, 'index.html')];

  for (const sourceRoot of SOURCE_ROOTS) {
    files.push(...(await walk(path.join(ROOT, sourceRoot))));
  }

  return [...new Set(files)].sort();
}

function extractLinks(filePath, content) {
  const isMarkdown = filePath.endsWith('.md');
  const searchableContent = isMarkdown ? stripMarkdownCode(content) : content;
  const links = [];

  if (isMarkdown) {
    links.push(...collectMatches(searchableContent, markdownLinkPattern));
    links.push(...collectMatches(searchableContent, markdownReferencePattern));
  }

  links.push(...collectMatches(searchableContent, htmlHrefPattern));
  links.push(...collectMatches(searchableContent, rawUrlPattern, 0));
  return links;
}

async function requestStatus(url, method) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method,
      redirect: 'follow',
      headers: {
        accept: 'text/html,application/xhtml+xml,application/json;q=0.8,*/*;q=0.5',
        'user-agent': 'NEIYAKO-link-validator/1.0',
      },
      signal: controller.signal,
    });

    if (response.body) {
      await response.body.cancel().catch(() => undefined);
    }

    return {
      status: response.status,
      ok: response.ok,
      finalUrl: response.url || url,
    };
  } finally {
    clearTimeout(timeout);
  }
}

function githubApiFallback(url) {
  try {
    const parsed = new URL(url);
    if (parsed.hostname !== 'github.com' && parsed.hostname !== 'www.github.com') {
      return null;
    }

    const segments = parsed.pathname.split('/').filter(Boolean);
    if (segments.length === 1) {
      return `https://api.github.com/users/${encodeURIComponent(segments[0])}`;
    }
    if (segments.length === 2) {
      return `https://api.github.com/repos/${encodeURIComponent(segments[0])}/${encodeURIComponent(segments[1])}`;
    }
  } catch {
    return null;
  }

  return null;
}

async function checkUrl(url) {
  let headError;
  let getError;

  try {
    const head = await requestStatus(url, 'HEAD');
    if (head.ok) {
      return { ...head, method: 'HEAD' };
    }
  } catch (error) {
    headError = error;
  }

  try {
    const get = await requestStatus(url, 'GET');
    if (get.ok) {
      return { ...get, method: 'GET' };
    }

    // A real HTTP error from GitHub is conclusive; do not mask a 404 with the API.
    return { ...get, method: 'GET' };
  } catch (error) {
    getError = error;
  }

  // In restricted networks GitHub's HTML host can time out while its API remains
  // reachable. Use the API only for network-level failures, never for a real 404.
  const apiUrl = githubApiFallback(url);
  if (apiUrl) {
    try {
      const api = await requestStatus(apiUrl, 'GET');
      return {
        ...api,
        method: 'GET (GitHub API fallback)',
        headError: headError instanceof Error ? headError.message : undefined,
        htmlError: getError instanceof Error ? getError.message : undefined,
      };
    } catch (apiError) {
      getError = apiError;
    }
  }

  return {
    ok: false,
    status: null,
    method: 'GET',
    error: getError instanceof Error ? getError.message : String(getError),
    headError: headError instanceof Error ? headError.message : undefined,
  };
}

async function main() {
  const files = await collectTargetFiles();
  const links = new Map();

  for (const filePath of files) {
    let content;
    try {
      content = await readFile(filePath, 'utf8');
    } catch (error) {
      if (error?.code === 'ENOENT' && filePath !== README_PATH) {
        continue;
      }
      throw error;
    }

    for (const rawCandidate of extractLinks(filePath, content)) {
      const normalized = normalizeHttpUrl(rawCandidate);
      if (!normalized) {
        continue;
      }

      // This address is intentionally documented as code until Pages is enabled.
      if (normalized === PENDING_PAGES_URL || NON_LINK_NAMESPACE_URLS.has(normalized)) {
        continue;
      }

      if (!links.has(normalized)) {
        links.set(normalized, new Set());
      }
      links.get(normalized).add(path.relative(ROOT, filePath));
    }
  }

  const urls = [...links.keys()].sort();
  console.log(`Checking ${urls.length} external link${urls.length === 1 ? '' : 's'} from README and source content.`);

  const results = await Promise.all(
    urls.map(async (url) => {
      const result = await checkUrl(url);
      return { url, ...result, sources: [...links.get(url)].sort() };
    }),
  );

  let brokenCount = 0;

  for (const result of results) {
    const statusLabel = result.status ?? 'NETWORK ERROR';
    const verdict = result.ok ? 'PASS' : 'FAIL';
    console.log(`  ${verdict}  ${statusLabel} via ${result.method}  ${result.url}`);

    if (!result.ok) {
      brokenCount += 1;
      console.log(`        sources: ${result.sources.join(', ')}`);
      if (result.finalUrl && result.finalUrl !== result.url) {
        console.log(`        final URL: ${result.finalUrl}`);
      }
      if (result.error) {
        console.log(`        error: ${result.error}`);
      }
      if (result.headError && result.headError !== result.error) {
        console.log(`        HEAD error: ${result.headError}`);
      }
    }
  }

  if (brokenCount > 0) {
    console.error(`\n${brokenCount} broken external link${brokenCount === 1 ? '' : 's'} found.`);
    process.exitCode = 1;
    return;
  }

  console.log('\nAll external links passed.');
}

main().catch((error) => {
  console.error(`Link validation failed: ${error instanceof Error ? error.stack ?? error.message : String(error)}`);
  process.exitCode = 1;
});
