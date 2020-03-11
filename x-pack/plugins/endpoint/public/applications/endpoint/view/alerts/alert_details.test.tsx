/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React from 'react';
import * as reactTestingLibrary from '@testing-library/react';
import { Provider } from 'react-redux';
import { I18nProvider } from '@kbn/i18n/react';
import { AlertIndex } from './index';
import { appStoreFactory } from '../../store';
import { coreMock } from 'src/core/public/mocks';
import { KibanaContextProvider } from '../../../../../../../../src/plugins/kibana_react/public';
import { fireEvent } from '@testing-library/react';
import { RouteCapture } from '../route_capture';
import { createMemoryHistory, MemoryHistory } from 'history';
import { Router } from 'react-router-dom';
import { AppAction } from '../../types';
import { mockAlertResultList } from '../../store/alerts/mock_alert_result_list';

describe('when the alert details flyout is open', () => {
  let render: () => reactTestingLibrary.RenderResult;
  let history: MemoryHistory<never>;
  let store: ReturnType<typeof appStoreFactory>;

  beforeEach(async () => {
    /**
     * Create a 'history' instance that is only in-memory and causes no side effects to the testing environment.
     */
    history = createMemoryHistory<never>();
    /**
     * Create a store, with the middleware disabled. We don't want side effects being created by our code in this test.
     */
    store = appStoreFactory(coreMock.createStart(), true);

    /**
     * Render the test component, use this after setting up anything in `beforeEach`.
     */
    render = () => {
      /**
       * Provide the store via `Provider`, and i18n APIs via `I18nProvider`.
       * Use react-router via `Router`, passing our in-memory `history` instance.
       * Use `RouteCapture` to emit url-change actions when the URL is changed.
       * Finally, render the `AlertIndex` component which we are testing.
       */
      return reactTestingLibrary.render(
        <Provider store={store}>
          <KibanaContextProvider services={undefined}>
            <I18nProvider>
              <Router history={history}>
                <RouteCapture>
                  <AlertIndex />
                </RouteCapture>
              </Router>
            </I18nProvider>
          </KibanaContextProvider>
        </Provider>
      );
    };
  });
  describe('when the details overview tab is open', () => {
    beforeEach(() => {
      reactTestingLibrary.act(() => {
        history.push({
          ...history.location,
          search: '?selected_alert=1',
        });
      });
    });
    describe('when the data loads', () => {
      beforeEach(() => {
        reactTestingLibrary.act(() => {
          const action: AppAction = {
            type: 'serverReturnedAlertDetailsData',
            payload: mockAlertResultList().alerts[0],
          };
          store.dispatch(action);
        });
      });
      it('should display take action button', async () => {
        await render().findByTestId('alertListTakeActionDropdownButton');
      });
      describe('when the user clicks the take action button on the flyout', () => {
        let renderResult: reactTestingLibrary.RenderResult;
        beforeEach(async () => {
          renderResult = render();
          const takeActionButton = await renderResult.findByTestId(
            'alertListTakeActionDropdownButton'
          );
          if (takeActionButton) {
            fireEvent.click(takeActionButton);
          }
        });
        it('should display the correct fields in the dropdown', () => {});
      });
    });
  });
});
