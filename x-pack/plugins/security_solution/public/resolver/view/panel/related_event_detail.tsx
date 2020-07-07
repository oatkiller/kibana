/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

/* eslint-disable react/display-name */

import React, { memo, useMemo, useEffect, Fragment } from 'react';
import { i18n } from '@kbn/i18n';
import { EuiSpacer, EuiText, EuiTextColor, EuiTitle } from '@elastic/eui';
import { useSelector } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { ResolverEvent } from '../../../../common/endpoint/types';
import * as selectors from '../../store/selectors';
import { useResolverDispatch } from '../use_resolver_dispatch';
import { PanelContentError } from './panel_content_error';
import { PanelQueryStringState } from '../../types';
import { StyledTitleRule } from './styles';
import * as processEventModel from '../../models/process_event';
import { usePanelStateSetter } from '../use_panel_state_setter';

/**
 * A helper function to turn objects into EuiDescriptionList entries.
 * This reflects the strategy of more or less "dumping" metadata for related processes
 * in description lists with little/no 'prettification'. This has the obvious drawback of
 * data perhaps appearing inscrutable/daunting, but the benefit of presenting these fields
 * to the user "as they occur" in ECS, which may help them with e.g. EQL queries.
 *
 * Given an object like: {a:{b: 1}, c: 'd'} it will yield title/description entries like so:
 * {title: "a.b", description: "1"}, {title: "c", description: "d"}
 *
 * @param {object} obj The object to turn into `<dt><dd>` entries
 */
const objectToDescriptionListEntries = function* (
  obj: object,
  prefix = ''
): Generator<{ title: string; description: string }> {
  const nextPrefix = prefix.length ? `${prefix}.` : '';
  for (const [metaKey, metaValue] of Object.entries(obj)) {
    if (typeof metaValue === 'number' || typeof metaValue === 'string') {
      yield { title: nextPrefix + metaKey, description: `${metaValue}` };
    } else if (metaValue instanceof Array) {
      yield {
        title: nextPrefix + metaKey,
        description: metaValue
          .filter((arrayEntry) => {
            return typeof arrayEntry === 'number' || typeof arrayEntry === 'string';
          })
          .join(','),
      };
    } else if (typeof metaValue === 'object') {
      yield* objectToDescriptionListEntries(metaValue, nextPrefix + metaKey);
    }
  }
};

const TitleHr = memo(() => {
  return (
    <StyledTitleRule className="euiHorizontalRule euiHorizontalRule--full euiHorizontalRule--marginSmall override" />
  );
});

/**
 * This view presents a detailed view of all the available data for a related event, split and titled by the "section"
 * it appears in the underlying ResolverEvent
 */
