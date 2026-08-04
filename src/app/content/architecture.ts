import type { WikiPart } from '../core/wiki.model';
import { BROWSE_FLOW, MODULE_GRAPH, STABLE_KEY } from './diagrams';

export const ARCHITECTURE: WikiPart = {
  id: 'architecture',
  title: 'Architecture',
  blurb:
    'How the code is arranged and why. The layering, the module map, the path data takes from a provider to the screen, and the four subsystems worth understanding on their own.',
  pages: [
    {
      slug: 'architecture-overview',
      title: 'Overview',
      summary:
        'Layers, the dependency rule, and the build-time check that makes a second frontend cheap.',
      sections: [
        {
          id: 'shape',
          title: 'The shape',
          html: `
<p>A conventional layered Android architecture, with one rule enforced harder than usual.</p>
${MODULE_GRAPH}
<p>An application depends on features; features depend on core and source; core depends only
on core. Nothing points back up, and nothing skips sideways between features — a feature
that needs something from another feature is a sign that the something belongs in
<code>:core:*</code>.</p>`,
        },
        {
          id: 'no-compose',
          title: 'The rule that pays for itself',
          html: `
<p><strong>No UI code in <code>:core:*</code> or <code>:source:*</code>.</strong> No Compose
import, no Android <code>Context</code> beyond what Room and DataStore require.</p>
<p>This is checked by the build — a convention plugin calls <code>enforceNoCompose()</code>,
and no core or source build file may reference Compose or a feature module. It is not a code
review convention that erodes; it fails the build.</p>
<p>The payoff was measured rather than assumed. When the television frontend was proposed,
the question "how much of this ports?" had a concrete answer:</p>
<table>
  <thead><tr><th>Layer</th><th>Television cost</th></tr></thead>
  <tbody>
    <tr><td>Model, database, DataStore, network, media, data</td><td><strong>Zero.</strong> Used unchanged</td></tr>
    <tr><td>M3U and Xtream parsers</td><td><strong>Zero.</strong> Used unchanged</td></tr>
    <tr><td>ViewModels</td><td><strong>Zero.</strong> They hold no Compose types</td></tr>
    <tr><td>Screens</td><td><strong>All of it.</strong> Every composable is touch-shaped and none ports</td></tr>
  </tbody>
</table>
<p>So a second application was a presentation layer, not a second product. The unused phone
screens come along as compiled code but are unreferenced from the television's graph, and R8
strips them — confirmed rather than assumed: the television APK is <em>smaller</em> than the
phone's despite depending on every feature module.</p>`,
        },
        {
          id: 'no-forking',
          title: 'One ViewModel, two frontends',
          html: `
<p>The television reuses the phone's ViewModels directly. <code>BrowseViewModel</code>,
<code>PlayerViewModel</code>, <code>SeriesDetailViewModel</code>,
<code>MovieDetailViewModel</code>, <code>SourcesViewModel</code> and
<code>SettingsViewModel</code> each serve both apps.</p>
<blockquote><p><strong>Do not fork them.</strong> The moment there are two
<code>BrowseViewModel</code>s, a fix to the guide-request guards has to be made twice — and
the second one will be forgotten, which is how
<a href="/wiki/history#blocks">the provider block</a> comes back.</p></blockquote>
<p>The same reasoning applies below the ViewModels. When the television needed a text field
that survives the on-screen keyboard, the fix went into a shared component rather than being
copied into the two screens that need typing: a copy each is how a fix lands in one and is
forgotten in the other.</p>`,
        },
        {
          id: 'di',
          title: 'Dependency injection and state',
          html: `
<p><strong>Koin</strong> for injection — each module contributes a Koin module, and an
application assembles the list it needs. The television's list is the phone's list; it
differs only in which screens consume it.</p>
<p><strong>Kotlin Flow</strong> throughout, with <code>StateFlow</code> at the ViewModel
boundary. A screen collects one immutable state object rather than several independent
streams, so it cannot render a half-updated combination.</p>
<p><strong>Room</strong> for storage, <strong>DataStore</strong> for preferences and
credentials, <strong>OkHttp</strong> for network, <strong>Media3</strong> for playback,
<strong>Coil</strong> for images.</p>`,
        },
      ],
    },

    {
      slug: 'module-reference',
      title: 'Module reference',
      summary: 'Every Gradle module, what belongs in it, and what must not.',
      sections: [
        {
          id: 'apps',
          title: 'Applications',
          html: `
<table>
  <thead><tr><th>Module</th><th>Holds</th></tr></thead>
  <tbody>
    <tr><td><code>:app</code></td><td>The phone assembly: the activity, the navigation graph, the Koin module list, the manifest.</td></tr>
    <tr><td><code>:app-tv</code></td><td>The television assembly, and <em>all</em> of its UI. The TV screens live here rather than in <code>:feature-tv:*</code> modules — there is one consumer, and a module per screen would be structure without benefit.</td></tr>
  </tbody>
</table>`,
        },
        {
          id: 'core',
          title: 'Core',
          html: `
<table>
  <thead><tr><th>Module</th><th>Holds</th></tr></thead>
  <tbody>
    <tr><td><code>:core:model</code></td><td>Domain types: <code>Channel</code>, <code>Category</code>, <code>Programme</code>, <code>Source</code>, <code>Episode</code>, <code>SeriesDetails</code>, <code>VodDetails</code>, <code>TitleMetadata</code>, <code>HistoryEntry</code>, and the settings enums. No Android dependency at all.</td></tr>
    <tr><td><code>:core:data</code></td><td>Repositories — the seam between storage, sources and ViewModels. <code>ChannelRepository</code>, <code>CategoryRepository</code>, <code>GuideRepository</code>, <code>SourceRepository</code>, <code>WatchHistoryRepository</code>, <code>TitleMetadataRepository</code>, <code>ChannelLogoRepository</code>, backup.</td></tr>
    <tr><td><code>:core:database</code></td><td>Room: entities, DAOs, migrations, and the exported schema JSON that migrations are checked against.</td></tr>
    <tr><td><code>:core:datastore</code></td><td>Preferences, and the encrypted credential store. Credentials live here and never in the database.</td></tr>
    <tr><td><code>:core:media</code></td><td>The player, behind <code>PlayerController</code>. The only module that knows ExoPlayer exists.</td></tr>
    <tr><td><code>:core:network</code></td><td>The OkHttp client and its configuration.</td></tr>
    <tr><td><code>:core:common</code></td><td>Small shared utilities. Deliberately thin — a large "common" module is a sign the layering has failed.</td></tr>
  </tbody>
</table>`,
        },
        {
          id: 'source',
          title: 'Source',
          html: `
<table>
  <thead><tr><th>Module</th><th>Holds</th></tr></thead>
  <tbody>
    <tr><td><code>:source:api</code></td><td>The contract: <code>MediaSource</code>, plus the capability interfaces <code>VodSource</code> and <code>SeriesSource</code>, and the result and error types.</td></tr>
    <tr><td><code>:source:m3u</code></td><td>The M3U/M3U8 parser. Pure JVM, no Android — which is why it is the best-tested module in the project.</td></tr>
    <tr><td><code>:source:xtream</code></td><td>The Xtream Codes client, the rate limiter and the block gate. Also pure JVM.</td></tr>
    <tr><td><code>:source:iptvorg</code></td><td>The optional channel-logo reference list.</td></tr>
  </tbody>
</table>
<p>Capabilities are separate interfaces on purpose. An M3U source is a <code>MediaSource</code>
and nothing more; asking one for a film's plot is a compile-time impossibility rather than a
runtime null.</p>`,
        },
        {
          id: 'feature',
          title: 'Feature',
          html: `
<p><code>:feature:browse</code>, <code>:feature:live</code>, <code>:feature:vod</code>,
<code>:feature:series</code>, <code>:feature:player</code>, <code>:feature:favorites</code>,
<code>:feature:sources</code>, <code>:feature:settings</code>.</p>
<p>Each holds a ViewModel and the phone's composables for one area. The television depends on
these modules for their ViewModels and Koin wiring and supplies its own composables.</p>
<p><code>:feature:browse</code> is the interesting one: <code>BrowseViewModel</code> is
parameterised by a feed — a kind plus a favourites flag — so Live, Movies, Series and
Favourites are one implementation rather than four. They differ in what they show, not in how
they behave.</p>`,
        },
      ],
    },

    {
      slug: 'data-flow',
      title: 'How data reaches the screen',
      summary:
        'The browse path in detail, and the two performance defects that lived in it.',
      sections: [
        {
          id: 'path',
          title: 'The path',
          html: `
${BROWSE_FLOW}
<p>A refresh is the only time a provider is touched in bulk. It parses the catalogue and
writes it into Room in a single transaction, chunked because SQLite binds a limited number of
variables per statement and a twenty-thousand-entry playlist exceeds it comfortably.</p>
<p>Everything after that is a database query. Browsing, filtering, searching and favouriting
never touch the network — which is what makes the app offline-tolerant and what keeps a
large account from being a request storm.</p>`,
        },
        {
          id: 'feed',
          title: 'One state object per screen',
          html: `
<p><code>BrowseViewModel</code> combines several streams into a single immutable
<code>BrowseUiState</code>: the catalogue rows, the categories, the current filter and
search text, what is on now, scores, artwork, and continue-watching entries.</p>
<p>Two details in that combination are load-bearing:</p>
<ul>
  <li><strong>Search is debounced</strong>, so a fast typist does not issue a query per
    keystroke — but only when the text is non-empty, so clearing a search is instant.</li>
  <li><strong>Each feed subscribes only to what it can display.</strong> The guide query asks
    for every programme airing now across a whole source; Movies and Series render no
    programme anywhere, so they do not subscribe to it. Favourites <em>does</em>, because it
    is built with the Live kind and shows a programme line for the live channels in it.</li>
</ul>
<p>"Loading" and "no source configured" are separate states, deliberately. They were conflated
once, so every browse screen opened by telling the user to add a playlist — including when
they had one and it was still loading. Advice that is wrong for the first second is worse
than a spinner.</p>`,
        },
        {
          id: 'defects',
          title: 'Two defects that lived here',
          html: `
<p>Both were found from a single bug report — "the app froze when I scroll" — and both scaled
with the size of the account. The account they were found on holds <strong>67,567
channels</strong>.</p>
<h4>Nothing indexed the browse query</h4>
<p>The <code>channels</code> table was indexed on the source, on source-and-category, and on
source-and-identity. The browse query filters on <em>source and kind</em> and sorts by the
provider's order. Nothing covered that combination, so SQLite matched every row belonging to
the source, tested the kind one row at a time, then built a temporary B-tree to sort the
survivors — on every emission.</p>
<p>The fix is a composite index in the order the query asks its questions, with the sort
column included so the temporary B-tree disappears too. Filtering alone would still have
sorted tens of thousands of rows by hand.</p>
<h4>The mapping ran on the main thread</h4>
<p>This one is subtler and worth internalising, because it is a property of Flow rather than a
mistake anyone would spot by reading the repository in isolation.</p>
<blockquote><p><strong>A Flow operator runs in its <em>collector's</em> context.</strong></p></blockquote>
<p>The repository mapped database rows to domain objects with a <code>map</code> and no
<code>flowOn</code>. Every collector in the app is a <code>stateIn(viewModelScope, …)</code>,
and <code>viewModelScope</code> is the main dispatcher — so 67,567 objects were allocated on
the UI thread every time Room re-emitted, which is on every write to the table.</p>
<p>Keeping the SQL cheap was never enough, because the work <em>after</em> the SQL was the
larger half. The dispatcher is now injected rather than hardcoded, so a test can hold the
mapping to leaving the caller's thread — a thread assertion rather than a timing one, because
a timing assertion passes on fast hardware with the bug fully reintroduced.</p>`,
        },
        {
          id: 'prefetch',
          title: 'Prefetching, and the rule for adding any',
          html: `
<p>Two things are fetched lazily as you browse: a live channel's guide entry, and a title's
score and artwork. Both are guarded, and the guards are described in
<a href="/wiki/source-layer#limits">the source layer</a>.</p>
<p>The rule for adding any new per-item network call:</p>
<blockquote><p>Check what renders the result — if nothing on screen shows it, do not fetch it
— and check what happens when a finger flings the list, or when a D-pad is held down.</p></blockquote>
<p>A held D-pad flies through a list far faster than a finger ever scrolls, which is why the
television fetches on <em>focus settling</em> and the phone on <em>scroll settling</em>,
rather than either fetching on composition.</p>`,
        },
      ],
    },

    {
      slug: 'database',
      title: 'The database',
      summary:
        'Ten schema versions, why favourites are their own table, and how identity survives a refresh.',
      sections: [
        {
          id: 'identity',
          title: 'Identity across a refresh',
          html: `
<p>The single most important idea in the schema.</p>
${STABLE_KEY}
<p>A refresh replaces a source's catalogue wholesale: delete every row, insert the new ones.
Every primary key therefore changes, and anything keyed by primary key is destroyed.</p>
<p>So each row carries a <strong>stable key</strong> — the provider's own identity for that
item — and everything that must outlive a refresh is keyed by it: favourites, resume points,
guide entries, cached metadata. It is why favourites are a separate table rather than a
boolean column, and the join is done in SQL so a twenty-thousand-row list is not re-mapped
every time one is toggled.</p>`,
        },
        {
          id: 'tables',
          title: 'The tables',
          html: `
<table>
  <thead><tr><th>Table</th><th>Holds</th><th>Note</th></tr></thead>
  <tbody>
    <tr><td><code>sources</code></td><td>Configured playlists and accounts</td><td><strong>No credentials.</strong> Those are encrypted in DataStore</td></tr>
    <tr><td><code>channels</code></td><td>Every playable item: live, film and series rows</td><td>Replaced wholesale on refresh</td></tr>
    <tr><td><code>favorites</code></td><td>Favourites</td><td>Keyed by source + stable key</td></tr>
    <tr><td><code>resume_positions</code></td><td>Where you stopped, and enough to list it as history</td><td>Denormalised on purpose — see below</td></tr>
    <tr><td><code>programmes</code></td><td>Guide entries</td><td>Source-agnostic: adding XMLTV later needs no migration</td></tr>
    <tr><td><code>title_metadata</code></td><td>Cached film and series information</td><td>Keyed by cleaned title <em>and</em> kind</td></tr>
    <tr><td><code>channel_logos</code></td><td>The optional logo reference index</td><td>A cache of a public catalogue, not user data</td></tr>
    <tr><td><code>category_overrides</code></td><td>Local renames and hides</td><td>Keyed by the provider's own title</td></tr>
  </tbody>
</table>`,
        },
        {
          id: 'denormalised',
          title: 'Why history is denormalised',
          html: `
<p><code>resume_positions</code> carries the title, artwork, duration and — when the row is an
episode — its season and episode numbers. That looks like duplication of the channel row, and
a join would seem tidier.</p>
<p>It would also be wrong. <strong>An episode is never a row in the channel table.</strong> An
episode's identity is its stream URL; episodes are fetched from the panel per series and held
for a session. A history list that joined would show films and silently drop every episode —
which is most of what anyone actually resumes.</p>
<p>Rows written before those columns existed keep resuming correctly and are excluded from the
history list by their empty title: a tile with no name and no artwork is worse than one row
of history missing.</p>`,
        },
        {
          id: 'metadata-key',
          title: 'Why metadata is keyed by title and kind',
          html: `
<p>Cached film and series information is keyed by the <em>cleaned search title</em> plus the
kind, rather than by channel id.</p>
<p>By id, a refresh would reassign every id and throw the whole cache away for no reason. By
title alone, "Fargo" the film and "Fargo" the series would be one record, and whichever tab
you opened first would answer for the other.</p>
<p>Negative answers are cached too. "The service was asked and had nothing" is an answer, and
re-requesting it on every visit is the most wasteful thing a cache can do.</p>`,
        },
        {
          id: 'migrations',
          title: 'Migrations',
          html: `
<p>Ten versions so far, every one with a real migration. <strong>Destructive migration is
deliberately not enabled</strong> — silently dropping a user's configured sources on a schema
change would be a data-loss bug, and an acceptance criterion requires version mismatches to
be handled explicitly rather than by discarding state.</p>
<p>The schema JSON is exported on every build and committed. Room validates the live database
against it at open time, so a migration that does not produce exactly what the entities
declare fails loudly at launch rather than subtly later.</p>
<table>
  <thead><tr><th>Version</th><th>Change</th></tr></thead>
  <tbody>
    <tr><td>1 → 2</td><td>Resume positions</td></tr>
    <tr><td>2 → 3</td><td>Programmes, with its two indices</td></tr>
    <tr><td>4 → 5</td><td>Film metadata cache</td></tr>
    <tr><td>5 → 6</td><td>Category overrides</td></tr>
    <tr><td>6 → 7</td><td>Metadata reworked to cover series as well as films</td></tr>
    <tr><td>7 → 8</td><td>History columns on resume positions</td></tr>
    <tr><td>8 → 9</td><td>Channel logo index</td></tr>
    <tr><td>9 → 10</td><td>The two missing indices — see <a href="/wiki/data-flow#defects">the browse defects</a></td></tr>
  </tbody>
</table>
<p>Version 10 is pure index creation: no data moves and no columns change, so it cannot lose
anything. It costs a moment on the first launch after upgrading, once, against a saving on
every emission thereafter.</p>`,
        },
      ],
    },

    {
      slug: 'source-layer',
      title: 'The source layer',
      summary:
        'The protocol abstraction, the M3U parser, the Xtream client, and the guards that keep an account alive.',
      sections: [
        {
          id: 'abstraction',
          title: 'The abstraction',
          html: `
<p><code>MediaSource</code> is an interface. <code>M3uSource</code> and
<code>XtreamSource</code> implement it. Adding Stalker, XMLTV, or any future protocol means
adding one implementation and changing zero feature modules.</p>
<p>Capabilities beyond the base contract are separate interfaces — <code>VodSource</code> for
film details, <code>SeriesSource</code> for episode lists — so a source that cannot describe
films simply does not implement that interface. Callers get a typed "not supported" rather
than a null, and the distinction between "this failed" and "this was never possible" survives
to the UI, where an M3U film shows its artwork and title without an error.</p>`,
        },
        {
          id: 'm3u',
          title: 'The M3U parser',
          html: `
<p>Plain text, and messier in practice than the format suggests. The parser is pure JVM and is
the most thoroughly tested code in the project, because parsing is exactly the kind of work
where tests are cheap and reality is hostile.</p>
<p>It handles, and is tested against: byte-order marks, CRLF line endings, unescaped commas
inside display names, missing <code>group-title</code> attributes, and a truncated final
line. Entries it cannot read are skipped and <em>counted</em>, and the count is surfaced —
"Loaded 20002 channels. 2 entries could not be read and were skipped" — rather than failing
the whole import or silently dropping them.</p>
<p>One limitation, stated plainly because it surprises people: <strong>an M3U has no way to
say what kind of thing an entry is</strong>, so everything parses as Live. Movies and Series
require Xtream.</p>`,
        },
        {
          id: 'xtream',
          title: 'The Xtream client',
          html: `
<p>A JSON HTTP API exposed by many IPTV panels. Authenticated with a username and password
against a base URL; returns categorised live channels, films, series and short-range guide
data.</p>
<p>The client is pure JVM too, which has a practical consequence worth knowing when debugging
it: <code>android.util.Log</code> does not resolve there. Temporary instrumentation uses
<code>println</code> and is read back from logcat.</p>
<p><strong>Never log a request URL.</strong> It carries the username and the password. This is
an acceptance criterion, not a style preference.</p>`,
        },
        {
          id: 'limits',
          title: 'The four guards',
          html: `
<p>Everything here exists because of <a href="/wiki/history#blocks">two account blocks</a>.
They are easy to remove by accident and each covers a different failure.</p>
<ol>
  <li><strong>Prefetch fires on settling</strong> — scroll settling on the phone, focus
    settling on the television — rather than on composition. Rows flown past are not rows
    anyone read.</li>
  <li><strong>A token bucket inside the client's request path</strong>, so every panel call
    passes it: a burst of eight, refilling one per 400&nbsp;ms. The burst is sized so a
    refresh (auth plus six catalogue calls) is never slowed; the refill is the backstop that
    survives a future caller reintroducing a storm from a screen nobody has written yet.</li>
  <li><strong>A block gate covering every call path</strong> — refresh, guide, series details
    and film details. When a panel refuses, the app stops asking for fifteen minutes. The
    catalogue walk stops at the first refusal; four of its seven calls used to swallow a
    block as "this account has no films" and carry on.</li>
  <li><strong>The backoff is persisted.</strong> The first thing a blocked user does is
    force-stop the app and reopen it, which used to clear an in-memory deadline and send it
    straight back to asking.</li>
</ol>
<p>Tests assert that after one block not a further byte is sent, that a mid-catalogue block
ends the refresh at four requests, and that a stored block survives a restart, plus the
bucket's burst and pacing. These tests are the guard rails on the guard rails.</p>`,
        },
      ],
    },

    {
      slug: 'player',
      title: 'The player',
      summary: 'Media3 behind an interface, and what that interface buys.',
      sections: [
        {
          id: 'controller',
          title: 'PlayerController',
          html: `
<p>Feature code never touches ExoPlayer. It talks to <code>PlayerController</code>, and
<code>:core:media</code> is the only module that knows ExoPlayer exists.</p>
<p>Two payoffs. First, the television and the phone drive the same engine with completely
different controls — five keys versus gestures — without either knowing how the other works.
Second, this is the seam where DRM slots in later: a format that needs a licence exchange is
a change inside <code>:core:media</code> and nowhere else.</p>`,
        },
        {
          id: 'loading',
          title: 'What "play this" means',
          html: `
<p>One entry point handles three quite different things, and getting its arguments right is
what distinguishes a channel from a film from an episode:</p>
<table>
  <thead><tr><th>Kind</th><th>What is passed</th></tr></thead>
  <tbody>
    <tr><td>Live channel</td><td>The row id. Position is meaningless, so it is zero</td></tr>
    <tr><td>Film</td><td>The row id, and optionally an explicit start. Given none, the stored resume point is read</td></tr>
    <tr><td>Series episode</td><td>The <em>series</em> row id, plus the episode's stream URL, its title, and its season and episode numbers</td></tr>
  </tbody>
</table>
<p>The episode case is the one that catches people. A series row carries no playable stream —
its <code>streamUrl</code> is not an episode — so an episode must be handed in explicitly.
The season and episode numbers travel with it because the player records them into history
and cannot derive them from a URL.</p>
<p>The distinction between a null start position and a zero one is deliberate: null means
"wherever it was left", zero means the viewer chose to start again. Collapsing them makes
"start from the beginning" impossible to express.</p>`,
        },
        {
          id: 'settings',
          title: 'Settings that reach the engine',
          html: `
<p>Skip interval, buffer mode and maximum bitrate are stored in DataStore, emitted as flows,
and read by the player from the same flow the settings screen writes to. A change applies
without a restart, and there is exactly one source of truth.</p>
<p>Aspect ratio is handled by scaling the video surface rather than by asking the engine to
re-letterbox: Fit, Fill, Zoom and Stretch are a computation over the video's aspect ratio and
the container's.</p>`,
        },
        {
          id: 'live',
          title: 'Live is not a special case, except where it is',
          html: `
<p>A live stream is prepared like anything else, but three behaviours differ, and in each case
the control is <em>absent</em> rather than present and inert:</p>
<ul>
  <li>Seeking is meaningless, so skip controls do not appear, and on the television the seek
    keys are left unhandled rather than swallowed.</li>
  <li>There is no duration, so no progress bar — the controls say "live" instead.</li>
  <li>There is no resume point to store or read.</li>
</ul>
<p>Conversely, zapping — moving up and down through the list you came from — applies
<em>only</em> to live. The next film in a category is not "the next channel" in any sense a
viewer means by pressing up.</p>`,
        },
      ],
    },

    {
      slug: 'tv-frontend',
      title: 'The television frontend',
      summary:
        'How :app-tv is put together, and the three focus defects that shaped it.',
      sections: [
        {
          id: 'structure',
          title: 'Structure',
          html: `
<p>All of the television UI lives inside <code>:app-tv</code> — screens, the shell, the key
maps. There are no <code>:feature-tv:*</code> modules: there is one consumer, and a module
per screen would be structure without benefit.</p>
<p>Navigation is a hand-rolled sealed overlay state rather than Navigation-Compose. The shell
is the null case; playing, a film, a series and settings each replace it whole. That choice
is deliberate — the tab bar's focus model was hard-won, and a navigation library's own focus
restoration is the most likely thing to undo it.</p>`,
        },
        {
          id: 'focus',
          title: 'Three focus defects, and what they teach',
          html: `
<p>Focus is the whole interface on a television, and all three of these were invisible from
reading the code.</p>
<h4>Selection following focus</h4>
<p>The tab bar was five focusables that selected themselves when focused. Any content change
that destroyed the focused element left Compose with no target; it fell back to the first
focusable in the tree, which was a tab, which selected itself. Content could silently change
which tab you were on.</p>
<p>The bar is now <strong>one</strong> focus target that changes tab on key events.</p>
<h4>An icon that could not be reached</h4>
<p>The settings gear was focusable, and the bar left the right-key unconsumed at the last tab
expecting focus to land on it. It does not: the icon sits inside the bar's own focusable, so
a focus search walks past it into the content below. The gear was unreachable by remote for
the entire life of the app — and separately, it had no click handler at all.</p>
<p>It is now a <em>position along the bar</em>, matching the tabs. Handing focus across
explicitly was tried first and did not hold.</p>
<h4>Content stealing focus on composition</h4>
<p>The Sources screen requested focus when it first composed, so merely selecting that tab
pulled the remote out of the bar — after which you could no longer continue along the bar to
the gear. Now only a later change, like a form opening, claims focus.</p>
<blockquote><p>The pattern in all three: <strong>focus is state that something else can take
from you.</strong> Anything that grabs it must justify why, and "the screen just appeared" is
not a reason.</p></blockquote>`,
        },
        {
          id: 'ten-foot',
          title: 'Ten-foot rules',
          html: `
<ul>
  <li><strong>Overscan margins.</strong> Televisions crop the edges of the frame, and many
    still do. There is a screen-wide padding constant for this.</li>
  <li><strong>Focus must be loud.</strong> A scaled card, a border, full-strength text against
    a dimmed rest of the list. From the other side of a room, the only way to know where you
    are is that one thing looks different from everything else.</li>
  <li><strong>Scaling grows past the layout box.</strong> A poster scaled to 1.1 about its
    centre grows roughly 12&nbsp;dp past its own top edge — more than the gap that used to sit
    under a category title, which is why focused cards touched the heading above them. Rows
    now reserve that growth, which also stops the list clipping the top of a card flat.</li>
  <li><strong>Test with the D-pad only.</strong> Unplug the mouse. A mouse silently satisfies
    criteria a D-pad would fail, which is the exact defect the first acceptance criterion
    exists to catch.</li>
</ul>`,
        },
      ],
    },

    {
      slug: 'metadata-and-artwork',
      title: 'Metadata and artwork',
      summary:
        'Two optional third-party features, and the rules that keep them from becoming a liability.',
      sections: [
        {
          id: 'why-optional',
          title: 'Why both are off by default',
          html: `
<p>The metadata service and the channel-logo index are the only third-party hosts the app ever
contacts. Both are <strong>off unless the user turns them on</strong>, and that is the "never
phones home" invariant rather than a UI preference: a clean install talks to nothing but the
hosts the user typed.</p>`,
        },
        {
          id: 'tmdb',
          title: 'Film and series information',
          html: `
<p>Requires the user's own API key. The service rate-limits per key, and the key belongs to
them — being wasteful with it is being wasteful with something of theirs. So:</p>
<ul>
  <li>Requests are made <strong>per tile that has been on screen</strong>, not per category
    opened. A category can hold thousands of titles, and asking about all of them the moment
    it opens spends the user's limit on titles they scrolled past.</li>
  <li>Answers are cached <strong>in the database, across launches</strong> — including "no
    match", because a negative answer is an answer.</li>
  <li>A record notes whether only the search step ran. A poster tile needs a score; a detail
    screen needs everything. Recording which was fetched lets a tile be satisfied by one
    request and a detail screen upgrade the same row rather than duplicate it.</li>
  <li>There is no batch endpoint, so the per-title shape is forced rather than chosen.</li>
</ul>`,
        },
        {
          id: 'logos',
          title: 'Channel logos',
          html: `
<p>The opposite shape, because the data is. The reference list is one large static file, so it
is downloaded once, stored, and queried locally — a request per channel is not an option the
API offers, and downloading it once per session would be several megabytes to answer a
question about a logo.</p>
<p>It gets its own table rather than a column on the channel row, for the same reason
favourites do: a column would be destroyed on every refresh, and rebuilding it would mean
re-downloading, which is the one thing this cache exists to prevent.</p>`,
        },
        {
          id: 'precedence',
          title: 'Provider artwork always wins',
          html: `
<p>Neither source is ever preferred over the provider's own artwork. A panel's cover is the
cover for the thing it is serving, and second-guessing it is how a grid ends up showing the
wrong film's poster.</p>
<p>Both fill the same gap and are held in one map rather than two, because the consumer's
question is a single question — "is there anything to show in this empty frame?" — and a tile
has no use for the distinction.</p>`,
        },
      ],
    },
  ],
};
