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
});
