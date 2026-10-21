import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { cpSync, existsSync, mkdtempSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Run only after the explicitly authorized package build. This probes packed
// artifacts with real Node/TypeScript consumers; no source mocks or registry IO.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const packageName = '@mairie360/lib-components';
const moduleExports = {
  primitives: ['Button', 'Skeleton', 'EmptyState', 'Toast', 'ToastProvider', 'useToast', 'Select', 'SelectTrigger', 'SelectContent', 'SelectItem', 'SessionList', 'sessionState', 'Icon', 'IconButton', 'LinkButton', 'CreateButton', 'DeleteButton'],
  shell: ['AppShell', 'AccessibleShell', 'CurrentDate', 'Header', 'Logo', 'Sidebar'],
};
let fixture;
let unpacked;
let packedFiles;
const historicalApi = JSON.parse(readFileSync(path.join(root, 'scripts/fixtures/ui-root-exports.json'), 'utf8'));

function filesBelow(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const file = path.join(directory, entry.name);
    return entry.isDirectory() ? filesBelow(file) : [file];
  });
}

function runConsumer(source, format = 'module') {
  return execFileSync(process.execPath, [`--input-type=${format}`, '-e', source], {
    cwd: fixture,
    encoding: 'utf8',
    timeout: 30000,
    maxBuffer: 4 * 1024 * 1024,
  });
}
function loadStatement(specifier, format, binding = 'entry') {
  return format === 'module'
    ? `const ${binding} = await import(${JSON.stringify(specifier)});`
    : `const ${binding} = require(${JSON.stringify(specifier)});`;
}

before(() => {
  fixture = mkdtempSync(path.join(root, '.package-probe-'));
  // Stop Node/TS/esbuild self-reference to the enclosing library package.
  writeFileSync(path.join(fixture, 'package.json'), JSON.stringify({ name: 'municipal-package-probe', private: true, type: 'module' }));
  const destination = path.join(fixture, 'node_modules', '@mairie360');
  mkdirSync(destination, { recursive: true });
  const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  const packed = JSON.parse(execFileSync(npm, ['pack', '--ignore-scripts', '--json', '--pack-destination', fixture], {
    cwd: root, encoding: 'utf8', timeout: 30000,
  }));
  packedFiles = packed[0].files.map(file => file.path);
  const extraction = path.join(fixture, 'extracted');
  mkdirSync(extraction);
  execFileSync('tar', ['-xzf', path.join(fixture, packed[0].filename), '-C', extraction]);
  // A tarball installed as a real named package. Existing locked dependencies
  // resolve from the enclosing workspace, without installing/upgrading anything.
  execFileSync('mv', [path.join(extraction, 'package'), path.join(destination, 'lib-components')]);
  unpacked = path.join(destination, 'lib-components');
});
after(() => { if (fixture) rmSync(fixture, { recursive: true, force: true }); });

