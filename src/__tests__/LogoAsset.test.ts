import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// MAIR-831: the bundled asset is the « mairie / 360 » logo of Figma Base/Logo (ratio 1402 × 1075, transparent
// background), sharp up to the xl height (64 px) on 4× screens, and small enough to stay inlined.
it('ships the mairie / 360 logo, uncropped, transparent and light', () => {
  const png = readFileSync(join(__dirname, '../assets/logo.png'));
  expect(png.subarray(1, 4).toString('latin1')).toBe('PNG');
  const width = png.readUInt32BE(16); const height = png.readUInt32BE(20); const colourType = png[25];
  expect(height).toBeGreaterThanOrEqual(256);
  expect(width / height).toBeCloseTo(1402 / 1075, 2);
  expect(colourType).toBe(6); // RGBA
  expect(png.length).toBeLessThan(80_000);
});
