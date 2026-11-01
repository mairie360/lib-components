import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Settings, Shield } from 'lucide-react';
import { DesktopNavigation } from '../components/DesktopNavigation';
import type { SidebarItem } from '../components/Sidebar';

const settings: SidebarItem = { id: 'settings', label: 'Paramètres', icon: Settings, badge: '3' };
const administration: SidebarItem = { id: 'admin', label: 'Administration', icon: Shield, adminOnly: true };

beforeEach(() => { document.cookie = 'mairie360_sidebar=; Max-Age=0; Path=/'; });
afterEach(() => { jest.restoreAllMocks(); });

it('MAIR-548 routes a collapsed command from the keyboard and expands while focus is inside', async () => {
  const keyboard = userEvent.setup();
  const onNavigate = jest.fn();
  const onItemSelect = jest.fn();
  const onCollapsedChange = jest.fn();
  const { container } = render(<DesktopNavigation activeItem="settings" hrefs={{ settings: ' /settings?tab=profile ' }} onNavigate={onNavigate}
    sidebarProps={{ items: [settings], onItemSelect }} onCollapsedChange={onCollapsedChange} />);
  const aside = container.querySelector('aside.app-desktop-navigation')!;
  expect(aside).toHaveAttribute('data-expanded', 'false');
  expect(onCollapsedChange).toHaveBeenLastCalledWith(true);

  await keyboard.tab();
  const command = screen.getByRole('button', { name: 'Paramètres (3)' });
  expect(command).toHaveFocus();
  expect(command).toHaveAttribute('aria-current', 'page');
  expect(aside).toHaveAttribute('data-expanded', 'true');
  expect(onCollapsedChange).toHaveBeenLastCalledWith(false);
  await keyboard.keyboard('{Enter}');
  expect(onNavigate).toHaveBeenCalledWith('/settings?tab=profile', 'settings');
  expect(onItemSelect).toHaveBeenCalledWith(settings);
  expect(onNavigate).toHaveBeenCalledTimes(1);
  await keyboard.tab();
  expect(aside).toHaveAttribute('data-expanded', 'false');
  expect(onCollapsedChange).toHaveBeenLastCalledWith(true);
});

it('MAIR-548 expands on pointer hover and collapses when the pointer leaves, without a toggle or tooltip', () => {
  const onCollapsedChange = jest.fn();
  const { container } = render(<DesktopNavigation hrefs={{ settings: '/settings' }} onCollapsedChange={onCollapsedChange} />);
  const aside = container.querySelector('aside.app-desktop-navigation')!;
  fireEvent.mouseEnter(aside);
  expect(aside).toHaveAttribute('data-expanded', 'true');
  expect(onCollapsedChange).toHaveBeenLastCalledWith(false);
  fireEvent.mouseLeave(aside);
  expect(aside).toHaveAttribute('data-expanded', 'false');
  expect(onCollapsedChange).toHaveBeenLastCalledWith(true);
  expect(screen.queryByRole('button', { name: /navigation/ })).not.toBeInTheDocument();
  expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  expect(aside.querySelector('[aria-expanded]')).toBeNull();
});

it('MAIR-548 stays collapsed while inactive and ignores a saved collapse preference', () => {
  document.cookie = 'mairie360_sidebar=v1:expanded; Path=/';
  const { container, rerender } = render(<DesktopNavigation hrefs={{ settings: '/settings' }} onCollapsedChange={() => undefined} inactive />);
  const aside = container.querySelector('aside.app-desktop-navigation')!;
  fireEvent.mouseEnter(aside);
  expect(aside).toHaveAttribute('data-expanded', 'false');
  expect(aside).toHaveAttribute('inert');
  rerender(<DesktopNavigation hrefs={{ settings: '/settings' }} onCollapsedChange={() => undefined} />);
  expect(aside).toHaveAttribute('data-expanded', 'true');
  fireEvent.mouseLeave(aside);
  expect(aside).toHaveAttribute('data-expanded', 'false');
});

