/** @jest-environment node */
import Ajv from 'ajv';
import { NextRequest, NextResponse } from 'next/server';
import contract from './fixtures/user-session-openapi.json';
import { accessCookieMaxAge, clearSessionCookies, readSessionCookies, setSessionCookies } from '../server/session';
import { createSessionRefreshHandler, forgetUserSession, renewUserSession, type SessionServerConfig } from '../server/refresh';
import { proxyPublishedBffRequest, type SessionProxyConfig } from '../server/proxy';
import { createSessionLogoutHandler, sessionLogoutUrl } from '../server/logout';
import { createSessionLogoutProxy } from '../server/session-peer';

// Primary published User contract a416b4e, independently observed in Dev.
// These fixtures certify the protocol exercised here, not a real account or deployment.
const validator = new Ajv({ allErrors: true, strictKeywords: false });
validator.addSchema(contract, 'user');
function protocolBody(name: string, body: unknown) {
  const check = validator.getSchema('user#/components/schemas/' + name)!;
  if (!check(body)) throw new Error('Invalid test fixture: ' + JSON.stringify(check.errors));
  return body;
}
let sequence = 0;
const jwt = (seconds = 600) => 'header.' + Buffer.from(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + seconds, sid: ++sequence })).toString('base64url') + '.signature';
const refresh = () => 'disposable-refresh-' + ++sequence;
const origin = 'https://login.dev.test';
const frontOrigins = ['login', 'projects', 'calendar', 'messages', 'elearning', 'administrator', 'dashboard', 'settings'].map(name => `https://${name}.dev.test`);
const config = (): SessionServerConfig => ({ userBffUrl: () => 'http://user.test', cookieOptions: () => ({ secure: true, domain: '.dev.test' }), allowedOrigins: () => frontOrigins });
function request(token = refresh(), path = '/api/auth/refresh', extra: Record<string, string> = {}) {
  return new NextRequest(origin + path, { method: 'POST', headers: { Origin: origin, 'Sec-Fetch-Site': 'same-origin', 'Content-Type': 'application/json', Cookie: `refreshToken=${token}`, ...extra }, body: '{}' });
}
function cookieReply(access = jwt(), rotated = refresh()) {
  const response = new Response(JSON.stringify(protocolBody('RefreshResponse', { message: 'Renewed' })), { headers: { 'Content-Type': 'application/json' } });
  response.headers.append('Set-Cookie', `accessToken=${access}; Path=/; HttpOnly; SameSite=Strict; Max-Age=600`);
  response.headers.append('Set-Cookie', `refreshToken=${rotated}; Path=/auth; HttpOnly; SameSite=Strict`);
  return response;
}
afterEach(() => jest.restoreAllMocks());

