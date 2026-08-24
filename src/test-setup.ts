/**
 * Restores `localStorage` in the test environment, which the runner leaves unresolvable.
 *
 * jsdom defines `localStorage` as a **getter on its own `window`**, keyed to an internal
 * backing store on that object. The test runner copies jsdom's globals onto `globalThis` by
 * descriptor, so the getter arrives detached from the object it was written for: it is an own
 * property of `globalThis` — `Object.getOwnPropertyNames` lists it beside `_localStorage` — and
 * reading it yields `undefined` rather than a `Storage`.
 *
 * That is why `typeof localStorage === 'undefined'` in a spec while `Storage` is a function and
 * the page has a real origin. It is a property of how the environment is assembled, not of
 * jsdom and not of the code under test.
 *
 * So the backing store jsdom already built is bound to the name it belongs under. Nothing is
 * faked: `_localStorage` is jsdom's own `Storage` instance, spec-compliant and shared with
 * anything else that reaches it. Where even that is absent the property is left alone, because
 * a stub that quietly forgets everything written to it would turn a broken environment into a
 * passing test.
 */
for (const name of ['localStorage', 'sessionStorage'] as const) {
  const global = globalThis as Record<string, unknown>;
  if (global[name] !== undefined) continue;

  const backing = global[`_${name}`];
  if (backing === undefined) continue;

  Object.defineProperty(global, name, {
    configurable: true,
    get: () => backing,
  });
}
