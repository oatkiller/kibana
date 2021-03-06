/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import * as rt from 'io-ts';
import { pipe } from 'fp-ts/lib/pipeable';
import { fold } from 'fp-ts/lib/Either';
import { identity } from 'fp-ts/lib/function';
import { kfetch } from 'ui/kfetch';
import { getAllModuleJobIds, getDatafeedId } from '../../../../../common/log_analysis';
import { throwErrors, createPlainError } from '../../../../../common/runtime_types';

export const callDeleteJobs = async (spaceId: string, sourceId: string) => {
  // NOTE: Deleting the jobs via this API will delete the datafeeds at the same time
  const deleteJobsResponse = await kfetch({
    method: 'POST',
    pathname: '/api/ml/jobs/delete_jobs',
    body: JSON.stringify(
      deleteJobsRequestPayloadRT.encode({
        jobIds: getAllModuleJobIds(spaceId, sourceId),
      })
    ),
  });

  return pipe(
    deleteJobsResponsePayloadRT.decode(deleteJobsResponse),
    fold(throwErrors(createPlainError), identity)
  );
};

export const callGetJobDeletionTasks = async () => {
  const jobDeletionTasksResponse = await kfetch({
    method: 'GET',
    pathname: '/api/ml/jobs/deleting_jobs_tasks',
  });

  return pipe(
    getJobDeletionTasksResponsePayloadRT.decode(jobDeletionTasksResponse),
    fold(throwErrors(createPlainError), identity)
  );
};

export const callStopDatafeed = async (spaceId: string, sourceId: string) => {
  // Stop datafeed due to https://github.com/elastic/kibana/issues/44652
  const stopDatafeedResponse = await kfetch({
    method: 'POST',
    pathname: `/api/ml/datafeeds/${getDatafeedId(spaceId, sourceId, 'log-entry-rate')}/_stop`,
  });

  return pipe(
    stopDatafeedResponsePayloadRT.decode(stopDatafeedResponse),
    fold(throwErrors(createPlainError), identity)
  );
};

export const deleteJobsRequestPayloadRT = rt.type({
  jobIds: rt.array(rt.string),
});

export type DeleteJobsRequestPayload = rt.TypeOf<typeof deleteJobsRequestPayloadRT>;

export const deleteJobsResponsePayloadRT = rt.record(
  rt.string,
  rt.type({
    deleted: rt.boolean,
  })
);

export const getJobDeletionTasksResponsePayloadRT = rt.type({
  jobIds: rt.array(rt.string),
});

export const stopDatafeedResponsePayloadRT = rt.type({
  stopped: rt.boolean,
});
