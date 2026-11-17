import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ButtonPresets, CancelButton, CreatePasskeyButton, PasskeyButton, CreateButton, DeleteButton } from './ButtonPresets';

describe('ButtonPresets (MAIR-608)', () => {
  it('names every role preset in French and reports the click', async () => {
    const user = userEvent.setup(); const create = jest.fn();
    render(<><CreateButton onClick={create} /><CancelButton /><DeleteButton /></>);
    await user.click(screen.getByRole('button', { name: 'Créer' })); expect(create).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: 'Annuler' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Supprimer' })).toHaveAttribute('data-tone', 'danger');
    expect(Object.keys(ButtonPresets).length).toBeGreaterThanOrEqual(13);
  });

  // MAIR-1071: Figma `Button/Passkey` and `Button/CreatePasskey`.
  it('MAIR-1071 names the passkey buttons and gives them the Figma appearance', () => {
    render(<><PasskeyButton /><CreatePasskeyButton /></>);
    const signIn = screen.getByRole('button', { name: 'Se connecter avec une passkey' });
    const create = screen.getByRole('button', { name: 'Créer une passkey' });
    expect(signIn).toHaveAttribute('data-preset', 'Passkey');
    expect(signIn).toHaveAttribute('data-tone', 'secondary');
    expect(create).toHaveAttribute('data-preset', 'CreatePasskey');
    expect(create).toHaveAttribute('data-tone', 'primary');
    expect(signIn.querySelector('svg')).toBeInTheDocument();
    expect(ButtonPresets.passkey).toBe(PasskeyButton);
    expect(ButtonPresets.createPasskey).toBe(CreatePasskeyButton);
  });
});
