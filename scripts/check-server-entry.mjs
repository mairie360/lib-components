import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { NextResponse } from 'next/server.js';
import { readFileSync } from 'node:fs';

const require = createRequire(import.meta.url);
const entries = [await import('../dist/next.js'), require('../dist/next.cjs')];
for (const entry of entries) {
  for (const name of ['createSessionRefreshHandler', 'createSessionLogoutHandler', 'createSessionLogoutProxy', 'proxyPublishedBffRequest']) assert.equal(typeof entry[name], 'function');
  const source = new Response(null, { headers: { 'Set-Cookie': 'accessToken=disposable-access; Path=/; HttpOnly; SameSite=Strict; Max-Age=300' } });
  source.headers.append('Set-Cookie', 'refreshToken=disposable-refresh; Path=/auth; HttpOnly; SameSite=Strict');
  const session = entry.readSessionCookies(source);
  assert.ok(session);
  const response = NextResponse.json({ message: 'Package probe' });
  entry.setSessionCookies(response, session, { secure: true, domain: '.dev.test' });
  assert.equal(response.cookies.get('refreshToken').path, '/api');
  assert.equal(response.cookies.get('refreshToken').httpOnly, true);
  // MAIR-523: the refresh cookie lives as long as the 30-day session.
  assert.equal(response.cookies.get('refreshToken').maxAge, 30 * 24 * 60 * 60);
  entry.clearSessionCookies(response, { secure: true, domain: '.dev.test' });
  assert.equal(response.cookies.get('accessToken').maxAge, 0);
}
for (const entry of entries) for (const name of ['createSessionRefreshProxy', 'createSessionResumeHandler']) assert.equal(typeof entry[name], 'function');

// MAIR-126: the shared front kit is published as separate entries, each loading only its own dependencies.
const kitEntries = {
  guard: { exports: ['createAuthGuard', 'withContentSecurityPolicy', 'isContractDataPath'], allowed: ['next/server.js'] },
  browser: { exports: ['createSessionFetch', 'sessionFetch'], allowed: [] },
  shared: { exports: ['buildContentSecurityPolicy', 'createNonce', 'publicOrigin', 'serviceBase'], allowed: [] },
  theme: { exports: ['parseAppearanceCookie', 'startAppearanceSync', 'APPEARANCE_COOKIE'], allowed: [] },
  react: { exports: ['InstanceProvider', 'useInstanceRole', 'useModalFocusScope'], allowed: ['react', 'react/jsx-runtime'] },
};
const importedModules = source => [...source.matchAll(/(?:^|\n)\s*import\s+(?:[^'"]*?\s+from\s+)?['"]([^'"]+)['"]|require\(['"]([^'"]+)['"]\)/g)].map(match => match[1] ?? match[2]);
for (const [name, expected] of Object.entries(kitEntries)) {
  for (const file of [`${name}.js`, `${name}.cjs`]) {
    const source = readFileSync(new URL(`../dist/${file}`, import.meta.url), 'utf8');
    const modules = [...new Set(importedModules(source))];
    assert.deepEqual(modules.filter(module => !expected.allowed.includes(module)), [], `dist/${file} must only import ${expected.allowed.join(', ') || 'nothing'}`);
    assert.doesNotMatch(source, /lib-components|from ['"]\.\/(?:index|primitives|shell|chunk-)/, `dist/${file} must not reach the UI entries`);
  }
  const loaded = [await import(`../dist/${name}.js`), require(`../dist/${name}.cjs`)];
  for (const entry of loaded) for (const exported of expected.exports) assert.notEqual(entry[exported], undefined, `${name} exports ${exported}`);
}
assert.equal((await import('../dist/react.js').then(() => readFileSync(new URL('../dist/react.js', import.meta.url), 'utf8'))).startsWith('"use client"'), true, 'the react entry keeps its client boundary');
console.log('ESM and CJS server entry, kit entries, their isolation and cookie behavior passed.');
