/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

/* eslint-disable react/display-name */

import React, { memo, useMemo, ReactNode } from 'react';
import { i18n } from '@kbn/i18n';
import { htmlIdGenerator, EuiSpacer, EuiTitle, EuiText, EuiTextColor } from '@elastic/eui';
import { useSelector } from 'react-redux';
import { StyledBreadcrumbs, StyledDescriptionList } from './styles';
import * as event from '../../../../common/endpoint/models/event';
import * as processEventModel from '../../models/process_event';
import { ProcessCubeIcon } from './process_cube_icon';
import { descriptionForNode } from '../description_for_node';
import { formatDate } from './format_date';
import * as selectors from '../../store/selectors';
import { ResolverEvent } from '../../../../common/endpoint/types';
import { usePanelStateSetter } from '../use_panel_state_setter';

/**
 * A description list view of all the Metadata that goes with a particular process event, like:
 * Created, Pid, User/Domain, etc.
 */
export const NodeDetail = memo(function ({ processEvent }: { processEvent: ResolverEvent }) {
  const setPanelState = usePanelStateSetter();
  const processName = processEventModel.name(processEvent);
  const nodeID = processEventModel.uniquePidForProcess(processEvent);

  const isProcessTerminated = useSelector(selectors.isProcessTerminated)(nodeID);
  interface ListItem {
    title: NonNullable<ReactNode>;
    description: NonNullable<ReactNode>;
  }

  const listItems: ListItem[] = useMemo(() => {
    const eventTime = event.timestamp(processEvent);
    const dateTime = eventTime !== undefined ? formatDate(eventTime) : undefined;

    // TODO, a node isn't a single process event. fix

    const createdEntry = {
      title: i18n.translate(
        'xpack.securitySolution.endpoint.resolver.panel.processDescList.created',
        {
          defaultMessage: 'Created',
        }
      ),
      description: dateTime,
    };

    const pathEntry = {
      title: i18n.translate('xpack.securitySolution.endpoint.resolver.panel.processDescList.path', {
        defaultMessage: 'Path',
      }),
      description: processEventModel.processPath(processEvent),
    };

    const pidEntry = {
      title: i18n.translate('xpack.securitySolution.endpoint.resolver.panel.processDescList.pid', {
        defaultMessage: 'PID',
      }),
      description: processEventModel.processPid(processEvent)?.toString(),
    };

    const userEntry = {
      title: i18n.translate('xpack.securitySolution.endpoint.resolver.panel.processDescList.user', {
        defaultMessage: 'User',
      }),
      description: processEventModel.userInfoForProcess(processEvent)?.user,
    };

    const domainEntry = {
      title: i18n.translate(
        'xpack.securitySolution.endpoint.resolver.panel.processDescList.domain',
        {
          defaultMessage: 'Domain',
        }
      ),
      description: processEventModel.userInfoForProcess(processEvent)?.domain,
    };

    const parentPidEntry = {
      title: i18n.translate(
        'xpack.securitySolution.endpoint.resolver.panel.processDescList.parentPid',
        {
          defaultMessage: 'Parent PID',
        }
      ),
      description: processEventModel.processParentPid(processEvent)?.toString(),
    };

    const md5Entry = {
      title: i18n.translate(
        'xpack.securitySolution.endpoint.resolver.panel.processDescList.md5hash',
        {
          defaultMessage: 'MD5',
        }
      ),
      description: processEventModel.md5HashForProcess(processEvent),
    };

    const commandLineEntry = {
      title: i18n.translate(
        'xpack.securitySolution.endpoint.resolver.panel.processDescList.commandLine',
        {
          defaultMessage: 'Command Line',
        }
      ),
      description: processEventModel.argsForProcess(processEvent),
    };

    // This is the data in {title, description} form for the EUIDescriptionList to display
    return (
      [
        createdEntry,
        pathEntry,
        pidEntry,
        userEntry,
        domainEntry,
        parentPidEntry,
        md5Entry,
        commandLineEntry,
      ]
        // remove any list items that have `undefined` as a description.
        // using predicate because I can't get TS to narrow out `undefined` as expected. TODO, revisit this. it seems to work in playground
        .filter(function (listItem): listItem is { title: string; description: string } {
          return listItem.description !== undefined;
        })
        // Order the list items by their translated titles
        .sort(function ({ title: first }, { title: second }) {
          return first.localeCompare(second);
        })
    );
  }, [processEvent]);

  const breadcrumbs = useMemo(() => {
    return [
      {
        text: i18n.translate(
          'xpack.securitySolution.endpoint.resolver.panel.processDescList.events',
          {
            defaultMessage: 'Events',
          }
        ),
        onClick() {
          setPanelState({ panelView: 'node' });
        },
      },
      {
        text: i18n.translate(
          'xpack.securitySolution.endpoint.resolver.panel.relatedEventDetail.detailsForProcessName',
          { values: { processName }, defaultMessage: 'Details for: {processName}' }
        ),
      },
    ];
  }, [processName, setPanelState]);

  const titleId = htmlIdGenerator('resolver')('panelTitle');

  return (
    <>
      <StyledBreadcrumbs breadcrumbs={breadcrumbs} />
      <EuiSpacer size="l" />
      <EuiTitle size="xs">
        <h4 aria-describedby={titleId}>
          <ProcessCubeIcon isProcessTerminated={isProcessTerminated} />
          {processName}
        </h4>
      </EuiTitle>
      <EuiText>
        <EuiTextColor color="subdued">
          <span id={titleId}>{descriptionForNode(isProcessTerminated)}</span>
        </EuiTextColor>
      </EuiText>
      <EuiSpacer size="l" />
      <StyledDescriptionList
        type="column"
        align="left"
        titleProps={{ className: 'desc-title' }}
        compressed
        listItems={listItems}
      />
    </>
  );
});
