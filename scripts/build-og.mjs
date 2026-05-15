// Generates /public/og.png + /app/icon.png at build time using SVG + ImageMagick.
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
  <circle cx="${PORTRAIT_CX}" cy="${PORTRAIT_CY}" r="${PORTRAIT_R + 4}" fill="none" stroke="#A67340" stroke-width="3"/>`
  : '';

const TEXT_X = 530;

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#F8F4ED"/>
      <stop offset="100%" stop-color="#EFE7D8"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  ${portraitBlock}
  <line x1="${TEXT_X}" y1="135" x2="${TEXT_X + 140}" y2="135" stroke="#A67340" stroke-width="3"/>
  <text x="${TEXT_X}" y="180" font-family="Inter, system-ui, sans-serif" font-size="22" letter-spacing="3" fill="#8a8a85" font-weight="500">KERRY DEAN JR.</text>
  <text x="${TEXT_X}" y="300" font-family="Newsreader, Georgia, serif" font-size="92" font-weight="500" fill="#1F1B15">Software Engineer.</text>
  <text x="${TEXT_X}" y="370" font-family="Newsreader, Georgia, serif" font-size="40" font-weight="500" fill="#A67340">Production AI systems.</text>
  <text x="${TEXT_X}" y="455" font-family="Inter, system-ui, sans-serif" font-size="22" fill="#1F1B15" opacity="0.75">RAG, agents, evaluation. Nine plus years.</text>
  <text x="${TEXT_X}" y="490" font-family="Inter, system-ui, sans-serif" font-size="22" fill="#1F1B15" opacity="0.75">Available for senior Software Engineer roles.</text>
  <text x="${W - 70}" y="${H - 50}" text-anchor="end" font-family="ui-monospace, Menlo, monospace" font-size="14" fill="#8a8a85" letter-spacing="2">KERRYDEAN-HUB.VERCEL.APP</text>
</svg>`;

const outDir = path.resolve('public');
if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });
const svgPath = path.join(outDir, 'og.svg');
const pngPath = path.join(outDir, 'og.png');
writeFileSync(svgPath, svg);

try {
  execSync(`convert -density 144 -background none "${svgPath}" -resize ${W}x${H} "${pngPath}"`, { stdio: 'inherit' });
  console.log('Wrote', pngPath);
} catch (err) {
  console.warn('ImageMagick convert failed; OG image will be served as SVG fallback.');
}

// Brand initial mark, copper on cream, exported as a static app/icon.png.
const ICON = 256;
const iconSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${ICON}" height="${ICON}" viewBox="0 0 ${ICON} ${ICON}">
  <rect width="${ICON}" height="${ICON}" rx="48" fill="#F8F4ED"/>
  <text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle" font-family="Newsreader, Georgia, serif" font-size="148" font-weight="600" fill="#A67340" letter-spacing="-2">KD</text>
</svg>`;

const appDir = path.resolve('app');
if (!existsSync(appDir)) mkdirSync(appDir, { recursive: true });
const iconSvgPath = path.join(appDir, 'icon.svg');
const iconPngPath = path.join(appDir, 'icon.png');
writeFileSync(iconSvgPath, iconSvg);

try {
  execSync(`convert -density 200 -background none "${iconSvgPath}" -resize ${ICON}x${ICON} "${iconPngPath}"`, { stdio: 'inherit' });
  console.log('Wrote', iconPngPath);
} catch (err) {
  console.warn('Favicon convert failed.');
}
