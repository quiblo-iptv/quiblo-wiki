import type { WikiPart } from '../core/wiki.model';

export const ORIENTATION: WikiPart = {
  id: 'orientation',
  title: 'Orientation',
  blurb:
    'What Quiblo is, what it deliberately is not, why we licensed it the way we did, and what we learned building it. Start here if you have never seen it before.',
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
  <li><strong>Not a content service.</strong> We host, index, bundle, aggregate and distribute zero streams. It ships with no default playlist, no channel directory,
    no "discover content" feature and no built-in provider list.</li>
  <li><strong>Not a backend.</strong> There is no server component, no user accounts, no
    telemetry, no cloud sync and no remote configuration. Nothing about the app can be
    changed by anyone other than the person holding the device.
    <a href="/wiki/profiles">Profiles</a> are not an exception: they are rows in the local
    database with no password and no server behind them, and they answer "whose favourites
    are these" rather than "who is allowed to sign in".</li>
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
<p>"Quiblo" is deliberately meaningless. We chose it to stay clear of the "VIPTV" / "VIP TV"
namespace, which is saturated with paid subscription resellers — distance from that space is
a legal and reputational asset rather than an accident, and the string should not appear in
the package id, repository name, store listing or documentation.</p>
<p>A name that is hard to mistake for a service is exactly what a player wants. Quiblo is
software; what you point it at is yours.</p>`,
        },
      ],
    },

    {
      slug: 'legal-and-licence',
      title: 'Licence and legal posture',
      summary:
        'Why GPLv3 and not GPLv2 or AGPL, and the position we take on content.',
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
<p>Two of our architectural invariants are privacy properties, and they are held to
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
      slug: 'terms',
      title: 'Terms of use',
      summary:
        'What Quiblo is, what you are responsible for, and where your data goes. The page the app links to.',
      sections: [
        {
          id: 'summary',
          title: 'The short version',
          html: `
<p>Quiblo is a media player. <strong>It ships with no content and no way to find any</strong>,
you supply your own sources and are responsible for them, and nothing you enter leaves your
device except to the servers you named yourself.</p>
<p>The rest of this page is that in full. It is the page the app links to when it first
opens, and it is deliberately short enough to read.</p>`,
        },
        {
          id: 'no-content',
          title: 'Quiblo supplies no content',
          html: `
<p>This app ships with <strong>no playlists, no channel list, no provider directory, and no
way to find any</strong>. It is a player, in the same category as VLC or mpv. It has no
knowledge of what your playlist contains and exercises no control over it.</p>
<p><strong>You are solely responsible for the sources you configure and for the legality of
accessing them where you live.</strong> If you do not already have a playlist or an IPTV
subscription, this app is of no use to you, and the project will not help you find one.</p>
<p>Requests for sources, providers or bundled content are closed without discussion. Posting
a playlist URL, provider hostname or credential anywhere in the project results in an
immediate ban.</p>`,
        },
        {
          id: 'data',
          title: 'Where your data goes',
          html: `
<p>Nowhere. That is not a promise made in a policy — each line below is an architectural rule
the code is held to, and two of them fail the build if broken.</p>
<ul>
  <li><strong>There is no account and no server of ours.</strong> Quiblo has no backend. There
    is nothing to sign up for and nothing to sign in to.</li>
  <li><strong>The app never phones home.</strong> The only outbound traffic goes to hosts you
    entered yourself. No analytics, no crash-reporting service, no update check against a
    server we control — which is also why the app cannot update itself.</li>
  <li><strong>Credentials never leave the device.</strong> Xtream usernames and passwords are
    stored encrypted, and are never written to logs, exports or crash traces. Export a backup
    and the passwords are not in it; the app says so on the screen where you make one.</li>
  <li><strong>Everything else is local too</strong> — your sources, favourites, watch history
    and profiles live in a database on the device and are not copied anywhere.</li>
  <li><strong>Two features reach a third party, both off until you turn them on:</strong>
    film and series information, and channel logo lookup. Each needs a key or a switch from
    you, and neither sends anything about you — only the title being looked up.</li>
</ul>
<p>The permissions the app asks for are <code>INTERNET</code> and
<code>ACCESS_NETWORK_STATE</code>. There is no storage permission: files are read and written
through the system picker, so a file lands where you put it.</p>`,
        },
        {
          id: 'warranty',
          title: 'What is not warranted',
          html: `
<p>Quiblo is free software under the GPLv3, and that licence's sections 15 and 16 say this in
legal language. In plain words: <strong>the software is provided as-is, with no warranty of
any kind</strong>, and the people who wrote it are not liable for damages arising from using
it.</p>
<p>That is the standard free-software position and it is not a disclaimer of responsibility
for the code's quality — see <a href="/wiki/acceptance">how this project decides something
works</a>. It means nobody is promising the app will suit your purpose, and nobody is
underwriting what happens if it does not.</p>`,
        },
        {
          id: 'no-gate',
          title: 'No age gate, and no regional filter',
          html: `
<p>Quiblo does not check who you are or where you are, and this is a decision rather than an
omission.</p>
<p>The app has no server, no accounts and no way to verify anything about anybody. A control
that appears to restrict access while verifying nothing is worse than no control at all: it
offers false assurance to a parent and no obstacle to anyone else. The same reasoning keeps a
parental PIN out of the app.</p>
<p>What you watch, and who in your household can reach it, is therefore yours to manage.
<a href="/wiki/profiles">Profiles</a> separate favourites and history between people; they are
a convenience, not a security control, and the app says so where they are created.</p>`,
        },
        {
          id: 'changes',
          title: 'If these terms change',
          html: `
<p>This page carries a version. When it changes in a way that affects what you agreed to, the
app asks again on the next launch rather than changing the terms underneath you. A correction
to wording does not.</p>
<p>The page is part of the wiki, which lives in a public repository — so every change to it
has a commit, a date and an author, and you can read what changed rather than take our word
for it.</p>`,
        },
      ],
    },

    {
      slug: 'scope-and-principles',
      title: 'Scope and principles',
      summary:
        'What we decided once and stopped relitigating, and the rules the code is held to.',
      sections: [
        {
          id: 'why-scope',
          title: 'Why we fix scope early',
          html: `
<p>A media player is a project with no natural edge. There is always one more format, one
more protocol, one more screen. We settled the expensive decisions early — the licence, the
language, the toolkit, the player, the minimum Android version, which protocols and formats
we support, where data lives, how we ship — and wrote them down.</p>
<p>The more useful half turned out to be the list of things we are <em>not</em> building. It
answers most design questions before they are asked, and it is why the architecture looks the
way it does.</p>`,
        },
        {
          id: 'decisions',
          title: 'The decisions',
          html: `
<table>
  <thead><tr><th>Area</th><th>Decision</th></tr></thead>
  <tbody>
    <tr><td>Licence</td><td>GPLv3</td></tr>
    <tr><td>Language</td><td>Kotlin</td></tr>
    <tr><td>UI</td><td>Jetpack Compose, Material 3</td></tr>
    <tr><td>Player</td><td>AndroidX Media3 / ExoPlayer</td></tr>
    <tr><td>Platforms</td><td>Android phones, and Android TV / Google TV</td></tr>
    <tr><td>minSdk</td><td>30 (Android 11)</td></tr>
    <tr><td>Sources</td><td>M3U/M3U8 (remote URL and local file), Xtream Codes API</td></tr>
    <tr><td>Guide</td><td>Xtream only. M3U playlists carry no schedule.</td></tr>
    <tr><td>Formats</td><td>HLS, DASH, raw MPEG-TS, progressive MP4/MKV. No DRM.</td></tr>
    <tr><td>Content types</td><td>Live TV, films, series</td></tr>
    <tr><td>Storage</td><td>Local only (Room), with manual export and import to a file</td></tr>
    <tr><td>Distribution</td><td>GitHub Releases (APK)</td></tr>
    <tr><td>Network</td><td>Direct client-to-provider. No proxy, no relay, no intermediary.</td></tr>
  </tbody>
</table>
<p>Two of those deserve their reasoning. <strong>No DRM:</strong> M3U and Xtream providers
overwhelmingly serve unencrypted streams, so DRM is substantial engineering work serving a
near-empty use case here. <strong>Phones before television:</strong> identical data layer, far
faster iteration, and none of the D-pad focus cost — the television inherits every
<code>:core:*</code> module unchanged.</p>`,
        },
        {
          id: 'invariants',
          title: 'The architectural invariants',
          html: `
<p>Six rules that hold at every commit. A change that breaks one is a design regression
regardless of whether the tests pass.</p>
<ol>
  <li><strong>No UI code in <code>:core:*</code>.</strong> No Compose import, no Android
    <code>Context</code> beyond what Room and DataStore require. We check this at build time,
    not in review.</li>
  <li><strong>The source layer is abstracted.</strong> <code>MediaSource</code> is an
    interface; M3U and Xtream are implementations. Adding a protocol means adding one
    implementation and changing zero feature modules.</li>
  <li><strong>The guide is source-agnostic.</strong> Only Xtream supplies programme data
    today, but the storage and query layer accepts programmes from any provider, so adding
    XMLTV later needs no schema migration.</li>
  <li><strong>Playback is behind an interface.</strong> Feature code never touches ExoPlayer;
    it talks to a <code>PlayerController</code>. That is the seam where DRM would slot in.</li>
  <li><strong>The app never phones home.</strong></li>
  <li><strong>Credentials never leave the device.</strong></li>
</ol>
<p>Rules 1 and 2 are why our television frontend cost a presentation layer instead of a second
application. Rules 5 and 6 are the privacy posture, written as engineering rules so we can
test them rather than merely intend them.</p>`,
        },
        {
          id: 'success',
          title: 'What we mean by finished',
          html: `
<blockquote>
<p>A user installs the APK, adds either an M3U URL or Xtream credentials, browses categorised
live, film and series content, marks favourites, plays a stream full-screen, and exports their
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
      slug: 'what-we-learned',
      title: 'What we learned',
      summary:
        'Three episodes that left permanent marks on the code, and why the guards you will find are there.',
      sections: [
        {
          id: 'why',
          title: 'Why this page exists',
          html: `
<p>Someone reading this codebase cold will find guards, tests and comments that look excessive
without knowing what they are for — and will eventually remove one. This page is why they are
there.</p>`,
        },
        {
          id: 'blocks',
          title: 'Getting an account blocked, twice',
          html: `
<p>Twice, our test account was blocked by its provider's firewall. Not rate-limited — blocked,
returning an error on every API call, from every port, from plain curl outside the app.
Streams still played; the catalogue and the guide did not.</p>
<p>We caused it, and the second time is the instructive one, because the first fix looked
complete.</p>
<p>Guide prefetch is the only thing that issues requests in bulk — one call per channel — so it
is the only thing that can get an account flagged. After the first block we capped the fetches
at three concurrent, which sounds modest. It is not:</p>
<blockquote><p><strong>A concurrency cap is not a rate limit.</strong> Three in flight at
100&nbsp;ms each is about thirty requests a second.</p></blockquote>
<p>Combined with a prefetch that fired per row <em>entering composition</em> — and a fling
composes hundreds of rows in seconds — that is a flood. The television had a focus-settle
delay for exactly this reason and the phone did not.</p>
<p>Four guards exist now, and all four are easy to remove by accident:</p>
<ol>
  <li><strong>Prefetch fires on scroll settling</strong>, not on composition. Rows flown past
    are not rows anyone read.</li>
  <li><strong>A token bucket inside the client's request path</strong>, so every call passes
    it: a burst of eight, refilling one per 400&nbsp;ms. The burst matters — a refresh is
    authentication plus six catalogue calls and must not be slowed — and the refill is the
    backstop that survives a future caller reintroducing a storm from a screen nobody has
    written yet.</li>
  <li><strong>A block gate covering every call path</strong>: refresh, guide, series details
    and film details alike. The catalogue walk stops at the first refusal; four of its seven
    calls used to swallow a block as "this account has no films" and carry on.</li>
  <li><strong>The backoff is persisted.</strong> The first thing a blocked user does is
    force-stop the app and reopen it, which used to clear an in-memory deadline and send it
    straight back to asking.</li>
</ol>
<p>We keep tests asserting that after one block not a further byte is sent, that a
mid-catalogue block ends a refresh at four requests, and that a stored block survives a
restart. <strong>Keep them.</strong></p>`,
        },
        {
          id: 'audit',
          title: 'The features that were not there',
          html: `
<p>At one point our own feature list advertised nine things that had <em>no path to them from
a running app</em>: a guide grid, a zap bar, a continue-watching row, theme palettes,
timeshift, buffer modes, a bitrate cap, aspect ratio modes and a seek interval.</p>
<p>The settings screen that supposedly configured four of them wrote to state that was never
persisted, and two of its four controls had an empty click handler with a hardcoded selection.
Picture-in-picture could never have worked: the manifest flag was absent, so the call threw
into a bare <code>catch</code> every time.</p>
<p>We deleted the hollow features and corrected the list rather than finishing them under
pressure. Anything deleted is recoverable from history, so bringing one back later means
implementing it properly, not reverting a deletion.</p>
<p>The test we used has become our standard for whether a feature exists:</p>
<blockquote><p><strong>Can you reach it from a running app, and does changing it change what
you see?</strong></p></blockquote>
<p>It is why <a href="/wiki/television#settings">the television settings screen</a> omits theme
mode instead of showing a switch that does nothing, and why our acceptance criterion for that
screen is worded as "changing one changes what the app does — not merely what the screen
says".</p>`,
        },
        {
          id: 'unrun',
          title: 'The checks that had never run',
          html: `
<p>For most of this project's life there was a CI workflow in the repository and no remote to
run it on. It described a thorough gate: assemble, test, detekt, coverage, Lint, licence
headers.</p>
<p>The first run to actually execute failed on the first step, because <code>gradlew</code> had
been committed without its executable bit from a system that has no such bit. Behind that,
<code>detektAll</code> had been broken for its entire existence without anyone noticing, and
the acceptance sweep described the licence-header check as "re-checked on every CI run" when
it had only ever been run by hand.</p>
<blockquote><p><strong>An unrun check and a passing check look identical from the inside.</strong>
Both produce no failures.</p></blockquote>
<p>This is why the wiki distinguishes what is verified mechanically from what has been seen
working, and why <a href="/wiki/acceptance#sweep">the sweep</a> grades its evidence instead of
listing ticks. A claim about what is checked is worth exactly as much as the last time
somebody watched the check fail on purpose.</p>`,
        },
        {
          id: 'lessons',
          title: 'What the three have in common',
          html: `
<p>Each was a case of something looking finished from the inside.</p>
<p>The concurrency cap looked like a rate limit. The settings screen looked like it configured
the player. The CI workflow looked like a gate. In every case the gap was only visible from
outside — from the provider's firewall, from a user pressing the control, from a runner that
had never been asked to try.</p>
<p>The same shape keeps recurring in smaller ways, which is the useful part. A token bucket
that <a href="/wiki/source-layer#bucket-arithmetic">paced requests at twice its documented
rate</a> for its whole life. A Koin module whose arguments
<a href="/wiki/testing#wiring">had shifted by one</a> and compiled perfectly. A player retry
loop that <a href="/wiki/player#stutter">succeeded every time</a> and so never surfaced an
error, while stuttering every few seconds.</p>
<p>None of those could be found by reading the code, because in each case the code said what
its author meant. That is the reasoning behind
<a href="/wiki/acceptance">binary acceptance criteria</a>, behind measuring rather than
arguing, and behind keeping a separate record of what was actually observed on hardware as
opposed to what the code appears to do.</p>`,
        },
      ],
    },
  ],
};
