#!/usr/bin/env node
/**
 * Draws every Quiblo mark, at every size anything asks for, from the app's own icon.
 *
 * The organisation, the wiki and the app listing each want a picture, and the way that
 * normally goes is three slightly different ones — a logo exported once at the
 * wrong size, then cropped by hand for the next place that needs it. So the shape lives here
 * as geometry and every file below is rendered from it.
 *
 * **The geometry is copied from `ic_launcher_foreground.xml`, coordinate for coordinate**, and
 * that is the whole point of this file. The launcher icon is the one people already have on
 * their home screen; anything drawn "in the same spirit" is a second logo, and two logos is
 * how a project ends up looking like two projects. The Android drawable is authored in a
 * 108x108 viewport, so that viewport is what is used here rather than a redrawn one — if the
 * app's icon changes, change these three paths to match and nothing else has to move.
 *
 * A Q that is also a play button: the ring reads as the letter, the triangle as a player, and
 * the tail finishes the Q. White on `#4A4FBF`, exactly as the app has it.
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

/*
 * The app's own two colours, and nowhere else are they written down on this side.
 * `BRAND` is `ic_launcher_background` and `tv_banner_background`, which are the same value in
 * both applications.
 */
const BRAND = '#4A4FBF';
const ON_BRAND = '#FFFFFF';
const MUTED_ON_BRAND = '#c9cbf0';

/**
 * The three paths from `ic_launcher_foreground.xml`, unchanged.
 *
 * In the drawable's own 108x108 coordinates, so they can be compared with the XML line by line
 * rather than trusted. Everything that needs them at another size wraps them in a transform.
 */
const foreground = (colour) => `
  <!-- The ring: the body of the Q. -->
  <path d="M36,54 a18,18 0 1,0 36,0 a18,18 0 1,0 -36,0"
        fill="none" stroke="${colour}" stroke-width="5"/>

  <!-- The tail, breaking the ring at the lower right. -->
  <path d="M64,64 L74,74"
        fill="none" stroke="${colour}" stroke-width="5" stroke-linecap="round"/>

  <!-- The play mark. -->
  <path d="M49,45 L49,63 L65,54 Z" fill="${colour}"/>
`;

const FOREGROUND = foreground(ON_BRAND);

/**
 * The icon in a 512 box.
 *
 * [solid] fills the plate behind it. An app icon and an organisation avatar both need that; a
 * favicon on a page whose colour it does not control needs the mark alone, so it is a switch
 * rather than two drawings that will drift.
 *
 * **The foreground is scaled up when there is no plate.** An adaptive icon reserves the outer
 * third for the launcher to crop, so the drawable only fills the middle 66 of its 108 — which
 * is correct on a home screen and looks like a mistake in a browser tab, where nothing is
 * going to crop it.
 */
