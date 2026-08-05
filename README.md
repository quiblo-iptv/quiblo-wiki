# Quiblo wiki

Documentation for Quiblo, a free and open-source Android IPTV client — what it is, what it
deliberately is not, how it is built, and what has been learned building it.

An Angular 22 single-page application with no backend. Everything is static: the content is
authored as typed data, the search index is built in the browser, and the whole thing
deploys to GitHub Pages as files.

## Running it

```sh
npm install
npm start          # http://localhost:4200
npm test           # content integrity checks
npm run build      # production bundle into dist/
```

## How the content works

Content is **data, not markup in components** — see `src/app/content/`. Each part exports a
`WikiPart`, each page a `WikiPage`, each section an id, a title and a block of authored
HTML.

That shape is doing real work:

- **Search** walks the same structure at runtime, so it only works because the text is
  reachable without rendering anything.
- **Navigation, the contents rail and the previous/next links** are all derived from one
  array, so a page cannot appear in one and be missing from another.
- **The tests check cross-references** — every internal link and anchor must point at a page
  and section that exist. A hand-authored wiki rots at its links first.

To add a page: add a `WikiPage` to the relevant part. Nothing else needs touching; the
sidebar, the contents, the search index and the neighbour links all follow.

## The code reference

`src/app/api/` is a second, parallel body of content: 12 packages and 92 types, each with
what it is for and what it must not be used for. It has **its own landing page at `/api`**
as well as appearing in the wiki sidebar — someone hunting for a class opens it directly,
someone reading the documentation meets it as the last section.

Hand-written rather than generated from KDoc, deliberately. A generator produces an entry
per symbol whether or not there is anything to say about it, and the useful half of a
reference is the half it cannot reach: why a class exists, and which of its neighbours it is
easy to confuse it with. The cost is that it can drift from the code; entries are kept short
enough to be worth updating.

Search covers both halves, and labels each result `wiki` or `code`, because typing a class
name legitimately returns both the class and the prose that discusses it.

## Diagrams

Inline SVG in `src/app/content/diagrams.ts`, drawn entirely in `currentColor`. One drawing
therefore serves both themes rather than two exports that drift apart, the labels are real
text so they are searchable, and there is no second asset to keep in sync.

## Deployment

Pushing to `main` builds and publishes to GitHub Pages. Two details in the workflow are
easy to miss and break the site silently:

- `--base-href` must match the repository path, or every asset 404s on a project site.
- `index.html` is copied to `404.html`, because GitHub Pages has no routing fallback and a
  deep link would otherwise 404 on refresh.

## Licence

The Quiblo project is GPLv3. This documentation site is part of it.
