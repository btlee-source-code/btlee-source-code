// Builds the assets used by the "download the app" home section:
//   1. The phone mockups — the 3D Android renders in apps/mobile
//      (app-photo-ar.png / app-photo.png for English). Those exports have the
//      editor's transparency checkerboard baked in as opaque pixels, so the
//      background is cut out here: a flood fill from the image border over
//      light, unsaturated pixels. The screen is just as light, but the dark
//      bezel encloses it, so the fill never reaches it. Pixels bordering the
//      cut get partial alpha from their lightness to keep the edge anti-aliased.
//   2. The Play Store QR code — rendered once to a static SVG so the page
//      carries no QR runtime dependency. Re-run this script if the store URL
//      in src/config/site.ts ever changes.
//
// Usage: node scripts/make-download-assets.mjs
import sharp from 'sharp';
import QRCode from 'qrcode';
import { mkdirSync, writeFileSync } from 'node:fs';

const MOCKUPS = {
  ar: '../mobile/assets/images/app-photo-ar.png',
  en: '../mobile/assets/images/app-photo.png',
};
const OUT_DIR = 'public/app-download';
const PLAY_STORE = 'https://play.google.com/store/apps/details?id=com.btlee.app';

// Brand forest green — the QR renders on the white card in the section, so the
// light module colour stays transparent and the card shows through in both themes.
const QR_DARK = '#1A3C34';

mkdirSync(OUT_DIR, { recursive: true });

async function cutOutBackground(file) {
  const { data, info } = await sharp(file)
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;
  const n = w * h;

  const isBackground = (p) => {
    const r = data[p * 3], g = data[p * 3 + 1], b = data[p * 3 + 2];
    return Math.min(r, g, b) >= 215 && Math.max(r, g, b) - Math.min(r, g, b) <= 14;
  };

  const bg = new Uint8Array(n);
  const stack = [];
  for (let x = 0; x < w; x++) stack.push(x, (h - 1) * w + x);
  for (let y = 0; y < h; y++) stack.push(y * w, y * w + w - 1);
  while (stack.length) {
    const p = stack.pop();
    if (bg[p] || !isBackground(p)) continue;
    bg[p] = 1;
    const x = p % w;
    if (x > 0) stack.push(p - 1);
    if (x < w - 1) stack.push(p + 1);
    if (p >= w) stack.push(p - w);
    if (p < n - w) stack.push(p + w);
  }

  const rgba = Buffer.alloc(n * 4);
  for (let p = 0; p < n; p++) {
    rgba[p * 4] = data[p * 3];
    rgba[p * 4 + 1] = data[p * 3 + 1];
    rgba[p * 4 + 2] = data[p * 3 + 2];
    if (bg[p]) continue; // alpha 0

    const x = p % w;
    const touchesBg =
      (x > 0 && bg[p - 1]) || (x < w - 1 && bg[p + 1]) ||
      (p >= w && bg[p - w]) || (p < n - w && bg[p + w]);
    let alpha = 255;
    if (touchesBg) {
      // Blend of dark bezel (~40) and light background (~246).
      const lum = (data[p * 3] + data[p * 3 + 1] + data[p * 3 + 2]) / 3;
      alpha = Math.round(255 * Math.min(1, Math.max(0, (246 - lum) / (246 - 40))));
    }
    rgba[p * 4 + 3] = alpha;
  }

  return sharp(rgba, { raw: { width: w, height: h, channels: 4 } });
}

for (const [locale, file] of Object.entries(MOCKUPS)) {
  const cut = await cutOutBackground(file);
  const png = await cut.png().toBuffer();
  const out = await sharp(png)
    .trim({ threshold: 0 })
    .resize({ width: 640 })
    .webp({ quality: 85, alphaQuality: 90 })
    .toFile(`${OUT_DIR}/app-mockup-${locale}.webp`);
  console.log(`built app-mockup-${locale}.webp (${out.width}x${out.height}, ${out.size} bytes)`);

  const svg = await QRCode.toString(`${PLAY_STORE}&hl=${locale}`, {
    type: 'svg',
    errorCorrectionLevel: 'M',
    margin: 0,
    color: { dark: QR_DARK, light: '#0000' },
  });
  writeFileSync(`${OUT_DIR}/qr-${locale}.svg`, svg);
  console.log(`built qr-${locale}.svg`);
}

