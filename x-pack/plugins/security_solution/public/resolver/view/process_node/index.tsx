/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

/* eslint-disable react/display-name */

import React, { useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { i18n } from '@kbn/i18n';
import { htmlIdGenerator, EuiButton, EuiI18nNumber, EuiFlexGroup, EuiFlexItem } from '@elastic/eui';
import { useHistory } from 'react-router-dom';
// eslint-disable-next-line import/no-nodejs-modules
import querystring from 'querystring';
import { useSelector } from 'react-redux';
import { NodeSubMenu } from './submenu';
import { applyMatrix3 } from '../../models/vector2';
import { Vector2, Matrix3, AdjacentProcessMap, BreadcrumbState } from '../../types';
// TODO
import { SymbolIds, useResolverTheme, calculateResolverFontSize } from '../assets';
// TODO
import { ResolverEvent, ResolverNodeStats } from '../../../../common/endpoint/types';
import { useResolverDispatch } from '../use_resolver_dispatch';
// TODO
import * as eventModel from '../../../../common/endpoint/models/event';
import * as selectors from '../../store/selectors';
import { CubeSvg } from './styles';

const StyledActionsContainer = styled.div<{
  readonly color: string;
}>`
  background-color: transparent;
  color: ${(props) => props.color};
  display: flex;
  flex-flow: column;
  line-height: 140%;
  padding: 0.25rem 0 0 0.1rem;
  position: absolute;
`;

interface StyledDescriptionText {
  readonly backgroundColor: string;
  readonly color: string;
  readonly isDisplaying: boolean;
}

const StyledDescriptionText = styled.div<StyledDescriptionText>`
  background-color: ${(props) => props.backgroundColor};
  color: ${(props) => props.color};
  display: ${(props) => (props.isDisplaying ? 'block' : 'none')};
  font-size: 0.8rem;
  font-weight: bold;
  letter-spacing: -0.01px;
  line-height: 1;
  margin: 0;
  padding: 4px 0 0 2px;
  text-align: left;
  text-transform: uppercase;
  width: fit-content;
`;

/**
 * An artifact that represents a process node and the things associated with it in the Resolver
 */
const UnstyledProcessNode = React.memo(
  ({
    className,
    position,
    event,
    projectionMatrix,
    adjacentNodeMap,
    isProcessTerminated,
    isProcessOrigin,
    relatedEventsStatsForProcess,
  }: {
    /**
     * A `className` string provided by `styled`
     */
    className?: string;
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
     * map of what nodes are "adjacent" to this one in "up, down, previous, next" directions
     */
    adjacentNodeMap: AdjacentProcessMap;
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
    const selfId = adjacentNodeMap.self;
    const activeDescendantId = useSelector(selectors.uiActiveDescendantId);
    const selectedDescendantId = useSelector(selectors.uiSelectedDescendantId);

    // Entity ID of self
    const selfEntityId = eventModel.entityId(event);

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
    const worldUnitsPerSvgUnit = 5;

    // the width/height of the SVG element, in pixels
    const svgScreenLength = svgViewportLength * xScale * worldUnitsPerSvgUnit;

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
    const animationTarget: {
      current:
        | (SVGAnimationElement & {
            /**
             * `beginElement` is by [w3](https://www.w3.org/TR/SVG11/animate.html#__smil__ElementTimeControl__beginElement)
             * but missing in [TSJS-lib-generator](https://github.com/microsoft/TSJS-lib-generator/blob/15a4678e0ef6de308e79451503e444e9949ee849/inputfiles/addedTypes.json#L1819)
             */
            beginElement: () => void;
          })
        | null;
    } = React.createRef();
    const { colorMap, cubeAssetsForNode } = useResolverTheme();
    const {
      backingFill,
      cubeSymbol,
      descriptionText,
      isLabelFilled,
      labelButtonFill,
      strokeColor,
    } = cubeAssetsForNode(isProcessTerminated, isProcessOrigin);

    const resolverNodeIdGenerator = useMemo(() => htmlIdGenerator('resolverNode'), []);

    const nodeId = useMemo(() => resolverNodeIdGenerator(selfId), [
      resolverNodeIdGenerator,
      selfId,
    ]);
    const labelId = useMemo(() => resolverNodeIdGenerator(), [resolverNodeIdGenerator]);
    const descriptionId = useMemo(() => resolverNodeIdGenerator(), [resolverNodeIdGenerator]);
    const isActiveDescendant = nodeId === activeDescendantId;
    const isSelectedDescendant = nodeId === selectedDescendantId;

    const dispatch = useResolverDispatch();

    const handleFocus = useCallback(() => {
      dispatch({
        type: 'userFocusedOnResolverNode',
        payload: {
          nodeId,
        },
      });
    }, [dispatch, nodeId]);

    const handleRelatedEventRequest = useCallback(() => {
      dispatch({
        type: 'userRequestedRelatedEventData',
        payload: selfId,
      });
    }, [dispatch, selfId]);

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
        payload: {
          nodeId,
          selectedProcessId: selfId,
        },
      });
      pushToQueryParams({ breadcrumbId: selfEntityId, breadcrumbEvent: 'all' });
    }, [animationTarget, dispatch, nodeId, selfEntityId, pushToQueryParams, selfId]);

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

            pushToQueryParams({ breadcrumbId: selfEntityId, breadcrumbEvent: category });
          },
        });
      }
      return relatedStatsList;
    }, [relatedEventsStatsForProcess, dispatch, event, pushToQueryParams, selfEntityId]);

    const relatedEventStatusOrOptions = !relatedEventsStatsForProcess
      ? i18n.translate('xpack.securitySolution.endpoint.resolver.relatedNotRetrieved', {
          defaultMessage: 'Related Events have not yet been retrieved.',
        })
      : relatedEventOptions;

    const grandTotal: number | null = useSelector(selectors.relatedEventTotalForProcess)(event);

    /* eslint-disable jsx-a11y/click-events-have-key-events */
    /**
     * Key event handling (e.g. 'Enter'/'Space') is provisioned by the `EuiKeyboardAccessible` component
     */
    return (
      <div
        className={`${className} kbn-resetFocusState`}
        role="treeitem"
        aria-level={adjacentNodeMap.level}
        aria-flowto={adjacentNodeMap.nextSibling === null ? undefined : adjacentNodeMap.nextSibling}
        aria-labelledby={labelId}
        aria-describedby={descriptionId}
        aria-haspopup={'true'}
        aria-current={isActiveDescendant ? 'true' : undefined}
        aria-selected={isSelectedDescendant ? 'true' : undefined}
        style={nodeViewportStyle}
        id={nodeId}
        tabIndex={-1}
      >
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
                className="squish"
                ref={animationTarget}
              />
            </use>
          </g>
        </CubeSvg>
        <StyledActionsContainer
          color={colorMap.full}
          style={{
            fontSize: `${scaledTypeSize}px`,
            top: `0`,
            left: `${svgScreenLength}px`,
          }}
        >
          <StyledDescriptionText
            backgroundColor={colorMap.resolverBackground}
            color={colorMap.descriptionText}
            isDisplaying={isShowingDescriptionText}
          >
            {descriptionText}
          </StyledDescriptionText>
          <div
            className={xScale >= 2 ? 'euiButton' : 'euiButton euiButton--small'}
            data-test-subject="nodeLabel"
            id={labelId}
            onClick={handleClick}
            onFocus={handleFocus}
            tabIndex={-1}
            style={{
              // TODO, styled components
              backgroundColor: colorMap.resolverBackground,
              alignSelf: 'flex-start',
              padding: 0,
            }}
          >
            <EuiButton
              color={labelButtonFill}
              data-test-subject="nodeLabel"
              fill={isLabelFilled}
              id={labelId}
              size="s"
              style={{
                // TODO, styled components
                maxHeight: `${Math.min(26 + xScale * 3, 32)}px`,
                maxWidth: `${isShowingEventActions ? 400 : 210 * xScale}px`,
              }}
              tabIndex={-1}
              title={eventModel.eventName(event)}
            >
              <span className="euiButton__content">
                <span className="euiButton__text" data-test-subj={'euiButton__text'}>
                  {eventModel.eventName(event)}
                </span>
              </span>
            </EuiButton>
          </div>
          <EuiFlexGroup
            justifyContent="flexStart"
            gutterSize="xs"
            style={{
              // TODO, styled components
              alignSelf: 'flex-start',
              background: colorMap.resolverBackground,
              display: `${isShowingEventActions ? 'flex' : 'none'}`,
              margin: 0,
              padding: 0,
            }}
          >
            <EuiFlexItem grow={false} className="related-dropdown">
              {grandTotal !== null && grandTotal > 0 && (
                <NodeSubMenu
                  count={grandTotal}
                  buttonBorderColor={labelButtonFill}
                  buttonFill={colorMap.resolverBackground}
                  menuAction={handleRelatedEventRequest}
                  menuTitle={i18n.translate(
                    'xpack.securitySolution.endpoint.resolver.relatedEvents',
                    {
                      defaultMessage: 'Events',
                    }
                  )}
                  optionsWithActions={relatedEventStatusOrOptions}
                />
              )}
            </EuiFlexItem>
          </EuiFlexGroup>
        </StyledActionsContainer>
      </div>
    );
    /* eslint-enable jsx-a11y/click-events-have-key-events */
  }
);

