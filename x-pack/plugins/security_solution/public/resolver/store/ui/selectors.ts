/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

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
// TODO, this should probably use the url?
export const selectedNode: (state: ResolverUIState) => string | null = (state) =>
  state.selectedNode;
