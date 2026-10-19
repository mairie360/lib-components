import React from 'react';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { AppShell } from '../components/AppShell';

beforeEach(() => { document.cookie = 'mairie360_sidebar=; Max-Age=0; Path=/'; });
afterEach(() => jest.restoreAllMocks());

it('reserves the measured footer height and updates it when the footer resizes', () => {
  const originalObserver = Object.getOwnPropertyDescriptor(globalThis, 'ResizeObserver');
  let footerHeight = 83.2;
  let resize: ResizeObserverCallback | undefined;
  const observe = jest.fn();
  const disconnect = jest.fn();
  class FooterResizeObserver {
    constructor(callback: ResizeObserverCallback) { resize = callback; }
    observe = observe;
    unobserve = jest.fn();
    disconnect = disconnect;
  }
  Object.defineProperty(globalThis, 'ResizeObserver', { configurable: true, writable: true, value: FooterResizeObserver });
  const originalBounds = HTMLElement.prototype.getBoundingClientRect;
  jest.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
    const bounds = originalBounds.call(this);
    return this.tagName === 'FOOTER' ? { ...bounds, height: footerHeight } : bounds;
  });

  try {
    const { container, unmount } = render(<AppShell collapsibleSidebar hrefs={{ settings: '/settings' }} style={{ color: 'red' }}><h1>Paramètres</h1></AppShell>);
    const frame = container.firstElementChild as HTMLElement;
    const footer = screen.getByRole('contentinfo');
    expect(observe).toHaveBeenCalledWith(footer);
    expect(frame.style.getPropertyValue('--app-footer-height')).toBe('84px');
    expect(frame.style.color).toBe('red');
    footerHeight = 127.8;
    act(() => resize!([], {} as ResizeObserver));
    expect(frame.style.getPropertyValue('--app-footer-height')).toBe('128px');
    unmount();
    expect(disconnect).toHaveBeenCalledTimes(1);
  } finally {
    if (originalObserver) Object.defineProperty(globalThis, 'ResizeObserver', originalObserver);
    else Reflect.deleteProperty(globalThis, 'ResizeObserver');
  }
});

it('keeps collapsed desktop navigation inactive while the mobile drawer is open and restores it on Escape', () => {
  const { container } = render(<AppShell collapsibleSidebar hrefs={{ settings: '/settings' }}><h1>Paramètres</h1></AppShell>);
  const desktop = container.querySelector('aside.app-desktop-navigation') as HTMLElement;
  fireEvent.click(within(desktop).getByRole('button', { name: 'Réduire la navigation' }));
  expect(container.firstElementChild).toHaveAttribute('data-sidebar-collapsed', 'true');
  const menu = screen.getByRole('button', { name: 'Ouvrir la navigation' });
  fireEvent.click(menu);
  expect(desktop).toHaveAttribute('inert');
  expect(screen.getByRole('button', { name: 'Fermer la navigation' })).toHaveFocus();
  fireEvent.keyDown(document, { key: 'Escape' });
  expect(desktop).not.toHaveAttribute('inert');
  expect(menu).toHaveFocus();
  expect(within(desktop).getByRole('button', { name: 'Développer la navigation' })).toHaveAttribute('aria-expanded', 'false');
});

it('uses the trusted administrator flag rather than an account role label and leaves an unknown active item unmarked', () => {
  const account = { name: 'Marie Martin', role: 'admin' };
  const props = { collapsibleSidebar: true, activeItem: 'unavailable', user: account, hrefs: { settings: '/settings', admin: '/admin' } };
  const { container, rerender } = render(<AppShell {...props}><h1>Contenu municipal</h1></AppShell>);
  expect(screen.queryByRole('button', { name: 'Administration' })).not.toBeInTheDocument();
  expect(container.querySelector('[aria-current="page"]')).toBeNull();
  expect(within(screen.getByRole('main')).getByRole('heading', { name: 'Contenu municipal' })).toBeVisible();
  rerender(<AppShell {...props} isAdmin><h1>Contenu municipal</h1></AppShell>);
  expect(screen.getAllByRole('button', { name: 'Administration' })).toHaveLength(2);
  expect(container.querySelector('[aria-current="page"]')).toBeNull();
});
