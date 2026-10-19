'use strict';

// Exercise the modules resolved by their real registry consumers. Every hostile
// input runs in a bounded child: a regression must fail the check, never hang CI.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createRequire } = require('node:module');
const { spawnSync } = require('node:child_process');
const { test } = require('node:test');

const root = path.resolve(__dirname, '..');
const vendorOnly = process.argv.includes('--vendor');
const stock = process.argv.includes('--stock');
console.log(`Tooling regression runtime: ${process.version}`);
const micromatchRequire = createRequire(require.resolve('micromatch'));
const argparseRequire = createRequire(require.resolve('argparse'));
const bracesPath = vendorOnly ? path.join(root, 'vendor/braces/index.js') : micromatchRequire.resolve('braces');
const sprintfPath = vendorOnly ? path.join(root, 'vendor/sprintf-js/src/sprintf.js') : argparseRequire.resolve('sprintf-js');

function probe(body, { async = false } = {}) {
  const source = `const assert = require('node:assert/strict');
    const braces = require(${JSON.stringify(bracesPath)});
    const { sprintf, vsprintf } = require(${JSON.stringify(sprintfPath)});
    ${async ? 'setImmediate(() => {' : ''}
    ${body}
    console.log('tooling probe passed');
    ${async ? '});' : ''}`;
  const child = spawnSync(process.execPath, ['--stack-size=512', '--max-old-space-size=128', '-e', source], {
    cwd: root, encoding: 'utf8', timeout: 3000, maxBuffer: 64 * 1024,
  });
  assert.equal(child.error, undefined, `Probe did not terminate: ${child.error?.message}`);
  assert.equal(child.signal, null, `Probe killed by ${child.signal}`);
  assert.equal(child.status, 0, child.stderr);
  assert.equal(child.stdout.trim(), 'tooling probe passed');
}

if (!stock && !vendorOnly) {
  test('registry consumers resolve the tracked, corrected local forks', () => {
    for (const [actual, relative, name] of [
      [bracesPath, 'vendor/braces/index.js', '@mairie360/braces-tooling-patch'],
      [sprintfPath, 'vendor/sprintf-js/src/sprintf.js', '@mairie360/sprintf-tooling-patch'],
    ]) {
      assert.equal(fs.realpathSync(actual), fs.realpathSync(path.join(root, relative)));
      const metadata = JSON.parse(fs.readFileSync(path.join(root, relative.split('/').slice(0, 2).join('/'), 'package.json')));
      assert.equal(metadata.name, name);
    }
  });
}

for (const operation of ['parse', 'compile', 'expand', 'stringify']) {
  test(`${operation} rejects excessive brace, parenthesis and mixed nesting before stack exhaustion`, () => probe(`
    for (const [left, right] of [['{', '}'], ['(', ')'], ['{(', ')}']]) {
      for (const close of [true, false]) {
        const deep = left.repeat(2000) + 'x' + (close ? right.repeat(2000) : '');
        assert.throws(() => braces[${JSON.stringify(operation)}](deep), {name:'SyntaxError', code:'ERR_BRACES_COMPLEXITY'});
      }
    }
  `));
}

for (const operation of ['compile', 'expand', 'stringify']) {
  test(`${operation} rejects deep supplied ASTs and child cycles predictably`, () => probe(`
    let ast = {type:'text', value:'x'};
    for (let i=0;i<12000;i++) ast = {type:'root', nodes:[ast]};
    assert.throws(() => braces[${JSON.stringify(operation)}](ast), {name:'SyntaxError', code:'ERR_BRACES_COMPLEXITY'});
    const cycle = {type:'root', nodes:[]}; cycle.nodes.push(cycle);
    assert.throws(() => braces[${JSON.stringify(operation)}](cycle), {name:'SyntaxError', code:'ERR_BRACES_COMPLEXITY'});
  `));
}

test('AST preflight bounds repeated shared-subtree visits', () => probe(`
  let ast = {type:'text', value:'x'};
  for (let i=0;i<28;i++) ast = {type:'root', nodes:[ast,ast]};
  for (const op of ['compile','expand','stringify']) {
    assert.throws(() => braces[op](ast), {name:'SyntaxError', code:'ERR_BRACES_COMPLEXITY'});
  }
`));

