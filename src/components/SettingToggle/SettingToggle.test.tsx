import { act, fireEvent, render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { SettingToggle, SettingToggleGroup } from './SettingToggle';

describe('SettingToggle (MAIR-941)', () => {
  it('is a switch named by its label and described by its description', async () => {
    const { container } = render(
      <SettingToggleGroup title="Types de notifications">
        <SettingToggle label="Nouveaux messages" description="Recevoir une notification quand un agent vous écrit." checked onChange={jest.fn()} />
        <SettingToggle label="Mentions" checked={false} onChange={jest.fn()} />
      </SettingToggleGroup>,
    );
    expect(screen.getByRole('group', { name: 'Types de notifications' })).toBeInTheDocument();
    const toggle = screen.getByRole('switch', { name: 'Nouveaux messages' });
    expect(toggle).toHaveAttribute('aria-checked', 'true');
    expect(toggle).toHaveAccessibleDescription('Recevoir une notification quand un agent vous écrit.');
    expect(toggle.closest('[data-layout="row"]')).toHaveAttribute('data-m360-component', 'SettingToggle Switch');
    expect((await axe(container)).violations).toEqual([]);
  });

  it('locks the switch while saving, then follows the saved value', async () => {
    let finish!: () => void;
    const onChange = jest.fn(() => new Promise<void>(resolve => { finish = resolve; }));
    const { rerender } = render(<SettingToggle label="Sauvegarde automatique" checked={false} onChange={onChange} />);
    const toggle = screen.getByRole('switch', { name: 'Sauvegarde automatique' });
    fireEvent.click(toggle);
    expect(onChange).toHaveBeenCalledWith(true);
    expect(toggle).toHaveAttribute('aria-checked', 'true');
    expect(toggle).toHaveAttribute('aria-busy', 'true');
    expect(toggle).not.toBeDisabled();
    fireEvent.click(toggle);
    expect(onChange).toHaveBeenCalledTimes(1);
    rerender(<SettingToggle label="Sauvegarde automatique" checked onChange={onChange} />);
    await act(async () => { finish(); });
    expect(toggle).not.toHaveAttribute('aria-busy');
    expect(toggle).toHaveAttribute('aria-checked', 'true');
  });

  it('goes back to the previous value and reports the error when saving fails', async () => {
    const failure = new Error('réseau');
    const onError = jest.fn();
    render(<SettingToggle label="Alertes de connexion" checked onChange={() => Promise.reject(failure)} onError={onError} />);
    const toggle = screen.getByRole('switch', { name: 'Alertes de connexion' });
    await act(async () => { fireEvent.click(toggle); });
    expect(onError).toHaveBeenCalledWith(failure);
    expect(toggle).toHaveAttribute('aria-checked', 'true');
  });

  it('renders a group without a title and a disabled setting', () => {
    render(<SettingToggleGroup><SettingToggle label="Double authentification" checked={false} onChange={jest.fn()} disabled /></SettingToggleGroup>);
    expect(screen.getByRole('group')).not.toHaveAttribute('aria-labelledby');
    expect(screen.getByRole('switch', { name: 'Double authentification' })).toBeDisabled();
  });
});
