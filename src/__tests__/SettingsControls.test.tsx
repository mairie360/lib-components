import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { SettingsSection, SettingsSelect, SettingsToggle } from '../components/settings/controls';

it('exposes labeled settings controls and emits changes without replacing caller-owned values', async () => {
  const onToggle = jest.fn(); const onSelect = jest.fn();
  const { container } = render(<SettingsSection title="Préférences"><SettingsToggle label="Messages" checked={false} onChange={onToggle} /><SettingsSelect id="theme" label="Thème" value="light" options={[{ value: 'light', label: 'Clair' }, { value: 'dark', label: 'Sombre' }]} onChange={onSelect} /></SettingsSection>);
  await userEvent.click(screen.getByRole('switch', { name: 'Messages' })); expect(onToggle).toHaveBeenCalledWith(true); await userEvent.selectOptions(screen.getByLabelText('Thème'), 'dark'); expect(onSelect).toHaveBeenCalledWith('dark'); expect(screen.getByRole('switch', { name: 'Messages' })).not.toBeChecked(); expect((await axe(container)).violations).toEqual([]);
});
