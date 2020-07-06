/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */
import { LegacyEndpointEvent, ResolverEvent } from '../types';

// TODO, this whole file. why do we have this as well as the resolver public version? clean it up

export function isLegacyEvent(event: ResolverEvent): event is LegacyEndpointEvent {
  return (event as LegacyEndpointEvent).endgame !== undefined;
}

export function isProcessStart(event: ResolverEvent): boolean {
  if (isLegacyEvent(event)) {
    return event.event?.type === 'process_start' || event.event?.action === 'fork_event';
  }
  return event.event.type === 'start';
}

// TODO, name, cmoment
export function timestamp(event: ResolverEvent): string | undefined | number {
  if (isLegacyEvent(event)) {
    return event.endgame.timestamp_utc;
  } else {
    return event['@timestamp'];
  }
}

// TODO cleanup remove coercion
export function eventId(event: ResolverEvent): string {
  if (isLegacyEvent(event)) {
    return event.endgame.serial_event_id ? String(event.endgame.serial_event_id) : '';
  }
  return event.event.id;
}

// TODO cleanup remove coercion
export function entityId(event: ResolverEvent): string {
  if (isLegacyEvent(event)) {
    return event.endgame.unique_pid ? String(event.endgame.unique_pid) : '';
  }
  return event.process.entity_id;
}

// TODO cleanup remove coercion
export function parentEntityId(event: ResolverEvent): string | undefined {
  if (isLegacyEvent(event)) {
    return event.endgame.unique_ppid ? String(event.endgame.unique_ppid) : undefined;
  }
  return event.process.parent?.entity_id;
}

export function ancestryArray(event: ResolverEvent): string[] | undefined {
  if (isLegacyEvent(event)) {
    return undefined;
  }
  return event.process.Ext.ancestry;
}

// TODO cleanup rename
export function getAncestryAsArray(event: ResolverEvent | undefined): string[] {
  if (!event) {
    return [];
  }

  const ancestors = ancestryArray(event);
  if (ancestors) {
    return ancestors;
  }

  const parentID = parentEntityId(event);
  if (parentID) {
    return [parentID];
  }

  return [];
}

/**
 * @param event The event to get the category for
 */
// TODO cleanup should be in Resolver code
export function primaryEventCategory(event: ResolverEvent): string | undefined {
  // Returning "Process" as a catch-all here because it seems pretty general
  if (isLegacyEvent(event)) {
    const legacyFullType = event.endgame.event_type_full;
    if (legacyFullType) {
      return legacyFullType;
    }
  } else {
    const eventCategories = event.event.category;
    const category = typeof eventCategories === 'string' ? eventCategories : eventCategories[0];

    return category;
  }
}

/**
 * ECS event type will be things like 'creation', 'deletion', 'access', etc.
 * see: https://www.elastic.co/guide/en/ecs/current/ecs-event.html
 * @param event The ResolverEvent to get the ecs type for
 */
export function ecsEventType(event: ResolverEvent): Array<string | undefined> {
  if (isLegacyEvent(event)) {
    return [event.endgame.event_subtype_full];
  }
  return typeof event.event.type === 'string' ? [event.event.type] : event.event.type;
}
