'use client';
/**
 * useAdminAuth — admin-side equivalent of useAuth.
 * Internals run on Redux Toolkit; the public API is unchanged.
 */
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/shared/store/hooks';
import { adminAuthActions } from '@/features/admin/store/admin.slice';
import { adminApi } from '../api/admin.api';
import { useRouter } from '@/config/navigation';

export function useAdminAuth(redirect = true) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const admin = useAppSelector((s) => s.adminAuth.admin);
  const isHydrated = useAppSelector((s) => s.adminAuth.isHydrated);

  useEffect(() => {
    if (redirect && isHydrated && !admin) {
      router.push('/admin/login');
    }
  }, [isHydrated, admin, router, redirect]);

  async function login(email: string, password: string) {
    const result = await adminApi.login(email, password);
    dispatch(adminAuthActions.setAuth(result.admin));
    return result;
  }

  async function logout() {
    await adminApi.logout().catch(() => {});
    dispatch(adminAuthActions.clearAuth());
    router.push('/admin/login');
  }

  return { admin, isAuthenticated: Boolean(admin), isHydrated, login, logout };
}
