/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { ESField, ESResponseLeaf } from '../../types/es_response';

export type Validator<T> = (value: unknown) => value is T;
export type TypeOf<V extends Validator<unknown>> = V extends Validator<infer T> ? T : never;

/**
 * Validate that `value` matches at least one of `validators`.
 * Use this to create a predicate for a union type.
 * e.g.
 * ```
 * import * as schema from './schema';
 * const isAscOrDesc: (value: unknown) => value is 'asc' | 'desc' = schema.oneOf([
 *   schema.literal('asc' as const),
 *   schema.literal('desc' as const),
 * ]);
 * ```
 */
export function oneOf<V extends Array<Validator<unknown>>>(validators: V) {
  return function (
    value: unknown
  ): value is V extends Array<Validator<infer ElementType>> ? ElementType : never {
    for (const validator of validators) {
      if (validator(value)) {
        return true;
      }
    }
    return false;
  };
}

/**
 * Validate that `value` is an array and that each of its elements matches `elementValidator`.
 * Use this to create a predicate for an array type.
 * ```
 * import * as schema from './schema';
 * const isAscOrDesc: (value: unknown) => value is 'asc' | 'desc' = schema.oneOf([
 *   schema.literal('asc' as const),
 *   schema.literal('desc' as const),
 * ]);
 * ```
 */
export function array<V extends Validator<unknown>>(elementValidator: V) {
  return function (
    value: unknown
  ): value is Array<V extends Validator<infer ElementType> ? ElementType : never> {
    if (Array.isArray(value)) {
      for (const element of value as unknown[]) {
        const result = elementValidator(element);
        if (!result) {
          return false;
        }
      }
      return true;
    }
    return false;
  };
}

// Returns the keys of an object if `undefined` is assignable to the value of that key.
type KeysWithOptionalValues<T extends { [key: string]: unknown }> = {
  [K in keyof T]: undefined extends T[K] ? K : never;
}[keyof T];

// Returns a version of the object that marks keys optional if `undefined` could be assigned to that key
type OptionalKeyWhenValueAcceptsUndefined<T extends { [key: string]: unknown }> = {
  [K in Exclude<keyof T, KeysWithOptionalValues<T>>]: T[K];
} &
  {
    [K in KeysWithOptionalValues<T>]?: Exclude<T[K], undefined>;
  };

type ObjectType<
  ValidatorDictionary extends {
    [key: string]: Validator<unknown>;
  }
> = /** If a key can point to `undefined`, then instead make the key optional and exclude `undefined` from the value type. */ OptionalKeyWhenValueAcceptsUndefined<
  {
    [K in keyof ValidatorDictionary]: TypeOf<ValidatorDictionary[K]>;
  }
>;

/**
 * Validate that `value` is an object with string keys. The value at each key is tested against its own validator.
 *
 * Use this to create a predicate for a type like `{ a: string[] }`. For example:
 * ```ts
 * import * as schema from './schema';
 * const myValidator: (value: unknown) => value is { a: string[] } = schema.object({
 *   a: schema.array(schema.string()),
 * });
 * ```
 */
export function object<
  ValidatorDictionary extends {
    [key: string]: Validator<unknown>;
  }
>(validatorDictionary: ValidatorDictionary) {
  return function (value: unknown): value is ObjectType<ValidatorDictionary> {
    // This only validates non-null objects
    if (typeof value !== 'object' || value === null) {
      return false;
    }

    // Rebind value as the result type so that we can interrogate it
    const trusted = value as { [K in keyof ValidatorDictionary]: TypeOf<ValidatorDictionary[K]> };

    // Get each validator in the validator dictionary and use it to validate the corresponding value
    for (const key of Object.keys(validatorDictionary)) {
      const validator = validatorDictionary[key];
      if (!validator(trusted[key])) {
        return false;
      }
    }
    return true;
  };
}

export function esObject<
  ValidatorDictionary extends {
    [key: string]: Validator<unknown>;
  }
>(
  validatorDictionary: ValidatorDictionary
): (value: unknown) => value is ESField<ObjectType<ValidatorDictionary>> {
  return es(object(validatorDictionary));
}

/**
 * Validate that `value` is strictly equal to `acceptedValue`.
 * Use this for a literal type, for example:
 * ```
 * import * as schema from './schema';
 * const isAscOrDesc: (value: unknown) => value is 'asc' | 'desc' = schema.oneOf([
 *   schema.literal('asc' as const),
 *   schema.literal('desc' as const),
 * ]);
 * ```
 */
export function literal<T>(acceptedValue: T) {
  return function (value: unknown): value is T {
    return acceptedValue === value;
  };
}

/**
 * Validate that `value` is a string.
 * NB: this is used as `string` externally via named export.
 * Usage:
 * ```
 * import * as schema from './schema';
 * const isString: (value: unknown) => value is string = schema.string();
 * ```
 */
function stringValidator(): (value: unknown) => value is string {
  return function (value: unknown): value is string {
    return typeof value === 'string';
  };
}

export function esString(): (value: unknown) => value is ESField<string> {
  return es(stringValidator());
}

/**
 * Validate that `value` is a number.
 * NB: this just checks if `typeof value === 'number'`. It will return `true` for `NaN`.
 * NB: this is used as `number` externally via named export.
 * Usage:
 * ```
 * import * as schema from './schema';
 * const isNumber: (value: unknown) => value is number = schema.number();
 * ```
 */
function numberValidator(): (value: unknown) => value is number {
  return function (value: unknown): value is number {
    return typeof value === 'number';
  };
}

export function esNumber(): (value: unknown) => value is ESField<number> {
  return es(numberValidator());
}

/**
 * Export `stringValidator` as `string`. We can't define a function named `string`.
 * Export `numberValidator` as `number`. We can't define a function named `number`.
 */
export { stringValidator as string, numberValidator as number };

function es<T extends ESResponseLeaf | ESField<{ [key: string]: ESField }>>(
  wrappedTypeValidator: (value: unknown) => value is T
): (value: unknown) => value is ESField<T> {
  return oneOf([
    wrappedTypeValidator,
    literal(undefined),
    literal(null),
    array(oneOf([wrappedTypeValidator, literal(null)])),
  ]);
}
