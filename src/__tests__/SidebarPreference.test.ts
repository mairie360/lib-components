import {
  configureSidebarCookieDomain,
  readSidebarPreference,
  sidebarPreferenceCookie,
  validSidebarCookieDomain,
} from '../utils/sidebar-preference';

afterEach(() => configureSidebarCookieDomain(undefined));

describe('sidebar preference cookie', () => {
  it('reads the versioned preference independently of surrounding account cookies', () => {
    expect(readSidebarPreference('session=private; mairie360_sidebar=v1:collapsed; theme=dark')).toBe(true);
    expect(readSidebarPreference('  mairie360_sidebar=v1:collapsed  ; session=private')).toBe(true);
    expect(readSidebarPreference('session=private;   mairie360_sidebar=v1:collapsed')).toBe(true);
  });

  it.each(['', 'mairie360_sidebar=v1:expanded', 'mairie360_sidebar=true', 'mairie360_sidebar=v2:collapsed', 'other_mairie360_sidebar=v1:collapsed'])('defaults to expanded for an absent or unsupported preference: %s', cookie => {
    expect(readSidebarPreference(cookie)).toBe(false);
  });

  it('accepts only the current host or its actual configured parent domain', () => {
    expect(validSidebarCookieDomain(' .MAIRIE360.FR ', 'Settings.Mairie360.fr')).toBe('mairie360.fr');
    expect(validSidebarCookieDomain('mairie360.fr', 'mairie360.fr')).toBe('mairie360.fr');
    expect(validSidebarCookieDomain('mairie360.fr', 'evilmairie360.fr')).toBeUndefined();
    expect(validSidebarCookieDomain('mairie360.fr', 'mairie360.fr.evil.fr')).toBeUndefined();
  });

  it.each([undefined, '', 'localhost', 'https://mairie360.fr', 'mairie360.fr:443', '*.mairie360.fr', 'mairie360.fr; Secure', '-mairie360.fr'])('rejects malformed cookie scope %s', domain => {
    expect(validSidebarCookieDomain(domain, 'settings.mairie360.fr')).toBeUndefined();
  });

  it('shares the HTTPS preference with a validated parent and preserves cookie security attributes', () => {
    configureSidebarCookieDomain('.mairie360.fr');
    expect(sidebarPreferenceCookie(true, 'settings.mairie360.fr', 'https:')).toBe(
      'mairie360_sidebar=v1:collapsed; Path=/; Max-Age=31536000; SameSite=Lax; Domain=mairie360.fr; Secure',
    );
  });

  it('keeps HTTP development and unrelated deployments host scoped', () => {
    configureSidebarCookieDomain('mairie360.fr');
    expect(sidebarPreferenceCookie(false, 'localhost', 'http:')).toBe(
      'mairie360_sidebar=v1:expanded; Path=/; Max-Age=31536000; SameSite=Lax',
    );
    expect(sidebarPreferenceCookie(false, 'example.fr', 'https:')).toBe(
      'mairie360_sidebar=v1:expanded; Path=/; Max-Age=31536000; SameSite=Lax; Secure',
    );
  });

  it('allows an explicit deployment scope to override the previously configured parent', () => {
    configureSidebarCookieDomain('mairie360.fr');
    expect(sidebarPreferenceCookie(false, 'tools.ville.fr', 'https:', '.ville.fr')).toContain('; Domain=ville.fr; Secure');
    configureSidebarCookieDomain(undefined);
    expect(sidebarPreferenceCookie(false, 'settings.mairie360.fr', 'https:')).not.toContain('; Domain=');
  });
});
