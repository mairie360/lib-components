import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { AppShell } from '../components/AppShell';

beforeEach(() => { document.cookie = 'mairie360_sidebar=; Max-Age=0; Path=/'; });
afterEach(() => jest.restoreAllMocks());

it('MAIR-548 lays out one full-width footer after the navigation row, with no measured offsets', () => {
  const { container } = render(<AppShell collapsibleSidebar hrefs={{ settings: '/settings' }} footerProps={{ year: 2026, version: '1.3.0' }} style={{ color: 'red' }}><h1>Paramètres</h1></AppShell>);
  const frame = container.firstElementChild as HTMLElement;
  expect(frame).toHaveClass('app-shell-frame', 'flex', 'flex-col');
  expect(frame.style.color).toBe('red');
  expect(frame.style.getPropertyValue('--app-footer-height')).toBe('');
  const body = frame.querySelector(':scope > .app-shell-body')!;
  expect(body.firstElementChild).toHaveClass('app-desktop-navigation');
  const footer = screen.getByRole('contentinfo');
  expect(footer).toHaveTextContent('© 2026 Mairie360');
  expect(footer).toHaveTextContent('Version 1.3.0');
  expect(body.compareDocumentPosition(footer) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  expect(screen.getAllByText('© 2026 Mairie360')).toHaveLength(1);
});

it('keeps the desktop navigation inactive and collapsed while the mobile drawer is open and restores it on Escape', () => {
  const { container } = render(<AppShell collapsibleSidebar hrefs={{ settings: '/settings' }}><h1>Paramètres</h1></AppShell>);
  const desktop = container.querySelector('aside.app-desktop-navigation') as HTMLElement;
  const menu = screen.getByRole('button', { name: 'Ouvrir la navigation' });
  fireEvent.click(menu);
  expect(desktop).toHaveAttribute('inert');
  fireEvent.mouseEnter(desktop);
  expect(desktop).toHaveAttribute('data-expanded', 'false');
  expect(container.querySelector('.app-shell-footer')).toHaveAttribute('inert');
  expect(screen.getByRole('button', { name: 'Fermer la navigation' })).toHaveFocus();
  fireEvent.keyDown(document, { key: 'Escape' });
  expect(desktop).not.toHaveAttribute('inert');
  expect(container.querySelector('.app-shell-footer')).not.toHaveAttribute('inert');
  expect(menu).toHaveFocus();
  expect(desktop).toHaveAttribute('data-expanded', 'true');
});

it('uses the trusted administrator flag rather than an account role label and leaves an unknown active item unmarked', () => {
  const account = { name: 'Marie Martin', role: 'admin' };
  const props = { collapsibleSidebar: true, activeItem: 'unavailable', user: account, hrefs: { settings: '/settings', admin: '/admin' } };
  const { container, rerender } = render(<AppShell {...props}><h1>Contenu municipal</h1></AppShell>);
  expect(screen.queryByRole('button', { name: 'Administration' })).not.toBeInTheDocument();
  expect(container.querySelector('[aria-current="page"]')).toBeNull();
  expect(within(screen.getByRole('main')).getByRole('heading', { name: 'Contenu municipal' })).toBeVisible();
  rerender(<AppShell {...props} isAdmin><h1>Contenu municipal</h1></AppShell>);
  expect(screen.getAllByRole('button', { name: 'Administration' })).toHaveLength(1);
  expect(container.querySelector('[aria-current="page"]')).toBeNull();
});
