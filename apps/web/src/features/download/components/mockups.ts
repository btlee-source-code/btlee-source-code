/**
 * App mockups for the /download page — the supplied Android renders with the
 * app screen inside (android_frame_app_photos for Arabic, android_frame_app_photos_en for English).
 *
 * scripts/make-download-assets.mjs trims each render to the handset and pads
 * it onto one canvas, so every phone on the page lands at the same size and
 * shares a single aspect ratio. Re-run it after replacing a source render.
 *
 * Each locale has its own set, so an English visitor sees English screens.
 */
export const SCREENS = [
  '01-properties-home',
  '02-property-details',
  '04-cars-home',
  '08-car-make-picker',
  '06-add-property',
  '07-add-car',
  '05-sign-in',
] as const;

export type ScreenName = (typeof SCREENS)[number];
export type DownloadLocale = 'ar' | 'en';

/** Canvas the mockups are built on — matches MOCKUP_W/H in the asset script. */
export const MOCKUP_ASPECT = '700 / 1340';

const paths = (locale: DownloadLocale): Record<ScreenName, string> =>
  Object.fromEntries(
    SCREENS.map((screen) => [screen, `/app-download/mockups/${locale}/${screen}.webp`]),
  ) as Record<ScreenName, string>;

export const MOCKUPS: Record<DownloadLocale, Record<ScreenName, string>> = {
  ar: paths('ar'),
  en: paths('en'),
};

/** Screens walked through by the scroll showcase, in order. */
export const SHOWCASE_SCREENS: ScreenName[] = [
  '01-properties-home',
  '02-property-details',
  '04-cars-home',
  '05-sign-in',
  '06-add-property',
];
