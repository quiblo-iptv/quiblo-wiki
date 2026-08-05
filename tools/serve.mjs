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
 *   1. **A single-page-app fallback.** Any path that is not a file returns `index.html`, so
 *      a deep link like /wiki/the-database works on a fresh load rather than 404ing. This is
 *      the same trick the GitHub Pages workflow performs by copying index.html to 404.html.
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

  try {
    const found = await stat(candidate);
    if (found.isFile()) return candidate;
  } catch {
    /* fall through to the SPA fallback */
  }
  return null;
}

const server = createServer(async (request, response) => {
  const urlPath = new URL(request.url ?? '/', 'http://localhost').pathname;
  const file = (await resolveFile(urlPath)) ?? join(ROOT, 'index.html');
  const type = TYPES[extname(file)] ?? 'application/octet-stream';

  response.writeHead(200, {
    'Content-Type': type,
    // Hashed bundles may be cached hard; index.html must not be, or a rebuild is invisible.
    'Cache-Control': file.endsWith('index.html') ? 'no-store' : 'public, max-age=3600',
  });
  createReadStream(file).pipe(response);
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
