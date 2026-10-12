import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Footer } from '../components/Footer';
import '@testing-library/jest-dom';

describe('Footer component', () => {
  it('renders copyright without inventing a version or dead links', () => {
    render(<Footer year={2026} />);

    expect(screen.getByText('© 2026 Mairie360')).toBeInTheDocument();
    expect(screen.queryByText(/Version/)).not.toBeInTheDocument();
    expect(screen.queryByRole('navigation', { name: 'Liens du pied de page' })).not.toBeInTheDocument();
  });

  it('supports custom product information', () => {
    render(<Footer productName="Ville Connectée" year={2027} version="3.0.0" />);

    expect(screen.getByText('© 2027 Ville Connectée')).toBeInTheDocument();
    expect(screen.getByText('Version 3.0.0')).toBeInTheDocument();
  });

  it('renders links as anchors when href is provided', () => {
    render(<Footer links={[{ label: 'Documentation', href: '/docs' }]} />);

    expect(screen.getByRole('link', { name: 'Documentation' })).toHaveAttribute('href', '/docs');
  });

  it('links to the legal notice and the privacy policy after the other links (MAIR-292)', () => {
    render(
      <Footer
        links={[{ label: 'Documentation', href: '/docs' }]}
        legalLinks={{ legalNotice: 'https://login.example.fr/mentions-legales', privacyPolicy: 'https://login.example.fr/confidentialite' }}
      />,
    );

    const links = screen.getAllByRole('link');
    expect(links.map((link) => link.textContent)).toEqual(['Documentation', 'Mentions légales', 'Politique de confidentialité']);
    expect(screen.getByRole('link', { name: 'Mentions légales' })).toHaveAttribute('href', 'https://login.example.fr/mentions-legales');
    expect(screen.getByRole('link', { name: 'Politique de confidentialité' })).toHaveAttribute('href', 'https://login.example.fr/confidentialite');
  });

  it('calls link onClick handlers', () => {
    const onSupportClick = jest.fn();
    render(<Footer links={[{ label: 'Support technique', onClick: onSupportClick }]} />);

    fireEvent.click(screen.getByRole('button', { name: 'Support technique' }));

    expect(onSupportClick).toHaveBeenCalledTimes(1);
  });

  it('omits links without a destination or handler', () => {
    render(<Footer links={[{ label: 'Unavailable' }, { label: 'Documentation', href: '/docs' }]} />);

    expect(screen.queryByText('Unavailable')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Documentation' })).toBeInTheDocument();
  });

  it('uses a compact dark-sidebar presentation without changing supplied information', () => {
    render(<Footer variant="sidebar" year={2027} productName="Ville Connectée" links={[{label: 'Documentation', href: '/docs'}]} />);

    expect(screen.getByRole('contentinfo')).toHaveClass('bg-transparent', 'text-[#dff9ff]');
    expect(screen.getByRole('contentinfo')).not.toHaveClass('min-h-16', 'bg-white');
    expect(screen.getByText('© 2027 Ville Connectée')).toBeInTheDocument();
    expect(screen.getByRole('link', {name: 'Documentation'})).toHaveClass('text-[#dff9ff]');
  });
});
