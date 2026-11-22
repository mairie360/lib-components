import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import { Card } from '../components/Card';
import { KanbanColumn } from '../components/KanbanColumn';

const cards = ['Relevé des compteurs', 'Devis de la toiture', 'Commande des luminaires'];
const meta = {
  title: 'Components/Display/KanbanColumn',
  component: KanbanColumn,
  tags: ['autodocs'],
  args: { className: 'w-[300px]', title: 'En cours', tone: 'info', count: cards.length, onAdd: fn(), collapsible: true, onCollapsedChange: fn(), children: cards.map(card => <Card key={card}>{card}</Card>) },
} satisfies Meta<typeof KanbanColumn>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Empty: Story = { args: { title: 'Bloqué', tone: 'danger', count: 0, children: undefined } };
export const DropTarget: Story = { args: { dropActive: true } };
export const Collapsed: Story = { args: { defaultCollapsed: true } };

function Board() {
  const [folded, setFolded] = React.useState(false);
  return (
    <div className="flex items-start gap-3">
      <KanbanColumn className="w-[280px]" title="À faire" count={1}><Card>Rédiger l’arrêté</Card></KanbanColumn>
      <KanbanColumn className="w-[280px]" title="En cours" tone="info" count={2} collapsible collapsed={folded} onCollapsedChange={setFolded}><Card>Devis de la toiture</Card><Card>Relevé des compteurs</Card></KanbanColumn>
      <KanbanColumn className="w-[280px]" title="Terminé" tone="success" count={0} />
    </div>
  );
}
export const OnABoard: Story = { render: () => <Board /> };
