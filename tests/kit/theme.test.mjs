import test from 'node:test';
import assert from 'node:assert/strict';
import { APPEARANCE_COOKIE, parseAppearanceCookie, appearancePreferenceCookie, applyConfirmedAppearance, startAppearanceSync, safeFontFamily, configureAppearanceCookieDomain } from '../../dist/theme.js';
const appearance = { theme: 'dark', density: 'comfortable', font_family: 'Arial, sans-serif' };
function browser(dark = false) {
  const properties = new Map();
  const media = new EventTarget(); media.matches = dark;
  media.addListener = callback => media.addEventListener('change', callback); media.removeListener = callback => media.removeEventListener('change', callback);
  const document = Object.assign(new EventTarget(), { cookie: '', visibilityState: 'visible', documentElement: { dataset: {}, style: { colorScheme: '', setProperty: (name, value) => properties.set(name, value), removeProperty: name => properties.delete(name) } } });
  const window = Object.assign(new EventTarget(), { location: { hostname: 'projects.mairie.test', protocol: 'https:' }, matchMedia: () => media });
  return { document, window, media, properties };
}
test('only the validated versioned appearance cookie is read, without consuming other cookie values', () => {
  const cookie = appearancePreferenceCookie(appearance, 'settings.mairie.test', 'https:', '.mairie.test');
  assert.match(cookie, /^mairie360_appearance=/); assert.match(cookie, /Domain=mairie.test/); assert.match(cookie, /SameSite=Lax/); assert.match(cookie, /Secure/);
  assert.deepEqual(parseAppearanceCookie(`unrelated=ignored; ${cookie}`), appearance);
  assert.deepEqual(parseAppearanceCookie(cookie.split(';', 1)[0].slice(APPEARANCE_COOKIE.length + 1)), appearance);
  assert.equal(parseAppearanceCookie(undefined), undefined);
  for (const raw of ['bad', encodeURIComponent(JSON.stringify({ v: 2, ...appearance })), encodeURIComponent(JSON.stringify({ v: 1, ...appearance, font_family: 'url(https://foreign.test/font)' })), '%broken']) assert.equal(parseAppearanceCookie(`${APPEARANCE_COOKIE}=${raw}`), undefined);
  assert.equal(parseAppearanceCookie(`${cookie}; ${cookie}`), undefined);
});
test('unrelated cookie domains are never granted and font syntax cannot inject declarations', () => {
  assert.doesNotMatch(appearancePreferenceCookie(appearance, 'settings.mairie.test', 'http:', 'foreign.test'), /Domain=|Secure/);
  assert.equal(safeFontFamily('"Atkinson Hyperlegible", sans-serif'), '"Atkinson Hyperlegible", sans-serif');
  for (const font of ['Arial; color:red', 'url(https://x.test)', 'var(--secret)', 'Arial /*x*/', '"unbalanced', '']) assert.equal(safeFontFamily(font), undefined);
});
test('confirmed appearance updates document attributes and caches only safe public appearance data', () => {
  const env = browser();
  assert.equal(applyConfirmedAppearance({ ...appearance, font_size: 32767, accessToken: 'ignored-secret-field' }, { ...env, cookieDomain: '.mairie.test' }), true);
  assert.equal(env.document.documentElement.dataset.theme, 'dark');
  assert.equal(env.document.documentElement.dataset.density, 'comfortable');
  assert.equal(env.document.documentElement.style.colorScheme, 'dark');
  assert.equal(env.properties.get('--mairie-user-font'), 'Arial, sans-serif');
  assert.doesNotMatch(env.document.cookie, /ignored-secret|font_size|32767/);
  const before = env.document.cookie;
  assert.equal(applyConfirmedAppearance({ theme: 'unsupported' }, env), false);
  assert.equal(env.document.cookie, before);
});
test('system mode reacts to OS changes, explicit mode ignores them, and disposal removes listeners', () => {
  const env = browser(false);
  const dispose = startAppearanceSync(env);
  assert.equal(env.document.documentElement.dataset.theme, 'light');
  env.media.matches = true; env.media.dispatchEvent(new Event('change'));
  assert.equal(env.document.documentElement.dataset.theme, 'dark');
  applyConfirmedAppearance({ ...appearance, theme: 'light' }, env);
  env.media.matches = false; env.media.dispatchEvent(new Event('change'));
  env.media.matches = true; env.media.dispatchEvent(new Event('change'));
  assert.equal(env.document.documentElement.dataset.theme, 'light');
  dispose(); env.document.documentElement.dataset.theme = 'disposed'; env.media.dispatchEvent(new Event('change'));
  assert.equal(env.document.documentElement.dataset.theme, 'disposed');
});
test('focus rehydrates the public shared cookie across fronts without forcing a cookie write', () => {
  const env = browser();
  const dispose = startAppearanceSync(env);
  env.document.cookie = appearancePreferenceCookie(appearance, env.window.location.hostname, 'https:', '.mairie.test');
  env.window.dispatchEvent(new Event('focus'));
  assert.equal(env.document.documentElement.dataset.theme, 'dark');
  assert.equal(env.document.documentElement.dataset.density, 'comfortable');
  dispose();
});

