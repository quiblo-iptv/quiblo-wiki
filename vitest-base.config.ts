import { defineConfig } from 'vitest/config';

/**
 * The one thing the test environment needs that the builder does not set.
 *
 * Angular's `unit-test` builder runs specs under jsdom, and jsdom serves `about:blank` unless
 * it is told otherwise. `about:blank` is an **opaque origin**, and the storage APIs are
 * origin-scoped — so `localStorage` and `Storage` are simply absent, and any spec that reads,
 * clears or spies on them fails with `Cannot read properties of undefined`.
 *
 * Giving jsdom an origin is what makes them exist. The value is arbitrary and is never
 * requested; what matters is that it is a real origin rather than an opaque one.
 */
export default defineConfig({
  test: {
    environmentOptions: {
      jsdom: {
        url: 'https://quiblo-iptv.github.io/quiblo-wiki/',
      },
    },
  },
});
