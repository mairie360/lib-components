import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { SettingsGeneralPanel } from '../components/SettingsGeneralPanel';
import { defaultSettingsGeneral as general } from '../stories/settingsFixtures';
import { axe } from 'jest-axe';
it('emits general preference edits and disables changes when no owner is supplied', async () => {
  const onChange = jest.fn(); const { container, rerender } = render(<SettingsGeneralPanel general={general} onChange={onChange} />);
  fireEvent.change(screen.getByLabelText("Langue de l'interface"), { target: { value: 'en' } }); expect(onChange).toHaveBeenLastCalledWith({ ...general, language: 'en' });
  fireEvent.change(screen.getByLabelText('Format de date'), { target: { value: 'YYYY-MM-DD' } }); expect(onChange).toHaveBeenLastCalledWith({ ...general, dateFormat: 'YYYY-MM-DD' });
  fireEvent.change(screen.getByLabelText("Page d'accueil par défaut"), { target: { value: 'projects' } }); expect(onChange).toHaveBeenLastCalledWith({ ...general, homePage: 'projects' });
  fireEvent.click(screen.getByRole('switch', { name: 'Ouverture automatique des notifications' })); expect(onChange).toHaveBeenLastCalledWith({ ...general, autoOpenNotifications: true });
  expect((await axe(container)).violations).toEqual([]); rerender(<SettingsGeneralPanel general={general} />); expect(screen.getByLabelText("Langue de l'interface")).toBeDisabled();
});
