/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */
import '@types/jest'
// Use node specific types for this, as it is not an exact match with the W3c implementation.
import { PerformanceObserver } from 'perf_hooks'
import {timerifyObserver} from './timerify_observer';

type describeParameters = Parameters<typeof describe>

/** Don't merge this to main, it is for test debugging purposes only. Test performance cannot be guaranteed in CI. */
export function describeWithPerformanceObserver(name: describeParameters[0], fn: describeParameters[1]): void {
  // Create a describe stanza using the provided name
  describe(name, () => {
    // A performance observer that will log 'function' entries created by `performance.timerify`
    let performanceObserver: PerformanceObserver;
    beforeEach(() => {
      // Before each test create the timerify observer. It will immediately log any entries
      performanceObserver = timerifyObserver();
    });
    afterEach(() => {
      // after each test, disconnect it
      performanceObserver.disconnect();
    });
    // Run the provided discribe function, will will setup more 'before' and 'after' behavior as well as other suites and specs.
    fn()
  }
}
