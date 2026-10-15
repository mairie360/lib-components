import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DndContext } from '@dnd-kit/core';
import { SortableContext } from '@dnd-kit/sortable';
import { SortableItem } from '../components/SortableItem';
import { axe } from 'jest-axe';

it('keeps the item accessible and forwards its open action within a real sortable context', async () => {
  const onClick = jest.fn(); const { container } = render(<DndContext><SortableContext items={['a']}><SortableItem id="a" title="Conseil" description="Séance" onClick={onClick} /></SortableContext></DndContext>);
  await userEvent.click(screen.getByRole('button', { name: 'Ouvrir Conseil' })); expect(onClick).toHaveBeenCalledTimes(1); expect((await axe(container)).violations).toEqual([]);
});

it('starts and cancels a keyboard drag from its dedicated handle', async () => {
  const onDragStart = jest.fn(); const onDragCancel = jest.fn(); const user = userEvent.setup();
  render(<DndContext onDragStart={onDragStart} onDragCancel={onDragCancel}><SortableContext items={['a']}><SortableItem id="a" title="Conseil" /></SortableContext></DndContext>);
  screen.getByRole('button', { name: 'Déplacer Conseil' }).focus(); await user.keyboard(' ');
  expect(onDragStart).toHaveBeenCalledTimes(1); await user.keyboard('{Escape}'); expect(onDragCancel).toHaveBeenCalledTimes(1);
});
