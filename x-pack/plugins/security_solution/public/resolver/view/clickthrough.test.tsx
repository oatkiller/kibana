/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React from 'react';
import { mount, ReactWrapper } from 'enzyme';
import { mockDataAccessLayer } from '../data_access_layer/mock';
import { MockResolver } from './mock';
import { untilTrue } from '../test_utilities/state_transitioned';
import { ResolverState } from '../types';
import { connectEnzymeWrapperAndStore } from '../test_utilities/connect_enzyme_wrapper_and_store';
import { Store, createStore, applyMiddleware } from 'redux';
import { ResolverAction } from '../store/actions';
import { spyMiddlewareFactory } from '../test_utilities/spy_middleware';
import { resolverMiddlewareFactory } from '../store/middleware';
import { resolverReducer } from '../store/reducer';

function resolverNodeSelector(entityID?: string): string {
  if (entityID === undefined) {
    return '[data-test-subj^="resolver:node:"]';
  } else {
    return `[data-test-subj="${entityID}"]`;
  }
}

describe('Resolver, when analyzing a tree that has 1 ancestor and 2 children', () => {
  let store: Store<ResolverState, ResolverAction>;
  let wrapper: ReactWrapper;
  let actions: () => AsyncGenerator<{ action: ResolverAction; state: ResolverState }>;
  beforeEach(async () => {
    const spyMiddleware = spyMiddlewareFactory();

    const middlewareEnhancer = applyMiddleware(
      resolverMiddlewareFactory(mockDataAccessLayer()),
      spyMiddleware.middleware
    );

    actions = spyMiddleware.actions;

    store = createStore(resolverReducer, middlewareEnhancer);

    // Render Resolver via the `MockResolver` component, using `enzyme`.
    wrapper = mount(<MockResolver store={store} />);

    // Update the enzyme wrapper after each state transition
    connectEnzymeWrapperAndStore(store, wrapper);

    // wait for 3 nodes to show up.
    await untilTrue(store, () => wrapper.find(resolverNodeSelector()).length === 3);
  });
  // Combining assertions here for performance. Unfortunately, Enzyme + jsdom + React is slow.
  it('should have 3 nodes, one of which is selected.', async () => {
    // there is no selected node
    expect(wrapper.find(`${resolverNodeSelector()}[aria-selected]`).length).toBe(1);
  });

  // TODO, select a different node?
  describe('when the first node has been selected', () => {
    beforeEach(() => {
      // TODO, we need a way to get from the `mockDataAccessLayer` to the related nodes.
      // find the first button (DOM order.)
      wrapper.find(`${resolverNodeSelector()} button`);

      (async () => {
        for await (const action of actions()) {
          // TODO, why is this setting a raster size of 0, 0?
          console.log('action', action);
        }
      })();

      // click it
      wrapper.simulate('click');
    });
    it('should render the first node with `[aria-selected]`.', async (done) => {
      await untilTrue(
        store,
        // TODO, the selector should take an entity-id perhaps?
        () => {
          return wrapper.find(`${resolverNodeSelector()}[aria-selected]`).length === 1;
        }
      );
      done();
    });
  });
});
