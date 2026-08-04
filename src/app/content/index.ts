import type { LocatedPage, WikiPart } from '../core/wiki.model';
import { ARCHITECTURE } from './architecture';
import { ENGINEERING } from './engineering';
import { ORIENTATION } from './orientation';
import { USING } from './using';

/**
 * The whole wiki, in reading order.
 *
 * Navigation, the search index, the part indexes and previous/next are all derived from this
 * one array, so a page cannot appear in one and be missing from another.
 */
export const WIKI: readonly WikiPart[] = [
  ORIENTATION,
  USING,
  ARCHITECTURE,
  ENGINEERING,
];

/** Every page, flattened, in the order a reader would meet them. */
export const ALL_PAGES: readonly LocatedPage[] = WIKI.flatMap((part) =>
  part.pages.map((page) => ({ page, part })),
);

export function findPage(slug: string): LocatedPage | undefined {
  return ALL_PAGES.find((entry) => entry.page.slug === slug);
}

/** What comes before and after, for the footer links. */
export function neighbours(slug: string): {
  previous?: LocatedPage;
  next?: LocatedPage;
} {
  const at = ALL_PAGES.findIndex((entry) => entry.page.slug === slug);
  if (at < 0) return {};
  return {
    previous: at > 0 ? ALL_PAGES[at - 1] : undefined,
    next: at < ALL_PAGES.length - 1 ? ALL_PAGES[at + 1] : undefined,
  };
}
