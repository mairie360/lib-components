import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { Bell, History, Lock, MapPin, MonitorSmartphone, ShieldCheck, Users } from 'lucide-react';
import React from 'react';

import { PriorityPill, StatusBadge, StatusPill, statuses } from '../components/StatusPill';
import { TagList } from '../components/Tag';
import { MetricCard } from '../components/MetricCard';
import { ProgressMeter } from '../components/ProgressMeter';
import { Panel } from '../components/Panel';
import { PageHeader } from '../components/PageHeader';
import { Tabs } from '../components/Tabs';
import { SegmentedControl } from '../components/SegmentedControl';
import { Pagination } from '../components/Pagination';
import { DataTable } from '../components/DataTable';
import { DateTime } from '../components/DateTime';
import { Skeleton } from '../components/Skeleton';
import { CreateButton } from '../components/ButtonPresets';
import { EditIconButton, IconButton } from '../components/IconButton';
import { sizes, tones } from '../kit/theme';

const meta = { title: 'Components/Display/StatusPill', component: StatusPill, tags: ['autodocs'], args: { label: 'Statut', tone: 'neutral', size: 'm', dot: true } } satisfies Meta<typeof StatusPill>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const TonesAndSizes: Story = { render: (args) => <div className="flex flex-col gap-3">{sizes.map((size) => <div key={size} className="flex flex-wrap gap-2">{tones.map((tone) => <StatusPill key={tone} {...args} tone={tone} size={size} label={`${tone} ${size}`} />)}</div>)}</div> };
/** Figma Status/* and Priority/*: one colour per business status in every front. */
export const BusinessStatuses: Story = { render: () => <div className="flex flex-wrap gap-2">{(Object.keys(statuses) as Array<keyof typeof statuses>).map((status) => <StatusBadge key={status} status={status} />)}<PriorityPill level="high" /><PriorityPill level="medium" /><PriorityPill level="low" /></div> };
export const Tags: Story = { render: () => <TagList label="Étiquettes du projet" items={['Voirie', 'Urgent', 'Budget 2026']} onRemove={fn()} /> };
export const Metrics: Story = { render: () => <div className="grid grid-cols-3 gap-4"><MetricCard label="Utilisateurs actifs" value="1 284" icon={Users} trend="up" trendLabel="+12 % ce mois" /><MetricCard label="Projets en retard" value="7" trend="down" trendLabel="-3 cette semaine" size="s" /><MetricCard label="Sessions" value="42" loading /></div> };
export const Progress: Story = { render: () => <div className="flex w-full max-w-80 flex-col gap-4"><ProgressMeter label="Avancement" value={64} /><ProgressMeter label="Budget consommé" value={92} tone="warning" size="l" /><ProgressMeter label="Tâches" value={100} tone="success" size="s" /></div> };
export const PanelStates: Story = { render: () => <div className="grid w-full max-w-[900px] grid-cols-1 gap-4 sm:grid-cols-2"><Panel title="Projets récents" description="Les cinq derniers." action={<CreateButton size="s" />}><p>Contenu du panneau</p></Panel><Panel title="Chargement" state="loading" /><Panel title="Vide" state="empty" stateProps={{ onCreate: fn() }} /><Panel title="Indisponible" state="unavailable" stateProps={{ onRetry: fn() }} /></div> };
export const Header: Story = { render: () => <div className="flex w-full max-w-[800px] flex-col gap-6"><PageHeader title="Projets" subtitle="Suivi des dossiers de la commune" actions={<CreateButton label="Nouveau projet" />} /><PageHeader title="Tableau de bord" showDate /></div> };
function TabsHost() { const [tab, setTab] = React.useState('users'); return <Tabs label="Sections" value={tab} onChange={setTab} items={[{ key: 'users', label: 'Utilisateurs', count: 12 }, { key: 'roles', label: 'Rôles' }, { key: 'groups', label: 'Groupes' }]} panels={{ users: <p>Utilisateurs</p>, roles: <p>Rôles</p>, groups: <p>Groupes</p> }} />; }
function SegmentHost() { const [view, setView] = React.useState('kanban'); return <SegmentedControl label="Vue des projets" value={view} onChange={setView} options={[{ key: 'kanban', label: 'Kanban' }, { key: 'table', label: 'Tableau' }]} />; }
export const Navigation: Story = { render: () => <div className="flex w-full max-w-[600px] flex-col gap-6"><TabsHost /><SegmentHost /><Pagination page={2} pageSize={20} total={128} onChange={fn()} itemsLabel="utilisateurs" /></div> };
type Row = { id: string; name: string; status: keyof typeof statuses; created: string };
const rows: Row[] = [{ id: '1', name: 'Marie Martin', status: 'active', created: '2026-10-21T07:12:00Z' }, { id: '2', name: 'Paul Durand', status: 'invited', created: '2026-10-19T15:40:00Z' }];
export const Table: Story = { render: () => <div className="w-full max-w-[800px]"><DataTable label="Utilisateurs" rows={rows} rowKey={(row) => row.id} sort={{ key: 'name', direction: 'asc' }} onSort={fn()} onRowClick={fn()} rowLabel={(row) => `Ouvrir la fiche de ${row.name}`} columns={[{ key: 'name', header: 'Nom', sortable: true, kind: 'strong' }, { key: 'status', header: 'État', cell: (row) => <StatusBadge status={row.status} size="s" /> }, { key: 'created', header: 'Créé le', cell: (row) => <DateTime value={row.created} format="relative" /> }]} /></div> };
export const Skeletons: Story = { render: () => <div className="flex w-full max-w-[500px] flex-col gap-6"><Skeleton.TextBlock /><Skeleton.Card /><Skeleton.TableRow /><Skeleton.UserIdentity /><div className="flex flex-wrap gap-3">{sizes.map((size) => <Skeleton key={size} shape="circle" size={size} />)}</div></div> };