for (const format of ['module', 'commonjs']) {
  test(`${format}: consumer resolves the extracted tarball rather than package self-reference`, () => {
    const resolution = runConsumer(format === 'module'
      ? `console.log(new URL(import.meta.resolve('${packageName}/primitives')).pathname);`
      : `console.log(require.resolve('${packageName}/primitives'));`, format).trim();
    assert.equal(resolution, path.join(unpacked, 'dist', `primitives.${format === 'module' ? 'js' : 'cjs'}`));
  });
  for (const [subpath, expected] of Object.entries(moduleExports)) {
    test(`${format}: real packed ${subpath} exports are loadable without browser globals`, () => {
      const output = runConsumer(`
        const unexpected = () => { throw new Error('Import triggered a timer or network call'); };
        globalThis.fetch = unexpected; globalThis.setTimeout = unexpected; globalThis.setInterval = unexpected;
        ${loadStatement(`${packageName}/${subpath}`, format)}
        const types = Object.fromEntries(Object.entries(entry).map(([key, value]) => [key, typeof value]));
        console.log(JSON.stringify(types));
      `, format);
      const actual = JSON.parse(output);
      expected.forEach(name => {
        // forwardRef components (Toast, Button family, fields) are exotic objects; the rendering probes check them.
        assert.ok(['function', 'object'].includes(actual[name]) && actual[name] !== 'undefined', `${subpath}.${name}`);
      });
    });
  }
  test(`${format}: historical root runtime API remains available`, () => {
    const actual = JSON.parse(runConsumer(`${loadStatement(packageName, format)} console.log(JSON.stringify(Object.keys(entry)));`, format));
    historicalApi.runtimeExports.forEach(name => assert.ok(actual.includes(name), `Historical root export ${name} from ${historicalApi.sourceCommit}`));
    assert.ok(!actual.includes('ToastAnnouncementContext'), 'Private implementation context must remain private');
  });
  test(`${format}: root and module imports share component and context identity`, () => {
    runConsumer(`
      ${format === 'module' ? "import assert from 'node:assert/strict'; import React from 'react'; import { renderToString } from 'react-dom/server';" : "const assert = require('node:assert/strict'); const React = require('react'); const { renderToString } = require('react-dom/server');"}
      ${loadStatement(packageName, format, 'root')}
      ${loadStatement(`${packageName}/primitives`, format, 'primitives')}
      ${loadStatement(`${packageName}/shell`, format, 'shell')}
      ['Button', 'Toast', 'ToastProvider', 'useToast', 'Select'].forEach(name => assert.equal(root[name], primitives[name], name));
      assert.equal(root.SessionList, primitives.SessionList);
      // MAIR-607: the shared session list renders a row with its state from the packed primitives entry.
      const sessionsHtml = renderToString(React.createElement(primitives.SessionList, { sessions: [{ id: 's-1', device_info: 'Chrome · Windows', ip_address: '192.168.1.24', created_at: '2026-10-20T09:12:00Z', expires_at: '2999-01-01T00:00:00Z' }] }));
      assert.match(sessionsHtml, /Chrome · Windows/); assert.match(sessionsHtml, /Active/);
      assert.equal(root.defaultSidebarItems, shell.defaultSidebarItems);
      function Consumer({ hook }) { const api = hook(); assert.equal(typeof api.notify, 'function'); return React.createElement('span', null, 'Consumer ready'); }
      assert.match(renderToString(React.createElement(root.ToastProvider, { regionLabel: 'Notifications' }, React.createElement(Consumer, { hook: primitives.useToast }))), /Consumer ready/);
      assert.match(renderToString(React.createElement(primitives.ToastProvider, { regionLabel: 'Notifications' }, React.createElement(Consumer, { hook: root.useToast }))), /Consumer ready/);
      assert.match(renderToString(React.createElement(primitives.Button, { label: 'Créer' })), /Créer/);
      assert.match(renderToString(React.createElement(primitives.Toast, { message: 'Reçu du serveur' })), /Reçu du serveur/);
      // MAIR-578: the packed shell renders with its built-in desktop navigation (0.10.2 shipped classic JSX without React).
      ${loadStatement(`${packageName}/react`, format, 'kit')}
      const shellHtml = renderToString(React.createElement(kit.InstanceProvider, { role: 'Admin', timeZone: 'Europe/Paris' }, React.createElement(shell.AccessibleShell, { hrefs: { admin: '/admin', settings: '/settings' } }, React.createElement('h1', null, 'Contenu'))));
      assert.match(shellHtml, /app-desktop-navigation/); assert.match(shellHtml, /data-admin="true"/); assert.match(shellHtml, /app-accessible-footer/);
      assert.match(renderToString(React.createElement(shell.CurrentDate, { date: new Date('2026-10-20T10:00:00Z') })), /class="page-current-date"><[/]span>/);
    `, format);
  });
  test(`${format}: server-only next entry retains public session operations`, () => {
    const output = runConsumer(`
      ${loadStatement(`${packageName}/next`, format)}
      console.log(JSON.stringify(['createSessionRefreshHandler', 'createSessionLogoutHandler', 'createSessionLogoutProxy', 'proxyPublishedBffRequest'].map(name => typeof entry[name])));
    `, format);
    assert.deepEqual(JSON.parse(output), ['function', 'function', 'function', 'function']);
  });
}

