import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../components/Button';

describe('Button component', () => {
  it('renders the button with label', () => {
    render(<Button label="Click me" />);
    expect(screen.getByRole('button')).toHaveTextContent('Click me');
  });

  it('applies primary class when primary is true', () => {
    render(<Button label="Primary" primary />);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('btn-primary');
    expect(button).not.toHaveClass('btn-secondary');
  });

  it('applies secondary class when primary is false', () => {
    render(<Button label="Secondary" primary={false} />);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('btn-secondary');
  });

  it('applies the correct size class', () => {
    render(<Button label="Small" size="btn-sm" />);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('btn-sm');
  });

  it('applies the background color style', () => {
    render(<Button label="Colored" backgroundColor="red" />);
    const button = screen.getByRole('button');
    expect(button.style.backgroundColor).toBe('red');
    });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button label="Click" onClick={handleClick} />);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
