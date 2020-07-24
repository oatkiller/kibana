/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */
import { Store } from 'redux';

/**
 * Return a promise that resolver after the `store`'s next state transition.
 */
export function stateTransitioned(store: Store<unknown>): Promise<undefined> {
  let resolveState: (() => void) | null = null;
  const promise: Promise<undefined> = new Promise((resolve) => {
    resolveState = resolve;
  });
  const unsubscribe = store.subscribe(() => {
    unsubscribe();
    resolveState!();
  });
  return promise;
}

/**
 * Wait until the selector is true.
 */
export async function untilTrue<S>(
  store: Store<S>,
  selector: (state: S) => boolean
): Promise<void> {
  while (selector(store.getState()) !== true) {
    await stateTransitioned(store);
  }
  return undefined;
}
