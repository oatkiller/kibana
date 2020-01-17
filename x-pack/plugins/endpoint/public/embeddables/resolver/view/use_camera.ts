/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */
import React, { useCallback, useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { ResolverAction } from '../types';
import * as selectors from '../store/selectors';
import { useAutoUpdatingClientRect } from './use_autoupdating_client_rect';
import { useNonPassiveWheelHandler } from './use_nonpassive_wheel_handler';

export function useCamera(): {
  ref: (node: HTMLDivElement | null) => void;
  onMouseDown: React.MouseEventHandler<HTMLElement>;
} {
  const dispatch: (action: ResolverAction) => unknown = useDispatch();

  const [ref, setRef] = useState<null | HTMLDivElement>(null);

  const userIsPanning = useSelector(selectors.userIsPanning);

  const [elementBoundingClientRect, clientRectCallback] = useAutoUpdatingClientRect();

  const relativeCoordinatesFromMouseEvent = useCallback(
    (event: { clientX: number; clientY: number }): null | [number, number] => {
      if (elementBoundingClientRect === null) {
        return null;
      }
      return [
        event.clientX - elementBoundingClientRect.x,
        event.clientY - elementBoundingClientRect.y,
      ];
    },
    [elementBoundingClientRect]
  );

  useEffect(() => {
    if (elementBoundingClientRect !== null) {
      dispatch({
        type: 'userSetRasterSize',
        payload: [elementBoundingClientRect.width, elementBoundingClientRect.height],
      });
    }
  }, [dispatch, elementBoundingClientRect]);

  const handleMouseDown = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      const maybeCoordinates = relativeCoordinatesFromMouseEvent(event);
      if (maybeCoordinates !== null) {
        dispatch({
          type: 'userStartedPanning',
          payload: maybeCoordinates,
        });
      }
    },
    [dispatch, relativeCoordinatesFromMouseEvent]
  );

  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      const maybeCoordinates = relativeCoordinatesFromMouseEvent(event);
      if (maybeCoordinates) {
        dispatch({
          type: 'userMovedPointer',
          payload: maybeCoordinates,
        });
      }
    },
    [dispatch, relativeCoordinatesFromMouseEvent]
  );

  const handleMouseUp = useCallback(() => {
    if (userIsPanning) {
      dispatch({
        type: 'userStoppedPanning',
      });
    }
  }, [dispatch, userIsPanning]);

  const handleWheel = useCallback(
    (event: WheelEvent) => {
      if (
        elementBoundingClientRect !== null &&
        event.ctrlKey &&
        event.deltaY !== 0 &&
        event.deltaMode === 0
      ) {
        event.preventDefault();
        dispatch({
          type: 'userZoomed',
          // we use elementBoundingClientRect to interpret pixel deltas as a fraction of the element's height
          // when pinch-zooming in on a mac, deltaY is a negative number but we want the payload to be positive
          payload: event.deltaY / -elementBoundingClientRect.height,
        });
      }
    },
    [elementBoundingClientRect, dispatch]
  );

  useEffect(() => {
    window.addEventListener('mouseup', handleMouseUp, { passive: true });
    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseUp]);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [handleMouseMove]);

  const refCallback = useCallback(
    (node: null | HTMLDivElement) => {
      setRef(node);
      clientRectCallback(node);
    },
    [clientRectCallback]
  );

  useNonPassiveWheelHandler(handleWheel, ref);

  return { ref: refCallback, onMouseDown: handleMouseDown };
}
