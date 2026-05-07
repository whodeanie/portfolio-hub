# Kerry Dean Jr. Hub

Single page hub portfolio site. Drop URL on every job application.

## Stack

Next.js 14, TypeScript, Tailwind, static export, Vercel hosting.

## Develop

```
npm install
npm run dev
```

## Build

```
npm run build
```

The build runs `scripts/build-og.mjs` first to regenerate `/public/og.png` from the SVG source. The static export lands in `/out`.

## Deploy

```
npx vercel@latest --prod --yes
```

## Update resume

Drop a new PDF into `public/resume.pdf` and redeploy.
