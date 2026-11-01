import test from 'node:test';
import assert from 'node:assert/strict';
import { jwtDisplayRole, instanceTimeZone, civilDateInZone, formatInstanceDate, buildContentSecurityPolicy, publicFrontHref, settingsProfileUrl } from '../../dist/shared.js';
const jwt = claims => `e30.${Buffer.from(JSON.stringify(claims)).toString('base64url')}.signature`;

test('a valid unexpired role claim controls display with one alias table', () => {
  for (const role of ['Admin', 'administrator', 'Administrateur', 'ROLE_ADMIN', 'rôle-administrateur']) assert.equal(jwtDisplayRole(jwt({exp:Date.now()/1000+60,role})), 'Admin');
  for (const token of ['', 'opaque', jwt({role:'Admin'}), jwt({exp:1,role:'Admin'}), jwt({exp:Date.now()/1000+60,roles:['Admin']})]) assert.equal(jwtDisplayRole(token), 'Guest');
  assert.equal(jwtDisplayRole(jwt({exp:Date.now()/1000+60,role:'Responsable'})), 'Responsable');
});

test('instance dates do not depend on the browser timezone and preserve civil dates', () => {
  assert.equal(civilDateInZone(new Date('2026-10-14T21:30:00Z'), 'Indian/Reunion'), '2026-10-15');
  assert.equal(civilDateInZone(new Date('2026-03-29T00:30:00Z'), 'Europe/Paris'), '2026-03-29');
  assert.equal(formatInstanceDate('2026-10-14T21:30:00Z', 'Indian/Reunion'), '15/10/2026');
  assert.equal(formatInstanceDate('2026-10-14', 'Indian/Reunion'), '14/10/2026');
  assert.equal(instanceTimeZone('invalid/zone'), 'UTC');
});

test('shared CSP keeps production scripts restricted to nonce and strict dynamic', () => {
  assert.match(buildContentSecurityPolicy('example'), /script-src 'self' 'nonce-example' 'strict-dynamic'/);
  assert.doesNotMatch(buildContentSecurityPolicy('example'), /unsafe-eval/);
});
test('public profile destinations preserve configured paths and refuse legacy loops',()=>{
  assert.equal(settingsProfileUrl('https://settings.example.test/account/?tab=profile'),'https://settings.example.test/account/?tab=profile');
  for(const value of [undefined,'','not-a-url','javascript:alert(1)','https://name:secret@example.test/']) assert.equal(publicFrontHref(value),undefined);
  for(const value of ['https://settings.example.test/profile/','https://settings.example.test/%70rofile','https://settings.example.test/%ff']) assert.equal(settingsProfileUrl(value),undefined);
});
