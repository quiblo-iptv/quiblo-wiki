# TASK-001 Manual Sweep Test Tickets

| Ticket ID | Preconditions | Steps | Expected Result | Priority | Pass/Fail |
| --- | --- | --- | --- | --- | --- |
| TSK-001-01 | Build complete | 1. Run `node tools/seo.mjs`.<br>2. Inspect `dist/quiblo-wiki/browser/sitemap.xml`. | Each URL contains `<lastmod>` reflecting its content file's Git commit date. | High | PASS |
| TSK-001-02 | Workflow file open | 1. Inspect `.github/workflows/pages.yml`.<br>2. Verify checkout step configuration. | `actions/checkout@v4` declares `fetch-depth: 0`. | Normal | PASS |
