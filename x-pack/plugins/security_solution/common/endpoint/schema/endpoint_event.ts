/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { object, esNumber, esObject, esString } from '../models/schema';
import { SafeEndpointEvent } from '../types';

// TODO, legacy endpoint event version
// TODO, use this?
export const endpointEventSchema: (value: unknown) => value is SafeEndpointEvent = object({
  '@timestamp': esNumber(),
  agent: esObject({
    id: esString(),
    version: esString(),
    type: esString(),
  }),
  ecs: esObject({
    version: esString(),
  }),
  event: esObject({
    category: esString(),
    type: esString(),
    id: esString(),
    kind: esString(),
    sequence: esNumber(),
  }),
  host: esObject({
    id: esString(),
    hostname: esString(),
    name: esString(),
    ip: esString(),
    mac: esString(),
    architecture: esString(),
    os: esObject({
      full: esString(),
      name: esString(),
      version: esString(),
      platform: esString(),
      family: esString(),
      Ext: esObject({
        variant: esString(),
      }),
    }),
  }),
  network: esObject({
    direction: esString(),
    forwarded_ip: esString(),
  }),
  dns: esObject({
    question: esObject({
      name: esString(),
    }),
  }),
  process: esObject({
    entity_id: esString(),
    name: esString(),
    executable: esString(),
    args: esString(),
    code_signature: esObject({
      status: esString(),
      subject_name: esString(),
    }),
    pid: esNumber(),
    hash: esObject({
      md5: esString(),
    }),
    parent: esObject({
      entity_id: esString(),
      name: esString(),
      pid: esNumber(),
    }),
    /*
     * The array has a special format. The entity_ids towards the beginning of the array are closer ancestors and the
     * values towards the end of the array are more distant ancestors (grandparents). Therefore
     * ancestry_array[0] == process.parent.entity_id and ancestry_array[1] == process.parent.parent.entity_id
     */
    Ext: esObject({
      ancestry: esString(),
    }),
  }),
  user: esObject({
    domain: esString(),
    name: esString(),
  }),
  file: esObject({
    path: esString(),
  }),
  registry: esObject({
    path: esString(),
    key: esString(),
  }),
});
