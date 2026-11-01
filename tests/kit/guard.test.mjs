import test from 'node:test';
import assert from 'node:assert/strict';
import { NextRequest } from 'next/server.js';
import { createAuthGuard } from '../../dist/guard.js';
const guard=createAuthGuard({frontUrl:()=> 'https://projects.example.test',loginUrl:()=> 'https://login.example.test',paths:{'/projects-page':{get:{}}}});
test('missing and opaque credentials return data 401 and documents to local resume',()=>{
  for(const cookie of ['', 'accessToken=opaque']) {
    const document=guard(new NextRequest('https://projects.example.test/?view=board',{headers:{cookie}}));
    const target=new URL(document.headers.get('location')); assert.equal(target.origin,'https://projects.example.test');
    assert.equal(target.pathname,'/api/auth/resume'); assert.equal(target.searchParams.get('next'),'/?view=board');
    const data=guard(new NextRequest('https://projects.example.test/projects-page',{headers:{cookie}}));
    assert.equal(data.status,401); assert.equal(data.headers.get('location'),null);
  }
});
test('valid expiring JWT passes with a fresh CSP; the BFF still authorizes the data',()=>{
  const token='e30.'+Buffer.from(JSON.stringify({exp:Date.now()/1000+60})).toString('base64url')+'.signature';
  const result=guard(new NextRequest('https://projects.example.test/',{headers:{cookie:'accessToken='+token}}));
  assert.equal(result.headers.get('x-middleware-next'),'1'); assert.match(result.headers.get('content-security-policy'),/nonce-/);
});
test('an invalid configured profile URL fails closed rather than throwing from the guard',()=>{
  const token='e30.'+Buffer.from(JSON.stringify({exp:Date.now()/1000+60})).toString('base64url')+'.signature';
  const broken=createAuthGuard({frontUrl:()=> 'https://projects.example.test',loginUrl:()=> 'https://login.example.test',paths:{},profileUrl:()=>new URL('/?tab=profile','not-a-url').href});
  const result=broken(new NextRequest('https://projects.example.test/profile',{headers:{cookie:'accessToken='+token}}));
  assert.equal(result.status,503);assert.equal(result.headers.get('cache-control'),'no-store');
});
test('legacy profile redirects preserve the configured Settings path and query',()=>{
  const token='e30.'+Buffer.from(JSON.stringify({exp:Date.now()/1000+60})).toString('base64url')+'.signature';
  const profile=createAuthGuard({frontUrl:()=> 'https://projects.example.test',loginUrl:()=> 'https://login.example.test',paths:{},profileUrl:()=> 'https://settings.example.test/account/?tab=profile'});
  const result=profile(new NextRequest('https://projects.example.test/profile',{headers:{cookie:'accessToken='+token}}));
  assert.equal(result.status,307);assert.equal(result.headers.get('location'),'https://settings.example.test/account/?tab=profile');
});
