import type { ApiPackage } from '../api.model';

export const CORE_PACKAGES: readonly ApiPackage[] = [
  {
    id: 'core-model',
    module: ':core:model',
    packageName: 'dev.quiblo.core.model',
    layer: 'core',
    summary: 'The domain vocabulary. Plain Kotlin, no Android dependency at all.',
    detail: `
<p>Every other module speaks in these types. They carry no framework annotations, no
persistence concerns and no formatting — a <code>Channel</code> is what a channel
<em>is</em>, not how it is stored or drawn.</p>
<p>This is the module that makes the layering pay: because nothing here imports Android, a
television frontend, a desktop frontend or a test can all use it unchanged.</p>`,
    types: [
      {
        name: 'Channel',
        kind: 'data class',
        summary: 'One playable item — a live channel, a film, or a series container.',
        detail: `
<p>The most-used type in our codebase, and the one whose <em>kind</em> matters most. A
<code>SERIES</code> channel is a container: its <code>streamUrl</code> is not an episode and
must never be handed to the player. Episodes come from the panel per series and are never
rows in the channel table.</p>`,
        members: [
          { name: 'id', summary: 'Database row id. Reassigned by every refresh — never store it.' },
          { name: 'stableKey', summary: "The provider's own identity. What survives a refresh, and what favourites and resume points are keyed by." },
          { name: 'kind', summary: 'LIVE, VOD or SERIES. Decides how the item may be played.' },
          { name: 'providerStreamId', summary: "The panel's id, used to request a guide or details. For a series this is the series id, not a stream id." },
          { name: 'groupTitle', summary: "The provider's category name. Also the key an override is stored against." },
          { name: 'sortIndex', summary: "Preserves the provider's ordering, which is the channel numbering a viewer knows." },
        ],
      },
      {
        name: 'MediaKind',
        kind: 'enum',
        summary: 'LIVE, VOD, SERIES. The distinction that decides almost every branch.',
        detail: `
<p>Worth stating plainly: <strong>an M3U playlist has no way to express this</strong>, so the
M3U parser assigns <code>LIVE</code> to everything. Films and series require Xtream.</p>`,
      },
      {
        name: 'Profile',
        kind: 'data class',
        summary: 'Who is watching. Owns favourites and resume positions, and nothing else.',
        detail: `
<p>Player settings, hidden categories, the metadata key and the sources themselves stay
app-wide: they describe the television and the account behind it rather than the person on the
sofa, and a household that had to configure its playlist twice would rightly call that a
bug.</p>
<p>There is no password and no PIN. This answers "whose favourites are these", not "who is
allowed to watch what" — the second is a different feature with different requirements.</p>`,
        members: [
          { name: 'isGuest', summary: 'The throwaway one. Its data is deleted when the session ends, and again at startup, because a killed process never tidies up after itself.' },
          { name: 'NONE_ID', summary: 'The id used while nobody has chosen. Matches no row — ids start at 1 — so reads return nothing and writes land nowhere, and no screen needs a special case.' },
        ],
      },
      {
        name: 'Category',
        kind: 'data class',
        summary: 'A grouping of items, derived by grouping channels rather than stored.',
        members: [
          { name: 'title', summary: "The provider's own name. The stable identity, and what an override is keyed by." },
          { name: 'displayTitle', summary: 'The local rename if there is one, otherwise the provider name.' },
          { name: 'isHidden', summary: 'Filtered out of browsing. Nothing is deleted.' },
          { name: 'UNGROUPED_TITLE', summary: 'The bucket for entries with no group. Not localised — it is a storage key, and the UI substitutes a translated label.' },
        ],
      },
      {
        name: 'Programme',
        kind: 'data class',
        summary: 'One guide entry. Times are UTC milliseconds.',
        detail: `
<p>Source-agnostic by design. Only Xtream supplies programme data in v1, but nothing about
this type is Xtream-specific, so adding XMLTV later needs no schema migration.</p>
<p>Panels report a local formatted string alongside a Unix timestamp and only the timestamp
is trustworthy; conversion to the device's zone happens at render time.</p>`,
      },
      {
        name: 'Source',
        kind: 'data class',
        summary: 'A configured playlist or account. Carries no credentials.',
        detail: `
<p>Note what is absent: no username, no password, no token. Those live encrypted in
<code>:core:datastore</code> and never reach the database, so an export or a debug dump
cannot leak them.</p>`,
      },
      {
        name: 'SeriesDetails / Season / Episode',
        kind: 'data class',
        summary: "A series' seasons and their episodes, fetched per series and held for a session.",
        detail: `
<p>An <code>Episode</code> is identified by its <code>streamUrl</code>, because there is
nothing else stable to identify it by — episodes are never stored as rows. That is why the
player takes an episode's URL explicitly, and why history denormalises the episode's title
rather than joining to a channel.</p>`,
      },
      {
        name: 'VodDetails',
        kind: 'data class',
        summary: "A film's plot, cover, release date and genre, as the panel describes it.",
      },
      {
        name: 'TitleMetadata',
        kind: 'data class',
        summary: 'What the optional metadata service knows about a title.',
        members: [
          { name: 'rating', summary: 'The score shown on poster tiles.' },
          { name: 'authorLabel', summary: 'Whether `author` is a director or a creator — which follows from the kind.' },
          { name: 'isPartial', summary: 'True when only the search step ran, giving a score and artwork but no cast or plot. Lets a tile be satisfied by one request and a detail screen upgrade the same row.' },
        ],
      },
      {
        name: 'HistoryEntry',
        kind: 'data class',
        summary: 'Something started and not finished, for the continue-watching row.',
        detail: `
<p>A series appears once, at the episode last watched — six tiles for six episodes of one
programme is a list of one thing. That collapsing happens in
<code>WatchHistoryRepository</code>, so both apps agree about it.</p>`,
      },
      {
        name: 'PlayerSettings',
        kind: 'data class',
        summary: 'Skip interval, buffer mode and bitrate cap, as one object.',
      },
      {
        name: 'SeekInterval / BufferMode / MaxBitrateCap / AspectRatioMode',
        kind: 'enum',
        summary: 'The player settings, as closed sets rather than free numbers.',
        detail: `
<p>They live in <code>:core:model</code> rather than <code>:core:media</code> deliberately, so
the settings store and the settings screen can name them without either depending on the
media layer.</p>`,
      },
      {
        name: 'Appearance / ThemeMode',
        kind: 'data class',
        summary: 'Theme choice and dynamic colour. Phone only — the television is always dark.',
      },
      {
        name: 'SourceKind',
        kind: 'enum',
        summary: 'M3U or XTREAM. Selects which MediaSource implementation handles a source.',
      },
    ],
  },

  {
    id: 'core-data',
    module: ':core:data',
    packageName: 'dev.quiblo.core.data',
    layer: 'core',
    summary: 'Repositories — the seam between storage, the network and ViewModels.',
    detail: `
<p>Nothing above this layer touches a DAO or an HTTP client. A repository decides what is
cached, what is fetched, and on which thread the work happens.</p>`,
    types: [
      {
        name: 'ChannelRepository',
        kind: 'class',
        summary: 'The browse feed, the favourite toggle, and per-item details.',
        detail: `
<p>The single most performance-sensitive class in the project. Two things about it are
load-bearing:</p>
<p><strong>The mapping runs on an injected dispatcher.</strong> A Flow operator runs in its
<em>collector's</em> context, and every collector here is a
<code>stateIn(viewModelScope, …)</code> — the main thread. Without the <code>flowOn</code>,
one object per row was allocated on the UI thread on every emission, which at 67,000 channels
is an ANR. The dispatcher is a constructor parameter so a test can hold it to that.</p>
<p><strong>Details are cached in memory for the session, not in the database.</strong> Unlike
film metadata, these come from the user's own panel and describe what it is serving now — an
episode list can gain an episode. A session is the honest lifetime. Failures are deliberately
not cached, so a panel coming out of a block recovers without a restart.</p>`,
        members: [
          { name: 'observeBrowse(...)', summary: 'The browse feed. Category, search and favourites-only are optional predicates on one query, so the combinations cannot drift apart.' },
          { name: 'observeFavorites(...)', summary: 'Favourites across every content type.' },
          { name: 'toggleFavorite(channel)', summary: "Keyed by stable identity, never by row id — that is what lets a favourite survive a refresh." },
          { name: 'findByStableKey(...)', summary: 'How a history entry gets back to a playable row after a refresh has reassigned every id.' },
          { name: 'getSeriesDetails / getVodDetails', summary: 'Session-cached. Re-opening the same title costs nothing.' },
        ],
      },
      {
        name: 'SearchRepository',
        kind: 'class',
        summary: 'One search across live, films and series, plus the genre index behind the filter.',
        detail: `
<p>Separate from <code>ChannelRepository</code> because search is the one question that ignores
the division the rest of the app is built on: a viewer looking for a title does not know which
kind their provider filed it under.</p>
<p><strong>Every read here is one-shot.</strong> A search is a question asked and answered, not
a subscription — three open flows would re-run on every write to the channel table while
somebody is still typing, and recompute an answer for a term already moved past.</p>
<p>A blank query with no genre returns nothing rather than everything. An empty box is not a
request for 67,000 rows.</p>`,
        members: [
          { name: 'search(...)', summary: 'Everything matching a term, optionally narrowed to one genre. Capped per kind.' },
          { name: 'genreIndex(sourceId)', summary: 'Which genres can be filtered by, and how much of the catalogue has been described.' },
          { name: 'matchDispatcher', summary: 'Injected. The genre filter cleans ~60,000 titles in Kotlin, which must not happen on the caller\'s thread.' },
        ],
      },
      {
        name: 'GenreIndex',
        kind: 'data class',
        summary: 'The filterable genres, and the coverage percentage quoted beside them.',
        detail: `
<p>Coverage is on screen rather than hidden because a genre filter built on a cache that has
seen a tenth of a catalogue is telling less than the whole truth. Counted over distinct
<em>cleaned</em> titles, so a film listed four times in four qualities counts once.</p>`,
      },
      {
        name: 'ProfileRepository',
        kind: 'class',
        summary: 'Who is watching, and the switching of it.',
        detail: `
<p><strong>The active profile is a <code>StateFlow</code> with a synchronous value, and that
shape is load-bearing.</strong> Every profile-scoped read needs the id — a browse query, a
favourite toggle, a resume point from the player — and a suspending lookup in each would be a
database round trip per call.</p>
<p>It falls back to <code>Profile.NONE_ID</code> rather than to a real profile. That id matches
no row, so reads come back empty and writes land nowhere, which is correct for the moment
before the chooser has been answered and means no call site needs a guard.</p>`,
        members: [
          { name: 'activeProfile', summary: 'The chosen profile, or null when the chooser should be shown. Derived from the stored id and the rows, so a deleted profile puts the chooser back.' },
          { name: 'endGuestSessions()', summary: 'Called at startup. Deleting the row takes its favourites and resume points by foreign key.' },
          { name: 'startGuestSession(name)', summary: 'At most one guest exists at a time.' },
        ],
      },
      {
        name: 'TitleMetadataScanner',
        kind: 'class',
        summary: 'Fills the metadata cache for a whole catalogue, resumably.',
        detail: `
<p>Four workers and <em>no throttle of its own</em> — the pacing is the client's token bucket,
which every worker waits on. A second rate limit would be two things to keep in agreement.</p>
<p>One refusal stops everything: a volatile flag is read by each worker <em>before it asks</em>,
so a rate limit stops the requests rather than merely stopping the counting. Work is computed
by subtracting what is already cached, which is what makes starting again a resume.</p>`,
        members: [
          { name: 'state', summary: 'Idle, Preparing, Running, Finished, Stopped or Cancelled.' },
          { name: 'progressFraction', summary: 'Null while preparing — a bar drawn against a total of zero means nothing. Shared by both settings screens so they cannot disagree.' },
        ],
      },
      {
        name: 'MetadataScanState',
        kind: 'sealed interface',
        summary: 'How far a scan got, and how it ended.',
        detail: `
<p>Stopped carries a <code>ScanRefusal</code> — rate limited, key rejected, or unavailable —
because those call for different actions from the viewer. Collapsing them into "something went
wrong" leaves the actionable one indistinguishable from the two that are not.</p>
<p>A restatement of the TMDB client's refusal rather than a reuse of it, so nothing above
<code>:core:data</code> has to know a metadata service exists.</p>`,
      },
      {
        name: 'CategoryRepository',
        kind: 'class',
        summary: 'Categories with local edits applied, and the edits themselves.',
        detail: `
<p>Two entry points on purpose: <code>observeCategories</code> hides hidden ones and is what
browsing uses; <code>observeAllCategories</code> returns everything and is for the screen that
edits them. A category has no id — it is derived by grouping — so the provider's title is the
only available key, and the join is done in code rather than SQL.</p>`,
      },
      {
        name: 'GuideRepository',
        kind: 'class',
        summary: 'What is on now, now/next for one channel, and a whole listing across a window.',
        detail: `
<p><code>observeSchedule</code> reads from storage rather than from a fetch, for the reason
everything else here does: with no connection the timeline still draws whatever was last
stored. Its query asks for programmes that <em>overlap</em> the window rather than start inside
it, because the programme a viewer is watching began before the window did and a timeline that
omitted it would open with a hole where "now" is.</p>
<p><code>refreshFullGuideFor</code> is a separate entry point from <code>refreshGuideFor</code>
on purpose — it is the heavier call, made on an explicit request — but both share one private
refresh that owns the guards, the backoff and the wholesale replace. Two copies would give the
two paths two chances to disagree about when a panel has had enough, and the panel does not care
which of them asked.</p>`,
      },
      {
        name: 'SourceRepository',
        kind: 'class',
        summary: 'Adding, refreshing and deleting sources. Owns the refresh transaction.',
        detail: `
<p>A refresh replaces a source's catalogue wholesale in a single transaction, chunked because
SQLite binds a limited number of variables per statement. It is the only bulk network
operation in the app.</p>`,
      },
      {
        name: 'WatchHistoryRepository',
        kind: 'class',
        summary: 'Resume points, and the continue-watching list.',
        detail: `
<p>Collapses a series to the single episode last touched — ordered by <em>when</em> it was
watched, not by how far through it is, because the furthest-through episode is not the one a
viewer was last on.</p>`,
      },
      {
        name: 'TitleMetadataRepository',
        kind: 'class',
        summary: 'The optional film and series information, and its cache.',
        detail: `
<p>Caches negative answers too. "The service was asked and had nothing" is an answer, and
re-requesting it on every visit is the most wasteful thing a cache can do.</p>
<p><strong>It never caches a failure.</strong> A rate limit or an unreachable host leaves a
title unknown rather than recording it as unmatched — see <code>TmdbAnswer</code>.</p>`,
      },
      {
        name: 'ChannelLogoRepository',
        kind: 'class',
        summary: 'Fills in logos for channels a playlist gave none for. Off by default.',
        detail: `
<p>One download of a single index file rather than a request per channel, guarded by a mutex
so a browse screen asking about every visible row at once does not start a dozen downloads of
the same several-megabyte file.</p>`,
      },
      {
        name: 'PlayerSettingsRepository',
        kind: 'class',
        summary: 'Player settings and appearance, as flows the player and the UI share.',
      },
      {
        name: 'BackupRepository',
        kind: 'class',
        summary: 'Export and import of configuration, as versioned JSON.',
        detail: `
<p>Credentials are never written. A backup from a newer schema is refused by name — the
message states both the file's version and the build's, because a user told only "wrong
format" has nothing to act on.</p>`,
      },
      {
        name: 'RefreshOutcome / ImportResult',
        kind: 'sealed interface',
        summary: 'Success-or-failure results, with the reason attached.',
      },
    ],
  },

  {
    id: 'core-database',
    module: ':core:database',
    packageName: 'dev.quiblo.core.database',
    layer: 'core',
    summary: 'Room: entities, DAOs and eleven migrations.',
    detail: `
<p>Destructive migration is deliberately <strong>not</strong> enabled — dropping a user's
sources on a schema change would be data loss. The schema JSON is exported and committed, and
Room validates the live database against it at open time, so a migration that does not produce
exactly what the entities declare fails loudly at launch.</p>`,
    types: [
      {
        name: 'QuibloDatabase',
        kind: 'abstract class',
        summary: 'The single local database. There is no remote counterpart and never will be.',
      },
      {
        name: 'ChannelEntity',
        kind: 'data class',
        summary: 'One playable item belonging to a source. Replaced wholesale on refresh.',
        detail: `
<p>Note what is <em>not</em> here: a favourite flag. It would be destroyed by the next
refresh. Indices matter here more than anywhere else in the project — see
<code>ChannelDao.observeBrowse</code>.</p>`,
      },
      {
        name: 'ProfileEntity',
        kind: 'data class',
        summary: 'Who is watching. The parent that favourites and resume points cascade from.',
        detail: `
<p>Guest is a <em>row</em> rather than a flag in preferences, and that is the design. Deleting
the row takes its favourites and its resume points with it by foreign key, atomically — so the
promise that guest data does not outlive its session is kept by the database rather than by
every screen remembering to help.</p>`,
      },
      {
        name: 'FavoriteEntity',
        kind: 'data class',
        summary: 'A favourite, keyed by profile plus provider identity — never by row id.',
        detail: `
<p>Deliberately not joined to <code>ChannelEntity</code> by primary key. Surviving a refresh
in which the stream URL changed and every row was reinserted is the entire point.</p>
<p><code>profileId</code> is part of the <em>primary key</em>, not merely a column, so two
people can hold the same favourite independently.</p>`,
      },
      {
        name: 'ResumePositionEntity',
        kind: 'data class',
        summary: 'Where a viewer stopped, plus enough about the item to list it as history.',
        detail: `
<p>The descriptive columns are denormalised rather than joined, because for an episode there
is nothing to join to. A history list that joined would show films and silently drop every
episode — which is most of what anyone actually resumes.</p>
<p>Keyed by profile and stable key, so two people can stop at different points in the same
film. Rows written before the descriptive columns existed keep resuming correctly and are
excluded from the history list by their empty title.</p>`,
      },
      {
        name: 'ProgrammeEntity',
        kind: 'data class',
        summary: 'One guide entry, keyed to a channel by stable identity.',
      },
      {
        name: 'TitleMetadataEntity',
        kind: 'data class',
        summary: 'Cached title information, keyed by cleaned title and kind.',
        detail: `
<p>Keyed by title rather than channel id, because a refresh reassigns every id and the cache
would be thrown away for nothing. Kind is half the key because "Fargo" is a film <em>and</em>
a series, and with the title alone whichever tab was opened first would answer for the
other.</p>`,
      },
      {
        name: 'CategoryOverrideEntity',
        kind: 'data class',
        summary: "A local rename or hide, keyed by the provider's own title.",
      },
      {
        name: 'ChannelLogoEntity',
        kind: 'data class',
        summary: 'A logo from the reference list. A cache of a public catalogue, not user data.',
      },
      {
        name: 'ChannelDao',
        kind: 'interface',
        summary: 'The browse query, the category counts, and the refresh transaction.',
        detail: `
<p><code>observeBrowse</code> is one query with optional predicates rather than four queries,
so the combinations cannot drift apart, and it filters in SQL rather than in composition.</p>
<p>It needs the composite index on source, kind and sort order. Without it SQLite matches every
row for the source, tests the kind one row at a time, then builds a temporary B-tree to sort —
on every emission.</p>`,
        members: [
          { name: 'observeBrowse(...)', summary: 'The single browse query. Joins the favourite flag in SQL so a large list is not re-mapped on every toggle.' },
          { name: 'observeCategoriesByKind(...)', summary: "Categories in the provider's own order, not alphabetically." },
          { name: 'replaceForSource(...)', summary: 'One transaction, chunked inserts. A refresh that fails midway cannot leave half a list.' },
        ],
      },
      {
        name: 'ResumePositionDao / FavoriteDao / ProgrammeDao / TitleMetadataDao / ChannelLogoDao / CategoryOverrideDao / SourceDao',
        kind: 'interface',
        summary: 'The remaining tables. Each exposes flows for screens and suspend calls for writes.',
      },
      {
        name: 'ChannelWithFavorite / CategoryCount',
        kind: 'data class',
        summary: 'Query projections — a row plus its favourite flag, and a category plus its size.',
      },
    ],
  },

  {
    id: 'core-datastore',
    module: ':core:datastore',
    packageName: 'dev.quiblo.core.datastore',
    layer: 'core',
    summary: 'Preferences, and the encrypted credential store.',
    detail: `
<p>Credentials live here and <strong>never</strong> in the database. That separation is an
architectural invariant, not a preference: it is what makes "a database export cannot leak a
password" true by construction rather than by care.</p>`,
    types: [
      {
        name: 'EncryptedCredentialStore',
        kind: 'class',
        summary: 'Xtream usernames and passwords, encrypted at rest.',
      },
      {
        name: 'PlayerSettingsStore',
        kind: 'class',
        summary: 'Skip interval, buffering, bitrate cap, theme and dynamic colour.',
      },
      {
        name: 'TmdbKeyStore',
        kind: 'class',
        summary: "The user's own metadata API key.",
      },
      {
        name: 'ChannelLogoStore',
        kind: 'class',
        summary: 'Whether channel-logo lookup is on, and when the index was last downloaded.',
        detail: `
<p>Off by default, and that is not a UI preference — it is the "never phones home" invariant.
A clean install talks to nothing but the hosts the user typed.</p>`,
      },
      {
        name: 'DataStorePanelBlockStore',
        kind: 'class',
        summary: 'The persisted backoff after a panel refuses the account.',
        detail: `
<p>Persisted, not in memory, because the first thing a blocked user does is force-stop the app
and reopen it — which used to clear the deadline and send it straight back to asking.</p>`,
      },
    ],
  },

  {
    id: 'core-media',
    module: ':core:media',
    packageName: 'dev.quiblo.core.media',
    layer: 'core',
    summary: 'Playback, behind an interface. The only module that knows ExoPlayer exists.',
    detail: `
<p>Feature code never touches Media3. That seam buys two things: the phone and the television
drive the same engine with completely different controls, and DRM — if it is ever added — is a
change inside this module and nowhere else.</p>`,
    types: [
      {
        name: 'PlayerController',
        kind: 'interface',
        summary: 'Prepare, play, pause, seek, attach a surface, and report state.',
      },
      {
        name: 'Media3PlayerController',
        kind: 'class',
        summary: 'The Media3/ExoPlayer implementation.',
      },
      {
        name: 'PlayableItem',
        kind: 'data class',
        summary: 'What to play: a URL, a title, whether it is live, and where to start.',
        detail: `
<p><code>isLive</code> changes three behaviours — no seeking, no duration, no resume point —
and in each case the control is absent rather than present and inert.</p>`,
      },
      {
        name: 'PlaybackState',
        kind: 'data class',
        summary: 'Status, position, duration, seekability, video aspect ratio and tracks.',
      },
      {
        name: 'PlaybackStatus / PlaybackError',
        kind: 'enum',
        summary: 'Idle, buffering, playing, ended — and the reasons playback can fail.',
      },
      {
        name: 'TrackOption',
        kind: 'data class',
        summary: 'A selectable subtitle or audio track.',
      },
    ],
  },

  {
    id: 'core-network',
    module: ':core:network',
    packageName: 'dev.quiblo.core.network',
    layer: 'core',
    summary: 'The HTTP client and connectivity checks.',
    types: [
      {
        name: 'HttpContentFetcher',
        kind: 'class',
        summary: 'Fetches a URL as text. The single outbound path for playlists and APIs.',
        detail: `
<p>Implements <code>ContentFetcher</code> from <code>:source:api</code>, which is what lets the
pure-JVM parsers be tested without a network or an Android runtime.</p>`,
      },
      {
        name: 'AndroidConnectivityChecker',
        kind: 'class',
        summary: 'Whether there is a usable network, so an error can say which failure it was.',
      },
    ],
  },
];
