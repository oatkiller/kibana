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
import { NodeDetail } from './node_detail';
import { NodeEventsByCategory } from './node_events_by_category';
import { NodeIndex } from './node_index';
import { PanelQueryStringState } from '../../types';
import { NodeEventsLoading } from './node_events_loading';
import { NodeEventsDetail } from './node_events_detail';
import { NodeEventsFailedToLoad } from './node_events_failed_to_load';

export const Panel = memo(function ({ className }: { className?: string }) {
  // true if the overall graph is loading
  declare const nodesAreLoading: boolean;

  // true if the overall graph failed to load
  declare const nodesFailedToLoad: boolean;

  // true if the tree loaded, there is a panelNodeID, and events for that nodeID were in the tree response

  // true if the middleware is waiting for a response containing related events for panelNodeID
  declare const relatedEventsForPanelNodeAreLoading: boolean;

  // if the middleware's request for events related to panelNodeID failed
  declare const relatedEventsForPanelNodeFailedToLoad: boolean;

  // true if there is a panelNodeID and a panelRelatedEventID and if there are related events in memory for panelNodeID and if those events contain data for panelRelatedEventID

  // a failure dialog when the overall tree fails to load
  declare const NodesFailedToLoad: React.FC;

  // a loading dialog for the overall tree
  declare const NodesLoading: React.FC;

  // A failure dialog for when the panelNodeID's event wasn't in the tree response
  declare const PanelNodeNotFound: React.FC;

  // a 404-type message for when the panel query string parameters were invalid.
  declare const PanelNotFound: React.FC;

  // when showing details about an event, if we counldn't find the node itself in memory, show this error message.

  // if we wanted to show the details of an event but that event was not found in the related events for the related node, show this error message.
  declare const NodeEventsEventNotFound: React.FC;

  // shows summary of all related events for a node
  declare const NodeEventsIndex: React.FC<{ nodeID: string }>;

  declare const panelQueryStringState: PanelQueryStringState;

  const processEventForPanelNodeID = useSelector(selectors.processEventForPanelNodeID);

  const eventForPanelRelatedEventID = useSelector(selectors.eventForPanelRelatedEventID);

  return (
    <EuiPanel className={className}>
      {(() => {
        if (
          panelQueryStringState.panelView === 'node' ||
          panelQueryStringState.panelView === 'nodeEvents'
        ) {
          // if the graph is loading show a loading interaction
          // we use these events (in memory) for the panel in all cases.
          if (nodesAreLoading) {
            return <NodesLoading />;
          } else if (nodesFailedToLoad) {
            // if the graph failed to load, show an error
            return <NodesFailedToLoad />;
          } else if (
            // only the `NodeIndex` view doesn't need a node process event.
            // handle it now so that the rest of the views can share the same processEventForPanelNodeID loading logic inline
            panelQueryStringState.panelView === 'node' &&
            panelQueryStringState.panelNodeID === undefined
          ) {
            // show the list of nodes
            return <NodeIndex />;
          } else if (
            // all other views require `processEventForPanelNodeID`
            processEventForPanelNodeID === null
          ) {
            // the node wasn't in the tree, show an error
            return <PanelNodeNotFound />;
          } else if (panelQueryStringState.panelView === 'node') {
            // show the detail veiw of a node
            // TODO, you cant use a single process for this.
            return <NodeDetail processEvent={processEventForPanelNodeID} />;
          } else if (panelQueryStringState.panelView === 'nodeEvents') {
            // this branch shows events related to a node.

            if (relatedEventsForPanelNodeAreLoading) {
              // the middleware only hits one resource for these types of panels. it gets the oldest 100 related events (of any type) for the node.
              return <NodeEventsLoading />;
            } else if (relatedEventsForPanelNodeFailedToLoad) {
              return <NodeEventsFailedToLoad />;
            }

            if ('panelRelatedEventID' in panelQueryStringState) {
              // if `panelRelatedEventID` is found, show the details of a specific event
              if (eventForPanelRelatedEventID === null) {
                // we didn't get the related event
                return <NodeEventsEventNotFound />;
              } else {
                return (
                  <NodeEventsDetail
                    parentEvent={processEventForPanelNodeID}
                    relatedEvent={eventForPanelRelatedEventID}
                  />
                );
              }
            } else if ('panelEventCategory' in panelQueryStringState) {
              // show events of a specific category that are related to a node
              return (
                <NodeEventsByCategory
                  processEvent={processEventForPanelNodeID}
                  category={panelQueryStringState.panelEventCategory}
                />
              );
            } else {
              return <NodeEventsIndex process={processEventForPanelNodeID} />;
              // showing the summary of related events for a node
            }
          }
        } else {
          return <PanelNotFound />;
        }
      })()}
    </EuiPanel>
  );
});
