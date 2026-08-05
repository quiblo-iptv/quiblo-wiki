#!/usr/bin/env node
/**
 * Writes sitemap.xml and robots.txt into the build output.
 *
 * A single-page app has no files for its routes, so a crawler has nothing to follow except
 * the links it finds by executing the page. A sitemap makes every route discoverable
 * without that, which matters most for the deep ones — a class in the code reference is
 * three links from the home page and would otherwise be crawled last or not at all.
 *
 * Run after the build, with the public origin as the first argument:
 *
 *   node tools/seo.mjs https://quiblo-iptv.github.io/quiblo-wiki
 */

import { writeFileSync, existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const OUT = 'dist/quiblo-wiki/browser';
const origin = (process.argv[2] ?? 'http://localhost:4321').replace(/\/$/, '');

if (!existsSync(OUT)) {
  console.error(`No build at ${OUT}. Run the production build first.`);
  process.exit(1);
}

// Read the routes out of the content itself rather than maintaining a second list — a page
// that exists but is missing from the sitemap is exactly the kind of drift nobody notices.
const wikiSlugs = [
  ...readSlugs('src/app/content/orientation.ts'),
  ...readSlugs('src/app/content/using.ts'),
  ...readSlugs('src/app/content/architecture.ts'),
  ...readSlugs('src/app/content/engineering.ts'),
];
const apiIds = [
  ...readIds('src/app/api/content/core.ts'),
  ...readIds('src/app/api/content/source.ts'),
  ...readIds('src/app/api/content/ui.ts'),
];

const urls = [
  { loc: `${origin}/`, priority: '1.0' },
  { loc: `${origin}/api`, priority: '0.8' },
  ...wikiSlugs.map((slug) => ({ loc: `${origin}/wiki/${slug}`, priority: '0.7' })),
  ...apiIds.map((id) => ({ loc: `${origin}/api/${id}`, priority: '0.5' })),
];

const today = new Date().toISOString().slice(0, 10);

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) =>
      `  <url>\n    <loc>${url.loc}</loc>\n    <lastmod>${today}</lastmod>\n    <priority>${url.priority}</priority>\n  </url>`,
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

function readSlugs(path) {
  return read(path, /slug:\s*'([a-z0-9-]+)'/g);
}

function readIds(path) {
  return read(path, /^\s{4}id:\s*'([a-z0-9-]+)'/gm);
}

function read(path, pattern) {
  const source = readFileSync(path, 'utf8');
  return [...source.matchAll(pattern)].map((match) => match[1]);
}