test('packed stylesheet retains its explicit legacy import and additive alias', () => {
  const output = runConsumer(`
    import { createRequire } from 'node:module';
    const require = createRequire(process.cwd() + '/consumer.cjs');
    console.log(JSON.stringify([require.resolve('${packageName}/dist/styles.css'), require.resolve('${packageName}/styles.css')]));
  `);
  const paths = JSON.parse(output);
  paths.forEach(file => assert.deepEqual(readFileSync(file), readFileSync(path.join(root, 'dist/styles.css'))));
});

test('real ESM and CJS TypeScript consumers resolve props and matching declarations', () => {
  const imports = `
    import { Skeleton, ToastProvider, useToast } from '${packageName}/primitives';
    import type { ToastOptions } from '${packageName}/primitives';
    import type { SessionListProps, SessionRecord } from '${packageName}/primitives';
    import type { AppShellProps } from '${packageName}/shell';
    import type { SessionServerConfig } from '${packageName}/next';
    export type { NotificationItem, NotificationSource, AppShellProps, SessionListProps, SessionRecord, SessionState, SkeletonProps, EmptyStateProps, ToastProps, ToastVariant, ToastOptions, ToastContextValue, ToastProviderProps } from '${packageName}';
    const message: ToastOptions = { message: 'Reçu', duration: null };
    const session: SessionRecord = { id: 's-1', device_info: 'Chrome', ip_address: '10.0.0.1', created_at: '2026-10-20T09:12:00Z', expires_at: null };
    const moduleProps: Partial<SessionListProps & AppShellProps> = { sessions: [session] };
    const serverProps: Partial<SessionServerConfig> = {};
    void [Skeleton, ToastProvider, useToast, message, moduleProps, serverProps];
  `;
  writeFileSync(path.join(fixture, 'consumer.mts'), imports);
  writeFileSync(path.join(fixture, 'consumer.cts'), imports);
  writeFileSync(path.join(fixture, 'tsconfig.json'), JSON.stringify({
    compilerOptions: { target: 'ES2022', module: 'NodeNext', moduleResolution: 'NodeNext', strict: true, skipLibCheck: true, noEmit: true, types: [], lib: ['ES2022', 'DOM'] },
    files: ['consumer.mts', 'consumer.cts'],
  }));
  const output = execFileSync(process.execPath, [require.resolve('typescript/bin/tsc'), '-p', path.join(fixture, 'tsconfig.json'), '--traceResolution'], { encoding: 'utf8', timeout: 30000, maxBuffer: 8 * 1024 * 1024 });
  assert.match(output, /primitives\.d\.ts/); assert.match(output, /primitives\.d\.cts/);
});

test('real TypeScript bundler consumer resolves the public UI and server types', () => {
  const source = `import { ToastProvider, useToast } from '${packageName}/primitives'; import type { ToastOptions } from '${packageName}/primitives'; import type { SessionServerConfig } from '${packageName}/next'; const message: ToastOptions = { message: 'Reçu' }; const config: Partial<SessionServerConfig> = {}; void [ToastProvider, useToast, message, config];`;
  writeFileSync(path.join(fixture, 'bundler.ts'), source);
  writeFileSync(path.join(fixture, 'tsconfig.bundler.json'), JSON.stringify({ compilerOptions: { target: 'ES2022', module: 'ESNext', moduleResolution: 'Bundler', strict: true, skipLibCheck: true, noEmit: true, types: [], lib: ['ES2022', 'DOM'] }, files: ['bundler.ts'] }));
  execFileSync(process.execPath, [require.resolve('typescript/bin/tsc'), '-p', path.join(fixture, 'tsconfig.bundler.json')], { encoding: 'utf8', timeout: 30000 });
});

test('browser consumer keeps explicit CSS and excludes server runtime', () => {
  const { buildSync } = require('esbuild');
  const result = buildSync({
    stdin: { contents: `import { Skeleton } from '${packageName}/primitives'; import '${packageName}/styles.css'; export { Skeleton };`, resolveDir: fixture, sourcefile: 'consumer.mjs' },
    absWorkingDir: fixture, bundle: true, write: false, outdir: path.join(fixture, 'browser-output'),
    format: 'esm', platform: 'browser', target: 'es2018', minify: true, metafile: true,
    external: ['react', 'react-dom', 'react/jsx-runtime'],
  });
  const css = result.outputFiles.find(file => file.path.endsWith('.css'));
  assert.ok(css, 'Explicit CSS import must survive JS tree shaking');
  assert.match(css.text, /--mairie-surface/);
  const javascript = result.outputFiles.filter(file => file.path.endsWith('.js')).map(file => file.text).join('\n');
  assert.doesNotMatch(javascript, /next\/server|AbortSignal\.timeout|\/auth\/refresh/);
  assert.ok(Object.keys(result.metafile.inputs).every(file => !file.includes('/server/')), 'UI must not import server sources');
});

