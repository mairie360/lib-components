import type { Meta, StoryObj } from '@storybook/nextjs';
import { fn } from 'storybook/test';
import React, { useState } from 'react';

import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';

import { SortableItem } from '../components/SortableItem';

/**
 * Meta configuration pour le composant `SortableItem`.
 *
 * Cette configuration est utilisée par Storybook pour générer
 * automatiquement la documentation de `SortableItem`.
 * Elle précise :
 * - title : L'organisation du composant dans l'arborescence Storybook.
 * - component : Le composant concerné.
 * - tags : Pour activer l'autodocumentation.
 * - parameters : Config visuelle (ex: layout).
 * - args : Props par défaut passées au composant.
 */
const meta = {
  title: 'Components/Items/SortableItem',
  component: SortableItem,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  args: {
    id: 'item-1',
    title: 'Item Title',
    description: 'Item Description',
    onDelete: fn(),
    onEdit: fn(),
  },
} satisfies Meta<typeof SortableItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => {
    return (
      <DndContext>
        <SortableContext items={[args.id]} strategy={verticalListSortingStrategy}>
          <SortableItem {...args} />
        </SortableContext>
      </DndContext>
    );
  },
};


export const MultipleItems: Story = {
  render: () => {
    const [items, setItems] = useState(['item-1', 'item-2', 'item-3']);

    const handleDragEnd = (event: DragEndEvent) => {
      const { active, over } = event;
      if (over && active.id !== over.id) {
        const oldIndex = items.indexOf(active.id as string);
        const newIndex = items.indexOf(over.id as string);
        setItems(arrayMove(items, oldIndex, newIndex));
      }
    };

    return (
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-2 w-[300px]">
            {items.map((id) => (
              <SortableItem
                key={id}
                id={id}
                title={`Item ${id}`}
                description="Déplace-moi !"
                onDelete={fn()}
                onEdit={fn()}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    );
  },
};
