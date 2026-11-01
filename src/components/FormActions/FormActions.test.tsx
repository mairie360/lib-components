import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormActions } from './FormActions';

describe('FormActions (MAIR-608)', () => {
  it('renders the status, the cancel and the save actions and locks them while busy', async () => {
    const user = userEvent.setup(); const onCancel = jest.fn();
    const { rerender } = render(<FormActions status="Aucune modification à enregistrer." onCancel={onCancel} saveDisabled />);
    expect(screen.getByRole('status')).toHaveTextContent('Aucune modification à enregistrer.');
    expect(screen.getByRole('button', { name: 'Enregistrer' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Annuler' })); expect(onCancel).toHaveBeenCalledTimes(1);
    rerender(<FormActions busy onCancel={onCancel} />);
    expect(screen.getByRole('button', { name: 'Enregistrer' })).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByRole('button', { name: 'Annuler' })).toBeDisabled();
  });
});
