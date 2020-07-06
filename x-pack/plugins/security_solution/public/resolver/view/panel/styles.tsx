/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { i18n } from '@kbn/i18n';
import { EuiBreadcrumbs, Breadcrumb, EuiCode } from '@elastic/eui';
import styled from 'styled-components';
import React, { memo } from 'react';
import {
  htmlIdGenerator,
  EuiSpacer,
  EuiTitle,
  EuiText,
  EuiTextColor,
  EuiDescriptionList,
} from '@elastic/eui';
import { useResolverTheme } from '../assets';

const ThemedBreadcrumbs = styled(EuiBreadcrumbs)<{ background: string; text: string }>`
  &.euiBreadcrumbs.euiBreadcrumbs--responsive {
    background-color: ${(props) => props.background};
    color: ${(props) => props.text};
    padding: 1em;
  }
`;

/**
 * Breadcrumb menu with adjustments per direction from UX team
 */
export const StyledBreadcrumbs = memo(function StyledBreadcrumbs({
  breadcrumbs,
  truncate,
}: {
  breadcrumbs: Breadcrumb[];
  truncate?: boolean;
}) {
  const {
    colorMap: { resolverEdge, resolverEdgeText },
  } = useResolverTheme();
  return (
    <ThemedBreadcrumbs
      background={resolverEdge}
      text={resolverEdgeText}
      breadcrumbs={breadcrumbs}
      truncate={truncate}
    />
  );
});

/**
 * A bold version of EuiCode to display certain titles with
 */
export const BoldCode = styled(EuiCode)`
  &.euiCodeBlock code.euiCodeBlock__code {
    font-weight: 900;
  }
`;

export const StyledDescriptionList = styled(EuiDescriptionList)`
  &.euiDescriptionList.euiDescriptionList--column dt.euiDescriptionList__title.desc-title {
    max-width: 8em;
  }
`;

// Adding some styles to prevent horizontal scrollbars, per request from UX review
export const RelatedEventDetailStyledDescriptionList = memo(styled(EuiDescriptionList)`
  &.euiDescriptionList.euiDescriptionList--column dt.euiDescriptionList__title.desc-title {
    max-width: 8em;
  }
  &.euiDescriptionList.euiDescriptionList--column dd.euiDescriptionList__description {
    max-width: calc(100% - 8.5em);
    overflow-wrap: break-word;
  }
`);

// Styling subtitles, per UX review:
export const StyledFlexTitle = memo(styled('h3')`
  display: flex;
  flex-flow: row;
  font-size: 1.2em;
`);
export const StyledTitleRule = memo(styled('hr')`
  &.euiHorizontalRule.euiHorizontalRule--full.euiHorizontalRule--marginSmall.override {
    display: block;
    flex: 1;
    margin-left: 0.5em;
  }
`);
