/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { Dispatch, Action, Middleware, CombinedState } from 'redux';

import { CoreStart } from '../../../../../../src/core/public';
import { State } from './reducer';
import { StartPlugins } from '../../types';
import { AppAction } from './actions';
import { Immutable } from '../../../common/endpoint/types';

export type KueryFilterQueryKind = 'kuery' | 'lucene';

export interface KueryFilterQuery {
  kind: KueryFilterQueryKind;
  expression: string;
}

export interface SerializedFilterQuery {
  kuery: KueryFilterQuery | null;
  serializedQuery: string;
}

/**
 * like redux's `MiddlewareAPI` but `getState` returns an `Immutable` version of
 * state and `dispatch` accepts `Immutable` versions of actions.
 */
export interface ImmutableMiddlewareAPI<S, A extends Action> {
  dispatch: Dispatch<A | Immutable<A>>;
  getState(): Immutable<S>;
}

/**
 * Like redux's `Middleware` but without the ability to mutate actions or state.
 * Differences:
 *   * `getState` returns an `Immutable` version of state
 *   * `dispatch` accepts `Immutable` versions of actions
 *   * `action`s received will be `Immutable`
 */
export type ImmutableMiddleware<S, A extends Action> = (
  api: ImmutableMiddlewareAPI<S, A>
) => (next: Dispatch<A | Immutable<A>>) => (action: Immutable<A>) => unknown;

/**
 * Takes application-standard middleware dependencies
 * and returns a redux middleware.
 * Middleware will be of the `ImmutableMiddleware` variety. Not able to directly
 * change actions or state.
 */
export type ImmutableMiddlewareFactory<S = State> = (
  coreStart: CoreStart,
  depsStart: Pick<StartPlugins, 'data' | 'ingestManager'>
) => ImmutableMiddleware<S, AppAction>;

/**
 * Takes application-standard middleware dependencies
 * and returns an array of redux middleware.
 * Middleware will be of the `ImmutableMiddleware` variety. Not able to directly
 * change actions or state.
 */
export type SecuritySubPluginMiddlewareFactory = (
  coreStart: CoreStart,
  depsStart: Pick<StartPlugins, 'data' | 'ingestManager'>
) => Array<Middleware<{}, State, Dispatch<AppAction | Immutable<AppAction>>>>;

/**
 * Like `Reducer` from `redux` but it accepts immutable versions of `state` and `action`.
 * Use this type for all Reducers in order to help enforce our pattern of immutable state.
 */
export type ImmutableReducer<S, A> = (
  state: Immutable<S> | undefined,
  action: Immutable<A>
) => S | Immutable<S>;

/**
 * A alternate interface for `redux`'s `combineReducers`. Will work with the same underlying implementation,
 * but will enforce that `Immutable` versions of `state` and `action` are received.
 */
export type ImmutableCombineReducers = <M extends ImmutableReducersMapObject<unknown, never>>(
  reducers: M
) => ImmutableReducer<
  CombinedState<StateFromImmutableReducersMapObject<M>>,
  ActionFromImmutableReducersMapObject<M>
>;

type StateFromImmutableReducersMapObject<M> = M extends ImmutableReducersMapObject<unknown, never>
  ? { [P in keyof M]: M[P] extends ImmutableReducer<infer S, infer _A> ? S : never }
  : never;

type ActionFromImmutableReducersMapObject<M> = M extends ImmutableReducersMapObject<unknown, never>
  ? ActionFromReducer<ReducerFromReducersMapObject<M>>
  : never;

export type ReducerFromReducersMapObject<M> = M extends {
  [P in keyof M]: infer R;
}
  ? R extends ImmutableReducer<infer _S, infer _A>
    ? R
    : never
  : never;

type ActionFromReducer<R> = R extends ImmutableReducer<infer _S, infer A> ? A : never;

/**
 * Like `redux`'s `ReducersMapObject` (which is used by `combineReducers`) but enforces that
 * the `state` and `action` received are `Immutable` versions.
 */
export type ImmutableReducersMapObject<S, A extends Action = Action> = {
  [K in keyof S]: ImmutableReducer<S[K], A>;
};

/**
 * A better type for createStructuredSelector. This doesn't support the options object.
 */
export type CreateStructuredSelector = <
  SelectorMap extends { [key: string]: (...args: never[]) => unknown }
>(
  selectorMap: SelectorMap
) => (
  state: SelectorMap[keyof SelectorMap] extends (state: infer State) => unknown ? State : never
) => {
  [Key in keyof SelectorMap]: ReturnType<SelectorMap[Key]>;
};
