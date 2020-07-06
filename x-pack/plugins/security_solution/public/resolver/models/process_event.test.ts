/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */
import { eventType, descriptiveName } from './process_event';

import { mockProcessEvent } from './process_event_test_helpers';
import { LegacyEndpointEvent } from '../../../common/endpoint/types';
import { EndpointDocGenerator } from '../generate_data';

describe('process event', () => {
  describe('eventType', () => {
    let event: LegacyEndpointEvent;
    beforeEach(() => {
      event = mockProcessEvent({
        endgame: {
          unique_pid: 1,
          event_type_full: 'process_event',
        },
      });
    });
    it("returns the right value when the subType is 'creation_event'", () => {
      event.endgame.event_subtype_full = 'creation_event';
      expect(eventType(event)).toEqual('processCreated');
    });
  });
  describe('Event descriptive names', () => {
    let generator: EndpointDocGenerator;
    beforeEach(() => {
      generator = new EndpointDocGenerator('seed');
    });

    it('returns the right name for a registry event', () => {
      const extensions = { registry: { key: `HKLM/Windows/Software/abc` } };
      const event = generator.generateEvent({ eventCategory: 'registry', extensions });
      expect(descriptiveName(event)).toEqual({ subject: `HKLM/Windows/Software/abc` });
    });

    it('returns the right name for a network event', () => {
      const randomIP = `${generator.randomIP()}`;
      const extensions = { network: { direction: 'outbound', forwarded_ip: randomIP } };
      const event = generator.generateEvent({ eventCategory: 'network', extensions });
      expect(descriptiveName(event)).toEqual({ subject: `${randomIP}`, descriptor: 'outbound' });
    });

    it('returns the right name for a file event', () => {
      const extensions = { file: { path: 'C:\\My Documents\\business\\January\\processName' } };
      const event = generator.generateEvent({ eventCategory: 'file', extensions });
      expect(descriptiveName(event)).toEqual({
        subject: 'C:\\My Documents\\business\\January\\processName',
      });
    });

    it('returns the right name for a dns event', () => {
      const extensions = { dns: { question: { name: `${generator.randomIP()}` } } };
      const event = generator.generateEvent({ eventCategory: 'dns', extensions });
      expect(descriptiveName(event)).toEqual({ subject: extensions.dns.question.name });
    });
  });
});
