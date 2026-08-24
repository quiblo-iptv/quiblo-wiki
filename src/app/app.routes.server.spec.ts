import { RenderMode } from '@angular/ssr';
import { API } from './api/content';
import { routes } from './app.routes';
import { serverRoutes } from './app.routes.server';
import { ALL_PAGES } from './content';

/**
 * That every page of the site is written out as a file at build time.
 *
 * This is the bug this file exists because of. The site is served by a static host with no
 * routing: a path with a file behind it answers 200, a path without one answers 404, and a
 * crawler discards a 404 without ever running the JavaScript that would have drawn the page.
 * A route missing from here is not a broken page — it renders perfectly for a reader — it is
 * a page that silently disappears from search.
 */
describe('server routes', () => {
  it('prerenders every route the app declares', () => {
    const declared = routes.map((route) => route.path);
    const covered = serverRoutes.map((route) => route.path);

    for (const path of declared) {
      expect(covered, `no server route for "${path}"`).toContain(path);
    }
  });

  it('renders every route rather than deferring any to a server', () => {
    for (const route of serverRoutes) {
      expect(route.renderMode, `"${route.path}" is not prerendered`) //
        .toBe(RenderMode.Prerender);
    }
  });

  it('prerenders one file per wiki page, and no others', async () => {
    const route = serverRoutes.find((entry) => entry.path === 'wiki/:slug');
    const params = await paramsOf(route);

    expect(params.map((entry) => entry['slug']).sort()) //
      .toEqual(ALL_PAGES.map(({ page }) => page.slug).sort());
  });

  it('prerenders one file per documented package, and no others', async () => {
    const route = serverRoutes.find((entry) => entry.path === 'api/:id');
    const params = await paramsOf(route);

    expect(params.map((entry) => entry['id']).sort()) //
      .toEqual(API.map((pkg) => pkg.id).sort());
  });
});

async function paramsOf(route: unknown): Promise<Record<string, string>[]> {
  const withParams = route as
    | { getPrerenderParams?: () => Promise<Record<string, string>[]> }
    | undefined;

  expect(withParams?.getPrerenderParams, 'route has no prerender parameters') //
    .toBeDefined();

  return withParams!.getPrerenderParams!();
}
