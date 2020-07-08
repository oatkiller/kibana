/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { ResolverEvent } from '../../../../common/endpoint/types';
import { isLegacyEvent } from '../../../../common/endpoint/models/event';

// TODO cleanup
// TODO move to models/
export function firstCategory(
  /**
   * The event to get the category for
   */
  event: ResolverEvent
): string | undefined {
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
