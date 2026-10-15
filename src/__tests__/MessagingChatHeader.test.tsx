import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MessagingChatHeader } from '../components/MessagingChatHeader';
import { axe } from 'jest-axe';
it('delegates explicit call actions for the selected contact and omits unavailable actions', async () => {
  const conversation = { id: 1, name: 'Anne Marie', presence: 'online' as const }; const onCall = jest.fn(); const onVideoCall = jest.fn(); const { container, rerender } = render(<MessagingChatHeader conversation={conversation} onCall={onCall} onVideoCall={onVideoCall} />);
  await userEvent.click(screen.getByRole('button', { name: 'Appeler' })); await userEvent.click(screen.getByRole('button', { name: 'Appel vidéo' })); expect(onCall).toHaveBeenCalledWith(conversation); expect(onVideoCall).toHaveBeenCalledWith(conversation); expect((await axe(container)).violations).toEqual([]); rerender(<MessagingChatHeader conversation={conversation} />); expect(screen.queryByRole('button', { name: 'Appeler' })).not.toBeInTheDocument();
});
