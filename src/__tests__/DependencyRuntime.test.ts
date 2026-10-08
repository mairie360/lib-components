import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import sharp from 'sharp';

const readJson = (name: string) => JSON.parse(readFileSync(resolve(process.cwd(), name), 'utf8'));

it('locks the patched Next image tooling without weakening the global PostCSS rule', () => {
  const manifest = readJson('package.json');
  const lock = readJson('package-lock.json');
  expect(manifest.overrides.next.sharp).toBe('^0.35.5');
  expect(manifest.overrides.postcss).toBe('$postcss');
  expect(lock.packages['node_modules/sharp'].version).toBe(sharp.versions.sharp);
  const [major, minor, patch] = sharp.versions.sharp.split('.').map(Number);
  expect(major > 0 || minor > 35 || (minor === 35 && patch >= 5)).toBe(true);
});

it('includes the patched prebuilt librsvg dependency', () => {
  const rsvg = sharp.versions.rsvg;
  if (typeof rsvg !== 'string') throw new Error('The prebuilt image runtime must include librsvg');
  const [major, minor, patch] = rsvg.split('.').map(Number);
  expect(major > 2 || (major === 2 && (minor > 63 || (minor === 63 && patch >= 2)))).toBe(true);
});

it('still converts a bounded ordinary SVG to PNG', async () => {
  // Harmless image fixture, not a reproduction of a vulnerability.
  const svg = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12"><circle cx="6" cy="6" r="4" fill="#336699"/></svg>');
  const metadata = await sharp(await sharp(svg).png().toBuffer()).metadata();
  expect(metadata).toMatchObject({ format: 'png', width: 12, height: 12, hasAlpha: true });
});
