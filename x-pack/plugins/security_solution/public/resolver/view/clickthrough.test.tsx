/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

/* eslint-disable import/no-nodejs-modules */

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
import { PerformanceObserver, performance } from 'perf_hooks';

const baseResolverSelector = '[data-test-subj="resolver:node"]';

function resolverNodeSelector({
  entityID,
  selected = false,
}: { entityID?: string; selected?: boolean } = {}): string {
  let selector: string = baseResolverSelector;
  if (entityID !== undefined) {
    selector += `[data-test-resolver-node-id="${entityID}"]`;
  }
  if (selected) {
    selector += '[aria-selected="true"]';
  }
  return selector;
}

describe('with perf', () => {
  let obs: PerformanceObserver;
  beforeEach(() => {
    obs = new PerformanceObserver((list) => {
      console.log('list', list);
      for (const entry of list.getEntries()) {
        console.log('entry', entry);
      }
    });
    obs.observe({ entryTypes: ['function'] });
  });
  afterEach(() => {
    obs.disconnect();
  });
  fdescribe('Resolver, when analyzing a tree that has 1 ancestor and 2 children', () => {
    let store: Store<ResolverState, ResolverAction>;
    let wrapper: ReactWrapper;
    let _debugActions: () => () => void;
    beforeEach(
      performance.timerify(async function beforeEach() {
        const spyMiddleware = spyMiddlewareFactory();

        _debugActions = spyMiddleware.debugActions;

        const middlewareEnhancer = applyMiddleware(
          resolverMiddlewareFactory(mockDataAccessLayer()),
          spyMiddleware.middleware
        );

        store = createStore(resolverReducer, middlewareEnhancer);

        // Render Resolver via the `MockResolver` component, using `enzyme`.
        wrapper = mount(<MockResolver store={store} />);

        // Update the enzyme wrapper after each state transition
        connectEnzymeWrapperAndStore(store, wrapper);

        // wait for 3 nodes to show up.
        await untilTrue(store, () => wrapper.find(resolverNodeSelector()).length === 3);
      })
    );
    // Combining assertions here for performance. Unfortunately, Enzyme + jsdom + React is slow.
    fit(
      `should have 3 nodes, with the entityID's 'origin', 'firstChild', and 'secondChild'. 'origin' should be selected.`,
      performance.timerify(async function expectation() {
        // there is no selected node
        expect(
          wrapper.find(resolverNodeSelector({ entityID: 'origin', selected: true })).length
        ).toBe(1);
        expect(wrapper.find(resolverNodeSelector({ entityID: 'firstChild' })).length).toBe(1);
        expect(wrapper.find(resolverNodeSelector({ entityID: 'secondChild' })).length).toBe(1);
      })
    );

    xdescribe('when the second child node has been selected', () => {
      beforeEach(
        performance.timerify(() => {
          const button = wrapper.find(
            `${resolverNodeSelector({ entityID: 'secondChild' })} button`
          );

          // click it
          button.simulate('click');
        })
      );
      it(
        'should render the second child node as selected, and the first child not as not selected.',
        performance.timerify(async () => {
          await untilTrue(store, () => {
            const secondChildIsSelected =
              wrapper.find(resolverNodeSelector({ entityID: 'secondChild', selected: true }))
                .length === 1;

            // Find the origin, then exclude it if it is selected
            const originIsNotSelected =
              wrapper
                .find(resolverNodeSelector({ entityID: 'origin' }))
                // TODO, this is weird
                .not(resolverNodeSelector({ entityID: 'origin', selected: true })).length === 1;

            return secondChildIsSelected && originIsNotSelected;
          });
        })
      );
    });
  });
});
