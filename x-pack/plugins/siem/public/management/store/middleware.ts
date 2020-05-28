/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import {
  substateMiddlewareFactory,
  SecuritySubPluginMiddlewareFactory,
  State,
} from '../../common/store';
import { policyListMiddlewareFactory } from '../pages/policy/store/policy_list';
import { policyDetailsMiddlewareFactory } from '../pages/policy/store/policy_details';
import { PolicyListState, PolicyDetailsState } from '../pages/policy/types';

export const managementMiddlewareFactory: SecuritySubPluginMiddlewareFactory = (
  coreStart,
  depsStart
) => {
  const listSelector: (state: State) => PolicyListState = state =>
    state.management.policyList as PolicyListState;
  const detailSelector: (state: State) => PolicyDetailsState = state =>
    state.management.policyDetails as PolicyDetailsState;

  return [
    substateMiddlewareFactory(listSelector, policyListMiddlewareFactory(coreStart, depsStart)),
    substateMiddlewareFactory(detailSelector, policyDetailsMiddlewareFactory(coreStart, depsStart)),
  ];
};
