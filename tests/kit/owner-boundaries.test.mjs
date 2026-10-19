import test,{afterEach} from 'node:test';
import assert from 'node:assert/strict';
import { NextRequest } from 'next/server.js';
import { createSessionRefreshHandler,forgetUserSession,createSessionLogoutHandler,sessionLogoutUrl } from '../../dist/next.js';
const realFetch=globalThis.fetch;
afterEach(()=>{globalThis.fetch=realFetch;});
const config={userBffUrl:()=> 'https://user.example.test',cookieOptions:()=>({secure:true,domain:'.example.test'}),allowedOrigins:()=>['https://login.example.test','https://projects.example.test']};
const token=()=>`e30.${Buffer.from(JSON.stringify({exp:Math.floor(Date.now()/1000)+3600})).toString('base64url')}.signature`;
let sequence=0;
const request=(refresh,headers={})=>new NextRequest('https://login.example.test/api/auth/refresh',{method:'POST',headers:{origin:'https://login.example.test','sec-fetch-site':'same-origin','content-type':'application/json',...(refresh?{cookie:`refreshToken=${refresh}`} : {}),...headers},body:'{}'});
const receipt=(refresh,body={message:'Renewed'})=>{
  const headers=new Headers();headers.append('Set-Cookie',`accessToken=${token()}; HttpOnly; Max-Age=300`);headers.append('Set-Cookie',`refreshToken=${refresh}; HttpOnly`);
  return Response.json(body,{headers});
};

