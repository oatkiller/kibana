/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { History as HistoryPackageHistoryInterface } from 'history';
/**
 * Given a `History` and a `resolverDocumentID`, return any values stored in the query string.
 * This isn't exactly the same as the query string state, because parsing that from the query string
 * would be business logic. For example, this doesn't ignore duplicates.
 * Use this for testing.
 */
export function queryStringValues(
  history: HistoryPackageHistoryInterface,
  resolverComponentInstanceID: string
): { selectedNode: string[] } {
  const urlSearchParams = new URLSearchParams(history.location.search);
  return {
    selectedNode: urlSearchParams.getAll(`resolver-${resolverComponentInstanceID}-id`),
  };
}