/** MAIR-1114: icon chip left of the title, radius 16 in every state, `fill` = same height in a grid row (actions at the bottom). */
export const PanelWithIcon: Story = {
  render: () => (
    <div className="grid w-full max-w-[900px] grid-cols-1 items-stretch gap-4 sm:grid-cols-2">
      <Panel title="Sécurité" description="Mot de passe et double authentification." icon={ShieldCheck} fill>
        <div className="flex h-full flex-col justify-between gap-4"><p>Dernière modification il y a 3 mois.</p><div><CreateButton label="Changer le mot de passe" size="s" /></div></div>
      </Panel>
      <Panel title="Notifications" description="Ce que vous recevez." icon={Bell} fill>
        <div className="flex h-full flex-col justify-between gap-4"><p>Courriels et notifications dans l’application.</p><p>Trois types activés.</p><div><CreateButton label="Gérer" size="s" /></div></div>
      </Panel>
      <Panel title="Chargement" icon={Bell} state="loading" />
      <Panel title="Indisponible" icon={Bell} state="unavailable" stateProps={{ onRetry: fn() }} />
    </div>
  ),
};
/** MAIR-1115: module colours on the track. */
export const ProgressModules: Story = {
  render: () => (
    <div className="flex w-full max-w-80 flex-col gap-4">
      {(['module-dashboard', 'module-projects', 'module-calendar', 'module-messaging', 'module-training'] as const).map((tone, index) => <ProgressMeter key={tone} label={tone} value={30 + index * 15} tone={tone} />)}
    </div>
  ),
};
/** MAIR-1117: inline layout, four in a row at 1440 px, two under 1100 px, one under 640 px. */
export const MetricsInline: Story = {
  render: () => (
    <div className="grid w-full grid-cols-1 gap-4 min-[640px]:grid-cols-2 min-[1100px]:grid-cols-4">
      <MetricCard layout="inline" label="Sessions actives" value="3" icon={MonitorSmartphone} />
      <MetricCard layout="inline" label="Autres appareils connectés" value="2" icon={MonitorSmartphone} iconTone="module" iconColor="calendar" />
      <MetricCard layout="inline" label="Connexions ce mois" value="41" icon={History} />
      <MetricCard layout="inline" label="Localisation habituelle" value="Saint-André" icon={MapPin} />
    </div>
  ),
};
function ClickableMetrics() {
  const [filter, setFilter] = React.useState<string | null>('late');
  const toggle = (key: string) => setFilter(current => (current === key ? null : key));
  return (
    <div className="grid w-full max-w-[900px] grid-cols-1 gap-4 sm:grid-cols-3">
      <MetricCard label="En retard" value="4" active={filter === 'late'} onClick={() => toggle('late')} />
      <MetricCard label="À valider" value="12" active={filter === 'review'} onClick={() => toggle('review')} />
      <MetricCard layout="inline" label="Sessions actives" value="3" icon={MonitorSmartphone} href="#sessions" />
    </div>
  );
}
/** MAIR-1140: a card is a button (`onClick`, `active` = pressed filter) or a link (`href`), named « Libellé : valeur ». */
export const MetricsClickable: Story = { render: () => <ClickableMetrics /> };
/** MAIR-1113: the welcome header of the dashboard (34 px title, the page's single h1). */
export const WelcomeHeader: Story = { render: () => <div className="w-full max-w-[800px]"><PageHeader variant="welcome" title="Bonjour Marie" subtitle="Voici ce qui vous attend aujourd’hui." showDate /></div> };
function PillTabsHost() {
  const [tab, setTab] = React.useState('profile');
  return <Tabs variant="pill" sticky label="Paramètres" value={tab} onChange={setTab} items={[{ key: 'profile', label: 'Profil' }, { key: 'security', label: 'Sécurité' }, { key: 'notifications', label: 'Notifications', count: 3 }, { key: 'sessions', label: 'Sessions' }]} panels={{ profile: <p>Profil</p>, security: <p>Sécurité</p>, notifications: <p>Notifications</p>, sessions: <p>Sessions</p> }} />;
}
/** MAIR-1111: floating bar, the active pill slides to the selected tab (no motion under reduced motion); arrow keys move. */
export const PillTabs: Story = { render: () => <div className="w-full max-w-[700px]"><PillTabsHost /></div> };
type Agent = { id: string; name: string; service: string; seen: number | null };
const agents: Agent[] = [
  { id: '1', name: 'Paul Durand', service: 'Urbanisme', seen: 12 },
  { id: '2', name: 'Élise Bernard', service: '', seen: null },
  { id: '3', name: 'Marie Martin', service: 'État civil', seen: 41 },
];
/**
 * MAIR-1129: sortable headers (first click ascending, second descending, empty values last, `aria-sort`).
 * MAIR-1112: hover a row then the pencil or the lock: the hovered IconButton takes the surface and an inset border.
 */
export const SortableTable: Story = {
  render: () => (
    <div className="w-full max-w-[800px]">
      <DataTable label="Agents" sortable onSortChange={fn()} rows={agents} rowKey={(row) => row.id} onRowClick={fn()} rowLabel={(row) => `Ouvrir la fiche de ${row.name}`}
        columns={[
          { key: 'name', header: 'Nom', kind: 'strong' },
          { key: 'service', header: 'Service' },
          { key: 'seen', header: 'Connexions', align: 'end' },
          { key: 'actions', header: 'Actions', kind: 'actions', hideHeader: true, sortable: false, cell: (row) => <><EditIconButton size="s" label={`Modifier ${row.name}`} onClick={fn()} /><IconButton icon={Lock} size="s" label={`Suspendre ${row.name}`} onClick={fn()} /></> },
        ]} />
    </div>
  ),
};
