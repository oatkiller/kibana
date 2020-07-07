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
import * as selectors from '../../store/selectors';
import { useResolverDispatch } from '../use_resolver_dispatch';
import { SideEffectContext } from '../side_effect_context';
import { ProcessCubeIcon } from './process_cube_icon';
import { ResolverEvent } from '../../../../common/endpoint/types';
import * as processEventModel from '../../models/process_event';
import { StyledBreadcrumbs } from './styles';
import { formatDate } from './format_date';
import { usePanelStateSetter } from '../use_panel_state_setter';

/**
 * The "default" view for the panel: A list of all the processes currently in the graph.
 */
export const NodeIndex = memo(function ProcessListWithCounts() {
  interface ProcessTableView {
    name?: string;
    timestamp?: Date;
    event: ResolverEvent;
  }
  const isProcessTerminated = useSelector(selectors.isProcessTerminated);

  const setPanelState = usePanelStateSetter();

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
          const nodeID = processEventModel.uniquePidForProcess(item.event);
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
                dispatch({
                  type: 'userBroughtProcessIntoView',
                  payload: {
                    time: timestamp(),
                    id: nodeID,
                  },
                });
                setPanelState({ panelView: 'node', panelNodeID: nodeID });
              }}
            >
              <ProcessCubeIcon isProcessTerminated={isProcessTerminated(nodeID)} />
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
            formatDate(eventDate)
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
    [setPanelState, dispatch, timestamp, isProcessTerminated]
  );

  // TODO
  const { processNodePositions } = useSelector(selectors.processNodePositionsAndEdgeLineSegments);
  const processTableView: ProcessTableView[] = useMemo(
    () =>
      [...processNodePositions.keys()].map((processEvent) => {
        const name = processEventModel.name(processEvent);

        return {
          name,
          timestamp: processEventModel.timestampAsDate(processEvent),
          event: processEvent,
        };
      }),
    [processNodePositions]
  );

  const breadcrumbs = useMemo(() => {
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
      <StyledBreadcrumbs breadcrumbs={breadcrumbs} />
      <EuiSpacer size="l" />
      <EuiInMemoryTable<ProcessTableView> items={processTableView} columns={columns} sorting />
    </>
  );
});
