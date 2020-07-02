/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

/* eslint-disable react/display-name */

import React, { useCallback, useMemo, useRef } from 'react';
import { i18n } from '@kbn/i18n';
import { htmlIdGenerator, EuiButton, EuiI18nNumber } from '@elastic/eui';
import { useHistory } from 'react-router-dom';
// eslint-disable-next-line import/no-nodejs-modules
import querystring from 'querystring';
import { useSelector } from 'react-redux';
import { NodeSubMenu } from './submenu';
import { applyMatrix3 } from '../../models/vector2';
import { Vector2, Matrix3, BreadcrumbState } from '../../types';
// TODO
import { SymbolIds, useResolverTheme, calculateResolverFontSize } from '../assets';
// TODO
import { ResolverEvent, ResolverNodeStats } from '../../../../common/endpoint/types';
import { useResolverDispatch } from '../use_resolver_dispatch';
// TODO
import * as eventModel from '../../../../common/endpoint/models/event';
import * as selectors from '../../store/selectors';
import { CubeSvg, Wrapper, StyledActionsContainer, StyledDescriptionText } from './styles';
import { descriptionForNode } from '../description_for_node';
import { uniquePidForProcess } from '../../models/process_event';

/**
 * An artifact that represents a process node and the things associated with it in the Resolver
 */
