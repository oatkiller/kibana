/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { useHistory } from 'react-router-dom';

// eslint-disable-next-line import/no-nodejs-modules
import querystring from 'querystring';
import { useCallback } from 'react';
import { BreadcrumbState } from '../types';

export function usePushToQueryParams(): (nextBreadcrumbs: BreadcrumbState) => void {
  const history = useHistory();
  const urlSearch = history.location.search;
  return useCallback(
    (newCrumbs: BreadcrumbState) => {
      // Construct a new set of params from the current set (minus empty params)
      // by assigning the new set of params provided in `newCrumbs`
      const crumbsToPass = {
        ...querystring.parse(urlSearch.slice(1)),
        ...newCrumbs,
      };

      // If either was passed in as empty, remove it from the record
      if (crumbsToPass.breadcrumbId === '') {
        delete crumbsToPass.breadcrumbId;
      }
      if (crumbsToPass.breadcrumbEvent === '') {
        delete crumbsToPass.breadcrumbEvent;
      }

      const relativeURL = { search: querystring.stringify(crumbsToPass) };

      return history.replace(relativeURL);
    },
    [history, urlSearch]
  );
}
