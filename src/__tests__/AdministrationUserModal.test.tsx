import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AdministrationUserModal } from '../components/AdministrationUserModal';
import { axe } from 'jest-axe';
it('submits entered user values and supports explicit cancellation', async () => {
  const user = userEvent.setup(); const onCancel = jest.fn(); const onCreateUser = jest.fn(); const { container } = render(<AdministrationUserModal isOpen onCancel={onCancel} onCreateUser={onCreateUser} />);
  await user.type(screen.getByLabelText('Nom complet'), 'Anne Marie'); await user.type(screen.getByLabelText('Email'), 'anne@mairie.test'); await user.type(screen.getByLabelText('Service'), 'Accueil'); await user.type(screen.getByLabelText('Téléphone'), '0123456789');
  await user.click(screen.getByRole('button', { name: 'Créer' })); expect(onCreateUser).toHaveBeenCalledWith({ name: 'Anne Marie', email: 'anne@mairie.test', service: 'Accueil', phone: '0123456789', role: 'user' }); await user.click(screen.getByRole('button', { name: 'Annuler' })); expect(onCancel).toHaveBeenCalledTimes(1); expect((await axe(container)).violations).toEqual([]);
});
