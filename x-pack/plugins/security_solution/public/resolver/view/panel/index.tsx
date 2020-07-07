/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

/* eslint-disable react/display-name */

import React, { memo } from 'react';
import { useSelector } from 'react-redux';
import { EuiPanel } from '@elastic/eui';
import * as selectors from '../../store/selectors';
import { ProcessDetails } from './node_detail';
import { EventCountsForProcess } from './event_counts_for_process';
import { ProcessEventListNarrowedByType } from './process_event_list_narrowed_by_type';
import { RelatedEventDetail } from './related_event_detail';
import { ProcessListWithCounts } from './process_list_with_counts';

export const Panel = memo(function ({ className }: { className?: string }) {
  const panelViewName = useSelector(selectors.panelViewName);
  const panelEvent = useSelector(selectors.processEventForPanelNodeID);
  const panelRelatedEvent = useSelector(selectors.processEventForPanelRelatedEventID);
  return (
    <EuiPanel className={className}>
      {(() => {
        if (panelViewName === 'processDetail') {
          return <ProcessDetails />;
        } else if (panelViewName === 'eventCountsForProcess') {
          return <EventCountsForProcess />;
        } else if (panelViewName === 'processEventListNarrowedByType') {
          return <ProcessEventListNarrowedByType />;
        } else if (panelViewName === 'relatedEventDetail') {
          // this view shows details about a node (process) along with details about a single event that is related to it
          return <RelatedEventDetail parentEvent={panelEvent} relatedEvent={panelRelatedEvent} />;
        } else if (panelViewName === 'processListWithCounts') {
          return <ProcessListWithCounts />;
        }
      })()}
    </EuiPanel>
  );
});
