import { Redirect } from 'expo-router';

import { ChangePasswordScreen } from '@/features/account/components/ChangePasswordScreen';
import { useAuth } from '@/features/auth/hooks/useAuth';

export default function ChangePasswordRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  if (!isAuthenticated) return <Redirect href="/login" />;
  return <ChangePasswordScreen />;
}
