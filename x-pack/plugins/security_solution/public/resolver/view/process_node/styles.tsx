/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import styled from 'styled-components';

export const CubeSvg = styled('svg')`
  display: block;
  position: absolute;
  top: 0;
  left: 0;
`;

export const StyledDescriptionText = styled.div<{
  readonly backgroundColor: string;
  readonly color: string;
}>`
  background-color: ${(props) => props.backgroundColor};
  color: ${(props) => props.color};
  font-size: 0.8rem;
  font-weight: bold;
  letter-spacing: -0.01px;
  line-height: 1;
  // This element and its siblings make up the 'actions container'.
  // The actions container should have its vertical center aligned with the vertical center of the cube.
  // This element has no background color, so it doesn't really add to the visual weight.
  // Therefore give it a negative top margin, shifting everything up to accomodate.
  // The margin should be the same as font-size * -1 because line-height is 1
  margin: -0.8rem 0 0 0;
  padding: 4px 0 0 2px;
  text-align: left;
  text-transform: uppercase;
  width: fit-content;
`;

export const StyledActionsContainer = styled.div<{
  readonly color: string;
  readonly backgroundColor: string;
}>`
  color: ${(props) => props.color};
  background-color: ${(props) => props.backgroundColor};
  padding: 2px;
  border-radius: 2px;
  display: flex;
  flex-flow: column;
  align-items: flex-start;
  // the marginTop is set via style to the position that we want the vertical center of the component to be
  // so we translate up by half
  transform: translateY(-50%);
`;

export const Wrapper = styled.div`
  position: absolute;
  text-align: left;
  font-size: 10px;
  user-select: none;
  box-sizing: border-box;
  border-radius: 10%;
  white-space: nowrap;
  will-change: left, top, min-width, min-height;
  contain: layout;

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
