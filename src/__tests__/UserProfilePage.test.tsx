import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { UserProfilePage } from '../components/UserProfilePage';

const profileUser = {
  name: 'Marie Martin',
  email: 'marie.martin@mairie360.fr',
  phone: '+33 1 23 45 67 90',
  service: 'Communication',
  position: 'Responsable communication',
  role: 'manager',
  address: '12 rue de la Mairie',
  city: 'Saint-Denis',
  lastConnection: "Aujourd'hui à 09:42",
};

describe('UserProfilePage component', () => {
  it('renders the profile page in the application layout', () => {
    render(
      <UserProfilePage
        user={profileUser}
        footerProps={{ year: 2026, version: '2.1.0' }}
      />
    );

    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('complementary', { name: 'Navigation principale' })).toBeInTheDocument();
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Profil utilisateur' })).toBeInTheDocument();
    expect(screen.getByText('Consultation des informations personnelles')).toBeInTheDocument();
    expect(screen.getByText('Informations personnelles')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Profil/ })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByText('© 2026 Mairie360')).toBeInTheDocument();
    expect(screen.getByText('Version 2.1.0')).toBeInTheDocument();
  });

  it('keeps sidebar navigation wired to page changes', () => {
    const onPageChange = jest.fn();
    render(<UserProfilePage user={profileUser} headerProps={{ onPageChange }} />);

    fireEvent.click(screen.getByRole('button', { name: /Projets/ }));

    expect(onPageChange).toHaveBeenCalledWith('projects');
  });

  it('updates editable profile information across the page layout', () => {
    const onUpdateUser = jest.fn();
    render(<UserProfilePage user={profileUser} onUpdateUser={onUpdateUser} />);

    fireEvent.click(screen.getByRole('button', { name: 'Modifier' }));
    fireEvent.change(screen.getByLabelText('Adresse e-mail'), {
      target: { value: 'marie.contact@mairie360.fr' },
    });
    fireEvent.change(screen.getByLabelText('Téléphone'), {
      target: { value: '+33 1 23 45 67 99' },
    });
    fireEvent.change(screen.getByLabelText('Adresse'), {
      target: { value: '24 avenue de la République' },
    });
    fireEvent.change(screen.getByLabelText('Ville'), {
      target: { value: 'Saint-Pierre' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Enregistrer' }));

    expect(onUpdateUser).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'marie.contact@mairie360.fr',
        phone: '+33 1 23 45 67 99',
        address: '24 avenue de la République',
        city: 'Saint-Pierre',
      })
    );
    expect(screen.getByText('+33 1 23 45 67 99')).toBeInTheDocument();
    expect(screen.getByText('24 avenue de la République, Saint-Pierre')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Marie Martin/ }));

    expect(screen.getAllByText('marie.contact@mairie360.fr').length).toBeGreaterThan(1);
  });
});
