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
