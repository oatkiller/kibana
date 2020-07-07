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
import { NodeEvents } from './node_events';
import { RelatedEventDetail } from './related_event_detail';
import { ProcessListWithCounts } from './process_list_with_counts';

export const Panel = memo(function ({ className }: { className?: string }) {
  const panelViewName = useSelector(selectors.panelViewName);
  const panelEvent = useSelector(selectors.processEventForPanelNodeID);
  const panelRelatedEvent = useSelector(selectors.processEventForPanelRelatedEventID);
  // TODO, do all error and loading states here.
  return (
    <EuiPanel className={className}>
      {(() => {
        if (panelViewName === 'processDetail') {
          // if the data is loading, show loading TODO
          // if the data isn't found, show 404 experience TODO
          // TODO, pass data to component
          return <ProcessDetails />;
        } else if (panelViewName === 'eventCountsForProcess') {
          // if the data is loading, show loading TODO
          // if the data isn't found, show 404 experience TODO
          // TODO, pass data to component
          return <EventCountsForProcess />;
        } else if (panelViewName === 'nodeEvents') {
          // if the data is loading, show loading TODO
          // if the data isn't found, show 404 experience TODO
          // TODO, pass data to component
          return <NodeEvents />;
        } else if (panelViewName === 'relatedEventDetail') {
          // if the data is loading, show loading TODO
          // if the data isn't found, show 404 experience TODO
          // TODO, pass data to component
          // this view shows details about a node (process) along with details about a single event that is related to it
          return <RelatedEventDetail parentEvent={panelEvent} relatedEvent={panelRelatedEvent} />;
        } else if (panelViewName === 'processListWithCounts') {
          // if the data is loading, show loading TODO
          // if the data isn't found, show 404 experience TODO
          // TODO, pass data to component
          return <ProcessListWithCounts />;
        }
      })()}
    </EuiPanel>
  );
});
