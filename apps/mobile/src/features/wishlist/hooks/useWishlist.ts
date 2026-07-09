import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { Alert } from 'react-native';

import { S } from '@/config/strings';
import { useAppDispatch, useAppSelector } from '@/shared/store/hooks';
import { wishlistActions } from '@/features/wishlist/store/wishlist.slice';
import { wishlistApi } from '../api/wishlist.api';

/**
 * Wishlist toggle with optimistic updates + guest gating. `saved` is passed in
 * by the caller (each card selects its own membership) so this hook doesn't
 * subscribe to the whole id list — only to the rarely-changing auth status.
 */
export function useWishlist() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const status = useAppSelector((s) => s.auth.status);

  const toggle = useCallback(
    (propertyId: string, saved: boolean) => {
      if (status !== 'authenticated') {
        Alert.alert(S.loginToSave, undefined, [
          { text: S.signInTitle, onPress: () => router.push('/login') },
          { text: 'إلغاء', style: 'cancel' },
        ]);
        return;
      }
      if (saved) {
        dispatch(wishlistActions.removeId(propertyId));
        wishlistApi.remove(propertyId).catch(() => dispatch(wishlistActions.addId(propertyId)));
      } else {
        dispatch(wishlistActions.addId(propertyId));
        wishlistApi.add(propertyId).catch(() => dispatch(wishlistActions.removeId(propertyId)));
      }
    },
    [status, dispatch, router]
  );

  return { toggle };
}
