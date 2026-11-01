import { render, screen } from '@testing-library/react';
import { Spinner } from './Spinner';

it('keeps the spinner decorative unless a label is announced', () => {
  const { rerender } = render(<Spinner size="s" />);
  expect(screen.queryByRole('status')).not.toBeInTheDocument();
  rerender(<Spinner label="Enregistrement en cours" />);
  expect(screen.getByRole('status')).toHaveTextContent('Enregistrement en cours');
});