export const ProcessNode = React.memo(
  ({
    position,
    event,
    projectionMatrix,
    isProcessTerminated,
    isProcessOrigin,
    relatedEventsStatsForProcess,
  }: {
    /**
     * The positon of the process node, in 'world' coordinates.
     */
    position: Vector2;
    /**
     * An event which contains details about the process node.
     */
    event: ResolverEvent;
    /**
     * projectionMatrix which can be used to convert `position` to screen coordinates.
     */
    projectionMatrix: Matrix3;
    /**
     * Whether or not to show the process as terminated.
     */
    isProcessTerminated: boolean;
    /**
     * Whether or not to show the process as the originating event.
     */
    isProcessOrigin: boolean;
    /**
     * A collection of events related to the current node and statistics (e.g. counts indexed by event type)
     * to provide the user some visibility regarding the contents thereof.
     * Statistics for the number of related events and alerts for this process node
     */
    relatedEventsStatsForProcess?: ResolverNodeStats;
  }) => {
    /**
     * Convert the position, which is in 'world' coordinates, to screen coordinates.
     */
    const [left, top] = applyMatrix3(position, projectionMatrix);

    const [xScale] = projectionMatrix;

    // Node (html id=) IDs
    const activeDescendantId = useSelector(selectors.uiActiveDescendantId);

    const isShowingEventActions = xScale > 0.8;
    const isShowingDescriptionText = xScale >= 0.55;

    // The width and height (in svg units) of the cube
    const markerSize = 15;
    // The 'margin' around the marker that is occupied by the backing.
    // the backing's size will be markerSize+backingBorder
    // the marker's offset will be backingBorder
    const backingBorder = 2.5;

    // The viewport shoudl be big enough to fix the marker and the backing border (on each side)
    const svgViewportLength = markerSize + backingBorder * 2;

    // The SVG has its own unit. Multiply it by this value to get world units.
    const worldUnitsPerSvgUnit = 4;

    // the width/height of the SVG element, in pixels
    const svgScreenLength = svgViewportLength * xScale * worldUnitsPerSvgUnit;

    // Move the 'actions container' over so its not blocking the cube.
    // Same as 'svgScreenLength' less 1 'backingBorder' width.
    // This should make the actions container slightly overlay w/ the cubes backing element.
    const actionsContainerMarginLeft = (markerSize + backingBorder) * xScale * worldUnitsPerSvgUnit;

    // horizontally align the vertical centers of the cube and the actions container
    const actionsContainerMarginTop =
      (markerSize / 2 + backingBorder) * xScale * worldUnitsPerSvgUnit;

    const nodeViewportStyle = useMemo(
      () => ({
        // Put the center of the SVG (cube) at the center of the process node.
        left: `${left + svgScreenLength / -2}px`,
        // Put the center of the SVG (cube) at the center of the process node.
        top: `${top + svgScreenLength / -2}px`,
        // we need at least enough room to show the SVG
        // TODO, make sure this accounts for other stuff this component renders.
        minWidth: `${svgScreenLength}px`,
        minHeight: `${svgScreenLength}px`,
      }),
      [left, svgScreenLength, top]
    );

    /**
     * Type in non-SVG components scales as follows:
     *  (These values were adjusted to match the proportions in the comps provided by UX/Design)
     *  18.75 : The smallest readable font size at which labels/descriptions can be read. Font size will not scale below this.
     *  12.5 : A 'slope' at which the font size will scale w.r.t. to zoom level otherwise
     */
    const scaledTypeSize = calculateResolverFontSize(xScale, 18.75, 12.5);
    /**
     * An element that should be animated when the node is clicked.
     */
    const animationTarget = useRef<
      SVGAnimationElement & {
        /**
         * `beginElement` is by [w3](https://www.w3.org/TR/SVG11/animate.html#__smil__ElementTimeControl__beginElement)
         * but missing in [TSJS-lib-generator](https://github.com/microsoft/TSJS-lib-generator/blob/15a4678e0ef6de308e79451503e444e9949ee849/inputfiles/addedTypes.json#L1819)
         */
        beginElement: () => void;
      }
    >(null);
    const { colorMap, cubeAssetsForNode } = useResolverTheme();
    const {
      backingFill,
      cubeSymbol,
      isLabelFilled,
      labelButtonFill,
      strokeColor,
    } = cubeAssetsForNode(isProcessTerminated, isProcessOrigin);

    const descriptionText = descriptionForNode(isProcessTerminated, isProcessOrigin);

    const uniquePID = uniquePidForProcess(event);
    const resolverNodeIdGenerator = useMemo(() => htmlIdGenerator(uniquePID), [uniquePID]);

    const nodeId = resolverNodeIdGenerator('node');
    const labelId = resolverNodeIdGenerator('label');
    const descriptionId = resolverNodeIdGenerator('description');
    const isActiveDescendant = nodeId === activeDescendantId;
    const isSelectedDescendant = useSelector(selectors.selectedProcess) === uniquePID;

    const dispatch = useResolverDispatch();

    const handleFocus = useCallback(() => {
      dispatch({
        type: 'userFocusedOnResolverNode',
        payload: uniquePID,
      });
    }, [dispatch, uniquePID]);

    const history = useHistory();
    const urlSearch = history.location.search;

    /**
     * This updates the breadcrumb nav, the table view
     */
    const pushToQueryParams = useCallback(
      (newCrumbs: BreadcrumbState) => {
        // Construct a new set of params from the current set (minus empty params)
        // by assigning the new set of params provided in `newCrumbs`
        const crumbsToPass = {
          ...querystring.parse(urlSearch.slice(1)),
          ...newCrumbs,
        };

        // If either was passed in as empty, remove it from the record
        if (crumbsToPass.breadcrumbId === '') {
          delete crumbsToPass.breadcrumbId;
        }
        if (crumbsToPass.breadcrumbEvent === '') {
          delete crumbsToPass.breadcrumbEvent;
        }

        const relativeURL = { search: querystring.stringify(crumbsToPass) };

        return history.replace(relativeURL);
      },
      [history, urlSearch]
    );

    const handleClick = useCallback(() => {
      if (animationTarget.current !== null) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (animationTarget.current as any).beginElement();
      }
      dispatch({
        type: 'userSelectedResolverNode',
        payload: uniquePID,
      });
      pushToQueryParams({ breadcrumbId: uniquePID, breadcrumbEvent: 'all' });
    }, [animationTarget, dispatch, uniquePID, pushToQueryParams]);

    /**
     * Enumerates the stats for related events to display with the node as options,
     * generally in the form `number of related events in category` `category title`
     * e.g. "10 DNS", "230 File"
     */

    const relatedEventOptions = useMemo(() => {
      const relatedStatsList = [];

      if (!relatedEventsStatsForProcess) {
        // Return an empty set of options if there are no stats to report
        return [];
      }
      // If we have entries to show, map them into options to display in the selectable list

      for (const [category, total] of Object.entries(
        relatedEventsStatsForProcess.events.byCategory
      )) {
        relatedStatsList.push({
          prefix: <EuiI18nNumber value={total || 0} />,
          optionTitle: category,
          action: () => {
            dispatch({
              type: 'userSelectedRelatedEventCategory',
              payload: {
                subject: event,
                category,
              },
            });

            pushToQueryParams({
              breadcrumbId: uniquePidForProcess(event),
              breadcrumbEvent: category,
            });
          },
        });
      }
      return relatedStatsList;
    }, [relatedEventsStatsForProcess, dispatch, event, pushToQueryParams]);

    const relatedEventStatusOrOptions = !relatedEventsStatsForProcess
      ? i18n.translate('xpack.securitySolution.endpoint.resolver.relatedNotRetrieved', {
          defaultMessage: 'Related Events have not yet been retrieved.',
        })
      : relatedEventOptions;

    const grandTotal: number | null = useSelector(selectors.relatedEventTotalForProcess)(event);

    const cubeSvg = useMemo(() => {
      return (
        <CubeSvg
          viewBox={`0 0 ${svgViewportLength} ${svgViewportLength}`}
          style={{
            width: `${svgScreenLength}px`,
            height: `${svgScreenLength}px`,
          }}
          preserveAspectRatio="xMidYMid meet"
        >
          <g>
            <use
              xlinkHref={`#${SymbolIds.processCubeActiveBacking}`}
              fill={backingFill} // Only visible on hover
              x="0"
              y="0"
              stroke={strokeColor}
              width={svgViewportLength}
              height={svgViewportLength}
              className="backing"
            />
            <use
              role="presentation"
              xlinkHref={cubeSymbol}
              x={backingBorder}
              y={backingBorder}
              width={markerSize}
              height={markerSize}
              opacity="1"
              className="cube"
            >
              <animateTransform
                attributeType="XML"
                attributeName="transform"
                type="scale"
                values="1 1; 1 .83; 1 .8; 1 .83; 1 1"
                dur="0.2s"
                repeatCount="1"
                ref={animationTarget}
              />
            </use>
          </g>
        </CubeSvg>
      );
    }, [backingFill, cubeSymbol, strokeColor, svgScreenLength, svgViewportLength]);

    const styledActionsContainer = useMemo(() => {
      return (
        <StyledActionsContainer
          color={colorMap.full}
          backgroundColor={colorMap.resolverBackground}
          style={{
            fontSize: `${scaledTypeSize}px`,
            marginLeft: `${actionsContainerMarginLeft}px`,
            marginTop: `${actionsContainerMarginTop}px`,
          }}
        >
          <StyledDescriptionText
            backgroundColor={colorMap.resolverBackground}
            color={colorMap.descriptionText}
            style={{
              display: isShowingDescriptionText ? 'block' : 'none',
            }}
          >
            {descriptionText}
          </StyledDescriptionText>
          <EuiButton
            onClick={handleClick}
            onFocus={handleFocus}
            tabIndex={-1}
            color={labelButtonFill}
            fill={isLabelFilled}
            id={labelId}
            size="s"
            style={{
              maxHeight: `${Math.min(26 + xScale * 3, 32)}px`,
              maxWidth: `${isShowingEventActions ? 400 : 210 * xScale}px`,
            }}
            title={eventModel.eventName(event)}
          >
            {eventModel.eventName(event)}
          </EuiButton>
          {isShowingEventActions && grandTotal !== null && grandTotal > 0 && (
            <NodeSubMenu
              isProcessOrigin={isProcessOrigin}
              isProcessTerminated={isProcessTerminated}
              event={event}
              optionsWithActions={relatedEventStatusOrOptions}
            />
          )}
        </StyledActionsContainer>
      );
    }, [
      actionsContainerMarginTop,
      actionsContainerMarginLeft,
      colorMap.descriptionText,
      colorMap.full,
      colorMap.resolverBackground,
      descriptionText,
      event,
      grandTotal,
      handleClick,
      handleFocus,
      handleRelatedEventRequest,
      isLabelFilled,
      isShowingDescriptionText,
      isShowingEventActions,
      labelButtonFill,
      labelId,
      relatedEventStatusOrOptions,
      scaledTypeSize,
      xScale,
    ]);

    const nodeLevel = useSelector(selectors.nodeLevel)(event);
    const nextSiblingUniquePID = useSelector(selectors.nextSiblingUniquePID)(event);

    /**
     * Key event handling (e.g. 'Enter'/'Space') is provisioned by the `EuiKeyboardAccessible` component
     */
    return (
      <Wrapper
        className="kbn-resetFocusState"
        role="treeitem"
        aria-level={nodeLevel}
        aria-flowto={nextSiblingUniquePID === null ? undefined : nextSiblingUniquePID}
        aria-labelledby={labelId}
        aria-describedby={descriptionId}
        aria-haspopup={'true'}
        aria-current={isActiveDescendant ? 'true' : undefined}
        aria-selected={isSelectedDescendant ? 'true' : undefined}
        style={nodeViewportStyle}
        id={nodeId}
        tabIndex={-1}
      >
        {cubeSvg}
        {styledActionsContainer}
      </Wrapper>
    );
  }
);
