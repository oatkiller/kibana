/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

/* eslint-disable no-duplicate-imports */

import { Dispatch, MiddlewareAPI } from 'redux';
import { ResolverRelatedEvents } from '../../../../common/endpoint/types';

import { KibanaReactContextValue } from '../../../../../../../src/plugins/kibana_react/public';
import { ResolverState } from '../../types';
import * as selectors from '../selectors';
import { StartServices } from '../../../types';
import { ResolverAction } from '../actions';
import { isAbortError } from './is_abort_error';

/**
 * Fetch related events as needed based on the panel query string state.
 */
// TODO, dont use abort controller. fire and forget
// TODO, in state, keep a list of entityIDs we need related events for. its append-only
// add to the list whenever panelNodeID changes or when 'userOpenedRelatedEventDropdown' is dispatched
// this fetcher becomes a for-loop like 'for (const entityIDToFetchRelatedEventsFor of selector)`
// the selector gets entity ids in the list (of ones we need related events for) that haven't already had a request started
// state will also need a list of entity IDs we've started a request for so it can efficiently keep track of what we need to request. wait, it does that already w/ relatedWhatever = false. so presence in that set should be enough
export function RelatedEventFetcher(
  context: KibanaReactContextValue<StartServices>,
  api: MiddlewareAPI<Dispatch<ResolverAction>, ResolverState>
): () => void {
  // Call this after each state change.
  return async () => {
    const state = api.getState();
    const entityIDsToFetchRelatedEventsFor: ReadonlySet<string> = selectors.entityIDsToFetchRelatedEventsFor(
      state
    );

    // in practice, there will only ever be 0 or 1 values in the set because each action that
    // would add something only adds 1 thing
    for (const entityID of entityIDsToFetchRelatedEventsFor) {
      // fork here for good measure anyway
      (async () => {
        let result: ResolverRelatedEvents | undefined;
        api.dispatch({
          type: 'appRequestedRelatedEventData',
          payload: entityID,
        });
        try {
          result = await context.services.http.get(`/api/endpoint/resolver/${entityID}/events`, {
            query: { events: 100 },
          });
        } catch (error) {
          if (!isAbortError(error)) {
            api.dispatch({
              type: 'serverFailedToReturnRelatedEventData',
              payload: entityID,
            });
          }
        }
        if (result !== undefined) {
          api.dispatch({
            type: 'serverReturnedRelatedEventData',
            payload: {
              response: result,
              entityID,
            },
          });
        }
      })();
    }
  };
}
