import { useEffect, type ReactNode } from 'react';

import { useAppDispatch, useAppSelector } from '@/shared/store/hooks';
import { wishlistActions } from '@/shared/store/wishlistSlice';
import { wishlistApi } from '../api/wishlist.api';

/**
 * Loads the user's saved-property IDs when they become authenticated, and clears
 * them on logout. Keeps every heart icon across the app in sync.
 */
export function WishlistProvider({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const status = useAppSelector((s) => s.auth.status);

  useEffect(() => {
    let active = true;
    if (status === 'authenticated') {
      wishlistApi
        .get()
        .then((props) => {
          if (active) dispatch(wishlistActions.setWishlist(props.map((p) => p._id)));
        })
        .catch(() => {});
    } else if (status === 'guest') {
      dispatch(wishlistActions.clearWishlist());
    }
    return () => {
      active = false;
    };
  }, [status, dispatch]);

  return <>{children}</>;
}
