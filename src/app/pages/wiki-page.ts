import { Component, computed, inject, input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { findPage, neighbours } from '../content';

/**
 * One wiki page: its sections, a contents rail, and links to its neighbours.
 *
 * Section HTML is authored in this repository and marked trusted deliberately. It is not
 * user input and never can be — there is no server and nothing to submit — so sanitising it
 * would only strip the markup the authoring relies on.
 */
@Component({
  selector: 'wiki-page',
  imports: [RouterLink],
  templateUrl: './wiki-page.html',
  styleUrl: './wiki-page.scss',
})
export class WikiPageComponent {
  private readonly sanitizer = inject(DomSanitizer);

  /** Bound from the route, so navigating between pages does not rebuild the component. */
  readonly slug = input.required<string>();

  protected readonly located = computed(() => findPage(this.slug()));
  protected readonly links = computed(() => neighbours(this.slug()));

  protected readonly sections = computed(() =>
    (this.located()?.page.sections ?? []).map((section) => ({
      id: section.id,
      title: section.title,
      html: this.sanitizer.bypassSecurityTrustHtml(section.html),
    })),
  );
}
