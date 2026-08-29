#!/usr/bin/env node
/**
 * Writes sitemap.xml and robots.txt into the build output, and refuses to write a sitemap
 * that disagrees with either the build or the content.
 *
 * The site is prerendered, so every route exists as a real file: `wiki/database/index.html`
 * and so on. The sitemap is therefore derived from the build output rather than from a list
 * kept alongside it — a page that was built is in the sitemap by construction, and a URL in
 * the sitemap has a file behind it by construction.
 *
 * That is a reaction to how this went wrong. The previous version scanned four content files
 * named by hand; a fifth was added later and never added here, so three pages were never
 * submitted to a search engine at all. Deriving from the output fixes that direction, and the
 * cross-check below fixes the other one: the slugs declared in the content are compared
 * against the files that were built, and any difference fails the build rather than shipping
 * a sitemap that is quietly short.
 *
 * Run after the production build, with the public origin as the first argument:
 *
 *   node tools/seo.mjs https://quiblo-iptv.github.io/quiblo-wiki
 */

import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';
import { execSync } from 'node:child_process';

const OUT = 'dist/quiblo-wiki/browser';
const origin = (process.argv[2] ?? 'http://localhost:4321').replace(/\/$/, '');

if (!existsSync(OUT)) {
  console.error(`No build at ${OUT}. Run the production build first.`);
  process.exit(1);
}

const today = new Date().toISOString().slice(0, 10);
const routeDates = mapDeclaredRoutesWithDates();

const built = prerenderedPaths(OUT);
const declared = [...routeDates.keys()].sort();

const missing = declared.filter((path) => !built.includes(path));
const extra = built.filter((path) => !declared.includes(path));

if (missing.length || extra.length) {
  console.error('The build and the content disagree about which pages exist.');
  for (const path of missing) console.error(`  declared but not built: ${path}`);
  for (const path of extra) console.error(`  built but not declared:  ${path}`);
  process.exit(1);
}

// A trailing slash on every path but the root, because that is the URL the file is actually
// at: a static host answers the slashless form with a redirect to it. Submitting the redirect
// costs every page in the site a hop and reports as "page with redirect" rather than indexed.
const urls = built.map((path) => ({
  loc: path === '/' ? `${origin}/` : `${origin}${path}/`,
  lastmod: routeDates.get(path) ?? today,
  priority: priorityFor(path),
}));

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) =>
      `  <url>\n    <loc>${url.loc}</loc>\n    <lastmod>${url.lastmod}</lastmod>\n    <priority>${url.priority}</priority>\n  </url>`,
  )
  .join('\n')}
</urlset>
`;

const robots = `User-agent: *
Allow: /

Sitemap: ${origin}/sitemap.xml
`;

writeFileSync(join(OUT, 'sitemap.xml'), sitemap);
writeFileSync(join(OUT, 'robots.txt'), robots);
console.log(`  sitemap.xml — ${urls.length} URLs at ${origin}`);
console.log('  robots.txt');

/** Every prerendered page, as a route path: `/`, `/api`, `/wiki/database`. */
function prerenderedPaths(root) {
  const found = [];

  const walk = (directory) => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) {
        walk(path);
      } else if (entry.name === 'index.html') {
        const route = '/' + relative(root, directory).split('\\').join('/');
        found.push(route === '/.' ? '/' : route);
      }
    }
  };

  walk(root);
  return found.sort();
}

/**
 * Every page the content declares, mapped to its source file's last modified Git date (YYYY-MM-DD).
 *
 * Inspects Git commit timestamps for each source file so that search engines can prioritize
 * crawling recently updated articles over unchanged ones.
 */
function mapDeclaredRoutesWithDates() {
  const fileDates = new Map();
  const getGitDate = (filePath) => {
    if (fileDates.has(filePath)) return fileDates.get(filePath);
    try {
      const out = execSync(`git log -1 --format=%cs -- "${filePath}"`, {
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'ignore'],
      }).trim();
      if (/^\d{4}-\d{2}-\d{2}$/.test(out)) {
        fileDates.set(filePath, out);
        return out;
      }
    } catch {}
    fileDates.set(filePath, today);
    return today;
  };

  const dates = new Map();
  dates.set('/', getGitDate('src/app/pages/home.ts'));
  dates.set('/api', getGitDate('src/app/api/content/index.ts'));

  for (const name of readdirSync('src/app/content')) {
    if (name.endsWith('.ts') && !name.endsWith('.spec.ts')) {
      const fullPath = join('src/app/content', name);
      const source = readFileSync(fullPath, 'utf8');
      const date = getGitDate(fullPath);
      for (const match of source.matchAll(/slug:\s*'([a-z0-9-]+)'/g)) {
        dates.set(`/wiki/${match[1]}`, date);
      }
    }
  }

  for (const name of readdirSync('src/app/api/content')) {
    if (name.endsWith('.ts') && !name.endsWith('.spec.ts')) {
      const fullPath = join('src/app/api/content', name);
      const source = readFileSync(fullPath, 'utf8');
      const date = getGitDate(fullPath);
      for (const match of source.matchAll(/^\s{4}id:\s*'([a-z0-9-]+)'/gm)) {
        dates.set(`/api/${match[1]}`, date);
      }
    }
  }

  return dates;
}

function priorityFor(path) {
  if (path === '/') return '1.0';
  if (path === '/api') return '0.8';
  return path.startsWith('/api/') ? '0.5' : '0.7';
}
