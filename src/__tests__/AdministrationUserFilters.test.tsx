import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AdministrationUserFilters } from '../components/AdministrationUserFilters';
import { axe } from 'jest-axe';
it('delegates a typed search and new-user action, with labeled filter controls', async () => {
  const onSearchChange = jest.fn(); const onNewUserClick = jest.fn(); const { container } = render(<AdministrationUserFilters onSearchChange={onSearchChange} onNewUserClick={onNewUserClick} />); fireEvent.change(screen.getByRole('searchbox', { name: 'Rechercher un utilisateur' }), { target: { value: 'Anne' } }); expect(onSearchChange).toHaveBeenCalledWith('Anne'); await userEvent.click(screen.getByRole('button', { name: 'Nouveau' })); expect(onNewUserClick).toHaveBeenCalledTimes(1); expect((await axe(container)).violations).toEqual([]);
});
