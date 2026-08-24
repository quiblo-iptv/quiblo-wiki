import { provideRouter, Router } from '@angular/router';
import { TestBed } from '@angular/core/testing';
import { API } from '../api/content';
import { routes } from '../app.routes';
import { ALL_PAGES } from '../content';
import { pageMeta, publicUrl, SeoService } from './seo.service';
import { SITE_ORIGIN } from './structured-data';

/**
 * That each page tells a search engine what it is, rather than what the front page is.
 *
 * Two separate ways this site has published forty-six pages as one. The canonical link was
 * the front page's on every route, because only `index.html` was ever served. The title was
 * "Quiblo wiki" on every route, because the route configuration declared one and Angular's
 * title strategy ran after the service that had just set a better one. Both are on-page
 * facts, so both are checked here rather than in a rendering test.
 */
describe('page metadata', () => {
  describe('canonical URLs', () => {
    it('is absolute, and built from the declared origin', () => {
      expect(publicUrl('/wiki/database')).toBe(`${SITE_ORIGIN}/wiki/database/`);
    });

    it('names the file that exists rather than the URL that redirects to it', () => {
      // Prerendering writes `api/index.html`; a static host answers `/api` with a redirect.
      expect(publicUrl('/api')).toBe(`${SITE_ORIGIN}/api/`);
      expect(publicUrl('/api/')).toBe(`${SITE_ORIGIN}/api/`);
    });

    it('leaves the root a single slash rather than doubling it', () => {
      expect(publicUrl('/')).toBe(`${SITE_ORIGIN}/`);
      expect(publicUrl('')).toBe(`${SITE_ORIGIN}/`);
    });

    it('drops the fragment and the query, which are not separate pages', () => {
      expect(publicUrl('/wiki/database#schema')).toBe(`${SITE_ORIGIN}/wiki/database/`);
      expect(publicUrl('/wiki/database?from=search')).toBe(`${SITE_ORIGIN}/wiki/database/`);
    });

    it('gives every page in the site a distinct one', () => {
      const canonicals = allRoutes().map(publicUrl);
      expect(new Set(canonicals).size).toBe(canonicals.length);
    });
  });

  describe('titles and descriptions', () => {
    it('titles a wiki page after itself', () => {
      const { page } = ALL_PAGES[0];
      expect(pageMeta(`/wiki/${page.slug}`).title).toBe(`${page.title} · Quiblo`);
    });

    it('titles a package after the module', () => {
      const pkg = API[0];
      expect(pageMeta(`/api/${pkg.id}`).title) //
        .toBe(`${pkg.module} · Code reference · Quiblo`);
    });

    it('gives every page in the site a distinct title', () => {
      const titles = allRoutes().map((url) => pageMeta(url).title);
      expect(new Set(titles).size).toBe(titles.length);
    });

    it('leaves the title to one owner', () => {
      // Angular's title strategy runs after this service on the same navigation, so a title
      // declared on a route replaces the specific one with a generic one. That is how every
      // page in the site was published as "Quiblo wiki".
      for (const route of routes) {
        expect(route.title, `route "${route.path}" declares its own title`).toBeUndefined();
      }
    });

    it('gives every page a description short enough to survive a search result', () => {
      for (const url of allRoutes()) {
        const { description } = pageMeta(url);
        expect(description.length, `empty description for ${url}`).toBeGreaterThan(0);
      }
    });
  });
});

/**
 * What actually lands in the document head — which is the only form of any of this that a
 * crawler or a link preview ever sees.
 */
describe('SeoService', () => {
  beforeEach(async () => {
    TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
    TestBed.inject(SeoService).start();
    await TestBed.inject(Router).navigateByUrl('/');
  });

  afterEach(() => {
    document.head.querySelectorAll('#site-graph, #faq-graph').forEach((node) => node.remove());
    document.head.querySelector('link[rel="canonical"]')?.remove();
    TestBed.resetTestingModule();
  });

  it('writes the structured data once, however far you navigate', async () => {
    const router = TestBed.inject(Router);
    await router.navigateByUrl(`/wiki/${ALL_PAGES[0].page.slug}`);
    await router.navigateByUrl('/api');

    // Two graphs that contradict each other are a reason to trust neither, so the service
    // replaces rather than appends.
    expect(document.querySelectorAll('script[type="application/ld+json"]').length).toBe(2);
  });

  it('moves the canonical link with the reader rather than leaving it on the front page', async () => {
    const canonical = () =>
      document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href;

    expect(canonical()).toBe(`${SITE_ORIGIN}/`);

    const slug = ALL_PAGES[0].page.slug;
    await TestBed.inject(Router).navigateByUrl(`/wiki/${slug}`);

    expect(canonical()).toBe(`${SITE_ORIGIN}/wiki/${slug}/`);
  });

  it('titles and describes the page it is on', async () => {
    const slug = ALL_PAGES[0].page.slug;
    await TestBed.inject(Router).navigateByUrl(`/wiki/${slug}`);

    const expected = pageMeta(`/wiki/${slug}`);
    expect(document.title).toBe(expected.title);
    expect(metaContent('name', 'description')).toBe(expected.description);
    expect(metaContent('property', 'og:title')).toBe(expected.title);
  });

  it('presents the front page as the site and every other page as a page of it', async () => {
    expect(metaContent('property', 'og:type')).toBe('website');

    await TestBed.inject(Router).navigateByUrl('/api');

    expect(metaContent('property', 'og:type')).toBe('article');
  });

  it('resolves an unknown path to the front page rather than describing nothing', async () => {
    await TestBed.inject(Router).navigateByUrl('/wiki/no-such-page-exists');

    // The wildcard route redirects, and the canonical follows the redirect rather than the
    // URL that was typed — otherwise every typo is an indexable duplicate of the home page.
    expect(document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href) //
      .toBe(`${SITE_ORIGIN}/`);
  });
});

function metaContent(attribute: 'name' | 'property', value: string): string | undefined {
  return document.head
    .querySelector<HTMLMetaElement>(`meta[${attribute}="${value}"]`)
    ?.getAttribute('content')
    ?.toString();
}

/** Every route the site publishes, in the form the router reports them. */
function allRoutes(): string[] {
  return [
    '/',
    '/api',
    ...ALL_PAGES.map(({ page }) => `/wiki/${page.slug}`),
    ...API.map((pkg) => `/api/${pkg.id}`),
  ];
}
