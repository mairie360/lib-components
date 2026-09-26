import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Header } from '../components/Header';
import '@testing-library/jest-dom';

const adminUser = {
  name: 'Admin Système',
  avatarUrl: '/avatar.jpg',
  email: 'admin@mairie360.fr',
  role: 'admin',
};

describe('Header component', () => {
  it('does not invent search, notifications, or a notification count', () => {
    render(<Header user={adminUser} isAdmin />);

    expect(screen.queryByPlaceholderText('Rechercher...')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Notifications' })).not.toBeInTheDocument();
    expect(screen.getByText('Admin Système')).toBeInTheDocument();
  });

  it('wires configured search and notifications to handlers', () => {
    const onSearch = jest.fn();
    const onNotificationsClick = jest.fn();
    render(<Header user={adminUser} onSearch={onSearch} onNotificationsClick={onNotificationsClick} notificationCount={2} />);

    fireEvent.change(screen.getByRole('searchbox', { name: 'Rechercher' }), { target: { value: 'projet' } });
    fireEvent.submit(screen.getByRole('search'));
    fireEvent.click(screen.getByRole('button', { name: 'Notifications' }));

    expect(onSearch).toHaveBeenCalledWith('projet');
    expect(onNotificationsClick).toHaveBeenCalledTimes(1);
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('opens the sidebar from the navigation button', () => {
    const setSidebarOpen = jest.fn();
    render(<Header user={adminUser} setSidebarOpen={setSidebarOpen} />);

    fireEvent.click(screen.getByRole('button', { name: 'Ouvrir la navigation' }));

    expect(setSidebarOpen).toHaveBeenCalledWith(true);
  });

  it('renders the profile dropdown content', () => {
    render(<Header user={adminUser} isAdmin onPageChange={jest.fn()} onLogout={jest.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: /Admin Système/ }));

    expect(screen.getAllByText('Admin Système')).toHaveLength(2);
    expect(screen.getByText('Nom')).toBeInTheDocument();
    expect(screen.getByText('Adresse e-mail')).toBeInTheDocument();
    expect(screen.getByText('Rôle')).toBeInTheDocument();
    expect(screen.getByText('admin@mairie360.fr')).toBeInTheDocument();
    expect(screen.getByText('Administrateur')).toBeInTheDocument();
    expect(screen.getByText('Profil')).toBeInTheDocument();
    expect(screen.getByText('Paramètres')).toBeInTheDocument();
    expect(screen.getByText('Administration')).toBeInTheDocument();
    expect(screen.getByText('Déconnexion')).toBeInTheDocument();
  });

  it('calls onPageChange from dropdown actions', () => {
    const onPageChange = jest.fn();
    render(<Header user={adminUser} isAdmin onPageChange={onPageChange} />);

    fireEvent.click(screen.getByRole('button', { name: /Admin Système/ }));
    fireEvent.click(screen.getByText('Profil'));
    expect(onPageChange).toHaveBeenCalledWith('profile');

    fireEvent.click(screen.getByRole('button', { name: /Admin Système/ }));
    fireEvent.click(screen.getByText('Paramètres'));
    expect(onPageChange).toHaveBeenCalledWith('settings');

    fireEvent.click(screen.getByRole('button', { name: /Admin Système/ }));
    fireEvent.click(screen.getByText('Administration'));
    expect(onPageChange).toHaveBeenCalledWith('admin');
  });

  it('links the profile action to the profile page', () => {
    render(<Header user={adminUser} profileHref="/profil" />);

    fireEvent.click(screen.getByRole('button', { name: /Admin Système/ }));

    expect(screen.getByRole('link', { name: /Profil/ })).toHaveAttribute('href', '/profil');
  });

  it('calls onLogout from the dropdown', () => {
    const onLogout = jest.fn();
    render(<Header user={adminUser} onLogout={onLogout} />);

    fireEvent.click(screen.getByRole('button', { name: /Admin Système/ }));
    fireEvent.click(screen.getByText('Déconnexion'));

    expect(onLogout).toHaveBeenCalled();
  });

  it('renders the provided avatar image', () => {
    render(<Header user={adminUser} />);

    const avatarImg = screen.getByAltText('Admin Système') as HTMLImageElement;

    expect(avatarImg).toBeInTheDocument();
    expect(avatarImg).toHaveAttribute('src', adminUser.avatarUrl);
  });

  it('renders initials when no avatar is provided', () => {
    render(<Header user={{ name: 'John Doe' }} />);

    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('hides administration for non-admin users', () => {
    render(<Header user={{ name: 'Jean User', role: 'user' }} />);

    fireEvent.click(screen.getByRole('button', { name: /Jean User/ }));

    expect(screen.getByText('Utilisateur')).toBeInTheDocument();
    expect(screen.queryByText('Administration')).not.toBeInTheDocument();
  });

  it('formats an API user response instead of rendering raw identity data', () => {
    render(
      <Header
        user={{
          first_name: 'Admin',
          last_name: 'User',
          email: 'template.email@gmail.com',
          role: 'Admin',
          service: 'Direction générale',
        }}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /Admin User/ }));

    expect(screen.getAllByText('Admin User')).toHaveLength(2);
    expect(screen.getByText('Administrateur')).toBeInTheDocument();
    expect(screen.getByText('Groupe ou service')).toBeInTheDocument();
    expect(screen.getByText('Direction générale')).toBeInTheDocument();
    expect(screen.queryByText('[object Object]')).not.toBeInTheDocument();
  });
});
