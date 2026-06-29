/**
 * Background Jobs
 * Starts all scheduled jobs when the server boots.
 */
import { startExpireListingsJob, stopExpireListingsJob } from './expireListings.js';
import {
  startMatchSavedSearchesJob,
  stopMatchSavedSearchesJob,
} from './matchSavedSearches.js';

export function startJobs(): void {
  startExpireListingsJob();
  startMatchSavedSearchesJob();
  console.log('🔄 Background jobs started');
}

export function stopJobs(): void {
  stopExpireListingsJob();
  stopMatchSavedSearchesJob();
}