test('cookie privacy restrictions cannot prevent rendering the system theme', () => {
  const env = browser(false);
  Object.defineProperty(env.document, 'cookie', { get() { throw new Error('Cookie access disabled'); }, set() { throw new Error('Cookie access disabled'); } });
  const dispose = startAppearanceSync(env);
  assert.equal(env.document.documentElement.dataset.theme, 'light');
  assert.equal(applyConfirmedAppearance(appearance, env), true);
  assert.equal(env.document.documentElement.dataset.theme, 'dark');
  env.window.dispatchEvent(new Event('focus'));
  assert.equal(env.document.documentElement.dataset.theme, 'dark');
  dispose();
});
test('SSR and absent browser APIs remain inert while safe configured domains apply to public cookies', () => {
  assert.equal(applyConfirmedAppearance(appearance), false);
  assert.doesNotThrow(() => startAppearanceSync()());
  configureAppearanceCookieDomain('.mairie.test');
  assert.match(appearancePreferenceCookie(appearance, 'settings.mairie.test', 'https:'), /Domain=mairie.test/);
  configureAppearanceCookieDomain(undefined);
  assert.equal(safeFontFamily("'Source Sans Pro', sans-serif"), "'Source Sans Pro', sans-serif");
  assert.equal(safeFontFamily('a'.repeat(129)), undefined);
  assert.equal(safeFontFamily(12), undefined);
  const env = browser(); delete env.window.matchMedia;
  const dispose = startAppearanceSync({ ...env, appearance: { theme: null, density: null, font_family: null } });
  assert.equal(env.document.documentElement.dataset.theme, 'light');
  dispose();
});
test('legacy OS listeners and navigation events rehydrate safe defaults after a cache reset', () => {
  const env = browser(true);
  env.media.addEventListener = undefined; env.media.removeEventListener = undefined;
  env.media.addListener = callback => EventTarget.prototype.addEventListener.call(env.media, 'change', callback);
  env.media.removeListener = callback => EventTarget.prototype.removeEventListener.call(env.media, 'change', callback);
  const dispose = startAppearanceSync({ ...env, appearance });
  assert.equal(env.document.documentElement.dataset.theme, 'dark');
  env.document.cookie = appearancePreferenceCookie({ theme: 'light', density: null, font_family: null }, env.window.location.hostname, 'https:');
  env.window.dispatchEvent(new Event('pageshow'));
  assert.equal(env.document.documentElement.dataset.theme, 'light');
  env.document.cookie = '';
  env.document.visibilityState = 'hidden'; env.document.dispatchEvent(new Event('visibilitychange'));
  assert.equal(env.document.documentElement.dataset.theme, 'light');
  env.document.visibilityState = 'visible'; env.document.dispatchEvent(new Event('visibilitychange'));
  assert.equal(env.document.documentElement.dataset.theme, 'dark');
  dispose(); env.document.documentElement.dataset.theme = 'disposed'; env.media.dispatchEvent(new Event('change'));
  assert.equal(env.document.documentElement.dataset.theme, 'disposed');
});

test('a rejected optional cookie write does not restore an older preference on focus', () => {
  const env = browser(false);
  const old = appearancePreferenceCookie({ theme: 'light', density: null, font_family: null }, 'projects.mairie.test', 'https:');
  Object.defineProperty(env.document, 'cookie', { get() { return old; }, set() { throw new Error('Cookie write disabled'); } });
  const dispose = startAppearanceSync(env);
  applyConfirmedAppearance(appearance, env);
  env.window.dispatchEvent(new Event('focus'));
  assert.equal(env.document.documentElement.dataset.theme, 'dark');
  assert.equal(env.document.documentElement.dataset.density, 'comfortable');
  dispose();
});
