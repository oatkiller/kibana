/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */
import { CameraAction } from './camera';
import { DataAction } from './data/action';

/**
 * When the user wants to bring a process node front-and-center on the map.
 */
interface UserBroughtProcessIntoView {
  readonly type: 'userBroughtProcessIntoView';
  readonly payload: {
    /**
     * Used to identify the process node that should be brought into view.
     */
    readonly id: string;
    /**
     * The time (since epoch in milliseconds) when the action was dispatched.
     */
    readonly time: number;
  };
}

/**
 * When the user switches the "active descendant" of the Resolver.
 * The "active descendant" (from the point of view of the parent element)
 * corresponds to the "current" child element. "active" or "current" here meaning
 * the element that is focused on by the user's interactions with the UI, but
 * not necessarily "selected" (see UserSelectedResolverNode below)
 */
interface UserFocusedOnResolverNode {
  readonly type: 'userFocusedOnResolverNode';
  /** the entity id for the node to focus */
  readonly payload: string;
}

/**
 * When the user "selects" a node in the Resolver
 * "Selected" refers to the state of being the element that the
 * user most recently "picked" (by e.g. pressing a button corresponding
 * to the element in a list) as opposed to "active" or "current" (see UserFocusedOnResolverNode above).
 */
interface UserSelectedResolverNode {
  readonly type: 'userSelectedResolverNode';
  /** the unique PID for the node */
  readonly payload: string;
}

/**
 * Used by `useStateSyncingActions` hook.
 * This is dispatched when external sources provide new parameters for Resolver.
 * When the component receives a new 'databaseDocumentID' prop, this is fired.
 */
interface AppReceivedNewExternalProperties {
  type: 'appReceivedNewExternalProperties';
  /**
   * Defines the externally provided properties that Resolver acknowledges.
   */
  payload: {
    /**
     * the `_id` of an ES document. This defines the origin of the Resolver graph.
     */
    databaseDocumentID?: string;
    /**
     * The search params from the URL
     */
    urlSearch: string;
    /**
     * Record the time so that the app can respond to changes with animation.
     */
    time: number;
  };
}

export type ResolverAction =
  | CameraAction
  | DataAction
  | UserBroughtProcessIntoView
  | UserFocusedOnResolverNode
  | UserSelectedResolverNode
  | AppReceivedNewExternalProperties;
