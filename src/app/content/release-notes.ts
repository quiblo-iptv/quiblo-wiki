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
      title: 'The current alpha — first launch, the timeline, and updating itself',
      html: `
<p><strong>This is not on the releases page yet.</strong> It is four rounds of work merged onto one
branch, waiting on a merge. Everything below it has shipped.</p>

<h3>The television asks for your playlist on the first screen</h3>
<p>Setting Quiblo up used to end at the terms and drop you into an app with nothing in it, where the
next thing to do was four presses deep in Settings. There is a third page now: add the playlist or
account you already have and it loads before the app opens, or skip and do it later. If it will not
load, the page says so and offers to try again — rather than letting you in and leaving you to work
out that nothing arrived.</p>

<h3>You can drag the film's timeline with the remote</h3>
<p>The progress bar takes focus now, one press below play and pause. Left and right move a mark
along it and <strong>the presses stack</strong>: six presses are one jump of six, made half a second
after you stop, instead of six separate jumps and six re-buffers. Hold a direction and it speeds up,
so crossing a two-hour film takes a few seconds — while the first few presses are still worth
exactly the skip interval you chose in Settings, because that is what a small correction is for.
Live channels have no timeline, since there is nothing to move through.</p>

<h3>The television can tell you when there is a newer Quiblo</h3>
<p>A television has no store to update this app from. Settings → About now has a <strong>Check
now</strong> button: it looks at the releases page, tells you if a newer version is there, downloads
it, and <strong>checks it against the published checksum before offering to install it</strong> — a
download that does not match is deleted rather than handed to the installer. Your television still
asks its own permission before anything is installed, and if it refuses outright the file is
downloaded and named so you can install it from a file manager.</p>
<p><strong>Nothing is checked unless you press the button.</strong> Quiblo does not look at anything
on its own, and that has not changed.</p>

<h3>You may like actually looks at what you watched</h3>
<p>It scored on genre and nothing else, which is why watching One Piece produced The Boys, The
Umbrella Academy and a dubbed Arabic family drama: at the level of "series, Action &amp; Adventure"
those are the same thing. It now weighs thirteen things — including whether something is
<strong>anime</strong> rather than merely animated, what language it was made in, the words in its
description, how many times you watched it, at what hour, whether you searched for it or took it off
a shelf, whether it is a favourite, and what you said about it. Each of your strongest few titles
proposes its own four, so somebody who watches anime and one cookery programme gets suggestions from
both rather than from the average of them.</p>
<p><strong>And it waits until it has something to say.</strong> Below five titles watched, three of
them most of the way through, the row is not drawn at all.</p>

<h3>You can say what you thought</h3>
<p>A thumbs up and a thumbs down on every film and series, on both apps. Pressing the lit one again
takes it back. A thumbs down stops that title suggesting anything and stops it being suggested; a
thumbs up makes it count for more. Nothing leaves the device — there is nowhere for it to go.</p>

<h3>Quiblo keeps your catalogue up to date on its own</h3>
<p>Until now the only way a new film reached the app was somebody opening Settings and pressing
Refresh, so "Recently added" was really answering "what has your provider added since you last
thought to check". It syncs every four days in the background, and it <em>merges</em> rather than
rebuilding: a title still there keeps its place and the date it first appeared, a new one is dated
now, and one your provider has dropped goes. That last part is what gives an M3U playlist a
recently-added row at all. Popularity is re-checked every forty hours, still at no more than two
requests in that window and still nothing at all without your own Movie Database key.</p>

<h3>Your categories, in your own order</h3>
<p>Settings has had "hide" and "rename" since it had a category list; it now has move up and move
down as well, on both apps. The order you set is the order Live, Movies, Series and Favourites draw
their rows in. Categories you have not moved stay in your provider's own order, behind the ones you
have — so ordering three shelves out of ninety moves three and leaves the rest alone. It survives a
refresh, because it is stored against your provider's own name for the category.</p>

<h3>Now popular is two rows of ten</h3>
<p>Films and series came from two different lists and were drawn as one row of five and five,
numbered 1 to 5 twice. They are now <strong>Popular films</strong> and <strong>Popular
series</strong>, ten each, numbered once, with the number beside the poster where it can be read
from the sofa. A popular title your provider does not carry keeps its place and says
<strong>Unavailable</strong> instead of quietly disappearing — a top ten with four films in it gave
you no way to tell unpopular from absent.</p>

<h3>Smaller things</h3>
<ul>
  <li>The playlist screen sits in the middle of the television, on a column of its own width rather
      than a fraction of whatever panel it finds itself on. Save carries the same travelling light
      Search and Play have, dimmer, because Search is the only thing on its screen and Save sits
      beside a form you are still filling in.</li>
  <li>Search's light fills the screen like every other tab's.</li>
  <li>For You draws last night's rows the moment it opens instead of rebuilding them.</li>
  <li>Recently Added holds fifteen rather than forty.</li>
  <li>"Resume from" is there when you come back — the resume point survives the back press that
      earned it.</li>
  <li>A film's details sit in the middle of the television screen.</li>
  <li>Hiding a writing system now applies to the For You rows as well.</li>
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
