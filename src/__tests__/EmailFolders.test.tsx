import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EmailFolders } from '../components/EmailFolders';
import { axe } from 'jest-axe';
it('delegates folder, search and compose choices through named controls', async () => {
  const onSelect = jest.fn(); const onSearchChange = jest.fn(); const onCompose = jest.fn(); const { container } = render(<EmailFolders activeFolder="inbox" search="" folders={[{ id: 'inbox', label: 'Reçus' }, { id: 'drafts', label: 'Brouillons', count: 2 }]} onSelect={onSelect} onSearchChange={onSearchChange} onCompose={onCompose} />); expect(screen.getByRole('button', { name: 'Reçus' })).toHaveAttribute('aria-current', 'page'); await userEvent.click(screen.getByRole('button', { name: /Brouillons/ })); expect(onSelect).toHaveBeenCalledWith('drafts'); fireEvent.change(screen.getByLabelText('Rechercher des e-mails'), { target: { value: 'Conseil' } }); expect(onSearchChange).toHaveBeenCalledWith('Conseil'); await userEvent.click(screen.getByRole('button', { name: 'Nouveau message' })); expect(onCompose).toHaveBeenCalledTimes(1); expect((await axe(container)).violations).toEqual([]);
});
