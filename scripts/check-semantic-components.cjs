// Render the real components, compile their real utility classes, and inspect
// solid colour pairs. This is a targeted CSS regression probe, not a browser
// cascade, screen-reader, or whole-application accessibility certification.
const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const ts = require('typescript');
const { JSDOM } = require('jsdom');
const postcss = require('postcss');
const { transform, Features } = require('lightningcss');
const root = path.resolve(__dirname, '..');
const dom = new JSDOM('<html><head></head><body class="mairie-ui"></body></html>', { url: 'http://localhost' });
for (const name of ['window', 'document', 'HTMLElement', 'Element', 'Node', 'MutationObserver']) global[name] = dom.window[name];
Object.defineProperty(global, 'navigator', { value: dom.window.navigator, configurable: true });
global.IS_REACT_ACT_ENVIRONMENT = true;
for (const extension of ['.tsx', '.ts']) require.extensions[extension] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true, target: ts.ScriptTarget.ES2022 } }).outputText, filename);
const React = require('react');
const { render, fireEvent, cleanup, within } = require('@testing-library/react');
const { Item } = require('../src/components/Item.tsx');
const { MiniCard } = require('../src/components/MiniCard.tsx');
const { ItemContainer } = require('../src/components/ItemContainer.tsx');
const { ElearningCourseRating } = require('../src/components/ElearningCourseRating.tsx');
const municipal = fs.readFileSync(path.join(root, 'src/styles/municipal-theme.css'), 'utf8');
const source = fs.readFileSync(path.join(root, 'src/app/globals.css'), 'utf8');
const tokensFor = theme => {
  const tokens = {};
  postcss.parse(municipal).walkRules(rule => {
    if (rule.selector === ':root' || rule.selector === `html[data-theme="${theme}"]`) rule.walkDecls(decl => { if (decl.prop.startsWith('--mairie-')) tokens[decl.prop] = decl.value; });
  });
  const resolve = value => { for (let i = 0; i < 10 && /var\(/.test(value); ++i) value = value.replace(/var\((--mairie-[\w-]+)\)/g, (match, name) => tokens[name] ?? match); return value; };
  return resolve;
};
async function applyStyles(theme) {
  const { compile } = require('tailwindcss');
  const classes = [...document.querySelectorAll('[class]')].flatMap(element => [...element.classList]);
  const compiled = (await compile(`${source}\n${municipal}`, { base: path.join(root, 'src/app'), loadStylesheet: async (id, base) => { const filename = id === 'tailwindcss' ? require.resolve('tailwindcss/index.css') : id.startsWith('.') || id.startsWith('/') ? path.resolve(base, id) : require.resolve(id); return { path: filename, base: path.dirname(filename), content: fs.readFileSync(filename, 'utf8') }; }, loadModule: async id => ({ path: require.resolve(id), base: root, module: (await import(pathToFileURL(require.resolve(id)).href)).default }) })).build(classes);
  const parsed = postcss.parse(transform({ filename: 'semantic-components.css', code: Buffer.from(compiled), include: Features.Nesting }).code.toString());
  parsed.walkAtRules('layer', rule => rule.replaceWith(...(rule.nodes ?? [])));
  parsed.walkRules(rule => { rule.selector = rule.selector.replaceAll('html:has(body.mairie-ui)', 'html[data-qa-municipal="true"]'); const selectors = rule.selectors.filter(selector => !selector.includes('.theme-controller')); if (selectors.length) rule.selectors = selectors; else rule.remove(); });
  document.documentElement.dataset.theme = theme;
  document.documentElement.dataset.qaMunicipal = 'true';
  const style = document.createElement('style'); style.textContent = tokensFor(theme)(parsed.toString()); document.head.replaceChildren(style);
  return parsed;
}
const rgb = value => { value = tokensFor(document.documentElement.dataset.theme)(value); if (/^#[\da-f]{6}$/i.test(value)) return [1, 3, 5].map(index => parseInt(value.slice(index, index + 2), 16)); const found = /^rgb\((\d+),?\s+(\d+),?\s+(\d+)\)/.exec(value); assert.ok(found, `Expected applied solid colour: ${value}`); return found.slice(1).map(Number); };
const luminance = channels => channels.map(channel => channel / 255).map(channel => channel <= .04045 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4).reduce((sum, channel, index) => sum + channel * [.2126, .7152, .0722][index], 0);
const contrast = (a, b) => { const values = [luminance(a), luminance(b)].sort((a, b) => b - a); return (values[0] + .05) / (values[1] + .05); };
const styleOf = element => dom.window.getComputedStyle(element);
function background(element) { for (let current = element; current; current = current.parentElement) { const value = styleOf(current).backgroundColor; if (value && value !== 'transparent' && value !== 'rgba(0, 0, 0, 0)') return rgb(value); } throw new Error('No opaque background'); }
function foregroundOf(element) { for (let current = element; current; current = current.parentElement) { const value = styleOf(current).color; if (value && value !== 'inherit' && value !== 'currentcolor') return rgb(value); } throw new Error('No inherited foreground'); }
function aa(element, label, minimum = 4.5) { const foreground = foregroundOf(element); const behind = background(element); const ratio = contrast(foreground, behind); assert.ok(ratio >= minimum, `${label}: ${foreground} on ${behind} = ${ratio.toFixed(2)} < ${minimum}`); }
for (const theme of ['light', 'dark']) test(`${theme}: real generic project cards retain readable content, actions and focus`, async () => {
  try {
    const views = [Item, MiniCard].map(Component => within(render(React.createElement(Component, { title: 'Projet public', description: 'Travaux planifiés' })).container));
    views.forEach(view => fireEvent.click(view.getByRole('button', { name: 'Afficher plus d’options' })));
    const group = within(render(React.createElement(ItemContainer, { title: 'Groupe public', description: 'Priorités du service', items: [] })).container);
    const parsed = await applyStyles(theme);
    for (const view of views) {
      aa(view.getByText('Projet public'), 'project title'); aa(view.getByText('Travaux planifiés'), 'project description');
      for (const name of ['Modifier', 'Supprimer']) aa(view.getByRole('button', { name }), name);
      const open = view.getByRole('button', { name: /^(Ouvrir Projet public$|Carte projet :)/ }); open.focus(); assert.equal(document.activeElement, open);
      const focusClass = [...open.classList].find(value => value.startsWith('focus-visible:outline-[')); assert.ok(focusClass, 'keyboard action has visible focus');
      let outline; parsed.walkRules(rule => { if (rule.selector.includes(':focus-visible') && rule.selector.includes(focusClass.replace(/[\[\]():]/g, '\\$&'))) rule.walkDecls('outline-color', decl => { outline = decl.value; }); });
      // Validate the emitted utility, with the browser-independent token colour.
      assert.ok(outline?.includes('--mairie-accent'), 'focus outline compiled from actual keyboard action class');
      const probe = document.createElement('span'); probe.style.color = tokensFor(theme)(outline); document.body.append(probe); assert.ok(contrast(rgb(styleOf(probe).color), background(open)) >= 3); probe.remove();
    }
    aa(group.getByText('Groupe public'), 'group title'); aa(group.getByText('Priorités du service'), 'group description');
  } finally { cleanup(); }
});
for (const theme of ['light', 'dark']) test(`${theme}: selected rating remains identifiable and readable`, async () => {
  try {
    const view = render(React.createElement(ElearningCourseRating, { initialValue: 3 })); await applyStyles(theme);
    const selected = view.getByRole('button', { name: 'Donner la note 3 sur 5' }); const unselected = view.getByRole('button', { name: 'Donner la note 4 sur 5' });
    assert.equal(selected.getAttribute('aria-pressed'), 'true'); assert.equal(unselected.getAttribute('aria-pressed'), 'false');
    aa(selected.querySelector('svg'), 'selected star', 3); aa(unselected.querySelector('svg'), 'unselected star', 3);
    assert.notEqual(styleOf(selected.querySelector('svg')).fill, styleOf(unselected.querySelector('svg')).fill);
    fireEvent.click(unselected); assert.equal(unselected.getAttribute('aria-pressed'), 'true'); aa(view.getByRole('button', { name: 'Envoyer la note' }), 'rating action');
  } finally { cleanup(); }
});
for (const theme of ['light', 'dark']) test(`${theme}: semantic families and action hover preserve text contrast`, async () => {
  try {
    const names = ['accent', 'success', 'warning', 'error', 'purple'];
    const fixture = document.createElement('section'); fixture.className = 'bg-[var(--mairie-surface)]';
    for (const name of names) { const label = document.createElement('span'); label.className = `bg-[var(--mairie-${name}-surface)] text-[var(--mairie-${name === 'accent' ? 'accent' : `${name}-text`})]`; label.textContent = name; fixture.append(label); }
    for (const name of ['action', 'error-action', 'success-action']) for (const state of ['', 'hover-']) { const button = document.createElement('button'); button.className = `bg-[var(--mairie-${name}-${state}background)] text-[var(--mairie-on-action)]`; button.textContent = `${name} ${state}`; fixture.append(button); }
    document.body.append(fixture); await applyStyles(theme);
    for (const label of fixture.children) aa(label, label.textContent);
    fixture.remove();
  } finally { cleanup(); }
});
for (const theme of ['light', 'dark']) test(`${theme}: avatar fallback initials remain readable`, async () => {
  try { const { Avatar } = require('../src/components/Avatar.tsx'); const view = render(React.createElement(Avatar, { fallback: 'HG' })); await applyStyles(theme); aa(view.getByText('HG'), 'avatar initials'); }
  finally { cleanup(); }
});
for (const theme of ['light', 'dark']) test(`${theme}: tooltip and calendar close affordance have visible foregrounds`, async () => {
  try {
    const { ToolTip } = require('../src/components/ToolTip.tsx'); const { CreateEventModal } = require('../src/components/CreateEventModal.tsx');
    const tooltip = render(React.createElement(ToolTip, { text: 'Informations du projet' }, React.createElement('button', null, 'Aide'))); fireEvent.mouseEnter(tooltip.getByRole('button', { name: 'Aide' }).parentElement);
    const calendar = render(React.createElement(CreateEventModal, { isOpen: true, onCancel() {}, onCreate() {} })); await applyStyles(theme);
    aa(tooltip.getByText('Informations du projet'), 'tooltip'); aa(calendar.getByRole('button', { name: 'Fermer' }), 'calendar close icon', 3);
  } finally { cleanup(); }
});
