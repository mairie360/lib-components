import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { Users } from 'lucide-react';

import { Body, Caption, ErrorText, Label, Link, Overline, PageTitle, SectionTitle, Text, TextPresets } from '../components/Text';
import { PriorityPill, StatusBadge, StatusPill, statuses } from '../components/StatusPill';
import { Tag, TagList } from '../components/Tag';
import { MetricCard } from '../components/MetricCard';
import { ProgressMeter } from '../components/ProgressMeter';
import { Panel } from '../components/Panel';
import { PageHeader } from '../components/PageHeader';
import { Tabs } from '../components/Tabs';
import { SegmentedControl } from '../components/SegmentedControl';
import { Pagination, paginationSummary } from '../components/Pagination';
import { DataTable } from '../components/DataTable';
import { DateTime, formatDateTime, formatRelative } from '../components/DateTime';
import { sizes } from '../kit/theme';

describe('Text (MAIR-608, Figma Base/Text)', () => {
  it('binds size, weight and tone to the charte tokens and lets presets choose the element', () => {
    const { container } = render(<>
      <Text size="l" weight="bold" tone="danger">Base</Text>
      <PageTitle>Tableau de bord</PageTitle><SectionTitle>Projets récents</SectionTitle>
      <Body>Corps</Body><Caption>il y a 5 min</Caption><Overline>Colonne</Overline><ErrorText>Champ requis</ErrorText>
      <Label htmlFor="x">Nom</Label><Link href="/aide">Aide</Link>
    </>);
    const base = screen.getByText('Base');
    expect(base.tagName).toBe('SPAN'); expect(base.style.fontSize).toBe('var(--mairie-text-l)'); expect(base).toHaveClass('font-bold'); expect(base.style.color).toBe('var(--mairie-error-text)');
    expect(screen.getByRole('heading', { level: 1, name: 'Tableau de bord' })).toHaveAttribute('data-preset', 'PageTitle');
    expect(screen.getByRole('heading', { level: 2, name: 'Projets récents' })).toBeInTheDocument();
    expect(screen.getByText('Corps').tagName).toBe('P');
    expect(screen.getByText('Colonne')).toHaveClass('uppercase');
    expect(screen.getByText('Champ requis').style.color).toBe('var(--mairie-error-text)');
    expect(screen.getByText('Nom').tagName).toBe('LABEL');
    expect(screen.getByRole('link', { name: 'Aide' })).toHaveAttribute('href', '/aide');
    expect(container.querySelectorAll('[data-size]')).toHaveLength(9);
    expect(Object.keys(TextPresets)).toHaveLength(13);
  });
  it('keeps the preset defaults when an override is undefined and overrides them otherwise', () => {
    render(<><PageTitle size={undefined}>A</PageTitle><PageTitle as="h2" tone="muted">B</PageTitle></>);
    expect(screen.getByText('A').style.fontSize).toBe('var(--mairie-text-xl)');
    expect(screen.getByText('B').tagName).toBe('H2'); expect(screen.getByText('B').style.color).toBe('var(--mairie-muted)');
  });
});

