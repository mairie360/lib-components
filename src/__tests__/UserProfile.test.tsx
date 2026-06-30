import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { UserProfile } from '../components/UserProfile';

describe('UserProfile component', () => {
  it('renders the user profile consultation page with personal information', () => {
    render(
      <UserProfile
        user={{
          name: 'Marie Martin',
          email: 'marie.martin@mairie360.fr',
          phone: '+33 1 23 45 67 90',
          service: 'Communication',
          position: 'Responsable communication',
          role: 'manager',
          address: '12 rue de la Mairie',
          city: 'Saint-Denis',
          lastConnection: "Aujourd'hui à 09:42",
        }}
      />
    );

    expect(screen.getByRole('heading', { name: 'Profil utilisateur' })).toBeInTheDocument();
    expect(screen.getByText('Consultation des informations personnelles')).toBeInTheDocument();
    expect(screen.getByText('Informations personnelles')).toBeInTheDocument();
    expect(screen.getAllByText('Marie Martin')).toHaveLength(2);
    expect(screen.getAllByText('Manager')).toHaveLength(2);
    expect(screen.getAllByText('marie.martin@mairie360.fr')).toHaveLength(2);
    expect(screen.getByText('+33 1 23 45 67 90')).toBeInTheDocument();
    expect(screen.getByText('Communication')).toBeInTheDocument();
    expect(screen.getByText('Responsable communication')).toBeInTheDocument();
    expect(screen.getByText('12 rue de la Mairie, Saint-Denis')).toBeInTheDocument();
    expect(screen.getByText("Aujourd'hui à 09:42")).toBeInTheDocument();
  });

  it('shows fallback values when profile details are missing', () => {
    render(<UserProfile user={{ name: 'Jean User', role: 'user' }} />);

    expect(screen.getByText('JU')).toBeInTheDocument();
    expect(screen.getAllByText('Utilisateur')).toHaveLength(2);
    expect(screen.getAllByText('Non renseigné').length).toBeGreaterThan(0);
  });
});
