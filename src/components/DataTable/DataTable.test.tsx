import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { DataTable } from './DataTable';

type Row = { id: string; name: string; role: string };
const rows: Row[] = [{ id: '1', name: 'Marie Martin', role: 'Admin' }, { id: '2', name: 'Paul Durand', role: 'Agent' }];
const columns = [{ key: 'name', header: 'Nom', sortable: true }, { key: 'role', header: 'Rôle' }, { key: 'actions', header: 'Actions', hideHeader: true, cell: (row: Row) => <button>Modifier {row.name}</button> }];

describe('DataTable (MAIR-608)', () => {
  it('names the table, sorts through the header and renders every state through DataState', async () => {
    const user = userEvent.setup(); const sort = jest.fn(); const click = jest.fn();
    const { container, rerender } = render(<DataTable label="Utilisateurs" columns={columns} rows={rows} rowKey={row => row.id} sort={{ key: 'name', direction: 'asc' }} onSort={sort} onRowClick={click} />);
    expect(screen.getByRole('table', { name: 'Utilisateurs' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Nom/ })).toHaveAttribute('aria-sort', 'ascending');
    await user.click(screen.getByRole('button', { name: 'Nom' })); expect(sort).toHaveBeenCalledWith('name', 'desc');
    await user.click(screen.getByText('Paul Durand')); expect(click).toHaveBeenCalledWith(rows[1]);
    expect(screen.getByRole('button', { name: 'Modifier Marie Martin' })).toBeInTheDocument();
    expect((await axe(container)).violations).toEqual([]);
    rerender(<DataTable label="Utilisateurs" columns={columns} rows={[]} rowKey={row => row.id} state="loading" skeletonRows={2} />);
    expect(screen.getByRole('table')).toHaveAttribute('aria-busy', 'true'); expect(container.querySelectorAll('tbody tr[aria-hidden]')).toHaveLength(2);
    rerender(<DataTable label="Utilisateurs" columns={columns} rows={[]} rowKey={row => row.id} stateProps={{ title: 'Aucun utilisateur' }} />);
    expect(screen.getByRole('region', { name: 'Aucun utilisateur' })).toBeInTheDocument();
    rerender(<DataTable label="Utilisateurs" columns={columns} rows={rows} rowKey={row => row.id} state="error" />);
    expect(screen.getByText('Une erreur est survenue.')).toBeInTheDocument(); expect(screen.queryByText('Marie Martin')).not.toBeInTheDocument();
  });
  it('merges consumer styles (CodeRabbit on #467)', () => {
    render(<DataTable label="T" columns={[{ key: 'a', header: 'A' }]} rows={[]} rowKey={() => 'k'} style={{ marginTop: 4 }} />);
    expect(screen.getByRole('table').style.marginTop).toBe('4px');
  });
});
