/**
 * Background Jobs
 * Starts all scheduled jobs when the server boots.
 */
import { startExpireListingsJob, stopExpireListingsJob } from './expireListings.js';
import {
  startMatchSavedSearchesJob,
  stopMatchSavedSearchesJob,
} from './matchSavedSearches.js';
import { startPushDeliveryJob, stopPushDeliveryJob } from './processPushDeliveries.js';

export function startJobs(): void {
  startExpireListingsJob();
  startMatchSavedSearchesJob();
  startPushDeliveryJob();
  console.log('🔄 Background jobs started');
}

export function stopJobs(): void {
  stopExpireListingsJob();
  stopMatchSavedSearchesJob();
  stopPushDeliveryJob();
}
