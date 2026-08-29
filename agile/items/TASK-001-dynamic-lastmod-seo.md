# TASK-001: Accurate Dynamic Lastmod per Wiki Route in Sitemap

## Problem & Motivation
All 47 prerendered wiki and API routes in `sitemap.xml` were assigned an identical build date (`today`), preventing search engine crawlers like Googlebot from distinguishing recently updated documentation pages from unchanged content.

## Scope
- Modify `tools/seo.mjs` to map declared routes to their underlying source files in `src/app/content` and `src/app/api/content`.
- Extract the last modified date via Git commit history (`git log -1 --format=%cs -- <file>`) with fallback to current date.
- Update GitHub Actions workflow `.github/workflows/pages.yml` with `fetch-depth: 0` to preserve Git commit history during CI/CD build runs.
- Set up repository `docs/` pointer and `agile/` triplets.

## Explicit Non-Scope
- Changing Angular routing structure or prerendered page layouts.
- Altering robots.txt rules.

## Acceptance Criteria
- `tools/seo.mjs` outputs valid XML sitemap with individualized `<lastmod>` timestamps matching source Git commits.
- `.github/workflows/pages.yml` checks out full history via `fetch-depth: 0`.
- All test suites pass.
