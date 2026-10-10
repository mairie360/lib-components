import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { NextResponse } from 'next/server.js';

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
  assert.equal(response.cookies.get('refreshToken').maxAge, undefined);
  entry.clearSessionCookies(response, { secure: true, domain: '.dev.test' });
  assert.equal(response.cookies.get('accessToken').maxAge, 0);
}
console.log('ESM and CJS server entry import and cookie behavior passed.');
