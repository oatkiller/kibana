/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { i18n } from '@kbn/i18n';
// TODO, comment
export function descriptionForNode(isProcessTerminated: boolean): string {
  if (isProcessTerminated) {
    return i18n.translate('xpack.securitySolution.resolver.terminatedProcess', {
      defaultMessage: 'Terminated Process',
    });
  } else {
    return i18n.translate('xpack.securitySolution.resolver.runningProcess', {
      defaultMessage: 'Running Process',
    });
  }
}
