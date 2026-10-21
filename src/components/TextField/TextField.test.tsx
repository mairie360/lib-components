import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { TextField } from './TextField';

describe('TextField (MAIR-608)', () => {
  it('links label, hint and error to the input and sizes it from the scale', () => {
    const { rerender } = render(<TextField label="Nom" hint="Tel qu’il apparaît sur la carte" required size="l" />);
    const input = screen.getByLabelText(/Nom/);
    expect(input).toHaveAccessibleDescription('Tel qu’il apparaît sur la carte');
    expect(input).toBeRequired();
    expect(input).not.toHaveAttribute('aria-invalid');
    expect(input.parentElement!.style.minHeight).toBe('var(--mairie-control-l)');
    rerender(<TextField label="Nom" hint="Tel qu’il apparaît sur la carte" error="Le nom est obligatoire." required size="l" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Le nom est obligatoire.');
    expect(screen.getByLabelText(/Nom/)).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByLabelText(/Nom/)).toHaveAccessibleDescription('Le nom est obligatoire.');
  });

  it('forwards the ref and native props as react-hook-form registers them', () => {
    const ref = React.createRef<HTMLInputElement>();
    const onChange = jest.fn();
    render(<TextField ref={ref} label="Prénom" name="first_name" onChange={onChange} />);
    expect(ref.current).toBe(screen.getByLabelText('Prénom'));
    expect(ref.current).toHaveAttribute('name', 'first_name');
    fireEvent.change(ref.current!, { target: { value: 'Marie' } });
    expect(onChange).toHaveBeenCalledTimes(1);
  });
});
