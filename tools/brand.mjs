#!/usr/bin/env node
/**
 * Draws every Quiblo mark, at every size anything asks for, from one definition.
 *
 * There was no icon. The organisation, the wiki, the app listing and the Patreon page each
 * wanted one, and the way that normally goes is four slightly different pictures — a logo
 * exported once at the wrong size, then cropped by hand for the next place that needs it. So
 * the shape lives here as geometry and every file below is rendered from it.
 *
 * **The mark is a Q that is also a play button**, which is the whole idea: a ring for the
 * letter's bowl, a triangle in the counter for what the software does, and a short bar across
 * the lower right for the tail. It has to survive being 16 pixels wide in a browser tab, so
 * there is no fine detail anywhere in it — at that size a ring and a triangle is all that
 * survives, and anything else is mud.
 *
 * Rendered with `rsvg-convert` rather than a headless browser: this is flat vector art, a
 * browser would have to be installed to draw it, and the pixels come out the same.
 *
 *   node tools/brand.mjs        # writes brand/
 */

import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync, unlinkSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const OUT = 'brand';

/* The palette, and the only place it is written down. */
const INK = '#0d1117';
const ACCENT = '#3ddc84';
const TEXT = '#e6edf3';
const MUTED = '#8b949e';

/**
 * The mark on its own, on a transparent ground, in a 512 box.
 *
 * [solid] fills the rounded square behind it. An app icon and an organisation avatar both need
 * that; a favicon on a page that may be light or dark needs the mark alone, so it is a switch
 * rather than two drawings that will drift.
 */
function mark({ solid = true, ink = INK, accent = ACCENT } = {}) {
  const plate = solid
    ? `<rect width="512" height="512" rx="112" fill="${ink}"/>
       <rect width="512" height="512" rx="112" fill="url(#sheen)"/>`
    : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="sheen" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${accent}" stop-opacity="0.16"/>
      <stop offset="65%" stop-color="${accent}" stop-opacity="0"/>
    </linearGradient>
  </defs>
  ${plate}

  <!-- The bowl of the Q. Stroked rather than filled so the triangle inside has room to read. -->
  <circle cx="256" cy="248" r="132" fill="none" stroke="${accent}" stroke-width="40"/>

  <!-- The play triangle, optically centred: a triangle's visual centre sits left of its box. -->
  <path d="M222 190 L222 306 L318 248 Z" fill="${accent}"/>

  <!-- The tail. Square-capped and thick, because a thin tail is the first thing to vanish. -->
  <path d="M330 322 L392 384" stroke="${accent}" stroke-width="44" stroke-linecap="square"/>
</svg>
`;
}

/**
 * The mark beside the name, for anywhere wider than it is tall.
 *
 * [centred] exists for the Patreon cover and anything else that gets cropped: a banner is
 * shown full width on a desktop and cut to its middle on a phone, so a left-aligned lockup is
 * a lockup that disappears on half the devices that see it. Everything else stays left, where
 * a wordmark belongs.
 */
function wordmark(width, height, { withTagline = true, centred = false } = {}) {
  const scale = height / 512;
  const markSize = 512 * scale * 0.52;
  const midY = (height - markSize) / 2;

  // Measured by the widest line, since there is no text metric here to ask. DejaVu Sans Bold
  // runs about 0.6 of its size per character, and the tagline about 0.5 — close enough to
  // centre a lockup, and the error is a few pixels on a 1600-wide canvas.
  const nameWidth = 'Quiblo'.length * height * 0.2 * 0.6;
  const taglineWidth = withTagline
    ? 'A free, open source IPTV player for Android and Android TV.'.length * height * 0.088 * 0.5
    : 0;
  const blockWidth = markSize + height * 0.16 + Math.max(nameWidth, taglineWidth);

  const left = centred ? (width - blockWidth) / 2 : height * 0.28;
  const textX = left + markSize + height * 0.16;

  const tagline = withTagline
    ? `<text x="${textX}" y="${height * 0.63}" font-family="DejaVu Sans, Verdana, sans-serif"
             font-size="${height * 0.088}" fill="${MUTED}">A free, open source IPTV player for Android and Android TV.</text>`
    : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="sheen" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${ACCENT}" stop-opacity="0.16"/>
      <stop offset="70%" stop-color="${ACCENT}" stop-opacity="0"/>
    </linearGradient>
  </defs>

  <rect width="${width}" height="${height}" fill="${INK}"/>
  <rect width="${width}" height="${height}" fill="url(#sheen)"/>

  <g transform="translate(${left}, ${midY}) scale(${markSize / 512})">
    <circle cx="256" cy="248" r="132" fill="none" stroke="${ACCENT}" stroke-width="40"/>
    <path d="M222 190 L222 306 L318 248 Z" fill="${ACCENT}"/>
    <path d="M330 322 L392 384" stroke="${ACCENT}" stroke-width="44" stroke-linecap="square"/>
  </g>

  <text x="${textX}" y="${height * 0.46}" font-family="DejaVu Sans, Verdana, sans-serif"
        font-size="${height * 0.2}" font-weight="bold" fill="${TEXT}">Quiblo</text>
  ${tagline}

  <rect x="0" y="${height - 6}" width="${width}" height="6" fill="${ACCENT}" opacity="0.55"/>
</svg>
`;
}

function render(svg, file, width, height) {
  const tmp = join(OUT, '.tmp.svg');
  writeFileSync(tmp, svg);
  execFileSync('rsvg-convert', ['-w', String(width), '-h', String(height), '-o', join(OUT, file), tmp]);
  unlinkSync(tmp);
  console.log(`  ${file}  ${width}x${height}`);
}

if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });

console.log('Icon — square, filled. Organisation avatar, app listing, Patreon profile:');
for (const size of [1024, 512, 256, 192, 128, 64]) {
  render(mark(), `quiblo-icon-${size}.png`, size, size);
}

console.log('Icon — transparent ground, for a page whose colour it does not control:');
for (const size of [512, 180, 64, 32, 16]) {
  render(mark({ solid: false }), `quiblo-mark-${size}.png`, size, size);
}

console.log('Wordmark — anywhere wider than it is tall:');
// Patreon's cover is 1600x400. Everything else that wants a banner wants roughly this shape.
render(wordmark(1600, 400, { centred: true }), 'quiblo-patreon-cover-1600x400.png', 1600, 400);
render(wordmark(1280, 320), 'quiblo-wordmark-1280x320.png', 1280, 320);
render(wordmark(800, 200, { withTagline: false }), 'quiblo-wordmark-800x200.png', 800, 200);

// The favicon browsers still ask for by name, with the three sizes they pick between.
try {
  execFileSync('magick', [
    join(OUT, 'quiblo-mark-16.png'),
    join(OUT, 'quiblo-mark-32.png'),
    join(OUT, 'quiblo-mark-64.png'),
    join(OUT, 'favicon.ico'),
  ]);
  console.log('  favicon.ico  16 + 32 + 64');
} catch {
  console.warn('  favicon.ico skipped — ImageMagick not found');
}

console.log(`\nWritten to ${OUT}/`);
