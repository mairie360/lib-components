import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CreateGroupModal } from '../components/CreateGroupModal';
import { axe } from 'jest-axe';
it('creates a named group with the selected received members only', async () => {
  const user = userEvent.setup(); const onCreateGroup = jest.fn().mockResolvedValue(true); const { container } = render(<CreateGroupModal isOpen members={[{ id: 1, name: 'Anne Marie' }]} onCancel={jest.fn()} onCreateGroup={onCreateGroup} />); await user.type(screen.getByLabelText('Nom du groupe'), 'Accueil'); await user.click(screen.getByRole('checkbox', { name: /Anne Marie/ })); await user.click(screen.getByRole('button', { name: 'Créer le groupe' })); expect(onCreateGroup).toHaveBeenCalledWith({ name: 'Accueil', description: undefined, memberIds: [1] }); expect((await axe(container)).violations).toEqual([]);
});
