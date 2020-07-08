/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { i18n } from '@kbn/i18n';

import React, { memo } from 'react';
import { PanelContentError } from './panel_content_error';
/* eslint-disable react/display-name */

export const NodeEventsFailedToLoad = memo(() => (
  <PanelContentError
    translatedErrorMessage={i18n.translate(
      'xpack.securitySolution.endpoint.resolver.panel.relatedDetail.missing',
      {
        defaultMessage: 'Related event not found.',
      }
    )}
  />
));
