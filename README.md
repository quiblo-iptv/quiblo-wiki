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
