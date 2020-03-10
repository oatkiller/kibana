/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import expect from '@kbn/expect';
import { FtrProviderContext } from '../../ftr_provider_context';

export default ({ getPageObjects, getService }: FtrProviderContext) => {
  const pageObjects = getPageObjects(['common', 'endpoint']);
  const esArchiver = getService('esArchiver');
  const testSubjects = getService('testSubjects');

  describe('Endpoint host list', function() {
    this.tags('ciGroup7');
    before(async () => {
      await esArchiver.load('endpoint/metadata/api_feature');
      await pageObjects.common.navigateToUrlWithBrowserHistory('endpoint', '/hosts');
    });

    it('finds title', async () => {
      const title = await testSubjects.getVisibleText('hostListTitle');
      expect(title).to.equal('Hosts');
    });

    it('displays table data', async () => {
      const expectedData = [
        [
          'Hostname',
          'Policy',
          'Policy Status',
          'Alerts',
          'Operating System',
          'IP Address',
          'Sensor Version',
          'Last Active',
        ],
        [
          'cadmann-4.example.com',
          'Policy Name',
          'Policy Status',
          '0',
          'windows 10.0',
          '10.192.213.130, 10.70.28.129',
          'version',
          'xxxx',
        ],
        [
          'thurlow-9.example.com',
          'Policy Name',
          'Policy Status',
          '0',
          'windows 10.0',
          '10.46.229.234',
          'version',
          'xxxx',
        ],
        [
          'rezzani-7.example.com',
          'Policy Name',
          'Policy Status',
          '0',
          'windows 10.0',
          '10.101.149.26, 2606:a000:ffc0:39:11ef:37b9:3371:578c',
          'version',
          'xxxx',
        ],
      ];
      const tableData = await pageObjects.endpoint.getEndpointAppTableData('hostListTable');
      expect(tableData).to.eql(expectedData);
    });

    it('displays no items found', async () => {
      // clear out the data and reload the page
      await esArchiver.unload('endpoint/metadata/api_feature');
      await pageObjects.common.navigateToUrlWithBrowserHistory('endpoint', '/hosts');
      // get the table data and verify no entries appear
      const tableData = await pageObjects.endpoint.getEndpointAppTableData('hostListTable');
      expect(tableData[1][0]).to.equal('No items found');
      // reload the data so the other tests continue to pass
      await esArchiver.load('endpoint/metadata/api_feature');
    });

    describe('when on the details page', () => {
      before(async () => {
        await esArchiver.load('endpoint/metadata/api_feature');
        await pageObjects.common.navigateToUrlWithBrowserHistory(
          'endpoint',
          '/hosts',
          'selected_host=de5bf078-c247-4944-a198-6e2bc27e0b7b'
        );
      });

      it('displays shows a flyout', async () => {
        await testSubjects.existOrFail('hostDetailsFlyout');
      });
    });
    after(async () => {
      await esArchiver.unload('endpoint/metadata/api_feature');
    });
  });
};
