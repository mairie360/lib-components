import React from 'react';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Settings, Shield } from 'lucide-react';
import { DesktopNavigation } from '../components/DesktopNavigation';
import type { SidebarItem } from '../components/Sidebar';

const settings: SidebarItem = { id: 'settings', label: 'Paramètres', icon: Settings, badge: '3' };
const administration: SidebarItem = { id: 'admin', label: 'Administration', icon: Shield, adminOnly: true };

beforeEach(() => { document.cookie = 'mairie360_sidebar=; Max-Age=0; Path=/'; });
afterEach(() => { jest.restoreAllMocks(); jest.useRealTimers(); });

it('routes a collapsed command from the keyboard while keeping its name and selection callback', async () => {
  const keyboard = userEvent.setup();
  const onNavigate = jest.fn();
  const onItemSelect = jest.fn();
  const onCollapsedChange = jest.fn();
  render(<DesktopNavigation activeItem="settings" hrefs={{ settings: ' /settings?tab=profile ' }} onNavigate={onNavigate}
    sidebarProps={{ items: [settings], onItemSelect }} onCollapsedChange={onCollapsedChange} />);

  await keyboard.tab();
  const toggle = screen.getByRole('button', { name: 'Réduire la navigation' });
  expect(toggle).toHaveFocus();
  expect(document.getElementById(toggle.getAttribute('aria-controls')!)).toBe(screen.getByRole('navigation', { name: 'Menu principal' }));
  await keyboard.keyboard(' ');
  expect(onCollapsedChange).toHaveBeenLastCalledWith(true);
  await keyboard.tab();
  const command = screen.getByRole('button', { name: 'Paramètres (3)' });
  expect(command).toHaveFocus();
  expect(command).toHaveAttribute('aria-current', 'page');
  expect(command).toHaveAccessibleDescription('Paramètres');
  await keyboard.keyboard('{Escape}');
  expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  expect(command).toHaveFocus();
  await keyboard.keyboard('{Enter}');
  expect(onNavigate).toHaveBeenCalledWith('/settings?tab=profile', 'settings');
  expect(onItemSelect).toHaveBeenCalledWith(settings);
  expect(onNavigate).toHaveBeenCalledTimes(1);
});

it('keeps a pointer tooltip available while moving between the collapsed command and its tooltip', () => {
  jest.useFakeTimers();
  render(<DesktopNavigation hrefs={{ settings: '/settings' }} onCollapsedChange={() => undefined} />);
  fireEvent.click(screen.getByRole('button', { name: 'Réduire la navigation' }));
  const command = screen.getByRole('button', { name: 'Paramètres' });
  fireEvent.mouseEnter(command);
  fireEvent.mouseLeave(command);
  act(() => jest.advanceTimersByTime(100));
  const tooltip = screen.getByRole('tooltip');
  fireEvent.mouseEnter(tooltip);
  act(() => jest.advanceTimersByTime(200));
  expect(tooltip).toBeInTheDocument();
  fireEvent.mouseLeave(tooltip);
  act(() => jest.advanceTimersByTime(150));
  expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
});

it('keeps a focused tooltip visible after pointer exit and removes it when keyboard focus leaves', async () => {
  jest.useFakeTimers();
  const keyboard = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
  render(<DesktopNavigation hrefs={{ settings: '/settings' }} onCollapsedChange={() => undefined} />);
  await keyboard.tab();
  await keyboard.keyboard(' ');
  await keyboard.tab();
  const command = screen.getByRole('button', { name: 'Paramètres' });
  fireEvent.mouseLeave(command);
  act(() => jest.advanceTimersByTime(300));
  expect(command).toHaveAccessibleDescription('Paramètres');
  await keyboard.tab({ shift: true });
  expect(screen.getByRole('button', { name: 'Développer la navigation' })).toHaveFocus();
  expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
});

it('resynchronizes a saved preference when the page becomes visible or its window regains focus', () => {
  document.cookie = 'mairie360_sidebar=v1:collapsed; Path=/';
  const hidden = jest.spyOn(document, 'hidden', 'get').mockReturnValue(false);
  render(<DesktopNavigation hrefs={{ settings: '/settings' }} onCollapsedChange={() => undefined} />);
  expect(screen.getByRole('button', { name: 'Développer la navigation' })).toHaveAttribute('aria-expanded', 'false');
  hidden.mockReturnValue(true);
  document.cookie = 'mairie360_sidebar=v1:expanded; Path=/';
  fireEvent.focus(window);
  expect(screen.getByRole('button', { name: 'Développer la navigation' })).toBeInTheDocument();
  hidden.mockReturnValue(false);
  fireEvent(document, new Event('visibilitychange'));
  expect(screen.getByRole('button', { name: 'Réduire la navigation' })).toHaveAttribute('aria-expanded', 'true');
  document.cookie = 'mairie360_sidebar=v1:collapsed; Path=/';
  fireEvent.focus(window);
  expect(screen.getByRole('button', { name: 'Développer la navigation' })).toBeInTheDocument();
});

it('keeps the local collapse control usable when cookie reads and writes are denied', () => {
  const cookieDescriptor = Object.getOwnPropertyDescriptor(document, 'cookie');
  Object.defineProperty(document, 'cookie', {
    configurable: true,
    get() { throw new DOMException('Storage unavailable', 'SecurityError'); },
    set() { throw new DOMException('Storage unavailable', 'SecurityError'); },
  });
  const onCollapsedChange = jest.fn();
  try {
    render(<DesktopNavigation hrefs={{ settings: '/settings' }} onCollapsedChange={onCollapsedChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'Réduire la navigation' }));
    expect(screen.getByRole('button', { name: 'Développer la navigation' })).toHaveAttribute('aria-expanded', 'false');
    expect(onCollapsedChange).toHaveBeenLastCalledWith(true);
    fireEvent.focus(window);
    expect(screen.getByRole('button', { name: 'Développer la navigation' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Développer la navigation' }));
    expect(onCollapsedChange).toHaveBeenLastCalledWith(false);
  } finally {
    if (cookieDescriptor) Object.defineProperty(document, 'cookie', cookieDescriptor);
    else Reflect.deleteProperty(document, 'cookie');
  }
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
