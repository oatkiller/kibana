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
export function RelatedEventFetcher(
  context: KibanaReactContextValue<StartServices>,
  api: MiddlewareAPI<Dispatch<ResolverAction>, ResolverState>
): () => void {
  let lastRequestMetadata: { abortController: AbortController; entityID: string } | undefined;
  // Call this after each state change.
  return async () => {
    const state = api.getState();
    const entityIDToFetchRelatedEventsFor: string | undefined = selectors.panelNodeID(state);

    // if there is a request in progress for an entity ID other than the current one, abort it.
    if (lastRequestMetadata && lastRequestMetadata.entityID !== entityIDToFetchRelatedEventsFor) {
      // calling abort will cause an action to be fired
      lastRequestMetadata.abortController.abort();
      lastRequestMetadata = undefined;
    }

    // there is an entity ID to fetch events for and
    // the last request was aborted or there never was a request
    if (entityIDToFetchRelatedEventsFor !== undefined && !lastRequestMetadata) {
      lastRequestMetadata = {
        abortController: new AbortController(),
        entityID: entityIDToFetchRelatedEventsFor,
      };
      let result: ResolverRelatedEvents | undefined;
      try {
        result = await context.services.http.get(
          `/api/endpoint/resolver/${entityIDToFetchRelatedEventsFor}/events`,
          {
            query: { events: 100 },
          }
        );
      } catch (error) {
        if (!isAbortError(error)) {
          api.dispatch({
            type: 'serverFailedToReturnRelatedEventData',
            payload: entityIDToFetchRelatedEventsFor,
          });
        }
      }
      if (result !== undefined) {
        api.dispatch({
          type: 'serverReturnedRelatedEventData',
          payload: {
            response: result,
            entityID: entityIDToFetchRelatedEventsFor,
          },
        });
      }
    }
  };
}
