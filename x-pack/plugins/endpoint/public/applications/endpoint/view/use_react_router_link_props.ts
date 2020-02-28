/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { useHistory } from 'react-router-dom';
import { useCallback } from 'react';

/**
 * Return an object with props that can be added to any `HTMLAnchorElement`. The `onClick` function
 * will sometimes block navigation and instead push to react-router's history.
 *
 * This can be used to emulate react-router link behavior when using EuiLink, or EuiTab components.
 */
export function useReactRouterLinkProps(
  /**
   * An additional onClick handler that will be called by the returned onClick handler.
   */
  additionalOnClick?: (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => void
): {
  /**
   * Use this `onClick` function as the `onClick` property on an `<a />` React element.
   */
  onClick: (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => void;
} {
  const history = useHistory();

  /**
   * useCallback for this, as it will be handed as a callback to other elements.
   */
  const onClick: (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => unknown = useCallback(
    event => {
      try {
        if (additionalOnClick) {
          additionalOnClick(event);
        }
      } catch (exception) {
        /**
         * In the case that the additionalOnClick function raises, prevent the link navigation before
         * raising. This behavior is consistent with react-router.
         */
        event.preventDefault();
        throw exception;
      }

      /**
       * The 'target' property of the clicked anchor tag.
       */
      const target = event.currentTarget.target;

      /**
       * If the event already had 'preventDefault' called, we will not navigate via react-router either.
       */
      if (event.defaultPrevented) {
        return;
      }

      /**
       * If the button that was clicked wasn't the primary button, we will not navigate.
       */
      if (event.button !== 0) {
        return;
      }

      /**
       * If the link has a target other than '_self', we will not navigate.
       */
      if (target && target !== '_self') {
        return;
      }

      /**
       * If any modifier keys were pressed, we will not navigate.
       */
      if (event.metaKey || event.altKey || event.ctrlKey || event.shiftKey) {
        return;
      }

      /**
       * Navigate via react-route by first preventing the default navigation, and then pushing
       * new history via react-router's history API.
       */
      event.preventDefault();
      history.push(event.currentTarget.href);
    },
    [additionalOnClick, history]
  );

  return { onClick };
}
