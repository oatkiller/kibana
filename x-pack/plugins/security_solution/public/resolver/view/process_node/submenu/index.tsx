/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

/* eslint-disable react/display-name */

import React, { useState, useCallback } from 'react';
import { EuiI18nNumber, EuiButton, EuiPopover } from '@elastic/eui';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import { FormattedMessage } from '@kbn/i18n/react';
import * as selectors from '../../../store/selectors';
import { ResolverEvent } from '../../../../../common/endpoint/types';
import { useResolverTheme } from '../../assets';
import { useResolverDispatch } from '../../use_resolver_dispatch';
import { uniquePidForProcess } from '../../../models/process_event';
import { OptionList } from './option_list';

/**
 * A Submenu to be displayed in one of two forms:
 *   1) Provided a collection of `optionsWithActions`: it will call `menuAction` then - if and when menuData becomes available - display each item with an optional prefix and call the supplied action for the options when that option is clicked.
 *   2) Provided `optionsWithActions` is undefined, it will call the supplied `menuAction` when its host button is clicked.
 */
export const NodeSubMenu = React.memo(
  ({
    event,
    isProcessTerminated,
    isProcessOrigin,
  }: {
    event: ResolverEvent;
    isProcessTerminated: boolean;
    isProcessOrigin: boolean;
  }) => {
    const dispatch = useResolverDispatch();

    // TODO

    const {
      colorMap: { resolverBackground },
      cubeAssetsForNode,
    } = useResolverTheme();
    const { labelButtonFill } = cubeAssetsForNode(isProcessTerminated, isProcessOrigin);

    const count: number | null = useSelector(selectors.relatedEventTotalForProcess)(event);

    const [menuIsOpen, setMenuOpen] = useState(false);
    const onClick = useCallback(() => {
      if (!menuIsOpen) {
        // if the user is opening the menu, fire this
        // TODO
        dispatch({
          type: 'userRequestedRelatedEventData',
          payload: uniquePidForProcess(event),
        });
      }

      setMenuOpen(!menuIsOpen);
    }, [menuIsOpen, dispatch, event]);

    const closePopover = useCallback(() => setMenuOpen(false), []);

    return (
      <Wrapper
        buttonBorderColor={labelButtonFill}
        buttonFill={resolverBackground}
        className={menuIsOpen ? ' is-open' : ''}
      >
        <EuiPopover
          panelPaddingSize="none"
          button={
            <EuiButton
              onClick={onClick}
              color={labelButtonFill}
              size="s"
              iconType={menuIsOpen ? 'arrowUp' : 'arrowDown'}
              iconSide="right"
              tabIndex={-1}
            >
              <FormattedMessage
                id="xpack.securitySolution.endpoint.resolver.relatedEvents"
                defaultMessage="{ count } Events"
                values={{ count: count === null ? '' : <EuiI18nNumber value={count} /> }}
              />
            </EuiButton>
          }
          isOpen={menuIsOpen}
          closePopover={closePopover}
          repositionOnScroll
        >
          {menuIsOpen && <OptionList event={event} />}
        </EuiPopover>
      </Wrapper>
    );
  }
);

const Wrapper = styled.div<{ buttonFill: string; buttonBorderColor: string }>`
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
