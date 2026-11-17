/** @jest-environment node */
import { NextRequest } from 'next/server';
import { createSessionRefreshProxy, createSessionResumeHandler } from '../server/resume';

// MAIR-539: src/server/resume.ts (silent session renewal at the Login owner, then a redirect back to a local
// document) had no direct test. The redirect target comes from a query string, so the refusals are the point.
let sequence = 0;
const jwt = (seconds = 600) => 'header.' + Buffer.from(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + seconds, sid: ++sequence })).toString('base64url') + '.signature';
const refresh = () => 'disposable-refresh-' + ++sequence;
const front = 'https://projects.dev.test';
const login = 'https://login.dev.test';
const config = { frontUrl: () => front, loginUrl: () => login };

function resume(next: string | null, token: string | null = refresh()) {
  const url = new URL(front + '/session/resume');
  if (next !== null) url.searchParams.set('next', next);
  return new NextRequest(url, { headers: token ? { Cookie: `refreshToken=${token}` } : {} });
}
function renewed(access = jwt(), rotated = refresh()) {
  const response = new Response(JSON.stringify({ message: 'Renewed' }), { headers: { 'Content-Type': 'application/json' } });
  response.headers.append('Set-Cookie', `accessToken=${access}; Path=/; HttpOnly; SameSite=Strict; Max-Age=600`);
  response.headers.append('Set-Cookie', `refreshToken=${rotated}; Path=/auth; HttpOnly; SameSite=Strict`);
  return response;
}
const env = process.env as Record<string, string | undefined>;
const savedEnv = { NODE_ENV: env.NODE_ENV, COOKIE_DOMAIN: env.COOKIE_DOMAIN };
afterEach(() => {
  jest.restoreAllMocks();
  for (const [key, value] of Object.entries(savedEnv)) { if (value === undefined) delete env[key]; else env[key] = value; }
});

