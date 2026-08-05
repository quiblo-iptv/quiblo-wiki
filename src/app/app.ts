import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { API } from './api/content';
import { WIKI } from './content';
import { SearchHit, SearchService } from './core/search.service';
import { ThemeService } from './core/theme.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly router = inject(Router);

  protected readonly theme = inject(ThemeService);
  protected readonly search = inject(SearchService);
  protected readonly parts = WIKI;
  protected readonly packages = API;

  /** The sidebar is a drawer on narrow screens and always present on wide ones. */
  protected readonly navOpen = signal(false);

  protected onQuery(value: string): void {
    this.search.query.set(value);
  }

  protected async goToHit(hit: SearchHit): Promise<void> {
    await this.router.navigate(hit.path as string[]);

    // After navigation, not during: the target does not exist in the DOM until the new page
    // has rendered, and scrolling to it before then silently does nothing.
    requestAnimationFrame(() => {
      document.getElementById(hit.anchor)?.scrollIntoView({ block: 'start' });
    });

    this.search.query.set('');
    this.navOpen.set(false);
  }

  protected closeNav(): void {
    this.navOpen.set(false);
  }
}
