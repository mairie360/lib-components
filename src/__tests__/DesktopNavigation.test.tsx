import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { DesktopNavigation } from '../components/DesktopNavigation';
import { AppShell } from '../components/AppShell';

beforeEach(() => { document.cookie = 'mairie360_sidebar=; Max-Age=0; Path=/'; });

test('collapsed commands retain their names and an Escape-dismissible focus tooltip', () => {
  render(<DesktopNavigation hrefs={{ settings: '/settings' }} onCollapsedChange={() => undefined} />);
  fireEvent.click(screen.getByRole('button', { name: 'Réduire la navigation' }));
  expect(screen.getByRole('button', { name: 'Développer la navigation' })).toHaveAttribute('aria-expanded', 'false');
  const command = screen.getByRole('button', { name: 'Paramètres' });
  fireEvent.focus(command);
  expect(screen.getByRole('tooltip')).toHaveTextContent('Paramètres');
  expect(command).toHaveAttribute('aria-describedby', screen.getByRole('tooltip').id);
  fireEvent.keyDown(command, { key: 'Escape' });
  expect(screen.queryByRole('tooltip')).toBeNull();
  expect(document.cookie).toContain('mairie360_sidebar=v1:collapsed');
});

test('AppShell opts into collapse, keeps one main and a contentinfo outside navigation', () => {
  const { container } = render(<AppShell collapsibleSidebar hrefs={{ settings: '/settings' }}><h1>Paramètres</h1></AppShell>);
  fireEvent.click(screen.getByRole('button', { name: 'Réduire la navigation' }));
  expect(container.querySelector('.app-shell-frame')).toHaveAttribute('data-sidebar-collapsed', 'true');
  expect(screen.getAllByRole('main')).toHaveLength(1);
  expect(screen.getByRole('contentinfo').closest('aside')).toBeNull();
  expect(container.querySelector('aside.app-desktop-navigation')).not.toHaveAttribute('inert');
});

test('the desktop menu rejects unsafe destinations and filters administration by role', () => {
  const { container } = render(<DesktopNavigation hrefs={{ settings: '/settings', admin: '/admin', projects: 'javascript:alert(1)', calendar: '//unsafe.test/' }} onCollapsedChange={() => undefined} />);
  expect(container.querySelectorAll('nav button')).toHaveLength(1);
  expect(screen.getByRole('button', { name: 'Paramètres' })).toBeVisible();
});
