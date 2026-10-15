import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { compile } from 'tailwindcss';

let stylesheet: HTMLStyleElement;
beforeAll(async () => {
  const source = readFileSync(resolve(process.cwd(), 'src/styles/municipal-theme.css'), 'utf8');
  stylesheet = document.createElement('style');
  stylesheet.textContent = (await compile(source)).build([]);
  document.head.appendChild(stylesheet);
});
afterAll(() => stylesheet.remove());
afterEach(() => { document.body.innerHTML = ''; document.body.className = ''; document.documentElement.removeAttribute('data-theme'); });

it.each([
  '/mairie360-logo.png',
  '/logo.png',
  '/_next/image?url=%2Flogo.png&w=640&q=75',
])('gives the Mairie360 image a compact white backing in dark mode: %s', src => {
  document.documentElement.dataset.theme = 'dark';
  document.body.className = 'mairie-ui';
  document.body.innerHTML = `<header style="width:40px"><img alt="Logo Mairie360" src="${src}" style="width:40px;height:40px;object-fit:contain"></header><img alt="Portrait" src="/portrait.png">`;
  const logo = document.querySelector('header img')!;
  const style = getComputedStyle(logo);
  expect(style.backgroundColor).toBe('rgb(255, 255, 255)');
  expect(style.padding).toBe('2px');
  expect(style.borderRadius).toBe('8px');
  expect(style.boxSizing).toBe('border-box');
  expect(style.maxWidth).toBe('100%');
  expect(style.width).toBe('40px');
  expect(style.height).toBe('40px');
  expect(style.filter).not.toMatch(/invert/);
  expect(getComputedStyle(document.querySelector('img[alt="Portrait"]')!).backgroundColor).toBe('rgba(0, 0, 0, 0)');
});

it('keeps the light theme logo and unrelated images unchanged', () => {
  document.documentElement.dataset.theme = 'light';
  document.body.className = 'mairie-ui';
  document.body.innerHTML = '<img alt="Logo Mairie360" src="/logo.png">';
  expect(getComputedStyle(document.querySelector('img')!).backgroundColor).toBe('rgba(0, 0, 0, 0)');
});
