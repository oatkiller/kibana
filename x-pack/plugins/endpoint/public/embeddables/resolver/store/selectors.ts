/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { ResolverState, CameraState, DataState } from '../types';

/**
 * Where to get CameraState
 */
export function camera(state: ResolverState): CameraState {
  return state.camera;
}

export function data(state: ResolverState): DataState {
  return state.data;
}
