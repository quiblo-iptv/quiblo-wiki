import { Injectable, computed, signal } from '@angular/core';
import { API } from '../api/content';
import { WIKI } from '../content';
import type { WikiPage, WikiPart } from './wiki.model';

export interface SearchHit {
  /** Which half of the documentation this came from. */
  readonly kind: 'wiki' | 'api';
  /** Where to go. A full router path, because the two halves live at different roots. */
  readonly path: readonly string[];
  /** Breadcrumb — the page or package this sits in. */
  readonly where: string;
  readonly title: string;
  readonly anchor: string;
  /** A window of the matching text, with the term marked. */
  readonly excerpt: string;
  readonly score: number;
}

interface IndexEntry {
  readonly kind: 'wiki' | 'api';
  readonly path: readonly string[];
  readonly where: string;
  readonly title: string;
  readonly anchor: string;
  /** Tags stripped and whitespace collapsed. What is actually searched. */
  readonly text: string;
  readonly haystack: string;
  readonly titleHaystack: string;
}

const EXCERPT_RADIUS = 90;
const MAX_HITS = 30;

/**
 * Search, entirely in the browser, across both the wiki and the code reference.
 *
 * Both halves matter: a reader looking for "rate limit" wants the prose about provider
 * blocks, and a reader typing "ChannelRepository" wants the class. Indexing only one would
 * make the box unreliable in a way that is hard to notice and annoying to live with.
 *
 * The corpus is a few hundred sections and type entries — small enough that scanning it on
 * every keystroke is imperceptible, and small enough that a real inverted index would be
 * more machinery than the problem deserves. There is no server to ask, by design: this site
 * is static, and a search box that needed a backend would make it not static.
 *
 * Built once, lazily, on the first query rather than at startup, so opening a page never
 * pays for a feature the reader has not used.
 */
@Injectable({ providedIn: 'root' })
export class SearchService {
  private index: readonly IndexEntry[] | null = null;

  readonly query = signal('');

  readonly results = computed<readonly SearchHit[]>(() => {
    const raw = this.query().trim();
    if (raw.length < 2) return [];
    return this.search(raw);
  });

  private search(raw: string): readonly SearchHit[] {
    const needle = raw.toLowerCase();
    const hits: SearchHit[] = [];

    for (const entry of this.ensureIndex()) {
      const inTitle = entry.titleHaystack.includes(needle);
      const at = entry.haystack.indexOf(needle);
      if (!inTitle && at < 0) continue;

      // A heading or type name beats a body match, and an earlier body match beats a later
      // one. Crude, and right for a corpus this size: the reader is almost always looking
      // for the thing *named* by what they typed.
      let score = (inTitle ? 1000 : 0) + (at < 0 ? 0 : Math.max(0, 200 - at / 10));

      // An exact type name outranks a section that merely mentions it — typing a class name
      // should put the class first, not a paragraph about it.
      if (entry.kind === 'api' && entry.titleHaystack === needle) score += 500;

      hits.push({
        kind: entry.kind,
        path: entry.path,
        where: entry.where,
        title: entry.title,
        anchor: entry.anchor,
        excerpt: excerpt(entry.text, at, raw.length),
        score,
      });
    }

    return hits.sort((a, b) => b.score - a.score).slice(0, MAX_HITS);
  }

  private ensureIndex(): readonly IndexEntry[] {
    if (this.index) return this.index;

    const entries: IndexEntry[] = [];

    for (const part of WIKI) {
      for (const page of part.pages) {
        for (const section of page.sections) {
          entries.push(
            entry({
              kind: 'wiki',
              path: ['/wiki', page.slug],
              where: pageLabel(page, part),
              title: section.title,
              anchor: section.id,
              html: section.html,
            }),
          );
        }
      }
    }

    for (const pkg of API) {
      for (const type of pkg.types) {
        entries.push(
          entry({
            kind: 'api',
            path: ['/api', pkg.id],
            where: pkg.module,
            title: type.name,
            anchor: anchorFor(type.name),
            // Summary, detail and member names are all searchable — a member name is often
            // exactly what someone is looking for.
            html: [
              type.summary,
              type.detail ?? '',
              ...(type.members ?? []).map((m) => `${m.name} ${m.summary}`),
            ].join(' '),
          }),
        );
      }
    }

    this.index = entries;
    return entries;
  }
}

function entry(input: {
  kind: 'wiki' | 'api';
  path: readonly string[];
  where: string;
  title: string;
  anchor: string;
  html: string;
}): IndexEntry {
  const text = plainText(input.html);
  return {
    kind: input.kind,
    path: input.path,
    where: input.where,
    title: input.title,
    anchor: input.anchor,
    text,
    haystack: text.toLowerCase(),
    titleHaystack: input.title.toLowerCase(),
  };
}

function pageLabel(page: WikiPage, part: WikiPart): string {
  return `${part.title} · ${page.title}`;
}

/** Must match the anchor the package page generates, or a hit scrolls nowhere. */
function anchorFor(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/** Strips tags and collapses whitespace, so a match cannot land inside markup. */
function plainText(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

function excerpt(text: string, at: number, length: number): string {
  if (at < 0) return escapeHtml(text.slice(0, EXCERPT_RADIUS * 2)) + '…';

  const from = Math.max(0, at - EXCERPT_RADIUS);
  const to = Math.min(text.length, at + length + EXCERPT_RADIUS);

  const before = escapeHtml(text.slice(from, at));
  const hit = escapeHtml(text.slice(at, at + length));
  const after = escapeHtml(text.slice(at + length, to));

  return `${from > 0 ? '…' : ''}${before}<mark>${hit}</mark>${after}${to < text.length ? '…' : ''}`;
}

/** The excerpt is re-inserted as HTML, so anything taken from the text is escaped first. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
