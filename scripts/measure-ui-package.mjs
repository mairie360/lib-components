import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { brotliCompressSync, gzipSync } from 'node:zlib';

// Explicit measurement command, never part of an ordinary test/build. Both
// revisions must be built from the same toolchain before running this script.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const { buildSync } = require('esbuild');
const flags = Object.fromEntries(process.argv.slice(2).map(argument => {
  const equal = argument.indexOf('=');
  assert.ok(equal > 0, 'Use --name=value arguments');
  return [argument.slice(0, equal), argument.slice(equal + 1)];
}));
const packageRoot = path.resolve(flags['--package-root'] ?? root);
const mode = flags['--entry-mode'] ?? 'modules';
assert.ok(['root', 'modules'].includes(mode));
assert.ok(flags['--output'] && flags['--label'], 'Provide --output=absolute.json and --label=revision');
const destination = path.resolve(flags['--output']);
const temporary = mkdtempSync(path.join(root, '.package-measure-'));
const packageName = '@mairie360/lib-components';
const scenarios = {
  button: { primitives: ['Button'] },
  feedback: { primitives: ['ToastProvider', 'useToast', 'Skeleton', 'EmptyState'] },
  settings: { settings: ['SettingsModule'] },
  composition: { settings: ['SettingsModule'], dashboard: ['DashboardModule'], shell: ['AppShell'] },
};
const report = { label: flags['--label'], packageRoot, entryMode: mode, node: process.version, esbuild: require('esbuild/package.json').version, scope: 'Production JS consumer graphs with React/Next peers external; excludes CSS and browser/Next initial route JS. Raw/gzip/Brotli sizes sum every emitted entry and transitive chunk.', scenarios: {} };
try {
  writeFileSync(path.join(temporary, 'package.json'), JSON.stringify({ name: 'municipal-graph-consumer', private: true, type: 'module' }));
  const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  const [archive] = JSON.parse(execFileSync(npm, ['pack', '--ignore-scripts', '--json', '--pack-destination', temporary], { cwd: packageRoot, encoding: 'utf8', timeout: 30000 }));
  const scope = path.join(temporary, 'node_modules', '@mairie360');
  mkdirSync(scope, { recursive: true });
  execFileSync('tar', ['-xzf', path.join(temporary, archive.filename), '-C', temporary]);
  execFileSync('mv', [path.join(temporary, 'package'), path.join(scope, 'lib-components')]);
  report.tarball = { name: archive.filename, integrity: archive.integrity, unpackedBytes: archive.unpackedSize };
  for (const [name, membership] of Object.entries(scenarios)) {
    const imports = Object.entries(membership).map(([entry, names]) => `import { ${names.join(', ')} } from '${packageName}${mode === 'root' ? '' : `/${entry}`}';`).join('\n');
    const names = Object.values(membership).flat();
    const result = buildSync({
      stdin: { contents: `${imports}\nglobalThis.__municipalPackageProbe = [${names.join(', ')}];`, resolveDir: temporary, sourcefile: `${name}.mjs` },
      absWorkingDir: temporary, bundle: true, write: false, outdir: path.join(temporary, name),
      format: 'esm', platform: 'browser', target: 'es2018', minify: true, splitting: true, metafile: true,
      external: ['react', 'react-dom', 'react/jsx-runtime', 'next', 'next/*'],
    });
    const packedInputs = Object.keys(result.metafile.inputs).filter(file => file.includes('@mairie360/lib-components/'));
    assert.ok(packedInputs.length > 0 && packedInputs.every(file => file.startsWith('node_modules/@mairie360/lib-components/')), 'Measurement must resolve the extracted tarball, never the enclosing package self-reference');
    const javascript = result.outputFiles.filter(file => file.path.endsWith('.js'));
    const artifacts = javascript.map(file => ({ path: path.relative(temporary, file.path), raw: file.contents.length, gzip: gzipSync(file.contents).length, brotli: brotliCompressSync(file.contents).length }));
    const totals = Object.fromEntries(['raw', 'gzip', 'brotli'].map(metric => [metric, artifacts.reduce((total, file) => total + file[metric], 0)]));
    report.scenarios[name] = { imports: membership, totals, artifacts, inputs: Object.keys(result.metafile.inputs), outputs: result.metafile.outputs };
    mkdirSync(path.dirname(destination), { recursive: true });
    writeFileSync(`${destination}.${name}.metafile.json`, JSON.stringify(result.metafile, null, 2) + '\n');
  }
  mkdirSync(path.dirname(destination), { recursive: true });
  writeFileSync(destination, JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify({ label: report.label, entryMode: mode, output: destination, scenarios: Object.fromEntries(Object.entries(report.scenarios).map(([name, result]) => [name, result.totals])) }, null, 2));
} finally { rmSync(temporary, { recursive: true, force: true }); }
