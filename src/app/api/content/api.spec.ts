import { API, findPackage, packagesByLayer, typeCount } from './index';

/**
 * Integrity of the code reference.
 *
 * The failure this guards against is not a broken component — it is a package that cannot be
 * reached, or a type whose anchor does not match the one search generates, which produces a
 * result that navigates to the right page and then scrolls nowhere.
 */

/** Must stay identical to the slug used by the package page and by SearchService. */
function anchorFor(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

describe('code reference', () => {
  it('has unique package ids', () => {
    const ids = API.map((pkg) => pkg.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('can find every package by its id', () => {
    for (const pkg of API) {
      expect(findPackage(pkg.id)?.module).toBe(pkg.module);
    }
  });

  it('gives every package a module, a package name, a summary and types', () => {
    for (const pkg of API) {
      expect(pkg.module.startsWith(':'), `${pkg.id} module looks wrong`).toBe(true);
      expect(pkg.packageName.startsWith('dev.quiblo'), `${pkg.id} package looks wrong`).toBe(true);
      expect(pkg.summary.length).toBeGreaterThan(0);
      expect(pkg.types.length, `${pkg.id} has no types`).toBeGreaterThan(0);
    }
  });

  it('gives every type a summary', () => {
    for (const pkg of API) {
      for (const type of pkg.types) {
        expect(type.summary.length, `${pkg.id}/${type.name} has no summary`).toBeGreaterThan(0);
      }
    }
  });

  it('produces a unique, non-empty anchor for every type in a package', () => {
    // Shared with SearchService: a mismatch here is a search result that lands on the right
    // page and then fails to scroll, which is invisible until someone tries it.
    for (const pkg of API) {
      const anchors = pkg.types.map((type) => anchorFor(type.name));
      for (const [index, anchor] of anchors.entries()) {
        expect(anchor.length, `${pkg.id}/${pkg.types[index].name} has an empty anchor`)
          .toBeGreaterThan(0);
      }
      expect(new Set(anchors).size, `duplicate anchors in ${pkg.id}`).toBe(anchors.length);
    }
  });

  it('places every package in a layer group', () => {
    const grouped = packagesByLayer().flatMap((group) => group.packages);
    expect(grouped.length).toBe(API.length);
  });

  it('counts every documented type', () => {
    expect(typeCount()).toBe(API.reduce((n, pkg) => n + pkg.types.length, 0));
    expect(typeCount()).toBeGreaterThan(50);
  });
});
