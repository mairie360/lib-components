import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SettingsProfilePanel } from '../components/SettingsProfilePanel';
import { defaultSettingsProfile as profile } from '../stories/settingsFixtures';
import { axe } from 'jest-axe';
it('retains edited profile data until an explicit save and rejects unsupported photos locally', async () => {
  const user = userEvent.setup(); const onSave = jest.fn(); const onPhotoChange = jest.fn(); const { container } = render(<SettingsProfilePanel profile={profile} onSave={onSave} onPhotoChange={onPhotoChange} />);
  fireEvent.change(screen.getByLabelText('Nom complet'), { target: { value: 'Anne Marie' } }); expect(onSave).not.toHaveBeenCalled(); await user.click(screen.getByRole('button', { name: /Enregistrer/ })); expect(onSave).toHaveBeenCalledWith({ ...profile, fullName: 'Anne Marie' });
  fireEvent.change(screen.getByLabelText('Changer la photo'), { target: { files: [new File(['text'], 'bad.txt', { type: 'text/plain' })] } }); expect(onPhotoChange).not.toHaveBeenCalled(); expect(screen.getByText(/Format non pris en charge/)).toBeVisible(); expect((await axe(container)).violations).toEqual([]);
});
