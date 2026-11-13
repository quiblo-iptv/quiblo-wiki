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
import {
  INK, PAPER, MUTED_PAPER, GLOW, GLOW_CORE, EMBER,
  MARK, COUNTER, WORD_STROKES, WORD_DOT, WORD_STROKE,
} from './brand-geometry.mjs';

const OUT_DIR = 'public';
const PNG = join(OUT_DIR, 'og-image.png');
const TMP = join(OUT_DIR, '.og-image.svg');

/*
 * The app's own colours and the app's own mark, so a link preview and the icon on somebody's
 * home screen are recognisably the same thing. A card drawn in a palette the software does not
 * use reads as somebody else's link. Shared with `brand.mjs`, so the two cannot drift.
 */

// The mark, 168 across, and the name beside it at the TV banner's proportions: its x-height on
// the mark's centre line.
const MARK_SIZE = 168;
const MARK_X = 88;
const MARK_Y = 72;
const CY = MARK_Y + MARK_SIZE / 2;
const WORD = MARK_SIZE * (0.46 / 80);
const WORD_X = MARK_X + 93.5 * (MARK_SIZE / 100) + MARK_SIZE * 0.21;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <radialGradient id="light" gradientUnits="userSpaceOnUse" cx="50" cy="54" r="33">
      <stop offset="0" stop-color="${GLOW_CORE}"/>
      <stop offset="0.45" stop-color="${GLOW}"/>
      <stop offset="0.8" stop-color="${EMBER}" stop-opacity="0.55"/>
      <stop offset="1" stop-color="${EMBER}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="spill" gradientUnits="userSpaceOnUse" cx="${MARK_X + MARK_SIZE / 2}" cy="${CY}" r="560">
      <stop offset="0" stop-color="${GLOW}" stop-opacity="0.2"/>
      <stop offset="1" stop-color="${GLOW}" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <rect width="1200" height="630" fill="${INK}"/>
  <!-- The light, spilling from the mark onto the card, as on the TV banner. -->
  <rect width="1200" height="630" fill="url(#spill)"/>

  <!-- The launcher icon's own mark and light, from ic_launcher_foreground.xml. -->
  <g transform="translate(${MARK_X} ${MARK_Y}) scale(${MARK_SIZE / 100})">
    <path d="${COUNTER}" fill="url(#light)"/>
    <path d="${MARK}" fill="${PAPER}"/>
  </g>

  <!-- The name, drawn on the mark's grid as the app draws it. -->
  <g transform="translate(${WORD_X} ${CY + 27 * WORD}) scale(${WORD})">
    <path d="${WORD_STROKES}" fill="none" stroke="${PAPER}" stroke-width="${WORD_STROKE}"/>
    <path d="${WORD_DOT}" fill="${PAPER}"/>
  </g>

  <text x="88" y="384" font-family="DejaVu Sans, Verdana, sans-serif" font-size="46" fill="${PAPER}">A free, open source IPTV player</text>
  <text x="88" y="448" font-family="DejaVu Sans, Verdana, sans-serif" font-size="46" fill="${PAPER}">for Android phones and Android TV.</text>

  <text x="88" y="522" font-family="DejaVu Sans, Verdana, sans-serif" font-size="32" fill="${MUTED_PAPER}">Bring your own M3U or Xtream playlist.</text>
  <text x="88" y="568" font-family="DejaVu Sans, Verdana, sans-serif" font-size="32" fill="${MUTED_PAPER}">No ads. No accounts. No tracking. No backend.</text>
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
