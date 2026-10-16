import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EmailMessageList } from '../components/EmailMessageList';
import { defaultEmailMessages } from '../components/email/defaultData';
import { axe } from 'jest-axe';
it('keeps opening a message separate from toggling its favorite state', async () => { const message = defaultEmailMessages[0]; const onSelect = jest.fn(); const onToggleFavorite = jest.fn(); const { container } = render(<EmailMessageList title="Reçus" messages={[message]} onSelect={onSelect} onToggleFavorite={onToggleFavorite} />); await userEvent.click(screen.getByRole('button', { name: `Lire ${message.subject}` })); expect(onSelect).toHaveBeenCalledWith(message); await userEvent.click(screen.getByRole('button', { name: `Retirer ${message.subject} des favoris` })); expect(onToggleFavorite).toHaveBeenCalledWith(message); expect(onSelect).toHaveBeenCalledTimes(1); expect((await axe(container)).violations).toEqual([]); });
