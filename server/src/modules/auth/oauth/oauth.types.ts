/**
 * Normalized profile returned by every OAuth provider, so the service layer can
 * resolve a local user without caring which provider it came from.
 */
export interface OAuthProfile {
  provider: 'google';
  /** Stable provider account id (Google `sub`). */
  providerId: string;
  email: string | null;
  /** Whether the provider has verified the email (gates account-linking). */
  emailVerified: boolean;
  name: string;
  avatar: string | null;
}
