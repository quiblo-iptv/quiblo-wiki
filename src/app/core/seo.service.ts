import { DOCUMENT, Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { findPackage } from '../api/content';
import { findPage } from '../content';
import {
  faqGraph,
  SITE_DESCRIPTION,
  SITE_ORIGIN,
  siteGraph,
  SOCIAL_IMAGE,
} from './structured-data';

/**
 * Per-page titles, descriptions and canonical URLs.
 *
 * This runs twice over: once in the browser on every navigation, and once per route while the
 * build prerenders the site. The second is the one that matters for search — it is what bakes
 * each page's own title, description and canonical link into the file that gets served,
 * instead of leaving every route sharing whatever `index.html` was written with.
 *
 * Rendering happens in Node, where there is no global `document` and no origin at all, which
 * is why the document is injected rather than reached for and why the canonical is built from
 * the declared `SITE_ORIGIN` rather than from `baseURI`.
 *
 * The canonical is worth the care: the 404 page is the router shell, so a mistyped URL still
 * renders the site, and without a canonical every typo is an indexable duplicate.
 */
@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly router = inject(Router);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);

  start(): void {
    // What this site is, in the one vocabulary a search engine does not have to infer from
    // prose. Written once, at boot, because it describes the software and the publisher —
    // neither of which changes as you navigate.
    this.addGraph('site-graph', siteGraph());
    this.addGraph('faq-graph', faqGraph());

    // Facts about the site rather than about a page, so they are set once and never updated.
    this.meta.updateTag({ property: 'og:site_name', content: SITE });
    this.meta.updateTag({ property: 'og:locale', content: 'en_GB' });
    this.meta.updateTag({ property: 'og:image', content: SOCIAL_IMAGE });
    this.meta.updateTag({ property: 'og:image:width', content: '1200' });
    this.meta.updateTag({ property: 'og:image:height', content: '630' });
    this.meta.updateTag({ property: 'og:image:alt', content: SITE_DESCRIPTION });
    this.meta.updateTag({ name: 'twitter:image', content: SOCIAL_IMAGE });

    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => this.apply(event.urlAfterRedirects));
  }

  /**
   * One `application/ld+json` block, replaced rather than appended.
   *
   * Appending would leave a second copy on every navigation, and duplicated structured data
   * that contradicts itself is treated as a reason to trust none of it.
   */
  private addGraph(id: string, graph: unknown): void {
    this.document.getElementById(id)?.remove();

    const script = this.document.createElement('script');
    script.id = id;
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(graph);
    this.document.head.appendChild(script);
  }

  private apply(url: string): void {
    const { title, description } = pageMeta(url);

    this.title.setTitle(title);
    this.meta.updateTag({ name: 'description', content: description });

    // Open Graph and Twitter, so a link pasted into a chat shows what it is rather than a
    // bare URL. Both read the same two facts; there is no reason to write them differently.
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: description });
    // The front page is the site; everything else is a page of it. Getting this wrong is how
    // a home page ends up presented as one article among many.
    this.meta.updateTag({
      property: 'og:type',
      content: isHome(url) ? 'website' : 'article',
    });
    this.meta.updateTag({ property: 'og:url', content: publicUrl(url) });
    // Large, because there is an image now. `summary` renders a thumbnail and wastes it.
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: title });
    this.meta.updateTag({ name: 'twitter:description', content: description });

    this.setCanonical(publicUrl(url));
  }

  private setCanonical(href: string): void {
    let link = this.document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = this.document.createElement('link');
      link.rel = 'canonical';
      this.document.head.appendChild(link);
    }
    link.href = href;
  }
}

/**
 * The absolute URL a route is published at.
 *
 * Prerendering writes every route as `<path>/index.html`, and a static host answers the
 * slashless form with a redirect to the slashed one. The canonical, the Open Graph URL and the
 * sitemap all have to name the file that exists rather than the redirect that reaches it,
 * otherwise every page in the site is submitted as a URL that 301s.
 */
export function publicUrl(url: string): string {
  const path = url.split('#')[0].split('?')[0];
  const trimmed = path.replace(/\/+$/, '');
  return trimmed === '' ? `${SITE_ORIGIN}/` : `${SITE_ORIGIN}${trimmed}/`;
}

const SITE = 'Quiblo';
const FALLBACK = SITE_DESCRIPTION;

function isHome(url: string): boolean {
  return url.split('#')[0].split('?')[0].replace(/\/$/, '') === '';
}

/** The title and description a route publishes under. One owner, browser and build alike. */
export function pageMeta(url: string): { title: string; description: string } {
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

  /*
   * The front page's title is the one that has to earn a click from a list of ten.
   *
   * It said "Quiblo wiki", which tells somebody who already knows what Quiblo is that they
   * have found the documentation, and tells everybody else nothing. The brand goes first
   * because a search for the name has to resolve to it, and what the thing *is* follows,
   * because almost nobody is searching for the name yet.
   */
  return {
    title: 'Quiblo — free, open source IPTV player for Android and Android TV',
    description: FALLBACK,
  };
}
