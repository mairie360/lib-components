import assert from 'node:assert/strict';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { inventory, scanSource, violations } from './check-ui-colors.mjs';

test('runtime UI has no fixed UI colours, including colours introduced in new files', () => {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const errors = violations(inventory(root));
  assert.equal(errors.length, 0, `Fixed UI colours: ${JSON.stringify(errors.slice(0, 5))}; total ${errors.length}`);
});
test('new literal, named palette utility and inline fallback cannot bypass the source guard', () => {
  const found = scanSource(`const style = 'bg-[#abcdef] hover:text-gray-500'; const fallback = 'var(--mairie-text, #000)';`, 'src/components/New.tsx');
  assert.equal(violations(found).length, 3);

});
test('semantic values and caller-supplied business colours remain unrestricted', () => {
  assert.deepEqual(scanSource(`const style = 'bg-[var(--mairie-surface)] text-[var(--mairie-text)]'; const status = { backgroundColor: status.color };`, 'src/components/Task.tsx'), []);
});
test('only the exact caller status palette and its default are business data, never an arbitrary UI exception', () => {
  const palette = `const statusColors = ["bg-green-500", "bg-blue-500", "bg-yellow-500", "bg-red-500", "bg-purple-500"]; const ItemContainer = ({statusColor = "bg-green-500"}) => { return <div className="bg-red-500"/>; };`;
  const found = scanSource(palette, 'src/components/ItemContainer.tsx');
  assert.equal(found.filter(item => item.kind === 'consumer-palette').length, 6);
  assert.equal(violations(found).length, 1);
  assert.equal(violations(scanSource(palette, 'src/components/Other.tsx')).length, 7);
  assert.ok(violations(scanSource(palette.replace('bg-yellow-500', 'bg-amber-500'), 'src/components/ItemContainer.tsx')).length > 1);
});
test('central theme definitions are allowed while literal declarations outside them remain visible', () => {
  const found = scanSource(':root { --mairie-text: #162033; } .legacy[class~="text-[#172033]"] { color: #172033; }', 'src/styles/municipal-theme.css');
  assert.equal(found.filter(item => item.kind === 'theme-definition').length, 1);
  assert.equal(violations(found).length, 1);
});

test('new opaque palette variables and component-local literal overrides are rejected', () => {
  const found = scanSource(':root { --color-abcdef: #abcdef; } .card { --mairie-text: #162033; }', 'src/styles/municipal-theme.css');
  assert.equal(violations(found).length, 2);
});

test('known token declarations in a new component stylesheet cannot masquerade as central definitions', () => {
  assert.equal(violations(scanSource(':root { --mairie-text: #162033; }', 'src/components/card.css')).length, 1);
  assert.equal(violations(scanSource('.card:root { --mairie-text: #162033; }', 'src/styles/municipal-theme.css')).length, 1);
});
test('CSS named colours in real declarations and TSX styles are rejected, while variant names remain data', () => {
  assert.equal(violations(scanSource('.card { color: rebeccapurple; background: red; }', 'src/components/card.css')).length, 2);
  assert.equal(violations(scanSource('const value = <div className="text-[rebeccapurple]" style={{backgroundColor: "red"}} />;', 'src/components/New.tsx')).length, 2);
  assert.equal(violations(scanSource('const variant = "red"; const custom = status.color;', 'src/components/New.tsx')).length, 0);
});

test('a second helper default in ItemContainer is UI, outside the exact component contract', () => {
  const source = 'const ItemContainer = ({statusColor = "bg-green-500"}) => null; function Helper({statusColor = "bg-green-500"}) {}';
  const found = scanSource(source, 'src/components/ItemContainer.tsx');
  assert.equal(found.filter(item => item.kind === 'consumer-palette').length, 1);
  assert.equal(violations(found).length, 1);
});