test('parent cycles and foreign parent queues cannot redirect AST expansion', () => probe(`
  for (const parentKind of ['self','cycle','foreign']) {
    const leaf = {type:'text', value:'x'};
    const paren = {type:'paren', nodes:[leaf]};
    const root = {type:'root', nodes:[paren]};
    const foreign = {type:'paren',nodes:[],queue:['foreign']};
    if (parentKind === 'self') paren.parent = paren;
    if (parentKind === 'cycle') {paren.parent=foreign; foreign.parent=paren;}
    if (parentKind === 'foreign') { foreign.type='root'; paren.parent=foreign; }
    assert.deepEqual(braces.expand(root), ['x']);
    assert.deepEqual(foreign.queue, ['foreign']);
  }
`));

test('parser and walkers agree at the supported nesting boundary', () => probe(`
  for (const [left,right] of [['{','}'],['(',')']]) {
    const input=left.repeat(128)+'x'+right.repeat(128);
    assert.equal(braces.compile(input), input);
    assert.equal(braces.stringify(input), input);
    assert.deepEqual(braces.expand(input), [input]);
    assert.throws(() => braces.parse(left.repeat(129)+'x'+right.repeat(129)), {code:'ERR_BRACES_COMPLEXITY'});
  }
`));

test('ordinary ranges, escaping, quotes, classes and shared leaves keep their behavior', () => probe(`
  assert.deepEqual(braces.expand('a/{1..3}/{x,y}'), ['a/1/x','a/1/y','a/2/x','a/2/y','a/3/x','a/3/y']);
  assert.equal(braces.compile('a/{b,c}/d'), 'a/(b|c)/d');
  assert.deepEqual(braces(['{a,b}','{c,d}'], {expand:true}), ['a','b','c','d']);
  assert.equal(braces.compile('a/{1..3}'), 'a/([1-3])');
  const literal='('.repeat(256);
  assert.equal(braces.stringify('"'+literal+'"'), literal);
  assert.equal(braces.stringify('['+literal+']'), '['+literal+']');
  assert.equal(braces.stringify('\\\\('.repeat(256)), literal);
  assert.equal(braces.stringify('\\\\{a,b\\\\}', {keepEscaping:true}), '\\\\{a,b\\\\}');
  const leaf={type:'text',value:'a'};
  assert.equal(braces.stringify({type:'root',nodes:[leaf,leaf]}), 'aa');
  assert.throws(() => braces.expand('{1..10000}'), RangeError);
`));

for (const specifier of ['e','f','g']) {
  test(`numeric %${specifier} precision cannot terminate an asynchronous worker`, () => probe(`
    for (const precision of ['101','9'.repeat(10000)]) {
      const result=sprintf('%.'+precision+${JSON.stringify(specifier)},1.25);
      assert.equal(typeof result,'string');
      assert.ok(result.length <= 106);
      assert.equal(result,sprintf('%.100'+${JSON.stringify(specifier)},1.25));
    }
  `, {async:true}));
}

test('zero precision has valid numeric behavior and nonnumeric precision is unchanged', () => probe(`
  assert.equal(sprintf('%.0g',1.25),'1');
  assert.equal(sprintf('%.0e',1.25),'1e+0');
  assert.equal(sprintf('%.0f',1.25),'1');
  assert.equal(sprintf('%.0s','text'),'');
  assert.equal(sprintf('%.101s','x'.repeat(110)).length,101);
  assert.equal(sprintf('%.100f',1),'1.'+'0'.repeat(100));
  assert.equal(sprintf('%.2f',1.25),'1.25');
`, {async:true}));

test('sprintf positional/named formatting and public parse/format/cache APIs remain usable', () => probe(`
  assert.equal(sprintf('%(prog)s ready',{prog:'Town'}),'Town ready');
  assert.equal(vsprintf('%s %02d',['Town',3]),'Town 03');
  assert.equal(sprintf('%2$s %1$d',3,'Town'),'Town 3');
  assert.equal(sprintf('%+05.2f',1.25),'+1.25');
  assert.equal(sprintf.format(sprintf.parse('%.101f'), ['%.101f',1]).length,102);
  assert.equal(typeof sprintf.cache, 'object');
`));

if (!vendorOnly) {
  test('micromatch and argparse exercise the corrected transitive modules', () => {
    const micromatch = require('micromatch');
    const { ArgumentParser } = require('argparse');
    assert.deepEqual(micromatch.braceExpand('a/{b,c}'), ['a/b','a/c']);
    assert.throws(() => micromatch.braces('{'.repeat(2000)+'x'+'}'.repeat(2000)), {code:'ERR_BRACES_COMPLEXITY'});
    const parser = new ArgumentParser({prog:'municipal-tool', addHelp:false, description:'%(prog)s ready'});
    assert.match(parser.formatHelp(), /municipal-tool ready/);
  });
}
