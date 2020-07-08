/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */
import { Reducer, Action } from 'redux';

// like `Reducer`, but requires state.
// used for non-standalone reducer-like functions passed to `composeReducers`.
type ReducerWithRequiredState<S, A extends Action> = (state: S, action: A) => S;

/**
 * takes a real reducer, followed by a bunch of reducer-like functions.
 * the `rest` aren't required to accept undefined state.
 * this works because the first reducer (and all of em) return state.
 */
export function composeReducers<S, A extends Action>(
  // call out `first` as a way to ensure that there is at least one
  first: Reducer<S, A>,
  ...rest: Array<ReducerWithRequiredState<S, A>>
): Reducer<S, A> {
  return function (state: S | undefined, action: A): S {
    return rest.reduce(function (nextState: S, reducer: ReducerWithRequiredState<S, A>): S {
      return reducer(nextState, action);
    }, first(state, action));
  };
}
