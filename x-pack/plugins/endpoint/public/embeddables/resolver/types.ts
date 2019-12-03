/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */
export interface ResolverState {
  camera: CameraState;
}

export { ResolverAction } from './actions';

export interface CameraState {
  readonly zoomLevel: number;
  readonly panningOffset: Vector2;
  readonly rasterSize: Vector2;
}

export type Vector2 = readonly [number, number];
