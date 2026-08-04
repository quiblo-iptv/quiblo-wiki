/**
 * The shape of the wiki.
 *
 * Content is data rather than markup in components, for two reasons. The search index is
 * built by walking this structure at runtime, which is only possible if the text is
 * reachable without rendering anything; and the navigation, the table of contents and the
 * previous/next links are all derived from the same objects, so a page cannot exist in one
 * and be missing from another.
 */

/** One addressable heading within a page. Also the unit the search index works in. */
export interface WikiSection {
  /** Anchor id. Stable — it is what deep links and the contents rail point at. */
  readonly id: string;
  readonly title: string;
  /** Trusted HTML. Authored in this repository, never user input. */
  readonly html: string;
}

export interface WikiPage {
  /** URL segment. */
  readonly slug: string;
  readonly title: string;
  /** One sentence, shown in navigation, search results and the part index. */
  readonly summary: string;
  readonly sections: readonly WikiSection[];
}

/** A group of pages, shown as a heading in the sidebar. */
export interface WikiPart {
  readonly id: string;
  readonly title: string;
  /** Why this part exists, shown on its index. */
  readonly blurb: string;
  readonly pages: readonly WikiPage[];
}

/** A page plus where it sits, which is what most lookups actually want. */
export interface LocatedPage {
  readonly page: WikiPage;
  readonly part: WikiPart;
}
