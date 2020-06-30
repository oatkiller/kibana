/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React, { memo, useMemo } from 'react';
import { i18n } from '@kbn/i18n';
import { EuiBasicTableColumn, EuiButtonEmpty, EuiSpacer, EuiInMemoryTable } from '@elastic/eui';
import { FormattedMessage } from 'react-intl';
import { useSelector } from 'react-redux';
import { CrumbInfo, StyledBreadcrumbs } from './panel_content_utilities';

import * as selectors from '../../store/selectors';
import * as event from '../../../../common/endpoint/models/event';
import { ResolverEvent, ResolverNodeStats } from '../../../../common/endpoint/types';
import { uniquePidForProcess } from '../../models/process_event';

/**
 * This view gives counts for all the related events of a process grouped by related event type.
 * It should look something like:
 *
 * | Count                  | Event Type                 |
 * | :--------------------- | :------------------------- |
 * | 5                      | DNS                        |
 * | 12                     | Registry                   |
 * | 2                      | Network                    |
 *
 */
export const EventCountsForProcess = memo(function EventCountsForProcess({
  processEvent,
  pushToQueryParams,
  relatedStats,
}: {
  processEvent: ResolverEvent;
  pushToQueryParams: (queryStringKeyValuePair: CrumbInfo) => unknown;
  relatedStats: ResolverNodeStats;
}) {
  interface EventCountsTableView {
    name: string;
    count: number;
  }

  const processName = event.eventName(processEvent);
  const processEntityId = uniquePidForProcess(processEvent);

  const totalCount = useSelector(selectors.relatedEventTotalForProcess)(processEvent);

  const eventsString = i18n.translate(
    'xpack.securitySolution.endpoint.resolver.panel.processEventCounts.events',
    {
      defaultMessage: 'Events',
    }
  );
  const crumbs = useMemo(() => {
    return [
      {
        text: eventsString,
        onClick: () => {
          pushToQueryParams({ crumbId: '', crumbEvent: '' });
        },
      },
      {
        text: processName,
        onClick: () => {
          pushToQueryParams({ crumbId: processEntityId, crumbEvent: '' });
        },
      },
      {
        text: (
          <FormattedMessage
            id="xpack.securitySolution.endpoint.resolver.panel.relatedCounts.numberOfEventsInCrumb"
            values={{ totalCount }}
            defaultMessage="{totalCount} Events"
          />
        ),
        onClick: () => {
          pushToQueryParams({ crumbId: processEntityId, crumbEvent: '' });
        },
      },
    ];
  }, [processName, totalCount, processEntityId, pushToQueryParams, eventsString]);
  const rows = useMemo(() => {
    return Object.entries(relatedStats.events.byCategory).map(
      ([eventType, count]): EventCountsTableView => {
        return {
          name: eventType,
          count,
        };
      }
    );
  }, [relatedStats.events.byCategory]);
  const columns = useMemo<Array<EuiBasicTableColumn<EventCountsTableView>>>(
    () => [
      {
        field: 'count',
        name: i18n.translate('xpack.securitySolution.endpoint.resolver.panel.table.row.count', {
          defaultMessage: 'Count',
        }),
        width: '20%',
        sortable: true,
      },
      {
        field: 'name',
        name: i18n.translate('xpack.securitySolution.endpoint.resolver.panel.table.row.eventType', {
          defaultMessage: 'Event Type',
        }),
        width: '80%',
        sortable: true,
        render(name: string) {
          return (
            <EuiButtonEmpty
              onClick={() => {
                pushToQueryParams({ crumbId: event.entityId(processEvent), crumbEvent: name });
              }}
            >
              {name}
            </EuiButtonEmpty>
          );
        },
      },
    ],
    [pushToQueryParams, processEvent]
  );
  return (
    <>
      <StyledBreadcrumbs breadcrumbs={crumbs} />
      <EuiSpacer size="l" />
      <EuiInMemoryTable<EventCountsTableView> items={rows} columns={columns} sorting />
    </>
  );
});
