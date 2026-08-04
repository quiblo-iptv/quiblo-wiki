import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { WIKI } from './content';
import { SearchService } from './core/search.service';
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

  /** The sidebar is a drawer on narrow screens and always present on wide ones. */
  protected readonly navOpen = signal(false);

  protected onQuery(value: string): void {
    this.search.query.set(value);
  }

  protected async goToHit(slug: string, sectionId: string): Promise<void> {
    await this.router.navigate(['/wiki', slug]);

    // After navigation, not during: the section does not exist in the DOM until the new
    // page has rendered, and scrolling to it before then silently does nothing.
    requestAnimationFrame(() => {
      document.getElementById(sectionId)?.scrollIntoView({ block: 'start' });
    });

    this.search.query.set('');
    this.navOpen.set(false);
  }

  protected closeNav(): void {
    this.navOpen.set(false);
  }
}
