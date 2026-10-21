import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MultiSelect } from './MultiSelect';

const options = [{ value: 'dashboard', label: 'Tableau de bord' }, { value: 'projects', label: 'Projets' }, { value: 'calendar', label: 'Calendrier' }] as const;

describe('MultiSelect (MAIR-608)', () => {
  it('filters, toggles and removes multi-select entries with chips', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    const { rerender } = render(<MultiSelect label="Membres" options={options} value={['projects']} onChange={onChange} name="members" />);
    expect(screen.getByRole('button', { name: 'Retirer Projets' })).toBeInTheDocument();
    await user.type(screen.getByRole('searchbox'), 'cal');
    expect(screen.getAllByRole('checkbox')).toHaveLength(1);
    await user.click(screen.getByRole('checkbox', { name: 'Calendrier' }));
    expect(onChange).toHaveBeenLastCalledWith(['projects', 'calendar']);
    rerender(<MultiSelect label="Membres" options={options} value={['projects', 'calendar']} onChange={onChange} name="members" />);
    await user.click(screen.getByRole('button', { name: 'Retirer Projets' }));
    expect(onChange).toHaveBeenLastCalledWith(['calendar']);
    expect(document.querySelectorAll('input[name="members"]')).toHaveLength(2);
  });
});
