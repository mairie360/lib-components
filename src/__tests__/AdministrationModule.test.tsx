import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';

import { AdministrationModule } from '../components/AdministrationModule';

describe('AdministrationModule', () => {
  it('renders the administration dashboard with default users', () => {
    render(<AdministrationModule />);

    expect(screen.getByRole('heading', { name: 'Administration' })).toBeInTheDocument();
    expect(screen.getByText('Admin Système')).toBeInTheDocument();
    expect(screen.getByText('Marie Martin')).toBeInTheDocument();
    expect(screen.getByText('Jean Dupont')).toBeInTheDocument();
  });

  it('filters users by search and role', () => {
    render(<AdministrationModule />);

    fireEvent.change(screen.getByPlaceholderText('Rechercher un utilisateur...'), {
      target: { value: 'marie' },
    });

    expect(screen.getByText('Marie Martin')).toBeInTheDocument();
    expect(screen.queryByText('Jean Dupont')).not.toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText('Rechercher un utilisateur...'), {
      target: { value: '' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Filtrer par rôle' }));
    fireEvent.click(screen.getByRole('option', { name: 'Manager' }));

    expect(screen.getByText('Marie Martin')).toBeInTheDocument();
    expect(screen.queryByText('Admin Système')).not.toBeInTheDocument();
  });

  it('switches between administration tabs', () => {
    render(<AdministrationModule />);

    fireEvent.click(screen.getByRole('tab', { name: /Système/ }));

    expect(screen.getByText('Ressources Système')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Base de données' })).toBeInTheDocument();
  });

  it('creates a local user from the modal and calls the callback', () => {
    const handleCreateUser = jest.fn();
    render(<AdministrationModule onCreateUser={handleCreateUser} />);

    fireEvent.click(screen.getByRole('button', { name: /Nouveau/ }));
    const dialog = screen.getByRole('dialog', { name: 'Nouvel utilisateur' });

    fireEvent.change(within(dialog).getByLabelText('Nom complet'), {
      target: { value: 'Alice Durand' },
    });
    fireEvent.change(within(dialog).getByLabelText('Email'), {
      target: { value: 'alice.durand@mairie360.fr' },
    });
    fireEvent.change(within(dialog).getByLabelText('Service'), {
      target: { value: 'Communication' },
    });
    fireEvent.change(within(dialog).getByLabelText('Téléphone'), {
      target: { value: '+33 1 23 45 67 93' },
    });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Créer' }));

    expect(handleCreateUser).toHaveBeenCalledWith({
      name: 'Alice Durand',
      email: 'alice.durand@mairie360.fr',
      service: 'Communication',
      phone: '+33 1 23 45 67 93',
      role: 'user',
    });
    expect(screen.queryByRole('dialog', { name: 'Nouvel utilisateur' })).not.toBeInTheDocument();
    expect(screen.getByText('Alice Durand')).toBeInTheDocument();
  });
});
