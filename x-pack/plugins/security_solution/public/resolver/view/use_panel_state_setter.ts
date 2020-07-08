/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { useHistory } from 'react-router-dom';

// eslint-disable-next-line import/no-nodejs-modules
import { useCallback } from 'react';
import { PanelQueryStringState } from '../types';

/**
 */
export function usePanelStateSetter(): (panelState: PanelQueryStringState) => void {
  const history = useHistory();
  return useCallback(
    (panelState: PanelQueryStringState) => {
      const urlSearchParams = new URLSearchParams(history.location.search);

      // Remove all previous panel state
      urlSearchParams.delete('panelView');
      urlSearchParams.delete('panelNodeID');
      urlSearchParams.delete('panelRelatedEventID');
      urlSearchParams.delete('panelEventCategory');

      urlSearchParams.set('panelView', panelState.panelView);
      if (panelState.panelNodeID !== undefined) {
        urlSearchParams.set('panelNodeID', panelState.panelNodeID);
      }
      if ('panelRelatedEventID' in panelState) {
        urlSearchParams.set('panelRelatedEventID', panelState.panelRelatedEventID);
      }
      if ('panelEventCategory' in panelState) {
        urlSearchParams.set('panelEventCategory', panelState.panelEventCategory);
      }

      return history.replace({ search: urlSearchParams.toString() });
    },
    [history]
  );
}
