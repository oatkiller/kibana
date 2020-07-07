/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React, { memo } from 'react';
import { descriptionForNode } from '../description_for_node';
import { useCubeAssets } from '../use_cube_assets';

/**
 * icon for a process.
 */
export const ProcessCubeIcon = memo(function CubeForProcess({
  isProcessTerminated = false,
}: {
  isProcessTerminated?: boolean;
}) {
  const { cubeSymbol } = useCubeAssets(isProcessTerminated);

  const descriptionText = descriptionForNode(isProcessTerminated);

  return (
    <svg
      style={{ position: 'relative', top: '0.4em', marginRight: '.25em' }}
      className="table-process-icon"
      width="1.5em"
      height="1.5em"
      viewBox="0 0 1 1"
    >
      <desc>{descriptionText}</desc>
      <use
        role="presentation"
        xlinkHref={cubeSymbol}
        x={0}
        y={0}
        width={1}
        height={1}
        opacity="1"
        className="cube"
      />
    </svg>
  );
});
