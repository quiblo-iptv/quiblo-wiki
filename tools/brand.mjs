#!/usr/bin/env node
/**
 * Draws every Quiblo mark, at every size anything asks for, from the app's own icon.
 *
 * The organisation, the wiki and the app listing each want a picture, and the way that
 * normally goes is three slightly different ones — a logo exported once at the
 * wrong size, then cropped by hand for the next place that needs it. So the shape lives here
 * as geometry and every file below is rendered from it.
 *
 * **The geometry is copied from the app, coordinate for coordinate**, and that is the whole
 * point of this file. The mark and the light inside it are the two paths in
 * `ic_launcher_foreground.xml`; the name is the strokes in `QuibloWordmark.kt`, as
 * `tools/brand_vectors.py` writes them into the TV banner. Anything drawn "in the same spirit"
 * is a second logo, and two logos is how a project ends up looking like two projects. If the
 * app's mark changes, replace `MARK`, `COUNTER`, `WORD_STROKES` and `WORD_DOT` with the new
 * ones and nothing else has to move.
 *
 * The mark is a television screen whose corner turns into the tail of a Q, with a warm light
 * inside it. Everything is ink and paper; the only colour is that light.
 *
 * Rendered with `rsvg-convert` rather than a headless browser: this is flat vector art, a
 * browser would have to be installed to draw it, and the pixels come out the same.
 *
 *   node tools/brand.mjs        # writes brand/
 */

