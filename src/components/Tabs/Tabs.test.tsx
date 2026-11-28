import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { Tabs } from './Tabs';

describe('Tabs (MAIR-608)', () => {
  it('moves between tabs with the keyboard and skips disabled tabs', async () => {
    const user = userEvent.setup();
    function Host() {
      const [tab, setTab] = React.useState<'users' | 'roles' | 'groups'>('users');
      return <Tabs label="Sections" value={tab} onChange={setTab} items={[{ key: 'users', label: 'Utilisateurs', count: 12 }, { key: 'roles', label: 'Rôles', disabled: true }, { key: 'groups', label: 'Groupes' }]} panels={{ users: <p>Liste des utilisateurs</p>, groups: <p>Liste des groupes</p> }} />;
    }
    const { container } = render(<Host />);
    expect(screen.getByRole('tab', { name: 'Utilisateurs 12' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Liste des utilisateurs');
    screen.getByRole('tab', { name: 'Utilisateurs 12' }).focus(); await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'Groupes' })).toHaveAttribute('aria-selected', 'true'); expect(screen.getByRole('tab', { name: 'Groupes' })).toHaveFocus();
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Liste des groupes');
    await user.keyboard('{ArrowRight}'); expect(screen.getByRole('tab', { name: 'Utilisateurs 12' })).toHaveAttribute('aria-selected', 'true');
    expect((await axe(container)).violations).toEqual([]);
  });
  it('lets a host own the panel with stable ids (MAIR-608 Settings)', () => {
    render(<><Tabs id="settings" hostPanel label="Paramètres" value="profile" onChange={() => undefined} items={[{ key: 'profile', label: 'Profil' }, { key: 'security', label: 'Sécurité' }]} /><div id="settings-panel-profile" role="tabpanel" aria-labelledby="settings-tab-profile">Contenu</div></>);
    expect(screen.getByRole('tab', { name: 'Profil' })).toHaveAttribute('id', 'settings-tab-profile');
    expect(screen.getByRole('tab', { name: 'Profil' })).toHaveAttribute('aria-controls', 'settings-panel-profile');
    expect(screen.getByRole('tab', { name: 'Sécurité' })).not.toHaveAttribute('aria-controls');
    expect(screen.getByRole('tabpanel', { name: 'Profil' })).toHaveTextContent('Contenu');
  });
  it('Home and End reach the first and last enabled tabs even around a disabled one (CodeRabbit on #467)', async () => {
    const user = userEvent.setup();
    function Host() {
      const [tab, setTab] = React.useState<'users' | 'roles' | 'groups'>('groups');
      return <Tabs label="Sections" value={tab} onChange={setTab} items={[{ key: 'users', label: 'Utilisateurs' }, { key: 'roles', label: 'Rôles', disabled: true }, { key: 'groups', label: 'Groupes' }]} />;
    }
    render(<Host />);
    screen.getByRole('tab', { name: 'Groupes' }).focus();
    await user.keyboard('{Home}'); expect(screen.getByRole('tab', { name: 'Utilisateurs' })).toHaveAttribute('aria-selected', 'true'); expect(screen.getByRole('tab', { name: 'Utilisateurs' })).toHaveFocus();
    await user.keyboard('{End}'); expect(screen.getByRole('tab', { name: 'Groupes' })).toHaveAttribute('aria-selected', 'true');
  });

  describe('MAIR-1111 pill variant', () => {
    const items = [{ key: 'profile', label: 'Profil' }, { key: 'security', label: 'Sécurité' }, { key: 'sessions', label: 'Sessions' }] as const;
    function Host({ sticky = false }: { sticky?: boolean }) {
      const [tab, setTab] = React.useState<'profile' | 'security' | 'sessions'>('profile');
      return <Tabs variant="pill" sticky={sticky} label="Paramètres" value={tab} onChange={setTab} items={[...items]} />;
    }

    it('is a floating tablist whose selected tab carries the pill until it is measured', async () => {
      const user = userEvent.setup();
      const { container } = render(<Host />);
      const list = screen.getByRole('tablist', { name: 'Paramètres' });
      expect(list).toHaveClass('bg-[var(--mairie-surface)]', 'border-[var(--mairie-border)]', 'shadow-md');
      expect(list.style.borderRadius).toBe('var(--mairie-radius-l)');
      expect(list.style.padding).toBe('6px');
      const profile = screen.getByRole('tab', { name: 'Profil' });
      expect(profile).toHaveClass('bg-[var(--mairie-accent-surface)]', 'border-[var(--mairie-accent)]', 'text-[var(--mairie-accent)]');
      expect(profile.style.height).toBe('38px');
      expect(container.querySelector('[data-indicator]')).toBeNull();
      profile.focus(); await user.keyboard('{ArrowRight}');
      expect(screen.getByRole('tab', { name: 'Sécurité' })).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByRole('tab', { name: 'Sécurité' })).toHaveFocus();
      await user.keyboard('{ArrowLeft}{ArrowLeft}');
      expect(screen.getByRole('tab', { name: 'Sessions' })).toHaveAttribute('aria-selected', 'true');
      expect((await axe(container)).violations).toEqual([]);
    });

    it('slides a measured indicator to the selected tab with the motion tokens', async () => {
      const user = userEvent.setup();
      const left = jest.spyOn(HTMLElement.prototype, 'offsetLeft', 'get').mockImplementation(function (this: HTMLElement) { return this.textContent === 'Sécurité' ? 90 : 6; });
      const width = jest.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockImplementation(function (this: HTMLElement) { return this.textContent === 'Sécurité' ? 96 : 72; });
      try {
        const { container } = render(<Host sticky />);
        const indicator = container.querySelector('[data-indicator]') as HTMLElement;
        expect(indicator).toHaveAttribute('aria-hidden', 'true');
        expect(indicator.style.left).toBe('6px');
        expect(indicator.style.transitionDuration).toBe('var(--mairie-motion-base)');
        expect(indicator.style.transitionTimingFunction).toBe('var(--mairie-ease-standard)');
        expect(screen.getByRole('tab', { name: 'Profil' })).toHaveClass('border-transparent');
        await user.click(screen.getByRole('tab', { name: 'Sécurité' }));
        expect(indicator.style.left).toBe('90px');
        expect(indicator.style.width).toBe('96px');
        expect(container.firstElementChild).toHaveClass('sticky', 'top-0');
      } finally { left.mockRestore(); width.mockRestore(); }
    });

    it('keeps the underline style by default', () => {
      render(<Tabs label="Sections" value="a" onChange={() => undefined} items={[{ key: 'a', label: 'A' }]} />);
      expect(screen.getByRole('tablist')).toHaveClass('border-b');
      expect(screen.getByRole('tab')).toHaveClass('border-b-2');
    });
  });
});

describe('MAIR-1260 bordered tab counters', () => {
  it('shows each count in a bordered pill after the label', () => {
    render(<Tabs label="Sections" value="users" onChange={() => undefined} items={[{ key: 'users', label: 'Utilisateurs', count: 12 }, { key: 'roles', label: 'Rôles', count: 4 }, { key: 'groups', label: 'Groupes' }]} />);
    const users = screen.getByRole('tab', { name: /Utilisateurs/ });
    const pill = users.querySelector('[data-tab-count]');
    expect(pill).toHaveTextContent('12');
    expect(pill?.className).toContain('border');
    expect(screen.getByRole('tab', { name: /Rôles/ })).toHaveTextContent('Rôles4');
    expect(screen.getByRole('tab', { name: 'Groupes' }).querySelector('[data-tab-count]')).toBeNull();
  });
});
