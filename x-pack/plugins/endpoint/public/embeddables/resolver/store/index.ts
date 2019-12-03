/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { createStore } from 'redux';
import { resolverReducer } from './reducer';

export const storeFactory = () => {
  const store = createStore(resolverReducer, undefined);
  return {
    store,
  };
};
