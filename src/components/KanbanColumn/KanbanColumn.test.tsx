import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';

import { KanbanColumn } from './KanbanColumn';

// MAIR-1130: Figma `Base/KanbanColumn`.
describe('MAIR-1130 KanbanColumn', () => {
  it('names the column by its title and count, and adds a card with « + »', async () => {
    const user = userEvent.setup(); const add = jest.fn();
    const { container } = render(<KanbanColumn title="En cours" tone="info" count={2} onAdd={add}><article>Relevé des compteurs</article><article>Devis toiture</article></KanbanColumn>);
    expect(screen.getByRole('region', { name: 'En cours , 2 cartes' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Ajouter dans En cours' }));
    expect(add).toHaveBeenCalledTimes(1);
    expect((await axe(container)).violations).toEqual([]);
  });

  it('folds up to its header, hides the content from the tab order and assistive technology', async () => {
    const user = userEvent.setup(); const change = jest.fn();
    const { container } = render(<KanbanColumn title="À faire" collapsible onCollapsedChange={change}><button type="button">Carte</button></KanbanColumn>);
    const toggle = screen.getByRole('button', { name: 'Replier la colonne À faire' });
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await user.click(toggle);
    expect(change).toHaveBeenCalledWith(true);
    const content = container.querySelector<HTMLElement>('[data-kanban-content]')!;
    expect(content).toHaveAttribute('aria-hidden', 'true');
    expect(content).toHaveAttribute('inert');
    expect(content.style.gridTemplateRows).toBe('0fr');
    expect(content).toHaveClass('motion-reduce:transition-none');
    expect(screen.getByRole('button', { name: 'Déplier la colonne À faire' })).toHaveAttribute('aria-expanded', 'false');
    expect((await axe(container)).violations).toEqual([]);
  });

  it('follows a controlled fold state', async () => {
    const user = userEvent.setup(); const change = jest.fn();
    render(<KanbanColumn title="Terminé" collapsible collapsed onCollapsedChange={change} />);
    await user.click(screen.getByRole('button', { name: 'Déplier la colonne Terminé' }));
    expect(change).toHaveBeenCalledWith(false);
    expect(screen.getByRole('button', { name: 'Déplier la colonne Terminé' })).toBeInTheDocument();
  });

  it('shows the empty label, the footer and the drop target, folded or not', () => {
    const { container, rerender } = render(<KanbanColumn title="Bloqué" footer={<button type="button">Ajouter une carte</button>} />);
    expect(screen.getByText('Aucune carte')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ajouter une carte' })).toBeInTheDocument();
    rerender(<KanbanColumn title="Bloqué" collapsible collapsed dropActive emptyLabel="Rien de bloqué" />);
    expect(screen.getByRole('status')).toHaveTextContent('Déposez ici');
    expect(container.firstElementChild).toHaveAttribute('data-drop-active', 'true');
    expect(container.firstElementChild).toHaveClass('border-dashed');
  });
});
