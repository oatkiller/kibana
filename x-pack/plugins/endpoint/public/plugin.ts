/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { Plugin, CoreSetup, AppMountParameters, CoreStart } from 'kibana/public';
import { IEmbeddableSetup } from 'src/plugins/embeddable/public';
import { i18n } from '@kbn/i18n';
import { ResolverEmbeddableFactory } from './embeddables/resolver';
import { MySchema } from './uses_joi';

// The browser is g2g
const num: MySchema = 1;
/* eslint-disable no-console */
console.log('my schema is good', num);
/* eslint-enable no-console */

export type EndpointPluginStart = void;
export type EndpointPluginSetup = void;
export interface EndpointPluginSetupDependencies {
  embeddable: IEmbeddableSetup;
}

export interface EndpointPluginStartDependencies {} // eslint-disable-line @typescript-eslint/no-empty-interface

/**
 * Functionality that the endpoint plugin uses from core.
 */
export interface EndpointPluginServices extends Partial<CoreStart> {
  http: CoreStart['http'];
  overlays: CoreStart['overlays'] | undefined;
  notifications: CoreStart['notifications'] | undefined;
}

export class EndpointPlugin
  implements
    Plugin<
      EndpointPluginSetup,
      EndpointPluginStart,
      EndpointPluginSetupDependencies,
      EndpointPluginStartDependencies
    > {
  public setup(core: CoreSetup, plugins: EndpointPluginSetupDependencies) {
    core.application.register({
      id: 'endpoint',
      title: i18n.translate('xpack.endpoint.pluginTitle', {
        defaultMessage: 'Endpoint',
      }),
      async mount(params: AppMountParameters) {
        const [coreStart] = await core.getStartServices();
        const { renderApp } = await import('./applications/endpoint');
        return renderApp(coreStart, params);
      },
    });

    const resolverEmbeddableFactory = new ResolverEmbeddableFactory();

    plugins.embeddable.registerEmbeddableFactory(
      resolverEmbeddableFactory.type,
      resolverEmbeddableFactory
    );
  }

  public start() {}

  public stop() {}
}
