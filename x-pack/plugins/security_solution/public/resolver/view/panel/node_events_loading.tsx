/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */
import React, { memo } from 'react';
import { i18n } from '@kbn/i18n';
import { EuiSpacer, EuiTitle } from '@elastic/eui';
import { StyledBreadcrumbs } from './styles';
import { usePanelStateSetter } from '../use_panel_state_setter';

/**
 * When event(s) for a related node are loaded, show this.
 */
export const NodeEventsLoading = memo(function () {
  const setPanelState = usePanelStateSetter();
  const waitCrumbs = [
    {
      text: i18n.translate(
        'xpack.securitySolution.endpoint.resolver.panel.processEventListByType.events',
        {
          defaultMessage: 'Events',
        }
      ),
      onClick: () => {
        setPanelState({ panelView: 'node' });
      },
    },
  ];
  return (
    <>
      <StyledBreadcrumbs breadcrumbs={waitCrumbs} />
      <EuiSpacer size="l" />
      <EuiTitle>
        <h4>
          {i18n.translate('xpack.securitySolution.endpoint.resolver.panel.relatedDetail.wait', {
            defaultMessage: 'Waiting For Events...',
          })}
        </h4>
      </EuiTitle>
    </>
  );
});
