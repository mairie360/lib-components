import test,{afterEach} from 'node:test';
import assert from 'node:assert/strict';
import { NextRequest } from 'next/server.js';
import { proxyPublishedBffRequest,createSessionLogoutProxy,createSessionRefreshProxy } from '../../dist/next.js';
const realFetch=globalThis.fetch;const mode=process.env.NODE_ENV;
afterEach(()=>{globalThis.fetch=realFetch;mode===undefined?delete process.env.NODE_ENV:process.env.NODE_ENV=mode;});
const config={frontUrl:()=> 'https://projects.example.test',loginUrl:()=> 'https://login.example.test',baseUrl:()=> 'https://bff.example.test',paths:{'/data':{get:{},post:{}},'/items/{id}':{get:{}}}};
const request=(path='/data',method='GET',headers={},body)=>new NextRequest('https://projects.example.test'+path,{method,headers:{origin:'https://projects.example.test','sec-fetch-site':'same-origin',...headers},...(body===undefined?{}:{body})});

test('proxy path, method and origin refusals never contact a BFF',async()=>{
  let calls=0;globalThis.fetch=async()=>{calls++;throw new Error('unexpected network');};
  for(const path of [['openapi.json'],['swagger.json'],['unknown']])assert.equal((await proxyPublishedBffRequest(request(),path,config)).status,404);
  for(const path of [['..'],['items','a/b'],['items','a\\b'],['items','a\u0000b'],['']])assert.equal((await proxyPublishedBffRequest(request(),path,config)).status,400);
  const disallowed=await proxyPublishedBffRequest(request('/data','DELETE'),['data'],config);assert.equal(disallowed.status,405);assert.equal(disallowed.headers.get('allow'),'GET, POST, HEAD');
  for(const headers of [{origin:'https://evil.test'},{'sec-fetch-site':'cross-site'},{'sec-fetch-site':'same-site'}])assert.equal((await proxyPublishedBffRequest(request('/data','POST',headers,'{}'),['data'],config)).status,403);
  assert.equal((await proxyPublishedBffRequest(request(),['data'],{...config,baseUrl:()=>''})).status,503);assert.equal(calls,0);
});
test('published parameter paths encode identifiers and preserve query bytes without browser bearer authority',async()=>{
  let seen;globalThis.fetch=async(url,init)=>{seen={url:String(url),init};return Response.json({id:'a?b'},{headers:{ETag:'fixture-etag','X-Internal-Secret':'hidden'}});};
  const result=await proxyPublishedBffRequest(request('/items/a%3Fb?filter=a%26b','GET',{authorization:'Bearer untrusted','accept-language':'fr','x-forwarded-for':'spoofed'}),['items','a?b'],config);
  assert.equal(result.status,200);assert.equal(seen.url,'https://bff.example.test/items/a%3Fb?filter=a%26b');
  assert.equal(seen.init.headers.get('authorization'),null);assert.equal(seen.init.headers.get('x-forwarded-for'),null);assert.equal(seen.init.headers.get('accept-language'),'fr');
  assert.equal(result.headers.get('etag'),'fixture-etag');assert.equal(result.headers.get('x-internal-secret'),null);
});
test('proxy body limits apply before buffering oversized declared lengths or forwarding invalid streams',async()=>{
  let calls=0;globalThis.fetch=async()=>{calls++;return Response.json({ok:true});};
  const limited={...config,maxBodyBytes:4};
  assert.equal((await proxyPublishedBffRequest(request('/data','POST',{'content-length':'5'},'12345'),['data'],limited)).status,413);
  assert.equal((await proxyPublishedBffRequest(request('/data','POST',{},'12345'),['data'],limited)).status,413);
  const invalid=request('/data','POST',{},'unreadable');Object.defineProperty(invalid,'body',{value:new ReadableStream({start(controller){controller.error(new Error('private stream detail'));}})});
  const result=await proxyPublishedBffRequest(invalid,['data'],limited);assert.equal(result.status,400);assert.doesNotMatch(await result.text(),/private stream detail/);assert.equal(calls,0);
});
test('proxy forwards bounded body bytes and only explicitly trusted IP headers',async()=>{
  let seen;globalThis.fetch=async(_url,init)=>{seen=init;return new Response(null,{status:204});};
  const result=await proxyPublishedBffRequest(request('/data','POST',{'content-type':'application/json','x-real-ip':'spoofed'},'{}'),['data'],{...config,trustedHeaders:()=>({'X-Real-IP':'192.0.2.7'})});
  assert.equal(result.status,204);assert.equal(await result.text(),'');assert.equal(new TextDecoder().decode(seen.body),'{}');assert.equal(seen.headers.get('x-real-ip'),'192.0.2.7');
  const head=await proxyPublishedBffRequest(request('/data','HEAD'),['data'],config);assert.equal(await head.text(),'');
});
test('upstream HTTP errors retain safe payloads and transport errors become controlled failures',async()=>{
  globalThis.fetch=async()=>Response.json({error:{message:'Business refusal'}},{status:503,headers:{'Retry-After':'3','Set-Cookie':'accessToken=hostile'}});
  const http=await proxyPublishedBffRequest(request(),['data'],config);assert.equal(http.status,503);assert.deepEqual(await http.json(),{error:{message:'Business refusal'}});assert.equal(http.headers.get('retry-after'),'3');assert.equal(http.headers.get('set-cookie'),null);
  globalThis.fetch=async()=>{throw new Error('private socket detail');};
  const offline=await proxyPublishedBffRequest(request(),['data'],config);assert.equal(offline.status,502);assert.doesNotMatch(await offline.text(),/private socket detail/);
});
test('logout peers relay only known cookie credentials to the owner and preserve its cookie cleanup',async()=>{
  let seen;globalThis.fetch=async(url,init)=>{seen={url:String(url),init};return Response.json({message:'Closed',session_revoked:true},{headers:{'Set-Cookie':'refreshToken=; Path=/api; Max-Age=0; HttpOnly','Content-Length':'999'}});};
  const result=await createSessionLogoutProxy(config)(request('/api/auth/logout','POST',{'content-type':'application/json',cookie:'accessToken=access-fixture; refreshToken=refresh-fixture; unrelated=secret',authorization:'Bearer untrusted'},'{}'));
  assert.equal(seen.url,'https://login.example.test/api/auth/logout');const headers=new Headers(seen.init.headers);
  assert.equal(headers.get('cookie'),'accessToken=access-fixture; refreshToken=refresh-fixture');assert.equal(headers.get('authorization'),null);assert.equal(headers.get('origin'),'https://projects.example.test');
  assert.equal(result.status,200);assert.equal(result.headers.get('content-length'),null);assert.match(result.headers.get('set-cookie'),/Max-Age=0/);assert.equal(result.headers.get('cache-control'),'no-store');
});
test('logout peer rejects foreign mutations, absent configuration and insecure production owners',async()=>{
  let calls=0;globalThis.fetch=async()=>{calls++;throw new Error('unexpected call');};
  const req=headers=>request('/api/auth/logout','POST',{'content-type':'application/json',...headers},'{}');
  assert.equal((await createSessionLogoutProxy(config)(req({origin:'https://evil.test'}))).status,403);
  assert.equal((await createSessionLogoutProxy({...config,loginUrl:()=>''})(req({}))).status,503);
  process.env.NODE_ENV='production';assert.equal((await createSessionLogoutProxy({...config,loginUrl:()=> 'http://login.example.test'})(req({}))).status,503);assert.equal(calls,0);
});
test('logout peer transport failure cannot expire cookies or expose the upstream exception',async()=>{
  globalThis.fetch=async()=>{throw new Error('private owner detail');};
  const result=await createSessionLogoutProxy(config)(request('/api/auth/logout','POST',{'content-type':'application/json'},'{}'));
  assert.equal(result.status,502);assert.equal(result.headers.get('set-cookie'),null);assert.doesNotMatch(await result.text(),/private owner detail/);
});
test('refresh peer rejects missing credentials, invalid receipts and unavailable owners without a partial session',async()=>{
  const handle=createSessionRefreshProxy(config);let calls=0;
  globalThis.fetch=async()=>{calls++;return Response.json({message:'Renewed'});};
  const req=()=>request('/api/auth/refresh','POST',{'content-type':'application/json',cookie:'refreshToken=fixture'},'{}');
  assert.equal((await handle(request('/api/auth/refresh','POST',{'content-type':'application/json'},'{}'))).status,401);assert.equal(calls,0);
  const invalid=await handle(req());assert.equal(invalid.status,502);assert.equal(invalid.headers.get('set-cookie'),null);
  globalThis.fetch=async()=>{throw new Error('private owner detail');};const offline=await handle(req());assert.equal(offline.status,503);assert.equal(offline.headers.get('set-cookie'),null);
});
