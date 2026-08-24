import type { WikiPart } from '../core/wiki.model';

export const ENGINEERING: WikiPart = {
  id: 'engineering',
  title: 'Engineering practice',
  blurb:
    'How we build, test, measure, accept and release — and the conventions we hold a change to.',
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
<p>One command, and it is the thing a change has to pass:</p>
<pre><code>./gradlew build detektAll coverageAll lint</code></pre>
<p>It compiles everything, runs every unit test, runs detekt across all modules, checks
coverage thresholds and runs Android Lint.</p>
<p><strong>CI runs the same gate on every push and every pull request</strong>, and adds three
checks that only make sense against the whole tree:</p>
<ul>
  <li><strong>Wrapper validation</strong> — the Gradle wrapper jar is checked against its
    published checksums.</li>
  <li><strong>A leak guard</strong> — no playlist, provider host or credential-bearing URL may
    enter the repository. Cheap to check on a commit, expensive to remove from history
    later.</li>
  <li><strong>A licence-header check</strong> over every tracked Kotlin file, which is how a
    new module joins without one.</li>
</ul>
<p>Run the gate locally before pushing anyway. CI is the backstop, not the loop — waiting ten
minutes to be told about a formatting violation is a bad way to spend an afternoon.</p>`,
        },
        {
          id: 'ci-lesson',
          title: 'What the first CI run found',
          html: `
<blockquote><p><strong>A workflow that has never executed is not a safety net; it is a
document describing one.</strong></p></blockquote>
<p>This one is worth stating plainly because the failures were not subtle, and none of them
could have been found by reading. The very first run to execute failed immediately at
<code>./gradlew assemble</code> with "Permission denied" — <code>gradlew</code> had been
committed as <code>100644</code> from Windows, where the executable bit does not exist, and a
Linux runner honours what the index says.</p>
<p>The second lesson is older and worse: the acceptance sweep described the licence-header
check as "re-checked on every CI run" while it was in fact only ever run by hand. And
<code>detektAll</code> was broken for its entire existence without anyone knowing, because
nothing ever invoked it.</p>
<p>The general form: <strong>an unrun check and a passing check are indistinguishable from the
inside.</strong> Both produce no failures. It is worth knowing which one you have.</p>`,
        },
        {
          id: 'gotchas',
          title: 'Three build gotchas',
          html: `
<p><strong>Do not pin the daemon's JVM in a file that gets committed.</strong> Gradle reads
<code>org.gradle.java.home</code> and <code>gradle/gradle-daemon-jvm.properties</code>, and a
JDK that happens to be installed on one machine is not a property of the project. Pinned to a
JDK newer than the toolchain expects, detekt fails on class-file versions it cannot read —
locally, while CI stays green on its own JDK, which is the most confusing shape a build
failure can take.</p>
<p>The toolchain declaration is the place to say which Java a build needs. Anything else is
one machine's configuration wearing the repository's clothes.</p>
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
real SQLite: asserting one query plan is not worth a database per test.</p>
<p>Robolectric is used, but only where the question genuinely needs a framework — resolving a
real Koin graph, and measuring a scrolling list frame by frame. Both are things a mock cannot
answer by construction, which is the bar for reaching for it.</p>
<p>Coverage thresholds apply where they mean something. The two parsers carry our highest
coverage — <code>:source:m3u</code> around 98%, <code>:source:xtream</code>
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
  <li><strong>The rate-limiter tests</strong> — the burst size, and the sustained pacing
    across twenty requests rather than the gap between two. See
    <a href="/wiki/source-layer#bucket-arithmetic">why the aggregate is the assertion</a>.</li>
  <li><strong>The off-main-thread test</strong> — that the browse mapping leaves the
    collector's thread.</li>
  <li><strong>The key-map tests</strong> — that the television's channel keys do nothing on a
    film, and that the settings icon is reachable past the last tab.</li>
  <li><strong>The scroll-stability test</strong> — that walking a poster row does not move the
    catalogue. It reads the position off every frame at Android's key-repeat rate, and it is
    the only reason <a href="/wiki/tv-frontend#shake">the shake</a> is known to be fixed
    rather than believed to be.</li>
  <li><strong>The module wiring tests</strong> — see below.</li>
</ul>`,
        },
        {
          id: 'wiring',
          title: 'A Koin module is not type-checked',
          html: `
<p>This one deserves its own heading, because it is a category of bug the compiler looks like
it is covering and is not.</p>
<pre><code>single { Thing(get(), get(), get()) }</code></pre>
<p>That hands Kotlin a lambda whose argument types are inferred from the constructor. <strong>Any
number of <code>get()</code>s compiles as long as the arity matches</strong>, and each one is
only resolved when something first asks for the object — which is to say on a device, in front
of a viewer.</p>
<p>Ours failed exactly as you would expect. <code>ChannelRepository</code> gained a parameter
in the middle of its list; the module gained one more <code>get()</code> at the end rather
than in the middle; and the arguments shifted by one, landing a resolution on
<code>now: () -&gt; Long</code> — a clock with a perfectly good default. It compiled, it
passed every unit test, and it crashed every catalogue screen the moment the app ran.</p>
<p><strong>Only a test that resolves the real graph catches this.</strong> Each app has one:
Robolectric starts Koin with the production modules and asks for every repository by type. It
is a handful of lines, it needs no assertions beyond "this resolved", and it stands between a
reordered constructor and a crash that reaches hardware.</p>`,
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
<p>The weakest device we run on sets the bar: a Google TV box on Android 14 with
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
    two indices over the whole playlist, and schema 11 rebuilds two tables. Neither cost is in
    the old numbers.</li>
  <li>Every browse query now also filters by profile. It is an indexed equality on a key
    column, so the expectation is no measurable change — but it is an expectation, not a
    reading.</li>
</ul>
<p>The jank baseline is the number to compare against after any change to a browse list.</p>`,
        },
        {
          id: 'playback-measures',
          title: 'Measuring playback, rather than discussing it',
          html: `
<p>The player reports <a href="/wiki/player#instrumented">time to first frame and a rebuffer
count</a>, and the second is the one that matters for smoothness. It deliberately counts only
buffering <em>after</em> the first frame, because buffering before it is startup and a measure
that mixes the two cannot show an improvement in either.</p>
<p>These exist because "it feels smoother" is not evidence, and because the VOD stutter was a
fault that recovered every time — it produced no error, no crash, and nothing in a log. The
only way such a thing shows up in a sweep is if something is counting.</p>`,
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
class of bug that got our account blocked is invisible from the UI.</p>`,
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
    criterion that <a href="/wiki/what-we-learned#audit">the hollow settings screen</a> would have
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
      summary:
        'A merge to main is a release: what that automates, what it refuses to automate, and the trap that makes a test build unshippable.',
      sections: [
        {
          id: 'artifacts',
          title: 'What ships',
          html: `
<p>Two APKs per release — the phone build and the television build — published to GitHub
Releases, each with a <code>.sha256</code> beside it. There is no store listing.</p>
<p>Those asset names are a contract rather than a convention: the app reads the same releases
page to find out whether it is out of date, matches <code>quiblo-tv-v</code> or
<code>quiblo-v</code> to pick its own build, and verifies the published checksum before the
television hands anything to the installer. A release that renamed an asset would break the
update path silently.</p>
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
<p>Anything handed to a tester should be labelled with which key signed it.</p>
<p>Published releases are signed with the real key, which lives as an encrypted CI secret and
nowhere else. The workflow <strong>fails rather than falling back</strong> when the secret is
absent: an unsigned or debug-signed artefact reaching the releases page is the one mistake
here that cannot be undone by publishing a corrected build afterwards.</p>`,
        },
        {
          id: 'secrets',
          title: 'Getting a binary secret into CI intact',
          html: `
<p>A keystore is binary, and a CI secret is text, so it travels base64-encoded and is decoded
on the runner. That is unremarkable except for one way it goes wrong that costs an afternoon.</p>
<blockquote><p><strong>Do not pipe a secret through PowerShell.</strong> It will re-encode it.
The upload succeeds, the value looks right, and the failure surfaces inside CI as a corrupt
keystore — a long way from the command that broke it.</p></blockquote>
<p>Encode from a POSIX shell, and <strong>verify the round trip before uploading</strong>:
decode your own encoded copy and compare checksums with the original file. A minute of
checking against a failure that appears to be about signing, in a place you cannot easily
inspect, is a good trade.</p>
<p>The general lesson is broader than keystores: any pipeline that rewrites text is a hazard
for data that only happens to look like text.</p>`,
        },
        {
          id: 'process',
          title: 'A merge to main is a release',
          html: `
<p>Three jobs in a line, and the order is the whole point: <strong>nothing is versioned until
the gate is green, and nothing is published until it is versioned.</strong></p>
<ol>
  <li><strong>Gate.</strong> Exactly what a pull request has to pass — the same workflow file,
    reused rather than copied. A second copy of a build is a second thing to keep true.</li>
  <li><strong>Version.</strong> Work out whether this merge releases at all, and as what. Bump,
    commit, tag.</li>
  <li><strong>Publish.</strong> Build, sign, check the size budget, write checksums, upload.</li>
</ol>
<p>The run is serialised and never cancelled. Two merges landing a minute apart must not both
bump from the same version, and a release cancelled halfway leaves a tag with no build behind
it — the one state on a releases page that cannot be fixed by running something again.</p>`,
        },
        {
          id: 'what-releases',
          title: 'What counts as a release',
          html: `
<p>A merge to main releases <em>when something released changed</em>. A typo in a README, a new
test, a CI tweak — none of those alter a byte a user runs, and shipping them as versions
teaches people that release notes are not worth reading.</p>
<p>The commit types already say which is which, so the decision needs no new tool and no new
discipline:</p>
<table>
  <thead><tr><th>In the range since the last tag</th><th>Result</th></tr></thead>
  <tbody>
    <tr><td><code>feat:</code></td><td>Minor</td></tr>
    <tr><td><code>fix:</code></td><td>Patch</td></tr>
    <tr><td>Anything else</td><td><strong>No release.</strong> Main moves, nothing publishes</td></tr>
    <tr><td><code>!</code> or <code>BREAKING</code></td><td><strong>Stop and ask a human</strong></td></tr>
  </tbody>
</table>
<p><strong>Majors are deliberately not inferred.</strong> What makes a release major here is a
consequence a prefix cannot see — an export format that stops loading, a raised minimum
Android version, a withdrawn feature. A <code>!</code> somebody typed is a reason to stop and
decide, not a licence to spend the first number.</p>
<p>Merge commits are skipped when reading the range: a merge subject is prose, and the commits
it brings in carry the types on their own.</p>`,
        },
        {
          id: 'two-lanes',
          title: 'Prose does not pay for an Android build',
          html: `
<p>Every pull request used to run ten to eighteen minutes of Android build, including the ones
that only fixed a typo. Now the build is skipped when nothing but prose changed — around thirty
seconds instead — while the checks that prose <em>can</em> break keep running on everything: the
leaked-playlist and forbidden-brand greps, the licence headers, and a parse of every workflow
file.</p>
<p>Two decisions are worth copying. <strong>The filter lives inside a job, not on the trigger</strong>
— a workflow filtered out by <code>paths:</code> never reports its check at all, so a branch rule
requiring that check waits forever for a run that will never happen. A <code>Gate</code> job
always reports instead, failing when a needed job failed and passing when one was skipped, and
that is the name to require. And <strong>prose is an allowlist</strong>: anything unnamed counts
as code, so a new directory nobody thought about gets the full build and a wrong guess costs a
slow pull request rather than an unbuilt one.</p>
<p>On a merge the same rule applies, with one extra condition that is load-bearing: the gate is
skipped only when nothing will publish <em>and</em> the change was prose. The release class is
read from every commit since the last tag, so a feature commit whose own run was cancelled can be
published by the next merge along — skipping on "this push was prose" alone would ship a binary
no gate had seen.</p>
<p>It also arrived with a bug worth knowing: <code>git diff --name-only</code> quotes any path
containing a non-ASCII byte, so every document whose filename carried an em dash read as code
until the classifier was told <code>core.quotepath=false</code>.</p>`,
        },
        {
          id: 'gate-twice',
          title: 'The gate that is deliberately not run twice',
          html: `
<p>The publish job can run the full gate before signing, and whether it does depends on how the
release started.</p>
<ul>
  <li><strong>A tag pushed by hand</strong> — gate runs. Nothing has checked that tree.</li>
  <li><strong>The merge-to-main path</strong> — gate skipped. It has just run on the same tree;
    the only difference between the two commits is two version numbers.</li>
</ul>
<p>Paying ten minutes of a runner to re-prove that is the sort of cost nobody notices until
releases take half an hour and people start avoiding them.</p>
<p>Everything after the gate — the signing, the size budget, the checksums — lives in one file
regardless of which of the three ways a release was started, precisely so the procedure cannot
differ between them.</p>`,
        },
        {
          id: 'sweep-still-manual',
          title: 'What is not automated, and will not be',
          html: `
<p>The <a href="/wiki/acceptance#sweep">acceptance sweep</a>. A release can be built, signed and
published without anybody having watched the app run on a television, and that is a real gap
rather than an oversight — the sweep needs three physical devices and a remote control, and no
runner has those.</p>
<p>So the automation covers what a machine can honestly assert: it compiles, the tests pass,
detekt and Lint are clean, the artefacts are signed and within budget. It cannot assert that
the thing works, and the version number it produces should not be read as claiming so.</p>
<p>The upgrade half of the definition of done also stays live: <strong>each release must be
installable over the previous one</strong>, which is a check that only became possible once
there was a previous one.</p>`,
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
    <code>feat/…</code> branch. Merge to <code>main</code> only after the gate is green — and
    remember that <a href="/wiki/release#process">merging to main publishes a release</a> when
    the branch carries a <code>feat</code> or a <code>fix</code>.</li>
  <li><strong>Main is protected.</strong> Force-pushing to it and deleting it are both blocked.
    Neither is something anyone needs, and both are things that cannot be undone by the person
    who did them.</li>
  <li><strong>Commit after each self-contained step</strong>, not once at the end of a body of
    work. A commit that does one thing can be read, reverted and bisected; one that does six
    cannot.</li>
  <li>Read <a href="/wiki/scope-and-principles">Scope and principles</a> first. A change
    outside it is a conversation to have before the code, not in a pull request.</li>
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
    <a href="/wiki/what-we-learned#audit">the audit</a>.</li>
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
<p>Quiblo is built by a small team — Mahmoud and Claude — working together on the same
codebase. Several of the practices above are shaped by where that pairing goes wrong, and two
are worth stating outright.</p>
<p><strong>A plausible diagnosis is not a diagnosis.</strong> The catalogue shake went through
four confident, wrong explanations before the right one. The first was that a list row grows
when its guide arrives; the arithmetic disproved it, because a fixed-size logo dominates the
row and its height cannot change. Each fix was reverted rather than shipped. A fix built on a
wrong story is worse than no fix, because it looks like the question is closed.</p>
<p>What broke the deadlock was a detail from the person holding the remote — that the first
row never shook — which none of the four explanations accounted for and the real one turns
entirely on. <strong>An observation that your theory cannot explain is worth more than the
theory.</strong></p>
<p>The fifth attempt was measured rather than argued: a harness that reads the list's position
off every frame, showing the fault before and its absence after.
<a href="/wiki/tv-frontend#shake">The whole diagnosis is written up</a>, because the mechanism
is more instructive than the fix, which is two modifiers in the other order.</p>
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
  <dd>An alternative adaptive streaming format. Supported; a DASH stream carrying DRM still
    fails at the licence step, which is correct rather than a bug.</dd>

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
  <dd><code>./gradlew build detektAll coverageAll lint</code>. Run locally before pushing, and
    run again by CI on every push and pull request.</dd>

  <dt>Profile</dt>
  <dd>Who is watching. Owns favourites and resume points; everything else on a device is
    shared.</dd>

  <dt>Guest</dt>
  <dd>The throwaway profile. Its favourites and resume points are deleted when the session
    ends, and again at startup, because a killed process never gets to tidy up.</dd>

  <dt>Coverage (of a catalogue)</dt>
  <dd>How much of a library the metadata cache has an answer for, over distinct cleaned titles.
    Quoted on screen beside the genre filter, because a filter is only as complete as the
    cache behind it. Not to be confused with test coverage.</dd>

  <dt>Scan</dt>
  <dd>Describing a whole catalogue at once, rather than a tile at a time. Resumable, and it
    stops itself when the service refuses.</dd>

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
