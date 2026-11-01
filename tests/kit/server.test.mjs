import test from 'node:test';
import assert from 'node:assert/strict';
import { NextRequest, NextResponse } from 'next/server.js';
import { setSessionCookies, createSessionResumeHandler, proxyPublishedBffRequest } from '../../dist/next.js';
const token='e30.'+Buffer.from(JSON.stringify({exp:Date.now()/1000+3600})).toString('base64url')+'.signature';
const config={frontUrl:()=> 'https://projects.example.test', loginUrl:()=> 'https://login.example.test'};
test('refresh cookie persists 30 days and stays restricted to /api and HttpOnly',()=>{
  const response=new NextResponse(); setSessionCookies(response,{accessToken:token,refreshToken:'refresh',maxAge:3600},{secure:true,domain:'.example.test'});
  const cookie=response.cookies.get('refreshToken'); assert.equal(cookie.maxAge,30*86400); assert.equal(cookie.path,'/api');assert.equal(cookie.httpOnly,true);assert.equal(cookie.sameSite,'strict');
});
test('resume rejects external destinations before calling the owner',async()=>{
  const response=await createSessionResumeHandler(config)(new NextRequest('https://projects.example.test/api/auth/resume?next=https://evil.test/'));
  assert.equal(response.status,400);
});
test('proxy strips browser credentials/headers, bounds bodies, and filters upstream cookies',async()=>{
  const saved=globalThis.fetch; let observed;
  globalThis.fetch=async(url,init)=>{ observed=init; return Response.json({ok:true},{headers:{'set-cookie':'refreshToken=hostile','x-internal-secret':'private','x-request-id':'receipt'}});};
  try {
    const request=new NextRequest('https://projects.example.test/data',{method:'POST',headers:{cookie:'accessToken='+token,authorization:'Bearer attacker','x-internal-admin':'true','content-type':'application/json',origin:'https://projects.example.test','sec-fetch-site':'same-origin'},body:'{}'});
    const response=await proxyPublishedBffRequest(request,['data'],{...config,baseUrl:()=> 'https://bff.example.test',paths:{'/data':{post:{}}}});
    assert.equal(observed.headers.get('authorization'),'Bearer '+token);assert.equal(observed.headers.get('x-internal-admin'),null);
    assert.equal(response.headers.get('set-cookie'),null); assert.equal(response.headers.get('x-internal-secret'),null);assert.equal(response.headers.get('x-request-id'),'receipt');
    const huge=new NextRequest('https://projects.example.test/data',{method:'POST',body:'x'.repeat(1024*1024+1)});
    assert.equal((await proxyPublishedBffRequest(huge,['data'],{...config,baseUrl:()=> 'https://bff.example.test',paths:{'/data':{post:{}}}})).status,413);
  } finally {globalThis.fetch=saved;}
});
