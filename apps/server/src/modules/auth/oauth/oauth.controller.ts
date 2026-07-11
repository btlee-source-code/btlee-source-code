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
  createMobileState,
  readMobileState,
  isMobileState,
  setStateCookie,
  clearStateCookie,
  isValidState,
  OAUTH_STATE_COOKIE,
  safeReturnUrl,
} from './oauth.state.js';

// Where the browser lands after the callback finishes (success or failure).
const CALLBACK_PATH = '/oauth/callback';

// Mobile flow (additive): the app opens the same web start URL with
// `?client=mobile&returnUrl=<app deep link>`. We reuse the SAME Google callback
// (so no OAuth-console change is needed). The return deep-link is SIGNED into the
// `state` param (cookie-free — cookies don't survive the in-app-browser round
// trip), and at the end we redirect the browser back to the app with tokens in
// the URL instead of setting web cookies. The web flow is completely unaffected.

/** Append query params to a URL of any scheme (avoids URL()'s custom-scheme quirks). */
function withParams(url: string, params: Record<string, string>): string {
  const qs = new URLSearchParams(params).toString();
  return url + (url.includes('?') ? '&' : '?') + qs;
}

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
  return (req: Request, res: Response): void => {
    const mobile = req.query.client === 'mobile';
    const returnUrl = mobile ? safeReturnUrl(req.query.returnUrl) : null;
    // Mobile with a valid return link → sign it into the state (cookie-free).
    // Everything else → plain random state validated against a cookie (web).
    const state = returnUrl ? createMobileState(returnUrl) : createState();
    let authUrl: string;
    try {
      authUrl = PROVIDERS[name].getAuthUrl(state);
    } catch (err) {
      // e.g. the provider isn't configured (503) — show the friendly client
      // error page instead of a raw JSON error.
      const reason = err instanceof AppError && err.statusCode === 503 ? 'unconfigured' : 'failed';
      res.redirect(returnUrl ? withParams(returnUrl, { status: 'error', reason }) : clientRedirect({ status: 'error', reason }));
      return;
    }
    // Cookie still set for the web flow; the mobile flow ignores it on callback.
    setStateCookie(res, state);
    res.redirect(authUrl);
  };
}

/** Step 2 — provider redirects here with ?code & ?state (or ?error on denial). */
function handleCallback(name: 'google') {
  return async (req: Request, res: Response): Promise<void> => {
    const cookies = req.cookies as Record<string, string> | undefined;
    const cookieState = cookies?.[OAUTH_STATE_COOKIE];
    clearStateCookie(res); // single-use, regardless of outcome

    const queryState = req.query.state;
    // Mobile: recover the return link from the SIGNED state (no cookie needed).
    // A verified signed state is self-sufficient; the `m.` marker alone (without a
    // valid signature) is not trusted.
    const signed = readMobileState(queryState);
    const mobile = signed !== null || isMobileState(queryState);
    const returnUrl = signed?.returnUrl ?? null;
    const fail = (reason: string): void => {
      res.redirect(
        mobile && returnUrl
          ? withParams(returnUrl, { status: 'error', reason })
          : clientRedirect({ status: 'error', reason })
      );
    };

    // User denied consent, or the provider reported an error.
    if (typeof req.query.error === 'string') {
      fail('denied');
      return;
    }

    const code = req.query.code;
    // Mobile: the signed state is self-validating (HMAC). Web: double-submit cookie.
    const stateOk = signed !== null || isValidState(cookieState, queryState);
    if (typeof code !== 'string' || !stateOk) {
      fail('invalid_state');
      return;
    }

    try {
      const profile = await PROVIDERS[name].getProfile(code);
      const { accessToken, refreshToken, isNewUser } = await oauthService.loginWithOAuth(profile);
      if (mobile && returnUrl) {
        // Hand the app its tokens via the deep link (no web cookies).
        res.redirect(
          withParams(returnUrl, {
            status: 'success',
            accessToken,
            refreshToken,
            ...(isNewUser ? { onboarding: '1' } : {}),
          })
        );
      } else {
        setAuthCookies(res, { accessToken, refreshToken }, USER_COOKIES);
        res.redirect(
          clientRedirect(isNewUser ? { status: 'success', onboarding: '1' } : { status: 'success' })
        );
      }
    } catch (err) {
      const reason =
        err instanceof AppError && err.statusCode === 403
          ? 'blocked'
          : err instanceof AppError && err.statusCode === 503
            ? 'unconfigured'
            : 'failed';
      fail(reason);
    }
  };
}

export const googleRedirect = startFlow('google');
export const googleCallback = handleCallback('google');
