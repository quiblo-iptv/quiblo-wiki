#!/usr/bin/env node
/**
 * Serves the production build on the local network.
 *
 * `ng serve` exists, but it serves a development build and binds to localhost by default.
 * This serves exactly what would be deployed — minified, hashed, one bundle — which is the
 * thing worth looking at on a real phone.
 *
 * Two behaviours it has that a plain static file server does not:
 *
 *   1. **It answers the way GitHub Pages answers.** A directory serves its `index.html` with
 *      status 200, and only a path with no file behind it falls back — to `404.html`, with
 *      status **404**, which is what the real host sends. Serving the fallback as 200 would
 *      hide the exact defect this build exists to fix: a crawler discards a 404 without
 *      running the JavaScript that would have rendered the page, so a local server that
 *      answers everything with 200 cannot tell you whether the site is indexable.
 *   2. **It binds to 0.0.0.0 and prints the LAN addresses**, so a phone on the same network
 *      can reach it.
 *
 * Usage: node tools/serve.mjs [port]
 */

import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { networkInterfaces } from 'node:os';
import { extname, join, normalize, resolve } from 'node:path';

const ROOT = resolve(process.cwd(), 'dist/quiblo-wiki/browser');
const PORT = Number(process.argv[2] ?? 4321);

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.png': 'image/png',
  '.woff2': 'font/woff2',
};

async function resolveFile(urlPath) {
  // normalize() collapses `..`, and the prefix check rejects anything that escaped ROOT.
  // Without both, a crafted path could read files outside the build output.
  const candidate = normalize(join(ROOT, decodeURIComponent(urlPath)));
  if (!candidate.startsWith(ROOT)) return null;

  for (const path of [candidate, join(candidate, 'index.html')]) {
    try {
      const found = await stat(path);
      if (found.isFile()) return path;
    } catch {
      /* try the next candidate, then fall through to the 404 page */
    }
  }
  return null;
}

const server = createServer(async (request, response) => {
  const urlPath = new URL(request.url ?? '/', 'http://localhost').pathname;
  const file = await resolveFile(urlPath);
  const served = file ?? join(ROOT, '404.html');
  const type = TYPES[extname(served)] ?? 'application/octet-stream';

  response.writeHead(file ? 200 : 404, {
    'Content-Type': type,
    // Hashed bundles may be cached hard; HTML must not be, or a rebuild is invisible.
    'Cache-Control': served.endsWith('.html') ? 'no-store' : 'public, max-age=3600',
  });
  createReadStream(served).pipe(response);
});

server.listen(PORT, '0.0.0.0', () => {
  const addresses = Object.values(networkInterfaces())
    .flat()
    .filter((entry) => entry && entry.family === 'IPv4' && !entry.internal)
    .map((entry) => entry.address);

  console.log(`\n  Quiblo wiki — serving ${ROOT}\n`);
  console.log(`  Local:   http://localhost:${PORT}`);
  for (const address of addresses) {
    console.log(`  Network: http://${address}:${PORT}`);
  }
  console.log('');
});
