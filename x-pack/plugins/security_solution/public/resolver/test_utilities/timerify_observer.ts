/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

/* eslint-disable import/no-nodejs-modules */

/* eslint-disable no-console */
import { PerformanceObserver } from 'perf_hooks';

export function timerifyObserver(): PerformanceObserver {
  const performanceObserver = new PerformanceObserver((list) => {
    console.log('list', list);
    for (const entry of list.getEntries()) {
      console.log('entry', entry);
    }
  });
  // 'function' is the node specific, non-W3C entry type that is created by `performance.timerify`
  performanceObserver.observe({ entryTypes: ['function'] });

  return performanceObserver;
}
