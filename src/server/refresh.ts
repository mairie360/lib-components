import { createHash } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server.js';
import { publicOrigin, serviceBase } from './config';
import { readSessionCookies, setSessionCookies, validSessionToken, type SessionCookieOptions, type SessionCookies } from './session';

export type SessionServerConfig = {
  userBffUrl: () => string;
  cookieOptions: () => SessionCookieOptions;
  allowedOrigins: () => readonly string[];
  trustedHeaders?: (request: NextRequest) => Record<string, string>;
};
type Renewal = { session: SessionCookies; expiresAt: number } | { status: number };
type Flight = { result: Promise<Renewal>; retainUntil: number; invalidated: boolean };
// All frontend proxies delegate renewal to the Login owner. This table is shared
// by its route bundles, never independently recreated for each proxy request.
const flightKey = Symbol.for('@mairie360/session-refresh-flights');
const state = globalThis as typeof globalThis & { [flightKey]?: Map<string, Flight> };
const flights = state[flightKey] ??= new Map<string, Flight>();
const maximumFlights = 128;

export function rejectSessionMutation(request: NextRequest, origins: readonly string[]): NextResponse | null {
  const origin = request.headers.get('origin');
  const known = origins.flatMap(value => { const parsed = publicOrigin(value); return parsed ? [parsed] : []; });
  const site = request.headers.get('sec-fetch-site');
  if (!origin || !known.includes(origin) || !['same-origin', 'same-site'].includes(site ?? '')) {
    return NextResponse.json({ message: 'Cette demande doit provenir d’un outil Mairie360 autorisé.' }, { status: 403, headers: { 'Cache-Control': 'no-store' } });
  }
  if (request.headers.get('content-type')?.split(';', 1)[0].trim().toLowerCase() !== 'application/json') {
    return NextResponse.json({ message: 'La requête doit utiliser le format JSON.' }, { status: 415, headers: { 'Cache-Control': 'no-store' } });
  }
  return null;
}

function keyFor(base: string, refresh: string): string {
  return base + ':' + createHash('sha256').update(refresh).digest('hex');
}

/** Coordinate the actual cookie-only /auth/refresh contract at the Login owner. */
export async function renewUserSession(request: NextRequest, config: SessionServerConfig): Promise<Renewal> {
  const base = serviceBase(config.userBffUrl());
  const token = request.cookies.get('refreshToken')?.value;
  if (!base) return { status: 503 };
  if (!validSessionToken(token)) return { status: 401 };
  const key = keyFor(base, token), now = Date.now();
  for (const [existingKey, flight] of flights) if (flight.retainUntil <= now) flights.delete(existingKey);
  const existing = flights.get(key);
  if (existing) {
    const completed = await existing.result;
    return existing.invalidated ? { status: 401 } : completed;
  }
  if (new Set(flights.values()).size >= maximumFlights) return { status: 503 };
  const flight: Flight = { result: Promise.resolve({ status: 503 }), retainUntil: Infinity, invalidated: false };
  const result = (async (): Promise<Renewal> => {
    try {
      const response = await fetch(`${base}/auth/refresh`, {
        method: 'POST', headers: { Accept: 'application/json', 'Content-Type': 'application/json', ...config.trustedHeaders?.(request) },
        body: JSON.stringify({ refresh_token: token }), cache: 'no-store', redirect: 'manual', signal: AbortSignal.timeout(10_000),
      });
      if (response.status !== 200) return { status: response.status >= 400 && response.status < 600 ? response.status : 502 };
      const body: unknown = await response.json();
      const session = readSessionCookies(response);
      if (!session || session.refreshToken === token || typeof body !== 'object' || body === null || !('message' in body) || typeof body.message !== 'string') return { status: 502 };
      return { session, expiresAt: Date.now() + session.maxAge * 1000 };
    } catch { return { status: 502 }; }
  })();
  flight.result = result;
  flights.set(key, flight);
  const completed = await result;
  if (flight.invalidated) return { status: 401 };
  if ('session' in completed) {
    // A brief handover also covers requests whose old cookie reached the owner
    // just after rotation. Do not extend the actual access expiry when reusing it.
    flight.retainUntil = Math.min(Date.now() + 30_000, completed.expiresAt);
    flights.set(keyFor(base, completed.session.refreshToken), flight);
  } else flights.delete(key);
  return completed;
}

export function createSessionRefreshHandler(config: SessionServerConfig) {
  return async function POST(request: NextRequest): Promise<NextResponse> {
    const rejected = rejectSessionMutation(request, config.allowedOrigins());
    if (rejected) return rejected;
    const options = config.cookieOptions();
    if (options.secure && !options.domain?.trim()) return NextResponse.json({ message: 'La session partagée n’est pas configurée.' }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
    const renewed = await renewUserSession(request, config);
    if (!('session' in renewed)) return NextResponse.json({ message: 'La session n’a pas pu être renouvelée.' }, { status: renewed.status, headers: { 'Cache-Control': 'no-store' } });
    const maxAge = Math.min(renewed.session.maxAge, Math.floor((renewed.expiresAt - Date.now()) / 1000));
    if (maxAge <= 0) return NextResponse.json({ message: 'La session a expiré.' }, { status: 401, headers: { 'Cache-Control': 'no-store' } });
    const response = NextResponse.json({ message: 'Session renouvelée.' }, { headers: { 'Cache-Control': 'no-store' } });
    setSessionCookies(response, { ...renewed.session, maxAge }, options);
    return response;
  };
}

/** Remove handover state after explicit logout; a cached renewal cannot restore it. */
export function forgetUserSession(baseUrl: string, refreshToken: string | undefined): void {
  if (!refreshToken) return;
  const found = flights.get(keyFor(serviceBase(baseUrl), refreshToken));
  if (!found) return;
  found.invalidated = true;
  for (const [key, flight] of flights) if (flight === found) flights.delete(key);
}
