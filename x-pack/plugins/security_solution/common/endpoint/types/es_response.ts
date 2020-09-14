/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

/**
 * All mappings in Elasticsearch support arrays. They can also return null values or be missing. For example, a `keyword` mapping could return `null` or `[null]` or `[]` or `'hi'`, or `['hi', 'there']`. We need to handle these cases in order to avoid throwing an error.
 * When dealing with an value that comes from ES, wrap the underlying type in `ESField`. For example, if you have a `keyword` or `text` value coming from ES, cast it to `ESField<string>`.
 */
export type ESField<
  T extends ESResponseLeaf | ESField<{ [key: string]: ESField }> =
    | ESResponseLeaf
    | { [key: string]: ESField }
> = T | undefined | null | Array<T | null>;

/**
 * Defines what can be safely wrapped in an `ESField`.
 */
export type CanBeWrappedInField = ESResponseLeaf | ESField<{ [key: string]: ESField }>;

/**
 * The leaf types returned by ES. NB: this excludes undefined, null, and arrays, as those are handled by `ESField`.
 */
export type ESResponseLeaf = string | number;

/**
 * Returns the underlying type or never if there isn't one.
 */
type MaybeESFieldType<T> = T extends undefined | null | Array<null | infer P> | infer P
  ? /** `P` is the type that TS infers is wrapped in an `ESField`, but due to the way that type inferecene works, it will be incorrectly intersected with `undefined | null`. The below code removes those values. NB: `Exclude` does not work in this case. */ P extends
      | undefined
      | null
    ? never
    : P
  : never;

/**
 * This type can be passed to `ESSafe`. Use types extending this to define ES responses.
 **/
export type ESResponseDefinition<
  /** `T` is the underlying definition. */ T extends {} = Record<string, unknown>
> = {
  [K in keyof T]: ESResponseLeaf | ESResponseDefinition;
};

/**
 * Recursively mark all keys as optional and wrap all values in ESField.
 */
export type ESSafe<T extends ESResponseDefinition<T> = ESResponseDefinition> = {
  [K in keyof T]?: [
    K,
    T[K]
  ] extends /** Only operate on string keys that point to compatible values. Remove other keys */ [
    string,
    ESResponseLeaf | ESResponseDefinition
  ]
    ? ESField<
        /** Wrap each value in `ESField`, if the value isn't a leaf, recurse */ T[K] extends ESResponseDefinition
          ? ESSafe<T[K]>
          : T[K]
      >
    : never;
};

/**
 * Extract the underlying type from an  'ESSafe' type.
 */
export type ESSafeType<T extends {}> = {
  [K in keyof T]-?: MaybeESFieldType<T[K]> extends never
    ? /**
       * `MaybeESFieldType` returns `never` if the passed type isn't an `ESField`. In this case, bail out.
       */ never
    : /**
     * If `T[K]` is an object, recurse `ESSafeType`, passing the unwrapped type from `T[K]`.
     */ MaybeESFieldType<T[K]> extends {}
    ? ESSafeType<MaybeESFieldType<T[K]>>
    : /** Otherwise, T[K] wraps a leaf type, return that. */
      MaybeESFieldType<T[K]>;
};

/**
 * If this were an interface, it wouldn't extend `CanBeMadeESSafe`. Why?
 */
interface TestType {
  a: {
    b: {
      c: string;
    };
  };
}

const isESSafeAndESSafeTypeReciprocal: [ESSafeType<ESSafe<TestType>>, TestType] extends [
  TestType,
  ESSafeType<ESSafe<TestType>>
]
  ? true
  : false = true;

// Rebind `isESSafeAndESSafeTypeReciprocal` so that the original binding won't be unused (which would cause an error.)
// @ts-expect-error This binding is unused.
const pointlessBinding = isESSafeAndESSafeTypeReciprocal;
