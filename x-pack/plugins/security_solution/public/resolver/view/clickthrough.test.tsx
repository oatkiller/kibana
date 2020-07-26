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
import { createMemoryHistory, History as HistoryPackageHistoryInterface } from 'history';
import { queryStringValues } from '../test_utilities/query_string_state';

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

describe('Resolver, when analyzing a tree that has 1 ancestor and 2 children', () => {
  // the store, used to subscribe to state transitions. State transisions cause enzyme to update the DOM. Also, we listen for state transitions to iterate the state of the test runner (via `await` functions.)
  let store: Store<ResolverState, ResolverAction>;

  // The DOM dominator
  let wrapper: ReactWrapper;

  // a function that prints what actions have been dispatched
  let _debugActions: () => () => void;

  // The 'history' simulator, which is used to check the query string values
  let history: HistoryPackageHistoryInterface = createMemoryHistory();

  // various entity IDs, with semantic meaning
  const originID = 'origin';
  const firstChildID = 'firstChild';
  const secondChildID = 'secondChild';

  // the resolver component instance ID, used by the react code to distinguish piece of global state from those used by other resolver instances
  const resolverComponentInstanceID = 'resolverComponentInstanceID';

  // these are all specific to process nodes. not all code will be this way tho. how to group? TODO
  function renderedNodes(): ReactWrapper {
    return wrapper.find(resolverNodeSelector());
  }

  function nodeIsRendered(entityID: string): boolean {
    return wrapper.find(resolverNodeSelector({ entityID })).length === 1;
  }

  function queryStringIndicatesThatNodeIsSelected(entityID: string): boolean {
    const { selectedNode: selectedNodeValues } = queryStringValues(
      history,
      resolverComponentInstanceID
    );
    return selectedNodeValues.length === 1 && selectedNodeValues[0] === entityID;
  }

  function nodeIsRenderedAsSelected(entityID: string): boolean {
    const element = wrapper.find(resolverNodeSelector({ entityID, selected: true }));
    return element.length === 1;
  }

  function nodeIsRenderedButNotSelected(entityID: string): boolean {
    const element = wrapper.find(resolverNodeSelector({ entityID }));

    // guard because `is` only works on single node wrappers and throws
    if (element.length !== 1) {
      return false;
    }

    // true if the wrapper doesn't match the 'selected' selector
    return element.is(resolverNodeSelector({ entityID, selected: true })) === false;
  }

  function nodeButton(entityID: string): ReactWrapper {
    return wrapper.find(`${resolverNodeSelector({ entityID })} button`);
  }

  beforeEach(async () => {
    const spyMiddleware = spyMiddlewareFactory();

    _debugActions = spyMiddleware.debugActions;

    const middlewareEnhancer = applyMiddleware(
      resolverMiddlewareFactory(
        // TODO, add 2 ancestors and a 2nd level child
        mockDataAccessLayer({
          originID,
          firstChildID,
          secondChildID,
        })
      ),
      spyMiddleware.middleware
    );

    store = createStore(resolverReducer, middlewareEnhancer);

    history = createMemoryHistory();

    // Render Resolver via the `MockResolver` component, using `enzyme`.
    wrapper = mount(
      <MockResolver
        resolverComponentInstanceID={resolverComponentInstanceID}
        history={history}
        store={store}
      />
    );

    // Update the enzyme wrapper after each state transition
    connectEnzymeWrapperAndStore(store, wrapper);

    // TODO, this isn't right, test loading
    // wait for 3 nodes to show up.
    await untilTrue(store, () => wrapper.find(resolverNodeSelector()).length === 3);
  });
  // Combining assertions here for performance. Unfortunately, Enzyme + jsdom + React is slow.
  it(`should have 3 nodes, with the entityID's 'origin', 'firstChild', and 'secondChild'. 'origin' should be selected.`, async () => {
    expect(nodeIsRenderedAsSelected(originID)).toBe(true);

    expect(nodeIsRendered(firstChildID)).toBe(true);
    expect(nodeIsRendered(secondChildID)).toBe(true);

    expect(renderedNodes().length).toBe(3);
  });

  describe('when the second child node has been selected', () => {
    beforeEach(() => {
      nodeButton(secondChildID).simulate('click');
    });
    it('should render the second child node as selected, and the first child not as not selected, and the query string should indicate that the second child is selected', async () => {
      // TODO, can we optimize this loop?
      await untilTrue(store, () => {
        return (
          // the query string has a key showing that the second child is selected
          queryStringIndicatesThatNodeIsSelected(secondChildID) &&
          // the second child is rendered in the DOM, and shows up as selected
          nodeIsRenderedAsSelected(secondChildID) &&
          // the origin is in the DOM, but shows up as unselected
          nodeIsRenderedButNotSelected(originID)
        );
      });
    });
  });
});
