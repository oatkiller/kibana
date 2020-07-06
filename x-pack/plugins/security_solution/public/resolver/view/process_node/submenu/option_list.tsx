/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

/* eslint-disable no-duplicate-imports */

import { EuiI18nNumber, EuiSelectable } from '@elastic/eui';

/* eslint-disable react/display-name */

import React, { useMemo, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { EuiSelectableOption } from '@elastic/eui';
import { usePanelStateSetter } from '../../use_panel_state_setter';
import { ResolverEvent, ResolverNodeStats } from '../../../../../common/endpoint/types';
import * as selectors from '../../../store/selectors';
import { uniquePidForProcess } from '../../../models/process_event';
import { OptionListItem } from './styles';
import { PanelQueryStringState } from '../../../types';

// TODO, this component probably should not have `checked` state, that should come from the query string
/**
 * Enumerates the stats for related events to display with the node as options,
 * generally in the form `number of related events in category` `category title`
 * e.g. "10 DNS", "230 File"
 */
export const OptionList = React.memo(({ event }: { event: ResolverEvent }) => {
  const setPanelState = usePanelStateSetter();
  const nodeID = uniquePidForProcess(event);

  /* TODO */
  const relatedEventsStats = useSelector(selectors.relatedEventsStats);
  // TODO
  const relatedEventsStatsForProcess: ResolverNodeStats | undefined = relatedEventsStats?.get(
    nodeID
  );

  const isLoading: boolean = !relatedEventsStatsForProcess;

  // the event category selected by the panel
  const panelEventCategory: string | null = useSelector(selectors.panelEventCategory);

  // Recalculate the options when the user selection changes or when the related stats changes.
  const options: EuiSelectableOption[] = useMemo(() => {
    if (!relatedEventsStatsForProcess) {
      // Return an empty set of options if there are no stats to report
      return [];
    }

    const categoriesAndTotals = Object.entries(relatedEventsStatsForProcess.events.byCategory);

    // sort the entries by the categories
    // TODO, move into selector
    categoriesAndTotals.sort(function ([first], [second]) {
      return first.localeCompare(second);
    });

    return categoriesAndTotals.map(function ([category, total]): EuiSelectableOption {
      return {
        prepend: (
          <span>
            <EuiI18nNumber value={total || 0} />{' '}
          </span>
        ),
        key: category,
        label: category,
        // Use `undefined` to mean not-checked. `'off'` means explicity excluded and has a different behavior
        checked: category === panelEventCategory ? 'on' : undefined,
      };
    });
  }, [panelEventCategory, relatedEventsStatsForProcess]);

  const onChange = useCallback(
    // the user selected something (or unselected something.)
    (newOptions: EuiSelectableOption[]) => {
      const selectedOption = newOptions.find((option) => option.checked === 'on');

      // NB: we always provide a `key` for the selected options, but the type marks it as optional
      const selectedCategory =
        selectedOption && selectedOption.key !== undefined ? selectedOption.key : null;

      // Passing `breadcrumbEvent` as `''` should have the same effect as 'unselecting' the current category if there is one.
      const panelState: PanelQueryStringState =
        selectedCategory === null
          ? {
              panelView: 'processDetail',
              panelNodeID: nodeID,
            }
          : {
              panelView: 'processEventListNarrowedByType',
              panelNodeID: nodeID,
              panelEventCategory: selectedCategory,
            };

      setPanelState(panelState);
    },
    [nodeID, setPanelState]
  );

  return (
    <EuiSelectable
      listProps={{ showIcons: true, bordered: true }}
      onChange={onChange}
      singleSelection
      options={options}
      isLoading={isLoading}
    >
      {(list) => <OptionListItem>{list}</OptionListItem>}
    </EuiSelectable>
  );
});