import { execFileSync } from 'node:child_process';
import { copyFileSync, mkdirSync, readdirSync, writeFileSync, unlinkSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const OUT = 'brand';

import {
  INK, INK_WARM, PAPER, MUTED_PAPER, GLOW, GLOW_CORE, EMBER,
  MARK, COUNTER, WORD_STROKES, WORD_DOT, WORD_STROKE,
} from './brand-geometry.mjs';

let gradients = 0;

/**
 * The light inside the screen, as the launcher draws it.
 *
 * A fresh id every time, because one SVG can hold more than one mark.
 */
function light() {
  const id = `light${gradients++}`;
  return {
    def: `<radialGradient id="${id}" gradientUnits="userSpaceOnUse" cx="50" cy="54" r="33">
      <stop offset="0" stop-color="${GLOW_CORE}"/>
      <stop offset="0.45" stop-color="${GLOW}"/>
      <stop offset="0.8" stop-color="${EMBER}" stop-opacity="0.55"/>
      <stop offset="1" stop-color="${EMBER}" stop-opacity="0"/>
    </radialGradient>`,
    fill: `url(#${id})`,
  };
}

/**
 * The mark with its light, in the mark's own 100-unit box.
 *
 * [dark] fills the screen with ink under the light. On a plate the plate already does that;
 * on a transparent ground the light was drawn over whatever the page is, and on white its
 * ember edge turned a washed-out pink. The splash inks the screen the same way.
 */
function markGroup(colour, transform, { dark = false } = {}) {
  const glow = light();
  const screen = dark ? `<path d="${COUNTER}" fill="${INK}"/>` : '';
  return {
    defs: glow.def,
    body: `<g transform="${transform}">
    ${screen}
    <path d="${COUNTER}" fill="${glow.fill}"/>
    <path d="${MARK}" fill="${colour}"/>
  </g>`,
  };
}

/** The ink plate, warmed in the middle the way the launcher background is. */
function plate(width, height, radius = 0) {
  const r = Math.hypot(width, height) / 2;
  return {
    defs: `<radialGradient id="plate" gradientUnits="userSpaceOnUse" cx="${width / 2}" cy="${height / 2}" r="${r}">
      <stop offset="0" stop-color="${INK_WARM}"/>
      <stop offset="1" stop-color="${INK}"/>
    </radialGradient>`,
    body: `<rect width="${width}" height="${height}" rx="${radius}" fill="url(#plate)"/>`,
  };
}

/**
 * The icon in a 108 box.
 *
 * [solid] lays the ink plate behind it. An app icon and an organisation avatar both need that;
 * a mark on a page whose colour it does not control needs the mark alone, so it is a switch
 * rather than two drawings that will drift.
 *
 * **The mark is larger on the plate than on the launcher's canvas.** An adaptive icon draws it
 * at 50 of 108 units because the launcher crops the outer third; nothing here crops that much,
 * and at that size it looked lost in a GitHub avatar. 60 units still clears a circular mask
 * with the tail inside it. Without a plate it fills the frame.
 */
function mark({ solid = true, colour = PAPER, radius = 0 } = {}) {
  const back = solid ? plate(108, 108, radius) : { defs: '', body: '' };
  const fg = solid ? markGroup(colour, 'translate(24 24) scale(0.6)') : markGroup(colour, 'translate(4 4)', { dark: true });
  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 108 108">
  <defs>${back.defs}${fg.defs}</defs>
  ${back.body}
  ${fg.body}
</svg>
`;
}

/**
 * The mark beside the name, for anywhere wider than it is tall.
 *
 * Laid out as the TV banner lays it out: the name's x-height sits on the mark's centre line, at
 * the banner's proportions. [centred] exists for a cover image and anything else that gets
 * cropped: a banner is shown full width on a desktop and cut to its middle on a phone, so a
 * left-aligned lockup is a lockup that disappears on half the devices that see it.
 */
function wordmark(width, height, { withTagline = true, centred = false } = {}) {
  const markSize = height * (withTagline ? 0.5 : 0.56);
  const unit = markSize / 100;
  const word = markSize * (0.46 / 80); // the banner: an 80-unit mark beside a 0.46-scale name
  const gap = markSize * 0.21;

  // Where the mark has paint, in its own box: the ring from 7.5, the tail out to 93.5.
  const inkLeft = 7.5 * unit;
  const inkWidth = 86 * unit;
  const wordWidth = 297 * word;

  const taglineSize = height * 0.075;
  const tagline = 'A free, open source IPTV player for Android and Android TV.';
  // DejaVu Sans runs about half its size per character; close enough to centre a lockup.
  const taglineWidth = withTagline ? tagline.length * taglineSize * 0.5 : 0;
  const blockWidth = inkWidth + gap + Math.max(wordWidth, taglineWidth);

  const leftInk = centred ? (width - blockWidth) / 2 : height * 0.28;
  const markX = leftInk - inkLeft;
  const textX = leftInk + inkWidth + gap;

  // The mark is centred on the picture; the name's x-height straddles that line.
  const cy = height / 2 - (withTagline ? taglineSize * 0.9 : 0);
  const markY = cy - markSize / 2;
  const baseline = cy + 27 * word;

  const fg = markGroup(PAPER, `translate(${markX} ${markY}) scale(${unit})`);
  const spillX = markX + 50 * unit;

  const line = withTagline
    ? `<text x="${textX}" y="${baseline + 25 * word + taglineSize * 1.6}" font-family="DejaVu Sans, Verdana, sans-serif"
        font-size="${taglineSize}" fill="${MUTED_PAPER}">${tagline}</text>`
    : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    ${fg.defs}
    <radialGradient id="spill" gradientUnits="userSpaceOnUse" cx="${spillX}" cy="${cy}" r="${height * 0.9}">
      <stop offset="0" stop-color="${GLOW}" stop-opacity="0.22"/>
      <stop offset="1" stop-color="${GLOW}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="${INK}"/>
  <!-- The light, spilling from the mark onto the plate, as on the TV banner. -->
  <rect width="${width}" height="${height}" fill="url(#spill)"/>
  ${fg.body}
  <g transform="translate(${textX} ${baseline}) scale(${word})">
    <path d="${WORD_STROKES}" fill="none" stroke="${PAPER}" stroke-width="${WORD_STROKE}"/>
    <path d="${WORD_DOT}" fill="${PAPER}"/>
  </g>
  ${line}
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

console.log('Icon — flat square. Organisation avatar, app listing:');
for (const size of [1024, 512, 256, 192, 128, 64]) {
  render(mark(), `quiblo-icon-${size}.png`, size, size);
}

// For the occasional slot that masks nothing and would otherwise show a hard square.
console.log('Icon — corners drawn in, for a slot that does no masking of its own:');
for (const size of [512, 256]) {
  render(mark({ radius: 24 }), `quiblo-icon-rounded-${size}.png`, size, size);
}

/*
 * The mark with no plate, in two colours, because one is not enough.
 *
 * A paper mark on a transparent ground is invisible on anything white — which is a browser
 * tab, a light README, and most of the places a transparent logo gets dropped. So the ink one
 * is the default and carries the plain name, and the white one is for dark grounds only. Both
 * keep the light: it is the one colour the brand has.
 */
console.log('Mark — transparent ground, ink, for light backgrounds:');
for (const size of [512, 180, 64, 32, 16]) {
  render(mark({ solid: false, colour: INK }), `quiblo-mark-${size}.png`, size, size);
}

console.log('Mark — transparent ground, paper, for dark backgrounds:');
for (const size of [512, 180, 64]) {
  render(mark({ solid: false }), `quiblo-mark-white-${size}.png`, size, size);
}

console.log('Wordmark — anywhere wider than it is tall:');
// 1600x400 is what a cover slot asks for. Centred, because a cover is cropped to its middle on
// a phone.
render(wordmark(1600, 400, { centred: true }), 'quiblo-cover-1600x400.png', 1600, 400);
render(wordmark(1280, 320), 'quiblo-wordmark-1280x320.png', 1280, 320);
// Centred: this is the one the organisation profile shows, and a profile README centres its
// own block — so a lockup sitting left inside the image reads as a banner that has slipped in
// its frame rather than as a logo on a plate.
render(wordmark(800, 200, { withTagline: false, centred: true }), 'quiblo-wordmark-800x200.png', 800, 200);

/*
 * The favicon browsers still ask for by name, with the three sizes they pick between.
 *
 * Built from the **plated** icon rather than the transparent mark, deliberately. A tab strip
 * is white in one theme and near-black in the other, and a browser gives you no way to serve
 * a different favicon to each — so the only icon that is visible in both is one that brings
 * its own background. It is also the picture already on people's home screens.
 */
try {
  execFileSync('magick', [
    join(OUT, 'quiblo-icon-64.png'),
    '-define',
    'icon:auto-resize=64,32,16',
    join(OUT, 'favicon.ico'),
  ]);
  console.log('  favicon.ico  16 + 32 + 64, plated');
} catch {
  console.warn('  favicon.ico skipped — ImageMagick not found');
}

/*
 * Copied where the web can reach them, because a README cannot show a file that only exists on
 * somebody's laptop.
 *
 * **Everything, not a chosen few.** The first pass published three files by hand and the next
 * person to write a README naturally reached for a fourth — which 404'd. A generator that
 * decides for the reader which of its outputs are usable is a generator that will be wrong.
 */
const PUBLIC = join('public', 'brand');
mkdirSync(PUBLIC, { recursive: true });
let published = 0;
for (const file of readdirSync(OUT)) {
  if (file.endsWith('.png') || file.endsWith('.ico')) {
    copyFileSync(join(OUT, file), join(PUBLIC, file));
    published += 1;
  }
}
console.log(`\nWritten to ${OUT}/, and ${published} files copied to ${PUBLIC}/`);
