#!/usr/bin/env node
/**
 * Draws the 1200x630 card that every social preview and search result reader expects.
 *
 * Open Graph has been wired on this site since it was built and has never had an image, so a
 * link pasted anywhere rendered as a bare URL with a paragraph beside it. The size is not a
 * suggestion: below 1200x630 the large-card renderers fall back to a thumbnail, and the
 * fallback looks like a broken link rather than a small one.
 *
 * **Written as SVG and converted, rather than drawn in a headless browser.** A browser would
 * have to be installed on whatever machine runs this, and the one thing this image contains is
 * text on a rectangle. `rsvg-convert` is a few hundred kilobytes and gives the same pixels.
 *
 *   node tools/og-image.mjs            # writes public/og-image.png
 */

import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';

const OUT_DIR = 'public';
const PNG = join(OUT_DIR, 'og-image.png');
const TMP = join(OUT_DIR, '.og-image.svg');

/*
 * Dark, because the site is dark by default and a card that does not match the page it opens
 * reads as somebody else's link. The green is the one the README's badges already use.
 */
const BACKGROUND = '#0d1117';
const PANEL = '#161b22';
const ACCENT = '#3ddc84';
const TEXT = '#e6edf3';
const MUTED = '#8b949e';

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="glow" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${ACCENT}" stop-opacity="0.18"/>
      <stop offset="60%" stop-color="${ACCENT}" stop-opacity="0"/>
    </linearGradient>
  </defs>

  <rect width="1200" height="630" fill="${BACKGROUND}"/>
  <rect width="1200" height="630" fill="url(#glow)"/>

  <!-- A play triangle in a rounded square: the one mark that says "player" without a word. -->
  <rect x="88" y="140" width="132" height="132" rx="30" fill="${PANEL}" stroke="${ACCENT}" stroke-width="3"/>
  <path d="M138 178 L138 234 L186 206 Z" fill="${ACCENT}"/>

  <text x="256" y="232" font-family="DejaVu Sans, Verdana, sans-serif" font-size="104" font-weight="bold" fill="${TEXT}">Quiblo</text>

  <text x="88" y="360" font-family="DejaVu Sans, Verdana, sans-serif" font-size="46" fill="${TEXT}">A free, open source IPTV player</text>
  <text x="88" y="424" font-family="DejaVu Sans, Verdana, sans-serif" font-size="46" fill="${TEXT}">for Android phones and Android TV.</text>

  <text x="88" y="502" font-family="DejaVu Sans, Verdana, sans-serif" font-size="32" fill="${MUTED}">Bring your own M3U or Xtream playlist.</text>
  <text x="88" y="548" font-family="DejaVu Sans, Verdana, sans-serif" font-size="32" fill="${MUTED}">No ads. No accounts. No tracking. No backend.</text>

  <rect x="88" y="586" width="1024" height="4" rx="2" fill="${ACCENT}" opacity="0.5"/>
</svg>
`;

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(TMP, svg);

try {
  execFileSync('rsvg-convert', ['-w', '1200', '-h', '630', '-o', PNG, TMP], { stdio: 'inherit' });
  console.log(`Wrote ${PNG}`);
} catch (error) {
  console.error('rsvg-convert failed. Install librsvg, or draw the card by hand at 1200x630.');
  throw error;
} finally {
  unlinkSync(TMP);
}
