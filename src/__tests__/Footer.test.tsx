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
});
