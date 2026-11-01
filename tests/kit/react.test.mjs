import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { InstanceProvider, useInstanceRole, useInstanceTimeZone } from '../../dist/react.js';

// MAIR-126: 0.10.0 published a react entry calling `React.createElement` without importing React, so every
// front rendering InstanceProvider failed with "React is not defined". Render the built entry, ESM and CJS.
function Probe() { return createElement('output', null, `${useInstanceRole()} ${useInstanceTimeZone()}`); }

test('MAIR-126: the published InstanceProvider renders and provides the instance role and time zone', () => {
  const html = renderToStaticMarkup(createElement(InstanceProvider, { role: 'Admin', timeZone: 'Europe/Paris' }, createElement(Probe)));
  assert.equal(html, '<output>Admin Europe/Paris</output>');
});

test('MAIR-126: the react entry uses the automatic JSX runtime in both formats', async () => {
  for (const file of ['react.js', 'react.cjs']) {
    const source = readFileSync(new URL(`../../dist/${file}`, import.meta.url), 'utf8');
    assert.match(source, /react\/jsx-runtime/, file);
    assert.doesNotMatch(source, /\bReact\.createElement\b/, file);
  }
  const { createRequire } = await import('node:module');
  const cjs = createRequire(import.meta.url)('../../dist/react.cjs');
  assert.equal(renderToStaticMarkup(createElement(cjs.InstanceProvider, { role: 'User', timeZone: 'UTC' }, 'ok')), 'ok');
});

// MAIR-126 (#456): 0.10.1 inlined kit/shared and kit/theme into dist/react.*, so InstanceProvider set the
// time zone of its own copy and every front formatted municipal dates in UTC.
test('MAIR-126: InstanceProvider sets the instance time zone the published shared entry reads', async () => {
  const shared = await import('../../dist/shared.js');
  globalThis.window = {};
  try {
    shared.setInstanceTimeZone('UTC');
    renderToStaticMarkup(createElement(InstanceProvider, { role: 'User', timeZone: 'Indian/Reunion' }, 'ok'));
    assert.equal(shared.getInstanceTimeZone(), 'Indian/Reunion');
    assert.equal(shared.civilDateInZone(new Date('2026-10-15T20:00:00Z')), '2026-10-16');
  } finally {
    shared.setInstanceTimeZone('UTC');
    delete globalThis.window;
  }
});

test('MAIR-126: the react entry imports the published shared and theme entries instead of a copy', () => {
  for (const file of ['react.js', 'react.cjs']) {
    const source = readFileSync(new URL(`../../dist/${file}`, import.meta.url), 'utf8');
    assert.match(source, /["']@mairie360\/lib-components\/shared["']/, file);
    assert.match(source, /["']@mairie360\/lib-components\/theme["']/, file);
    assert.doesNotMatch(source, /browserTimeZone|configuredCookieDomain/, `${file} holds no shared or theme state`);
  }
});
