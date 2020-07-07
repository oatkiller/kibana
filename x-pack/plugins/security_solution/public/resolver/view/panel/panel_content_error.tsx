/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

/* eslint-disable react/display-name */

import { i18n } from '@kbn/i18n';
import { EuiSpacer, EuiText, EuiButtonEmpty } from '@elastic/eui';
import React, { memo, useMemo, ReactNode } from 'react';
import { StyledBreadcrumbs } from './styles';
import { usePanelStateSetter } from '../use_panel_state_setter';

/**
 * Display an error in the panel when something goes wrong and give the user a way to "retreat" back to a default state.
 *
 * @param {function} pushToQueryparams A function to update the hash value in the URL to control panel state
 * @param {string} translatedErrorMessage The message to display in the panel when something goes wrong
 */
export const PanelContentError = memo(function ({
  translatedErrorMessage,
}: {
  translatedErrorMessage: ReactNode;
}) {
  const setPanelState = usePanelStateSetter();
  const breadcrumbs = useMemo(() => {
    return [
      {
        text: i18n.translate('xpack.securitySolution.resolver.panel.error.events', {
          defaultMessage: 'Events',
        }),
        onClick: () => {
          setPanelState({ panelView: 'node' });
        },
      },
      {
        text: i18n.translate('xpack.securitySolution.resolver.panel.error.error', {
          defaultMessage: 'Error',
        }),
        onClick: () => {},
      },
    ];
  }, [setPanelState]);
  return (
    <>
      <StyledBreadcrumbs breadcrumbs={breadcrumbs} />
      <EuiSpacer size="l" />
      <EuiText textAlign="center">{translatedErrorMessage}</EuiText>
      <EuiSpacer size="l" />
      <EuiButtonEmpty
        onClick={() => {
          setPanelState({ panelView: 'node' });
        }}
      >
        {i18n.translate('xpack.securitySolution.resolver.panel.error.processList', {
          defaultMessage: 'Process list',
        })}
      </EuiButtonEmpty>
    </>
  );
});
