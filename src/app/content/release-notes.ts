import type { WikiPage } from '../core/wiki.model';

/**
 * Every release, in one place.
 *
 * Its own file rather than another two hundred lines inside `using.ts`: this page grows by a
 * section on every release, and a file that only ever gets appended to is easier to append to
 * when it is not sharing a file with six pages that do not change.
 *
 * **Written from `CHANGELOG.md` in the app repository, not from the commit log.** The changelog
 * is release notes as the release lane publishes them; this is the same text arranged for
 * somebody reading the wiki rather than a releases page, which means newest first and the
 * feature it added rather than the defect it closed.
 */
export const RELEASE_NOTES: WikiPage = {
  slug: 'release-notes',
  title: 'Release notes',
  summary:
    'Every version of Quiblo and what it added, newest first — including the alpha that is not on the releases page yet.',
  sections: [
    {
      id: 'alpha',
      title: 'The current alpha — whose settings are these',
      html: `
<p><strong>This is not on the releases page yet.</strong> It is one round of work waiting on a
merge. Everything below it has shipped.</p>

<h3>Settings are yours, not the television's</h3>
<p>A profile used to carry your favourites and your resume points and nothing else. Everything
else — your theme, how far the skip buttons jump, which writing systems you had hidden, which
shelves you had turned off — was shared by everybody using the device, and nothing on screen said
so. Two people on one television had their own lists and one shared idea of what the app looked
like.</p>
<p>Everything a person chooses now belongs to that person, and <strong>the settings screen says
which is which</strong>: it opens on two tabs, <strong>Profile</strong> and <strong>App</strong>.
Profile holds your theme, playback tuning, subtitles, hidden writing systems, hidden categories,
the merge switches and your tabs. App holds the device — sources, the Movie Database key, backup,
updates and licences. Switching profile redraws the app immediately.</p>
<p><strong>Nothing changes on upgrade.</strong> Every profile starts out seeing the settings the
device already had, and they only go their own way when somebody changes one.</p>

<h3>Hiding a category now actually hides it</h3>
<p>Switching a category off removed it from the list of categories and from search, and left every
title in it sitting in the catalogue — in the phone's grid, in the television's rows and in
Recently Added. The browse queries never looked at the setting at all. They do now.</p>
<p>The one exception is <strong>Favourites</strong>: a title you starred stays visible even if you
later hide the shelf it came from. Hiding a category filters the catalogue; it never removes
something you picked by hand.</p>

<h3>Hide the tabs you never use</h3>
<p>Live, Movies, Series and Favourites can each be switched off, per profile. An M3U with no films
no longer shows a Movies tab that opens on nothing. Search, Sources and the television's Home
always stay, and the last visible tab will not switch off.</p>
<p>It is a preference, not a lock — anybody can switch a tab back on. Quiblo still has no parental
controls, and a chooser that looked like one without being one would be worse than none.</p>

<h3>One grid instead of shelves</h3>
<p>A second switch beside <em>Merge duplicate titles</em>. Providers file the same film under
<code>FILMS HD</code>, <code>FILMS 4K</code> and <code>FILMS AR</code>, so merging the copies still
left it reachable from three shelves and the catalogue still read as three catalogues. Turn this on
and the shelves go, leaving one grid of everything.</p>

<h3>Quiblo tells you when there is a newer version</h3>
<p>Quiblo is installed from an APK and has no store behind it, so a build eight months old had no
way of saying so — and the <em>Check now</em> button added last round only helps somebody who
thinks to press it.</p>
<p>It now asks our own releases page once each time it opens, and offers <strong>Update now</strong>
or <strong>Later</strong> if there is something newer. The television downloads it and verifies the
published checksum before the installer sees it, exactly as the button does; the phone opens the
releases page in a browser, because it holds no install permission and deliberately never will.</p>
<p><strong>It says nothing at all unless there is something newer.</strong> Not "up to date", not
"could not reach" — those belong to the button, where you asked. One switch in Settings turns the
whole thing off, and off means no request is made rather than an answer being hidden. Nothing about
you or your device is ever sent; your version is compared on the device. The terms screen names it,
because <a href="/wiki/legal-and-licence#privacy">"the app never phones home"</a> was written before
this existed and is worth keeping honest.</p>

<h3>Smaller things</h3>
<ul>
  <li>A film or series screen on the television is lit again. The ambient light belonged to the
      shell, and the shell is taken down whenever a detail screen opens over it — so the two
      screens with the best artwork in the app were the two that stayed black.</li>
  <li>The favourite control on the television's hero slider is no longer red. A filled icon, a red
      tint, a red panel and a red border all said the same thing four times, in the one colour a
      television uses for errors. The heart is filled or hollow; the chrome follows focus.</li>
  <li>Search result headings stay on screen on a real television panel. <em>Live</em>,
      <em>Movies</em> and <em>Series</em> were there on a phone and on the emulator and gone on the
      television: the poster row was a fixed size, so on a shorter panel it did not fit under the
      search field. The tiles are now sized from the room the row is actually given.</li>
</ul>`,
    },
    {
      id: 'v0-25',
      title: '0.25.0 — one entry per title, and a key on the first screen',
      html: `
<h3>Merge duplicate titles</h3>
<p>A provider that lists one film in SD, HD, FHD and 4K sends four rows. Turn this on in Settings
and the catalogue, the search results, the recently-added row and the category counts show it once,
with the copies offered on the film's own screen — so switching to the 4K one is a press. Off by
default, because merging hides rows a provider sent.</p>

<h3>First launch asks for a Movie Database key</h3>
<p>A fourth page after the playlist, skippable in one press, with a button that opens the page
where a key is made. Nothing on screen used to say a key existed, so anybody who never opened
Settings never found out why their films had no posters.</p>

<h3>Advanced search filters by year</h3>
<p>A Years chip beside Genres on the television, listing every year the app has metadata for,
newest first — on its own or together with a genre. It shares the one chip strip rather than taking
a row of its own, because a second row is what pushes a focused result off the bottom of the
screen.</p>

<h3>Your categories are yours</h3>
<p>Hiding, renaming and reordering a category used to decide it for everybody on the device.
Everything that existed is copied to every profile on upgrade, so nobody's list changes; they go
their own way from there.</p>

<h3>Smaller things</h3>
<ul>
  <li>The button that changes the featured titles is back on the television home screen.</li>
  <li>The launch screen no longer plays again every time the screen rotates.</li>
  <li>The Quiblo mark on the launch screen is the app's own mark again, rather than a hand-made
      copy with the ring, the tail and the play triangle in the wrong places.</li>
  <li>The television build is a megabyte smaller — it shipped the launch sound twice.</li>
</ul>`,
    },
    {
      id: 'v0-21-to-0-24',
      title: '0.21.0 to 0.24.0 — a hero slider, and a launch screen with a sting',
      html: `
<h3>A featured hero slider on the television</h3>
<p>The television home screen opens on a full-bleed hero banner with a six-step D-pad flow through
the top controls, play, a heart, and the pagination dots. Favourite a featured title without leaving
the banner. Backdrops and posters moved to full resolution, because a large panel is exactly where a
scaled-up thumbnail shows.</p>

<h3>A launch screen</h3>
<p>An animated mark with the version number in the corner, on both apps, crossfading into the
consent and profile screens. The television's got an audio sting and a zoom-through timed to
it.</p>

<h3>Smaller things</h3>
<ul>
  <li>Home-screen shelves are ordered — Popular films, Popular series, Recently added, You may like
      — with a dark scrim keeping the tab bar legible over a full-bleed backdrop.</li>
  <li>Outlined rating thumbs when unselected, and icon-only start-over and remove-from-history
      buttons on the television's film and series screens.</li>
  <li>The series screen scrolls its header out of the way on focus, and the season row navigates
      more predictably.</li>
  <li>The television search bar is optically centred with tighter filter spacing.</li>
</ul>`,
    },
    {
      id: 'v0-20',
      title: '0.20.0 to 0.20.2 — the television, used rather than demonstrated',
      html: `
<p>Eight faults found by using the app for an evening rather than by reading it — none of them
reachable by opening a screen and looking at it.</p>
<ul>
  <li><strong>Backing out of a film puts you back on the tile you opened it from.</strong> The
      television used to land you at the top of the catalogue. Every tab keeps its own place too,
      and switching between them no longer snatches the remote off the tab bar.</li>
  <li><strong>The remote can no longer be left on nothing inside the player.</strong> The controls
      arrive with the stream, so a button could disappear from under the cursor and leave presses
      going nowhere.</li>
  <li><strong>Scrubbing the timeline shows you where you are going.</strong> The mark has a handle,
      in a lane of its own so the buttons underneath do not shift as it grows.</li>
  <li><strong>A focused search result is no longer sliced along its title.</strong></li>
  <li><strong>Back in the player exits playback</strong> rather than only hiding the controls.</li>
  <li><strong>"You may like" appears for people who star titles and finish none of them.</strong>
      A favourite is evidence about your taste.</li>
  <li><strong>Advanced search can look at live channels from the search screen</strong>, as a switch
      beside the field rather than a setting two screens away — and <em>Include hidden</em> is a
      switch too, beside the field instead of behind the suggestions.</li>
  <li><strong>A genre chip chooses, and Clear unchooses.</strong> Pressing a chip a second time no
      longer takes it off.</li>
</ul>`,
    },
    {
      id: 'v0-19',
      title: '0.19.0 — the catalogue under load, and the light that keeps up',
      html: `
<p><strong>Movies, Series and Live load a screenful rather than a catalogue.</strong> Opening a tab
used to read every title of that kind out of the database — tens of thousands of rows on a large
account — build an object for each, and hand the lot to a list that draws about a dozen. It loads
pages as you scroll now. The television's channel list pages too, and still asks for the guide of
the first ten channels the moment it opens.</p>
<p><strong>Advanced search answers a genre instead of thinking about it.</strong> Filtering used to
re-clean every title on your account from scratch, fifty thousand of them, on every press, with
nothing kept between presses. Each title's cleaned name is worked out when your playlist is loaded
and remembered, so a genre is one indexed lookup. Hiding a writing system got the same treatment.</p>
<p><strong>The ambient light keeps up with the picture</strong> — four times as many reads, settling
twice as fast, close enough to read as the picture's own light. The light behind the catalogue keeps
up with the remote in the same way. Search and Live now put out the light the catalogue left on, and
Search lights itself instead: two soft pools travelling the screen on the same six-second circuit as
the highlight going round the search box.</p>
<p><strong>Generated profile pictures are faces</strong> rather than four coloured shapes — the same
face on your phone, on the television, and after a restore, because what is stored is still only the
seed.</p>
<p><strong>Back twice on Search closes Quiblo, and it asks first.</strong> Backing out used to hand
the press to the system, which backgrounds the app — so the next launch carried on as whoever was
watching last, with no way to get the "who is watching" screen back.</p>
<p>Fixed: Now popular going missing on the television when the encrypted key had not been read yet,
and the settings and profile buttons sometimes opening with nothing lit.</p>`,
    },
    {
      id: 'v0-18',
      title: '0.18.0 — For You, and a television that asks before it types',
      html: `
<p><strong>The television's Recently Added tab became For You, and holds three rows:</strong>
Recently Added itself, <strong>Now popular</strong> — what the world is watching of the things your
provider actually carries — and <strong>You may like</strong>, suggested from what has been watched
on your profile, every tile saying which of your own choices put it there.</p>
<p><strong>Suggestions are worked out on the device and nowhere else.</strong> No account, no server,
nothing sent anywhere. Per profile, so nobody in the house sees anybody else's viewing. A row with
nothing to say is not drawn — no empty shelf, no spinner that never finishes.</p>
<p><strong>The television asks before it types.</strong> Every text field used to throw the on-screen
keyboard over the screen the moment the remote landed on it, so walking down the settings list
opened and dismissed a keyboard at every field on the way. A field now rests under focus and opens
its keyboard when it is pressed, the way a field on a phone is tapped before it is typed into.</p>
<p><strong>The category editor is a room you enter, not a list you walk through.</strong> It was a
scroller among the settings rows, so passing it cost one press per category — two hundred of them on
a real account.</p>
<p>Fixed: hiding a writing system now hides a title with any of it in, rather than reading the first
letter and stopping; a hidden category is hidden from search too; advanced search returns films
<em>and</em> series rather than whichever the database happened to reach first.</p>`,
    },
    {
      id: 'v0-17',
      title: '0.17.0 — Recently Added grows up, and the detail line fills in',
      html: `
<p>Recently Added says what each poster is, covers the last thirty days rather than the newest forty
titles whenever they arrived, and falls back to <strong>Latest in your playlist</strong> for a
playlist that carries no dates — headed honestly, because where something sits in a playlist is not
a date.</p>
<p>A film says what year it is from and how long it runs; a series says what year it began, with or
without a metadata key; every episode says how long it is.</p>
<p>Fixed: the television's channel list shows what is on now without being prodded; a guide that is
not arriving says <em>why</em>, and one of the two reasons is worth taking to your provider; an hour
of metadata scanning survives a restart, including on a television whose clock is wrong when it
boots; and saving the same TMDB key twice no longer empties the cache.</p>`,
    },
    {
      id: 'v0-16',
      title: '0.16.0 — Recently Added',
      html: `
<p>A Recently Added tab on the television, between Live and Movies, holding the newest films and
series in one row rather than one row each. Xtream accounts fill it, because a panel says when it
added each title; M3U playlists carry no dates and the tab says so instead of showing a list ordered
by nothing. It costs no extra request: the dates arrive inside lists the app already fetches.</p>`,
    },
    {
      id: 'v0-15',
      title: '0.15.0 and 0.15.1 — profiles on the television',
      html: `
<p>Pick a face for a profile on the television — a row of generated pictures rather than five drawn
faces that look alike from the sofa. The profile icon sits on the top bar to the right of the gear,
and does the one thing a household reaches for: hand the remote to somebody else.</p>
<p>0.15.1 fixed the launcher tile, which was the square app icon dropped into a 16:9 frame; it is a
proper 320x180 banner now. The gear and the profile picture were spaced like two tab labels and read
as two unrelated controls.</p>`,
    },
    {
      id: 'v0-14',
      title: '0.14.x — the television stops being black',
      html: `
<p><strong>Whatever has focus lights the screen behind it.</strong> The poster you are looking at
tints the corners of the catalogue, and in the player the picture lights its own letterbox bars, so
a film in 2.35:1 or a channel in 4:3 sits in a room rather than in a void. It is light added to the
black, never a replacement: artwork with no usable colour leaves the screen exactly as it was.</p>
<p>The search field gained a slow travelling highlight while the remote is elsewhere, which stops
the moment the field takes focus — the focus ring is the one moving thing on a television that must
never be competed with. Important buttons carry the same highlight at a third of the brightness.</p>
<p>The four patch releases after it are the search screen being corrected against a real fifty-inch
panel rather than a laptop: the mark drawn at its true size, the block centred by measurement rather
than arithmetic, Advanced offered once rather than twice, and the highlight travelling at a constant
speed along the outline instead of crawling the short ends and leaping the long ones.</p>`,
    },
    {
      id: 'v0-13',
      title: '0.13.0 and 0.13.1 — a television player you can navigate',
      html: `
<p><strong>The television player has real controls.</strong> Play and pause in the middle with the
two skips either side and the episode steps outside those; subtitles, audio and picture fit in a row
underneath. Press down for them, down again for the second row. Every button says what it is to
TalkBack, which an icon on its own does not. The remote's own keys still do everything they did with
nothing on screen.</p>
<p><strong>Next and previous episode</strong>, in the order the episodes were made, stopping at the
first and last rather than wrapping — a series is a thing that finishes. When one ends the next
starts on its own after a countdown you set from three to fifteen seconds, or Off, which still
offers it and waits.</p>
<p>0.13.1 was fourteen fixes, several of them invisible until they were not: errors said what went
wrong again in released builds, where a class name the release build renames had reduced every
typed failure to "something went wrong"; an episode stopped restarting from the beginning when the
screen was rebuilt; a subtitle file too large to load was refused instead of crashing after it had
been read into memory; searching for a title containing <code>%</code> or <code>_</code> found that
title; and a 67,000-entry playlist stopped being parsed on the frame you were looking at.</p>`,
    },
    {
      id: 'v0-12',
      title: '0.12.0 — subtitles are actually drawn, and the guide gets a timeline',
      html: `
<p><strong>Subtitles are drawn.</strong> They were not before: the player selected a text track and
showed nothing, because nothing on screen was drawing the cues. Every subtitle track the app had
ever offered was invisible. Size, colour and background are set from inside the player, while a
subtitle is showing, so the effect is visible as it is chosen.</p>
<p><strong>A channel's whole programme guide, on a timeline.</strong> Long-press a channel and the
listing is laid out against the clock — an hour behind, half a day ahead, each programme as wide as
it is long. The times are the television's own, whatever zone the panel keeps. The full listing is
asked of the provider only when you ask for it, once per channel per session.</p>`,
    },
    {
      id: 'v0-11',
      title: '0.11.0 — subtitle files',
      html: `
<p>A film whose panel supplies subtitle files offers them in the player's subtitle list, and any film
can be given one from the device: <code>.srt</code>, <code>.vtt</code>, <code>.ass</code> or
<code>.ttml</code>. The choice is remembered against the title.</p>
<p><strong>Read in the encoding they were written in.</strong> An Arabic <code>.srt</code> in
windows-1256 — which is most of them — used to be a screen of symbols, because the player assumed
UTF-8. A picked file is copied into the app rather than referenced, so it survives the picker's
permission expiring and the file being moved later.</p>`,
    },
    {
      id: 'v0-6-to-0-10',
      title: '0.6.0 to 0.10.0 — writing systems, search and series order',
      html: `
<ul>
  <li><strong>0.10.0</strong> — hide titles written in a script you do not read. Ten writing systems
      in Settings; hiding one removes those titles from browse and from search. Favourites and what
      you have half-watched are never filtered: those are titles you picked by hand.</li>
  <li><strong>0.9.0</strong> — right-to-left titles are laid out right-to-left, on both apps,
      without turning the rest of the screen around them.</li>
  <li><strong>0.8.0</strong> — forget a title from Continue watching on the television by
      long-pressing it; search suggests as you type, from what is already loaded, at no extra
      request to the panel.</li>
  <li><strong>0.7.0</strong> — nothing user-facing. Published by the release lane on a merge that
      changed only documentation, and left here rather than tidied away.</li>
  <li><strong>0.6.0</strong> — seasons can be merged into one continuous list and the order
      reversed, remembered per person per series; a refresh button on both detail screens for a
      title whose artwork or plot came back wrong.</li>
</ul>`,
    },
    {
      id: 'before',
      title: 'Before 0.6.0',
      html: `
<p>Versions before <code>0.6.0</code> predate the changelog. They are the first working app: M3U and
Xtream sources, live TV, films and series with seasons and episodes, the player and its settings,
favourites, resume, search, profiles, the metadata cache, and backup and restore. Those releases are
on the <a href="https://github.com/quiblo-iptv/quiblo-app/releases">releases page</a> with their
APKs and checksums.</p>
<p>Two of them — <code>0.2.1</code> and <code>0.2.2</code> — contained nothing at all, and are left
published rather than deleted. The release lane was running on merges that changed only
documentation; the fix is described in the engineering part of this wiki, and the empty releases are
the evidence it was needed.</p>`,
    },
  ],
};
