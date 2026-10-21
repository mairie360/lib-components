import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SegmentedControl } from './SegmentedControl';

describe('SegmentedControl (MAIR-608)', () => {
  it('behaves as a radio group for the view choice', async () => {
    const user = userEvent.setup(); const change = jest.fn();
    render(<SegmentedControl label="Vue des projets" value="kanban" onChange={change} options={[{ key: 'kanban', label: 'Kanban' }, { key: 'table', label: 'Tableau' }]} />);
    expect(screen.getByRole('radiogroup', { name: 'Vue des projets' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Kanban' })).toBeChecked();
    await user.click(screen.getByRole('radio', { name: 'Tableau' })); expect(change).toHaveBeenCalledWith('table');
    fireEvent.keyDown(screen.getByRole('radiogroup'), { key: 'ArrowRight' }); expect(change).toHaveBeenLastCalledWith('table');
  });
  it('moves focus with the selection (CodeRabbit on #467)', () => {
    function Host() { const [view, setView] = React.useState('kanban'); return <SegmentedControl label="Vue" value={view} onChange={setView} options={[{ key: 'kanban', label: 'Kanban' }, { key: 'table', label: 'Tableau' }]} />; }
    render(<Host />);
    screen.getByRole('radio', { name: 'Kanban' }).focus();
    fireEvent.keyDown(screen.getByRole('radiogroup'), { key: 'ArrowRight' });
    expect(screen.getByRole('radio', { name: 'Tableau' })).toHaveFocus();
  });
});
