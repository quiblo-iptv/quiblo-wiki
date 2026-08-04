import { Injectable, effect, signal } from '@angular/core';

export type ThemeChoice = 'system' | 'light' | 'dark';

const STORAGE_KEY = 'quiblo-wiki-theme';

/**
 * Light and dark, following the system until the reader says otherwise.
 *
 * Three states rather than two. "System" is not the same as whichever of light or dark the
 * system currently is: a reader who has never expressed a preference should follow their
 * machine when it changes at dusk, and one who has chosen dark should stay dark through the
 * morning. Storing only the resolved colour loses that distinction permanently.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly media = window.matchMedia('(prefers-color-scheme: dark)');

  /** What the reader asked for. */
  readonly choice = signal<ThemeChoice>(readStoredChoice());

  /** What the system is currently saying, tracked so "system" stays live. */
  private readonly systemPrefersDark = signal(this.media.matches);

  /** What is actually on screen. */
  readonly resolved = signal<'light' | 'dark'>('dark');

  constructor() {
    this.media.addEventListener('change', (event) =>
      this.systemPrefersDark.set(event.matches),
    );

    effect(() => {
      const choice = this.choice();
      const dark =
        choice === 'dark' || (choice === 'system' && this.systemPrefersDark());

      this.resolved.set(dark ? 'dark' : 'light');
      document.documentElement.dataset['theme'] = dark ? 'dark' : 'light';
      localStorage.setItem(STORAGE_KEY, choice);
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
