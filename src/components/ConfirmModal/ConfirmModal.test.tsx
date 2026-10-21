import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConfirmModal } from './ConfirmModal';

describe('ConfirmModal (MAIR-608)', () => {
  it('confirms a destructive action with the preset buttons and keeps the legacy isOpen prop', async () => {
    const user = userEvent.setup(); const confirm = jest.fn(); const cancel = jest.fn();
    const { rerender } = render(<ConfirmModal isOpen title="Supprimer le projet ?" message="Cette action est irréversible." onConfirm={confirm} onCancel={cancel} />);
    const dialog = screen.getByRole('dialog', { name: 'Supprimer le projet ?' });
    expect(dialog).toHaveAttribute('data-size', 'xs'); expect(within(dialog).getByText('Cette action est irréversible.')).toBeInTheDocument();
    await user.click(within(dialog).getByRole('button', { name: 'Confirmer la suppression' })); expect(confirm).toHaveBeenCalledTimes(1);
    await user.click(within(dialog).getByRole('button', { name: 'Annuler' })); expect(cancel).toHaveBeenCalledTimes(1);
    rerender(<ConfirmModal open title="Archiver ?" message="Le projet sera archivé." destructive={false} confirmLabel="Archiver" busy onConfirm={confirm} onCancel={cancel} />);
    expect(screen.getByRole('button', { name: 'Archiver' })).toHaveAttribute('aria-busy', 'true'); expect(screen.getByRole('button', { name: 'Annuler' })).toBeDisabled();
    rerender(<ConfirmModal open={false} title="Archiver ?" message="x" onConfirm={confirm} onCancel={cancel} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
  it('cannot be dismissed by Escape or the backdrop while the confirmation runs (CodeRabbit on #467)', async () => {
    const user = userEvent.setup(); const cancel = jest.fn();
    render(<ConfirmModal open busy title="Supprimer ?" message="Irréversible." onConfirm={() => undefined} onCancel={cancel} />);
    await user.keyboard('{Escape}');
    fireEvent.mouseDown(screen.getByRole('dialog').parentElement!);
    await user.click(screen.getByRole('button', { name: 'Fermer la fenêtre' }));
    expect(cancel).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});
