import type { WikiPart } from '../core/wiki.model';

export const ENGINEERING: WikiPart = {
  id: 'engineering',
  title: 'Engineering practice',
  blurb:
    'How the project is built, tested, measured, accepted and released — and the conventions a contributor is expected to follow.',
  pages: [
    {
      slug: 'build-and-tooling',
      title: 'Build and tooling',
      summary: 'Gradle convention plugins, the quality gates, and the one command that matters.',
      sections: [
        {
          id: 'conventions',
          title: 'Convention plugins',
          html: `
<p>Build configuration lives in <code>build-logic</code> as a set of convention plugins rather
than being copied across thirty build files:</p>
<table>
  <thead><tr><th>Plugin</th><th>Applied to</th></tr></thead>
  <tbody>
    <tr><td><code>quiblo.android.application</code></td><td>The two apps</td></tr>
    <tr><td><code>quiblo.android.library</code></td><td>Android libraries</td></tr>
    <tr><td><code>quiblo.android.feature</code></td><td>Feature modules — library plus Compose</td></tr>
    <tr><td><code>quiblo.android.core</code></td><td>Core modules</td></tr>
    <tr><td><code>quiblo.jvm.library</code></td><td>Pure-JVM modules, and where <code>enforceNoCompose()</code> lives</td></tr>
    <tr><td><code>quiblo.detekt</code></td><td>Static analysis</td></tr>
  </tbody>
</table>
<p>Test dependencies — JUnit 5, coroutines-test, Turbine, MockK — come from the library and
application plugins, so a module with tests never has to declare them. That sounds
bureaucratic until you learn that <code>:app</code> once had <em>no test framework on its
classpath at all</em>, so any test added under <code>app/src/test</code> simply failed to
compile.</p>`,
        },
        {
          id: 'gate',
          title: 'The gate',
          html: `
<p>One command, and it is the only thing that counts:</p>
<pre><code>./gradlew build detektAll coverageAll lint</code></pre>
<p>It compiles everything, runs every unit test, runs detekt across all modules, checks
coverage thresholds and runs Android Lint.</p>
<blockquote><p><strong>The local gate is the only gate.</strong> The repository has no git
remote, so the CI workflow has never executed. Anything it would catch is uncaught until the
first push — <code>detektAll</code> was broken for its entire existence and nobody knew,
because nothing ever invoked it.</p></blockquote>
<p>Say "CI status is unknown" rather than implying it passed. That is not pedantry; it is the
difference between a green build and a green build <em>you have seen</em>.</p>`,
        },
        {
          id: 'gotchas',
          title: 'Two build gotchas',
          html: `
<p><strong>The Gradle daemon outlives your shell.</strong> If unit tests die with
<code>Could not find or load main class &lt;a fragment of your PATH&gt;</code>, the daemon is
holding an inherited PATH containing a stray quote. <code>./gradlew --stop</code> and let a
fresh one start. Because the daemon is long-lived, a bad PATH from one shell persists across
sessions — including into a session that has done nothing wrong.</p>
<p><strong>Room's schema JSON is generated and committed.</strong> After changing an entity,
build the database module so the new schema file is written, and commit it. Room validates
the live database against it at open time, so a mismatch fails at launch rather than
subtly.</p>`,
        },
      ],
    },

    {
      slug: 'testing',
      title: 'Testing',
      summary: 'What is tested, what deliberately is not, and how to write a test that holds.',
      sections: [
        {
          id: 'shape',
          title: 'The shape of the suite',
          html: `
<p>JUnit 5 with MockK, and Turbine for flows. DAOs are mocked rather than exercised against a
real SQLite — there is no Robolectric in the project, and adding it to assert one query plan
would be more infrastructure than the question is worth.</p>
<p>Coverage thresholds apply where they mean something. The two parsers carry the highest
coverage in the project — <code>:source:m3u</code> around 98%, <code>:source:xtream</code>
around 84% — because they are pure JVM, deterministic, and face hostile input. UI modules are
not chased for coverage, because a covered composable proves very little.</p>`,
        },
        {
          id: 'load-bearing',
          title: 'The load-bearing tests',
          html: `
<p>Some tests exist to catch a specific historical failure and should never be deleted for
tidiness:</p>
<ul>
  <li><strong>The block-gate tests</strong> — that after one refusal not a further byte is
    sent, that a mid-catalogue block ends a refresh at four requests, and that a stored block
    survives a restart.</li>
  <li><strong>The rate-limiter tests</strong> — the burst size and the refill pacing.</li>
  <li><strong>The off-main-thread test</strong> — that the browse mapping leaves the
    collector's thread.</li>
  <li><strong>The key-map tests</strong> — that the television's channel keys do nothing on a
    film, and that the settings icon is reachable past the last tab.</li>
</ul>`,
        },
        {
          id: 'writing',
          title: 'Two habits worth copying',
          html: `
<h4>Assert the mechanism, not the symptom</h4>
<p>The test that the browse mapping runs off the main thread pins the <em>thread</em>, not the
elapsed time. A timing assertion would pass on a fast machine with the bug fully
reintroduced; a thread assertion fails the moment the <code>flowOn</code> is removed.</p>
<p>To make that testable at all, the dispatcher is injected rather than hardcoded — the same
trick the repositories use for the clock. Injecting a dependency purely so a test can observe
it is a legitimate reason to inject it.</p>
<h4>Make a negative test prove itself</h4>
<p>A test asserting that something is <em>not</em> called passes trivially if the code under
test never ran. The guide-subscription tests pair each negative with a positive on the same
machinery: films and series must not ask for the guide, <em>and</em> Live and Favourites
must. The positives prove the negatives are not vacuous.</p>
<p>This was not hypothetical. The first version of those tests passed for the wrong reason —
the mocked flows never emitted, so the chain never ran at all.</p>`,
        },
      ],
    },

    {
      slug: 'performance',
      title: 'Performance',
      summary: 'What has been measured, on what, and the numbers worth comparing against.',
      sections: [
        {
          id: 'targets',
          title: 'The hardware that matters',
          html: `
<p>The weakest device the project runs on sets the bar: a Google TV box on Android 14 with
<strong>1.84&nbsp;GB of RAM and a 32-bit ARM ABI</strong>, rendering at 1080p.</p>
<blockquote><p><strong>No phone performance figure transfers to it.</strong> Nor does an
emulator's: a television emulator is x86_64 with desktop memory. It is good for proving a
screen composes and focus moves, and worthless for anything timed.</p></blockquote>`,
        },
        {
          id: 'numbers',
          title: 'What has been measured',
          html: `
<p>Against a synthetic 20,000-entry playlist served over a loopback tunnel, on a mid-range
tablet, in a minified release build:</p>
<table>
  <thead><tr><th>Measure</th><th>Result</th></tr></thead>
  <tbody>
    <tr><td>Ingest 20,002 entries</td><td>~4 s end to end</td></tr>
    <tr><td>Cold start, populated database</td><td>Median 445 ms against a 2000 ms budget</td></tr>
    <tr><td>Cold start on Android 11</td><td>Median 328 ms</td></tr>
    <tr><td>Scroll, six hard flings</td><td>5.93% janky; 90th percentile 28 ms, 95th 36 ms</td></tr>
  </tbody>
</table>
<p>Loading twenty thousand channels costs nothing at startup, which matches the architecture:
Koin starts, Room is built lazily, and nothing queries the database before the first
frame.</p>
<p>Two earlier readings looked alarming and were both artefacts, recorded so nobody re-derives
them: the <em>first</em> launch after install took 1590 ms — one-time dexopt and ART warmup —
and a debug build took ~1850 ms, which is unminified-build overhead rather than data
volume.</p>`,
        },
        {
          id: 'stale',
          title: 'What is now stale',
          html: `
<p>Those figures predate the indexing and threading fixes in
<a href="/wiki/data-flow#defects">the browse path</a>. They need re-running, and the
direction of the change is not obvious:</p>
<ul>
  <li>Every emission after the first is <em>cheaper</em> — no table scan, no temporary sort,
    no main-thread mapping.</li>
  <li>The <em>first launch after upgrading</em> is more expensive, because schema 10 builds
    two indices over the whole playlist. That cost is not in the old numbers.</li>
</ul>
<p>The jank baseline is the number to compare against after any change to a browse list.</p>`,
        },
        {
          id: 'how',
          title: 'How to measure',
          html: `
<p>Cold start: <code>force-stop</code>, launch, read <code>TotalTime</code>, repeat six times,
report the median — never the first run after an install.</p>
<p>Jank: reset <code>gfxinfo</code>, scroll deliberately, read the percentiles back. On a
television, "scroll" means holding the D-pad, which moves faster than any finger.</p>
<p>Requests to a provider: count them <strong>at the source</strong>, not by eye. The whole
class of bug that got this project's account blocked is invisible from the UI.</p>`,
        },
      ],
    },

    {
      slug: 'acceptance',
      title: 'Acceptance',
      summary:
        'Binary criteria, a definition of done, and a sweep that records what was actually observed.',
      sections: [
        {
          id: 'criteria',
          title: 'Criteria, not intentions',
          html: `
<p><code>docs/ACCEPTANCE.md</code> holds numbered, binary criteria grouped by area: playlists,
Xtream, guide, playback, favourites, data, non-functional, television, legal. Each is worded
so it either passes or does not.</p>
<p>The wording is doing real work. Compare:</p>
<ul>
  <li><em>"Settings work on the television"</em> — unfalsifiable.</li>
  <li><em>"Every setting the phone offers is reachable and changeable on the television, and
    changing one changes what the app does — not merely what the screen says"</em> — a
    criterion that <a href="/wiki/history#audit">the hollow settings screen</a> would have
    failed.</li>
</ul>`,
        },
        {
          id: 'dod',
          title: 'The definition of done',
          html: `
<p>Every criterion passes on:</p>
<ul>
  <li>a physical <strong>Android 11</strong> device,</li>
  <li>a physical <strong>Android 14</strong> device,</li>
  <li>and a physical <strong>Android TV</strong>, driven by its remote alone,</li>
</ul>
<p>each with both an M3U source and an Xtream source configured, on a fresh install and on an
upgrade.</p>
<p><strong>A green phone sweep is not a v1.0.</strong> Since the television entered scope,
there are three rows and the release waits for all of them.</p>`,
        },
        {
          id: 'sweep',
          title: 'The sweep, and why it is a separate document',
          html: `
<p><code>docs/ACCEPTANCE-SWEEP.md</code> records what has actually been verified, on what, and
what is left. It is deliberately a different document from the criteria, because they answer
different questions: one is "what must be true", the other is "what have we seen".</p>
<p>It distinguishes three grades of evidence, and the distinction is the point:</p>
<ol>
  <li><strong>Verified mechanically</strong> — enforced by the build and re-checked on every
    run. Licence headers, the no-Compose rule, coverage, APK size.</li>
  <li><strong>Seen working on an emulator</strong> — enough to know a screen composes and
    focus moves. Not enough for anything timed, and not enough for anything involving a
    device's own IME.</li>
  <li><strong>Swept on hardware</strong> — the only grade that counts towards the definition
    of done.</li>
</ol>
<p>It also records <em>stale</em> results explicitly, rather than quietly leaving old numbers
looking current. A figure measured before the code changed is not evidence about the code as
it stands.</p>`,
        },
      ],
    },

    {
      slug: 'release',
      title: 'Releasing',
      summary: 'Two APKs, one signing key, and the trap that makes a test build unshippable.',
      sections: [
        {
          id: 'artifacts',
          title: 'What ships',
          html: `
<p>Two APKs per release — the phone build and the television build — published to GitHub
Releases. There is no store listing and no update check.</p>
<p>Both are R8-minified and both are size-budgeted. The television APK being <em>smaller</em>
than the phone's, despite depending on every feature module, is the standing confirmation
that R8 really does strip the phone UI it never references.</p>`,
        },
        {
          id: 'signing',
          title: 'Signing, and the one-way door',
          html: `
<blockquote><p><strong>A release APK signed with the Android debug key installs fine and can
never be upgraded over a properly-signed install.</strong></p></blockquote>
<p>Debug-key signing is genuinely useful for testing a minified build — R8 changes behaviour,
so a debug build is not the same artefact. But an APK signed that way must never reach a
user, because the day a real release is signed, everyone holding a debug-signed build has to
uninstall and lose their configuration.</p>
<p>Anything handed to a tester should be labelled with which key signed it.</p>`,
        },
        {
          id: 'process',
          title: 'The process',
          html: `
<ol>
  <li>Run the gate. It is the only gate.</li>
  <li>Run the acceptance sweep on all three targets. Record results in the sweep document,
    including what was <em>not</em> covered.</li>
  <li>Build both release APKs and check them against the size budget.</li>
  <li>Sign with the real key.</li>
  <li>Tag, and publish both artefacts.</li>
</ol>
<p>The upgrade half of the definition of done cannot apply to v1.0.0 — there is no previous
release to upgrade from. It becomes live at v1.0.1.</p>`,
        },
      ],
    },

    {
      slug: 'contributing',
      title: 'Contributing',
      summary: 'Branching, commits, and the standard a change is held to.',
      sections: [
        {
          id: 'workflow',
          title: 'Workflow',
          html: `
<ul>
  <li><strong>Bug fixes</strong> on a <code>fix/…</code> branch; <strong>features</strong> on a
    <code>feat/…</code> branch. Merge to <code>main</code> only after the gate is green.</li>
  <li><strong>Commit after each self-contained step</strong>, not once at the end of a body of
    work. A commit that does one thing can be read, reverted and bisected; one that does six
    cannot.</li>
  <li>Read <code>docs/FREEZE.md</code> first. A change outside its scope needs a dated
    amendment, not an argument in a pull request.</li>
</ul>`,
        },
        {
          id: 'commits',
          title: 'Commit messages',
          html: `
<p>Conventional prefixes — <code>feat</code>, <code>fix</code>, <code>docs</code>,
<code>refactor</code>, with a scope where it helps (<code>fix(tv):</code>).</p>
<p>The body should say <strong>why</strong>, and specifically what was wrong before. A message
reading "fixed the settings screen" is worth nothing six months later; one that says the gear
had no click handler <em>and</em> could not be reached because the focus search walks past a
descendant of the focused node is worth reading twice.</p>
<p>Record what you did <em>not</em> do, too. A commit that fixes three of four reported
problems should say which one it left and why.</p>`,
        },
        {
          id: 'standard',
          title: 'The standard',
          html: `
<p>Three tests a change is held to, all of them learned the hard way:</p>
<ol>
  <li><strong>Can you reach it from a running app, and does changing it change what you
    see?</strong> If not, it is not a feature. See
    <a href="/wiki/history#audit">the audit</a>.</li>
  <li><strong>What does it cost the user's provider?</strong> Any new per-item network call
    must answer what renders the result and what happens when a list is flung or a D-pad is
    held.</li>
  <li><strong>Does the comment say why, or what?</strong> The code says what. Comments in this
    project are for the reasoning that would otherwise be lost — particularly for anything
    that looks removable and is not.</li>
</ol>`,
        },
        {
          id: 'ai',
          title: 'A note on AI-assisted work',
          html: `
<p>Much of this codebase was written with AI assistance, and the practices above are partly
shaped by where that goes wrong. Two are worth stating outright.</p>
<p><strong>A plausible diagnosis is not a diagnosis.</strong> During the bug-fix pass a
scroll-wobble fix was written against a confident, wrong explanation — that a list row grows
when its guide arrives. The arithmetic disproved it: a fixed-size logo dominates the row, so
its height cannot change. The fix was reverted rather than shipped, and the bug is still
open. A fix built on a wrong story is worse than no fix, because it looks like the question
is closed.</p>
<p><strong>Say what was not verified.</strong> Several things in this project were confirmed
on an emulator and are recorded as exactly that, not as passing. The gap between "the code
does this" and "I watched it do this" is where the interesting bugs live.</p>`,
        },
      ],
    },

    {
      slug: 'glossary',
      title: 'Glossary',
      summary: 'The vocabulary, in one place.',
      sections: [
        {
          id: 'terms',
          title: 'Terms',
          html: `
<dl>
  <dt>M3U / M3U8</dt>
  <dd>A plain-text playlist. Each entry carries a display name, optional attributes
    (<code>tvg-id</code>, <code>tvg-logo</code>, <code>group-title</code>) and a stream URL.
    Carries no programme schedule.</dd>

  <dt>Xtream Codes API</dt>
  <dd>A JSON HTTP API exposed by many IPTV panels. Authenticated with a username and password
    against a base URL; returns categorised live channels, films, series and short-range guide
    data.</dd>

  <dt>EPG</dt>
  <dd>Electronic Programme Guide. What is on now, and what is on next.</dd>

  <dt>Panel</dt>
  <dd>The provider's server. Also, loosely, the provider.</dd>

  <dt>HLS</dt>
  <dd>Chunked streaming with an <code>.m3u8</code> manifest. Supports adaptive bitrate.</dd>

  <dt>DASH</dt>
  <dd>An alternative adaptive streaming format. Supported since Amendment 2; a DASH stream
    carrying DRM still fails at the licence step.</dd>

  <dt>Raw TS</dt>
  <dd>An unchunked, endless MPEG transport stream over HTTP. No adaptive bitrate, no
    seeking.</dd>

  <dt>Stable key</dt>
  <dd>The provider's own identity for an item, stored alongside the row. What favourites,
    resume points and guide entries are keyed by, so they survive a refresh that reassigns
    every row id.</dd>

  <dt>Refresh</dt>
  <dd>Re-fetching a source's catalogue and replacing it wholesale. The only bulk network
    operation in the app.</dd>

  <dt>Zap</dt>
  <dd>Moving up or down through the channel list from inside the player. Live only.</dd>

  <dt>Focus settling</dt>
  <dd>Focus resting on an item long enough to mean the viewer is looking at it, rather than
    passing through. What gates guide prefetch on the television.</dd>

  <dt>The gate</dt>
  <dd><code>./gradlew build detektAll coverageAll lint</code>. Since there is no CI, the only
    gate.</dd>

  <dt>The sweep</dt>
  <dd>Running the acceptance criteria on physical hardware and recording the results.</dd>

  <dt>Hollow feature</dt>
  <dd>Something that appears in a UI or a feature list but cannot be reached, or changes
    nothing when used. Nine were deleted in one afternoon; the term stuck.</dd>
</dl>`,
        },
      ],
    },
  ],
};
