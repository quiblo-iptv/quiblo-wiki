import type { ApiPackage, Layer } from '../api.model';
import { CORE_PACKAGES } from './core';
import { SOURCE_PACKAGES } from './source';
import { UI_PACKAGES } from './ui';

/** Every package, in dependency order: core first, then what builds on it. */
export const API: readonly ApiPackage[] = [
  ...CORE_PACKAGES,
  ...SOURCE_PACKAGES,
  ...UI_PACKAGES,
];

export function findPackage(id: string): ApiPackage | undefined {
  return API.find((pkg) => pkg.id === id);
}

/** Grouped for the landing page, preserving the order above within each layer. */
export function packagesByLayer(): readonly { layer: Layer; packages: ApiPackage[] }[] {
  const order: readonly Layer[] = ['core', 'source', 'feature', 'app'];
  return order
    .map((layer) => ({ layer, packages: API.filter((pkg) => pkg.layer === layer) }))
    .filter((group) => group.packages.length > 0);
}

export function typeCount(): number {
  return API.reduce((total, pkg) => total + pkg.types.length, 0);
}
