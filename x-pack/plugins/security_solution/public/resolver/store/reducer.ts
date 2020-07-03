/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */
import { Reducer, combineReducers } from 'redux';
import { animateProcessIntoView } from './methods';
import { cameraReducer } from './camera/reducer';
import { dataReducer } from './data/reducer';
import { ResolverAction } from './actions';
import { ResolverState } from '../types';
import { uiReducer } from './ui/reducer';
import { processForEntityID } from './selectors';

const concernReducers = combineReducers({
  camera: cameraReducer,
  data: dataReducer,
  ui: uiReducer,
});

export const resolverReducer: Reducer<ResolverState, ResolverAction> = (state, action) => {
  const nextState = concernReducers(state, action);
  if (
    action.type === 'appDetectedNewIdFromQueryParams' ||
    action.type === 'userBroughtProcessIntoView'
  ) {
    const process = processForEntityID(nextState)(action.payload.id);
    if (process) {
      return animateProcessIntoView(nextState, action.payload.time, process);
    } else {
      return nextState;
    }
  } else {
    return nextState;
  }
};
