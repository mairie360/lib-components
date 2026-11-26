import React from 'react';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';

import { AppShell } from './AppShell';

const user = { name: 'Marie Martin', email: 'marie@example.fr', role: 'user' };

describe('AppShell', () => {
  it('offers the first keyboard stop to skip navigation and focus the main content', async () => {
    const keyboard = userEvent.setup();
    render(<AppShell hrefs={{ projects: '/projects' }}><h1>Mes projets</h1><button>Action du contenu</button></AppShell>);
    await keyboard.tab();
    const skip = screen.getByRole('link', { name: 'Aller au contenu' });
    expect(skip).toHaveFocus();
    const main = screen.getByRole('main');
    expect(skip).toHaveAttribute('href', `#${main.id}`);
    await keyboard.keyboard('{Enter}');
    expect(main).toHaveFocus();
    await keyboard.tab();
    expect(screen.getByRole('button', { name: 'Action du contenu' })).toHaveFocus();
  });

  it('does not make the skip link a way out of a modal navigation drawer', () => {
    render(<AppShell hrefs={{ projects: '/projects' }}><p>Contenu</p></AppShell>);
    const skip = screen.getByRole('link', { name: 'Aller au contenu' });
    fireEvent.click(screen.getByRole('button', { name: 'Ouvrir la navigation' }));
    expect(skip.parentElement).toHaveAttribute('inert');
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(skip.parentElement).not.toHaveAttribute('inert');
  });

  it('keeps desktop and mobile navigation available without a fictitious account', () => {
    const onNavigate = jest.fn();
    render(<AppShell hrefs={{ projects: '/projects', settings: '/settings' }} onNavigate={onNavigate}><p>Contenu</p></AppShell>);

    expect(screen.queryByText('Utilisateur')).not.toBeInTheDocument();
    expect(screen.queryByText('Profil')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Projets' }));
    expect(onNavigate).toHaveBeenCalledWith('/projects', 'projects');

    fireEvent.click(screen.getByRole('button', { name: 'Ouvrir la navigation' }));
    const drawer = screen.getByRole('dialog', { name: 'Navigation mobile' });
    expect(within(drawer).getByRole('button', { name: 'Paramètres' })).toBeInTheDocument();
  });

  it('renders the shared layout with only configured destinations', () => {
    render(<AppShell activeItem="projects" user={user} hrefs={{ projects: '/projects', settings: '/settings' }} onNavigate={jest.fn()}><h1>Mes projets</h1></AppShell>);

    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('complementary', { name: 'Navigation principale' })).toBeInTheDocument();
    expect(screen.getByRole('main')).toHaveTextContent('Mes projets');
    expect(screen.queryByRole('contentinfo')).not.toBeInTheDocument();
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

  it('MAIR-1092 renders no footer unless showFooter is set', () => {
    const { container } = render(<AppShell hrefs={{ projects: '/projects' }} footerProps={{ year: 2026 }}><h1>Mes projets</h1></AppShell>);
    expect(screen.queryByText('© 2026 Mairie360')).not.toBeInTheDocument();
    expect(screen.queryByRole('contentinfo')).not.toBeInTheDocument();
    const { container: collapsible } = render(<AppShell collapsibleSidebar hrefs={{ projects: '/projects' }} footerProps={{ year: 2026 }}><h1>Mes projets</h1></AppShell>);
    expect(collapsible.querySelector('.app-shell-footer')).toBeNull();
    expect(container.querySelector('footer')).toBeNull();
  });

  it('places copyright in the sidebar rather than below the content when the footer is shown', () => {
    render(<AppShell showFooter hrefs={{ projects: '/projects' }} footerProps={{ year: 2026 }}><h1>Mes projets</h1></AppShell>);

    const sidebar = screen.getByRole('complementary', { name: 'Navigation principale' });
    const footer = within(sidebar).getByText('© 2026 Mairie360').parentElement!.parentElement!;
    expect(footer.tagName).toBe('DIV');
    expect(within(sidebar).queryByRole('contentinfo')).not.toBeInTheDocument();
    expect(footer).toHaveTextContent('© 2026 Mairie360');
    expect(footer).not.toHaveTextContent(/Version/);
    expect(screen.getByRole('main').parentElement!.querySelector(':scope > footer')).toBeNull();
  });

  it('keeps supplied footer information and actions in the mobile navigation', () => {
    const support = jest.fn();
    render(<AppShell showFooter hrefs={{ projects: '/projects' }} footerProps={{ productName: 'Ville Connectée', year: 2027, version: '3.0.0', links: [{ label: 'Assistance', onClick: support }, { label: 'Sans destination' }] }}><p>Contenu</p></AppShell>);

    fireEvent.click(screen.getByRole('button', { name: 'Ouvrir la navigation' }));
    const drawer = screen.getByRole('dialog', { name: 'Navigation mobile' });
    const footer = within(drawer).getByText('© 2027 Ville Connectée').parentElement!.parentElement!;
    expect(within(drawer).queryByRole('contentinfo')).not.toBeInTheDocument();
    expect(footer).toHaveTextContent('© 2027 Ville Connectée');
    expect(footer).toHaveTextContent('Version 3.0.0');
    expect(within(drawer).queryByText('Sans destination')).not.toBeInTheDocument();
    fireEvent.click(within(footer).getByRole('button', { name: 'Assistance' }));
    expect(support).toHaveBeenCalledTimes(1);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ouvrir la navigation' })).toHaveFocus();
  });

  it('retains the horizontal footer when explicitly requested', () => {
    render(<AppShell showFooter hrefs={{ projects: '/projects' }} footerPlacement="content"><p>Contenu</p></AppShell>);

    expect(screen.getByRole('main').parentElement!.querySelector(':scope > footer')).toBe(screen.getByRole('contentinfo'));
    expect(within(screen.getByRole('complementary', { name: 'Navigation principale' })).queryByRole('contentinfo')).toBeNull();
  });

  it('shows safe relative destinations without a router callback', () => {
    render(<AppShell activeItem="admin" isAdmin user={user} hrefs={{ admin: '/', settings: '/settings' }}><p>Contenu</p></AppShell>);

    expect(screen.getByRole('button', { name: 'Paramètres' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Administration/ })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('button', { name: /Administration/ })).toHaveClass('bg-[var(--mairie-navigation-active-background)]');
  });

  it('MAIR-1092 styles Administration like the other destinations in the mobile drawer', () => {
    render(<AppShell isAdmin user={user} hrefs={{ admin: '/admin' }} onNavigate={jest.fn()}><p>Contenu</p></AppShell>);

    fireEvent.click(screen.getByRole('button', { name: 'Ouvrir la navigation' }));
    const drawer = screen.getByRole('dialog', { name: 'Navigation mobile' });
    expect(within(drawer).getByRole('button', { name: 'Administration' }).className).not.toMatch(/admin/);
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

describe('AppShell main layout (MAIR-901)', () => {
  it('keeps the scrolling main area by default', () => {
    render(<AppShell hrefs={{}} collapsibleSidebar><p>Contenu</p></AppShell>);
    const main = screen.getByRole('main');
    expect(main).toHaveAttribute('data-layout', 'scroll');
    expect(main).toHaveClass('overflow-auto', 'app-shell-main', 'app-shell-main-area');
  });

  it('fills the height without scrolling the page in fill mode', () => {
    render(<AppShell hrefs={{}} collapsibleSidebar mainLayout="fill"><div>Messagerie</div></AppShell>);
    const main = screen.getByRole('main');
    expect(main).toHaveAttribute('data-layout', 'fill');
    expect(main).not.toHaveClass('overflow-auto');
  });

  it('drops the legacy padding of the non-collapsible frame in fill mode', () => {
    render(<AppShell hrefs={{}} mainLayout="fill"><div>Calendrier</div></AppShell>);
    expect(screen.getByRole('main')).not.toHaveClass('px-4');
  });
});

describe('AppShell focus layout (MAIR-1139)', () => {
  const focus = (props: Partial<React.ComponentProps<typeof AppShell>> = {}) => render(
    <AppShell
      layout="focus"
      bar={<h1>Nouvelle demande</h1>}
      aside={<ol><li>Identité</li><li>Pièces</li></ol>}
      content={<p>Formulaire</p>}
      footer={<button type="button">Enregistrer</button>}
      {...props}
    />,
  );

  it('renders no navigation band nor Header, only its slots in reading order', () => {
    const { container } = focus();
    expect(container.firstElementChild).toHaveAttribute('data-layout', 'focus');
    expect(container.firstElementChild).toHaveAttribute('data-m360-component', 'AppShell');
    expect(screen.queryByRole('complementary', { name: 'Navigation principale' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Ouvrir la navigation' })).toBeNull();
    expect(screen.queryByRole('button', { name: /Notifications/ })).toBeNull();
    expect(screen.getAllByRole('main')).toHaveLength(1);
    const order = [
      screen.getByRole('heading', { name: 'Nouvelle demande' }),
      screen.getByRole('navigation', { name: 'Sommaire' }),
      screen.getByText('Formulaire'),
      screen.getByRole('button', { name: 'Enregistrer' }),
    ];
    order.slice(1).forEach((element, index) => {
      expect(order[index].compareDocumentPosition(element) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    });
  });

  it('uses children as content and leaves the table of contents out when no aside is given', () => {
    render(<AppShell layout="focus" bar={<span>Barre</span>}><p>Étape 1</p></AppShell>);
    expect(screen.getByRole('main')).toHaveTextContent('Étape 1');
    expect(screen.queryByRole('navigation')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Sommaire' })).toBeNull();
  });

  it('does not leave the page on Escape', () => {
    const onPageChange = jest.fn();
    focus({ onPageChange });
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(onPageChange).not.toHaveBeenCalled();
  });
});

describe('MAIR-1218 one header for every front', () => {
  it('feeds the header and the navigation from the single commune prop', () => {
    const { container } = render(<AppShell collapsibleSidebar commune=" Saint-André " user={user} hrefs={{ projects: '/projects' }}><p>Contenu</p></AppShell>);
    expect(container.querySelector('[data-header-commune]')).toHaveTextContent('Mairie de Saint-André');
    const navigation = container.querySelector('aside.app-desktop-navigation')!;
    expect(within(navigation as HTMLElement).getByText('Saint-André')).toHaveClass('app-navigation-commune-name');
  });

  it('shows no placeholder commune when the front gives none', () => {
    const { container } = render(<AppShell collapsibleSidebar user={user} hrefs={{ projects: '/projects' }}><p>Contenu</p></AppShell>);
    expect(container.querySelector('[data-header-commune]')).toBeNull();
    expect(container.querySelector('.app-navigation-commune')).toBeNull();
    expect(screen.queryByText('Saint-André')).toBeNull();
  });

  it('keeps the legacy brandLabel and headerProps.commune as fallbacks, the shell prop winning', () => {
    const { container, rerender } = render(<AppShell collapsibleSidebar hrefs={{ projects: '/projects' }} sidebarProps={{ brandLabel: 'Lyon' }}><p>Contenu</p></AppShell>);
    expect(container.querySelector('[data-header-commune]')).toHaveTextContent('Mairie de Lyon');
    rerender(<AppShell collapsibleSidebar hrefs={{ projects: '/projects' }} headerProps={{ commune: 'Nantes' }}><p>Contenu</p></AppShell>);
    expect(container.querySelector('[data-header-commune]')).toHaveTextContent('Mairie de Nantes');
    expect(container.querySelector('.app-navigation-commune-name')).toHaveTextContent('Nantes');
    rerender(<AppShell collapsibleSidebar commune="Rennes" hrefs={{ projects: '/projects' }} sidebarProps={{ brandLabel: 'Lyon' }} headerProps={{ commune: 'Nantes' }}><p>Contenu</p></AppShell>);
    expect(container.querySelector('[data-header-commune]')).toHaveTextContent('Mairie de Rennes');
    expect(container.querySelector('.app-navigation-commune-name')).toHaveTextContent('Rennes');
  });

  it('always shows the library logo, whatever brandLogoSrc a front passes', () => {
    const { container } = render(<AppShell collapsibleSidebar hrefs={{ projects: '/projects' }} sidebarProps={{ brandLogoSrc: '/mairie360-logo.png', brandLogoAlt: 'Blason de Lyon' }}><p>Contenu</p></AppShell>);
    const logo = container.querySelector('aside.app-desktop-navigation img.app-navigation-logo')!;
    expect(logo).toHaveAttribute('alt', 'Logo Mairie360');
    expect(logo.getAttribute('src')).not.toBe('/mairie360-logo.png');
  });

  it('shows the user name, the bell and its badge in the header', () => {
    render(<AppShell collapsibleSidebar commune="Saint-André" user={user} hrefs={{ projects: '/projects' }} headerProps={{ notificationCount: 5, onNotificationsClick: jest.fn() }}><p>Contenu</p></AppShell>);
    const header = screen.getByRole('banner');
    expect(within(header).getByText('Marie Martin')).toBeInTheDocument();
    expect(within(header).getByRole('button', { name: 'Notifications, 5 non lues' })).toBeInTheDocument();
  });

  describe('global search (MAIR-1230)', () => {
    const results = {
      groups: [
        { module: 'agents' as const, items: [{ kind: 'agent' as const, id: 4, title: 'Anne Dupont', excerpt: null, parent_id: null, updated_at: null }] },
        { module: 'projects' as const, items: [{ kind: 'task' as const, id: 9, title: 'Devis Dupont', excerpt: null, parent_id: 7, updated_at: null }] },
      ],
      unavailable: [],
    };

    async function search(props: Partial<React.ComponentProps<typeof AppShell>>) {
      jest.useFakeTimers();
      const searchSource = jest.fn(async () => results);
      render(<AppShell user={user} hrefs={{ projects: '/projects', admin: '/admin' }} searchSource={searchSource} {...props}><h1>Accueil</h1></AppShell>);
      const field = within(screen.getByRole('banner')).getByRole('combobox', { name: 'Rechercher' });
      fireEvent.change(field, { target: { value: 'dupont' } });
      await act(async () => { jest.advanceTimersByTime(250); });
      jest.useRealTimers();
      return { field, searchSource };
    }

    it('shows the search on every front and opens a result in its module through onNavigate', async () => {
      const onNavigate = jest.fn();
      const { searchSource } = await search({ onNavigate });
      expect(searchSource).toHaveBeenCalledWith('dupont', expect.any(AbortSignal));
      fireEvent.click(screen.getByRole('option', { name: /Devis Dupont/ }));
      expect(onNavigate).toHaveBeenCalledWith('/projects?project=7&task=9', 'search');
    });

    it('shows an agent without a link to a non-administrator', async () => {
      await search({});
      expect(screen.getByRole('option', { name: /Anne Dupont/ })).toHaveAttribute('aria-disabled', 'true');
    });

    it('lets a front override the result links', async () => {
      const onNavigate = jest.fn();
      await search({ isAdmin: true, onNavigate, searchResultHref: (item) => (item.kind === 'task' ? '/custom' : undefined) });
      expect(screen.getByRole('option', { name: /Anne Dupont/ })).toHaveAttribute('aria-disabled', 'true');
      fireEvent.click(screen.getByRole('option', { name: /Devis Dupont/ }));
      expect(onNavigate).toHaveBeenCalledWith('/custom', 'search');
    });

    it('drops the previous account results and pending search when the account changes', async () => {
      jest.useFakeTimers();
      let resolveFirst!: (value: typeof results) => void;
      const signals: AbortSignal[] = [];
      const searchSource = jest.fn((_query: string, signal: AbortSignal) => {
        signals.push(signal);
        return signals.length === 1 ? new Promise<typeof results>((resolve) => { resolveFirst = resolve; }) : Promise.resolve({ groups: [], unavailable: [] });
      });
      const { rerender } = render(<AppShell user={user} hrefs={{ projects: '/projects' }} searchSource={searchSource}><h1>Accueil</h1></AppShell>);
      fireEvent.change(screen.getByRole('combobox'), { target: { value: 'dupont' } });
      await act(async () => { jest.advanceTimersByTime(250); });

      rerender(<AppShell user={{ ...user, name: 'Paul Durand' }} hrefs={{ projects: '/projects' }} searchSource={searchSource}><h1>Accueil</h1></AppShell>);
      expect(signals[0].aborted).toBe(true);
      await act(async () => { resolveFirst(results); });
      jest.useRealTimers();

      expect(screen.getByRole('combobox')).toHaveValue('');
      expect(screen.queryByRole('option', { name: /Devis Dupont/ })).not.toBeInTheDocument();
    });

    it('never hands an absolute result link to the client router', async () => {
      const onNavigate = jest.fn();
      await search({ onNavigate, hrefs: { projects: 'https://projets.mairie.fr/' } });
      const errors = jest.spyOn(console, 'error').mockImplementation(() => undefined); // jsdom: navigation not implemented
      fireEvent.click(screen.getByRole('option', { name: /Devis Dupont/ }));
      errors.mockRestore();
      expect(onNavigate).not.toHaveBeenCalled();
    });

    it('opens an agent in Administration for an administrator by default', async () => {
      const onNavigate = jest.fn();
      await search({ isAdmin: true, onNavigate });
      fireEvent.click(screen.getByRole('option', { name: /Anne Dupont/ }));
      expect(onNavigate).toHaveBeenCalledWith('/admin?user=4', 'search');
    });
  });
});
