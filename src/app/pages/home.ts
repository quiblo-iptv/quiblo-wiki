import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { API, typeCount } from '../api/content';
import { WIKI } from '../content';
import { FAQ } from '../core/structured-data';

/** The contents page: every part, every page, with its one-line summary. */
@Component({
  selector: 'wiki-home',
  imports: [RouterLink],
  template: `
    <article class="page">
      <header class="page__head">
        <p class="page__part">Quiblo</p>
        <!--
          The one heading on the site that has to say what the software is rather than what
          this page is. Somebody arriving from a search has not heard the name before, and
          "The Quiblo wiki" answered a question only a returning reader was asking.
        -->
        <h1>Quiblo — a free, open source IPTV player for Android and Android TV</h1>
        <p class="page__summary">
          Plays Live TV, films and series from playlists <strong>you</strong> supply — an M3U
          or M3U8 URL or file, or an Xtream Codes account. No ads, no accounts, no tracking,
          no backend, and no server of ours anywhere in the path.
        </p>

        <!--
          Three links, and only the first is an ask of the reader's time. Download leads
          because somebody who has just read one sentence about a player wants the player;
          the two funding links follow because a page that asks for money before it has given
          anything is a page people close.
        -->
        <div class="actions">
          <a
            class="actions__button actions__button--primary"
            href="https://github.com/quiblo-iptv/quiblo-app/releases/latest"
            rel="noopener"
          >
            Download from GitHub
          </a>
          <a class="actions__button" href="https://github.com/sponsors/quiblo-iptv" rel="noopener">
            Sponsor on GitHub
          </a>
          <a class="actions__button" href="https://www.patreon.com/c/Quiblo" rel="noopener">
            Support on Patreon
          </a>
        </div>
      </header>

      <p class="prose">
        Written for two readers: someone who has just been handed the APK and wants to know
        what it does, and someone about to change the code and needs to know why it is shaped
        the way it is. The first two parts are for the first reader, the last two for the
        second, and the history in between is for both.
      </p>

      @for (part of parts; track part.id) {
        <section class="section">
          <h2>{{ part.title }}</h2>
          <p class="prose">{{ part.blurb }}</p>
          <ul class="index">
            @for (page of part.pages; track page.slug) {
              <li>
                <a [routerLink]="['/wiki', page.slug]">{{ page.title }}</a>
                <span class="index__summary">{{ page.summary }}</span>
              </li>
            }
          </ul>
        </section>
      }

      <section class="section">
        <h2>Code reference</h2>
        <p class="prose">
          A package-by-package reference: {{ packageCount }} packages and {{ types }}
          documented types, each with what it is for and what it must not be used for. Written
          by hand rather than generated, because the useful half of a reference is the half a
          generator cannot reach.
        </p>
        <ul class="index">
          <li>
            <a routerLink="/api">Packages and classes</a>
            <span class="index__summary">
              Start here to find a class, or read it straight through in dependency order.
            </span>
          </li>
        </ul>
      </section>

      <!--
        On the page, not only in the structured data.
        Search engines treat an answer given to them and withheld from the reader as a reason
        to distrust the whole document, and they are right to — so these are one list, read
        from one constant, and the two cannot drift apart.
      -->
      <section class="section" id="faq">
        <h2>Common questions</h2>
        @for (entry of faq; track entry.question) {
          <h3>{{ entry.question }}</h3>
          <p class="prose">{{ entry.answer }}</p>
        }
      </section>
    </article>
  `,
  styleUrl: './wiki-page.scss',
})
export class HomeComponent {
  protected readonly parts = WIKI;
  protected readonly faq = FAQ;
  protected readonly packageCount = API.length;
  protected readonly types = typeCount();
}
