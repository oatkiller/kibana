/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import Hapi from 'hapi';
import { Legacy } from 'kibana';
import { SpacesPlugin as SpacesPluginStartContract } from '../../spaces';
import { TaskManager } from '../../task_manager';
import { XPackMainPlugin } from '../../xpack_main/xpack_main';
import KbnServer from '../../../../../src/legacy/server/kbn_server';
import { EncryptedSavedObjectsPlugin } from '../../encrypted_saved_objects';
import { PluginSetupContract as SecurityPlugin } from '../../../../plugins/security/server';
import {
  CoreSetup,
  LoggerFactory,
  SavedObjectsLegacyService,
} from '../../../../../src/core/server';
import {
  ActionsPlugin,
  PluginSetupContract as ActionsPluginSetupContract,
  PluginStartContract as ActionsPluginStartContract,
} from '../../actions';

// Extend PluginProperties to indicate which plugins are guaranteed to exist
// due to being marked as dependencies
interface Plugins extends Hapi.PluginProperties {
  actions: ActionsPlugin;
  task_manager: TaskManager;
  encrypted_saved_objects: EncryptedSavedObjectsPlugin;
}

export interface Server extends Legacy.Server {
  plugins: Plugins;
}

/**
 * Shim what we're thinking setup and start contracts will look like
 */
export type TaskManagerStartContract = Pick<TaskManager, 'schedule' | 'fetch' | 'remove'>;
export type SecurityPluginSetupContract = Pick<SecurityPlugin, 'config' | 'registerLegacyAPI'>;
export type SecurityPluginStartContract = Pick<SecurityPlugin, 'authc'>;
export type EncryptedSavedObjectsSetupContract = Pick<EncryptedSavedObjectsPlugin, 'registerType'>;
export type XPackMainPluginSetupContract = Pick<XPackMainPlugin, 'registerFeature'>;
export type TaskManagerSetupContract = Pick<
  TaskManager,
  'addMiddleware' | 'registerTaskDefinitions'
>;
export type EncryptedSavedObjectsStartContract = Pick<
  EncryptedSavedObjectsPlugin,
  'isEncryptionError' | 'getDecryptedAsInternalUser'
>;

/**
 * New platform interfaces
 */
export interface AlertingPluginInitializerContext {
  logger: LoggerFactory;
}
export interface AlertingCoreSetup {
  elasticsearch: CoreSetup['elasticsearch'];
  http: {
    route: (route: Hapi.ServerRoute) => void;
    basePath: {
      serverBasePath: string;
    };
  };
}
export interface AlertingCoreStart {
  savedObjects: SavedObjectsLegacyService;
}
export interface AlertingPluginsSetup {
  security?: SecurityPluginSetupContract;
  task_manager: TaskManagerSetupContract;
  actions: ActionsPluginSetupContract;
  xpack_main: XPackMainPluginSetupContract;
  encrypted_saved_objects: EncryptedSavedObjectsSetupContract;
}
export interface AlertingPluginsStart {
  actions: ActionsPluginStartContract;
  security?: SecurityPluginStartContract;
  spaces: () => SpacesPluginStartContract | undefined;
  encrypted_saved_objects: EncryptedSavedObjectsStartContract;
  task_manager: TaskManagerStartContract;
}

/**
 * Shim
 *
 * @param server Hapi server instance
 */
export function shim(
  server: Server
): {
  initializerContext: AlertingPluginInitializerContext;
  coreSetup: AlertingCoreSetup;
  coreStart: AlertingCoreStart;
  pluginsSetup: AlertingPluginsSetup;
  pluginsStart: AlertingPluginsStart;
} {
  const newPlatform = ((server as unknown) as KbnServer).newPlatform;

  const initializerContext: AlertingPluginInitializerContext = {
    logger: newPlatform.coreContext.logger,
  };

  const coreSetup: AlertingCoreSetup = {
    elasticsearch: newPlatform.setup.core.elasticsearch,
    http: {
      route: server.route.bind(server),
      basePath: newPlatform.setup.core.http.basePath,
    },
  };

  const coreStart: AlertingCoreStart = {
    savedObjects: server.savedObjects,
  };

  const pluginsSetup: AlertingPluginsSetup = {
    security: newPlatform.setup.plugins.security as SecurityPluginSetupContract | undefined,
    task_manager: server.plugins.task_manager,
    actions: server.plugins.actions.setup,
    xpack_main: server.plugins.xpack_main,
    encrypted_saved_objects: server.plugins.encrypted_saved_objects,
  };

  const pluginsStart: AlertingPluginsStart = {
    security: newPlatform.setup.plugins.security as SecurityPluginStartContract | undefined,
    actions: server.plugins.actions.start,
    // TODO: Currently a function because it's an optional dependency that
    // initializes after this function is called
    spaces: () => server.plugins.spaces,
    encrypted_saved_objects: server.plugins.encrypted_saved_objects,
    task_manager: server.plugins.task_manager,
  };

  return {
    initializerContext,
    coreSetup,
    coreStart,
    pluginsSetup,
    pluginsStart,
  };
}
