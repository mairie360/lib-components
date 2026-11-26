import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { compile } from 'tailwindcss';

// MAIR-1227: the page subtitle rule (`main h1 + p`, muted grey) caught the PageHero subtitle and put
// #5a6072 on the slate band (contrast 1.67, RGAA 3.2). The band keeps its own on-hero colour.
let stylesheet: HTMLStyleElement;
beforeAll(async () => {
  const source = readFileSync(resolve(process.cwd(), 'src/styles/municipal-theme.css'), 'utf8');
  stylesheet = document.createElement('style');
  stylesheet.textContent = (await compile(source)).build([]);
  document.head.appendChild(stylesheet);
});
afterAll(() => stylesheet.remove());
afterEach(() => { document.body.innerHTML = ''; document.body.className = ''; });

it('MAIR-1227 keeps the muted page subtitle out of the PageHero band (RGAA 3.2)', () => {
  document.body.className = 'mairie-ui';
  document.body.innerHTML = '<main><h1>Paramètres</h1><p id="page">Mardi</p>'
    + '<section data-m360-component="PageHero"><div><h1>Camille Martin</h1><p id="hero">camille@mairie.fr</p></div></section></main>';
  expect(getComputedStyle(document.getElementById('page')!).color).toBe('var(--mairie-muted)');
  expect(getComputedStyle(document.getElementById('hero')!).color).not.toBe('var(--mairie-muted)');
});
