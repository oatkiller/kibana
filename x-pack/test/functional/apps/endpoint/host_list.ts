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

  describe('host list', function() {
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

    it('display details flyout when the hostname is clicked on', async () => {
      await (await testSubjects.find('hostnameCellLink')).click();
      await testSubjects.existOrFail('hostDetailsUpperList');
      await testSubjects.existOrFail('hostDetailsLowerList');
    });

    it('displays no items found when empty', async () => {
      // clear out the data and reload the page
      await esArchiver.unload('endpoint/metadata/api_feature');
      await pageObjects.common.navigateToUrlWithBrowserHistory('endpoint', '/hosts');
      // get the table data and verify no entries appear
      const tableData = await pageObjects.endpoint.getEndpointAppTableData('hostListTable');
      expect(tableData[1][0]).to.equal('No items found');
      // reload the data so the other tests continue to pass
      await esArchiver.load('endpoint/metadata/api_feature');
    });

    describe('has a url with a host id', () => {
      before(async () => {
        await pageObjects.common.navigateToUrlWithBrowserHistory(
          'endpoint',
          '/hosts',
          'selected_host=1fb3e58f-6ab0-4406-9d2a-91911207a712'
        );
      });

      it('shows a flyout', async () => {
        await testSubjects.existOrFail('hostDetailsFlyout');
      });

      it('displays details row headers', async () => {
        const expectedData = [
          'OS',
          'Last Seen',
          'Alerts',
          'Policy',
          'Policy Status',
          'IP Address',
          'Hostname',
          'Sensor Version',
        ];
        const keys = await pageObjects.endpoint.hostFlyoutDescriptionKeys('hostDetailsFlyout');
        expect(keys).to.eql(expectedData);
      });

      it('displays details row descriptions', async () => {
        const values = await pageObjects.endpoint.hostFlyoutDescriptionValues('hostDetailsFlyout');
        expect(values).to.eql([
          'Windows 10',
          '1/24/2020',
          '0',
          'C2A9093E-E289-4C0A-AA44-8C32A414FA7A',
          'active',
          '10.192.213.13010.70.28.129',
          'cadmann-4.example.com',
          '6.6.1',
        ]);
      });
    });
    after(async () => {
      await esArchiver.unload('endpoint/metadata/api_feature');
    });
  });
};
