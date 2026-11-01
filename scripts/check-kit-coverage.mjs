import { readFileSync } from 'node:fs';
import { resolve, relative } from 'node:path';

// MAIR-126: each non-UI kit entry (one bundle per entry, see tsup.server.config.ts) must reach
// 60% lines, functions and branches on its own. The React providers (dist/react.js) are measured
// by the consuming frontends.
export const KIT_ENTRIES = ['next', 'guard', 'browser', 'shared', 'theme'];
const required = new Set(KIT_ENTRIES.map(entry => `dist/${entry}.js`));
export function checkKitCoverage(report) {
  const records = readFileSync(report, 'utf8').split('end_of_record');
  const measured = new Set();
  const failures = [];
  for (const record of records) {
    const values = Object.fromEntries(record.split('\n').filter(line => /^(SF|LF|LH|FNF|FNH|BRF|BRH):/.test(line)).map(line => { const at = line.indexOf(':'); return [line.slice(0, at), line.slice(at + 1)]; }));
    if (!values.SF) continue;
    const file = relative(process.cwd(), resolve(values.SF)).replaceAll('\\', '/');
    if (!required.has(file)) continue;
    measured.add(file);
    for (const [metric, totalKey, hitKey] of [['lines', 'LF', 'LH'], ['functions', 'FNF', 'FNH'], ['branches', 'BRF', 'BRH']]) {
      const total = Number(values[totalKey]), hits = Number(values[hitKey]);
      if (!Number.isFinite(total) || !Number.isFinite(hits) || total < 0 || hits < 0 || hits > total) { failures.push(`${file}: missing or invalid ${metric} measurement`); continue; }
      const percent = total === 0 ? 100 : hits / total * 100;
      if (percent < 60) failures.push(`${file}: ${metric} ${percent.toFixed(2)}% is below 60%`);
    }
  }
  for (const file of required) if (!measured.has(file)) failures.push(`${file}: no coverage measurement`);
  return { failures, measured: measured.size };
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(new URL(import.meta.url).pathname)) {
  const { failures, measured } = checkKitCoverage(process.argv[2] ?? 'coverage/kit/lcov.info');
  if (failures.length) {
    process.stderr.write(failures.join('\n') + '\n');
    process.exitCode = 1;
  } else process.stdout.write(`Kit coverage: ${measured} entries meet 60% lines, functions and branches.\n`);
}
