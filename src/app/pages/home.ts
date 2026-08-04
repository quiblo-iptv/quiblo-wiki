import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { WIKI } from '../content';

/** The contents page: every part, every page, with its one-line summary. */
@Component({
  selector: 'wiki-home',
  imports: [RouterLink],
  template: `
    <article class="page">
      <header class="page__head">
        <p class="page__part">Quiblo</p>
        <h1>The Quiblo wiki</h1>
        <p class="page__summary">
          Everything about a free, open-source Android IPTV client — what it is, what it
          deliberately is not, how it is built, and what has been learned building it.
        </p>
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
    </article>
  `,
  styleUrl: './wiki-page.scss',
})
export class HomeComponent {
  protected readonly parts = WIKI;
}
