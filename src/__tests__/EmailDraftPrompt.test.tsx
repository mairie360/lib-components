import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EmailDraftPrompt } from '../components/EmailDraftPrompt';
import { axe } from 'jest-axe';
it('keeps saving and discarding a draft as distinct explicit decisions', async () => {
  const onSave = jest.fn(); const onDiscard = jest.fn(); const { container } = render(<EmailDraftPrompt isOpen onSave={onSave} onDiscard={onDiscard} />); await userEvent.click(screen.getByRole('button', { name: 'Enregistrer le brouillon' })); expect(onSave).toHaveBeenCalledTimes(1); expect(onDiscard).not.toHaveBeenCalled(); await userEvent.click(screen.getByRole('button', { name: 'Ignorer' })); expect(onDiscard).toHaveBeenCalledTimes(1); expect((await axe(container)).violations).toEqual([]);
});
