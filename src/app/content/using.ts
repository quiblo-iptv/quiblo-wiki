import type { WikiPart } from '../core/wiki.model';

export const USING: WikiPart = {
  id: 'using',
  title: 'Using Quiblo',
  blurb:
    'Installing it, pointing it at a source, and what every screen and setting actually does. Written for someone holding the app, not reading the code.',
  pages: [
    {
      slug: 'getting-started',
      title: 'Getting started',
      summary: 'Install the APK, add a playlist or an account, and start watching.',
      sections: [
        {
          id: 'install',
          title: 'Installing',
          html: `
<p>Quiblo is distributed as an APK from GitHub Releases. There is no store listing, and there
is no auto-update — the app never checks a project-controlled server for anything.</p>
<p>Two APKs are published per release:</p>
<ul>
  <li><strong>the phone build</strong> — install it on a phone or tablet;</li>
  <li><strong>the television build</strong> — install it on Android TV or Google TV, usually
    by sideloading over <code>adb install</code> or a file manager.</li>
</ul>
<p>They are different application ids, so installing both on one device is fine and they will
not interfere. The phone APK <em>will</em> install on a television and will run, but it never
appears in the TV launcher — it declares no leanback launcher category. That is by design,
not a packaging error.</p>
<p>Minimum Android version is <strong>11 (API 30)</strong>.</p>`,
        },
        {
          id: 'first-source',
          title: 'Adding your first source',
          html: `
<p>Quiblo ships with nothing. On first launch it has no content, and the correct next step is
to add a source under <strong>Sources</strong>.</p>
<p>One form covers both kinds, and which one you mean is inferred from what you leave
empty:</p>
<table>
  <thead><tr><th>Fill in</th><th>You get</th></tr></thead>
  <tbody>
    <tr><td>URL only</td><td>An <strong>M3U playlist</strong></td></tr>
    <tr><td>URL + username + password</td><td>An <strong>Xtream account</strong></td></tr>
  </tbody>
</table>
<p>That removes a mode toggle from a screen where every control costs a press — which matters
much more on a remote than on a phone.</p>
<h4>M3U</h4>
<p>Either a remote URL or a local file. An M3U carries a display name, optional attributes
(<code>tvg-id</code>, <code>tvg-logo</code>, <code>group-title</code>) and a stream URL per
entry. It carries <em>no</em> programme schedule, so there is no guide for an M3U source, and
that is a property of the format rather than a missing feature.</p>
<p>One consequence worth knowing: the M3U parser assigns every entry the <em>Live</em> kind,
because an M3U has no way to say otherwise. <strong>The Movies and Series tabs cannot be
populated from an M3U at all</strong> — they need Xtream.</p>
<h4>Xtream</h4>
<p>The server address (for example <code>http://example.invalid:8080</code>), a username and a
password. Adding the account costs one authentication call and up to six catalogue calls,
stopping at the first refusal.</p>
<p>Your password goes into encrypted storage and never into the database, the backup file, or
any log.</p>`,
        },
        {
          id: 'what-costs',
          title: 'What costs a request to your provider',
          html: `
<p>Worth understanding, because getting an account throttled is the failure mode this project
has met most often. See <a href="/wiki/history#blocks">the provider blocks</a>.</p>
<table>
  <thead><tr><th>Action</th><th>Requests</th></tr></thead>
  <tbody>
    <tr><td>Adding a source, or pressing Refresh</td><td>auth + up to 6 catalogue calls</td></tr>
    <tr><td>Anything else on a browse screen</td><td><strong>none</strong> — favouriting, scrolling and filtering are local</td></tr>
    <tr><td>A live row the list <em>settles</em> on</td><td>one guide call, once ever per channel, skipped when cached</td></tr>
    <tr><td>A live row merely scrolled past</td><td><strong>none</strong></td></tr>
    <tr><td>Opening a series</td><td>one call, cached for the session</td></tr>
    <tr><td>Opening a film</td><td>one call, cached for the session</td></tr>
  </tbody>
</table>
<p><strong>Nothing refreshes automatically.</strong> Not on launch, not on tab switch, not on
scroll. Every one of the above also passes a token bucket, so no amount of scrolling can
exceed roughly two and a half requests a second however many rows go by.</p>`,
        },
      ],
    },

    {
      slug: 'phone-app',
      title: 'The phone app',
      summary: 'Browsing, searching, favourites, the player and its gestures.',
      sections: [
        {
          id: 'browsing',
          title: 'Browsing',
          html: `
<p>Five destinations: <strong>Live</strong>, <strong>Movies</strong>, <strong>Series</strong>,
<strong>Favourites</strong> and <strong>Sources</strong>, with Settings reachable from the
top bar.</p>
<p>Movies and Series default to poster grids, because artwork is how a title is recognised.
Live is a list — a channel's artwork is a small wide logo, and a grid of those is
unreadable.</p>
<p>Each browse screen offers a category filter, a search field and a list/grid toggle.
Filtering and searching happen in SQL rather than in memory, which is what keeps search
responsive across a twenty-thousand-entry playlist.</p>`,
        },
        {
          id: 'favourites',
          title: 'Favourites, and why they survive',
          html: `
<p>Favourites are keyed by the provider's own identity, never by database row id. A refresh
deletes and reinserts every row — so every id changes — and a favourite keyed by id would be
destroyed by the next refresh.</p>
<p>This is why favourites live in their own table rather than as a column on the channel
row, and it is the same mechanism that lets a resume point survive a refresh.</p>`,
        },
        {
          id: 'detail',
          title: 'Film and series screens',
          html: `
<p>Opening a film shows its artwork, plot and — when you have configured the optional
metadata service — its score, certificate, genres, director and cast. If there is a stored
position, <strong>Resume</strong> and <strong>Start from the beginning</strong> appear as two
separate buttons rather than one, because rewatching something should not mean resuming and
then seeking backwards.</p>
<p>A series shows its seasons and episodes. Episodes are fetched from your panel per series
and held for the session — they are never stored as rows — so re-opening a series you looked
at a minute ago costs nothing.</p>`,
        },
        {
          id: 'player',
          title: 'The player',
          html: `
<p>Full-screen playback that keeps the screen awake. Controls fade; a tap brings them back.</p>
<ul>
  <li><strong>Seek</strong> by a configurable interval, and Start Over.</li>
  <li><strong>Aspect modes</strong> — Fit, Fill, Zoom, Stretch.</li>
  <li><strong>Gestures</strong> — drag vertically on the left for brightness, on the right for
    volume.</li>
  <li><strong>Screen lock</strong>, so a pocket or a lap cannot interfere.</li>
  <li><strong>Track selection</strong> for subtitles and audio.</li>
</ul>
<p>Seeking is meaningless on a live stream, so the skip controls are absent there rather than
present and inert.</p>
<p>Playback position is remembered per item, and per episode within a series.</p>`,
        },
      ],
    },

    {
      slug: 'television',
      title: 'The television app',
      summary:
        'A ten-foot interface driven by a remote: the focus model, the key maps, and what differs from the phone.',
      sections: [
        {
          id: 'shape',
          title: 'The shape of it',
          html: `
<p>A text tab bar across the top — Live, Movies, Series, Favourites, Sources, and a settings
gear at the far right — with content beneath it. The reference is the Google TV home screen:
plain labels with a thin underline marking the selected one, no filled pills, no cards.</p>
<p>Movies and Series are one horizontally scrolling row per category, stacked vertically.
That replaces the phone's category <em>filter</em> outright: on a phone you pick a category
and get a grid, on a television every category is on screen and the remote walks through
them.</p>
<p>Live keeps the list shape, with a category rail down the left.</p>`,
        },
        {
          id: 'focus',
          title: 'The focus model, and why it is unusual',
          html: `
<p><strong>The tab bar is one focus target, not six.</strong> Moving left and right along it
switches tab immediately, but the switch is driven by the key press rather than by which
label happens to hold focus.</p>
<p>That distinction is the entire reason the bar was rebuilt. With a focusable per tab and
selection following focus, <em>any</em> event that destroyed the focused element in the
content below — opening a form, a spinner appearing, a list emptying — left Compose with no
focus target. It fell back to the first focusable in the tree, which was a tab, which
selected itself. Content could silently change which tab you were on; a viewer saw it as
"the screen flashes and disappears".</p>
<p>The settings gear is a <em>position along the bar</em> for the same reason, and for a
second one found later: an icon that opts out of this model cannot be reached at all. It
sits inside the bar's own focusable, so a focus search walks past it into the content
below. For a while the gear was both wired to nothing <em>and</em> unreachable.</p>`,
        },
        {
          id: 'keys',
          title: 'What the keys do',
          html: `
<p>On a television the key map <em>is</em> the interface, so it is written as a plain,
testable function rather than buried in a modifier.</p>
<h4>In the shell</h4>
<table>
  <thead><tr><th>Key</th><th>Effect</th></tr></thead>
  <tbody>
    <tr><td>Left / Right</td><td>Move along the tabs; past the last one lies the gear</td></tr>
    <tr><td>Down</td><td>Leave the bar for the content</td></tr>
    <tr><td>Centre / Enter</td><td>Enter the content, or open settings when on the gear</td></tr>
    <tr><td>Back</td><td>Retreat one step; from the bar, exit</td></tr>
  </tbody>
</table>
<h4>In the player</h4>
<table>
  <thead><tr><th>Key</th><th>Live</th><th>Film or episode</th></tr></thead>
  <tbody>
    <tr><td>Centre / Enter / Play-Pause</td><td colspan="2">Play or pause</td></tr>
    <tr><td>Down</td><td colspan="2">Show controls</td></tr>
    <tr><td>Left / Right</td><td>— (seeking is meaningless)</td><td>Skip by the configured interval</td></tr>
    <tr><td>Up / Channel-Up / Channel-Down</td><td>Zap through the list you came from</td><td>— (the next film is not "the next channel")</td></tr>
    <tr><td>Back</td><td colspan="2">Close the controls first, leave playback second</td></tr>
  </tbody>
</table>
<p>Where a key does nothing, it is left <em>unhandled</em> rather than swallowed, so it falls
through to the system instead of being absorbed by a player that has nothing to do with
it.</p>`,
        },
        {
          id: 'settings',
          title: 'Settings on a television',
          html: `
<p>Every setting the phone has, except two.</p>
<p><strong>Theme mode and dynamic colour are deliberately absent.</strong> The television
theme is always dark by design — a television is watched at a distance in a dim room — and a
television has no wallpaper for a dynamic palette to be drawn from. Both controls would
change nothing on screen, and after
<a href="/wiki/history#audit">the feature audit</a> this project treats a control that does
nothing as worse than an absent one.</p>
<p>Text entry — the metadata key, and renaming a category — works with the on-screen keyboard
up, which is harder than it sounds. See below.</p>`,
        },
        {
          id: 'ime',
          title: 'The keyboard trap',
          html: `
<p>Text entry on a television meets two separate problems, and only one is obvious.</p>
<p><strong>Keyboard down.</strong> A Compose text field treats the D-pad's up and down as
cursor movement within the text, so focus enters a field and never comes out. Intercepting
those keys before the field sees them fixes it.</p>
<p><strong>Keyboard up — the one that was broken.</strong> The IME takes the D-pad for itself,
because that is how a viewer moves around the on-screen keys. So the interception above
never runs at all, and every field typed goes into whichever field was focused when the
keyboard first appeared — silently, appending to whatever was already there. Filling in a
four-field form produced one field containing everything.</p>
<p>The way out is the keyboard's own action key: it becomes "next field" on every field but
the last, and "done" on the last, where it dismisses the keyboard so the buttons underneath
become reachable.</p>`,
        },
        {
          id: 'not-on-tv',
          title: 'What the television deliberately lacks',
          html: `
<p>Stated so nobody implements them by reflex: brightness and volume gestures, screen lock,
touch affordances and long-press interactions. Their television equivalents are either the
remote's own hardware keys or nothing at all.</p>
<p>Rotation does not apply — the activity is locked to landscape.</p>`,
        },
      ],
    },

    {
      slug: 'settings-reference',
      title: 'Settings reference',
      summary: 'Every setting, what it changes, and where it is stored.',
      sections: [
        {
          id: 'playback',
          title: 'Playback',
          html: `
<table>
  <thead><tr><th>Setting</th><th>Values</th><th>What it does</th></tr></thead>
  <tbody>
    <tr><td>Skip interval</td><td>5, 10, 15, 30 seconds</td><td>How far the skip controls move, on both apps</td></tr>
    <tr><td>Buffering</td><td>Low, Balanced, High</td><td>How much the player buffers ahead. Low starts faster and is more fragile on a poor connection; High is the reverse</td></tr>
    <tr><td>Maximum quality</td><td>Unlimited, 8, 4, 2 Mbps</td><td>Caps the bitrate the player will select on an adaptive stream. Useful on metered or slow connections</td></tr>
  </tbody>
</table>
<p>All three are stored in DataStore and read by the player as a flow, so a change applies
without a restart.</p>`,
        },
        {
          id: 'appearance',
          title: 'Appearance (phone only)',
          html: `
<table>
  <thead><tr><th>Setting</th><th>Values</th></tr></thead>
  <tbody>
    <tr><td>Theme</td><td>System, Light, Dark</td></tr>
    <tr><td>Dynamic colour</td><td>On, Off — Material You, taking the palette from the wallpaper</td></tr>
  </tbody>
</table>
<p>Neither exists on the television. See <a href="/wiki/television#settings">above</a>.</p>`,
        },
        {
          id: 'categories',
          title: 'Categories',
          html: `
<p>Providers name their categories however they like, and a large account can have hundreds.
Two local edits are offered, per content kind:</p>
<ul>
  <li><strong>Hide</strong> — the category disappears from browsing. Nothing is deleted.</li>
  <li><strong>Rename</strong> — a local display name.</li>
</ul>
<p>Both are local only; nothing is sent anywhere. The provider's original title stays the
storage key, so an edit reattaches after every refresh rather than being lost with the row
ids. A blank rename removes the override rather than storing one that says nothing.</p>`,
        },
        {
          id: 'metadata',
          title: 'Film and series information',
          html: `
<p><strong>Optional, off unless you supply a key.</strong> With a key from The Movie Database,
poster tiles gain a score and detail screens gain a plot, genres, a certificate, the
director or creator, and a cast list. It can also fill in artwork where your provider gave
none.</p>
<p>Your key is yours, and the service rate-limits per key, so the app is careful with it:
answers — <em>including "no match"</em> — are cached in the database across launches, and
requests are made per tile that has actually been on screen rather than per category
opened.</p>
<p>Provider artwork always wins. The service only fills a gap, because a panel's own cover is
the cover for the thing it is serving, and second-guessing it is how a grid ends up showing
the wrong film's poster.</p>`,
        },
        {
          id: 'logos',
          title: 'Channel logos',
          html: `
<p>Also optional and also off by default. Fills in artwork for live channels whose playlist
supplied none, from a public reference list.</p>
<p>Off by default is not a UI preference here — it is the "never phones home" invariant. A
clean install talks to nothing but the hosts you typed until you say otherwise.</p>
<p>It costs one download of a single index file, cached to the database, rather than a request
per channel.</p>`,
        },
        {
          id: 'backup',
          title: 'Backup and restore',
          html: `
<p>Export writes a JSON file wherever you choose through the system document picker — no
storage permission is involved. Import reads one back.</p>
<p>Two properties worth knowing:</p>
<ul>
  <li><strong>Passwords are never written to the file.</strong> The screen says so, and you
    re-enter them after importing. This is the credentials invariant holding across the
    export path.</li>
  <li><strong>A backup from a newer version is refused by name</strong>: "That backup was
    written by a newer version of Quiblo (format 99, this build reads 1)." Naming both
    versions is deliberate — a user told only "wrong format" has nothing to act on.</li>
</ul>
<p>Importing your own export is idempotent: "Nothing to restore — everything in that file is
already set up."</p>`,
        },
      ],
    },
  ],
};
