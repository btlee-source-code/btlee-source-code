// Generates a 1024x1024 app icon for Btlee from an inline SVG, using sharp.
// Brand: deep green background, cream outlined house mark (matches the logo).
import sharp from 'sharp';
import { writeFileSync } from 'node:fs';

const GREEN = '#163A30';
const GREEN_DARK = '#0E2A22';
const CREAM = '#F4EFE3';

const svg = `
<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${GREEN}"/>
      <stop offset="1" stop-color="${GREEN_DARK}"/>
    </linearGradient>
  </defs>

  <!-- Background (full square, no transparency — Meta/OS rounds it itself) -->
  <rect width="1024" height="1024" fill="url(#bg)"/>

  <!-- House mark -->
  <g fill="none" stroke="${CREAM}" stroke-width="44"
     stroke-linecap="round" stroke-linejoin="round">

    <!-- Outer house outline with a doorway notch at the bottom centre -->
    <path d="
      M 512 300
      L 736 496
      L 736 672
      Q 736 716 692 716
      L 575 716
      L 575 575
      Q 575 560 560 560
      L 464 560
      Q 449 560 449 575
      L 449 716
      L 332 716
      Q 288 716 288 672
      L 288 496
      Z
    "/>

    <!-- Chimney on the left roof slope -->
    <path d="M 392 300 L 392 392"/>

    <!-- Window: 2x2 grid of small squares, upper-middle -->
    <g stroke-width="0" fill="${CREAM}">
      <rect x="448" y="404" width="42" height="42" rx="10"/>
      <rect x="534" y="404" width="42" height="42" rx="10"/>
      <rect x="448" y="476" width="42" height="42" rx="10"/>
      <rect x="534" y="476" width="42" height="42" rx="10"/>
    </g>
  </g>
</svg>`;

writeFileSync(new URL('../public/btlee-app-icon.svg', import.meta.url), svg);

await sharp(Buffer.from(svg))
  .resize(1024, 1024)
  .flatten({ background: GREEN_DARK }) // guarantee a fully opaque image
  .png()
  .toFile(new URL('../public/btlee-app-icon-1024.png', import.meta.url).pathname.replace(/^\//, ''));

console.log('✅ Wrote public/btlee-app-icon-1024.png');
