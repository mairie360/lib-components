import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Sidebar } from '../components/Sidebar';
import '@testing-library/jest-dom';

describe('Sidebar component', () => {
  it('renders the brand and default navigation items for administrators', () => {
    render(<Sidebar isAdmin />);

    expect(screen.getByText('Mairie360')).toBeInTheDocument();
    expect(screen.getByAltText('Logo Mairie360')).toHaveAttribute('src', 'logo.png');
    expect(screen.getByRole('button', { name: /Tableau de bord/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Projets/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Messagerie/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /E-mails/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Fichiers/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Formation/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Calendrier/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Administration/ })).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Paramètres/ })).toBeInTheDocument();
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

  it('renders the brand initial when no logo is provided', () => {
    render(<Sidebar brandLabel="Ville Connectée" brandLogoSrc={null} brandInitial="V" />);

    expect(screen.getByText('V')).toBeInTheDocument();
  });
});