describe('published session cookie protocol', () => {
  it('rewrites only the valid pair into secure shared frontend scopes without exposing tokens', async () => {
    const access = jwt(), rotated = refresh(), upstream = cookieReply(access, rotated);
    upstream.headers.append('Set-Cookie', 'unrelated=ignored; Path=/');
    const session = readSessionCookies(upstream)!;
    const response = NextResponse.json({ message: 'Renewed' });
    setSessionCookies(response, session, { secure: true, domain: '.dev.test' });
    expect(response.cookies.get('accessToken')).toMatchObject({ value: access, httpOnly: true, secure: true, sameSite: 'strict', path: '/', domain: '.dev.test' });
    expect(response.cookies.get('refreshToken')).toMatchObject({ value: rotated, httpOnly: true, secure: true, sameSite: 'strict', path: '/api', domain: '.dev.test' });
    expect(response.cookies.get('refreshToken')?.maxAge).toBeUndefined();
    expect(response.cookies.get('unrelated')).toBeUndefined();
    expect(JSON.stringify(await response.json())).not.toContain(access);
    clearSessionCookies(response, { secure: true, domain: '.dev.test' });
    expect(response.cookies.get('accessToken')?.maxAge).toBe(0);
    expect(response.cookies.get('refreshToken')?.maxAge).toBe(0);
  });
  it.each([
    ['missing refresh', 'accessToken=opaque; Path=/'],
    ['zero lifetime', 'accessToken=opaque; Max-Age=0'],
    ['invalid lifetime', 'accessToken=opaque; Max-Age=nan'],
    ['expired date', 'accessToken=opaque; Expires=Thu, 01 Jan 1970 00:00:00 GMT'],
    ['invalid date', 'accessToken=opaque; Expires=not-a-date'],
    ['decoded control', 'accessToken=unsafe%0Avalue; Path=/'],
  ])('rejects %s without a partial session', (_name, value) => {
    const response = new Response(null);
    response.headers.append('Set-Cookie', value);
    if (_name !== 'missing refresh') response.headers.append('Set-Cookie', `refreshToken=${refresh()}; Path=/auth`);
    expect(readSessionCookies(response)).toBeNull();
  });
  it('rejects duplicates, deleted refresh and expired JWT, and distinguishes no session cookies', () => {
    const duplicates = cookieReply(); duplicates.headers.append('Set-Cookie', 'accessToken=other; Path=/');
    expect(readSessionCookies(duplicates)).toBeNull();
    const deleted = cookieReply(); deleted.headers.append('Set-Cookie', 'refreshToken=; Max-Age=0; Path=/auth');
    expect(readSessionCookies(deleted)).toBeNull();
    expect(readSessionCookies(cookieReply(jwt(-10)))).toBeNull();
    expect(readSessionCookies(new Response(null))).toBeUndefined();
    expect(accessCookieMaxAge('opaque')).toBe(3600);
    expect(accessCookieMaxAge('a.invalid.b')).toBe(3600);
    expect(() => setSessionCookies(NextResponse.json({}), { accessToken: jwt(-10), refreshToken: refresh(), maxAge: 100 }, { secure: false })).toThrow('Expired');
  });
});

