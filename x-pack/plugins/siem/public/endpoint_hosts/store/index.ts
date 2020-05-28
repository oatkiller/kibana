/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { hostListReducer } from './reducer';

export { hostListReducer } from './reducer';
export { HostAction } from './action';
export { hostMiddlewareFactory } from './middleware';

export interface EndpointHostsPluginState {
  hostList: ReturnType<typeof hostListReducer>;
}

export interface EndpointHostsPluginReducer {
  hostList: typeof hostListReducer;
}
