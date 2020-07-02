/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { Reducer } from 'redux';
import { ResolverUIState } from '../../types';
import { ResolverAction } from '../actions';
import { uniquePidForProcess } from '../../models/process_event';

export const uiReducer: Reducer<ResolverUIState, ResolverAction> = (
  state = {
    focusedNode: null,
    selectedNode: null,
    panelToDisplay: null,
  },
  action
) => {
  if (action.type === 'userFocusedOnResolverNode') {
    return {
      ...state,
      focusedNode: action.payload,
    };
  } else if (action.type === 'userSelectedResolverNode') {
    return {
      ...state,
      selectedNode: action.payload,
    };
  } else if (action.type === 'appDisplayedDifferentPanel') {
    return {
      ...state,
      panelToDisplay: action.payload,
    };
  } else if (
    action.type === 'userBroughtProcessIntoView' ||
    action.type === 'appDetectedNewIdFromQueryParams'
  ) {
    // focus and select the node
    return {
      ...state,
      focusedNode: action.payload.id,
      selectedNode: action.payload.id,
    };
  } else {
    return state;
  }
};
