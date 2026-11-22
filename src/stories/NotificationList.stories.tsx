import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import { Button } from '../components/Button';
import type { NotificationItem } from '../components/NotificationCenter';
import { NotificationList } from '../components/NotificationList';

const now = new Date('2026-11-19T18:00:00');
const items: NotificationItem[] = [
  { id: 'n1', category: 'messages', title: 'Nouveau message de Léa Roux', message: '« Le devis de l’éclairage public est arrivé, je te le transmets. »', read: false, clickable: true, href: '/messagerie/conversations/lea-roux', date: '2026-11-19T17:46:00' },
  { id: 'n2', category: 'projects', title: 'Tâche assignée : relevé des compteurs', message: 'Projet Rénovation de l’école Jules-Ferry, échéance vendredi 27 novembre.', read: false, clickable: true, href: '/projets/ecole-jules-ferry/taches/42', date: '2026-11-19T17:15:00' },
  { id: 'n3', category: 'calendar', title: 'Réunion du conseil déplacée', message: 'Jeudi 26 novembre à 18 h 30, salle du conseil.', read: false, clickable: true, href: '/calendrier/evenements/conseil-2026-11-26', date: '2026-11-19T16:50:00' },
  { id: 'n4', category: 'other', title: 'Maintenance ce soir', message: 'La messagerie sera indisponible de 22 h à 22 h 15.', read: false, date: '2026-11-19T15:40:00' },
  { id: 'n5', category: 'projects', title: 'Devis validé', message: 'École Jules-Ferry : toiture.', read: true, clickable: true, href: '/projets/ecole-jules-ferry', date: '2026-11-18T09:30:00' },
  { id: 'n6', category: 'calendar', title: 'Invitation acceptée', message: 'Sophie Lefèvre participera à la commission voirie.', read: true, clickable: true, href: '/calendrier/evenements/commission-voirie', date: '2026-10-27T14:20:00' },
  { id: 'n7', category: 'messages', title: 'Mention dans #urbanisme', message: 'Claire Martin vous a mentionné à propos du PLU.', read: true, clickable: true, href: '/messagerie/canaux/urbanisme', date: '2026-10-25T09:10:00' },
];

const meta = {
  title: 'Components/Feedback/NotificationList',
  component: NotificationList,
  tags: ['autodocs'],
  args: { items, now, variant: 'panel', state: 'ready', onNavigate: fn(), onMarkRead: fn(), onMarkAllRead: fn(), onRetry: fn(), onClose: fn() },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof NotificationList>;
export default meta;
type Story = StoryObj<typeof meta>;

/** The popover of the bell: 360 px, five rows, then « Afficher plus ». */
export const Panel: Story = { args: { limit: 5 } };
/** The « Toutes les notifications » page. */
export const Page: Story = { args: { variant: 'page', onClose: undefined } };
export const Loading: Story = { args: { state: 'loading' } };
export const Empty: Story = { args: { items: [], variant: 'page' } };
export const Failure: Story = { args: { state: 'error' } };

/** Marks rows read as the front would: click a row, « Marquer comme lu » or « Tout marquer comme lu ». */
function Live() {
  const [list, setList] = React.useState(items);
  const markRead = (ids: string[]) => setList(current => current.map(item => (ids.includes(item.id) ? { ...item, read: true } : item)));
  return <NotificationList items={list} now={now} variant="page" onMarkRead={markRead} onNavigate={() => undefined} />;
}
export const Interactive: Story = { render: () => <Live /> };

function DrawerHost() {
  const [open, setOpen] = React.useState(false);
  return <><Button label="Ouvrir les notifications" variant="outline" onClick={() => setOpen(true)} /><NotificationList items={items} now={now} variant="drawer" open={open} onClose={() => setOpen(false)} onMarkRead={fn()} /></>;
}
export const Drawer: Story = { render: () => <DrawerHost /> };
