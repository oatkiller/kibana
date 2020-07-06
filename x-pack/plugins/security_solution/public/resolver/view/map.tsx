/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

/* eslint-disable no-duplicate-imports */

/* eslint-disable react/display-name */

import React, { useContext } from 'react';
import { useSelector } from 'react-redux';
import { EuiLoadingSpinner } from '@elastic/eui';
import { FormattedMessage } from '@kbn/i18n/react';
import * as selectors from '../store/selectors';
import { EdgeLine } from './edge_line';
import { GraphControls } from './graph_controls';
import { ProcessEventDot } from './process_event_dot';
import { useCamera } from './use_camera';
import { SymbolDefinitions, useResolverTheme } from './assets';
import { useStateSyncingActions } from './use_state_syncing_actions';
import { StyledMapContainer, StyledPanel, GraphContainer } from './styles';
import { SideEffectContext } from './side_effect_context';
import { ProcessNode } from './process_node';
import { uniquePidForProcess } from '../models/process_event';

/**
 * The highest level connected Resolver component. Needs a `Provider` in its ancestry to work.
 */
export const ResolverMap = React.memo(function ({
  className,
  databaseDocumentID,
}: {
  /**
   * Used by `styled-components`.
   */
  className?: string;
  /**
   * The `_id` value of an event in ES.
   * Used as the origin of the Resolver graph.
   */
  databaseDocumentID?: string;
}) {
  /**
   * This is responsible for dispatching actions that include any external data.
   * `databaseDocumentID`
   */
  useStateSyncingActions({ databaseDocumentID });

  const { timestamp } = useContext(SideEffectContext);
  const { processNodePositions, connectingEdgeLineSegments } = useSelector(
    selectors.visibleProcessNodePositionsAndEdgeLineSegments
  )(timestamp());
  const terminatedProcesses = useSelector(selectors.terminatedProcesses);
  const { projectionMatrix, ref, onMouseDown } = useCamera();
  const isLoading = useSelector(selectors.isLoading);
  const hasError = useSelector(selectors.hasError);
  const activeDescendantId = useSelector(selectors.focusedNode);
  const { colorMap } = useResolverTheme();

  const useDot = false;

  return (
    <StyledMapContainer className={className} backgroundColor={colorMap.resolverBackground}>
      {isLoading ? (
        <div className="loading-container">
          <EuiLoadingSpinner size="xl" />
        </div>
      ) : hasError ? (
        <div className="loading-container">
          <div>
            {' '}
            <FormattedMessage
              id="xpack.securitySolution.endpoint.resolver.loadingError"
              defaultMessage="Error loading data."
            />
          </div>
        </div>
      ) : (
        <GraphContainer
          className="resolver-graph kbn-resetFocusState"
          onMouseDown={onMouseDown}
          ref={ref}
          role="tree"
          tabIndex={0}
          aria-activedescendant={activeDescendantId || undefined}
        >
          {connectingEdgeLineSegments.map(({ points: [startPosition, endPosition], metadata }) => (
            <EdgeLine
              edgeLineMetadata={metadata}
              key={metadata.uniqueId}
              startPosition={startPosition}
              endPosition={endPosition}
              projectionMatrix={projectionMatrix}
            />
          ))}
          {[...processNodePositions].map(([processEvent, position]) => {
            const processEntityId = uniquePidForProcess(processEvent);
            return (
              <ProcessNode
                key={processEntityId}
                position={position}
                projectionMatrix={projectionMatrix}
                event={processEvent}
                isProcessTerminated={/* TODO */ terminatedProcesses.has(processEntityId)}
                isProcessOrigin={false}
              />
            );
          })}
          {useDot &&
            [...processNodePositions].map(([processEvent, position]) => {
              const processEntityId = uniquePidForProcess(processEvent);
              return (
                <ProcessEventDot
                  key={`${processEntityId}:debugging`}
                  position={position}
                  projectionMatrix={projectionMatrix}
                  event={processEvent}
                  isProcessTerminated={terminatedProcesses.has(processEntityId)}
                />
              );
            })}
        </GraphContainer>
      )}
      <StyledPanel />
      <GraphControls />
      <SymbolDefinitions />
    </StyledMapContainer>
  );
});
