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
    expect(Object.keys(FieldPresets).sort()).toEqual(['date', 'email', 'name', 'newPassword', 'number', 'password', 'phone', 'search', 'time']);
  });
});

describe('NewPasswordField and TimeField (MAIR-837, MAIR-839)', () => {
  it('labels the new password, links its rule as help and announces the error', async () => {
    const { NewPasswordField } = await import('./FieldPresets');
    const { checkNewPassword } = await import('../../kit/password');
    const { rerender } = render(<NewPasswordField />);
    const input = screen.getByLabelText('Nouveau mot de passe');
    expect(input).toHaveAttribute('autocomplete', 'new-password');
    expect(input).toHaveAttribute('type', 'password');
    expect(input).toHaveAccessibleDescription('12 caractères minimum, avec chiffres et lettres.');
    rerender(<NewPasswordField error={checkNewPassword('court1') ?? undefined} />);
    expect(screen.getByLabelText('Nouveau mot de passe')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByLabelText('Nouveau mot de passe')).toHaveAccessibleDescription(expect.stringContaining('Utilisez au moins 12 caractères, avec des chiffres et des lettres.'));
  });

  it('renders a native time input with its clock icon and range', async () => {
    const { TimeField } = await import('./FieldPresets');
    const { container } = render(<TimeField label="Heure de début" min="08:00" max="18:00" step={900} error="L’heure de fin doit suivre l’heure de début." />);
    const input = screen.getByLabelText('Heure de début');
    expect(input).toHaveAttribute('type', 'time');
    expect(input).toHaveAttribute('min', '08:00');
    expect(input).toHaveAttribute('step', '900');
    expect(container.querySelector('[data-type="time"] svg')).not.toBeNull();
    expect(input).toHaveAccessibleDescription(expect.stringContaining('L’heure de fin doit suivre l’heure de début.'));
  });
});
