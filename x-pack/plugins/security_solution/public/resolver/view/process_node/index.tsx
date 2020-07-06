/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

/* eslint-disable react/display-name */

import React, { useCallback, useMemo, useRef } from 'react';
import { htmlIdGenerator, EuiButton } from '@elastic/eui';
import { useSelector } from 'react-redux';
import { Submenu } from './submenu';
import { applyMatrix3 } from '../../models/vector2';
import { Vector2, Matrix3 } from '../../types';
// TODO
import { SymbolIds, useResolverTheme, calculateResolverFontSize } from '../assets';
// TODO
import { ResolverEvent } from '../../../../common/endpoint/types';
import * as processEventModel from '../../models/process_event';
import { useResolverDispatch } from '../use_resolver_dispatch';
// TODO
import * as eventModel from '../../../../common/endpoint/models/event';
import * as selectors from '../../store/selectors';
import { CubeSvg, Wrapper, StyledActionsContainer, StyledDescriptionText } from './styles';
import { descriptionForNode } from '../description_for_node';
import { uniquePidForProcess } from '../../models/process_event';
import { usePanelStateSetter } from '../use_panel_state_setter';

/**
 * An artifact that represents a process node and the things associated with it in the Resolver
 */
export const ProcessNode = React.memo(
  ({
    position,
    event,
    projectionMatrix,
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
  }) => {
    const isProcessTerminated = useSelector(selectors.isProcessTerminated);
    const nodeID = uniquePidForProcess(event);

    /**
     * Convert the position, which is in 'world' coordinates, to screen coordinates.
     */
    const [left, top] = applyMatrix3(position, projectionMatrix);

    const [xScale] = projectionMatrix;

    // Node (html id=) IDs
    const activeDescendantId = useSelector(selectors.focusedNode);

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
    } = cubeAssetsForNode(isProcessTerminated(nodeID), false);

    const descriptionText = descriptionForNode(isProcessTerminated, isProcessOrigin);

    const resolverNodeIdGenerator = useMemo(() => htmlIdGenerator(nodeID), [nodeID]);

    const nodeId = resolverNodeIdGenerator('node');
    const labelId = resolverNodeIdGenerator('label');
    const descriptionId = resolverNodeIdGenerator('description');
    const isActiveDescendant = nodeId === activeDescendantId;
    const isSelectedDescendant = useSelector(selectors.selectedNode) === nodeID;

    const dispatch = useResolverDispatch();

    const handleFocus = useCallback(() => {
      dispatch({
        type: 'userFocusedOnResolverNode',
        payload: nodeID,
      });
    }, [dispatch, nodeID]);

    const setPanelState = usePanelStateSetter();

    const handleClick = useCallback(() => {
      if (animationTarget.current !== null) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (animationTarget.current as any).beginElement();
      }
      dispatch({
        type: 'userSelectedResolverNode',
        payload: nodeID,
      });
      setPanelState({ panelView: 'eventCountsForProcess', panelNodeID: nodeID });
    }, [animationTarget, dispatch, nodeID, setPanelState]);

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
            title={processEventModel.name(event)}
          >
            {processEventModel.name(event)}
          </EuiButton>
          {isShowingEventActions && grandTotal !== null && grandTotal > 0 && (
            <Submenu event={event} />
          )}
        </StyledActionsContainer>
      );
    }, [
      actionsContainerMarginTop,
      isProcessTerminated,
      isProcessOrigin,
      actionsContainerMarginLeft,
      colorMap.descriptionText,
      colorMap.full,
      colorMap.resolverBackground,
      descriptionText,
      event,
      grandTotal,
      handleClick,
      handleFocus,
      isLabelFilled,
      isShowingDescriptionText,
      isShowingEventActions,
      labelButtonFill,
      labelId,
      scaledTypeSize,
      xScale,
    ]);

    const nodeLevel = useSelector(selectors.nodeLevel)(nodeID);
    const nextSiblingUniquePID = useSelector(selectors.nextSibling)(nodeID);

    /**
     * Key event handling (e.g. 'Enter'/'Space') is provisioned by the `EuiKeyboardAccessible` component
     */
    return (
      <Wrapper
        className="kbn-resetFocusState"
        role="treeitem"
        aria-level={nodeLevel === null ? undefined : nodeLevel}
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
