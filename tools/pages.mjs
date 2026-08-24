#!/usr/bin/env node
/**
 * Prepares the build output for a static host.
 *
 * Two files that no builder writes and every static deployment of this site needs:
 *
 *   - **404.html** — a path with no file behind it still has to render something. The shell
 *     that boots the router is `index.csr.html`, which the prerendering build emits for
 *     exactly this: an unrendered copy that resolves whatever URL it is loaded at. Copying
 *     the prerendered `index.html` instead would show the front page's content under the
 *     wrong URL until the router replaced it.
 *
 *     This is now a genuine 404 and nothing else. Every real route is a file, so the fallback
 *     is only reached by a typo — which is what it should always have been. It was previously
 *     the answer to every deep link in the site, and a static host sends status 404 with it,
 *     so a crawler discarded every page but the front one without rendering it.
 *
 *   - **.nojekyll** — GitHub Pages otherwise runs the output through Jekyll, which drops
 *     files and directories beginning with an underscore.
 *
 * Usage: node tools/pages.mjs
 */

import { copyFileSync, existsSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const OUT = 'dist/quiblo-wiki/browser';
const SHELL = join(OUT, 'index.csr.html');

if (!existsSync(SHELL)) {
  console.error(
    `No ${SHELL}. That file is written by a prerendering build — check that ` +
      '`outputMode` is still `static` in angular.json.',
  );
  process.exit(1);
}

copyFileSync(SHELL, join(OUT, '404.html'));
writeFileSync(join(OUT, '.nojekyll'), '');

console.log('  404.html — from the client-render shell');
console.log('  .nojekyll');
