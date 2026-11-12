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

describe('DataTable interactive rows and cell kinds (MAIR-850, MAIR-869)', () => {
  type User = { id: string; name: string; role: string };
  const people: User[] = [{ id: 'u1', name: 'Marie Martin', role: 'Agent' }, { id: 'u2', name: 'Paul Durand', role: 'Maire' }];
  const columns = [
    { key: 'name', header: 'Nom', kind: 'strong' as const, sortable: true },
    { key: 'role', header: 'Rôle', kind: 'content' as const, cell: (row: User) => <span data-testid={`tag-${row.id}`}>{row.role}</span> },
    { key: 'actions', header: 'Actions', kind: 'actions' as const, hideHeader: true, cell: (row: User) => <button type="button" onClick={() => remove(row)}>Supprimer {row.name}</button> },
  ];
  const remove = jest.fn();

  it('opens a row with the mouse, Entrée or Espace, never from its action buttons', async () => {
    const user = userEvent.setup(); const open = jest.fn();
    render(<DataTable label="Utilisateurs" rows={people} rowKey={row => row.id} columns={columns} onRowClick={open} rowLabel={row => `Ouvrir la fiche de ${row.name}`} sort={{ key: 'name', direction: 'asc' }} onSort={jest.fn()} />);
    const row = screen.getByRole('row', { name: 'Ouvrir la fiche de Marie Martin' });
    expect(row).toHaveAttribute('tabindex', '0');
    expect(row).toHaveAttribute('data-interactive', 'true');
    expect(row.className).toContain('focus-visible:bg-[var(--mairie-surface-raised)]');
    await user.click(screen.getByTestId('tag-u1'));
    expect(open).toHaveBeenLastCalledWith(people[0]);
    screen.getByRole('row', { name: 'Ouvrir la fiche de Paul Durand' }).focus();
    await user.keyboard('{Enter}');
    expect(open).toHaveBeenLastCalledWith(people[1]);
    await user.keyboard(' ');
    expect(open).toHaveBeenCalledTimes(3);
    await user.click(screen.getByRole('button', { name: 'Supprimer Marie Martin' }));
    expect(remove).toHaveBeenCalledWith(people[0]);
    screen.getByRole('button', { name: 'Supprimer Paul Durand' }).focus();
    await user.keyboard('{Enter}');
    expect(open).toHaveBeenCalledTimes(3);
    expect(screen.getByRole('columnheader', { name: /Nom/ })).toHaveAttribute('aria-sort', 'ascending');
  });

  it('marks each cell with its kind: strong text, free content, end-aligned actions', () => {
    render(<DataTable label="Utilisateurs" rows={people} rowKey={row => row.id} columns={columns} />);
    const cells = screen.getAllByRole('row')[1].querySelectorAll('td');
    expect(cells[0]).toHaveAttribute('data-kind', 'strong');
    expect(cells[0]).toHaveClass('font-semibold');
    expect(cells[1]).toHaveAttribute('data-kind', 'content');
    expect(cells[2]).toHaveClass('text-right');
    expect(screen.getAllByRole('row')[1]).not.toHaveAttribute('tabindex');
  });
});
