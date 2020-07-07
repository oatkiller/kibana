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
import { EventCountsForProcess } from './event_counts_for_process';
import { NodeEvents } from './node_events';
import { RelatedEventDetail } from './related_event_detail';
import { NodeIndex } from './node_index';
import { PanelQueryStringState } from '../../types';

export const Panel = memo(function ({ className }: { className?: string }) {
  // true if the overall graph is loading
  declare const nodesAreLoading: boolean;

  // true if the overall graph failed to load
  declare const nodesFailedToLoad: boolean;

  // true if the tree loaded, there is a panelNodeID, and events for that nodeID were in the tree response
  declare const panelNodeInResponse: boolean;

  // true if the middleware is waiting for a response containing related events for panelNodeID
  declare const relatedEventsForPanelNodeAreLoading: boolean;

  // if the middleware's request for events related to panelNodeID failed
  declare const relatedEventsForPanelNodeFailedToLoad: boolean;

  // true if there is a panelNodeID and a panelRelatedEventID and if there are related events in memory for panelNodeID and if those events contain data for panelRelatedEventID
  declare const panelRelatedEventInResponse: boolean;

  // a failure dialog when the overall tree fails to load
  declare const NodesFailedToLoad: React.FC;

  // a loading dialog for the overall tree
  declare const NodesLoading: React.FC;

  // A failure dialog for when the panelNodeID's event wasn't in the tree response
  declare const NodeDetailNotFound: React.FC;

  // a component that shows the details of a specific node (process)
  declare const NodeDetail: React.FC<{ /** the nodeID to show details about. */ nodeID: string }>;

  // A messages to be shown in place of any related events panel if the the middleware is waiting for a response containing related events for panelNodeID
  declare const NodeEventsLoading: React.FC;

  // a failure message for when the response w/ related events for the panelNodeID failed.
  declare const NodeEventsFailedToLoad: React.FC;

  // a 404-type message for when the panel query string parameters were invalid.
  declare const PanelNotFound: React.FC;

  // when showing details about an event, if we counldn't find the node itself in memory, show this error message.
  declare const NodeEventsNodeNotFound: React.FC;

  // if we wanted to show the details of an event but that event was not found in the related events for the related node, show this error message.
  declare const NodeEventsEventNotFound: React.FC;

  // shows the details of an event, along with its related node
  declare const NodeEventsDetail: React.FC<{ nodeID: string; eventID: string }>;

  // shows a list of events (filtered by a single category) that are related to a node
  declare const NodeEventsByCategory: React.FC<{ nodeID: string; category: string }>;

  // shows summary of all related events for a node
  declare const NodeEventsIndex: React.FC<{ nodeID: string }>;

  declare const panelQueryStringState: PanelQueryStringState;

  const processEventForPanelNodeID = useSelector(selectors.processEventForPanelNodeID);

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
          }

          if (panelQueryStringState.panelView === 'node') {
            if (panelQueryStringState.panelNodeID) {
              if (panelNodeInResponse === false) {
                // the node wasn't in the tree, show an error
                return <NodeDetailNotFound />;
              } else {
                // show the detail veiw of a node
                // TODO, you cant use a single process for this.
                return <NodeDetail processEvent={processEventForPanelNodeID} />;
              }
            } else {
              // show the list of nodes
              return <NodeIndex />;
            }
          } else if (panelQueryStringState.panelView === 'nodeEvents') {
            // this branch shows events related to a node.

            if (panelNodeInResponse === false) {
              // we couldn't find the node to begin with.
              // TODO, different component name?
              return <NodeEventsNodeNotFound />;
            } else if (relatedEventsForPanelNodeAreLoading) {
              // the middleware only hits one resource for these types of panels. it gets the oldest 100 related events (of any type) for the node.
              return <NodeEventsLoading />;
            } else if (relatedEventsForPanelNodeFailedToLoad) {
              return <NodeEventsFailedToLoad />;
            }

            if ('panelRelatedEventID' in panelQueryStringState) {
              // if `panelRelatedEventID` is found, show the details of a specific event
              if (panelRelatedEventInResponse === false) {
                // either we didn't get the node or we didn't get the related event
                return <NodeEventsEventNotFound />;
              } else {
                return (
                  <NodeEventsDetail
                    nodeID={panelQueryStringState.panelNodeID}
                    eventID={panelQueryStringState.panelRelatedEventID}
                  />
                );
              }
            } else if ('panelEventCategory' in panelQueryStringState) {
              // show events of a specific category that are related to a node
              return (
                <NodeEventsByCategory
                  nodeID={panelQueryStringState.panelNodeID}
                  category={panelQueryStringState.panelEventCategory}
                />
              );
            } else {
              return <NodeEventsIndex nodeID={panelQueryStringState.panelNodeID} />;
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
