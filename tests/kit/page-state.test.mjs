import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { readPageUrlState, pageStateUrl, urlChoice, urlText, urlPage, urlDate, parseFrontUrl, subscribePageReturn } from '../../dist/shared.js';
import { usePageUrlState } from '../../dist/react.js';

const schema = { view: urlChoice(['month', 'week']), q: urlText(5), page: urlPage, day: urlDate };

test('mair-690: page URL state keeps only accepted single values and falls back to defaults', () => {
  assert.deepEqual(readPageUrlState('?view=week&q=abc&page=3&day=2026-02-28', schema), { view: 'week', q: 'abc', page: '3', day: '2026-02-28' });
  assert.deepEqual(readPageUrlState('?view=year&q=toolong&page=0&day=2026-02-30', schema), { view: 'month', q: '', page: '1', day: '' });
  assert.equal(readPageUrlState('?view=week&view=month', schema).view, 'month');
  assert.equal(readPageUrlState('?q=a%00b', schema).q, '');
});

test('mair-690: pageStateUrl patches accepted keys, drops defaults and keeps foreign parameters and the hash', () => {
  assert.equal(pageStateUrl('https://x.test/p?event=7&view=week#top', { view: 'month', q: 'hi' }, schema), '/p?event=7&q=hi#top');
  assert.equal(pageStateUrl('https://x.test/p', { unknown: 'x', page: 'nope' }, schema), '/p');
});

test('mair-690: parseFrontUrl accepts only explicit http(s) destinations without credentials', () => {
  assert.equal(parseFrontUrl(' https://a.test/x ')?.href, 'https://a.test/x');
  for (const value of [undefined, '', '  ', 'javascript:alert(1)', 'ftp://a.test', 'https://u:p@a.test', 'not a url']) assert.equal(parseFrontUrl(value), undefined);
});

test('mair-690: subscribePageReturn is inert on the server and releases its listeners in a browser', async () => {
  assert.equal(typeof subscribePageReturn(() => undefined), 'function');
  const added = [], removed = [], calls = [];
  const target = () => ({ addEventListener: (n, f) => added.push([n, f]), removeEventListener: (n) => removed.push(n) });
  const win = { ...target() }, doc = { hidden: false, ...target() };
  Object.assign(globalThis, { window: win, document: doc });
  try {
    const stop = subscribePageReturn(() => calls.push(1));
    added.find(([n]) => n === 'focus')[1](); added.find(([n]) => n === 'visibilitychange')[1]();
    await Promise.resolve();
    assert.equal(calls.length, 1);
    stop(); assert.deepEqual(removed.sort(), ['focus', 'visibilitychange']);
    added.find(([n]) => n === 'focus')[1](); await Promise.resolve();
    assert.equal(calls.length, 1);
  } finally { delete globalThis.window; delete globalThis.document; }
});

test('mair-690: usePageUrlState renders its initial search on the server without a browser', () => {
  const Probe = () => { const { state, ready } = usePageUrlState(schema, '?view=week'); return createElement('output', null, `${state.view} ${ready}`); };
  assert.equal(renderToStaticMarkup(createElement(Probe)), '<output>week true</output>');
  const Plain = () => { const { state, ready } = usePageUrlState(schema); return createElement('output', null, `${state.view} ${ready}`); };
  assert.equal(renderToStaticMarkup(createElement(Plain)), '<output>month false</output>');
});
