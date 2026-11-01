import { fireEvent, render, screen } from '@testing-library/react';
import { SessionExpiredNotice } from './SessionExpiredNotice';

it('words the expired session the same way in every front', () => {
  const reconnect = jest.fn();
  const { rerender } = render(<SessionExpiredNotice loginHref="https://login.example/?next=%2Fprojets" />);
  expect(screen.getByRole('alert')).toHaveTextContent('Votre session a expiré');
  expect(screen.getByRole('link', { name: 'Se reconnecter' })).toHaveAttribute('href', 'https://login.example/?next=%2Fprojets');
  rerender(<SessionExpiredNotice onReconnect={reconnect} />);
  fireEvent.click(screen.getByRole('button', { name: 'Se reconnecter' })); expect(reconnect).toHaveBeenCalled();
});