test('owner mutations reject untrusted browser context and form media before reading credentials',async()=>{
  let calls=0;globalThis.fetch=async()=>{calls++;throw new Error('unexpected network');};
  for(const factory of [createSessionRefreshHandler,createSessionLogoutHandler]){
    const handle=factory(config);
    for(const headers of [{origin:''},{origin:'https://evil.test'},{'sec-fetch-site':'cross-site'},{'sec-fetch-site':'none'},{'sec-fetch-site':''}]){
      const result=await handle(request('unread-token',headers));assert.equal(result.status,403);assert.equal(result.headers.get('set-cookie'),null);assert.equal(result.headers.get('cache-control'),'no-store');
    }
    for(const media of ['text/plain','application/x-www-form-urlencoded','multipart/form-data','application/jsonp'])assert.equal((await handle(request('unread-token',{'content-type':media}))).status,415);
  }
  assert.equal(calls,0);
});
test('renewal refuses absent credentials and unavailable shared configuration without an upstream call',async()=>{
  let calls=0;globalThis.fetch=async()=>{calls++;throw new Error('unexpected network');};
  assert.equal((await createSessionRefreshHandler(config)(request())).status,401);
  assert.equal((await createSessionRefreshHandler({...config,userBffUrl:()=>''})(request('present'))).status,503);
  assert.equal((await createSessionRefreshHandler({...config,cookieOptions:()=>({secure:true})})(request('present'))).status,503);
  assert.equal((await createSessionLogoutHandler({...config,userBffUrl:()=>''})(request('present'))).status,503);
  assert.equal(calls,0);
});
for(const status of [302,401,429,503])test(`owner renewal ${status} never creates cookies or caches a refusal`,async()=>{
  const refresh=`refused-${++sequence}`;let calls=0;
  globalThis.fetch=async()=>{calls++;return new Response(null,{status});};
  const handle=createSessionRefreshHandler(config);
  for(let attempt=0;attempt<2;attempt++){
    const result=await handle(request(refresh));assert.equal(result.status,status===302?502:status);assert.equal(result.headers.get('set-cookie'),null);
  }
  assert.equal(calls,2);
});
for(const [name,reply] of [
  ['unrotated refresh',refresh=>receipt(refresh)],
  ['missing session',()=>Response.json({message:'Renewed'})],
  ['missing message',()=>receipt('new',{})],
  ['invalid body',()=>new Response('not JSON')],
  ['dropped connection',()=>{throw new Error('private upstream detail');}],
])test(`owner renewal rejects ${name} without exposing credentials or upstream details`,async()=>{
  const refresh=`invalid-${++sequence}`;globalThis.fetch=async()=>reply(refresh);
  const result=await createSessionRefreshHandler(config)(request(refresh));assert.equal(result.status,502);assert.equal(result.headers.get('set-cookie'),null);assert.doesNotMatch(await result.text(),/private upstream|invalid-|new/);
});
test('the handover reuses a rotated pair only within its original lifetime',async t=>{
  const now=Date.UTC(2026,9,15,12);t.mock.timers.enable({apis:['Date'],now});
  const refresh=`handover-${++sequence}`;let calls=0;
  globalThis.fetch=async()=>{calls++;return receipt(`handover-next-${sequence}-${calls}`);};
  const handle=createSessionRefreshHandler(config);
  try{
    const first=await handle(request(refresh));assert.equal(first.status,200);assert.equal(first.cookies.get('accessToken').maxAge,300);
    t.mock.timers.setTime(now+10000);
    const handover=await handle(request(refresh));assert.equal(handover.status,200);assert.equal(handover.cookies.get('accessToken').maxAge,290);assert.equal(calls,1);
    t.mock.timers.setTime(now+31000);
    assert.equal((await handle(request(refresh))).status,200);assert.equal(calls,2);
  }finally{forgetUserSession(config.userBffUrl(),refresh);}
});
test('logout invalidation during a renewal prevents every waiting request from restoring cookies',async()=>{
  const refresh=`interrupted-${++sequence}`;let release;
  globalThis.fetch=()=>new Promise(resolve=>{release=resolve;});
  const handle=createSessionRefreshHandler(config),first=handle(request(refresh)),second=handle(request(refresh));
  await new Promise(resolve=>setImmediate(resolve));forgetUserSession(config.userBffUrl(),refresh);release(receipt('rotated-interrupted'));
  const results=await Promise.all([first,second]);assert.deepEqual(results.map(result=>result.status),[401,401]);
  for(const result of results)assert.equal(result.headers.get('set-cookie'),null);
});
const logoutBase='https://sso.example.test/realms/mairie/protocol/openid-connect/logout';
test('single sign-out URLs remain on the configured instance and only allow known redirect origins',()=>{
  const valid=logoutBase+'?client_id=mairie&post_logout_redirect_uri='+encodeURIComponent('https://projects.example.test/returned');
  assert.equal(sessionLogoutUrl(valid,'.example.test',config.allowedOrigins()),valid);
  for(const value of [undefined,42,'bad URL',logoutBase,logoutBase+'?client_id=x&unexpected=value',logoutBase+'?client_id=x&client_id=y',logoutBase+'?client_id=x#fragment',logoutBase.replace('https:','http:')+'?client_id=x',logoutBase.replace('sso.example.test','sso.evil.test')+'?client_id=x',logoutBase.replace('sso.example.test','user:secret@sso.example.test')+'?client_id=x',logoutBase.replace('/realms/mairie/protocol/openid-connect/logout','/unrelated')+'?client_id=x',logoutBase+'?client_id=x&post_logout_redirect_uri='+encodeURIComponent('https://evil.test/')])assert.equal(sessionLogoutUrl(value,'.example.test',config.allowedOrigins()),undefined);
  assert.equal(sessionLogoutUrl(valid,undefined,config.allowedOrigins()),undefined);
});
test('legacy and malformed logout receipts never claim server revocation',async()=>{
  const handle=createSessionLogoutHandler(config);
  const req=()=>request(undefined,{cookie:`accessToken=${token()}; refreshToken=logout-fixture`});
  for(const body of [null,{}, {message:'Revoked',session_revoked:'true'}, {message:'Revoked',session_revoked:true,logout_url:'https://evil.test/'}]){
    globalThis.fetch=async()=>Response.json(body);
    const result=await handle(req());assert.equal(result.status,502);assert.equal(result.headers.get('set-cookie'),null);
  }
  globalThis.fetch=async()=>Response.json({message:'Legacy expiry'});
  const result=await handle(req());assert.equal(result.status,200);assert.equal((await result.json()).session_revoked,false);assert.equal(result.cookies.get('refreshToken').maxAge,0);
});
