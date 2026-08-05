/**
 * The shape of the code reference.
 *
 * Deliberately hand-authored rather than generated from KDoc. A generator produces one entry
 * per symbol whether or not there is anything to say about it, and the useful half of this
 * reference is the half a generator cannot reach: why a class exists, what it must not be
 * used for, and which of its neighbours it is easy to confuse it with.
 *
 * The cost is that it can drift from the code. That is accepted, and mitigated by keeping
 * entries short enough to be worth updating.
 */

export type TypeKind =
  | 'class'
  | 'abstract class'
  | 'data class'
  | 'interface'
  | 'sealed interface'
  | 'object'
  | 'enum';

/** A property or function worth naming on its own. Not an exhaustive member list. */
export interface ApiMember {
  readonly name: string;
  readonly summary: string;
}

export interface ApiType {
  readonly name: string;
  readonly kind: TypeKind;
  /** One line. Shown in the package index and in search results. */
  readonly summary: string;
  /** Trusted HTML: why it exists, and anything a caller could get wrong. */
  readonly detail?: string;
  readonly members?: readonly ApiMember[];
}

/** Which layer a package sits in. Drives grouping, and the dependency rule. */
export type Layer = 'core' | 'source' | 'feature' | 'app';

export interface ApiPackage {
  /** URL segment. */
  readonly id: string;
  /** The Gradle module, e.g. `:core:data`. */
  readonly module: string;
  /** The Kotlin package, e.g. `dev.quiblo.core.data`. */
  readonly packageName: string;
  readonly layer: Layer;
  readonly summary: string;
  readonly detail?: string;
  readonly types: readonly ApiType[];
}

export const LAYER_LABELS: Record<Layer, string> = {
  core: 'Core',
  source: 'Source',
  feature: 'Feature',
  app: 'Application',
};

export const LAYER_BLURBS: Record<Layer, string> = {
  core: 'Domain types, storage, playback and networking. No UI, enforced by the build.',
  source: 'The protocol layer: one implementation per playlist or panel format.',
  feature: 'ViewModels and the state they expose. Shared by both applications.',
  app: 'Assembly and presentation. The only layer that knows about screens.',
};
