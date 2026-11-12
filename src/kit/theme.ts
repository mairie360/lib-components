/** Public display preferences only. This module never reads authentication data. */

// MAIR-608 design tokens: the charte and the single size scale every component uses.
/** Semantic tones; each maps to the `--mairie-*` colour tokens of the theme. */
export const tones = ['primary', 'secondary', 'neutral', 'success', 'warning', 'danger', 'info'] as const;
export type Tone = (typeof tones)[number];
/** The one size scale (controls 24–56 px, icons 12–32 px, text 12–20 px, avatars 20–56 px, spacing 4–32 px, radius 4–16 px, logo 16–64 px). */
export const sizes = ['xs', 's', 'm', 'l', 'xl'] as const;
export type Size = (typeof sizes)[number];
export const scale = {
  control: { xs: 24, s: 32, m: 40, l: 48, xl: 56 },
  icon: { xs: 12, s: 16, m: 20, l: 24, xl: 32 },
  avatar: { xs: 20, s: 24, m: 32, l: 40, xl: 56 },
  text: { xs: 12, s: 14, m: 16, l: 18, xl: 20 },
  space: { xs: 4, s: 8, m: 16, l: 24, xl: 32 },
  radius: { xs: 4, s: 6, m: 8, l: 12, xl: 16 },
  logo: { xs: 16, s: 24, m: 32, l: 48, xl: 64 },
} as const satisfies Record<string, Record<Size, number>>;
/** The charte colours live only in `src/styles/municipal-theme.css` (one place to change them); code binds the `--mairie-*` tokens. */
export const charteTokens = { primary: 'var(--mairie-action-background)', onPrimary: 'var(--mairie-on-action)', secondary: 'var(--mairie-secondary)', text: 'var(--mairie-text)', border: 'var(--mairie-control-border)' } as const;
/** CSS custom property of one scale entry, e.g. `var(--mairie-icon-m)`. */
export function scaleVar(kind: keyof typeof scale, size: Size): string { return `var(--mairie-${kind}-${size})`; }
export function isSize(value: unknown): value is Size { return typeof value === 'string' && (sizes as readonly string[]).includes(value); }
export function isTone(value: unknown): value is Tone { return typeof value === 'string' && (tones as readonly string[]).includes(value); }

/**
 * @deprecated MAIR-933 (decision of 12/11/2026): the product fronts are always light and the theme choice
 * is gone. A `theme` still sent by an older Settings or read from a v1 cookie is accepted and ignored.
 * Removed at the next major version.
 */
export type AppearanceTheme = 'light' | 'dark' | 'system';
export type AppearanceDensity = 'compact' | 'normal' | 'comfortable';
export type Appearance = {
  /** @deprecated MAIR-933: ignored, the fronts are always light. */
  theme?: AppearanceTheme | null;
  density: AppearanceDensity | null;
  font_family: string | null;
};
export const APPEARANCE_COOKIE = 'mairie360_appearance';
const APPEARANCE_EVENT = 'mairie360:appearance';
let configuredCookieDomain: string | undefined;
type Environment = { document?: Document; window?: Window; cookieDomain?: string };
const defaults: Appearance = { density: null, font_family: null };
const themes: readonly unknown[] = ['light', 'dark', 'system', null, undefined];

/** Same parent-host boundary as the existing public sidebar preference. */
export function validAppearanceCookieDomain(value: string | undefined, hostname: string): string | undefined {
  const domain = value?.trim().toLowerCase().replace(/^\./, '');
  const host = hostname.toLowerCase();
  if (!domain || !/^(?:[a-z\d](?:[a-z\d-]*[a-z\d])?\.)+[a-z][a-z\d-]*[a-z\d]$/.test(domain)) return undefined;
  return host === domain || host.endsWith(`.${domain}`) ? domain : undefined;
}
export function configureAppearanceCookieDomain(value: string | undefined) { configuredCookieDomain = value; }