function mark({ solid = true, colour = ON_BRAND, radius = 0 } = {}) {
  /*
   * The plate is a **flat square by default, and that is the fix for a real artefact.**
   *
   * It was exported with rounded corners, which leaves the four corners transparent. Every
   * place this icon goes then rounds it again — GitHub masks an avatar, a launcher masks an
   * adaptive icon, a store masks a listing tile — and the page's own background shows through
   * the gap between the two radii as four grey notches.
   *
   * So the export is square and whoever displays it does the rounding, which is the one
   * arrangement that cannot disagree with itself. `radius` is there for the rare slot that
   * masks nothing and wants the corners drawn in.
   */
  const plate = solid ? `<rect width="108" height="108" rx="${radius}" fill="${BRAND}"/>` : '';

  // 1.0 inside a plate, so it matches the launcher exactly. 1.38 without one, which brings the
  // 66-unit safe zone out to fill the frame.
  const zoom = solid ? 1 : 1.38;
  const offset = (108 - 108 * zoom) / 2;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 108 108">
  ${plate}
  <g transform="translate(${offset} ${offset}) scale(${zoom})">${foreground(colour)}</g>
</svg>
`;
}

/**
 * The mark beside the name, for anywhere wider than it is tall.
 *
 * [centred] exists for a cover image and anything else that gets cropped: a banner is shown
 * full width on a desktop and cut to its middle on a phone, so a left-aligned lockup is
 * a lockup that disappears on half the devices that see it. Everything else stays left, where
 * a wordmark belongs.
 */
function wordmark(width, height, { withTagline = true, centred = false } = {}) {
  const markSize = height * 0.52;
  const midY = (height - markSize) / 2;
  const gap = height * 0.16;
  const nameSize = height * 0.2;

  // The mark is scaled out of the safe zone here for the same reason as the plateless icon:
  // a banner crops nothing, so the launcher's reserved margin is only empty space.
  const zoom = 1.38;
  const inset = (108 - 108 * zoom) / 2;

  /*
   * How much of the mark's box carries paint.
   *
   * The artwork is drawn inside the adaptive-icon safe zone: only the middle 43 of its 108
   * units are ever painted, and [zoom] pushes that out again. Centring on the box rather than
   * on the ink put the lockup a dozen pixels right of the middle — small, and exactly the sort
   * of small that reads as "not quite centred" without anyone being able to say why.
   */
  const inkWidth = markSize * (43 / 108) * zoom;

  // Measured by the widest line, since there is no text metric here to ask. DejaVu Sans Bold
  // runs about 0.6 of its size per character, and the tagline about 0.5 — close enough to
  // centre a lockup, and the error is a few pixels on a 1600-wide canvas.
  const nameWidth = 'Quiblo'.length * nameSize * 0.6;
  const taglineWidth = withTagline
    ? 'A free, open source IPTV player for Android and Android TV.'.length * height * 0.088 * 0.5
    : 0;
  const blockWidth = inkWidth + gap + Math.max(nameWidth, taglineWidth);

  // Where the *ink* starts, and then the box placed so its ink lands there.
  const leftInk = centred ? (width - blockWidth) / 2 : height * 0.28;
  const left = leftInk - (markSize - inkWidth) / 2;
  const textX = leftInk + inkWidth + gap;

  /*
   * The name's baseline, level with the mark beside it.
   *
   * With a tagline the two lines are a block and the pair straddles the middle. Alone, the name
   * has to sit on the mark's own centre line — it was set at 0.46 of the height, which put its
   * cap height a fifth of the picture above the middle of the circle next to it. Cap height in
   * DejaVu Sans Bold is about 0.73 of the size.
   */
  const nameY = withTagline ? height * 0.46 : height / 2 + nameSize * 0.73 / 2;

  const tagline = withTagline
    ? `<text x="${textX}" y="${height * 0.63}" font-family="DejaVu Sans, Verdana, sans-serif"
             font-size="${height * 0.088}" fill="${MUTED_ON_BRAND}">A free, open source IPTV player for Android and Android TV.</text>`
    : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="${width}" height="${height}" fill="${BRAND}"/>

  <g transform="translate(${left}, ${midY}) scale(${markSize / 108})">
    <g transform="translate(${inset} ${inset}) scale(${zoom})">${FOREGROUND}</g>
  </g>

  <text x="${textX}" y="${nameY}" font-family="DejaVu Sans, Verdana, sans-serif"
        font-size="${nameSize}" font-weight="bold" fill="${ON_BRAND}">Quiblo</text>
  ${tagline}
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
 * A white mark on a transparent ground is invisible on anything white — which is a browser
 * tab, a light README, and most of the places a transparent logo gets dropped. The first pass
 * here shipped only the white one and the 32-pixel favicon came out blank. So the indigo one
 * is the default and carries the plain name, and the white one is for dark grounds only.
 */
console.log('Mark — transparent ground, indigo, for light backgrounds:');
for (const size of [512, 180, 64, 32, 16]) {
  render(mark({ solid: false, colour: BRAND }), `quiblo-mark-${size}.png`, size, size);
}

console.log('Mark — transparent ground, white, for dark backgrounds:');
for (const size of [512, 180, 64]) {
  render(mark({ solid: false }), `quiblo-mark-white-${size}.png`, size, size);
}

console.log('Wordmark — anywhere wider than it is tall:');
// 1600x400 is what a cover slot asks for. Anything else wanting a banner wants roughly this
// shape, and this one is centred because a cover is cropped to its middle on a phone.
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
