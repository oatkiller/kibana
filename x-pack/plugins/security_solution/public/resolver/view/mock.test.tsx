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
import { connectEnzymeWrapperAndStore } from '../test_utilities/connect_enzyme_wrapper_and_store';

describe('MockResolver', () => {
  it('should be renderable with a store', async () => {
    const store = storeFactory(mockDataAccessLayer());

    // there is no selected node.
    expect(selectors.selectedNode(store.getState())).toBe(null);

    const wrapper = mount(<MockResolver store={store} />);
    connectEnzymeWrapperAndStore(store, wrapper);

    // there is no selected node
    expect(wrapper.find('[aria-selected]').length).toBe(0);

    // there should be 3 nodes
    await untilTrue(store, () => wrapper.find('[data-test-subj="resolverNode"]').length === 3);

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
