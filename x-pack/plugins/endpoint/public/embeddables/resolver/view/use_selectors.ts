/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */
import { useSelector } from 'react-redux';
import { camera, data } from '../store/selectors';
import { CameraState, ResolverState, DataState } from '../types';

/**
 * Return the state for the `camera` concern. Use with `ResolverState` to get `CameraState`.
 */
export function useCameraSelector<TSelected>(selector: (state: CameraState) => TSelected) {
  return useSelector(function(state: ResolverState) {
    return selector(camera(state));
  });
}

/**
 * Return the state for the `data` concern. Use with `ResolverState` to get `DataState`.
 */
export function useDataSelector<TSelected>(selector: (state: DataState) => TSelected) {
  return useSelector(function(state: ResolverState) {
    return selector(data(state));
  });
}
