/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */
import expect from '@kbn/expect';
import { FtrProviderContext } from '../../ftr_provider_context';

export default function({ getPageObjects, getService }: FtrProviderContext) {
  const pageObjects = getPageObjects(['common', 'endpointAlerts']);
  const testSubjects = getService('testSubjects');
  const esArchiver = getService('esArchiver');
  const browser = getService('browser');

  describe('Endpoint Alert Page: when es has data and user has navigated to the page', function() {
    this.tags(['ciGroup7']);
    before(async () => {
      await esArchiver.load('endpoint/alerts/api_feature');
      await pageObjects.common.navigateToUrlWithBrowserHistory('endpoint', '/alerts');
    });

    it('loads the Alert List Page', async () => {
      await testSubjects.existOrFail('alertListPage');
    });
    it('includes alerts search bar', async () => {
      await testSubjects.existOrFail('alertsSearchBar');
    });
    it('includes Alert list data grid', async () => {
      await testSubjects.existOrFail('alertListGrid');
    });
    it('updates the url upon submitting a new search bar query', async () => {
      await pageObjects.endpointAlerts.enterSearchBarQuery();
      await pageObjects.endpointAlerts.submitSearchBarFilter();
      const currentUrl = await browser.getCurrentUrl();
      expect(currentUrl).to.contain('query=');
      expect(currentUrl).to.contain('date_range=');
    });

    describe('and user has clicked details view link', () => {
      before(async () => {
        await testSubjects.click('alertTypeCellLink');
      });

      it('loads the Alert List Flyout correctly', async () => {
        await testSubjects.existOrFail('alertDetailFlyout');
      });

      describe('and user has clicked resolver tab', () => {
        before(async () => {
          await find.clickByButtonText('Resolver');
        });

        // TODO this will fail until qualters fixes his code
        it('loads resolver correctly', async () => {
          await testSubjects.existOrFail('resolverEmbeddable');
        });
      });
    });

    after(async () => {
      await esArchiver.unload('endpoint/alerts/api_feature');
    });
  });
}
