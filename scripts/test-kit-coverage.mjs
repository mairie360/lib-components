import { mkdirSync, readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { KIT_ENTRIES } from './check-kit-coverage.mjs';

// MAIR-126: the shared front kit tests run against the built server entries (dist/*.js),
// with coverage measured on each built entry and checked entry by entry.
const run = (args, options = {}) => {
  const result = spawnSync(process.execPath, args, { stdio: 'inherit', ...options });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
};
run([require_tsup(), '--config', 'tsup.server.config.ts'], { env: { ...process.env } });
mkdirSync('coverage/kit', { recursive: true });
const tests = readdirSync('tests/kit').filter(file => file.endsWith('.test.mjs')).sort().map(file => 'tests/kit/' + file);
run([
  '--test', '--test-concurrency=1', '--experimental-test-coverage',
  ...KIT_ENTRIES.map(entry => `--test-coverage-include=dist/${entry}.js`),
  '--test-coverage-lines=60', '--test-coverage-functions=60', '--test-coverage-branches=60',
  '--test-reporter=spec', '--test-reporter-destination=stdout',
  '--test-reporter=lcov', '--test-reporter-destination=coverage/kit/lcov.info',
  ...tests,
]);
run(['scripts/check-kit-coverage.mjs', 'coverage/kit/lcov.info']);

function require_tsup() {
  return new URL('../node_modules/tsup/dist/cli-default.js', import.meta.url).pathname;
}
