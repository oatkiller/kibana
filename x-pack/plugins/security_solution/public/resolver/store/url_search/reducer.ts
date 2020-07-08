/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { UrlSearchState } from '../../types';
import { ResolverAction } from '../actions';

// almost like a real reducer, accept it can't accept undefined for S.
// TODO, before you merge: is this abstraction even needed? if we're only using this in dataReducer, simplify first
export function urlSearchReducer<S extends UrlSearchState>(state: S, action: ResolverAction): S {
  if (action.type === 'appReceivedNewExternalProperties') {
    // keep a copy of the url search in order to determine what is selected.
    return {
      ...state,
      urlSearch: action.payload.urlSearch,
    };
  }
  return state;
}
