import type { WikiPart } from '../core/wiki.model';

export const ORIENTATION: WikiPart = {
  id: 'orientation',
  title: 'Orientation',
  blurb:
    'What Quiblo is, what it deliberately is not, why it is licensed the way it is, and how it got here. Start here if you have never seen the project before.',
  pages: [
    {
      slug: 'what-is-quiblo',
      title: 'What Quiblo is',
      summary:
        'A free, open-source Android IPTV client that plays playlists you supply yourself.',
      sections: [
        {
          id: 'one-sentence',
          title: 'In one sentence',
          html: `
<p><strong>Quiblo is a free, open-source, GPLv3-licensed Android IPTV client that plays Live TV,
video-on-demand and series from playlists the user supplies themselves.</strong></p>
<p>It is a media player in the same category as VLC or Jellyfin. You give it a playlist or an
account; it shows you what is in there and plays it. It has no opinion about, and no
knowledge of, what your playlist contains.</p>`,
        },
        {
          id: 'two-apps',
          title: 'Two applications, one engine',
          html: `
<p>Quiblo ships as <em>two</em> Android applications built from one codebase:</p>
<table>
  <thead><tr><th>Build</th><th>Application id</th><th>For</th></tr></thead>
  <tbody>
    <tr><td><code>:app</code></td><td><code>dev.quiblo.player</code></td><td>Phones and tablets, portrait-first, touch</td></tr>
    <tr><td><code>:app-tv</code></td><td><code>dev.quiblo.tv</code></td><td>Android TV and Google TV, landscape, remote only</td></tr>
  </tbody>
</table>
<p>They are separate application ids, not build flavours. That means two installs, two
databases and two launcher entries — and it means the phone APK installed on a television
runs but never appears in the TV launcher, because it declares no leanback launcher
category.</p>
<p>What they share is everything that is not a screen: the data layer, the database, the
source parsers, the player engine and every ViewModel. The television is a presentation
layer and nothing more. <a href="/wiki/architecture-overview">Architecture</a> explains how
that is enforced rather than merely intended.</p>`,
        },
        {
          id: 'not',
          title: 'What it is not',
          html: `
<p>These are decisions, not gaps. Each was considered and rejected, and the reasons are worth
knowing because they explain most of the architecture.</p>
<ul>
  <li><strong>Not a content service.</strong> The project hosts, indexes, bundles, aggregates
    and distributes zero streams. It ships with no default playlist, no channel directory,
    no "discover content" feature and no built-in provider list.</li>
  <li><strong>Not a backend.</strong> There is no server component, no user accounts, no
    telemetry, no cloud sync and no remote configuration. Nothing about the app can be
    changed by anyone other than the person holding the device.</li>
  <li><strong>Not a DRM client.</strong> No Widevine, no ClearKey, no PlayReady in v1. A DASH
    stream carrying Widevine will fail at the licence step, and that is correct behaviour
    rather than a bug to chase.</li>
  <li><strong>Not a downloader or recorder.</strong> No recording, no catch-up, no timeshift
    in v1.</li>
</ul>
<p>The first two are the load-bearing ones. Because there is no backend and no bundled
content, there is no infrastructure to fund, nothing to take down, and no position to
defend about what anyone is watching.</p>`,
        },
        {
          id: 'name',
          title: 'The name',
          html: `
<p>"Quiblo" is deliberately meaningless. It was chosen to avoid the "VIPTV" / "VIP TV"
namespace, which is saturated with paid subscription resellers — the distance from that
space is a legal and reputational asset rather than an accident, and the string should not
reappear in the package id, repository name, store listing or documentation.</p>
<p>It replaced an earlier name, Vibrato, in August 2026. Vibrato is a musical term, but the
first syllable carries an unfortunate second reading, and a name a user is reluctant to say
aloud is a bad name for a consumer application regardless of its etymology. The rename
happened before any release, which was the only free moment to do it: Android identifies an
app by its application id, so changing it after a release means existing installs cannot be
upgraded — they see a different app.</p>`,
        },
        {
          id: 'success',
          title: 'What "finished" means for v1.0',
          html: `
<p>The project has a written success condition, and it is deliberately concrete:</p>
<blockquote>
<p>A user installs the APK, adds either an M3U URL or Xtream credentials, browses categorised
Live/VOD/Series content, marks favourites, plays a stream full-screen, and exports their
configuration to a file — all offline-tolerant, with no account and no network call to any
host they did not enter themselves.</p>
<p>This must hold <strong>on a phone and on a television</strong>, with the television driven
by a remote alone.</p>
</blockquote>
<p>Everything in <a href="/wiki/acceptance">Acceptance</a> exists to make that testable rather
than a matter of opinion.</p>`,
        },
      ],
    },

    {
      slug: 'legal-and-licence',
      title: 'Licence and legal posture',
      summary:
        'Why GPLv3 and not GPLv2 or AGPL, and the position the project takes on content.',
      sections: [
        {
          id: 'gplv3',
          title: 'GPLv3, and why not the alternatives',
          html: `
<p>Quiblo is licensed under the <strong>GNU General Public License v3.0 or later</strong>. The
full, unmodified text is in <code>LICENSE</code>, and every source file carries a header —
a rule checked in CI over <code>git ls-files '*.kt'</code> rather than by hand.</p>
<h4>Why not GPLv2</h4>
<p>The dependency tree — Media3, Compose, all of AndroidX — is Apache-2.0. Apache-2.0 is
<em>incompatible</em> with GPLv2 and <em>compatible</em> with GPLv3. That alone settles it.
GPLv3 also carries an explicit patent grant and anti-tivoization terms, which satisfy the
requirement that the project stay open source through any downstream modification.</p>
<h4>Why not AGPLv3</h4>
<p>The AGPL's network clause only triggers when modified code is run as a hosted service.
This is a client with no server component, so the clause would never fire — and shipping it
would falsely signal a server project to anyone reading the licence first.</p>`,
        },
        {
          id: 'posture',
          title: 'The position on content',
          html: `
<p>The application is a general-purpose media player. It has no knowledge of what a user's
playlist contains and exercises no editorial control over it.</p>
<p>Two rules follow, and both are enforced rather than merely stated:</p>
<ul>
  <li><strong>The repository ships no playlist, no provider URL, no credentials, and no
    reference to where any of these may be obtained</strong> — including in tests, fixtures,
    issues and documentation. Test fixtures are synthetic; CI greps for provider URLs and for
    the forbidden brand string on every run.</li>
  <li><strong>The README states plainly that Quiblo supplies no content</strong>, and that
    users are responsible for the legality of the sources they configure. It must not link
    to, recommend, or describe how to obtain any playlist or provider.</li>
</ul>
<p>Synthetic test data uses <code>.invalid</code> hostnames (RFC 2606), so nothing in the
repository resolves even by accident.</p>`,
        },
        {
          id: 'privacy',
          title: 'Privacy, as an architectural rule',
          html: `
<p>Two of the project's architectural invariants are privacy properties, and they are held to
the same standard as any other correctness rule:</p>
<ul>
  <li><strong>The app never phones home.</strong> The only outbound traffic is to hosts the
    user explicitly configured. No analytics, no crash-reporting SDK, no update check against
    a project-controlled server. The optional metadata and channel-logo features are the only
    third-party hosts, both are off by default, and both are the user's own choice to
    enable.</li>
  <li><strong>Credentials never leave the device.</strong> Xtream usernames and passwords are
    stored encrypted in DataStore — never in the database, so a database export or a debug
    dump cannot leak them — and are never written to logs, exports or crash traces. The
    backup file says so on screen: "Passwords are never written to the file — you will
    re-enter them after importing."</li>
</ul>
<p>The permissions the app requests are <code>INTERNET</code> and
<code>ACCESS_NETWORK_STATE</code>. Two more arrive transitively — <code>WAKE_LOCK</code> from
Media3, which is what stops the screen sleeping mid-playback, and a self-scoped signature
permission from androidx that is not user-visible. There is no storage permission: file
export and import go through the system document picker, so the file lands wherever the user
chooses and the app never asks for access to anything else.</p>`,
        },
      ],
    },

    {
      slug: 'scope-and-freeze',
      title: 'Scope, and the freeze',
      summary:
        'How the project controls scope: one canonical document, and dated amendments to it.',
      sections: [
        {
          id: 'the-freeze',
          title: 'The freeze document',
          html: `
<p><code>docs/FREEZE.md</code> is the canonical description of the project. Any new
contributor — or any AI agent asked to work on the codebase — is given it first. Nothing
outside its scope is built until v1.0 ships.</p>
<p>It fixes the things that are expensive to change later: the licence, the language, the UI
toolkit, the player, the minimum Android version, which source protocols are supported,
which formats play, where data lives and how the app is distributed. It also lists what the
project is <em>not</em>, which turns out to be the more useful half.</p>
<p>The mechanism that makes it work is small: <strong>scope changes require an explicit,
dated amendment at the bottom of the file.</strong> Not an edit — an amendment, with its
reasoning and its cost written down. That makes scope changes visible and slightly
uncomfortable, which is the point.</p>`,
        },
        {
          id: 'locked',
          title: 'The locked decisions',
          html: `
<table>
  <thead><tr><th>Area</th><th>Decision</th></tr></thead>
  <tbody>
    <tr><td>Licence</td><td>GPLv3</td></tr>
    <tr><td>Language</td><td>Kotlin</td></tr>
    <tr><td>UI</td><td>Jetpack Compose, Material 3</td></tr>
    <tr><td>Player</td><td>AndroidX Media3 / ExoPlayer</td></tr>
    <tr><td>Platforms (v1)</td><td>Android phones, and Android TV / Google TV</td></tr>
    <tr><td>minSdk</td><td>30 (Android 11)</td></tr>
    <tr><td>Sources</td><td>M3U/M3U8 (remote URL and local file), Xtream Codes API</td></tr>
    <tr><td>EPG</td><td>Xtream only. M3U playlists carry no guide.</td></tr>
    <tr><td>Formats</td><td>HLS, DASH, raw MPEG-TS, progressive MP4/MKV. No DRM.</td></tr>
    <tr><td>Content types</td><td>Live TV, VOD, Series</td></tr>
    <tr><td>Storage</td><td>Local only (Room), with manual export/import to a file</td></tr>
    <tr><td>Distribution</td><td>GitHub Releases (APK)</td></tr>
    <tr><td>Network</td><td>Direct client-to-provider. No proxy, no relay, no intermediary.</td></tr>
  </tbody>
</table>`,
        },
        {
          id: 'amendments',
          title: 'The amendments so far',
          html: `
<p>Four, all in August 2026. Each carries its decision, its rationale, what it costs and what
it explicitly does not change.</p>
<h4>Amendment 1 — Android TV and Google TV enter v1</h4>
<p>The "not a TV app in v1" non-goal was withdrawn. The argument was that the architectural
invariants had been written so a TV frontend would be cheap, and that this had now been
<em>demonstrated</em> rather than assumed — the existing engine was confirmed running on the
target television before the amendment was written. The cost was stated plainly: v1.0 no
longer ships when the phone app is ready, it ships when both are, and the acceptance sweep
roughly doubles.</p>
<h4>Amendment 2 — DASH joins the supported formats</h4>
<p>A small one, included because it shows the mechanism working for minor changes too. The
omission had been arbitrary rather than principled: HLS, TS and progressive were chosen
because that is what IPTV panels serve, and a provider that happened to serve DASH would hit
"format not supported" for no better reason than a missing dependency.</p>
<h4>Amendment 3 — the rename to Quiblo</h4>
<p>See <a href="/wiki/what-is-quiblo#name">the name</a>. Timed before any release, because
after one it would have been impossible without orphaning every install.</p>
<h4>Amendment 4 — the television gets the screens that make Amendment 1 true</h4>
<p>The most interesting of the four, because it is written as an admission rather than an
expansion. A bug report showed that on a television a viewer could not open a film, could not
see a series' episodes, could not reach any setting, and could not filter a list of 11,923
channels. Amendment 1 had claimed the TV was "the same player with a different frontend"; it
was not. The amendment records that this is <em>less an expansion of scope than an admission
that Amendment 1's scope was never delivered</em>, and adds five acceptance criteria to prove
it next time.</p>`,
        },
        {
          id: 'invariants',
          title: 'The architectural invariants',
          html: `
<p>Six rules that must hold at every commit. A change that breaks one is a design regression
regardless of whether the tests pass.</p>
<ol>
  <li><strong>No UI code in <code>:core:*</code>.</strong> No Compose import, no Android
    <code>Context</code> beyond what Room and DataStore require. This is checked at build
    time, not by review.</li>
  <li><strong>The source layer is abstracted.</strong> <code>MediaSource</code> is an
    interface; M3U and Xtream are implementations. Adding a protocol means adding one
    implementation and changing zero feature modules.</li>
  <li><strong>EPG is source-agnostic.</strong> Only Xtream supplies programme data in v1, but
    the storage and query layer accepts programmes from any provider, so adding XMLTV later
    needs no schema migration.</li>
  <li><strong>Playback is behind an interface.</strong> Feature code never touches ExoPlayer
    directly; it talks to a <code>PlayerController</code>. This is the seam where DRM slots
    in later.</li>
  <li><strong>The app never phones home.</strong></li>
  <li><strong>Credentials never leave the device.</strong></li>
</ol>
<p>Invariants 1 and 2 are why the television frontend cost a presentation layer instead of a
second application. Invariant 4 is why adding DRM later is a contained change. Invariants 5
and 6 are the privacy posture, stated as engineering rules so they can be tested.</p>`,
        },
      ],
    },

    {
      slug: 'history',
      title: 'History, and what it taught',
      summary:
        'The provider blocks, the feature audit and the rename — three episodes that shaped the codebase.',
      sections: [
        {
          id: 'why',
          title: 'Why a history page',
          html: `
<p>Three episodes in this project's short life left permanent marks on the code. Someone
reading the codebase cold will find guards, tests and comments that look excessive without
knowing what they are for — and will eventually remove one. This page is why they are
there.</p>`,
        },
        {
          id: 'blocks',
          title: 'The provider blocks',
          html: `
<p>Twice, the test account was blocked by its provider's firewall. Not rate-limited —
blocked, returning HTTP 469 (a private XC_VM anti-flood code) on every API call, from every
port, from plain curl outside the app. Streams still played; the catalogue and guide did
not.</p>
<p>The app caused it, and the second time is the instructive one, because the first fix
looked complete.</p>
<p>Guide prefetch is the only thing that issues requests in bulk — one <code>get_short_epg</code>
per channel — so it is the only thing that can get an account flagged. After the first block
the fetches were capped at three concurrent, which sounds modest. It is not:</p>
<blockquote><p><strong>A concurrency cap is not a rate limit.</strong> Three in flight at
100&nbsp;ms each is about thirty requests a second.</p></blockquote>
<p>Combined with a prefetch that fired per row <em>entering composition</em> — and a fling
composes hundreds of rows in seconds — that is a flood. The television had a focus-settle
delay for exactly this reason and the phone did not.</p>
<p>Four guards exist now, and all four are easy to remove by accident:</p>
<ol>
  <li><strong>Prefetch fires on scroll settling</strong>, not on composition. Rows flown past
    are not rows anyone read.</li>
  <li><strong>A token bucket in <code>PanelRateLimiter</code></strong>, applied inside
    <code>XtreamClient.request</code> so every call passes it: a burst of 8, refilling one per
    400&nbsp;ms. The burst matters — a refresh is auth plus six catalogue calls and must not
    be slowed — and the refill is the backstop that survives a future caller reintroducing a
    storm from a new screen.</li>
  <li><strong>A block gate in <code>XtreamSource</code></strong>, covering refresh, guide,
    series details and film details alike. The catalogue walk stops at the first refusal;
    four of its seven calls used to swallow a block as "this account has no films" and carry
    on.</li>
  <li><strong>The backoff is persisted.</strong> The first thing a blocked user does is
    force-stop the app and reopen it, which used to clear an in-memory deadline and send it
    straight back to asking.</li>
</ol>
<p>There are tests asserting that after one block not a further byte is sent, that a
mid-catalogue block ends the refresh at four requests, and that a stored block survives a
restart. <strong>Keep them.</strong></p>`,
        },
        {
          id: 'audit',
          title: 'The feature audit',
          html: `
<p>Several feature branches were merged with a README feature matrix advertising nine things
that had <em>no path to them from a running app</em>: an EPG grid, a zap bar, a
continue-watching row, theme palettes, timeshift, buffer modes, a bitrate cap, aspect ratio
modes and a seek interval.</p>
<p>The settings screen that supposedly configured four of them wrote to <code>remember</code>
state that was never persisted, and two of its four controls had an empty
<code>onClick</code> with a hardcoded selection. Picture-in-picture could never have worked:
the manifest flag was absent, so the call threw into a bare <code>catch</code> every
time.</p>
<p>The decision taken was to <strong>delete the hollow features and correct the README</strong>
rather than finish them under pressure. Anything deleted is recoverable from history, so a
later request to bring one back means implementing it properly, not reverting a deletion.</p>
<p>The test the audit used has become the project's standard for whether a feature exists:</p>
<blockquote><p><strong>Can you reach it from a running app, and does changing it change what
you see?</strong></p></blockquote>
<p>It is why <a href="/wiki/television#settings">the television settings screen</a> omits
theme mode instead of showing a switch that does nothing, and why the acceptance criterion
for that screen is worded as "changing one changes what the app does — not merely what the
screen says".</p>`,
        },
        {
          id: 'lessons',
          title: 'What the three have in common',
          html: `
<p>Each was a case of something looking finished from the inside.</p>
<p>The concurrency cap looked like a rate limit. The settings screen looked like it
configured the player. The TV app looked like a frontend of the phone app. In all three the
gap was only visible from outside — from the provider's firewall, from a user pressing the
control, from a viewer holding a remote.</p>
<p>That is the reasoning behind
<a href="/wiki/acceptance">binary acceptance criteria</a> and behind the
<a href="/wiki/acceptance#sweep">sweep</a> being a separate document that records what was
actually observed on hardware, as opposed to what the code appears to do.</p>`,
        },
      ],
    },
  ],
};
