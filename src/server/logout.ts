import { NextRequest, NextResponse } from 'next/server.js';
import { publicOrigin, serviceBase } from './config';
import { accessCookieMaxAge, clearSessionCookies, validSessionToken } from './session';
import { forgetUserSession, rejectSessionMutation, renewUserSession, type SessionServerConfig } from './refresh';

/** Only the published Keycloak end-session URL may leave the trusted instance. */
export function sessionLogoutUrl(value: unknown, domain: string | undefined, allowedOrigins: readonly string[]): string | undefined {
  if (typeof value !== 'string' || /[\x00-\x20\x7f\\]/.test(value)) return undefined;
  try {
    const url = new URL(value), host = domain?.trim().replace(/^\./, '').toLowerCase();
    if (url.protocol !== 'https:' || url.username || url.password || url.hash ||
      !/^\/realms\/[^/]+\/protocol\/openid-connect\/logout$/.test(url.pathname) || !url.searchParams.get('client_id')) return undefined;
    if (!host || (url.hostname !== host && !url.hostname.endsWith('.' + host))) return undefined;
    if ([...url.searchParams.keys()].some(key => !['client_id', 'post_logout_redirect_uri'].includes(key) || url.searchParams.getAll(key).length !== 1)) return undefined;
    const redirect = url.searchParams.get('post_logout_redirect_uri');
    if (redirect && (!publicOrigin(redirect) || !allowedOrigins.some(origin => publicOrigin(origin) === publicOrigin(redirect)))) return undefined;
    return url.href;
  } catch { return undefined; }
}

/** Login owns revocation and cookie expiry; a GET never invokes this handler. */
export function createSessionLogoutHandler(config: SessionServerConfig) {
  return async function POST(request: NextRequest): Promise<NextResponse> {
    const rejected = rejectSessionMutation(request, config.allowedOrigins());
    if (rejected) return rejected;
    const base = serviceBase(config.userBffUrl()), options = config.cookieOptions();
    if (!base || (options.secure && !options.domain?.trim())) return NextResponse.json({ message: 'La déconnexion est temporairement indisponible.' }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
    let access = request.cookies.get('accessToken')?.value, refresh = request.cookies.get('refreshToken')?.value;
    const originalRefresh = refresh;
    // A refresh cookie can outlive the access JWT. Renew at the same owner before
    // revocation instead of claiming that an expired bearer closed the session.
    if ((!validSessionToken(access) || accessCookieMaxAge(access) <= 0) && validSessionToken(refresh)) {
      const renewed = await renewUserSession(request, config);
      if ('session' in renewed) { access = renewed.session.accessToken; refresh = renewed.session.refreshToken; }
    }
    try {
      const upstream = await fetch(base + '/auth/logout', {
        method: 'POST', headers: { Accept: 'application/json', 'Content-Type': 'application/json', ...config.trustedHeaders?.(request), ...(validSessionToken(access) ? { Authorization: `Bearer ${access}` } : {}) },
        body: JSON.stringify(validSessionToken(refresh) ? { refresh_token: refresh } : {}), cache: 'no-store', redirect: 'manual', signal: AbortSignal.timeout(10_000),
      });
      if (upstream.status !== 200) return NextResponse.json({ message: 'La déconnexion n’a pas abouti. Veuillez réessayer.' }, { status: upstream.status >= 400 && upstream.status < 600 ? upstream.status : 502, headers: { 'Cache-Control': 'no-store' } });
      const body: unknown = await upstream.json();
      if (typeof body !== 'object' || body === null || !('message' in body) || typeof body.message !== 'string' || ('session_revoked' in body && typeof body.session_revoked !== 'boolean')) {
        return NextResponse.json({ message: 'La déconnexion n’a pas pu être confirmée.' }, { status: 502, headers: { 'Cache-Control': 'no-store' } });
      }
      const logoutUrl = 'logout_url' in body ? sessionLogoutUrl(body.logout_url, options.domain, config.allowedOrigins()) : undefined;
      if ('logout_url' in body && !logoutUrl) return NextResponse.json({ message: 'La fermeture de la connexion unique est indisponible.' }, { status: 502, headers: { 'Cache-Control': 'no-store' } });
      forgetUserSession(base, originalRefresh);
      forgetUserSession(base, refresh);
      // The earlier published User0.5 response contains only message. It proves
      // local expiry, never Core revocation; keep that distinction explicit.
      const revoked = 'session_revoked' in body && body.session_revoked === true;
      const response = NextResponse.json({ message: revoked ? 'Session fermée.' : 'La fermeture de la session serveur n’a pas pu être confirmée.', session_revoked: revoked, ...(logoutUrl ? { logout_url: logoutUrl } : {}) }, { headers: { 'Cache-Control': 'no-store' } });
      clearSessionCookies(response, options);
      return response;
    } catch { return NextResponse.json({ message: 'La déconnexion est temporairement indisponible.' }, { status: 502, headers: { 'Cache-Control': 'no-store' } }); }
  };
}
