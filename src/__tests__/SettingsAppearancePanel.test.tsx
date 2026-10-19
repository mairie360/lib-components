import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { SettingsAppearancePanel } from '../components/SettingsAppearancePanel';
import { defaultSettingsAppearance as appearance } from '../stories/settingsFixtures';
it('emits appearance edits without overwriting the other supplied values', () => {
  const onChange = jest.fn(); render(<SettingsAppearancePanel appearance={appearance} onChange={onChange} />);
  fireEvent.click(screen.getByRole('radio', { name: 'Sombre' })); expect(onChange).toHaveBeenLastCalledWith({ ...appearance, theme: 'dark' });
  fireEvent.change(screen.getByLabelText('Police de caractères'), { target: { value: 'serif' } }); expect(onChange).toHaveBeenLastCalledWith({ ...appearance, fontFamily: 'serif' });
  fireEvent.change(screen.getByRole('slider'), { target: { value: '24' } }); expect(onChange).toHaveBeenLastCalledWith({ ...appearance, fontSize: 24 });
  fireEvent.change(screen.getByLabelText("Compacité de l'interface"), { target: { value: 'compact' } }); expect(onChange).toHaveBeenLastCalledWith({ ...appearance, density: 'compact' });
});
