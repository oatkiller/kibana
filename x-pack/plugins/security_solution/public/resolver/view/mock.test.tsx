/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React from 'react';
import { mount } from 'enzyme';
import { mockDataAccessLayer } from '../data_access_layer/mock';
import { MockResolver } from './mock';
import { storeFactory } from '../store';
import * as selectors from '../store/selectors';
import { untilTrue } from '../test_utilities/state_transitioned';
import { ResolverState } from '../types';

describe('MockResolver', () => {
  it('should be renderable with a store', async () => {
    const store = storeFactory(mockDataAccessLayer());

    // there is no selected node.
    expect(selectors.selectedNode(store.getState())).toBe(null);
    const wrapper = mount(<MockResolver store={store} />);

    store.subscribe(() => {
      // update the enzyme wrapper after each state transition
      return wrapper.update();
    });

    // update it right away incase a state transition happened already
    // TODO is this needed? prove it
    wrapper.update();

    // there is no selected node
    expect(wrapper.find('[aria-selected]').length).toBe(0);

    // there are 3 nodes
    expect(wrapper.find('[data-test-subj="resolverNode"]').length).toBe(3);

    // find one of the buttons?
    wrapper.find('[data-test-subj="resolverNode"] button');

    // click it
    wrapper.simulate('click');

    // wait until the store has a selected node
    await untilTrue(store, (state: ResolverState) => selectors.selectedNode(state) === 'a');

    // there should be a selected node in the DOM
    expect(wrapper.find('[aria-selected]').length).toBe(1);
  });
});