test('packed module mappings point to included ESM/CJS and declaration files', () => {
  const metadata = JSON.parse(readFileSync(path.join(unpacked, 'package.json'), 'utf8'));
  assert.ok(Array.isArray(metadata.sideEffects) && metadata.sideEffects.some(pattern => pattern.endsWith('.css')), 'CSS remains an explicit effect while JS can be tree-shaken');
  const files = Object.keys(moduleExports);
  files.forEach(name => {
    ['js', 'cjs', 'd.ts', 'd.cts'].forEach(extension => assert.ok(readFileSync(path.join(unpacked, 'dist', `${name}.${extension}`)).length > 0, `${name}.${extension}`));
  });
});


test('generator is deterministic, preserves the complete root, and reproduces committed module barrels', () => {
  const sandbox = path.join(fixture, 'generation');
  mkdirSync(path.join(sandbox, 'scripts'), { recursive: true });
  mkdirSync(path.join(sandbox, 'src'), { recursive: true });
  cpSync(path.join(root, 'src/components'), path.join(sandbox, 'src/components'), { recursive: true });
  for (const file of ['generate-exports.js', 'ui-entrypoints.mjs']) cpSync(path.join(root, 'scripts', file), path.join(sandbox, 'scripts', file));
  writeFileSync(path.join(sandbox, 'package.json'), JSON.stringify({ type: 'module' }));
  const generate = () => execFileSync(process.execPath, [path.join(sandbox, 'scripts/generate-exports.js')], { cwd: sandbox, encoding: 'utf8', timeout: 30000 });
  generate();
  const first = Object.fromEntries(['index.tsx', ...Object.keys(moduleExports).map(name => `entries/${name}.ts`)].map(file => [file, readFileSync(path.join(sandbox, 'src', file), 'utf8')]));
  generate();
  for (const [file, content] of Object.entries(first)) {
    assert.equal(readFileSync(path.join(sandbox, 'src', file), 'utf8'), content, `${file}: generator must be idempotent`);
    assert.equal(readFileSync(path.join(root, 'src', file), 'utf8'), content, `${file}: checked-in entry must match the generator`);
  }
});

