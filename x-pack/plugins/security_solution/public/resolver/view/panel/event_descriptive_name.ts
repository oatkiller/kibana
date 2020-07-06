/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { isLegacyEvent } from '../../../../common/endpoint/models/event';
import { ResolverEvent } from '../../../../common/endpoint/types';
import { uniquePidForProcess, name as eventName } from '../../models/process_event';

/**
 * Based on the ECS category of the event, attempt to provide a more descriptive name
 * (e.g. the `event.registry.key` for `registry` or the `dns.question.name` for `dns`, etc.).
 * This function returns the data in the form of `{subject, descriptor}` where `subject` will
 * tend to be the more distinctive term (e.g. 137.213.212.7 for a network event) and the
 * `descriptor` can be used to present more useful/meaningful view (e.g. `inbound 137.213.212.7`
 * in the example above).
 * see: https://www.elastic.co/guide/en/ecs/current/ecs-field-reference.html
 * @param event The ResolverEvent to get the descriptive name for
 * @returns { descriptiveName } An attempt at providing a readable name to the user
 */

/**
 * # Descriptive Names For Related Events:
 *
 * The following section provides facilities for deriving **Descriptive Names** for ECS-compliant event data.
 * There are drawbacks to trying to do this: It *will* require ongoing maintenance. It presents temptations to overarticulate.
 * On balance, however, it seems that the benefit of giving the user some form of information they can recognize & scan outweighs the drawbacks.
 */
type DeepPartial<T> = T extends object ? { [K in keyof T]?: DeepPartial<T[K]> } : T;
export function descriptiveName(event: ResolverEvent): { subject: string; descriptor?: string } {
  if (isLegacyEvent(event)) {
    return { subject: String(eventName(event)) };
  }

  // To be somewhat defensive, we'll check for the presence of these.
  const partialEvent: DeepPartial<ResolverEvent> = event;

  /**
   * This list of attempts can be expanded/adjusted as the underlying model changes over time:
   */

  // Stable, per ECS 1.5: https://www.elastic.co/guide/en/ecs/current/ecs-allowed-values-event-category.html

  if (partialEvent.network?.forwarded_ip) {
    return {
      subject: String(partialEvent.network?.forwarded_ip),
      descriptor: String(partialEvent.network?.direction),
    };
  }

  if (partialEvent.file?.path) {
    return {
      subject: String(partialEvent.file?.path),
    };
  }

  // Extended categories (per ECS 1.5):
  const pathOrKey = partialEvent.registry?.path || partialEvent.registry?.key;
  if (pathOrKey) {
    return {
      subject: String(pathOrKey),
    };
  }

  if (partialEvent.dns?.question?.name) {
    return { subject: String(partialEvent.dns?.question?.name) };
  }

  // Fall back on entityId if we can't fish a more descriptive name out.
  return { subject: uniquePidForProcess(event) };
}
