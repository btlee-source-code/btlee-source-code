import { get } from '@/shared/api/httpClient';

/** Public owner card — only name/avatar/createdAt are exposed (email is never public). */
export interface PublicOwner {
  id: string;
  name: string;
  avatar: string | null;
  createdAt: string;
}

export const usersApi = {
  publicOwner: (userId: string) => get<PublicOwner>(`/users/${userId}/public`),
};
