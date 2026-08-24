import { DOCUMENT, Injectable, PLATFORM_ID, effect, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type ThemeChoice = 'system' | 'light' | 'dark';

const STORAGE_KEY = 'quiblo-wiki-theme';

/**
 * Light and dark, following the system until the reader says otherwise.
 *
 * Three states rather than two. "System" is not the same as whichever of light or dark the
 * system currently is: a reader who has never expressed a preference should follow their
 * machine when it changes at dusk, and one who has chosen dark should stay dark through the
 * morning. Storing only the resolved colour loses that distinction permanently.
 *
 * The site is prerendered, so this class is also constructed in Node, where `window` and
 * `localStorage` do not exist. There it does the one thing it can honestly do: resolve to the
 * default and touch nothing. The reader's real preference is applied by the inline script in
 * `index.html` before the first paint, so a prerendered file that says `dark` is corrected
 * ahead of anything being drawn rather than flashing the wrong theme.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  private readonly media = this.isBrowser
    ? window.matchMedia('(prefers-color-scheme: dark)')
    : undefined;

  /** What the reader asked for. */
  readonly choice = signal<ThemeChoice>(this.isBrowser ? readStoredChoice() : 'system');

  /** What the system is currently saying, tracked so "system" stays live. */
  private readonly systemPrefersDark = signal(this.media?.matches ?? true);

  /** What is actually on screen. */
  readonly resolved = signal<'light' | 'dark'>('dark');

  constructor() {
    this.media?.addEventListener('change', (event) =>
      this.systemPrefersDark.set(event.matches),
    );

    effect(() => {
      const choice = this.choice();
      const dark =
        choice === 'dark' || (choice === 'system' && this.systemPrefersDark());

      this.resolved.set(dark ? 'dark' : 'light');
      // `setAttribute` rather than `dataset`, because the DOM the prerenderer renders into
      // implements the former and not the latter. Writing it on both sides means a generated
      // file carries a theme rather than none at all.
      this.document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
      if (this.isBrowser) {
        localStorage.setItem(STORAGE_KEY, choice);
      }
    });
  }

  /** Cycles system → light → dark → system, which is the whole control. */
  cycle(): void {
    const order: readonly ThemeChoice[] = ['system', 'light', 'dark'];
    const next = (order.indexOf(this.choice()) + 1) % order.length;
    this.choice.set(order[next]);
  }
}

function readStoredChoice(): ThemeChoice {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === 'light' || stored === 'dark' || stored === 'system'
    ? stored
    : 'system';
}
