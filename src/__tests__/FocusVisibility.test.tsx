import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { compile } from 'tailwindcss';
import postcss from 'postcss';
import { Select, SelectTrigger, SelectContent, SelectItem } from '../components/Select';

async function focusIndicator(element: HTMLElement) {
  const compiler = await compile('@tailwind utilities;');
  const css = postcss.parse(compiler.build(Array.from(element.classList)));
  let solid = false; let width = false; let shadow = false;
  css.walkRules(rule => {
    if (!rule.selector.includes(':focus-visible')) return;
    rule.walkDecls(declaration => {
      if (declaration.prop === 'outline-style' && declaration.value === 'solid') solid = true;
      if (declaration.prop === 'outline-width' && Number.parseFloat(declaration.value) > 0) width = true;
      if (declaration.prop === 'box-shadow' && declaration.value !== 'none') shadow = true;
    });
  });
  return shadow || (solid && width);
}

it('emits a visible local keyboard focus indicator for a selected list option', async () => {
  const user = userEvent.setup(); render(<Select><SelectTrigger>Service</SelectTrigger><SelectContent><SelectItem value="a">Accueil</SelectItem><SelectItem value="b">Budget</SelectItem></SelectContent></Select>);
  await user.tab(); await user.keyboard('{Enter}{ArrowDown}');
  const option = screen.getByRole('option', { name: 'Budget' }); expect(option).toHaveFocus();
  expect(await focusIndicator(option)).toBe(true);
});
