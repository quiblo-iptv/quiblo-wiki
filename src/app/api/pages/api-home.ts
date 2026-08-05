import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LAYER_BLURBS, LAYER_LABELS } from '../api.model';
import { API, packagesByLayer, typeCount } from '../content';

/**
 * The code reference's own landing page.
 *
 * Reachable at /api as a destination in its own right, and from the wiki sidebar as a part
 * of it. Both are true: it is a section of the documentation, and it is the page someone
 * looking for a class wants to open directly.
 */
@Component({
  selector: 'api-home',
  imports: [RouterLink],
  template: `
    <article class="page page--wide">
      <header class="page__head">
        <p class="page__part">Code reference</p>
        <h1>Packages and classes</h1>
        <p class="page__summary">
          {{ packageCount }} packages and {{ types }} documented types across the four layers —
          what each one is for, and what it must not be used for.
        </p>
      </header>

      <p class="prose">
        Hand-written rather than generated. A generator produces an entry per symbol whether
        or not there is anything to say about it, and the useful half of a reference is the
        half it cannot reach: why a class exists, and which of its neighbours it is easy to
        confuse it with. For the shape these sit in, read
        <a routerLink="/wiki/architecture-overview">the architecture overview</a> first.
      </p>

      @for (group of groups; track group.layer) {
        <section class="section">
          <h2>{{ label(group.layer) }}</h2>
          <p class="prose">{{ blurb(group.layer) }}</p>

          <ul class="pkgs">
            @for (pkg of group.packages; track pkg.id) {
              <li class="pkg">
                <a class="pkg__name" [routerLink]="['/api', pkg.id]">{{ pkg.module }}</a>
                <code class="pkg__pkg">{{ pkg.packageName }}</code>
                <span class="pkg__summary">{{ pkg.summary }}</span>
                <span class="pkg__count">{{ pkg.types.length }} types</span>
              </li>
            }
          </ul>
        </section>
      }
    </article>
  `,
  styleUrls: ['../../pages/wiki-page.scss', './api.scss'],
})
export class ApiHomeComponent {
  protected readonly groups = packagesByLayer();
  protected readonly packageCount = API.length;
  protected readonly types = typeCount();

  protected label = (layer: keyof typeof LAYER_LABELS) => LAYER_LABELS[layer];
  protected blurb = (layer: keyof typeof LAYER_BLURBS) => LAYER_BLURBS[layer];
}
