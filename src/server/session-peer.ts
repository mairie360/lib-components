import { NextRequest } from 'next/server.js';
import { publicOrigin, serviceBase } from './config';
import { rejectSessionMutation } from './refresh';
import { validSessionToken } from './session';

export type SessionPeerConfig = { loginUrl: () => string; frontUrl: () => string };

/** A frontend's explicit POST delegates revocation to the same Login owner. */
export function createSessionLogoutProxy(config: SessionPeerConfig) {
  return async function POST(request: NextRequest): Promise<Response> {
    const front = publicOrigin(config.frontUrl()), login = serviceBase(config.loginUrl());
    const rejected = rejectSessionMutation(request, front ? [front] : []);
    if (rejected) return rejected;
    if (!login || (process.env.NODE_ENV === 'production' && new URL(login).protocol !== 'https:')) {
      return Response.json({ message: 'La déconnexion partagée n’est pas configurée.' }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
    }
    const cookies = ['accessToken', 'refreshToken'].flatMap(name => {
      const value = request.cookies.get(name)?.value;
      return validSessionToken(value) ? [`${name}=${encodeURIComponent(value)}`] : [];
    });
    try {
      const response = await fetch(new URL('/api/auth/logout', login), {
        method: 'POST', headers: { Accept: 'application/json', 'Content-Type': 'application/json', Origin: front!, 'Sec-Fetch-Site': 'same-site', ...(cookies.length ? { Cookie: cookies.join('; ') } : {}) },
        body: '{}', cache: 'no-store', redirect: 'manual', signal: AbortSignal.timeout(12_000),
      });
      const headers = new Headers(response.headers);
      for (const name of ['content-encoding', 'content-length', 'transfer-encoding', 'connection']) headers.delete(name);
      headers.set('Cache-Control', 'no-store');
      return new Response(response.body, { status: response.status, headers });
    } catch { return Response.json({ message: 'La déconnexion est temporairement indisponible.' }, { status: 502, headers: { 'Cache-Control': 'no-store' } }); }
  };
}
