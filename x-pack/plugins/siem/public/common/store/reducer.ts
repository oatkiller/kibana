/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { combineReducers, PreloadedState, CombinedState } from 'redux';

import { appReducer, initialAppState, AppState } from './app';
import { dragAndDropReducer, initialDragAndDropState, DragAndDropState } from './drag_and_drop';
import { createInitialInputsState, inputsReducer, InputsState } from './inputs';

import { HostsPluginReducer, HostsPluginState } from '../../hosts/store';
import { NetworkPluginReducer, NetworkPluginState } from '../../network/store';
import { TimelinePluginReducer, TimelinePluginState } from '../../timelines/store/timeline';
import {
  EndpointAlertsPluginReducer,
  EndpointAlertsPluginState,
} from '../../endpoint_alerts/store';
import { EndpointHostsPluginReducer, EndpointHostsPluginState } from '../../endpoint_hosts/store';

import { ManagementPluginReducer, ManagementPluginState } from '../../management/types';
import { SecuritySubPlugins } from '../../app/types';

/**
 * The redux `State` type for the Security App.
 * We use `CombinedState` to wrap our shape because we create our reducer using `combineReducers`.
 * `combineReducers` returns a type wrapped in `CombinedState`.
 * `CombinedState` is required for redux to know what keys to make optional when preloaded state into a store.
 */
export type State = CombinedState<
  HostsPluginState &
    NetworkPluginState &
    TimelinePluginState &
    EndpointAlertsPluginState &
    EndpointHostsPluginState &
    ManagementPluginState & {
      app: AppState;
      dragAndDrop: DragAndDropState;
      inputs: InputsState;
    }
>;

export type SubPluginsInitReducer = HostsPluginReducer &
  NetworkPluginReducer &
  TimelinePluginReducer &
  EndpointAlertsPluginReducer &
  EndpointHostsPluginReducer &
  ManagementPluginReducer;

/**
 * Factory for the 'initialState' that is used to preload state into the Security App's redux store.
 */
export const createInitialState = (
  pluginsInitState: SecuritySubPlugins['store']['initialState']
): PreloadedState<State> => {
  const preloadedState: PreloadedState<State> = {
    app: initialAppState,
    dragAndDrop: initialDragAndDropState,
    ...pluginsInitState,
    inputs: createInitialInputsState(),
  };
  return preloadedState;
};

/**
 * Factory for the Security app's redux reducer.
 */
export const createReducer = (pluginsReducer: SubPluginsInitReducer) =>
  combineReducers({
    app: appReducer,
    dragAndDrop: dragAndDropReducer,
    inputs: inputsReducer,
    ...pluginsReducer,
  });
