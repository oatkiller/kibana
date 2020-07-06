/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React, { memo } from 'react';
import { useSelector } from 'react-redux';
import { EuiPanel } from '@elastic/eui';
import * as selectors from '../../store/selectors';
import { ProcessEventListNarrowedByType } from '../panels/panel_content_related_list';
import { EventCountsForProcess } from '../panels/panel_content_related_counts';
import { ProcessDetails } from './node_detail';
import { ProcessListWithCounts } from '../panels/panel_content_process_list';
import { RelatedEventDetail } from '../panels/panel_content_related_detail';

export const Panel = memo(function Event({ className }: { className?: string }) {
  const panelViewName = useSelector(selectors.panelViewName);
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
          const parentEvent = useSelector(selectors.processEventForPanelNodeID);
          const relatedEvent = useSelector(selectors.processEventForPanelRelatedEventID);
          return <RelatedEventDetail parentEvent={parentEvent} relatedEvent={relatedEvent} />;
        } else if (panelViewName === 'processListWithCounts') {
          return <ProcessListWithCounts />;
        }
      })()}
    </EuiPanel>
  );
});
