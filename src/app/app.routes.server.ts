import { RenderMode, ServerRoute } from '@angular/ssr';
import { API } from './api/content';
import { ALL_PAGES } from './content';

/**
 * Which routes are written out as HTML files at build time.
 *
 * Every one of them, because the whole site is static content known before the build starts.
 * The deployment has no server: GitHub Pages answers a path that has no file with its 404
 * page, and it sends status 404 while doing it. Handing that page to the Angular router makes
 * the site work for a reader, but a crawler discards a 404 response without ever running the
 * JavaScript that would have rendered it — which is how every route but the front page came
 * to be invisible to search.
 *
 * The parameters come from the same two arrays the navigation and the search index are built
 * from, so a page that exists is prerendered by construction. A second hand-maintained list is
 * exactly what went wrong before: the sitemap generator kept its own, missed one content file,
 * and three pages were never submitted to anything.
 */
export const serverRoutes: ServerRoute[] = [
  { path: '', renderMode: RenderMode.Prerender },
  { path: 'api', renderMode: RenderMode.Prerender },
  {
    path: 'wiki/:slug',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () =>
      ALL_PAGES.map(({ page }) => ({ slug: page.slug })),
  },
  {
    path: 'api/:id',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () => API.map((pkg) => ({ id: pkg.id })),
  },
  // Every client route needs a server route, including the wildcard that redirects to the
  // front page. It produces no file of its own — a redirect has nothing to render — but
  // without it the build fails on an uncovered route.
  { path: '**', renderMode: RenderMode.Prerender },
];
