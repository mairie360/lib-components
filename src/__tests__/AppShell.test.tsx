import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';

import { AppShell } from '../components/AppShell';

const user = { name: 'Marie Martin', email: 'marie@example.fr', role: 'user' };

describe('AppShell', () => {
  it('renders the shared layout with only configured destinations', () => {
    render(<AppShell activeItem="projects" user={user} hrefs={{ projects: '/projects', settings: '/settings' }} onNavigate={jest.fn()}><h1>Mes projets</h1></AppShell>);

    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('complementary', { name: 'Navigation principale' })).toBeInTheDocument();
    expect(screen.getByRole('main')).toHaveTextContent('Mes projets');
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Projets' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('button', { name: 'Paramètres' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'E-mails' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Fichiers' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Administration' })).not.toBeInTheDocument();
    expect(screen.queryByText('Profil')).not.toBeInTheDocument();
    expect(screen.queryByText('Version 1.0')).not.toBeInTheDocument();
  });

  it('delegates relative navigation to the frontend router', () => {
    const onNavigate = jest.fn();
    render(<AppShell user={user} hrefs={{ projects: '/projects', settings: '/settings' }} onNavigate={onNavigate}><p>Contenu</p></AppShell>);

    fireEvent.click(screen.getByRole('button', { name: 'Projets' }));
    expect(onNavigate).toHaveBeenCalledWith('/projects', 'projects');

    fireEvent.click(screen.getByRole('button', { name: /Marie Martin/ }));
    fireEvent.click(screen.getByRole('link', { name: 'Profil' }));
    expect(onNavigate).toHaveBeenCalledWith('/settings', 'settings');
  });

  it('shows safe relative destinations without a router callback', () => {
    render(<AppShell activeItem="admin" isAdmin user={user} hrefs={{ admin: '/', settings: '/settings' }}><p>Contenu</p></AppShell>);

    expect(screen.getByRole('button', { name: 'Paramètres' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Administration/ })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('button', { name: /Administration/ })).toHaveClass('bg-[#891827]');
  });

  it('uses the same highlighted Administration row in the mobile drawer', () => {
    render(<AppShell isAdmin user={user} hrefs={{ admin: '/admin' }} onNavigate={jest.fn()}><p>Contenu</p></AppShell>);

    fireEvent.click(screen.getByRole('button', { name: 'Ouvrir la navigation' }));
    const drawer = screen.getByRole('dialog', { name: 'Navigation mobile' });
    expect(within(drawer).getByRole('button', { name: 'Administration' })).toHaveClass('bg-[#b4232f]', 'focus-visible:outline-[#ffccd1]');
  });

  it('uses the safe Settings destination when the configured profile URL is unsafe', () => {
    render(<AppShell user={user} hrefs={{ profile: 'javascript:alert(1)', settings: '/settings' }}><p>Contenu</p></AppShell>);

    fireEvent.click(screen.getByRole('button', { name: /Marie Martin/ }));
    expect(screen.getByRole('link', { name: 'Profil' })).toHaveAttribute('href', '/settings');
  });

  it('opens and closes the mobile drawer without a second navigation implementation', () => {
    const onNavigate = jest.fn();
    render(<AppShell user={user} hrefs={{ projects: '/projects' }} onNavigate={onNavigate}><p>Contenu</p></AppShell>);

    const menuButton = screen.getByRole('button', { name: 'Ouvrir la navigation' });
    menuButton.focus();
    fireEvent.click(menuButton);
    const drawer = screen.getByRole('dialog', { name: 'Navigation mobile' });
    expect(drawer).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Fermer la navigation' })).toHaveFocus();
    expect(screen.getByRole('main').parentElement).toHaveAttribute('inert');
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(menuButton).toHaveFocus();
    expect(screen.getByRole('main').parentElement).not.toHaveAttribute('inert');
  });

  it('keeps Tab and Shift+Tab inside the mobile drawer', () => {
    render(<AppShell user={user} hrefs={{ projects: '/projects', settings: '/settings' }} onNavigate={jest.fn()}><p>Contenu</p></AppShell>);

    const menuButton = screen.getByRole('button', { name: 'Ouvrir la navigation' });
    menuButton.focus();
    fireEvent.click(menuButton);
    const drawer = screen.getByRole('dialog', { name: 'Navigation mobile' });
    const closeButton = screen.getByRole('button', { name: 'Fermer la navigation' });
    const lastDestination = Array.from(drawer.querySelectorAll('button')).find((button) => button.textContent?.includes('Paramètres'));
    expect(lastDestination).toBeDefined();

    lastDestination!.focus();
    fireEvent.keyDown(lastDestination!, { key: 'Tab' });
    expect(closeButton).toHaveFocus();

    fireEvent.keyDown(closeButton, { key: 'Tab', shiftKey: true });
    expect(lastDestination).toHaveFocus();

    menuButton.focus();
    fireEvent.keyDown(menuButton, { key: 'Tab' });
    expect(closeButton).toHaveFocus();
  });

  it('restores focus when the backdrop or desktop breakpoint closes the drawer', () => {
    render(<AppShell user={user} hrefs={{ projects: '/projects' }} onNavigate={jest.fn()}><p>Contenu</p></AppShell>);

    const menuButton = screen.getByRole('button', { name: 'Ouvrir la navigation' });
    menuButton.focus();
    fireEvent.click(menuButton);
    const drawer = screen.getByRole('dialog', { name: 'Navigation mobile' });
    fireEvent.click(drawer.querySelector('[aria-hidden="true"]')!);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(menuButton).toHaveFocus();

    fireEvent.click(menuButton);
    const originalWidth = window.innerWidth;
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1200 });
    fireEvent.resize(window);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(menuButton).toHaveFocus();
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: originalWidth });
  });

  it('does not expose unsafe or missing destinations', () => {
    render(<AppShell user={user} hrefs={{ projects: 'javascript:alert(1)', messages: '//example.org', settings: '\\\\example.org' }}><p>Contenu</p></AppShell>);

    expect(screen.queryByRole('button', { name: 'Projets' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Messagerie' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Paramètres' })).not.toBeInTheDocument();
  });
});
