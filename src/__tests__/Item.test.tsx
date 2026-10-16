import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Item } from '../components/Item';
import { axe } from 'jest-axe';

it('opens by mouse and keyboard without swallowing its own activation', async () => {
  const user = userEvent.setup(); const onClick = jest.fn(); const { container } = render(<Item title="Conseil" description="Préparer la séance" onClick={onClick} />);
  const open = screen.getByRole('button', { name: 'Ouvrir Conseil' }); await user.click(open); await user.keyboard('{Enter} ');
  expect(onClick).toHaveBeenCalledTimes(3); expect((await axe(container)).violations).toEqual([]);
});
it('keeps editing and deletion separate from opening, requires confirmation and dismisses outside', async () => {
  const user = userEvent.setup(); const onClick = jest.fn(); const onEdit = jest.fn(); const onDelete = jest.fn();
  render(<Item title="Conseil" onClick={onClick} onEdit={onEdit} onDelete={onDelete} />);
  await user.click(screen.getByRole('button', { name: 'Afficher plus d’options' })); await user.click(screen.getByRole('button', { name: 'Modifier' })); expect(onEdit).toHaveBeenCalledTimes(1); expect(onClick).not.toHaveBeenCalled();
  await user.click(screen.getByRole('button', { name: 'Afficher plus d’options' })); await user.click(document.body); expect(screen.queryByRole('button', { name: 'Modifier' })).not.toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Afficher plus d’options' })); await user.click(screen.getByRole('button', { name: 'Supprimer' })); expect(onDelete).not.toHaveBeenCalled();
  await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Annuler' })); expect(onDelete).not.toHaveBeenCalled();
  await user.click(screen.getByRole('button', { name: 'Afficher plus d’options' })); await user.click(screen.getByRole('button', { name: 'Supprimer' })); await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Supprimer' })); expect(onDelete).toHaveBeenCalledTimes(1);
});
