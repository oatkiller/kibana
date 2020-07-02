/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { i18n } from '@kbn/i18n';
export function descriptionForNode(isProcessTerminated: boolean, isProcessOrigin: boolean): string {
  if (isProcessTerminated) {
    return i18n.translate('xpack.securitySolution.endpoint.resolver.terminatedProcess', {
      defaultMessage: 'Terminated Process',
    });
  } else if (isProcessOrigin) {
    return i18n.translate('xpack.securitySolution.endpoint.resolver.runningTrigger', {
      defaultMessage: 'Running Trigger',
    });
  } else {
    return i18n.translate('xpack.securitySolution.endpoint.resolver.runningProcess', {
      defaultMessage: 'Running Process',
    });
  }
}
