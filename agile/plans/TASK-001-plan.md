# TASK-001 Implementation Plan

## Approach
1. Cut task branch `task/TASK-001-dynamic-lastmod-seo` from `main`.
2. Refactor `tools/seo.mjs` to map each slug/id to its source TypeScript file and fetch its last commit date via `git log -1 --format=%cs`.
3. Update `.github/workflows/pages.yml` `actions/checkout@v4` step with `fetch-depth: 0`.
4. Run full test suite and sitemap generation script.
5. Validate XML output with `xmllint`.

## Files Touched
- `tools/seo.mjs`
- `.github/workflows/pages.yml`
- `docs/AMENDMENTS.md`
- `agile/items/TASK-001-dynamic-lastmod-seo.md`
- `agile/plans/TASK-001-plan.md`
- `agile/testing/TASK-001-automated.md`
- `agile/testing/TASK-001-sweep.md`

## Risks & Rollback
- Risk: Deep checkout slowing CI build. Mitigation: Repository history is lightweight and required for genuine sitemap timestamps.
- Rollback: Revert commit on task branch.
