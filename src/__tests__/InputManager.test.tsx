import React, { useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { InputManager, type InputProps } from '../components/InputManager';
import { axe } from 'jest-axe';

function Field(props: Partial<InputProps>) {
  const [value, setValue] = useState<InputProps['value']>(props.value ?? '');
  return <InputManager label="Champ" name="field" {...props} value={value} onChange={event => setValue(event.target instanceof HTMLInputElement && event.target.type === 'checkbox' ? event.target.checked : event.target.value)} />;
}
it('allows keyboard editing and an accessible password-visibility toggle', async () => {
  const user = userEvent.setup(); const { container } = render(<Field type="password" />);
  await user.tab(); await user.keyboard('secret');
  expect(screen.getByLabelText('Champ')).toHaveValue('secret'); expect(screen.getByLabelText('Champ')).toHaveAttribute('type', 'password');
  await user.tab(); expect(screen.getByRole('button', { name: 'Afficher le mot de passe' })).toHaveFocus(); await user.keyboard('{Enter}');
  expect(screen.getByLabelText('Champ')).toHaveAttribute('type', 'text');
  await user.click(screen.getByRole('button', { name: 'Masquer le mot de passe' })); expect(screen.getByLabelText('Champ')).toHaveAttribute('type', 'password');
  expect((await axe(container)).violations).toEqual([]);
});
it.each([['email', 'invalid', 'Adresse e-mail invalide.', 'anne@mairie.test'], ['tel', '123', 'Numéro de téléphone invalide.', '06 12 34 56 78']])('shows and clears %s validation while retaining the edited input', (type, invalid, message, valid) => {
  render(<Field type={type as InputProps['type']} />);
  fireEvent.change(screen.getByLabelText('Champ'), { target: { value: invalid } }); expect(screen.getByText(message)).toBeVisible(); expect(screen.getByLabelText('Champ')).toHaveValue(invalid);
  fireEvent.change(screen.getByLabelText('Champ'), { target: { value: valid } }); expect(screen.queryByText(message)).not.toBeInTheDocument();
});
it('reports numeric bounds and permits clearing a numeric field', () => {
  render(<Field type="number" min={1} max={10} />);
  const input = screen.getByLabelText('Champ');
  fireEvent.change(input, { target: { value: '0' } }); expect(screen.getByText('Le nombre doit être au moins 1.')).toBeVisible();
  fireEvent.change(input, { target: { value: '11' } }); expect(screen.getByText('Le nombre doit être au maximum 10.')).toBeVisible();
  fireEvent.change(input, { target: { value: '5' } }); expect(screen.queryByText(/Le nombre doit/)).not.toBeInTheDocument();
  fireEvent.change(input, { target: { value: '' } }); expect(input).toHaveValue(null);
});
it('filters available options, reports no matches and dismisses with an outside click', async () => {
  const user = userEvent.setup(); render(<Field type="select" options={[{ value: 'a', label: 'Accueil' }, { value: 'b', label: 'Budget' }]} />);
  await user.click(screen.getByLabelText('Champ')); await user.type(screen.getByLabelText('Champ'), 'Bud');
  expect(screen.queryByText('Accueil')).not.toBeInTheDocument(); await user.click(screen.getByText('Budget')); expect(screen.getByLabelText('Champ')).toHaveValue('Budget');
  await user.clear(screen.getByLabelText('Champ')); await user.type(screen.getByLabelText('Champ'), 'absent'); expect(screen.getByText('Aucune option trouvée')).toBeVisible();
  await user.click(document.body); expect(screen.queryByText('Aucune option trouvée')).not.toBeInTheDocument();
});
it.each(['text', 'date', 'search', 'default', 'checkbox'] as const)('exposes its %s value through a labeled control', async type => {
  const { container } = render(<Field type={type} />);
  const input = screen.getByLabelText('Champ'); expect(input).toBeEnabled();
  if (type === 'checkbox') { fireEvent.click(input); expect(input).toBeChecked(); }
  else fireEvent.change(input, { target: { value: type === 'date' ? '2026-10-15' : 'Edited' } });
  expect((await axe(container)).violations).toEqual([]);
});
it('accepts a selected file through its real file input', async () => {
  const onChange = jest.fn(); render(<InputManager type="file" name="upload" label="Document" value="" onChange={onChange} />);
  const file = new File(['PDF'], 'document.pdf', { type: 'application/pdf' }); await userEvent.upload(screen.getByLabelText('Document'), file);
  expect((screen.getByLabelText('Document') as HTMLInputElement).files?.[0]).toBe(file); expect(onChange).toHaveBeenCalledTimes(1);
});
