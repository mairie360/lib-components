import { render, screen } from '@testing-library/react';
import { Field, controlClass, fieldDescriptionIds } from './Field';

describe('Field (MAIR-608)', () => {
  it('labels a control and links its hint and error', () => {
    const { rerender } = render(<Field htmlFor="f" label="Nom" hint="Tel qu’il apparaît sur la carte" required><input id="f" aria-describedby={fieldDescriptionIds('f', 'hint', undefined)} /></Field>);
    expect(screen.getByLabelText(/Nom/)).toHaveAccessibleDescription('Tel qu’il apparaît sur la carte');
    rerender(<Field htmlFor="f" label="Nom" error="Le nom est obligatoire."><input id="f" aria-invalid="true" aria-describedby={fieldDescriptionIds('f', undefined, 'error')} /></Field>);
    expect(screen.getByRole('alert')).toHaveTextContent('Le nom est obligatoire.');
    expect(screen.getByLabelText(/Nom/)).toHaveAccessibleDescription('Le nom est obligatoire.');
    expect(controlClass(true)).not.toBe(controlClass(false));
  });
});
