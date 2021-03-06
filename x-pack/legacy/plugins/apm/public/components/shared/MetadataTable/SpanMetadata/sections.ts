/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import {
  Section,
  AGENT,
  SERVICE,
  SPAN,
  LABELS,
  TRANSACTION,
  TRACE
} from '../sections';

export const SPAN_METADATA_SECTIONS: Section[] = [
  SPAN,
  AGENT,
  SERVICE,
  TRANSACTION,
  LABELS,
  TRACE
];
