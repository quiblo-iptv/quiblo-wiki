import { ALL_PAGES, WIKI, findPage, neighbours } from './index';

/**
 * Integrity of the content itself, rather than of any component.
 *
 * The navigation, the search index and the previous/next links are all derived from one
 * array, so the failure worth guarding against is not a broken component — it is a page
 * that is unreachable, a duplicate slug that makes a route ambiguous, or an internal link
 * pointing at a page that no longer exists.
 */
describe('wiki content', () => {
  it('has unique page slugs', () => {
    const slugs = ALL_PAGES.map((entry) => entry.page.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('has unique section ids within each page', () => {
    for (const { page } of ALL_PAGES) {
      const ids = page.sections.map((section) => section.id);
      expect(new Set(ids).size, `duplicate section id in "${page.slug}"`)
        .toBe(ids.length);
    }
  });

  it('gives every page a title, a summary and at least one section', () => {
    for (const { page } of ALL_PAGES) {
      expect(page.title.length).toBeGreaterThan(0);
      expect(page.summary.length).toBeGreaterThan(0);
      expect(page.sections.length).toBeGreaterThan(0);
    }
  });

  it('can find every page by its slug', () => {
    for (const { page } of ALL_PAGES) {
      expect(findPage(page.slug)?.page.title).toBe(page.title);
    }
  });

  it('links every page to its neighbours, and only the ends to nothing', () => {
    const first = ALL_PAGES[0].page.slug;
    const last = ALL_PAGES[ALL_PAGES.length - 1].page.slug;

    expect(neighbours(first).previous).toBeUndefined();
    expect(neighbours(last).next).toBeUndefined();

    for (const { page } of ALL_PAGES.slice(1, -1)) {
      const { previous, next } = neighbours(page.slug);
      expect(previous, `no previous for "${page.slug}"`).toBeDefined();
      expect(next, `no next for "${page.slug}"`).toBeDefined();
    }
  });

  it('points every internal link at a page that exists', () => {
    // The most likely rot in a hand-authored wiki: a cross-reference outliving its target.
    const slugs = new Set(ALL_PAGES.map((entry) => entry.page.slug));

    for (const { page } of ALL_PAGES) {
      for (const section of page.sections) {
        const links = section.html.matchAll(/href="\/wiki\/([a-z0-9-]+)(#[a-z0-9-]+)?"/g);
        for (const [, target] of links) {
          expect(slugs.has(target), `"${page.slug}" links to missing page "${target}"`)
            .toBe(true);
        }
      }
    }
  });

  it('points every internal anchor at a section that exists', () => {
    const sectionsBySlug = new Map(
      ALL_PAGES.map((entry) => [
        entry.page.slug,
        new Set(entry.page.sections.map((section) => section.id)),
      ]),
    );

    for (const { page } of ALL_PAGES) {
      for (const section of page.sections) {
        const links = section.html.matchAll(/href="\/wiki\/([a-z0-9-]+)#([a-z0-9-]+)"/g);
        for (const [, target, anchor] of links) {
          expect(sectionsBySlug.get(target)?.has(anchor), `"${page.slug}" links to missing section "${target}#${anchor}"`)
            .toBe(true);
        }
      }
    }
  });

  it('groups pages into parts that all carry a blurb', () => {
    expect(WIKI.length).toBeGreaterThan(0);
    for (const part of WIKI) {
      expect(part.blurb.length).toBeGreaterThan(0);
      expect(part.pages.length).toBeGreaterThan(0);
    }
  });
});
