import { NextRequest } from 'next/server.js';
import { publicOrigin, serviceBase } from './config';
import { readSessionCookies, validSessionToken } from './session';

export type PublishedPaths = Record<string, Record<string, unknown>>;
export type SessionProxyConfig = {
  baseUrl: () => string;
  paths: PublishedPaths;
  loginUrl: () => string;
  frontUrl: () => string;
  trustedHeaders?: (request: NextRequest) => Record<string, string>;
};
const errorResponse = (status: number, message: string, loginRequired = false) => Response.json({ error: { message } }, {
  status, headers: { 'Cache-Control': 'no-store', ...(loginRequired ? { 'X-Mairie360-Login-Required': 'true' } : {}) },
});

/** Only an existing published route and method can reach the configured BFF. */
export async function proxyPublishedBffRequest(request: NextRequest, path: string[], config: SessionProxyConfig): Promise<Response> {
  if (path.some(part => !part || part === '.' || part === '..' || /[\/\\\x00-\x1f\x7f]/.test(part))) return errorResponse(400, 'Chemin invalide.');
  const route = Object.entries(config.paths).find(([template]) => {
    const parts = template.split('/').filter(Boolean);
    return parts.length === path.length && parts.every((part, index) => /^\{[^}]+\}$/.test(part) || part === path[index]);
  });
  if (!route) return errorResponse(404, 'Route inconnue.');
  const allowed = Object.keys(route[1]).filter(method => ['get', 'post', 'put', 'patch', 'delete', 'head', 'options'].includes(method)).map(method => method.toUpperCase());
  if (allowed.includes('GET') && !allowed.includes('HEAD')) allowed.push('HEAD');
  if (!allowed.includes(request.method)) return Response.json({ error: { message: 'Méthode non autorisée.' } }, { status: 405, headers: { 'Cache-Control': 'no-store', Allow: allowed.join(', ') } });
  const base = serviceBase(config.baseUrl());
  if (!base) return errorResponse(503, 'Le service n’est pas configuré.');
  const origin = request.headers.get('origin'), ownOrigin = publicOrigin(config.frontUrl());
  if (request.headers.get('sec-fetch-site') === 'cross-site' || (origin && origin !== ownOrigin)) return errorResponse(403, 'Cette demande doit provenir de cet outil Mairie360.');
  const target = new URL(base + '/' + path.map(encodeURIComponent).join('/'));
  target.search = new URL(request.url).search;
  const headers = new Headers(request.headers);
  for (const name of ['host', 'connection', 'content-length', 'accept-encoding', 'cookie', 'x-nonce', 'content-security-policy', 'x-forwarded-for', 'x-real-ip']) headers.delete(name);
  for (const [name, value] of Object.entries(config.trustedHeaders?.(request) ?? {})) headers.set(name, value);
  const access = request.cookies.get('accessToken')?.value;
  if (validSessionToken(access)) headers.set('Authorization', `Bearer ${access}`);
  else if (validSessionToken(request.cookies.get('refreshToken')?.value)) headers.delete('authorization');
  const body = ['GET', 'HEAD'].includes(request.method) ? undefined : await request.arrayBuffer();
  let renewedCookies: string[] = [];
  try {
    const send = () => fetch(target, { method: request.method, headers, body, cache: 'no-store', redirect: 'manual', signal: AbortSignal.timeout(15_000) });
    let upstream = await send();
    if (upstream.status === 401 && path[0] !== 'auth') {
      const refresh = request.cookies.get('refreshToken')?.value;
      const login = serviceBase(config.loginUrl()), origin = publicOrigin(config.frontUrl());
      if (!validSessionToken(refresh) || !login || !origin) return errorResponse(401, 'Votre session a expiré. Veuillez vous reconnecter.', true);
      if (process.env.NODE_ENV === 'production' && new URL(login).protocol !== 'https:') return errorResponse(503, 'La connexion partagée n’est pas configurée.');
      await upstream.body?.cancel();
      // No browser-readable token: another frontend calls the Login owner with
      // only the already shared HttpOnly session cookie. It coordinates User.
      const renewal = await fetch(new URL('/api/auth/refresh', login), {
        method: 'POST', headers: { Accept: 'application/json', 'Content-Type': 'application/json', Origin: origin, 'Sec-Fetch-Site': 'same-site', Cookie: `refreshToken=${encodeURIComponent(refresh)}` },
        body: '{}', cache: 'no-store', redirect: 'manual', signal: AbortSignal.timeout(12_000),
      });
      if (!renewal.ok) return errorResponse(renewal.status === 401 ? 401 : 503, 'Votre session n’a pas pu être renouvelée.', renewal.status === 401);
      const session = readSessionCookies(renewal);
      const receipt: unknown = await renewal.json();
      if (!session || typeof receipt !== 'object' || receipt === null || !('message' in receipt) || typeof receipt.message !== 'string') return errorResponse(502, 'La réponse de renouvellement est invalide.');
      renewedCookies = renewal.headers.getSetCookie();
      headers.set('Authorization', `Bearer ${session.accessToken}`);
      upstream = await send();
      if (upstream.status === 401) return errorResponse(401, 'Votre session a expiré. Veuillez vous reconnecter.', true);
    }
    const responseHeaders = new Headers(upstream.headers);
    for (const name of ['content-encoding', 'content-length', 'transfer-encoding', 'connection', 'set-cookie']) responseHeaders.delete(name);
    for (const cookie of renewedCookies) responseHeaders.append('Set-Cookie', cookie);
    responseHeaders.set('Cache-Control', 'no-store');
    return new Response(request.method === 'HEAD' || [204, 205, 304].includes(upstream.status) ? null : upstream.body, { status: upstream.status, statusText: upstream.statusText, headers: responseHeaders });
  } catch {
    const response = errorResponse(502, 'Le service est indisponible.');
    // A business outage after successful rotation must not leave the browser
    // holding the now-invalid refresh token it sent before that rotation.
    for (const cookie of renewedCookies) response.headers.append('Set-Cookie', cookie);
    return response;
  }
}
