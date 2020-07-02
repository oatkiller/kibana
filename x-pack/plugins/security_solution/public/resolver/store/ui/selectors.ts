/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { createSelector } from 'reselect';
import { ResolverUIState } from '../../types';

/**
 * id of the "current" tree node (fake-focused)
 */
export function focusedNode(state: ResolverUIState): string | null {
  return state.focusedNode;
}

/**
 * id of the currently "selected" tree node
 */
export const selectedNode: (state: ResolverUIState) => string | null = (state) =>
  state.selectedNode;

// Select the current panel to be displayed
export const currentPanelView = (uiState: ResolverUIState) => {
  return uiState.panelToDisplay;
};