/** Permit font family names and generic fallbacks, never CSS functions/declarations. */
export function safeFontFamily(value: unknown): string | undefined {
  if (typeof value !== 'string' || value.length > 128 || !value.trim()) return undefined;
  const family = value.trim();
  return family.split(',').every(part => /^(?:[A-Za-z][A-Za-z\d _-]*|"[A-Za-z][A-Za-z\d _-]*"|'[A-Za-z][A-Za-z\d _-]*')$/.test(part.trim())) ? family : undefined;
}
/** Derive safe display values from a confirmed receipt; a legacy `theme` is validated then dropped (MAIR-933). */
export function appearanceFromSettings(value: unknown): Appearance | undefined {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined;
  const record = value as Record<string, unknown>;
  if (!themes.includes(record.theme)) return undefined;
  return {
    density: ['compact', 'normal', 'comfortable'].includes(record.density as string) ? record.density as AppearanceDensity : null,
    font_family: safeFontFamily(record.font_family) ?? null,
  };
}
export function parseAppearanceCookie(cookie: string | undefined): Appearance | undefined {
  if (!cookie) return undefined;
  // Accept a server cookies().get(...).value as well as document.cookie.
  const matches = cookie.includes('=')
    ? cookie.split(';').map(part => part.trim()).filter(part => part.startsWith(`${APPEARANCE_COOKIE}=`))
    : [`${APPEARANCE_COOKIE}=${cookie}`];
  if (matches.length !== 1 || matches[0].length > 2048) return undefined;
  try {
    const raw = JSON.parse(decodeURIComponent(matches[0].slice(APPEARANCE_COOKIE.length + 1)));
    // v2 (MAIR-933) has no theme; a v1 cookie is still read and its theme ignored.
    const keys = raw && Object.keys(raw).sort().join(',');
    if (!raw || !((raw.v === 2 && keys === 'density,font_family,v') || (raw.v === 1 && keys === 'density,font_family,theme,v'))) return undefined;
    const appearance = appearanceFromSettings(raw);
    if (!appearance || appearance.density !== raw.density || appearance.font_family !== raw.font_family) return undefined;
    return appearance;
  } catch { return undefined; }
}
export function appearancePreferenceCookie(value: unknown, hostname: string, protocol: string, domain = configuredCookieDomain): string {
  const appearance = appearanceFromSettings(value);
  if (!appearance) return '';
  const parent = validAppearanceCookieDomain(domain, hostname);
  return `${APPEARANCE_COOKIE}=${encodeURIComponent(JSON.stringify({ v: 2, density: appearance.density, font_family: appearance.font_family }))}; Path=/; Max-Age=31536000; SameSite=Lax${parent ? `; Domain=${parent}` : ''}${protocol === 'https:' ? '; Secure' : ''}`;
}
function environment(options: Environment) {
  return { document: options.document ?? (typeof document !== 'undefined' ? document : undefined), window: options.window ?? (typeof window !== 'undefined' ? window : undefined) };
}
function cachedAppearance(document: Document): { readable: boolean; value?: Appearance } {
  try { return { readable: true, value: parseAppearanceCookie(document.cookie) }; } catch { return { readable: false }; }
}
/** MAIR-933: always light, whatever the cookie, the saved setting or prefers-color-scheme. */
function renderAppearance(appearance: Appearance, document: Document) {
  const root = document.documentElement;
  root.dataset.theme = 'light';
  root.dataset.appearanceMode = 'light';
  root.dataset.density = appearance.density ?? 'normal';
  root.style.colorScheme = 'light';
  if (appearance.font_family) root.style.setProperty('--mairie-user-font', appearance.font_family);
  else root.style.removeProperty('--mairie-user-font');
}
/** Call only after a validated bootstrap or successful, verified write receipt. */
export function applyConfirmedAppearance(value: unknown, options: Environment = {}): boolean {
  const appearance = appearanceFromSettings(value);
  const env = environment(options);
  if (!appearance || !env.document || !env.window) return false;
  renderAppearance(appearance, env.document);
  try { env.document.cookie = appearancePreferenceCookie(appearance, env.window.location.hostname, env.window.location.protocol, options.cookieDomain ?? configuredCookieDomain); } catch { /* Public cache is optional; confirmed display still applies. */ }
  env.window.dispatchEvent(new CustomEvent(APPEARANCE_EVENT, { detail: appearance }));
  return true;
}
/** Rehydrate density and font on navigation/focus (the theme no longer follows the OS: MAIR-933). */
export function startAppearanceSync(options: Environment & { appearance?: Appearance } = {}): () => void {
  const env = environment(options);
  if (!env.document || !env.window) return () => undefined;
  const document = env.document;
  const window = env.window;
  let observed = cachedAppearance(document);
  let current = appearanceFromSettings(options.appearance) ?? observed.value ?? defaults;
  const render = () => renderAppearance(current, document);
  const refresh = () => {
    const next = cachedAppearance(document);
    // A blocked/unchanged optional cache cannot undo the confirmed in-memory
    // display. A changed cookie still synchronizes another frontend or a reset.
    if (next.readable) {
      if (JSON.stringify(next.value) !== JSON.stringify(observed.value)) current = next.value ?? defaults;
      observed = next;
    }
    render();
  };
  const visible = () => { if (document.visibilityState === 'visible') refresh(); };
  const receive = (event: Event) => { const appearance = appearanceFromSettings((event as CustomEvent).detail); if (appearance) { current = appearance; render(); } };
  render();
  window.addEventListener('focus', refresh);
  window.addEventListener('pageshow', refresh);
  window.addEventListener(APPEARANCE_EVENT, receive);
  document.addEventListener('visibilitychange', visible);
  return () => {
    window.removeEventListener('focus', refresh);
    window.removeEventListener('pageshow', refresh);
    window.removeEventListener(APPEARANCE_EVENT, receive);
    document.removeEventListener('visibilitychange', visible);
  };
}