export const ProcessNode = styled(UnstyledProcessNode)`
  position: absolute;
  text-align: left;
  font-size: 10px;
  user-select: none;
  box-sizing: border-box;
  border-radius: 10%;
  white-space: nowrap;
  will-change: left, top, width, height;
  contain: layout;
  // why?
  min-width: 280px;
  // why?
  min-height: 90px;
  overflow-y: visible;

  //dasharray & dashoffset should be equal to "pull" the stroke back
  //when it is transitioned.
  //The value is tuned to look good when animated, but to preserve
  //the effect, it should always be _at least_ the length of the stroke
  & .backing {
    stroke-dasharray: 500;
    stroke-dashoffset: 500;
    fill-opacity: 0;
  }
  &:hover:not([aria-current]) .backing {
    transition-property: fill-opacity;
    transition-duration: 0.25s;
    fill-opacity: 1; // actual color opacity handled in the fill hex
  }

  &[aria-current] .backing {
    transition-property: stroke-dashoffset;
    transition-duration: 1s;
    stroke-dashoffset: 0;
  }

  & .euiButton {
    width: fit-content;
  }

  & .euiSelectableList-bordered {
    border-top-right-radius: 0px;
    border-top-left-radius: 0px;
  }
  & .euiSelectableListItem {
    background-color: black;
  }
  & .euiSelectableListItem path {
    fill: white;
  }
  & .euiSelectableListItem__text {
    color: white;
  }
`;
