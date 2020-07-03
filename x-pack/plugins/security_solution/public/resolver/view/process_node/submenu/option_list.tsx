/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

/* eslint-disable no-duplicate-imports */

import styled from 'styled-components';

import { EuiI18nNumber, EuiSelectable } from '@elastic/eui';

/* eslint-disable react/display-name */

import React, { useState, useMemo, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { EuiSelectableOption } from '@elastic/eui';
import { usePushToQueryParams } from '../../use_push_to_query_params';
import { useResolverDispatch } from '../../use_resolver_dispatch';
import { ResolverEvent } from '../../../../../common/endpoint/types';
import * as selectors from '../../../store/selectors';
import { uniquePidForProcess } from '../../../models/process_event';

export const OptionList = React.memo(({ event }: { event: ResolverEvent }) => {
  const dispatch = useResolverDispatch();
  const pushToQueryParams = usePushToQueryParams();
  const nodeID = uniquePidForProcess(event);
  /* TODO */
  const relatedEventsStats = useSelector(selectors.relatedEventsStats);
  // TODO
  const relatedEventsStatsForProcess = relatedEventsStats?.get(nodeID);

  // TODO checked category
  const [checked, setChecked] = useState<string | null>(null);

  const isLoading = !relatedEventsStatsForProcess;

  /**
   * Enumerates the stats for related events to display with the node as options,
   * generally in the form `number of related events in category` `category title`
   * e.g. "10 DNS", "230 File"
   */

  const options: EuiSelectableOption[] = useMemo(() => {
    const relatedStatsList: EuiSelectableOption[] = [];

    if (!relatedEventsStatsForProcess) {
      // Return an empty set of options if there are no stats to report
      return relatedStatsList;
    }
    // If we have entries to show, map them into options to display in the selectable list

    // TODO, sort
    for (const [category, total] of Object.entries(
      relatedEventsStatsForProcess.events.byCategory
    )) {
      relatedStatsList.push({
        prepend: (
          <span>
            <EuiI18nNumber value={total || 0} />{' '}
          </span>
        ),
        key: category,
        label: category,
        checked: category === checked ? 'on' : 'off',
      });
    }
    return relatedStatsList;
  }, [checked, relatedEventsStatsForProcess]);

  const onChange = useCallback(
    (newOptions: EuiSelectableOption[]) => {
      const selectedOption = newOptions.find((opt) => opt.checked === 'on');
      if (selectedOption) {
        setChecked(selectedOption.key ?? null);
        // TODO
        dispatch({
          type: 'userSelectedRelatedEventCategory',
          payload: {
            // TODO, use id
            subject: event,
            category: selectedOption.key,
          },
        });

        // NB, key is always being passed but the EuiSelectableOption marks it optional. TODO
        // note 'breadcrumbEvent' is supposed to get an event category in this case.
        pushToQueryParams({ breadcrumbId: nodeID, breadcrumbEvent: selectedOption.key! });
      }
    },
    [dispatch, event, nodeID, pushToQueryParams]
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
const OptionListItem = styled.div`
  width: 175px;
`;
