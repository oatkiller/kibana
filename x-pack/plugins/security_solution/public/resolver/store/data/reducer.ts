/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { Reducer } from 'redux';
import { DataState } from '../../types';
import { ResolverAction } from '../actions';
import { urlSearchReducer } from '../url_search/reducer';
import * as urlSearchSelectors from '../url_search/selectors';
import { composeReducers } from '../compose_reducers';

const initialState: DataState = {
  entityIDsRequiringRelatedEvents: new Set(),
  relatedEvents: new Map(),
  relatedEventsRequestStatus: new Map(),
};

export const dataReducer: Reducer<DataState, ResolverAction> = composeReducers(
  // provide initial state
  (state = initialState) => state,
  // put urlSearch into state so we can determine what the panel is showing.
  (state: DataState, action: ResolverAction) => urlSearchReducer(state, action),
  (state: DataState) => {
    // the panelNode ID always needs to be in the `entityIDsRequiringRelatedEvents` set. we need the related events
    // for any entity ID shown in the panel.
    const panelNodeID = urlSearchSelectors.panelNodeID(state);

    // if there is no entity ID showing in the panel, or if the one showing in the panel is already in the set, return
    if (panelNodeID === undefined || state.entityIDsRequiringRelatedEvents.has(panelNodeID)) {
      return state;
    }

    // add the panelNodeID to `entityIDsRequiringRelatedEvents` so the middleware will fetch it.
    return {
      ...state,
      entityIDsRequiringRelatedEvents: new Set([
        ...state.entityIDsRequiringRelatedEvents,
        panelNodeID,
      ]),
    };
  },
  (state = initialState, action) => {
    if (action.type === 'userOpenedRelatedEventDropdown') {
      // when the user opens the dropdown that shows related events, we need to request related events for
      // that entity ID.
      // adding the entity ID to `entityIDsRequiringRelatedEvents` will cause the middleware to fetch them
      // unless a request was already started (at any point) for that entity ID.
      // we only try once.
      return {
        ...state,
        entityIDsRequiringRelatedEvents: new Set([
          ...state.entityIDsRequiringRelatedEvents,
          action.payload,
        ]),
      };
    } else if (action.type === 'appReceivedNewExternalProperties') {
      const nextState: DataState = {
        ...state,
        databaseDocumentID: action.payload.databaseDocumentID,
      };
      return nextState;
    } else if (action.type === 'appRequestedResolverData') {
      // keep track of what we're requesting, this way we know when to request and when not to.
      return {
        ...state,
        pendingRequestDatabaseDocumentID: action.payload,
      };
    } else if (action.type === 'appAbortedResolverDataRequest') {
      if (action.payload === state.pendingRequestDatabaseDocumentID) {
        // the request we were awaiting was aborted
        return {
          ...state,
          pendingRequestDatabaseDocumentID: undefined,
        };
      } else {
        return state;
      }
    } else if (action.type === 'serverReturnedResolverData') {
      /** Only handle this if we are expecting a response */
      const nextState: DataState = {
        ...state,

        /**
         * Store the last received data, as well as the databaseDocumentID it relates to.
         */
        lastResponse: {
          result: action.payload.result,
          databaseDocumentID: action.payload.databaseDocumentID,
          successful: true,
        },

        // This assumes that if we just received something, there is no longer a pending request.
        // This cannot model multiple in-flight requests
        pendingRequestDatabaseDocumentID: undefined,
      };
      return nextState;
    } else if (action.type === 'serverFailedToReturnResolverData') {
      /** Only handle this if we are expecting a response */
      if (state.pendingRequestDatabaseDocumentID !== undefined) {
        const nextState: DataState = {
          ...state,
          pendingRequestDatabaseDocumentID: undefined,
          lastResponse: {
            databaseDocumentID: state.pendingRequestDatabaseDocumentID,
            successful: false,
          },
        };
        return nextState;
      } else {
        return state;
      }
    } else if (action.type === 'appRequestedRelatedEventData') {
      return {
        ...state,
        relatedEventsRequestStatus: new Map([
          ...state.relatedEventsRequestStatus,
          [action.payload, false],
        ]),
      };
    } else if (action.type === 'serverReturnedRelatedEventData') {
      return {
        ...state,
        relatedEventsRequestStatus: new Map([
          ...state.relatedEventsRequestStatus,
          [action.payload.entityID, true],
        ]),

        relatedEvents: new Map([
          ...state.relatedEvents,
          [action.payload.entityID, action.payload.response],
        ]),
      };
    } else if (action.type === 'serverFailedToReturnRelatedEventData') {
      // TODO, ui handle this.
      return {
        ...state,
        relatedEventsRequestStatus: new Map([
          ...state.relatedEventsRequestStatus,
          [action.payload, true],
        ]),
      };
    } else {
      return state;
    }
  }
);
