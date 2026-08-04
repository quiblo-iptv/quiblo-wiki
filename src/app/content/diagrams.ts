/**
 * Diagrams, as inline SVG.
 *
 * Inline rather than image files so they inherit the page's colour: every stroke and label
 * is `currentColor` at some opacity, which means one drawing works in both themes instead
 * of two exports that drift apart. They are also searchable — the labels are real text
 * nodes — and they scale without a second asset.
 */

const FONT =
  'font-family="ui-sans-serif, system-ui, sans-serif" font-size="13" fill="currentColor"';
const FONT_SMALL =
  'font-family="ui-sans-serif, system-ui, sans-serif" font-size="11" fill="currentColor" opacity="0.65"';

/** The layer cake, and the rule that keeps the two frontends cheap. */
export const MODULE_GRAPH = `
<figure class="diagram">
<svg viewBox="0 0 760 430" role="img" aria-label="Module dependency graph: two applications over shared feature, source and core layers">
  <g stroke="currentColor" fill="none" stroke-opacity="0.35">
    <rect x="60"  y="20"  width="280" height="52" rx="10"/>
    <rect x="420" y="20"  width="280" height="52" rx="10"/>
    <rect x="60"  y="120" width="640" height="52" rx="10"/>
    <rect x="60"  y="220" width="300" height="52" rx="10"/>
    <rect x="400" y="220" width="300" height="52" rx="10"/>
    <rect x="60"  y="320" width="640" height="72" rx="10"/>
  </g>

  <g ${FONT} text-anchor="middle">
    <text x="200" y="43">:app</text>
    <text x="560" y="43">:app-tv</text>
    <text x="380" y="143">:feature:*</text>
    <text x="210" y="243">:source:*</text>
    <text x="550" y="243">:core:media</text>
    <text x="380" y="350">:core:model · :core:data · :core:database</text>
    <text x="380" y="372">:core:datastore · :core:network · :core:common</text>
  </g>

  <g ${FONT_SMALL} text-anchor="middle">
    <text x="200" y="61">phone · dev.quiblo.player</text>
    <text x="560" y="61">television · dev.quiblo.tv</text>
    <text x="380" y="161">browse, live, vod, series, player, sources, settings, favorites</text>
    <text x="210" y="261">m3u · xtream · iptvorg · api</text>
    <text x="550" y="261">the player engine, behind an interface</text>
  </g>

  <g stroke="currentColor" stroke-opacity="0.45" fill="none" marker-end="url(#arrow)">
    <path d="M200 72 L200 120"/>
    <path d="M560 72 L560 120"/>
    <path d="M300 172 L240 220"/>
    <path d="M460 172 L520 220"/>
    <path d="M210 272 L300 320"/>
    <path d="M550 272 L460 320"/>
  </g>

  <defs>
    <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5"
            markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" fill-opacity="0.45"/>
    </marker>
  </defs>
</svg>
<figcaption>
  Dependencies point downwards only. Nothing below <code>:feature:*</code> may import
  Compose — a rule the build enforces, and the reason a second frontend cost a presentation
  layer rather than a rewrite.
</figcaption>
</figure>`;

/** What actually happens between a panel and a row on screen. */
export const BROWSE_FLOW = `
<figure class="diagram">
<svg viewBox="0 0 760 320" role="img" aria-label="The browse data path from provider to screen">
  <g stroke="currentColor" fill="none" stroke-opacity="0.35">
    <rect x="20"  y="24" width="150" height="56" rx="10"/>
    <rect x="215" y="24" width="150" height="56" rx="10"/>
    <rect x="410" y="24" width="150" height="56" rx="10"/>
    <rect x="605" y="24" width="135" height="56" rx="10"/>
    <rect x="215" y="160" width="150" height="56" rx="10"/>
    <rect x="410" y="160" width="150" height="56" rx="10"/>
    <rect x="605" y="160" width="135" height="56" rx="10"/>
  </g>

  <g ${FONT} text-anchor="middle">
    <text x="95"  y="49">provider</text>
    <text x="290" y="49">:source:*</text>
    <text x="485" y="49">Room</text>
    <text x="672" y="49">Repository</text>
    <text x="290" y="185">ViewModel</text>
    <text x="485" y="185">UI state</text>
    <text x="672" y="185">screen</text>
  </g>

  <g ${FONT_SMALL} text-anchor="middle">
    <text x="95"  y="68">M3U or Xtream</text>
    <text x="290" y="68">parse, rate-limit</text>
    <text x="485" y="68">channels table</text>
    <text x="672" y="68">maps off-main</text>
    <text x="290" y="204">combine, debounce</text>
    <text x="485" y="204">one immutable object</text>
    <text x="672" y="204">Compose</text>
  </g>

  <g stroke="currentColor" stroke-opacity="0.45" fill="none" marker-end="url(#arrow2)">
    <path d="M170 52 L215 52"/>
    <path d="M365 52 L410 52"/>
    <path d="M560 52 L605 52"/>
    <path d="M672 80 L672 118 L290 118 L290 160"/>
    <path d="M365 188 L410 188"/>
    <path d="M560 188 L605 188"/>
  </g>

  <g ${FONT_SMALL} text-anchor="middle">
    <text x="480" y="112">a refresh writes once; everything after is a query</text>
  </g>

  <defs>
    <marker id="arrow2" viewBox="0 0 10 10" refX="9" refY="5"
            markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" fill-opacity="0.45"/>
    </marker>
  </defs>
</svg>
<figcaption>
  The provider is touched on a refresh and almost never again. Browsing, filtering,
  searching and favouriting are database reads — which is what makes the app usable offline
  and what keeps a 67,000-channel account from being a request storm.
</figcaption>
</figure>`;

/** Why favourites and resume points survive a refresh when row ids do not. */
export const STABLE_KEY = `
<figure class="diagram">
<svg viewBox="0 0 760 250" role="img" aria-label="Identity across a refresh: row ids change, stable keys do not">
  <g stroke="currentColor" fill="none" stroke-opacity="0.35">
    <rect x="40"  y="30" width="290" height="80" rx="10"/>
    <rect x="430" y="30" width="290" height="80" rx="10"/>
    <rect x="235" y="160" width="290" height="60" rx="10"/>
  </g>

  <g ${FONT} text-anchor="middle">
    <text x="185" y="56">channels, before a refresh</text>
    <text x="575" y="56">channels, after</text>
    <text x="380" y="185">favorites · resume_positions</text>
  </g>

  <g ${FONT_SMALL} text-anchor="middle">
    <text x="185" y="78">id = 4193</text>
    <text x="185" y="96">stableKey = "xt:live:80421"</text>
    <text x="575" y="78">id = 91782  ← different</text>
    <text x="575" y="96">stableKey = "xt:live:80421"  ← same</text>
    <text x="380" y="206">keyed by stableKey, never by id</text>
  </g>

  <g stroke="currentColor" stroke-opacity="0.45" fill="none" marker-end="url(#arrow3)">
    <path d="M330 70 L430 70"/>
    <path d="M300 160 L230 110"/>
    <path d="M460 160 L530 110"/>
  </g>

  <defs>
    <marker id="arrow3" viewBox="0 0 10 10" refX="9" refY="5"
            markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" fill-opacity="0.45"/>
    </marker>
  </defs>
</svg>
<figcaption>
  A refresh deletes and reinserts every row, so every primary key changes. Anything that
  must outlive a refresh is keyed by the provider's own identity instead — which is why
  favourites are a separate table rather than a column.
</figcaption>
</figure>`;
