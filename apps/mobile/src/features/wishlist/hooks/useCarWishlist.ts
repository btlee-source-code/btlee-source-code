import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { Alert } from 'react-native';

import { S } from '@/config/strings';
import { toast } from '@/shared/components/ui/Toast';
import { successHaptic } from '@/shared/lib/haptics';
import { useAppDispatch, useAppSelector } from '@/shared/store/hooks';
import { wishlistActions } from '@/features/wishlist/store/wishlist.slice';
import { carWishlistApi } from '../api/carWishlist.api';

/**
 * Car wishlist toggle — the car counterpart of useWishlist. Optimistic updates
 * with guest gating; `saved` is passed in by each card so the hook only
 * subscribes to the rarely-changing auth status.
 */
export function useCarWishlist() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const status = useAppSelector((s) => s.auth.status);

  const toggle = useCallback(
    (carId: string, saved: boolean) => {
      if (status !== 'authenticated') {
        Alert.alert(S.loginToSave, undefined, [
          { text: S.signInTitle, onPress: () => router.push('/login') },
          { text: 'إلغاء', style: 'cancel' },
        ]);
        return;
      }
      if (saved) {
        dispatch(wishlistActions.removeCarId(carId));
        toast.success(S.toastWishlistRemoved);
        carWishlistApi.remove(carId).catch(() => dispatch(wishlistActions.addCarId(carId)));
      } else {
        dispatch(wishlistActions.addCarId(carId));
        successHaptic();
        toast.success(S.toastWishlistAdded);
        carWishlistApi.add(carId).catch(() => dispatch(wishlistActions.removeCarId(carId)));
      }
    },
    [status, dispatch, router]
  );

  return { toggle };
}
