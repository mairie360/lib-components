import { act, fireEvent, render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { Bell } from 'lucide-react';

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
    expect(toggle.closest('[data-layout="row"]')).toHaveAttribute('data-m360-component', 'Switch');
    expect(toggle.closest('[data-m360-component="SettingToggle"]')).not.toBeNull();
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

  describe('MAIR-1116 icon chip and clickable row', () => {
    const row = (name: string) => screen.getByRole('switch', { name }).closest('[data-m360-component="SettingToggle"]') as HTMLElement;

    it('toggles once for a click on the label, the description, the icon or the row', async () => {
      const onChange = jest.fn();
      const { container } = render(<SettingToggle label="Nouveaux messages" description="Quand un agent vous écrit." icon={Bell} iconTone="module" iconColor="messaging" checked={false} onChange={onChange} />);
      await act(async () => { fireEvent.click(screen.getByText('Nouveaux messages')); });
      expect(onChange).toHaveBeenCalledTimes(1);
      await act(async () => { fireEvent.click(screen.getByText('Quand un agent vous écrit.')); });
      expect(onChange).toHaveBeenCalledTimes(2);
      const chip = container.querySelector('[data-m360-component="IconChip"]') as HTMLElement;
      expect(chip.style.background).toBe('var(--mairie-module-messaging)');
      await act(async () => { fireEvent.click(chip); });
      expect(onChange).toHaveBeenCalledTimes(3);
      await act(async () => { fireEvent.click(row('Nouveaux messages')); });
      expect(onChange).toHaveBeenCalledTimes(4);
      await act(async () => { fireEvent.click(screen.getByRole('switch')); });
      expect(onChange).toHaveBeenCalledTimes(5);
    });

    it('adds no tab stop and shows the hover only while interactive', async () => {
      const { container, rerender } = render(<SettingToggle label="Alertes" icon={Bell} checked onChange={jest.fn()} />);
      expect(container.querySelectorAll('[tabindex]')).toHaveLength(0);
      expect(container.querySelectorAll('button')).toHaveLength(1);
      expect(row('Alertes')).toHaveClass('hover:bg-[var(--mairie-accent-surface)]', 'cursor-pointer');
      expect((await axe(container)).violations).toEqual([]);
      const onChange = jest.fn();
      rerender(<SettingToggle label="Alertes" icon={Bell} checked onChange={onChange} disabled />);
      expect(row('Alertes')).not.toHaveClass('hover:bg-[var(--mairie-accent-surface)]');
      fireEvent.click(row('Alertes'));
      expect(onChange).not.toHaveBeenCalled();
    });

    it('has no hover and ignores row clicks while saving', () => {
      const onChange = jest.fn(() => new Promise<void>(() => undefined));
      render(<SettingToggle label="Sauvegarde" checked={false} onChange={onChange} />);
      fireEvent.click(row('Sauvegarde'));
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(row('Sauvegarde')).not.toHaveClass('hover:bg-[var(--mairie-accent-surface)]');
      fireEvent.click(row('Sauvegarde'));
      expect(onChange).toHaveBeenCalledTimes(1);
    });
  });
});
