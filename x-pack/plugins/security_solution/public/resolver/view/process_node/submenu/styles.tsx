/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */
import styled from 'styled-components';

export const Wrapper = styled.div<{ buttonFill: string; buttonBorderColor: string }>`
  margin: 2px 0 0 0;
  padding: 0;
  border: none;
  display: flex;
  flex-flow: column;

  & .euiButton {
    background-color: ${(props) => props.buttonFill};
    border-color: ${(props) => props.buttonBorderColor};
    border-style: solid;
    border-width: 1px;

    &:hover,
    &:active,
    &:focus {
      background-color: ${(props) => props.buttonFill};
    }
  }

  & .euiPopover__anchor {
    display: flex;
  }

  &.is-open .euiButton {
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
  }
  &.is-open .euiSelectableListItem__prepend {
    color: white;
  }
`;

export const OptionListItem = styled.div`
  width: 175px;
`;
