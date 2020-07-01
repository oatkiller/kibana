/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */
import styled from 'styled-components';

export const StyledEdgeLine = styled.div<{
  readonly resolverEdgeColor: string;
}>`
  // Transform from the left of the div, as the left side of the div is positioned at the start point of the line segment.
  transform-origin: left center;
  position: absolute;
  background-color: ${(props) => props.resolverEdgeColor};
`;

export const StyledElapsedTime = styled.div<{
  readonly backgroundColor: string;
  readonly textColor: string;
}>`
  background-color: ${(props) => props.backgroundColor};
  color: ${(props) => props.textColor};
  font-weight: bold;
  max-width: 75%;
  overflow: hidden;
  position: absolute;
  text-overflow: ellipsis;
  top: 50%;
  white-space: nowrap;
  left: 50%;
  padding: 6px 8px;
  border-radius: 999px; // generate pill shape
  transform: translate(-50%, -50%) rotateX(35deg);
  user-select: none;
`;
