import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { AdministrationUsersTable } from '../components/AdministrationUsersTable';
import { defaultAdministrationUsers as users } from '../stories/administrationFixtures';
it('renders authoritative records and delegates explicit actions without manufacturing data', async () => { const onEditUser = jest.fn(); const onDeleteUser = jest.fn(); const onToggleUserStatus = jest.fn(); const { container } = render(<AdministrationUsersTable users={[users[0]]} onEditUser={onEditUser} onDeleteUser={onDeleteUser} onToggleUserStatus={onToggleUserStatus} />); const user = userEvent.setup(); await user.click(screen.getByRole('button', { name: `Actions pour ${users[0].name}` })); await user.click(screen.getByRole('menuitem', { name: 'Modifier' })); expect(onEditUser).toHaveBeenCalledWith(users[0]); await user.click(screen.getByRole('button', { name: `Actions pour ${users[0].name}` })); await user.click(screen.getByRole('menuitem', { name: 'Supprimer' })); expect(onDeleteUser).toHaveBeenCalledWith(users[0]); expect((await axe(container)).violations).toEqual([]); });
