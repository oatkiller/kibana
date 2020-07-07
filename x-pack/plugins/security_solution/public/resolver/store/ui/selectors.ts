/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { createSelector } from 'reselect';
import { ResolverUIState, PanelQueryStringState } from '../../types';

/**
 * id of the "current" tree node (fake-focused)
 */
export function focusedNode(state: ResolverUIState): string | null {
  return state.focusedNode;
}

/**
 * id of the currently "selected" tree node
 */
// TODO, this should probably use the url?
export const selectedNode: (state: ResolverUIState) => string | null = (state) =>
  state.selectedNode;

/**
 * Parse the query string and return a valid PanelQueryStringState object.
 * if there is no data in the query string, return a default.
 * if the data in the query string cannot be validated as a PanelQueryStringState,
 * return null. In this case, consider using a 404-type experience.
 */
export const panelQueryStringState: (
  state: ResolverUIState
) => PanelQueryStringState | null = createSelector(
  (state: ResolverUIState) => state.urlSearch,
  (urlSearch: string | undefined): PanelQueryStringState | null => {
    const params = new URLSearchParams(urlSearch);
    const panelView = params.get('panelView');
    const panelNodeID = params.get('panelNodeID');
    const panelRelatedEventID = params.get('panelRelatedEventID');
    const panelEventCategory = params.get('panelEventCategory');

    if (
      panelView === null &&
      panelNodeID === null &&
      panelRelatedEventID === null &&
      panelEventCategory === null
    ) {
      // if there is no data, return the default
      return {
        panelView: 'node',
      };
    }

    if (panelView === 'node') {
      return {
        panelView,
        // URLSearchParams returns null if the value isn't present. The type excepts it to be optional. Therefore we use it if its a string and replace it w/ undefined otherwise.
        panelNodeID: panelNodeID === null ? undefined : panelNodeID,
      };
    } else if (panelView === 'nodeEvents') {
      if (panelNodeID === null) {
        // invalid
        return null;
      }
      // nodeEvents can take a panelRelatedEventID, a panelEventCategory, or neither. it cannot take both at the same time.
      if (panelRelatedEventID !== null && panelEventCategory !== null) {
        return null;
      } else if (panelEventCategory !== null) {
        return {
          panelView,
          panelNodeID,
          panelEventCategory,
        };
      } else if (panelRelatedEventID !== null) {
        return {
          panelView,
          panelNodeID,
          panelRelatedEventID,
        };
      } else {
        return {
          panelView,
          panelNodeID,
        };
      }
    } else {
      // invalid panel view, show 404
      return null;
    }
  }
);
