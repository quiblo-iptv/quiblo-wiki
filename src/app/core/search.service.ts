import { Injectable, computed, signal } from '@angular/core';
import { WIKI } from '../content';
import type { WikiPage, WikiPart } from './wiki.model';

export interface SearchHit {
  readonly page: WikiPage;
  readonly part: WikiPart;
  readonly sectionId: string;
  readonly sectionTitle: string;
  /** A window of the matching text, with the term marked. */
  readonly excerpt: string;
  readonly score: number;
}

interface IndexEntry {
  readonly page: WikiPage;
  readonly part: WikiPart;
  readonly sectionId: string;
  readonly sectionTitle: string;
  /** Tags stripped and whitespace collapsed. What is actually searched. */
  readonly text: string;
  readonly haystack: string;
}

const EXCERPT_RADIUS = 90;
const MAX_HITS = 30;

/**
 * Search, entirely in the browser.
 *
 * The corpus is a few hundred sections of authored prose — small enough that scanning it on
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
      const inTitle = entry.sectionTitle.toLowerCase().includes(needle);
      const at = entry.haystack.indexOf(needle);
      if (!inTitle && at < 0) continue;

      // A heading match beats a body match, and an earlier body match beats a later one.
      // Crude, and right for a corpus this size: the reader is almost always looking for
      // the section *about* the thing they typed.
      const score = (inTitle ? 1000 : 0) + (at < 0 ? 0 : Math.max(0, 200 - at / 10));

      hits.push({
        page: entry.page,
        part: entry.part,
        sectionId: entry.sectionId,
        sectionTitle: entry.sectionTitle,
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
          const text = plainText(section.html);
          entries.push({
            page,
            part,
            sectionId: section.id,
            sectionTitle: section.title,
            text,
            haystack: text.toLowerCase(),
          });
        }
      }
    }

    this.index = entries;
    return entries;
  }
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
