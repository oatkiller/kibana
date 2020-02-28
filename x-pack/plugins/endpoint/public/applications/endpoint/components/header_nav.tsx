/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React from 'react';
import { i18n } from '@kbn/i18n';
import styled from 'styled-components';
import { EuiTabs, EuiTab } from '@elastic/eui';
import { useLocation } from 'react-router-dom';
import { useReactRouterLinkProps } from '../view/use_react_router_link_props';

export interface NavTabs {
  name: string;
  id: string;
  href: string;
}

export const navTabs: NavTabs[] = [
  {
    id: 'home',
    name: i18n.translate('xpack.endpoint.headerNav.home', {
      defaultMessage: 'Home',
    }),
    href: '/',
  },
  {
    id: 'management',
    name: i18n.translate('xpack.endpoint.headerNav.management', {
      defaultMessage: 'Management',
    }),
    href: '/management',
  },
  {
    id: 'alerts',
    name: i18n.translate('xpack.endpoint.headerNav.alerts', {
      defaultMessage: 'Alerts',
    }),
    href: '/alerts',
  },
  {
    id: 'policies',
    name: i18n.translate('xpack.endpoint.headerNav.policies', {
      defaultMessage: 'Policies',
    }),
    href: '/policy',
  },
];

const Tabs = styled(EuiTabs)`
  top: 1px;
  &:before {
    height: 0px;
  }
`;

export const HeaderNavigation: React.FunctionComponent = React.memo(() => {
  const location = useLocation();
  const { onClick } = useReactRouterLinkProps();

  function renderNavTabs(tabs: NavTabs[]) {
    return tabs.map((tab, index) => {
      return (
        <EuiTab
          data-testid={`${tab.id}EndpointTab`}
          data-test-subj={`${tab.id}EndpointTab`}
          key={index}
          href={`/app/endpoint${tab.href}`}
          onClick={onClick}
          isSelected={tab.href === location.pathname}
        >
          {tab.name}
        </EuiTab>
      );
    });
  }

  return <Tabs>{renderNavTabs(navTabs)}</Tabs>;
});
