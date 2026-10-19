import test from 'node:test';
import assert from 'node:assert/strict';
import { NextResponse } from 'next/server.js';
import { accessCookieMaxAge, clearSessionCookies, readSessionCookies, setSessionCookies, validSessionToken } from '../../dist/next.js';

const jwt = claims => `e30.${Buffer.from(JSON.stringify(claims)).toString('base64url')}.signature`;
const response = cookies => {
  const headers = new Headers(); for (const cookie of cookies) headers.append('Set-Cookie', cookie);
  return Response.json({ message: 'Fixture session' }, { headers });
};
const access = 'accessToken=fixture-access; Path=/auth; HttpOnly';
const refresh = 'refreshToken=fixture-refresh; Path=/auth; HttpOnly';

test('session cookies are decoded once and their upstream scope never becomes frontend policy', () => {
  const session = readSessionCookies(response(['accessToken=fixture%2Baccess; Path=/auth; Domain=upstream.example; Max-Age=120', refresh]));
  assert.deepEqual(session, { accessToken:'fixture+access',refreshToken:'fixture-refresh',maxAge:120 });
  const frontend = new NextResponse();
  setSessionCookies(frontend, session, { secure:true,domain:'.instance.example' });
  const issued=frontend.cookies.get('accessToken');
  assert.equal(issued.path,'/');assert.equal(issued.domain,'.instance.example');assert.equal(issued.httpOnly,true);assert.equal(issued.secure,true);assert.equal(issued.sameSite,'strict');
  assert.equal(frontend.cookies.get('refreshToken').path,'/api');
});
test('session reading distinguishes absent credentials from an invalid or incomplete pair', () => {
  assert.equal(readSessionCookies(response([])),undefined);
  assert.equal(readSessionCookies(response(['unrelated=value; Path=/'])),undefined);
  for(const cookies of [[access],[refresh],[access,access,refresh],[access,refresh,refresh]]) assert.equal(readSessionCookies(response(cookies)),null);
});
for(const [name,cookies] of [
  ['empty access',['accessToken=; Path=/',refresh]],
  ['empty refresh',[access,'refreshToken=; Path=/']],
  ['encoded newline',['accessToken=fixture%0Aaccess; Path=/',refresh]],
  ['encoded whitespace',[access,'refreshToken=fixture%20refresh; Path=/']],
  ['expired access',[access+'; Max-Age=0',refresh]],
  ['negative refresh lifetime',[access,refresh+'; Max-Age=-1']],
  ['non-numeric lifetime',[access+'; Max-Age=invalid',refresh]],
  ['overflow lifetime',[access+'; Max-Age='+'9'.repeat(400),refresh]],
  ['expired date',[access,refresh+'; Expires=Thu, 01 Jan 1970 00:00:00 GMT']],
  ['invalid date',[access+'; Expires=not-a-date',refresh]],
]) test(`a ${name} receipt cannot open a frontend session`,()=>{assert.equal(readSessionCookies(response(cookies)),null);});
test('cookie expiry and JWT expiry independently cap the frontend access lifetime',t=>{
  const now=Date.UTC(2026,9,15,12);t.mock.timers.enable({apis:['Date'],now});
  const token=jwt({exp:now/1000+90});
  assert.equal(readSessionCookies(response([`accessToken=${token}; Max-Age=600`,refresh])).maxAge,90);
  assert.equal(readSessionCookies(response([access+'; Expires='+new Date(now+45000).toUTCString(),refresh])).maxAge,45);
  assert.equal(readSessionCookies(response([`accessToken=${jwt({exp:now/1000-1})}; Max-Age=600`,refresh])),null);
  t.mock.timers.setTime(now+49900);
  assert.equal(readSessionCookies(response([access,refresh+'; Expires='+new Date(now+50000).toUTCString()])),null);
});
test('opaque access tokens and invalid claims are bounded while valid distant claims never exceed one day',t=>{
  const now=Date.UTC(2026,9,15,12);t.mock.timers.enable({apis:['Date'],now});
  for(const token of ['opaque','e30.invalid.signature',jwt(null),jwt({}),jwt({exp:'later'}),jwt({exp:1.5})])assert.equal(accessCookieMaxAge(token),3600);
  assert.equal(accessCookieMaxAge(jwt({exp:now/1000+300})),300);
  assert.equal(accessCookieMaxAge(jwt({exp:now/1000+900000})),86400);
});
test('invalid session writes are rejected before either cookie is emitted',()=>{
  for(const session of [
    {accessToken:undefined,refreshToken:'refresh',maxAge:30},
    {accessToken:'access',refreshToken:undefined,maxAge:30},
    {accessToken:'bad token',refreshToken:'refresh',maxAge:30},
    {accessToken:'access',refreshToken:'bad;token',maxAge:30},
    {accessToken:'access',refreshToken:'refresh',maxAge:0},
    {accessToken:'access',refreshToken:'refresh',maxAge:Infinity},
    {accessToken:jwt({exp:1}),refreshToken:'refresh',maxAge:30},
  ]){
    const frontend=new NextResponse();assert.throws(()=>setSessionCookies(frontend,session,{secure:false}),/session cookie pair/);
    assert.equal(frontend.headers.get('set-cookie'),null);
  }
});
test('session expiry targets only the two Login-owned scopes',()=>{
  const frontend=new NextResponse();frontend.cookies.set('preference','keep');
  clearSessionCookies(frontend,{secure:true,domain:'.instance.example'});
  for(const [name,path] of [['accessToken','/'],['refreshToken','/api']]){
    const cookie=frontend.cookies.get(name);assert.equal(cookie.value,'');assert.equal(cookie.path,path);assert.equal(cookie.domain,'.instance.example');assert.equal(cookie.maxAge,0);assert.equal(cookie.expires.valueOf(),0);assert.equal(cookie.sameSite,'strict');
  }
  assert.equal(frontend.cookies.get('preference').value,'keep');
});
test('session token validation prevents cookie delimiters and control characters',()=>{
  for(const value of [undefined,'','space token','semicolon;token','comma,token','quote"token','slash\\token','é','line\ntoken'])assert.equal(validSessionToken(value),false);
  for(const value of ['opaque-token','jwt.part.signature','encoded%2Bvalue','value+plus'])assert.equal(validSessionToken(value),true);
});
