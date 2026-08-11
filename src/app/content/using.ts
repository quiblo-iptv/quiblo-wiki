import type { WikiPart } from '../core/wiki.model';

export const USING: WikiPart = {
  id: 'using',
  title: 'Using Quiblo',
  blurb:
    'Installing it, pointing it at a source, and what every screen and setting actually does. Written for someone holding the app, not reading the code.',
  pages: [
    {
      slug: 'downloads',
      title: 'Downloads',
      summary:
        'Which APK to take, how to check it is the one we published, and what a pre-release means.',
      sections: [
        {
          id: 'where',
          title: 'Where releases live',
          html: `
<p>Every release is published on
<a href="https://github.com/quiblo-iptv/quiblo-app/releases">GitHub Releases</a>. There is no
store listing, and the app never checks for updates — it has no server of ours to ask. New
versions are something you come and get.</p>
<p>Each release carries four files: two APKs, and a <code>.sha256</code> beside each.</p>`,
        },
        {
          id: 'which-apk',
          title: 'Which APK is yours',
          html: `
<table>
  <thead><tr><th>File</th><th>Install it on</th></tr></thead>
  <tbody>
    <tr><td><code>quiblo-&lt;version&gt;.apk</code></td><td>A phone or a tablet</td></tr>
    <tr><td><code>quiblo-tv-&lt;version&gt;.apk</code></td><td>Android TV or Google TV</td></tr>
  </tbody>
</table>
<p>They are separate applications with different ids, so both can sit on one device without
interfering. They share every layer beneath the screens; what differs is the interface, and a
television interface driven by a remote is a different piece of work rather than the same one
stretched.</p>
<p><strong>The phone APK will install on a television and then never appear in its
launcher.</strong> That is the most common confusion we hear about, and it is by design rather
than a packaging fault: the phone build declares no leanback launcher entry, because a
touch-first interface reached with a D-pad is worse than no entry at all. Install the
<code>-tv</code> one there.</p>
<p>The minimum Android version is <strong>11 (API 30)</strong> for both.</p>`,
        },
        {
          id: 'verify',
          title: 'Checking what you downloaded',
          html: `
<p>Each APK is published with its SHA-256 checksum beside it, so you can confirm the file you
have is the file we built. Download both, put them in the same directory, and run:</p>
<pre><code>sha256sum -c quiblo-&lt;version&gt;.apk.sha256</code></pre>
<p>On Windows, <code>certutil -hashfile quiblo-&lt;version&gt;.apk SHA256</code> prints the
hash to compare by eye.</p>
<p>This is worth doing because an IPTV player is exactly the kind of app that gets
repackaged with something added. A checksum that matches means the file came from our build,
whatever site you found it on — and a checksum that does not match means throw it away, no
matter how plausible the source looks.</p>
<p>Every published APK is signed with the project's release key. Android will refuse to
install a build signed with a different key over one of ours, which is a second, automatic
version of the same check.</p>`,
        },
        {
          id: 'stable-and-pre',
          title: 'Stable releases and pre-releases',
          html: `
<p>Some releases are marked <strong>Pre-release</strong> on that page. The difference is a
claim about testing, not about the build process — both are built and signed identically by
the same automation.</p>
<ul>
  <li><strong>A beta</strong> is feature-complete for its version and has been swept on real
    devices. It is the one to take if you want to help us find things.</li>
  <li><strong>An alpha</strong> exists to prove the release machinery works. It is not for
    watching television with.</li>
  <li><strong>A stable release</strong> is one with no pre-release marker, and it is what
    GitHub offers as "Latest".</li>
</ul>
<p>Version numbers follow semantic versioning: the middle number moves when something is
added, the last when something is fixed.</p>`,
        },
        {
          id: 'upgrading',
          title: 'Upgrading, and the one case that needs an uninstall',
          html: `
<p>Installing a newer APK over an older one keeps everything — sources, favourites, history
and profiles all survive, and the database migrates itself.</p>
<p><strong>The exception is a build somebody handed you before the project published signed
releases.</strong> Those were signed with the Android debug key, and Android will not upgrade
over one with a properly-signed build: the install simply fails, usually with a message about
conflicting signatures that does not explain itself. Uninstall the old build first.</p>
<p>On a television, "uninstall" can also mean uninstalling for <em>another user account on the
device</em> — a build installed under a second profile blocks the install without appearing in
the launcher you are looking at. If a television refuses a release for no visible reason,
that is the first thing to check.</p>`,
        },
      ],
    },
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
<p>Quiblo ships with nothing. First launch asks who is watching — see
<a href="/wiki/profiles">Who is watching</a>, and answer it with a name, or with Guest — and
then has no content, so the next step is to add a source.</p>
<p>On the phone that is the <strong>Sources</strong> destination. On the television it is
<strong>Settings</strong>, then <strong>Sources</strong>: adding a playlist is something a
viewer does once, and a remote should not spend a top-level position on it.</p>
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
has met most often. See <a href="/wiki/what-we-learned#blocks">the provider blocks</a>.</p>
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
scroll. Every one of the above also passes a token bucket: a burst of eight is allowed
through untouched, so a refresh you asked for is never slowed down, and after that requests
are spaced one every 400&nbsp;ms — two and a half a second — however many rows go by.</p>
<p>One thing on this page costs nothing to your provider at all: <strong>describing the
catalogue</strong> talks to The Movie Database with your own key, and never to the panel.
It has <a href="/wiki/settings-reference#scan">its own budget</a>.</p>`,
        },
      ],
    },

    {
      slug: 'profiles',
      title: 'Who is watching',
      summary:
        'Local profiles: separate favourites and resume points, a guest that leaves nothing behind, and no PIN.',
      sections: [
        {
          id: 'what-they-are',
          title: 'What a profile owns',
          html: `
<p>A household shares a television, and a resume point is personal. A profile carries
<strong>favourites and resume positions</strong>, and nothing else.</p>
<p>Everything else stays app-wide, deliberately:</p>
<table>
  <thead><tr><th>Per profile</th><th>Shared by everyone</th></tr></thead>
  <tbody>
    <tr><td>Favourites</td><td>Sources and passwords</td></tr>
    <tr><td>Resume points, including per episode</td><td>Player settings — skip, buffering, quality</td></tr>
    <tr><td>Continue watching</td><td>Hidden and renamed categories</td></tr>
    <tr><td></td><td>The metadata key, and what it has cached</td></tr>
  </tbody>
</table>
<p>The dividing line is whether a setting describes the person on the sofa or the television
and the account behind it. A playlist is the household's, and a home that had to type its
Xtream credentials in once per person would rightly call that a bug.</p>`,
        },
        {
          id: 'choosing',
          title: 'Choosing, and switching',
          html: `
<p>The chooser stands in front of the app on both the phone and the television: until somebody
has said who they are, nothing is drawn that would have to read a favourite or a resume point
to draw itself. It offers the profiles that exist, a field to add another, and Guest.</p>
<p>Your choice is remembered between launches, so the chooser is not a screen you meet every
day — only on a first launch, after switching, and after a guest session ends.
<strong>Switch profile</strong> lives under Settings on both apps and brings the chooser
back.</p>
<p>Two things are honestly missing today: <strong>a profile cannot be renamed or removed</strong>
once it exists, other than by clearing the app's data. The storage and the plumbing for
removal are there; the screen for it is not, and we would rather say so than let you go
looking for a button.</p>`,
        },
        {
          id: 'guest',
          title: 'Guest',
          html: `
<p><strong>Guest is the profile that leaves nothing behind.</strong> It favourites and resumes
like any other while it is running, and when the guest leaves, all of it is deleted.</p>
<p>It is also deleted at every startup, which is not belt and braces — it is the only version
that works. A television is switched off at the wall, and a process the system kills never
gets to tidy up after itself. Clearing at startup is a promise the app can keep whatever
happened to the last session.</p>
<p>There is at most one guest at a time, because a second would be a second set of throwaway
favourites that nobody could tell apart in the chooser.</p>`,
        },
        {
          id: 'no-pin',
          title: 'No PIN, and what that means',
          html: `
<p>There is no password and no PIN on a profile. This answers <em>whose favourites are
these</em>, not <em>who is allowed to watch what</em> — anybody holding the remote can switch
to any profile.</p>
<p>Parental control is a different feature with different requirements, and offering a
chooser that looks like a lock without being one would be worse than offering neither. If you
need to restrict what a child can reach, Quiblo does not do that today.</p>`,
        },
        {
          id: 'upgrading',
          title: 'Upgrading from a version without profiles',
          html: `
<p>Nothing is lost. Everything already on the device — every favourite, every resume point — is
moved onto a single profile named <strong>Default</strong>, and the first launch after
upgrading shows the chooser with that profile in it. Pick it and everything is where you left
it.</p>
<p>A household of one can pick Default every few weeks and otherwise forget the feature
exists.</p>`,
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
responsive across a twenty-thousand-entry playlist.</p>
<p>Those search fields each answer for one kind: searching under Movies searches films. The
<a href="/wiki/television#search">single search across all three kinds</a> is on the
television today, and the phone is the side of that pair still to be brought over.</p>
<p>Which favourites and which resume points you see depends on
<a href="/wiki/profiles">who is watching</a>. Everything else here is shared.</p>`,
        },
        {
          id: 'accessibility',
          title: 'What a screen reader hears',
          html: `
<p>Playback is the part of the app where a silent screen is genuinely ambiguous — a stream
that is buffering and a stream that has died look identical, and to TalkBack they used to
sound identical too, which is to say like nothing at all.</p>
<p>Both are announced now, as live regions: buffering when the player stalls, and the failure
text when it gives up. On the television the same announcements go out, because a set-top box
has TalkBack too and a remote gives even less to feel around with.</p>`,
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
<p>A tab bar across the top — a search magnifier, then Live, Movies, Series, Favourites, and a
settings gear at the far right — with content beneath it. The reference is the Google TV home
screen: plain labels with a thin underline marking the selected one, no filled pills, no
cards.</p>
<p>Two of those positions are chosen rather than inherited. <strong>Search is first, and the
only one drawn as an icon</strong>: a magnifier says "search" in every language and needs no
word beside it, the leftmost position is where a remote already rests when the app opens, and
it is where Back comes to rest — Back from any catalogue lands on Search, and Back again
leaves the app. <strong>Sources is not on the bar at all</strong>; it is in Settings, because
adding a playlist is a thing done once and the bar is for things done daily.</p>
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
    <tr><td>Back</td><td>Retreat one step; from a catalogue, back to Search; from Search, exit</td></tr>
  </tbody>
</table>
<p>Back resting on Search rather than on Live is deliberate: a viewer pressing Back repeatedly
is trying to leave, and each press should visibly get closer to it rather than cycling.</p>
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
          id: 'search',
          title: 'Search',
          html: `
<p><strong>One search across live channels, films and series at once</strong>, rather than a
box on each of the three. A viewer looking for a title does not know which shelf their
provider filed it on — panels routinely list the same film as a film <em>and</em> as a
one-episode series — and a search that answers for one kind is a search that appears to have
found nothing.</p>
<p>Results come back grouped by kind, as rows, using the same poster rows the catalogue tabs
use. Nothing is asked of your provider: search runs against what is already on the device.</p>
<h4>Its two shapes</h4>
<p>At rest the screen is the name and a field in the middle of the panel and nothing else,
because typing something is the only thing to do there. Asking a question moves the field to
the top and gives the rest of the panel to the answer.</p>
<h4>Advanced</h4>
<p>Behind <strong>Advanced</strong> is a genre filter — a second question about the catalogue
rather than part of the first, so it stays out of the way until asked for. It is built from
whatever film and series information has already been cached, so it costs nothing and lists
only genres your own catalogue actually contains: offering "Western" to a library holding
none is a control that can only disappoint.</p>
<p>Alongside it sits a <strong>coverage figure</strong> — how much of your catalogue has been
described so far. It is on screen rather than hidden because a genre filter running against a
tenth of a library is telling less than the whole truth, and silently omitting nine films in
ten is worse than saying so. <a href="/wiki/settings-reference#scan">Describing the
catalogue</a> is what raises it.</p>`,
        },
        {
          id: 'settings',
          title: 'Settings on a television',
          html: `
<p>Every setting the phone has, except two — plus two things the phone reaches elsewhere.</p>
<p><strong>Sources lives here</strong>, rather than on the tab bar, and so does
<strong>Switch profile</strong>. Both are things a viewer does rarely, and the bar is
expensive: every position on it is one more press between somebody and what they came to
watch.</p>
<p><strong>Theme mode and dynamic colour are deliberately absent.</strong> The television
theme is always dark by design — a television is watched at a distance in a dim room — and a
television has no wallpaper for a dynamic palette to be drawn from. Both controls would
change nothing on screen, and after
<a href="/wiki/what-we-learned#audit">the feature audit</a> we treat a control that does
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
answers — <em>including "no match"</em> — are cached in the database across launches, requests
are made per tile that has actually been on screen rather than per category opened, and they
pass a token bucket that holds the sustained rate to eight a second.</p>
<p>A <em>failure</em> is never cached. "Nothing matches this title" is an answer worth
remembering; "I could not ask" is not one, and writing it down as though it were is how a
catalogue ends up permanently described as empty.</p>
<p>If you would rather not wait for the cache to fill a tile at a time, you can
<a href="/wiki/settings-reference#scan">describe the whole catalogue</a> in one go.</p>
<p>Provider artwork always wins. The service only fills a gap, because a panel's own cover is
the cover for the thing it is serving, and second-guessing it is how a grid ends up showing
the wrong film's poster.</p>`,
        },
        {
          id: 'scan',
          title: 'Describing the whole catalogue',
          html: `
<p>Ordinarily film and series information arrives a tile at a time, for things you have
actually looked at. That is the right default — it costs nothing for a library you never
open — but it leaves the <a href="/wiki/television#search">genre filter</a> knowing only the
corners of your catalogue you have already walked past.</p>
<p><strong>Describe catalogue</strong>, under film and series information, asks about
everything in one go. It appears once a key has been accepted, and it shows what it is doing
while it runs: a progress bar, the number described so far out of the total, and how many of
them The Movie Database holds nothing for.</p>
<table>
  <thead><tr><th>What it costs</th><th></th></tr></thead>
  <tbody>
    <tr><td>Requests to your IPTV provider</td><td><strong>None.</strong> It reads the catalogue already on the device</td></tr>
    <tr><td>Requests to The Movie Database</td><td>One per title not already cached, paced at eight a second</td></tr>
    <tr><td>Titles already cached</td><td>Skipped — including the ones cached as "no match"</td></tr>
  </tbody>
</table>
<p>Three properties make it safe to press:</p>
<ul>
  <li><strong>It stops itself.</strong> If the service asks us to slow down, or rejects the
    key, the scan stops asking rather than grinding on. It says which of those happened,
    because waiting fixes one and nothing fixes the other.</li>
  <li><strong>It resumes.</strong> Everything fetched before it stopped is cached and
    counted, so starting again carries on from there rather than from the beginning. The same
    is true if you cancel.</li>
  <li><strong>Failures are never written down.</strong> A title that could not be asked about
    is left unknown, not recorded as having no match. Caching a rate limit as an answer would
    poison a catalogue for a fortnight and leave the genre filter confidently empty.</li>
</ul>
<p>The key is yours, so the pacing matters beyond this app: a throttled key is throttled for
everything else you use it for.</p>`,
        },
        {
          id: 'profiles-setting',
          title: 'Who is watching',
          html: `
<p>Shows the current profile and offers <strong>Switch profile</strong>, which returns you to
the chooser. Adding a profile happens in the chooser itself.</p>
<p>Only favourites and resume points belong to a profile; everything else on this page is
shared by everyone using the device. <a href="/wiki/profiles">Who is watching</a> sets out the
whole division, and what guest does differently.</p>`,
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
    {
      slug: 'troubleshooting',
      title: 'When something looks wrong',
      summary:
        'The failures we see most, and how to tell an app bug from a provider one.',
      sections: [
        {
          id: 'first',
          title: 'Check this first',
          html: `
<p>Most reports we get are one of five things, and four of them are not bugs in the app.</p>
<table>
  <thead><tr><th>What you see</th><th>Usually</th></tr></thead>
  <tbody>
    <tr><td>Movies and Series tabs are empty</td><td>The source is an M3U. An M3U cannot say what kind of thing an entry is, so everything parses as Live. Films and series need Xtream.</td></tr>
    <tr><td>No programme information anywhere</td><td>Also an M3U — the format carries no schedule at all.</td></tr>
    <tr><td>"Cannot refresh", and details fail too</td><td>The provider is refusing the account. See below.</td></tr>
    <tr><td>A stream buffers or will not start</td><td>The provider, the connection, or a format we do not support. Try another channel first — if every channel fails, it is not the stream. Both players name the reason rather than hanging: unreachable, timed out, unsupported format, DRM, or gone.</td></tr>
    <tr><td>Artwork missing on live channels</td><td>The playlist supplied none. Optional logo lookup fills these in, and is off by default.</td></tr>
    <tr><td>The genre filter is empty, or lists very little</td><td>Genres come from film and series information, which is off until you supply a key, and then fills in for titles you have looked at. <a href="/wiki/settings-reference#scan">Describe the catalogue</a> to fill it in one go.</td></tr>
    <tr><td>Your favourites have vanished</td><td>Check <a href="/wiki/profiles">who is watching</a>. Favourites belong to a profile, and a guest session keeps none of them.</td></tr>
  </tbody>
</table>`,
        },
        {
          id: 'blocked',
          title: 'When a provider stops answering',
          html: `
<p>Panels run anti-flood firewalls, and when one decides an account is asking too often it
stops answering the API entirely — while streams keep playing. That combination is the
signature: <strong>you can watch what you already loaded, but nothing will refresh</strong>.</p>
<p>We hold the app to a strict request budget so it cannot cause this — see
<a href="/wiki/getting-started#what-costs">what costs a request</a> — and when a panel refuses,
the app stops asking for fifteen minutes rather than hammering it. That backoff survives a
restart on purpose: force-stopping the app does not clear it, because doing so is exactly what
turns a short block into a long one.</p>
<p>If you hit one, the honest answer is to wait it out or speak to the provider. There is
nothing to fix in the app while it is active, and "failed to load details" is expected rather
than a second bug.</p>`,
        },
        {
          id: 'evidence',
          title: 'Telling an app bug from a provider one',
          html: `
<p>Two checks separate them quickly.</p>
<ul>
  <li><strong>Does it fail outside the app?</strong> If the same account fails from a plain
    HTTP request on the same network, the app is not involved.</li>
  <li><strong>Does it fail for every item, or one?</strong> A single stream that will not play
    is usually that stream. Everything failing at once is the account, the connection, or
    us.</li>
</ul>
<p>If you are reporting something to us, the most useful things you can include are: which
build (phone or television), what kind of source, whether it is one item or all of them, and
whether anything changed just before it started. Please never paste a URL that contains your
username and password — we do not want them, and the app never logs them.</p>`,
        },
        {
          id: 'reset',
          title: 'Starting clean without losing your setup',
          html: `
<p>Export your configuration first — Settings, then Backup. The file records your sources and
favourites, and deliberately <strong>not</strong> your passwords, so you re-enter those after
importing.</p>
<p>Then remove and re-add the source, or reinstall. Importing the file restores what it holds,
and importing your own export twice is harmless: the app tells you there was nothing left to
restore rather than duplicating anything.</p>`,
        },
      ],
    },
  ],
};
