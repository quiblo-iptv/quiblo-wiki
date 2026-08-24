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
<a href="/wiki/what-we-learned#blocks">the provider block</a> comes back.</p></blockquote>
<p>The same reasoning applies below the ViewModels. When the television needed a text field
that survives the on-screen keyboard, the fix went into a shared component rather than being
copied into the two screens that need typing: a copy each is how a fix lands in one and is
forgotten in the other.</p>
<h4>What is shared when the drawing cannot be</h4>
<p>Sometimes both apps need the same answer and cannot possibly draw it the same way. The
programme timeline is the clearest case: a phone drags it under a finger and a television walks
it with a D-pad, but <em>where each programme sits</em>, how wide it is and which one is on now
are the same arithmetic on both.</p>
<p>So the arithmetic is a plain function with no Compose in it — <code>guideTimeline</code> in
<code>:feature:browse</code> — and each app draws its own strip from the fractions it returns.
The decisions are shared; the drawing is not. That split is also what makes the awkward parts
testable: overlapping listings, holes a provider left, and programmes that began before the
window are all decided in a JVM test rather than argued about in front of a television.</p>`,
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
    <tr><td><code>:core:model</code></td><td>Domain types: <code>Channel</code>, <code>Category</code>, <code>Programme</code>, <code>Source</code>, <code>Profile</code>, <code>Episode</code>, <code>SeriesDetails</code>, <code>VodDetails</code>, <code>TitleMetadata</code>, <code>HistoryEntry</code>, and the settings enums. No Android dependency at all.</td></tr>
    <tr><td><code>:core:data</code></td><td>Repositories — the seam between storage, sources and ViewModels. <code>ChannelRepository</code>, <code>CategoryRepository</code>, <code>GuideRepository</code>, <code>SourceRepository</code>, <code>SearchRepository</code>, <code>ProfileRepository</code>, <code>WatchHistoryRepository</code>, <code>TitleMetadataRepository</code>, <code>TitleMetadataScanner</code>, <code>ChannelLogoRepository</code>, backup.</td></tr>
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
    <tr><td><code>:source:tmdb</code></td><td>The optional film and series information client, its own rate limiter, and the three-way <code>TmdbAnswer</code>.</td></tr>
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
they behave.</p>
<p><a href="/wiki/search">Search</a> lives there too, and is the exception that proves the
parameterisation: it deliberately is <em>not</em> a feed, because it is the one question that
ignores the kind the feed is parameterised by.</p>`,
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
      slug: 'search',
      title: 'Search',
      summary:
        'The one question that ignores the division the rest of the app is built on, and why it asks it once.',
      sections: [
        {
          id: 'why-separate',
          title: 'Why it is not three searches',
          html: `
<p>Everything else in the app is organised by kind: a repository answers "what is in this
category" for one destination at a time, and Live, Movies and Series each own a screen.
Search is the one question that cuts across all of it.</p>
<p>A viewer looking for <em>Fargo</em> does not know, and should not have to know, whether
their provider filed it as a film or as a series. Panels routinely list the same title as
both — a film, and a one-episode "series" — so a search that answers for one kind is a search
that appears to have found nothing.</p>
<p>Hence a repository of its own rather than a fourth method on the browse one. It returns
results already separated by kind, because that is how they are read, but it asks all three
questions from one call.</p>`,
        },
        {
          id: 'one-shot',
          title: 'One-shot reads, not flows',
          html: `
<p>Every read here is <code>suspend</code> and returns once. That is a deliberate departure
from the rest of the data layer, which is flows almost everywhere.</p>
<p><strong>A search is a question asked and answered, not a subscription.</strong> Three open
flows would re-run on every write to the channel table while somebody is still typing, and
recompute an answer for a term the viewer has already moved past. Keystrokes are debounced
above, and the latest question cancels the previous one.</p>
<p>A blank query with no genre returns nothing rather than everything. An empty search box is
not a request for sixty-seven thousand rows, and the browse tabs already exist for looking at
the whole catalogue.</p>`,
        },
        {
          id: 'genres',
          title: 'The genre filter, and its coverage figure',
          html: `
<p>Genres are not a fixed list. They are derived from the metadata cache, so the filter offers
only genres something the viewer actually owns is filed under — offering "Western" against a
catalogue holding none is a control that can only disappoint.</p>
<p>That has a consequence the UI cannot hide, so it states it: the filter is only as complete
as the cache. Hence the <strong>coverage percentage</strong> on screen beside it. A filter
running against a tenth of a library is telling less than the whole truth, and silently
omitting nine films in ten is worse than saying so.
<a href="/wiki/metadata-and-artwork#scanner">The scanner</a> is what raises the figure.</p>
<h4>How coverage is counted</h4>
<p>Two details in the arithmetic, both there to stop the number lying:</p>
<ul>
  <li><strong>Over distinct cleaned titles, not rows.</strong> A provider listing one film four
    times in four qualities has one title to look up. Counting rows would report a quarter of
    the coverage actually held.</li>
  <li><strong>Titles that clean away to nothing are excluded from both halves</strong> — a name
    written entirely in a non-Latin script, a bare language tag. They will never be looked up,
    so leaving them in the denominator would cap the figure below 100% permanently and make a
    complete cache look like a broken one.</li>
</ul>
<h4>Live channels are matched differently, on purpose</h4>
<p>Films and series are matched through the cache, by cleaned title. Live channels have no
metadata and never will, so they are matched on the genre word appearing in the channel's own
name. That is a weaker rule, chosen knowingly: it is how a channel called "CRIME NETWORK HD"
comes back for "Crime", and the alternative is a live column that is always empty.</p>`,
        },
        {
          id: 'threading',
          title: 'Where the work happens',
          html: `
<p>The plain search is SQL — a <code>LIKE</code> against the channel table, capped per kind,
with the favourite join done in the query so a result already knows whether it is favourited
by <a href="/wiki/database#profiles">whoever is watching</a>.</p>
<p>The genre filter cannot be. It compares a <em>cleaned</em> form of every film and series
title against the cache, and cleaning is a regex pass SQLite cannot express. On the account
this project is tested against that is around sixty thousand passes, so it runs on the default
dispatcher rather than on the caller's thread — the same reasoning as
<a href="/wiki/data-flow#defects">the browse mapping defect</a>, which dropped frames for
exactly this reason.</p>
<p>When a genre is selected, films and series share one result cap rather than getting one
each, and the split back into columns happens after the rows are read. A genre held mostly by
series would otherwise return almost no films.</p>`,
        },
      ],
    },

    {
      slug: 'database',
      title: 'The database',
      summary:
        'Eleven schema versions, why favourites are their own table, and how identity survives a refresh.',
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
    <tr><td><code>profiles</code></td><td>Who is watching</td><td>Owns favourites and resume points, and nothing else</td></tr>
    <tr><td><code>favorites</code></td><td>Favourites</td><td>Keyed by profile + source + stable key</td></tr>
    <tr><td><code>resume_positions</code></td><td>Where you stopped, and enough to list it as history</td><td>Keyed by profile + stable key. Denormalised on purpose — see below</td></tr>
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
          id: 'profiles',
          title: 'How a profile scopes anything',
          html: `
<p>Two tables gained a <code>profileId</code> in their <em>primary key</em>, not merely as a
column: <code>favorites</code> is keyed by profile, source and stable key, and
<code>resume_positions</code> by profile and stable key. Two people can therefore hold the
same favourite and stop at different points in the same film, which is the entire feature.</p>
<p>The foreign key to <code>profiles</code> cascades on delete, and that is doing real work.
<strong>Guest data does not outlive its session because the database enforces it</strong>,
not because every screen remembers to help: deleting the guest row takes its favourites and
its resume points with it, atomically, from one statement.</p>
<p>Above the database, the active profile is a <code>StateFlow</code> with a synchronous
value. Every profile-scoped read needs the id — a browse query, a favourite toggle, a resume
point written from the player — and a suspending lookup in each of those would be a database
round trip per call. Held in memory, it is a field read.</p>
<h4>The id that matches no row</h4>
<p>Before anybody has chosen, the active id is <code>0</code>. Ids are generated from 1, so
that value matches nothing: every profile-scoped read comes back empty and every write lands
nowhere.</p>
<p>That is not a hole to be guarded at each call site — it is the correct behaviour for a
moment when the app does not yet know whose data it would be touching, and it means no screen
needs a special case for "no profile". The chooser then stands in front of the app so the
question does not stay open.</p>`,
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
<p>Eleven versions so far, every one with a real migration. <strong>Destructive migration is
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
    <tr><td>10 → 11</td><td>Profiles, and re-keying favourites and resume positions onto them</td></tr>
  </tbody>
</table>
<p>Version 10 is pure index creation: no data moves and no columns change, so it cannot lose
anything. It costs a moment on the first launch after upgrading, once, against a saving on
every emission thereafter.</p>
<p>Version 11 is the opposite kind, and the most careful one written so far. SQLite cannot add
a column to a primary key, so both tables are rebuilt: create the new shape, copy every row
across, drop the old, rename. The copy is where the user's data is, and it is a single
<code>INSERT … SELECT</code> that assigns every existing row to profile 1.</p>
<p>Profile 1 is created by the same migration and named <strong>Default</strong>, because
everything on the device at that moment belongs to whoever has been using the app. An upgrade
that offered a fresh empty profile instead would look exactly like having lost every
favourite.</p>`,
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
<p>Everything here exists because of <a href="/wiki/what-we-learned#blocks">two account blocks</a>.
They are easy to remove by accident and each covers a different failure.</p>
<ol>
  <li><strong>Prefetch fires on settling</strong> — scroll settling on the phone, focus
    settling on the television — rather than on composition. Rows flown past are not rows
    anyone read.</li>
  <li><strong>A token bucket inside the client's request path</strong>, so every panel call
    passes it: a burst of eight, refilling one per 400&nbsp;ms. The burst is sized so a
    refresh (auth plus six catalogue calls) is never slowed; the refill is the backstop that
    survives a future caller reintroducing a storm from a screen nobody has written yet.
    <a href="/wiki/source-layer#bucket-arithmetic">Its arithmetic has a trap in it</a>.</li>
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
        {
          id: 'bucket-arithmetic',
          title: 'The one line of a token bucket that is easy to get wrong',
          html: `
<p>When a caller finds the bucket empty, it takes a token anyway and pays for it by waiting.
The balance is allowed to <strong>go negative</strong>, and the caller waits off exactly what
it borrowed.</p>
<p>Clamping at zero instead reads as the safer choice and halves the spacing. The waiting
caller's delay accrues a fresh token; the <em>next</em> caller arrives, finds it, and goes
straight through. Requests leave in pairs, and the sustained rate is quietly double the
constant that documents it.</p>
<blockquote><p>That is exactly what ours did. The panel limiter ran at one request per
200&nbsp;ms for its whole life while the constant beside it said 400 — a guard written,
reviewed and believed, and wrong by a factor of two in the direction that matters.</p></blockquote>
<p>It is the same class of mistake as capping requests <em>in flight</em> and calling it a
rate limit, which is what got an account blocked in the first place. Both are a plausible
mechanism that is not the one being measured at the other end.</p>
<p>The regression test asserts the total elapsed time across twenty requests rather than the
gap between two. A pairwise assertion passes happily while requests leave two at a time; only
the aggregate notices.</p>`,
        },
        {
          id: 'tmdb-limits',
          title: 'A second bucket, for a key that is not ours',
          html: `
<p>The metadata client carries its own token bucket, identical in shape to the panel's: burst
of sixteen, refilling one per 125&nbsp;ms, on the client so every path pays it — a poster
tile, a detail screen, and a scan walking thirty thousand titles alike.</p>
<p>What is different is whose credit is being spent. <strong>The key belongs to the user.</strong>
Getting a panel throttled makes our app slow; getting their key throttled affects everything
else they use it for. That asymmetry is why the pacing sits in the client rather than in the
one caller that looked risky.</p>
<p>It also means the scan needs no throttle of its own. A worker that cannot get a token
simply waits here, and the sustained rate is whatever the bucket allows — one place to
reason about instead of two that can disagree.</p>`,
        },
        {
          id: 'refusal',
          title: 'A refusal is not an answer',
          html: `
<p>Asking the metadata service about a title has three outcomes, not two:</p>
<table>
  <thead><tr><th>Outcome</th><th>Cached?</th></tr></thead>
  <tbody>
    <tr><td><strong>Found</strong> — the service knows this title</td><td>Yes</td></tr>
    <tr><td><strong>No match</strong> — it was asked and holds nothing under that name</td><td>Yes. Cheap, and worth remembering</td></tr>
    <tr><td><strong>Refused</strong> — rate limited, key rejected, unreachable, unparseable</td><td><strong>Never</strong></td></tr>
  </tbody>
</table>
<p>The last two used to be the same <code>null</code>, and the conflation is harmless while
browsing: a poster shows no score for a minute. It is ruinous in bulk. A scan that trips a
rate limit half way through would otherwise write tens of thousands of rows saying "matches
nothing", each cached for a fortnight, and the search screen would then report a fully
described catalogue with no genres in it.</p>
<blockquote><p><strong>A cache may hold answers. It may never hold failures.</strong></p></blockquote>
<p>Screens still collapse the three back into two, because a missing plot and an unreachable
host call for the same rendering: show what the provider supplied and nothing more. The
distinction exists for the code deciding what to write down, not for the viewer.</p>`,
        },
      ],
    },

    {
      slug: 'player',
      title: 'The player',
      summary:
        'Media3 behind an interface, what that interface buys, and the stutter that came from one retry policy.',
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
          id: 'stutter',
          title: 'Why a film stalled every few seconds',
          html: `
<p>VOD playback stuttered — a second or two of freeze, every few seconds, indefinitely, on
streams that were perfectly healthy. The cause is a good illustration of two opposite problems
being given one answer.</p>
<p><strong>Live and VOD want different things from a failed load.</strong> A dead live stream
must be given up on quickly: an acceptance criterion caps it at fifteen seconds, and the
engine's own retry ladder stacked underneath our reconnection logic blew that budget. So the
engine was told to attempt a load once and hand back the error.</p>
<p>That setting then applied to films as well, and a film is a different animal: one long read
from one host, where a transient hiccup partway through is entirely normal. Failing after a
single attempt handed the error to our retry, which restarts the whole media source —
reopening the connection and rebuffering — for something the engine would have absorbed by
re-requesting the same byte range.</p>
<blockquote><p>And because reaching <code>STATE_READY</code> resets the attempt counter, the
loop never escalated to an error and so never stopped. It just stalled, recovered, and stalled
again, forever. <strong>A retry loop that succeeds every time is invisible to every error
path you have.</strong></p></blockquote>
<p>The fix is one policy per kind: live keeps the fail-fast count, VOD gets the engine's
default ladder back. The engine is rebuilt when the kind changes, because both the buffering
policy and the load-error policy are fixed at construction.</p>`,
        },
        {
          id: 'engine',
          title: 'Three other things the engine is told',
          html: `
<ul>
  <li><strong>OkHttp, not <code>HttpURLConnection</code>.</strong> Media3's default holds no
    connection pool we control, so every segment paid a fresh TCP and TLS handshake. It is
    wrapped rather than swapped outright: a playlist imported from storage is a
    <code>file://</code> URI, and an HTTP-only factory would simply fail to open it.</li>
  <li><strong>Decoder fallback is on.</strong> A failing hardware decoder is the single most
    common way playback dies on a cheap TV box — a corrupt header, a stream the vendor's
    codec mishandles, a green frame or audio over black. Fallback lets the engine try the next
    decoder that claims the format, in practice the platform software one, rather than
    surfacing an error the viewer can do nothing about.</li>
  <li><strong>Time beats size when the two disagree.</strong> The buffer setting is expressed
    in seconds, and a high-bitrate remux hits the byte ceiling long before the time target.
    The viewer picked a duration, so the duration wins.</li>
</ul>
<p>Stream requests carry the same user agent the API client sends. Some panels gate on a
recognised player agent, and answering as two different clients on one account invites
precisely the attention <a href="/wiki/what-we-learned#blocks">we have already paid for
once</a>.</p>`,
        },
        {
          id: 'instrumented',
          title: 'What the player reports about itself',
          html: `
<p>Two numbers, both there so smoothness can be measured rather than argued about:
<strong>time to first frame</strong>, and a <strong>rebuffer count</strong> that only counts
buffering after the first frame — because buffering before it is startup, and a measure that
conflates the two cannot show an improvement in either.</p>
<p>They exist for the acceptance sweep. "It feels smoother" is not evidence, and
<a href="/wiki/player#stutter">the stutter above</a> is exactly the kind of fault that hides
in that gap: intermittent, recoverable, and invisible to every error path in the app.</p>`,
        },
        {
          id: 'accessibility',
          title: 'Announcing what a silent screen cannot',
          html: `
<p>Buffering and playback failure are announced as live regions on both apps. This is the one
place in Quiblo where a screen reader has genuinely less to work with than a viewer does: a
stream that is buffering and a stream that has died look different — a spinner, or a message —
but produce no focus change and no content change a reader would otherwise narrate.</p>
<p>The message text is shared between the two apps rather than written twice. There is one set
of words for "unreachable", "timed out", "unsupported format", "DRM", and "gone", and a second
copy would only mean a second thing to translate and a second thing to leave behind.</p>`,
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
        'How :app-tv is put together, the focus defects that shaped it, and the shake that took five attempts.',
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
restoration is the most likely thing to undo it.</p>
<p>The profile chooser is not one of those overlays. It stands <em>in front of</em> the whole
shell, so no screen below it has a state for "nobody has chosen yet" — see
<a href="/wiki/database#profiles">how a profile scopes anything</a>. The phone does the same
thing for the same reason.</p>
<p>Five tabs, and which are on the bar is a design decision rather than a listing of the
features: Search first and icon-only, then the three catalogues and Favourites. Sources sits
in Settings instead, because every position on the bar is one more press between a viewer and
what they came to watch, and adding a playlist is done once.</p>`,
        },
        {
          id: 'reuse',
          title: 'One frontend, two shells',
          html: `
<p>The television imports the same ViewModels the phone does — the search screen and the phone
would share <code>SearchViewModel</code> if the phone had a unified search screen yet, and the
settings cards on both apps read the same scan state.</p>
<p>That last one is a small thing with a real payoff:
<a href="/wiki/metadata-and-artwork#scanner">the scan's progress fraction</a> is computed once,
in <code>:core:data</code>, and both settings screens render it. The phone and the television
cannot disagree about what "half way" means, and neither can drift when the states change.</p>`,
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
          id: 'shake',
          title: 'The shake, and the modifier order behind it',
          html: `
<p>The catalogue twitched upward while the remote walked left and right along a row — on every
row except the first. That exception is the whole mechanism, and four confident explanations
went past it before anyone took it seriously.</p>
<h4>What was happening</h4>
<p>The poster applied <code>graphicsLayer { scale }</code> <em>before</em>
<code>clickable</code>. A modifier chain applies outside-in, so the focusable node sat
<strong>inside</strong> the animating scale. A focus node's bounds resolve through every layer
between it and the scrollable above it, so while the focus animation ran, a focused poster
reported a rectangle that grew a little each frame.</p>
<p>The vertical list reads that rectangle to decide whether the focused thing is on screen. In
the first row a poster fits with room to spare, so nothing scrolls. From the second row down
it does not fit, so the list scrolls until the poster is flush with the bottom edge — and
flush is the one position where the next frame's growth puts it out of view again. Hold the
remote down and it does that on every repeat.</p>
<p>Swapping the two modifiers is the entire fix. The animation is untouched.</p>
<blockquote><p><strong>Modifier order is not style.</strong> Which side of an animation the
focusable lands on decides what the layout above it is told, every frame.</p></blockquote>
<h4>Why it is measured rather than argued</h4>
<p>Four earlier answers were reasoned from the code and all four were wrong, so this one is
measured. <code>TvBrowseScrollStabilityTest</code> runs the real composables under Robolectric
at the panel's geometry, presses the D-pad at Android's key-repeat rate, and reads the
catalogue's position off every frame. Before the fix, the second row moved 11&nbsp;px and the
fourth 12 while the first stayed at zero — the reported asymmetry, reproduced on the JVM.
After, all three are flat.</p>
<p>The test asserts the property, not the symptom: moving along a row must not move the
catalogue <em>at all</em>, because every poster in a row sits at the same height as its
neighbours. And <code>TvCategoryList</code> was split out so the test drives the real
composable rather than a copy that could drift from it — which is also why the search results
reuse that list whole instead of laying out rows of their own. A second row implementation
would be a second place for the shake to come back unmeasured.</p>`,
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
hosts the user typed.</p>
<p>Our own releases page is the one host that is <em>on</em> by default, and it is the exception
that proves the rule rather than a hole in it: it is our page, the request is for a public file,
nothing about the device or the viewer is sent, and one switch stops it entirely. Quiblo is
installed by sideload with no store behind it, so a build that cannot say it is out of date is a
build whose security fixes never arrive. See
<a href="/wiki/settings-reference#updates">Checking for updates</a>.</p>`,
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
  <li>Every request passes a <a href="/wiki/source-layer#tmdb-limits">token bucket on the
    client</a>, and a <a href="/wiki/source-layer#refusal">refusal is never cached</a>.</li>
</ul>`,
        },
        {
          id: 'scanner',
          title: 'Describing a whole catalogue at once',
          html: `
<p>The per-tile shape above is right for browsing and wrong for one thing: the
<a href="/wiki/search#genres">genre filter</a>, which can only offer what the cache already
holds. A viewer who has looked at forty films gets a filter that knows about forty films.</p>
<p>So there is a scanner that walks the catalogue and asks about everything, driven from
either settings screen. Its design is mostly a list of things it must not do.</p>
<ul>
  <li><strong>It subtracts what is cached first</strong>, including the "no match" rows, and
    only then knows its total. That is why the progress bar reports no fraction while it is
    preparing: a bar drawn against a total of zero sits at one end or the other and means
    neither.</li>
  <li><strong>Four workers, and no throttle of its own.</strong> Concurrency here is only
    about hiding latency; the pacing is the client's bucket, which every worker waits on.
    Giving the scanner a second rate limit would be two things to keep in agreement, and the
    <a href="/wiki/what-we-learned#blocks">account blocks</a> came from believing a
    concurrency cap was a rate limit.</li>
  <li><strong>One refusal stops everything.</strong> A volatile flag is checked by each worker
    <em>before it asks</em>, rather than at collection, so a rate limit stops the requests
    themselves rather than merely stopping the counting.</li>
  <li><strong>Everything already fetched stays fetched.</strong> Stopped, cancelled or
    finished, the cache keeps what it got and the reported state keeps the fraction it reached
    — starting again resumes from there, which is only true because the work list is computed
    by subtraction.</li>
</ul>
<p>The state it exposes distinguishes finished, stopped and cancelled, and a stopped scan
carries <em>why</em>: rate limited, key rejected, or unavailable. Those three call for
different actions from the viewer — wait, fix the key, try later — and collapsing them into
"something went wrong" would leave the one that is actionable indistinguishable from the two
that are not.</p>
<p>That reason is a restatement of the metadata client's own refusal type rather than a reuse
of it. A settings screen importing the TMDB module to render a message would be the first
crack in the rule that features talk to <code>:core:data</code> and nothing else.</p>`,
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
