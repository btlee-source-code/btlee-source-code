import { useCallback } from 'react';

import type { Section } from '@/config/theme';
import { sectionActions } from '@/features/section/store/section.slice';
import { useAppDispatch, useAppSelector } from '@/shared/store/hooks';

/** Read + set the active section (properties | cars). */
export function useSection() {
  const dispatch = useAppDispatch();
  const section = useAppSelector((s) => s.section.section);

  const setSection = useCallback(
    (next: Section) => dispatch(sectionActions.setSection(next)),
    [dispatch]
  );

  return { section, setSection, isCars: section === 'cars' };
}
