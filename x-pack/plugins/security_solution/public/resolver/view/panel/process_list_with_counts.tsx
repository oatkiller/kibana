/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */
import React, { memo, useContext, useMemo } from 'react';
import {
  EuiBasicTableColumn,
  EuiBadge,
  EuiButtonEmpty,
  EuiSpacer,
  EuiInMemoryTable,
} from '@elastic/eui';
import { i18n } from '@kbn/i18n';
import { useSelector } from 'react-redux';
import * as event from '../../../../common/endpoint/models/event';
import * as selectors from '../../store/selectors';
import { formatter, StyledBreadcrumbs } from './panel_content_utilities';
import { useResolverDispatch } from '../use_resolver_dispatch';
import { SideEffectContext } from '../side_effect_context';
import { ProcessCubeIcon } from './process_cube_icon';
import { ResolverEvent } from '../../../../common/endpoint/types';
import { PanelQueryStringState } from '../../types';
import { uniquePidForProcess } from '../../models/process_event';

/**
 * The "default" view for the panel: A list of all the processes currently in the graph.
 *
 * @param {function} pushToQueryparams A function to update the hash value in the URL to control panel state
 */
export const ProcessListWithCounts = memo(function ProcessListWithCounts({
  pushToQueryParams,
  isProcessTerminated,
  isProcessOrigin,
}: {
  pushToQueryParams: (queryStringKeyValuePair: PanelQueryStringState) => unknown;
  isProcessTerminated: boolean;
  isProcessOrigin: boolean;
}) {
  interface ProcessTableView {
    name: string;
    timestamp?: Date;
    event: ResolverEvent;
  }

  const dispatch = useResolverDispatch();
  const { timestamp } = useContext(SideEffectContext);

  const columns = useMemo<Array<EuiBasicTableColumn<ProcessTableView>>>(
    () => [
      {
        field: 'name',
        name: i18n.translate(
          'xpack.securitySolution.endpoint.resolver.panel.table.row.processNameTitle',
          {
            defaultMessage: 'Process Name',
          }
        ),
        sortable: true,
        truncateText: true,
        render(name: string, item: ProcessTableView) {
          return name === '' ? (
            <EuiBadge color="warning">
              {i18n.translate(
                'xpack.securitySolution.endpoint.resolver.panel.table.row.valueMissingDescription',
                {
                  defaultMessage: 'Value is missing',
                }
              )}
            </EuiBadge>
          ) : (
            <EuiButtonEmpty
              onClick={() => {
                const nodeID = uniquePidForProcess(item.event);
                dispatch({
                  type: 'userBroughtProcessIntoView',
                  payload: {
                    time: timestamp(),
                    id: nodeID,
                  },
                });
                pushToQueryParams({ breadcrumbID: nodeID, breadcrumbEvent: '' });
              }}
            >
              <ProcessCubeIcon
                isProcessTerminated={isProcessTerminated}
                isProcessOrigin={isProcessOrigin}
              />
              {name}
            </EuiButtonEmpty>
          );
        },
      },
      {
        field: 'timestamp',
        name: i18n.translate(
          'xpack.securitySolution.endpoint.resolver.panel.table.row.timestampTitle',
          {
            defaultMessage: 'Timestamp',
          }
        ),
        dataType: 'date',
        sortable: true,
        render(eventDate?: Date) {
          return eventDate ? (
            formatter.format(eventDate)
          ) : (
            <EuiBadge color="warning">
              {i18n.translate(
                'xpack.securitySolution.endpoint.resolver.panel.table.row.timestampInvalidLabel',
                {
                  defaultMessage: 'invalid',
                }
              )}
            </EuiBadge>
          );
        },
      },
    ],
    [pushToQueryParams, dispatch, timestamp, isProcessOrigin, isProcessTerminated]
  );

  // TODO
  const { processNodePositions } = useSelector(selectors.processNodePositionsAndEdgeLineSegments);
  const processTableView: ProcessTableView[] = useMemo(
    () =>
      [...processNodePositions.keys()].map((processEvent) => {
        let dateTime;
        const eventTime = event.eventTimestamp(processEvent);
        const name = event.eventName(processEvent);
        if (eventTime) {
          const date = new Date(eventTime);
          if (isFinite(date.getTime())) {
            dateTime = date;
          }
        }
        return {
          name,
          timestamp: dateTime,
          event: processEvent,
        };
      }),
    [processNodePositions]
  );

  const crumbs = useMemo(() => {
    return [
      {
        text: i18n.translate(
          'xpack.securitySolution.endpoint.resolver.panel.processListWithCounts.events',
          {
            defaultMessage: 'All Process Events',
          }
        ),
        onClick: () => {},
      },
    ];
  }, []);

  return (
    <>
      <StyledBreadcrumbs breadcrumbs={crumbs} />
      <EuiSpacer size="l" />
      <EuiInMemoryTable<ProcessTableView> items={processTableView} columns={columns} sorting />
    </>
  );
});
ProcessListWithCounts.displayName = 'ProcessListWithCounts';
