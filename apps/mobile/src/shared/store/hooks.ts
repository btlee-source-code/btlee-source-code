import { useDispatch, useSelector } from 'react-redux';

import type { AppDispatch, RootState } from './index';

// Typed versions of the redux hooks — always import from here (like the web).
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
