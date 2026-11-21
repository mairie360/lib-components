import { act, render, screen, fireEvent } from '@testing-library/react';
import { axe } from 'jest-axe';
import { Header, notificationsLabel } from './Header';
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
    fireEvent.click(screen.getByRole('button', { name: 'Notifications, 2 non lues' }));

    expect(onSearch).toHaveBeenCalledWith('projet');
    expect(onNotificationsClick).toHaveBeenCalledTimes(1);
    // MAIR-1094: the bell counter is the Counter component (counter tokens, never --mairie-on-action).
    const counter = screen.getByText('2');
    expect(counter).toHaveAttribute('data-m360-component', 'Counter');
    expect(counter).toHaveStyle({ background: 'var(--mairie-counter-background)', color: 'var(--mairie-on-counter)' });
    expect(counter.className).not.toContain('--mairie-on-action');
  });

  it('MAIR-1094 caps the bell counter at « 9+ » and names it', () => {
    const { rerender } = render(<Header onNotificationsClick={jest.fn()} notificationCount={12} />);
    expect(screen.getByRole('button', { name: 'Notifications, plus de 9 non lues' })).toHaveTextContent('9+');
    rerender(<Header onNotificationsClick={jest.fn()} notificationCount={0} />);
    expect(screen.getByRole('button', { name: 'Notifications' }).querySelector('[data-m360-component~="Counter"]')).toBeNull();
    expect(notificationsLabel(3)).toBe('Notifications, 3 non lues');
    expect(notificationsLabel(undefined)).toBe('Notifications');
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

  describe('commune and date (MAIR-1109)', () => {
    it('shows « Mairie de Saint-André » by default, left of the search, with a separator', () => {
      const { container } = render(<Header onSearch={jest.fn()} />);
      const block = container.querySelector('[data-header-commune]')!;
      expect(block).toHaveTextContent('Mairie de Saint-André');
      expect(screen.getByText('Saint-André').tagName).toBe('STRONG');
      expect(screen.getByText('Saint-André')).toHaveClass('truncate', 'sm:text-xl');
      expect(block.compareDocumentPosition(screen.getByRole('search')) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
      expect(container.querySelector('[data-header-separator]')).toHaveAttribute('aria-hidden', 'true');
    });

    it('keeps the caption for assistive technologies on mobile and truncates a long name', () => {
      render(<Header commune="Saint-Remy-en-Bouzemont-Saint-Genest-et-Isson" />);
      expect(screen.getByText('Mairie de')).toHaveClass('sr-only', 'sm:not-sr-only');
      expect(screen.getByText('Saint-Remy-en-Bouzemont-Saint-Genest-et-Isson')).toHaveClass('truncate');
      expect(screen.getByText('Saint-Remy-en-Bouzemont-Saint-Genest-et-Isson').parentElement).toHaveClass('min-w-0');
    });

    it('hides the commune block on demand and without separator when there is no search', () => {
      const { container, rerender } = render(<Header showCommune={false} onSearch={jest.fn()} />);
      expect(container.querySelector('[data-header-commune]')).toBeNull();
      expect(container.querySelector('[data-header-separator]')).toBeNull();
      rerender(<Header />);
      expect(container.querySelector('[data-header-commune]')).not.toBeNull();
      expect(container.querySelector('[data-header-separator]')).toBeNull();
    });

    it('hides the date by default and shows the given text at the start of the right zone', () => {
      const { container, rerender } = render(<Header date="jeudi 19 novembre" onNotificationsClick={jest.fn()} />);
      expect(screen.queryByText('jeudi 19 novembre')).toBeNull();
      rerender(<Header showDate date="jeudi 19 novembre" onNotificationsClick={jest.fn()} />);
      const date = screen.getByText('jeudi 19 novembre');
      expect(date).toHaveClass('text-sm', 'text-[var(--mairie-muted)]');
      expect(date.parentElement!.firstElementChild).toBe(date);
      expect(container.querySelector('[data-header-date]')).toBe(date);
    });

    it('falls back to today in the instance time zone when no date text is given', () => {
      const { container } = render(<Header showDate />);
      const date = container.querySelector('[data-header-date]')!;
      expect(date).toHaveAttribute('data-m360-component', 'CurrentDate');
      expect(date.textContent).not.toBe('');
    });

    it('has no axe violation', async () => {
      const { container } = render(<Header showDate date="jeudi 19 novembre" onSearch={jest.fn()} onNotificationsClick={jest.fn()} notificationCount={4} />);
      expect((await axe(container)).violations).toEqual([]);
    });
  });
});
