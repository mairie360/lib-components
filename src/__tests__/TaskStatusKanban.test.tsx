import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { TaskStatusKanban } from '../components/TaskStatusKanban';
import { TaskStatusSelect } from '../components/TaskStatusSelect';
const statuses = [
  { id: 'pending', name: 'À instruire', color: '#1256a6', category: 'todo' as const },
  { id: 'review', name: 'Conseil municipal', color: '#4b908d', category: 'inprogress' as const },
  { id: 'closed', name: 'Dossier clos', color: '#267845', category: 'done' as const },
];
describe('dynamic task status controls', () => {
  it('groups tasks by the project status ID and renders custom columns in order', () => {
    render(<TaskStatusKanban statuses={statuses} tasks={[{ id: 't1', title: 'Préparer le conseil', statusId: 'review' }]} />);
    expect(screen.getAllByRole('region').map(region => region.getAttribute('aria-label'))).toEqual(['À instruire', 'Conseil municipal', 'Dossier clos']);
    expect(within(screen.getByRole('region', { name: 'Conseil municipal' })).getByText('Préparer le conseil')).toBeInTheDocument();
    expect(screen.getByRole('combobox').hasAttribute('disabled')).toBe(true);
  });
  it('makes a permitted status change available through a native accessible selector', () => {
    function Board() {
      const [statusId, setStatusId] = React.useState('pending');
      return <TaskStatusKanban statuses={statuses} tasks={[{ id: 't1', title: 'Préparer le conseil', statusId, canUpdateStatus: true }]} onStatusChange={(_id, value) => setStatusId(value)} />;
    }
    render(<Board />);
    fireEvent.change(screen.getByLabelText('Statut de Préparer le conseil'), { target: { value: 'closed' } });
    expect(within(screen.getByRole('region', { name: 'Dossier clos' })).getByText('Préparer le conseil')).toBeInTheDocument();
  });
  it('keeps a task with a missing status visible and makes the invalid selector unavailable', () => {
    render(<TaskStatusKanban statuses={statuses} tasks={[{ id: 't1', title: 'Dossier conservé', statusId: 'missing' }]} />);
    expect(screen.getByRole('region', { name: 'Statuts indisponibles' })).toHaveTextContent('Dossier conservé');
  });
  it('disables a selector while a write is pending', () => {
    render(<TaskStatusSelect statuses={statuses} value="pending" label="Statut de la tâche" disabled onChange={() => undefined} />);
    expect(screen.getByRole('combobox')).toBeDisabled();
  });
});
