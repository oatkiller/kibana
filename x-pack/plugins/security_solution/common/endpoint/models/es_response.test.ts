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

describe('es_response#first can access nested values', () => {
  let testObject: ESSafe<TestType>;
  beforeEach(() => {
    testObject = {
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
  });
  type Is<A, B> = [A, B] extends [B, A] ? true : false;
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

describe('es_response#first when can access the first item of arrays', () => {});
