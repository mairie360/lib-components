import { act, render, screen, fireEvent } from '@testing-library/react';
import { Header } from './Header';
import '@testing-library/jest-dom';

const adminUser = {
  name: 'Admin Système',
  avatarUrl: '/avatar.jpg',
  email: 'admin@mairie360.fr',
  role: 'admin',
};

describe('Header component', () => {
  it.each([undefined, {}, { role: 'admin' }])('does not expose account actions without a user identity (%p)', (user) => {
    const setSidebarOpen = jest.fn();
    render(<Header user={user} isAdmin onPageChange={jest.fn()} onLogout={jest.fn()} setSidebarOpen={setSidebarOpen} />);

    expect(screen.queryByText('Utilisateur')).not.toBeInTheDocument();
    expect(screen.queryByText('Profil')).not.toBeInTheDocument();
    expect(screen.queryByText('Déconnexion')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Ouvrir la navigation' }));
    expect(setSidebarOpen).toHaveBeenCalledWith(true);
  });

  it('uses the email as the visible identity when no name is provided', () => {
    render(<Header user={{ email: 'agent@mairie.fr' }} />);

    expect(screen.getByRole('button', { name: /agent@mairie.fr/ })).toBeInTheDocument();
    expect(screen.queryByText('Utilisateur')).not.toBeInTheDocument();
  });

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

  it('calls onLogout at once when the confirmation is turned off', () => {
    const onLogout = jest.fn();
    render(<Header user={adminUser} onLogout={onLogout} confirmLogout={false} />);

    fireEvent.click(screen.getByRole('button', { name: /Admin Système/ }));
    fireEvent.click(screen.getByText('Déconnexion'));

    expect(onLogout).toHaveBeenCalled();
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  // MAIR-834: « Déconnexion » asks for confirmation first (Figma « Proposition — fenêtre de déconnexion »).
  describe('logout confirmation (MAIR-834)', () => {
    const open = () => {
      fireEvent.click(screen.getByRole('button', { name: /Admin Système/ }));
      fireEvent.click(screen.getByText('Déconnexion'));
      return screen.getByRole('alertdialog', { name: 'Se déconnecter ?' });
    };

    it('opens an alert dialog focused on Annuler and calls onLogout only after « Se déconnecter »', () => {
      const onLogout = jest.fn();
      render(<Header user={adminUser} onLogout={onLogout} />);
      const dialog = open();
      expect(onLogout).not.toHaveBeenCalled();
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveTextContent('Vous allez être déconnecté de Mairie360 sur cet appareil. Pensez à enregistrer vos modifications en cours.');
      expect(screen.getByRole('button', { name: 'Annuler' })).toHaveFocus();
      fireEvent.click(screen.getByRole('button', { name: 'Se déconnecter' }));
      expect(onLogout).toHaveBeenCalledTimes(1);
    });

    it.each([
      ['Annuler', () => fireEvent.click(screen.getByRole('button', { name: 'Annuler' }))],
      ['the close button', () => fireEvent.click(screen.getByRole('button', { name: 'Fermer la fenêtre' }))],
      ['Escape', () => fireEvent.keyDown(screen.getByRole('alertdialog'), { key: 'Escape' })],
    ])('closes on %s and gives focus back to the account menu', (_name, dismiss) => {
      const onLogout = jest.fn();
      render(<Header user={adminUser} onLogout={onLogout} />);
      open();
      dismiss();
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Admin Système/ })).toHaveFocus();
      expect(onLogout).not.toHaveBeenCalled();
    });

    it('keeps « Se déconnecter » loading while the returned promise runs, and stays open when it fails', async () => {
      let finish!: (value?: unknown) => void; let fail!: (error: Error) => void;
      const onLogout = jest.fn()
        .mockImplementationOnce(() => new Promise((_resolve, reject) => { fail = reject; }))
        .mockImplementationOnce(() => new Promise(resolve => { finish = resolve; }));
      render(<Header user={adminUser} onLogout={onLogout} />);
      open();
      fireEvent.click(screen.getByRole('button', { name: 'Se déconnecter' }));
      expect(screen.getByRole('button', { name: /Se déconnecter/ })).toHaveAttribute('aria-busy', 'true');
      expect(screen.getByRole('button', { name: 'Annuler' })).toBeDisabled();
      await act(async () => { fail(new Error('réseau')); });
      expect(screen.getByRole('alertdialog')).toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: 'Se déconnecter' }));
      await act(async () => { finish(); });
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    });
  });

  // MAIR-835: search as you type from the top bar.
  describe('search as you type (MAIR-835)', () => {
    it('reports every keystroke, clears with ✕ or Escape and keeps onSearch on submit', () => {
      const onSearchChange = jest.fn(); const onSearch = jest.fn();
      render(<Header user={adminUser} onSearch={onSearch} onSearchChange={onSearchChange} searchLabel="Rechercher un événement" />);
      const field = screen.getByRole('searchbox', { name: 'Rechercher un événement' });
      expect(screen.getByRole('search', { name: 'Rechercher un événement' })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Effacer la recherche' })).not.toBeInTheDocument();
      fireEvent.change(field, { target: { value: 'conseil' } });
      expect(onSearchChange).toHaveBeenLastCalledWith('conseil');
      fireEvent.submit(screen.getByRole('search'));
      expect(onSearch).toHaveBeenCalledWith('conseil');
      fireEvent.click(screen.getByRole('button', { name: 'Effacer la recherche' }));
      expect(onSearchChange).toHaveBeenLastCalledWith('');
      expect(field).toHaveValue('');
      expect(field).toHaveFocus();
      fireEvent.change(field, { target: { value: 'salle' } });
      fireEvent.keyDown(field, { key: 'Escape' });
      expect(onSearchChange).toHaveBeenLastCalledWith('');
      expect(field).toHaveValue('');
    });

    it('shows the search with onSearchChange alone and follows a controlled value', () => {
      const onSearchChange = jest.fn();
      const { rerender } = render(<Header user={adminUser} onSearchChange={onSearchChange} searchValue="mairie" />);
      expect(screen.getByRole('searchbox', { name: 'Rechercher' })).toHaveValue('mairie');
      fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'mairie annexe' } });
      expect(onSearchChange).toHaveBeenCalledWith('mairie annexe');
      expect(screen.getByRole('searchbox')).toHaveValue('mairie');
      rerender(<Header user={adminUser} onSearchChange={onSearchChange} searchValue="" />);
      expect(screen.getByRole('searchbox')).toHaveValue('');
    });
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
