/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { combineReducers } from 'redux';
import { policyDetailsReducer } from '../pages/policy/store/policy_details/reducer';
import { policyListReducer } from '../pages/policy/store/policy_list/reducer';
import {
  MANAGEMENT_STORE_POLICY_DETAILS_NAMESPACE,
  MANAGEMENT_STORE_POLICY_LIST_NAMESPACE,
} from '../common/constants';
import { ImmutableCombineReducers } from '../../common/store';

// Change the type of `combineReducers` locally
const immutableCombineReducers: ImmutableCombineReducers = combineReducers;

export type ManagementState = ReturnType<typeof managementReducer>;

/**
 * Redux store reducer for the SIEM Management section
 */
export const managementReducer = immutableCombineReducers({
  [MANAGEMENT_STORE_POLICY_LIST_NAMESPACE]: policyListReducer,
  // @ts-ignore
  [MANAGEMENT_STORE_POLICY_DETAILS_NAMESPACE]: policyDetailsReducer,
});
