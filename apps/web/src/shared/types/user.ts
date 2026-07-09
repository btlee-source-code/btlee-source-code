/**
 * User types — mirror the server schema.
 */
import type { UserGoal } from '../lib/constants';

export interface User {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  avatar: string | null;
  goal: UserGoal | null;
  hasCompletedOnboarding: boolean;
}

/**
 * Login/register response. Tokens are delivered as httpOnly cookies, never in
 * the body, so the client only ever sees the user object.
 */
export interface AuthResult {
  user: User;
}
