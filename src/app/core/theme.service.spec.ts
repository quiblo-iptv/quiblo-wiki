import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';

/**
 * That the theme survives being constructed where there is no browser.
 *
 * The site is prerendered, so this class is instantiated in Node once per page. `window`,
 * `matchMedia` and `localStorage` do not exist there, and a throw during rendering does not
 * produce a broken page — it produces no page, which is the failure that takes a route out of
 * the sitemap and out of search.
 */
describe('ThemeService', () => {
  beforeEach(() => {
    // The test environment has no `matchMedia`, so there is nothing to spy on and nothing to
    // answer with. A stub gives both, and pins the system to dark so the assertions below are
    // about what the class decided rather than about what the machine running them prefers.
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      writable: true,
      value: (query: string) => ({
        matches: true,
        media: query,
        addEventListener: () => {},
        removeEventListener: () => {},
      }),
    });
  });

  afterEach(() => {
    TestBed.resetTestingModule();
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe('while rendering, off the browser', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [{ provide: PLATFORM_ID, useValue: 'server' }],
      });
    });

    it('constructs without reaching for a browser API', () => {
      const reachedForStorage = vi.spyOn(Storage.prototype, 'setItem');
      const reachedForMedia = vi.spyOn(window, 'matchMedia');

      const theme = TestBed.inject(ThemeService);
      TestBed.tick();

      expect(theme.resolved()).toBe('dark');
      expect(reachedForStorage).not.toHaveBeenCalled();
      expect(reachedForMedia).not.toHaveBeenCalled();
    });

    it('writes a theme onto the document, so a rendered file carries one', () => {
      TestBed.inject(ThemeService);
      TestBed.tick();

      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });
  });

  describe('in the browser', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [{ provide: PLATFORM_ID, useValue: 'browser' }],
      });
    });

    it('remembers what the reader chose rather than what it resolved to', () => {
      const theme = TestBed.inject(ThemeService);

      theme.cycle();
      TestBed.tick();

      expect(theme.choice()).toBe('light');
      expect(localStorage.getItem('quiblo-wiki-theme')).toBe('light');
    });

    it('cycles back to following the system', () => {
      const theme = TestBed.inject(ThemeService);

      theme.cycle();
      theme.cycle();
      theme.cycle();

      expect(theme.choice()).toBe('system');
    });
  });
});