it('MAIR-548 shows « Commune de » with the commune name only when a brand label is supplied', () => {
  const { rerender } = render(<DesktopNavigation hrefs={{ settings: '/settings' }} onCollapsedChange={() => undefined} />);
  expect(screen.queryByText('Commune de')).not.toBeInTheDocument();
  expect(screen.getByRole('img', { name: 'Logo Mairie360' })).toHaveClass('app-navigation-logo');
  rerender(<DesktopNavigation hrefs={{ settings: '/settings' }} sidebarProps={{ brandLabel: 'Saint-André-de-la-Roche-sur-Yon' }} onCollapsedChange={() => undefined} />);
  expect(screen.getByText('Commune de')).toBeInTheDocument();
  expect(screen.getByText('Saint-André-de-la-Roche-sur-Yon')).toHaveClass('app-navigation-commune-name');
});

it.each([
  ['https://ville.fr/settings', true],
  ['HTTP://ville.fr/settings', true],
  ['https://user:secret@ville.fr/settings', false],
  ['https://[', false],
  ['//ville.fr/settings', false],
  ['https://ville.fr\\settings', false],
  ['javascript:alert(1)', false],
  [undefined, false],
] as const)('only offers a usable destination for %s', (destination, offered) => {
  render(<DesktopNavigation activeItem="settings" hrefs={{ settings: destination }} sidebarProps={{ items: [settings] }} onCollapsedChange={() => undefined} />);
  expect(screen.queryByRole('button', { name: 'Paramètres (3)' }) !== null).toBe(offered);
});

it('allows an item callback to handle an unavailable destination without inventing a current page', async () => {
  const keyboard = userEvent.setup();
  const onPageChange = jest.fn();
  const onNavigate = jest.fn();
  render(<DesktopNavigation activeItem="unknown" hrefs={{ settings: 'javascript:alert(1)' }} onPageChange={onPageChange} onNavigate={onNavigate}
    sidebarProps={{ items: [settings] }} onCollapsedChange={() => undefined} />);
  const navigation = screen.getByRole('navigation', { name: 'Menu principal' });
  const command = within(navigation).getByRole('button', { name: 'Paramètres (3)' });
  expect(command).not.toHaveAttribute('aria-current');
  await keyboard.tab();
  await keyboard.keyboard('{Enter}');
  expect(onPageChange).toHaveBeenCalledWith('settings');
  expect(onNavigate).not.toHaveBeenCalled();
});

it('requires the trusted administrator flag and falls back to the supplied brand initial after a logo error', () => {
  const props = { hrefs: { settings: '/settings', admin: '/admin' }, sidebarProps: { items: [settings, administration], brandLogoSrc: '/ville.svg', brandLogoAlt: 'Logo de la ville', brandInitial: 'V', brandLabel: 'Ville connectée' }, onCollapsedChange: () => undefined };
  const { rerender } = render(<DesktopNavigation {...props} />);
  expect(screen.queryByRole('button', { name: 'Administration' })).not.toBeInTheDocument();
  fireEvent.error(screen.getByRole('img', { name: 'Logo de la ville' }));
  expect(screen.queryByRole('img')).not.toBeInTheDocument();
  expect(screen.getByText('V')).toBeVisible();
  expect(screen.getByText('Ville connectée')).toBeVisible();
  rerender(<DesktopNavigation {...props} isAdmin />);
  expect(screen.getByRole('button', { name: 'Administration' })).toBeVisible();
});

// CodeRabbit on #500: clicking a command focuses it, but the band must collapse once the pointer leaves.
it('MAIR-548 collapses after a click once the pointer leaves, and still expands on keyboard focus', async () => {
  const user = userEvent.setup();
  const onCollapsedChange = jest.fn();
  const { container } = render(<DesktopNavigation hrefs={{ settings: '/settings' }} onPageChange={() => undefined} onCollapsedChange={onCollapsedChange} />);
  const aside = container.querySelector('aside.app-desktop-navigation')!;
  const command = within(aside as HTMLElement).getAllByRole('button')[0];
  await user.hover(aside);
  await user.click(command);
  expect(command).toHaveFocus();
  await user.unhover(aside);
  expect(aside).toHaveAttribute('data-expanded', 'false');
  expect(onCollapsedChange).toHaveBeenLastCalledWith(true);
  await user.keyboard('{Tab}');
  expect(aside).toHaveAttribute('data-expanded', 'true');
});