describe('Login owns refresh for every frontend', () => {
  it('makes one actual User renewal for simultaneous requests from eight frontend contexts, then retries each published operation once', async () => {
    const token = refresh(), renewed = jwt(), rotated = refresh(), handler = createSessionRefreshHandler(config());
    let userCalls = 0, release!: () => void, signalStarted!: () => void;
    const gate = new Promise<void>(resolve => { release = resolve; }), started = new Promise<void>(resolve => { signalStarted = resolve; });
    const replies = protocolBody('SessionResponse', { user: { id: 42, first_name: 'Fixture', last_name: 'Agent', email: 'fixture@example.test', status: 'active' }, groups: [], roles: [] });
    const business = new Map<string, number>();
    const fetchMock = jest.spyOn(global, 'fetch').mockImplementation(async (input, init) => {
      const url = new URL(String(input));
      if (url.pathname === '/api/auth/refresh') {
        const headers = new Headers(init?.headers);
        expect(headers.get('cookie')).toBe(`refreshToken=${token}`);
        expect(headers.get('authorization')).toBeNull();
        return handler(new NextRequest(url, { ...init, signal: init?.signal ?? undefined }));
      }
      if (url.pathname === '/auth/refresh') {
        ++userCalls; signalStarted();
        expect(JSON.parse(String(init?.body))).toEqual(protocolBody('RefreshView', { refresh_token: token }));
        expect(new Headers(init?.headers).get('authorization')).toBeNull();
        await gate; return cookieReply(renewed, rotated);
      }
      expect(url.pathname).toBe('/me');
      const headers = new Headers(init?.headers), front = headers.get('x-test-front')!;
      business.set(front, (business.get(front) ?? 0) + 1);
      expect(headers.get('cookie')).toBeNull();
      return headers.get('authorization') === `Bearer ${renewed}` ? Response.json(replies) : Response.json({ error: { code: 'UNAUTHENTICATED', message: 'Expired', details: [] } }, { status: 401 });
    });
    const pending = frontOrigins.map(front => {
      const options: SessionProxyConfig = { baseUrl: () => 'http://user.test', paths: { '/me': contract.paths['/me'] }, loginUrl: () => origin, frontUrl: () => front };
      return proxyPublishedBffRequest(new NextRequest(front + '/api/bff/me', { headers: { Cookie: `accessToken=old; refreshToken=${token}; unrelated=private`, 'X-Test-Front': front, Authorization: 'Bearer stale-browser-storage' } }), ['me'], options);
    });
    try { await started; expect(userCalls).toBe(1); } finally { release(); }
    const responses = await Promise.all(pending);
    for (const response of responses) {
      expect(response.status).toBe(200); expect(await response.json()).toEqual(replies);
      expect(response.headers.getSetCookie()).toHaveLength(2);
      expect(response.headers.getSetCookie().join(';')).toContain('Path=/api');
      expect(response.headers.get('cache-control')).toBe('no-store');
    }
    expect([...business.values()]).toEqual(Array(8).fill(2));
    expect(userCalls).toBe(1); expect(fetchMock).toHaveBeenCalledTimes(25);
    forgetUserSession('http://user.test', rotated);
  });
  it.each([['foreign origin', { Origin: 'https://foreign.test' }, 403], ['cross-site metadata', { 'Sec-Fetch-Site': 'cross-site' }, 403], ['simple form', { 'Content-Type': 'text/plain' }, 415]])('rejects %s before User or cookies', async (_name, headers, status) => {
    const mocked = jest.spyOn(global, 'fetch');
    const reply = await createSessionRefreshHandler(config())(request(refresh(), '/api/auth/refresh', headers as Record<string, string>));
    expect(reply.status).toBe(status); expect(reply.headers.getSetCookie()).toEqual([]); expect(mocked).not.toHaveBeenCalled();
  });
  it.each([401, 429, 503])('preserves User refusal%d without issuing credentials', async status => {
    jest.spyOn(global, 'fetch').mockResolvedValue(Response.json({ error: { message: 'Refused' } }, { status }));
    const reply = await createSessionRefreshHandler(config())(request());
    expect(reply.status).toBe(status); expect(reply.headers.getSetCookie()).toEqual([]);
  });
  it('does not let logout invalidation complete an in-flight renewal', async () => {
    const token = refresh(); let release!: () => void;
    const gate = new Promise<void>(resolve => { release = resolve; });
    jest.spyOn(global, 'fetch').mockImplementation(async () => { await gate; return cookieReply(); });
    const pending = renewUserSession(request(token), config());
    forgetUserSession('http://user.test', token); release();
    expect(await pending).toEqual({ status: 401 });
  });
  it('rejects misconfiguration, a missing token, malformed success, a reused refresh token and network failure without partial cookies', async () => {
    const noBase = { ...config(), userBffUrl: () => 'http://user:password@user.test' };
    const noDomain = { ...config(), cookieOptions: () => ({ secure: true }) };
    const mocked = jest.spyOn(global, 'fetch');
    expect((await createSessionRefreshHandler(noBase)(request())).status).toBe(503);
    expect((await createSessionRefreshHandler(noDomain)(request())).status).toBe(503);
    expect((await createSessionRefreshHandler(config())(request('', '/api/auth/refresh', { Cookie: '' }))).status).toBe(401);
    expect(mocked).not.toHaveBeenCalled();
    const reused = refresh();
    mocked.mockResolvedValueOnce(Response.json({ message: 42 }))
      .mockResolvedValueOnce(cookieReply(jwt(), reused)).mockRejectedValueOnce(new TypeError('network unavailable'));
    for (const token of [refresh(), reused, refresh()]) {
      const response = await createSessionRefreshHandler(config())(request(token));
      expect(response.status).toBe(502); expect(response.headers.getSetCookie()).toEqual([]);
    }
  });
  it('invalidates both the old and rotated handover keys on logout', async () => {
    const old = refresh(), rotated = refresh();
    const mocked = jest.spyOn(global, 'fetch').mockResolvedValueOnce(cookieReply(jwt(), rotated)).mockResolvedValueOnce(cookieReply());
    expect('session' in await renewUserSession(request(old), config())).toBe(true);
    expect('session' in await renewUserSession(request(rotated), config())).toBe(true);
    expect(mocked).toHaveBeenCalledTimes(1);
    forgetUserSession('http://user.test', rotated);
    expect('session' in await renewUserSession(request(rotated), config())).toBe(true);
    expect(mocked).toHaveBeenCalledTimes(2);
    forgetUserSession('http://user.test', rotated);
  });
});

