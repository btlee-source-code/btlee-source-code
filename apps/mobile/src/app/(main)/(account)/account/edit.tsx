import { Redirect } from 'expo-router';

import { EditProfileScreen } from '@/features/account/components/EditProfileScreen';
import { useAuth } from '@/features/auth/hooks/useAuth';

export default function EditProfileRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  if (!isAuthenticated) return <Redirect href="/login" />;
  return <EditProfileScreen />;
}
