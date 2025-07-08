import React from 'react';
import { render, screen } from '@testing-library/react';
import { Spinner } from '../components/Spinner';

describe('Spinner component', () => {
  it('renders with default props', () => {
    render(<Spinner />);
    const spinner = screen.getByRole('status');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass('animate-spin');
    expect(spinner).toHaveClass('rounded-full');
    expect(spinner).toHaveClass('border-4');
    expect(spinner).toHaveClass('border-current');
    expect(spinner).toHaveClass('border-t-transparent');
    expect(spinner).toHaveClass('w-6');
    expect(spinner).toHaveClass('h-6');
    expect(spinner).toHaveClass('text-blue-500');
  });

  it('renders with custom size, color and border', () => {
    render(<Spinner size="w-10 h-10" color="text-red-500" border="border-8" />);
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('w-10');
    expect(spinner).toHaveClass('h-10');
    expect(spinner).toHaveClass('text-red-500');
    expect(spinner).toHaveClass('border-8');
  });

  it('has role status for accessibility', () => {
    render(<Spinner />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});
