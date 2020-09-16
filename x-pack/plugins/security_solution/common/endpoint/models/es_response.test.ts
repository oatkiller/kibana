/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { ESSafe } from '../types/es_response';
import { first } from './es_response';

interface TestType {
  a: 'a';
  b: {
    c: 'c';
  };
  d: {
    e: {
      f: 'f';
    };
  };
}

/**
 * Assert that A and B extend each other in the covariant and contravariant positions.
 */
type Is<A, B> = [A, B] extends [B, A] ? true : false;

function simpleTestObject(): ESSafe<TestType> {
  return {
    a: 'a',
    b: {
      c: 'c',
    },
    d: {
      e: {
        f: 'f',
      },
    },
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Paths<T extends object, Memo extends Array<keyof any> = []> = {
  [K in keyof T]: [...Memo, K] | (T[K] extends object ? Paths<T[K], [...Memo, K]> : never);
}[keyof T];

describe('es_response#first', () => {
  describe.each([[simpleTestObject()]])('with a response of %j', (testObject: ESSafe<TestType>) => {
    describe.each([
      [['a'], 'a'],
      [['b', 'c'], 'c'],
      [['d', 'e', 'f'], 'f'],
    ])('with a path of %p', (path, expected) => {});
    it('one level deep', () => {
      const value = first(testObject, 'a');
      type ExpectedType = 'a' | undefined;
      // If `true` is assignable to this binding then the types are correct.
      const assertType: Is<ExpectedType, typeof value> = true;
      // This will always pass, but without it `assertType` is unused.
      expect(assertType).toBe(true);
      expect(value).toBe('a');
    });
    it('two levels deep', () => {
      const value = first(testObject, 'b', 'c');
      type ExpectedType = 'c' | undefined;
      // If `true` is assignable to this binding then the types are correct.
      const assertType: Is<ExpectedType, typeof value> = true;
      // This will always pass, but without it `assertType` is unused.
      expect(assertType).toBe(true);
      expect(value).toBe('c');
    });
    it('three levels deep', () => {
      const value = first(testObject, 'd', 'e', 'f');
      type ExpectedType = 'f' | undefined;
      // If `true` is assignable to this binding then the types are correct.
      const assertType: Is<ExpectedType, typeof value> = true;
      // This will always pass, but without it `assertType` is unused.
      expect(assertType).toBe(true);
      expect(value).toBe('f');
    });
  });

  describe('es_response#first can access nested values when the parent field contains an array,', () => {
    it('one level deep', () => {});
  });
});
