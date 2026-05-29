import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Footer } from '../components/Footer';
import '@testing-library/jest-dom';

describe('Footer component', () => {
  it('renders the default copyright, version, and links', () => {
    render(<Footer year={2026} />);

    expect(screen.getByText('© 2026 Mairie360')).toBeInTheDocument();
    expect(screen.getByText('Version 2.1.0')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Support technique' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Documentation' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: "Conditions d'utilisation" })).toBeInTheDocument();
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
});
