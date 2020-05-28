/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { shallow } from 'enzyme';
import React from 'react';
import { Provider } from 'react-redux';

import { apolloClientObservable, mockGlobalState, SUB_PLUGINS_REDUCER } from '../../mock';
import { createStore, SecurityAppStore } from '../../store/store';

import { ErrorToastDispatcher } from '.';

describe('Error Toast Dispatcher', () => {
  let store: SecurityAppStore;

  beforeEach(() => {
    store = createStore(mockGlobalState, SUB_PLUGINS_REDUCER, apolloClientObservable);
  });

  describe('rendering', () => {
    test('it renders', () => {
      const wrapper = shallow(
        <Provider store={store}>
          <ErrorToastDispatcher toastLifeTimeMs={9999999999} />
        </Provider>
      );
      expect(wrapper.find('Connect(ErrorToastDispatcherComponent)')).toMatchSnapshot();
    });
  });
});