test('tarball includes every referenced chunk, declaration and source map without raw development files', () => {
  for (const file of packedFiles) {
    assert.ok(!/(^|\/)(src|scripts|__tests__|tests|coverage|stories)(\/|$)|\.(test|spec|stories)\./.test(file), `Unexpected development file: ${file}`);
  }
  const dist = path.join(unpacked, 'dist');
  const emitted = filesBelow(dist);
  for (const file of emitted.filter(file => /\.(js|cjs)$/.test(file))) {
    const content = readFileSync(file, 'utf8');
    const map = content.match(/sourceMappingURL=([^\s]+)/)?.[1];
    assert.ok(map, `${path.basename(file)} must retain its source map`);
    const mapping = JSON.parse(readFileSync(path.resolve(path.dirname(file), map), 'utf8'));
    assert.ok(Array.isArray(mapping.sources), `${map}: source inventory`);
    const references = [...content.matchAll(/(?:from\s*|import\s*\(|require\s*\()?["'](\.\.?\/[^"']+\.(?:js|cjs))["']/g)].map(match => match[1]);
    for (const reference of references) assert.ok(existsSync(path.resolve(path.dirname(file), reference)), `${file} references missing ${reference}`);
  }
  for (const file of emitted.filter(file => /\.d\.(ts|cts)$/.test(file))) {
    const content = readFileSync(file, 'utf8');
    for (const [, reference] of content.matchAll(/(?:from\s*|import\s*\()["'](\.\.?\/[^"']+)["']/g)) {
      const absolute = path.resolve(path.dirname(file), reference);
      const base = absolute.replace(/\.(js|cjs|mjs)$/, '');
      assert.ok([absolute, `${base}.d.ts`, `${base}.d.cts`, `${base}.ts`].some(candidate => existsSync(candidate)), `${file} references missing declaration ${reference}`);
    }
  }
});

test('Next App Router builds the packed client boundaries with a callable server-only entry', { skip: process.env.MAIRIE_PACKAGE_NEXT_FIXTURE !== '1' && 'Run explicitly in the dedicated Next build window' }, () => {
  const nextRoot = path.join(fixture, 'next-consumer');
  const app = path.join(nextRoot, 'app');
  mkdirSync(app, { recursive: true });
  writeFileSync(path.join(nextRoot, 'package.json'), JSON.stringify({ name: 'municipal-package-consumer', private: true, type: 'module' }));
  writeFileSync(path.join(nextRoot, 'next.config.mjs'), 'export default { experimental: { cpus: 1 }, poweredByHeader: false };');
  writeFileSync(path.join(app, 'layout.jsx'), `import '${packageName}/styles.css'; export default function Layout({ children }) { return <html lang="fr"><body>{children}</body></html>; }`);
  writeFileSync(path.join(app, 'client.jsx'), `'use client'; import { ToastProvider } from '${packageName}'; import { Skeleton, useToast } from '${packageName}/primitives'; function Consumer() { const api = useToast(); if (typeof api.notify !== 'function') throw new Error('Context mismatch'); return <><p>Client context ready</p><Skeleton label="Chargement de la fiche" /></>; } export default function Client() { return <ToastProvider regionLabel="Notifications"><Consumer /></ToastProvider>; }`);
  writeFileSync(path.join(app, 'page.jsx'), `import { validSessionToken } from '${packageName}/next'; import Client from './client'; export default function Page() { if (!validSessionToken('fixture-token')) throw new Error('Server entry unavailable'); return <main><h1>Server entry ready</h1><Client /></main>; }`);
  execFileSync(process.execPath, [require.resolve('next/dist/bin/next'), 'build', '--webpack'], { cwd: nextRoot, encoding: 'utf8', timeout: 180000, maxBuffer: 8 * 1024 * 1024, env: { ...process.env, NEXT_TELEMETRY_DISABLED: '1' } });
  const html = readFileSync(path.join(nextRoot, '.next/server/app/index.html'), 'utf8');
  assert.match(html, /Server entry ready/);
  assert.match(html, /Client context ready/);
  assert.match(html, /Chargement de la fiche/);
  const browserFiles = filesBelow(path.join(nextRoot, '.next/static')).filter(file => file.endsWith('.js'));
  const browserSource = browserFiles.map(file => readFileSync(file, 'utf8')).join('\n');
  assert.doesNotMatch(browserSource, /createSessionRefreshHandler|proxyPublishedBffRequest|Session peer configuration/);
});


test('tree-shaken primitive consumer excludes unrelated module implementations', () => {
  const { buildSync } = require('esbuild');
  const result = buildSync({
    stdin: { contents: `import { Skeleton } from '${packageName}/primitives'; globalThis.__skeletonProbe = Skeleton;`, resolveDir: fixture, sourcefile: 'isolated-primitive.mjs' },
    absWorkingDir: fixture, bundle: true, write: false, format: 'esm', platform: 'browser', target: 'es2018', minify: false, metafile: true,
    external: ['react', 'react-dom', 'react/jsx-runtime'],
  });
  const code = result.outputFiles.map(file => file.text).join('\n');
  assert.match(code, /Skeleton/);
  for (const unrelated of ['DashboardModule', 'SettingsModule', 'ProjectModule', 'MessagingComposer', 'CalendarModule', 'AdministrationModule', 'ElearningCatalog']) {
    assert.ok(!code.includes(unrelated), `Primitive graph retains unrelated implementation ${unrelated}`);
  }
  const inputsWithOutput = Object.values(result.metafile.outputs).flatMap(output => Object.entries(output.inputs).filter(([, input]) => input.bytesInOutput > 0).map(([name]) => name));
  assert.ok(inputsWithOutput.every(name => !/next\.(js|cjs)$|\/server\//.test(name)), 'No server code contributes bytes to the primitive graph');
});
