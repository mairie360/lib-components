import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MiniCard } from '../components/MiniCard';
import { axe } from 'jest-axe';

it('activates the card with keyboard and keeps its explicitly named open action', async () => {
  const user = userEvent.setup(); const onClick = jest.fn(); const onOpen = jest.fn(); const { container } = render(<MiniCard title="Projet" description="Travaux" label="Consulter" onClick={onClick} onOpen={onOpen} />);
  const card = screen.getByRole('button', { name: 'Carte projet : Projet' }); card.focus(); await user.keyboard('{Enter} '); expect(onClick).toHaveBeenCalledTimes(2);
  await user.click(screen.getByRole('button', { name: 'Consulter' })); expect(onOpen).toHaveBeenCalledTimes(1); expect(onClick).toHaveBeenCalledTimes(2);
  expect((await axe(container)).violations).toEqual([]);
});
it('confirms deletion and dismisses its action menu outside', async () => {
  const user = userEvent.setup(); const onDelete = jest.fn(); const onEdit = jest.fn(); render(<MiniCard title="Projet" onDelete={onDelete} onEdit={onEdit} />);
  await user.click(screen.getByRole('button', { name: 'Afficher plus d’options' })); await user.click(screen.getByRole('button', { name: 'Modifier' })); expect(onEdit).toHaveBeenCalledTimes(1);
  await user.click(screen.getByRole('button', { name: 'Afficher plus d’options' })); await user.click(document.body); expect(screen.queryByRole('button', { name: 'Modifier' })).not.toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Afficher plus d’options' })); await user.click(screen.getByRole('button', { name: 'Supprimer' })); expect(onDelete).not.toHaveBeenCalled(); await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Supprimer' })); expect(onDelete).toHaveBeenCalledTimes(1);
});
