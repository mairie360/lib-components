import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
// JSDOM has no active native window; model the normal focused application explicitly.
beforeEach(() => jest.spyOn(document, 'hasFocus').mockReturnValue(true));
afterEach(() => jest.restoreAllMocks());
import { Toast } from './Toast';

it.each(['info', 'success', 'warning'] as const)('announces %s politely and renders supplied content', tone => {
  render(<Toast tone={tone} title="Dossiers" message="Modification confirmée par le serveur" />);
  expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');
  expect(screen.getByRole('status')).toHaveTextContent('Dossiers');
  expect(screen.getByRole('status')).toHaveAttribute('data-tone', tone);
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});

it('reserves alerts for danger toasts (legacy variant error) and supports an accessible keyboard close', async () => {
  const user = userEvent.setup(); const close = jest.fn();
  const { container, rerender } = render(<Toast tone="danger" message="Enregistrement impossible" closeLabel="Masquer cette erreur" onClose={close} />);
  expect(screen.getByRole('alert')).toHaveAttribute('aria-live', 'assertive');
  await user.tab(); expect(screen.getByRole('button', { name: 'Masquer cette erreur' })).toHaveFocus();
  await user.keyboard('{Escape}'); expect(close).toHaveBeenCalledTimes(1);
  await user.keyboard('{Enter}'); expect(close).toHaveBeenCalledTimes(2);
  expect((await axe(container)).violations).toEqual([]);
  rerender(<Toast variant="error" message="Ancien appel" />);
  expect(screen.getByRole('alert')).toHaveAttribute('data-tone', 'danger');
});

it('honors controlled keyboard handlers and optional presentation without inserting fallback text', () => {
  const close = jest.fn(); const { rerender } = render(<Toast message="Texte fourni" onClose={close} onKeyDown={event => event.preventDefault()} />);
  fireEvent.keyDown(screen.getByRole('status'), { key: 'Escape' }); expect(close).not.toHaveBeenCalled();
  rerender(<Toast message="Information disponible" />);
  expect(screen.queryByRole('button')).not.toBeInTheDocument(); expect(screen.getByRole('status')).toHaveTextContent('Information disponible');
});
