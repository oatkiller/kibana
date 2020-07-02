/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { uniquePidForProcess, uniqueParentPidForProcess } from '../process_event';
import { IndexedProcessTree, AdjacentProcessMap } from '../../types';
import { ResolverEvent } from '../../../../common/endpoint/types';
import { levelOrder as baseLevelOrder } from '../../lib/tree_sequencers';

/**
 * Create a new IndexedProcessTree from an array of ProcessEvents
 */
export function factory(processes: ResolverEvent[]): IndexedProcessTree {
  const idToChildren = new Map<string | undefined, ResolverEvent[]>();
  const idToValue = new Map<string, ResolverEvent>();
  const idToAdjacent = new Map<string, AdjacentProcessMap>();

  function emptyAdjacencyMap(id: string): AdjacentProcessMap {
    return {
      self: id,
      parent: null,
      firstChild: null,
      previousSibling: null,
      nextSibling: null,
      level: 1,
    };
  }

  const roots: ResolverEvent[] = [];

  for (const node of processes) {
    const uniqueProcessPid = uniquePidForProcess(node);
    idToValue.set(uniqueProcessPid, node);

    const currentProcessAdjacencyMap: AdjacentProcessMap =
      idToAdjacent.get(uniqueProcessPid) || emptyAdjacencyMap(uniqueProcessPid);
    idToAdjacent.set(uniqueProcessPid, currentProcessAdjacencyMap);

    const uniqueParentPid = uniqueParentPidForProcess(node);
    const currentProcessSiblings = idToChildren.get(uniqueParentPid);

    if (currentProcessSiblings) {
      const previousProcessId = uniquePidForProcess(
        currentProcessSiblings[currentProcessSiblings.length - 1]
      );
      currentProcessSiblings.push(node);
      /**
       * Update adjacency maps for current and previous entries
       */
      idToAdjacent.get(previousProcessId)!.nextSibling = uniqueProcessPid;
      currentProcessAdjacencyMap.previousSibling = previousProcessId;
      if (uniqueParentPid) {
        currentProcessAdjacencyMap.parent = uniqueParentPid;
      }
    } else {
      if (uniqueParentPid) {
        idToChildren.set(uniqueParentPid, [node]);
        /**
         * Get the parent's map, otherwise set an empty one
         */
        const parentAdjacencyMap =
          idToAdjacent.get(uniqueParentPid) ||
          (idToAdjacent.set(uniqueParentPid, emptyAdjacencyMap(uniqueParentPid)),
          idToAdjacent.get(uniqueParentPid))!;
        // set firstChild for parent
        parentAdjacencyMap.firstChild = uniqueProcessPid;
        // set parent for current
        currentProcessAdjacencyMap.parent = uniqueParentPid || null;
      } else {
        // In this case (no unique parent id), it must be a root
        roots.push(node);
      }
    }
  }

  /**
   * Scan adjacency maps from the top down and assign levels
   */
  function traverseLevels(currentProcessMap: AdjacentProcessMap, level: number = 1): void {
    const nextLevel = level + 1;
    if (currentProcessMap.nextSibling) {
      traverseLevels(idToAdjacent.get(currentProcessMap.nextSibling)!, level);
    }
    if (currentProcessMap.firstChild) {
      traverseLevels(idToAdjacent.get(currentProcessMap.firstChild)!, nextLevel);
    }
    currentProcessMap.level = level;
  }

  for (const treeRoot of roots) {
    traverseLevels(idToAdjacent.get(uniquePidForProcess(treeRoot))!);
  }

  return {
    idToChildren,
    idToProcess: idToValue,
    idToAdjacent,
  };
}

/**
 * Returns an array with any children `ProcessEvent`s of the passed in `process`
 */
export function children(tree: IndexedProcessTree, parentProcess: ResolverEvent): ResolverEvent[] {
  const id = uniquePidForProcess(parentProcess);
  const currentProcessSiblings = tree.idToChildren.get(id);
  return currentProcessSiblings === undefined ? [] : currentProcessSiblings;
}

/**
 * Returns the indexed process for an ID
 */
export function process(tree: IndexedProcessTree, id: string): ResolverEvent | undefined {
  return tree.idToProcess.get(id);
}

/**
 * Returns the parent ProcessEvent, if any, for the passed in `childProcess`
 */
export function parent(
  tree: IndexedProcessTree,
  childProcess: ResolverEvent
): ResolverEvent | undefined {
  const uniqueParentPid = uniqueParentPidForProcess(childProcess);
  if (uniqueParentPid === undefined) {
    return undefined;
  } else {
    return tree.idToProcess.get(uniqueParentPid);
  }
}

/**
 * Number of processes in the tree
 */
export function size(tree: IndexedProcessTree) {
  return tree.idToProcess.size;
}

/**
 * Return the root process
 */
export function root(tree: IndexedProcessTree) {
  if (size(tree) === 0) {
    return null;
  }
  let current: ResolverEvent = tree.idToProcess.values().next().value;
  while (parent(tree, current) !== undefined) {
    current = parent(tree, current)!;
  }
  return current;
}

/**
 * Yield processes in level order
 */
export function* levelOrder(tree: IndexedProcessTree) {
  const rootNode = root(tree);
  if (rootNode !== null) {
    yield* baseLevelOrder(rootNode, children.bind(null, tree));
  }
}

/**
 * The following sibling for a node.
 * TODO, value is incorrect
 */
export function nextSibling(tree: IndexedProcessTree, id: string): string | null {
  const adjacentProcessMap = tree.idToAdjacent.get(id);
  if (adjacentProcessMap) {
    return adjacentProcessMap.nextSibling;
  } else {
    return null;
  }
}
/**
 * The following sibling for a node.
 * TODO, value is incorrect
 */
export function nodeLevel(tree: IndexedProcessTree, id: string): number | null {
  const adjacentProcessMap = tree.idToAdjacent.get(id);
  if (adjacentProcessMap) {
    return adjacentProcessMap.level;
  } else {
    return null;
  }
}
