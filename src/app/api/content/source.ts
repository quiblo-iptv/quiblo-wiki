import type { ApiPackage } from '../api.model';

export const SOURCE_PACKAGES: readonly ApiPackage[] = [
  {
    id: 'source-api',
    module: ':source:api',
    packageName: 'dev.quiblo.source.api',
    layer: 'source',
    summary: 'The protocol contract. Adding a format means implementing these and nothing else.',
    detail: `
<p>The architectural invariant this package exists to serve: <em>the source layer is
abstracted</em>. Adding Stalker, XMLTV or any future protocol means adding one implementation
and changing zero feature modules.</p>
<p>Capabilities beyond the base contract are <strong>separate interfaces</strong>. A source
that cannot describe films simply does not implement <code>VodSource</code>, so asking one for
a plot is a compile-time impossibility rather than a runtime null — and the distinction
between "this failed" and "this was never possible" survives all the way to the UI, where an
M3U film shows its artwork and title without an error.</p>`,
    types: [
      {
        name: 'MediaSource',
        kind: 'interface',
        summary: 'The base contract: authenticate and return a catalogue.',
      },
      {
        name: 'VodSource',
        kind: 'interface',
        summary: "Optional: a film's plot, cover and runtime.",
      },
      {
        name: 'SeriesSource',
        kind: 'interface',
        summary: 'Optional: seasons and episodes for a series.',
      },
      {
        name: 'GuideSource',
        kind: 'interface',
        summary: 'Optional: programme data for a channel — now and next, or the whole listing.',
        detail: `
<p>Separate for the same reason as the others. An M3U playlist carries no schedule, so it does
not implement this — the absence of a guide is a property of the format, not a failure.</p>
<p>Two calls, because they are asked for at different moments and cost different amounts.
<code>guideFor</code> is the small window a list row shows; <code>fullGuideFor</code> is
everything the provider holds, for a timeline, and is made only when a viewer asks. On Xtream
they are <code>get_short_epg</code> and <code>get_simple_data_table</code>.</p>
<p><strong><code>fullGuideFor</code> defaults to <code>guideFor</code></strong>, so a provider
with only one kind of guide call is complete without writing anything: it returns the window it
has, the timeline draws that window, and the screen is honest about being short rather than
empty.</p>`,
      },
      {
        name: 'ContentFetcher',
        kind: 'interface',
        summary: 'Fetches a URL as text. The seam that keeps parsers pure JVM.',
        detail: `
<p>Because the parsers depend on this interface rather than on OkHttp, they can be tested
against a string in a plain JVM test — which is why <code>:source:m3u</code> carries the
highest coverage in the project.</p>`,
      },
      {
        name: 'CredentialStore',
        kind: 'interface',
        summary: 'Reads credentials without the source layer knowing how they are stored.',
      },
      {
        name: 'PanelBlockStore',
        kind: 'interface',
        summary: 'Remembers that a panel refused the account, across restarts.',
      },
      {
        name: 'Credentials',
        kind: 'class',
        summary: 'A username and password, kept out of logs and exports.',
      },
      {
        name: 'SourceRequest',
        kind: 'data class',
        summary: 'Which source is being asked, and at what base URL.',
      },
      {
        name: 'SourceReport',
        kind: 'data class',
        summary: 'How a refresh went: entries parsed, and entries skipped.',
        detail: `
<p>Skipped entries are <em>counted</em> and surfaced — "Loaded 20002 channels. 2 entries could
not be read and were skipped" — rather than failing the whole import or silently dropping
them.</p>`,
      },
      {
        name: 'SourceError',
        kind: 'sealed interface',
        summary: 'Why something failed: unreachable, unauthorised, blocked, not found, malformed.',
        detail: `
<p>A closed set rather than an exception, so every caller has to decide what to do about a
blocked panel — the case that used to be swallowed as "this account has no films".</p>`,
      },
      {
        name: 'SourceResult / FetchResult / GuideResult / VodDetailsResult / SeriesDetailsResult',
        kind: 'sealed interface',
        summary: 'Success-or-failure results, one per call shape.',
      },
    ],
  },

  {
    id: 'source-m3u',
    module: ':source:m3u',
    packageName: 'dev.quiblo.source.m3u',
    layer: 'source',
    summary: 'The M3U/M3U8 parser. Pure JVM, and the best-tested code we have.',
    detail: `
<p>Plain text, and messier in practice than the format suggests. Tested against byte-order
marks, CRLF endings, unescaped commas inside display names, missing <code>group-title</code>
attributes and a truncated final line.</p>
<p><strong>Everything parses as <code>LIVE</code></strong>, because an M3U has no way to say
otherwise. Films and series require Xtream — this surprises people and is worth knowing before
debugging an empty Movies tab.</p>`,
    types: [
      {
        name: 'M3uParser',
        kind: 'object',
        summary: 'Text in, entries out. No I/O, no Android, no state.',
      },
      {
        name: 'M3uParseResult',
        kind: 'data class',
        summary: 'The entries that parsed, and a count of those that did not.',
      },
      {
        name: 'M3uSource',
        kind: 'class',
        summary: 'The MediaSource implementation. Fetches, parses, reports.',
      },
    ],
  },

  {
    id: 'source-xtream',
    module: ':source:xtream',
    packageName: 'dev.quiblo.source.xtream',
    layer: 'source',
    summary: 'The Xtream Codes client, and the four guards that keep an account alive.',
    detail: `
<p>Also pure JVM, with one practical consequence when debugging: <code>android.util.Log</code>
does not resolve here, so temporary instrumentation uses <code>println</code> and is read back
from logcat.</p>
<p><strong>Never log a request URL.</strong> It carries the username and the password. That is
an acceptance criterion, not a style preference.</p>`,
    types: [
      {
        name: 'XtreamSource',
        kind: 'class',
        summary: 'The MediaSource implementation, and the home of the block gate.',
        detail: `
<p>When a panel refuses, this stops asking for fifteen minutes — across <em>all four</em> call
paths: refresh, guide, series details and film details. Before that gate existed, a blocked
account kept being asked by the three paths that were not the guide, which is how a short
block becomes a lasting one.</p>
<p>The catalogue walk stops at the first refusal. Four of its seven calls used to swallow a
block as "this account has no films" and carry on.</p>`,
      },
      {
        name: 'XtreamClient',
        kind: 'class',
        summary: 'The HTTP layer. Every call passes the rate limiter here.',
        detail: `
<p>The limiter is applied inside <code>request</code> rather than at each call site, which is
what makes it a backstop: a future caller reintroducing a storm from a screen nobody has
written yet still passes through it.</p>`,
      },
      {
        name: 'PanelRateLimiter',
        kind: 'class',
        summary: 'A token bucket: burst of 8, refilling one per 400 ms.',
        detail: `
<p>The sizing is deliberate on both sides. The burst is eight because a refresh is
authentication plus six catalogue calls and must not be slowed. The refill caps sustained
traffic at two and a half requests a second, however many rows go by.</p>
<blockquote><p><strong>A concurrency cap is not a rate limit.</strong> The guard this replaced
allowed three requests in flight, which at 100 ms each is thirty a second — and that is what
got the test account blocked.</p></blockquote>
<p><strong>The balance is allowed to go negative, and that one detail is the sustained
rate.</strong> A caller takes its token and waits off exactly what it borrowed. Clamping at
zero instead lets the wait accrue a token that the <em>next</em> caller finds and passes
straight through, so requests leave in pairs — which is what this limiter did for its whole
life, pacing at 200 ms while the constant beside it said 400.</p>
<p>Its regression test asserts elapsed time across twenty requests rather than the gap between
two: a pairwise assertion passes happily while requests leave two at a time.</p>`,
      },
      {
        name: 'XtreamUrl',
        kind: 'object',
        summary: 'Builds panel URLs. The one place credentials enter a string.',
      },
      {
        name: 'ApiResult',
        kind: 'sealed interface',
        summary: 'A response, an error, or a refusal — the third being the one that matters.',
      },
      {
        name: 'AuthResponse / UserInfo / ServerInfo',
        kind: 'data class',
        summary: 'The authentication payload, including whether the account is active.',
      },
      {
        name: 'LiveStreamDto / VodStreamDto / SeriesDto / CategoryDto',
        kind: 'data class',
        summary: 'Catalogue entries as the panel returns them, before mapping to domain types.',
      },
      {
        name: 'SeriesInfoResponse / SeasonDto / EpisodeDto / EpisodeInfoDto',
        kind: 'data class',
        summary: 'A series and its episodes.',
      },
      {
        name: 'VodInfoResponse / VodInfoDto / VodMovieDataDto',
        kind: 'data class',
        summary: "A film's details.",
      },
      {
        name: 'EpgResponse / EpgListingDto',
        kind: 'data class',
        summary: 'Short-range guide data for one channel.',
      },
      {
        name: 'FlexibleIntSerializer / FlexibleLongSerializer / FlexibleStringSerializer / FlexibleBooleanSerializer',
        kind: 'object',
        summary: 'Tolerant deserialisers for a family of APIs that are not internally consistent.',
        detail: `
<p>Panels return the same field as a number in one response and a quoted string in another, and
booleans as <code>true</code>, <code>"true"</code>, <code>1</code> or <code>"1"</code>. These
exist so one inconsistent field does not fail an entire catalogue — the alternative is a user
whose account works everywhere else and not here.</p>`,
      },
      {
        name: 'SeriesInfoResponseSerializer',
        kind: 'object',
        summary: 'Handles a series payload whose shape changes with its contents.',
      },
    ],
  },

  {
    id: 'source-tmdb',
    module: ':source:tmdb',
    packageName: 'dev.quiblo.source.tmdb',
    layer: 'source',
    summary: 'The optional film and series information client, and the key it spends.',
    detail: `
<p>Off unless the user supplies a key, and the key is <strong>theirs</strong>. That asymmetry
shapes everything here: getting a panel throttled makes our app slow, while getting their key
throttled affects everything else they use it for.</p>
<p>There is no batch endpoint, so the per-title request shape is forced rather than chosen.</p>`,
    types: [
      {
        name: 'TmdbAnswer',
        kind: 'sealed interface',
        summary: 'Found, NoMatch, or Refused — and the last two are not the same thing.',
        detail: `
<p>Three outcomes rather than a nullable record, and the distinction between the last two is
the whole reason the type exists: <strong>"nothing matches this title" is an answer, and "I
could not ask" is not.</strong> They used to be the same <code>null</code>.</p>
<p>That conflation is harmless while browsing — a poster shows no score for a minute — and
ruinous in bulk. A scan tripping a rate limit half way through would otherwise write tens of
thousands of rows saying "matches nothing", each cached for a fortnight, and the search screen
would report a described catalogue with no genres in it.</p>
<blockquote><p><strong>A cache may hold answers. It may never hold failures.</strong></p></blockquote>`,
        members: [
          { name: 'metadataOrNull()', summary: 'Collapses the three back to two for screens, which render a missing plot and an unreachable host identically.' },
        ],
      },
      {
        name: 'TmdbRefusal',
        kind: 'enum',
        summary: 'RATE_LIMITED, KEY_REJECTED, UNAVAILABLE — the only detail a caller can act on.',
        detail: `
<p>Waiting fixes the first, nothing fixes the second, and the third is worth retrying later.
Three outcomes because those are three different things to tell a viewer.</p>`,
      },
      {
        name: 'TmdbRateLimiter',
        kind: 'class',
        summary: 'A token bucket: burst of 16, refilling one per 125 ms.',
        detail: `
<p>The same shape as <code>PanelRateLimiter</code>, and the same negative-balance detail, for
the same hard-won reason. Sitting on the client means every path pays it — a poster tile, a
detail screen, and a scan walking thirty thousand titles alike.</p>
<p>It is also the scan's pacing. A worker that cannot get a token simply waits here, so the
scanner needs no throttle of its own.</p>`,
      },
      {
        name: 'TmdbClient',
        kind: 'class',
        summary: 'Search and detail lookups against the service.',
        detail: `
<p>Returns a <code>TmdbAnswer</code> rather than a nullable, so a caller cannot accidentally
treat a refusal as an absence. A record notes whether only the search step ran: a poster tile
needs a score, a detail screen needs everything, and recording which was fetched lets a tile be
satisfied by one request and a detail screen upgrade the same row.</p>`,
      },
      {
        name: 'cleanedForSearch / yearInTitle',
        kind: 'object',
        summary: 'Turns a provider title into something a metadata service can match.',
        detail: `
<p>Strips quality tags, language prefixes and release years from names that were never meant to
be searched. Also the key the cache is stored under, and the comparison the
<a href="/wiki/search#genres">genre filter</a> makes — which is why that filter runs off the
main thread.</p>`,
      },
    ],
  },

  {
    id: 'source-iptvorg',
    module: ':source:iptvorg',
    packageName: 'dev.quiblo.source.iptvorg',
    layer: 'source',
    summary: 'The optional channel-logo reference list.',
    detail: `
<p>The opposite shape to the metadata service, because the data is. The reference list is one
large static file, so it is downloaded once, stored and queried locally — a request per channel
is not an option the API offers, and downloading it per session would be several megabytes to
answer a question about a logo.</p>`,
    types: [
      {
        name: 'IptvOrgClient',
        kind: 'class',
        summary: 'Downloads and indexes the public channel list.',
      },
      {
        name: 'ChannelLogo',
        kind: 'data class',
        summary: 'A normalised match key and the logo URL it resolves to.',
      },
      {
        name: 'IptvOrgChannelDto / IptvOrgLogoDto',
        kind: 'data class',
        summary: 'The upstream payloads.',
      },
      {
        name: 'iptvOrgMatchKey',
        kind: 'object',
        summary: 'Normalises a channel name so two spellings of the same channel agree.',
        detail: `
<p>Name matching across providers is inherently lossy — "BBC One HD", "BBC 1 HD" and
"UK: BBC One FHD" are the same channel to a viewer and different strings to a computer. The
key is deliberately conservative: a missed match shows the provider's own artwork or none,
where a wrong match shows another channel's logo, which is worse.</p>`,
      },
    ],
  },
];