describe('published paths and one retry', () => {
  const options = (): SessionProxyConfig => ({ baseUrl: () => 'http://user.test', paths: { '/me': contract.paths['/me'] }, loginUrl: () => origin, frontUrl: () => origin });
  it('refuses metadata, traversal, undeclared method and foreign origin before network', async () => {
    const mocked = jest.spyOn(global, 'fetch');
    for (const path of [['openapi.json'], ['swagger.json'], ['..'], ['nested/part'], ['\\unsafe']]) {
      const response = await proxyPublishedBffRequest(new NextRequest(origin + '/api/bff/test'), path, options());
      expect([400, 404]).toContain(response.status);
    }
    expect((await proxyPublishedBffRequest(new NextRequest(origin + '/api/bff/me', { method: 'POST' }), ['me'], options())).status).toBe(405);
    expect((await proxyPublishedBffRequest(new NextRequest(origin + '/api/bff/me', { headers: { Origin: 'https://foreign.test' } }), ['me'], options())).status).toBe(403);
    expect(mocked).not.toHaveBeenCalled();
  });
  it('marks expired sessions for navigation and never loops a second401', async () => {
    const token = refresh(), renewed = cookieReply(); let calls = 0;
    jest.spyOn(global, 'fetch').mockImplementation(async input => {
      ++calls; return String(input).includes('/api/auth/refresh') ? renewed : Response.json({ error: { message: 'Expired' } }, { status: 401 });
    });
    const response = await proxyPublishedBffRequest(new NextRequest(origin + '/api/bff/me', { headers: { Cookie: `accessToken=old; refreshToken=${token}` } }), ['me'], options());
    expect(response.status).toBe(401); expect(response.headers.get('x-mairie360-login-required')).toBe('true');
    expect(response.headers.getSetCookie()).toEqual([]); expect(calls).toBe(3);
  });
  it('passes403 without renewal, strips upstream credential cookies and honors HEAD', async () => {
    const mocked = jest.spyOn(global, 'fetch').mockResolvedValue(new Response('Refused', { status: 403, headers: { 'Set-Cookie': 'accessToken=other; Path=/' } }));
    const response = await proxyPublishedBffRequest(new NextRequest(origin + '/api/bff/me', { method: 'HEAD' }), ['me'], options());
    expect(response.status).toBe(403); expect(await response.text()).toBe(''); expect(response.headers.getSetCookie()).toEqual([]); expect(mocked).toHaveBeenCalledTimes(1);
  });
  it('preserves a rotated session across a business outage, preserves write bytes and uses the owner API root rather than its login page path', async () => {
    const token = refresh(), response = cookieReply(), payload = JSON.stringify(protocolBody('AdminSessionRevokeBody', { refresh_token: 'disposable-revocation-token' }));
    let businessCalls = 0;
    jest.spyOn(global, 'fetch').mockImplementation(async (input, init) => {
      const url = new URL(String(input));
      if (url.origin === origin) { expect(url.pathname).toBe('/api/auth/refresh'); return response; }
      expect(Buffer.from(init!.body as ArrayBuffer).toString()).toBe(payload);
      expect(new Headers(init?.headers).get('authorization')).not.toBe('Bearer browser-storage');
      if (++businessCalls === 1) return Response.json({ error: { message: 'Expired' } }, { status: 401 });
      throw new TypeError('Business service unavailable after renewal');
    });
    // The session-revoke POST is a published User write operation. The path below
    // exercises transparent transport only; its handler remains independently tested.
    const declared = { '/bff/admin/sessions/revoke': contract.paths['/bff/admin/sessions/revoke'] };
    const result = await proxyPublishedBffRequest(new NextRequest(origin + '/api/bff/bff/admin/sessions/revoke', { method: 'POST', headers: { Cookie: `refreshToken=${token}`, Authorization: 'Bearer browser-storage' }, body: payload }), ['bff', 'admin', 'sessions', 'revoke'], { ...options(), paths: declared, loginUrl: () => origin + '/login' });
    expect(result.status).toBe(502); expect(result.headers.getSetCookie()).toHaveLength(2); expect(businessCalls).toBe(2);
  });
  it.each([401, 503])('keeps owner failure%d explicit without forwarding cookies or looping', async status => {
    let calls = 0;
    jest.spyOn(global, 'fetch').mockImplementation(async input => { ++calls; return Response.json({ error: { message: 'Refused' } }, { status: String(input).includes('/api/auth/refresh') ? status : 401 }); });
    const result = await proxyPublishedBffRequest(new NextRequest(origin + '/api/bff/me', { headers: { Cookie: `refreshToken=${refresh()}` } }), ['me'], options());
    expect(result.status).toBe(status); expect(result.headers.getSetCookie()).toEqual([]); expect(calls).toBe(2);
    expect(result.headers.get('x-mairie360-login-required')).toBe(status === 401 ? 'true' : null);
  });
});

