/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

/* eslint-disable no-duplicate-imports */

/* eslint-disable react/display-name */

import React, { useMemo, useEffect } from 'react';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import { I18nProvider } from '@kbn/i18n/react';
import { Provider } from 'react-redux';
import { Store } from 'redux';
import { mockDataAccessLayer } from '../data_access_layer/mock';
import { KibanaContextProvider } from '../../../../../../src/plugins/kibana_react/public';
import { coreMock } from '../../../../../../src/core/public/mocks';
import { CoreStart } from '../../../../../../src/core/public';
import { storeFactory } from '../store';
import { DataAccessLayer, ResolverState, SideEffectSimulator, ResolverProps } from '../types';
import { ResolverAction } from '../store/actions';
import { ResolverWithoutProviders } from './resolver_without_providers';
import { SideEffectContext } from './side_effect_context';
import { sideEffectSimulator } from './side_effect_simulator';

type BaseProps = {
  // core start and history can be optionally passed
  coreStart?: CoreStart;
  history?: React.ComponentProps<typeof Router>['history'];
  // If passed, set the raster width to this value. Defaults to 800
  rasterWidth?: number;
  // If passed, set the raster height to this value. Defaults to 800
  rasterHeight?: number;
  // All the props from `ResolverWithoutStore` can be optionally passed.
} & Partial<ResolverProps>;

type PropsWithDataAccessLayer = BaseProps & {
  dataAccessLayer: DataAccessLayer;
  // store mustn't be passed if dataAccessLayer is
  store?: undefined;
};

type PropsWithStore = BaseProps & {
  // data access layer mustn't be passed if store is
  dataAccessLayer?: undefined;
  store: Store<ResolverState, ResolverAction>;
};

/**
 * This must have either `store` or `dataAccessLayer` but not both.
 */
type MockResolverProps = PropsWithStore | PropsWithDataAccessLayer;

/**
 * This is a mock Resolver component. It has faked versions of various services:
 *  * fake i18n
 *  * fake (memory) history (optionally provided)
 *  * fake coreStart services (optionally provided)
 *
 *  You will either need to provide a store or a data access layer (which will be used to create a store.) See `mockDataAccessLayer` and `storeFactory`.
 *
 *  This provides the underlying Resolver component with default required props. You can pass these if you need to, they will be passed down.
 *  * `databaseDocumentID`
 *  * `resolverComponentInstanceID`
 *
 *  Use this in jest tests. Render it w/ `@testing-library/react` or `enzyme`. Then either interact with the result using fake events, or dispatch actions to the store. You could also pass in a store with initial data.
 *
 *  Note: You can't provide both a store and a data access layer, because the data access layer is just used to create the store.
 */
export const MockResolver = React.memo((props: MockResolverProps) => {
  // Get the data access layer from props, or create it if needed.
  const dataAccessLayer = useMemo(() => {
    return props.dataAccessLayer ?? mockDataAccessLayer();
  }, [props.dataAccessLayer]);

  // Get the coreStart services from props, or create them if needed.
  const coreStart: CoreStart = useMemo(() => props.coreStart ?? coreMock.createStart(), [
    props.coreStart,
  ]);

  // Get the history object from props, or create it if needed.
  const history = useMemo(() => props.history ?? createMemoryHistory(), [props.history]);

  // Get the store from props, or create it if needed.
  const store = useMemo(() => props.store ?? storeFactory(dataAccessLayer), [
    props.store,
    dataAccessLayer,
  ]);

  // TODO, take a simulator? set size based on props?
  // also have a way to take the mock so the test can use the simulator?
  const simulator: SideEffectSimulator = useMemo(() => sideEffectSimulator(), []);

  useEffect(() => {
    if (resolverElement) {
      const size: DOMRect = {
        width: props.rasterWidth ?? 1600,
        height: props.rasterHeight ?? 1200,
        x: 0,
        y: 0,
      };
      simulator.controls.simulateElementResize(resolverElement, size);
    }
  }, []);

  return (
    <I18nProvider>
      <Router history={history}>
        <KibanaContextProvider services={coreStart}>
          <SideEffectContext.Provider value={simulator.mock}>
            <Provider store={store}>
              <ResolverWithoutProviders
                databaseDocumentID={props.databaseDocumentID ?? 'id'}
                resolverComponentInstanceID={props.resolverComponentInstanceID ?? 'instanceID'}
              />
            </Provider>
          </SideEffectContext.Provider>
        </KibanaContextProvider>
      </Router>
    </I18nProvider>
  );
});
