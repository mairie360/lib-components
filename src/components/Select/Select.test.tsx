import React, { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './Select';
import { axe } from 'jest-axe';
function Options({ controlled = false, onChange = jest.fn() }) {
  const [value, setValue] = useState('');
  return <Select value={controlled ? value : undefined} onValueChange={next => { setValue(next); onChange(next); }}><SelectTrigger aria-label="Service"><SelectValue placeholder="Choisir un service" /></SelectTrigger><SelectContent><SelectItem value="accueil">Accueil</SelectItem><SelectItem value="budget">Budget</SelectItem></SelectContent></Select>;
}
it.each([false, true])('chooses with keyboard and exposes the selected label (controlled=%s)', async controlled => {
  const user = userEvent.setup(); const onChange = jest.fn(); const { container } = render(<Options controlled={controlled} onChange={onChange} />);
  await user.tab(); await user.keyboard('{Enter}{ArrowDown}{Enter}');
  expect(onChange).toHaveBeenCalledWith('budget'); expect(screen.getByRole('button', { name: 'Service' })).toHaveTextContent('Budget');
  expect(screen.queryByRole('listbox')).not.toBeInTheDocument(); expect((await axe(container)).violations).toEqual([]);
});
it('dismisses on Escape or an outside click without changing the selected value', async () => {
  const user = userEvent.setup(); const onChange = jest.fn(); render(<Options onChange={onChange} />);
  await user.click(screen.getByRole('button', { name: 'Service' })); expect(screen.getByText('Accueil')).toBeVisible(); await user.keyboard('{Escape}'); expect(screen.queryByText('Accueil')).not.toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Service' })); await user.click(document.body); expect(screen.queryByText('Accueil')).not.toBeInTheDocument(); expect(onChange).not.toHaveBeenCalled();
});
it('selects by pointer, and a custom trigger listener still opens the menu', async () => {
  const user = userEvent.setup(); const onClick = jest.fn(); render(<Select><SelectTrigger aria-label="Choix" onClick={onClick}><SelectValue /></SelectTrigger><SelectContent><SelectItem value="yes">Oui</SelectItem></SelectContent></Select>);
  await user.click(screen.getByRole('button', { name: 'Choix' })); expect(onClick).toHaveBeenCalledTimes(1); await user.click(screen.getByRole('option', { name: 'Oui' })); expect(screen.getByRole('button', { name: 'Choix' })).toHaveTextContent('Oui');
});

it('closes the list on Tab and never steals the following control focus on a later Escape', async () => {
  const user = userEvent.setup(); render(<><Options /><button>Après la sélection</button></>);
  await user.click(screen.getByRole('button', { name: 'Service' })); expect(screen.getByRole('option', { name: 'Accueil' })).toHaveFocus();
  await user.tab(); expect(screen.getByRole('button', { name: 'Après la sélection' })).toHaveFocus(); expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  await user.keyboard('{Escape}'); expect(screen.getByRole('button', { name: 'Après la sélection' })).toHaveFocus();
});
