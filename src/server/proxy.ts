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
  maxBodyBytes?: number;
};
const requestHeaderNames = ['accept', 'accept-language', 'content-type', 'if-match', 'if-none-match', 'if-modified-since', 'if-unmodified-since', 'user-agent', 'x-request-id', 'last-event-id'];
const responseHeaderNames = ['content-type', 'content-disposition', 'etag', 'last-modified', 'retry-after', 'allow', 'x-request-id'];
async function readBoundedBody(request: NextRequest, maximum: number): Promise<ArrayBuffer | null> {
  if (Number(request.headers.get('content-length') ?? 0) > maximum) return null;
  if (!request.body) return new ArrayBuffer(0);
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];let length=0;
  const read = async ():Promise<ArrayBuffer|null> => {
    const chunk = await reader.read();
    if (chunk.done) {
      const result = new Uint8Array(length);let offset=0;
      for(const item of chunks) {result.set(item,offset);offset+=item.length;}
      return result.buffer;
    }
    length += chunk.value.byteLength;
    if (length > maximum) {await reader.cancel();return null;}
    chunks.push(chunk.value);return read();
  };
  try {return await read();} finally {reader.releaseLock();}
}
const errorResponse = (status: number, message: string, loginRequired = false) => Response.json({ error: { message } }, {
  status, headers: { 'Cache-Control': 'no-store', ...(loginRequired ? { 'X-Mairie360-Login-Required': 'true', 'X-Mairie360-Refresh-Refused':'true' } : {}) },
});

/** Only an existing published route and method can reach the configured BFF. */
export async function proxyPublishedBffRequest(request: NextRequest, path: string[], config: SessionProxyConfig): Promise<Response> {
  if (path.length===1 && ['openapi.json','swagger.json'].includes(path[0])) return errorResponse(404,'Route inconnue.');
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
  const site=request.headers.get('sec-fetch-site');
  if (site === 'cross-site' || (origin && origin !== ownOrigin) || (!['GET','HEAD','OPTIONS'].includes(request.method) && site && !['same-origin','none'].includes(site))) return errorResponse(403, 'Cette demande doit provenir de cet outil Mairie360.');
  const target = new URL(base + '/' + path.map(encodeURIComponent).join('/'));
  target.search = new URL(request.url).search;
  const headers = new Headers();
  for(const name of requestHeaderNames) {const value=request.headers.get(name);if(value!==null) headers.set(name,value);}
  for (const [name, value] of Object.entries(config.trustedHeaders?.(request) ?? {})) headers.set(name, value);
  const access = request.cookies.get('accessToken')?.value;
  if (validSessionToken(access)) headers.set('Authorization', `Bearer ${access}`);
  let body:ArrayBuffer|undefined;
  if (!['GET','HEAD'].includes(request.method)) {
    try {
      const read=await readBoundedBody(request,config.maxBodyBytes ?? 1024*1024);
      if(read===null) return errorResponse(413,'Le corps de la requête est trop volumineux.');
      body=read;
    } catch {return errorResponse(400,'Le corps de la requête est invalide.');}
  }
  let renewedCookies: string[] = [];
  try {
    const send = () => fetch(target, { method: request.method, headers, body, cache: 'no-store', redirect: 'manual', signal: AbortSignal.timeout(15_000) });
    let upstream = await send();
    if (upstream.status === 401 && path[0] !== 'auth') {
      const refresh = request.cookies.get('refreshToken')?.value;
      const login = serviceBase(config.loginUrl()), origin = publicOrigin(config.frontUrl());
      // Root business routes do not receive the /api-scoped refresh cookie.
      // The browser must still be allowed to renew through its own /api route.
      if (!validSessionToken(refresh)) return errorResponse(401, 'Votre session doit être renouvelée.');
      if (!login || !origin) return errorResponse(503, 'La connexion partagée n’est pas configurée.');
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
      renewedCookies = renewal.headers.getSetCookie().filter(cookie => /^(?:accessToken|refreshToken)=/.test(cookie));
      headers.set('Authorization', `Bearer ${session.accessToken}`);
      upstream = await send();
      if (upstream.status === 401) return errorResponse(401, 'Votre session a expiré. Veuillez vous reconnecter.', true);
    }
    const responseHeaders = new Headers();
    for(const name of responseHeaderNames) {const value=upstream.headers.get(name);if(value!==null) responseHeaders.set(name,value);}
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
