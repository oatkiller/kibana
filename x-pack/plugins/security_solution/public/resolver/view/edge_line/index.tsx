/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

/* eslint-disable react/display-name */
import { i18n } from '@kbn/i18n';

import React, { useMemo } from 'react';
import { applyMatrix3, distance, angle } from '../../models/vector2';
import { Vector2, Matrix3, EdgeLineMetadata } from '../../types';
import { useResolverTheme, calculateResolverFontSize } from '../assets';
import { StyledEdgeLine, StyledElapsedTime } from './styles';

/**
 * A placeholder line segment view that connects process nodes.
 */
export const EdgeLine = React.memo(
  ({
    className,
    edgeLineMetadata,
    startPosition,
    endPosition,
    projectionMatrix,
  }: {
    /**
     * A className string provided by `styled`
     */
    className?: string;
    /**
     * Time elapsed betweeen process nodes
     */
    edgeLineMetadata?: EdgeLineMetadata;
    /**
     * The postion of first point in the line segment. In 'world' coordinates.
     */
    startPosition: Vector2;
    /**
     * The postion of second point in the line segment. In 'world' coordinates.
     */
    endPosition: Vector2;
    /**
     * projectionMatrix which can be used to convert `startPosition` and `endPosition` to screen coordinates.
     */
    projectionMatrix: Matrix3;
  }) => {
    /**
     * Convert the start and end positions, which are in 'world' coordinates,
     * to `left` and `top` css values.
     */
    const screenStart = applyMatrix3(startPosition, projectionMatrix);
    const screenEnd = applyMatrix3(endPosition, projectionMatrix);
    const [xScale] = projectionMatrix;
    const { colorMap } = useResolverTheme();
    const elapsedTime = edgeLineMetadata?.elapsedTime;

    /**
     * We render the line using a short, long, `div` element. The length of this `div`
     * should be the same as the distance between the start and end points.
     */
    const length = distance(screenStart, screenEnd);
    const scaledTypeSize = calculateResolverFontSize(xScale, 10, 7.5);

    const fontStyle = useMemo(
      () => ({
        fontSize: `${scaledTypeSize}px`,
      }),
      [scaledTypeSize]
    );
    const edgeAngle = angle(screenStart, screenEnd);
    const edgeLeft = screenStart[0];
    const edgeTop = screenStart[1];
    const edgeHeight = calculateResolverFontSize(xScale, 12, 8.5);

    const style = useMemo(
      () => ({
        left: `${edgeLeft}px`,
        top: `${edgeTop}px`,
        width: `${length}px`,
        /**
         * Translate the `div` in the y axis to accomodate for the height of the `div`.
         * Also rotate the `div` in the z axis so that it's angle matches the angle
         * between the start and end points.
         */
        transform: `translateY(-50%) rotateZ(${edgeAngle}rad)`,

        height: `${edgeHeight}px`,
      }),
      [edgeLeft, edgeTop, length, edgeAngle, edgeHeight]
    );

    return (
      <StyledEdgeLine
        role="presentation"
        className={className}
        style={style}
        resolverEdgeColor={colorMap.resolverEdge}
      >
        {elapsedTime && (
          <StyledElapsedTime
            backgroundColor={colorMap.resolverEdge}
            textColor={colorMap.resolverEdgeText}
            style={fontStyle}
          >
            {i18n.translate('xpack.securitySolution.endpoint.resolver.elapsedTime', {
              defaultMessage: '{duration} {durationType}',
              values: {
                duration: elapsedTime.duration,
                durationType: elapsedTime.durationType,
              },
            })}
          </StyledElapsedTime>
        )}
      </StyledEdgeLine>
    );
  }
);
