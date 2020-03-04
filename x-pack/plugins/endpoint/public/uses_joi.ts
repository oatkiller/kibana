/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

// import and use schema
import { schema, TypeOf } from '@kbn/config-schema';
const mySchema = schema.number();

export type MySchema = TypeOf<typeof mySchema>;
