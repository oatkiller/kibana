/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { i18n } from '@kbn/i18n';

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
 * Format a Date in the Resolver-standard way.
 */
export function formatDate(
  /** Date to format. If the value is not a `Date`, it will be converted to one and validated first. Invalid dates will return an translated error message. */ date:
    | Date
    | string
    | number
): string {
  // instanceof Date didn't work with static analysis to narrow `date` to a `Date`.
  if (typeof date === 'string' || typeof date === 'number') {
    return formatDate(new Date(date));
  }

  if (isFinite(date.getTime())) {
    return formatter.format(date);
  } else {
    return invalidDateText;
  }
}
