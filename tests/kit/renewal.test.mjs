import test from 'node:test';
import assert from 'node:assert/strict';
import { NextRequest } from 'next/server.js';
import { createSessionRefreshHandler, createSessionRefreshProxy, createSessionResumeHandler, createSessionLogoutHandler, forgetUserSession, proxyPublishedBffRequest } from '../../dist/next.js';
import { createSessionFetch } from '../../dist/browser.js';
const token='e30.'+Buffer.from(JSON.stringify({exp:Date.now()/1000+3600})).toString('base64url')+'.signature';
const config={userBffUrl:()=> 'https://user.example.test',cookieOptions:()=>({secure:true,domain:'.example.test'}),allowedOrigins:()=> ['https://login.example.test','https://projects.example.test']};
const peer={frontUrl:()=> 'https://projects.example.test',loginUrl:()=> 'https://login.example.test'};
test('a root API without the /api-scoped refresh cookie renews through its own API route',async()=>{
  const saved=globalThis.fetch;let access='expired',refreshes=0,businessCalls=0;
  globalThis.fetch=async(url,init)=>{
    if(new URL(String(url)).hostname==='login.example.test'){refreshes++;return reply('renewed-root');}
    businessCalls++;return new Headers(init.headers).get('authorization')===`Bearer ${token}`?Response.json({ok:true}):new Response(null,{status:401});
  };
  const browserFetch=async(path,init)=>{
    const api=path==='/api/auth/refresh';
    const req=new NextRequest('https://projects.example.test'+path,{...init,headers:{...init?.headers,cookie:`accessToken=${access}`+(api?'; refreshToken=retained':''),origin:'https://projects.example.test','sec-fetch-site':'same-origin'}});
    const response=api?await createSessionRefreshProxy(peer)(req):await proxyPublishedBffRequest(req,['data'],{...peer,baseUrl:()=> 'https://bff.example.test',paths:{'/data':{get:{}}}});
    if(api&&response.ok)access=response.cookies.get('accessToken').value;
    return response;
  };
  try{
    const response=await createSessionFetch(browserFetch)('/data');
    assert.equal(response.status,200);assert.equal(refreshes,1);assert.equal(businessCalls,2);
  }finally{globalThis.fetch=saved;}
});
let serial=0;
const cookies=()=>`refreshToken=test-refresh-${++serial}`;
const request=(cookie, url='https://login.example.test/api/auth/refresh',extra={})=>new NextRequest(url,{method:'POST',headers:{cookie,origin:new URL(url).origin,'sec-fetch-site':'same-origin','content-type':'application/json',...extra},body:'{}'});
function reply(refresh) {
  const response=Response.json({message:'Renewed'});
  response.headers.append('Set-Cookie',`accessToken=${token}; Path=/; HttpOnly; Max-Age=3600`);
  response.headers.append('Set-Cookie',`refreshToken=${refresh}; Path=/auth; HttpOnly`);
  return response;
}
test('owner deduplicates rotations from several fronts and invalidates handover at logout',async()=>{
  const saved=globalThis.fetch, cookie=cookies();let calls=0, release;
  const held=new Promise(resolve=>{release=resolve;});
  globalThis.fetch=async(url,init)=>{calls++; assert.equal(JSON.parse(init.body).refresh_token,cookie.split('=')[1]);await held;return reply('rotated-'+serial);};
  try{
    const handler=createSessionRefreshHandler(config);
    const first=handler(request(cookie));const second=handler(request(cookie));
    await new Promise(resolve=>setImmediate(resolve));assert.equal(calls,1);release();
    const responses=await Promise.all([first,second]);assert.deepEqual(responses.map(r=>r.status),[200,200]);
    assert.equal(responses[0].cookies.get('refreshToken').maxAge,2592000);
    forgetUserSession(config.userBffUrl(),cookie.split('=')[1]);
    globalThis.fetch=async()=>new Response(null,{status:401});
    assert.equal((await handler(request(cookie))).status,401);
  }finally{forgetUserSession(config.userBffUrl(),cookie.split('=')[1]);globalThis.fetch=saved;}
});
test('same-origin refresh and page resume relay only the HttpOnly refresh to Login',async()=>{
  const saved=globalThis.fetch, cookie=cookies();let calls=0;
  globalThis.fetch=async(url,init)=>{calls++;assert.equal(String(url),'https://login.example.test/api/auth/refresh');const headers=new Headers(init.headers);assert.equal(headers.get('cookie'),cookie);assert.equal(headers.get('authorization'),null);return reply('rotated-'+serial);};
  try{
    const post=await createSessionRefreshProxy(peer)(request(cookie,'https://projects.example.test/api/auth/refresh'));
    assert.equal(post.status,200);assert.equal(post.cookies.get('accessToken').value,token);
    const resumed=await createSessionResumeHandler(peer)(new NextRequest('https://projects.example.test/api/auth/resume?next=%2F%3Fview%3Dkanban',{headers:{cookie}}));
    assert.equal(resumed.status,303);assert.equal(resumed.headers.get('location'),'https://projects.example.test/?view=kanban');assert.equal(calls,2);
    assert.equal((await createSessionRefreshProxy(peer)(request(cookie,'https://projects.example.test/api/auth/refresh',{origin:'https://evil.test'}))).status,403);
  }finally{globalThis.fetch=saved;}
});
test('resume refusal redirects to Login with original document while outages stay recoverable',async()=>{
  const saved=globalThis.fetch;
  try{
    for(const status of [401,503]) {
      globalThis.fetch=async()=>new Response(null,{status});
      const response=await createSessionResumeHandler(peer)(new NextRequest('https://projects.example.test/api/auth/resume?next=%2F%3Fview%3Dkanban',{headers:{cookie:cookies()}}));
      if(status===401){assert.equal(response.status,303);const url=new URL(response.headers.get('location'));assert.equal(url.origin,'https://login.example.test');assert.equal(url.searchParams.get('redirect'),'https://projects.example.test/?view=kanban');}
      else {assert.equal(response.status,503);assert.equal(response.headers.get('location'),null);}
    }
    assert.equal((await createSessionResumeHandler(peer)(new NextRequest('https://projects.example.test/api/auth/resume?next=%2Fx%2F..%2Fapi%2Fauth%2Fresume'))).status,400);
  }finally{globalThis.fetch=saved;}
});
test('explicit logout sends server refresh token and clears cookies only on confirmed receipt',async()=>{
  const saved=globalThis.fetch, cookie=cookies();let calls=0;
  globalThis.fetch=async(url,init)=>{calls++;assert.equal(String(url),'https://user.example.test/auth/logout');assert.equal(JSON.parse(init.body).refresh_token,cookie.split('=')[1]);return Response.json({message:'Revoked',session_revoked:true});};
  try{
    const response=await createSessionLogoutHandler(config)(request(`accessToken=${token}; ${cookie}`,'https://login.example.test/api/auth/logout'));
    assert.equal(response.status,200);assert.equal((await response.json()).session_revoked,true);assert.equal(response.cookies.get('refreshToken').maxAge,0);assert.equal(calls,1);
    globalThis.fetch=async()=>new Response(null,{status:503});
    const refused=await createSessionLogoutHandler(config)(request(`accessToken=${token}; ${cookie}`,'https://login.example.test/api/auth/logout'));
    assert.equal(refused.status,503);assert.equal(refused.headers.get('set-cookie'),null);
  }finally{globalThis.fetch=saved;}
});
test('production peers fail before rotation when the shared cookie domain is missing',async()=>{
  const saved=globalThis.fetch, mode=process.env.NODE_ENV, domain=process.env.COOKIE_DOMAIN;let calls=0;
  process.env.NODE_ENV='production';delete process.env.COOKIE_DOMAIN;
  globalThis.fetch=async()=>{calls++;return reply('rotated-misconfigured');};
  try{
    const response=await createSessionRefreshProxy(peer)(request(cookies(),'https://projects.example.test/api/auth/refresh'));
    assert.equal(response.status,503);assert.equal(calls,0);assert.equal(response.headers.get('set-cookie'),null);
  }finally{globalThis.fetch=saved;if(mode===undefined)delete process.env.NODE_ENV;else process.env.NODE_ENV=mode;if(domain===undefined)delete process.env.COOKIE_DOMAIN;else process.env.COOKIE_DOMAIN=domain;}
});
test('a refused logout preserves the 30-day rotated refresh when its short access expires',async()=>{
  const saved=globalThis.fetch, clock=Date.now;let now=clock();const cookie=cookies();
  Date.now=()=>now;
  const short='e30.'+Buffer.from(JSON.stringify({exp:Math.floor(now/1000)+2})).toString('base64url')+'.signature';
  globalThis.fetch=async(url)=>{
    if(new URL(String(url)).pathname==='/auth/refresh') {
      const result=reply('rotated-short');result.headers.set('set-cookie',`accessToken=${short}; Max-Age=2; HttpOnly`);result.headers.append('set-cookie','refreshToken=rotated-short; HttpOnly');return result;
    }
    now+=10000;return new Response(null,{status:503});
  };
  try{
    const response=await createSessionLogoutHandler(config)(request(cookie,'https://login.example.test/api/auth/logout'));
    assert.equal(response.status,503);assert.equal(response.cookies.get('refreshToken').value,'rotated-short');assert.equal(response.cookies.get('refreshToken').maxAge,2592000);
  }finally{globalThis.fetch=saved;Date.now=clock;forgetUserSession(config.userBffUrl(),cookie.split('=')[1]);}
});
