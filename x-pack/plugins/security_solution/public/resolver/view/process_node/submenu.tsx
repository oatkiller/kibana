/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

/* eslint-disable react/display-name */

import React, { ReactNode, useState, useMemo, useCallback } from 'react';
import { EuiI18nNumber, EuiSelectable, EuiButton, EuiPopover, htmlIdGenerator } from '@elastic/eui';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import { i18n } from '@kbn/i18n';
import * as selectors from '../../store/selectors';
import { ResolverEvent } from '../../../../common/endpoint/types';
import { useResolverTheme } from '../assets';
import { useResolverDispatch } from '../use_resolver_dispatch';
import { uniquePidForProcess } from '../../models/process_event';

/**
 * i18n-translated titles for submenus and identifiers for display of states:
 *   initialMenuStatus: submenu before it has been opened / requested data
 *   menuError: if the submenu requested data, but received an error
 */

// TODO
const idGenerator = htmlIdGenerator();

interface ResolverSubmenuOption {
  optionTitle: string;
  action: () => unknown;
  prefix?: number | JSX.Element;
}

type ResolverSubmenuOptionList = ResolverSubmenuOption[] | string;

const OptionListItem = styled.div`
  width: 175px;
`;

const OptionList = React.memo(
  ({
    subMenuOptions,
    isLoading,
  }: {
    subMenuOptions: ResolverSubmenuOptionList;
    isLoading: boolean;
  }) => {
    const [options, setOptions] = useState(() =>
      typeof subMenuOptions !== 'object'
        ? []
        : subMenuOptions.map((opt: ResolverSubmenuOption): {
            label: string;
            prepend?: ReactNode;
          } => {
            return opt.prefix
              ? {
                  label: opt.optionTitle,
                  prepend: <span>{opt.prefix} </span>,
                }
              : {
                  label: opt.optionTitle,
                  prepend: <span />,
                };
          })
    );

    const actionsByLabel: Record<string, () => unknown> = useMemo(() => {
      if (typeof subMenuOptions !== 'object') {
        return {};
      }
      return subMenuOptions.reduce((titleActionRecord, opt) => {
        const { optionTitle, action } = opt;
        return { ...titleActionRecord, [optionTitle]: action };
      }, {});
    }, [subMenuOptions]);

    type ChangeOptions = Array<{ label: string; prepend?: ReactNode; checked?: string }>;
    const selectableProps = useMemo(() => {
      return {
        listProps: { showIcons: true, bordered: true },
        onChange: (newOptions: ChangeOptions) => {
          const selectedOption = newOptions.find((opt) => opt.checked === 'on');
          if (selectedOption) {
            const { label } = selectedOption;
            const actionToTake = actionsByLabel[label];
            if (typeof actionToTake === 'function') {
              actionToTake();
            }
          }
          setOptions(newOptions);
        },
      };
    }, [actionsByLabel]);

    return (
      <EuiSelectable
        singleSelection={true}
        options={options}
        {...selectableProps}
        isLoading={isLoading}
      >
        {(list) => <OptionListItem>{list}</OptionListItem>}
      </EuiSelectable>
    );
  }
);

/**
 * A Submenu to be displayed in one of two forms:
 *   1) Provided a collection of `optionsWithActions`: it will call `menuAction` then - if and when menuData becomes available - display each item with an optional prefix and call the supplied action for the options when that option is clicked.
 *   2) Provided `optionsWithActions` is undefined, it will call the supplied `menuAction` when its host button is clicked.
 */
export const NodeSubMenu = React.memo(
  ({
    optionsWithActions,
    event,
    isProcessTerminated,
    isProcessOrigin,
  }: {
    event: ResolverEvent;
    isProcessTerminated: boolean;
    isProcessOrigin: boolean;
    optionsWithActions?: ResolverSubmenuOptionList | string | undefined;
  }) => {
    const {
      colorMap: { resolverBackground },
      cubeAssetsForNode,
    } = useResolverTheme();
    const { labelButtonFill } = cubeAssetsForNode(isProcessTerminated, isProcessOrigin);

    const dispatch = useResolverDispatch();
    const menuAction = useCallback(() => {
      dispatch({
        type: 'userRequestedRelatedEventData',
        payload: uniquePidForProcess(event),
      });
    }, [dispatch, event]);

    const count: number | null = useSelector(selectors.relatedEventTotalForProcess)(event);

    const [menuIsOpen, setMenuOpen] = useState(false);
    const handleMenuOpenClick = useCallback(
      (clickEvent: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        // stopping propagation/default to prevent other node animations from triggering
        clickEvent.preventDefault();
        clickEvent.stopPropagation();
        setMenuOpen(!menuIsOpen);
      },
      [menuIsOpen]
    );
    const handleMenuActionClick = useCallback(
      (clickEvent: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        // stopping propagation/default to prevent other node animations from triggering
        clickEvent.preventDefault();
        clickEvent.stopPropagation();
        if (typeof menuAction === 'function') menuAction();
        setMenuOpen(true);
      },
      [menuAction]
    );

    const closePopover = useCallback(() => setMenuOpen(false), []);
    const popoverId = idGenerator('submenu-popover');

    const isMenuLoading = optionsWithActions === 'waitingForRelatedEventData';

    if (!optionsWithActions) {
      /**
       * When called with a `menuAction`
       * Render without dropdown and call the supplied action when host button is clicked
       */
      return (
        <div className={className}>
          <EuiButton onClick={handleMenuActionClick} color={labelButtonFill} size="s" tabIndex={-1}>
            {i18n.translate('xpack.securitySolution.endpoint.resolver.relatedEvents', {
              defaultMessage: 'Events',
            })}
          </EuiButton>
        </div>
      );
    }
    /**
     * When called with a set of `optionsWithActions`:
     * Render with a panel of options that appear when the menu host button is clicked
     */

    const submenuPopoverButton = (
      <EuiButton
        onClick={
          typeof optionsWithActions === 'object' ? handleMenuOpenClick : handleMenuActionClick
        }
        color={labelButtonFill}
        size="s"
        iconType={menuIsOpen ? 'arrowUp' : 'arrowDown'}
        iconSide="right"
        tabIndex={-1}
      >
        {count && <EuiI18nNumber value={count} />}{' '}
        {i18n.translate('xpack.securitySolution.endpoint.resolver.relatedEvents', {
          defaultMessage: 'Events',
        })}
      </EuiButton>
    );

    return (
      <Wrapper
        buttonBorderColor={labelButtonFill}
        buttonFill={resolverBackground}
        className={menuIsOpen ? ' is-open' : ''}
      >
        <EuiPopover
          id={popoverId}
          panelPaddingSize="none"
          button={submenuPopoverButton}
          isOpen={menuIsOpen}
          closePopover={closePopover}
          repositionOnScroll
        >
          {menuIsOpen && typeof optionsWithActions === 'object' && (
            <OptionList isLoading={isMenuLoading} subMenuOptions={optionsWithActions} />
          )}
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
