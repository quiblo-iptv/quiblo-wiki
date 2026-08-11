import type { WikiPart } from '../core/wiki.model';

export const STORY: WikiPart = {
  id: 'story',
  title: 'How this was built',
  blurb:
    'The method rather than the product: what an agent did well here, what it got wrong, and what caught each mistake. Written from the record, so every claim can be checked in the repository.',
  pages: [
    {
      slug: 'how-this-was-built',
      title: 'How this was built',
      summary:
        'Most of this code was written by a model. Every serious defect was caught by something else — here is the list, and where to check it.',
      sections: [
        {
          id: 'claim',
          title: 'The claim, narrowed until it is true',
          html: `
<p>Quiblo is a working IPTV player for phones and televisions, and most of its code was written
by an AI agent. That sentence belongs to a genre — the weekend app, described to a model and
shipped — and every post in that genre is read by an engineer hunting for the part that is not
true. So here is the narrower claim, which is the one we can support:</p>
<blockquote><p>The leverage was real. The verification was not optional. Every defect worth
naming on this page was caught by something other than the model that wrote it.</p></blockquote>
<p>This page is written from the record rather than from memory. The record is the reason it can
be written at all: fourteen dated plan documents, nine amendments to a frozen scope, an
acceptance sweep that lists what has <em>not</em> been verified, and a commit history where every
message says why. <strong>Every claim below can be checked in the repository.</strong> Anything
that could not be, is not here.</p>`,
        },
        {
          id: 'architecture-first',
          title: 'The architecture was decided before it was needed',
          html: `
<p>Before there was a television app, an amendment, or any reason to want one, the frozen scope
forbade UI code in the core modules: no Compose import, no Android <code>Context</code> beyond
what the database and settings store require. It is checked at build time rather than by
convention — a Gradle task fails if a Compose artifact reaches a core module's classpath.</p>
<p>Months later, when Android TV was admitted into v1.0, the argument was not that it would be
cheap. It was that the engine had already been confirmed running on the target television, so a
television frontend was a presentation layer and nothing more. <strong>That invariant is why the
question of a desktop or browser frontend is a question at all</strong> rather than a rewrite.</p>
<p>This is the part of the method that transfers: an agent is very fast at filling in a shape,
and very willing to fill in a bad one. Deciding the shape first is what makes the speed
useful.</p>`,
        },
        {
          id: 'amendments',
          title: 'The scope was frozen, and the freeze was amended in public',
          html: `
<p>Nine amendments, each dated, each saying what it decided, why, what it cost and what it did
not change. The strongest is the fourth, because it is an admission rather than an expansion: it
records that the previous amendment's scope <em>was never delivered</em>. On a television a
viewer could not open a film, could not see episodes, could not reach any setting, and could not
pick a category from 11,923 channels.</p>
<p>The document does not quietly widen to cover the gap. It dates the gap. <strong>A plan that
can only be read forwards is a plan nobody can audit</strong>, and an agent will happily rewrite
history into a straight line if the process lets it.</p>`,
        },
        {
          id: 'failures',
          title: 'The failures are the content',
          html: `
<p>Six, all in the record, each with the thing that caught it.</p>
<h4>A cache that held failures</h4>
<p>Every error from the metadata service returned <code>null</code>, and <code>null</code> was
written into the cache as "this title matches nothing". For a fortnight. Invisible one poster at
a time; across a catalogue scan it would have recorded tens of thousands of false misses.
<strong>A cache may hold answers. It may never hold failures.</strong></p>
<h4>A rate limiter running at exactly twice its documented rate</h4>
<p>For weeks, with a passing test. The token bucket let its balance stop at zero, so a throttled
caller's wait accrued a token that the next caller spent for free. It survived because the test
measured <em>one</em> request's wait — <strong>a pacing test that measures a single request
cannot see this class of bug</strong>. It matters here because the project has had a user's
account blocked by a provider twice.</p>
<h4>A module that compiled, passed every check, and took the app down</h4>
<p>A dependency-injection module whose arguments are positional and therefore not type-checked.
It compiled, passed static analysis, passed lint, passed every unit test — and crashed on the
screen that needed it. That is how one release shipped a Live tab that died on being opened. The
answer was a test that resolves the real object graph rather than a mock of it.</p>
<h4>Nine features nobody could reach</h4>
<p>Deleted rather than kept. A control that exists in code and cannot be reached from a remote is
not a feature, and counting it as one is how a plan starts lying. It happened again while this
page was being written: a licences list was built with rows that took no focus, and on a
television <strong>moving focus is how a list scrolls</strong> — so ten of its twelve entries
could never have been brought on screen. A test that walked the list with a D-pad caught it;
reading the code never would have.</p>
<h4>The shake that took four wrong answers</h4>
<p>A focusable inside an animating scale on the television: the scale moved the node, the node
reported new bounds, the container chased them, forever. Four plausible fixes, none of which
worked. <strong>The clue that cracked it came from the person holding the remote</strong>, not
from anything visible on screen.</p>
<h4>An attribution list that was 118 components short</h4>
<p>Both apps ship a list of the third-party code inside them, because their licences require it.
It was maintained by hand, so it was accurate right up until it silently wasn't. A check that
resolves what actually ships found <strong>118 components listed nowhere</strong> — and one of
them under a different licence from the one the file's own comment claimed for everything in it.
Nothing was broken; the sentence saying the question had been answered was simply no longer
true.</p>`,
        },
        {
          id: 'thesis',
          title: 'What that adds up to',
          html: `
<p>Read the six together and the pattern is not "the model is unreliable". Every one of those
defects is the kind a competent engineer ships on a Tuesday. The pattern is what caught
them:</p>
<ul>
  <li>a test written to pin a <em>rate</em> rather than a single wait;</li>
  <li>a test that resolves the real object graph instead of a mock;</li>
  <li>a test that drives a remote instead of clicking a node by name;</li>
  <li>a check that reads what actually ships instead of what somebody typed;</li>
  <li>a physical television, and a person watching it.</li>
</ul>
<p>None of those is exotic. What is different when an agent is writing the code is the
<em>rate</em>: plausible code arrives faster than anybody can read it, so the verification has to
be the thing that scales, and it has to be mechanical. The rule this project ended up with is
one sentence: <strong>anything that can fail in CI belongs in CI</strong>, because a check that
depends on somebody remembering is a check that is already gone.</p>
<p>And one thing no test caught: the four wrong answers about the shake, and the fifth answer
that came from someone in a room with a television. <strong>Some faults are only visible from
outside the code.</strong> That is not an argument against building this way. It is an argument
for owning a device.</p>`,
        },
      ],
    },
    {
      slug: 'working-with-agents',
      title: 'Working with agents on this codebase',
      summary:
        'The practical half: what gets written down, what belongs in CI instead, and the failure modes to expect.',
      sections: [
        {
          id: 'freeze-first',
          title: 'One document comes first, always',
          html: `
<p>Every contributor and every agent asked to work on this codebase is given
<a href="/wiki/scope-and-principles">the frozen scope</a> before anything else. It states what
Quiblo is in one sentence, what it is explicitly <em>not</em>, the architectural invariants, and
the amendments that have changed any of it.</p>
<p>The reason is narrow and practical: an agent asked to add a feature will add it wherever it
fits, and "where it fits" is a question about architecture that a prompt cannot answer. The
non-goals do more work than the goals — no bundled content, no accounts, no telemetry, no
backend — because they are the decisions most likely to be helpfully undone by somebody trying to
be useful.</p>
<p>That document is also the reason this page exists: it has been wrong once. Its header pointed
at a repository that is not this one, for a week, while being the first thing every new
contributor read.</p>`,
        },
        {
          id: 'ci-over-memory',
          title: 'If it can fail in CI, it belongs in CI',
          html: `
<p>The rule that survived contact with reality. Anything relying on a person or an agent
remembering is a rule that is already unenforced — so the conventions this project actually holds
are the ones a build can fail on:</p>
<ul>
  <li>no provider URL, credential or playlist anywhere in the repository — <em>a grep, on every
    change, including changes that only touch prose</em>;</li>
  <li>a licence header on every source file;</li>
  <li>no core module importing UI code;</li>
  <li>no domain enum name used as display text, since one reached the screen as
    <code>VOD</code>;</li>
  <li>every workflow file parses — including the ones the current run is not using;</li>
  <li>every shipped third-party component is listed in the app's own licence screen;</li>
  <li>a compiler warning fails the build.</li>
</ul>
<p>Each of those exists because something got through. The enum-name rule is the clearest: a
grep cannot tell display text from a cache key, so the few legitimate uses carry a comment saying
so. That is a deliberate small annoyance — it is the one place where writing that expression is a
decision rather than a reflex.</p>`,
        },
        {
          id: 'measure',
          title: 'Measure it, do not argue about it',
          html: `
<p>The most expensive mistake in this project's history was a screen that shook, and the
expensive part was four rounds of plausible reasoning about why. The habit that replaced it: when
something moves, jitters or takes too long, <strong>build the instrument before proposing the
cause</strong>.</p>
<p>On the JVM that means stepping the clock frame by frame and reading a position out of the
scrolling container itself. Two things make such a harness lie, and both were hit here:</p>
<ul>
  <li><strong>The wrong geometry.</strong> A first attempt guessed a viewport 48dp taller than the
    real panel; the header fitted, the bug vanished, and the test went green against code the
    television was failing. A harness at the wrong size is not a weaker instrument, it is a lying
    one.</li>
  <li><strong>A cache replaying old output.</strong> A census of compiler warnings reported six.
    The same command with the build cache disabled reported twenty-four — cached task results are
    replayed <em>without</em> their warnings. Four times under is enough to reach the wrong
    conclusion, and it did: the six looked like one trivial migration, and the twenty-four
    included a deprecated encryption library holding user credentials.</li>
</ul>
<p>The general form: <strong>before believing a measurement, ask what it would say if the thing
being measured never ran at all.</strong></p>`,
        },
        {
          id: 'green-is-not-proof',
          title: 'A green test is a claim about the harness',
          html: `
<p>Two fixes on the television were signed off on the JVM, published, and rejected the same day
by the panel. Both had corrected a real, measured mechanism — and in both the reported symptom
outlived the mechanism it was blamed on.</p>
<p><strong>A mechanism is not a symptom.</strong> Work that stops when the measured cause is
fixed, rather than when the screen looks right, produces exactly that: a confident fix, a green
harness, and an unchanged television. The acceptance criteria here are written against symptoms
for this reason.</p>
<p>The practice that came out of it is one line in a test's own documentation: <strong>run a new
harness against the code the device rejected before trusting it.</strong> One of the tests in
this repository says, in its own comments, that it passes against the broken version too — so it
is a guard on a property, not a reproduction of the fault, and a green run is not allowed to mean
more than that.</p>`,
        },
        {
          id: 'context-is-the-cost',
          title: 'Notes for an agent are a running cost, not a filing cabinet',
          html: `
<p>An agent reads its notes on every session, so a note is not free the way a document is free.
Ours grew to 22,000 tokens across 28 files, of which the index alone — loaded every time,
whatever the task — was 1,084.</p>
<p>Three habits caused it, and all three are the obvious thing to do:</p>
<ul>
  <li><strong>Writing status into notes.</strong> Which gate is open, what shipped last week —
    all of it true, all of it stale within days, and all of it already in the repository. Notes
    should point at the file, not copy it.</li>
  <li><strong>Appending instead of splitting.</strong> One file grew to seven facts because each
    new lesson was added to the end of the nearest one. Recall loads the whole file, so asking
    about one trap paid for all seven.</li>
  <li><strong>Writing the index like prose.</strong> Its only job is to help decide whether to
    open a file. A sentence per entry is a paragraph nobody needed.</li>
</ul>
<p>Compacting on those three rules cut the two worst files by about 70% and the always-loaded
index by a third, without deleting a single lesson — everything removed was either status or a
copy of something in the repository.</p>
<p><strong>The rule that came out of it:</strong> a note earns its place by being something the
repository does not already say. Anything else is a second copy to keep true, and the copy that
matters least is the one that will be kept up to date.</p>`,
        },
        {
          id: 'what-transfers',
          title: 'What transfers, and what does not',
          html: `
<p><strong>Transfers.</strong> Decide the architecture before the agent needs it. Write the
non-goals down. Put every convention you actually care about into the build. Prefer tests that
assert a property over tests that assert a value. Keep a record of what has <em>not</em> been
verified, because that list is the one that goes stale silently.</p>
<p><strong>Does not transfer.</strong> The device. A television with a remote, in a room, watched
by a person, found faults that nothing on this page would have caught — and the one that took
longest was solved by an observation from the sofa. If your project has a physical target, no
amount of harness replaces owning one.</p>
<p><strong>Still unanswered.</strong> What this cost, in tokens and in sessions, is being
collected as aggregates rather than estimated from memory — and that page will exist when the
numbers do, not before. Every figure on this wiki comes from something a reader can check, and
that includes the ones about ourselves.</p>`,
        },
      ],
    },
    {
      slug: 'what-it-cost',
      title: 'What it cost',
      summary:
        'Nineteen sessions, ten days, and the number nobody expects: fresh input was 38,307 tokens against 2.71 billion cache reads.',
      sections: [
        {
          id: 'headline',
          title: 'The shape of the bill',
          html: `
<p>Ten days, nineteen sessions, one model. Every figure here is generated from local transcript
records by a script in the repository, not typed in by hand.</p>
<table>
  <tbody>
    <tr><td>Span</td><td>2 – 11 August 2026, 19 sessions</td></tr>
    <tr><td>Assistant messages</td><td>9,176</td></tr>
    <tr><td><strong>Output tokens</strong></td><td><strong>8,085,931</strong></td></tr>
    <tr><td>Cache reads</td><td>2,711,252,834</td></tr>
    <tr><td>Cache writes</td><td>26,221,472</td></tr>
    <tr><td><strong>Fresh input tokens</strong></td><td><strong>38,307</strong></td></tr>
  </tbody>
</table>
<p>Read the last two rows together, because that is the whole story: <strong>99.999% of everything
this project fed a model was a cache read.</strong> Fresh input — the tokens that had never been
seen before — came to thirty-eight thousand across ten days, against two point seven
<em>billion</em> read back out of cache.</p>`,
        },
        {
          id: 'what-that-means',
          title: 'Why that number is the interesting one',
          html: `
<p>The intuition most people bring to this is that an agent costs what it writes. It does not.
It costs what it <em>re-reads</em>, over and over, on every single turn.</p>
<p>A long session is one enormous and slowly growing context — the frozen scope, the architecture
notes, the file being edited, the last twenty tool results — and every message pays to read all of
it again. Output is the small number: eight million tokens of actual writing against two point
seven billion tokens of re-reading, a ratio of roughly <strong>335 to 1</strong>.</p>
<p>Two things follow, and they are the practical content of this page:</p>
<ul>
  <li><strong>Caching is not an optimisation here, it is the economics.</strong> At 99.999% cache
    read, the difference between a warm context and a cold one is the difference between a
    workable tool and an unusable one.</li>
  <li><strong>A long session is cheaper than it looks, and a scattered one is dearer.</strong> The
    expensive move is not asking for more; it is repeatedly rebuilding a context that was already
    warm.</li>
</ul>`,
        },
        {
          id: 'against-the-work',
          title: 'Lined up against what shipped',
          html: `
<p>Sessions are dated and so is everything in the repository, so the two can be put side by side.
Output tokens by the day a session started:</p>
<table>
  <thead><tr><th>Day</th><th>Output tokens</th><th>What shipped</th></tr></thead>
  <tbody>
    <tr><td>2 Aug</td><td>1,269,581</td><td>The parsers and the data layer</td></tr>
    <tr><td>3 Aug</td><td>1,629,558</td><td>The player, and the scope freeze admitting Android TV</td></tr>
    <tr><td>4 Aug</td><td>1,445,645</td><td>The television frontend</td></tr>
    <tr><td>5 Aug</td><td>831,988</td><td>First CI runs — and the two failures they exposed immediately</td></tr>
    <tr><td>6 Aug</td><td>75,654</td><td>The shake, solved on the device</td></tr>
    <tr><td>9 Aug</td><td>1,136,027</td><td>Search, the catalogue scan, profiles</td></tr>
    <tr><td>10 Aug</td><td>994,119</td><td>Signed releases, the release-on-merge lane</td></tr>
    <tr><td>11 Aug</td><td>703,359</td><td>The legal round, the licence check, the first-launch terms</td></tr>
  </tbody>
</table>
<p><strong>The most interesting row is the smallest one.</strong> 6 August cost 75,654 output
tokens — under a tenth of any other working day — and what it produced was the fix for the bug
that had taken four wrong answers across the previous days. The reason it was cheap is that the
answer did not come from the model: it came from
<a href="/wiki/how-this-was-built#failures">someone watching the television</a>. Cost tracks
typing, not difficulty.</p>`,
        },
        {
          id: 'limits',
          title: 'What these numbers are not',
          html: `
<p><strong>This is a local record, not a billing statement.</strong> It is generated from the
transcripts Claude Code keeps on one machine, and it should be read as a floor rather than a
total:</p>
<ul>
  <li>A session whose transcript was truncated or removed is simply absent from it.</li>
  <li>Work done before the project was renamed lives in a separate directory, which is included —
    but anything from before those records began is not counted at all.</li>
  <li>Tokens are not money. There is no price in this table on purpose: the rate depends on a
    plan we are not going to pretend to know from here.</li>
</ul>
<p><strong>And there is nothing in it but numbers, by construction.</strong> The transcripts
contain real provider hostnames and the debugging that got an account blocked, which is exactly
what this project forbids anywhere near its repository. So the script that produces this page
never reads a text field at all — only a timestamp, a model name and a usage record — and it
refuses to write its own output if any string in it is not a date, a session id or a model name.
The safety is structural rather than careful.</p>`,
        },
      ],
    },
  ],
};
