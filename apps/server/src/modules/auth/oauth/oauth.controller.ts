/**
 * OAuth controller — Google social login.
 *
 * Unlike the JSON auth endpoints, these are full-page browser redirects:
 *   GET /auth/<provider>           → 302 to the provider's consent screen
 *   GET /auth/<provider>/callback  → set auth cookies, then 302 back to frontend
 *
 * On the callback we set the same httpOnly cookies the password flow uses, so
 * the rest of the app treats an OAuth session identically to a local one.
 */
import type { Request, Response } from 'express';
import { env } from '../../../config/env.js';
import { setAuthCookies, USER_COOKIES } from '../../../shared/utils/cookies.js';
import { AppError } from '../../../shared/errors/AppError.js';
import * as google from './google.provider.js';
import * as oauthService from './oauth.service.js';
import {
  createState,
  setStateCookie,
  clearStateCookie,
  isValidState,
  OAUTH_STATE_COOKIE,
} from './oauth.state.js';

// Where the browser lands after the callback finishes (success or failure).
const CALLBACK_PATH = '/oauth/callback';

// Each provider exposes the same shape, so one handler drives every provider.
type Provider = {
  getAuthUrl(state: string): string;
  getProfile(code: string): Promise<import('./oauth.types.js').OAuthProfile>;
};
const PROVIDERS: Record<'google', Provider> = { google };

function clientRedirect(params: Record<string, string>): string {
  const base = env.CLIENT_URL.replace(/\/$/, '');
  const qs = new URLSearchParams(params).toString();
  return `${base}${CALLBACK_PATH}?${qs}`;
}

/** Step 1 — kick off the flow: stash state, redirect to the provider. */
function startFlow(name: 'google') {
  return (_req: Request, res: Response): void => {
    const state = createState();
    let authUrl: string;
    try {
      authUrl = PROVIDERS[name].getAuthUrl(state);
    } catch (err) {
      // e.g. the provider isn't configured (503) — show the friendly client
      // error page instead of a raw JSON error.
      const reason = err instanceof AppError && err.statusCode === 503 ? 'unconfigured' : 'failed';
      res.redirect(clientRedirect({ status: 'error', reason }));
      return;
    }
    setStateCookie(res, state);
    res.redirect(authUrl);
  };
}

/** Step 2 — provider redirects here with ?code & ?state (or ?error on denial). */
function handleCallback(name: 'google') {
  return async (req: Request, res: Response): Promise<void> => {
    const cookieState = (req.cookies as Record<string, string> | undefined)?.[OAUTH_STATE_COOKIE];
    clearStateCookie(res); // single-use, regardless of outcome

    // User denied consent, or the provider reported an error.
    if (typeof req.query.error === 'string') {
      res.redirect(clientRedirect({ status: 'error', reason: 'denied' }));
      return;
    }

    const code = req.query.code;
    const queryState = req.query.state;

    if (typeof code !== 'string' || !isValidState(cookieState, queryState)) {
      res.redirect(clientRedirect({ status: 'error', reason: 'invalid_state' }));
      return;
    }

    try {
      const profile = await PROVIDERS[name].getProfile(code);
      const { accessToken, refreshToken, isNewUser } = await oauthService.loginWithOAuth(profile);
      setAuthCookies(res, { accessToken, refreshToken }, USER_COOKIES);
      res.redirect(
        clientRedirect(isNewUser ? { status: 'success', onboarding: '1' } : { status: 'success' })
      );
    } catch (err) {
      const reason =
        err instanceof AppError && err.statusCode === 403
          ? 'blocked'
          : err instanceof AppError && err.statusCode === 503
            ? 'unconfigured'
            : 'failed';
      res.redirect(clientRedirect({ status: 'error', reason }));
    }
  };
}

export const googleRedirect = startFlow('google');
export const googleCallback = handleCallback('google');
