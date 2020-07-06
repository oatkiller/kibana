/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

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

function urlSearchParams(state: ResolverUIState): URLSearchParams {
  return new URLSearchParams(state.urlSearch);
}

const panelViewNames: ReadonlySet<PanelQueryStringState['panelView']> = new Set([
  'processListWithCounts',
  'processDetail',
  'eventCountsForProcess',
  'relatedEventDetail',
  'processEventListNarrowedByType',
]);

function isPanelViewName(name: string): name is PanelQueryStringState['panelView'] {
  return (panelViewNames as ReadonlySet<string>).has(name);
}

/**
 * The 'view' shown by the panel. If nothing is found in the query string, default to 'processListWithCounts'.
 */
export function panelViewName(state: ResolverUIState): PanelQueryStringState['panelView'] | null {
  const value = urlSearchParams(state).get('panelView');
  const defaultPanelViewName = 'processListWithCounts';

  // if the value isn't specified, return the default
  if (value === null) {
    return defaultPanelViewName;
  } else if (isPanelViewName(value)) {
    return value;
  } else {
    // if the value is specified, but not valid, return null
    return null;
  }
}

export function panelNodeID(state: ResolverUIState): string | null {
  return urlSearchParams(state).get('panelNodeID');
}

export function panelRelatedEventID(state: ResolverUIState): string | null {
  return urlSearchParams(state).get('panelRelatedEventID');
}

export function panelEventCategory(state: ResolverUIState): string | null {
  return urlSearchParams(state).get('panelEventCategory');
}
