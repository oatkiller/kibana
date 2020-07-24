/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { Middleware, Dispatch } from 'redux';
import { ResolverAction } from '../store/actions';
import { ResolverState } from '../types';

interface SpyMiddleware {
  /**
   * A middleware to use with `applyMiddleware`.
   */
  middleware: Middleware<{}, ResolverState, Dispatch<ResolverAction>>;
  /**
   * A generator that returns all state and action pairs that pass through the middleware.
   */
  actions: () => AsyncGenerator<StateActionPair, never, unknown>;

  /**
   * Prints actions to the console.
   * Call the returned function to stop debugging.
   */
  debugActions: () => () => void;
}

interface StateActionPair {
  action: ResolverAction;
  state: ResolverState;
}

// TODO, rename file
export const spyMiddlewareFactory: () => SpyMiddleware = () => {
  const resolvers: Set<(stateActionPair: StateActionPair) => void> = new Set();

  const actions = async function* actions() {
    while (true) {
      const promise: Promise<StateActionPair> = new Promise((resolve) => {
        resolvers.add(resolve);
      });
      yield await promise;
    }
  };

  return {
    middleware: (api) => (next) => (action: ResolverAction) => {
      const state = api.getState();
      const oldResolvers = [...resolvers];
      resolvers.clear();
      for (const resolve of oldResolvers) {
        resolve({ action, state });
      }

      next(action);
    },
    actions,
    debugActions() {
      let stop: boolean = false;
      (async () => {
        for await (const action of actions()) {
          if (stop) {
            break;
          }
          // eslint-disable-next-line no-console
          console.log('action', action);
        }
      })();
      return () => {
        stop = true;
      };
    },
  };
};
