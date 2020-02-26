/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import * as React from 'react';
import ReactDOM from 'react-dom';
import { CoreStart, AppMountParameters } from 'kibana/public';
import { I18nProvider, FormattedMessage } from '@kbn/i18n/react';
import { Route, Switch, BrowserRouter, NavLink } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Store } from 'redux';
import { RouteCapture } from './view/route_capture';
import { appStoreFactory } from './store';
import { AlertIndex } from './view/alerts';
import { ManagementList } from './view/managing';
import { PolicyList } from './view/policy';

/**
 * This module will be loaded asynchronously to reduce the bundle size of your plugin's main bundle.
 */
export function renderApp(coreStart: CoreStart, { appBasePath, element }: AppMountParameters) {
  coreStart.http.get('/api/endpoint/hello-world');
  const store = appStoreFactory(coreStart);

  ReactDOM.render(<AppRoot basename={appBasePath} store={store} />, element);

  return () => {
    ReactDOM.unmountComponentAtNode(element);
  };
}

interface RouterProps {
  basename: string;
  store: Store;
}

interface NavTabs {
  name: string;
  display: string;
  exact: boolean;
  to: string;
}
const navTabs: NavTabs[] = [
  {
    name: 'home',
    display: 'Home',
    exact: true,
    to: '/',
  },
  {
    name: 'management',
    display: 'Management',
    exact: false,
    to: '/management',
  },
  {
    name: 'alerts',
    display: 'Alerts',
    exact: false,
    to: '/alerts',
  },
  {
    name: 'policies',
    display: 'Policies',
    exact: false,
    to: '/policy',
  },
];

function renderNavTabs(tabs: NavTabs[]) {
  return tabs.map((tab, index) => {
    return (
      <NavLink
        data-testid={`${tab.name}Link`}
        exact={tab.exact}
        to={tab.to}
        key={index}
        className="euiTab"
        activeClassName="euiTab-isSelected"
      >
        <span className="euiTab__content">{tab.display}</span>
      </NavLink>
    );
  });
}

const AppRoot: React.FunctionComponent<RouterProps> = React.memo(({ basename, store }) => (
  <Provider store={store}>
    <I18nProvider>
      <BrowserRouter basename={basename}>
        <div className="euiTabs">{renderNavTabs(navTabs)}</div>
        <RouteCapture>
          <Switch>
            <Route
              exact
              path="/"
              render={() => (
                <h1 data-test-subj="welcomeTitle">
                  <FormattedMessage id="xpack.endpoint.welcomeTitle" defaultMessage="Hello World" />
                </h1>
              )}
            />
            <Route path="/management" component={ManagementList} />
            <Route path="/alerts" render={() => <AlertIndex />} />
            <Route path="/policy" exact component={PolicyList} />
            <Route
              render={() => (
                <FormattedMessage id="xpack.endpoint.notFound" defaultMessage="Page Not Found" />
              )}
            />
          </Switch>
        </RouteCapture>
      </BrowserRouter>
    </I18nProvider>
  </Provider>
));
