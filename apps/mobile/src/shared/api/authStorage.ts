/**
 * Secure token storage for the mobile app. Web keeps tokens in httpOnly cookies;
 * RN has no reliable cookie jar, so we store the access + refresh tokens in the
 * OS keychain/keystore via expo-secure-store and attach them as Bearer headers.
 */
import * as SecureStore from 'expo-secure-store';

const ACCESS_KEY = 'btlee_access_token';
const REFRESH_KEY = 'btlee_refresh_token';

export async function getAccessToken(): Promise<string | null> {
  return SecureStore.getItemAsync(ACCESS_KEY);
}

export async function getRefreshToken(): Promise<string | null> {
  return SecureStore.getItemAsync(REFRESH_KEY);
}

export async function setTokens(accessToken: string, refreshToken?: string | null): Promise<void> {
  await SecureStore.setItemAsync(ACCESS_KEY, accessToken);
  if (refreshToken) await SecureStore.setItemAsync(REFRESH_KEY, refreshToken);
}

export async function clearTokens(): Promise<void> {
  await SecureStore.deleteItemAsync(ACCESS_KEY);
  await SecureStore.deleteItemAsync(REFRESH_KEY);
}
