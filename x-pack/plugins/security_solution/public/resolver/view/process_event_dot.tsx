/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

/* eslint-disable react/display-name */

import React, { useMemo, CSSProperties } from 'react';
import { applyMatrix3 } from '../models/vector2';
import { Vector2, Matrix3 } from '../types';
import { ResolverEvent } from '../../../common/endpoint/types';

/*
 * debugging element.
 * replace the ProcessNode w/ this if helpful during debugging
 */
export const ProcessEventDot = React.memo(
  ({
    position,
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
    /**
     * Convert the position, which is in 'world' coordinates, to screen coordinates.
     */
    const [left, top] = applyMatrix3(position, projectionMatrix);

    const nodeViewportStyle: CSSProperties = useMemo(
      () => ({
        left: `${left}px`,
        top: `${top}px`,
        display: 'block',
        position: 'absolute',
        width: '50px',
        height: '50px',
        backgroundColor: 'pink',
      }),
      [left, top]
    );

    return <div style={nodeViewportStyle} tabIndex={-1} />;
  }
);
