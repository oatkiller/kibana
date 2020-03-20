/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { uniquePidForProcess, uniqueParentPidForProcess } from './process_event';
import { IndexedProcessTree, AdjacentProcessMap } from '../types';
import { ResolverEvent } from '../../../../common/types';
import { levelOrder as baseLevelOrder } from '../lib/tree_sequencers';

/**
 * Create a new IndexedProcessTree from an array of ProcessEvents
 */
export function factory(processes: ResolverEvent[]): IndexedProcessTree {
  const idToChildren = new Map<string | undefined, ResolverEvent[]>();
  const idToValue = new Map<string, ResolverEvent>();
  const idToAdjacent = new Map<string, AdjacentProcessMap>();

  for (const process of processes) {
    const uniqueProcessPid = uniquePidForProcess(process);
    idToValue.set(uniqueProcessPid, process);

    const uniqueParentPid = uniqueParentPidForProcess(process);
    const siblings = idToChildren.get(uniqueParentPid);

    // TODO, suggestion: build the `idToChildren` map first, then do a second walk in BFS (or really some 'correct' graph order. e.g. sort it) of the graph to calculate the
    // adjacent process map. That way we can get `level` in O(1) time.
    function emptyAdjacencyMap(id: string): AdjacentProcessMap {
      return {
        // TODO, why do we need this?
        self: id,
        // TODO suggested name 'parent'
        up: null,
        // TODO suggested name 'firstChild'
        down: null,
        // TODO suggested name 'precedingSibling'
        previous: null,
        // TODO suggested name 'followingSibling'
        next: null,
        get level(): number {
          if (!this.up) {
            return 1;
          }
          // TODO. is this O(n)? could we just set the level at the time of creation?
          // maybe not, because the processes aren't necessarily in BFS order.
          const mapAbove = idToAdjacent.get(this.up);
          return mapAbove ? mapAbove.level + 1 : 1;
        },
      };
    }
    /**
     * Get the adjacency map for the parent. If there isn't one in the map, create it. If there is no parent (the node is the root)
     * then create an adjacency map using the id 'root'.
     * TODO, `root` may collide with the unique pid or unique ppid of a node. is this an issue?
     */
    // TODO: explain. these two lines create adjacency maps, but they don't add them to `idToAdjacent`. Shouldn't they?
    const parentAdjacencyMap =
      (uniqueParentPid && idToAdjacent.get(uniqueParentPid)) ||
      emptyAdjacencyMap(uniqueParentPid || 'root');
    const currentAdjacencyMap: AdjacentProcessMap =
      idToAdjacent.get(uniqueProcessPid) || emptyAdjacencyMap(uniqueProcessPid);

    if (siblings) {
      // TODO, explain why this is an ID instead of a process reference?
      const previousProcessId = uniquePidForProcess(siblings[siblings.length - 1]);

      // Add this process to the list of its siblings
      siblings.push(process);

      /**
       * Update adjacency maps for current and previous entries
       * We known that `previousAdjacencyMap` will be defined? why? I think that would be true if we walk the tree in BFS order, but I don't think thats the case.
       * TODO, fix
       */
      const previousAdjacencyMap = idToAdjacent.get(previousProcessId)!;

      // Update the preceeding siblings adjacency map to include this processes.
      // TODO, why ID instead of reference?
      previousAdjacencyMap.next = uniqueProcessPid;

      // TODO, why set this. We just got it out the map at the same key.
      // discussed w/ brent.
      // idToAdjacent.set(previousProcessId, previousAdjacencyMap);

      // Update the adjacency map to point to this process's preceeding sibling
      currentAdjacencyMap.previous = previousProcessId;

      if (uniqueParentPid) {
        /**
         * Point 'up' to the node's parent.
         * Following-siblings (other than the first) point to their parent, but not the other way around.
         */
        currentAdjacencyMap.up = uniqueParentPid;
      }
      // TODO, move this above the if...else instead of duplicating?
      idToAdjacent.set(uniqueProcessPid, currentAdjacencyMap);
    } else {
      idToChildren.set(uniqueParentPid, [process]);
      // TODO, suggestion.
      // this is the only place we use the `parentAdjacencyMap`. And we need it here, because
      // we only want to set its properties when processing its first child.
      //
      // create the parent adjacency map here, set its properties, and add it to the map

      // set up, down
      if (uniqueParentPid) {
        parentAdjacencyMap.down = uniqueProcessPid;
        // TODO, why not add `parentAdjacencyMap` to the map when creating it?
        idToAdjacent.set(uniqueParentPid, parentAdjacencyMap);
      }
      currentAdjacencyMap.up = uniqueParentPid || null;
      // TODO, why not add `parentAdjacencyMap` to the map when creating it?
      idToAdjacent.set(uniqueProcessPid, currentAdjacencyMap);
    }
  }

  return {
    idToChildren,
    idToProcess: idToValue,
    idToAdjacent,
  };
}

/**
 * Returns an array with any children `ProcessEvent`s of the passed in `process`
 * This determines the order that children of a process are graphed (left to right)
 */
export function children(tree: IndexedProcessTree, process: ResolverEvent): ResolverEvent[] {
  const id = uniquePidForProcess(process);
  const processChildren = tree.idToChildren.get(id);
  return processChildren === undefined ? [] : processChildren;
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
