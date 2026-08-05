import type { ApiPackage } from '../api.model';

export const UI_PACKAGES: readonly ApiPackage[] = [
  {
    id: 'feature-viewmodels',
    module: ':feature:*',
    packageName: 'dev.quiblo.feature.*',
    layer: 'feature',
    summary: 'The ViewModels, and the state they expose. Shared by both applications.',
    detail: `
<p>These hold no Compose types, which is what lets the television reuse every one of them
unchanged. <strong>Do not fork them.</strong> The moment there are two
<code>BrowseViewModel</code>s, a fix to the guide-request guards has to be made twice and the
second will be forgotten — which is how the panel block comes back.</p>
<p>Each exposes one immutable state object rather than several independent streams, so a
screen cannot render a half-updated combination.</p>`,
    types: [
      {
        name: 'BrowseViewModel',
        kind: 'class',
        summary: 'Drives Live, Movies, Series and Favourites — one implementation, not four.',
        detail: `
<p>Parameterised by a <code>BrowseFeed</code> (a kind plus a favourites flag). The screens
differ in what they show, not in how they behave.</p>
<p>It carries the prefetch guards, and they are the easiest thing in the project to break by
accident:</p>
<ul>
  <li><code>onRowVisible</code> fetches a guide entry — <strong>only for live channels</strong>.
    Series carry a <code>providerStreamId</code> too, so without the kind check, scrolling the
    Series tab fires a guide request per row that can only ever come back empty.</li>
  <li><code>onPosterVisible</code> fetches a score — and deliberately does <em>not</em> fetch a
    guide, because a poster shows no programme and a grid holds several times more items than
    a list.</li>
  <li>Requests are remembered per session, so re-composition while scrolling does not re-ask.</li>
</ul>`,
        members: [
          { name: 'uiState', summary: 'One BrowseUiState: items, categories, filter, guide, scores, artwork, history.' },
          { name: 'onRowVisible(channel)', summary: 'Called when a list row settles. Live only.' },
          { name: 'onPosterVisible(channel)', summary: 'Called when a poster settles. Films and series only.' },
          { name: 'selectCategory(title) / search(text)', summary: 'Filter and search, both resolved in SQL.' },
          { name: 'channelForHistory(entry)', summary: 'Resolves a history entry back to a playable row. Null when the provider has dropped the title.' },
        ],
      },
      {
        name: 'BrowseUiState',
        kind: 'data class',
        summary: 'Everything a browse screen renders, as one object.',
        detail: `
<p><code>isLoading</code> and <code>hasSource</code> are separate fields deliberately. They
were conflated once, so every browse screen opened by telling the user to add a playlist —
including when they had one and it was still loading. Advice that is wrong for the first
second is worse than a spinner.</p>`,
      },
      {
        name: 'PlayerViewModel',
        kind: 'class',
        summary: 'Loads an item into the player and records where the viewer got to.',
        detail: `
<p><code>load</code> is the single entry point for three different things, and its arguments
are what distinguish them. A live channel needs only an id. A film needs an id, and a
<em>nullable</em> start position — null means "wherever it was left", zero means the viewer
chose to start again, and collapsing the two makes "start from the beginning" impossible to
express. An episode additionally needs its stream URL and its season and episode numbers,
because an episode is never a row and the player cannot derive them from a URL.</p>`,
        members: [
          { name: 'load(channelId, customUrl?, customTitle?, startPositionMillis?, seasonNumber?, episodeNumber?)', summary: 'Prepares playback. Guarded so a recomposition does not restart a stream already playing.' },
          { name: 'skipBy(direction)', summary: 'Moves by the configured interval, clamped so a rewind cannot run past the start.' },
          { name: 'controllerHandle()', summary: 'The controller, for attaching a video surface.' },
        ],
      },
      {
        name: 'MovieDetailViewModel / MovieDetailUiState',
        kind: 'class',
        summary: "A film's artwork, plot, score, resume point and favourite state.",
        detail: `
<p><code>isEnriching</code> exists because "not asked yet" and "asked, and there is nothing"
look identical in the data and must not look identical on screen. Without it the screen
asserted "no description" for the moment before the answer arrived, which reads as a wrong
answer rather than a pending one.</p>
<p><code>canResume</code> ignores positions under ten seconds — below that, offering Resume as
a distinct choice is noise.</p>`,
      },
      {
        name: 'SeriesDetailViewModel / SeriesDetailUiState',
        kind: 'class',
        summary: 'Seasons, episodes, and the episode a viewer was last on.',
        detail: `
<p><code>resumeEpisode</code> is the most recently <em>watched</em> episode, not the
furthest-through one. Resume keys are episode stream URLs, because that is what the player
records against when handed a custom URL.</p>`,
      },
      {
        name: 'SourcesViewModel / AddSourceState',
        kind: 'class',
        summary: 'Adding, refreshing and deleting sources.',
        detail: `
<p><code>addM3uSource</code> and <code>addXtreamSource</code> return whether the input was
accepted. A caller needs to know: the television form used to close on a rejected save,
leaving no source, no message and nothing to distinguish that from never having pressed the
button.</p>`,
      },
      {
        name: 'SettingsViewModel / BackupUiState',
        kind: 'class',
        summary: 'Every setting, plus category editing and backup.',
        detail: `
<p>Reused whole by the television, so a setting means the same thing on both apps and can only
be wrong in one place.</p>`,
      },
    ],
  },

  {
    id: 'app-tv',
    module: ':app-tv',
    packageName: 'dev.quiblo.tv',
    layer: 'app',
    summary: 'The television assembly and all of its UI.',
    detail: `
<p>There are no <code>:feature-tv:*</code> modules: there is one consumer, and a module per
screen would be structure without benefit.</p>
<p>Navigation is a hand-rolled sealed overlay state rather than Navigation-Compose. That is
deliberate — the tab bar's focus model was hard-won, and a navigation library's own focus
restoration is the most likely thing to undo it.</p>`,
    types: [
      {
        name: 'TvOverlay',
        kind: 'sealed interface',
        summary: 'What is drawn over the shell: playing, a film, a series, or settings.',
        detail: `
<p>One piece of state rather than four booleans, because the states are exclusive. Four flags
can express "playing and in settings", which is not a thing, and the code would have to keep
proving it never happens.</p>`,
      },
      {
        name: 'TvPlaybackRequest',
        kind: 'sealed interface',
        summary: 'What the player was asked to play: a live channel, a film, or an episode.',
        detail: `
<p>The three cases exist because they are genuinely three things, and flattening them into "a
Channel and a list" was a reported bug. A film got the channel keys mapped to "zap to the next
film", the controls announced it as live, and a series — whose row carries no episode stream —
was asked to play a URL that plays nothing.</p>
<p>Making the distinction a type means the player cannot be handed a series by accident and
cannot forget to pass an episode's URL: there is no shape of this class that expresses either
mistake.</p>`,
        members: [
          { name: 'Live', summary: 'Carries the queue it was chosen from, because zapping needs it and the player cannot know it.' },
          { name: 'Film', summary: 'Carries a nullable start position — null resumes, zero restarts.' },
          { name: 'Episode', summary: "Carries the stream URL and the numbering, neither of which is derivable from the series row." },
          { name: 'zappedBy(direction)', summary: 'The channel that many steps away, wrapping. Live only.' },
        ],
      },
      {
        name: 'TvBarState / TvBarAction / tvBarAction',
        kind: 'sealed interface',
        summary: 'Where the remote is along the top bar, and what a key press does to it.',
        detail: `
<p>Extracted as a plain function so the one thing a reviewer needs to check is not buried in a
modifier, and so the awkward cases can be asserted rather than tried by hand on a
television.</p>
<p>The settings gear is a <em>position along the bar</em> rather than a focusable of its own.
An icon that opts out of the bar's one-focusable model cannot be reached at all: it sits inside
that focusable, so a focus search walks past it into the content below. The gear was
unreachable by remote for the entire life of the app.</p>`,
      },
      {
        name: 'KeyActions / handleKey',
        kind: 'data class',
        summary: "The player's remote vocabulary, in one testable place.",
        detail: `
<p>On a television the key map <em>is</em> the interface. Where a key does nothing — seeking on
a live stream, the channel keys during a film — it is left <strong>unhandled</strong> rather
than swallowed, so it falls through to the system instead of being absorbed by a player that
has nothing to do with it.</p>`,
      },
      {
        name: 'TvTab',
        kind: 'enum',
        summary: 'Live, Movies, Series, Favourites, Sources.',
      },
      {
        name: 'TvCategoryRow / TvRowItem',
        kind: 'data class',
        summary: "A category's posters, each carrying its position in the flat list.",
        detail: `
<p>The index travels with the item rather than being recovered. Finding it with
<code>indexOf</code> meant a linear scan of the whole catalogue on every press — unnoticeable
on a short list, and a visible pause on a large one. Grouping records the index in the same
pass, so it costs nothing to know.</p>`,
      },
      {
        name: 'QuibloTvApplication / TvMainActivity',
        kind: 'class',
        summary: 'Koin startup, and the single landscape-locked activity.',
      },
    ],
  },
];
