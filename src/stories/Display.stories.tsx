import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { Users } from 'lucide-react';
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
export const Progress: Story = { render: () => <div className="flex w-80 flex-col gap-4"><ProgressMeter label="Avancement" value={64} /><ProgressMeter label="Budget consommé" value={92} tone="warning" size="l" /><ProgressMeter label="Tâches" value={100} tone="success" size="s" /></div> };
export const PanelStates: Story = { render: () => <div className="grid w-[900px] grid-cols-2 gap-4"><Panel title="Projets récents" description="Les cinq derniers." action={<CreateButton size="s" />}><p>Contenu du panneau</p></Panel><Panel title="Chargement" state="loading" /><Panel title="Vide" state="empty" stateProps={{ onCreate: fn() }} /><Panel title="Indisponible" state="unavailable" stateProps={{ onRetry: fn() }} /></div> };
export const Header: Story = { render: () => <div className="flex w-[800px] flex-col gap-6"><PageHeader title="Projets" subtitle="Suivi des dossiers de la commune" actions={<CreateButton label="Nouveau projet" />} /><PageHeader title="Tableau de bord" showDate /></div> };
function TabsHost() { const [tab, setTab] = React.useState('users'); return <Tabs label="Sections" value={tab} onChange={setTab} items={[{ key: 'users', label: 'Utilisateurs', count: 12 }, { key: 'roles', label: 'Rôles' }, { key: 'groups', label: 'Groupes' }]} panels={{ users: <p>Utilisateurs</p>, roles: <p>Rôles</p>, groups: <p>Groupes</p> }} />; }
function SegmentHost() { const [view, setView] = React.useState('kanban'); return <SegmentedControl label="Vue des projets" value={view} onChange={setView} options={[{ key: 'kanban', label: 'Kanban' }, { key: 'table', label: 'Tableau' }]} />; }
export const Navigation: Story = { render: () => <div className="flex w-[600px] flex-col gap-6"><TabsHost /><SegmentHost /><Pagination page={2} pageSize={20} total={128} onChange={fn()} itemsLabel="utilisateurs" /></div> };
type Row = { id: string; name: string; status: keyof typeof statuses; created: string };
const rows: Row[] = [{ id: '1', name: 'Marie Martin', status: 'active', created: '2026-10-21T07:12:00Z' }, { id: '2', name: 'Paul Durand', status: 'invited', created: '2026-10-19T15:40:00Z' }];
export const Table: Story = { render: () => <div className="w-[800px]"><DataTable label="Utilisateurs" rows={rows} rowKey={(row) => row.id} sort={{ key: 'name', direction: 'asc' }} onSort={fn()} columns={[{ key: 'name', header: 'Nom', sortable: true }, { key: 'status', header: 'État', cell: (row) => <StatusBadge status={row.status} size="s" /> }, { key: 'created', header: 'Créé le', cell: (row) => <DateTime value={row.created} format="relative" /> }]} /></div> };
export const Skeletons: Story = { render: () => <div className="flex w-[500px] flex-col gap-6"><Skeleton.TextBlock /><Skeleton.Card /><Skeleton.TableRow /><Skeleton.UserIdentity /><div className="flex gap-3">{sizes.map((size) => <Skeleton key={size} shape="circle" size={size} />)}</div></div> };
