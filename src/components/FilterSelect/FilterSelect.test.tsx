import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FilterSelect } from './FilterSelect';

describe('FilterSelect (MAIR-608)', () => {
  it('shows the active filter value and clears it', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    const { rerender } = render(<FilterSelect label="Statut" options={[{ value: 'active', label: 'Actif' }, { value: 'inactive', label: 'Inactif' }]} value="" onChange={onChange} />);
    await user.selectOptions(screen.getByRole('combobox', { name: 'Statut' }), 'active');
    expect(onChange).toHaveBeenCalledWith('active');
    rerender(<FilterSelect label="Statut" options={[{ value: 'active', label: 'Actif' }, { value: 'inactive', label: 'Inactif' }]} value="active" onChange={onChange} />);
    expect(screen.getByText('Statut : Actif')).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Statut' }).parentElement).toHaveAttribute('data-active', 'true');
    await user.selectOptions(screen.getByRole('combobox', { name: 'Statut' }), '');
    expect(onChange).toHaveBeenLastCalledWith('');
  });
});
