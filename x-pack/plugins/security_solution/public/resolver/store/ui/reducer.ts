/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { Reducer } from 'redux';
import { ResolverUIState } from '../../types';
import { ResolverAction } from '../actions';

export const uiReducer: Reducer<ResolverUIState, ResolverAction> = (
  state = {
    focusedNode: null,
    selectedNode: null,
  },
  action
) => {
  if (action.type === 'appReceivedNewExternalProperties') {
    // keep a copy of the url search in order to determine what is selected.
    return {
      ...state,
      urlSearch: action.payload.urlSearch,
    };
  } else if (action.type === 'userFocusedOnResolverNode') {
    // TODO
    return {
      ...state,
      focusedNode: action.payload,
    };
  } else if (action.type === 'userSelectedResolverNode') {
    // TODO
    return {
      ...state,
      selectedNode: action.payload,
    };
  } else if (action.type === 'userBroughtProcessIntoView') {
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
