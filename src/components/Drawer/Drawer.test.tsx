import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Drawer } from './Drawer';

describe('Drawer (MAIR-608)', () => {
  it('opens a right drawer with the same dialog behaviour', async () => {
    const user = userEvent.setup(); const close = jest.fn();
    const { rerender } = render(<Drawer open title="Fiche du projet" size="l" onClose={close} footer={<button>Fermer</button>}><p>Détails</p></Drawer>);
    const dialog = screen.getByRole('dialog', { name: 'Fiche du projet' });
    expect(dialog.style.maxWidth).toBe('720px'); expect(within(dialog).getByText('Détails')).toBeInTheDocument();
    await user.keyboard('{Escape}'); expect(close).toHaveBeenCalledTimes(1);
    rerender(<Drawer open={false} title="Fiche du projet" onClose={close} />); expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
