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
});
