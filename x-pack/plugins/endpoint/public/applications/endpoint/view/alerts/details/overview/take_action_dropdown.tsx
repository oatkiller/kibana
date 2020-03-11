/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React, { memo, useMemo, useState } from 'react';
import { EuiPopover, EuiFormRow, EuiButton, EuiButtonEmpty } from '@elastic/eui';
import { FormattedMessage } from '@kbn/i18n/react';

export const TakeActionDropdown = memo(() => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const TakeActionButton = useMemo(() => {
    return (
      <EuiButton
        iconType="arrowDown"
        iconSide="right"
        data-test-subj="alertDetailTakeActionDropdownButton"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
      >
        <FormattedMessage
          id="xpack.endpoint.application.endpoint.alertDetails.takeAction.title"
          defaultMessage="Take Action"
        />
      </EuiButton>
    );
  }, [isDropdownOpen]);

  return (
    <EuiPopover
      button={TakeActionButton}
      isOpen={isDropdownOpen}
      closePopover={() => setIsDropdownOpen(false)}
      data-test-subj="alertListTakeActionDropdownContent"
    >
      <EuiFormRow>
        <EuiButtonEmpty
          data-test-subj="alertDetailTakeActionCloseAlertButton"
          color="text"
          onClick={() => {}}
          iconType="folderCheck"
        >
          <FormattedMessage
            id="xpack.endpoint.application.endpoint.alertDetails.takeAction.close"
            defaultMessage="Close Alert"
          />
        </EuiButtonEmpty>
      </EuiFormRow>

      <EuiFormRow>
        <EuiButtonEmpty
          data-test-subj="alertDetailTakeActionWhitelistButton"
          color="text"
          onClick={() => {}}
          iconType="listAdd"
        >
          <FormattedMessage
            id="xpack.endpoint.application.endpoint.alertDetails.takeAction.whitelist"
            defaultMessage="Whitelist..."
          />
        </EuiButtonEmpty>
      </EuiFormRow>
    </EuiPopover>
  );
});
