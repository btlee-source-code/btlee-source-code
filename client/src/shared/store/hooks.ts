/**
 * Typed wrappers around react-redux's useSelector / useDispatch.
 * Always import from here so components get full type inference of the
 * RootState / AppDispatch types.
 */
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './index';

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
