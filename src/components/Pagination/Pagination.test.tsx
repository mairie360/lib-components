import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Pagination, paginationSummary } from './Pagination';

describe('Pagination (MAIR-608)', () => {
  it('summarises the range and disables the edges', async () => {
    const user = userEvent.setup(); const change = jest.fn();
    const { rerender } = render(<Pagination page={2} pageSize={20} total={128} onChange={change} itemsLabel="utilisateurs" />);
    expect(screen.getByRole('navigation', { name: 'Pagination' })).toHaveTextContent('21 – 40 sur 128 utilisateurs'); expect(screen.getByText('Page 2 / 7')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Suivant' })); expect(change).toHaveBeenCalledWith(3);
    rerender(<Pagination page={1} pageSize={20} total={128} onChange={change} />);
    expect(screen.getByRole('button', { name: 'Précédent' })).toBeDisabled(); expect(screen.getByRole('navigation')).toHaveAttribute('data-state', 'first');
    rerender(<Pagination page={7} pageSize={20} total={128} onChange={change} loading />);
    expect(screen.getByRole('button', { name: 'Suivant' })).toBeDisabled(); expect(screen.getByRole('navigation')).toHaveAttribute('data-state', 'loading');
    expect(paginationSummary(1, 20, 0)).toBe('0 éléments');
  });
});
