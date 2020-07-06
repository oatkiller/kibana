/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */
// TODO

import { i18n } from '@kbn/i18n';
import { EuiBreadcrumbs, Breadcrumb, EuiCode } from '@elastic/eui';
import styled from 'styled-components';
import React, { memo } from 'react';
import { useResolverTheme } from '../assets';

/**
 * Long formatter (to second) for DateTime
 */
const formatter = new Intl.DateTimeFormat(i18n.getLocale(), {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
});

const invalidDateText = i18n.translate(
  'xpack.securitySolution.enpdoint.resolver.panelutils.invaliddate',
  {
    defaultMessage: 'Invalid Date',
  }
);
/**
 * @param {ConstructorParameters<typeof Date>[0]} timestamp To be passed through Date->Intl.DateTimeFormat
 * @returns {string} A nicely formatted string for a date
 */
export function formatDate(date: Date): string {
  if (isFinite(date.getTime())) {
    return formatter.format(date);
  } else {
    return invalidDateText;
  }
}

