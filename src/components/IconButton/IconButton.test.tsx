import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Calendar } from 'lucide-react';
import { IconButton } from './IconButton';

describe('IconButton (MAIR-608)', () => {
  it('requires an accessible name and supports a pressed state', async () => {
    const user = userEvent.setup(); const click = jest.fn();
    const { rerender } = render(<IconButton icon={Calendar} label="Ouvrir le calendrier" onClick={click} />);
    await user.click(screen.getByRole('button', { name: 'Ouvrir le calendrier' })); expect(click).toHaveBeenCalledTimes(1);
    rerender(<IconButton icon={Calendar} label="Épingler" pressed />);
    expect(screen.getByRole('button', { name: 'Épingler' })).toHaveAttribute('aria-pressed', 'true');
  });
});

describe('IconButton presets and disabled state (MAIR-843, MAIR-862)', () => {
  it('exposes the Figma IconButton/* presets with their accessible names', async () => {
    const { CloseIconButton, DeleteIconButton, EditIconButton, MoreIconButton, NextIconButton, NotificationsIconButton, PreviousIconButton, SearchIconButton } = await import('./IconButton');
    render(<>
      <PreviousIconButton /><NextIconButton /><CloseIconButton /><EditIconButton /><DeleteIconButton /><SearchIconButton /><NotificationsIconButton /><MoreIconButton />
      <PreviousIconButton label="Semaine précédente" />
      <NextIconButton label={undefined} size="s" />
    </>);
    expect(screen.getByRole('button', { name: 'Période précédente' })).toHaveAttribute('data-preset', 'previous');
    expect(screen.getAllByRole('button', { name: 'Période suivante' })[1]).toHaveAttribute('data-size', 's');
    expect(screen.getByRole('button', { name: 'Semaine précédente' })).toBeInTheDocument();
    for (const name of ['Fermer', 'Modifier', 'Rechercher', 'Notifications', 'Plus d’actions']) expect(screen.getByRole('button', { name })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Supprimer' })).toHaveAttribute('data-tone', 'danger');
    expect(screen.getByRole('button', { name: 'Période précédente' })).toHaveAttribute('data-m360-component', 'PreviousIconButton IconButton');
  });

  it.each(['xs', 's', 'm', 'l', 'xl'] as const)('disables the %s size with the shared disabled look', size => {
    render(<IconButton preset="next" size={size} disabled />);
    const button = screen.getByRole('button', { name: 'Suivant' });
    expect(button).toBeDisabled();
    expect(button.className).toContain('disabled:opacity-50');
    expect(button.className).toContain('disabled:cursor-not-allowed');
  });
});
