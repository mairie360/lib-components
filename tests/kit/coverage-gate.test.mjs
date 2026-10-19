import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { checkKitCoverage, KIT_ENTRIES } from '../../scripts/check-kit-coverage.mjs';

const record = (entry, hits = 75) => `SF:dist/${entry}.js\nLF:100\nLH:${hits}\nFNF:4\nFNH:3\nBRF:4\nBRH:3\nend_of_record\n`;

test('the kit coverage gate rejects a weak entry or an omitted entry despite healthy totals elsewhere', () => {
  const directory = mkdtempSync(join(tmpdir(), 'kit-coverage-'));
  const report = join(directory, 'lcov.info');
  try {
    writeFileSync(report, KIT_ENTRIES.map(entry => record(entry)).join(''));
    assert.deepEqual(checkKitCoverage(report).failures, []);
    writeFileSync(report, KIT_ENTRIES.map(entry => record(entry, entry === 'next' ? 59 : 100)).join(''));
    assert.deepEqual(checkKitCoverage(report).failures, ['dist/next.js: lines 59.00% is below 60%']);
    writeFileSync(report, KIT_ENTRIES.filter(entry => entry !== 'guard').map(entry => record(entry)).join(''));
    assert.deepEqual(checkKitCoverage(report).failures, ['dist/guard.js: no coverage measurement']);
  } finally { rmSync(directory, { recursive: true, force: true }); }
});