describe('createSessionResumeHandler', () => {
  it.each([
    ['a protocol-relative URL', '//evil.test/x'],
    ['an absolute URL', 'https://evil.test/x'],
    ['a relative path without a leading slash', 'projects'],
    ['a backslash', '/\\evil.test'],
    ['a control character', '/a\u0001b'],
    ['a space', '/a b'],
    ['an API path', '/api/auth/refresh'],
    ['an API path with a query', '/api?x=1'],
    ['a Next internal path', '/_next/static/x.js'],
    ['an encoded dot segment reaching an API path', '/projects/../api/x'],
  ])('refuses %s with 400 before any network call', async (_name, next) => {
    const fetchSpy = jest.spyOn(global, 'fetch');

    const response = await createSessionResumeHandler(config)(resume(next));

    expect(response.status).toBe(400);
    expect(response.headers.get('Cache-Control')).toBe('no-store');
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('answers 503 when the front origin is not configured', async () => {
    const response = await createSessionResumeHandler({ frontUrl: () => '', loginUrl: () => login })(resume('/projects'));

    expect(response.status).toBe(503);
  });

  it('renews at the Login owner, then redirects to the local document with the new cookies and no token in the URL', async () => {
    const access = jwt(), rotated = refresh(), old = refresh();
    const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValue(renewed(access, rotated));

    const response = await createSessionResumeHandler(config)(resume('/projects?tab=1#t', old));

    expect(response.status).toBe(303);
    expect(response.headers.get('Location')).toBe(front + '/projects?tab=1#t');
    expect(response.headers.get('Location')).not.toContain(access);
    expect(response.headers.get('Cache-Control')).toBe('no-store');
    const cookies = response.headers.getSetCookie().join('\n');
    expect(cookies).toContain('accessToken=' + access);
    expect(cookies).toContain('refreshToken=' + rotated);
    const [url, init] = fetchSpy.mock.calls[0];
    expect(String(url)).toBe(login + '/api/auth/refresh');
    expect(init?.method).toBe('POST');
    expect((init?.headers as Record<string, string>).Origin).toBe(front);
    expect((init?.headers as Record<string, string>).Cookie).toBe('refreshToken=' + encodeURIComponent(old));
    expect(init?.redirect).toBe('manual');
  });

  it('resumes at the root when no next is given', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue(renewed());

    const response = await createSessionResumeHandler(config)(resume(null));

    expect(response.headers.get('Location')).toBe(front + '/');
  });

  it('sends the visitor to the Login page with the destination when the session cannot be renewed (no refresh cookie)', async () => {
    const fetchSpy = jest.spyOn(global, 'fetch');

    const response = await createSessionResumeHandler(config)(resume('/projects', null));

    expect(response.status).toBe(303);
    const target = new URL(response.headers.get('Location')!);
    expect(target.origin).toBe(login);
    expect(target.pathname).toBe('/');
    expect(target.searchParams.get('redirect')).toBe(front + '/projects');
    expect(response.headers.get('Cache-Control')).toBe('no-store');
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('does the same when Login refuses the refresh token with 401', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue(new Response('{}', { status: 401 }));

    const response = await createSessionResumeHandler(config)(resume('/projects'));

    expect(response.status).toBe(303);
    expect(new URL(response.headers.get('Location')!).origin).toBe(login);
  });

  it('answers 503 without redirecting when the Login origin is missing on an expired session', async () => {
    const response = await createSessionResumeHandler({ frontUrl: () => front, loginUrl: () => '' })(resume('/projects', null));

    expect(response.status).toBe(503);
    expect(response.headers.get('Location')).toBeNull();
  });

  it.each([
    ['a Login server error', () => Promise.resolve(new Response('boom', { status: 500 }))],
    ['a network failure', () => Promise.reject(new Error('down'))],
  ])('answers 503, not a redirect, on %s', async (_name, reply) => {
    jest.spyOn(global, 'fetch').mockImplementation(reply);

    const response = await createSessionResumeHandler(config)(resume('/projects'));

    expect(response.status).toBe(503);
    expect(response.headers.get('Location')).toBeNull();
  });

  it('answers 502 when Login renews without a usable cookie pair or message', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue(new Response(JSON.stringify({ message: 'Renewed' }), { status: 200 }));

    const response = await createSessionResumeHandler(config)(resume('/projects'));

    expect(response.status).toBe(502);
  });

  it('refuses in production without a shared cookie domain, and over plain HTTP', async () => {
    env.NODE_ENV = 'production';
    delete env.COOKIE_DOMAIN;
    const fetchSpy = jest.spyOn(global, 'fetch');

    const noDomain = await createSessionResumeHandler(config)(resume('/projects'));
    env.COOKIE_DOMAIN = '.dev.test';
    const plain = await createSessionResumeHandler({ frontUrl: () => front, loginUrl: () => 'http://login.dev.test' })(resume('/projects'));

    expect(noDomain.status).toBe(503);
    expect(plain.status).toBe(503);
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});

describe('createSessionRefreshProxy', () => {
  const post = (headers: Record<string, string> = {}) => new NextRequest(front + '/api/auth/refresh', {
    method: 'POST',
    headers: { Origin: front, 'Sec-Fetch-Site': 'same-origin', 'Content-Type': 'application/json', Cookie: `refreshToken=${refresh()}`, ...headers },
    body: '{}',
  });

  it('renews at the Login owner and answers a message without any token in the body', async () => {
    const access = jwt();
    jest.spyOn(global, 'fetch').mockResolvedValue(renewed(access));

    const response = await createSessionRefreshProxy(config)(post());

    expect(response.status).toBe(200);
    const body = await response.text();
    expect(JSON.parse(body)).toEqual({ message: 'Session renouvelée.' });
    expect(body).not.toContain(access);
    expect(response.headers.getSetCookie().join('\n')).toContain('accessToken=' + access);
  });

  it('rejects a cross-site mutation before calling Login', async () => {
    const fetchSpy = jest.spyOn(global, 'fetch');

    const response = await createSessionRefreshProxy(config)(post({ Origin: 'https://evil.test', 'Sec-Fetch-Site': 'cross-site' }));

    expect(response.status).toBeGreaterThanOrEqual(400);
    expect(response.status).toBeLessThan(500);
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