export const RelatedEventDetail = memo(function RelatedEventDetail({
  parentEvent,
  relatedEvent,
}: {
  relatedEvent: ResolverEvent;
  parentEvent: ResolverEvent;
}) {
  const setPanelState = usePanelStateSetter();
  const processName = processEventModel.name(parentEvent);
  const nodeID = processEventModel.uniquePidForProcess(parentEvent);
  const totalCount = countForParent || 0;
  const eventsString = i18n.translate(
    'xpack.securitySolution.endpoint.resolver.panel.relatedEventDetail.events',
    {
      defaultMessage: 'Events',
    }
  );
  const naString = i18n.translate(
    'xpack.securitySolution.endpoint.resolver.panel.relatedEventDetail.NA',
    {
      defaultMessage: 'N/A',
    }
  );

  const relatedEventsForThisProcess = useSelector(selectors.relatedEventsForNodeID).get(nodeID!);

  const [relatedEventToShowDetailsFor, countBySameCategory, relatedEventCategory] = useMemo(() => {
    if (!relatedEventsForThisProcess) {
      return [undefined, 0];
    }
    const specificEvent = relatedEventsForThisProcess.events.find(
      (event) => uniquePidForProcess(event) === relatedEventId
    );
    // For breadcrumbs:
    const specificCategory = specificEvent && event.primaryEventCategory(specificEvent);
    const countOfCategory = relatedEventsForThisProcess.events.reduce((sumtotal, event) => {
      return event.primaryEventCategory(event) === specificCategory ? sumtotal + 1 : sumtotal;
    }, 0);
    return [specificEvent, countOfCategory, specificCategory || naString];
  }, [relatedEventsForThisProcess, naString, relatedEventId]);

  const [sections, formattedDate] = useMemo(() => {
    if (!relatedEventToShowDetailsFor) {
      // This could happen if user relaods from URL param and requests an eventId that no longer exists
      return [[], naString];
    }
    // Assuming these details (agent, ecs, process) aren't as helpful, can revisit
    const {
      agent,
      ecs,
      process,
      ...relevantData
    } = relatedEventToShowDetailsFor as ResolverEvent & {
      ecs: unknown;
    };
    let displayDate = '';
    const sectionData: Array<{
      sectionTitle: string;
      entries: Array<{ title: string; description: string }>;
    }> = Object.entries(relevantData)
      .map(([sectionTitle, val]) => {
        if (sectionTitle === '@timestamp') {
          displayDate = formatDate(val);
          return { sectionTitle: '', entries: [] };
        }
        if (typeof val !== 'object') {
          return { sectionTitle, entries: [{ title: sectionTitle, description: `${val}` }] };
        }
        return { sectionTitle, entries: [...objectToDescriptionListEntries(val)] };
      })
      .filter((v) => v.sectionTitle !== '' && v.entries.length);
    return [sectionData, displayDate];
  }, [relatedEventToShowDetailsFor, naString]);

  const waitCrumbs = useMemo(() => {
    return [
      {
        text: eventsString,
        onClick: () => {
          setPanelState({ panelView: 'node' });
        },
      },
    ];
  }, [setPanelState, eventsString]);

  const { subject = '', descriptor = '' } = relatedEventToShowDetailsFor
    ? event.descriptiveName(relatedEventToShowDetailsFor)
    : {};
  const crumbs = useMemo(() => {
    return [
      {
        text: eventsString,
        onClick: () => {
          setPanelState({ panelView: 'node' });
        },
      },
      {
        text: processName,
        onClick: () => {
          setPanelState({ panelView: 'node', panelNodeID: nodeID });
        },
      },
      {
        text: (
          <>
            <FormattedMessage
              id="xpack.securitySolution.endpoint.resolver.panel.relatedEventDetail.numberOfEvents"
              values={{ totalCount }}
              defaultMessage="{totalCount} Events"
            />
          </>
        ),
        onClick: () => {
          setPanelState({ panelView: 'nodeEvents', panelNodeID: nodeID });
        },
      },
      {
        text: (
          <>
            <FormattedMessage
              id="xpack.securitySolution.endpoint.resolver.panel.relatedEventDetail.countByCategory"
              values={{ count: countBySameCategory, category: relatedEventCategory }}
              defaultMessage="{count} {category}"
            />
          </>
        ),
        onClick: () => {
          setPanelState({
            panelView: 'nodeEvents',
            panelNodeID: nodeID,
            // this might be undefined
            panelEventCategory: relatedEventCategory,
          });
        },
      },
      {
        text: relatedEventToShowDetailsFor ? (
          <FormattedMessage
            id="xpack.securitySolution.endpoint.resolver.panel.relatedEventDetail.eventDescriptiveName"
            values={{ subject, descriptor }}
            defaultMessage="{descriptor} {subject}"
          />
        ) : (
          naString
        ),
        onClick: () => {},
      },
    ];
  }, [
    processName,
    nodeID,
    eventsString,
    pushToQueryParams,
    totalCount,
    countBySameCategory,
    naString,
    relatedEventCategory,
    relatedEventToShowDetailsFor,
    subject,
    descriptor,
  ]);

  /**
   * If the ship hasn't come in yet, wait on the dock
   */
  if (!relatedsReady) {
    const waitingString = i18n.translate(
      'xpack.securitySolution.endpoint.resolver.panel.relatedDetail.wait',
      {
        defaultMessage: 'Waiting For Events...',
      }
    );
    return (
      <>
        <StyledBreadcrumbs breadcrumbs={waitCrumbs} />
        <EuiSpacer size="l" />
        <EuiTitle>
          <h4>{waitingString}</h4>
        </EuiTitle>
      </>
    );
  }

  /**
   * Could happen if user e.g. loads a URL with a bad crumbEvent
   */
  if (!relatedEventToShowDetailsFor) {
    return (
      <PanelContentError
        translatedErrorMessage={i18n.translate(
          'xpack.securitySolution.endpoint.resolver.panel.relatedDetail.missing',
          {
            defaultMessage: 'Related event not found.',
          }
        )}
      />
    );
  }

  return (
    <>
      <StyledBreadcrumbs truncate={false} breadcrumbs={crumbs} />
      <EuiSpacer size="l" />
      <EuiText size="s">
        <BoldCode>
          <FormattedMessage
            id="xpack.securitySolution.endpoint.resolver.panel.relatedEventDetail.categoryAndType"
            values={{
              category: relatedEventCategory,
              eventType: String(event.ecsEventType(relatedEventToShowDetailsFor)),
            }}
            defaultMessage="{category} {eventType}"
          />
        </BoldCode>
        <FormattedMessage
          id="xpack.securitySolution.endpoint.resolver.panel.relatedEventDetail.atTime"
          values={{ date: formattedDate }}
          defaultMessage="@ {date}"
        />
      </EuiText>
      <EuiSpacer size="m" />
      <EuiText>
        <FormattedMessage
          id="xpack.securitySolution.endpoint.resolver.panel.relatedEventDetail.eventDescriptiveNameInTitle"
          values={{ subject, descriptor }}
          defaultMessage="{descriptor} {subject}"
        />
      </EuiText>
      <EuiSpacer size="l" />
      {sections.map(({ sectionTitle, entries }, index) => {
        return (
          <Fragment key={index}>
            {index === 0 ? null : <EuiSpacer size="m" />}
            <EuiTitle size="xs">
              <EuiTextColor color="secondary">
                <StyledFlexTitle>
                  {sectionTitle}
                  <TitleHr />
                </StyledFlexTitle>
              </EuiTextColor>
            </EuiTitle>
            <RelatedEventDetailStyledDescriptionList
              type="column"
              align="left"
              titleProps={{ className: 'desc-title' }}
              compressed
              listItems={entries}
            />
            {index === sections.length - 1 ? null : <EuiSpacer size="m" />}
          </Fragment>
        );
      })}
    </>
  );
});
