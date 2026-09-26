import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
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

  it('opens and closes the mobile drawer without a second navigation implementation', () => {
    const onNavigate = jest.fn();
    render(<AppShell user={user} hrefs={{ projects: '/projects' }} onNavigate={onNavigate}><p>Contenu</p></AppShell>);

    fireEvent.click(screen.getByRole('button', { name: 'Ouvrir la navigation' }));
    const drawer = screen.getByRole('dialog', { name: 'Navigation mobile' });
    expect(drawer).toBeInTheDocument();
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('does not expose unsafe or missing destinations', () => {
    render(<AppShell user={user} hrefs={{ projects: 'javascript:alert(1)', messages: '//example.org' }}><p>Contenu</p></AppShell>);

    expect(screen.queryByRole('button', { name: 'Projets' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Messagerie' })).not.toBeInTheDocument();
  });
});
