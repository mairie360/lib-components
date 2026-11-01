import test from 'node:test';
import assert from 'node:assert/strict';
import { createSessionFetch } from '../../dist/browser.js';

test('opaque redirects are returned without inspecting inaccessible status or headers', async () => {
  const response = {
    type: 'opaqueredirect',
    get status() { throw new Error('opaque status must not be read'); },
    get headers() { throw new Error('opaque headers must not be read'); },
  };
  let calls = 0;
  const sessionFetch = createSessionFetch(async () => { calls++; return response; });
  assert.equal(await sessionFetch('/projects-page'), response);
  assert.equal(calls, 1);
});

test('simultaneous API refusals share one refresh and replay only once', async () => {
  let refreshes=0, calls=0, release;
  const held=new Promise(resolve=>{release=resolve;});
  const fetcher=async(url,init)=>{
    if(url==='/api/auth/refresh') {refreshes++; await held; return Response.json({message:'Session renewed'});}
    calls++; return calls<=2 ? new Response(null,{status:401}) : Response.json({ok:true});
  };
  const sessionFetch=createSessionFetch(fetcher);
  const first=sessionFetch('/projects-page'); const second=sessionFetch('/conversations');
  await new Promise(resolve=>setImmediate(resolve)); release();
  assert.deepEqual((await Promise.all([first,second])).map(r=>r.status),[200,200]);
  assert.equal(refreshes,1); assert.equal(calls,4);
});

test('refused or unavailable renewal is returned without replay or infinite retry', async () => {
  for (const status of [401,503]) {
    let calls=0;
    const sessionFetch=createSessionFetch(async(url)=>{calls++;return new Response(null,{status:url==='/api/auth/refresh'?status:401});});
    assert.equal((await sessionFetch('/data')).status,status); assert.equal(calls,2);
  }
});

test('a Request body can be consumed once before renewal and replayed intact', async () => {
  const bodies = [];
  const sessionFetch = createSessionFetch(async (input, init) => {
    if (input === '/api/auth/refresh') return Response.json({ message: 'Session renewed' });
    const request = new Request(input, init);
    bodies.push(await request.text());
    return new Response(null, { status: bodies.length === 1 ? 401 : 200 });
  });
  const request = new Request('https://projects.example.test/tasks', { method: 'POST', body: '{"title":"Réunion"}' });
  assert.equal((await sessionFetch(request)).status, 200);
  assert.deepEqual(bodies, ['{"title":"Réunion"}', '{"title":"Réunion"}']);
});

test('a late 401 from an older request reuses the completed renewal without rotating again', async () => {
  let refreshes = 0, releaseLate;
  const lateResponse = new Promise(resolve => { releaseLate = resolve; });
  const counts = new Map();
  const sessionFetch = createSessionFetch(async input => {
    if (input === '/api/auth/refresh') { refreshes++; return Response.json({ message: 'Session renewed' }); }
    const count = (counts.get(input) ?? 0) + 1;
    counts.set(input, count);
    if (input === '/late' && count === 1) await lateResponse;
    return new Response(null, { status: count === 1 ? 401 : 200 });
  });
  const first = sessionFetch('/first');
  const late = sessionFetch('/late');
  assert.equal((await first).status, 200);
  releaseLate();
  assert.equal((await late).status, 200);
  assert.equal(refreshes, 1);
  assert.deepEqual([...counts.values()], [2, 2]);
  // A genuinely later request may require another renewal; this is not a timed cache.
  assert.equal((await sessionFetch('/later')).status, 200);
  assert.equal(refreshes, 2);
});