describe('StatusPill, Tag, MetricCard, ProgressMeter', () => {
  it('renders every tone and size and maps business statuses and priorities to one colour', async () => {
    const { container } = render(<>
      {sizes.map(size => <StatusPill key={size} label={size} size={size} tone="info" dot />)}
      <StatusBadge status="active" /><StatusBadge status="late" label="3 en retard" /><PriorityPill level="high" />
    </>);
    expect(container.querySelectorAll('[data-size]')).toHaveLength(8);
    expect(screen.getByText('Actif')).toHaveAttribute('data-tone', 'success'); expect(screen.getByText('Actif')).toHaveAttribute('data-status', 'active');
    expect(screen.getByText('3 en retard')).toHaveAttribute('data-tone', 'danger');
    expect(screen.getByText('Haute')).toHaveAttribute('data-priority', 'high');
    expect(Object.keys(statuses)).toContain('revoked');
    expect((await axe(container)).violations).toEqual([]);
  });
  it('removes a tag through an accessible button and lists tags under a name', async () => {
    const user = userEvent.setup(); const remove = jest.fn();
    const { rerender } = render(<TagList label="Étiquettes du projet" items={['Voirie', 'Urgent']} onRemove={remove} />);
    expect(screen.getByRole('list', { name: 'Étiquettes du projet' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Retirer Urgent' })); expect(remove).toHaveBeenCalledWith('Urgent');
    rerender(<TagList label="Étiquettes" items={[]} emptyText="Aucune étiquette" />); expect(screen.getByText('Aucune étiquette')).toBeInTheDocument();
    rerender(<Tag label="Lecture seule" />); expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
  it('names a metric card, shows its trend and a skeleton while loading', () => {
    const { rerender } = render(<MetricCard label="Utilisateurs actifs" value="1 284" icon={Users} trend="up" trendLabel="+12 % ce mois" />);
    const card = screen.getByRole('region', { name: 'Utilisateurs actifs' });
    expect(card).toHaveAttribute('data-trend', 'up'); expect(within(card).getByText('1 284')).toBeInTheDocument(); expect(within(card).getByText('+12 % ce mois')).toBeInTheDocument();
    rerender(<MetricCard label="Utilisateurs actifs" value="1 284" loading />);
    expect(screen.getByRole('region', { name: 'Utilisateurs actifs' })).toHaveAttribute('aria-busy', 'true'); expect(screen.queryByText('1 284')).not.toBeInTheDocument();
  });
  it('exposes a clamped progressbar with its label and percentage', () => {
    const { rerender } = render(<ProgressMeter label="Avancement" value={64.4} tone="success" />);
    const bar = screen.getByRole('progressbar', { name: 'Avancement' });
    expect(bar).toHaveAttribute('aria-valuenow', '64'); expect(screen.getByText('64 %')).toBeInTheDocument();
    rerender(<ProgressMeter label="Avancement" value={140} showValue={false} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100'); expect(screen.queryByText('100 %')).not.toBeInTheDocument();
    rerender(<ProgressMeter label="Avancement" value={Number.NaN} />); expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
  });
});

describe('Panel and PageHeader', () => {
  it('names the panel by its title, shows the action and swaps the content for a DataState', () => {
    const retry = jest.fn();
    const { rerender } = render(<Panel title="Projets récents" description="Les cinq derniers." action={<button>Voir tout</button>}><p>Contenu</p></Panel>);
    const panel = screen.getByRole('region', { name: 'Projets récents' });
    expect(within(panel).getByRole('heading', { level: 2 })).toHaveTextContent('Projets récents');
    expect(within(panel).getByRole('button', { name: 'Voir tout' })).toBeInTheDocument(); expect(within(panel).getByText('Contenu')).toBeInTheDocument();
    rerender(<Panel title="Projets récents" state="loading"><p>Contenu</p></Panel>);
    expect(screen.getByRole('region', { name: 'Projets récents' })).toHaveAttribute('aria-busy', 'true'); expect(screen.queryByText('Contenu')).not.toBeInTheDocument();
    rerender(<Panel title="Projets récents" state="unavailable" stateProps={{ onRetry: retry }}><p>Contenu</p></Panel>);
    fireEvent.click(screen.getByRole('button', { name: 'Réessayer' })); expect(retry).toHaveBeenCalled();
    rerender(<Panel title="Projets récents" state="empty"><p>Contenu</p></Panel>);
    expect(screen.getByText('Aucun élément à afficher.')).toBeInTheDocument();
  });
  it('renders the h1, the subtitle or today’s date, and the actions', () => {
    const { rerender } = render(<PageHeader title="Projets" subtitle="Suivi des dossiers" actions={<button>Nouveau projet</button>} />);
    expect(screen.getByRole('heading', { level: 1, name: 'Projets' })).toBeInTheDocument(); expect(screen.getByText('Suivi des dossiers')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Nouveau projet' })).toBeInTheDocument();
    rerender(<PageHeader title="Tableau de bord" subtitle="Bienvenue Marie" showDate />);
    expect(document.querySelector('.page-current-date')).toBeInTheDocument(); expect(screen.getByText('Bienvenue Marie')).toBeInTheDocument();
    expect(screen.getByRole('heading').parentElement!.parentElement).toHaveAttribute('data-variant', 'with-date');
  });
});

describe('Tabs, SegmentedControl, Pagination', () => {
  it('moves between tabs with the keyboard and skips disabled tabs', async () => {
    const user = userEvent.setup();
    function Host() {
      const [tab, setTab] = React.useState<'users' | 'roles' | 'groups'>('users');
      return <Tabs label="Sections" value={tab} onChange={setTab} items={[{ key: 'users', label: 'Utilisateurs', count: 12 }, { key: 'roles', label: 'Rôles', disabled: true }, { key: 'groups', label: 'Groupes' }]} panels={{ users: <p>Liste des utilisateurs</p>, groups: <p>Liste des groupes</p> }} />;
    }
    const { container } = render(<Host />);
    expect(screen.getByRole('tab', { name: 'Utilisateurs 12' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Liste des utilisateurs');
    screen.getByRole('tab', { name: 'Utilisateurs 12' }).focus(); await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'Groupes' })).toHaveAttribute('aria-selected', 'true'); expect(screen.getByRole('tab', { name: 'Groupes' })).toHaveFocus();
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Liste des groupes');
    await user.keyboard('{ArrowRight}'); expect(screen.getByRole('tab', { name: 'Utilisateurs 12' })).toHaveAttribute('aria-selected', 'true');
    expect((await axe(container)).violations).toEqual([]);
  });
  it('lets a host own the panel with stable ids (MAIR-608 Settings)', () => {
    render(<><Tabs id="settings" hostPanel label="Paramètres" value="profile" onChange={() => undefined} items={[{ key: 'profile', label: 'Profil' }, { key: 'security', label: 'Sécurité' }]} /><div id="settings-panel-profile" role="tabpanel" aria-labelledby="settings-tab-profile">Contenu</div></>);
    expect(screen.getByRole('tab', { name: 'Profil' })).toHaveAttribute('id', 'settings-tab-profile');
    expect(screen.getByRole('tab', { name: 'Profil' })).toHaveAttribute('aria-controls', 'settings-panel-profile');
    expect(screen.getByRole('tab', { name: 'Sécurité' })).not.toHaveAttribute('aria-controls');
    expect(screen.getByRole('tabpanel', { name: 'Profil' })).toHaveTextContent('Contenu');
  });
  it('behaves as a radio group for the view choice', async () => {
    const user = userEvent.setup(); const change = jest.fn();
    render(<SegmentedControl label="Vue des projets" value="kanban" onChange={change} options={[{ key: 'kanban', label: 'Kanban' }, { key: 'table', label: 'Tableau' }]} />);
    expect(screen.getByRole('radiogroup', { name: 'Vue des projets' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Kanban' })).toBeChecked();
    await user.click(screen.getByRole('radio', { name: 'Tableau' })); expect(change).toHaveBeenCalledWith('table');
    fireEvent.keyDown(screen.getByRole('radiogroup'), { key: 'ArrowRight' }); expect(change).toHaveBeenLastCalledWith('table');
  });
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

describe('DataTable and DateTime', () => {
  type Row = { id: string; name: string; role: string };
  const rows: Row[] = [{ id: '1', name: 'Marie Martin', role: 'Admin' }, { id: '2', name: 'Paul Durand', role: 'Agent' }];
  const columns = [{ key: 'name', header: 'Nom', sortable: true }, { key: 'role', header: 'Rôle' }, { key: 'actions', header: 'Actions', hideHeader: true, cell: (row: Row) => <button>Modifier {row.name}</button> }];
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
  it('formats dates in the instance time zone, relatively, and says Indisponible for an invalid value', () => {
    const now = new Date('2026-10-21T09:12:00Z');
    expect(formatDateTime('2026-10-21T07:12:00Z', 'short', 'Europe/Paris')).toBe('21/10/2026 09:12');
    expect(formatDateTime('2026-10-21T07:12:00Z', 'dateOnly', 'Europe/Paris')).toBe('21 octobre 2026');
    expect(formatRelative(new Date('2026-10-21T09:07:00Z'), now)).toBe('il y a 5 minutes');
    expect(formatRelative(new Date('2026-10-23T09:12:00Z'), now)).toBe('après-demain');
    expect(formatRelative(new Date('2026-10-21T09:11:50Z'), now)).toBe('à l’instant');
    const { rerender } = render(<DateTime value="2026-10-21T07:12:00Z" format="relative" now={now} timeZone="Europe/Paris" />);
    const time = screen.getByText('il y a 2 heures');
    expect(time.tagName).toBe('TIME'); expect(time).toHaveAttribute('datetime', '2026-10-21T07:12:00.000Z'); expect(time).toHaveAttribute('title', expect.stringContaining('21 octobre 2026'));
    rerender(<DateTime value="pas une date" />); expect(screen.getByText('Indisponible')).toHaveAttribute('data-format', 'unavailable');
    rerender(<DateTime value={null} unavailableText="—" />); expect(screen.getByText('—')).toBeInTheDocument();
  });
});
