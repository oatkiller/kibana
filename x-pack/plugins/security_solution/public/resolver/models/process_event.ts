/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import * as eventModel from '../../../common/endpoint/models/event';
import { ResolverEvent } from '../../../common/endpoint/types';
import { ResolverProcessType } from '../types';

/**
 * Returns true if the process's eventType is either 'processCreated' or 'processRan'.
 * Resolver will only render 'graphable' process events.
 */
export function isGraphableProcess(event: ResolverEvent) {
  return eventType(event) === 'processCreated' || eventType(event) === 'processRan';
}

function isValue(field: string | string[], value: string) {
  if (field instanceof Array) {
    return field.length === 1 && field[0] === value;
  } else {
    return field === value;
  }
}

export function isTerminatedProcess(event: ResolverEvent) {
  return eventType(event) === 'processTerminated';
}

/**
 * Returns a custom event type for a process event based on the event's metadata.
 */
export function eventType(event: ResolverEvent): ResolverProcessType {
  if (eventModel.isLegacyEvent(event)) {
    const {
      endgame: { event_type_full: type, event_subtype_full: subType },
    } = event;

    if (type === 'process_event') {
      if (subType === 'creation_event' || subType === 'fork_event' || subType === 'exec_event') {
        return 'processCreated';
      } else if (subType === 'already_running') {
        return 'processRan';
      } else if (subType === 'termination_event') {
        return 'processTerminated';
      } else {
        return 'unknownProcessEvent';
      }
    } else if (type === 'alert_event') {
      return 'processCausedAlert';
    }
  } else {
    const {
      event: { type, category, kind },
    } = event;
    if (isValue(category, 'process')) {
      if (isValue(type, 'start') || isValue(type, 'change') || isValue(type, 'creation')) {
        return 'processCreated';
      } else if (isValue(type, 'info')) {
        return 'processRan';
      } else if (isValue(type, 'end')) {
        return 'processTerminated';
      } else {
        return 'unknownProcessEvent';
      }
    } else if (kind === 'alert') {
      return 'processCausedAlert';
    }
  }
  return 'unknownEvent';
}

/**
 * Returns the process event's pid
 */
export function uniquePidForProcess(event: ResolverEvent): string {
  if (eventModel.isLegacyEvent(event)) {
    return String(event.endgame.unique_pid);
  } else {
    return event.process.entity_id;
  }
}

/**
 * Returns the pid for the process on the host
 */
export function processPid(event: ResolverEvent): number | undefined {
  if (eventModel.isLegacyEvent(event)) {
    return event.endgame.pid;
  } else {
    return event.process.pid;
  }
}

/**
 * Returns the process event's parent pid
 */
export function uniqueParentPidForProcess(event: ResolverEvent): string | undefined {
  if (eventModel.isLegacyEvent(event)) {
    return String(event.endgame.unique_ppid);
  } else {
    return event.process.parent?.entity_id;
  }
}

/**
 * Returns the process event's parent pid
 */
export function processParentPid(event: ResolverEvent): number | undefined {
  if (eventModel.isLegacyEvent(event)) {
    return event.endgame.ppid;
  } else {
    return event.process.parent?.pid;
  }
}

/**
 * Returns the process event's path on its host
 */
export function processPath(event: ResolverEvent): string | undefined {
  if (eventModel.isLegacyEvent(event)) {
    return event.endgame.process_path;
  } else {
    return event.process.executable;
  }
}

/**
 * Returns the username for the account that ran the process
 */
export function userInfoForProcess(
  event: ResolverEvent
): { user?: string; domain?: string } | undefined {
  return event.user;
}

/**
 * Returns the MD5 hash for the `event` param, or undefined if it can't be located
 * @param {ResolverEvent} event The `ResolverEvent` to get the MD5 value for
 * @returns {string | undefined} The MD5 string for the event
 */
export function md5HashForProcess(event: ResolverEvent): string | undefined {
  if (eventModel.isLegacyEvent(event)) {
    // There is not currently a key for this on Legacy event types
    return undefined;
  }
  return event?.process?.hash?.md5;
}

/**
 * Returns the command line path and arguments used to run the `event` if any
 *
 * @param {ResolverEvent} event The `ResolverEvent` to get the arguemnts value for
 * @returns {string | undefined} The arguments (including the path) used to run the process
 */
export function argsForProcess(event: ResolverEvent): string | undefined {
  if (eventModel.isLegacyEvent(event)) {
    // There is not currently a key for this on Legacy event types
    return undefined;
  }
  return event?.process?.args;
}

// TODO cleanup remove coercion
export function name(event: ResolverEvent): string | undefined {
  if (eventModel.isLegacyEvent(event)) {
    return event.endgame.process_name ? event.endgame.process_name : undefined;
  } else {
    return event.process.name;
  }
}

export function timestampAsDate(event: ResolverEvent): Date | undefined {
  const timestamp = eventModel.timestamp(event);
  if (!timestamp) {
    return undefined;
  }
  const date = new Date(timestamp);
  // TODO, test
  if (!isFinite(date.getTime())) {
    return undefined;
  }
  return date;
}
