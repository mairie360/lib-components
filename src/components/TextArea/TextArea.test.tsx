import { render, screen } from '@testing-library/react';
import { TextArea } from './TextArea';

describe('TextArea (MAIR-608)', () => {
  it('marks the textarea invalid and announces its error', () => {
    render(<TextArea label="Commentaire" error="Trop long." />);
    expect(screen.getByLabelText('Commentaire')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('alert')).toHaveTextContent('Trop long.');
  });
});
