import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EmailComposeModal } from '../components/EmailComposeModal';
import { axe } from 'jest-axe';
it('validates recipients before delegating the composed message', async () => {
  const user = userEvent.setup(); const onSend = jest.fn(); const { container } = render(<EmailComposeModal isOpen onCancel={jest.fn()} onSend={onSend} />); await user.click(screen.getByRole('button', { name: 'Envoyer' })); expect(screen.getByRole('alert')).toHaveTextContent('Saisissez une adresse e-mail valide.'); expect(onSend).not.toHaveBeenCalled(); await user.type(screen.getByLabelText('À'), 'anne@mairie.test'); await user.type(screen.getByLabelText('Objet'), 'Conseil'); await user.type(screen.getByLabelText('Message'), 'Bonjour'); await user.click(screen.getByRole('button', { name: 'Envoyer' })); expect(onSend).toHaveBeenCalledWith({ to: 'anne@mairie.test', subject: 'Conseil', body: 'Bonjour', attachments: [] }); expect((await axe(container)).violations).toEqual([]);
});
