import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ButtonPresets, CancelButton, CreateButton, DeleteButton } from './ButtonPresets';

describe('ButtonPresets (MAIR-608)', () => {
  it('names every role preset in French and reports the click', async () => {
    const user = userEvent.setup(); const create = jest.fn();
    render(<><CreateButton onClick={create} /><CancelButton /><DeleteButton /></>);
    await user.click(screen.getByRole('button', { name: 'Créer' })); expect(create).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: 'Annuler' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Supprimer' })).toHaveAttribute('data-tone', 'danger');
    expect(Object.keys(ButtonPresets).length).toBeGreaterThanOrEqual(13);
  });
});
