/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

/**
 * TODO, comment.
 */
export const fontSize = (
  /** the xScale of the map. */
  xScale: number,
  /** The font size will be at least this .*/
  minimum: number,
  slope: number
): number => {
  // TODO, test
  return Math.max(slope * (xScale - 1) + minimum, minimum);
};
