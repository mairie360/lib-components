import test,{afterEach} from 'node:test';
import assert from 'node:assert/strict';
import { createSessionFetch,sessionFetch } from '../../dist/browser.js';
const realFetch=globalThis.fetch;
afterEach(()=>{globalThis.fetch=realFetch;});

test('the exported session fetch uses the current browser transport and preserves ordinary responses',async()=>{
  let calls=0;const expected=Response.json({ok:true});globalThis.fetch=async(url)=>{calls++;assert.equal(url,'/unchanged');return expected;};
  assert.equal(await sessionFetch('/unchanged'),expected);assert.equal(calls,1);
});
test('an owner-refused marker stops refresh replay while an ordinary business outage passes through',async()=>{
  for(const [status,headers] of [[401,{'X-Mairie360-Refresh-Refused':'true'}],[503,{}]]){
    let calls=0;const expected=new Response(null,{status,headers});
    const fetcher=createSessionFetch(async()=>{calls++;return expected;});
    assert.equal(await fetcher('/data'),expected);assert.equal(calls,1);
  }
});
for(const body of [null,{}, {message:42},{message:'   '}])test(`malformed renewal receipt ${JSON.stringify(body)} cannot replay a mutation`,async()=>{
  let businessCalls=0;
  const fetcher=createSessionFetch(async(url)=>{if(url==='/api/auth/refresh')return Response.json(body);businessCalls++;return new Response(null,{status:401});});
  const result=await fetcher('/data',{method:'POST',body:'{}'});assert.equal(result.status,502);assert.equal(businessCalls,1);
});
test('an aborted caller does not replay after a shared renewal but does not cancel another waiting caller',async()=>{
  const controller=new AbortController();let release;const held=new Promise(resolve=>{release=resolve;});let renewals=0;const calls=new Map();
  const fetcher=createSessionFetch(async(url)=>{
    if(url==='/api/auth/refresh'){renewals++;await held;return Response.json({message:'Renewed'});}
    calls.set(url,(calls.get(url)??0)+1);return new Response(null,{status:calls.get(url)===1?401:200});
  });
  const first=fetcher('/cancelled',{signal:controller.signal});const aborted=assert.rejects(first,error=>error.name==='AbortError');
  const second=fetcher('/active');await new Promise(resolve=>setImmediate(resolve));controller.abort();release();
  await aborted;assert.equal((await second).status,200);assert.equal(renewals,1);assert.equal(calls.get('/cancelled'),1);assert.equal(calls.get('/active'),2);
});
test('a network failure during renewal releases the flight for a later explicit retry',async()=>{
  let renewals=0,business=0;
  const fetcher=createSessionFetch(async(url)=>{
    if(url==='/api/auth/refresh'){renewals++;if(renewals===1)throw new Error('private connection detail');return Response.json({message:'Renewed'});}
    business++;return new Response(null,{status:business<=2?401:200});
  });
  const first=await fetcher('/data');assert.equal(first.status,503);assert.doesNotMatch(await first.text(),/private connection detail/);
  assert.equal((await fetcher('/data')).status,200);assert.equal(renewals,2);assert.equal(business,3);
});
