import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EmailField, FieldPresets, PasswordField, SearchField } from './FieldPresets';

describe('FieldPresets (MAIR-608)', () => {
  it('toggles the password visibility and clears a search', async () => {
    const user = userEvent.setup();
    const onClear = jest.fn();
    render(<><PasswordField defaultValue="secret" /><SearchField value="mairie" onChange={() => undefined} onClear={onClear} /></>);
    const password = screen.getByLabelText('Mot de passe');
    expect(password).toHaveAttribute('type', 'password');
    await user.click(screen.getByRole('button', { name: 'Afficher le mot de passe' }));
    expect(password).toHaveAttribute('type', 'text');
    expect(screen.getByRole('button', { name: 'Masquer le mot de passe' })).toHaveAttribute('aria-pressed', 'true');
    await user.click(screen.getByRole('button', { name: 'Effacer la recherche' }));
    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it('exposes the field presets with their French labels and native types', () => {
    render(<EmailField />);
    expect(screen.getByLabelText('Adresse e-mail')).toHaveAttribute('type', 'email');
    expect(Object.keys(FieldPresets).sort()).toEqual(['date', 'email', 'name', 'number', 'password', 'phone', 'search']);
  });
});
