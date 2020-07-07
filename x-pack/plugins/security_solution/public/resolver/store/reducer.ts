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
import * as selectors from './selectors';

const concernReducers = combineReducers({
  camera: cameraReducer,
  data: dataReducer,
  ui: uiReducer,
});

export const resolverReducer: Reducer<ResolverState, ResolverAction> = (state, action) => {
  const nextState = concernReducers(state, action);

  /**
   * When the app receives new properties, the query string can be one of them.
   * The query string contains the state for what node is selected.
   * If there was already state (this isn't the first action ever) and this action is 'appReceivedNewExternalProperties', then we might want to animate a change in the selected node.
   */
  // TODO, test
  if (action.type === 'appReceivedNewExternalProperties' && state !== undefined) {
    // See if there is a selected node. There might not be (if nothing was selected, or if something was unselected.)
    const selectedNode = selectors.selectedNode(nextState);

    // if there is a selected node
    if (selectedNode !== null) {
      // get the previously selected node.
      const previouslySelectedNode = selectors.selectedNode(state);

      // if they aren't the same, then we've changed to something (other than null.)
      // Try to animate:
      if (selectedNode !== previouslySelectedNode) {
        // we need to process, because thats how we'll find the position to animate too
        // this is weird, but oh well.
        const selectedProcess = selectors.processForEntityID(nextState)(selectedNode);

        // make sure we found it (it might not have been in memory)
        if (selectedProcess) {
          return animateProcessIntoView(nextState, action.payload.time, selectedProcess);
        }
      }
    }
  } else if (
    // TODO, what was this supposed to do?
    action.type === 'userBroughtProcessIntoView'
  ) {
    const process = selectors.processForEntityID(nextState)(action.payload.id);
    if (process) {
      return animateProcessIntoView(nextState, action.payload.time, process);
    } else {
      return nextState;
    }
  }
  return nextState;
};
