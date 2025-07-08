import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Header } from '../components/Header';
import '@testing-library/jest-dom';

const user = {
  name: 'John Doe',
  avatarUrl: '/avatar.jpg',
};

const links = [
  { id: '1', name: 'Dashboard', url: '/' },
  { id: '2', name: 'Settings', url: '/settings' },
];

describe('Header component', () => {
  it('renders the logo and site title', () => {
    render(<Header />);
    expect(screen.getByAltText('Mairie360')).toBeInTheDocument();
    expect(screen.getByText('Mairie360')).toBeInTheDocument();
  });

  it('renders login button when no user is provided', () => {
    const onLogin = jest.fn();
    render(<Header onLogin={onLogin} />);
    const loginButton = screen.getByText('Log in');
    expect(loginButton).toBeInTheDocument();
    fireEvent.click(loginButton);
    expect(onLogin).toHaveBeenCalled();
  });

  it('renders avatar and dropdown when user is logged in', () => {
    const onLogout = jest.fn();
    render(<Header user={user} onLogout={onLogout} />);
    
    const avatarImg = screen.getByAltText('avatar');
    expect(avatarImg).toBeInTheDocument();
    
    const avatarButton = avatarImg.closest('div[role="button"]');
    expect(avatarButton).toBeInTheDocument();
    
    fireEvent.click(avatarButton!);
    expect(screen.getByText('Profile')).toBeInTheDocument();
    
    const logoutButton = screen.getByText('Logout');
    fireEvent.click(logoutButton);
    expect(onLogout).toHaveBeenCalled();
  });


  it('renders module links and calls onSelectModule when clicked', () => {
    const handleSelect = jest.fn();
    render(<Header user={user} links={links} onSelectModule={handleSelect} pathname="/" />);

    const dashboardBtn = screen.getByRole('button', { name: 'Dashboard' });
    const settingsBtn = screen.getByRole('button', { name: 'Settings' });

    expect(dashboardBtn).toBeInTheDocument();
    expect(settingsBtn).toBeInTheDocument();

    expect(dashboardBtn.className).toMatch(/bg-primary/);
    expect(settingsBtn.className).not.toMatch(/bg-primary/);

    fireEvent.click(settingsBtn);
    expect(handleSelect).toHaveBeenCalledWith(links[1]);
  });

  it('does not crash if onSelectModule is not provided', () => {
    render(<Header user={user} links={links} pathname="/" />);
    const settingsBtn = screen.getByRole('button', { name: 'Settings' });
    fireEvent.click(settingsBtn);
  });

  it('handles clicks on module links even if onSelectModule is not provided', () => {
    render(<Header links={links} pathname="/" />);
    const dashboardBtn = screen.getByRole('button', { name: 'Dashboard' });
    expect(dashboardBtn).toBeInTheDocument();

    fireEvent.click(dashboardBtn);
  });

    it('renders user avatar when avatarUrl is provided', () => {
        const userWithAvatar = { name: 'Jane', avatarUrl: 'https://example.com/avatar.jpg' };
        render(<Header user={userWithAvatar} links={[]} pathname="/" />);
        
        const avatarImg = screen.getByAltText('avatar') as HTMLImageElement;
        expect(avatarImg).toBeInTheDocument();
        expect(avatarImg.src).toEqual(expect.stringContaining(encodeURIComponent(userWithAvatar.avatarUrl)));
    });

    it('renders default avatar when avatarUrl is not provided', () => {
        const userWithoutAvatar = { name: 'John' };
        render(<Header user={userWithoutAvatar} links={[]} pathname="/" />);
        
        const avatarImg = screen.getByAltText('avatar') as HTMLImageElement;
        expect(avatarImg).toBeInTheDocument();
        expect(avatarImg.src).toEqual(expect.stringContaining(encodeURIComponent('/logo.png')));
    });
});
