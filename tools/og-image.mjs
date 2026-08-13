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
 * The app's own two colours, and the app's own mark, so a link preview and the icon on
 * somebody's home screen are recognisably the same thing. A card drawn in a palette the
 * software does not use reads as somebody else's link.
 */
const BACKGROUND = '#4A4FBF';
const ACCENT = '#FFFFFF';
const TEXT = '#FFFFFF';
const MUTED = '#c9cbf0';

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
  </defs>

  <rect width="1200" height="630" fill="${BACKGROUND}"/>
  

  <!--
    The launcher icon's own three paths, from ic_launcher_foreground.xml, in its 108 viewport
    and scaled into place. Copied rather than redrawn — two logos is how a project comes to
    look like two projects.
  -->
  <g transform="translate(88 128) scale(1.65)">
    <path d="M36,54 a18,18 0 1,0 36,0 a18,18 0 1,0 -36,0" fill="none" stroke="${ACCENT}" stroke-width="5"/>
    <path d="M64,64 L74,74" fill="none" stroke="${ACCENT}" stroke-width="5" stroke-linecap="round"/>
    <path d="M49,45 L49,63 L65,54 Z" fill="${ACCENT}"/>
  </g>

  <text x="256" y="232" font-family="DejaVu Sans, Verdana, sans-serif" font-size="104" font-weight="bold" fill="${TEXT}">Quiblo</text>

  <text x="88" y="360" font-family="DejaVu Sans, Verdana, sans-serif" font-size="46" fill="${TEXT}">A free, open source IPTV player</text>
  <text x="88" y="424" font-family="DejaVu Sans, Verdana, sans-serif" font-size="46" fill="${TEXT}">for Android phones and Android TV.</text>

  <text x="88" y="502" font-family="DejaVu Sans, Verdana, sans-serif" font-size="32" fill="${MUTED}">Bring your own M3U or Xtream playlist.</text>
  <text x="88" y="548" font-family="DejaVu Sans, Verdana, sans-serif" font-size="32" fill="${MUTED}">No ads. No accounts. No tracking. No backend.</text>

  
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