// --- /download page mockups -------------------------------------------------
// One render per screen per locale. The two sets are numbered in different
// orders, and a few English exports lost their alpha channel (transparency
// flattened onto black), so those get their background cut back out here.
//
// Every render is then trimmed to the handset and re-padded onto one canvas:
// the supplied files carry different amounts of empty margin, which would
// otherwise land each phone at its own size on the page.
//
// Keep the screen names in sync with SCREENS in
// src/features/download/components/mockups.ts.
const MOCKUP_SOURCES = {
  ar: {
    '01-properties-home': '1.png',
    '02-property-details': '2.png',
    '04-cars-home': '3.png',
    '05-sign-in': '4.png',
    '06-add-property': '5.png',
    '07-add-car': '6.png',
    '08-car-make-picker': '7.png',
  },
  en: {
    '01-properties-home': '1.png',
    '02-property-details': '2.png',
    '06-add-property': '3.png',
    '04-cars-home': '4.png',
    '07-add-car': '5.png',
    '08-car-make-picker': '6.png',
    '05-sign-in': '7.png',
  },
};

const MOCKUP_DIRS = {
  ar: '../mobile/assets/android_frame_app_photos',
  en: '../mobile/assets/android_frame_app_photos_en',
};

// Matches MOCKUP_ASPECT in mockups.ts.
const MOCKUP_W = 700;
const MOCKUP_H = 1340;

/**
 * Restores transparency on a render whose background was flattened onto black:
 * a flood fill from the border over near-black pixels. The handset's own bezel
 * is far brighter than the background (it jumps past 80 within two pixels), so
 * the fill stops at its edge. Pixels on that edge take partial alpha from their
 * brightness, which keeps the outline from turning into a hard staircase.
 */
async function cutBlackBackground(file) {
  const { data, info } = await sharp(file).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;
  const n = w * h;
  const luminance = (p) => Math.max(data[p * 3], data[p * 3 + 1], data[p * 3 + 2]);

  const background = new Uint8Array(n);
  const stack = [];
  for (let x = 0; x < w; x++) stack.push(x, (h - 1) * w + x);
  for (let y = 0; y < h; y++) stack.push(y * w, y * w + w - 1);
  while (stack.length) {
    const p = stack.pop();
    if (background[p] || luminance(p) > 8) continue;
    background[p] = 1;
    const x = p % w;
    if (x > 0) stack.push(p - 1);
    if (x < w - 1) stack.push(p + 1);
    if (p >= w) stack.push(p - w);
    if (p < n - w) stack.push(p + w);
  }

  const rgba = Buffer.alloc(n * 4);
  for (let p = 0; p < n; p++) {
    rgba[p * 4] = data[p * 3];
    rgba[p * 4 + 1] = data[p * 3 + 1];
    rgba[p * 4 + 2] = data[p * 3 + 2];
    if (background[p]) continue; // alpha 0

    const x = p % w;
    const onEdge =
      (x > 0 && background[p - 1]) || (x < w - 1 && background[p + 1]) ||
      (p >= w && background[p - w]) || (p < n - w && background[p + w]);
    rgba[p * 4 + 3] = onEdge ? Math.min(255, Math.round((255 * luminance(p)) / 70)) : 255;
  }

  return sharp(rgba, { raw: { width: w, height: h, channels: 4 } }).png().toBuffer();
}

/** True when the file has no usable alpha — every pixel is fully opaque. */
async function isFlattened(file) {
  const meta = await sharp(file).metadata();
  if (!meta.hasAlpha) return true;
  const { data } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let i = 3; i < data.length; i += 4) if (data[i] < 250) return false;
  return true;
}

for (const [locale, screens] of Object.entries(MOCKUP_SOURCES)) {
  mkdirSync(`${OUT_DIR}/mockups/${locale}`, { recursive: true });

  for (const [screen, file] of Object.entries(screens)) {
    const source = `${MOCKUP_DIRS[locale]}/${file}`;
    const flattened = await isFlattened(source);
    const input = flattened ? await cutBlackBackground(source) : source;

    const trimmed = await sharp(input).ensureAlpha().trim({ threshold: 4 }).png().toBuffer();

    const out = await sharp(trimmed)
      .resize({
        width: MOCKUP_W,
        height: MOCKUP_H,
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .webp({ quality: 86, alphaQuality: 90 })
      .toFile(`${OUT_DIR}/mockups/${locale}/${screen}.webp`);

    console.log(
      `built mockups/${locale}/${screen}.webp (${Math.round(out.size / 1024)} KB)` +
        (flattened ? ' — background cut from black' : ''),
    );
  }
}
