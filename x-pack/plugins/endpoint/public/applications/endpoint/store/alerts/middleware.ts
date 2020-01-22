/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { Middleware, Dispatch } from 'redux';
import { CoreStart } from 'kibana/public';
import { AlertData } from '../../../../../endpoint_app_types';
import { GlobalState } from '../reducer';
import { AppAction } from '../action';

export const alertMiddlewareFactory: (
  coreStart: CoreStart
) => Middleware<{}, GlobalState, Dispatch<AppAction>> = coreStart => {
  return store => next => async action => {
    next(action);
    if (action.type === 'appRequestedAlertsData') {
      const response: AlertData[] = await coreStart.http.get('/api/endpoint/alerts');
      store.dispatch({ type: 'serverReturnedAlertsData', payload: response });
    }
  };
};