describe('explicit session logout', () => {
  it('sends the HttpOnly refresh and bearer, clears exact scopes and returns a validated Keycloak URL', async () => {
    const token = refresh(), access = jwt(), url = 'https://auth.dev.test/realms/mairie360/protocol/openid-connect/logout?client_id=mairie360&post_logout_redirect_uri=https%3A%2F%2Flogin.dev.test%2F';
    const mocked = jest.spyOn(global, 'fetch').mockImplementation(async (_input, init) => {
      expect(JSON.parse(String(init?.body))).toEqual(protocolBody('LogoutView', { refresh_token: token }));
      expect(new Headers(init?.headers).get('authorization')).toBe(`Bearer ${access}`);
      return Response.json(protocolBody('LogoutResponse', { message: 'Signed out', session_revoked: true, logout_url: url }));
    });
    const response = await createSessionLogoutHandler(config())(request(token, '/api/auth/logout', { Cookie: `accessToken=${access}; refreshToken=${token}` }));
    expect(response.status).toBe(200); expect((await response.json()).logout_url).toBe(url);
    expect(response.cookies.get('accessToken')?.maxAge).toBe(0); expect(response.cookies.get('refreshToken')?.maxAge).toBe(0);
    expect(mocked).toHaveBeenCalledTimes(1);
  });
  it('keeps server revocation=false explicit instead of announcing a fully revoked session', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue(Response.json(protocolBody('LogoutResponse', { message: 'Cookie cleared', session_revoked: false })));
    const response = await createSessionLogoutHandler(config())(request(refresh(), '/api/auth/logout', { Cookie: `accessToken=${jwt()}` }));
    expect(response.status).toBe(200); expect((await response.json()).session_revoked).toBe(false); expect(response.cookies.get('accessToken')?.maxAge).toBe(0);
  });
  it.each(['javascript:alert(1)', 'https://foreign.test/realms/x/protocol/openid-connect/logout?client_id=x', 'https://user@auth.dev.test/realms/x/protocol/openid-connect/logout?client_id=x', 'https://auth.dev.test/not-logout?client_id=x', 'https://auth.dev.test/realms/x/protocol/openid-connect/logout?client_id=x&id_token_hint=secret', 'https://auth.dev.test/realms/x/protocol/openid-connect/logout?client_id=x&post_logout_redirect_uri=https%3A%2F%2Fforeign.test'])('refuses unsafe end-session destination%s', value => {
    expect(sessionLogoutUrl(value, '.dev.test', frontOrigins)).toBeUndefined();
  });
  it('retains local session on an upstream refusal or malformed success', async () => {
    const mocked = jest.spyOn(global, 'fetch').mockResolvedValueOnce(Response.json({ error: { message: 'Unavailable' } }, { status: 503 })).mockResolvedValueOnce(Response.json({ message: 42 }));
    const handler = createSessionLogoutHandler(config());
    for (const status of [503, 502]) {
      const response = await handler(request(refresh(), '/api/auth/logout', { Cookie: `accessToken=${jwt()}` }));
      expect(response.status).toBe(status); expect(response.headers.getSetCookie()).toEqual([]);
    }
    expect(mocked).toHaveBeenCalledTimes(2);
  });
  it('renews an expired bearer before revocation and removes both handover keys', async () => {
    const token = refresh(), rotated = refresh(), newAccess = jwt(); let calls = 0;
    jest.spyOn(global, 'fetch').mockImplementation(async (input, init) => {
      ++calls;
      if (String(input).endsWith('/auth/refresh')) return cookieReply(newAccess, rotated);
      expect(JSON.parse(String(init?.body))).toEqual({ refresh_token: rotated });
      expect(new Headers(init?.headers).get('authorization')).toBe(`Bearer ${newAccess}`);
      return Response.json(protocolBody('LogoutResponse', { message: 'Signed out', session_revoked: true }));
    });
    const result = await createSessionLogoutHandler(config())(request(token, '/api/auth/logout', { Cookie: `accessToken=${jwt(-10)}; refreshToken=${token}` }));
    expect(result.status).toBe(200); expect(calls).toBe(2); expect(result.cookies.get('refreshToken')?.maxAge).toBe(0);
  });
  it('rejects invalid SSO receipts and malformed/network responses without a false local success', async () => {
    const mocked = jest.spyOn(global, 'fetch').mockResolvedValueOnce(Response.json(protocolBody('LogoutResponse', { message: 'Signed out', session_revoked: true, logout_url: 'https://foreign.test/realms/x/protocol/openid-connect/logout?client_id=x' }))).mockRejectedValueOnce(new TypeError('network'));
    const handler = createSessionLogoutHandler(config());
    for (let i = 0; i < 2; ++i) {
      const response = await handler(request(refresh(), '/api/auth/logout', { Cookie: `accessToken=${jwt()}` }));
      expect(response.status).toBe(502); expect(response.headers.getSetCookie()).toEqual([]);
    }
    expect(mocked).toHaveBeenCalledTimes(2);
    expect(sessionLogoutUrl('https://auth.dev.test/realms/x/protocol/openid-connect/logout?client_id=x&client_id=y', '.dev.test', frontOrigins)).toBeUndefined();
    expect(sessionLogoutUrl('https://auth.dev.test/realms/x/protocol/openid-connect/logout?client_id=x&post_logout_redirect_uri=javascript%3Aalert(1)', '.dev.test', [...frontOrigins, 'invalid'])).toBeUndefined();
  });
  it('preserves the earlier published message-only logout as local expiry with revocation explicitly unconfirmed', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue(Response.json({ message: 'Logged out successfully' }));
    const result = await createSessionLogoutHandler(config())(request(refresh(), '/api/auth/logout', { Cookie: `accessToken=${jwt()}` }));
    expect(result.status).toBe(200); expect((await result.json()).session_revoked).toBe(false); expect(result.cookies.get('accessToken')?.maxAge).toBe(0);
  });
  it('delegates an explicit frontend logout with only shared cookies and preserves owner expiry', async () => {
    const access = jwt(), token = refresh(), front = frontOrigins[1];
    const mocked = jest.spyOn(global, 'fetch').mockImplementation(async (input, init) => {
      expect(String(input)).toBe(origin + '/api/auth/logout');
      expect(new Headers(init?.headers).get('cookie')).toBe(`accessToken=${access}; refreshToken=${token}`);
      expect(new Headers(init?.headers).get('origin')).toBe(front);
      const response = NextResponse.json({ message: 'Signed out', session_revoked: true });
      clearSessionCookies(response, { secure: true, domain: '.dev.test' }); return response;
    });
    const handler = createSessionLogoutProxy({ frontUrl: () => front, loginUrl: () => origin + '/login' });
    const result = await handler(new NextRequest(front + '/api/auth/logout', { method: 'POST', headers: { Origin: front, 'Sec-Fetch-Site': 'same-origin', 'Content-Type': 'application/json', Cookie: `accessToken=${access}; refreshToken=${token}; unrelated=private`, Authorization: 'Bearer browser-storage' }, body: '{}' }));
    expect(result.status).toBe(200); expect(result.headers.getSetCookie()).toHaveLength(2); expect(result.headers.get('cache-control')).toBe('no-store'); expect(mocked).toHaveBeenCalledTimes(1);
  });
  it('does not delegate foreign logout or missing configuration, and reports network failure', async () => {
    const mocked = jest.spyOn(global, 'fetch').mockRejectedValue(new TypeError('network'));
    const handler = createSessionLogoutProxy({ frontUrl: () => origin, loginUrl: () => origin });
    expect((await handler(request(refresh(), '/api/auth/logout', { Origin: 'https://foreign.test' }))).status).toBe(403);
    const missing = createSessionLogoutProxy({ frontUrl: () => origin, loginUrl: () => '' });
    expect((await missing(request(refresh(), '/api/auth/logout'))).status).toBe(503);
    expect(mocked).not.toHaveBeenCalled();
    expect((await handler(request(refresh(), '/api/auth/logout'))).status).toBe(502); expect(mocked).toHaveBeenCalledTimes(1);
  });
});
