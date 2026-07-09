export type UserGoal = 'buy' | 'rent' | 'sell' | 'browse';

/** Public user shape returned by the API (auth + /users/me). Mirrors the web. */
export interface User {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  avatar: string | null;
  goal: UserGoal | null;
  hasCompletedOnboarding: boolean;
}
