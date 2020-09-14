/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import {
  CanBeWrappedInField,
  ESField,
  ESResponseDefinition,
  ESResponseLeaf,
  ESSafe,
  ESSafeType,
} from '../types/es_response';

function isNonNullObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/**
 * Signatures for `first`. Defined separately because `first` needs to recurse, calling the implementation signature, and that is not possible with function overloading.
 */
interface First {
  <
    T extends {},
    P1 extends keyof ESSafeType<T>,
    P2 extends keyof ESSafeType<T>[P1],
    P3 extends keyof ESSafeType<T>[P1][P2]
  >(
    container: T,
    firstPathPart: P1,
    secondPathPart: P2,
    thirdPathPart: P3
  ): ESSafeType<T>[P1][P2][P3] | undefined;
  <T extends {}, P1 extends keyof ESSafeType<T>, P2 extends keyof ESSafeType<T>[P1]>(
    container: T,
    firstPathPart: P1,
    secondPathPart: P2
  ): ESSafeType<T>[P1][P2] | undefined;
  <T extends {}, P1 extends keyof ESSafeType<T>>(container: T, firstPathPart: P1):
    | ESSafeType<T>[P1]
    | undefined;
}

/**
 * Safer typer for `Array.isArray`.
 * The default returns `arg is any[]`
 */
type SafeIsArray = (arg: unknown) => arg is unknown[];

function allInField<T extends CanBeWrappedInField>(field: ESField<T>): T[] {
  // If the value is an array, return all non-null elements.
  if ((Array.isArray as SafeIsArray)(field)) {
    const nonNullElements = [];
    for (const value of field) {
      if (value !== null) {
        nonNullElements.push(value);
      }
    }
    return nonNullElements;
  } else if (field !== null && field !== undefined) {
    // There is a single value, return it, wrapped in an array
    return [field];
  } else {
    // There were no valid values, return an empty array
    return [];
  }
}

function firstInField<T extends CanBeWrappedInField>(field: ESField<T>): T | undefined {
  // If the value is an array, return the first non-null element. If there are no non-null elements, return undefined.
  if ((Array.isArray as SafeIsArray)(field)) {
    for (const value of field) {
      if (value !== null) {
        return value;
      }
    }
    return undefined;
  } else if (field === null) {
    // If the field is null, return undefined
    return undefined;
  }
  // Return the field (or undefined)
  return field;
}

/**
 * Drill down `container` using path parts. If the value at a part is an array, get the first item.
 */
const firstImplementation = (
  container: ESSafe,
  firstPathPart: string,
  ...otherPathParts: string[]
): ESResponseLeaf | ESResponseDefinition | undefined => {
  // Short circuit if the `container` isn't valid. Otherwise narrow it.
  if (!isNonNullObject(container)) {
    return undefined;
  }

  const field = container[firstPathPart];
  // This function recurses until there are no `otherPathParts`. At that point it returns the value found at `firstPathPart`.
  const valueOrCollection = firstInField(field);

  const [nextFirstPathPart, ...nextOtherPathParts] = otherPathParts;

  if (nextFirstPathPart === undefined) {
    // there are no more path parts to apply, return the value
    return valueOrCollection;
  } else if (isNonNullObject(valueOrCollection)) {
    return firstImplementation(valueOrCollection, nextFirstPathPart, ...nextOtherPathParts);
  } else {
    // There path didn't point to anything. The path so far pointed to a leaf type, but there are more parts to the path
    throw new Error("Path to value returned from ES doesn't exist.");
  }
};

/**
 * Get the first defined value from response at key
 */
export const first: First = firstImplementation;
