import test,{afterEach} from 'node:test';
import assert from 'node:assert/strict';
import { FRONT_URL_KEYS,frontUrl,readFrontUrlsFromEnv,setBrowserFrontUrls,jwtDisplayRole,isExpiredJwt,instanceTimeZone,setInstanceTimeZone,getInstanceTimeZone,civilDateInZone,formatInstanceDate,serviceBase,publicOrigin,buildContentSecurityPolicy,createNonce } from '../../dist/shared.js';
const saved=Object.fromEntries([...FRONT_URL_KEYS,'INSTANCE_TIMEZONE'].map(key=>[key,process.env[key]]));
const oldWindow=globalThis.window;
afterEach(()=>{for(const [key,value] of Object.entries(saved))value===undefined?delete process.env[key]:process.env[key]=value;oldWindow===undefined?delete globalThis.window:globalThis.window=oldWindow;setBrowserFrontUrls({});setInstanceTimeZone(undefined);});
const jwt=claims=>`e30.${Buffer.from(JSON.stringify(claims)).toString('base64url')}.signature`;
test('frontend URLs are read at use time and browsers receive only injected public configuration',()=>{
  delete globalThis.window;for(const key of FRONT_URL_KEYS)delete process.env[key];
  process.env.LOGIN_FRONT_URL=' https://login.example.test/ ';process.env.PROJECT_FRONT_URL='   ';
  assert.deepEqual(readFrontUrlsFromEnv(),{LOGIN_FRONT_URL:'https://login.example.test/'});
  assert.equal(frontUrl('LOGIN_FRONT_URL'),'https://login.example.test/');
  process.env.LOGIN_FRONT_URL='https://other-login.example.test/';assert.equal(frontUrl('LOGIN_FRONT_URL'),'https://other-login.example.test/');
  globalThis.window={};setBrowserFrontUrls({DASHBOARD_FRONT_URL:'https://dashboard.example.test/'});
  assert.equal(frontUrl('LOGIN_FRONT_URL'),undefined);assert.equal(frontUrl('DASHBOARD_FRONT_URL'),'https://dashboard.example.test/');
});
test('configured service bases reject credential and query injection while retaining supported subpaths',()=>{
  for(const value of [undefined,'','  ','not a URL','ftp://service.test','https://user:password@service.test','https://service.test/?token=secret','https://service.test/#hash']){assert.equal(serviceBase(value),'');assert.equal(publicOrigin(value),undefined);}
  assert.equal(serviceBase(' https://service.example.test/api/// '),'https://service.example.test/api');
  assert.equal(publicOrigin('https://service.example.test/api'),'https://service.example.test');
});
test('display roles use shared aliases and treat unknown, malformed and expired claims as Guest',()=>{
  const exp=Math.floor(Date.now()/1000)+300;
  for(const [role,wanted] of [[' administrator ','Admin'],['manager','Responsable'],['mayor','Maire'],['agent','User'],['invite','Guest'],['unrecognized','Guest']])assert.equal(jwtDisplayRole(jwt({exp,role})),wanted);
  for(const token of [undefined,'opaque','a.b','a.b.c.d','a!.b.c','x'.repeat(16385),'e30.not-json.signature',jwt(null),jwt({exp:'later',role:'Admin'}),jwt({exp:1,role:'Admin'})]){assert.equal(jwtDisplayRole(token),'Guest');assert.equal(isExpiredJwt(token),true);}
  assert.equal(jwtDisplayRole(jwt({exp,role:42})),'Guest');assert.equal(isExpiredJwt(jwt({exp})),false);
});
test('instance timezone selection stays distinct on the server and browser and uses UTC only as fallback',()=>{
  delete globalThis.window;process.env.INSTANCE_TIMEZONE='Indian/Reunion';assert.equal(getInstanceTimeZone(),'Indian/Reunion');
  globalThis.window={};assert.equal(getInstanceTimeZone(),'UTC');setInstanceTimeZone('Indian/Reunion');assert.equal(getInstanceTimeZone(),'Indian/Reunion');
  setInstanceTimeZone('invalid/zone');assert.equal(getInstanceTimeZone(),'UTC');assert.equal(instanceTimeZone(undefined),'UTC');
  assert.equal(civilDateInZone(new Date('2026-12-31T22:00:00Z'),'Indian/Reunion'),'2027-01-01');
  assert.equal(formatInstanceDate('2026-01-01','Pacific/Honolulu'),'01/01/2026');
  assert.equal(formatInstanceDate('not-a-date'),'not-a-date');assert.equal(formatInstanceDate('  '),'  ');
});
test('CSP nonces are distinct and eval is available only for development',()=>{
  const first=createNonce(),second=createNonce();assert.notEqual(first,second);assert.ok(atob(first).length>0);
  assert.match(buildContentSecurityPolicy(first,true),/script-src[^;]*'unsafe-eval'/);assert.doesNotMatch(buildContentSecurityPolicy(second),/unsafe-eval/);
});
