/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React from 'react';
import styled from 'styled-components';
import { EuiTabs, EuiTab } from '@elastic/eui';
import { useHistory, useLocation } from 'react-router-dom';

export interface NavTabs {
  name: string;
  id: string;
  href: string;
}

export const navTabs: NavTabs[] = [
  {
    id: 'home',
    name: 'Home',
    href: '/',
  },
  {
    id: 'management',
    name: 'Management',
    href: '/management',
  },
  {
    id: 'alerts',
    name: 'Alerts',
    href: '/alerts',
  },
  {
    id: 'policies',
    name: 'Policies',
    href: '/policy',
  },
];

const Tabs = styled(EuiTabs)`
  top: 1px;
  &:before {
    height: 0px;
  }
`;

export const HeaderNavigation: React.FunctionComponent = () => {
  const history = useHistory();
  const location = useLocation();

  function renderNavTabs(tabs: NavTabs[]) {
    return tabs.map((tab, index) => {
      return (
        <EuiTab
          data-testid={`${tab.id}Link`}
          key={index}
          onClick={() => {
            history.push(tab.href);
          }}
          isSelected={tab.href === location.pathname}
        >
                    {tab.name}
                  
        </EuiTab>
      );
    });
  }

  return <Tabs>{renderNavTabs(navTabs)}</Tabs>;
};
