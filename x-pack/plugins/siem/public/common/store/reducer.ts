/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { combineReducers, PreloadedState, CombinedState } from 'redux';

import { appReducer, initialAppState, AppState } from './app';
import { dragAndDropReducer, initialDragAndDropState, DragAndDropState } from './drag_and_drop';
import { createInitialInputsState, initialInputsState, inputsReducer, InputsState } from './inputs';

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

export const initialState: Pick<PreloadedState<State>, 'app' | 'dragAndDrop' | 'inputs'> = {
  app: initialAppState,
  dragAndDrop: initialDragAndDropState,
  inputs: initialInputsState,
};

export type SubPluginsInitReducer = HostsPluginReducer &
  NetworkPluginReducer &
  TimelinePluginReducer &
  EndpointAlertsPluginReducer &
  EndpointHostsPluginReducer &
  ManagementPluginReducer;

export const createInitialState = (
  pluginsInitState: SecuritySubPlugins['store']['initialState']
): PreloadedState<State> => {
  const preloadedState: PreloadedState<State> = {
    ...initialState,
    ...pluginsInitState,
    inputs: createInitialInputsState(),
  };
  return preloadedState;
};

export const createReducer = (pluginsReducer: SubPluginsInitReducer) =>
  combineReducers({
    app: appReducer,
    dragAndDrop: dragAndDropReducer,
    inputs: inputsReducer,
    ...pluginsReducer,
  });
