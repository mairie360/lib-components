import { render, screen, fireEvent } from '@testing-library/react';
import { Folder } from 'lucide-react';
import { axe } from 'jest-axe';
import { Sidebar, defaultSidebarItems, navigationCount, navigationLabel } from './Sidebar';
import '@testing-library/jest-dom';

describe('Sidebar component', () => {
  it('renders the brand and default navigation items for administrators', () => {
    render(<Sidebar isAdmin />);

    expect(screen.getByText('Mairie360')).toBeInTheDocument();
    expect(screen.getByAltText('Logo Mairie360')).toHaveAttribute('src', 'test-file-stub');
    expect(screen.getByRole('button', { name: /Tableau de bord/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Projets/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Messagerie/ })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /E-mails/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Fichiers/ })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Formation/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Calendrier/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Administration/ })).toBeInTheDocument();
    expect(screen.queryByText('Admin')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Paramètres/ })).toBeInTheDocument();
  });

  it('MAIR-1092 styles Administration like the other destinations, without red', () => {
    render(<Sidebar isAdmin />);

    const administration = screen.getByRole('button', { name: 'Administration' });
    expect(administration.className).toBe(screen.getByRole('button', { name: 'Projets' }).className);
    expect(administration.className).not.toMatch(/admin|error|danger/);
  });

  it('MAIR-1092 marks the active destination with its background and the 3 px indicator bar', () => {
    const { container } = render(<Sidebar isAdmin activeItem="admin" />);

    const administration = screen.getByRole('button', { name: 'Administration' });
    expect(administration).toHaveAttribute('aria-current', 'page');
    expect(administration).toHaveClass('bg-[var(--mairie-navigation-active-background)]', 'text-[var(--mairie-navigation-active-text)]');
    const indicators = container.querySelectorAll('[data-nav-indicator]');
    expect(indicators).toHaveLength(1);
    expect(administration).toContainElement(indicators[0] as HTMLElement);
    expect(indicators[0]).toHaveClass('w-[3px]', 'bg-[var(--mairie-navigation-active-indicator)]');
  });

  it('MAIR-1092 sits on the white frame with the shell border', () => {
    render(<Sidebar />);
    expect(screen.getByRole('complementary')).toHaveClass('bg-[var(--mairie-shell-background)]', 'border-[var(--mairie-shell-border)]');
  });

  it('MAIR-1092 no longer offers Workflows among the default destinations', () => {
    render(<Sidebar isAdmin />);
    expect(screen.queryByRole('button', { name: /Workflows/ })).not.toBeInTheDocument();
    expect(defaultSidebarItems.map((item) => item.id)).toEqual(['dashboard', 'projects', 'messages', 'training', 'calendar', 'admin', 'settings']);
  });

  it('MAIR-1093 keys the icon animation of each default destination by its id', () => {
    render(<Sidebar isAdmin />);
    for (const item of defaultSidebarItems) {
      const button = screen.getByRole('button', { name: item.label });
      expect(button).toHaveAttribute('data-nav-anim', item.id);
      expect(button.querySelector('svg')).toHaveClass('mairie-nav-icon');
    }
  });

  it('MAIR-1093 lets an item choose or drop its animation', () => {
    render(<Sidebar items={[{ id: 'files', label: 'Fichiers', icon: Folder, animation: 'projects' }, { id: 'help', label: 'Aide', icon: Folder, animation: 'none' }]} />);
    expect(screen.getByRole('button', { name: 'Fichiers' })).toHaveAttribute('data-nav-anim', 'projects');
    expect(screen.getByRole('button', { name: 'Aide' })).toHaveAttribute('data-nav-anim', 'none');
  });

  it('MAIR-1094 shows the items to handle with Counter and names them', () => {
    render(<Sidebar items={[{ id: 'messages', label: 'Messagerie', icon: Folder, count: 4 }, { id: 'admin', label: 'Administration', icon: Folder, badge: '12' }, { id: 'calendar', label: 'Calendrier', icon: Folder, count: 0 }]} isAdmin />);
    const messages = screen.getByRole('button', { name: 'Messagerie 4 à traiter' });
    expect(messages.querySelector('[data-m360-component~="Counter"]')).toHaveTextContent('4');
    const administration = screen.getByRole('button', { name: 'Administration 9+ à traiter' });
    expect(administration.querySelector('[data-m360-component~="Counter"]')).toHaveTextContent('9+');
    expect(screen.getByRole('button', { name: 'Calendrier' }).querySelector('[data-m360-component~="Counter"]')).toBeNull();
  });

  it('MAIR-1094 derives the count and the accessible name of an entry', () => {
    expect(navigationCount({ count: 3 })).toBe(3);
    expect(navigationCount({ badge: ' 7 ' })).toBe(7);
    expect(navigationCount({ badge: 'Nouveau' })).toBeUndefined();
    expect(navigationCount({ count: -1 })).toBeUndefined();
    expect(navigationLabel({ label: 'Projets' })).toBe('Projets');
    expect(navigationLabel({ label: 'Projets', count: 10 })).toBe('Projets 9+ à traiter');
  });

  it('has no axe violation', async () => {
    const { container } = render(<Sidebar isAdmin activeItem="projects" items={[...defaultSidebarItems.slice(0, 2), { id: 'messages', label: 'Messagerie', icon: Folder, count: 2 }]} />);
    expect((await axe(container)).violations).toEqual([]);
  });

  it('MAIR-1225 RGAA 11.9: the name of an entry with a counter contains its visible label and counter', async () => {
    const { container } = render(<Sidebar items={[{ id: 'messages', label: 'Messagerie', icon: Folder, count: 1 }, { id: 'projects', label: 'Projets', icon: Folder, count: 12 }]} />);
    for (const [name, visible] of [['Messagerie 1 à traiter', 'Messagerie 1'], ['Projets 9+ à traiter', 'Projets 9+']]) {
      const entry = screen.getByRole('button', { name });
      // Label and Counter are adjacent elements: compare without the white space between them.
      const compact = (text: string) => text.replace(/\s+/g, '');
      expect(compact(entry.textContent ?? '')).toBe(compact(visible));
      expect(name.startsWith(visible)).toBe(true);
    }
    expect((await axe(container, { rules: { 'label-content-name-mismatch': { enabled: true } } })).violations).toEqual([]);
  });

  it('hides Administration when the user is not an administrator', () => {
    render(<Sidebar isAdmin={false} />);

    expect(screen.queryByRole('button', { name: /Administration/ })).not.toBeInTheDocument();
    expect(screen.queryByText('Admin')).not.toBeInTheDocument();
  });

  it('marks the active item', () => {
    render(<Sidebar activeItem="projects" />);

    expect(screen.getByRole('button', { name: /Projets/ })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('button', { name: /Tableau de bord/ })).not.toHaveAttribute('aria-current');
  });

  it('keeps navigation scrollable without shrinking destinations in short viewports', () => {
    render(<Sidebar isAdmin />);

    expect(screen.getByRole('navigation', { name: 'Menu principal' })).toHaveClass('min-h-0', 'overflow-y-auto');
    expect(screen.getByRole('button', { name: /Paramètres/ })).toHaveClass('shrink-0');
  });

  it('calls onItemSelect when a navigation item is clicked', () => {
    const onItemSelect = jest.fn();
    render(<Sidebar isAdmin onItemSelect={onItemSelect} />);

    fireEvent.click(screen.getByRole('button', { name: /Projets/ }));

    expect(onItemSelect).toHaveBeenCalledWith(expect.objectContaining({
      id: 'projects',
      label: 'Projets',
    }));
  });

  it('supports custom branding', () => {
    render(<Sidebar brandLabel="Ville Connectée" brandLogoSrc="/ville.png" brandLogoAlt="Logo Ville Connectée" />);

    expect(screen.getByText('Ville Connectée')).toBeInTheDocument();
    expect(screen.getByAltText('Logo Ville Connectée')).toHaveAttribute('src', '/ville.png');
  });

  it('places supplied application information outside the scrollable navigation', () => {
    render(<Sidebar footer={<p>Informations application</p>} />);

    const information = screen.getByText('Informations application');
    expect(information.closest('aside')).toBe(screen.getByRole('complementary'));
    expect(information.closest('nav')).toBeNull();
    expect(information.parentElement).toHaveClass('shrink-0');
  });

  it('renders the brand initial when no logo is provided', () => {
    render(<Sidebar brandLabel="Ville Connectée" brandLogoSrc={null} brandInitial="V" />);

    expect(screen.getByText('V')).toBeInTheDocument();
  });
});
