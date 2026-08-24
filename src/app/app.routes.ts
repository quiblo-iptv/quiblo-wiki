import { CanMatchFn, Routes, UrlSegment } from '@angular/router';
import { findPackage } from './api/content';
import { ApiHomeComponent } from './api/pages/api-home';
import { ApiPackageComponent } from './api/pages/api-package';
import { findPage } from './content';
import { HomeComponent } from './pages/home';
import { WikiPageComponent } from './pages/wiki-page';

/**
 * A parameterised route matches only when its parameter names something.
 *
 * **Without this, `wiki/:slug` matches every path under `/wiki/` there is.** A typo did not
 * reach the wildcard below — it was matched, the component looked its slug up, found nothing,
 * and rendered a page with a heading, a contents rail and no content. On a prerendered,
 * indexable site that is worse than a miss: every mistyped or stale link becomes a real URL
 * serving a near-empty duplicate of the shell, with its own canonical pointing at itself.
 *
 * Refusing the match lets the request fall through to `**`, which redirects to the front page —
 * and because the canonical follows the redirect rather than the URL that was typed, a typo
 * resolves to one page that already exists instead of adding one that should not.
 *
 * A `canMatch` rather than a `canActivate`: activation runs after the route has been chosen, so
 * the wildcard is no longer a candidate and a rejection leaves the navigation cancelled on the
 * page the reader was already on. Matching is the stage where "this is not my route" is still
 * expressible.
 */
function segmentNames(known: (value: string) => unknown): CanMatchFn {
  return (_route, segments: UrlSegment[]) => {
    const value = segments.at(-1)?.path;
    return value !== undefined && known(value) !== undefined;
  };
}

/**
 * No route carries a `title`.
 *
 * `SeoService` sets one per page — the page's own name for a wiki page, the module for a code
 * reference package — and Angular's title strategy runs after it on the same navigation, so a
 * title declared here silently replaces the specific one with a generic one. That is how every
 * page in the site came to be published as "Quiblo wiki". Leaving it undefined makes the
 * strategy write nothing, which leaves one owner of the title instead of two.
 */
export const routes: Routes = [
  { path: '', component: HomeComponent },
  {
    // The `:slug` segment binds to the component's `slug` input, so moving between pages
    // updates in place rather than tearing the component down and rebuilding it.
    path: 'wiki/:slug',
    component: WikiPageComponent,
    canMatch: [segmentNames(findPage)],
  },
  // The code reference is its own destination as well as a section of the wiki: /api is
  // the page someone looking for a class opens directly.
  { path: 'api', component: ApiHomeComponent },
  { path: 'api/:id', component: ApiPackageComponent, canMatch: [segmentNames(findPackage)] },
  { path: '**', redirectTo: '' },
];
