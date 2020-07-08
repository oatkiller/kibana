/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { createSelector } from 'reselect';
import { UrlSearchState, PanelQueryStringState } from '../../types';

/**
 * Parse the query string and return a valid PanelQueryStringState object.
 * if there is no data in the query string, return a default.
 * if the data in the query string cannot be validated as a PanelQueryStringState,
 * return null. In this case, consider using a 404-type experience.
 */
export const panelQueryStringState: (
  state: UrlSearchState
) => PanelQueryStringState | null = createSelector(
  (state: UrlSearchState) => state.urlSearch,
  (urlSearch: string | undefined): PanelQueryStringState | null => {
    const params = new URLSearchParams(urlSearch);
    const panelViewValue = params.get('panelView');
    const panelNodeIDValue = params.get('panelNodeID');
    const panelRelatedEventIDValue = params.get('panelRelatedEventID');
    const panelEventCategoryValue = params.get('panelEventCategory');

    if (
      panelViewValue === null &&
      panelNodeIDValue === null &&
      panelRelatedEventIDValue === null &&
      panelEventCategoryValue === null
    ) {
      // if there is no data, return the default
      return {
        panelView: 'node',
      };
    }

    if (panelViewValue === 'node') {
      return {
        panelView: panelViewValue,
        // URLSearchParams returns null if the value isn't present. The type excepts it to be optional. Therefore we use it if its a string and replace it w/ undefined otherwise.
        panelNodeID: panelNodeIDValue === null ? undefined : panelNodeIDValue,
      };
    } else if (panelViewValue === 'nodeEvents') {
      if (panelNodeIDValue === null) {
        // invalid
        return null;
      }
      // nodeEvents can take a panelRelatedEventID, a panelEventCategory, or neither. it cannot take both at the same time.
      if (panelRelatedEventIDValue !== null && panelEventCategoryValue !== null) {
        return null;
      } else if (panelEventCategoryValue !== null) {
        return {
          panelView: panelViewValue,
          panelNodeID: panelNodeIDValue,
          panelEventCategory: panelEventCategoryValue,
        };
      } else if (panelRelatedEventIDValue !== null) {
        return {
          panelView: panelViewValue,
          panelNodeID: panelNodeIDValue,
          panelRelatedEventID: panelRelatedEventIDValue,
        };
      } else {
        return {
          panelView: panelViewValue,
          panelNodeID: panelNodeIDValue,
        };
      }
    } else {
      // invalid panel view, show 404
      return null;
    }
  }
);

export const panelNodeID = createSelector(panelQueryStringState, function (
  panelState
): string | undefined {
  return panelState?.panelNodeID;
});

export const panelRelatedEventID = createSelector(panelQueryStringState, function (
  panelState
): string | undefined {
  return panelState && 'panelRelatedEventID' in panelState
    ? panelState.panelRelatedEventID
    : undefined;
});

export function panelEventCategory(state: UrlSearchState): string | undefined {
  const queryStringState = panelQueryStringState(state);
  if (queryStringState === null) {
    return undefined;
  }
  if ('panelEventCategory' in queryStringState) {
    return queryStringState.panelEventCategory;
  }
}
