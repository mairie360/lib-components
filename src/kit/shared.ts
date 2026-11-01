export { buildContentSecurityPolicy, createNonce, NONCE_REQUEST_HEADER } from './csp';
export * from './front-urls';
export { serviceBase, publicOrigin } from '../server/config';

export function publicFrontHref(value: string | undefined): string | undefined {
  if (!value?.trim()) return undefined;
  try {
    const url = new URL(value.trim());
    return ['http:','https:'].includes(url.protocol) && !url.username && !url.password ? url.href : undefined;
  } catch { return undefined; }
}
export function settingsProfileUrl(value: string | undefined): string | undefined {
  const href=publicFrontHref(value);if(!href) return undefined;
  try {
    return decodeURIComponent(new URL(href).pathname).split('/').some(part=>part.toLowerCase()==='profile') ? undefined : href;
  } catch { return undefined; }
}

export type DisplayRole = 'Admin' | 'Responsable' | 'Maire' | 'User' | 'Guest';
const roles: Record<string, DisplayRole> = {
  admin: 'Admin', administrator: 'Admin', administrateur: 'Admin',
  responsable: 'Responsable', manager: 'Responsable', maire: 'Maire', mayor: 'Maire',
  user: 'User', utilisateur: 'User', agent: 'User', guest: 'Guest', invite: 'Guest',
};
export function normalizeDisplayRole(value: unknown): DisplayRole | undefined {
  if (typeof value !== 'string') return undefined;
  const key=value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase().replace(/[\s_-]+/g,'').replace(/^role/,'');
  return roles[key];
}

/** This decoding controls navigation display only. BFFs authenticate every operation. */
export function jwtDisplayRole(token: string | undefined): DisplayRole {
  if (!token || token.length > 16384) return 'Guest';
  const parts = token.split('.');
  if (parts.length !== 3 || parts.some(part => !/^[A-Za-z0-9_-]+$/.test(part))) return 'Guest';
  try {
    const bytes=Uint8Array.from(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')),character=>character.charCodeAt(0));
    const payload: unknown = JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes));
    if (!payload || typeof payload !== 'object' || !('exp' in payload) || typeof payload.exp !== 'number' || !Number.isFinite(payload.exp) || payload.exp * 1000 <= Date.now()) return 'Guest';
    return 'role' in payload ? normalizeDisplayRole(payload.role) ?? 'Guest' : 'Guest';
  } catch { return 'Guest'; }
}

export function isExpiredJwt(token: string | undefined): boolean {
  if (!token || token.length > 16384) return true;
  const parts = token.split('.');
  if (parts.length !== 3 || parts.some(part => !/^[A-Za-z0-9_-]+$/.test(part))) return true;
  try {
    const payload: unknown = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    return !payload || typeof payload !== 'object' || !('exp' in payload) || typeof payload.exp !== 'number' || !Number.isFinite(payload.exp) || payload.exp * 1000 <= Date.now();
  } catch { return true; }
}

let browserTimeZone = 'UTC';
export function instanceTimeZone(value: string | undefined): string {
  if (value) try { return new Intl.DateTimeFormat('en', { timeZone: value }).resolvedOptions().timeZone; } catch { /* Invalid configuration has one predictable fallback. */ }
  return 'UTC';
}
export function setInstanceTimeZone(value: string | undefined) { browserTimeZone = instanceTimeZone(value); }
export function getInstanceTimeZone(): string {
  return typeof window === 'undefined' ? instanceTimeZone(process.env.INSTANCE_TIMEZONE) : browserTimeZone;
}
export function civilDateInZone(date: Date, timeZone = getInstanceTimeZone()): string {
  const parts = new Intl.DateTimeFormat('en', { timeZone: instanceTimeZone(timeZone), year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(date);
  const part = (name: string) => parts.find(value => value.type === name)!.value;
  return `${part('year')}-${part('month')}-${part('day')}`;
}
export function formatInstanceDate(value: string, timeZone = getInstanceTimeZone()): string {
  if (!value.trim()) return value;
  const civil = /^\d{4}-\d{2}-\d{2}$/.test(value);
  const date = new Date(civil ? `${value}T12:00:00Z` : value);
  if (!Number.isFinite(date.valueOf())) return value;
  return new Intl.DateTimeFormat('fr-FR', { day:'2-digit', month:'2-digit', year:'numeric', timeZone: civil ? 'UTC' : instanceTimeZone(timeZone) }).format(date);
}
