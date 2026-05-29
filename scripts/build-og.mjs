// Generates /public/og.svg and, when ImageMagick is available, PNG fallbacks.
// OG layout: headshot on the LEFT, name + role on the RIGHT.
import { execSync } from 'node:child_process';
import {
  writeFileSync,
  existsSync,
  mkdirSync,
  readFileSync
} from 'node:fs';
import path from 'node:path';

const W = 1200, H = 630;
const hasConvert = (() => {
  try {
    execSync('command -v convert', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
})();

// Embed the cropped square headshot as base64 so the SVG is self contained.
const headshotPath = path.resolve('public/headshot-square.jpg');
let headshotHref = '';
if (existsSync(headshotPath)) {
  const b64 = readFileSync(headshotPath).toString('base64');
  headshotHref = `data:image/jpeg;base64,${b64}`;
}

const PORTRAIT_SIZE = 360;
const PORTRAIT_X = 90;
const PORTRAIT_Y = (H - PORTRAIT_SIZE) / 2;
const PORTRAIT_CX = PORTRAIT_X + PORTRAIT_SIZE / 2;
const PORTRAIT_CY = PORTRAIT_Y + PORTRAIT_SIZE / 2;
const PORTRAIT_R = PORTRAIT_SIZE / 2;

const portraitBlock = headshotHref
  ? `
  <defs>
    <clipPath id="circle">
      <circle cx="${PORTRAIT_CX}" cy="${PORTRAIT_CY}" r="${PORTRAIT_R}"/>
    </clipPath>
  </defs>
  <image href="${headshotHref}" x="${PORTRAIT_X}" y="${PORTRAIT_Y}" width="${PORTRAIT_SIZE}" height="${PORTRAIT_SIZE}" preserveAspectRatio="xMidYMid slice" clip-path="url(#circle)"/>
  <circle cx="${PORTRAIT_CX}" cy="${PORTRAIT_CY}" r="${PORTRAIT_R + 4}" fill="none" stroke="#22D3EE" stroke-width="5"/>`
  : '';

const TEXT_X = 530;

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="#09090F"/>
  <path d="M0 0H1200V630H0Z" fill="none"/>
  <g opacity="0.12">
    <path d="M0 90H1200M0 180H1200M0 270H1200M0 360H1200M0 450H1200M0 540H1200" stroke="#FFFFFF"/>
    <path d="M90 0V630M180 0V630M270 0V630M360 0V630M450 0V630M540 0V630M630 0V630M720 0V630M810 0V630M900 0V630M990 0V630M1080 0V630" stroke="#FFFFFF"/>
  </g>
  <rect x="520" y="126" width="155" height="8" fill="#EC4899"/>
  ${portraitBlock}
  <text x="${TEXT_X}" y="180" font-family="Inter, system-ui, sans-serif" font-size="22" letter-spacing="3" fill="#F9A8D4" font-weight="800">KERRY DEAN JR.</text>
  <text x="${TEXT_X}" y="285" font-family="Inter, system-ui, sans-serif" font-size="76" font-weight="900" fill="#F4F7FB">Production AI</text>
  <text x="${TEXT_X}" y="365" font-family="Inter, system-ui, sans-serif" font-size="76" font-weight="900" fill="#F4F7FB">systems.</text>
  <text x="${TEXT_X}" y="430" font-family="Inter, system-ui, sans-serif" font-size="34" font-weight="800" fill="#10B981">The real ones are here.</text>
  <text x="${TEXT_X}" y="490" font-family="Inter, system-ui, sans-serif" font-size="22" fill="#F4F7FB" opacity="0.76">Browser demos, case studies, repos, and receipts.</text>
  <text x="${W - 70}" y="${H - 50}" text-anchor="end" font-family="ui-monospace, Menlo, monospace" font-size="14" fill="#22D3EE" letter-spacing="2">KERRYDEAN-HUB.VERCEL.APP</text>
</svg>`;

const outDir = path.resolve('public');
if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });
const svgPath = path.join(outDir, 'og.svg');
const pngPath = path.join(outDir, 'og.png');
writeFileSync(svgPath, svg);

if (hasConvert) {
  execSync(`convert -density 144 -background none "${svgPath}" -resize ${W}x${H} "${pngPath}"`, { stdio: 'inherit' });
  console.log('Wrote', pngPath);
} else {
  console.log('ImageMagick convert not found; wrote SVG and kept existing OG PNG fallback.');
}

// Brand initial mark, cyan on graphite, exported as a static app/icon.png when possible.
const ICON = 256;
const iconSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${ICON}" height="${ICON}" viewBox="0 0 ${ICON} ${ICON}">
  <rect width="${ICON}" height="${ICON}" rx="32" fill="#09090F"/>
  <rect x="24" y="24" width="208" height="208" rx="18" fill="none" stroke="#22D3EE" stroke-width="8"/>
  <text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle" font-family="Inter, system-ui, sans-serif" font-size="132" font-weight="900" fill="#10B981" letter-spacing="-6">KD</text>
</svg>`;

const appDir = path.resolve('app');
if (!existsSync(appDir)) mkdirSync(appDir, { recursive: true });
const iconSvgPath = path.join(appDir, 'icon.svg');
const iconPngPath = path.join(appDir, 'icon.png');
writeFileSync(iconSvgPath, iconSvg);

if (hasConvert) {
  execSync(`convert -density 200 -background none "${iconSvgPath}" -resize ${ICON}x${ICON} "${iconPngPath}"`, { stdio: 'inherit' });
  console.log('Wrote', iconPngPath);
} else {
  console.log('ImageMagick convert not found; wrote SVG and kept existing icon PNG fallback.');
}
