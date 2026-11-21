import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ButtonPresets, CancelButton, ConfirmDeleteButton, CreatePasskeyButton, PasskeyButton, CreateButton, DeleteButton, DeleteGhostButton } from './ButtonPresets';

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

  // MAIR-1095: Figma `Button/DeleteGhost` and the red rule (solid = critical, outline = not critical, ghost = discreet).
  it('MAIR-1095 adds the discreet DeleteGhostButton and keeps every red button on the danger tokens', () => {
    render(<><DeleteGhostButton /><DeleteButton /><ConfirmDeleteButton /></>);
    const [ghost, outline] = screen.getAllByRole('button', { name: 'Supprimer' });
    expect(ghost).toHaveAttribute('data-preset', 'DeleteGhost');
    expect(ghost).toHaveAttribute('data-variant', 'ghost');
    expect(ghost).toHaveAttribute('data-tone', 'danger');
    expect(ghost).toHaveAttribute('data-m360-component', 'DeleteGhostButton Button');
    expect(ghost.style.getPropertyValue('--button-hover-surface')).toBe('var(--mairie-danger-surface)');
    expect(outline).toHaveAttribute('data-variant', 'outline');
    expect(outline.style.getPropertyValue('--button-hover-surface')).toBe('var(--mairie-danger-surface)');
    const solid = screen.getByRole('button', { name: 'Confirmer la suppression' });
    expect(solid).toHaveAttribute('data-variant', 'solid');
    expect(solid).toHaveClass('bg-[var(--mairie-danger)]', 'text-[var(--mairie-on-danger)]');
    expect(ButtonPresets.deleteGhost).toBe(DeleteGhostButton);
  });
});
