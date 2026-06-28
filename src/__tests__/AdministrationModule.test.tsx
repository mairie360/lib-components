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

  it('handles user row menu actions locally', () => {
    const handleUserAction = jest.fn();
    render(<AdministrationModule onUserAction={handleUserAction} />);

    let jeanRow = screen.getByText('Jean Dupont').closest('tr') as HTMLElement;
    fireEvent.click(within(jeanRow).getByRole('button', { name: 'Actions pour Jean Dupont' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Désactiver' }));

    jeanRow = screen.getByText('Jean Dupont').closest('tr') as HTMLElement;
    expect(within(jeanRow).getByText('Inactif')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Jean Dupont est maintenant inactif.');

    fireEvent.click(within(jeanRow).getByRole('button', { name: 'Actions pour Jean Dupont' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Changer le rôle' }));

    jeanRow = screen.getByText('Jean Dupont').closest('tr') as HTMLElement;
    expect(within(jeanRow).getByText('Manager')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Jean Dupont est maintenant Manager.');

    fireEvent.click(within(jeanRow).getByRole('button', { name: 'Actions pour Jean Dupont' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Supprimer' }));

    expect(screen.queryByText('Jean Dupont')).not.toBeInTheDocument();
    expect(handleUserAction).toHaveBeenCalledWith(expect.objectContaining({ name: 'Jean Dupont' }), 'delete');
  });

  it('refreshes, exports and clears logs', () => {
    const createObjectURL = jest.fn(() => 'blob:logs');
    const revokeObjectURL = jest.fn();
    Object.defineProperty(window.URL, 'createObjectURL', {
      configurable: true,
      value: createObjectURL,
    });
    Object.defineProperty(window.URL, 'revokeObjectURL', {
      configurable: true,
      value: revokeObjectURL,
    });

    render(<AdministrationModule defaultActiveTab="logs" />);

    fireEvent.click(screen.getByRole('button', { name: /Actualiser/ }));
    expect(screen.getByText('Actualisation effectuée')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Exporter CSV/ }));
    expect(createObjectURL).toHaveBeenCalled();
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:logs');
    expect(screen.getByRole('status')).toHaveTextContent('Export CSV préparé.');

    fireEvent.click(screen.getByRole('button', { name: /Effacer/ }));
    expect(screen.getByText('Aucun log pour ce niveau.')).toBeInTheDocument();
  });

  it('creates a backup and updates settings controls', () => {
    render(<AdministrationModule defaultActiveTab="system" />);

    fireEvent.click(screen.getByRole('button', { name: /Créer une sauvegarde/ }));
    expect(screen.getByText("À l'instant")).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Sauvegarde créée.');

    fireEvent.click(screen.getByRole('tab', { name: /Paramètres/ }));
    const registrationSwitch = screen.getByRole('switch', { name: 'Inscription publique' });
    expect(registrationSwitch).toHaveAttribute('aria-checked', 'true');

    fireEvent.click(registrationSwitch);
    expect(registrationSwitch).toHaveAttribute('aria-checked', 'false');
    expect(screen.getByRole('status')).toHaveTextContent('Paramètres mis à jour.');
  });

  it('executes dangerous actions with visible feedback', () => {
    render(<AdministrationModule defaultActiveTab="settings" />);

    fireEvent.click(screen.getByRole('button', { name: /Réinitialiser/ }));
    expect(screen.getByRole('status')).toHaveTextContent('Réinitialiser effectué.');

    fireEvent.click(screen.getByRole('button', { name: /Effacer les logs/ }));
    expect(screen.getByRole('status')).toHaveTextContent('Tous les logs ont été effacés.');

    fireEvent.click(screen.getByRole('tab', { name: /Logs/ }));
    expect(screen.getByText('Aucun log pour ce niveau.')).toBeInTheDocument();
  });
});
