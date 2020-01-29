/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React from 'react';
import { useDispatch } from 'react-redux';
import {
  EuiPage,
  EuiPageBody,
  EuiPageContent,
  EuiPageContentBody,
  EuiPageContentHeader,
  EuiPageContentHeaderSection,
  EuiPageHeader,
  EuiPageHeaderSection,
  EuiTitle,
  EuiBasicTable,
} from '@elastic/eui';
import { useEndpointListSelector } from '../store/hooks';
import {
  endpointListData,
  endpointListPageIndex,
  endpointListPageSize,
  endpointTotalHits,
} from '../store/endpoint_list/selectors';
import { EndpointListAction } from '../store/endpoint_list/action';

export const EndpointList = () => {
  const dispatch = useDispatch<(a: EndpointListAction) => void>();
  const endpointListResults = useEndpointListSelector(endpointListData);
  const pageIndex = useEndpointListSelector(endpointListPageIndex);
  const pageSize = useEndpointListSelector(endpointListPageSize);
  const totalItemCount = useEndpointListSelector(endpointTotalHits);

  // TODO use useMemo
  const paginationSetup = {
    pageIndex,
    pageSize,
    totalItemCount,
    pageSizeOptions: [10, 20, 50],
    hidePerPageOptions: false,
  };

  // Use useCallback
  const onTableChange = ({ page }: { page: { index: number; size: number } }) => {
    const { index, size } = page;
    dispatch({
      type: 'userPaginatedEndpointListTable',
      payload: { pageIndex: index, pageSize: size },
    });
  };

  // TODO use useMemo
  const columns = [
    {
      field: 'host.hostname',
      // TODO intl
      name: 'Host',
    },
    {
      field: 'host.os.name',
      // TODO intl
      name: 'Operating System',
    },
    {
      field: 'endpoint.policy.name',
      // TODO intl
      name: 'Policy',
    },
    {
      field: 'host.hostname',
      // TODO intl
      name: 'Policy Status',
      render: () => {
        // TODO intl
        // TODO dont use span for no reason?
        return <span>Policy Status</span>;
      },
    },
    {
      field: 'endpoint',
      // TODO intl
      name: 'Alerts',
      render: () => {
        // TODO intl
        // TODO dont use span for no reason?
        return <span>0</span>;
      },
    },
    {
      field: 'endpoint.domain',
      // TODO intl
      name: 'Domain',
    },
    {
      field: 'host.ip',
      // TODO intl
      name: 'IP Address',
    },
    {
      field: 'endpoint.sensor',
      // TODO intl
      name: 'Sensor Version',
      render: () => {
        // TODO intl
        // TODO dont use span for no reason?
        return <span>version</span>;
      },
    },
    {
      field: 'host.hostname',
      // TODO intl
      name: 'Last Active',
      render: () => {
        // TODO intl
        // TODO dont use span for no reason?
        return <span>xxxx</span>;
      },
    },
  ];

  return (
    <EuiPage>
      <EuiPageBody>
        <EuiPageHeader>
          <EuiPageHeaderSection>
            <EuiTitle size="xs">
              {/* TODO intl */}
              <h1>Endpoints</h1>
            </EuiTitle>
          </EuiPageHeaderSection>
        </EuiPageHeader>
        <EuiPageContent>
          <EuiPageContentHeader>
            <EuiPageContentHeaderSection>
              <EuiTitle>
                {/* TODO intl */}
                <h2>Hosts</h2>
              </EuiTitle>
            </EuiPageContentHeaderSection>
          </EuiPageContentHeader>
          <EuiBasicTable
            items={endpointListResults}
            columns={columns}
            pagination={paginationSetup}
            onChange={onTableChange}
          />
          <EuiPageContentBody />
        </EuiPageContent>
      </EuiPageBody>
    </EuiPage>
  );
};
