/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { HttpServiceBase } from 'kibana/public';
import ReactDOM from 'react-dom';
import React from 'react';
import {
  EmbeddableInput,
  IContainer,
  Embeddable,
} from '../../../../../../src/plugins/embeddable/public';

export class ResolverEmbeddable extends Embeddable {
  public readonly type = 'resolver';
  private httpServiceBase: HttpServiceBase;
  private lastRenderTarget?: Element;
  constructor(
    initialInput: EmbeddableInput,
    httpServiceBase: HttpServiceBase,
    parent?: IContainer
  ) {
    super(
      // Input state is irrelevant to this embeddable, just pass it along.
      initialInput,
      // Initial output state - this embeddable does not do anything with output, so just
      // pass along an empty object.
      {},
      // Optional parent component, this embeddable can optionally be rendered inside a container.
      parent
    );
    this.httpServiceBase = httpServiceBase;
  }

  public render(node: HTMLElement) {
    if (this.lastRenderTarget !== undefined) {
      ReactDOM.unmountComponentAtNode(this.lastRenderTarget);
    }
    this.lastRenderTarget = node;
    // TODO, figure out how to destroy middleware
    const store = storeFactory();
    ReactDOM.render(<AppRoot store={} httpServiceBase={this.httpServiceBase} />, node);
  }

  public reload(): void {
    throw new Error('Method not implemented.');
  }

  public destroy(): void {
    if (this.lastRenderTarget !== undefined) {
      ReactDOM.unmountComponentAtNode(this.lastRenderTarget);
    }
  }
}
