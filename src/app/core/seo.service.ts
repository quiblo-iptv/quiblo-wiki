import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { findPackage } from '../api/content';
import { findPage } from '../content';

/**
 * Per-page titles, descriptions and canonical URLs.
 *
 * A single-page app serves one HTML file for every route, so without this every page shares
 * one title and one description — which is what a search engine and a link preview both read
 * first. Crawlers execute JavaScript now, so updating the tags after navigation does work;
 * what does not work is leaving them alone.
 *
 * The canonical link matters more here than usual: the deployment serves index.html for
 * unknown paths, so a typo'd URL renders the site rather than 404ing, and without a canonical
 * every typo is an indexable duplicate.
 */
@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly router = inject(Router);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  private origin = '';

  start(): void {
    this.origin = document.baseURI.replace(/\/$/, '');

    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => this.apply(event.urlAfterRedirects));
  }

  private apply(url: string): void {
    const { title, description } = describe(url);

    this.title.setTitle(title);
    this.meta.updateTag({ name: 'description', content: description });

    // Open Graph and Twitter, so a link pasted into a chat shows what it is rather than a
    // bare URL. Both read the same two facts; there is no reason to write them differently.
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:type', content: 'article' });
    this.meta.updateTag({ property: 'og:url', content: this.origin + url });
    this.meta.updateTag({ name: 'twitter:card', content: 'summary' });
    this.meta.updateTag({ name: 'twitter:title', content: title });
    this.meta.updateTag({ name: 'twitter:description', content: description });

    this.setCanonical(this.origin + url);
  }

  private setCanonical(href: string): void {
    let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'canonical';
      document.head.appendChild(link);
    }
    link.href = href;
  }
}

const SITE = 'Quiblo';
const FALLBACK =
  'Documentation for Quiblo, a free and open-source Android IPTV client that plays playlists you supply yourself.';

function describe(url: string): { title: string; description: string } {
  const path = url.split('#')[0].split('?')[0];

  const wiki = path.match(/^\/wiki\/([a-z0-9-]+)/);
  if (wiki) {
    const found = findPage(wiki[1]);
    if (found) {
      return {
        title: `${found.page.title} · ${SITE}`,
        description: found.page.summary,
      };
    }
  }

  const pkg = path.match(/^\/api\/([a-z0-9-]+)/);
  if (pkg) {
    const found = findPackage(pkg[1]);
    if (found) {
      return {
        title: `${found.module} · Code reference · ${SITE}`,
        description: `${found.summary} ${found.types.length} documented types.`,
      };
    }
  }

  if (path.startsWith('/api')) {
    return {
      title: `Code reference · ${SITE}`,
      description:
        'Package-by-package reference for the Quiblo codebase: what each package is for, and what each type in it must not be used for.',
    };
  }

  return { title: `${SITE} wiki`, description: FALLBACK };
}
